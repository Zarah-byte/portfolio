#!/usr/bin/env python3
"""Build content/play/manifest.json from archive.md (+ loose media fallbacks)."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLAY_DIR = ROOT / "content" / "play"
MANIFEST = PLAY_DIR / "manifest.json"
ARCHIVE = PLAY_DIR / "archive.md"

IMAGE_EXT = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"}
VIDEO_EXT = {".mp4", ".webm", ".mov"}
SKIP_NAMES = {
    "manifest.json",
    "README.md",
    "archive.md",
    ".DS_Store",
}
SIZE_VALUES = {"sm", "md", "lg", "wide"}
URL_RE = re.compile(r"https?://[^\s<>\"')\\]]+")
META_KEYS = ("title", "date", "tag", "link", "linkLabel", "alt", "size", "order")
FIELD_RE = re.compile(
    r"^(image|src|url|poster|date|tag|order|link|linkLabel|alt|size)\s*:\s*(.+?)\s*$",
    re.I,
)


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
    if not path.is_file() or path.name in SKIP_NAMES:
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
            f"?autoplay=1&mute=1&loop=1&playlist={vid}&controls=0&modestbranding=1&rel=0"
        )
    return f"https://www.youtube.com/embed/{vid}?autoplay=1&modestbranding=1&rel=0"


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


def find_media_file(filename: str) -> Path | None:
    path = PLAY_DIR / filename
    if path.is_file():
        return path

    stem = Path(filename).stem
    for ext in IMAGE_EXT | VIDEO_EXT:
        candidate = PLAY_DIR / f"{stem}{ext}"
        if candidate.is_file():
            return candidate
    return None


def parse_archive_entries(text: str) -> list[dict[str, str]]:
    """Parse content/play/archive.md into entry dicts."""
    # Drop leading instructions before the first entry heading.
    parts = re.split(r"\n---\n+", text)
    entries: list[dict[str, str]] = []

    for part in parts:
        stripped = part.strip()
        if not stripped:
            continue

        heading = re.search(r"^##\s+(.+)$", stripped, re.M)
        if not heading:
            continue

        title = heading.group(1).strip()
        after = stripped[heading.end() :].lstrip("\n")

        meta: dict[str, str] = {"title": title}
        body_lines: list[str] = []
        in_body = False

        for line in after.splitlines():
            if not in_body:
                match = FIELD_RE.match(line.strip())
                if match:
                    meta[match.group(1)] = match.group(2).strip().strip("\"'")
                    continue
                if not line.strip():
                    # Blank line after fields starts the description body.
                    if any(k in meta for k in ("image", "src", "url", "date", "tag", "order")):
                        in_body = True
                    continue
                # Non-field, non-blank before fields finished — treat as body.
                in_body = True
                body_lines.append(line)
                continue
            body_lines.append(line)

        meta["body"] = "\n".join(body_lines).strip()
        entries.append(meta)

    return entries


def item_from_archive_entry(entry: dict[str, str]) -> dict | None:
    image = entry.get("image", "").strip()
    raw_url = entry.get("src") or entry.get("url") or ""
    body = entry.get("body", "")

    if not raw_url:
        urls = URL_RE.findall(body)
        # Only treat body URL as media src when there is no image file.
        if not image and urls:
            raw_url = urls[0]

    meta = {k: entry[k] for k in META_KEYS if entry.get(k)}

    if image:
        media = find_media_file(image)
        if not media:
            print(f"skip archive entry '{entry.get('title')}': missing media {image}", file=sys.stderr)
            return None

        web_path = f"content/play/{media.name}"
        ext = media.suffix.lower()
        if ext in VIDEO_EXT:
            item: dict = {
                "id": media.stem,
                "type": "video",
                "kind": "file",
                "src": web_path,
                "modalSrc": web_path,
            }
        else:
            item = {
                "id": media.stem,
                "type": "image",
                "src": web_path,
                "modalSrc": web_path,
                "alt": "",
            }
        apply_metadata(item, meta, body)
        return item

    if raw_url:
        src, kind, modal_src = normalize_video_url(raw_url)
        item = {
            "id": re.sub(r"[^A-Za-z0-9_-]+", "-", meta.get("title", "video")).strip("-") or "video",
            "type": "video",
            "kind": kind,
            "src": src,
            "modalSrc": modal_src,
        }
        apply_metadata(item, meta, body)
        poster = entry.get("poster")
        if poster:
            item["poster"] = f"content/play/{poster}"
        return item

    print(f"skip archive entry '{entry.get('title')}': needs image: or src:", file=sys.stderr)
    return None


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
        item["poster"] = f"content/play/{poster}"

    return item


def item_from_media(path: Path) -> dict:
    ext = path.suffix.lower()
    web_path = f"content/play/{path.name}"
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

    # Preferred source: single archive.md
    if ARCHIVE.is_file():
        entries = parse_archive_entries(ARCHIVE.read_text(encoding="utf-8"))
        items: list[dict] = []
        claimed_media: set[str] = set()

        for entry in entries:
            item = item_from_archive_entry(entry)
            if not item:
                continue
            items.append(item)
            claimed_media.add(Path(item["src"]).name)

        # Optional: leftover media files without an archive entry still appear.
        for path in sorted(PLAY_DIR.iterdir()):
            if not path.is_file() or path.name in SKIP_NAMES:
                continue
            ext = path.suffix.lower()
            if ext not in IMAGE_EXT and ext not in VIDEO_EXT:
                continue
            if path.name in claimed_media:
                continue
            items.append(item_from_media(path))

        return {"items": items}

    # Legacy fallback: sidecar .md files + media scan
    poster_files: set[str] = set()
    md_items: list[dict] = []

    for path in sorted(PLAY_DIR.glob("*.md")):
        if path.name in SKIP_NAMES or path.name.startswith("_"):
            continue

        media_match = (PLAY_DIR / f"{path.stem}.png").exists() or any(
            (PLAY_DIR / f"{path.stem}{ext}").exists() for ext in IMAGE_EXT | VIDEO_EXT
        )
        if media_match:
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
