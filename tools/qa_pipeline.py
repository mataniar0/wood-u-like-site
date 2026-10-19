"""Portable QA planning/execution. No deployment, account access or live form API."""
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import hashlib
import json
import os
from pathlib import Path
import re
import resource
import signal
import subprocess
import threading
import time

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "qa/catalog.json"
SUITES = {
    "static": ["python3", "-B", "tools/qa_static.py"],
    "contract": ["node", "tools/check-collection-contract.cjs"],
    "assets": ["python3", "tools/verify-oval-room-assets.py"],
    "leads": ["python3", "-B", "tools/test_leads_report.py"],
    "pipeline-unit": ["python3", "-B", "tools/test_qa_pipeline.py"],
    "collections": ["node", "tools/check-collections.cjs"],
    "product-pages": ["node", "tools/check-product-pages.cjs"],
    "inquiry": ["node", "tools/check-inquiry.cjs"],
    "attribution": ["node", "tools/check-lead-attribution.cjs"],
    "oval-room-signs": ["node", "tools/check-oval-room-signs.cjs"],
    "natural-door-sign": ["node", "tools/check-natural-door-sign.cjs"],
    "legacy": ["node", "tools/check-fragment-navigation.cjs"],
    "accessibility": ["node", "tools/check-collection-accessibility.cjs"],
    "language": ["node", "tools/check-language.cjs"],
    "clock": ["node", "tools/check-clock.cjs"],
    "hero": ["node", "tools/check-hero.cjs"],
    "homepage": ["node", "tools/check-homepage.cjs"],
    "privacy": ["node", "tools/check-shared-privacy.cjs"],
    "family-sign": ["node", "tools/check-family-sign.cjs"],
    "schwartz-sign": ["node", "tools/check-schwartz-sign.cjs"],
    "pizza-peel": ["node", "tools/check-pizza-peel.cjs"],
    "smoke": ["node", "tools/qa-smoke.cjs"],
}
PREFLIGHT = ["static", "contract", "assets", "leads", "pipeline-unit"]
SHARDS = {
    "navigation": ["language", "hero", "homepage", "legacy"],
    "collections": ["collections", "accessibility"],
    "products": ["product-pages"],
    "inquiry": ["inquiry", "privacy"],
    "attribution": ["attribution"],
    "media": ["clock", "oval-room-signs", "natural-door-sign"],
    "identity": ["family-sign", "schwartz-sign", "pizza-peel"],
}
BROWSER = {name for group in SHARDS.values() for name in group} | {"smoke"}


def git(*args, root=ROOT):
    return subprocess.check_output(["git", *args], cwd=root, text=True).strip()


def resolve_base(value=None):
    ref = value or os.environ.get("WUL_BASE_COMMIT") or "origin/main"
    sha = git("rev-parse", "--verify", ref + "^{commit}")
    if not re.fullmatch(r"[0-9a-f]{40}", sha):
        raise ValueError("Cannot resolve a trustworthy base commit")
    return sha


def changed_files(base, root=ROOT):
    # NUL delimiters preserve unusual paths; renames/deletions fail closed.
    raw = subprocess.check_output(["git", "diff", "--name-status", "-z", "--find-renames", base, "HEAD"], cwd=root)
    tokens = raw.decode("utf-8", "strict").split("\0")
    changes, i = [], 0
    while i < len(tokens) and tokens[i]:
        status, name = tokens[i], tokens[i + 1]
        i += 2
        if status.startswith(("R", "C")):
            changes.append({"status": status, "path": tokens[i], "old_path": name})
            i += 1
        else:
            changes.append({"status": status, "path": name})
    return changes


def select(changes, catalog, mode="pr", diff_error=False, branch=None):
    """Pure classifier: only explicit, narrow classes avoid full regression."""
    products = catalog["products"]
    selected_products, reasons = set(), []
    risk = "docs"
    full = mode == "full" or diff_error
    manual_review = diff_error
    if branch is not None and not re.fullmatch(r"(?:main|feature/wul-[0-9]+-[a-z0-9-]+)", branch):
        full = True; manual_review = True; reasons.append("unknown branch: full fallback")
    if diff_error:
        reasons.append("diff unavailable: full fallback")
    sensitive = ("inquiry/", "assets/js/attribution.js", "assets/js/language.js", "assets/js/main.js", "assets/css/", "index.html")
    for item in changes:
        name, status = item["path"], item["status"]
        if status not in ("A", "M") or ".." in name.split("/") or not re.fullmatch(r"[A-Za-z0-9._/-]+", name):
            full = True; manual_review = True; reasons.append("unknown/renamed/deleted path: full fallback"); continue
        if name.startswith((".github/", "qa/")) and not name.startswith("qa/assets/") or name in ("package.json", "package-lock.json", ".gitignore"):
            full = True; manual_review = True; reasons.append("QA configuration/contract change: independent review + full"); continue
        if name.startswith("tools/"):
            if status == "A" and Path(name).name.startswith("test"):
                full = True; manual_review = True; reasons.append("new test file: full fallback"); continue
            if name in ("tools/leads_report.py", "tools/test_leads_report.py"):
                continue
            full = True; manual_review = True; reasons.append("test infrastructure or unclassified tool: full"); continue
        if name.startswith(sensitive):
            full = True; reasons.append("shared navigation/form/privacy/attribution: full before merge"); continue
        affected = set()
        for p in products:
            if name.startswith(p["route"]) or name == f"qa/assets/{p['product_id']}.json" or any(name in (im["src"], im["small_src"]) for im in p["images"]):
                affected.add(p["product_id"])
        if name.startswith("collections/"):
            affected.update(p["product_id"] for p in products if name.startswith("collections/" + p["collection"] + "/"))
        if affected:
            risk = "product"; selected_products.update(affected)
            reasons.append("targeted current product/collection/image contract")
            manual_review |= name.startswith("qa/assets/")
        elif name == "README.md" or name.startswith("docs/"):
            # New test files or metadata under docs are never an executable bypass.
            if Path(name).suffix.lower() not in (".md", ".txt", ".json", ".csv"):
                full = True; manual_review = True; reasons.append("unclassified documentation payload: full")
        else:
            full = True; manual_review = True; reasons.append("unclassified path: full fallback")
    if full:
        profile = "full"
        shards = SHARDS
    elif selected_products:
        profile = "product"
        # Gallery controls retain their complete existing dedicated regression.
        names = (["smoke"] if selected_products - {"personalized-clock"} else [])
        if "personalized-clock" in selected_products: names.append("clock")
        shards = {"targeted": names}
    else:
        profile = "docs"
        shards = {}
    selected = [*PREFLIGHT, *[s for names in shards.values() for s in names]]
    return {"profile": profile, "shards": shards, "selected": selected,
            "selected_products": sorted(selected_products), "mandatory_static": True,
            "manual_review_required": manual_review, "reasons": sorted(set(reasons)) or ["documentation/leads-only; no changed public UI"],
            "skipped": [{"suite": name, "reason": "unaffected browser surface; current static contracts still required"}
                        for name in sorted(BROWSER) if name not in selected],
            "coverage": {"languages": ["he", "en"], "widths": [320, 390, 768, 1024, 1440],
                         "no_js": profile != "docs", "browser": "Chromium" if shards else "not run; no changed public UI"}}


def fingerprint():
    digest = hashlib.sha256()
    paths = sorted(p for folder in ("assets", "collections", "products", "inquiry", "tools", "qa", ".github")
                   for p in (ROOT / folder).rglob("*") if p.is_file() and "__pycache__" not in p.parts)
    paths += [ROOT / name for name in ("index.html", "package.json", "package-lock.json")]
    for path in paths:
        digest.update(str(path.relative_to(ROOT)).encode()); digest.update(path.read_bytes())
    return digest.hexdigest()


def plan(mode, base=None):
    head = git("rev-parse", "HEAD")
    try:
        baseline = resolve_base(base)
        changes = changed_files(baseline)
        branch = os.environ.get("GITHUB_HEAD_REF") or os.environ.get("GITHUB_REF_NAME") or git("branch", "--show-current")
        selection = select(changes, json.loads(CATALOG.read_text()), mode, branch=branch)
        dirty = bool(git("status", "--porcelain", "--untracked-files=normal"))
        if dirty:
            selection = select(changes, json.loads(CATALOG.read_text()), "full", branch=branch)
            selection["manual_review_required"] = True
            selection["reasons"].append("dirty worktree: local full run; not a clean commit claim")
        if os.environ.get("CI") == "true" and dirty:
            raise ValueError("CI checkout must be clean")
    except (subprocess.CalledProcessError, UnicodeError, ValueError):
        # Full execution still requires an actual resolved target for reporting.
        baseline = git("rev-parse", "HEAD")
        changes = []
        selection = select([], json.loads(CATALOG.read_text()), mode, diff_error=True)
    return {"schema_version": 1, "tested_sha": head, "workflow_sha": os.environ.get("GITHUB_SHA"),
            "base_sha": baseline, "event": os.environ.get("GITHUB_EVENT_NAME", "local"),
            "workflow": os.environ.get("GITHUB_WORKFLOW", "local"), "run_id": os.environ.get("GITHUB_RUN_ID", "local"),
            "run_attempt": os.environ.get("GITHUB_RUN_ATTEMPT", "1"),
            "source_fingerprint": fingerprint(), "catalog_version": json.loads(CATALOG.read_text())["version"],
            "product_count": len(json.loads(CATALOG.read_text())["products"]), "changes": changes, **selection}


class QuietServer(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass  # URLs/query strings and visitor data never enter HTTP logs.

    def translate_path(self, path):
        prefix = "/wood-u-like-site/"
        if not path.startswith(prefix):
            return str(ROOT / ".qa-no-such-route")
        return super().translate_path("/" + path[len(prefix):])


@contextmanager
def local_server():
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietServer, directory=str(ROOT)))
    worker = threading.Thread(target=server.serve_forever, daemon=True); worker.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}/wood-u-like-site/"
    finally:
        server.shutdown(); server.server_close(); worker.join(timeout=5)


def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def execute(name, out, baseline, base_url, selection, timeout=2400):
    start = time.perf_counter()
    cpu_before = resource.getrusage(resource.RUSAGE_CHILDREN)
    folder = out / name; folder.mkdir(parents=True, exist_ok=True)
    command = SUITES[name].copy()
    if command[0] == "node":
        command[1:1] = ["--require", str(ROOT / "tools/qa-config.cjs")]
    env = {key: value for key, value in os.environ.items()
           if key not in ("GITHUB_TOKEN", "GH_TOKEN", "NODE_OPTIONS", "GITHUB_OUTPUT", "GITHUB_ENV", "GITHUB_PATH", "GITHUB_STEP_SUMMARY")
           and not key.startswith("ACTIONS_") and not re.search(r"TOKEN|SECRET|PASSWORD", key)}
    env.update({"WUL_BASE_COMMIT": baseline, "WUL_BASE_URL": base_url, "WUL_REVIEW_DIR": str(folder.resolve()),
                "WUL_PRODUCT_IDS": ",".join(selection.get("selected_products", [])), "PYTHONDONTWRITEBYTECODE": "1"})
    # A fresh same-source language receipt is required before skipping Hero's
    # otherwise duplicated nested language call.
    if name == "hero" and (out / "language/receipt.json").exists():
        receipt = json.loads((out / "language/receipt.json").read_text())
        if receipt["status"] == "PASS" and receipt["source_fingerprint"] == selection["source_fingerprint"]:
            env["WUL_SKIP_LANGUAGE_REGRESSION"] = "1"
    process = None; status = "FAIL"; kind = "product_or_contract"; code = 1
    with (folder / "suite.log").open("w") as stream:
        try:
            process = subprocess.Popen(command, cwd=ROOT, env=env, stdout=stream, stderr=subprocess.STDOUT, start_new_session=True)
            code = process.wait(timeout=timeout)
            status = "PASS" if code == 0 else "FAIL"
        except subprocess.TimeoutExpired:
            kind = "timeout"; code = 124
            process.terminate()
            try: process.wait(timeout=6)
            except subprocess.TimeoutExpired: pass
            stream.write("\nQA_TIMEOUT: suite exceeded its measured execution budget\n")
        finally:
            if process:
                try: os.killpg(process.pid, signal.SIGKILL)
                except ProcessLookupError: pass
    guard = folder / "network-guard.json"
    network = json.loads(guard.read_text()) if guard.exists() else None
    if name in BROWSER and (network is None or network["denied"] or network["realPosts"]):
        status = "FAIL"; code = code or 1; kind = "safety_or_missing_network_receipt"
    log = (folder / "suite.log").read_text()
    # Logs are uploaded publicly. Redact contact values, URLs carrying form
    # query payloads and accidental credentials, then keep the run red.
    safe_log = re.sub(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", "[contact-redacted]", log)
    safe_log = re.sub(r"(?:gh[pousr]_[A-Za-z0-9]{20,}|AKIA[A-Z0-9]{16})", "[credential-redacted]", safe_log)
    if safe_log != log:
        (folder / "suite.log").write_text(safe_log)
    cpu_after = resource.getrusage(resource.RUSAGE_CHILDREN)
    if re.search(r"Executable doesn't exist|browserType.launch.*closed|error while loading shared libraries", log):
        kind = "environment"  # Still red. No generic assertion/CLS retries.
    result = {"suite": name, "status": status, "exit_code": code, "failure_kind": None if status == "PASS" else kind,
              "seconds": round(time.perf_counter() - start, 3), "retry_count": 0, "command": command,
              "cpu_seconds": round(cpu_after.ru_utime + cpu_after.ru_stime - cpu_before.ru_utime - cpu_before.ru_stime, 3),
              "tested_sha": selection["tested_sha"], "base_sha": baseline,
              "source_fingerprint": selection["source_fingerprint"], "network": network,
              "log": f"{name}/suite.log", "screenshots": len(list(folder.rglob("*.png")))}
    write(folder / "receipt.json", result)
    print(f"{status} {name}: {result['seconds']}s, exit={code}", flush=True)
    if status != "PASS" and os.environ.get("GITHUB_ACTIONS") == "true":
        diagnostic = safe_log[-3000:].replace("%", "%25").replace("\r", "%0D").replace("\n", "%0A")
        print("::notice title=WUL023_FAILURE_" + name + "::" + diagnostic, flush=True)
    return result


def summary(selection, receipts, elapsed):
    selected = set(selection["selected"])
    observed = {r["suite"]: r for r in receipts}
    missing = sorted(selected - set(observed))
    bad = [r["suite"] for r in receipts if r["status"] != "PASS" or r["exit_code"] != 0
           or r["tested_sha"] != selection["tested_sha"] or r["source_fingerprint"] != selection["source_fingerprint"]]
    duplicates = len(receipts) != len(observed)
    unexpected = sorted(set(observed) - selected)
    return {**selection, "status": "FAIL" if missing or bad or duplicates or unexpected else "PASS", "suites": receipts,
            "missing": missing, "failed": bad, "duplicate_receipts": duplicates,
            "unexpected_receipts": unexpected,
            "suite_pass_count": sum(r["status"] == "PASS" for r in receipts),
            "wall_seconds": round(elapsed, 3), "summed_suite_seconds": round(sum(r["seconds"] for r in receipts), 3),
            "retry_count": sum(r["retry_count"] for r in receipts), "real_posts": 0,
            "summed_cpu_seconds": round(sum(r.get("cpu_seconds", 0) for r in receipts), 3),
            "unexpected_external": sum((r.get("network") or {}).get("unexpectedExternal", 0) for r in receipts),
            "browser_limitations": "Chromium only; no live Pages, Safari/Firefox or manual screen reader",
            "scheduled_cron_claim": "Only schedule-triggered runs prove actual cron execution"}
