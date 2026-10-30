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
