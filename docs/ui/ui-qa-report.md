# UI QA — Status Badge Color and Automatic Icons

**Date:** 2026-10-20  
**Page:** Gule Luo portfolio / Projects and Research; `/admin/` content editor  
**Decision:** BLOCKED for full-live-page visual QA; **component-level QA PASS**.  
**Mode:** Existing design system, not 1:1 reference cloning.

## Evidence

- Approved current website: https://gule7309.github.io/yuhisang.lo/
- Reference direction: https://ming053l.github.io/
- Component preview fixture: `/mnt/data/yuhisang-status-colors/component-preview.html` in implementation session (not committed to public repo).
- Desktop rendered screenshot (1100 × 850, DPR 1): `/mnt/data/yuhisang-status-colors/desktop.png`.
- Mobile rendered screenshot (390 × 844, DPR 1): `/mnt/data/yuhisang-status-colors/mobile.png`.
- Both component screenshots were manually opened and inspected; status colors visibly differ and text remains readable.
- Browser navigation to the *live* GitHub Pages page and to localhost was blocked by the container's network policy. Component screenshots were obtained using Playwright `set_content` and local styles/scripts instead. These screenshots are **not equivalent to full-site visual QA**.
- No paired reference screenshot with the same viewport/content is available, so raw pixel mismatch metrics are not comparable.

## QA gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Color semantics for current work entries | PASS | Category metadata in `content/works.json`; new class rendering in `site.js` |
| Future new status labels | PASS | Automatic inference with explicit CMS override and neutral fallback |
| Known platform icon and unknown fallback | PASS (logic) | `tests/ui-utils.test.cjs` |
| All badge icons visibly rendered on live CDN | NOT TESTED | External Bootstrap Icons asset inaccessible in local sandbox; visual check required |
| Text contrast | PASS | Calculated range 5.09–6.75:1, above AA 4.5:1 |
| Desktop/mobile component fit | PASS | Playwright fixture at 1100×850 and 390×844; no horizontal overflow |
| CMS YAML parse | PASS | GitHub Actions Python `yaml.safe_load` gate |
| Website JS syntax, metadata and tests | PASS | GitHub Actions Node test suite; core source compiled |
| Full website navigation and mobile layout | NOT TESTED | Live browser navigation blocked in execution environment |
| CMS login and add/edit new item end-to-end | NOT TESTED | Requires authenticated user's CMS session; no token requested |
| No unrelated regressions | NEEDS REVIEW | Limited changes to status styling, social icon helper, CMS stage options and tests; no full-site browser smoke |

## Summary of changes

- `ui-utils.js`: platform name/domain icon detection and status type inference with safe fallbacks.
- `status-badges.css`: nine subtle, contrast-checked visual states.
- `site.js`: status classes plus icon rendering; social icon fallback through shared helper.
- `index.html`: load shared script and status stylesheet.
- `admin/config.yml`: fixed Writing collection indentation; added a status color selector and expanded social icon choices.
- `content/works.json`: assigned stages to seven current research/projects.
- `tests/ui-utils.test.cjs` and `.github/workflows/pages.yml`: repeatable checks.

## Follow-up validation

1. Open https://gule7309.github.io/yuhisang.lo/ on desktop/mobile and visually inspect current status badges and branded icons.
2. Sign in to https://gule7309.github.io/yuhisang.lo/admin/ and create an item with `Status color` set to **Auto** then explicit **Active**; verify rendering after publishing.
3. Add a test social link with no explicit Icon to verify platform domain and generic fallback, then remove the test item.

**Fidelity claim:** The colored status component was rendered and inspected locally; no claim of exact visual match to a full live-page screenshot is made.
