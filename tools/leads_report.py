"""LEADS-001: offline aggregates from a private, manually maintained CSV.

No network, account, third-party dependency, or public-site integration.
Input and output must be outside every Git worktree; never print row values.
"""

import argparse
from collections import defaultdict
import csv
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
import json
import os
from pathlib import Path
import re
import sys
from urllib.parse import urlsplit

FIELDS = (
    "lead_id received_at brand product_id product_name quantity utm_source "
    "utm_campaign source_page status quoted_price_ils quote_sent_at approved_at "
    "approved_order_total_ils completed_at lost_at internal_notes"
).split()
STATUSES = ("new", "awaiting_quote", "quote_sent", "approved", "lost", "completed")
BRANDS = ("WOOD U LIKE", "ASSEMBL LAB", "unknown")
DATES = ("received_at", "quote_sent_at", "approved_at", "completed_at", "lost_at")
MONEY = ("quoted_price_ils", "approved_order_total_ils")
ROOT = Path(__file__).resolve().parents[1]


class LedgerError(ValueError):
    """Messages contain field names/row numbers, never private values."""


def missing(value):
    return value.strip().lower() in ("", "unknown")


def timestamp(value):
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})", value):
        raise LedgerError("timestamp requires ISO 8601 with explicit offset")
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc)
    except ValueError:
        raise LedgerError("invalid timestamp") from None


def amount(value):
    if missing(value):
        return None
    if not re.fullmatch(r"(?:0|[1-9]\d*)(?:\.\d{1,2})?", value):
        raise LedgerError("money requires nonnegative ILS with at most two decimal places")
    # Exact integer cents; avoid binary floating point and Decimal context limits.
    whole, _, fraction = value.partition(".")
    return int(whole) * 100 + int((fraction + "00")[:2])


def money_string(cents):
    return f"{cents // 100}.{cents % 100:02d}"


def label(value, field):
    if missing(value):
        return "unknown"
    pattern = r"[a-z0-9][a-z0-9-]{0,79}" if field == "product_id" else r"[A-Za-z0-9._~-]{1,80}"
    if not re.fullmatch(pattern, value) or (
        re.fullmatch(r"[0-9._~-]+", value) and len(re.sub(r"\D", "", value)) >= 7
    ):
        raise LedgerError(f"invalid {field} label; do not infer a replacement")
    return value


def validate(raw, row_number):
    row = {key: value.strip() for key, value in raw.items()}
    try:
        if not re.fullmatch(r"[A-Za-z0-9_-]{1,80}", row["lead_id"]) or missing(row["lead_id"]):
            raise LedgerError("lead_id requires an opaque unique identifier")
        row["brand"] = "unknown" if missing(row["brand"]) else row["brand"]
        if row["brand"] not in BRANDS:
            raise LedgerError("brand must match the agreed contract or unknown")
        if row["status"] not in STATUSES:
            raise LedgerError("status must be exactly one of the six agreed states")
        for field in ("product_id", "utm_source", "utm_campaign"):
            row[field] = label(row[field], field)
        if not missing(row["quantity"]) and not re.fullmatch(r"[1-9]\d*", row["quantity"]):
            raise LedgerError("quantity must be a positive integer or unknown")
        if not missing(row["source_page"]):
            try:
                url = urlsplit(row["source_page"])
                if url.scheme not in ("http", "https") or not url.hostname or "?" in row["source_page"] or "#" in row["source_page"] or "@" in url.netloc:
                    raise ValueError
            except ValueError:
                raise LedgerError("source_page requires origin + pathname only") from None
        for field in DATES:
            row[field] = None if missing(row[field]) else timestamp(row[field])
        for field in MONEY:
            row[field] = amount(row[field])
        required = {"quote_sent": "quote_sent_at", "approved": "approved_at", "completed": "completed_at", "lost": "lost_at"}
        if row["status"] in required and row[required[row["status"]]] is None:
            raise LedgerError("current status requires its event timestamp; resolve missing evidence privately")
        for event in DATES[1:]:
            if row["received_at"] and row[event] and row[event] < row["received_at"]:
                raise LedgerError("event timestamp precedes received_at")
        for earlier, later in (("quote_sent_at", "approved_at"), ("approved_at", "completed_at")):
            if row[earlier] and row[later] and row[later] < row[earlier]:
                raise LedgerError("quote/approval/completion chronology is inconsistent")
        for price, event in (("quoted_price_ils", "quote_sent_at"), ("approved_order_total_ils", "approved_at")):
            if row[price] is not None and row[event] is None:
                raise LedgerError("a recorded price requires the corresponding event timestamp")
    except LedgerError as error:
        raise LedgerError(f"row {row_number}: {error}") from None
    return row


def read_ledger(path):
    rows, seen = [], set()
    with path.open(encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        if reader.fieldnames is None or len(reader.fieldnames) != len(FIELDS) or set(reader.fieldnames) != set(FIELDS):
            raise LedgerError("CSV must have exactly the template columns, without duplicate headers")
        for number, raw in enumerate(reader, start=2):
            if None in raw or any(value is None for value in raw.values()):
                raise LedgerError(f"row {number}: column count does not match the template")
            row = validate(raw, number)
            if row["lead_id"] in seen:
                raise LedgerError(f"row {number}: duplicate lead_id; reconcile privately before reporting")
            seen.add(row["lead_id"])
            rows.append(row)
    return rows


def rate(numerator, denominator):
    if denominator == 0:
        return "N/A"
    return str((Decimal(numerator) / Decimal(denominator)).quantize(Decimal("0.000001"), rounding=ROUND_HALF_UP))


def metrics(rows):
    quoted = [row for row in rows if row["quote_sent_at"] is not None]
    approved = [row for row in rows if row["approved_at"] is not None]
    missing_value = sum(row["approved_order_total_ils"] is None for row in approved)
    known_value = sum(row["approved_order_total_ils"] or 0 for row in approved)
    intersection = sum(row["approved_at"] is not None for row in quoted)
    return {
        "lead_count": len(rows), "quote_count": len(quoted), "approved_count": len(approved),
        "quoted_and_approved_count": intersection,
        "quote_rate": rate(len(quoted), len(rows)),
        "quote_to_approval_rate": rate(intersection, len(quoted)),
        "approved_value_ils": "N/A" if missing_value else money_string(known_value),
        "known_approved_value_ils": money_string(known_value),
        "approved_value_missing_count": missing_value,
        "status_counts": {status: sum(row["status"] == status for row in rows) for status in STATUSES},
    }


def group(rows, fields):
    buckets = defaultdict(list)
    for row in rows:
        buckets[tuple(row[field] for field in fields)].append(row)
    return [{**dict(zip(fields, key)), **metrics(values)} for key, values in sorted(buckets.items())]


def build_report(rows, start, end, measured_at):
    if start >= end:
        raise LedgerError("cohort start must be before its exclusive end")
    if any(value and value > measured_at for row in rows for field in DATES if (value := row[field])):
        raise LedgerError("ledger contains future events; correct the private record or measurement time")
    selected = [row for row in rows if row["received_at"] and start <= row["received_at"] < end]
    unknown_time = sum(row["received_at"] is None for row in rows)
    return {
        "schema_version": 1,
        "measured_at": measured_at.isoformat(),
        "cohort": {"field": "received_at", "start_inclusive": start.isoformat(), "end_exclusive": end.isoformat(),
                   "progress_events": "All recorded events through measured_at, including after cohort end; not a historical status reconstruction"},
        "input_unique_leads": len(rows),
        "excluded_unknown_received_at": unknown_time,
        "excluded_outside_cohort": len(rows) - len(selected) - unknown_time,
        "overall": metrics(selected),
        "by_brand": group(selected, ("brand",)),
        "by_product": group(selected, ("brand", "product_id")),
        "by_campaign": group(selected, ("brand", "utm_source", "utm_campaign")),
        "data_quality": {
            "unknown_in_cohort": {field: sum(row[field] == "unknown" or (isinstance(row[field], str) and missing(row[field])) for row in selected)
                                  for field in ("brand", "product_id", "quantity", "utm_source", "utm_campaign", "source_page")},
            "quoted_price_missing": sum(row["quote_sent_at"] is not None and row["quoted_price_ils"] is None for row in selected),
            "completed_without_recorded_approval": sum(row["completed_at"] is not None and row["approved_at"] is None for row in selected),
        },
        "meaning": "Recorded inquiry demand and approved order value, not traffic conversion, payments, net revenue or automatic CRM sync. Keep this output private.",
    }


def private_path(value):
    path = Path(value).expanduser().resolve()
    def repository(ancestor):
        marker = ancestor / ".git"
        if marker.is_file():
            # Linked worktrees use a gitdir pointer, not a .git directory.
            try:
                return marker.read_text(encoding="utf-8").startswith("gitdir:")
            except (OSError, UnicodeError):
                return True
        # Empty sandbox placeholder directories are not Git repositories.
        return ((marker / "HEAD").is_file() and (marker / "objects").is_dir()) or (
            (ancestor / "HEAD").is_file() and (ancestor / "objects").is_dir() and (ancestor / "refs").is_dir()
        )
    if path == ROOT or ROOT in path.parents or any(repository(ancestor) for ancestor in path.parents):
        raise LedgerError("input/output must be outside all Git worktrees, including symlink targets")
    return path


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, help="private ledger CSV outside Git")
    parser.add_argument("--output", required=True, help="new private JSON file outside Git; never overwritten")
    parser.add_argument("--start", required=True, help="inclusive received_at ISO 8601 timestamp with offset")
    parser.add_argument("--end", required=True, help="exclusive received_at ISO 8601 timestamp with offset")
    args = parser.parse_args(argv)
    try:
        source, destination = private_path(args.input), private_path(args.output)
        rows = read_ledger(source)
        report = build_report(rows, timestamp(args.start), timestamp(args.end), datetime.now(timezone.utc))
        payload = (json.dumps(report, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
        descriptor = os.open(destination, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(descriptor, "wb") as stream:
            stream.write(payload)
        print("PASS: private aggregate written; no lead rows printed")
        return 0
    except (LedgerError, OSError, UnicodeError, csv.Error, ValueError):
        # Diagnostics contain no filenames, CSV values, contacts or notes.
        error = sys.exc_info()[1]
        print(f"ERROR: {error}" if isinstance(error, LedgerError) else "ERROR: private file could not be read/written; check encoding, permissions and unused output path", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
