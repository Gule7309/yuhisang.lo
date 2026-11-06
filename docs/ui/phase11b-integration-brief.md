# Phase 11B — Source-pinned When2ask synthetic evidence

**Date:** 2026-11-06. **Base:** merged Phase 11A on main, retaining Phase 10 editorial research archives.

## Exact scope
- Integrate the previously checked-in fixed-response `synthetic_mechanism_audit_v1` evidence from the independent When2ask reconstruction.
- Source pinned to `Gule7309/When2ask@ab0cd26da17ff63d300080811500fe87fe0f95a6`, [source Actions run 41459465082](https://github.com/Gule7309/When2ask/actions/runs/41459465082). The original recorded audit is a single synthetic mechanism plumbing example, **not empirical work**.
- Preserve source JSON byte-for-byte at `content/experiments/when2ask_synthetic_audit.json`. CMS keeps SHA-256 + source-run IDs and editor-authored interpretation separate.
- The generator validates file SHA, source identifiers, types, nonempirical flags and all four intervention records. On mismatch it fails closed, hiding the panel and TOC entry.
- Display is restricted to the When2ask research details page. No benchmark results, effect sizes, real model calls, real tool successes, publication claims or accuracy scores may be inferred.
- Include bilingual captions, source links and a local archived JSON snapshot, while retaining Phase 10's question/method/stage editorial archive and Phase 11A homepage.

## Design / QA
- Preserve academic white/navy design; compact responsive stat+conditions table, readable at 320/390/1280 widths.
- Ensure keyboard/TOC navigation, escape and accessibility labels.
- CI: regenerate all bilingual pages, source JSON integrity checks, negative tests for invalid SHA/missing/empirical JSON, real Chromium evidence screenshots and Phase 10/11A regressions.
- No main-branch edits or deployment. Keep PR draft pending visual and owner review.

## Limitations
The source audit explicitly records 0 benchmark items, 0 LLM calls and 0 real tool executions. It cannot establish a research hypothesis. The original JSON source and CI claims are inherited from the earlier reviewed draft; this integration does not independently rerun the upstream model or benchmark.
