# Play gallery content

Drop media here and run `python3 scripts/build-play-manifest.py` to refresh the gallery.

## Images & video files

Add files directly to this folder:

- **Images:** `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`
- **Video files:** `.mp4`, `.webm`, `.mov`

Each file becomes one gallery tile. Optional size prefix in the filename is not used — set size in a markdown file if needed, or let the gallery cycle sizes automatically.

## Image metadata (optional)

Add a markdown file with the **same name** as the image to populate the detail popup:

`Genie.png` → `Genie.md`

```md
---
title: Genie interface exploration
date: 2026
tag: UI Study
link: https://example.com
linkLabel: See it live
---
Description shown in the popup. Supports multiple paragraphs.
```

## Video links (markdown)

Create a `.md` file per embed. Use frontmatter for options and put the URL in the body or `src` field.

```md
---
title: Motion study
date: 2026
tag: Side Project
link: https://example.com
size: wide
---
https://vimeo.com/123456789

Optional description shown in the popup below the title.
```

```md
---
src: https://www.youtube.com/watch?v=VIDEO_ID
size: md
poster: my-poster-frame.png
---
```

**`size`** (optional): `sm`, `md`, `lg`, or `wide`

**`poster`** (optional): image filename in this folder, used as a preview frame for embeds

**Supported URLs:** Vimeo, YouTube, direct `.mp4` / `.webm` links

## Build

```bash
python3 scripts/build-play-manifest.py
```

This writes `manifest.json`, which the Play page loads at runtime.
