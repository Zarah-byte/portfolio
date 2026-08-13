#!/usr/bin/env python3
"""Build projects/*.html from content/work/*.md.

Run: python3 scripts/build-work-pages.py
"""

from __future__ import annotations

import html
import re
import sys
from pathlib import Path
from urllib.parse import quote

SITE_URL = "https://zarahyaqub.com"

ROOT = Path(__file__).resolve().parents[1]
WORK_DIR = ROOT / "content" / "work"
PROJECTS_DIR = ROOT / "projects"
TEMPLATE = Path(__file__).resolve().parent / "templates" / "project.html"

SLUG_MAP = {
    "tasks": "tasks",
}

# Four, matching the meta grid's explicit four columns — the row stays a
# single line. `year` and `context` stay in the frontmatter but are not
# surfaced here.
DETAIL_FIELDS = [
    ("duration", "Timeline"),
    ("role", "Role"),
    ("team", "Team"),
    ("tools", "Tools"),
]
VIMEO_BG_PARAMS = (
    "?background=1&loop=1&autoplay=1&muted=1"
    "&title=0&byline=0&portrait=0&badge=0&app_id=58479"
)

VIMEO_CTRL_PARAMS = "?title=0&byline=0&portrait=0&badge=0&app_id=58479"

IFRAME_ALLOW = "autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"

VIMEO_TAG_RE = re.compile(r"^\[vimeo:(\d+)(?:\s+(.*))?\]$")
YOUTUBE_TAG_RE = re.compile(r"^\[youtube:([\w-]{11})(?:\s+(.*))?\]$")
IMAGE_TAG_RE = re.compile(r"^\[image:([^\]\s]+)(?:\s+(.*))?\]$")
CALLOUT_TAG_RE = re.compile(r"^\[callout:\s*(.+)\]$")
PLACEHOLDER_TAG_RE = re.compile(r"^\[placeholder:\s*(.+)\]$")
CARD_TAG_RE = re.compile(r"^\[card:\s*(.+)\]$")
FAQ_TAG_RE = re.compile(r"^\[faq:\s*(.+)\]$")
PANEL_TAG_RE = re.compile(r"^\[panel:\s*(.+)\]$")
QUOTE_TAG_RE = re.compile(r"^\[quote:\s*(.+)\]$")
FIGURE_TAG_RE = re.compile(r"^\[figure:([^\]\s]+)\s*\|\s*(.+)\]$")
DECK_TAG_RE = re.compile(r"^\[deck\]\s+(.+)$")
ORDERED_ITEM_RE = re.compile(r"^\d+\.\s+")
# Single "-" or "*" plus a space — "**bold**" and "*emphasis*" don't match.
UNORDERED_ITEM_RE = re.compile(r"^[-*]\s+")
BOLD_RE = re.compile(r"\*\*(.+?)\*\*")


def parse_frontmatter(text: str) -> tuple[dict[str, str], str]:
    if not text.startswith("---"):
        return {}, text

    match = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n?(.*)$", text, re.DOTALL)
    if not match:
        return {}, text

    meta: dict[str, str] = {}
    block = match.group(1)
    lines = block.splitlines()
    index = 0

    while index < len(lines):
        line = lines[index]
        if not line.strip() or line.strip().startswith("#"):
            index += 1
            continue

        if ":" not in line:
            index += 1
            continue

        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip()

        if value == "|":
            index += 1
            collected: list[str] = []
            while index < len(lines):
                next_line = lines[index]
                if next_line and not next_line[0].isspace() and ":" in next_line:
                    break
                collected.append(next_line.strip())
                index += 1
            meta[key] = "\n".join(line for line in collected if line)
            continue

        meta[key] = value.strip("\"'")
        index += 1

    return meta, match.group(2)


def slug_from_path(path: Path) -> str:
    return SLUG_MAP.get(path.stem, path.stem)


def markdown_paragraphs(text: str) -> list[str]:
    paragraphs: list[str] = []
    current: list[str] = []

    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            if current:
                paragraphs.append(" ".join(current))
                current = []
            continue
        current.append(stripped)

    if current:
        paragraphs.append(" ".join(current))

    return paragraphs


def inline_markdown_to_html(text: str) -> str:
    """Escape HTML, then restore a minimal **bold** subset."""
    escaped = html.escape(text)
    return BOLD_RE.sub(r"<strong>\1</strong>", escaped)


def paragraphs_to_html(text: str, *, indent: str = "\t\t\t\t") -> str:
    parts = markdown_paragraphs(text)
    if not parts:
        return ""
    return "\n".join(
        f"{indent}<p>{inline_markdown_to_html(part)}</p>" for part in parts
    )


def deck_to_html(text: str, *, indent: str = "\t\t\t\t") -> str:
    return f'{indent}<p class="project-deck">{inline_markdown_to_html(text)}</p>'


def list_to_html(items: list[str], *, tag: str = "ol", indent: str = "\t\t\t\t") -> str:
    """`ol` for numbered steps, `ul` for parallel points that aren't a sequence."""
    if not items:
        return ""
    marker = ORDERED_ITEM_RE if tag == "ol" else UNORDERED_ITEM_RE
    lines = [f'{indent}<{tag} class="project-list">']
    for item in items:
        cleaned = marker.sub("", item, count=1).strip()
        lines.append(f"{indent}\t<li>{html.escape(cleaned)}</li>")
    lines.append(f"{indent}</{tag}>")
    return "\n".join(lines)


def split_card(text: str) -> tuple[str, str]:
    """`Title | Body` → (title, body); no pipe → ("", body)."""
    if "|" in text:
        title, body = text.split("|", 1)
        return title.strip(), body.strip()
    return "", text.strip()


def card_block(title: str, body: str, tint: int, *, indent: str = "\t\t\t\t") -> str:
    parts = [f'{indent}<div class="project-card project-card--{tint}">']
    if title:
        parts.append(
            f'{indent}\t<h3 class="project-card__title">{inline_markdown_to_html(title)}</h3>'
        )
    if body:
        parts.append(f'{indent}\t<p>{inline_markdown_to_html(body)}</p>')
    parts.append(f"{indent}</div>")
    return "\n".join(parts)


def wrap_cards(cards: list[tuple[str, str]], *, indent: str = "\t\t\t\t") -> str:
    """Consecutive [card:] tags tile into a grid, tinted by position (mirrors
    wrap_gallery). Palette cycles every four so runs stay balanced."""
    count = min(len(cards), 4)
    inner = "\n".join(
        card_block(title, body, i % 4 + 1, indent=indent + "\t")
        for i, (title, body) in enumerate(cards)
    )
    return (
        f'{indent}<div class="project-cards project-cards--{count}">\n'
        f"{inner}\n"
        f"{indent}</div>"
    )


def panel_block(heading: str, body: str, *, indent: str = "\t\t\t\t") -> str:
    """Full-width tinted panel with a heading (generalises [callout:])."""
    parts = [f'{indent}<aside class="project-panel">']
    if heading:
        parts.append(
            f'{indent}\t<h3 class="project-panel__heading">{inline_markdown_to_html(heading)}</h3>'
        )
    if body:
        parts.append(f'{indent}\t<p>{inline_markdown_to_html(body)}</p>')
    parts.append(f"{indent}</aside>")
    return "\n".join(parts)


def quote_block(text: str, *, indent: str = "\t\t\t\t") -> str:
    """Offset italic pull-quote inside the body column (PokerGPT "How might we…")."""
    return (
        f'{indent}<blockquote class="project-quote">\n'
        f'{indent}\t<p>{inline_markdown_to_html(text)}</p>\n'
        f"{indent}</blockquote>"
    )


def wrap_faq(items: list[tuple[str, str]], *, indent: str = "\t\t\t\t") -> str:
    """Consecutive [faq:] tags tile into an untinted 2-up Q&A grid (mirrors
    wrap_cards). Question | Answer via split_card."""
    rows = []
    for question, answer in items:
        row = [f'{indent}\t<div class="project-faq__item">']
        if question:
            row.append(
                f'{indent}\t\t<h3 class="project-faq__q">{inline_markdown_to_html(question)}</h3>'
            )
        if answer:
            row.append(f'{indent}\t\t<p>{inline_markdown_to_html(answer)}</p>')
        row.append(f"{indent}\t</div>")
        rows.append("\n".join(row))
    return (
        f'{indent}<div class="project-faq">\n'
        + "\n".join(rows)
        + f"\n{indent}</div>"
    )


def figure_block(src: str, caption: str, *, indent: str = "\t\t\t\t") -> str:
    """Media with a caption beside it (2-col ≥768, stacks on mobile)."""
    size = image_size_attrs(src)
    return (
        f'{indent}<figure class="project-figure">\n'
        f'{indent}\t<div class="project-figure__media">\n'
        f'{indent}\t\t<img src="{html.escape(src)}" alt="{html.escape(caption)}"{size} loading="lazy">\n'
        f'{indent}\t</div>\n'
        f'{indent}\t<figcaption class="project-figure__note">{inline_markdown_to_html(caption)}</figcaption>\n'
        f"{indent}</figure>"
    )


def vimeo_embed_block(
    video_id: str,
    title: str,
    *,
    ratio: str = "16x9",
    background: bool = True,
    indent: str = "\t\t\t\t",
) -> str:
    params = VIMEO_BG_PARAMS if background else VIMEO_CTRL_PARAMS
    src = f"https://player.vimeo.com/video/{video_id}{params}"
    media_class = f"project-media project-media--embed project-media--flush project-media--ratio-{ratio}"
    # Arbitrary WxH ratios have no CSS class — pin the aspect inline so any
    # video crop works without a bespoke class per ratio.
    w, h = ratio.split("x")
    style = f' style="aspect-ratio: {w} / {h}"'
    return (
        f'{indent}<figure class="{media_class}"{style}>\n'
        f'{indent}\t<iframe class="project-video" src="{src}" '
        f'allow="{IFRAME_ALLOW}" '
        f'referrerpolicy="strict-origin-when-cross-origin" '
        f'title="{html.escape(title)}"></iframe>\n'
        f"{indent}</figure>"
    )


def parse_vimeo_tag(stripped: str, section_title: str) -> tuple[str, str, str, bool] | None:
    video_match = VIMEO_TAG_RE.match(stripped)
    if not video_match:
        return None

    video_id = video_match.group(1)
    rest = (video_match.group(2) or "").strip()
    background = True
    ratio = "16x9"
    title = section_title

    if rest:
        tokens = rest.split()
        while tokens:
            last = tokens[-1].lower()
            if last in ("16x9", "3x2", "4x5", "685x804") or re.fullmatch(r"\d+x\d+", last):
                ratio = last
                tokens.pop()
            elif last == "controls":
                background = False
                tokens.pop()
            elif last == "background":
                background = True
                tokens.pop()
            else:
                break
        if tokens:
            title = " ".join(tokens)

    return video_id, title, ratio, background


def youtube_embed_block(
    video_id: str,
    title: str,
    *,
    ratio: str = "16x9",
    background: bool = False,
    indent: str = "\t\t\t\t",
) -> str:
    if background:
        src = (
            f"https://www.youtube.com/embed/{video_id}"
            f"?autoplay=1&mute=1&loop=1&playlist={video_id}"
            "&controls=0&modestbranding=1&rel=0&playsinline=1"
        )
    else:
        src = f"https://www.youtube.com/embed/{video_id}?rel=0&modestbranding=1"
    media_class = f"project-media project-media--embed project-media--flush project-media--ratio-{ratio}"
    return (
        f'{indent}<figure class="{media_class}">\n'
        f'{indent}\t<iframe class="project-video" src="{src}" '
        f'allow="{IFRAME_ALLOW}" '
        f'referrerpolicy="strict-origin-when-cross-origin" '
        f'title="{html.escape(title)}"></iframe>\n'
        f"{indent}</figure>"
    )


def parse_youtube_tag(stripped: str, section_title: str) -> tuple[str, str, str, bool] | None:
    video_match = YOUTUBE_TAG_RE.match(stripped)
    if not video_match:
        return None

    video_id = video_match.group(1)
    rest = (video_match.group(2) or "").strip()
    background = False
    ratio = "16x9"
    title = section_title

    if rest:
        tokens = rest.split()
        while tokens:
            last = tokens[-1].lower()
            if last in ("16x9", "3x2"):
                ratio = last
                tokens.pop()
            elif last == "background":
                background = True
                tokens.pop()
            else:
                break
        if tokens:
            title = " ".join(tokens)

    return video_id, title, ratio, background


def image_size_attrs(src: str) -> str:
    """`width`/`height` so the browser reserves the box before a lazy image loads.

    Without them the figure is 0px tall until the image decodes: the page jumps, and
    the scroll-reveal in common.css gets a zero-length range so the image pops in
    instead of scaling. CSS keeps `width: 100%; height: auto`, so these attributes
    only supply the aspect ratio. Returns "" if the size can't be read — the build
    should not die over a missing image or a machine without Pillow.
    """
    try:
        from PIL import Image
    except ImportError:
        return ""

    try:
        with Image.open(ROOT / site_asset_path(src)) as im:
            return f' width="{im.width}" height="{im.height}"'
    except (OSError, ValueError):
        return ""


def image_embed_block(
    src: str,
    alt: str,
    *,
    flush: bool = False,
    contained: bool = False,
    indent: str = "\t\t\t\t",
) -> str:
    modifiers = []
    if flush:
        modifiers.append("project-media--flush")
    if contained:
        modifiers.append("project-media--contained")
    modifier_text = f' {" ".join(modifiers)}' if modifiers else ""
    return (
        f'{indent}<figure class="project-media{modifier_text}">\n'
        f'{indent}\t<img src="{html.escape(src)}" alt="{html.escape(alt)}"'
        f'{image_size_attrs(src)} loading="lazy">\n'
        f"{indent}</figure>"
    )


def parse_image_tag(stripped: str, section_title: str) -> tuple[str, str, bool, bool] | None:
    image_match = IMAGE_TAG_RE.match(stripped)
    if not image_match:
        return None

    src = image_match.group(1).strip()
    rest = (image_match.group(2) or "").strip()
    flush = False
    contained = False
    alt = section_title

    if rest:
        tokens = rest.split()
        while tokens:
            last = tokens[-1].lower()
            if last == "flush":
                flush = True
                tokens.pop()
            elif last in ("contained", "contain"):
                contained = True
                tokens.pop()
            else:
                break
        if tokens:
            alt = " ".join(tokens)

    return src, alt, flush, contained


def placeholder_embed_block(label: str, *, indent: str = "\t\t\t\t") -> str:
    """A 16:9 slot standing in for artwork that has not been produced yet."""
    return (
        f'{indent}<figure class="project-media project-media--placeholder">\n'
        f"{indent}\t<p>{html.escape(label)}</p>\n"
        f"{indent}</figure>"
    )


def wrap_gallery(media: list[str], *, indent: str = "\t\t\t\t") -> str:
    """A single figure renders as-is; two or more become a grid gallery."""
    if len(media) == 1:
        return media[0]
    inner = "\n".join(item.replace("\n", "\n\t") for item in media)
    count = min(len(media), 4)
    return (
        f'{indent}<div class="project-gallery project-gallery--{count}">\n'
        f"\t{inner}\n"
        f"{indent}</div>"
    )


def section_content_to_blocks(text: str, section_title: str) -> list[tuple[str, str]]:
    blocks: list[tuple[str, str]] = []
    paragraph_lines: list[str] = []
    list_lines: list[str] = []
    list_tag = "ol"
    card_run: list[tuple[str, str]] = []
    faq_run: list[tuple[str, str]] = []
    media_run: list[str] = []

    def flush_media() -> None:
        nonlocal media_run
        if not media_run:
            return
        blocks.append(("bleed", wrap_gallery(media_run)))
        media_run = []

    def flush_cards() -> None:
        nonlocal card_run
        if not card_run:
            return
        blocks.append(("bleed", wrap_cards(card_run)))
        card_run = []

    def flush_faq() -> None:
        nonlocal faq_run
        if not faq_run:
            return
        blocks.append(("bleed", wrap_faq(faq_run)))
        faq_run = []

    def flush_list() -> None:
        nonlocal list_lines
        if not list_lines:
            return
        flush_media()
        html_block = list_to_html(list_lines, tag=list_tag)
        if html_block:
            blocks.append(("prose", html_block))
        list_lines = []

    def flush_paragraphs() -> None:
        nonlocal paragraph_lines
        if not paragraph_lines:
            return
        flush_list()
        flush_cards()
        flush_faq()
        flush_media()
        html_block = paragraphs_to_html("\n".join(paragraph_lines))
        if html_block:
            blocks.append(("prose", html_block))
        paragraph_lines = []

    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            if paragraph_lines:
                paragraph_lines.append("")
            flush_list()
            flush_cards()
            flush_faq()
            flush_media()
            continue

        is_ordered = bool(ORDERED_ITEM_RE.match(stripped))
        if is_ordered or UNORDERED_ITEM_RE.match(stripped):
            flush_paragraphs()
            tag = "ol" if is_ordered else "ul"
            if tag != list_tag:
                flush_list()  # close the open list before switching marker type
                list_tag = tag
            list_lines.append(stripped)
            continue

        deck = DECK_TAG_RE.match(stripped)
        if deck:
            flush_paragraphs()
            flush_media()
            blocks.append(("prose", deck_to_html(deck.group(1).strip())))
            continue

        # Cards / FAQ buffer like media: consecutive tags accumulate
        # (flush_paragraphs early-returns between them) and tile into a grid.
        card = CARD_TAG_RE.match(stripped)
        if card:
            flush_paragraphs()
            card_run.append(split_card(card.group(1).strip()))
            continue

        faq = FAQ_TAG_RE.match(stripped)
        if faq:
            flush_paragraphs()
            faq_run.append(split_card(faq.group(1).strip()))
            continue

        flush_list()
        flush_cards()
        flush_faq()

        panel = PANEL_TAG_RE.match(stripped)
        if panel:
            flush_paragraphs()
            flush_media()
            heading, body = split_card(panel.group(1).strip())
            blocks.append(("bleed", panel_block(heading, body)))
            continue

        quote = QUOTE_TAG_RE.match(stripped)
        if quote:
            flush_paragraphs()
            flush_media()
            blocks.append(("prose", quote_block(quote.group(1).strip())))
            continue

        figure = FIGURE_TAG_RE.match(stripped)
        if figure:
            flush_paragraphs()
            flush_media()
            blocks.append(("bleed", figure_block(figure.group(1).strip(), figure.group(2).strip())))
            continue

        callout = CALLOUT_TAG_RE.match(stripped)
        if callout:
            flush_paragraphs()
            flush_media()
            text_html = html.escape(callout.group(1).strip())
            blocks.append(
                (
                    "bleed",
                    '\t\t\t\t<aside class="project-callout">\n'
                    f"\t\t\t\t\t<p>{text_html}</p>\n"
                    "\t\t\t\t</aside>",
                )
            )
            continue

        placeholder = PLACEHOLDER_TAG_RE.match(stripped)
        if placeholder:
            flush_paragraphs()
            media_run.append(placeholder_embed_block(placeholder.group(1).strip()))
            continue

        parsed = parse_vimeo_tag(stripped, section_title)
        if parsed:
            flush_paragraphs()
            video_id, video_title, ratio, background = parsed
            media_run.append(
                vimeo_embed_block(video_id, video_title, ratio=ratio, background=background)
            )
            continue

        yt_parsed = parse_youtube_tag(stripped, section_title)
        if yt_parsed:
            flush_paragraphs()
            video_id, video_title, ratio, background = yt_parsed
            media_run.append(
                youtube_embed_block(video_id, video_title, ratio=ratio, background=background)
            )
            continue

        image_parsed = parse_image_tag(stripped, section_title)
        if image_parsed:
            flush_paragraphs()
            src, alt, flush, contained = image_parsed
            media_block = image_embed_block(src, alt, flush=flush, contained=contained)
            if contained:
                blocks.append(("prose", media_block))
            else:
                media_run.append(media_block)
            continue

        flush_media()
        paragraph_lines.append(stripped)

    flush_paragraphs()
    flush_list()
    flush_cards()
    flush_faq()
    flush_media()
    return blocks


def section_content_to_html(text: str, section_title: str) -> str:
    blocks = section_content_to_blocks(text, section_title)
    return "\n".join(html for _, html in blocks)


def split_sections(body: str) -> list[tuple[str, str]]:
    sections: list[tuple[str, str]] = []
    current_title: str | None = None
    current_lines: list[str] = []

    for line in body.splitlines():
        heading = re.match(r"^##(?:\s+(.*\S))?\s*$", line.strip())
        if heading:
            if current_title is not None:
                sections.append((current_title, "\n".join(current_lines).strip()))
            current_title = (heading.group(1) or "").strip()  # bare `##` = untitled section
            current_lines = []
            continue
        current_lines.append(line)

    if current_title is not None:
        sections.append((current_title, "\n".join(current_lines).strip()))

    return sections


def vimeo_iframe(video_id: str, title: str, *, background: bool = True) -> str:
    return vimeo_embed_block(
        video_id, title, ratio="16x9", background=background, indent="\t\t\t"
    )


def image_figure(src: str, alt: str, *, flush: bool = True) -> str:
    return image_embed_block(src, alt, flush=flush, indent="\t\t\t")


def render_hero(meta: dict[str, str], eyebrow: str) -> str:
    hero_type = meta.get("heroType", "image").lower()
    hero = meta.get("hero", "")

    if not hero:
        return ""

    if hero_type == "vimeo":
        use_controls = meta.get("heroControls", "").lower() in ("true", "1", "yes")
        return vimeo_iframe(hero, f"{eyebrow} cover", background=not use_controls)

    if hero_type == "icon":
        # A single centered icon on a tinted card (PokerGPT-style), not a
        # full-bleed image. `heroTint` picks --tint-1..4 (default 1).
        tint = meta.get("heroTint", "1").strip() or "1"
        size = image_size_attrs(hero)
        return (
            f'\t\t\t<div class="project-hero__graphic project-hero__graphic--tint-{tint}">\n'
            f'\t\t\t\t<img class="project-hero__icon" src="{html.escape(hero)}" '
            f'alt="{html.escape(eyebrow)}"{size}>\n'
            f"\t\t\t</div>"
        )

    return image_figure(hero, f"{eyebrow} cover")


def format_meta_value(key: str, value: str) -> str:
    if key in ("tools", "role"):
        # Comma-separated in frontmatter, one per line in the meta column.
        parts = [part.strip() for part in value.split(",") if part.strip()]
        return "<br>".join(html.escape(part) for part in parts)

    if key == "team":
        # Frontmatter is "Name — Role — photo" per line; only the name is
        # rendered. Role and photo stay in the source for reference.
        members = [line.strip() for line in value.split("\n") if line.strip()]
        names = [
            re.split(r"\s+[—–-]\s+", member, maxsplit=1)[0].strip()
            for member in members
        ]
        return "<br>".join(html.escape(name) for name in names if name)

    return html.escape(value).replace("\n", "<br>")


def render_details(meta: dict[str, str], *, indent: str = "\t\t\t") -> str:
    rows: list[str] = []

    for key, label in DETAIL_FIELDS:
        value = meta.get(key, "").strip()
        if not value:
            continue
        formatted = format_meta_value(key, value)
        if not formatted:
            continue
        rows.append(
            f'{indent}\t<div class="project-meta__row">\n'
            f'{indent}\t\t<dt class="project-meta__label">{html.escape(label)}</dt>\n'
            f'{indent}\t\t<dd class="project-meta__value">{formatted}</dd>\n'
            f"{indent}\t</div>"
        )

    if not rows:
        return ""

    return (
        f'{indent}<dl class="project-meta">\n'
        + "\n".join(rows)
        + f"\n{indent}</dl>"
    )


def section_has_media(body: str) -> bool:
    for line in body.splitlines():
        stripped = line.strip()
        if (
            VIMEO_TAG_RE.match(stripped)
            or YOUTUBE_TAG_RE.match(stripped)
            or IMAGE_TAG_RE.match(stripped)
            or PLACEHOLDER_TAG_RE.match(stripped)
        ):
            return True
    return False


def section_id(title: str, seen: set[str]) -> str:
    """Anchor slug for the sticky section nav. Untitled sections get no id."""
    base = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    if not base:
        return ""
    slug = base
    suffix = 2
    while slug in seen:
        slug = f"{base}-{suffix}"
        suffix += 1
    seen.add(slug)
    return slug


def render_section(title: str, body: str, anchor: str = "") -> str:
    blocks = section_content_to_blocks(body, title)
    if not blocks:
        return ""

    open_tag = '<section class="project-section"'
    if anchor:
        open_tag += f' id="{anchor}"'
    parts: list[str] = [f"\t\t\t{open_tag}>"]
    if title:
        parts.append(f"\t\t\t\t<h2>{html.escape(title)}</h2>")
    prose_run: list[str] = []

    def flush_prose() -> None:
        nonlocal prose_run
        if not prose_run:
            return
        parts.append('\t\t\t\t<div class="project-section__body">')
        parts.extend(prose_run)
        parts.append("\t\t\t\t</div>")
        prose_run = []

    for kind, html_block in blocks:
        if kind == "bleed":
            flush_prose()
            parts.append('\t\t\t\t<div class="project-section__bleed">')
            parts.append(html_block)
            parts.append("\t\t\t\t</div>")
            continue

        prose_run.append(html_block)

    flush_prose()
    parts.append("\t\t\t</section>")
    return "\n".join(parts)


def project_cover_src(meta: dict[str, str], slug: str) -> str:
    """Static image for cards/thumbs/OG — never a video embed id."""
    cover = meta.get("cover", "").strip()
    if cover:
        return cover

    hero = meta.get("hero", "").strip()
    if meta.get("heroType", "").strip().lower() == "image" and hero:
        return hero

    return f"../assets/media/covers/{slug}-cover.png"


def related_thumb_html(meta: dict[str, str], slug: str) -> str:
    src = project_cover_src(meta, slug)
    if not src:
        return '<div class="project-related__thumb" aria-hidden="true"></div>'

    return (
        f'<div class="project-related__thumb">'
        f'<img src="{html.escape(src)}" alt="" loading="lazy">'
        f"</div>"
    )


def render_related(current_slug: str, all_projects: list[tuple[str, dict[str, str]]]) -> str:
    cards: list[str] = []

    for slug, meta in all_projects:
        if slug == current_slug:
            continue

        eyebrow = meta.get("eyebrow", slug).strip()
        title = meta.get("title", eyebrow).strip()
        href = slug
        thumb = related_thumb_html(meta, slug)

        cards.append(
            f'\t\t\t\t<li>\n'
            f'\t\t\t\t\t<a class="project-related__card" href="{html.escape(href)}">\n'
            f"\t\t\t\t\t\t{thumb}\n"
            f'\t\t\t\t\t\t<h3 class="project-related__name">{html.escape(eyebrow)}</h3>\n'
            f'\t\t\t\t\t\t<p class="project-related__desc">{html.escape(title)}</p>\n'
            f"\t\t\t\t\t</a>\n"
            f"\t\t\t\t</li>"
        )

        if len(cards) >= 3:
            break

    if not cards:
        return ""

    return (
        '\t\t\t<aside class="project-related">\n'
        '\t\t\t\t<h2 class="project-related__title">More Projects</h2>\n'
        '\t\t\t\t<ul class="project-related__grid">\n'
        + "\n".join(cards)
        + "\n\t\t\t\t</ul>\n"
        "\t\t\t</aside>"
    )


def parse_tags(raw: str) -> list[str]:
    if not raw:
        return []
    quoted = [a or b for a, b in re.findall(r'"([^"]+)"|\'([^\']+)\'', raw)]
    if quoted:
        return quoted
    return [t.strip() for t in raw.strip("[]").split(",") if t.strip()]


def render_masthead(meta: dict[str, str], name: str, tagline: str) -> str:
    """Full-width two-column hero: status, name, tagline, meta | media."""
    lines: list[str] = ['\t\t\t<header class="project-masthead">']
    lines.append('\t\t\t\t<div class="project-masthead__text">')
    status = meta.get("status", "").strip()
    if status:
        lines.append(
            f'\t\t\t\t\t<p class="project-status"><span class="project-status__dot"'
            f' aria-hidden="true"></span>{html.escape(status)}</p>'
        )
    lines.append(f'\t\t\t\t\t<h1 class="project-title">{html.escape(name)}</h1>')

    if tagline:
        lines.append('\t\t\t\t\t<div class="project-lead">')
        lines.append(
            f'\t\t\t\t\t\t<p class="project-tagline">{html.escape(tagline)}</p>'
        )
        lines.append("\t\t\t\t\t</div>")

    details = render_details(meta, indent="\t\t\t\t\t")
    if details:
        lines.append(details)

    presentation = meta.get("presentation", "").strip()
    if presentation:
        label = meta.get("presentationLabel", "").strip() or "See the Presentation"
        icon = meta.get("presentationIcon", "").strip()
        if icon:
            icon_html = (
                f'<img class="project-lead__link-icon" src="{html.escape(icon)}" '
                f'alt="" width="24" height="24" aria-hidden="true">'
            )
        else:
            icon_html = ""
        link_class = "project-lead__link"
        if icon:
            link_class += " project-lead__link--icon"
        lines.append(
            f'\t\t\t\t\t<a class="{link_class}" href="{html.escape(presentation)}"'
            f' target="_blank" rel="noopener">{html.escape(label)}{icon_html}</a>'
        )

    lines.append("\t\t\t\t</div>")  # /.project-masthead__text

    hero = render_hero(meta, name)
    if hero:
        lines.append('\t\t\t\t<div class="project-masthead__media">')
        lines.append(hero)
        lines.append("\t\t\t\t</div>")

    lines.append("\t\t\t</header>")
    return "\n".join(lines)


def render_nav(items: list[tuple[str, str]]) -> str:
    """Sticky 'On this page' rail with jump links to each section."""
    if not items:
        return ""

    links = "\n".join(
        f'\t\t\t\t\t\t<li><a class="project-nav__link" href="#{anchor}">'
        f"{html.escape(title)}</a></li>"
        for anchor, title in items
    )
    return (
        '\t\t\t<aside class="project-nav">\n'
        '\t\t\t\t<div class="project-nav__inner">\n'
        '\t\t\t\t\t<p class="project-nav__eyebrow">On this page</p>\n'
        '\t\t\t\t\t<nav class="project-nav__sections" aria-label="On this page">\n'
        '\t\t\t\t\t\t<ul class="project-nav__list" role="list">\n'
        f"{links}\n"
        "\t\t\t\t\t\t</ul>\n"
        "\t\t\t\t\t</nav>\n"
        "\t\t\t\t</div>\n"
        "\t\t\t</aside>"
    )


def render_page(
    meta: dict[str, str],
    body: str,
    *,
    slug: str,
    all_projects: list[tuple[str, dict[str, str]]],
) -> str:
    eyebrow = meta.get("eyebrow", "").strip()
    title = meta.get("title", eyebrow).strip()

    sections = split_sections(body)

    parts: list[str] = [render_masthead(meta, eyebrow, title)]

    nav_items: list[tuple[str, str]] = []
    section_blocks: list[str] = []
    seen: set[str] = set()
    for name, content in sections:
        anchor = section_id(name, seen)
        block = render_section(name, content, anchor)
        if not block:
            continue
        section_blocks.append(block)
        if anchor:
            nav_items.append((anchor, name))

    if section_blocks:
        body_html = "\n".join(section_blocks)
        nav = render_nav(nav_items)
        if nav:
            parts.append(
                '\t\t\t<div class="project-layout">\n'
                f"{nav}\n"
                '\t\t\t<div class="project-body">\n'
                f"{body_html}\n"
                "\t\t\t</div>\n"
                "\t\t\t</div>"
            )
        else:
            parts.append(body_html)

    related = render_related(slug, all_projects)
    if related:
        parts.append(related)

    return "\n".join(part for part in parts if part)


def load_all_projects() -> list[tuple[str, dict[str, str]]]:
    projects: list[tuple[str, dict[str, str], int]] = []

    for path in WORK_DIR.glob("*.md"):
        meta, _ = parse_frontmatter(path.read_text(encoding="utf-8"))
        slug = slug_from_path(path)
        order_raw = meta.get("order", "999").strip()
        try:
            order = int(order_raw)
        except ValueError:
            order = 999
        projects.append((slug, meta, order))

    projects.sort(key=lambda item: item[2])
    return [(slug, meta) for slug, meta, _ in projects]


def site_asset_path(relative: str) -> str:
    """Normalize a repo-relative media path to a site-root path for absolute URLs."""
    path = relative.strip().replace("\\", "/")
    while path.startswith("../"):
        path = path[3:]
    if path.startswith("./"):
        path = path[2:]
    return path.lstrip("/")


def og_image_url(meta: dict[str, str], slug: str) -> str:
    """Absolute share image from the project cover (never a Vimeo id)."""
    path = site_asset_path(project_cover_src(meta, slug))
    return f"{SITE_URL}/{quote(path)}"


def build_page(path: Path, template: str, all_projects: list[tuple[str, dict[str, str]]]) -> str:
    meta, body = parse_frontmatter(path.read_text(encoding="utf-8"))
    slug = slug_from_path(path)
    page_title = meta.get("eyebrow", slug).strip()
    description = meta.get("title", page_title).strip()
    content = render_page(meta, body, slug=slug, all_projects=all_projects)

    return (
        template.replace("{{page_title}}", html.escape(page_title))
        .replace("{{description}}", html.escape(description, quote=True))
        .replace("{{canonical}}", f"{SITE_URL}/projects/{slug}")
        .replace("{{og_image}}", og_image_url(meta, slug))
        .replace("{{body_class}}", f"work-{slug}")
        .replace("{{content}}", content)
    )


def main() -> None:
    if not WORK_DIR.is_dir():
        raise SystemExit(f"Missing directory: {WORK_DIR}")

    template = TEMPLATE.read_text(encoding="utf-8")
    md_files = sorted(WORK_DIR.glob("*.md"), key=lambda p: p.stem)

    if not md_files:
        raise SystemExit(f"No markdown files found in {WORK_DIR}")

    PROJECTS_DIR.mkdir(parents=True, exist_ok=True)
    all_projects = load_all_projects()

    for path in md_files:
        slug = slug_from_path(path)
        output = PROJECTS_DIR / f"{slug}.html"
        output.write_text(build_page(path, template, all_projects), encoding="utf-8")
        print(f"Wrote {output.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
