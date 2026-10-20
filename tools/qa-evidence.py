"""Read-only collector for public run metrics and compact check evidence.

Usage: python3 tools/qa-evidence.py --out artifacts/evidence.json RUN_ID ...
Never downloads signed URLs or copies raw customer data into Git.
"""
import argparse
import concurrent.futures
import datetime
import json
import re
from qa_annotations import unpack
from pathlib import Path
import subprocess

REPO = "mataniar0/wood-u-like-site"


def api(path):
    return json.loads(subprocess.check_output(["gh", "api", path], text=True))


def seconds(start, end):
    return round((datetime.datetime.fromisoformat(end.replace("Z", "+00:00")) - datetime.datetime.fromisoformat(start.replace("Z", "+00:00"))).total_seconds(), 3)


def collect(run_id):
    prefix = f"repos/{REPO}/actions/runs/{run_id}"
    data = api(prefix); jobs = api(prefix + "/jobs?per_page=100")["jobs"]
    artifacts = api(prefix + "/artifacts?per_page=100")["artifacts"]
    summaries, diagnostics = [], []
    for job in jobs:
        annotations = api(job["check_run_url"] + "/annotations?per_page=100")
        packed = {}
        expected_parts = None
        for a in annotations:
            match = re.fullmatch(r"WUL023_SUMMARY_GZ_([0-9]+)_([0-9]+)", a["title"])
            if match:
                packed[int(match[1])] = a["message"]; expected_parts = int(match[2])
                continue
            if a["title"] == "WUL023_SUMMARY":
                try:
                    summary = json.loads(a["message"])
                except json.JSONDecodeError:
                    summary = {"status": "TRUNCATED_OLD_ANNOTATION"}
                summaries.append({"job": job["name"], "summary": summary})
            elif a["title"].startswith("WUL023_FAILURE_"):
                diagnostics.append({"job": job["name"], "title": a["title"], "message": a["message"]})
        if packed:
            assert sorted(packed) == list(range(1, expected_parts + 1)), "Incomplete annotation chunks"
            summaries.append({"job": job["name"], "summary": unpack([packed[i] for i in sorted(packed)])})
    result = {k: data[k] for k in ("id", "name", "head_sha", "head_branch", "event", "status", "conclusion", "created_at", "updated_at", "run_started_at", "html_url", "run_attempt")}
    result["workflow_wall_seconds"] = seconds(data["created_at"], data["updated_at"]) if data["status"] == "completed" else None
    result["jobs"] = [{k: job[k] for k in ("id", "name", "status", "conclusion", "started_at", "completed_at", "html_url")} for job in jobs]
    result["summed_job_wall_seconds"] = sum(seconds(j["started_at"], j["completed_at"]) for j in jobs if j["status"] == "completed" and j["conclusion"] != "skipped")
    result["artifacts"] = [{k: a[k] for k in ("id", "name", "size_in_bytes", "expired", "digest", "expires_at")} for a in artifacts]
    result["uploaded_compressed_artifact_bytes"] = sum(a["size_in_bytes"] for a in artifacts)
    result["summaries"] = summaries; result["diagnostics"] = diagnostics
    result["summary"] = next((s["summary"] for s in summaries if "Required QA gate" in s["job"]), next((s["summary"] for s in summaries if s["summary"].get("phase") != "preflight"), None))
    result["artifact_links"] = [f"https://github.com/{REPO}/actions/runs/{run_id}/artifacts/{a['id']}" for a in artifacts]
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("run_ids", nargs="+", type=int)
    args = parser.parse_args()
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        evidence = list(pool.map(collect, args.run_ids))
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n")
    for run in evidence:
        summary = run["summary"] or {}
        print(run["id"], run["conclusion"], run["workflow_wall_seconds"], summary.get("profile"), summary.get("suite_pass_count"), summary.get("fault_detected"))
