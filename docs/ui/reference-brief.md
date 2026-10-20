# Reference Brief — Colored Status Badges and Auto Icons

**Date:** 2026-10-20  
**Project:** Gule Luo Research & Engineering Portfolio (static HTML/CSS/JS on GitHub Pages)  
**Mode:** system — refine already-approved academic-minimalist design without redesigning layout  
**Target:** `/#research`, `/#projects`, sidebar and Contact social links, `/admin/`  
**Reference:** https://gule7309.github.io/yuhisang.lo/ (approved current site); https://ming053l.github.io/ (user-provided academic layout inspiration). Existing content and typography are authoritative, not copied markup.

## User task and style constraints

Distinguish meaningful project stages including **原型探索中** and **持續開發中的原型** while preserving restrained, text-first academic visual hierarchy. When future social links are added, select a recognizable brand icon automatically where the platform is known, and a generic link icon otherwise. New research/projects must support explicit status color selection through the CMS.

## Tokens (specified, not measured from source screenshot)

| Status | Foreground | Background | WCAG contrast |
| --- | --- | --- | --- |
| Exploration / 探索 | `#8D550C` | `#FFF5E5` | 5.66:1 |
| Active / 持續開發 | `#116354` | `#E7F7F2` | 6.46:1 |
| Testing / 測試 | `#5145A2` | `#F0EEFF` | 6.75:1 |
| Prototype / 原型 | `#2E5D84` | `#EDF4FA` | 6.28:1 |
| Research / 研究 | `#2A5F95` | `#EAF2FB` | 5.87:1 |
| Proposal / 提案 | `#72538B` | `#F5EFFB` | 5.60:1 |
| Released / 上線 | `#256940` | `#E9F7EE` | 5.99:1 |
| Paused / 暫停 | `#626872` | `#F2F4F6` | 5.09:1 |
| Unknown / default | `#536477` | `#F4F7F9` | 5.65:1 |

**Component spec:** `status-badge` retains legible status text; icon is supporting, never sole signal. Padding 4px × 9px; radius 6px; thin tinted border; typography about 10.5px bold to align with preexisting `.badge`. Bootstrap Icons are already loaded on the site. New social links use explicit icon → label → URL host → generic icon resolution, with a safe whitelist.

**No change:** page structure, type scale, navigation, URLs, content claims, CV generator, deployment architecture, or CMS authentication. Existing work records are enriched with `status_type`; users may choose **Auto** for inferred coloring.

## Acceptance criteria

- GPTL amber, Tavi teal, PixelFit indigo, When2ask blue, proposals violet.
- New work with empty or unknown status type renders neutral badge and safe icon.
- New social link with recognized URL renders the matching platform icon; unknown URLs render generic link.
- Desktop 1100×850 and mobile 390×844 component states have no horizontal overflow.
- WCAG AA normal text contrast (all nine status palettes >=4.5:1).
- Build workflow validates CMS YAML and runs Node metadata tests.
