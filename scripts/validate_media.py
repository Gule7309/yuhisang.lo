#!/usr/bin/env python3
"""Validate public portfolio image provenance and checked-in asset references.

This does not verify remote image availability. It verifies local media exists and
has a plausible safe image format, so a merged PR cannot silently show broken
local screenshots or research diagrams.
"""
from __future__ import annotations
import json
from pathlib import Path
from urllib.parse import urlparse
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SITE_PREFIX = "/yuhisang.lo/"
EXTENSIONS = {".svg", ".png", ".jpg", ".jpeg", ".webp"}


def local_asset(value: str) -> Path | None:
    path = str(value or "").strip()
    if not path:
        return None
    if path.startswith(SITE_PREFIX):
        relative = path[len(SITE_PREFIX):]
    elif path.startswith("assets/"):
        relative = path
    elif urlparse(path).scheme == "https" and urlparse(path).netloc:
        return None
    else:
        raise ValueError(f"Unsupported media path or protocol: {path}")
    candidate = (ROOT / relative).resolve()
    if not candidate.is_relative_to(ROOT.resolve()) or not relative.startswith("assets/"):
        raise ValueError(f"Media path traversal or out-of-scope asset: {path}")
    return candidate


def validate_one(value: str) -> None:
    path = local_asset(value)
    if not path:
        return
    if not path.is_file():
        raise ValueError(f"Missing local media file: {path.relative_to(ROOT)}")
    if path.suffix.lower() not in EXTENSIONS:
        raise ValueError(f"Unsupported local image extension: {path.name}")
    if path.stat().st_size > 5 * 1024 * 1024:
        raise ValueError(f"Image above 5MB site budget: {path.name}")
    header = path.open("rb").read(16)
    suffix = path.suffix.lower()
    if suffix == ".png" and header[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"Invalid PNG signature: {path.name}")
    if suffix in {".jpg", ".jpeg"} and not header.startswith(b"\xff\xd8\xff"):
        raise ValueError(f"Invalid JPEG signature: {path.name}")
    if suffix == ".webp" and not (header.startswith(b"RIFF") and header[8:12] == b"WEBP"):
        raise ValueError(f"Invalid WebP signature: {path.name}")
    if path.suffix.lower() == ".svg":
        tree = ET.parse(path)
        if tree.getroot().tag != "{http://www.w3.org/2000/svg}svg":
            raise ValueError(f"Invalid root for SVG: {path.name}")
        # Keep editorial diagrams as inert source-based media, not scripts.
        for el in tree.iter():
            if el.tag.lower().endswith("script"):
                raise ValueError(f"SVG embeds script: {path.name}")
            for k in el.attrib:
                if k.lower().startswith("on"):
                    raise ValueError(f"SVG has an event attribute: {path.name}")


def validate() -> int:
    works = json.loads((ROOT / "content" / "works.json").read_text(encoding="utf-8"))
    count = 0
    for item in works:
        if not item.get("published"):
            continue
        fields = [item.get("image") or ""]
        for gallery in ("gallery", "research_figures"):
            for entry in item.get(gallery) or []:
                if not isinstance(entry, dict):
                    raise ValueError(f"Invalid media entry for {item.get('slug')}: {entry}")
                fields.append(entry.get("image") or "")
        for value in fields:
            if value:
                validate_one(value)
                count += 1
        if item.get("slug") in {"trading-radar", "pixelfit"} and item.get("image"):
            if not item.get("image_caption_en") or not item.get("image_caption_zh"):
                raise ValueError(f"{item.get('slug')} screenshot requires bilingual provenance captions")
    print(f"Validated {count} published work image references.")
    return count


if __name__ == "__main__":
    validate()
