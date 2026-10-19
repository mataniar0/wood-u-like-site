"""Behavioral tests for risk classification, safety and the evidence gate."""
import copy
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import qa_pipeline as q
from qa_static import check, privacy_text

CATALOG = json.loads(q.CATALOG.read_text())


class SelectionTests(unittest.TestCase):
    def selection(self, path, status="M", **kwargs):
        return q.select([{"path": path, "status": status}], CATALOG, **kwargs)

    def test_docs_leads_no_browser_but_all_safety(self):
        for name in ("README.md", "docs/leads/NOTES.md", "tools/leads_report.py", "tools/test_leads_report.py"):
            with self.subTest(name=name):
                s = self.selection(name)
                self.assertEqual(s["profile"], "docs")
                self.assertEqual(s["selected"], q.PREFLIGHT)
                self.assertFalse(s["shards"])

    def test_product_images_target_actual_ids(self):
        for p in CATALOG["products"]:
            for name in [p["images"][0]["src"], p["route"] + "index.html", f"qa/assets/{p['product_id']}.json"]:
                with self.subTest(name=name):
                    s = self.selection(name)
                    self.assertEqual(s["profile"], "product")
                    self.assertIn(p["product_id"], s["selected_products"])
                    self.assertNotIn("inquiry", s["selected"])
                    self.assertIn("static", s["selected"])

    def test_collection_selects_every_card(self):
        s = self.selection("collections/home-decor/index.html")
        self.assertEqual(len(s["selected_products"]), 5)
        self.assertEqual(s["profile"], "product")

    def test_sensitive_changes_full_before_merge(self):
        for name in ("inquiry/inquiry.js", "inquiry/contact-config.js", "assets/js/attribution.js", "assets/js/language.js", "assets/css/styles.css", "qa/catalog.json", "qa/runtime-contract.json"):
            with self.subTest(name=name):
                s = self.selection(name)
                self.assertEqual(s["profile"], "full")
                self.assertTrue(set(("inquiry", "attribution", "privacy")).issubset(s["selected"]))

    def test_unknown_deleted_renamed_and_new_tests_fail_closed(self):
        for name, status in (("surprise.bin", "A"), ("tools/test_leads_report.py", "A"), ("tools/new-test.cjs", "A"), ("tools/check-language.cjs", "D"), ("docs/new.py", "A"), ("docs/note.md", "R100"), ("docs/../bypass.md", "M")):
            with self.subTest(name=name, status=status):
                s = self.selection(name, status)
                self.assertEqual(s["profile"], "full")
                self.assertTrue(s["manual_review_required"])

    def test_unknown_branch(self):
        self.assertEqual(self.selection("README.md", branch="surprise/qa-bypass")["profile"], "full")
        self.assertEqual(self.selection("README.md", branch="feature/wul-023-qa-docs")["profile"], "docs")

    def test_diff_failure_and_manual_full(self):
        self.assertEqual(q.select([], CATALOG, diff_error=True)["profile"], "full")
        self.assertEqual(q.select([], CATALOG, mode="full")["profile"], "full")

    def test_dynamic_catalog_new_product_is_selected(self):
        catalog = copy.deepcopy(CATALOG)
        p = copy.deepcopy(catalog["products"][0]); p["product_id"] = "future-product"; p["route"] = "products/future-product/"
        catalog["products"].append(p)
        s = q.select([{"path": "products/future-product/index.html", "status": "A"}], catalog)
        self.assertIn("future-product", s["selected_products"])


class SafetyTests(unittest.TestCase):
    def test_endpoint_and_all_three_flags_cannot_pass_static(self):
        original = (q.ROOT / "inquiry/contact-config.js").read_text()
        mutations = [original.replace(flag + ": false", flag + ": true") for flag in ("formDestinationApproved", "privacyApproved", "contactDetailsApproved")]
        import re
        mutations.append(re.sub(r'formEndpoint: "[^"]+"', 'formEndpoint: "https://example.invalid/f/blocked"', original))
        for text in mutations:
            with self.subTest(mutation_hash=__import__("hashlib").sha256(text.encode()).hexdigest()):
                self.assertNotEqual(text, original)
                with tempfile.TemporaryDirectory() as tmp:
                    root = Path(tmp); (root / "qa").mkdir(); (root / "inquiry").mkdir()
                    (root / "qa/runtime-contract.json").write_bytes((q.ROOT / "qa/runtime-contract.json").read_bytes())
                    (root / "inquiry/contact-config.js").write_text(text)
                    with self.assertRaisesRegex(AssertionError, "contact config"):
                        check(root=root)

    def test_secret_and_nonfixture_contact_rejected(self):
        for value in ("ghp_" + "x" * 30, "customer" + "@" + "private.test"):
            with self.subTest(kind=value[:3]):
                with self.assertRaises(AssertionError): privacy_text(value)
        privacy_text("fixture@example.invalid")

    def test_current_catalog_and_registration_inventory(self):
        self.assertEqual(len(CATALOG["products"]), 9)
        self.assertEqual(len(CATALOG["collections"]), 4)
        entries = {path.name for path in q.ROOT.glob("tools/check-*.cjs")}
        registered = {Path(command[1]).name for command in q.SUITES.values() if command[0] == "node"}
        # Shared library is invoked by all three identity entrypoints; reference
        # snapshot tool describes the retired seven-product inquiry and is archived.
        self.assertEqual(entries - registered, {"check-product-identity.cjs", "check-reference-inquiry.cjs"})


class GateTests(unittest.TestCase):
    def setUp(self):
        self.plan = {"selected": ["static"], "tested_sha": "a" * 40, "source_fingerprint": "b" * 64}
        self.receipt = {"suite": "static", "status": "PASS", "exit_code": 0, "tested_sha": "a" * 40, "source_fingerprint": "b" * 64, "seconds": 1, "retry_count": 0}

    def test_exact_complete_receipts_pass(self):
        self.assertEqual(q.summary(self.plan, [self.receipt], 2)["status"], "PASS")

    def test_missing_duplicate_wrong_sha_failed_exit_and_unexpected_red(self):
        candidates = [[], [self.receipt, self.receipt]]
        for mutation in ({"tested_sha": "c" * 40}, {"source_fingerprint": "x"}, {"exit_code": 1}, {"status": "FAIL"}, {"suite": "surprise"}):
            candidates.append([{**self.receipt, **mutation}])
        for receipts in candidates:
            with self.subTest(receipts=receipts):
                self.assertEqual(q.summary(self.plan, receipts, 2)["status"], "FAIL")

    def test_nonzero_and_timeout_are_red_no_retry(self):
        commands = {"unit-fail": ["python3", "-c", "raise SystemExit(7)"], "unit-timeout": ["python3", "-c", "import time; time.sleep(30)"]}
        with patch.dict(q.SUITES, commands), tempfile.TemporaryDirectory() as tmp:
            for name in commands:
                r = q.execute(name, Path(tmp), "a" * 40, "http://127.0.0.1:8000/wood-u-like-site/", self.plan, timeout=.1)
                self.assertEqual(r["status"], "FAIL"); self.assertEqual(r["retry_count"], 0)
                self.assertEqual(r["exit_code"], 7 if name == "unit-fail" else 124)
                self.assertTrue((Path(tmp) / name / "suite.log").is_file())

    def test_history_is_explicit_and_never_replaces_gate(self):
        from qa_history import compare
        current = {**q.summary(self.plan, [self.receipt], 2), "profile": "full", "event": "workflow_dispatch", "run_id": "new", "product_count": 9}
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "prior.json"
            self.assertEqual(compare(current, path)["status"], "NO_PREVIOUS_SUCCESS")
            path.write_text(json.dumps({**current, "run_id": "old"}))
            self.assertTrue(compare(current, path)["same_sha"])
            self.assertEqual(compare(current, path)["previous_run_id"], "old")
            path.write_text(json.dumps({**current, "status": "FAIL"}))
            self.assertEqual(compare(current, path)["status"], "INVALID_OR_DIFFERENT_EVENT_HISTORY")


if __name__ == "__main__":
    unittest.main(verbosity=2)
