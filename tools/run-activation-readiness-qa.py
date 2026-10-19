"""Run existing mocked WUL-006 acceptance suites; never enable live sending."""
import argparse
import concurrent.futures
import json
import os
import subprocess
import sys
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/review/wul-006/activation-readiness"
HISTORY = OUT / "run-history"
HISTORY.mkdir(parents=True, exist_ok=True)
tasks = [("check-inquiry", "inquiry"), ("check-lead-attribution", "attribution"), ("check-hero", "homepage"), ("check-shared-privacy", "privacy")]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--only", nargs="+", choices=[destination for _, destination in tasks])
args = parser.parse_args()
records = []
if args.only:
    selected = {tool for tool, destination in tasks if destination in args.only}
    previous = OUT / "RUN_RESULTS.json"
    if previous.exists():
        records = [record for record in json.loads(previous.read_text()) if record["tool"] not in selected]
    tasks = [(tool, destination) for tool, destination in tasks if destination in args.only]
lock = threading.Lock()


def run(item):
    tool, destination = item
    env = dict(os.environ)
    env.setdefault("NODE_PATH", "/tmp/wul-check/node_modules")
    env.setdefault("WUL_BASE_URL", "http://127.0.0.1:8020/wood-u-like-site/")
    env["WUL_REVIEW_DIR"] = str(OUT / destination)
    attempt = 1
    while (HISTORY / f"{destination}-run-{attempt}.log").exists():
        attempt += 1
    log = HISTORY / f"{destination}-run-{attempt}.log"
    started = time.monotonic()
    with log.open("w") as stream:
        result = subprocess.run(["node", f"tools/{tool}.cjs"], cwd=ROOT, env=env, stdout=stream, stderr=subprocess.STDOUT)
    record = {"tool": tool, "status": "PASS" if result.returncode == 0 else "FAIL", "exitCode": result.returncode, "seconds": round(time.monotonic() - started, 2), "log": str(log.relative_to(OUT))}
    with lock:
        records.append(record)
        (OUT / "RUN_RESULTS.json").write_text(json.dumps(records, indent=2) + "\n")
        print(json.dumps(record), flush=True)
    return record


with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
    list(executor.map(run, tasks))
sys.exit(0 if all(r["exitCode"] == 0 for r in records) else 1)
