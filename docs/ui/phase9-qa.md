# Phase 9 QA — Homepage navigation, resilience and payload optimization

**Date:** 2026-11-02 (Asia/Taipei)  
**Branch / PR:** `feature/portfolio-mobile-navigation-and-loading-20261102` — [Draft PR #7](https://github.com/Gule7309/yuhisang.lo/pull/7)  
**Result:** **NEEDS_REVIEW**. Implementation and actual real-browser QA pass; do not merge without owner approval.

## Source and design boundary

- Approved academic-minimal visual system: existing [Gule Luo portfolio](https://gule7309.github.io/yuhisang.lo/) (navy/white text, subtle dividers, editorial covers) and original [Chia-Ming Lee inspiration](https://ming053l.github.io/). This is an evolution of existing code, **not** a screenshot clone.
- **Target:** homepage `index.html`, `site.js`, `extras.css`, source-derived JSON, CI/tests and documentation. The CSS changes are scoped using `home-page` / `homepage-root`. The static research/product page headers, A+C research style and factual project content remain untouched.
- Main branch originally displayed eight horizontal section anchors under 680px with hidden horizontal scrollbar, making offscreen links hard to discover.
- Main branch homepage fetched full `content/works.json` for only five published preview cards; the detailed engineering and source-trace descriptions were unused on the homepage.

## Implementation and deliberate choices

1. **Compact mobile Sections / 選單 menu:** one existing nav element reused; visible 40px button, keyboard Enter, Escape closes/returns focus, click a section/outside closes; desktop nav stays visible. No duplicate menu or new dependency.
2. **Localized accessibility:** navigation/skip/back-to-top labels translated in place; EN/zh toggle uses `aria-pressed`; selected content and social links retained.
3. **Non-blank load/fail states:** a subtle `role=status` notice before JSON fetch; hide after render. If essential profile content fails, show `role=alert`, a meaningful message and functioning static Research/Project archive links.
4. **Smaller homepage payload:** `scripts/build_homepage_data.cjs` deterministically derives `content/homepage-works.json` from CMS `works.json`, containing only currently displayed published research + featured projects and the exact source image/status/links used by previews. This runs **before JS tests in PR CI and on every GitHub Pages deployment**; the original works file remains the only editable source.

## Real Chrome/Playwright checks

- [Successful CI run #41466751884](https://github.com/Gule7309/yuhisang.lo/actions/runs/41466751884), artifact `research-page-preview`, includes real screenshots and `homepage-ux-qa.json`.
- Chromium/Chrome, 1× device scale, real locally hosted GitHub Pages subpath; Noto CJK installed for Traditional Chinese. Browser tests waited for the data-rendered state, clicked the menu/links, exercised ESC, outside clicks and language switch; profile-data failure was actively simulated.
- The first run failed **only the browser test's outside-click target**: Playwright clicked a point obscured by the sticky header. The test was repaired to click an unobstructed viewport gutter; the full rerun completed successfully. No website code changes were needed for that failure.

| Actual scenario | Result |
| --- | --- |
| Desktop English/Chinese 1280×900 | PASS — unchanged 70px header/nav, 3 featured projects + 2 research, screenshot captured |
| Mobile 390×844 | PASS — 62px header, menu opens/closes, EN/zh labels, no page overflow, screenshots captured |
| Narrow mobile 320×700 | PASS — all eight menu links fit, no page overflow, screenshots captured |
| Keyboard Escape | PASS — closes menu and restores focus to toggle |
| Section link / outside pointer | PASS — menu closes; section anchor remains functional |
| Selected language semantics | PASS — localized nav/back-to-top/skip, `aria-pressed` flips |
| Missing essential profile | PASS — role=alert with usable static Research/Projects links |
| Existing project/research pages | PASS (regression coverage) — product/research generators, original homepage featured/media tests, PixelFit visual screenshots and bilingual routing untouched |
| Authenticated Sveltia CMS editing | NOT TESTED — the existing connected GitHub workflow is unchanged |
| Full screen-reader / human mobile usability study | NOT TESTED — simulated Chrome/ARIA checks are not a WCAG audit |
| Exact design-reference pixel match | NOT COMPARABLE — no identical-content reference screenshot; verified visual hierarchy, not numeric pixel similarity |

### Measured payload (UTF-8 / gzip via Node zlib on generated files)

| Content asset | Raw bytes | gzip bytes |
| --- | ---: | ---: |
| Previous `works.json` | 48,929 | 17,605 |
| Generated `homepage-works.json` | 10,585 | 4,008 |
| Relative reduction | **78.4%** | **77.2%** |

This is the size of the **works content transfer**, not a measured Lighthouse score or end-to-end first contentful paint improvement. CDN overhead, homepage CSS/JS, avatar and image loading are excluded. The script asserts payload and gzip size ratios and checks that the genuine PixelFit/Trading Radar and research preview assets remain.

### Screenshot names

- `home-closed-1280.png`, `home-closed-390.png`, `home-closed-320.png`;
- `home-menu-open-390.png`, `home-menu-zh-390.png`;
- `home-menu-open-320.png`, `home-menu-zh-320.png`;
- `home-loading-error.png` and `homepage-ux-qa.json`.

Downloaded and manually inspected these screenshots. The mobile menu is clearly discoverable, does not cover the entire screen unnecessarily and text remains legible at 320px. The PixelFit static case page still shows its prior two-row mobile header as before; the new mobile header rules do not leak to it.

## Owner review and remaining opportunities

1. Check 390px EN/zh mobile menu rhythm and archive navigation.
2. If approved, merge PR #7 and validate the [public homepage](https://gule7309.github.io/yuhisang.lo/); check Pages Actions for the new generated index.
3. Suggested next website-focused iteration: stronger editorial hierarchy for the research/project archive and optional keyword filters, plus an authenticated CMS usability audit. Do not add user metrics or unsupported papers merely to fill visual space.

**No PR #6, When2ask study, email, app deployment or production mutation performed as part of this change.**
