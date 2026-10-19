"""Advisory full-run history; never substitutes for receipts from this SHA."""
import json
from pathlib import Path


def compare(current, previous_path):
    path = Path(previous_path)
    if not path.is_file():
        return {"status": "NO_PREVIOUS_SUCCESS", "comparison_is_advisory": True}
    try:
        old = json.loads(path.read_text())
        assert old["status"] == "PASS" and old["profile"] == "full"
        assert old["event"] == current["event"]
        return {"status": "COMPARED", "comparison_is_advisory": True,
                "previous_sha": old["tested_sha"], "previous_run_id": old["run_id"],
                "same_sha": old["tested_sha"] == current["tested_sha"],
                "wall_seconds_delta": round(current["wall_seconds"] - old["wall_seconds"], 3),
                "screenshots_delta": current.get("screenshots", 0) - old.get("screenshots", 0),
                "new_failed_suites": sorted(set(current["failed"]) - set(old["failed"])),
                "product_count_delta": current["product_count"] - old["product_count"],
                "suite_count_delta": len(current["suites"]) - len(old["suites"]),
                "threshold_policy": "Existing assertions unchanged; timing deltas alone do not make a failing run green"}
    except (ValueError, KeyError, AssertionError):
        return {"status": "INVALID_OR_DIFFERENT_EVENT_HISTORY", "comparison_is_advisory": True}
