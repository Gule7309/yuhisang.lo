# Phase 17 — release hardening and PR consolidation

## Verified audit (2026-11-11)

- PR #13 search archive: the 2026-11-09 CI failure was caused by an outdated assertion for `archive-filters.js`, after the implementation replaced it with `archive-search.js`. The assertion has been updated on the PR #13 branch; rerun CI before any merge.
- PR #16 image performance: both validation workflows failed because `homepage-featured.test.cjs` still expected eager loading for the phone strip. The expected behavior has been updated to lazy loading on that branch. Revalidate before merging.
- Other draft PRs (#6, #7, #10, #11, #12, #14) remain separate; do not merge them as part of this change.

## New deployment safeguard

After GitHub Pages reports deployment success, `scripts/post_deploy_smoke.cjs` checks:
- Home, public EN and ZH research and projects archive pages, and CMS entry.
- HTTP success, HTML content type and a minimal expected page marker.
- Up to five attempts (4 seconds apart) for each public route to tolerate propagation.

Failures mark the workflow red but **do not roll back a deployed site**. Avoid interpreting successful smoke checks as detailed visual QA, CMS-authenticated behavior, full accessibility testing, or proof of data freshness. Do not add unpublished or privileged endpoints to this public smoke list.

The script has pure injected-fetch tests, run by the existing `node --test tests/*.test.cjs` CI step. No third-party runtime dependencies.

## Release gate

For each PR: ensure its current HEAD has successful JS/Python checks, perform available browser/mobile QA, review change scope and conflicts, merge only authorized PRs, verify Pages deployment and this post-deploy smoke job, then open live pages for final visual checks. If post-deploy smoke fails, investigate immediately; the previous release does not automatically return.

