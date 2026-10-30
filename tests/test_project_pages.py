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
        self.assertNotIn("javascript:alert", text)
        self.assertIn("https://gule7309.github.io/yuhisang.lo/projects/featured-app/", text)
        zh = self.read("zh/projects/featured-app/index.html")
        self.assertIn("公開專案摘要", zh)
        self.assertIn("內部測試中", zh)

    def test_index_contains_all_published_products_not_research(self):
        generator.build()
        text = self.read("projects/index.html")
        self.assertIn("Featured App", text)
        self.assertIn("Archive App", text)
        self.assertNotIn("Unapproved Research Detail", text)
        self.assertIn("/yuhisang.lo/projects/featured-app/", text)

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
