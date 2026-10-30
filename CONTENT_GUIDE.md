# Portfolio Content Management Guide

**Live site:** https://gule7309.github.io/yuhisang.lo/  
**CMS:** https://gule7309.github.io/yuhisang.lo/admin/

The website is intentionally academic and selective: real, public evidence matters more than an exhaustive project list.

## How content is stored

| CMS section | Data | What to update |
| --- | --- | --- |
| Profile, Education and Experience | `content/profile.json` | Headline, biography, schools, role descriptions, socials, CV |
| Research and Projects | `content/works.json` | Research, products, image, screenshot gallery, links, ordering |
| News | `content/news.json` | Public dated updates |
| Writing & Research Notes | `content/writing.json` | Notes with bilingual summary and article body |
| Awards & Credentials | `content/achievements.json` | Evidence-backed achievements, English exams and awards |
| Beyond Research & Photography | `content/personal.json` | Small personal introduction and a photo gallery |

Sveltia CMS uses a repository-limited GitHub token with **Contents: Read and write**. Keep the token private. Every save commits the changed JSON file to `main` and triggers GitHub Pages deployment. A new `published:false` entry is hidden from the website, but **NOT** from this public GitHub repo; keep confidential material outside this repo.

## CV (automatically generated)

The PDF at `/assets/generated-cv/Yu-Hsiang_Luo_CV.pdf` is generated on each Pages deployment by `scripts/generate_cv.py`. It uses **public** data from `profile.json`, `works.json`, and `achievements.json` (English fields only). No personal phone, home address, private employer documents, or experimental results are used.

To replace the automatically generated PDF with a bespoke version, open **Profile and Links → Public CV PDF**, upload a PDF, and save. Sveltia stores it under `assets/cv/`, updates the profile URL, and the site then links to your uploaded file. The generated PDF remains available but is no longer the primary CV link.

## Project screenshots / demos

For each entry under **Research and Projects**:
1. Add a real project screenshot through **Cover image** (recommended landscape 1200×750).
2. Add up to 2–3 annotated screenshots under **Real screenshots**, with short bilingual captions.
3. Fill **Demo URL** only when a publicly accessible working demo exists.
4. Fill **Public demo video URL** for a public YouTube or video walkthrough.
5. Fill **GitHub URL** only for repositories intentionally made public.
6. Use meaningful statuses: *Research proposal*, *Research in progress*, *Prototype*, *Internal testing*, or *Released*.

If media URLs are empty, the website displays typographic project covers instead of fabricated screenshots or broken buttons.

## Status colors for new projects

Open **Research and Projects** in the CMS, create or edit an entry, and fill in the bilingual status labels. The new **Status color / 狀態顏色** dropdown controls its color and associated status icon:

| CMS stage | Visual | Example |
| --- | --- | --- |
| Exploration | Muted amber | Prototype exploration / 原型探索中 |
| Active development | Muted teal | Active prototype / 持續開發中的原型 |
| Testing | Muted indigo | Internal testing / 內部測試中 |
| Prototype | Muted blue | General prototype |
| Research | Blue | Research in progress |
| Proposal | Violet | Research proposal |
| Released | Green | Released |
| Paused | Gray | On hold |
| Auto (default) | Inferred from EN/ZH labels; neutral fallback when unknown | Future projects |

The status **text remains authoritative**: color is a visual aid, never evidence that a product is released or that research is accepted. New entries with an unrecognized label still display a generic icon and neutral badge.

## Social and professional icons

Every new social link displays an icon. The site first respects a selected **Icon** in the CMS; when set to **Auto** or left empty, it recognizes common platform names or URL domains (GitHub, LinkedIn, X, Instagram, YouTube, Google Scholar, ORCID, Discord, Substack, etc.). Unknown platforms use a generic link icon. No new code is required for supported platforms; unsupported platforms can be added to the mapping later. Missing accounts are never invented.

**Current known public links:** GitHub, LinkedIn, Instagram. To add X, Google Scholar, or ORCID, use the real profile URL only when ready.

## Evidence and public disclosure

- **Research:** When2ask and authority-aware agents are ongoing work, not accepted or peer-reviewed publications.
- **Experience:** ELAN Microelectronics GenAI internship and a 2026 QA/AI support role are summarized at a high level, without private work artifacts or unverified performance claims. Confirm official role titles before formal applications.
- **Certificates:** TOEFL iBT 99 and TOEIC 895 are taken from existing personal CV material; attach proof links only if privacy-safe.
- **Awards:** No unverified scholarship or competition win has been published. Add the award, year, issuer and public evidence before enabling `published`.
- **PixelFit/Tavi/GPTL:** Product status is labelled honestly. Do not publish internal access credentials, private builds, or unapproved screenshots.
- **Photography:** Only explicitly chosen images should be uploaded. Strip EXIF location metadata when appropriate.

## Next assets to supply

- One professional portrait or existing approved photo
- Public demos/screenshots for PixelFit, Tavi and Trading Radar (without test-account data)
- Official CV additions and relevant proof of awards / ICIM 2025 conference record
- Optional X / Google Scholar / ORCID URLs
- A public email address only when you choose to show one


## Featured homepage projects and product case studies

The homepage Projects section shows only published projects with **Featured = true**. All other published projects appear in the **All Projects** archive after deployment. Use the Project section of the CMS to change ordering, Featured, and Public visibility.

**Product case studies:** Every published project entry automatically receives its own static English and Chinese URLs:

- English: https://gule7309.github.io/yuhisang.lo/projects/{slug}/
- Traditional Chinese: https://gule7309.github.io/yuhisang.lo/zh/projects/{slug}/

The CMS now supports optional bilingual fields for My Role, Problem & Motivation, Approach, Progress & Evidence, and Next Steps. If a field is empty, the corresponding page section is not shown. Real uploaded images, screenshots, videos, and repository links appear only when present.

**Product case studies and research notes use separate templates.** The research note template was approved on 2026-10-30 (Clarity + Lil'Log inspiration). It has its own archive and truthful publication status controls.

A project edit is published by GitHub Pages Actions, which regenerates the project archive, the localized pages, and sitemap.xml from the current data. **Draft content must never be added to this public repository if it is confidential.**


## Managing research pages (Clarity + Lil'Log style)

Research notes are separate from Products and **are not automatically publications**.

- **All Research:** https://gule7309.github.io/yuhisang.lo/research/
- **Example research note:** https://gule7309.github.io/yuhisang.lo/research/when2ask/
- **Chinese:** https://gule7309.github.io/yuhisang.lo/zh/research/when2ask/
- All published research records in `content/works.json` with `category=research` receive their own pages when GitHub Pages builds.

In **CMS → Research and Projects**, select **Section: research**. The new bilingual Research fields support Question, Background, Approach, Evaluation Plan, Current Progress, Limitations, Next Steps, Verified Figures and References & Prior Work. Empty sections will be omitted. A compact table of contents is generated from the sections actually present. Uploaded figures must be authentic and have a descriptive alt text and provenance when derived from an external source.

**Publication status is distinct from website visibility.**

| CMS value | Page handling |
| --- | --- |
| Work in progress | Clearly states that it is not a published or peer-reviewed paper; does not display an Own paper button |
| Preprint | Requires an actual URL to your own manuscript; clearly labels it as not peer-reviewed |
| Peer-reviewed publication | Requires both a verified venue and the link to your own paper; displays that venue in the status note |
| Missing or incomplete publication fields | Falls back to a work-in-progress note |

The status/color pill still describes development stage (`Research in progress`, `Proposal`, etc.). The publication field describes scholarly dissemination; they are **not interchangeable**. **References to another author's published work belong in References & Prior Work, not the Own paper field.**

The seeded [When2ask](https://github.com/Gule7309/When2ask) page describes an instrumented SAGE mechanism reconstruction and planned tests. It does not claim measured benchmark improvements or coauthorship of the Suri et al. ACL 2026 paper. Authority-Aware Agents is shown as a proposal with no experiment results claimed.

On every future Pages deployment, `scripts/build_project_pages.py` runs first, then `scripts/build_research_pages.py` creates bilingual research routes and safely extends `sitemap.xml`.

