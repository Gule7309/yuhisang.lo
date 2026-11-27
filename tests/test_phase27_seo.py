"""Phase 27: canonical/social metadata and accessible language-specific navigation."""
import sys
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
import build_project_pages as project
import build_research_pages as research

PROFILE={'name_en':'Example','name_zh':'範例','short_name':'Example'}
PROJECT={'slug':'example-project','category':'project','title_en':'Example',
         'title_zh':'範例','summary_en':'Public prototype','summary_zh':'公開原型',
         'published':True}
RESEARCH={'slug':'example-research','category':'research','title_en':'Research',
          'title_zh':'研究','summary_en':'Research summary','summary_zh':'研究摘要',
          'published':True,'publication_status':'work_in_progress'}

class SeoAccessibilityTests(unittest.TestCase):
    def test_homepage_canonical_and_social_metadata(self):
        text=(ROOT/'index.html').read_text(encoding='utf-8')
        self.assertIn('<link rel="canonical" href="https://gule7309.github.io/yuhisang.lo/">',text)
        self.assertIn('<meta property="og:type" content="website">',text)
        self.assertIn('<meta property="og:url" content="https://gule7309.github.io/yuhisang.lo/">',text)
        self.assertIn('<meta name="twitter:card" content="summary">',text)
        self.assertNotIn('hreflang="zh-Hant"',text,
          "Home language toggle shares one URL; it is not a separate Chinese route")

    def test_project_archive_uses_website_and_details_article(self):
        listing=project.listing([PROJECT],PROFILE,'en')
        detail=project.detail(PROJECT,PROFILE,'en')
        self.assertIn('<meta property="og:type" content="website">',listing)
        self.assertIn('<meta property="og:type" content="article">',detail)
        self.assertIn('hreflang="x-default"',listing)
        self.assertIn('<meta name="twitter:card" content="summary">',listing)

    def test_research_archive_uses_website_and_detail_article(self):
        listing=research.listing([RESEARCH],PROFILE,'zh')
        detail=research.detail(RESEARCH,PROFILE,'zh')
        self.assertIn('<meta property="og:type" content="website">',listing)
        self.assertIn('<meta property="og:type" content="article">',detail)
        self.assertIn('hreflang="x-default"',detail)

    def test_skip_link_matches_page_language(self):
        project_zh=project.listing([PROJECT],PROFILE,'zh')
        research_zh=research.listing([RESEARCH],PROFILE,'zh')
        project_en=project.listing([PROJECT],PROFILE,'en')
        self.assertIn('class="skip">跳至主要內容</a>',project_zh)
        self.assertIn('class="skip">跳至主要內容</a>',research_zh)
        self.assertIn('class="skip">Skip to content</a>',project_en)

    def test_og_type_rejects_unknown_value(self):
        with self.assertRaises(ValueError):
            project.head('Title','Description','https://example.org/','/en/','/zh/',page_type='unknown')
