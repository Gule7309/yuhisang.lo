# Phase 10 QA report — pending independent CI/browser verification

**Date:** 2026-11-06  
**Branch:** `feature/phase10-editorial-archives-20261106`

## Implemented
- Research archive questions, approach and truthful publication stages; real source buttons only when permitted by validated URLs and ownership.
- Bilingual projects archive categories determined from existing CMS tags.
- Optional keyboard-operated button filters, URL state, accessible selected-state semantics, no-JS fallbacks.
- Separate archive-specific CSS, no changed detail pages/CMS records.

## Evidence / status
- GitHub source changes committed to a **feature branch**, not published to main.
- Python compilation: **NOT YET VERIFIED**.
- Unit regression tests: **NOT YET VERIFIED**.
- Chromium/Playwright visual QA 1280/390/320, EN/zh, keyboard and browser history: **NOT YET VERIFIED**.
- Screen-reader audit and authenticated CMS editing: **NOT TESTED**.
- Pixel-match benchmark: **NOT COMPARABLE** (no exact approved reference screenshot).

## Approval
**BLOCKED for merge/deploy** until PR Actions tests and real screenshot inspection pass. The existing archive and CMS content remain the source of truth.
