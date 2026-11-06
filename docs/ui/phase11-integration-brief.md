# Phase 11 — Mobile navigation and lightweight homepage integration

Date: 2026-11-06 (Asia/Taipei)

## Approved foundation and provenance
- Current site design: https://gule7309.github.io/yuhisang.lo/
- Original academic editorial preference: https://ming053l.github.io/
- Approved A+C research visual language: https://shikun.io/projects/clarity ; https://lilianweng.github.io/posts/2023-06-23-agent/
- Integration source: [PR #7](https://github.com/Gule7309/yuhisang.lo/pull/7), with previously executed [browser QA](https://github.com/Gule7309/yuhisang.lo/actions/runs/41466751884).
- Base branch main already contains Phase 10 [PR #8](https://github.com/Gule7309/yuhisang.lo/pull/8).

## Scope
- Integrate existing accessible mobile Sections/選單 navigation and bilingual labels, 320/390/1280px states, keyboard Escape and focus return.
- Integrate nonblank homepage loading/error notices and working fallback archive links.
- Generate a compact homepage preview index at build/PR time from authoritative CMS works.json. Never manually maintain two sources of truth.
- Preserve Phase 10 research question/editorial archive, project category filter, existing routes and CMS values.
- Preserve homepage style and sidebar; do not redesign unrelated research/project detail pages.
- The unchanged publication/reproducibility boundary remains authoritative: do not fabricate research evaluation or promote synthetic When2ask audit to empirical results.

## Implementation / QA
- Copy vetted homepage-only components, scripts, homepage data, tests and stylesheet from PR #7 onto a fresh branch from current main.
- Reconcile GitHub Actions rather than wholesale replacing CI: new compact index build + homepage Chrome script, while keeping Phase 10 archive Chrome QA.
- Expected screenshots: 1280x900 EN; 390x844 and 320x700 bilingual navigation / loading / failure; project/research archive regression.
- Audit browser keyboard, anchors, responsive overflow, missing profile state and payload provenance.
- Required: Node tests, Python generator tests, CMS schema/media validation, real Chromium.
- Remaining owner visual sign-off: actual desktop/mobile screenshots, CMS authenticated editing, screen-reader audit.

## Future Phase 11 scope, separately gated
PR #6 adds **executed synthetic non-empirical** When2ask evidence and edits both the research generator and content/works.json. Do NOT silently transplant it into this homepage PR: reconcile it with Phase 10 rendering/tests separately, and rerun the evidence hash/provenance checks before proposing a second merge.

No main-branch changes, GitHub Pages deployment, production data or account secrets are authorized by this development branch.
