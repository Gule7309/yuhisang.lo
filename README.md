# Gule Luo — Research & Engineering Portfolio

A bilingual academic-style personal website with a Git-based content management system.

## Public site

After GitHub Pages deployment is enabled: https://gule7309.github.io/yuhisang.lo/

## Admin

Once the site is live, open https://gule7309.github.io/yuhisang.lo/admin/ .

The admin uses Sveltia CMS with GitHub. Sign in with a **fine-grained personal access token** restricted to **this repository**, granting **Contents: read and write**. Never put your token in Git, a chat, or public documentation. Save edits in the admin panel to commit the updated content to GitHub. Deployment reruns when the main branch is updated.

- `content/profile.json`: introduction, research interests, biography, school history, public contact information.
- `content/works.json`: research and engineering entries, summaries, tags, order, visibility and links.
- `content/news.json`: dated updates.
- Change `published` to false to hide an entry on the website (but **not** in the public GitHub repository).
- English and Traditional Chinese use the same structured content; click **EN** or **中文** on the website to switch.

## Enable GitHub Pages

In repository **Settings → Pages**, select **Source: GitHub Actions**. Then inspect **Actions → Publish portfolio**. The workflow uploads the static site and publishes to the project's `/yuhisang.lo/` path; no build dependencies or database are necessary.

If the Sveltia CMS editor cannot load, first check whether the CMS CDN is reachable and that GitHub sign-in is configured appropriately. The admin has not been browser-tested with a live GitHub token.

## Editorial checklist

Shipped public entries: When2ask, Authority-Aware Agents research direction, Trading Radar, VR Dementia experimental toolkit. All are labeled as in-progress/prototype as appropriate; no unverified papers, awards or clinical claims.

Next content candidates: PixelFit, Tavi, GPTL, selected experience and CV. Confirm disclosure permission and exact responsibilities before publishing. Add a suitable portrait and project screenshots rather than fabricated visuals.

## Technical notes

This project uses plain HTML, CSS, JavaScript and JSON. No application server or package manager is required. The layout is independently implemented, inspired by the restrained academic portfolio approach at https://ming053l.github.io/ . Content is escaped on rendering, and external links are limited to HTTPS/mailto URLs. GitHub Pages is the deployment target.

## Security

This is a public repository. Do not commit private drafts, credentials, confidential employer data or personal identifiers. A hidden `published:false` entry is still public in Git history.
