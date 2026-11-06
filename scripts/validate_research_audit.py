"""Fail CI if the pinned When2ask synthetic evidence disappears or changes."""
from __future__ import annotations

import json
from pathlib import Path

from build_research_pages import ROOT, load_repro_audit


def main() -> None:
    works = json.loads((ROOT / "content/works.json").read_text(encoding="utf-8"))
    matches = [item for item in works if item.get("slug") == "when2ask"]
    if len(matches) != 1 or matches[0].get("category") != "research":
        raise SystemExit("Expected exactly one When2ask research entry")
    item = matches[0]
    data = load_repro_audit(item)
    if data is None:
        raise SystemExit("Missing or invalid signed-source audit; refusing misleading site output")
    if item.get("publication_status") != "work_in_progress":
        raise SystemExit("Synthetic replay cannot be advertised as publication")
    if data["single_decision"]["action"] != "ask":
        raise SystemExit("Unexpected synthetic decision: source evidence changed")
    checks = data["candidate_set_checks"]
    if [(r["candidate_count"], r["ground_truth_compatible_candidate_present"])
            for r in checks] != [(1, True), (1, True), (1, False), (2, True)]:
        raise SystemExit("Synthetic intervention evidence changed without scientific review")
    print(json.dumps({
        "audit": item["research_repro_audit_file"],
        "sha256": item["research_repro_audit_sha256"],
        "source_commit": data["source"]["commit_sha"],
        "synthetic_cases": 1,
        "benchmark_cases": data["benchmark_items_evaluated"],
        "model_calls": data["model_calls"],
        "status": "PASS",
    }, sort_keys=True))


if __name__ == "__main__":
    main()
