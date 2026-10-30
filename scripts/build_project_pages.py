#!/usr/bin/env python3
"""Generate SEO-friendly bilingual product case-study pages from Sveltia CMS JSON.

Research/paper detail pages are intentionally out of scope until the design is approved.
This generator only creates pages for published works with category == "project".
No new dependencies are required.
"""
from __future__ import annotations

import html
import json
import re
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://gule7309.github.io/yuhisang.lo"
PREFIX = "/yuhisang.lo"
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
STATUS_STYLES = {
    "proposal", "research", "exploration", "prototype", "active",
    "testing", "released", "paused", "default"
}
STATUS_ICONS = {
    "proposal": "bi-lightbulb", "research": "bi-search",
    "exploration": "bi-compass", "prototype": "bi-layers",
    "active": "bi-arrow-repeat", "testing": "bi-clipboard-check",
    "released": "bi-check-circle", "paused": "bi-pause-circle",
    "default": "bi-tag",
}
SOCIAL_ICONS = {
    "github": "bi-github", "linkedin": "bi-linkedin",
    "instagram": "bi-instagram", "x": "bi-twitter-x",
    "twitter": "bi-twitter-x", "youtube": "bi-youtube",
    "scholar": "bi-mortarboard", "orcid": "bi-person-vcard",
    "email": "bi-envelope",
}
LABELS = {
    "en": {
        "about": "About", "projects": "All Projects", "research": "Research",
        "case": "Project Case Study", "back": "All Projects",
        "featured": "Selected Products & Engineering", "summary": "Overview",
        "challenge": "Problem & Motivation", "approach": "Approach",
        "role": "My Role", "outcome": "Progress & Evidence",
        "next_steps": "Next Steps", "gallery": "Screenshots",
        "demo": "Live Demo", "github": "Source Code",
        "paper": "Paper", "video_link": "Video Walkthrough",
        "no_media": "Screenshots are not yet public.",
        "empty": "No public projects have been added yet.",
        "intro": "An index of products and engineering prototypes. Status reflects the current development stage.",
        "contact": "Contact",
    },
    "zh": {
        "about": "關於", "projects": "全部專案", "research": "研究",
        "case": "專案詳細介紹", "back": "全部專案",
        "featured": "精選產品與工程作品", "summary": "專案簡介",
        "challenge": "問題與動機", "approach": "解法與設計",
        "role": "我的角色", "outcome": "進度與可驗證成果",
        "next_steps": "下一步", "gallery": "實際畫面",
        "demo": "公開 Demo", "github": "原始碼",
        "paper": "論文", "video_link": "展示影片",
        "no_media": "目前尚無公開畫面。",
        "empty": "目前尚未公開專案。",
        "intro": "整理公開產品與工程原型；狀態標籤代表目前開發階段。",
        "contact": "聯絡",
    },
}


def escape(value: object) -> str:
    return html.escape(str(value if value is not None else ""), quote=True)


def localized(record: dict, field: str, lang: str) -> str:
    return str(record.get(f"{field}_{lang}") or record.get(f"{field}_en") or "")


def safe_href(raw: object, *, allow_local: bool = False) -> str:
    value = str(raw or "").strip()
    if not value or any(c in value for c in "\r\n\t"):
        return ""
    parsed = urlparse(value)
    if parsed.scheme == "https" and parsed.netloc:
        return value
    if parsed.scheme == "mailto" and parsed.path and not allow_local:
        return value
    if allow_local and not parsed.scheme and value.startswith(PREFIX + "/assets/"):
        return value
    if allow_local and not parsed.scheme and value.startswith("assets/"):
        return PREFIX + "/" + value
    return ""


def icon(css_name: str) -> str:
    return f'<i class="bi {escape(css_name)}" aria-hidden="true"></i>'


def link(href: object, label: str, css_class: str = "", bi: str = "") -> str:
    safe = safe_href(href)
    if not safe:
        return ""
    klass = f' class="{escape(css_class)}"' if css_class else ""
    return (f'<a{klass} href="{escape(safe)}" rel="noopener noreferrer" target="_blank">'
            f'{icon(bi) if bi else ""}<span>{escape(label)}</span></a>')


def tags(record: dict) -> str:
    values = record.get("tags") or []
    if not isinstance(values, list):
        return ""
    return '<div class="tags">' + "".join(f"<span>{escape(t)}</span>" for t in values) + "</div>"


def status_stage(record: dict) -> str:
    stage = str(record.get("status_type") or "").lower()
    if stage in STATUS_STYLES:
        return stage
    value = (str(record.get("status_en") or "") + " " + str(record.get("status_zh") or "")).lower()
    if any(s in value for s in ["internal testing", "beta testing", "內部測試", "測試中"]):
        return "testing"
    if any(s in value for s in ["active prototype", "持續開發", "in development"]):
        return "active"
    if any(s in value for s in ["exploration", "exploratory", "探索", "構想"]):
        return "exploration"
    if any(s in value for s in ["released", "已上線", "正式上架"]):
        return "released"
    if any(s in value for s in ["prototype", "原型"]):
        return "prototype"
    return "default"


def badge(record: dict, lang: str) -> str:
    stage = status_stage(record)
    return (f'<span class="badge status-badge status-badge--{stage}">'
            f'{icon(STATUS_ICONS[stage])}<span>{escape(localized(record, "status", lang))}</span>'
            f'</span>')


def paths(slug: str) -> dict[str, str]:
    return {
        "en": f"{PREFIX}/projects/{slug}/",
        "zh": f"{PREFIX}/zh/projects/{slug}/",
    }


def index_path(lang: str) -> str:
    return f'{PREFIX}/{"zh/" if lang == "zh" else ""}projects/'


def head(title: str, description: str, canonical: str,
         alt_en: str, alt_zh: str, image: str = "") -> str:
    og_image = safe_href(image, allow_local=True)
    if og_image.startswith(PREFIX + "/"):
        og_image = "https://gule7309.github.io" + og_image
    meta_img = f'<meta property="og:image" content="{escape(og_image)}">' if og_image else ""
    return (f'<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{escape(title)} | Gule Luo</title>'
            f'<meta name="description" content="{escape(description)}">'
            f'<meta property="og:type" content="article">'
            f'<meta property="og:title" content="{escape(title)}">'
            f'<meta property="og:description" content="{escape(description)}">'
            f'<meta property="og:url" content="{escape(canonical)}">{meta_img}'
            f'<link rel="canonical" href="{escape(canonical)}">'
            f'<link rel="alternate" hreflang="en" href="https://gule7309.github.io{escape(alt_en)}">'
            f'<link rel="alternate" hreflang="zh-Hant" href="https://gule7309.github.io{escape(alt_zh)}">'
            f'<link rel="stylesheet" href="{PREFIX}/style.css">'
            f'<link rel="stylesheet" href="{PREFIX}/extras.css">'
            f'<link rel="stylesheet" href="{PREFIX}/status-badges.css">'
            f'<link rel="stylesheet" href="{PREFIX}/project-pages.css">'
            '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css">')


def shell(profile: dict, lang: str, head_html: str, main: str,
          english: str, chinese: str) -> str:
    label = LABELS[lang]
    home = PREFIX + "/"
    portrait = safe_href(profile.get("avatar"), allow_local=True)
    img = (f'<img class="avatar" src="{escape(portrait)}" alt="{escape(localized(profile, "name", lang))}">'
           if portrait else "")
    social_items = []
    for item in profile.get("socials") or []:
        name = str(item.get("label") or "")
        link_icon = SOCIAL_ICONS.get(str(item.get("icon") or name).lower().replace(" ", ""), "bi-link-45deg")
        social_items.append(link(item.get("url"), name, "social-link", link_icon))
    contact_email = profile.get("email")
    if contact_email:
        social_items.insert(0, link("mailto:" + str(contact_email), "Email", "social-link", "bi-envelope"))
    social = "".join(social_items)
    cv = link(profile.get("cv_url"), "Curriculum Vitae ↗", "profile-quicklink", "bi-file-earmark-pdf")
    aside = (
        f'{img}<h2>{escape(profile.get("short_name") or "Gule Luo")}</h2>'
        f'<p class="role">{escape(localized(profile, "role", lang))}<br>'
        f'{escape(localized(profile, "affiliation", lang))}</p>'
        f'<p class="side-message">{escape(localized(profile, "headline", lang))}</p>'
        f'<div class="socials">{social}</div>{cv}'
    )
    en_class = ' class="selected"' if lang == "en" else ""
    zh_class = ' class="selected"' if lang == "zh" else ""
    nav = (f'<a href="{home}#about">{escape(label["about"])}</a>'
           f'<a href="{home}#research">{escape(label["research"])}</a>'
           f'<a href="{escape(index_path(lang))}" aria-current="page">{escape(label["projects"])}</a>'
           f'<a href="{home}#contact">{escape(label["contact"])}</a>')
    return (
        '<!doctype html><html lang="' + ("zh-Hant" if lang == "zh" else "en") + '"><head>'
        + head_html + '</head><body><a href="#main" class="skip">Skip to content</a>'
        '<header><div class="top"><a class="logo" href="' + home + '">Gule Luo</a>'
        '<nav aria-label="Main navigation">' + nav + '</nav>'
        '<div class="language">'
        f'<a{en_class} href="{escape(english)}" lang="en">EN</a>'
        f'<a{zh_class} href="{escape(chinese)}" lang="zh-Hant">中文</a>'
        '</div></div></header><div class="layout">'
        '<aside class="sidebar">' + aside + '</aside>'
        '<main class="content project-content" id="main">' + main + '</main></div></body></html>'
    )


def paragraphs(raw: str) -> str:
    return "".join(
        f"<p>{escape(part.strip())}</p>"
        for part in re.split(r"\n\s*\n", raw)
        if part.strip()
    )


def info_section(item: dict, lang: str, field: str) -> str:
    value = localized(item, field, lang).strip()
    if not value:
        return ""
    return (f'<section class="case-section"><h2>{escape(LABELS[lang][field])}</h2>'
            f'{paragraphs(value)}</section>')


def gallery(item: dict, lang: str) -> str:
    photos = item.get("gallery") or []
    output = []
    for photo in photos if isinstance(photos, list) else []:
        if not isinstance(photo, dict):
            continue
        src = safe_href(photo.get("image"), allow_local=True)
        if not src:
            continue
        caption = localized(photo, "caption", lang) or localized(item, "title", lang)
        output.append(
            f'<figure><a href="{escape(src)}" target="_blank" rel="noopener noreferrer">'
            f'<img src="{escape(src)}" loading="lazy" alt="{escape(caption)}"></a>'
            f'<figcaption>{escape(caption)}</figcaption></figure>'
        )
    if not output:
        return ""
    return (f'<section class="case-section" id="gallery"><h2>{escape(LABELS[lang]["gallery"])}</h2>'
            f'<div class="case-gallery">{"".join(output)}</div></section>')


def resource_links(item: dict, lang: str) -> str:
    result = "".join(
        link(item.get(key), LABELS[lang][key], "case-link", {
            "demo": "bi-box-arrow-up-right", "github": "bi-github",
            "paper": "bi-file-earmark-text", "video_link": "bi-play-circle",
        }[key])
        for key in ["demo", "github", "video_link", "paper"]
    )
    return f'<div class="case-actions">{result}</div>' if result else ""


def details(item: dict, profile: dict, lang: str) -> str:
    slug = item["slug"]
    title = localized(item, "title", lang)
    summary = localized(item, "summary", lang)
    path = paths(slug)
    primary = path[lang]
    canonical = "https://gule7309.github.io" + primary
    safe_img = safe_href(item.get("image"), allow_local=True)
    media = (f'<figure class="case-cover"><img src="{escape(safe_img)}"'
             f' alt="{escape(title)}" loading="eager"></figure>') if safe_img else ""
    main = (
        f'<a class="case-back" href="{escape(index_path(lang))}">'
        f'{icon("bi-arrow-left")} {escape(LABELS[lang]["back"])}</a>'
        f'<p class="eyebrow">{escape(LABELS[lang]["case"])}</p>'
        f'<h1 class="case-title">{escape(title)}</h1>'
        f'<div class="case-status">{badge(item, lang)}'
        f'<span class="case-year">{escape(item.get("year") or "")}</span></div>'
        f'<p class="case-lead">{escape(summary)}</p>'
        + tags(item) + resource_links(item, lang) + media
        + info_section(item, lang, "role")
        + info_section(item, lang, "challenge")
        + info_section(item, lang, "approach")
        + info_section(item, lang, "outcome")
        + info_section(item, lang, "next_steps")
        + gallery(item, lang)
        + f'<footer class="case-footer"><a href="{escape(index_path(lang))}">'
        f'{icon("bi-arrow-left")} {escape(LABELS[lang]["back"])}</a></footer>'
    )
    return shell(profile, lang, head(title, summary, canonical, path["en"], path["zh"], safe_img),
                 main, path["en"], path["zh"])


def listing(works: list[dict], profile: dict, lang: str) -> str:
    path = index_path(lang)
    alternate = {"en": index_path("en"), "zh": index_path("zh")}
    title = LABELS[lang]["projects"]
    items = []
    for item in sorted(works, key=lambda x: (x.get("order", 50), x["slug"])):
        label = localized(item, "title", lang)
        url = paths(item["slug"])[lang]
        image = safe_href(item.get("image"), allow_local=True)
        cover = (f'<img src="{escape(image)}" alt="" loading="lazy">' if image else
                 f'<span class="case-placeholder">{escape(item["slug"].replace("-", " ").title())}</span>')
        items.append(
            f'<article class="project-list-item"><a class="project-list-cover" href="{escape(url)}">'
            f'{cover}</a><div><div class="case-status">{badge(item,lang)}'
            f'<span class="case-year">{escape(item.get("year") or "")}</span></div>'
            f'<h2><a href="{escape(url)}">{escape(label)}</a></h2>'
            f'<p>{escape(localized(item,"summary",lang))}</p>'
            f'<a class="case-more" href="{escape(url)}">'
            f'{escape("Read case study" if lang == "en" else "閱讀專案詳情")} {icon("bi-arrow-up-right")}'
            f'</a></div></article>'
        )
    main = (f'<a class="case-back" href="{PREFIX}/#projects">{icon("bi-arrow-left")}'
            f' {escape("Home" if lang == "en" else "首頁")}</a>'
            f'<p class="eyebrow">{escape(LABELS[lang]["featured"])}</p>'
            f'<h1 class="case-title">{escape(title)}</h1>'
            f'<p class="case-lead">{escape(LABELS[lang]["intro"])}</p>'
            + ("".join(items) if items else f'<p>{escape(LABELS[lang]["empty"])}</p>'))
    canonical = "https://gule7309.github.io" + path
    return shell(profile, lang, head(title, LABELS[lang]["intro"], canonical,
                                     alternate["en"], alternate["zh"]),
                 main, alternate["en"], alternate["zh"])


def save(relpath: str, content: str) -> None:
    dest = ROOT / relpath
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(content, encoding="utf-8")


def build() -> int:
    profile = json.loads((ROOT / "content/profile.json").read_text(encoding="utf-8"))
    works = json.loads((ROOT / "content/works.json").read_text(encoding="utf-8"))
    projects = [p for p in works if p.get("published") and p.get("category") == "project"]
    slugs = [p.get("slug", "") for p in projects]
    if len(set(slugs)) != len(slugs) or any(not SLUG_RE.fullmatch(s) for s in slugs):
        raise ValueError("Published project slugs must be unique and URL-safe.")
    sitemap = [SITE + "/"]
    for language in LABELS:
        listing_rel = f'{"zh/" if language == "zh" else ""}projects/index.html'
        save(listing_rel, listing(projects, profile, language))
        sitemap.append("https://gule7309.github.io" + index_path(language))
        for project in projects:
            rel = f'{"zh/" if language == "zh" else ""}projects/{project["slug"]}/index.html'
            save(rel, details(project, profile, language))
            sitemap.append("https://gule7309.github.io" + paths(project["slug"])[language])
    sitemap_xml = '<?xml version="1.0" encoding="utf-8"?>\n'
    sitemap_xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sitemap_xml += "".join(f"  <url><loc>{escape(u)}</loc></url>\n" for u in sitemap)
    sitemap_xml += "</urlset>\n"
    save("sitemap.xml", sitemap_xml)
    save("robots.txt", "User-agent: *\nAllow: /\nDisallow: /yuhisang.lo/admin/\n"
         f"Sitemap: {SITE}/sitemap.xml\n")
    print(f"Built {len(projects)} projects × {len(LABELS)} languages, + project indexes and sitemap.")
    return len(projects)


if __name__ == "__main__":
    build()
