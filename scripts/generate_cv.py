#!/usr/bin/env python3
"""Generate a one-page, privacy-conscious public CV from editable portfolio content."""
import json
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, HRFlowable, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets/generated-cv/Yu-Hsiang_Luo_CV.pdf"

def data(name, fallback):
    p = ROOT / "content" / (name + ".json")
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else fallback

def clean(text):
    return str(text or "").replace("—", "-").replace("–", "-").replace("’", "'").replace("•", "-")

def safe(text):
    return escape(clean(text))

def brief(text, n=205):
    result = " ".join(clean(text).split())
    return result if len(result) <= n else result[:n].rsplit(" ", 1)[0] + "..."

def main():
    profile = data("profile", {})
    works = data("works", [])
    credentials = data("achievements", [])
    OUT.parent.mkdir(parents=True, exist_ok=True)
    navy, blue, body, muted, rule = [HexColor(c) for c in
        ("#1D3349", "#285683", "#324A60", "#5F7082", "#DDE5EC")]
    doc = SimpleDocTemplate(str(OUT), pagesize=A4, leftMargin=16.5*mm,
        rightMargin=16.5*mm, topMargin=12*mm, bottomMargin=12*mm,
        title="Yu-Hsiang Luo | Curriculum Vitae", author="Yu-Hsiang Luo")
    styles = {
        "name": ParagraphStyle("name", fontName="Helvetica-Bold", fontSize=20, leading=24, textColor=navy, spaceAfter=3),
        "sub": ParagraphStyle("sub", fontName="Helvetica", fontSize=9.4, leading=13, textColor=muted, spaceAfter=5),
        "links": ParagraphStyle("links", fontName="Helvetica", fontSize=9, leading=12, textColor=blue, spaceAfter=9),
        "heading": ParagraphStyle("heading", fontName="Helvetica-Bold", fontSize=9.3, leading=12, textColor=blue, spaceBefore=9, spaceAfter=5),
        "entry": ParagraphStyle("entry", fontName="Helvetica-Bold", fontSize=9, leading=12, textColor=navy, spaceAfter=1),
        "context": ParagraphStyle("context", fontName="Helvetica", fontSize=8.5, leading=11.2, textColor=muted, spaceAfter=2),
        "body": ParagraphStyle("body", fontName="Helvetica", fontSize=8.7, leading=12, textColor=body, spaceAfter=3)
    }
    story = []
    def write(text, style="body"):
        story.append(Paragraph(safe(text), styles[style]))
    def section(title):
        write(title.upper(), "heading")
        story.append(HRFlowable(width="100%", thickness=.5, color=rule, spaceBefore=-4, spaceAfter=5))
    def entry(title, context="", description=""):
        nodes = [Paragraph(safe(title), styles["entry"])]
        if context: nodes.append(Paragraph(safe(context), styles["context"]))
        if description: nodes.append(Paragraph(safe(brief(description)), styles["body"]))
        story.append(KeepTogether(nodes))
    write(profile.get("name_en", "Yu-Hsiang (Gule) Luo"), "name")
    write(profile.get("role_en", "M.S. Student") + " | Human-Centered AI & Product Engineering", "sub")
    story.append(Paragraph(
        '<link href="https://gule7309.github.io/yuhisang.lo/" color="#285683">Portfolio</link>'
        ' &#8226; <link href="https://github.com/Gule7309" color="#285683">github.com/Gule7309</link>'
        ' &#8226; Taiwan', styles["links"]))
    section("Research interests")
    write(profile.get("headline_en", "Trustworthy AI that helps people stay in control.") +
          " Interests: " + ", ".join(profile.get("interests", [])[:4]) + ".")
    if profile.get("education"):
        section("Education")
        for x in profile["education"][:3]:
            entry(x.get("institution_en"), x.get("degree_en", "") + " | " + x.get("period", ""))
    research = sorted([x for x in works if x.get("published") and x.get("category") == "research"],
        key=lambda x: x.get("order", 50))[:2]
    if research:
        section("Research (in progress)")
        for x in research:
            entry(x.get("title_en"), x.get("status_en", "") + " | " + x.get("year", ""), x.get("summary_en"))
    experience = [x for x in profile.get("experience", []) if x.get("published")][:3]
    if experience:
        section("Experience")
        for x in experience:
            entry(x.get("role_en", "") + " | " + x.get("organization_en", ""),
                  x.get("period", ""), x.get("details_en", ""))
    projects = sorted([x for x in works if x.get("published") and x.get("category") == "project"],
        key=lambda x: x.get("order", 50))[:3]
    if projects:
        section("Selected engineering projects")
        for x in projects:
            entry(x.get("title_en"), x.get("status_en", "") + " | " + ", ".join(x.get("tags", [])[:3]),
                  x.get("summary_en"))
    section("Technical toolkit and languages")
    write("Python, TypeScript, React / React Native, Expo, LLM agents, tool use, evaluation, and data-driven product development.")
    exams = [x.get("title_en", "") for x in credentials
        if x.get("published") and x.get("type") == "certification"]
    write("Languages: Mandarin Chinese (native), English." +
          (" Scores: " + "; ".join(exams) + "." if exams else ""))
    doc.build(story)
    print("Created", OUT)

if __name__ == "__main__":
    main()
