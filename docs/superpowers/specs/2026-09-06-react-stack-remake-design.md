# React + TypeScript + Vite Stack Remake — Design

**Date:** 2026-09-06
**Status:** Approved for planning
**Scope:** Re-platform the existing static portfolio onto React/TS/Vite. **Design language is unchanged** — this is a re-platform, not a redesign. `design.md` and `content/design-tokens.md` remain the source of truth for visual decisions.

---

## 1. Goal & motivation

Move the portfolio from hand-authored static HTML/CSS/vanilla-JS (+ Python build pipeline) to a component-driven React stack. Drivers, in priority order:

1. **Richer motion** — Framer Motion for spring/gesture/layout animation that is painful to hand-write in vanilla JS.
2. **Portable, reusable, typed components** — easier to extend and maintain.
3. **Showcase** — the portfolio itself demonstrates a modern React/TS stack.

Explicitly **not** a driver: authoring pain. The markdown case-study workflow is fine, so we preserve markdown-style authoring (via MDX) rather than replacing it.

Non-goals: redesigning any page, changing copy/content, adding new sections, SSR/SSG, dark mode.

---

## 2. Stack

| Concern | Choice | Why |
|---|---|---|
| Build | **Vite** | Required; fast dev, first-class MDX/TS. |
| UI | **React 18 + TypeScript** | Required. |
| Routing | **React Router v6** (`BrowserRouter`) | Standard for a Vite SPA; clean nested layout via `<Outlet>`. Vercel handles SPA rewrites so no 404 hack needed. |
| Motion | **Framer Motion** | The showcase layer. |
| Content | **`@mdx-js/rollup`** + `remark-frontmatter` / `remark-mdx-frontmatter` | Case studies stay markdown-ish; custom tags become React components. |
| Styling | **Plain CSS files** (ported near-verbatim) | Existing CSS is already tokenized and framework-agnostic; no CSS-in-JS churn. Imported per-component/route. |
| Host | **Vercel** | Preview deploys, clean SPA routing, custom-domain move. |

No CSS framework, no component library, no state manager (local state + context only). Rung-check: none of these earn their weight for a 4-page site.

---

## 3. Directory structure

```
portfolio/                     # Vite root (new files added alongside; legacy static files removed at cutover)
  index.html                   # Vite entry (single HTML; head meta + font links live here / per-route via a head helper)
  vite.config.ts               # react() + mdx() plugins
  tsconfig.json
  vercel.json                  # SPA rewrite: all → /index.html
  public/                      # copied as-is to build root
    assets/  favicons/ fonts/ icons/ media/   # moved from ./assets
    CNAME  robots.txt  sitemap.xml  favicon.ico  .nojekyll(drop)
  src/
    main.tsx                   # createRoot + <RouterProvider>/<BrowserRouter>
    App.tsx                    # shell layout: <Cursor/> <SiteMenu/> <main><Outlet/></main> <SiteFooter/>
    routes/
      Home.tsx
      About.tsx
      Play.tsx
      CaseStudy.tsx            # dynamic: loads content/work/<slug>.mdx, renders masthead + TOC + body
    components/
      chrome/  SiteMenu.tsx  SiteFooter.tsx  Cursor.tsx
      mdx/     Deck.tsx Card.tsx CardGrid.tsx Panel.tsx Figure.tsx Quote.tsx
               Faq.tsx Callout.tsx Image.tsx Vimeo.tsx Placeholder.tsx  index.ts(map)
      home/    HeroLine.tsx WorkRail.tsx ProjectCard.tsx
      play/    PlayGrid.tsx PlayModal.tsx
      about/   HoverImage.tsx
      Tag.tsx  Seo.tsx
    hooks/
      useMagnetic.ts           # magnetic cursor pull (data-cursor-magnetic parity)
      useHorizontalWheel.ts    # wheel → sideways scroll on home rail
      useInView.ts             # TOC active segment
      useNycClock.ts           # footer live NYC time
    content/
      work/    iris.mdx micdrop.mdx nura.mdx tasks.mdx
      work/meta.ts             # typed registry: slug → { order, cover, cardDesc, cardRole, tags } for Home rail + More Projects
      play/    manifest.ts (typed, from manifest.json)  + images (or keep in public/)
    styles/
      reset.css common.css site-chrome.css site-menu.css cursor.css
      home.css about.css play.css project.css     # ported 1:1, class names preserved
  docs/superpowers/specs/...
  scripts/                     # retire Python build scripts at cutover (keep capture-screenshots.mjs for QA)
```

Legacy `*.html`, `css/`, `js/`, and Python `scripts/build-*.py` are deleted at cutover, not before — the working tree keeps a reference until the React build is verified equivalent.

---

## 4. Component & data design

### 4.1 Shell (`App.tsx`)
Single layout route wrapping all pages. Renders shared chrome once (`<Cursor>`, `<SiteMenu current=…>`, `<SiteFooter>`) with `<Outlet>` in between, matching the current `.shell` / `--frame-width` frame. `SiteMenu` gets the active page id from the current route.

- **SiteMenu** — port of `js/site-menu.js` (166 lines): star mark → home, "+" toggle revealing Menu dropdown (Work / Archive / About), active-link state. Rebuilt as JSX + Framer Motion for the dropdown open/close.
- **SiteFooter** — port of `js/site-footer.js`: 3 columns (copyright · live NYC clock via `useNycClock` · social icons as `currentColor` masked squares).
- **Cursor** — port of `js/cursor.js` (134 lines): custom cursor + magnetic pull. Elements opt in via `useMagnetic` ref (replaces the `data-cursor-magnetic` attribute scan). Honors `prefers-reduced-motion`.

### 4.2 Routes
| Route | Component | Notes |
|---|---|---|
| `/` | `Home` | Hero intro + `WorkRail` (portrait `ProjectCard`s + archive end-card). `useHorizontalWheel` maps wheel → sideways scroll. Card data from `content/work/meta.ts`. |
| `/about` | `About` | Static JSX port of `about.html`: bio (capped measure), portrait + Experience/Awards rail, colophon, `HoverImage` on `<strong>` terms. |
| `/play` | `Play` | `PlayGrid` from `play/manifest.ts` + `PlayModal` (Framer Motion). Port of `play-gallery.js` (643 lines) behavior. |
| `/projects/:slug` | `CaseStudy` | See 4.3. |

Routes are lazy-loaded (`React.lazy`) so each case study's MDX isn't in the initial bundle.

### 4.3 Case study pipeline (the core of the remake)

**Authoring:** each `content/work/<slug>.mdx` keeps YAML-ish frontmatter (eyebrow, title, role, team, duration, status, tools, year, order, cover, hero, heroType, caption) exported as a typed `frontmatter` object via `remark-mdx-frontmatter`. Body is markdown with custom tags rewritten to JSX components.

**Tag → component map** (provided to MDX via `MDXProvider` / the mdx components prop). All tags currently in the 4 case studies plus the documented-but-unused ones:

| Authoring tag | Component | In use | Behavior |
|---|---|---|---|
| `[deck] text` | `Deck` | ✓ (29) | Section-lead statement. |
| `[image: path alt]` | `Image` | ✓ (23) | Bleed media; **consecutive `Image`s auto-group into a gallery** (parity with current build). |
| `[card: Title \| Body]` | `Card` in `CardGrid` | ✓ (21) | **Consecutive cards tile into a tinted grid** (1→2→3/4-up), tinted by position `--tint-1..4`. Card with no `\|` is body-only. |
| `[placeholder: …]` | `Placeholder` | ✓ (8) | Empty media slot (dev/preview). |
| `[vimeo: id caption]` | `Vimeo` | ✓ (7) | Embedded Vimeo player. |
| `[quote: text]` | `Quote` | ✓ (1) | Offset italic pull-quote, left rule. |
| `[figure: path \| caption]` | `Figure` | ✓ (1) | Media + caption beside (2-col ≥768). |
| `[panel: Heading \| Body]` | `Panel` | — | Full-width tinted statement. |
| `[faq: Q \| A]` | `Faq` | — | Consecutive → untinted 2-up Q&A. |
| `[callout: text]` | `Callout` | — | Headingless tinted block. |

**Auto-grouping** (Image galleries, Card grids, Faq pairs): a small remark plugin (or an MDX-level wrapper that inspects sequential children) collapses runs of the same component into their grid container. This replicates the Python build's "consecutive `[card:]`" behavior. Decision: implement as a **remark plugin operating on the MDX AST** so grouping logic lives in one testable place rather than in each component.

**`CaseStudy.tsx`** does:
1. Resolve `:slug` → dynamic `import('../content/work/<slug>.mdx')`; 404 fallback for unknown slugs.
2. Read `frontmatter` → render masthead (status pill, `h1`=eyebrow, desc=title, 2×2 meta Timeline/Role/Team/Tools, optional CTA, hero media right ≥1024). `heroType` ∈ `image | vimeo` selects hero renderer.
3. Build **"On this page" TOC** by scanning the rendered `##` headings (a `components.h2` that registers ids + labels into context). Sticky rail desktop; hairline track with a single active segment via `useInView` + `aria-current`.
4. Render MDX body, then **More Projects** cards (from `work/meta.ts`, excluding current slug).

### 4.4 Play page
`manifest.json` → typed `manifest.ts` (`PlayItem[]`: id, type, src, modalSrc, alt, title, date, tag, order, description, optional link/linkLabel). `PlayGrid` renders the near-square responsive grid; clicking opens `PlayModal` (Framer Motion enter/exit, focus trap, Esc/backdrop close). Preserves the current gallery's ordering and modal behavior.

---

## 5. Motion plan (Framer Motion)

| Surface | Motion |
|---|---|
| Route changes | `AnimatePresence` page fade/slide (subtle; matches editorial calm). |
| Custom cursor | Spring-follow dot; magnetic pull on opted-in elements via `useMagnetic`. |
| Home cards | Hover micro-interactions (existing editorial hover parity). |
| Play modal | Layout/scale enter-exit. |
| TOC segment | Animated active segment. |
| Menu dropdown | Open/close spring. |

**Global rule:** all motion gated behind `prefers-reduced-motion` (Framer's `useReducedMotion`), per `design.md` §Rules of thumb #4. No motion is load-bearing for content.

---

## 6. Styling migration

- CSS files copied to `src/styles/` **unchanged in class names and token values**. `common.css` tokens and `@font-face` (self-hosted General Sans) port verbatim.
- Import order preserved by importing in `main.tsx`/route modules in the documented order (reset → common → site-chrome → site-menu → page).
- Per-page CSS still scoped by a `page-<name>` class set on `<main>` (or body via effect), so existing selectors keep working with zero rewrites.
- Google Fonts mono links (Fira Code / Geist Mono) move into `index.html` head (or a `Seo`/head helper per route).

Rung-check: keeping plain CSS avoids rewriting 3.5k tokenized lines into a new system for no functional gain.

---

## 7. SEO / head

`Seo.tsx` (tiny helper, or `react-helmet-async` if multi-field head per route proves fiddly — default to a hand-rolled `useEffect` setter first, add the lib only if needed) sets per-route `<title>`, description, canonical, and OG tags — porting the existing per-page meta (see `index.html` head). `sitemap.xml`, `robots.txt`, `CNAME` served from `public/`.

Note: SPA means crawlers get client-rendered content. Acceptable for this portfolio (light SEO need). SSG is a documented future add, out of scope here.

---

## 8. Deployment

`vercel.json` with a catch-all rewrite to `/index.html` for SPA routing. Build: `vite build` → `dist/`. Custom domain (`zarahyaqub.com`) moves to Vercel when the user is ready; `CNAME` file becomes irrelevant on Vercel but is harmless in `public/`. GitHub Pages artifacts (`.nojekyll`) dropped.

---

## 9. Verification

Done = all true:
- `npm run dev` starts clean (no console/build errors).
- Routes `/`, `/about`, `/play`, `/projects/{iris,micdrop,nura,tasks}` all render.
- Case-study parity: masthead fields, TOC 1:1 with `##` sections + active-segment tracking, `[card]` grids tint by position, consecutive `[image]`s gallery, `[deck]/[quote]/[figure]/[vimeo]/[placeholder]` render correctly.
- Interactions work: magnetic cursor, home horizontal-wheel rail, play modal (open/close/Esc/focus), menu dropdown, footer NYC clock.
- `prefers-reduced-motion` disables motion.
- Visual diff against current pages using existing `home-390.png` / `about-390.png` / `screenshots/` + `scripts/capture-screenshots.mjs` at matching breakpoints — no unintended visual drift.
- `vite build` succeeds; `dist/` preview serves all routes.

**Runnable check (ponytail):** one test on the highest-risk non-trivial logic — the remark auto-grouping plugin (consecutive Card/Image/Faq → grid container). Given input MDX AST with N sequential cards, assert one grid wrapper with N children. No framework beyond `vitest` (or a plain `node --test` assert if avoiding a dep).

---

## 10. Risks & decisions

- **Auto-grouping fidelity** is the main risk (grids/galleries depend on it). Mitigated by isolating it in one remark plugin with a test.
- **Asset paths:** markdown uses `../assets/...`. On move to `public/assets/...`, paths normalize to root-relative `/assets/...`. Frontmatter/tag paths get rewritten during MDX conversion. (Cross-refs memory: masked-icon `--icon` url() must be root-relative `/assets/...`.)
- **Team frontmatter** is a multi-line `name — role — img` block; parse into a typed `TeamMember[]` during conversion.
- **Big-bang cutover** chosen over incremental: for 4 pages the two-system overhead of incremental isn't worth it. Work happens in this worktree; `main` stays intact until merge.

---

## 11. Out of scope (future adds)

SSR/SSG prerendering, dark mode, new content, CMS, test suite beyond the one grouping check, redesign of any page.
