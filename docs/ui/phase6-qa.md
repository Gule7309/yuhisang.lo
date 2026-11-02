# Phase 6 QA — Evidence-led engineering case studies

**Date:** 2026-11-02 (Asia/Taipei)  
**PR:** [#4 — Bilingual Engineering Deep Dives](https://github.com/Gule7309/yuhisang.lo/pull/4)  
**Decision:** **NEEDS_REVIEW**. Functional and visual QA pass for the tested flows. New PR not merged; owner review and authenticated CMS editing remain outstanding.

## Brief and references

- Design specification: [Phase 6 of the reference brief](reference-brief.md).
- Authoritative visual system: the existing portfolio and its approved [Chia-Ming Lee academic inspiration](https://ming053l.github.io/). Clarity/Lil'Log remain limited to the approved research design; this change uses existing case-study CSS.
- Content verification: [Engineering Evidence Ledger](../engineering/CASE_STUDY_EVIDENCE.md).
- Implementation scope: two already-listed **project** details (PixelFit and Trading Radar), both EN/zh-Hant. No change to research pages, Tavi, private apps, published images, user accounts or production deploy.

## Changes examined

1. Source-grounded 4-layer architecture block on each project; cards have **Implemented / Prototype / Planned** stages. It is a *selected-layer technical summary*, not a measured production topology.
2. Three engineering decisions and three evidence/limitations items for each project, all bilingual.
3. Thin border cards and editorial lists; no new theme or client runtime dependency. Four columns at 1280px, single column at 390px.
4. An accessible **Explore technical details** anchor before the cover image; optional sections omitted on unsupported projects.
5. CMS lists for system layers, decisions and evidence. Public HTTPS evidence links supported; PixelFit's private source is **not** linked.
6. HTML escape and validation: malicious source URL rejected, invalid validation status defaults to pending, ordinary work without these fields remains unmodified.

## Actual browser evidence

- [GitHub Actions — latest verified PR run](https://github.com/Gule7309/yuhisang.lo/actions/runs/41402255348), artifact `research-page-preview`. Generation and tests succeeded on the current code/spec at that commit.
- [Detailed last-layer check run](https://github.com/Gule7309/yuhisang.lo/actions/runs/41402178928). Reproduced server-rendered static pages on localhost with Playwright-core and Chromium/Chrome, Noto CJK installed for Traditional Chinese screenshots.
- Screenshots include `pixelfit-en-1280-architecture.png`, `pixelfit-zh-390-architecture.png`, `trading-radar-en-1280-architecture.png`, `trading-radar-zh-390-evidence.png`, and their corresponding evidence screenshots.
- Direct anchored screenshots of long mobile sections can omit offscreen rasterized portions. The separate `pixelfit-zh-390-last-layer.png` and `trading-radar-zh-390-last-layer.png` were captured **after scrolling the actual last card into view**, proving that the fourth card is present and renders.

| Screen | Width | Architecture | Decisions | Evidence | Source links | Horizontal overflow |
| --- | --- | --- | --- | --- | --- | --- |
| PixelFit EN | 1280 | 4 / 4 visible, 4 columns | 3 | 3 | 0 (private) | 0px |
| PixelFit zh-Hant | 390 | 4 / 4 visible after scrolling, 1 column | 3 | 3 | 0 (private) | 0px |
| Trading Radar EN | 1280 | 4 / 4 visible, 4 columns | 3 | 3 | 3 public HTTPS | 0px |
| Trading Radar zh-Hant | 390 | 4 / 4 visible after scrolling, 1 column | 3 | 3 | 3 public HTTPS | 0px |

Playwright generated `technical-case-study-qa.json` with `result: PASS`, keyboard Enter navigation to `#architecture`, verified all status labels and prevented zero-field sections from appearing on Tavi. Actual screenshot files and the JSON report were downloaded and manually inspected, including the last mobile layer.

## Automated checks

| Gate | Result | What it proves |
| --- | --- | --- |
| Python page generator and sitemap | PASS | Bilingual pages and existing routes still build |
| Escaping/unknown statuses/unsafe source URLs | PASS | Untrusted strings cannot become executable HTML; unknown evidence state does not default to verified |
| CMS YAML parse | PASS | All collection fields are syntactically valid; not a logged-in CMS editor test |
| Source media validation | PASS | Existing authentic PNG/JPEG/SVG assets still pass integrity checks |
| Node homepage/selected works | PASS | Existing research and project cards remain functional |
| Real Chrome/Playwright responsive QA | PASS | EN/zh-Hant, 1280/390px, keyboard jump, 4/3/3 content, 0px overflow and last-card visibility |
| PixelFit Android native runtime, Play Console, real latency | NOT TESTED | This PR displays existing source-grounded descriptions only |
| Trading Radar live long-run performance or investor ROI | NOT TESTED | Bounded integration evidence is not a performance benchmark |
| Logged-in CMS content edits and upload | NOT TESTED | Owner access required |
| Screen-reader/manual WCAG audit | NOT TESTED | Browser assertions alone do not establish complete accessibility |
| Production site after PR #4 merge | NOT DONE | PR #4 remains Draft |

No numeric pixel-diff is asserted: the approved reference is an external academic style and the content does not correspond to an identical screenshot/state. A visual hierarchy and responsive quality check was used instead.

## Hand-off

1. Confirm architecture and factual descriptions, especially technical attribution for the Trading Radar team project and the wording of PixelFit's beta deployment.
2. Confirm bilingual density and status tone.
3. If approved, merge PR #4; the normal Pages workflow will deploy. Recheck public URLs and CDN assets.
4. Further iterations can add carefully attributed code snippets or validated data-driven figures **only after** real public evidence exists.

**Do not auto-merge this PR.**
