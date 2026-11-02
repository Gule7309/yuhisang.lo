# Phase 7 QA — Pinned implementation traces

**Reviewed:** 2026-11-02, Asia/Taipei  
**PR:** [#5 — Source-backed implementation traces](https://github.com/Gule7309/yuhisang.lo/pull/5)  
**Decision:** **NEEDS_REVIEW** — all automated gates passed and the actual screenshots were visually inspected, but this new feature remains in a Draft PR and has not been deployed to the production site.

## Source and target

- **Mode:** Existing design system (not a pixel-perfect reference clone). Approved academic minimalism inspired by [Chia-Ming Lee](https://ming053l.github.io/); the approved A+C research style remains unchanged.
- **Affected pages:** English / Traditional Chinese `/projects/trading-radar/` and `/research/when2ask/`, plus the optional CMS editor fields.
- **Unchanged:** PixelFit private code, other product/research details, the published image gallery, academic publication claims, account settings, and production deploy.
- **Exact code provenance:** [Source Trace Audit](../engineering/SOURCE_TRACE_AUDIT.md), including six line-level links pinned to immutable source commit SHAs. The portfolio shows direct excerpts rather than inventing synthetic pseudocode.

## Actual tests and visual evidence

- [Successful PR validation run #41406726835](https://github.com/Gule7309/yuhisang.lo/actions/runs/41406726835) generated real static bilingual pages and captured Chrome/Playwright images. Preview artifact: `research-page-preview`.
- `source-trace-qa.json` contains four `PASS` cases: Trading Radar EN 1280×900, Trading Radar zh 390×844, When2ask EN 1280×900, When2ask zh 390×844.
- Every target page has **3 real source excerpt cards**, **3 immutable GitHub code links**, **0px document horizontal overflow**, a readable last source card and keyboard-focusable code panel.
- Research page has an actual keyboard-operable TOC anchor pointing to the source section, and retained **work_in_progress** publication status. PixelFit and Authority-Aware notes omit missing-source sections rather than showing fake placeholders.
- Actual screenshots were downloaded and opened for manual review. The mobile screen shows a small **↔ 左右滑動可閱讀完整程式碼 / Swipe to read full code** hint. Long lines scroll inside the code block, not the whole page.
- Screen images in the artifact include `trading-radar-en-1280-first-source.png`, `trading-radar-zh-390-last-source.png`, `when2ask-en-1280-first-source.png` and `when2ask-zh-390-first-source.png` (and the last excerpt of each).

## Checks

| Gate | Status | Evidence |
| --- | --- | --- |
| Existing homepage and media regression | PASS | Node homepage, image integrity and legacy project tests |
| Static project/research generators | PASS | Python project and research tests, EN + zh routes, sitemap |
| CMS YAML | PASS | Configuration parse and collection check; #Lx-Ly field label correctly quoted |
| Code snippet security and provenance format | PASS | URL requires public HTTPS github.com, a 40-digit source commit, exact #Lx-Ly; line count, size cap and HTML escaping; malformed/unpinned examples omitted |
| Source content attribution | PASS, manual | Actual six code excerpts compared to the public pinned source files while authoring, details in Source Trace Audit |
| Actual Chrome 1280 / 390 rendering | PASS | 3 cards / page, readable typography, 0px page overflow, in-panel scrolling and swipe hint |
| Keyboard / in-page research link | PASS (tested scope) | Enter on research TOC and focusable code excerpt panels |
| Private PixelFit source visibility | PASS | No additional source URLs/code from PixelFit, empty technical snippet section omitted |
| Other site routes and current publication status | PASS (tested scope) | Existing smoke tests and assertion that When2ask stays unpublished |
| Authenticated CMS edit/publish | NOT TESTED | Owner sign-in necessary; YAML parse is not a full editor test |
| Full screen reader, keyboard-only browsing and contrast audit | NOT TESTED | Automated spot checks do not prove complete WCAG compliance |
| Real-model benchmark, investment returns or production reliability | NOT TESTED / NOT CLAIMED | Code implementation evidence is not empirical validation |
| Production after PR #5 | NOT DEPLOYED | PR remains Draft |

## Visual review

- **Hierarchy:** restrained card title, short interpretation, source code block and single evidence link follow the original academic layout.
- **Consistency:** white/light-gray backgrounds, navy type, existing border/radius and A+C note structure; no new brand style or third-party syntax highlighter.
- **Mobile:** code panel can scroll horizontally; the whole document stays within 390px. A small swipe hint was added after inspecting actual screenshots to make long-line behavior discoverable.
- **Limitations:** there is no fixed, identical reference screenshot for comparison, so pixel similarity scores (MAE/mismatch ratio) are **not comparable**; we used actual rendered screenshot inspection instead.

## Owner review

Review the amount of visible code, the Trading Radar team attribution and the When2ask WIP/reproduction wording. Only merge PR #5 when those are approved. Do not assume displaying these excerpts establishes the academic or financial quality of the underlying methods.
