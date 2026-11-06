# Phase 10 QA — Editorial archives

**Date:** 2026-11-06 (Asia/Taipei)  
**Branch/PR:** `feature/phase10-editorial-archives-20261106` · [Draft PR #8](https://github.com/Gule7309/yuhisang.lo/pull/8)  
**Evidence:** [GitHub Actions run #42170610683](https://github.com/Gule7309/yuhisang.lo/actions/runs/42170610683) · **PASS** at commit `ec60f725988a6841df173643bce65e351f466fa9`

## Implemented
- Research archive foregrounds question, approach, year, accurate publication status and safe code/paper links.
- Projects archive has bilingual categories derived from CMS tags and keyboard-accessible filter buttons.
- Archive controls are progressive enhancement; no-JS visitors see all projects. Language routes remain independent and source data is unchanged.
- Existing academic typography and production design system retained.

## Verified in GitHub Actions
- PASS: Python compilation and generated bilingual projects/research HTML, all Python generator tests including `tests/test_archive_phase10.py`.
- PASS: JavaScript regression tests, media integrity, CMS schema check, localized routes and sitemap.
- PASS: Existing PixelFit image screenshots, rendered engineering case studies and pinned source trace tests.
- PASS: Real Chromium new Phase 10 archive checks at 1280×900 English, 390×844 zh-Hant and 320×700 zh-Hant; research question and disclosure present, both archives render, no document horizontal overflow.
- PASS: Keyboard Enter on Agent filter, selected `aria-pressed`, narrower visible card set, `?category=agent` URL state, reset to All.
- Captures: `phase10-research-en-1280.png`, `phase10-projects-en-1280.png`, `phase10-research-zh-390.png`, `phase10-projects-zh-390.png`, `phase10-research-zh-320.png`, `phase10-projects-zh-320.png`; `phase10-archives-qa.json` in the run's `research-page-preview` artifact.

## Unverified / limitations
- Screenshots were created and runtime assertions passed; **manual visual comparison against an approved static reference** was not performed in this chat.
- Full manual screen-reader assessment and authenticated Sveltia CMS editing remain NOT TESTED.
- These pass results are not evidence of a Lighthouse or Core Web Vitals speed change.
- Phase 9 homepage-nav Draft PR and Phase 8 mechanism proof Draft PR are separate and not merged into this feature branch.

## Merge gate
**READY FOR OWNER VISUAL REVIEW, NOT AUTO-MERGE.** Do not publish without owner approval. No production mutation took place.
