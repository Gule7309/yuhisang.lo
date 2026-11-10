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
        "architecture": "System Architecture", "engineering": "Engineering Decisions",
        "verification": "Evidence & Limitations", "technical_jump": "Explore technical details",
        "stage_implemented": "Implemented", "stage_prototype": "Prototype",
        "stage_planned": "Planned", "evidence_verified": "Tested",
        "evidence_limited": "Limited scope", "evidence_pending": "Not yet validated",
        "source": "Evidence source",
        "source_traces": "Implementation trace",
        "source_traces_intro": "Selected excerpts from publicly available, pinned source code. These examples explain the implementation; they do not establish reliability, model accuracy or sole authorship of team modules.",
        "source_exact": "View exact source",
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
        "architecture": "系統架構", "engineering": "工程取捨與設計決策",
        "verification": "驗證證據與限制", "technical_jump": "查看技術細節",
        "stage_implemented": "已實作", "stage_prototype": "原型開發", 
        "stage_planned": "規劃中", "evidence_verified": "已完成特定測試",
        "evidence_limited": "驗證範圍有限", "evidence_pending": "尚未驗證",
        "source": "查看證據來源",
        "source_traces": "實作程式碼與來源",
        "source_traces_intro": "以下節錄公開且鎖定版本的原始碼，可用來核對實作設計；不代表系統可靠度、模型準確率，亦不代表團隊模組完全由本站作者獨立完成。",
        "source_exact": "查看原始程式與行號",
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
          english: str, chinese: str, *, active: str = "projects",
          main_class: str = "project-content") -> str:
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
    research_index = f'{PREFIX}/{"zh/" if lang == "zh" else ""}research/'
    research_url = research_index if active == "research" else home + "#research"
    research_current = ' aria-current="page"' if active == "research" else ""
    projects_current = ' aria-current="page"' if active == "projects" else ""
    nav = (f'<a href="{home}#about">{escape(label["about"])}</a>'
           f'<a href="{escape(research_url)}"{research_current}>{escape(label["research"])}</a>'
           f'<a href="{escape(index_path(lang))}"{projects_current}>{escape(label["projects"])}</a>'
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
        '<main class="content ' + escape(main_class) + '" id="main">' + main + '</main></div></body></html>'
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


# Optional deep-dive data is scoped strictly to product case studies; research notes
# retain their independent, previously approved template.
ARCH_STATES = {"implemented", "prototype", "planned"}
EVIDENCE_STATES = {"verified", "limited", "pending"}


def technical_rows(item: dict, key: str) -> list[dict]:
    raw = item.get(key) or []
    return [r for r in raw if isinstance(r, dict)] if isinstance(raw, list) else []


def architecture(item: dict, lang: str) -> str:
    rows = technical_rows(item, "architecture_layers")
    cards = []
    for idx, layer in enumerate(rows, 1):
        name = localized(layer, "title", lang).strip()
        description = localized(layer, "description", lang).strip()
        if not name or not description:
            continue
        stage = str(layer.get("stage") or "prototype").lower()
        if stage not in ARCH_STATES:
            stage = "prototype"
        status = LABELS[lang]["stage_" + stage]
        cards.append(
            f'<li class="case-architecture-layer">'
            f'<span class="case-layer-no">{idx:02d}</span>'
            f'<h3>{escape(name)}</h3><p>{escape(description)}</p>'
            f'<span class="case-architecture-state case-architecture-state--{stage}">'
            f'{escape(status)}</span></li>'
        )
    if not cards:
        return ""
    intro = localized(item, "architecture_note", lang).strip()
    copy = f'<p class="case-section-intro">{escape(intro)}</p>' if intro else ""
    return (f'<section class="case-section case-architecture" id="architecture">'
            f'<h2>{escape(LABELS[lang]["architecture"])}</h2>{copy}'
            f'<ol class="case-architecture-grid">{"".join(cards)}</ol></section>')


def engineering_decisions(item: dict, lang: str) -> str:
    rows = technical_rows(item, "engineering_decisions")
    cards = []
    for idx, decision in enumerate(rows, 1):
        heading = localized(decision, "title", lang).strip()
        rationale = localized(decision, "rationale", lang).strip()
        if not heading or not rationale:
            continue
        cards.append(
            f'<li class="case-decision">'
            f'<span class="case-decision-no" aria-hidden="true">{idx:02d}</span>'
            f'<div><h3>{escape(heading)}</h3><p>{escape(rationale)}</p></div></li>'
        )
    if not cards:
        return ""
    return (f'<section class="case-section" id="engineering">'
            f'<h2>{escape(LABELS[lang]["engineering"])}</h2>'
            f'<ol class="case-decisions">{"".join(cards)}</ol></section>')


def verification_evidence(item: dict, lang: str) -> str:
    rows = technical_rows(item, "verification_evidence")
    cards = []
    for evidence in rows:
        heading = localized(evidence, "title", lang).strip()
        detail = localized(evidence, "detail", lang).strip()
        if not heading or not detail:
            continue
        state = str(evidence.get("status") or "pending").lower()
        if state not in EVIDENCE_STATES:
            state = "pending"  # Unknown statuses must not imply successful validation.
        source = safe_href(evidence.get("source_url"))
        source_link = (f'<a class="case-evidence-source" href="{escape(source)}" '
                       f'target="_blank" rel="noopener noreferrer">'
                       f'{icon("bi-box-arrow-up-right")}{escape(LABELS[lang]["source"])}</a>'
                       if source else "")
        cards.append(
            f'<li class="case-evidence-item">'
            f'<span class="case-evidence-state case-evidence-state--{state}">'
            f'{escape(LABELS[lang]["evidence_" + state])}</span>'
            f'<div><h3>{escape(heading)}</h3><p>{escape(detail)}</p>'
            f'{source_link}</div></li>'
        )
    if not cards:
        return ""
    return (f'<section class="case-section" id="verification">'
            f'<h2>{escape(LABELS[lang]["verification"])}</h2>'
            f'<ul class="case-evidence-list">{"".join(cards)}</ul></section>')


# Require line-addressable immutable GitHub permalinks; reject mutable branches,
# arbitrary external hosts, unsafe schemes, fragments and suspicious traversals.
SOURCE_TRACE_URL = re.compile(
    r"^https://github[.]com/([A-Za-z0-9-]+)/([A-Za-z0-9_.-]+)/blob/"
    r"([0-9a-f]{40})/([^?#\s]+)#L([1-9]\d*)(?:-L([1-9]\d*))?$"
)
TRACE_LANGS = {"python", "typescript", "javascript", "text"}


def verified_source_traces(item: dict, lang: str) -> list[dict[str, str]]:
    """Require a correct code/line range before displaying a source excerpt."""
    records = item.get("source_traces") or []
    if not isinstance(records, list):
        return []
    result = []
    for entry in records:
        if not isinstance(entry, dict):
            continue
        heading = localized(entry, "title", lang).strip()
        explanation = localized(entry, "explanation", lang).strip()
        code = str(entry.get("code") or "").replace("\r\n", "\n").rstrip("\n")
        href = str(entry.get("source_url") or "").strip()
        match = SOURCE_TRACE_URL.fullmatch(href)
        if not match or not heading or not explanation or not code:
            continue
        relative_path = match.group(4)
        if any(seg in {"..", ".", ""} for seg in relative_path.split("/")):
            continue
        start = int(match.group(5))
        end = int(match.group(6) or match.group(5))
        lines = code.split("\n")
        if end < start or len(lines) != end - start + 1 or not 1 <= len(lines) <= 14:
            continue
        if len(code) > 1300 or len(heading) > 130 or len(explanation) > 600:
            continue
        lang_key = str(entry.get("language") or "text").lower()
        language = lang_key if lang_key in TRACE_LANGS else "text"
        result.append({
            "title": heading, "explanation": explanation,
            "code": code, "url": href, "language": language,
            "file": relative_path.rsplit("/", 1)[-1],
            "lines": f"L{start}" + (f"–{end}" if end != start else ""),
        })
    return result[:5]


def source_traces_markup(item: dict, lang: str, *, research: bool = False) -> str:
    """Render escaped, source-pinned excerpts with no executable HTML or client JS."""
    entries = verified_source_traces(item, lang)
    if not entries:
        return ""
    heading = ("Implementation & reproducibility" if lang == "en"
               else "實作證據與可重現性") if research else LABELS[lang]["source_traces"]
    intro = (
        "Excerpts from an ongoing independent mechanism reconstruction. "
        "They are not benchmark results or a peer-reviewed publication."
        if lang == "en" else
        "以下為進行中的獨立機制重建程式碼節錄，並非 Benchmark 實驗結果或經同儕審查的研究成果。"
    ) if research else LABELS[lang]["source_traces_intro"]
    cards = []
    for entry in entries:
        cards.append(
            '<article class="case-trace-card">'
            f'<h3>{escape(entry["title"])}</h3>'
            f'<p>{escape(entry["explanation"])}</p>'
            f'<div class="case-trace-code-frame"><div class="case-trace-code-meta">'
            f'<span>{escape(entry["language"])}</span>'
            f'<span>{escape(entry["file"])} · {escape(entry["lines"])}</span></div>'
            f'<pre tabindex="0"><code>{escape(entry["code"])}</code></pre>'
            f'<span class="case-trace-scroll-hint">'
            f'{escape("↔ Swipe to read full code" if lang == "en" else "↔ 左右滑動可閱讀完整程式碼")}'
            f'</span></div>'
            f'<a class="case-trace-link" href="{escape(entry["url"])}" '
            f'target="_blank" rel="noopener noreferrer">'
            f'{icon("bi-code-slash")}{escape("View exact source" if lang == "en" else "查看原始程式與行號")}'
            f'{icon("bi-arrow-up-right")}</a></article>'
        )
    section_class = "research-section case-source-traces" if research else "case-section case-source-traces"
    return (
        f'<section class="{section_class}" id="implementation">'
        f'<h2>{escape(heading)}</h2>'
        f'<p class="case-traces-intro">{escape(intro)}</p>'
        + '<div class="case-trace-list">' + "".join(cards) + '</div></section>'
    )


def phone_strip(item: dict, lang: str) -> str:
    """Show actual QA captures side by side; never invent mobile frames."""
    if item.get("media_layout") != "phone":
        return ""
    figures = []
    for photo in (item.get("gallery") or [])[:3]:
        if not isinstance(photo, dict):
            continue
        image = safe_href(photo.get("image"), allow_local=True)
        if not image:
            continue
        alt = localized(photo, "caption", lang) or localized(item, "title", lang)
        figures.append(f'<img src="{escape(image)}" alt="{escape(alt)}" loading="lazy">')
    return '<span class="cover-phone-strip">' + "".join(figures) + '</span>' if len(figures) > 1 else ""


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
            f'<div class="case-gallery{" has-phone-layout" if item.get("media_layout") == "phone" else ""}">{"".join(output)}</div></section>')


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
    caption = localized(item, "image_caption", lang)
    caption_html = (f'<figcaption>{icon("bi-info-circle")} {escape(caption)}</figcaption>'
                    if caption else "")
    image_alt = localized(item, "image_alt", lang) or title
    media = (f'<figure class="case-cover{" has-phone-layout" if item.get("media_layout") == "phone" else ""}"><img src="{escape(safe_img)}"'
             f' alt="{escape(image_alt)}" loading="eager" fetchpriority="high" decoding="async">{caption_html}</figure>') if safe_img else ""
    main = (
        f'<a class="case-back" href="{escape(index_path(lang))}">'
        f'{icon("bi-arrow-left")} {escape(LABELS[lang]["back"])}</a>'
        f'<p class="eyebrow">{escape(LABELS[lang]["case"])}</p>'
        f'<h1 class="case-title">{escape(title)}</h1>'
        f'<div class="case-status">{badge(item, lang)}'
        f'<span class="case-year">{escape(item.get("year") or "")}</span></div>'
        f'<p class="case-lead">{escape(summary)}</p>'
        + tags(item) + resource_links(item, lang)
        + (f'<a class="case-technical-jump" href="#architecture">'
           f'{icon("bi-diagram-3")}{escape(LABELS[lang]["technical_jump"])}</a>'
           if technical_rows(item, "architecture_layers") else "")
        + media
        + info_section(item, lang, "role")
        + info_section(item, lang, "challenge")
        + info_section(item, lang, "approach")
        + architecture(item, lang)
        + engineering_decisions(item, lang)
        + info_section(item, lang, "outcome")
        + verification_evidence(item, lang)
        + source_traces_markup(item, lang)
        + info_section(item, lang, "next_steps")
        + gallery(item, lang)
        + f'<footer class="case-footer"><a href="{escape(index_path(lang))}">'
        f'{icon("bi-arrow-left")} {escape(LABELS[lang]["back"])}</a></footer>'
    )
    return shell(profile, lang, head(title, summary, canonical, path["en"], path["zh"], safe_img),
                 main, path["en"], path["zh"])


def archive_group(item: dict) -> str:
    """Deterministic browsing labels derived from existing CMS tags, never invented evidence."""
    labels = " ".join(str(tag).lower() for tag in item.get("tags", []) if isinstance(tag, str))
    if "agent" in labels or "evidence verification" in labels:
        return "agent"
    if any(term in labels for term in ("product design", "fitness", "maps", "community",
                                       "expo", "react native", "android")):
        return "product"
    return "engineering"


def listing(works: list[dict], profile: dict, lang: str) -> str:
    path = index_path(lang)
    alternate = {"en": index_path("en"), "zh": index_path("zh")}
    title = LABELS[lang]["projects"]
    filter_labels = (
        {"all": "All", "agent": "Agent systems", "product": "Products & UX",
         "engineering": "Engineering"} if lang == "en" else
        {"all": "全部", "agent": "Agent 系統", "product": "產品與體驗",
         "engineering": "工程實作"}
    )
    items = []
    counts = {key: 0 for key in filter_labels}
    for item in sorted(works, key=lambda x: (x.get("order", 50), x["slug"])):
        label = localized(item, "title", lang)
        url = paths(item["slug"])[lang]
        image = safe_href(item.get("image"), allow_local=True)
        strip = phone_strip(item, lang)
        cover = (strip if strip else
                 f'<img src="{escape(image)}" alt="" loading="lazy">' if image else
                 f'<span class="case-placeholder">{escape(item["slug"].replace("-", " ").title())}</span>')
        group = archive_group(item)
        counts["all"] += 1
        counts[group] += 1
        items.append(
            f'<article class="project-list-item" data-archive-group="{group}">'
            f'<a class="project-list-cover{" has-phone-layout" if strip else ""}" href="{escape(url)}">'
            f'{cover}</a><div><div class="case-status">{badge(item,lang)}'
            f'<span class="case-year">{escape(item.get("year") or "")}</span></div>'
            f'<h2><a href="{escape(url)}">{escape(label)}</a></h2>'
            f'<p>{escape(localized(item,"summary",lang))}</p>'
            f'<div class="archive-project-meta">{escape(filter_labels[group])}</div>'
            f'<a class="case-more" href="{escape(url)}">'
            f'{escape("Read case study" if lang == "en" else "閱讀專案詳情")} {icon("bi-arrow-up-right")}'
            f'</a></div></article>'
        )
    filter_buttons = "".join(
        f'<button type="button" data-archive-filter="{key}" aria-pressed="{"true" if key == "all" else "false"}">'
        f'{escape(label)} <span aria-hidden="true">{counts[key]}</span></button>'
        for key, label in filter_labels.items() if counts[key] or key == "all"
    )
    filter_bar = (
        f'<div class="archive-filters" data-archive-controls hidden role="group" '
        f'aria-label="{escape("Filter projects" if lang == "en" else "專案篩選")}">'
        f'{filter_buttons}</div>'
    ) if items else ""
    empty = escape("No projects in this category." if lang == "en" else "此分類目前沒有專案。")
    main = (f'<a class="case-back" href="{PREFIX}/#projects">{icon("bi-arrow-left")}'
            f' {escape("Home" if lang == "en" else "首頁")}</a>'
            f'<p class="eyebrow">{escape(LABELS[lang]["featured"])}</p>'
            f'<h1 class="case-title">{escape(title)}</h1>'
            f'<p class="case-lead">{escape(LABELS[lang]["intro"])}</p>'
            + filter_bar
            + (f'<p class="archive-filter-empty" role="status" hidden>{empty}</p>' if items else "")
            + ("".join(items) if items else f'<p>{escape(LABELS[lang]["empty"])}</p>'))
    canonical = "https://gule7309.github.io" + path
    page = shell(profile, lang, head(title, LABELS[lang]["intro"], canonical,
                                     alternate["en"], alternate["zh"]),
                 main, alternate["en"], alternate["zh"])
    return page.replace('</body>', f'<script defer src="{PREFIX}/archive-filters.js"></script></body>')



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
