# Reference Brief — Colored Status Badges and Auto Icons

**Date:** 2026-10-20  
**Project:** Gule Luo Research & Engineering Portfolio (static HTML/CSS/JS on GitHub Pages)  
**Mode:** system — refine already-approved academic-minimalist design without redesigning layout  
**Target:** `/#research`, `/#projects`, sidebar and Contact social links, `/admin/`  
**Reference:** https://gule7309.github.io/yuhisang.lo/ (approved current site); https://ming053l.github.io/ (user-provided academic layout inspiration). Existing content and typography are authoritative, not copied markup.

## User task and style constraints

Distinguish meaningful project stages including **原型探索中** and **持續開發中的原型** while preserving restrained, text-first academic visual hierarchy. When future social links are added, select a recognizable brand icon automatically where the platform is known, and a generic link icon otherwise. New research/projects must support explicit status color selection through the CMS.

## Tokens (specified, not measured from source screenshot)

| Status | Foreground | Background | WCAG contrast |
| --- | --- | --- | --- |
| Exploration / 探索 | `#8D550C` | `#FFF5E5` | 5.66:1 |
| Active / 持續開發 | `#116354` | `#E7F7F2` | 6.46:1 |
| Testing / 測試 | `#5145A2` | `#F0EEFF` | 6.75:1 |
| Prototype / 原型 | `#2E5D84` | `#EDF4FA` | 6.28:1 |
| Research / 研究 | `#2A5F95` | `#EAF2FB` | 5.87:1 |
| Proposal / 提案 | `#72538B` | `#F5EFFB` | 5.60:1 |
| Released / 上線 | `#256940` | `#E9F7EE` | 5.99:1 |
| Paused / 暫停 | `#626872` | `#F2F4F6` | 5.09:1 |
| Unknown / default | `#536477` | `#F4F7F9` | 5.65:1 |

**Component spec:** `status-badge` retains legible status text; icon is supporting, never sole signal. Padding 4px × 9px; radius 6px; thin tinted border; typography about 10.5px bold to align with preexisting `.badge`. Bootstrap Icons are already loaded on the site. New social links use explicit icon → label → URL host → generic icon resolution, with a safe whitelist.

**No change:** page structure, type scale, navigation, URLs, content claims, CV generator, deployment architecture, or CMS authentication. Existing work records are enriched with `status_type`; users may choose **Auto** for inferred coloring.

## Acceptance criteria

- GPTL amber, Tavi teal, PixelFit indigo, When2ask blue, proposals violet.
- New work with empty or unknown status type renders neutral badge and safe icon.
- New social link with recognized URL renders the matching platform icon; unknown URLs render generic link.
- Desktop 1100×850 and mobile 390×844 component states have no horizontal overflow.
- WCAG AA normal text contrast (all nine status palettes >=4.5:1).
- Build workflow validates CMS YAML and runs Node metadata tests.

---

## Phase 2: Featured projects and bilingual product case-study pages (2026-10-30)

**Approved visual source:** Existing Gule Luo portfolio homepage and the user's preferred Chia-Ming Lee academic style (https://ming053l.github.io/). Treat current typography, white background, small links, muted blue and the left profile sidebar as the design system.

**Implementation scope approved now:** Project archive and project detail pages for products/engineering projects only. Feature selection and optional bilingual case-study fields are CMS-managed. No third-party template is copied.

**Research/Paper page style was subsequently approved on 2026-10-30: A + C.** The following references were considered before user selection:
- [A. Clarity](https://shikun.io/projects/clarity): modern minimalist research presentation, diagrams, methods, experiments, code and mathematics.
- [B. Nerfies](https://nerfies.github.io/): classic centered academic project landing page with author/affiliation/abstract/video/paper/BibTeX.
- [C. Lilian Weng's Lil'Log](https://lilianweng.github.io/posts/2023-06-23-agent/): research-first long article with table of contents, literature references, and technical sections.

### Product page design details

| Element | Existing source / chosen rule | Basis |
| --- | --- | --- |
| Desktop layout | Existing max-width 1130px; 165px sidebar + flexible content, 62px gap | CSS measured from repo |
| Tablet/mobile | Reuse existing 850px / 680px breakpoints; sidebar stacks on mobile | CSS measured from repo |
| Color | White background, navy text, muted blue links, light gray hairlines | Existing site CSS |
| Type | Existing Inter / system UI stack; 25–30px case title, 13.5px body | Source typography, adapted |
| Media | Real screenshots only, no fabricated images or placeholders that appear to be screenshots | User's existing content policy |
| States | Existing muted status badges, year, tags, and link icons | Existing components |
| Actions | Back to all projects, public GitHub/demo/video links only when URL is present | Clear paths and no dead CTAs |
| Localization | Separate statically generated English and Chinese URLs; hreflang and canonical | SEO and deep linking |
| CMS | Bilingual role, challenge, approach, progress/outcome, next steps | Existing JSON/CMS workflow |

### Acceptance and QA

- Home page displays exactly the featured=true and published=true project subset.
- All published products remain available from /projects/ and /zh/projects/; unpublished content stays out of generated HTML.
- Each published product has /projects/{slug}/ and /zh/projects/{slug}/, with cross-language links and metadata.
- Research entries receive their own research-note pages only after the approved A+C direction (confirmed 2026-10-30); unpublished work must not be presented as peer-reviewed.
- HTML content is escaped and links are scheme-checked; editor fields are optional.
- Run Node and Python tests, CMS YAML parsing, GitHub Actions PR checks.
- Visual QA target: desktop 1280×800 and mobile 390×844 at DPR1 with published fixture. Live/browser screenshots are not yet available in this chat environment; do not claim visual completion.

---

## Phase 3: Approved A + C Research Pages (2026-10-30)

**Mode:** Existing design system + two approved reference patterns.

- **A / Clarity — https://shikun.io/projects/clarity:** narrow-to-wide typographic content containers, clean section hierarchy, subtle gray backgrounds for diagrams/figures, source links and clear captions.
- **C / Lil'Log — https://lilianweng.github.io/posts/2023-06-23-agent/:** research narrative with explicit question, background, method, evidence limitations, references and in-page table of contents.
- **Authoritative continuity:** https://ming053l.github.io/ and the current Gule Luo Portfolio style (existing Inter/system font stack, navy/white palette, slim sticky author/profile sidebar, semantic status badges).

**Scope:** Research index and research detail pages only, separate from product case studies; two initial entries — When2ask reconstruction/diagnostics and Authority-Aware Agent thesis direction. Design must not imply journal/conference acceptance, a released paper, a valid experimental result or a finished method. The SAGE paper is attributed to Suri et al. and must not appear as Yu-Hsiang Luo's own publication.

### Layout / presentation

| UI part | Spec | Evidence |
| --- | --- | --- |
| Header and author profile | Preserve exact shell/sidebar/navigation implementation used by product pages | Existing code |
| Main content | 700–820px readable column, 28–31px research heading, 13–14px body; no noisy cards | Existing typography + Clarity |
| Status | Correct research/proposal badge followed by an explicit editorial note that this is not a publication | Existing badge tokens |
| Metadata | Research stage, year; optional verified paper link only when genuinely authored and appropriately labeled | Credibility |
| Overview | One-paragraph abstract/summary; research question in editorial block | Clarity |
| Reading flow | Background → Question → Approach → Evaluation Plan → Current Status/Observations → Limitations → Next Steps → References | Lil'Log |
| TOC | Compact semantic list with anchored headings; collapsible with native details/summary | Lil'Log |
| Figures | Optional real uploaded figure + bilingual caption and source URL; light neutral figure container | Clarity |
| Language | Stable EN and zh-Hant URLs, canonical, hreflang; keyboard focus and mobile navigation | Existing bilingual routes |
| CMS | Optional bilingual text fields; references and figures are lists; paper metadata allowed only when verified | Existing Sveltia JSON |

**Component states:** No figures → omit figure section; no observations → show clearly labelled planned/ongoing work, not dummy metrics. No references → omit. Unknown publication status → default to "Research note, not an accepted publication." Invalid URLs → omit. Mobile TOC is collapsible with valid keyboard navigation.

**Acceptance:** Two research entries with truthful content; separate research archive; research homepage links; no change to product routes; escaping, URL whitelist, canonical/hreflang, sitemap; Python/Node tests; CMS YAML validation and PR workflow checks. Confirm full desktop/mobile appearance against A+C before merging — screenshots currently required.

**Out of scope:** Inventing publication records or experiment figures, claiming benchmark performance, adding server/database/analytics, public release without owner approval.

---

## Phase 4 — Authentic media, evidence and provenance (2026-11-02)

**Target:** Homepage Featured Research / Products, two approved A+C Research pages, and Trading Radar Case Study. No other pages, release permissions or visual identity change. This is an **evolution** of the current academic-minimalist design, not a replacement style.

### Evidence and references

- Existing Portfolio and [Chia-Ming Lee](https://ming053l.github.io/) establish the left author sidebar, white page, quiet dark-blue typography and restrained media cards.
- [Clarity](https://shikun.io/projects/clarity) informs the spacious research figure layout; [Lil'Log](https://lilianweng.github.io/posts/2023-06-23-agent/) informs narrative and captions.
- **Actual Trading Radar UI** captured from the user-owned public repository at frontend commit `985351296d4d0c1225121be03e31aa115f003769` with a separately run **public mock backend** at commit `a8cd0261455c178159765d691d9b35d3e57e51f2`. Browser screenshots, not generated depictions.
- [When2ask Experiment Plan](https://github.com/Gule7309/When2ask/blob/main/docs/experiment_plan.md) grounds original planned-condition diagram. Authority-Aware diagram is explicitly a proposed research framing, not a tested model.
- Full media provenance: [docs/media/PROVENANCE.md](../media/PROVENANCE.md).

### Design constraints

| Component | Behavior | Fidelity target |
| --- | --- | --- |
| Homepage research thumbnail | Show first real research figure when no explicit cover exists; contain rather than crop diagram | Existing 34%/66% media/text row, slim border |
| Homepage Trading Radar | Actual 1440×960 screen capture, bottom-left restrained `Real UI · mock data` label | Existing rounded photo container, subdued palette |
| Research archive | Figure on left, text and status on right; stack on mobile | Same existing sidebar and text hierarchy |
| A+C research detail | Existing source-linked figure and caption; no inferred or fake benchmark plots | Existing diagram section and in-page TOC |
| Product case study | Cover image plus bilingual disclosure explaining mock data; actual desktop/mobile screenshot gallery | Existing semantic `figure`, `figcaption`, image contain |
| CMS | Optional per-work short media label and complete bilingual cover description; screenshot gallery remains editable | Existing content JSON, no new database |

### Screenshot and output expectations

- English: 1280×900 Project Case Study, When2ask research note.
- Traditional Chinese: 390×844 Project Case Study, Authority-Aware research note.
- Fixture content: current `content/works.json` with real frontend mock screenshot, original SVG diagrams.
- All image paths are checked by `scripts/validate_media.py`. No broken assets, fabricated UI, fake metrics or accidental release of private screenshots.
- The screenshots prove actual UI rendering with development **mock data**, not live market ingestion, model quality, investing results or production deployment.
- PixelFit, Tavi, GPTL and VR Dementia images are deferred until genuine rights-cleared captures are available.
- QA may capture local Chrome renders but must not claim pixel-perfect equivalence to third-party inspirations.

### Acceptance gates

- Media assets have truthful source and type labels.
- Native desktop/mobile images render without horizontal clipping or broken links.
- CMS-driven images remain optional; empty galleries omit gracefully.
- No unrelated layout/navigation changes.
- GitHub Actions Node + Python tests, YAML validation and image-path validation pass.
- Browser screenshot review for homepage, research and case-study pages; report any untested CMS upload/authentication states.

---

## Phase 5 — Verified PixelFit Development Screenshots (2026-11-02)

**Target:** Featured homepage PixelFit card, All Projects archive card, PixelFit bilingual case-study. Maintain existing academic-minimalist site and A+C research detail pages. This is a system continuation, not a redesign.

**Verified evidence:** Four 393px browser screenshots kept in the user's PixelFit project at codex/pixelfit-data-foundation. Development docs docs/pixelfit/ANDROID_DEVICE_QA.md, ANDROID_UX_BATCH10.md and PET_ACCOUNT_BATCH11.md state that the captures came from a packaged web preview/QA fixture. They **do not** substantiate Android native screenshot fidelity, Play release, independent users, revenue, or training results. Only these image bytes are copied into the public portfolio; source code and development credentials remain private.

### Visual geometry and interactions

- **Homepage**: retain original work layout, navy body text, fine separators, blue links and status badge. For phone UI only, render the first 3 genuine QA screenshots together inside the existing 1.55:1 cover card, uncropped with subtly rounded phone images. Add a small authenticity label; keep non-phone covers unchanged.
- **Projects archive**: the same three-image strip fits inside the existing 1.6:1 cover and stacks with content at mobile widths, with no need for an invented desktop-only cover.
- **Product detail**: full portrait preview in case-cover with an English/Chinese provenance note. Gallery shows home / workout / completion / pet preview with bilingual captions; photos retain their original proportions and are individually openable.
- **CMS**: add optional media_layout selector: default or phone; existing image, image_alt_{lang}, image_caption_{lang}, gallery fields remain source of truth.
- **Responsive QA**: Chrome at 1280×900 and 390×844, en and zh-Hant. No horizontal overflow, clipped image or hidden critical info; test keyboard accessible gallery links, language links and back to projects. The mobile preview should remain readable without a device mockup overlay.

### Editorial claims / states

- The screenshots depict **actual PixelFit application UI rendered in a browser preview**, with QA/demo inputs, **not Android device photos**. They may not show the exact newest release build.
- Status label remains **internal testing** as previously documented; no claim of public release, real human workout statistics or production reliability.
- If optional images are absent for Tavi / GPTL etc., do not synthesize or imply captures; retain typographic fallback.
- No link to the PixelFit private source repository and no credential or private config import.
- Reference design remains https://ming053l.github.io/ with Clarity/Lil'Log applied only to Research. PixelFit's own screenshots are the sole authoritative visual evidence of that app.

### Acceptance

1. Source files byte-preserved, no visible PII or secrets, covered by scripts/validate_media.py.
2. Homepage/archives use the three actual screenshot previews only when media layout is phone.
3. Case-study cover and gallery use all four real screen captures, with accurate provenance and alt text.
4. Existing product/research navigation, status labels, bilingual routing and SEO are unchanged.
5. CI Node/Python tests and actual desktop/mobile browser screenshot review pass. Do not claim native Android UX was tested.

---

## Phase 6 — Evidence-led technical case studies (2026-11-02)

**Approved direction:** after authentic images, improve engineering depth for recruitment/research audiences. Target is the existing static bilingual `/projects/pixelfit/`, `/projects/trading-radar/` and zh-Hant equivalents; no change to A+C research notes, homepage theme, private apps, payments, or production deployment.

### Source hierarchy

1. **Authoritative styling:** existing Yu-Hsiang Luo Portfolio, Chia-Ming Lee (https://ming053l.github.io/). Preserve white background, navy text, understated border rhythm, left profile sidebar, compact labels and links.
2. **Case-study editorial influence:** existing A+C Clarity (https://shikun.io/projects/clarity) and Lil'Log (https://lilianweng.github.io/posts/2023-06-23-agent/) decisions: clear hierarchy, thoughtful narrative, figures where supported; not a copy.
3. **Technical facts:** PixelFit private development docs (ANDROID_UX_BATCH10.md, LATENCY_AND_CLOUD_BATCH12.md, CLOUD_BACKEND_BATCH13.md, PLAY_RECOVERY_BATCH17.md) and Trading Radar's public README, FRONTEND_SETUP.md, FRONTEND_VALIDATION.md, LIVE_DEMO_SETUP.md. Do not expose PixelFit's private repo URL, keys, account IDs, or internal deployment identifiers. Trading Radar's source URLs can be public.

### Layout, responsive states and CMS

- A restrained **System Architecture** block after the project's Approach, with four vertical layers/steps in a responsive 4-column desktop grid (2-column tablet, single-column <= 680px), thin borders, pale blue/grey surface, no unverified performance numbers. Each stage has a small sequence number, title, explanatory line, and bounded stage tag: `implemented`, `prototype`, `planned`. Diagram is a **selected-layer conceptual overview**, never a production topology proof.
- **Engineering Decisions** is a 2- or 3-item ordered editorial list of specific constraints, design choices and reasons. No generic AI-generated marketing claims; only source-backed decisions. Each record supports bilingual heading and body.
- **Evidence & Limitations** uses a plain list of tested/limited/to-verify facts. Status text and icons are secondary; never show an unverified claim as a passing metric. Evidence links only when an accessible public URL exists; otherwise describe source documents without publicly exposing a private repo path.
- Three optional CMS lists: `architecture_layers`, `engineering_decisions`, `verification_evidence`. Existing project pages with no data omit these areas entirely. No new runtime dependency or database.
- Include small in-page link `Technical details` near the top only when supported content exists. Same robust whitelist validation used for existing links. Cross-section semantics and keyboard focus must work without JavaScript.
- Spacing estimated from current CSS: section blocks 36-42px apart, title 20-21px, body 13-14px, light 1px borders, radius <= 8px, subdued status ink; avoid saturated background cards. Preserve aria/alt/locale labels and focus outlines.

### Fact boundaries

- PixelFit: React/Capacitor UI; reliable IndexedDB local draft/outbox and deferred sync; authenticated beta callable/Firestore paths with server receipt for growth. The beta is isolated; do not equate targeted 100ms UX with measured latency, or a signed AAB with Play rollout.
- Trading Radar: official-data ingestion to a versioned SQLite and candidate contract; a separately developed Agent/Evidence branch; a React workbench with mock tested flow and a documented bounded live run. Mock imagery is not real model output; evidence quality, automated recheck and investing outcomes not validated.
- For both projects, source descriptions support the *design*, not a user study, audited performance, revenue or production SLA. Don't add unsourced quantitative metrics.

### Verification contract

- Test EN/zh copy, safe HTML escaping, absent-data graceful omissions, stage enum allowlist and malicious links, CMS YAML, static routes, image assets and prior homepage assertions.
- Capture actual rendered 1280x900 English and 390x844 zh-Hant case pages, plus an anchored browser screenshot of each new architecture/evidence area after scrolling into view. Verify no horizontal overflow; keep screenshot in CI artifact.
- Document PASS/FAIL/NOT TESTED in a Phase 6 QA report. Manual screen-reader and authenticated CMS editing remain explicitly NOT TESTED until performed. New PR only; do not merge before user review.

---

## Phase 7 — Verified implementation traces (2026-11-02)

**Mode:** `system`. The user approved continued development after Phase 6. The authoritative visual system is the approved academic portfolio, inspired by [Chia-Ming Lee](https://ming053l.github.io/) and its existing editorial case studies. For research notes, preserve the approved A+C Clarity (https://shikun.io/projects/clarity) + Lil'Log (https://lilianweng.github.io/posts/2023-06-23-agent/) hierarchy. This phase extends **existing details pages** `/projects/trading-radar/` and `/research/when2ask/`, plus their Traditional Chinese equivalents. No homepage redesign, release, or source-project modification.

### Reader task and verified inputs

A researcher or technical recruiter should be able to connect a project/research claim to **specific lines of publicly viewable user/team source code** and understand what the snippet actually proves. The original code repository, not generated text, is the authoritative source. Sources inspected:
- [Trading Radar public source](https://github.com/Gule7309/trading_radar): pinned main commit `985351296d4d0c1225121be03e31aa115f003769`, plus published Agent/Evidence branch commit `a8cd0261455c178159765d691d9b35d3e57e51f2`.
- [When2ask WIP reconstruction](https://github.com/Gule7309/When2ask), pinned main commit `320fd61fcae47a566948feaeee48a44efda15567`. This is **not** the original SAGE paper's implementation, or a validated benchmark result.
- PixelFit source is private: **no code excerpts, file paths or public source links added** without separate authorization. Its already approved technical narrative remains.

### UI components

- A compact **Implementation Trace** section appears after Engineering Decisions / Evidence on a project page (only when valid traces exist) and after research Progress / Figures but before References on a research note (when evidence exists). Add an entry to the research in-page TOC.
- 2–3 vertically stacked editorial cards, not a dark full-screen code editor. Each card: small pin-style title and bilingual interpretation, a restrained mono code excerpt (max 14 lines; hard cap 1300 chars), a single prominent **View exact source (commit & lines)** link, and a factual scope note as needed. Text in plain `<pre><code>` using HTML escaping and no runtime syntax-highlighting dependency.
- Border `#dfe8ef` 1px, radius 7px, type 12–14px, light gray code surface `#f5f8fa`; preserve 36–42px section rhythm. Long code can scroll inside its own region; the page itself must not horizontally overflow. Keep 1280px and 390px QA screenshot viewports.
- CSS changes only to existing `project-pages.css`; research uses that shared stylesheet. No image assets or animations required.
- CMS `source_traces` list per work: title_en/zh, explanation_en/zh, one exact snippet, language, pinned `github.com/.../blob/<40hex>/...#Lx-Ly` source URL. Other projects display no empty section. Source code is owned by the source repo; this portfolio does not claim individual authorship of every team module.
- Links must be real and operable without JS. Require HTTPS, `github.com`, a 40-character commit SHA and a line anchor. Fail closed on malformed/untrusted URLs; escape snippets and labels; do not link private repos.
- The research page must **retain publication_status=work_in_progress**, attribution to Suri et al. and the explicit limitations of its SAGE reconstruction.

### States and gates

- Default: 3 authentic trace cards for Trading Radar and 3 for When2ask. Other projects/research with no data: absent section.
- Invalid URL or missing snippet: skip the item; if no valid items remain omit the heading and research TOC entry.
- Missing Chinese text falls back to English according to existing CMS localization conventions, never fake translation.
- Keyboard: native anchors, clear focus, research TOC link to source trace; source opens a new tab with `noopener noreferrer`.
- CI: Python static generators + security tests, CMS YAML, Node existing tests, exact URL and snippet boundary checks, no page-level overflow on 1280/390 screenshots. Playwright should actually scroll to source trace before capture; for mobile, prove the last card can be viewed.
- Do not calculate unverified benchmarks or infer research improvements from the existence of executable code. Do not claim authenticated CMS upload or live source verification after publication.

---

## Phase 8 — Executed synthetic reproducibility proof for When2ask (2026-11-02)

**Mode: system continuation** of the user-approved academic minimalist site / A+C research notes. Scope is **only** `/research/when2ask/` and `/zh/research/when2ask/`. No homepage restyle, no backend deployment, no third-party imagery or fabricated empirical graphs.

### Authoritative sources

- Original site theme / reference: https://ming053l.github.io/, implemented existing site tokens.
- Current approved research narrative / figures: https://shikun.io/projects/clarity, https://lilianweng.github.io/posts/2023-06-23-agent/ (editorial hierarchy only; no copying).
- Real **executed** [When2ask Phase-0 synthetic CI run](https://github.com/Gule7309/When2ask/actions/runs/41459465082), originating from source commit `ab0cd26da17ff63d300080811500fe87fe0f95a6`. Downloaded artifact `synthetic-mechanism-audit.json` has 2572 bytes and SHA-256 `cf50484680e63bd7c845653451c2019e9ae45b8c87cc31bbcd9a492b11428dd8`. This data is **one synthetic replay, not empirical research**. Source work currently tracked in [Draft PR #1](https://github.com/Gule7309/When2ask/pull/1).

### Layout, typography and states

- Add optional research section `id="reproducibility"` **after Current Progress** and before the paper limitations/next steps (or after the progress section only), connected to existing research TOC. Preserve existing disclosure that this is work in progress.
- Section follows existing 20px h2, 1px fine border, no colored summary callout. A small neutral status line: **Executed synthetic replay · Not a benchmark / 已執行合成情境 · 非 Benchmark**.
- Minimal metadata in a 3-column (desktop) / stacked (390px) row: **1 synthetic decision point**, **0 benchmark samples**, **0 model/tool execution**. These are denominators and evidence type, **not performance KPIs**.
- Single decision record: `ASK`, raw viability 0.5, normalized share 1.0 (explicitly not calibrated model confidence). Four rows of Natural, Oracle-complete, Forced-miss, Oracle-recovery with compatible-candidate presence Yes/No and set sizes 1/1/1/2, **not a result bar chart or statistical effect size**.
- A plain caveat and source command, with accessible text link to the pinned source revision and actual GitHub CI artifact. Source record is snapshotted in repository data under `content/experiments/` as the exact bytes of CI JSON so evidence survives 30-day artifact retention.
- Long hashes/links wrap or stay inside an independently scrolling code line; no page-level x-overflow.
- Bilingual optional CMS fields control **interpretation only**, not numerical raw audit values, to avoid accidental changing of evidence. If the snapshot is missing, modified without SHA update, malformed, or claims empirical results for this synthetic schema, **omit the whole section and TOC link**; never display guessed metrics.
- Keep research WIP publication and original-paper credit. Do not alter When2ask source repo or source PR as part of portfolio generation.

### Acceptance

- Build from exact audited JSON, verify SHA-256, schema, zero-model/zero-benchmark safety requirements, condition list and non-null test result; do not invent model accuracy/HCWE.
- Escape all user-editable comments and reference URLs; source links are pinned to public When2ask commit and actual CI run/artifact.
- Python EN/zh generator tests include valid/invalid hash, malformed content, unsafe URI, missing file, research TOC and no effect on Authority-Aware notes.
- CI Playwright actual desktop 1280×900 and mobile 390×844, English and Traditional Chinese, scroll to evidence, verify 4 rows and no overflow; capture PNG/JSON inspection artifacts.
- Screen reader manual check and authenticated CMS edit remain NOT TESTED until performed; new portfolio PR remains Draft for review.
