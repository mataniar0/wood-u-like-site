"""Verify current assets and delivery archive without historical Git objects."""
import hashlib
import json
import os
from pathlib import Path
import zipfile
ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get("WUL_REVIEW_DIR", ROOT / "artifacts/local/assets"))
sha = lambda data: hashlib.sha256(data).hexdigest()
approved = {}
for file in (ROOT / "qa/assets").glob("*.json"):
    approved.update(json.loads(file.read_text()))
assert sorted(approved) == sorted(str(p.relative_to(ROOT)) for p in (ROOT / "assets/images").iterdir())
records = []
for file, expected in approved.items():
    assert sha((ROOT / file).read_bytes()) == expected, file
    records.append({"path": file, "sha256": expected, "status": "PASS"})
for suffix in (".webp", "-small.webp"):
    assert (ROOT / ("assets/images/oval-room-signs" + suffix)).read_bytes() == (ROOT / ("assets/images/workshop" + suffix)).read_bytes()
package = json.loads((ROOT / "qa/asset-package.json").read_text())
assert sha((ROOT / package["path"]).read_bytes()) == package["sha256"]
with zipfile.ZipFile(ROOT / package["path"]) as archive:
    assert archive.testzip() is None
    assert sorted(archive.namelist()) == sorted(package["entries"])
    for file, expected in package["entries"].items():
        assert sha(archive.read(file)) == expected
        if file.startswith("assets/"):
            assert archive.read(file) == (ROOT / file).read_bytes()
OUT.mkdir(parents=True, exist_ok=True)
(OUT / "ASSET_VERIFICATION.json").write_text(json.dumps({"status": "PASS", "assets": records, "delivery_package": package["sha256"]}, indent=2) + "\n")
print(f"PASS: {len(records)} approved assets; exact directory; source copies; archive")
