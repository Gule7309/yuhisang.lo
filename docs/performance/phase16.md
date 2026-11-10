# Phase 16 — Image loading and performance evidence

## Scope

This phase makes a focused, low-risk change to the existing portfolio without rewriting the CMS, replacing images, changing claims, or merging separate draft PRs.

- The homepage profile avatar has explicit intrinsic `width=136` and `height=136` for more stable layout; the CSS retains its responsive 84px mobile presentation.
- The profile avatar is eagerly loaded with high fetch priority; smaller, below-fold work images are lazy-loaded with low fetch priority and asynchronous decoding. The formerly eager three-image phone strip no longer competes for initial network priority.
- Existing primary images on static research and project detail pages remain eager and gain high fetch priority.
- Two network preconnections are added for the site's existing GitHub avatar and Bootstrap Icons CDN origins. They do not add external vendors.
- The manual `On-demand Lighthouse baseline` GitHub Actions workflow measures the **deployed site** at a point in time, once using a mobile emulation and once with the desktop preset. Download the `lighthouse-homepage` workflow artifact for detailed JSON and a summary.

## Measurement honesty

A Lighthouse lab run provides a **lab LCP/CLS** and **TBT** proxy for responsiveness. It does **not** provide a real-user INP result. Field Core Web Vitals require real-user measurements (e.g. CrUX / PageSpeed Insights with sufficient traffic). Do not claim field improvements without comparable before/after data.

The Phase 16 branch has no baseline score at authoring time; the new measurement workflow must be manually started after deployment or from the workflow Actions tab. Run measurements several times under comparable conditions and document the median; do not claim a causal speedup merely from one noisy result.

## Regression checks

`node --test tests/*.test.cjs` validates image loading attributes and existing page logic. Python generator tests cover static project and research page integrity. Browser screenshots and final CMS interaction checks remain independent tasks.

## Follow-up

Inspect actual LCP element and image sizes in Lighthouse. Potential next interventions (only when justified by measured findings): optimize transmitted pixel dimensions with generated variants, update cache strategy for CMS images, consider image format conversion, and reduce homepage content request dependencies. Never re-encode authentic research figures or screenshots without preserving attribution and visual accuracy.
