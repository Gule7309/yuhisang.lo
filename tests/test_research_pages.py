"""Research notes: A+C layout, accuracy, bilingual routes, CMS safety and sitemap."""
from __future__ import annotations

import hashlib
import json
import sys
import tempfile
import unittest
from pathlib import Path
import xml.etree.ElementTree as ET

REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO / "scripts"))
import build_project_pages as product  # noqa: E402
import build_research_pages as research  # noqa: E402


class ResearchGenerationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        (self.root / "content").mkdir(parents=True)
        self.old_product_root = product.ROOT
        self.old_research_root = research.ROOT
        product.ROOT = research.ROOT = self.root
        profile = {
            "name_en": "Example", "name_zh": "範例", "short_name": "Example",
            "role_en": "Graduate student", "role_zh": "研究生",
            "affiliation_en": "University", "affiliation_zh": "大學",
            "headline_en": "Research", "headline_zh": "研究",
            "avatar": "", "socials": [{"label": "GitHub", "url": "https://github.com/example", "icon": "github"}],
        }
        works = [
            {
                "slug": "candidate-test", "category": "research", "published": True,
                "title_en": "Candidate-set research", "title_zh": "候選集合研究",
                "summary_en": "Testing structured uncertainty", "summary_zh": "檢驗結構化不確定性",
                "status_en": "Research in progress", "status_zh": "研究進行中",
                "status_type": "research", "year": "2026",
                "publication_status": "work_in_progress", "paper": "https://example.org/paper-not-ours",
                "research_question_en": "Does a missing candidate cause errors?",
                "research_question_zh": "候選缺失是否造成錯誤？",
                "research_background_en": "Background & motivation",
                "research_approach_en": "Test natural, oracle and forced-miss candidate sets.",
                "research_evaluation_en": "Candidate recall and calibration.",
                "research_progress_en": "Synthetic fixtures exist; no empirical results are claimed.",
                "research_limitations_en": "<script>alert('bad')</script>",
                "research_next_steps_en": "Run smoke tests.",
                "research_figures": [
                    {"image": "/yuhisang.lo/assets/uploads/schema.png",
                     "alt_en": "Candidate set illustration",
                     "caption_en": "Illustrative diagram", "caption_zh": "示意圖",
                     "source_url": "javascript:alert(2)"}
                ],
                "research_references": [
                    {"title_en": "Original prior paper", "title_zh": "原研究",
                     "url": "https://aclanthology.org/2026.findings-acl.2028/",
                     "note_en": "Prior work by other researchers"},
                    {"title_en": "Untrusted", "url": "javascript:alert(1)"}
                ]
            },
            {
                "slug": "proposed-direction", "category": "research", "published": True,
                "title_en": "Proposed Direction", "title_zh": "研究提案",
                "summary_en": "A proposal", "summary_zh": "研究方向",
                "status_en": "Research proposal", "status_zh": "研究提案階段",
                "status_type": "proposal", "publication_status": "work_in_progress",
                "research_question_en": "Should an agent ask first?"
            },
            {"slug": "private-research", "category": "research", "published": False},
            {"slug": "product", "category": "project", "published": True,
             "title_en": "Product", "title_zh": "產品", "summary_en": "Product test",
             "status_en": "Prototype", "status_zh": "原型", "year": "2026"}
        ]
        for name, data in [("profile", profile), ("works", works)]:
            (self.root / "content" / f"{name}.json").write_text(
                json.dumps(data, ensure_ascii=False), encoding="utf-8"
            )

    def tearDown(self):
        product.ROOT = self.old_product_root
        research.ROOT = self.old_research_root
        self.temp.cleanup()

    def read(self, path):
        return (self.root / path).read_text(encoding="utf-8")

    def build(self):
        product.build()
        return research.build()

    def test_generates_localized_research_archive_and_pages_only(self):
        self.assertEqual(self.build(), 2)
        for path in [
            "research/index.html", "zh/research/index.html",
            "research/candidate-test/index.html", "zh/research/candidate-test/index.html",
            "research/proposed-direction/index.html", "zh/research/proposed-direction/index.html"
        ]:
            self.assertTrue((self.root / path).is_file(), path)
        self.assertFalse((self.root / "research/private-research/index.html").exists())
        self.assertFalse((self.root / "research/product/index.html").exists())
        self.assertTrue((self.root / "projects/product/index.html").exists())

    def test_research_page_uses_A_C_structure_but_does_not_claim_publication(self):
        self.build()
        page = self.read("research/candidate-test/index.html")
        self.assertIn('class="research-title"', page)
        self.assertIn('class="research-toc"', page)
        self.assertIn('href="#question"', page)
        self.assertIn('href="#references"', page)
        self.assertIn('id="evaluation"', page)
        self.assertIn("Work in progress", page)
        self.assertIn("not a published or peer-reviewed paper", page)
        self.assertIn("Prior work by other researchers", page)
        self.assertNotIn("Own paper", page)
        self.assertIn('class="research-disclosure research-disclosure--in_progress"', page)
        self.assertIn('href="/yuhisang.lo/research/"', page)
        self.assertIn("research-pages.css", page)
        self.assertIn('aria-current="page">Research', page)

    def test_escapes_text_and_rejects_unsafe_external_links(self):
        self.build()
        page = self.read("research/candidate-test/index.html")
        self.assertIn("&lt;script&gt;alert", page)
        self.assertNotIn("<script>alert", page)
        self.assertNotIn("javascript:alert", page)
        self.assertIn('src="/yuhisang.lo/assets/uploads/schema.png"', page)
        self.assertIn('alt="Candidate set illustration"', page)
        self.assertIn("https://aclanthology.org/2026.findings-acl.2028/", page)
        self.assertIn('property="og:image"', page)
        archive = self.read("research/index.html")
        self.assertIn('class="research-index-preview"', archive)
        self.assertIn('src="/yuhisang.lo/assets/uploads/schema.png"', archive)

    def test_zh_and_hreflang_are_correct(self):
        self.build()
        page = self.read("zh/research/candidate-test/index.html")
        self.assertIn('lang="zh-Hant"', page)
        self.assertIn("候選缺失是否造成錯誤？", page)
        self.assertIn('hreflang="en"', page)
        self.assertIn('hreflang="zh-Hant"', page)
        self.assertIn("/yuhisang.lo/research/candidate-test/", page)
        self.assertIn("候選集合研究", page)
        self.assertIn("研究狀態", page)

    def test_reconstruction_trace_adds_toc_without_publication_claims(self):
        works = json.loads((self.root / "content/works.json").read_text(encoding="utf-8"))
        sha = "b" * 40
        works[0]["source_traces"] = [
            {"title_en": "Candidate-set insertion",
             "title_zh": "候選集合插入",
             "explanation_en": "Only a controlled reconstruction, not a research result.",
             "explanation_zh": "僅為控制條件下的重建，尚非研究成果。",
             "code": "if not present:\n    add_candidate()",
             "language": "python",
             "source_url": f"https://github.com/example/reconstruction/blob/{sha}/src/interventions.py#L9-L10"}
        ]
        (self.root / "content/works.json").write_text(
            json.dumps(works), encoding="utf-8")
        self.build()
        en = self.read("research/candidate-test/index.html")
        zh = self.read("zh/research/candidate-test/index.html")
        proposal = self.read("research/proposed-direction/index.html")
        self.assertIn('href="#implementation"', en)
        self.assertIn('class="research-section case-source-traces"', en)
        self.assertIn('id="implementation"', en)
        self.assertIn("Implementation &amp; reproducibility", en)
        self.assertIn("not a published or peer-reviewed paper", en)
        self.assertIn(f'/src/interventions.py#L9-L10"', en)
        self.assertIn('href="#implementation"', zh)
        self.assertIn("候選集合插入", zh)
        self.assertIn("並非 Benchmark", zh)
        self.assertNotIn('href="#implementation"', proposal)

    def synthetic_audit_fixture(self, *, empirical=False):
        works = json.loads((self.root / "content/works.json").read_text(encoding="utf-8"))
        works[0]["slug"] = "when2ask"
        works[0]["research_repro_audit_file"] = "test-audit.json"
        works[0]["research_repro_ci_run"] = 12345
        works[0]["research_repro_ci_artifact"] = 98765
        works[0]["research_repro_description_en"] = "Controlled <b>synthetic</b> replay, not model accuracy."
        works[0]["research_repro_description_zh"] = "一筆真正執行的合成情境，不是實證模型評估。"
        audit = {
            "schema": "synthetic_mechanism_audit_v1", "empirical": empirical,
            "benchmark_items_evaluated": 0, "model_calls": 0,
            "real_tool_executions": 0, "test_outcome": "PASS",
            "source": {"repository": "Gule7309/When2ask", "commit_sha": "a" * 40},
            "single_decision": {"action": "ask", "raw_viability": 0.5,
                                "normalized_share": 1.0, "executed_correctly": None},
            "candidate_set_checks": [
                {"condition": cond, "candidate_count": cnt,
                 "ground_truth_compatible_candidate_present": present}
                for cond, cnt, present in [
                    ("natural", 1, True), ("oracle_complete", 1, True),
                    ("forced_miss", 1, False),
                    ("oracle_recovery_from_forced_miss", 2, True)]
            ],
        }
        source_dir = self.root / "content/experiments"
        source_dir.mkdir(parents=True, exist_ok=True)
        blob = json.dumps(audit).encode("utf-8")
        (source_dir / "test-audit.json").write_bytes(blob)
        works[0]["research_repro_audit_sha256"] = hashlib.sha256(blob).hexdigest()
        (self.root / "content/works.json").write_text(
            json.dumps(works), encoding="utf-8")
        return works

    def test_verified_synthetic_audit_is_bilingual_and_has_repro_links(self):
        self.synthetic_audit_fixture()
        self.build()
        en = self.read("research/when2ask/index.html")
        zh = self.read("zh/research/when2ask/index.html")
        other = self.read("research/proposed-direction/index.html")
        self.assertIn('href="#reproducibility"', en)
        self.assertIn('id="reproducibility"', en)
        self.assertIn('class="research-audit-table"', en)
        self.assertEqual(en.count('class="research-audit-table"'), 1)
        self.assertIn("Controlled &lt;b&gt;synthetic&lt;/b&gt;", en)
        self.assertNotIn("<b>synthetic</b>", en)
        self.assertIn("0", en)
        self.assertIn("ASK", en)
        self.assertIn("Normalized share", en)
        self.assertIn("not calibrated correctness probability", en)
        self.assertIn("https://github.com/Gule7309/When2ask/actions/runs/12345/artifacts/98765", en)
        self.assertIn('href="/yuhisang.lo/content/experiments/test-audit.json"', en)
        self.assertIn("https://github.com/Gule7309/When2ask/blob/" + "a"*40, en)
        self.assertIn('href="#reproducibility"', zh)
        self.assertIn("已執行的機制驗證", zh)
        self.assertIn("不是實證模型評估", zh)
        self.assertNotIn('id="reproducibility"', other)
        self.assertIn("not a published or peer-reviewed paper", en)

    def test_missing_wrong_sha_or_empirical_marked_json_never_renders(self):
        works = self.synthetic_audit_fixture()
        works[0]["research_repro_audit_sha256"] = "0" * 64
        (self.root / "content/works.json").write_text(json.dumps(works), encoding="utf-8")
        self.build()
        self.assertNotIn('id="reproducibility"', self.read("research/when2ask/index.html"))
        self.assertNotIn('href="#reproducibility"', self.read("research/when2ask/index.html"))
        works = self.synthetic_audit_fixture(empirical=True)
        self.build()
        self.assertNotIn('id="reproducibility"', self.read("research/when2ask/index.html"))
        works = self.synthetic_audit_fixture()
        (self.root / "content/experiments/test-audit.json").unlink()
        self.build()
        self.assertNotIn('id="reproducibility"', self.read("research/when2ask/index.html"))

    def test_sitemap_merges_idempotently_with_product_routes(self):
        self.build()
        tree = ET.parse(self.root / "sitemap.xml")
        locs = [node.text for node in tree.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
        self.assertEqual(len(locs), 11)  # homepage, two product indexes/pages, two research indexes/four notes
        self.assertEqual(len(locs), len(set(locs)))
        research.build()
        locs2 = [node.text for node in ET.parse(self.root / "sitemap.xml")
                 .findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
        self.assertEqual(locs, locs2)

    def test_publication_badge_requires_own_paper_and_venue(self):
        note = {"status_type": "research", "publication_status": "peer_reviewed", "paper": ""}
        text, kind, eligible = research.publication_info(note, "en")
        self.assertEqual(kind, "in_progress")
        self.assertFalse(eligible)
        note["paper"] = "https://example.org/our-paper.pdf"
        text, kind, eligible = research.publication_info(note, "en")
        self.assertFalse(eligible)
        note["publication_venue"] = "Verified Symposium"
        text, kind, eligible = research.publication_info(note, "en")
        self.assertEqual(kind, "published")
        self.assertTrue(eligible)
        self.assertIn("Verified Symposium", text)
        note["publication_status"] = "preprint"
        text, kind, eligible = research.publication_info(note, "en")
        self.assertEqual(kind, "preprint")
        self.assertTrue(eligible)

    def test_research_toc_overrides_global_flex_navigation_styles(self):
        css = (REPO / "research-pages.css").read_text(encoding="utf-8")
        self.assertIn(".research-toc nav { display: block; overflow: visible;", css)
        self.assertIn("height: auto; max-height: none;", css)
        self.assertIn(".research-toc ol { columns: 1; }", css)
        self.assertIn(".sidebar .profile-quicklink { grid-column: 1 / -1;", css)

    def test_rejects_duplicate_and_unsafe_research_slugs(self):
        bad = json.loads((self.root / "content/works.json").read_text(encoding="utf-8"))
        bad[1]["slug"] = bad[0]["slug"]
        (self.root / "content/works.json").write_text(json.dumps(bad), encoding="utf-8")
        with self.assertRaises(ValueError):
            research.build()


if __name__ == "__main__":
    unittest.main()
