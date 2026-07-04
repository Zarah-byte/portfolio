# Zarah Yaqub Portfolio

Static, mobile-first portfolio for a Brand & Product Designer. No build step —
plain HTML + CSS with a tiny bit of JS.

## Editing content & style

Three markdown files are the source of truth. Edit these first, then mirror into
the HTML/CSS:

- **[content.md](content.md)** — all page copy (home, work, play, about, cases).
- **[branding.md](branding.md)** — identity, logo rules, voice & tone, palette.
- **[styling.md](styling.md)** — design tokens, type scale, spacing, components.

## Pages

- `index.html` — home: bio sidebar + selected works feed
- `Work/index.html` — full work index; `Work/<Project>/` — case studies
  (Iris, Nura, Genie, Micdrop, Tasks)
- `Play/index.html` — experiments & side projects
- `About/index.html` — bio, background, services, experience, contact

## Styles

- `common.css` — design tokens (`:root`) + shared shell (logo, sidebar, nav, home)
- `Work/case.css` — case-study layout · `Work/index.css` — work index
- `About/style.css` · `Play/style.css` — page-specific styles
- `Assets/fonts/tanker/` — self-hosted Tanker display font
- `main.js` — small progressive-enhancement helper

## Run locally

```bash
python3 -m http.server 5501
```

Then visit `http://localhost:5501`.
