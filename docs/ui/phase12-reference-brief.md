# Phase 12 — Research-first editorial homepage

Date: 2026-11-06 · English / Traditional Chinese · 1280×900, 390×844, 320×700

## Goal
Let professors, researchers, engineering interviewers and collaborators understand the central research question and explore supporting evidence without a dense wall of narrative.

## Approved visual and content system
- Existing live academic-minimalist homepage: https://gule7309.github.io/yuhisang.lo/
- Original preferred academic portfolio: https://ming053l.github.io/
- Research reading style: https://shikun.io/projects/clarity and https://lilianweng.github.io/posts/2023-06-23-agent/
- Existing design system and source-of-truth: static HTML/JS/CSS, Sveltia CMS profile.json and works.json. Do not change publication statuses, fabricate impact metrics, or replace layouts wholesale.

## Implementation decisions
- Make the existing profile headline central; change only its editorial eyebrow to research positioning, via bilingual interface labels.
- Add two prominent but restrained in-page links to Research and Projects; these are functional anchors, not dummy buttons.
- On each selected research item, show the exact existing CMS-authored research question above tags; omit the block for absent questions and for product cards.
- The compact generated homepage payload explicitly whitelists only two additional fields (research_question_en/zh), never methods, source-trace code or experimental result objects. Keep the size-reduction gate in CI.
- Preserve existing status/year, real media, paper ownership checks, original case study and code links.
- No new dependencies, tracking, account features, or changes to research/project detail pages.

## QA
- Verify all research questions bilingual match CMS values and escape HTML properly.
- Verify the hero links scroll to working section anchors and remain keyboard accessible.
- Real Chrome 1280/390/320, EN and zh, no overflow, link states; mobile dropdown and loading failure regressions preserved.
- Preserve Phase 10 archive filters and Phase 11A mobile navigation. Phase 11B synthetic research audit remains a separate Draft PR.
- No benchmark or academic publication claims without source evidence; no deploy/merge before user authorization.

## Remaining sign-off
Manual side-by-side visual review of generated screenshots, screen-reader check, authenticated CMS publishing test. CI can validate behavior but cannot certify aesthetics by itself.
