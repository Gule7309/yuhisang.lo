# Phase 8 UI QA — When2ask Executed Synthetic Evidence

**Date:** 2026-11-02 (Asia/Taipei)  
**Decision:** **NEEDS_REVIEW** — source experiments were actually executed; the new portfolio evidence section has passed functional and browser QA, but new portfolio [Draft PR #6](https://github.com/Gule7309/yuhisang.lo/pull/6) has **not** been merged or published.

## Reference, source, and limitation

- Visual design reuses the approved Chia-Ming Lee-inspired portfolio + A+C research notes. Not a screenshot clone; no measurable identical-pixel reference exists.
- Original source: [When2ask Draft PR #1](https://github.com/Gule7309/When2ask/pull/1) and the actual [successful source CI run #41459465082](https://github.com/Gule7309/When2ask/actions/runs/41459465082). The archived [JSON artifact #13147204648](https://github.com/Gule7309/When2ask/actions/runs/41459465082/artifacts/13147204648) is ephemeral (30-day CI retention).
- Long-lived copy: `content/experiments/when2ask_synthetic_audit.json` (2572 bytes, exact same original Git Blob SHA-1 `f86ee9f9f59c2a083a3c21af4720a99033e37389`; SHA-256 `cf50484680e63bd7c845653451c2019e9ae45b8c87cc31bbcd9a492b11428dd8`).
- Dataset: **one synthetic fixture**, **zero benchmark items**, **zero live model calls**, **zero actual tool calls**. Replay decision `ASK`, raw viability `0.50`, normalized share `1.00`. Natural/Oracle-complete/Forced-miss/Oracle recovery each test **structural candidate availability only**, not downstream agent accuracy or causal effect.
- Source scientific limitations: the forced-miss decoy is not matched on unresolved argument pattern and oracle recovery increases the candidate-set size; no full response-weighted EVPI or actual ClarifyBench evaluation. This panel does **not** support an empirical hypothesis conclusion.

## Quality gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Exact source checksum and synthetic-only schema | PASS | `scripts/validate_research_audit.py` fails CI on changed or missing evidence; renderer independently checks SHA-256, source SHA, all four typed conditions |
| Original bundle source and archived public endpoint | PASS | Chrome fetched local static JSON and recomputed expected SHA-256 over bytes; original Git Blob hash independently matched |
| Bilingual project/research pages, SEO, sitemap, news | PASS (tested scope) | Existing Node and Python regressions plus CMS YAML validation |
| Research WIP status and attribution | PASS | In-page source panel does not create an academic publication badge |
| English desktop | PASS | Actual Chrome 1280×900, TOC keyboard Enter, four conditions, four evidence links, 0px document overflow |
| Traditional Chinese mobile | PASS | Actual Chrome 390×844, four condition rows and full table header readable without sideways scrolling; 0px document overflow |
| Invalid SHA, empirical=true, missing evidence | PASS | Generator tests omit section and TOC; separate required CI test fails on the published When2ask snapshot |
| Other research and private PixelFit code | PASS | Authority-Aware page has no synthetic evidence; PixelFit private code unaffected |
| Authenticated CMS preview/editing | NOT TESTED | Owner login required |
| Screen-reader/manual contrast and pointer target audit | NOT TESTED | Chrome checks do not establish full WCAG 2.2 AA |
| Peer-reviewed research, real-model benchmark, high-confidence wrong execution rate | NOT TESTED / NOT CLAIMED | No benchmark samples or live model, so no accuracy statistics may be inferred |
| Production deployment of portfolio PR #6 | NOT DONE | Draft PR review gate remains |

### Real screenshot inspection

- [Portfolio Chrome validation run #41462230838](https://github.com/Gule7309/yuhisang.lo/actions/runs/41462230838) includes actual rendered EN/zh evidence block screenshots, machine-readable QA JSON, and independently scrolled mobile states.
- Latest [Chrome validation run #41462597601](https://github.com/Gule7309/yuhisang.lo/actions/runs/41462597601) confirms all four links, public JSON byte SHA and no document clipping.
- The initial mobile table had a nested 420px min-width and clipped the final heading. Adjusted the CSS to show three columns on a 390px viewport; screenshot `when2ask-repro-zh-390-conditions.png` was opened and checked after this fix.
- Screenshot files: `when2ask-repro-en-1280-stats.png`, `when2ask-repro-en-1280-conditions.png`, `when2ask-repro-zh-390-stats.png`, `when2ask-repro-zh-390-conditions.png`, `when2ask-repro-zh-390-source-links.png`, plus `research-repro-audit-qa.json`.
- No identical-content external reference pixels, so numeric image-diff/MAE metrics are **not comparable**; screenshot review was about hierarchy, legibility, actual evidence, responsive behavior and absence of unintended changes.

## Release / science gate

1. Review the source repo PR #1 and evidence wording; it remains Draft. The code is not merged.
2. Review the bilingual audit section and submit only portfolio PR #6 after approval.
3. For empirical results, collect real, pinned ClarifyBench samples and model outputs; audit turn alignment, decoys, matching, threshold sweep and outcome metrics. Use a **new empirical schema** and show uncertainty intervals, rather than mutating this synthetic fixture's status.
