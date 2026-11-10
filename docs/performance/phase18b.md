# Phase 18B — intrinsic image sizing and automated lab reports

## Findings grounded in checked-in media

At 2026-11-11, the largest committed media source inspected through the GitHub repository tree was `assets/projects/trading-radar-dashboard-demo.png` (~191 KB); the next was `trading-radar-detail-ui-test.png` (~154 KB). This alone is not evidence that image bandwidth is the dominant bottleneck. Do not alter authentic screenshots or scientific figures solely to increase Lighthouse scores.

## Changes

- Static EN/中文 research and project pages now read **actual intrinsic pixel dimensions** from checked-in PNG, JPEG, WebP (supported headers) or SVG viewBox where available, and write matching `width` and `height` to markup. This preserves the source aspect ratio while CSS remains responsible for rendered width.
- Remote image URLs, unsafe paths, unknown formats, and corrupt headers do not receive invented size attributes.
- Existing lazy/eager priority and descriptions are unchanged. New tests exercise real pixel headers and safe URL handling.
- The existing Lighthouse workflow now runs automatically **after a successful Pages deployment**, in addition to manual dispatch. It captures mobile and desktop lab JSON and uploads a summary artifact.

## Verification and interpretation

CI should verify Python page generators, image reader unit tests, existing JavaScript tests and browser regressions. Successful CI does not prove lower CLS or faster LCP. Lighthouse lab LCP/CLS/TBT observations must be collected after deployment; no field INP result is produced by the workflow. If the same hardware and network are used, compare multiple runs and look at element and transfer breakdowns rather than score alone.

## Next decision

After the first post-deployment Lighthouse artifacts exist, inspect which element is actually LCP, the proportion of bytes attributed to images, the request waterfall and main-thread blocking. Only then prioritize responsive variants, CDN changes or load-order refactoring.
