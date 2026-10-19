"""Summarize completed mocked WUL-006 QA without asserting live readiness."""
import hashlib
import json
import struct
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/review/wul-006/activation-readiness"
SPECS = [
    ("inquiry", "inquiry/results.json", 55),
    ("attribution", "attribution/results.json", 194),
    ("language", "homepage/results.json", 21),
    ("hero", "homepage/hero-results.json", 10),
    ("privacy-preview", "privacy/results.json", 10),
]


def read(file):
    return json.loads((OUT / file).read_text())


def write(file, value):
    (OUT / file).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


processes = read("RUN_RESULTS.json")
assert len(processes) == 4 and all(p["status"] == "PASS" and p["exitCode"] == 0 for p in processes), processes
suites = []
for name, file, expected in SPECS:
    data = read(file)
    if isinstance(data, dict):
        assert data.get("status", "PASS") == "PASS", (name, data.get("status"))
    records = data if isinstance(data, list) else data["results"]
    assert len(records) == expected, (name, len(records), expected)
    for record in records:
        if "status" in record:
            assert record["status"] == "PASS", (name, record)
        else:
            # The language runner's five functional records report named PASS
            # fields, alongside informational BFCache/header-shift measurements.
            assert name == "language", (name, record)
            pass_keys = set(record) - {"actualBFCache", "headerShift"}
            assert pass_keys and pass_keys <= {"persistence", "tabs", "history", "pageshow", "blockedStorage", "noJavaScript", "slowBootstrap", "pausedParserEnglishGuard"}, record
            assert all(record[key] == "PASS" for key in pass_keys), record
    suites.append({"suite": name, "status": "PASS", "scenarioRecords": len(records), "evidence": file})
inquiry = read("inquiry/results.json")
attribution = read("attribution/results.json")
privacy = read("privacy/results.json")
for data in [inquiry, attribution]:
    assert data["realInquiryRequests"] == data["unexpectedExternalRequests"] == 0
assert privacy["externalRequests"] == privacy["realInquiryRequests"] == 0
mocked = inquiry["interceptedFormPosts"] + attribution["interceptedFormPosts"]
assert mocked == 224, mocked
audit = read("STATIC_AUDIT.json")
assert audit["technicalStaticStatus"] == "PASS"
assert not audit["publicActivationAuthorized"] and not audit["controlledLiveTestAuthorized"]
assert not any(audit["approvalFlags"].values())
assert audit["productCount"] == 9
assert read("PRESERVATION.json")["status"] == "PASS"
assert read("READINESS_MATRIX.json")["liveStatus"] == "BLOCKED"
plan = read("CONTROLLED_TEST_PLAN.json")
assert not plan["liveExecutionAllowed"] and plan["maximumAuthorizedPostsNow"] == 0
cycles = read("CORRECTION_CYCLES.json")
assert all(e.get("finalStatus") == "PASS" for e in cycles["events"]), cycles

screenshots = []
for file in sorted(OUT.rglob("*.png")):
    raw = file.read_bytes()
    assert raw[:8] == b"\x89PNG\r\n\x1a\n"
    width, height = struct.unpack(">II", raw[16:24])
    screenshots.append({"file": str(file.relative_to(OUT)), "width": width, "height": height, "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()})
write("SCREENSHOT_MANIFEST.json", screenshots)
summary = {
    "task": "WUL-006 / Issue #9 — activation handoff",
    "generatedAtUtc": datetime.now(timezone.utc).isoformat(),
    "scope": "Preparation for owner/team-lead review; live test and public activation not authorized",
    "technicalQaStatus": "PASS",
    "liveReadiness": "BLOCKED_PENDING_OWNER_AND_SERVICE_VERIFICATION",
    "issueCompletion": "OPEN — live activation conditions remain outstanding",
    "baseline": audit["baseline"],
    "branch": "feature/wul-006-activation-readiness",
    "environment": {"chromium": subprocess.check_output(["/usr/bin/chromium", "--version"], text=True).strip(), "node": subprocess.check_output(["node", "--version"], text=True).strip(), "playwright": "1.62.1", "axeCore": "4.10.3"},
    "suiteResults": suites,
    "browserScenarioRecords": sum(s["scenarioRecords"] for s in suites),
    "requests": {"scope": "Final successful suite runs only; failed partial runs retained in run-history", "interceptedMockPosts": mocked, "inquiryFixturePosts": inquiry["interceptedFormPosts"], "attributionFixturePosts": attribution["interceptedFormPosts"], "realInquiries": 0, "unexpectedExternalBrowserRequests": 0},
    "matrix": {"widths": [320, 390, 768, 1024, 1440], "languages": ["he", "en"], "noJavascript": "Static Hebrew privacy and blocked submit verified; English uses existing runtime"},
    "preservation": {"productionFilesByteIdentical": audit["productionFilesUnchanged"], "productCount": 9, "publicSendingBlocked": True, "assemblLabModified": False},
    "sourceEndpointVerification": "PASS — configuration equality only, not delivery",
    "externalServiceVerification": {"accountAccessed": False, "accountSettingsVerified": False, "inboxDeliveryVerified": False, "notificationSubjectVerified": False, "officialDocumentationRead": "BLOCKED — HTTP/tunnel 403, including additional permitted read attempt"},
    "approvalFlags": audit["approvalFlags"],
    "correctionCycles": cycles,
    "screenshots": {"count": len(screenshots), "manifest": "SCREENSHOT_MANIFEST.json"},
    "ownerReview": {"runbook": "../../../../inquiry/ACTIVATION_HE.md", "privacy": "PRIVACY_REVIEW_HE_EN.md", "matrix": "READINESS_MATRIX.json", "controlledTestPlan": "CONTROLLED_TEST_PLAN.json"},
    "publication": {"merged": False, "deployed": False, "branchDeleted": False, "controlledLiveTestPerformed": False, "publicActivationPerformed": False},
    "limitations": ["Chromium automation only; Safari/Firefox and manual screen-reader review not run", "Mocked requests cannot establish inbox delivery, email subject or real-account behavior", "Exact privacy text/email and operating practices remain pending owner approval", "Domain restrictions, shared quotas/roles/workflows/spam/notifications require authorized account review", "No live-test or public-activation authorization; both remain blocked"],
}
assert summary["browserScenarioRecords"] == 290
write("QA_SUMMARY.json", summary)
print(f"PASS for review: {summary['browserScenarioRecords']} browser records, {mocked} mocked POSTs, {len(screenshots)} screenshots. LIVE REMAINS BLOCKED.")
