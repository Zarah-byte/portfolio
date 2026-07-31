# Design

The shared language every page of this site speaks. Read this before adding or
changing a page so new work looks like it belongs.

**This file is the *language*; [`content/design-tokens.md`](content/design-tokens.md)
is the *vocabulary* (every color, type step, and spacing value).** Don't restate
token values here; link to them. Tokens live in the doc first, then mirror into
`css/common.css`.

---

## Voice & feel

Light editorial. White page, soft-gray surfaces, near-black type, a monospace
used only for structural labels. Manrope carries the personality; nothing is
loud except the type scale.

**Project pages are the exception** — they carry a distinct identity (modeled on
rachelchen.tech/projects/pokergpt): off-white page `#fafcfd`, slate ink
`#32404f`, a Tiempos-like **serif** (Newsreader) for headings, **Geist** for
body and labels, and an orange accent `#e65f2e` used sparingly (in-view section
marker, link hovers). This is deliberate and scoped to `.page-project` in
`css/project.css` (the "PokerGPT project-page identity" block, loaded last).
Home / about / play keep the Manrope-on-white house style below.

- **Warm and first-person.** Copy talks like a person, "Hi there!", "say hey,
  or just talk design!", not like a brand.
- **Bold marks the point.** Key phrases go `<strong>` inline (roles, places,
  "intention & interfaces"). Weight, not color, is the emphasis tool.
- **One idea per section**, generously spaced. Big screens breathe more (spacing
  steps are `clamp()`).
- **Light only.** No dark mode. `color-scheme: light` is set globally. Page
  backgrounds stay light; the menu panel is an intentional dark exception (below).

Default avoid: extra accent colors on content, filled buttons in case studies,
drop shadows on layout chrome, decorative borders. Contrast comes from the type
scale and whitespace.

### Allowed exceptions (do not “correct”)

These break the defaults on purpose:

- **Purple star mark** (`#c79bff`) and **dark menu panel**: brand chrome only;
  not a content accent system.
- **Menu / cursor soft shadows**: depth for floating chrome, not cards.
- **About résumé filled pill**: the one solid CTA on the site.
- **Case-study card tints** (`--tint-1..4`): soft pastels behind `[card:]` grids
  and `[panel:]` blocks in case studies — the one place content carries a
  background colour. Assigned by position, derived from the brand purple. See
  `content/design-tokens.md`.
- **Per-page first viewports**: home prose, about title + bio + meta rail, play
  giant title (weight 700), project masthead (weight 400). Do not collapse to
  one hero.
- **Page-specific interactions**: home rail, about hover images, play modal,
  Tasks findings UI.

---

## Page anatomy

Every page is the same skeleton inside a shared 1400px frame (`--frame-width`):

```html
<body class="page-<name>">
  <div class="shell">
    <div data-site-menu="<current>"></div>   <!-- header, built by JS -->
    <main class="<name>-content">...</main>
    <div data-site-footer></div>             <!-- footer, built by JS -->
  </div>
</body>
```

- `.shell` is the only width authority: header, content, and footer all align to
  it via `--frame-width` and `--shell-pad-x`. Never set page margins outside it.
  Home’s work rail may bleed past `--shell-pad-x` for horizontal scroll; keep
  the override scoped to `.page-home .work`.
- `body` gets a `page-<name>` class (`page-home`, `page-about`, `page-project`…).
  Scope page-specific CSS to that class; never edit the shared components to fix
  one page.

### Every `<head>` carries the same load order

```html
<link href="css/reset.css" rel="stylesheet">      <!-- all: unset base -->
<link href="css/common.css" rel="stylesheet">     <!-- tokens + element defaults -->
<link href="css/site-chrome.css" rel="stylesheet"><!-- .shell + footer -->
<link href="css/site-menu.css" rel="stylesheet">  <!-- header -->
<link href="css/<page>.css" rel="stylesheet">     <!-- page-specific, last -->
```

Fonts: preconnect + one Google Fonts link for **Manrope 200–800 + Fira Code
400–600** on every page (About uses mono for dates, awards, and stack labels).

Scripts (all `defer`): `site-base.js`, `site-footer.js`, `site-menu.js`,
`cursor.js`, plus any page-specific script.

---

## Shared chrome (don't rebuild per page)

**Header**: built by `js/site-menu.js` from a `[data-site-menu="<id>"]`
placeholder. Left: purple star mark → home. Right: circular “+” toggle
(hover reveals “Menu”) opening a dropdown of **Work / Archive / About**.
Pass the current page's id so its link reads active.

**Footer**: built by `js/site-footer.js` into `[data-site-footer]`. Three
columns: copyright · live NYC clock · social icons (email / GitHub / LinkedIn).
Icons are masked squares tinted with `currentColor`, muted→ink on hover.

**Custom cursor**: `js/cursor.js`. Interactive elements can opt into the
magnetic pull with `data-cursor-magnetic`.

Because header and footer are generated, a new page gets them for free by
including the two placeholders and the scripts: copy an existing page's `<head>`
rather than hand-authoring chrome.

---

## Reusable components

- **Tag chip** (`.tag`): mono, uppercase, `--text-2xs`, wide tracking, white
  pill with a hairline border. `.tag-year` is the squared year variant. Sits on
  project media and case-study meta.
- **Home project card** (`.page-home .card`): portrait rail unit: full-bleed
  `.card-media`, overlay `.card-meta` (bold `.card-title` + ghost `.tag` pills).
  Themes: `.card--light` / `.card--dark`. Archive end-card: `.card--archive`.
- **Hero intro** (`.hero-line`): home opens with a two-line statement
  (lead + muted sub) with inline `<strong>` emphasis. About keeps its own
  first-person lead.
- **Case-study card grid** (`.project-cards` / `.project-card`): authored as
  consecutive `[card: Title | Body]` tags in `content/work/*.md`; they tile into
  a tinted grid (1→2→3/4-up), tinted by position (`--tint-1..4`). A card with no
  `|` is body-only. Mirrors how consecutive `[image:]` tags auto-gallery.
- **Case-study panel** (`.project-panel`): one `[panel: Heading | Body]` tag →
  a full-width tinted statement block. The heading-ful sibling of `[callout:]`.
- **Case-study pull-quote** (`.project-quote`): one `[quote: text]` tag → an
  offset italic statement in the body column (left rule, no accent colour).
- **Case-study figure** (`.project-figure`): `[figure: PATH | Caption]` →
  media wide with the caption beside it (2-col ≥768, stacks on mobile).
- **Case-study FAQ** (`.project-faq`): consecutive `[faq: Question | Answer]`
  tags → untinted 2-up Q&A cards (top hairline, no tint — the plain-card
  counterpart to the tinted `[card:]` grid).
- **Hero graphic** (`heroType: icon`): a single centered icon on a tinted card
  (`heroTint` picks `--tint-1..4`), instead of the default full-bleed hero image.

New components: build from tokens, put shared bits in `common.css`/`site-chrome.css`,
page-only bits behind the `page-<name>` class.

---

## Pages

| Page | `body` class | CSS | Notes |
|---|---|---|---|
| `index.html` | `page-home` | `home.css` + `home-gallery.js` | Hero intro + horizontal project rail (portrait cards, archive end-card); wheel maps to sideways scroll |
| `about.html` | `page-about` | `about.css` | Visible “About” title + bio (capped measure) left, portrait + Experience/Awards CV rail right, colophon closing the left column; `<strong>` hover-images |
| `play.html` | `page-play` | `play.css` + `play-gallery.js` | Visible “Project Archive” title + near-square responsive CSS grid + detail modal |
| `projects/*.html` | `page-project work-<slug>` | `project.css` | Case studies: **generated**, see below |

Case studies are authored in `content/work/*.md` and compiled to
`projects/*.html` by `scripts/build-work-pages.py`. **Edit the markdown, never
the generated HTML.** (Details: the case-study pipeline note.)

---

## Rules of thumb

1. Reach for a token before a literal: `var(--space-lg)`, never `32px`.
2. Change a value in `design-tokens.md` first, then mirror into `common.css`.
3. Keep the shared shell shared. Page differences live behind `page-<name>`.
4. Accessibility is not optional: real focus rings (`:focus-visible` restored in
   `common.css`), `visually-hidden` `<h1>` on visual pages, `alt`/`aria-hidden`
   used deliberately, `prefers-reduced-motion` respected.
