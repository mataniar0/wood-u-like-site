"""Run WUL-020 regressions with browser-only network mocks and retained logs."""
import concurrent.futures
import json
import os
import subprocess
import sys
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get("WUL_REVIEW_DIR", ROOT / "docs/review/wul-020")).resolve()
HISTORY = OUT / "run-history"
HISTORY.mkdir(parents=True, exist_ok=True)
TASKS = [
    ("check-inquiry", "inquiry"),
    ("check-lead-attribution", "attribution"),
    ("check-hero", "hero"),
    ("check-clock", "clock"),
    ("check-family-sign", "family-sign"),
    ("check-schwartz-sign", "schwartz-sign"),
    ("check-pizza-peel", "pizza-peel"),
    ("check-shared-privacy", "privacy"),
    ("check-homepage", "homepage"),
    ("check-fragment-navigation", "legacy"),
    ("check-collection-accessibility", "accessibility"),
]
records = []
lock = threading.Lock()


def run(task):
    tool, destination = task
    env = dict(os.environ)
    env.setdefault("NODE_PATH", "/tmp/wul-check/node_modules")
    env.setdefault("WUL_BASE_URL", "http://127.0.0.1:8016/wood-u-like-site/")
    env.setdefault("WUL_BASE_COMMIT", "c1242a1")
    env["WUL_REVIEW_DIR"] = str(OUT / "regression" / destination)
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
        (OUT / "regression").mkdir(parents=True, exist_ok=True)
        (OUT / "regression/runner-results.json").write_text(json.dumps(records, indent=2) + "\n")
        print(json.dumps(record), flush=True)
    return record


with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
    list(executor.map(run, TASKS))
sys.exit(0 if all(record["exitCode"] == 0 for record in records) else 1)
