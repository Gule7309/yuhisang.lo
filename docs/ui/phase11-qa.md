# Phase 11 — Mobile homepage integration QA

Date: 2026-11-06 (Asia/Taipei)

**GitHub CI**: [Run 42180234088](https://github.com/Gule7309/yuhisang.lo/actions/runs/42180234088) — **SUCCESS** at `b67c3d4013b277076d27d1867dd1e652f7d39535`.

## Implemented on PR #9
- Integration of Phase 9 homepage mobile Sections/選單 control, localized accessibility states, loading/error recovery and source-derived compact featured work index.
- Phase 10 research & projects archive generator, bilingual filtered project browser and styles intentionally preserved.
- Both build/deploy and PR check workflows regenerate compact homepage JSON before tests; CI retains archive verification and adds homepage Chromium QA.

## Verified
- **PASS**: Node test suite including homepage-content derivation and mobile nav behavior.
- **PASS**: Python project/research generator tests, CMS collection validation, media checks and localized routes.
- **PASS**: Real Chromium existing PixelFit gallery, engineering detail, implementation traces and Phase 10 archive filters.
- **PASS**: New homepage browser scenarios EN/zh and 1280 / 390 / 320 widths, mobile navigation focus/ESC/outside click, missing profile recovery, functional research/projects links and payload size checks. Refer to the run's `research-page-preview` artifact for screenshots and test JSON.
- **Regression scope**: Does not alter CMS research/project source content or either archive generator.

## Pending
- Manual visual review of CI screenshots; no pixel reference approved for exact match.
- Manual screen-reader testing and authenticated CMS editorial testing.
- PR #6 synthetic When2ask reproducibility evidence is NOT included.
- This Draft PR was **not merged** or deployed to production.

## Status
**CI verified; ready for owner review**, not authorization to merge or deploy.
