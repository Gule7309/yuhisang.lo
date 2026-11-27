# Phase 28 reference brief — existing portfolio accessibility

**Target**: current static portfolio homepage, English/Chinese research and projects archives, CMS public read-only review and publishing guides; desktop 1280×844 and mobile 390×844. Source-of-truth: current deployed restrained blue-white editorial academic website (https://gule7309.github.io/yuhisang.lo/), and current repository markup/styles. No third-party template or new branding.

**Must preserve**: Research-first hierarchy, intro/profile sidebar, language toggle, current nav and archive search, honest evidence labels, minimal aesthetic and no extra motion or prominent new UI. Can adapt: keyboard focus placement, focus ring visibility/contrast, target sizes, ARIA state, filter labels and responsive overflow.

**States to audit**: default, keyboard menu open/closed/Escape, Chinese toggle, archive filter results/clear, selected CMS record, empty search, publishing status panel. No authentication or real CMS save.

**Test**: real generated HTML under local HTTP server, Chromium via Playwright and axe-core, representative 390/1280 widths, deterministic mocked CMS/GitHub API inputs, no horizontal overflow. WCAG 2.1 A/AA tagged axe rules + manual keyboard behavior. Axe is not a screen-reader test and cannot establish WCAG 2.2 AA conformance.

**Risks**: externally-hosted Bootstrap Icons font loading might affect contrast checks in CI; avoid tweaking the palette unless browser-reported contrast actually fails. Preserve all existing responsive layouts.
