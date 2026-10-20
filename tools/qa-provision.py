"""Measured dev-only install. Run before network isolation; no runtime npm."""
import argparse
import json
from pathlib import Path
import subprocess
import sys
import time

parser = argparse.ArgumentParser()
parser.add_argument("--browser", action="store_true")
parser.add_argument("--out", type=Path, required=True)
args = parser.parse_args()
package = json.loads(Path("package.json").read_text())
assert package["private"] is True and not package.get("dependencies")
assert package["devDependencies"] == {"playwright": "1.62.1", "axe-core": "4.10.3", "yaml": "2.8.1"}
lock = json.loads(Path("package-lock.json").read_text())
assert lock["lockfileVersion"] == 3
for name, data in lock["packages"].items():
    if name:
        assert data["resolved"].startswith("https://registry.npmjs.org/") and data["integrity"].startswith("sha512-")
record = {"python": sys.version.split()[0], "node": subprocess.check_output(["node", "--version"], text=True).strip(),
          "npm_ci_seconds": 0, "browser_install_seconds": 0, "browser_requested": args.browser}
args.out.parent.mkdir(parents=True, exist_ok=True)
for key, command in [("npm_ci_seconds", ["npm", "ci", "--ignore-scripts", "--no-audit", "--no-fund"]),
                     *([("browser_install_seconds", ["npx", "--no-install", "playwright", "install", "--with-deps", "--no-shell", "chromium"])] if args.browser else [])]:
    start = time.perf_counter()
    result = subprocess.run(command)
    record[key] = round(time.perf_counter() - start, 3)
    record["status"] = "PASS" if result.returncode == 0 else "FAIL"
    args.out.write_text(json.dumps(record, indent=2) + "\n")
    if result.returncode:
        raise SystemExit(result.returncode)
