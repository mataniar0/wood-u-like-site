"""Offline WUL-023 evidence projection. Never reviews code or approves a merge.

Input: tools/qa-evidence.py JSON. No network, subprocess, model or log copying.
Readiness is advisory: independent verification of source/media/flags is required.
"""
import argparse
import json
from pathlib import Path
import re

from qa_pipeline import BROWSER, PREFLIGHT, SHARDS

REPO = "mataniar0/wood-u-like-site"
UNKNOWN = "UNVERIFIED"


def count(value):
    return type(value) is int and value >= 0


def build(run, head, base, risk="high", context="pr"):
    """Project a single collected run, rejecting incomplete or stale CI evidence.

    A READY_FOR_REVIEW result is not PASS_RECOMMENDED. Untrusted JSON can lie;
    compare it with GitHub and inspect the actual artifacts before any decision.
    """
    if not re.fullmatch(r"[a-f0-9]{40}", head) or not re.fullmatch(r"[a-f0-9]{40}", base):
        raise ValueError("Expected full head/base SHA")
    if risk not in ("docs", "product", "high") or context not in ("pr", "nightly"):
        raise ValueError("Unknown risk/context")
    blockers, gaps = [], []
    summary = run.get("summary") or {}
    if not isinstance(summary, dict):
        raise ValueError("Invalid summary")
    run_id = str(run.get("id", ""))
    if not re.fullmatch(r"[0-9]{1,20}", run_id):
        raise ValueError("Invalid run ID")
    if run.get("status") != "completed" or run.get("conclusion") != "success":
        blockers.append("run_not_successful")
    if summary.get("status") != "PASS":
        blockers.append("final_summary_not_pass")
    if type(summary.get("schema_version")) is not int or summary["schema_version"] != 1:
        blockers.append("unsupported_summary_schema")
    # API head_sha may identify the workflow/merge ref. tested_sha is the source
    # checkout, and still needs independent association with this run/PR.
    if summary.get("tested_sha") != head:
        blockers.append("stale_or_missing_tested_sha")
    if summary.get("base_sha") != base:
        blockers.append("stale_or_missing_base_sha")
    if str(summary.get("run_id")) != run_id or str(summary.get("run_attempt")) != str(run.get("run_attempt")):
        blockers.append("run_identity_mismatch")
    if not re.fullmatch(r"[1-9][0-9]*", str(run.get("run_attempt", ""))):
        blockers.append("invalid_run_attempt")
    if context == "pr" and run.get("event") == "schedule":
        blockers.append("scheduled_main_is_not_pr_evidence")
    jobs = run.get("jobs", [])
    gate = [j for j in jobs if "Required QA gate" in j.get("name", "")]
    if len(gate) != 1 or gate[0].get("conclusion") != "success" or gate[0].get("status") != "completed":
        blockers.append("critical_check_missing_or_red")
    selected = summary.get("selected", [])
    known = set(PREFLIGHT) | BROWSER
    if (not isinstance(selected, list) or not all(isinstance(s, str) for s in selected)
            or len(set(selected)) != len(selected) or not set(PREFLIGHT) <= set(selected)
            or set(selected) - known):
        blockers.append("invalid_or_incomplete_selection")
        selected = []
    if risk == "high" and not (set(PREFLIGHT) | {s for group in SHARDS.values() for s in group}) <= set(selected):
        blockers.append("high_risk_requires_full_coverage")
    if risk == "product" and not set(selected) & BROWSER:
        blockers.append("product_requires_browser_coverage")
    receipts = summary.get("suites", [])
    names = [r.get("suite") for r in receipts]
    if len(names) != len(set(names)) or set(names) != set(selected):
        blockers.append("missing_duplicate_or_extra_receipts")
    fingerprint = summary.get("source_fingerprint")
    if not isinstance(fingerprint, str) or not re.fullmatch(r"[a-f0-9]{64}", fingerprint):
        blockers.append("missing_source_fingerprint")
    rows = []
    totals = {"realPosts": 0, "unexpectedExternal": 0, "mockedPosts": 0}
    observed_browser = 0
    for receipt in receipts:
        name = receipt.get("suite")
        if name not in known:
            continue  # Never echo arbitrary names/logs/commands from input.
        if (receipt.get("status") != "PASS" or type(receipt.get("exit_code")) is not int
                or receipt["exit_code"] != 0 or receipt.get("tested_sha") != head
                or receipt.get("base_sha") != base or receipt.get("source_fingerprint") != fingerprint):
            blockers.append("failed_or_stale_receipt:" + name)
        rows.append({"suite": name, "status": "PASS" if receipt.get("status") == "PASS" else "FAIL",
                     "seconds": receipt.get("seconds") if type(receipt.get("seconds")) in (int, float) and 0 <= receipt["seconds"] <= 86_400_000 else UNKNOWN,
                     "retry_count": receipt.get("retry_count") if count(receipt.get("retry_count")) else UNKNOWN})
        if name in BROWSER:
            network = receipt.get("network") or {}
            for key, reason in (("realPosts", "live_post_observed"), ("unexpectedExternal", "external_request_observed"), ("denied", "denied_request_observed")):
                if count(network.get(key)) and network[key] > 0:
                    blockers.append(reason + ":" + name)
            if all(count(network.get(k)) for k in (*totals, "denied")):
                observed_browser += 1
                for key in totals:
                    totals[key] += network[key]
            else:
                gaps.append("missing_network_counters:" + name)
    for key in ("real_posts", "unexpected_external"):
        if count(summary.get(key)) and summary[key] > 0:
            blockers.append("unsafe_summary_counter:" + key)
    for key in ("missing", "failed", "unexpected_receipts", "duplicate_receipts"):
        if summary.get(key):
            blockers.append("summary_reports_failure:" + key)
    browser_count = len(set(selected) & BROWSER)
    complete_network = (browser_count > 0 and observed_browser == browser_count
                        and len(names) == len(set(names)) and set(names) == set(selected))
    if complete_network:
        for top, field in (("real_posts", "realPosts"), ("unexpected_external", "unexpectedExternal")):
            if summary.get(top) != totals[field] or not count(summary.get(top)):
                blockers.append("counter_total_mismatch:" + top)
    artifacts = run.get("artifacts", [])
    if not artifacts or any(a.get("expired") is not False for a in artifacts):
        gaps.append("missing_or_expired_artifacts")
    ids = [str(a.get("id", "")) for a in artifacts]
    if any(not re.fullmatch(r"[0-9]{1,20}", item) for item in ids):
        raise ValueError("Invalid artifact ID")
    readiness = "BLOCKED" if blockers else "INSUFFICIENT_EVIDENCE" if gaps else "READY_FOR_REVIEW"
    return {"schema_version": 1, "repository": REPO, "context": context, "risk": risk,
            "expected_head_sha": head, "expected_base_sha": base, "run_id": run_id,
            "ci_readiness": readiness, "blocking_reasons": sorted(set(blockers)), "evidence_gaps": sorted(set(gaps)),
            "review_status": None, "independent_review_required": True, "merge_authorized": False,
            "ai_invocations": 0, "nightly_action": ("RECORD_ONLY" if readiness == "READY_FOR_REVIEW" else "SHARE_ON_REQUEST") if context == "nightly" else None,
            "suites": rows, "live_posts": totals["realPosts"] if complete_network else UNKNOWN,
            "unexpected_external_requests": totals["unexpectedExternal"] if complete_network else UNKNOWN,
            "mocked_posts": totals["mockedPosts"] if complete_network else UNKNOWN,
            "counter_scope": "selected browser suites only" if complete_network else "no complete selected-browser measurements",
            "run_url": f"https://github.com/{REPO}/actions/runs/{run_id}",
            "artifact_urls": [f"https://github.com/{REPO}/actions/runs/{run_id}/artifacts/{i}" for i in ids],
            "source_access": "NOT_VERIFIED", "image_access": "NOT_VERIFIED", "form_flags": UNKNOWN,
            "versions": "NOT_VERIFIED: inspect provision.json and locked dependencies",
            "baseline_changes": "NOT_VERIFIED: inspect current diff and PLAN.json",
            "limits": ["Offline projection, not authentication or secret/PII scanning", "Artifact metadata is not proof of opening its contents", "No score, independent review, browser run, notification or merge performed"]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("evidence", type=Path)
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--head", required=True)
    parser.add_argument("--base", required=True)
    parser.add_argument("--risk", choices=("docs", "product", "high"), default="high")
    parser.add_argument("--context", choices=("pr", "nightly"), default="pr")
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    try:
        if args.evidence.stat().st_size > 5_000_000:
            raise ValueError("Oversized input")
        def reject_constant(value):
            raise ValueError("Non-finite JSON number")
        runs = json.loads(args.evidence.read_text(), parse_constant=reject_constant)
        matches = [r for r in runs if str(r.get("id")) == args.run_id]
        if len(matches) != 1:
            raise ValueError("Expected exactly one matching run")
        result = build(matches[0], args.head, args.base, args.risk, args.context)
    except (OSError, ValueError, TypeError, KeyError, AttributeError):
        # Do not echo malicious input or partially produce a review-ready bundle.
        result = {"ci_readiness": "BLOCKED", "blocking_reasons": ["invalid_or_unreadable_input"],
                  "merge_authorized": False, "ai_invocations": 0}
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False) + "\n")
    print(result["ci_readiness"])
    return int(result["ci_readiness"] != "READY_FOR_REVIEW")


if __name__ == "__main__":
    raise SystemExit(main())
