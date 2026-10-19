"""Run fresh WUL-021 Integration V2 QA with isolated artifacts and real exit codes."""
import argparse
import concurrent.futures
import datetime
import hashlib
import json
import os
from pathlib import Path
import subprocess
import threading

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/review/wul-021/integration"
JOBS = {
    "contract": ["node", "tools/check-collection-contract.cjs"],
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
    "assets": ["python3", "tools/verify-oval-room-assets.py"],
}

def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", nargs="+", choices=list(JOBS))
    parser.add_argument("--workers", type=int, default=4)
    args = parser.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    history = OUT / "run-history"
    history.mkdir(exist_ok=True)
    state_file = OUT / "RUNS.json"
    state = json.loads(state_file.read_text()) if state_file.exists() else {"task": "WUL-021 Integration V2 / #39", "runs": []}
    lock = threading.Lock()
    head = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    paths = subprocess.check_output(["git", "ls-files", "assets", "collections", "inquiry", "products", "index.html", "tools"], cwd=ROOT, text=True).splitlines()
    digest = hashlib.sha256()
    for name in sorted(paths):
        digest.update(name.encode())
        digest.update((ROOT / name).read_bytes())
    fingerprint = digest.hexdigest()
    env = os.environ.copy()
    env.update({"NODE_PATH": "/tmp/wul-check/node_modules", "WUL_BASE_URL": "http://127.0.0.1:8001/wood-u-like-site/", "WUL_CHROMIUM": "/usr/bin/chromium", "WUL_BASE_COMMIT": "4a2c0722e2a947edaf8be8c86df1a65bcd36da35"})

    def save():
        temporary = state_file.with_suffix(".tmp")
        temporary.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n")
        temporary.replace(state_file)

    def run(name):
        with lock:
            attempt = 1 + sum(r["suite"] == name for r in state["runs"])
            log = history / f"{name}-run-{attempt}.log"
            entry = {"suite": name, "attempt": attempt, "command": JOBS[name], "head": head, "source_fingerprint": fingerprint, "started_at": now(), "status": "RUNNING", "log": str(log.relative_to(OUT)), "artifact_dir": name}
            state["runs"].append(entry)
            save()
            print(f"START {name} attempt {attempt}", flush=True)
        suite_env = {**env, "WUL_REVIEW_DIR": str(OUT / name)}
        with log.open("w") as stream:
            completed = subprocess.run(JOBS[name], cwd=ROOT, env=suite_env, stdout=stream, stderr=subprocess.STDOUT)
        with lock:
            entry.update({"status": "PASS" if completed.returncode == 0 else "FAIL", "exit_code": completed.returncode, "completed_at": now()})
            save()
            print(f"{entry['status']} {name} attempt {attempt} exit {completed.returncode}", flush=True)
        return completed.returncode

    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        results = list(pool.map(run, args.only or list(JOBS)))
    return 1 if any(results) else 0

if __name__ == "__main__":
    raise SystemExit(main())
