# Gule Luo — Research & Engineering Portfolio

A bilingual, academic-minimalist personal website for Yu-Hsiang (Gule) Luo, with a Git-based content-management interface.

**Website:** https://gule7309.github.io/yuhisang.lo/  
**CMS:** https://gule7309.github.io/yuhisang.lo/admin/  
**Detailed editing guide:** [CONTENT_GUIDE.md](CONTENT_GUIDE.md)

## Features

- English / Traditional Chinese, responsive academic researcher layout
- About, Research, Projects, Experience, Education and News
- Writing & Research Notes (expandable bilingual essays)
- Awards & Credentials with optional evidence links
- Personal introduction and optional photography gallery
- Recognizable icons for GitHub, LinkedIn, Instagram, X, Google Scholar, ORCID, Email, and more
- Multiple real screenshots, demo/video links, technical tags and publication status per project
- Public English CV PDF auto-generated from editorial content via GitHub Actions

## Editing the website

Open **/admin/** and sign in using a GitHub fine-grained personal access token restricted to **Gule7309/yuhisang.lo** with **Contents: Read and write**. Do not share the token. The Sveltia CMS editor directly changes content files on the repository's `main` branch. A GitHub Pages workflow publishes updates automatically.

| Content | Source |
| --- | --- |
| Profile / Education / Experience / Social icons / CV | `content/profile.json` |
| Research / Projects / Screenshot galleries | `content/works.json` |
| News | `content/news.json` |
| Writing / Research Notes | `content/writing.json` |
| Awards / Certifications | `content/achievements.json` |
| Photography / Personal | `content/personal.json` |

The `published` boolean controls visibility on the *website only*. The repository itself is **public**; hidden entries are still publicly accessible as JSON and Git history. Do not add private drafts, confidential work, private credentials or unapproved screenshots.

## Curriculum Vitae

The GitHub Pages workflow runs `scripts/generate_cv.py`, producing an English CV at `assets/generated-cv/Yu-Hsiang_Luo_CV.pdf` from the publicly editable JSON data. The PDF is regenerated on every deployment. The generator intentionally omits personal phone number, street address and unverified paper/award claims.

To use a custom-designed CV instead, upload the PDF in CMS under **Profile and Links → Public CV PDF**. The PDF will be stored in `assets/cv/`; saving updates `profile.cv_url` so the website uses the custom file.

## Deployment

GitHub Actions runs `.github/workflows/pages.yml` when `main` changes and publishes GitHub Pages. It installs ReportLab, generates the public CV and uploads the static website directory. GitHub Pages must be enabled with **Source: GitHub Actions**.

## Accuracy

Research-in-progress entries are not presented as peer-reviewed publications. Product prototypes and internal testing builds are not claimed to be released. Awards require verifiable details before they are published. External professional links are only added when the owner supplies a real account URL.

## Architecture

Plain static HTML/CSS/JavaScript and JSON; no application database, deployment API keys or server needed. Sveltia CMS is a separate static admin interface backed by GitHub. Bootstrap Icons supply accessible, recognizable social icon graphics; link labels remain readable without the icon CDN.
