"""Tests media validation, including the real-world mislabeled JPEG case."""
from __future__ import annotations
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))
import validate_media as media


class SourceMediaIntegrityTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root / "assets/projects").mkdir(parents=True)
        self.original_root = media.ROOT
        media.ROOT = self.root

    def tearDown(self):
        media.ROOT = self.original_root
        self.tmp.cleanup()

    def save(self, name: str, content: bytes) -> str:
        path = self.root / "assets/projects" / name
        path.write_bytes(content)
        return "/yuhisang.lo/assets/projects/" + name

    def test_jpeg_stored_with_correct_extension_is_valid(self):
        path = self.save("pixelfit.jpg", b"\xff\xd8\xff\xe0" + b"0" * 60)
        media.validate_one(path)

    def test_mislabeled_png_with_jpeg_bytes_is_rejected(self):
        path = self.save("pixelfit.png", b"\xff\xd8\xff\xe0" + b"0" * 60)
        with self.assertRaisesRegex(ValueError, "PNG signature"):
            media.validate_one(path)

    def test_jpeg_path_with_non_jpeg_bytes_is_rejected(self):
        path = self.save("not-really.jpg", b"not an image")
        with self.assertRaisesRegex(ValueError, "JPEG signature"):
            media.validate_one(path)

    def test_missing_image_rejected(self):
        with self.assertRaisesRegex(ValueError, "Missing local media"):
            media.validate_one("/yuhisang.lo/assets/projects/missing.jpg")

    def test_path_traversal_and_remote_http_rejected(self):
        with self.assertRaises(ValueError):
            media.local_asset("/yuhisang.lo/assets/../../../secrets.txt")
        with self.assertRaises(ValueError):
            media.local_asset("http://external.example/pixelfit.png")
        self.assertIsNone(media.local_asset("https://example.com/verified-image.jpg"))


if __name__ == "__main__":
    unittest.main()
