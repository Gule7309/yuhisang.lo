# Phase 28 — Accessibility & Mobile Interaction QA

**Date:** 2026-11-27  
**Authoritative design reference:** Current [Gule Luo portfolio](https://gule7309.github.io/yuhisang.lo/) (restrained blue-white academic editorial style). No new visual identity, external screenshot or Figma frame was used.

## Screens, fixtures and environments

- Chromium on GitHub Actions, viewport **390×844** (mobile) and **1280×844** (desktop).
- Routes: homepage EN (both), homepage 中文 (mobile toggle), Research & Projects archives EN/中文 (all mobile), CMS published-content Review Center, CMS Publishing Dashboard.
- Build-time HTML from existing Python/Node generators; local HTTP server; deterministic published-content and GitHub API fixtures for CMS dashboards.
- `axe-core@4.10.3` tagged WCAG 2 A/AA and WCAG 2.1 A/AA plus best-practice. Test script: `scripts/audit_accessibility.cjs`. JSON artifact: `artifacts/uiqa/accessibility-audit.json` in the PR browser job.
- Existing GitHub Actions screenshot job captures homepage and research/project pages to `artifacts/uiqa/`, linked from the relevant PR run. Screenshot generation is **not** a substitute for direct human visual inspection.

## Findings → repairs

| Area | Before (axe / keyboard) | Repair | Automated result |
| --- | --- | --- | --- |
| Color contrast | `color-contrast` serious on all 9 audited states. Examples: inactive language selector #718296 on white 3.93:1, muted eyebrow #5f809e 4.14:1, archive result count #7b8d9e 3.41:1 | Darkened only low-contrast **text** tokens across existing homepage/archive/research/CMS styles while preserving the editorial palette | axe tagged rules no longer produce serious/moderate violations on covered states |
| Project links | `link-name` serious on Projects archives EN/中文; clickable image had empty alt and no alternative accessible name | Added project title to the image link's `aria-label` | Link-name violations resolved in audit |
| CMS keyboard focus | Selecting a review item rebuilt its button list, removing focused element from DOM | Preserve the selected button and update its `aria-pressed` state rather than destroying all buttons | Chromium Enter selection retains keyboard focus |
| Mobile menu | Need deterministic functional coverage | Validate Enter opens menu, Escape closes, focus returns to toggle; verify Chinese switch | Chromium functional assertions pass |
| Archive search | Need deterministic filter/clear coverage | Verify search zero-results, clear, restored results and returned search focus | Chromium functional assertions pass |
| Mobile overflow | Need actual viewport coverage | Check document width does not exceed viewport | Chromium coverage passes |

## Quality gates

- **Automated accessibility:** PASS for included axe WCAG 2.1 tagged rules and scripted states; **not a WCAG conformance certification**.
- **Keyboard/Focus:** PASS in tested menu, search and CMS selection flows. Full-site tab-order / focus appearance still requires a human walkthrough.
- **Responsive overflow:** PASS at representative 390 CSS-pixel width. Other devices and 200% zoom need manual checks.
- **Regression:** Node/Python and existing Chromium workflows required to pass before merge.
- **Visual fidelity:** Current palette and layout preserved through scoped text contrast changes. Existing screenshot artifacts are available; no claim of manual pixel-by-pixel review or screenshot diff score.
- **Screen reader:** NOT TESTED with VoiceOver/NVDA/TalkBack. Human verification is a remaining requirement.
- **WCAG 2.2:** NOT CERTIFIED. Axe tag coverage here targets WCAG 2.1 A/AA and best-practice only; 2.2 pointer-target/focus-obscured scenarios require manual review.

## Follow-up

Manually inspect screenshots at both widths for unintended typography/contrast shifts, use keyboard-only navigation across both archive languages, and test with a real screen reader before claiming WCAG 2.2 AA. Keep future interactive 3D elements optional, keyboard-accessible, reduced-motion-aware, and nonessential to understanding the research portfolio.
