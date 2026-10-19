"""Declared SYNTHETIC ONLY fixtures, generated in memory/private temporary files.

No real leads, names, emails, phones, source exports or public CSV data rows.
"""

import csv
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
import tempfile
import unittest

import leads_report as app

START = app.timestamp("2026-09-01T00:00:00Z")
END = app.timestamp("2026-10-01T00:00:00Z")
NOW = app.timestamp("2026-10-19T00:00:00Z")


def synthetic_row(number=1, **changes):
    row = dict.fromkeys(app.FIELDS, "")
    row.update(lead_id=f"SYNTH-{number:03}", received_at="2026-09-10T10:00:00Z",
               brand="WOOD U LIKE", product_id="welcome", product_name="SYNTHETIC ONLY",
               quantity="1", source_page="https://synthetic.invalid/inquiry/", status="new")
    row.update(changes)
    return row


def synthetic_dataset():
    """Ten synthetic inquiries: six WUL states plus four ASSEMBL scenarios."""
    quoted = {"quote_sent_at": "2026-09-11T10:00:00Z"}
    approved = {"approved_at": "2026-09-12T10:00:00Z"}
    lost = {"lost_at": "2026-09-15T10:00:00Z"}
    completed = {"completed_at": "2026-10-02T10:00:00Z"}
    rows = [
        synthetic_row(1, quantity="unknown", utm_source="search", utm_campaign="spring"),
        synthetic_row(2, status="awaiting_quote", utm_source="search", utm_campaign="spring"),
        synthetic_row(3, status="quote_sent", quoted_price_ils="100", **quoted, utm_source="search", utm_campaign="spring"),
        synthetic_row(4, status="approved", quoted_price_ils="200", approved_order_total_ils="180", **quoted, **approved, utm_source="instagram", utm_campaign="spring"),
        synthetic_row(5, product_id="family-sign", status="lost", quoted_price_ils="300", **quoted, **lost),
        synthetic_row(6, product_id="kitchen", status="completed", quoted_price_ils="400", approved_order_total_ils="450", **quoted, **approved, **completed, utm_source="instagram", utm_campaign="spring"),
        synthetic_row(7, status="new", utm_source="instagram", utm_campaign="studio"),
        synthetic_row(8, status="approved", approved_order_total_ils="1200", **approved),
        synthetic_row(9, status="lost", quoted_price_ils="800", approved_order_total_ils="800", **quoted, **approved, **lost, utm_source="search", utm_campaign="summer"),
        synthetic_row(10, status="completed", quoted_price_ils="500", approved_order_total_ils="600", **quoted, **approved, **completed, utm_source="search", utm_campaign="summer"),
    ]
    for row in rows[6:]:
        row.update(brand="ASSEMBL LAB", product_id="synthetic-studio-item-a" if row["lead_id"] != "SYNTH-010" else "synthetic-studio-item-b")
    return rows


class LedgerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="leads-001-synthetic-")
        self.addCleanup(self.temp.cleanup)
        self.private = Path(self.temp.name)

    def write(self, rows, name="ledger.csv", fields=app.FIELDS):
        path = self.private / name
        with path.open("w", encoding="utf-8", newline="") as stream:
            writer = csv.DictWriter(stream, fieldnames=fields)
            writer.writeheader()
            writer.writerows(rows)
        return path

    def report(self, rows):
        return app.build_report(app.read_ledger(self.write(rows)), START, END, NOW)

    def cli(self, source, output=None, **options):
        args = [sys.executable, "-B", str(app.ROOT / "tools/leads_report.py"),
                "--input", str(source), "--output", str(output or self.private / "report.json"),
                "--start", options.get("start", START.isoformat()), "--end", options.get("end", END.isoformat())]
        return subprocess.run(args, text=True, capture_output=True)

    def test_hand_calculated_totals(self):
        m = self.report(synthetic_dataset())["overall"]
        self.assertEqual((m["lead_count"], m["quote_count"], m["approved_count"], m["quoted_and_approved_count"]), (10, 6, 5, 4))
        self.assertEqual((m["quote_rate"], m["quote_to_approval_rate"], m["approved_value_ils"]), ("0.600000", "0.666667", "3230.00"))
        self.assertEqual(sum(m["status_counts"].values()), 10)

    def test_two_brands_and_all_six_states(self):
        r = self.report(synthetic_dataset())
        brands = {row["brand"]: row for row in r["by_brand"]}
        wul, studio = brands["WOOD U LIKE"], brands["ASSEMBL LAB"]
        self.assertEqual(wul["status_counts"], dict.fromkeys(app.STATUSES, 1))
        self.assertEqual((wul["lead_count"], wul["quote_rate"], wul["quote_to_approval_rate"], wul["approved_value_ils"]), (6, "0.666667", "0.500000", "630.00"))
        self.assertEqual((studio["lead_count"], studio["quote_rate"], studio["quote_to_approval_rate"], studio["approved_value_ils"]), (4, "0.500000", "1.000000", "2600.00"))

    def test_product_and_campaign_group_sums(self):
        r = self.report(synthetic_dataset())
        for field in ("by_brand", "by_product", "by_campaign"):
            self.assertEqual(sum(row["lead_count"] for row in r[field]), 10)
            self.assertEqual(sum(app.amount(row["approved_value_ils"]) for row in r[field]), 323000)
        self.assertEqual(len(r["by_product"]), 5)

    def test_missing_source_is_separate_not_inferred(self):
        r = self.report(synthetic_dataset())
        self.assertEqual(sum(row["lead_count"] for row in r["by_campaign"] if row["utm_source"] == "unknown"), 2)
        self.assertEqual(r["data_quality"]["unknown_in_cohort"]["quantity"], 1)
        partial = self.report([synthetic_row(utm_source="", utm_campaign="known-campaign")])
        self.assertEqual((partial["by_campaign"][0]["utm_source"], partial["by_campaign"][0]["utm_campaign"]), ("unknown", "known-campaign"))

    def test_approved_without_quote_excluded_from_intersection(self):
        r = self.report([synthetic_dataset()[7]])["overall"]
        self.assertEqual((r["approved_count"], r["quoted_and_approved_count"], r["quote_to_approval_rate"], r["approved_value_ils"]), (1, 0, "N/A", "1200.00"))

    def test_completed_and_lost_keep_approval_once(self):
        r = self.report([synthetic_dataset()[8], synthetic_dataset()[9]])["overall"]
        self.assertEqual((r["lead_count"], r["quote_count"], r["approved_count"], r["approved_value_ils"]), (2, 2, 2, "1400.00"))
        self.assertEqual((r["status_counts"]["lost"], r["status_counts"]["completed"]), (1, 1))

    def test_lost_without_quote_does_not_fabricate_history(self):
        r = self.report([synthetic_row(status="lost", lost_at="2026-09-15T00:00:00Z")])["overall"]
        self.assertEqual((r["quote_count"], r["approved_count"], r["quote_to_approval_rate"]), (0, 0, "N/A"))

    def test_reopened_status_keeps_old_events(self):
        row = synthetic_dataset()[4]
        row["status"] = "awaiting_quote"
        r = self.report([row])["overall"]
        self.assertEqual((r["lead_count"], r["quote_count"], r["status_counts"]["awaiting_quote"]), (1, 1, 1))

    def test_duplicate_ids_rejected_even_identical_or_across_brands(self):
        for second in (synthetic_row(), synthetic_row(brand="ASSEMBL LAB"), synthetic_row(status="awaiting_quote")):
            with self.subTest(second_status=second["status"]), self.assertRaisesRegex(app.LedgerError, "duplicate lead_id"):
                self.report([synthetic_row(), second])

    def test_missing_approved_value_is_not_zero_or_complete_total(self):
        rows = [synthetic_dataset()[3], synthetic_dataset()[5]]
        rows[0]["approved_order_total_ils"] = "unknown"
        m = self.report(rows)["overall"]
        self.assertEqual((m["approved_count"], m["approved_value_ils"], m["known_approved_value_ils"], m["approved_value_missing_count"]), (2, "N/A", "450.00", 1))

    def test_completed_missing_approval_is_flagged_not_counted(self):
        row = synthetic_row(status="completed", completed_at="2026-10-02T00:00:00Z")
        r = self.report([row])
        self.assertEqual(r["data_quality"]["completed_without_recorded_approval"], 1)
        self.assertEqual(r["overall"]["approved_count"], 0)

    def test_zero_price_is_distinct_from_unknown(self):
        row = synthetic_dataset()[3]
        row["approved_order_total_ils"] = "0"
        m = self.report([row])["overall"]
        self.assertEqual((m["approved_value_ils"], m["approved_value_missing_count"]), ("0.00", 0))

    def test_exact_cents_no_float_rounding(self):
        a, b = synthetic_dataset()[3], synthetic_dataset()[5]
        a["approved_order_total_ils"], b["approved_order_total_ils"] = "0.10", "0.20"
        self.assertEqual(self.report([a, b])["overall"]["approved_value_ils"], "0.30")

    def test_invalid_money_is_rejected(self):
        for value in ("-1", "NaN", "Infinity", "1e3", "1,000", "1.001", "₪12"):
            with self.subTest(value=value), self.assertRaises(app.LedgerError):
                self.report([synthetic_row(quoted_price_ils=value)])

    def test_unknown_received_at_excluded_explicitly(self):
        r = self.report([synthetic_row(received_at="unknown"), synthetic_row(2)])
        self.assertEqual((r["input_unique_leads"], r["excluded_unknown_received_at"], r["overall"]["lead_count"]), (2, 1, 1))

    def test_half_open_cohort_and_offset_boundaries(self):
        rows = [synthetic_row(1, received_at="2026-09-01T00:00:00Z"),
                synthetic_row(2, received_at="2026-10-01T02:00:00+03:00"),
                synthetic_row(3, received_at="2026-10-01T03:00:00+03:00"),
                synthetic_row(4, received_at="2026-08-31T23:59:59Z")]
        r = self.report(rows)
        self.assertEqual((r["overall"]["lead_count"], r["excluded_outside_cohort"]), (2, 2))

    def test_events_after_cohort_end_are_cumulative(self):
        row = synthetic_dataset()[5]
        row["approved_at"] = "2026-10-01T10:00:00Z"
        r = self.report([row])["overall"]
        self.assertEqual((r["approved_count"], r["approved_value_ils"]), (1, "450.00"))

    def test_empty_cohort_and_header_only_template(self):
        for rows in ([], [synthetic_row(received_at="unknown")], [synthetic_row(received_at="2026-08-01T00:00:00Z")]):
            with self.subTest(rows=len(rows)):
                m = self.report(rows)["overall"]
                self.assertEqual((m["lead_count"], m["quote_rate"], m["quote_to_approval_rate"]), (0, "N/A", "N/A"))

    def test_invalid_status_and_missing_identifier(self):
        for change in ({"status": "paid"}, {"status": "unknown"}, {"lead_id": "unknown"}, {"lead_id": ""}):
            with self.subTest(change=change), self.assertRaises(app.LedgerError):
                self.report([synthetic_row(**change)])

    def test_current_status_requires_its_event(self):
        for status in ("quote_sent", "approved", "completed", "lost"):
            with self.subTest(status=status), self.assertRaises(app.LedgerError):
                self.report([synthetic_row(status=status)])

    def test_inconsistent_chronology_and_unbacked_prices(self):
        for change in ({"quote_sent_at": "2026-09-09T00:00:00Z"},
                       {"quote_sent_at": "2026-09-14T00:00:00Z", "approved_at": "2026-09-12T00:00:00Z"},
                       {"approved_at": "2026-09-14T00:00:00Z", "completed_at": "2026-09-12T00:00:00Z"},
                       {"quoted_price_ils": "10"}, {"approved_order_total_ils": "10"}):
            with self.subTest(fields=list(change)), self.assertRaises(app.LedgerError):
                self.report([synthetic_row(**change)])

    def test_invalid_timestamps_and_future_events(self):
        for value in ("2026-09-01", "2026-09-01T00:00:00", "2026-02-30T00:00:00Z", "2026-09-01T00:00:00+25:00", "2027-01-01T00:00:00Z"):
            with self.subTest(value=value), self.assertRaises(app.LedgerError):
                self.report([synthetic_row(received_at=value)])

    def test_invalid_or_empty_cohort_window(self):
        for start, end in ((START, START), (END, START)):
            with self.subTest(start=start), self.assertRaises(app.LedgerError):
                app.build_report([], start, end, NOW)

    def test_unknown_labels_and_safe_source_page(self):
        r = self.report([synthetic_row(brand="", product_id="", source_page="unknown")])
        self.assertEqual((r["by_brand"][0]["brand"], r["by_product"][0]["product_id"]), ("unknown", "unknown"))
        for value in ("https://synthetic.invalid/p?q=private", "https://synthetic.invalid/p#private", "https://synthetic.invalid/p?", "https://synthetic.invalid/p#", "https://:@synthetic.invalid/p", "not-a-url"):
            with self.subTest(value=value), self.assertRaises(app.LedgerError):
                self.report([synthetic_row(source_page=value)])

    def test_invalid_campaign_and_quantity(self):
        for change in ({"utm_source": "="}, {"utm_campaign": "x" * 81}, {"utm_source": "123456789"}, {"quantity": "0"}, {"quantity": "1.5"}, {"brand": "PRIVATE_SENTINEL"}):
            with self.subTest(fields=list(change)), self.assertRaises(app.LedgerError):
                self.report([synthetic_row(**change)])

    def test_headers_duplicate_columns_extra_pii_columns_and_short_row(self):
        for content in ("", ",".join(app.FIELDS + ["name"]) + "\n", ",".join(app.FIELDS[:-1] + ["lead_id"]) + "\n", ",".join(app.FIELDS) + "\nshort,row\n"):
            path = self.private / "invalid.csv"
            path.write_text(content)
            with self.subTest(length=len(content)), self.assertRaises(app.LedgerError):
                app.read_ledger(path)

    def test_bom_and_reordered_columns(self):
        source = self.write([synthetic_row()], fields=list(reversed(app.FIELDS)))
        source.write_bytes(b"\xef\xbb\xbf" + source.read_bytes())
        self.assertEqual(len(app.read_ledger(source)), 1)

    def test_private_fields_never_appear_in_report_or_errors(self):
        row = synthetic_row(lead_id="PRIVATE_SENTINEL_ID", product_name="PRIVATE_SENTINEL_NAME", internal_notes="PRIVATE_SENTINEL_NOTES")
        output = json.dumps(self.report([row]))
        for value in (row["lead_id"], row["product_name"], row["internal_notes"], row["source_page"]):
            self.assertNotIn(value, output)
        source = self.write([synthetic_row(brand="PRIVATE_SENTINEL_INVALID")])
        result = self.cli(source)
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn("PRIVATE_SENTINEL", result.stdout + result.stderr)
        self.assertFalse((self.private / "report.json").exists())

    def test_cli_success_owner_only_permissions_and_no_overwrite(self):
        source = self.write(synthetic_dataset())
        result = self.cli(source)
        self.assertEqual(result.returncode, 0, result.stderr)
        output = self.private / "report.json"
        self.assertEqual(json.loads(output.read_text())["overall"]["approved_value_ils"], "3230.00")
        if os.name == "posix":
            self.assertEqual(stat.S_IMODE(output.stat().st_mode), 0o600)
        before = output.read_bytes()
        self.assertNotEqual(self.cli(source).returncode, 0)
        self.assertEqual(output.read_bytes(), before)
        self.assertNotIn("SYNTH-", result.stdout + result.stderr)

    def test_cli_refuses_repository_input_output_and_symlink_targets(self):
        template = app.ROOT / "docs/leads/templates/lead_ledger.csv"
        self.assertNotEqual(self.cli(template).returncode, 0)
        source = self.write([synthetic_row()])
        self.assertNotEqual(self.cli(source, app.ROOT / "private-report.json").returncode, 0)
        linked = self.private / "repo-link"
        linked.symlink_to(app.ROOT, target_is_directory=True)
        self.assertNotEqual(self.cli(source, linked / "private-report.json").returncode, 0)
        other = self.private / "other-worktree"
        other.mkdir()
        (other / ".git").write_text("gitdir: /synthetic-only-git-pointer\n")
        self.assertNotEqual(self.cli(source, other / "report.json").returncode, 0)
        self.assertFalse((app.ROOT / "private-report.json").exists())

    def test_empty_git_placeholder_is_not_a_repository(self):
        (self.private / ".git").mkdir()
        self.assertEqual(self.cli(self.write([synthetic_row()])).returncode, 0)

    def test_git_directory_and_bare_repository_are_rejected(self):
        for name, marker_name in (("checkout", ".git"), ("bare", "")):
            folder = self.private / name
            marker = folder / marker_name
            marker.mkdir(parents=True)
            (marker / "HEAD").write_text("ref: refs/heads/main\n")
            (marker / "objects").mkdir()
            (marker / "refs").mkdir()
            with self.subTest(kind=name), self.assertRaises(app.LedgerError):
                app.private_path(folder / "report.json")

    def test_cli_has_no_network_attempts(self):
        source = self.write(synthetic_dataset())
        script = app.ROOT / "tools/leads_report.py"
        wrapper = "\n".join([
            "import sys, runpy",
            "def guard(event, args):",
            "    if event.startswith(('socket.', 'http.client.')): raise RuntimeError('network forbidden')",
            "sys.addaudithook(guard)",
            "sys.argv = sys.argv[1:]",
            "runpy.run_path(sys.argv[0], run_name='__main__')",
        ])
        result = subprocess.run([sys.executable, "-B", "-c", wrapper, str(script),
                                 "--input", str(source), "--output", str(self.private / "offline.json"),
                                 "--start", START.isoformat(), "--end", END.isoformat()], text=True, capture_output=True)
        self.assertEqual(result.returncode, 0, result.stderr)


if __name__ == "__main__":
    unittest.main(verbosity=2)
