# Phase 10 — Editorial Research & Project Archives

**Date:** 2026-11-06 · **Mode:** evolve existing approved system · **Scope:** bilingual archive routes only

## Reference and source
- Existing project: https://gule7309.github.io/yuhisang.lo/
- Original preferred academic editorial reference: https://ming053l.github.io/
- Approved A+C research system: https://shikun.io/projects/clarity and https://lilianweng.github.io/posts/2023-06-23-agent/
- Source of truth: `content/works.json`, existing generators; no changed CMS schema.

## Specification
The site is an academic portfolio, not a tech-startup landing page. Preserve sidebar, slim navy typography, white backgrounds, subtle dividers, actual research figures, real product media and original links. Only augment archive listings with research question, method, publication caveat, and source link, or CMS-tag-derived browsing categories. Do not turn research notes into published papers or infer product maturity.

**Research:** heading/summary → explicit research question → brief approach → stage caveat → research/source actions. Keep actual diagrams contained; optional fields disappear when empty. Research in progress must always include its non-publication explanation.

**Projects:** preserve media row and existing case-study links. Add visible editorial category label and progressively-enhanced filters for All, Agent systems, Products & UX, Engineering. Derive groups from existing tags; no manually claimed achievements. No-JS users see every project. Buttons have `aria-pressed`, work with keyboard, URL `?category=` reflects active selection and supports browser back.

**Responsive targets:** 1280×900, 390×844, 320×700. Reflow text, buttons and media without horizontal overflow. Focus indicator visible, no animation necessary.

## Boundaries
No production release, main-branch edit, CMS credentials, external tracking, new database or third-party dependencies. Phase 9 mobile navigation remains a separate Draft PR. Phase 8 evidence and detail pages are unchanged.

## QA contract
Compile both generators, generate bilingual pages, run existing Python/Node tests plus Phase 10 tests, then inspect real Chrome EN/zh archive screenshots and filter interaction. Screenshots/functional tests must be reported rather than inferred. The default PR CI captures desktop projects archive but additional 390/320 category-filter checks remain required before final visual sign-off.
