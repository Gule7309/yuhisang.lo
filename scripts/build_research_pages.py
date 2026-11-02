#!/usr/bin/env python3
"""Render accurate bilingual research notes in the approved Clarity x Lil'Log style.

Reuse the existing academic site shell. Research pages are NOT publication records.
Only explicit, complete publication metadata permits a preprint/publication label.
"""
from __future__ import annotations

import hashlib
import json
import math
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
        "implementation": "Implementation & reproducibility",
        "repro": "Executed mechanism check", "repro_footnote": "Synthetic fixture only — not a benchmark or measured agent accuracy.",
        "repro_label": "Executed synthetic replay · Not empirical",
        "repro_cases": "Synthetic decision points", "repro_benchmark": "Benchmark items",
        "repro_calls": "Real model / tool calls", "repro_decision": "Replay decision",
        "repro_raw": "Raw viability", "repro_share": "Normalized share",
        "repro_share_note": "Normalized share is relative to the generated candidate set, not calibrated correctness probability.",
        "repro_conditions": "Candidate-set structural checks",
        "repro_condition": "Condition", "repro_count": "Candidate count", "repro_present": "Compatible candidate",
        "repro_yes": "Present", "repro_no": "Absent",
        "repro_source": "Pinned source", "repro_run": "CI execution",
        "repro_artifact": "Original JSON artifact", "repro_command": "Re-run the synthetic check",
        "repro_condition_natural": "Natural", "repro_condition_oracle_complete": "Oracle-complete",
        "repro_condition_forced_miss": "Forced-miss",
        "repro_condition_oracle_recovery_from_forced_miss": "Oracle recovery",
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
        "implementation": "實作證據與可重現性",
        "repro": "已執行的機制驗證", "repro_footnote": "僅合成情境 Fixture，非 Benchmark 或 Agent 準確率量測。",
        "repro_label": "已執行合成 Replay · 非實證研究",
        "repro_cases": "合成決策點", "repro_benchmark": "Benchmark 樣本",
        "repro_calls": "真實模型／工具呼叫", "repro_decision": "Replay 決策",
        "repro_raw": "原始可行性", "repro_share": "正規化占比",
        "repro_share_note": "正規化占比僅反映目前產生的候選集合比例，並非已校準的正確率機率。",
        "repro_conditions": "候選集合結構檢查",
        "repro_condition": "控制條件", "repro_count": "候選數量", "repro_present": "包含相容候選",
        "repro_yes": "有", "repro_no": "無",
        "repro_source": "固定版本程式", "repro_run": "CI 執行紀錄",
        "repro_artifact": "原始 JSON 結果", "repro_command": "重現合成驗證",
        "repro_condition_natural": "Natural 原始", "repro_condition_oracle_complete": "Oracle-complete",
        "repro_condition_forced_miss": "Forced-miss",
        "repro_condition_oracle_recovery_from_forced_miss": "Oracle recovery",
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


def research_preview(item: dict | None) -> str:
    """Use a verified, existing figure as an index/OG preview without duplicating it in the body."""
    if not item:
        return ""
    if base.safe_href(item.get("image"), allow_local=True):
        return str(item["image"])
    for fig in item.get("research_figures") or []:
        if isinstance(fig, dict) and base.safe_href(fig.get("image"), allow_local=True):
            return str(fig["image"])
    return ""


def meta_head(title: str, summary: str, item: dict | None, slug: str, lang: str) -> str:
    path = archive_path(lang) if item is None else note_path(slug, lang)
    en = archive_path("en") if item is None else note_path(slug, "en")
    zh = archive_path("zh") if item is None else note_path(slug, "zh")
    image = research_preview(item) if item is not None else ""
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



AUDIT_NAME = re.compile(r"^[a-z0-9][a-z0-9_-]*[.]json$")
SOURCE_SHA = re.compile(r"^[0-9a-f]{40}$")
AUDIT_SHA = re.compile(r"^[0-9a-f]{64}$")
AUDIT_CONDITIONS = (
    "natural", "oracle_complete", "forced_miss",
    "oracle_recovery_from_forced_miss",
)


def load_repro_audit(item: dict) -> dict | None:
    """Only expose an exact-byte, zero-benchmark executed synthetic audit."""
    if item.get("slug") != "when2ask" or item.get("category") != "research":
        return None
    filename = str(item.get("research_repro_audit_file") or "")
    expected_sha = str(item.get("research_repro_audit_sha256") or "")
    if not AUDIT_NAME.fullmatch(filename) or not AUDIT_SHA.fullmatch(expected_sha):
        return None
    path = ROOT / "content" / "experiments" / filename
    try:
        payload = path.read_bytes()
        if hashlib.sha256(payload).hexdigest() != expected_sha:
            return None
        data = json.loads(payload)
    except (OSError, UnicodeDecodeError, json.JSONDecodeError):
        return None
    if not isinstance(data, dict) or data.get("schema") != "synthetic_mechanism_audit_v1":
        return None
    if (data.get("empirical") is not False or data.get("benchmark_items_evaluated") != 0
            or data.get("model_calls") != 0 or data.get("real_tool_executions") != 0
            or data.get("test_outcome") != "PASS"):
        return None
    source, decision = data.get("source"), data.get("single_decision")
    if not isinstance(source, dict) or not isinstance(decision, dict):
        return None
    if (source.get("repository") != "Gule7309/When2ask"
            or not SOURCE_SHA.fullmatch(str(source.get("commit_sha") or ""))):
        return None
    if (decision.get("action") not in {"ask", "execute"}
            or decision.get("executed_correctly") is not None):
        return None
    for key in ("raw_viability", "normalized_share"):
        number = decision.get(key)
        if type(number) not in {float, int} or not math.isfinite(number) or not 0 <= number <= 1:
            return None
    checks = data.get("candidate_set_checks")
    if not isinstance(checks, list) or len(checks) != len(AUDIT_CONDITIONS):
        return None
    for entry, condition in zip(checks, AUDIT_CONDITIONS):
        if (not isinstance(entry, dict) or entry.get("condition") != condition
                or type(entry.get("candidate_count")) is not int
                or entry["candidate_count"] < 0
                or type(entry.get("ground_truth_compatible_candidate_present")) is not bool):
            return None
    for key in ("research_repro_ci_run", "research_repro_ci_artifact"):
        if type(item.get(key)) is not int or item[key] <= 0:
            return None
    return data


def repro_audit_markup(item: dict, lang: str, audit: dict | None = None) -> str:
    data = audit if audit is not None else load_repro_audit(item)
    if data is None:
        return ""
    l = LABELS[lang]
    decision = data["single_decision"]
    checks = data["candidate_set_checks"]
    commit = data["source"]["commit_sha"]
    run_id = item["research_repro_ci_run"]
    artifact_id = item["research_repro_ci_artifact"]
    source_link = f"https://github.com/Gule7309/When2ask/blob/{commit}/scripts/reproduce_synthetic_fixture.py"
    run_link = f"https://github.com/Gule7309/When2ask/actions/runs/{run_id}"
    artifact_link = run_link + f"/artifacts/{artifact_id}"
    checks_html = "".join(
        f'<tr><th scope="row">{base.escape(l["repro_condition_" + entry["condition"]])}</th>'
        f'<td>{entry["candidate_count"]}</td>'
        f'<td>{base.escape(l["repro_yes"] if entry["ground_truth_compatible_candidate_present"] else l["repro_no"])}</td></tr>'
        for entry in checks
    )
    description = base.localized(item, "research_repro_description", lang)
    metadata = [
        ("repro_cases", "1"),
        ("repro_benchmark", "0"),
        ("repro_calls", "0"),
    ]
    figures = "".join(
        f'<div class="research-audit-stat"><dt>{base.escape(l[key])}</dt>'
        f'<dd>{base.escape(value)}</dd></div>'
        for key, value in metadata
    )
    links = "".join(
        f'<a href="{base.escape(url)}" target="_blank" rel="noopener noreferrer">'
        f'{base.escape(l[key])}{base.icon("bi-arrow-up-right")}</a>'
        for key, url in (("repro_source", source_link), ("repro_run", run_link),
                         ("repro_artifact", artifact_link))
    )
    command = "python scripts/reproduce_synthetic_fixture.py --output results/synthetic-audit.json"
    return (
        f'<section class="research-section research-audit" id="reproducibility">'
        f'<h2>{base.escape(l["repro"])}</h2>'
        f'<p class="research-audit-type">{base.escape(l["repro_label"])}</p>'
        f'<p class="research-audit-description">{base.escape(description)}</p>'
        f'<dl class="research-audit-stats">{figures}</dl>'
        f'<div class="research-audit-decision">'
        f'<strong>{base.escape(l["repro_decision"])}: {base.escape(decision["action"].upper())}</strong>'
        f'<span>{base.escape(l["repro_raw"])}: {decision["raw_viability"]:.2f}</span>'
        f'<span>{base.escape(l["repro_share"])}: {decision["normalized_share"]:.2f}</span>'
        f'</div><p class="research-audit-note">{base.escape(l["repro_share_note"])}</p>'
        f'<h3>{base.escape(l["repro_conditions"])}</h3>'
        f'<div class="research-audit-table-wrap"><table class="research-audit-table">'
        f'<thead><tr><th scope="col">{base.escape(l["repro_condition"])}</th>'
        f'<th scope="col">{base.escape(l["repro_count"])}</th>'
        f'<th scope="col">{base.escape(l["repro_present"])}</th></tr></thead>'
        f'<tbody>{checks_html}</tbody></table></div>'
        f'<p class="research-audit-note">{base.escape(l["repro_footnote"])}</p>'
        f'<div class="research-audit-links">{links}</div>'
        f'<p class="research-audit-command-label">{base.escape(l["repro_command"])}</p>'
        f'<div class="research-audit-command"><code>{base.escape(command)}</code></div>'
        f'</section>'
    )


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
    implementation_html = base.source_traces_markup(item, lang, research=True)
    audit = load_repro_audit(item)
    audit_html = repro_audit_markup(item, lang, audit) if audit is not None else ""
    references_html = references_markup(item, lang)
    toc = [(id_, label) for id_, label, _ in sections]
    if audit_html:
        where = next((i + 1 for i, (anchor, _) in enumerate(toc) if anchor == "progress"), len(toc))
        toc.insert(where, ("reproducibility", l["repro"]))
    if figures_html:
        toc.append(("figures", l["figures"]))
    if implementation_html:
        toc.append(("implementation", l["implementation"]))
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
        + "".join(section_markup(i, name, text) +
                  (audit_html if i == "progress" else "") for i, name, text in sections)
        + (audit_html if audit_html and not any(i == "progress" for i, _, _ in sections) else "")
        + figures_html + implementation_html + references_html
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
        preview = base.safe_href(research_preview(item), allow_local=True)
        has_media = bool(preview)
        figure = next((g for g in (item.get("research_figures") or [])
                       if isinstance(g, dict) and g.get("image") == research_preview(item)), {})
        alt = base.localized(figure, "alt", lang) or title
        thumb = (f'<a href="{base.escape(path)}" class="research-index-preview">'
                 f'<img src="{base.escape(preview)}" alt="{base.escape(alt)}" loading="lazy">'
                 f'</a>') if preview else ""
        rendered.append(
            f'<article class="research-index-item{" has-figure" if has_media else ""}">'
            f'{thumb}<div class="research-index-main">'
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
