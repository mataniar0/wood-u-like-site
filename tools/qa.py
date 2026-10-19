"""WUL-023 CLI: plan mandatory checks, isolated shards, then a fail-closed gate."""
import argparse
import concurrent.futures
import datetime
import json
import os
from pathlib import Path
import sys
import time

import qa_pipeline as q


def report(out, result):
    q.write(out / "QA_SUMMARY.json", result)
    rows = ["# QA " + result["status"], "", f"Tested SHA: `{result['tested_sha']}`", f"Base: `{result['base_sha']}`",
            f"Event/workflow: `{result['event']}` / `{result['workflow']}`", f"Profile: `{result['profile']}`",
            f"Catalog: `{result['catalog_version']}`; products: {result['product_count']}", "",
            "| Suite | Status | Seconds | Exit | Retries |", "|---|---|---:|---:|---:|"]
    for item in result.get("suites", []):
        rows.append(f"| {item['suite']} | {item['status']} | {item['seconds']} | {item['exit_code']} | {item['retry_count']} |")
    rows += ["", f"Wall clock: {result.get('wall_seconds', 0)} s; summed suite time: {result.get('summed_suite_seconds', 0)} s.",
             "Plan-to-gate wall includes shard provisioning/queue/artifact transfer; initial checkout/npm before the plan is recorded separately. Whole-workflow timings come from GitHub's jobs API.",
             "", "Selection: " + "; ".join(result["reasons"]), "", "Skipped:"]
    rows += [f"- {s['suite']}: {s['reason']}" for s in result["skipped"]]
    rows += ["", "Chromium only. No live Pages/Firefox/Safari/manual screen-reader claim.",
             "Local fixture traffic only. Inputs/textarea/contact links are masked in screenshots.",
             "No live POST. Scheduled execution is proven only by a schedule-triggered Actions run.",
             "A green workflow does not replace independent review >=90/100 with no blockers."]
    if result.get("missing"): rows += ["", "Missing receipts: " + ", ".join(result["missing"])]
    (out / "REPORT.md").write_text("\n".join(rows) + "\n")
    if os.environ.get("GITHUB_ACTIONS") == "true":
        # A compact, non-sensitive index is also readable via Checks API when
        # an author's cloud network cannot download Azure-backed artifacts.
        payload = json.dumps(result, ensure_ascii=False, separators=(",", ":"))
        payload = payload.replace("%", "%25").replace("\r", "%0D").replace("\n", "%0A")
        print("::notice title=WUL023_SUMMARY::" + payload, flush=True)
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with Path(os.environ["GITHUB_STEP_SUMMARY"]).open("a") as stream:
            stream.write((out / "REPORT.md").read_text())


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode", choices=("pr", "full"), default="pr")
    parser.add_argument("--stage", choices=("all", "plan", "worker", "summary", "fault"), default="all")
    parser.add_argument("--base")
    parser.add_argument("--out", type=Path, default=Path("artifacts/local"))
    parser.add_argument("--plan", type=Path)
    parser.add_argument("--shard")
    parser.add_argument("--workers", type=int, default=1)
    parser.add_argument("--fault", choices=("assertion", "timeout", "404", "cls", "endpoint", "flag-destination", "flag-privacy", "external-block"))
    args = parser.parse_args(argv)
    if os.environ.get("CI") == "true" and args.stage != "summary":
        from qa_static import isolation
        state = isolation()
        assert state["loopback_only"] and state["no_new_privileges"] and state["capabilities_dropped"], "Missing OS isolation"
        assert not q.git("status", "--porcelain", "--untracked-files=normal"), "Dirty CI checkout"
    out = args.out.resolve(); out.mkdir(parents=True, exist_ok=True)
    started = time.perf_counter()
    if args.stage == "summary":
        selection = json.loads(args.plan.read_text())
        assert selection["tested_sha"] == q.git("rev-parse", "HEAD"), "Gate checkout does not match tested HEAD"
        receipts = [json.loads(p.read_text()) for p in out.rglob("receipt.json")]
        result = q.summary(selection, receipts, time.time() - selection["started_epoch"])
        pngs = list(out.rglob("*.png"))
        result["screenshots"] = len(pngs)
        result["artifact_bytes"] = sum(p.stat().st_size for p in out.rglob("*") if p.is_file())
        result["completed_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        from qa_history import compare
        result["history"] = compare(result, q.ROOT / ".cache/qa-history/QA_SUMMARY.json")
        report(out, result)
        return int(result["status"] != "PASS")
    if args.stage == "fault":
        return fault(args, out)
    if args.stage == "worker":
        selection = json.loads(args.plan.read_text())
        assert selection["tested_sha"] == q.git("rev-parse", "HEAD"), "Wrong checkout SHA"
        assert selection["source_fingerprint"] == q.fingerprint(), "Plan/source drift"
        names = selection["shards"][args.shard]
    else:
        selection = q.plan(args.mode, args.base)
        selection["started_epoch"] = time.time()
        selection["started_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        q.write(out / "PLAN.json", selection)
        names = q.PREFLIGHT
    receipts = []
    with q.local_server() as base_url:
        for name in names:
            result = q.execute(name, out, selection["base_sha"], base_url, selection)
            receipts.append(result)
            if result["status"] != "PASS":
                # Safety/preflight never hands a failed installation to browsers.
                if args.stage != "worker":
                    report(out, q.summary(selection, receipts, time.perf_counter() - started))
                    return 1
        if args.stage == "plan":
            phase = {**selection, "status": "PREFLIGHT_PASS", "phase": "preflight", "suites": receipts,
                     "wall_seconds": round(time.perf_counter() - started, 3),
                     "summed_suite_seconds": round(sum(r["seconds"] for r in receipts), 3)}
            report(out, phase)
            if os.environ.get("GITHUB_OUTPUT"):
                with Path(os.environ["GITHUB_OUTPUT"]).open("a") as stream:
                    stream.write("matrix=" + json.dumps(list(selection["shards"])) + "\n")
                    stream.write("browser=" + str(bool(selection["shards"])).lower() + "\n")
                    stream.write("sha=" + selection["tested_sha"] + "\n")
            return 0
        if args.stage == "all":
            def shard(item):
                folder = out / item[0]
                return [q.execute(name, folder, selection["base_sha"], base_url, selection) for name in item[1]]
            with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, min(args.workers, 4))) as pool:
                for values in pool.map(shard, selection["shards"].items()): receipts.extend(values)
    if args.stage == "worker":
        success = all(r["status"] == "PASS" for r in receipts)
        q.write(out / "SHARD.json", {"status": "PASS" if success else "FAIL", "shard": args.shard, "suites": receipts})
        return int(not success)
    result = q.summary(selection, receipts, time.perf_counter() - started)
    result["screenshots"] = len(list(out.rglob("*.png")))
    result["artifact_bytes"] = sum(p.stat().st_size for p in out.rglob("*") if p.is_file())
    report(out, result)
    return int(result["status"] != "PASS")


def fault(args, out):
    assert args.fault, "Explicit fault kind required"
    selection = q.plan("pr", args.base)
    selection.update(profile="negative-control", selected=["probe"], shards={"probe": ["probe"]}, skipped=[],
                     reasons=["Intentional red acceptance control; never a merge PASS"], started_epoch=time.time())
    q.write(out / "PLAN.json", selection)
    config = q.ROOT / "inquiry/contact-config.js"
    original = config.read_bytes()
    try:
        if args.fault in ("endpoint", "flag-destination", "flag-privacy"):
            text = original.decode()
            if args.fault == "endpoint":
                import re
                text = re.sub(r'formEndpoint: "[^"]+"', 'formEndpoint: "https://example.invalid/f/forbidden"', text)
            else:
                flag = "formDestinationApproved" if args.fault == "flag-destination" else "privacyApproved"
                text = text.replace(flag + ": false", flag + ": true")
            config.write_text(text)
            selection["selected"] = ["static"]
            name = "static"
        else:
            name = "probe"
            q.SUITES[name] = ["node", "tools/qa-probe.cjs", args.fault]
            q.BROWSER.add(name)
        with q.local_server() as base_url:
            receipt = q.execute(name, out, selection["base_sha"], base_url, selection, timeout=5 if args.fault == "timeout" else 45)
        selection["selected"] = [name]
        q.write(out / "PLAN.json", selection)
        result = q.summary(selection, [receipt], receipt["seconds"])
        result["intentional_negative_control"] = args.fault
        result["fault_detected"] = result["status"] == "FAIL"
        result["status"] = "FAIL"  # Negative controls can never be used as a merge PASS.
        report(out, result)
        return 1
    finally:
        config.write_bytes(original)


if __name__ == "__main__":
    raise SystemExit(main())
