"""Intrinsic media sizing should reserve correct layout without trusting CMS paths."""
import sys
import struct
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from image_dimensions import local_image, dimensions, image_size_attrs


class ImageDimensionsTests(unittest.TestCase):
    def test_png_dimensions_from_real_header(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            media = root / "assets" / "projects"
            media.mkdir(parents=True)
            (media / "example.png").write_bytes(
                b"\x89PNG\r\n\x1a\n" + struct.pack(">I", 13) + b"IHDR" +
                struct.pack(">II", 640, 360) + b"\x08\x06\x00\x00\x00"
            )
            self.assertEqual(image_size_attrs("assets/projects/example.png", root), ' width="640" height="360"')
            self.assertEqual(image_size_attrs("/yuhisang.lo/assets/projects/example.png", root), ' width="640" height="360"')

    def test_svg_dimensions_from_viewbox(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            media = root / "assets"
            media.mkdir()
            (media / "fig.svg").write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675"></svg>')
            self.assertEqual(image_size_attrs("assets/fig.svg", root), ' width="1200" height="675"')

    def test_jpeg_dimensions(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            media = root / "assets"
            media.mkdir()
            # Minimal SOF0 marker sequence sufficient to inspect encoded width/height.
            raw = b"\xff\xd8\xff\xc0\x00\x11\x08\x02\xd0\x05\x00"
            (media / "photo.jpg").write_bytes(raw)
            self.assertEqual(dimensions(media / "photo.jpg"), (1280, 720))

    def test_checked_in_assets_have_intrinsic_dimensions(self):
        png = "assets/projects/trading-radar-dashboard-demo.png"
        svg = "assets/figures/when2ask-intervention-plan.svg"
        for path in (png, svg):
            attrs = image_size_attrs(path)
            self.assertIn(' width="', attrs)
            self.assertIn('" height="', attrs)

    def test_invalid_and_remote_are_not_accessed(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.assertIsNone(local_image("https://example.com/photo.jpg", root))
            self.assertIsNone(local_image("assets/../secret.png", root))
            self.assertIsNone(local_image("assets/x.png?src=another", root))
            self.assertEqual(image_size_attrs("assets/missing.png", root), "")
