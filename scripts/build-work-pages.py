#!/usr/bin/env python3
"""Build projects/*.html from content/work/*.md.

Run: python3 scripts/build-work-pages.py
"""

from __future__ import annotations

import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORK_DIR = ROOT / "content" / "work"
PROJECTS_DIR = ROOT / "projects"
TEMPLATE = Path(__file__).resolve().parent / "templates" / "project.html"

SLUG_MAP = {
    "tasks": "tasks",
}

DETAIL_FIELDS = [
    ("team", "Team"),
    ("duration", "Timeline"),
    ("context", "Context"),
    ("tools", "Tools"),
    ("year", "Year"),
]
VIMEO_BG_PARAMS = (
    "?background=1&loop=1&autoplay=1&muted=1"
    "&title=0&byline=0&portrait=0&badge=0&app_id=58479"
)

VIMEO_CTRL_PARAMS = "?title=0&byline=0&portrait=0&badge=0&app_id=58479"

IFRAME_ALLOW = "autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"

VIMEO_TAG_RE = re.compile(r"^\[vimeo:(\d+)(?:\s+(.*))?\]$")
IMAGE_TAG_RE = re.compile(r"^\[image:([^\]\s]+)(?:\s+(.*))?\]$")
ORDERED_ITEM_RE = re.compile(r"^\d+\.\s+")


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


def paragraphs_to_html(text: str, *, indent: str = "\t\t\t\t") -> str:
    parts = markdown_paragraphs(text)
    if not parts:
        return ""
    return "\n".join(f"{indent}<p>{html.escape(part)}</p>" for part in parts)


def ordered_list_to_html(items: list[str], *, indent: str = "\t\t\t\t") -> str:
    if not items:
        return ""
    lines = [f"{indent}<ol class=\"project-list\">"]
    for item in items:
        cleaned = ORDERED_ITEM_RE.sub("", item, count=1).strip()
        lines.append(f"{indent}\t<li>{html.escape(cleaned)}</li>")
    lines.append(f"{indent}</ol>")
    return "\n".join(lines)


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
    return (
        f'{indent}<figure class="{media_class}">\n'
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
            if last in ("16x9", "3x2"):
                ratio = last
                tokens.pop()
            elif last == "controls":
                background = False
                tokens.pop()
            else:
                break
        if tokens:
            title = " ".join(tokens)

    return video_id, title, ratio, background


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
        f'{indent}\t<img src="{html.escape(src)}" alt="{html.escape(alt)}" loading="lazy">\n'
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
    ordered_lines: list[str] = []
    media_run: list[str] = []

    def flush_media() -> None:
        nonlocal media_run
        if not media_run:
            return
        blocks.append(("bleed", wrap_gallery(media_run)))
        media_run = []

    def flush_ordered_list() -> None:
        nonlocal ordered_lines
        if not ordered_lines:
            return
        flush_media()
        html_block = ordered_list_to_html(ordered_lines)
        if html_block:
            blocks.append(("prose", html_block))
        ordered_lines = []

    def flush_paragraphs() -> None:
        nonlocal paragraph_lines
        if not paragraph_lines:
            return
        flush_ordered_list()
        flush_media()
        html_block = paragraphs_to_html("\n".join(paragraph_lines))
        if html_block:
            blocks.append(("prose", html_block))
        paragraph_lines = []

    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            flush_paragraphs()
            flush_ordered_list()
            flush_media()
            continue

        if ORDERED_ITEM_RE.match(stripped):
            flush_paragraphs()
            ordered_lines.append(stripped)
            continue

        flush_ordered_list()

        parsed = parse_vimeo_tag(stripped, section_title)
        if parsed:
            flush_paragraphs()
            video_id, video_title, ratio, background = parsed
            media_run.append(
                vimeo_embed_block(video_id, video_title, ratio=ratio, background=background)
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
    flush_ordered_list()
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
        heading = re.match(r"^##\s+(.+)$", line.strip())
        if heading:
            if current_title is not None:
                sections.append((current_title, "\n".join(current_lines).strip()))
            current_title = heading.group(1).strip()
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

    return image_figure(hero, f"{eyebrow} cover")


def format_meta_value(key: str, value: str) -> str:
    if key == "tools":
        tools = [part.strip() for part in value.split(",") if part.strip()]
        if not tools:
            return ""
        pills = "".join(
            f'<span class="project-meta__pill">{html.escape(tool)}</span>' for tool in tools
        )
        return f'<span class="project-meta__pills">{pills}</span>'

    if key == "team":
        members = [line.strip() for line in value.split("\n") if line.strip()]
        if len(members) > 1 or any(re.search(r"\s[—–-]\s", m) for m in members):
            people: list[str] = []
            for member in members:
                parts = re.split(r"\s+[—–-]\s+", member, maxsplit=2)
                raw_name = parts[0].strip()
                raw_role = parts[1].strip() if len(parts) > 1 else ""
                raw_photo = parts[2].strip() if len(parts) > 2 else ""
                name = html.escape(raw_name)
                role = html.escape(raw_role)
                tooltip_text = f"{raw_name} — {raw_role}" if raw_role else raw_name
                role_html = (
                    f'<span class="project-meta__person-tooltip-role">{role}</span>'
                    if role
                    else ""
                )
                is_mark = "logo-star" in raw_photo or raw_photo.endswith("/Z.png")
                button_class = (
                    "project-meta__person-button project-meta__person-button--mark"
                    if is_mark
                    else "project-meta__person-button"
                )
                if raw_photo:
                    avatar_html = (
                        f'<img class="project-meta__person-avatar" '
                        f'src="{html.escape(raw_photo)}" alt="" '
                        f'loading="lazy" aria-hidden="true">'
                    )
                else:
                    avatar_html = (
                        '<span class="project-meta__person-avatar" aria-hidden="true"></span>'
                    )
                people.append(
                    '<span class="project-meta__person">'
                    f'<button class="{button_class}" type="button" '
                    f'aria-label="{html.escape(tooltip_text)}">'
                    f"{avatar_html}"
                    f"</button>"
                    f'<span class="project-meta__person-tooltip" role="tooltip">'
                    f'<span class="project-meta__person-tooltip-name">{name}</span>'
                    f"{role_html}"
                    f"</span></span>"
                )
            return '<span class="project-meta__people">' + "".join(people) + "</span>"

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
        if VIMEO_TAG_RE.match(stripped) or IMAGE_TAG_RE.match(stripped):
            return True
    return False


def render_section(title: str, body: str) -> str:
    blocks = section_content_to_blocks(body, title)
    if not blocks:
        return ""

    parts: list[str] = [
        '\t\t\t<section class="project-section">',
        '\t\t\t\t<div class="project-section__head">',
        f"\t\t\t\t\t<h2>{html.escape(title)}</h2>",
        "\t\t\t\t</div>",
    ]

    for kind, html_block in blocks:
        if kind == "bleed":
            parts.append('\t\t\t\t<div class="project-section__bleed">')
            parts.append(html_block)
            parts.append("\t\t\t\t</div>")
            continue

        parts.append('\t\t\t\t<div class="project-section__body">')
        parts.append(html_block)
        parts.append("\t\t\t\t</div>")

    parts.append("\t\t\t</section>")
    return "\n".join(parts)


def related_thumb_html(meta: dict[str, str], eyebrow: str) -> str:
    hero_type = meta.get("heroType", "image").lower()
    hero = meta.get("hero", "")

    if not hero:
        return f'<div class="project-related__thumb" aria-hidden="true"></div>'

    if hero_type == "vimeo":
        src = f"https://player.vimeo.com/video/{hero}{VIMEO_BG_PARAMS}"
        return (
            f'<div class="project-related__thumb">'
            f'<iframe src="{src}" allow="{IFRAME_ALLOW}" '
            f'title="{html.escape(eyebrow)} thumbnail" loading="lazy"></iframe>'
            f"</div>"
        )

    return (
        f'<div class="project-related__thumb">'
        f'<img src="{html.escape(hero)}" alt="" loading="lazy">'
        f"</div>"
    )


def render_related(current_slug: str, all_projects: list[tuple[str, dict[str, str]]]) -> str:
    cards: list[str] = []

    for slug, meta in all_projects:
        if slug == current_slug:
            continue

        eyebrow = meta.get("eyebrow", slug).strip()
        title = meta.get("title", eyebrow).strip()
        href = f"{slug}.html"
        thumb = related_thumb_html(meta, eyebrow)

        cards.append(
            f'\t\t\t\t<li>\n'
            f'\t\t\t\t\t<a class="project-related__card" href="{html.escape(href)}">\n'
            f"\t\t\t\t\t\t{thumb}\n"
            f'\t\t\t\t\t\t<p class="project-related__name">{html.escape(eyebrow)}</p>\n'
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


def render_masthead(meta: dict[str, str], name: str, tagline: str, about_body: str) -> str:
    lines: list[str] = ['\t\t\t<header class="project-masthead">']
    lines.append(f'\t\t\t\t<h1 class="project-title">{html.escape(name)}</h1>')

    lines.append('\t\t\t\t<div class="project-masthead__row">')
    lines.append('\t\t\t\t\t<div class="project-lead">')
    if tagline:
        lines.append(
            f'\t\t\t\t\t\t<p class="project-tagline">{html.escape(tagline)}</p>'
        )
    narrative_html = paragraphs_to_html(about_body, indent="\t\t\t\t\t\t")
    if narrative_html:
        lines.append(narrative_html)
    lines.append("\t\t\t\t\t</div>")

    details = render_details(meta, indent="\t\t\t\t\t")
    if details:
        lines.append(details)

    lines.append("\t\t\t\t</div>")
    lines.append("\t\t\t</header>")
    return "\n".join(lines)


def render_page(
    meta: dict[str, str],
    body: str,
    *,
    slug: str,
    all_projects: list[tuple[str, dict[str, str]]],
) -> str:
    eyebrow = meta.get("eyebrow", "").strip()
    title = meta.get("title", eyebrow).strip()
    caption = meta.get("caption", "").strip()

    sections = split_sections(body)
    about_body = ""
    follow_on: list[tuple[str, str]] = []

    for section_title, section_body in sections:
        if section_title.lower() == "about the project" and not about_body:
            about_body = section_body
        else:
            follow_on.append((section_title, section_body))

    parts: list[str] = [render_masthead(meta, eyebrow, title, about_body)]

    hero = render_hero(meta, eyebrow)
    if hero:
        hero_parts = ['\t\t\t<div class="project-hero">', hero]
        if caption:
            hero_parts.append(
                f'\t\t\t\t<p class="project-caption">{html.escape(caption)}</p>'
            )
        hero_parts.append("\t\t\t</div>")
        parts.append("\n".join(hero_parts))

    if follow_on:
        section_blocks = [render_section(name, content) for name, content in follow_on]
        section_blocks = [block for block in section_blocks if block]
        if section_blocks:
            parts.append(
                '\t\t\t<div class="project-sections">\n'
                + "\n".join(section_blocks)
                + "\n\t\t\t</div>"
            )

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


def build_page(path: Path, template: str, all_projects: list[tuple[str, dict[str, str]]]) -> str:
    meta, body = parse_frontmatter(path.read_text(encoding="utf-8"))
    slug = slug_from_path(path)
    page_title = meta.get("eyebrow", slug).strip()
    content = render_page(meta, body, slug=slug, all_projects=all_projects)

    return (
        template.replace("{{page_title}}", html.escape(page_title))
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
