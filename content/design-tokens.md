# Design Tokens

The core visual system for the portfolio site. Values live here first; `css/common.css` should mirror this file exactly. When you want to change a color, font, or spacing value, edit it here, then copy the change into `common.css`.

Tokens are kebab-case and used in CSS as `var(--token-name)`.

---

## Colors

Light editorial theme: white page, soft gray surfaces, near-black primary text, outlined white tag chips.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#FFFFFF` | Page background |
| `--sidebar-bg` | `#FFFFFF` | Sidebar column |
| `--surface` | `#F2F2F2` | Project card fill and media placeholder |
| `--ink` | `#0A0A0A` | Primary text |
| `--ink-muted` | `#666666` | Secondary text — descriptions, inactive nav |
| `--rule` | `#E5E5E5` | Vertical divider, hairlines |
| `--chip-bg` | `#FFFFFF` | Tag chip background |
| `--chip-ink` | `#0A0A0A` | Tag chip text |
| `--chip-rule` | `#D8D8D8` | Tag chip border |
| `--accent` | `#0A0A0A` | Links (resolve to ink in this design) |
| `--thumb-bg` | `#F2F2F2` | Gallery card frame behind media |

```css
:root {
	--bg: #FFFFFF;
	--sidebar-bg: #FFFFFF;
	--surface: #F2F2F2;
	--ink: #0A0A0A;
	--ink-muted: #666666;
	--rule: #E5E5E5;
	--chip-bg: #FFFFFF;
	--chip-ink: #0A0A0A;
	--chip-rule: #D8D8D8;
	--accent: #0A0A0A;
	--thumb-bg: #F2F2F2;
}
```

---

## Fonts

Loaded from **Google Fonts** via `<link>` tags in each page's `<head>` (no self-hosted `@font-face`; `css/fonts.css` is now a stub).

| Role | Font | Token |
|---|---|---|
| Display (wordmark, headings, project titles) | Khand (300–700, condensed) | `--font-display` |
| Body (paragraphs, descriptions, UI) | Geist (100–900) | `--font-body` |
| Mono (nav, tag chips, labels) | Geist Mono (100–900) | `--font-mono` |
| Editorial sans (homepage) | Manrope (200–800) | `--font-sans` |

```css
:root {
	--font-display: "Khand", system-ui, sans-serif;
	--font-body: "Geist", system-ui, sans-serif;
	--font-mono: "Geist Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
	--font-sans: "Manrope", system-ui, sans-serif;
}
```

Font `<link>` tags (place in every page `<head>`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:ital,wght@0,100..900;1,100..900&family=Geist:ital,wght@0,100..900;1,100..900&family=Khand:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

**Homepage override.** `index.html` (`.page-home`) uses a more editorial pairing: it scopes
`--font-display` and `--font-body` to `--font-sans` (Manrope) and sets `--font-mono` to
`"SF Mono", "Fira Code", ui-monospace, Menlo, Consolas, monospace` — mono is reserved for the
nav pills, tag chips, section labels, and the "view project" link. Manrope + Fira Code are
loaded via a home-only Google Fonts `<link>`; other pages keep Khand / Geist / Geist Mono.

```html
<!-- index.html only -->
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400..600&family=Manrope:wght@200..800&display=swap" rel="stylesheet">
```

---

## Type Scale

Base font size `16px`. Comprehensive named scale on a ~1.25 ratio; larger steps use `clamp()` so type scales smoothly across viewport widths.

| Token | Value | ≈ px | Role | Leading | Tracking |
|---|---|---|---|---|---|
| `--text-2xs` | `0.6875rem` | 11 | Micro labels, chips (mono) | 1 | wide |
| `--text-xs` | `0.75rem` | 12 | Nav, meta labels (mono) | 1 | wide |
| `--text-sm` | `0.875rem` | 14 | Captions, fine print | body | normal |
| `--text-base` | `1rem` | 16 | UI body | body | normal |
| `--text-md` | `1.125rem` | 18 | Lead, card captions | snug | snug |
| `--text-lg` | `clamp(1.25rem, 1.18rem + 0.35vw, 1.5rem)` | 20–24 | Large body (h4) | snug | snug |
| `--text-xl` | `clamp(1.5rem, 1.33rem + 0.85vw, 2rem)` | 24–32 | Sub-headings (h3) | heading | tight |
| `--text-2xl` | `clamp(2rem, 1.65rem + 1.75vw, 3rem)` | 32–48 | Section titles (h2) | heading | tighter |
| `--text-3xl` | `clamp(2.5rem, 1.95rem + 2.75vw, 4rem)` | 40–64 | Wordmark, page titles (h1) | heading | tighter |
| `--text-4xl` | `clamp(3.25rem, 2.3rem + 4.75vw, 5.5rem)` | 52–88 | Hero statement | tight | tighter |
| `--text-display` | `clamp(3.5rem, 1rem + 12vw, 11rem)` | 56–176 | Oversized editorial titles (project mastheads) | tight | tighter |

The scale climbs on a ~1.2–1.25 ratio and keeps a **≥5:1 display-to-body contrast** so a page's title reads as the clear focal point. As type grows, **tracking tightens** (large display needs negative tracking to stop looking loose) and **leading shrinks** (big lines don't need 1.5); small text does the opposite — normal tracking, generous leading for legibility.

```css
:root {
	--text-2xs: 0.6875rem;
	--text-xs: 0.75rem;
	--text-sm: 0.875rem;
	--text-base: 1rem;
	--text-md: 1.125rem;
	--text-lg: clamp(1.25rem, 1.18rem + 0.35vw, 1.5rem);
	--text-xl: clamp(1.5rem, 1.33rem + 0.85vw, 2rem);
	--text-2xl: clamp(2rem, 1.65rem + 1.75vw, 3rem);
	--text-3xl: clamp(2.5rem, 1.95rem + 2.75vw, 4rem);
	--text-4xl: clamp(3.25rem, 2.3rem + 4.75vw, 5.5rem);
	--text-display: clamp(3.5rem, 1rem + 12vw, 11rem);
}
```

### Role map

| Purpose | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Wordmark | display | `--text-3xl` | 700 | tight leading + tracking, stacked (Khand max weight) |
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

Applied globally: `h1, h2` ride `--tracking-tighter`; `h3, h4` use `--tracking-tight`; `h5, h6` ease off to `--tracking-snug`. Project mastheads use `--text-display` + `--tracking-tighter` for the giant editorial title.

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
	--content-width: 1200px;
	--text-width: 720px;
	--page-padding: clamp(1rem, 3vw, 3rem);
}
```

The home layout is a two-column grid: `minmax(220px, 260px)` wordmark sidebar and a `1fr` main column separated by a `--rule` vertical divider. Collapses to a single column at ≤768px.

---

## Radius

```css
:root {
	--radius-sm: 0.375rem;  /* squared year chip */
	--radius-md: 1rem;
	--radius-lg: 1.5rem;    /* project cards */
	--radius-full: 999px;   /* pill chips */
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

Use tokens instead of hardcoded values everywhere — e.g. `padding: var(--space-lg);` rather than `padding: 32px;`.

---

## Other

- Border radius preference: rounded — `1.5rem` cards, pill chips, `0.375rem` squared year label.
- Notes (tone, references, things to avoid): light editorial layout; monospace for structural labels; Khand display face carries the personality; tag chips stay white with subtle borders for contrast on project media.
