"""Synthetic protocol exercises, not independent QA or a production merge gate."""
import copy
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from qa_review_bundle import build, PREFLIGHT, UNKNOWN

ROOT = Path(__file__).resolve().parents[1]
EXAMPLES = ROOT / "docs/qa-agent/examples"
HEAD, BASE = "a" * 40, "b" * 40


def fixture(mutation):
    run = json.loads((EXAMPLES / "SYNTHETIC_CI.json").read_text())[0]
    s = run["summary"]
    browser = next(r for r in s["suites"] if r["network"] is not None)
    if mutation in ("failed", "nightly_fail", "environment"):
        run["conclusion"] = "failure"
        s["status"] = "FAIL"
        browser.update(status="FAIL", exit_code=124 if mutation == "environment" else 1)
    if mutation in ("nightly", "nightly_fail"):
        run["event"] = "schedule"
    if mutation == "head": s["tested_sha"] = "d" * 40
    if mutation == "base": s["base_sha"] = "d" * 40
    if mutation == "check": run["jobs"] = []
    if mutation == "preflight": s["status"] = "PREFLIGHT_PASS"
    if mutation == "receipt": s["suites"].pop()
    if mutation == "stale_receipt": browser["tested_sha"] = "d" * 40
    if mutation == "summary": run["summary"] = None
    if mutation == "network": browser["network"].pop("realPosts")
    if mutation == "live": browser["network"]["realPosts"] = 1
    if mutation == "external": browser["network"]["unexpectedExternal"] = 1
    if mutation == "artifacts": run["artifacts"][0]["expired"] = True
    if mutation == "duplicate": s["suites"].append(copy.deepcopy(browser))
    if mutation == "run_id": s["run_id"] = "999"
    if mutation == "sum": s["real_posts"] = 1
    if mutation == "docs":
        s["selected"] = PREFLIGHT.copy()
        s["suites"] = [r for r in s["suites"] if r["suite"] in PREFLIGHT]
    return run


class ReviewProtocol(unittest.TestCase):
    def test_synthetic_scenarios(self):
        cases = json.loads((EXAMPLES / "SCENARIOS.json").read_text())["cases"]
        self.assertGreaterEqual(len(cases), 20)
        for case in cases:
            with self.subTest(case=case["id"]):
                bundle = build(fixture(case["mutation"]), HEAD, BASE, case["risk"], case["context"])
                self.assertEqual(bundle["ci_readiness"], case["expected_ci_readiness"])
                self.assertIsNone(bundle["review_status"])
                self.assertFalse(bundle["merge_authorized"])
                self.assertEqual(bundle["ai_invocations"], 0)
                # Consistency check for authored reviewer examples, not an AI
                # judging their source code/images or an automated approval.
                if case["review_status"] == "PASS_RECOMMENDED":
                    self.assertFalse(case["blocking_gate"])
                    self.assertGreaterEqual(case["qa_score"], 90)
                    self.assertEqual(bundle["ci_readiness"], "READY_FOR_REVIEW")
                else:
                    self.assertTrue(case["blocking_gate"])
                if bundle["ci_readiness"] != "READY_FOR_REVIEW":
                    self.assertNotEqual(case["review_status"], "PASS_RECOMMENDED")
                if case["mutation"] == "docs":
                    self.assertEqual(bundle["live_posts"], UNKNOWN)
                    self.assertEqual(bundle["unexpected_external_requests"], UNKNOWN)
                if case["mutation"] == "network":
                    self.assertEqual(bundle["live_posts"], UNKNOWN)
                if case["context"] == "nightly":
                    self.assertEqual(bundle["nightly_action"], "RECORD_ONLY" if case["id"] == "nightly_pass_no_ai" else "SHARE_ON_REQUEST")

    def test_full_example_and_template(self):
        template = json.loads((EXAMPLES.parent / "QA_REVIEW.template.json").read_text())
        report = json.loads((EXAMPLES / "QA_REVIEW.json").read_text())
        self.assertEqual(set(template), set(report))
        self.assertTrue(report["synthetic"])
        self.assertIsNone(template["qa_score"])
        self.assertTrue(template["blocking_gate"]["blocked"])
        self.assertEqual(sum(r["maximum"] for r in report["score_breakdown"]), 100)
        self.assertEqual(sum(r["points"] for r in report["score_breakdown"]), report["qa_score"])
        for row in report["score_breakdown"]:
            self.assertTrue(row["reason"])
            self.assertLessEqual(row["points"], row["maximum"])
        self.assertFalse(any(report["form_flags"].values()))
        self.assertTrue(all(a["opened"] for a in report["opened_files_and_assets"]))
        for f in report["findings"]:
            self.assertIn(f["severity"], ("blocker", "major", "minor", "note"))
            self.assertTrue(all(k in f for k in ("file", "line", "evidence", "recommended_fix")))

    def test_no_free_text_or_unsafe_links_copied(self):
        run = fixture("none")
        marker = "PRIVATE_FIXTURE_DO_NOT_SHARE"
        run.update(html_url="https://example.invalid/" + marker, diagnostics=[marker], artifact_links=[marker])
        run["summary"]["command"] = marker
        run["summary"]["suites"][0]["log"] = marker
        run["summary"]["history"] = marker
        output = json.dumps(build(run, HEAD, BASE))
        self.assertNotIn(marker, output)
        self.assertNotIn("example.invalid", output)

    def test_bools_negative_and_missing_counters_are_not_measurements(self):
        for value in (True, False, -1, None, "0"):
            with self.subTest(value=value):
                run = fixture("none")
                next(r for r in run["summary"]["suites"] if r["network"])["network"]["realPosts"] = value
                result = build(run, HEAD, BASE)
                self.assertEqual(result["live_posts"], UNKNOWN)
                self.assertEqual(result["ci_readiness"], "INSUFFICIENT_EVIDENCE")

    def test_selection_cannot_shrink_high_risk_to_docs(self):
        self.assertEqual(build(fixture("docs"), HEAD, BASE)["ci_readiness"], "BLOCKED")
        self.assertEqual(build(fixture("docs"), HEAD, BASE, "product")["ci_readiness"], "BLOCKED")

    def test_schema_attempt_and_nonfinite_metrics(self):
        for version in (None, 2, "1", True):
            run = fixture("none")
            run["summary"]["schema_version"] = version
            self.assertEqual(build(run, HEAD, BASE)["ci_readiness"], "BLOCKED")
        run = fixture("none")
        run.pop("run_attempt")
        run["summary"].pop("run_attempt")
        self.assertEqual(build(run, HEAD, BASE)["ci_readiness"], "BLOCKED")
        run = fixture("duplicate")
        self.assertEqual(build(run, HEAD, BASE)["live_posts"], UNKNOWN)
        run = fixture("none")
        run["summary"]["suites"][0]["seconds"] = float("nan")
        self.assertEqual(build(run, HEAD, BASE)["suites"][0]["seconds"], UNKNOWN)

    def test_cli_fails_closed_and_does_not_echo_input(self):
        with tempfile.TemporaryDirectory() as tmp:
            source, out = Path(tmp) / "evidence.json", Path(tmp) / "bundle.json"
            for payload in ("PRIVATE_FIXTURE_DO_NOT_SHARE", "{}", "[null]", "[]", "[NaN]"):
                source.write_text(payload)
                result = subprocess.run([sys.executable, "-B", str(ROOT / "tools/qa_review_bundle.py"), str(source), "--run-id", "10000000001", "--head", HEAD, "--base", BASE, "--out", str(out)], capture_output=True, text=True)
                self.assertEqual(result.returncode, 1)
                self.assertEqual(json.loads(out.read_text())["ci_readiness"], "BLOCKED")
                self.assertNotIn("PRIVATE_FIXTURE_DO_NOT_SHARE", result.stdout + result.stderr + out.read_text())


if __name__ == "__main__":
    unittest.main(verbosity=2)
