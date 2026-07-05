#!/usr/bin/env python3
"""Build content/play/manifest.json from images and video markdown files."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLAY_DIR = ROOT / "content" / "play"
MANIFEST = PLAY_DIR / "manifest.json"

IMAGE_EXT = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"}
VIDEO_EXT = {".mp4", ".webm", ".mov"}
SKIP_NAMES = {"manifest.json", "README.md", ".DS_Store"}
SIZE_VALUES = {"sm", "md", "lg", "wide"}
URL_RE = re.compile(r"https?://[^\s<>\"')\\]]+")
META_KEYS = ("title", "date", "tag", "link", "linkLabel", "alt", "size")


def parse_frontmatter(text: str) -> tuple[dict[str, str], str]:
    if not text.startswith("---"):
        return {}, text

    match = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n?(.*)$", text, re.DOTALL)
    if not match:
        return {}, text

    meta: dict[str, str] = {}
    for line in match.group(1).splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        meta[key.strip()] = value.strip().strip("\"'")

    return meta, match.group(2)


def normalize_size(value: str | None) -> str | None:
    if not value:
        return None
    cleaned = value.removeprefix("play-card--")
    return cleaned if cleaned in SIZE_VALUES else None


def body_description(body: str) -> str:
    lines = []
    for line in body.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        if URL_RE.fullmatch(stripped.rstrip(".,;")):
            continue
        if stripped.startswith("http://") or stripped.startswith("https://"):
            continue
        lines.append(stripped)
    return "\n\n".join(lines).strip()


def apply_metadata(item: dict, meta: dict[str, str], body: str) -> None:
    for key in META_KEYS:
        value = meta.get(key)
        if not value:
            continue
        if key == "size":
            size = normalize_size(value)
            if size:
                item["size"] = f"play-card--{size}"
        else:
            item[key] = value

    description = body_description(body)
    if description:
        item["description"] = description


def load_sidecar(stem: str) -> tuple[dict[str, str], str]:
    path = PLAY_DIR / f"{stem}.md"
    if not path.is_file():
        return {}, ""
    return parse_frontmatter(path.read_text(encoding="utf-8"))


def vimeo_embed(vid: str, *, background: bool) -> str:
    if background:
        return (
            f"https://player.vimeo.com/video/{vid}"
            "?background=1&loop=1&autoplay=1&muted=1"
            "&title=0&byline=0&portrait=0&badge=0"
        )
    return (
        f"https://player.vimeo.com/video/{vid}"
        "?autoplay=1&title=0&byline=0&portrait=0"
    )


def youtube_embed(vid: str, *, background: bool) -> str:
    if background:
        return (
            f"https://www.youtube.com/embed/{vid}"
            f"?autoplay=1&mute=1&loop=1&playlist={vid}&controls=0&modestbranding=1"
        )
    return f"https://www.youtube.com/embed/{vid}?autoplay=1&modestbranding=1"


def normalize_video_url(url: str) -> tuple[str, str, str | None]:
    url = url.rstrip(".,;")

    vimeo_id = re.search(r"vimeo\.com/(?:video/)?(\d+)", url)
    if vimeo_id:
        vid = vimeo_id.group(1)
        return vimeo_embed(vid, background=True), "embed", vimeo_embed(vid, background=False)

    youtube_id = re.search(
        r"(?:youtube\.com/(?:watch\?v=|embed/|shorts/)|youtu\.be/)([\w-]{11})",
        url,
    )
    if youtube_id:
        vid = youtube_id.group(1)
        return (
            youtube_embed(vid, background=True),
            "embed",
            youtube_embed(vid, background=False),
        )

    if re.search(r"\.(mp4|webm|mov)(\?|$)", url, re.I):
        return url, "file", url

    return url, "embed", url


def item_from_markdown(path: Path) -> dict | None:
    text = path.read_text(encoding="utf-8")
    meta, body = parse_frontmatter(text)

    raw_url = meta.get("src") or meta.get("url")
    if not raw_url:
        urls = URL_RE.findall(body)
        raw_url = urls[0] if urls else None

    if not raw_url:
        print(f"skip {path.name}: no video URL found", file=sys.stderr)
        return None

    src, kind, modal_src = normalize_video_url(raw_url)
    item: dict = {
        "id": path.stem,
        "type": "video",
        "kind": kind,
        "src": src,
        "modalSrc": modal_src,
    }

    apply_metadata(item, meta, body)

    poster = meta.get("poster")
    if poster:
        item["poster"] = f"/content/play/{poster}"

    return item


def item_from_media(path: Path) -> dict:
    ext = path.suffix.lower()
    web_path = f"/content/play/{path.name}"
    meta, body = load_sidecar(path.stem)

    if ext in VIDEO_EXT:
        item: dict = {
            "id": path.stem,
            "type": "video",
            "kind": "file",
            "src": web_path,
            "modalSrc": web_path,
        }
    else:
        item = {
            "id": path.stem,
            "type": "image",
            "src": web_path,
            "modalSrc": web_path,
            "alt": "",
        }

    apply_metadata(item, meta, body)
    return item


def build_manifest() -> dict:
    if not PLAY_DIR.is_dir():
        raise SystemExit(f"Missing directory: {PLAY_DIR}")

    poster_files: set[str] = set()
    md_items: list[dict] = []
    sidecar_stems: set[str] = set()

    for path in sorted(PLAY_DIR.glob("*.md")):
        if path.name in SKIP_NAMES or path.name.startswith("_"):
            continue

        media_match = (PLAY_DIR / f"{path.stem}.png").exists() or any(
            (PLAY_DIR / f"{path.stem}{ext}").exists() for ext in IMAGE_EXT | VIDEO_EXT
        )
        if media_match:
            sidecar_stems.add(path.stem)
            continue

        item = item_from_markdown(path)
        if not item:
            continue
        poster = item.get("poster", "")
        if poster:
            poster_files.add(poster.rsplit("/", 1)[-1])
        md_items.append(item)

    media_items: list[dict] = []
    for path in sorted(PLAY_DIR.iterdir()):
        if not path.is_file():
            continue
        if path.name in SKIP_NAMES or path.name.startswith("_"):
            continue
        if path.name in poster_files:
            continue

        ext = path.suffix.lower()
        if ext == ".md" or ext == ".json":
            continue
        if ext not in IMAGE_EXT and ext not in VIDEO_EXT:
            continue

        media_items.append(item_from_media(path))

    items = sorted(media_items + md_items, key=lambda item: item["id"].lower())
    return {"items": items}


def main() -> None:
    manifest = build_manifest()
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(manifest['items'])} item(s) to {MANIFEST.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
