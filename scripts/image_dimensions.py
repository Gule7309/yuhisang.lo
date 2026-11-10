"""Read intrinsic dimensions for safe checked-in portfolio images without dependencies.

Only local assets are inspected. Invalid/unknown formats simply omit HTML dimensions.
The value of `width`/`height` reserves intrinsic aspect ratio; CSS controls display.
"""
from __future__ import annotations
import re
import struct
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
PREFIX = "/yuhisang.lo/"

def local_image(raw: object, root: Path = ROOT) -> Path | None:
    value = str(raw or "").strip()
    parsed = urlsplit(value)
    if parsed.scheme or parsed.netloc or parsed.query or parsed.fragment:
        return None
    rel = value[len(PREFIX):] if value.startswith(PREFIX) else value
    if not rel.startswith("assets/"):
        return None
    candidate = (root / rel).resolve()
    if not candidate.is_relative_to((root / 'assets').resolve()) or not candidate.is_file():
        return None
    return candidate

def dimensions(path: Path) -> tuple[int, int] | None:
    ext = path.suffix.lower()
    try:
        if ext == ".png":
            with path.open("rb") as fh:
                header = fh.read(24)
            if header[:8] == b"\x89PNG\r\n\x1a\n" and header[12:16] == b"IHDR":
                width, height = struct.unpack(">II", header[16:24])
            else:
                return None
        elif ext in (".jpg", ".jpeg"):
            with path.open("rb") as fh:
                if fh.read(2) != b"\xff\xd8":
                    return None
                while True:
                    marker = fh.read(1)
                    if not marker:
                        return None
                    if marker != b"\xff":
                        continue
                    while marker == b"\xff":
                        marker = fh.read(1)
                    if not marker or marker in (b"\xd9", b"\xda"):
                        return None
                    marker_id = marker[0]
                    if marker_id in (1,) or 0xD0 <= marker_id <= 0xD8:
                        continue
                    raw_length = fh.read(2)
                    if len(raw_length) != 2:
                        return None
                    segment_size = int.from_bytes(raw_length, "big")
                    if segment_size < 2:
                        return None
                    if marker_id in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                        data = fh.read(5)
                        if len(data) != 5:
                            return None
                        height = int.from_bytes(data[1:3], "big")
                        width = int.from_bytes(data[3:5], "big")
                        break
                    fh.seek(segment_size - 2, 1)
        elif ext == ".webp":
            with path.open("rb") as fh:
                header = fh.read(30)
            if header[:4] != b"RIFF" or header[8:12] != b"WEBP":
                return None
            if header[12:16] == b"VP8X" and len(header) >= 30:
                width = 1 + int.from_bytes(header[24:27], "little")
                height = 1 + int.from_bytes(header[27:30], "little")
            elif header[12:16] == b"VP8 " and len(header) >= 30 and header[23:26] == b"\x9d\x01\x2a":
                width = int.from_bytes(header[26:28], "little") & 0x3FFF
                height = int.from_bytes(header[28:30], "little") & 0x3FFF
            else:
                return None
        elif ext == ".svg":
            root = ET.parse(path).getroot()
            if not root.tag.endswith("}svg") and root.tag != "svg":
                return None
            view_box = root.attrib.get("viewBox", "")
            values = re.split(r"[\s,]+", view_box.strip())
            if len(values) != 4:
                return None
            width, height = float(values[2]), float(values[3])
        else:
            return None
        width, height = int(width), int(height)
        if 0 < width <= 100000 and 0 < height <= 100000:
            return width, height
    except (OSError, ValueError, ET.ParseError, struct.error):
        return None
    return None

def image_size_attrs(raw: object, root: Path = ROOT) -> str:
    path = local_image(raw, root)
    size = dimensions(path) if path else None
    return f' width="{size[0]}" height="{size[1]}"' if size else ""
