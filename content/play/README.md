# Play gallery content

**Edit archive titles, tags, order, links, and popup copy in one place:**

[`archive.md`](./archive.md)

Then refresh:

```bash
python3 scripts/build-play-manifest.py
```

That writes `manifest.json`, which the Play page loads at runtime.

## Images

Drop image / video files in this folder and reference them from `archive.md` with `image: Your-File.png`.

Supported: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`, `.mp4`, `.webm`, `.mov`

## Entry example

In `archive.md`:

```md
## Project name
image: Project-Name.png
date: 2026
tag: Branding
order: 1
link: https://example.com
linkLabel: See it live

Popup description goes here. Multiple paragraphs are fine.
```

Omit `link` / `linkLabel` when there is no external link.

For a video embed instead of a local image, use `src:` with a Vimeo / YouTube / direct media URL.

## Optional fields

- **`size`:** `sm`, `md`, `lg`, or `wide`
- **`alt`:** image alt text for the popup media
- **`poster`:** preview image filename for video embeds
