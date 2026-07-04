# Styling — Zarah Yaqub

The technical design system. Plain **HTML + CSS + JS**, with all copy in
**Markdown / JSON**. No build step, no dependencies. Companion to
[branding.md](branding.md) (the *why*) and [content.md](content.md) (the *what*).

Design tokens live as CSS custom properties in the `:root` block at the top of
[`styles.css`](styles.css). Change a value there and every page updates.

---

## How the site works

One `index.html` loads [`styles.css`](styles.css) and [`app.js`](app.js). `app.js`
is a tiny hash-router single-page app: it reads `content/site.json` +
`content/manifest.json`, fetches the Markdown files, parses their frontmatter and
body, and renders the sidebar + each page. Nothing is hand-copied between pages —
the shell is generated once.

```
index.html            Shell document (head, fonts, #shell root)
styles.css            All styles: tokens (:root) + shell + components + pages
app.js                Router, Markdown/frontmatter parser, view renderers, SVGs
content/
  site.json           Identity, nav, socials, marquee words (edit once)
  manifest.json       Lists which work/play slugs exist (see "Adding" below)
  work/*.md            One case study per file (frontmatter + Markdown body)
  play/*.md            One experiment per file (frontmatter only)
assets/
  fonts/tanker/        Self-hosted display face
  projects/            Project imagery (add here)
```

Routes are hash-based so it works on GitHub Pages with no server config:
`#/` home · `#/work` index · `#/work/<slug>` case · `#/play` · `#/about`.

### Running locally
Because browsers block `fetch()` over `file://`, serve the folder over HTTP:
```
python3 -m http.server 4321      # then open http://localhost:4321/
```
(There is a matching `static` config in `.claude/launch.json`.)

---

## Colors

| Token | Value | Use |
|-------|-------|-----|
| `--ink`          | `#0a0a0b` | Headlines, logo, key text |
| `--paper`        | `#f6f4ef` | Warm off-white background |
| `--paper-pure`   | `#ffffff` | Cards on paper |
| `--muted`        | `#6b6b66` | Body copy, captions |
| `--muted-2`      | `#9a9a93` | Metadata, kickers |
| `--placeholder`  | `#e4e1d8` | Media wells before imagery |
| `--line`         | `rgba(10,10,11,.14)` | Hairline rules / borders |
| `--accent`       | `#cfa4d2` | Lilac — sparks, tag/year, hover fills |
| `--accent-deep`  | `#a06fa6` | Darker lilac for small accent **text** |
| `--accent-ink`   | `#0a0a0b` | Text/icons placed **on** the lilac |

The lilac is light, so it is used as fills/sparks/decoration; accent *text* uses
`--accent-deep`, and anything on top of a lilac fill uses `--accent-ink`.

---

## Typography

| Token | Stack | Role |
|-------|-------|------|
| `--font-display` | `"Tanker", …` | UPPERCASE display, nav, project names, numbers |
| `--font-body`    | `"Geist", …`  | Reading copy |
| `--font-mono`    | `"Space Mono", …` | Labels, tags, metadata, marquee |

Fluid scale tokens (`clamp()`): `--fs-hero`, `--fs-display`, `--fs-title`,
`--fs-number`, `--fs-lead`, `--fs-body`, `--fs-small`, `--fs-micro`. Helper
classes: `.display`, `.mono`, `.lead`, `.spark`.

---

## Layout — the shell

Two-column editorial shell (`.shell`): a persistent identity **sidebar** on the
left and a scrolling **content** column on the right.

```
Mobile (< 900px)              Desktop (≥ 900px)
┌─────────────┐              ┌──────────┬──────────────┐
│ sidebar     │              │ sidebar  │ content      │
│ (stacked)   │              │ (sticky, │ (scrolls)    │
│ ── rule ──  │              │ 100dvh)  │              │
│ content     │              │  1px rule│              │
└─────────────┘              └──────────┴──────────────┘
```

- Content padding is `--pad-x`; use `.bleed` for full-width bands (marquee, case
  hero media), `.measure` to constrain a reading block.
- Breakpoints: single column < `900px`, two columns ≥ `900px`. Play grid 1→2→3 up
  at `640`/`1000px`; case fact sheet 2→4 up at `720px`.

---

## Motion

- Durations `--dur-fast`/`--dur`/`--dur-slow` with `--ease`; hover effects guarded
  by `@media (hover: hover)`.
- Marquee ticker + scroll-reveal (`[data-reveal]`, driven by an
  IntersectionObserver in `app.js`, re-armed on every route change).
- Everything collapses under `@media (prefers-reduced-motion: reduce)`.

---

## Adding a new case study

1. Create `content/work/<slug>.md`. Copy the frontmatter from an existing file
   (`title, eyebrow, caption, year, order, tags, discipline, role, timeline, team,
   lead`, optional `quote/quoteBy/hero, draft`) and write the body in Markdown
   (`## Problem`, `## Approach`, `## Outcome`; `**bold**` / `*italic*` supported).
2. Add `"<slug>"` to the `work` array in `content/manifest.json` (static hosting
   can't list a directory, so this registers the file).
3. Done — the card appears on the home feed, a row appears in the work index, and
   `#/work/<slug>` renders, all sorted by each file's `order`, with the "Next
   project" link wired automatically.

Play works the same way: `content/play/<slug>.md` (`title, tag, year, order, note`)
plus the slug in `manifest.json` under `play`.

Add imagery to `assets/projects/` and reference it from the `hero` field when
you're ready to replace the placeholder wells.

Edit identity, nav, socials, or the marquee once in `content/site.json`.

---

## Deployment

GitHub Pages, no build. Pushing to `main` runs
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which uploads the
repo and publishes it. One-time repo setting: **Settings → Pages → Source =
"GitHub Actions"**. `.nojekyll` disables Jekyll processing. All asset and fetch
paths are relative, so the site works at `…github.io/portfolio/` with no config;
for a custom domain, add a `CNAME` file.
