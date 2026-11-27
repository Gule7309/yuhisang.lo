# Phase 27 — Metadata and accessible localization

## Findings and scope

- The home page's shared English/中文 toggle operates at the same URL. Therefore the home page has a **single canonical URL** and does not claim a separate Chinese hreflang route.
- Static Research and Projects list pages were previously exposed as Open Graph `article` despite being collections; list pages now use `website`, while individual research notes and product cases remain `article`.
- Static archives and detail pages now include `x-default` linking to the English version alongside existing en and zh-Hant alternate URLs; `x-default` is not a claim that the home has a separately indexed Chinese page.
- Chinese static pages now use a Traditional Chinese skip-to-main label, preserving the keyboard navigation target.
- Homepage and static content pages now include canonical, Open Graph and Twitter/X summary metadata. No invented publication claims, fabricated social preview artwork or ranking guarantees are added.

## How to verify

Run `python -m unittest discover -s tests -p 'test_*.py' -v` plus the existing JS tests and Chromium regressions. Inspect generated EN/中文 archive and research/project detail HTML for canonical/alternates and the skip link. After publication validate Pages smoke. External social-preview crawlers, indexing behavior and real screen-reader usability still require separate assessment.

## Next

A focused accessibility pass should test headings, labels and keyboard/focus interactions using automated accessibility tooling and a manual screen reader, then address measured issues instead of equating HTML metadata with WCAG compliance.
