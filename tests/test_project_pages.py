"""Smoke tests for CMS-driven bilingual product pages (research pages intentionally excluded)."""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "scripts/build_project_pages.py"
spec = importlib.util.spec_from_file_location("build_project_pages", SCRIPT)
generator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator)


class ProductPageGeneratorTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.folder = Path(self.temp.name)
        (self.folder / "content").mkdir()
        self.old_root = generator.ROOT
        generator.ROOT = self.folder
        profile = {
            "name_en": "Example Researcher", "name_zh": "範例研究者",
            "short_name": "Example", "avatar": "",
            "role_en": "Student", "role_zh": "學生",
            "affiliation_en": "University", "affiliation_zh": "大學",
            "headline_en": "Research & engineering",
            "headline_zh": "研究與工程",
            "socials": [{"label": "GitHub", "url": "https://github.com/example", "icon": "github"}],
        }
        works = [
            {
                "slug": "featured-app", "category": "project",
                "title_en": "Featured App", "title_zh": "精選應用",
                "summary_en": "Public case study summary",
                "summary_zh": "公開專案摘要",
                "status_en": "Internal testing", "status_zh": "內部測試中",
                "status_type": "testing", "published": True, "featured": True,
                "year": "2026", "order": 2,
                "challenge_en": "<script>unsafe</script>", "role_en": "Builder",
                "image": "/yuhisang.lo/assets/uploads/real-demo.png",
                "image_caption_en": "Actual frontend with mock research data, not live results.",
                "image_caption_zh": "實際前端使用模擬研究資料，並非即時研究結果。",
                "gallery": [{"image": "/yuhisang.lo/assets/uploads/example.png",
                             "caption_en": "First screen"}],
                "github": "javascript:alert(1)",
            },
            {
                "slug": "archive-app", "category": "project",
                "title_en": "Archive App", "title_zh": "其他專案",
                "summary_en": "Listed on the archive", "summary_zh": "收錄於專案列表",
                "published": True, "featured": False, "order": 10,
            },
            {
                "slug": "paper-one", "category": "research",
                "title_en": "Unapproved Research Detail",
                "summary_en": "This must not be published as a paper detail page",
                "published": True, "featured": True,
            },
            {"slug": "private", "category": "project", "published": False, "featured": True},
        ]
        for name, value in [("profile", profile), ("works", works)]:
            (self.folder / "content" / (name + ".json")).write_text(
                json.dumps(value), encoding="utf-8"
            )

    def tearDown(self):
        generator.ROOT = self.old_root
        self.temp.cleanup()

    def read(self, rel):
        return (self.folder / rel).read_text(encoding="utf-8")

    def test_builds_two_localized_pages_per_public_project(self):
        self.assertEqual(generator.build(), 2)
        for path in [
            "projects/index.html", "zh/projects/index.html",
            "projects/featured-app/index.html",
            "zh/projects/featured-app/index.html",
            "projects/archive-app/index.html",
            "zh/projects/archive-app/index.html",
        ]:
            self.assertTrue((self.folder / path).exists(), path)
        self.assertFalse((self.folder / "projects/paper-one/index.html").exists())
        self.assertFalse((self.folder / "projects/private/index.html").exists())

    def test_escapes_cms_content_and_renders_hreflang(self):
        generator.build()
        text = self.read("projects/featured-app/index.html")
        self.assertIn("&lt;script&gt;unsafe&lt;/script&gt;", text)
        self.assertNotIn("<script>unsafe</script>", text)
        self.assertIn('hreflang="zh-Hant"', text)
        self.assertIn('class="badge status-badge status-badge--testing"', text)
        self.assertIn('First screen', text)
        self.assertIn("Actual frontend with mock research data", text)
        self.assertIn('class="case-cover"', text)
        self.assertNotIn("javascript:alert", text)
        self.assertIn("https://gule7309.github.io/yuhisang.lo/projects/featured-app/", text)
        zh = self.read("zh/projects/featured-app/index.html")
        self.assertIn("公開專案摘要", zh)
        self.assertIn("內部測試中", zh)
        self.assertIn("實際前端使用模擬研究資料", zh)

    def test_index_contains_all_published_products_not_research(self):
        generator.build()
        text = self.read("projects/index.html")
        self.assertIn("Featured App", text)
        self.assertIn("Archive App", text)
        self.assertNotIn("Unapproved Research Detail", text)
        self.assertIn("/yuhisang.lo/projects/featured-app/", text)

    def test_verified_phone_layout_uses_real_gallery_images(self):
        fixture = json.loads((self.folder / "content/works.json").read_text(encoding="utf-8"))
        fixture[0]["media_layout"] = "phone"
        fixture[0]["gallery"].extend([
            {"image": "/yuhisang.lo/assets/uploads/second.png",
             "caption_en": "Second actual QA screen"},
            {"image": "/yuhisang.lo/assets/uploads/third.png",
             "caption_en": "Third actual QA screen"},
        ])
        (self.folder / "content/works.json").write_text(json.dumps(fixture), encoding="utf-8")
        generator.build()
        page = self.read("projects/featured-app/index.html")
        archive = self.read("projects/index.html")
        self.assertIn('class="case-cover has-phone-layout"', page)
        self.assertIn('class="case-gallery has-phone-layout"', page)
        self.assertIn('class="project-list-cover has-phone-layout"', archive)
        self.assertIn('class="cover-phone-strip"', archive)
        self.assertIn("/yuhisang.lo/assets/uploads/second.png", archive)
        self.assertIn("/yuhisang.lo/assets/uploads/third.png", archive)
        self.assertNotIn("phone-shot", self.read("projects/archive-app/index.html"))

    def test_optional_technical_sections_are_localized_escaped_and_source_safe(self):
        fixture = json.loads((self.folder / "content/works.json").read_text(encoding="utf-8"))
        fixture[0].update({
            "architecture_note_en": "Prototype layers, not production <script>.",
            "architecture_note_zh": "這是概念分層，不是正式部署。",
            "architecture_layers": [
                {"title_en": "UI <script>alert(1)</script>", "title_zh": "介面",
                 "description_en": "Client-side editable", "description_zh": "可操作",
                 "stage": "implemented"},
                {"title_en": "Unknown stage", "title_zh": "未知階段",
                 "description_en": "Do not claim verified", "description_zh": "不能聲稱通過",
                 "stage": "released"}
            ],
            "engineering_decisions": [
                {"title_en": "Reliability", "title_zh": "可靠性",
                 "rationale_en": "Never trust <b>mock</b> output.",
                 "rationale_zh": "不能將測試當作成績。"}
            ],
            "verification_evidence": [
                {"title_en": "Mock tests", "title_zh": "Mock 測試",
                 "detail_en": "Fixture only.", "detail_zh": "僅示範資料。",
                 "status": "verified",
                 "source_url": "https://github.com/example/research"},
                {"title_en": "Unverified release", "title_zh": "未驗證發布",
                 "detail_en": "Do not claim rollout", "detail_zh": "不可聲稱上線",
                 "status": "pass", "source_url": "javascript:alert(1)"}
            ]
        })
        (self.folder / "content/works.json").write_text(
            json.dumps(fixture), encoding="utf-8")
        generator.build()
        en = self.read("projects/featured-app/index.html")
        zh = self.read("zh/projects/featured-app/index.html")
        archive = self.read("projects/archive-app/index.html")
        self.assertIn('href="#architecture"', en)
        self.assertIn('id="architecture"', en)
        self.assertIn('class="case-architecture-grid"', en)
        self.assertIn('case-architecture-state--implemented', en)
        self.assertIn('case-architecture-state--prototype', en)
        self.assertIn('id="engineering"', en)
        self.assertIn('id="verification"', en)
        self.assertIn('case-evidence-state--verified', en)
        self.assertIn('case-evidence-state--pending', en)
        self.assertNotIn('case-evidence-state--pass', en)
        self.assertIn("UI &lt;script&gt;alert(1)&lt;/script&gt;", en)
        self.assertNotIn("<script>alert(1)</script>", en)
        self.assertIn("Never trust &lt;b&gt;mock&lt;/b&gt;", en)
        self.assertIn('href="https://github.com/example/research"', en)
        self.assertNotIn("javascript:alert", en)
        self.assertIn("這是概念分層", zh)
        self.assertIn("工程取捨與設計決策", zh)
        self.assertIn("尚未驗證", zh)
        self.assertNotIn('id="architecture"', archive)
        self.assertNotIn('id="verification"', archive)

    def test_pinned_source_trace_renders_escaped_code_and_rejects_invalid_links(self):
        fixture = json.loads((self.folder / "content/works.json").read_text(encoding="utf-8"))
        pin = "a" * 40
        fixture[0]["source_traces"] = [
            {"title_en": "Source-grounded <script>claim</script>",
             "title_zh": "原始碼證據",
             "explanation_en": "Only shows a branch of the decision.",
             "explanation_zh": "僅顯示其中一條規則。",
             "code": 'if x < y:\n    return "safe"',
             "language": "python",
             "source_url": f"https://github.com/example/public-repo/blob/{pin}/src/step.py#L15-L16"},
            {"title_en": "Unpinned link", "explanation_en": "unsafe",
             "code": "return True", "source_url":
             "https://github.com/example/repo/blob/main/a.py#L1"},
            {"title_en": "Mismatched lines", "explanation_en": "inexact",
             "code": "return True", "source_url":
             f"https://github.com/example/repo/blob/{pin}/a.py#L1-L3"},
            {"title_en": "Private code", "explanation_en": "unsafe",
             "code": "return True", "source_url": "javascript:alert(1)"},
            {"title_en": "Traversal", "explanation_en": "unsafe",
             "code": "return True", "source_url":
             f"https://github.com/example/repo/blob/{pin}/src/../secrets.py#L1"},
        ]
        (self.folder / "content/works.json").write_text(
            json.dumps(fixture), encoding="utf-8")
        generator.build()
        en = self.read("projects/featured-app/index.html")
        zh = self.read("zh/projects/featured-app/index.html")
        other = self.read("projects/archive-app/index.html")
        self.assertIn('class="case-section case-source-traces"', en)
        self.assertIn('id="implementation"', en)
        self.assertIn('class="case-trace-list"', en)
        self.assertIn("Source-grounded &lt;script&gt;claim&lt;/script&gt;", en)
        self.assertIn("if x &lt; y:", en)
        self.assertNotIn("<script>claim</script>", en)
        self.assertIn(f'/src/step.py#L15-L16"', en)
        self.assertIn('rel="noopener noreferrer"', en)
        self.assertNotIn("Unpinned link", en)
        self.assertNotIn("Mismatched lines", en)
        self.assertNotIn("Private code", en)
        self.assertNotIn("Traversal", en)
        self.assertIn("原始碼證據", zh)
        self.assertNotIn('id="implementation"', other)

    def test_source_trace_is_absent_without_safe_exact_source(self):
        fake = {"title_en": "Unlinked", "explanation_en": "Not verified",
                "code": "print('hi')", "source_url": "http://github.com/code"}
        self.assertEqual(generator.verified_source_traces({"source_traces": [fake]}, "en"), [])
        self.assertEqual(generator.source_traces_markup({"source_traces": [fake]}, "en"), "")
        giant = {"title_en": "Overlong", "explanation_en": "Not valid",
                 "code": "line\n" * 15,
                 "source_url": f"https://github.com/a/b/blob/{'a'*40}/f.py#L1-L15"}
        self.assertEqual(generator.verified_source_traces({"source_traces": [giant]}, "en"), [])

    def test_sitemap_and_safe_url_handling(self):
        generator.build()
        sitemap = self.read("sitemap.xml")
        self.assertEqual(sitemap.count("<url>"), 7)
        self.assertIn("https://gule7309.github.io/yuhisang.lo/zh/projects/archive-app/", sitemap)
        self.assertEqual(generator.safe_href("javascript:alert(1)"), "")
        self.assertEqual(generator.safe_href("http://example.org"), "")
        self.assertEqual(generator.safe_href("data:image/png;base64,X", allow_local=True), "")
        self.assertEqual(
            generator.safe_href("/yuhisang.lo/assets/uploads/screen.png", allow_local=True),
            "/yuhisang.lo/assets/uploads/screen.png",
        )

    def test_refuses_duplicate_or_unsafe_slugs(self):
        fixture = json.loads((self.folder / "content/works.json").read_text(encoding="utf-8"))
        fixture[1]["slug"] = fixture[0]["slug"]
        (self.folder / "content/works.json").write_text(json.dumps(fixture), encoding="utf-8")
        with self.assertRaises(ValueError):
            generator.build()


if __name__ == "__main__":
    unittest.main()
