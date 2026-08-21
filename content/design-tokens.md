# Design Tokens

The core visual system for the portfolio site. Values live here first; `css/common.css` should mirror this file exactly. When you want to change a color, font, or spacing value, edit it here, then copy the change into `common.css`.

Tokens are kebab-case and used in CSS as `var(--token-name)`.

---

## Colors

Light editorial theme: white page, soft gray surfaces, near-black primary text, outlined white tag chips.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#FFFFFF` | Page background |
| `--surface` | `#F2F2F2` | Project card fill and media placeholder |
| `--ink` | `#0A0A0A` | Primary text |
| `--ink-muted` | `var(--ink)` | Secondary text — **collapsed to ink**: the site has no grey text (design direction). Kept as a token so consumers need not change. |
| `--rule` | `#E5E5E5` | Vertical divider, hairlines |
| `--chip-bg` | `#FFFFFF` | Tag chip background |
| `--chip-ink` | `#0A0A0A` | Tag chip text |
| `--chip-rule` | `#D8D8D8` | Tag chip border |
| `--accent` | `#0A0A0A` | Links (resolve to ink in this design) |
| `--thumb-bg` | `#F2F2F2` | Gallery card frame behind media |

```css
:root {
	--bg: #FFFFFF;
	--surface: #F2F2F2;
	--ink: #0A0A0A;
	--ink-muted: var(--ink); /* no grey text — secondary text = ink */
	--rule: #E5E5E5;
	--chip-bg: #FFFFFF;
	--chip-ink: #0A0A0A;
	--chip-rule: #D8D8D8;
	--accent: #0A0A0A;
	--thumb-bg: #F2F2F2;
}
```

### Case-study card tints

Soft pastels for `[card:]` grids and `[panel:]` blocks in case studies, assigned
by position (`--tint-1..4`, cycling every four). Derived from the brand purple
(`#c79bff`), not an external palette. This is the one place content
carries background colour — an **intentional exception** to "avoid accent colors
on content" (see `design.md`). All four are light enough that near-black `--ink`
clears WCAG AA (4.5:1) on them; keep any future tint just as light.

| Token | Value | Use |
|---|---|---|
| `--tint-1` | `#EFE6FB` | Lilac — card position 1, panel default |
| `--tint-2` | `#FBE7EE` | Blush — card position 2 |
| `--tint-3` | `#E7F3EA` | Mint — card position 3 |
| `--tint-4` | `#FBF3DE` | Butter — card position 4 |

```css
:root {
	--tint-1: #EFE6FB;
	--tint-2: #FBE7EE;
	--tint-3: #E7F3EA;
	--tint-4: #FBF3DE;
}
```

### Project-page identity (scoped override)

Case-study pages (`.page-project`, `css/project.css`, layered last) carry a distinct
look — an **intentional exception** documented in `design.md`. They re-point the core
tokens rather than inventing new names, so shared components inherit the new palette:

| Token | House value | `.page-project` value | Use |
|---|---|---|---|
| `--bg` | `#FFFFFF` | `#fafcfd` | off-white page |
| `--ink` | `#0A0A0A` | `#32404f` | slate primary text (10.3:1 on the off-white) |
| `--ink-muted` | `var(--ink)` | `var(--ink)` | secondary text = ink (no grey) |
| `--accent` | `#0A0A0A` | `#7c3aed` | brand-purple accent, sparingly (link/nav hover, in-view marker); 5.5:1 as text |
| `--font-mono` | Fira Code stack | Geist Mono stack | structural labels |

---

## Fonts

The house sans is **General Sans**, **self-hosted** via `@font-face` in `common.css`
(one variable `.woff2` covers weights 200–700, plus an italic file). Mono is loaded
from **Google Fonts** per page.

| Role | Font | Token |
|---|---|---|
| Display (wordmark, headings, project titles) | General Sans (200–700) | `--font-display` |
| Body (paragraphs, descriptions, UI) | General Sans (200–700) | `--font-body` |
| Mono (nav, tag chips, labels) | Fira Code — **Geist Mono** on project pages | `--font-mono` |
| Editorial sans (alias) | General Sans (200–700) | `--font-sans` |

```css
:root {
	--font-display: "General Sans", system-ui, sans-serif;
	--font-body: "General Sans", system-ui, sans-serif;
	--font-mono: "SF Mono", "Fira Code", ui-monospace, Menlo, Consolas, monospace;
	--font-sans: "General Sans", system-ui, sans-serif;
}
```

General Sans is self-hosted (no `<link>` needed — the `@font-face` lives in `common.css`,
pointing at `assets/fonts/GeneralSans-Variable.woff2` + the italic file). Each page still
loads its **mono** face from Google Fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<!-- home / about / play -->
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400..600&display=swap" rel="stylesheet">
<!-- project pages use Geist Mono instead -->
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
```

Project pages carry their own identity (see the note below the color table): General Sans
throughout, **Geist Mono** for structural labels, on an off-white page with slate ink.

---

## Type Scale

Base font size `20px` on desktop (fluid from `18px` on mobile). Comprehensive named scale on a ~1.25 ratio; larger steps use `clamp()` so type scales smoothly across viewport widths.

| Token | Value | ≈ px | Role | Leading | Tracking |
|---|---|---|---|---|---|
| `--text-2xs` | `0.875rem` | 14 | Micro labels, chips (mono) | 1 | wide |
| `--text-xs` | `0.9375rem` | 15 | Nav, meta labels (mono) | 1 | wide |
| `--text-sm` | `1.0625rem` | 17 | Captions, fine print | body | normal |
| `--text-base` | `clamp(1.125rem, 1.05rem + 0.35vw, 1.25rem)` | 18–20 | UI body | body | normal |
| `--text-md` | `1.375rem` | 22 | Lead, card captions | snug | snug |
| `--text-lg` | `clamp(1.5625rem, 1.475rem + 0.4375vw, 1.875rem)` | 25–30 | Large body (h4) | snug | snug |
| `--text-xl` | `clamp(1.875rem, 1.6625rem + 1.0625vw, 2.5rem)` | 30–40 | Sub-headings (h3) | heading | tight |
| `--text-2xl` | `clamp(2.5rem, 2.0625rem + 2.1875vw, 3.75rem)` | 40–60 | Section titles (h2) | heading | tighter |
| `--text-3xl` | `clamp(3.125rem, 2.4375rem + 3.4375vw, 5rem)` | 50–80 | Wordmark, page titles (h1) | heading | tighter |
| `--text-4xl` | `clamp(4.0625rem, 2.875rem + 5.9375vw, 6.875rem)` | 65–110 | Hero statement | tight | tighter |
| `--text-display` | `clamp(4.375rem, 1.25rem + 15vw, 13.75rem)` | 70–220 | Oversized editorial titles (project mastheads) | tight | tighter |

The scale climbs on a ~1.2–1.25 ratio and keeps a **≥5:1 display-to-body contrast** so a page's title reads as the clear focal point. As type grows, **tracking tightens** (large display needs negative tracking to stop looking loose) and **leading shrinks** (big lines don't need 1.5); small text does the opposite: normal tracking, generous leading for legibility.

```css
:root {
	--text-2xs: 0.875rem;
	--text-xs: 0.9375rem;
	--text-sm: 1.0625rem;
	--text-base: clamp(1.125rem, 1.05rem + 0.35vw, 1.25rem);
	--text-md: 1.375rem;
	--text-lg: clamp(1.5625rem, 1.475rem + 0.4375vw, 1.875rem);
	--text-xl: clamp(1.875rem, 1.6625rem + 1.0625vw, 2.5rem);
	--text-2xl: clamp(2.5rem, 2.0625rem + 2.1875vw, 3.75rem);
	--text-3xl: clamp(3.125rem, 2.4375rem + 3.4375vw, 5rem);
	--text-4xl: clamp(4.0625rem, 2.875rem + 5.9375vw, 6.875rem);
	--text-display: clamp(4.375rem, 1.25rem + 15vw, 13.75rem);
}
```

### Role map

| Purpose | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Wordmark | display | `--text-3xl` | 700 | tight leading + tracking, stacked |
| h1 | display | `--text-3xl` | 700 | |
| h2 | display | `--text-2xl` | 700 | |
| h3 | display | `--text-xl` | 700 | |
| h4 | display | `--text-lg` | 700 | |
| Body / description | body | `--text-base` | 400 | |
| Card caption | body | `--text-md` | title 700 / desc 400 | title inline-bold |
| Nav / labels | mono | `--text-xs` | 500 | uppercase, wide tracking |
| Tag chip | mono | `--text-2xs` | 500 | uppercase, wide tracking |

### Line height & letter spacing

```css
:root {
	/* Line height — tighter as type grows */
	--leading-none: 1;          /* mono chips / labels */
	--leading-tight: 0.92;      /* display / stacked wordmark */
	--leading-heading: 1.05;    /* headings */
	--leading-snug: 1.25;       /* subheads, lead paragraphs */
	--leading-body: 1.55;       /* body copy */

	/* Letter spacing — tighter as type grows, wide for mono labels */
	--tracking-tighter: -0.04em;  /* display / giant titles */
	--tracking-tight: -0.03em;    /* headings */
	--tracking-snug: -0.015em;    /* large body, lead, UI */
	--tracking-normal: 0;
	--tracking-wide: 0.08em;      /* mono labels & chips */
}
```

Applied globally: `h1, h2` ride `--tracking-tighter`; `h3, h4` use `--tracking-tight`; `h5, h6` ease off to `--tracking-snug`. Project mastheads use a page-local display clamp (larger than `--text-display`) with `--tracking-tighter`. `--text-display` remains available for future oversized titles.

---

## Spacing

Base spacing unit: `8px`. Larger steps use `clamp()` so sections breathe more on bigger screens.

```css
:root {
	--space-2xs: 0.25rem; /* 4px */
	--space-xs: 0.5rem;   /* 8px */
	--space-sm: clamp(0.75rem, 0.65rem + 0.5vw, 1rem);
	--space-md: clamp(1rem, 0.85rem + 0.75vw, 1.5rem);
	--space-lg: clamp(1.5rem, 1rem + 2vw, 3rem);
	--space-xl: clamp(2rem, 1.25rem + 4vw, 5rem);
	--space-2xl: clamp(4rem, 2rem + 8vw, 8rem);
	--space-3xl: clamp(6rem, 3rem + 12vw, 12rem);
}
```

---

## Layout

```css
:root {
	--frame-width: 87.5rem;         /* 1400px — shared content frame */
	--shell-pad-x: clamp(1rem, 2vw, 2rem); /* shared .shell horizontal inset */
	--card-aspect-ratio: 858 / 555; /* defined; home rail uses fixed card sizes */
	--text-width: 720px;
	--bp-sm: 640px;
	--bp-md: 768px;
	--bp-lg: 1024px;
}
```

`--shell-pad-x` is the one horizontal pad for every page (home / about / play / projects). The home work rail bleeds past it on purpose so cards can scroll edge-to-edge; chrome and footer stay inset.

The `--bp-*` values document the breakpoints; `@media` cannot read custom properties, so the queries repeat the literals. They are not mirrored into `common.css`.

Home is a horizontal portrait-card rail under a two-line editorial intro, not a centered vertical feed. The old `53.625rem` column description is obsolete.

Unused-but-kept type tokens (available for future roles): `--text-2xs`, `--text-4xl`, `--text-display`. Prefer them over new literals when a role needs that step.

---

## Radius

```css
:root {
	--radius-sm: 0.375rem;      /* squared year chip */
	--radius-md: 1rem;
	--radius-lg: 1.5rem;        /* larger surface rounding */
	--radius-xl: 1.75rem;       /* media cards — home / play / project */
	--radius-portrait: 3.125rem; /* about portrait soft crop */
	--radius-full: 999px;       /* pill chips */
}
```

---

## Motion

```css
:root {
	--duration-fast: 150ms;
	--duration-base: 250ms;
	--duration-slow: 500ms;
	--ease-base: cubic-bezier(0.22, 1, 0.36, 1);
}
```

---

## Usage examples

```css
body {
	font-family: var(--font-body);
	font-size: var(--text-base);
	line-height: var(--leading-body);
	color: var(--ink);
	background: var(--bg);
}

h1, h2, h3, h4, h5, h6 {
	font-family: var(--font-display);
	line-height: var(--leading-heading);
	letter-spacing: var(--tracking-tight);
}

h1 { font-size: var(--text-3xl); }
h2 { font-size: var(--text-2xl); }
h3 { font-size: var(--text-xl); }
h4 { font-size: var(--text-lg); }

.tag {
	font-family: var(--font-mono);
	font-size: var(--text-2xs);
	letter-spacing: var(--tracking-wide);
	text-transform: uppercase;
}
```

Use tokens instead of hardcoded values everywhere, e.g. `padding: var(--space-lg);` rather than `padding: 32px;`.

---

## Other

- Border radius preference: `--radius-xl` for media cards, pills via `--radius-full`, soft about portrait via `--radius-portrait`.
- Cover assets live under `assets/media/covers/` as kebab names (`iris-cover.png`, `micdrop-cover.png`, `nura-cover.png`, `nura-cover-landscape.jpg`, `tasks-cover.png`). Portrait covers for the home rail; use a true 16:9 landscape asset for Nura’s masthead / related thumbs / `og:image` (`nura-cover-landscape.jpg`).
- Notes (tone, references, things to avoid): light editorial layout; monospace for structural labels; General Sans carries the personality; tag chips stay white with subtle borders for contrast on project media.
