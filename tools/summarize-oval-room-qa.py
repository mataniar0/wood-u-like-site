"""Fail closed while assembling fresh WUL-020 evidence; never rewrite older tasks."""
import hashlib
import json
import struct
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/review/wul-020"
SPECS = [
    ("collections", "collections/results.json", 91),
    ("product-pages", "product-pages/results.json", 123),
    ("oval-room-signs", "oval-room-signs/results.json", 20),
    ("legacy-fragments", "regression/legacy/results.json", 52),
    ("collection-accessibility", "regression/accessibility/results.json", 12),
    ("language", "regression/hero/results.json", 21),
    ("hero", "regression/hero/hero-results.json", 10),
    ("homepage", "regression/homepage/browser-results.json", 4),
    ("clock", "regression/clock/results.json", 15),
    ("family-sign", "regression/family-sign/results.json", 10),
    ("schwartz-sign", "regression/schwartz-sign/results.json", 10),
    ("pizza-peel", "regression/pizza-peel/results.json", 10),
    ("inquiry", "regression/inquiry/results.json", 53),
    ("attribution", "regression/attribution/results.json", 186),
    ("shared-privacy", "regression/privacy/results.json", 10),
]


def read(file):
    return json.loads((OUT / file).read_text())


def write(file, value):
    (OUT / file).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


runner = read("regression/runner-results.json")
assert len(runner) == 11, "Wait for every regression process to finish"
assert all(r["exitCode"] == 0 and r["status"] == "PASS" for r in runner), runner
suites = []
for name, file, expected in SPECS:
    data = read(file)
    if isinstance(data, list):
        records = data
    else:
        assert data.get("status", "PASS") == "PASS", (name, data.get("status"))
        records = data.get("scenarios", data.get("results"))
    assert len(records) == expected, (name, len(records), expected)
    assert all(r.get("status", "PASS") == "PASS" for r in records), name
    suites.append({"suite": name, "scenarioRecords": len(records), "status": "PASS", "evidence": file})

products = read("product-pages/results.json")
collections = read("collections/results.json")
inquiry = read("regression/inquiry/results.json")
attribution = read("regression/attribution/results.json")
focused = read("oval-room-signs/results.json")
protection = read("PRESERVATION.json")
assets = read("ASSET_VERIFICATION.json")
cycles = read("CORRECTION_CYCLES.json")
assert protection["status"] == assets["status"] == "PASS"
assert len(protection["products"]) == 7
assert all(p["status"] == "PASS" for p in protection["products"])
assert products["nativeNavigation"]["products"] == 8
assert products["nativeNavigation"]["status"] == "PASS"
for field in ["unexpectedSubmissions", "unexpectedExternal", "realInquiries"]:
    assert products["requests"][field] == 0
for data in [inquiry, attribution]:
    assert data["realInquiryRequests"] == data["unexpectedExternalRequests"] == 0
mocked = products["requests"]["mockedPosts"] + inquiry["interceptedFormPosts"] + attribution["interceptedFormPosts"] + focused["mockedPosts"]
assert mocked == 236, mocked
assert len(read("before/results.json")["scenarios"]) == 4
assert read("before/results.json")["status"] == "PASS"
assert all(e["status"] == "PASS" for e in cycles["events"]), cycles

manifest = []
for png in sorted(OUT.rglob("*.png")):
    raw = png.read_bytes()
    assert raw[:8] == b"\x89PNG\r\n\x1a\n"
    width, height = struct.unpack(">II", raw[16:24])
    assert width > 0 and height > 0
    manifest.append({"file": str(png.relative_to(OUT)), "width": width, "height": height, "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()})
write("SCREENSHOT_MANIFEST.json", manifest)
protected = [r for r in protection["protectedFiles"] if "sha256" in r]
summary = {
    "task": "WUL-020",
    "status": "PASS",
    "generatedAtUtc": datetime.now(timezone.utc).isoformat(),
    "branch": "feature/wul-020-oval-room-signs",
    "baseline": protection["baseline"],
    "issueReference": {"requested": "Refs #WUL-020-ISSUE", "numericIssueProvided": False, "note": "No matching numeric GitHub Issue found; literal user reference retained without inventing an Issue number."},
    "environment": {"chromium": subprocess.check_output(["/usr/bin/chromium", "--version"], text=True).strip(), "node": subprocess.check_output(["node", "--version"], text=True).strip(), "playwright": "1.62.1", "axeCore": "4.10.3", "localBase": "http://127.0.0.1:8016/wood-u-like-site/"},
    "suiteResults": suites,
    "browserScenarioRecords": sum(s["scenarioRecords"] for s in suites),
    "additionalEvidence": {"baselineCollectionCaptures": 4, "assetAndZipVerification": "PASS", "staticPreservationContract": "PASS", "originalTranslationKeysPreserved": protection["originalTranslationKeysPreserved"], "nativeNoJsNavigationProducts": 8},
    "layoutMatrix": {"widths": [320, 390, 768, 1024, 1440], "languages": ["he", "en"], "newProductJsLayouts": 10, "homeAndCollectionsJsLayouts": 50, "homeAndCollectionsNoJsLayouts": 25, "effectiveLanguageWithoutJs": "he"},
    "products": {"total": 8, "distribution": [4, 2, 1, 1], "newId": "oval-room-signs", "wordingExamples": 3, "newProducts": 1, "publicHomeProductCards": 0, "uniqueProductSeoRecords": len(products["metadata"]), "uniqueCollectionSeoRecords": len(collections["seo"])},
    "sourceSelection": read("PHOTO_MANIFEST.json")["sourceSelection"],
    "assets": assets,
    "preservation": {"byteIdenticalProtectedFiles": len(protected), "approvedByteIdenticalImageCopies": 2, "unchangedProductPages": 7, "unchangedOtherCollections": 3, "homepageHeroAndAttributionUnchanged": True, "inquiryChangesOnlyRegistryEntryAndOption": True, "newCssRulesScopedToNewProduct": True},
    "requests": {"interceptedMockPosts": mocked, "productPageFixturePosts": products["requests"]["mockedPosts"], "inquiryFixturePosts": inquiry["interceptedFormPosts"], "attributionFixturePosts": attribution["interceptedFormPosts"], "wordingFixturePosts": focused["mockedPosts"], "realInquiries": 0, "unexpectedExternalBrowserRequests": 0, "publicSendingBlocked": True},
    "correctionCycles": cycles,
    "screenshots": {"count": len(manifest), "manifest": "SCREENSHOT_MANIFEST.json"},
    "independentReview": {"state": "PENDING", "minimumScore": 90, "blockingDefectsAllowed": 0, "selfScore": None},
    "publication": {"merged": False, "deployed": False, "workBranchDeleted": False, "livePagesVerificationPerformed": False},
    "limitations": ["Chromium automation only; Firefox/Safari not run", "No manual screen-reader or physical-device review", "Static Hebrew without JavaScript; English uses the existing shared language runtime", "English metadata shares the existing URL; no separate-language indexing guarantee", "Requested input ZIP was absent; reused exact matching approved R1-09 photo and created a new delivery ZIP", "No numeric WUL-020 Issue was supplied or found; requested literal PR reference retained", "Local QA under the actual Pages prefix; no production verification or deployment"],
}
assert summary["browserScenarioRecords"] == 627
write("QA_SUMMARY.json", summary)
print(f"PASS: {summary['browserScenarioRecords']} browser records; {mocked} intercepted POSTs; {len(manifest)} screenshots")
