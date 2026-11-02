# Phase 4 — Authentic Portfolio Media QA

**Date:** 2026-11-02  
**Repository / branch:** Gule7309/yuhisang.lo / `feature/authentic-portfolio-media-20261102`  
**PR:** [#2 — Authentic screenshots and research diagrams](https://github.com/Gule7309/yuhisang.lo/pull/2)  
**Decision:** **NEEDS_REVIEW** — verified implementation, no production deployment. Final live CMS upload testing and owner sign-off remain outstanding.

## Scope and source of truth

- The existing academic portfolio layout and the approved research A+C style remain authoritative.
- The Trading Radar images are real Chrome captures of a public, user-owned React app with public mock data, not invented UI or financial performance.
- Research SVG diagrams are original explanatory drawings based on the current research questions, **not actual experiment results**.
- Source repository commits and screenshots are documented in [the media provenance ledger](../media/PROVENANCE.md).
- PixelFit, Tavi, GPTL and VR Dementia were intentionally skipped without permission-cleared screenshots.

## Captured screenshots (actual generated HTML)

GitHub Actions [preview workflow run #41375744362](https://github.com/Gule7309/yuhisang.lo/actions/runs/41375744362), artifact `research-page-preview`, contains:

| Screenshot | Viewport | Inspection |
| --- | --- | --- |
| `homepage-en.png` | 1280×900 | **PASS:** When2ask original conceptual diagram now appears on the homepage and is labeled Conceptual diagram. Text hierarchy and sidebar match approved style. |
| `research-desktop.png` | 1280×900 | **PASS:** no layout change, research status and TOC readable; figure section accessible further down page |
| `research-mobile.png` | 390×844 | **PASS:** bilingual content, status and collapsible TOC readable |
| `trading-radar-project-desktop.png` | 1280×900 | **PASS:** real mock dashboard screenshot loads under source-code button, within original project layout |
| `trading-radar-project-mobile.png` | 390×844 | **PASS:** real mock screenshot scales to mobile, no observed cut-off; sidebar CV link remains on one line |
| `diagram-when2ask.png` | 1120×570 | **PASS:** actual rendered SVG communicates three planned candidate-set conditions without results |
| `diagram-authority-aware.png` | 1120×520 | **PASS:** actual rendered SVG communicates intent, authority, consequence and decision-space conceptual factors |

The preview run used GitHub Actions Ubuntu + Chrome headless with Noto CJK fonts, the real generated HTML and repository CSS served locally. The screenshots were downloaded and opened for manual pixel inspection.

## Repairs

1. First screenshot capture lacked CJK fonts and mock API, yielding missing glyphs and connection warnings. Recaptured real frontend using Noto CJK, pinned public app commits and correctly permitted localhost mock API.
2. Homepage media previews were initially hidden in local HTTP preview because the URL allowlist only allowed HTTPS. Changed the JS allowlist to permit **same-origin HTTP URLs under /yuhisang.lo/assets/** only; external HTTP links remain disallowed. New homepage screenshot visibly includes the conceptual diagrams.
3. A mobile CV link was wrapped on the project detail page; now keeps its full text intact.
4. Added bilingual cover alt text, accurate cover captions and a small visible label (`Real UI · mock data`, `Conceptual diagram`) so media is not presented out of context.

## Automated gates

| Gate | Result | Evidence |
| --- | --- | --- |
| JavaScript homepage tests | PASS | `tests/homepage-featured.test.cjs` renders mock labels and research diagram assets in HTTP local preview |
| Static EN/zh case-study generator tests | PASS | Python `unittest discover` in PR workflow |
| CMS YAML schema | PASS | PyYAML parser + collection checks |
| Local media file integrity | PASS | `scripts/validate_media.py`: referenced SVGs parse and have no script/event attributes; PNG signatures, image paths, size budget and bilingual provenance are validated |
| Source attribution | PASS | `docs/media/PROVENANCE.md` pins frontend and mock-backend source commits |
| Responsive screenshots | PASS (reviewed) | Seven captured viewport/figure screenshots listed above |
| Existing functionality preserved | PASS on automated routes/tests | No new API, credentials or production release; product/research routes build |
| Mouse / keyboard / screen reader full regression | NOT TESTED | Requires interactive browser and assistive technology validation |
| Authenticated Sveltia CMS image editing | NOT TESTED | Owner login required |
| Production-site validation | NOT TESTED | PR not merged, no public deployment |

## Next owner review

- Confirm the research **conceptual figures** accurately represent the desired framing, especially Authority-Aware Agents.
- Confirm Trading Radar screenshot and mock-data disclosures are suitable for public portfolio display.
- Test authenticated CMS image upload and whether new media labels appear after a saved edit.
- If accepted, merge PR #2 and verify public URLs and deployed asset links.

**Do not treat the UI screenshots as real investment-model output or the research diagrams as measured findings.** Pixel-diff scoring against third-party sites is not applicable because these are source-inspired, independently designed pages with different content.
