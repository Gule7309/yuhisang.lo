# Phase 2 QA — Product details + Featured Works

**Date:** 2026-10-30  
**Decision:** Automated checks PASS; visual browser review is pending.  
**Release:** Feature branch / draft PR only — not merged, not deployed to the public GitHub Pages site.

## Scope

- Featured projects on home with localized case-study links
- All Projects index (English / Chinese)
- Product detail pages generated from the existing CMS JSON
- Added bilingual case-study editor fields and preserved all preexisting statuses
- Homepage research entries remain unchanged; **no research/paper detail template implemented**

## Tests

| Area | Status | Evidence |
| --- | --- | --- |
| GitHub Actions Node tests | PASS | Feature branch Portfolio PR checks |
| CMS YAML collections | PASS | PyYAML schema parse in CI |
| Python generator syntax | PASS | py_compile in CI |
| Localized project detail routes | PASS | Python generator tests and output-file assertions |
| Featured-only homepage projects | PASS | VM-driven Node test reading live CMS fixtures |
| Unpublished content hidden | PASS | Python fixture test |
| Research/Paper route exclusion | PASS | Python fixture test |
| HTML escaping and URL scheme validation | PASS | Python fixture tests |
| Hreflang and canonical tags | PASS | Python fixture tests |
| Responsive browser visual QA | NOT TESTED | No full live/preview browser capture possible in current chat |
| CMS authenticated edit→publish | NOT TESTED | Requires logged-in owner session and deployment approval |

## Screenshots and differences

No browser screenshots were captured. The site still has the approved prior academic layout; product pages adopt the same CSS variables and overall profile/sidebar structure. Pixel-diff comparison is not applicable until a preview is hosted and rendered at identical desktop/mobile viewports.

## Required human checks before merging

1. Inspect how the product header, timeline, hero and gallery look at 1280×800 and 390×844.
2. Confirm EN / 中文 links navigate to the correct corresponding page.
3. Confirm the auto-generated case-study content is accurate and suitable for public display.
4. Confirm each external link and status claim is correct.
5. Confirm no paper/research details were published before choosing a reference style.

## Known limitations

- The independent product detail pages are populated with grounded text and currently lack verified cover images and public demo URLs. Nothing is fabricated.
- The CMS schema supports the new fields; the authenticated Sveltia editor has not been tested end-to-end.
- The body layout visually follows the current portfolio; full browser fidelity remains pending.
