"""Phase 10 archive regressions: content truthfulness and accessible filters."""
import importlib
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
project = importlib.import_module("build_project_pages")
research = importlib.import_module("build_research_pages")

PROFILE = {"name_en": "Example", "name_zh": "範例", "short_name": "Example"}


class ArchivePhase10Tests(unittest.TestCase):
    def test_taxonomy_is_derived_from_existing_tags(self):
        self.assertEqual(project.archive_group({"tags": ["Agent Systems"]}), "agent")
        self.assertEqual(project.archive_group({"tags": ["Android", "Fitness"]}), "product")
        self.assertEqual(project.archive_group({"tags": ["Python", "Adaptive Systems", "VR"]}), "engineering")
        self.assertEqual(project.archive_group({"tags": []}), "engineering")

    def test_project_filters_are_accessible_and_bilingual(self):
        works = [
            {"slug": "agent-demo", "title_en": "Agent demo", "title_zh": "代理展示",
             "summary_en": "A sample", "summary_zh": "範例", "tags": ["Agent Systems"]},
            {"slug": "product-demo", "title_en": "Product demo", "title_zh": "產品展示",
             "summary_en": "A sample", "summary_zh": "範例", "tags": ["Fitness"]}
        ]
        en = project.listing(works, PROFILE, "en")
        zh = project.listing(works, PROFILE, "zh")
        self.assertIn('data-archive-filter="all" aria-pressed="true"', en)
        self.assertIn('data-archive-group="agent"', en)
        self.assertIn('data-archive-group="product"', en)
        self.assertIn("archive-search.js", en)
        self.assertIn("Agent systems", en)
        self.assertIn("Agent 系統", zh)
        self.assertIn('data-archive-controls hidden', en)

    def test_search_controls_keep_archive_content_accessible_without_js(self):
        projects = [{
            "slug": "agent-demo", "title_en": "Agent demo", "title_zh": "代理展示",
            "summary_en": "Trustworthy AI research", "summary_zh": "可信任 AI 研究",
            "tags": ["Agent Systems"], "year": "2026"
        }]
        for lang, search_text in [("en", "Search projects"), ("zh", "搜尋專案")]:
            html = project.listing(projects, PROFILE, lang)
            self.assertIn(search_text, html)
            self.assertIn('data-archive-search-controls hidden', html)
            self.assertIn('data-archive-search="', html)
            self.assertIn('data-archive-item', html)
            self.assertIn('archive-search.js', html)
            self.assertIn('2026', html)
            self.assertIn('agent-demo', html)

        research_items = [{
            "slug": "research-demo", "title_en": "Safe agents",
            "title_zh": "安全代理", "summary_en": "Clarification behavior",
            "summary_zh": "釐清行為", "research_question_en": "When to ask?",
            "research_question_zh": "何時提問？", "tags": ["HCI"]
        }]
        for lang, search_text in [("en", "Search research"), ("zh", "搜尋研究")]:
            html = research.research_index(research_items, PROFILE, lang)
            self.assertIn(search_text, html)
            self.assertIn('data-archive-search-controls hidden', html)
            self.assertIn('data-archive-item', html)
            self.assertIn('archive-search.js', html)
            self.assertIn('data-archive-result-count', html)

    def test_research_question_and_nonpublication_disclosure(self):
        works = [{
            "slug": "research-demo", "title_en": "Study", "title_zh": "研究",
            "summary_en": "Under investigation", "summary_zh": "研究中",
            "research_question_en": "What is the tradeoff?",
            "research_question_zh": "取捨為何？",
            "research_approach_en": "Controlled comparisons",
            "research_approach_zh": "控制實驗",
            "publication_status": "work_in_progress", "status_type": "research",
            "year": "2026"
        }]
        en = research.research_index(works, PROFILE, "en")
        zh = research.research_index(works, PROFILE, "zh")
        self.assertIn("What is the tradeoff?", en)
        self.assertIn("Controlled comparisons", en)
        self.assertIn("not a published or peer-reviewed paper", en)
        self.assertIn("取捨為何？", zh)
        self.assertIn("控制實驗", zh)
        self.assertNotIn("Peer-reviewed paper:", en)

    def test_no_empty_research_fields_or_unapproved_paper_link(self):
        en = research.research_index([{"slug": "demo", "title_en": "Demo",
                                      "summary_en": "Draft", "paper": "https://example.org/paper.pdf",
                                      "publication_status": "work_in_progress"}], PROFILE, "en")
        self.assertNotIn('class="archive-question"', en)
        self.assertNotIn('class="archive-method"', en)
        self.assertNotIn('>Own paper<', en)


if __name__ == "__main__":
    unittest.main()
