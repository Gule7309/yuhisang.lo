# Phase 5 QA — Source-Verified PixelFit Visuals

**Date:** 2026-11-02 (Asia/Taipei)
**PR:** [#3 — Authentic PixelFit browser-QA screenshots](https://github.com/Gule7309/yuhisang.lo/pull/3)
**State:** **NEEDS_REVIEW** — build/tests/browser visual checks pass, but new screenshots have NOT been merged to production.

## Source-of-truth

- Design: existing [academic-minimal portfolio](https://ming053l.github.io/) visual system, preserving the sidebar and the approved Clarity + Lil'Log research details.
- Screens: original PixelFit packaged-web browser QA captures from the private `Gule7309/workout-buddy`, branch `codex/pixelfit-data-foundation`; see the four exact source blob hashes in [Media Provenance](../media/PROVENANCE.md).
- These are **real rendered application UIs with sample/test state**, not generated illustrations, native Android device screenshots, or evidence of real-user performance or Play Store release.
- The four original files ended in `.png` but contained JPEG/JFIF bytes. Public portfolio copies now use correct `.jpg` names **without re-encoding**; the Git blob SHA matches each original file. The media integrity CI check caught the mismatch before publication.

## Implemented

- Selected Projects: three real portrait screens displayed side by side in the existing quiet cover treatment, with `Real UI · browser QA` label; without a second duplicate mini-gallery.
- All Projects: compact three-screen layout, only for items with `media_layout = phone`.
- PixelFit EN/zh detail: portrait home cover with clear context note plus four gallery screens (home, active workout, sample completion, companion growth), bilingual descriptions/alt text.
- CMS `media_layout` selectable as Standard (default) or Phone screenshots. Other projects, research publication status, and A+C templates unchanged.
- Phone-card previews use eager image loading; gallery remains lazy loading.
- No private project repository, secrets, personal account data, or unpublished business claims were exposed.

## Actual Chrome + Playwright evidence

The final [GitHub Actions run #41384072459](https://github.com/Gule7309/yuhisang.lo/actions/runs/41384072459), artifact `research-page-preview`, includes screenshot PNGs and `pixelfit-image-qa.json`. Source was a locally served, generated static portfolio with project-prefix paths, source PNG/JPEG binaries and Noto CJK font. Screenshots were downloaded and visually inspected.

| Screen | Viewport | Images decoded | Horizontal overflow | Result |
| --- | --- | --- | --- | --- |
| Homepage PixelFit card | 1280×900 desktop | 3/3 | 0px | PASS |
| Homepage PixelFit card | 390×844 mobile | 3/3 | 0px | PASS |
| PixelFit gallery | 1280×900 desktop | 4/4 | 0px | PASS |
| PixelFit gallery, zh-Hant | 390×844 mobile | 4/4 | 0px | PASS |

Manual visual inspection:
- `homepage-pixelfit-desktop.png`: three authentic screenshots in a single slim cover; no repeated thumbnail row; clean status/copy.
- `homepage-pixelfit-mobile.png`: three screenshots fully visible in mobile card; label readable, no blank image.
- `pixelfit-gallery-actual-desktop.png`: four intact portrait captures and source-context captions in 4 columns; image UI not cropped.
- `pixelfit-gallery-actual-mobile.png`: gallery wraps into 2 columns without document overflow.
- Existing `pixelfit-case-desktop.png`, `pixelfit-case-mobile-zh.png`, `projects-archive-desktop.png`: preserved navigation, sidebar and portrait cover.
- No direct pixel-diff with reference website: screenshots use different original content, not an exact visual clone.

## Tests and gates

- **PASS:** Node homepage tests (featured projects, gallery/phone strip, bilingual labels, original research cover), Python bilingual project/research generator tests, CMS YAML parser and media validator.
- **PASS:** Unit tests explicitly reject a JPEG file masquerading as PNG and incorrect JPEG signature, unsafe paths and missing files.
- **PASS:** GitHub Actions static build, screenshot suite, Playwright image decode, image count and viewport no-overflow assertions.
- **NOT TESTED:** Authenticated Sveltia CMS end-to-end image uploads and editor preview, native Android device screen capture, full screen-reader and interactive keyboard review on all gallery interactions.
- **NOT DONE:** Merge PR #3 and production GitHub Pages validation for this specific set.

## Owner approval needed

Check that the four PixelFit UI captures are representative enough for public display and that their test-only scope is clear in the captions. If approved, merge Draft PR #3, confirm Pages deployment and public image links.

Tavi still has no verified image and remains intentionally text-only; no synthetic screenshot has been introduced.
