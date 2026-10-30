# Phase 3 UI QA — A + C Research Notes

**Date:** 2026-10-30
**Repository:** Gule7309/yuhisang.lo
**Branch:** feature/featured-product-pages-20261030
**PR:** https://github.com/Gule7309/yuhisang.lo/pull/1 (Draft)
**Decision:** Automated functional checks PASS; full visual/browser and authenticated CMS end-to-end verification remain BLOCKED in this environment.

## Approved visual direction

- **Clarity** (https://shikun.io/projects/clarity): readable research title and abstract, clean document structure, muted diagram container with source/caption.
- **Lilian Weng — Lil'Log** (https://lilianweng.github.io/posts/2023-06-23-agent/): long-form research narrative, in-page contents, references, and clear section hierarchy.
- **Continuity:** existing Gule Luo academic portfolio, especially the fixed author sidebar, colors, typography, links and status badges.

The templates are independently written; no third-party markup, fonts or copyrighted media were copied.

## Routes and UI states

- /research/ and /zh/research/ — index of published research entries only.
- /research/when2ask/ and /zh/research/when2ask/ — candidate-set incompleteness diagnostic research, explicitly no published paper.
- /research/authority-aware-agents/ and /zh/research/authority-aware-agents/ — concept/proposal, no empirical outcome claimed.
- Optional research diagrams and references are omitted when empty.
- In-page TOC is a native collapsible details element and uses section anchors.
- Own Paper link is hidden for work-in-progress/proposal; publication status cannot be inferred from a paper referenced in a bibliography.
- Global homepage cards link to bilingual research pages; product routes from phase 2 are unchanged.

## Automated checks

| Gate | Result | Evidence |
| --- | --- | --- |
| Python generator compilation | PASS | GitHub Actions PR checks |
| Project + research page generation | PASS | scripts/build_project_pages.py then scripts/build_research_pages.py |
| Bilingual routes / canonical / hreflang | PASS | tests/test_research_pages.py |
| TOC and optional section behavior | PASS | tests/test_research_pages.py |
| Unpublished research exclusion | PASS | tests/test_research_pages.py |
| Explicit publication status gate | PASS | tests/test_research_pages.py |
| HTML escaping / URL scheme whitelist | PASS | tests/test_research_pages.py |
| Sitemap merge, no duplicate URL | PASS | tests/test_research_pages.py |
| Homepage research EN/zh links | PASS | tests/homepage-featured.test.cjs |
| CMS YAML parse | PASS | CI PyYAML validation |
| Research source attribution | Reviewed | When2ask public repository README and ACL Anthology link |
| Desktop 1280×800 screenshot | NOT TESTED | Browser cannot render GitHub PR branch preview locally in this session |
| Mobile 390×844 screenshot | NOT TESTED | Browser cannot render GitHub PR branch preview locally in this session |
| Keyboard / screen reader / visual contrast on full page | NOT TESTED | Requires actual rendered browser/device check |
| CMS authenticated editing / upload / publication | NOT TESTED | Requires owner authentication in Sveltia CMS |

## Accuracy and provenance

1. **When2ask** is a mechanism reconstruction and diagnostic study of candidate-set incompleteness. The public repository documents instrumented steps, synthetic fixtures and evaluation plans. It does NOT claim measured performance improvements or full reproduction of the original paper.
2. **Authority-Aware Agents** is an early research proposal. Proposed decision policy, evaluation dimensions and next steps are distinguished from implemented work.
3. **Suri et al. (Findings of ACL 2026)** is explicitly described and linked as **prior work by other authors**, never as this site's publication.
4. HTML is escaped, external links must be HTTPS or supported mailto, and only owner-entered image references are displayed.

## Pending owner QA before merge

- Review EN and zh research descriptions for unintended disclosures.
- Inspect title, sidebar, TOC and paragraphs at 1280×800 and 390×844 in a hosted branch preview or local clone.
- Try keyboard Tab, TOC opening, anchor links and language toggles.
- Log into CMS and check research editing, optional figures and publication status fields.
- Confirm every claim and reference is appropriate for the public website.

No production GitHub Pages deployment or PR merge was performed.
