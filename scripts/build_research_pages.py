#!/usr/bin/env python3
"""Render accurate bilingual research notes in the approved Clarity x Lil'Log style.

Reuse the existing academic site shell. Research pages are NOT publication records.
Only explicit, complete publication metadata permits a preprint/publication label.
"""
from __future__ import annotations

import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

import build_project_pages as base

ROOT = Path(__file__).resolve().parents[1]
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
ET.register_namespace("", SITEMAP_NS)

LABELS = {
    "en": {
        "index": "Research", "index_intro": "Research questions, experimental work, and developing ideas. Entries do not imply a peer-reviewed publication.",
        "eyebrow": "Research note", "back": "All research", "home": "Home",
        "toc": "On this page", "overview": "Overview",
        "question": "Research question", "background": "Background & motivation",
        "approach": "Research approach", "evaluation": "Evaluation plan",
        "progress": "Current progress", "limitations": "Limitations",
        "next_steps": "Next steps", "figures": "Figures & diagrams",
        "references": "References & related work", "read": "Explore research",
        "code": "Research code", "paper": "Own paper",
        "notice": "Research status", "not_published": "Work in progress — not a published or peer-reviewed paper. No experimental findings are claimed beyond the documented progress.",
        "proposal": "Research proposal — a working direction, not a completed study or published paper.",
        "preprint": "Author-provided preprint — not peer reviewed.",
        "published": "Peer-reviewed paper: ", "provenance": "Source", "year": "Year",
        "attribution": "Referenced work is credited to its original authors, not claimed as a publication by the site owner.",
    },
    "zh": {
        "index": "研究", "index_intro": "研究問題、實驗工作與持續發展的方向。列出研究不代表已有同儕審查論文。",
        "eyebrow": "研究筆記", "back": "所有研究", "home": "首頁",
        "toc": "本頁目錄", "overview": "研究概覽",
        "question": "研究問題", "background": "研究背景與動機",
        "approach": "研究方法", "evaluation": "評估規劃",
        "progress": "目前進度", "limitations": "研究限制",
        "next_steps": "下一步", "figures": "圖表與架構", "references": "參考文獻與相關研究",
        "read": "閱讀研究", "code": "研究程式碼", "paper": "本研究論文",
        "notice": "研究狀態", "not_published": "研究進行中，並非已發表或經同儕審查的論文；目前不宣稱已有實驗成果。",
        "proposal": "研究提案階段，尚非完成的實證研究，也未發表論文。",
        "preprint": "作者提供的預印本，尚未經同儕審查。",
        "published": "經同儕審查之論文：", "provenance": "資料來源", "year": "年份",
        "attribution": "參考研究均歸屬原始作者，並非此網站作者的論文發表成果。",
    }
}
SECTIONS = [
    ("question", "research_question"),
    ("background", "research_background"),
    ("approach", "research_approach"),
    ("evaluation", "research_evaluation"),
    ("progress", "research_progress"),
    ("limitations", "research_limitations"),
    ("next_steps", "research_next_steps"),
]


def archive_path(lang: str) -> str:
    return f'{base.PREFIX}/{"zh/" if lang == "zh" else ""}research/'


def note_path(slug: str, lang: str) -> str:
    return archive_path(lang) + slug + "/"


def meta_head(title: str, summary: str, item: dict | None, slug: str, lang: str) -> str:
    path = archive_path(lang) if item is None else note_path(slug, lang)
    en = archive_path("en") if item is None else note_path(slug, "en")
    zh = archive_path("zh") if item is None else note_path(slug, "zh")
    image = item.get("image", "") if item is not None else ""
    header = base.head(title, summary, "https://gule7309.github.io" + path, en, zh, image)
    return header + f'<link rel="stylesheet" href="{base.PREFIX}/research-pages.css">'


def publication_info(item: dict, lang: str) -> tuple[str, str, bool]:
    """Return truthful publication caption and whether an owned paper button is allowed."""
    l = LABELS[lang]
    state = item.get("publication_status") or "work_in_progress"
    paper = base.safe_href(item.get("paper", ""))
    if state == "preprint" and paper:
        return l["preprint"], "preprint", True
    if state == "peer_reviewed" and paper and str(item.get("publication_venue") or "").strip():
        return l["published"] + str(item["publication_venue"]), "published", True
    if item.get("status_type") == "proposal":
        return l["proposal"], "proposal", False
    return l["not_published"], "in_progress", False


def section_markup(section_id: str, title: str, content: str) -> str:
    return (f'<section class="research-section" id="{base.escape(section_id)}">'
            f'<h2>{base.escape(title)}</h2><div class="research-prose">'
            + base.paragraphs(content) + "</div></section>")


def figures_markup(item: dict, lang: str) -> str:
    result = []
    for fig in (item.get("research_figures") or []):
        if not isinstance(fig, dict):
            continue
        src = base.safe_href(fig.get("image", ""), allow_local=True)
        if not src:
            continue
        caption = base.localized(fig, "caption", lang)
        alt = base.localized(fig, "alt", lang) or caption or base.localized(item, "title", lang)
        source = base.safe_href(fig.get("source_url", ""))
        source_html = (f' <a href="{base.escape(source)}" target="_blank" '
                       f'rel="noopener noreferrer">{base.escape(LABELS[lang]["provenance"])} '
                       f'{base.icon("bi-box-arrow-up-right")}</a>') if source else ""
        result.append(
            f'<figure class="research-figure"><a href="{base.escape(src)}" target="_blank" rel="noopener noreferrer">'
            f'<img src="{base.escape(src)}" alt="{base.escape(alt)}" loading="lazy"></a>'
            f'<figcaption>{base.escape(caption)}{source_html}</figcaption></figure>'
        )
    if not result:
        return ""
    return (f'<section id="figures" class="research-section">'
            f'<h2>{base.escape(LABELS[lang]["figures"])}</h2>'
            f'<div class="research-figures">{"".join(result)}</div></section>')


def references_markup(item: dict, lang: str) -> str:
    rows = []
    for ref in (item.get("research_references") or []):
        if not isinstance(ref, dict):
            continue
        url = base.safe_href(ref.get("url", ""))
        title = base.localized(ref, "title", lang) or str(ref.get("title") or "")
        if not url or not title:
            continue
        note = base.localized(ref, "note", lang)
        extra = f'<small>{base.escape(note)}</small>' if note else ""
        rows.append(f'<li><a href="{base.escape(url)}" target="_blank" rel="noopener noreferrer">'
                    f'{base.escape(title)} {base.icon("bi-arrow-up-right")}</a>{extra}</li>')
    if not rows:
        return ""
    return (f'<section class="research-section" id="references">'
            f'<h2>{base.escape(LABELS[lang]["references"])}</h2>'
            f'<p class="research-reference-disclaimer">{base.escape(LABELS[lang]["attribution"])}</p>'
            f'<ol class="research-references">{"".join(rows)}</ol></section>')


def research_details(item: dict, profile: dict, lang: str) -> str:
    l = LABELS[lang]
    slug = item["slug"]
    title = base.localized(item, "title", lang)
    summary = base.localized(item, "summary", lang)
    description, pub_kind, has_own_paper = publication_info(item, lang)
    sections = [
        (id_, l[id_], base.localized(item, field, lang))
        for id_, field in SECTIONS if base.localized(item, field, lang).strip()
    ]
    figures_html = figures_markup(item, lang)
    references_html = references_markup(item, lang)
    toc = [(id_, label) for id_, label, _ in sections]
    if figures_html:
        toc.append(("figures", l["figures"]))
    if references_html:
        toc.append(("references", l["references"]))
    nav_html = (
        '<details class="research-toc" open><summary>'
        + base.icon("bi-list-ul") + base.escape(l["toc"]) + '</summary><nav aria-label="'
        + base.escape(l["toc"]) + '"><ol>'
        + "".join(f'<li><a href="#{base.escape(anchor)}">{base.escape(label)}</a></li>'
                  for anchor, label in toc)
        + '</ol></nav></details>'
    ) if toc else ""
    resource_buttons = "".join([
        base.link(item.get("github"), l["code"], "case-link", "bi-github"),
        base.link(item.get("paper"), l["paper"], "case-link", "bi-file-earmark-text") if has_own_paper else "",
    ])
    actions = f'<div class="case-actions">{resource_buttons}</div>' if resource_buttons else ""
    hero_image = base.safe_href(item.get("image"), allow_local=True)
    cover = (f'<figure class="research-cover"><img src="{base.escape(hero_image)}" '
             f'alt="{base.escape(title)}" loading="eager"></figure>') if hero_image else ""
    body = (
        f'<a class="case-back" href="{base.escape(archive_path(lang))}">{base.icon("bi-arrow-left")} '
        f'{base.escape(l["back"])}</a>'
        f'<p class="eyebrow">{base.escape(l["eyebrow"])}</p>'
        f'<h1 class="research-title">{base.escape(title)}</h1>'
        f'<div class="research-meta">{base.badge(item, lang)}'
        f'<span>{base.escape(item.get("year", ""))}</span></div>'
        f'<p class="research-lead">{base.escape(summary)}</p>'
        + base.tags(item)
        + f'<aside class="research-disclosure research-disclosure--{pub_kind}" aria-label="{base.escape(l["notice"])}">'
        + f'{base.icon("bi-info-circle")}<div><strong>{base.escape(l["notice"])}</strong>'
        + f'<p>{base.escape(description)}</p></div></aside>'
        + actions + cover + nav_html
        + "".join(section_markup(i, name, text) for i, name, text in sections)
        + figures_html + references_html
        + f'<footer class="research-footer"><a href="{base.escape(archive_path(lang))}">'
        f'{base.icon("bi-arrow-left")} {base.escape(l["back"])}</a></footer>'
    )
    return base.shell(profile, lang, meta_head(title, summary, item, slug, lang),
                      body, note_path(slug, "en"), note_path(slug, "zh"),
                      active="research", main_class="project-content research-content")


def research_index(items: list[dict], profile: dict, lang: str) -> str:
    l = LABELS[lang]
    rendered = []
    for item in sorted(items, key=lambda x: (x.get("order", 50), x["slug"])):
        title = base.localized(item, "title", lang)
        summary = base.localized(item, "summary", lang)
        path = note_path(item["slug"], lang)
        statement, _, _ = publication_info(item, lang)
        rendered.append(
            f'<article class="research-index-item"><div class="research-index-main">'
            f'<div class="research-index-meta">{base.badge(item, lang)}'
            f'<span>{base.escape(item.get("year", ""))}</span></div>'
            f'<h2><a href="{base.escape(path)}">{base.escape(title)}</a></h2>'
            f'<p>{base.escape(summary)}</p>'
            f'<div class="research-index-actions"><a href="{base.escape(path)}">'
            f'{base.escape(l["read"])} {base.icon("bi-arrow-up-right")}</a></div></div></article>'
        )
    main = (
        f'<a class="case-back" href="{base.PREFIX}/#research">{base.icon("bi-arrow-left")} '
        f'{base.escape(l["home"])}</a>'
        f'<p class="eyebrow">{base.escape(l["eyebrow"])}</p>'
        f'<h1 class="research-title">{base.escape(l["index"])}</h1>'
        f'<p class="research-lead">{base.escape(l["index_intro"])}</p>'
        + "".join(rendered)
    )
    return base.shell(profile, lang, meta_head(l["index"], l["index_intro"], None, "", lang),
                      main, archive_path("en"), archive_path("zh"),
                      active="research", main_class="project-content research-content")


def save(path: str, text: str) -> None:
    output = ROOT / path
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(text, encoding="utf-8")


def merge_sitemap(locations: list[str]) -> None:
    path = ROOT / "sitemap.xml"
    if path.exists():
        tree = ET.parse(path)
        root = tree.getroot()
    else:
        root = ET.Element(f"{{{SITEMAP_NS}}}urlset")
        tree = ET.ElementTree(root)
    existing = {el.text for el in root.findall(f".//{{{SITEMAP_NS}}}loc")}
    for loc in locations:
        if loc in existing:
            continue
        url = ET.SubElement(root, f"{{{SITEMAP_NS}}}url")
        ET.SubElement(url, f"{{{SITEMAP_NS}}}loc").text = loc
        existing.add(loc)
    tree.write(path, encoding="utf-8", xml_declaration=True)


def build() -> int:
    profile = json.loads((ROOT / "content/profile.json").read_text(encoding="utf-8"))
    data = json.loads((ROOT / "content/works.json").read_text(encoding="utf-8"))
    research = [w for w in data if w.get("published") and w.get("category") == "research"]
    slugs = [str(x.get("slug") or "") for x in research]
    if len(slugs) != len(set(slugs)) or any(not SLUG_RE.fullmatch(x) for x in slugs):
        raise ValueError("Published research slugs must be unique and URL-safe")
    locs = []
    for lang in LABELS:
        index = archive_path(lang)
        save(f'{"zh/" if lang == "zh" else ""}research/index.html',
             research_index(research, profile, lang))
        locs.append("https://gule7309.github.io" + index)
        for item in research:
            page = note_path(item["slug"], lang)
            save(f'{"zh/" if lang == "zh" else ""}research/{item["slug"]}/index.html',
                 research_details(item, profile, lang))
            locs.append("https://gule7309.github.io" + page)
    merge_sitemap(locs)
    print(f"Built {len(research)} research entries in EN/zh-Hant, updated sitemap.")
    return len(research)


if __name__ == "__main__":
    build()
