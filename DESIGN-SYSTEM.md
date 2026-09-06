# Design System

> Design and development guidelines for Zarah Yaqub's portfolio.

This document defines the visual language, layout system, reusable components, interaction patterns, responsive behavior, and implementation conventions for the portfolio.

## Principles

The portfolio should feel:

* Editorial
* Minimal
* Playful, not childish
* Intentional
* Highly legible
* Accessible
* Responsive
* Consistent across projects

### Core Rules

1. Reuse existing tokens and components before creating new ones.
2. Prefer semantic HTML over generic containers.
3. Use design tokens instead of hardcoded visual values.
4. Build mobile-first.
5. Keep project-specific art direction separate from the global UI system.
6. Prioritize content and project storytelling over decorative UI.
7. Avoid one-off styles unless the design genuinely requires an exception.
8. Respect accessibility preferences, including reduced motion.

---

## Stack

### Core

| Technology   | Purpose                        |
| ------------ | ------------------------------ |
| React        | UI architecture                |
| TypeScript   | Type safety                    |
| Vite         | Build tooling                  |
| React Router | Routing                        |
| MDX          | Project and case-study content |
| CSS          | Styling and design tokens      |

### Development Conventions

* Use functional React components.
* Use TypeScript for all components and utilities.
* Prefer CSS Grid and Flexbox for layout.
* Use CSS custom properties for design tokens.
* Use `clamp()` for fluid values where appropriate.
* Keep content separate from presentation.
* Avoid inline styles for reusable visual decisions.
* Avoid introducing dependencies for behavior that can be handled cleanly with native CSS or browser APIs.

### Project Structure

```text
src/
├── assets/
├── components/
│   ├── layout/
│   ├── navigation/
│   ├── project/
│   └── ui/
├── content/
│   └── projects/
├── pages/
├── styles/
│   ├── tokens.css
│   ├── reset.css
│   ├── typography.css
│   ├── global.css
│   └── utilities.css
├── App.tsx
└── main.tsx
```

### Source of Truth

Use the following hierarchy:

1. `design-system.md` — design rules and intended behavior
2. `tokens.css` — exact visual token values
3. Shared components — reusable implementation
4. Page styles — page-specific composition
5. Project styles — intentional project-specific exceptions

Do not duplicate token definitions across files.

---

## Typography

Typography should feel editorial and confident while allowing project imagery to remain the primary focus.

### Font Families

```css
--font-sans:
  Inter,
  "Helvetica Neue",
  Helvetica,
  Arial,
  sans-serif;

--font-mono:
  "SFMono-Regular",
  "SF Mono",
  "Roboto Mono",
  monospace;
```

### Usage

| Style      | Usage                                               |
| ---------- | --------------------------------------------------- |
| Sans serif | Headings, body, navigation, buttons, project titles |
| Monospace  | Metadata, labels, tags, dates, technical details    |

Use monospace sparingly.

### Type Scale

Use fluid typography.

```css
--text-xs: clamp(0.7rem, 0.68rem + 0.1vw, 0.75rem);
--text-sm: clamp(0.8rem, 0.77rem + 0.15vw, 0.875rem);
--text-base: clamp(1rem, 0.96rem + 0.2vw, 1.125rem);
--text-lg: clamp(1.125rem, 1.05rem + 0.4vw, 1.375rem);
--text-xl: clamp(1.35rem, 1.2rem + 0.75vw, 1.75rem);
--text-2xl: clamp(1.75rem, 1.45rem + 1.5vw, 2.5rem);
--text-3xl: clamp(2.25rem, 1.75rem + 2.5vw, 3.75rem);
--text-4xl: clamp(3rem, 2rem + 5vw, 6rem);
--text-display: clamp(3.5rem, 2rem + 7vw, 8rem);
```

### Type Roles

| Role       | Token            | Weight | Line Height |   Tracking |
| ---------- | ---------------- | -----: | ----------: | ---------: |
| Display    | `--text-display` |    500 |         0.9 | `-0.055em` |
| H1         | `--text-4xl`     |    500 |        0.95 | `-0.045em` |
| H2         | `--text-3xl`     |    500 |           1 | `-0.035em` |
| H3         | `--text-2xl`     |    500 |         1.1 | `-0.025em` |
| H4         | `--text-xl`      |    500 |         1.2 | `-0.015em` |
| Body Large | `--text-lg`      |    400 |         1.5 |     Normal |
| Body       | `--text-base`    |    400 |        1.55 |     Normal |
| Small      | `--text-sm`      |    400 |        1.45 |     Normal |
| Metadata   | `--text-xs`      |    400 |         1.3 |   `0.02em` |

### Text Measure

```css
--measure-narrow: 52ch;
--measure-body: 68ch;
--measure-wide: 82ch;
```

Default long-form copy:

```css
.project-copy {
  max-width: var(--measure-body);
}
```

### Typography Rules

**Do**

* Use one `h1` for the primary page title.
* Maintain semantic heading order.
* Limit paragraph width.
* Use fluid type tokens.
* Allow large display type to create hierarchy.

**Don't**

* Choose font sizes per component arbitrarily.
* Use headings purely for visual styling.
* Stretch body text across the viewport.
* Introduce several competing typefaces.

---

## Colors

The global interface should remain predominantly neutral so project-specific identities can introduce color.

### Base Palette

```css
--color-black: #111111;
--color-white: #ffffff;

--color-gray-50: #f7f7f5;
--color-gray-100: #eeeeeb;
--color-gray-200: #deded9;
--color-gray-300: #c5c5bf;
--color-gray-500: #85857f;
--color-gray-700: #4a4a46;
--color-gray-900: #1b1b19;
```

### Semantic Tokens

Components should reference semantic tokens instead of palette values.

```css
--color-bg: var(--color-white);
--color-surface: var(--color-gray-50);

--color-text: var(--color-black);
--color-text-secondary: var(--color-gray-700);
--color-text-muted: var(--color-gray-500);

--color-border: var(--color-gray-200);
--color-border-strong: var(--color-gray-300);

--color-link: currentColor;
```

### Project Colors

Individual case studies may override project-level tokens.

```css
.project--iris {
  --project-accent: #b8ff45;
  --project-background: #111111;
}
```

Project colors must remain scoped to the project.

### Color Rules

**Do**

* Use semantic color tokens.
* Check text and interactive states for sufficient contrast.
* Let case-study artwork provide most of the color.
* Scope project-specific colors.

**Don't**

* Hardcode repeated colors inside components.
* Add global accent colors for one project.
* Communicate important information through color alone.

---

## Spacing

Use a consistent spacing system based on a `4px` unit.

### Spacing Scale

| Token        |     Value | Approx. |
| ------------ | --------: | ------: |
| `--space-0`  |       `0` |     0px |
| `--space-1`  | `0.25rem` |     4px |
| `--space-2`  |  `0.5rem` |     8px |
| `--space-3`  | `0.75rem` |    12px |
| `--space-4`  |    `1rem` |    16px |
| `--space-5`  |  `1.5rem` |    24px |
| `--space-6`  |    `2rem` |    32px |
| `--space-7`  |    `3rem` |    48px |
| `--space-8`  |    `4rem` |    64px |
| `--space-9`  |    `6rem` |    96px |
| `--space-10` |    `8rem` |   128px |
| `--space-11` |   `12rem` |   192px |

### Fluid Layout Spacing

```css
--page-gutter: clamp(1rem, 3vw, 3rem);
--section-gap: clamp(5rem, 10vw, 10rem);
--content-gap: clamp(2rem, 5vw, 5rem);
```

### Content Width

```css
--container-max: 1600px;
--container-content: 1200px;
--container-text: 760px;
```

### Container

```css
.container {
  width: min(
    calc(100% - (var(--page-gutter) * 2)),
    var(--container-max)
  );
  margin-inline: auto;
}
```

### Spacing Rules

Use spacing tokens for:

* `gap`
* `padding`
* `margin`
* Component internal spacing
* Grid spacing

Prefer:

```css
gap: var(--space-6);
```

Avoid:

```css
gap: 37px;
```

---

## Layout

### Grid

Use a responsive 4 / 8 / 12-column system.

```css
.layout-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);
}

@media (min-width: 48rem) {
  .layout-grid {
    grid-template-columns: repeat(8, minmax(0, 1fr));
    gap: var(--space-5);
  }
}

@media (min-width: 64rem) {
  .layout-grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: var(--space-6);
  }
}
```

Think in grid spans rather than hardcoded widths.

### Layout Rules

* Use containers for page-level width.
* Use grids for major page composition.
* Use Flexbox for one-dimensional component alignment.
* Use `gap` instead of child margins where possible.
* Avoid fixed heights for content containers.
* Avoid absolute positioning for primary page layout.
* Let content determine height.

---

## Components

Components should be reusable, composable, accessible, and content-agnostic.

### Component Naming

Use PascalCase:

```text
ProjectCard
ProjectHero
ProjectMeta
MediaBlock
```

Prefer generic reusable names over project-specific names.

Prefer:

```tsx
<ProjectSection variant="split" />
```

Avoid:

```tsx
<IrisSpecialSplitSection />
```

unless the component is genuinely unique to that project.

---

### Header

Responsibilities:

* Brand/name
* Primary navigation
* Current-page state
* Mobile navigation behavior

Rules:

* Keep visually lightweight.
* Preserve navigation across all main pages.
* Use semantic `<nav>`.
* Use `aria-current="page"` for active navigation items.

```css
.nav-link[aria-current="page"] {
  opacity: 0.4;
}
```

---

### Navigation

Primary destinations:

* Work
* About
* Play

External/contact links may be added when appropriate.

Navigation links use `<a>` or router link components, not buttons.

---

### ProjectCard

Purpose: summarize and link to a portfolio project.

Required content:

* Project title
* Project media
* Short description
* Destination

Optional content:

* Discipline
* Year
* Award or status

Example:

```tsx
<ProjectCard
  title="Iris"
  description="Designing wearable intelligence for 2036."
  image="/images/iris-cover.webp"
  href="/projects/iris"
  disciplines={["Product", "Brand", "AI"]}
/>
```

Rules:

* Prefer making the full card clickable.
* Preserve semantic link behavior.
* Keep media aspect ratios intentional.
* Avoid unnecessary nested buttons.
* Keep metadata visually secondary.

---

### ProjectHero

Purpose: communicate what the project is immediately.

Recommended order:

1. Project title
2. Positioning statement
3. Metadata
4. Primary media

The user should understand the project's basic premise within a few seconds.

---

### ProjectMeta

Recommended fields:

| Field    | Example                      |
| -------- | ---------------------------- |
| Type     | Hackathon                    |
| Role     | Product Design, Brand Design |
| Timeline | 24 Hours                     |
| Team     | 4 people                     |

Optional fields:

* Client
* Recognition
* Status
* Year

Avoid long tool lists unless tooling is relevant to the story.

---

### ProjectSection

Reusable case-study section.

```tsx
<ProjectSection
  eyebrow="The Challenge"
  title="AI understands prompts, but not always context."
>
  ...
</ProjectSection>
```

May contain:

* Eyebrow
* Heading
* Body
* Supporting media
* Caption
* Grid
* Callout

---

### MediaBlock

Supports:

* Images
* Video
* GIF
* Prototype
* Browser mockup
* Device mockup

Rules:

* Preserve the intended aspect ratio.
* Never depend on fixed height unless required by the composition.
* Lazy-load media below the fold.
* Reserve media dimensions to reduce layout shift.

```css
.media {
  width: 100%;
  overflow: hidden;
}
```

---

### Figure

Use semantic markup for captioned media.

```html
<figure>
  <img src="..." alt="..." />
  <figcaption>...</figcaption>
</figure>
```

Use metadata or small typography for captions.

---

### Button

Use buttons for actions.

Use links for navigation.

Variants:

```text
primary
secondary
text
```

Minimum interactive target:

```css
min-height: 44px;
min-width: 44px;
```

---

### TextLink

Links should have an interaction cue beyond color.

```css
.text-link {
  text-decoration-thickness: 1px;
  text-underline-offset: 0.15em;
}

.text-link:hover {
  opacity: 0.55;
}
```

---

### Tag

Use tags for concise descriptors such as:

* Product Design
* Brand
* AI
* Research
* Design Systems

Tags should remain secondary to project titles and descriptions.

Avoid excessive pill-shaped UI.

---

### Footer

May contain:

* Short sign-off
* Email
* LinkedIn
* Copyright
* Availability or location when relevant

Keep the footer simple and spacious.

---

## Animations

Motion should clarify interaction and add polish without delaying content.

### Motion Tokens

```css
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 600ms;

--ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);
--ease-enter: cubic-bezier(0.16, 1, 0.3, 1);
```

### Hover Motion

Appropriate properties:

* `opacity`
* `transform`
* `scale`
* Underline position
* Image zoom

Example:

```css
.project-card img {
  transition:
    transform var(--duration-slow) var(--ease-standard);
}

.project-card:hover img {
  transform: scale(1.02);
}
```

Keep scaling subtle.

### Entrance Motion

Recommended movement range:

```text
8px–16px
```

Example:

```css
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Scroll Motion

Use only for meaningful moments such as:

* Project hero
* Major media reveals
* Key storytelling transitions

Do not animate every element entering the viewport.

### Reduced Motion

Required:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Responsive Rules

Design mobile-first.

Breakpoints should respond to layout needs rather than specific device models.

### Breakpoints

| Name   |   Width | Usage   |
| ------ | ------: | ------- |
| Small  | `30rem` | ~480px  |
| Medium | `48rem` | ~768px  |
| Large  | `64rem` | ~1024px |
| XL     | `90rem` | ~1440px |

Prefer `rem`-based media queries.

---

### Mobile

`< 48rem`

* Use primarily single-column layouts.
* Stack project metadata.
* Use full-width project media.
* Preserve generous whitespace.
* Remove nonessential decorative complexity.
* Prevent horizontal overflow.
* Keep touch targets at least `44px`.
* Use `var(--page-gutter)` for horizontal spacing.

---

### Tablet

`48rem–63.99rem`

* Introduce two-column layouts where useful.
* Project cards may use two columns.
* Metadata may use multiple columns.
* Continue limiting text width.
* Recompose layouts rather than simply scaling desktop layouts.

---

### Desktop

`>= 64rem`

* Use the 12-column grid.
* Allow asymmetric editorial layouts.
* Increase whitespace.
* Keep body copy constrained.
* Use larger project imagery where appropriate.

---

### Large Desktop

`>= 90rem`

* Do not allow content to grow indefinitely.
* Respect `--container-max`.
* Increase surrounding whitespace rather than endlessly enlarging UI.
* Maintain readable text measures.

---

### Images

```css
img {
  display: block;
  max-width: 100%;
  height: auto;
}
```

Use:

* AVIF where appropriate
* WebP
* Responsive `srcset`
* `sizes`
* Explicit dimensions or `aspect-ratio`
* Lazy loading below the fold
* Descriptive alt text

Avoid oversized source files when a smaller responsive image is sufficient.

---

## Accessibility

Accessibility is a system requirement, not a final polish step.

### Required

* Semantic HTML
* Logical heading hierarchy
* Keyboard navigation
* Visible focus states
* Sufficient color contrast
* Descriptive image alternatives
* Reduced-motion support
* Proper button/link semantics
* Accessible labels for icon-only controls
* No critical information conveyed only through color

### Focus State

```css
:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 4px;
}
```

Never remove browser focus indicators without providing a replacement.

---

## Content Rules

Portfolio content should be optimized for scanning.

### Case Studies

Each case study should quickly establish:

1. What is this?
2. What problem was being solved?
3. What was my role?
4. What decisions did I make?
5. Why did I make them?
6. What changed because of the work?
7. What did I learn?

### Writing

Prefer:

* Short paragraphs
* Descriptive headings
* Clear captions
* Specific outcomes
* Decision-oriented storytelling

Avoid:

* Large uninterrupted text blocks
* Repeating information already visible in metadata
* Explaining every artifact
* Generic process language without a clear design decision

---

## Performance

### Media

* Compress all portfolio imagery.
* Prefer AVIF/WebP where practical.
* Lazy-load below-fold media.
* Do not autoplay unnecessary video.
* Avoid loading multiple large video embeds on initial page load.

### Fonts

* Load only required weights.
* Prefer variable fonts when appropriate.
* Use `font-display: swap`.
* Avoid unnecessary font families.

### Layout

* Reserve media dimensions.
* Avoid layout shifts.
* Avoid unnecessary JavaScript for CSS-solvable interactions.

---

## SEO

Every public page requires:

* Unique `<title>`
* Meta description
* Canonical URL where appropriate
* Open Graph title
* Open Graph description
* Open Graph image
* Social sharing metadata

Site-level requirements:

* `robots.txt`
* `sitemap.xml`
* Favicon
* Default social sharing image

Project pages should have project-specific metadata.

---

## Development Plan

### Phase 1 — Foundation

* [ ] Configure React
* [ ] Configure TypeScript
* [ ] Configure Vite
* [ ] Add routing
* [ ] Configure MDX
* [ ] Create CSS reset
* [ ] Create global styles
* [ ] Create `tokens.css`

### Phase 2 — Tokens

Implement:

* [ ] Typography
* [ ] Colors
* [ ] Spacing
* [ ] Containers
* [ ] Motion
* [ ] Grid
* [ ] Breakpoint conventions

Do not build page-specific styling before the foundational tokens exist.

### Phase 3 — Layout

Build:

* [ ] `PageContainer`
* [ ] `Header`
* [ ] `Navigation`
* [ ] `Footer`
* [ ] `Section`
* [ ] `Grid`
* [ ] `Stack`

### Phase 4 — Portfolio Components

Build:

* [ ] `ProjectCard`
* [ ] `ProjectGrid`
* [ ] `ProjectHero`
* [ ] `ProjectMeta`
* [ ] `ProjectSection`
* [ ] `MediaBlock`
* [ ] `Figure`
* [ ] `Video`
* [ ] `Tag`
* [ ] `NextProject`

### Phase 5 — Pages

Recommended order:

1. Home
2. Base project template
3. Google Tasks
4. Iris
5. Remaining case studies
6. About
7. Play
8. 404

Complete one project template before implementing every case study.

### Phase 6 — Responsive

Test at minimum:

|  Width | Purpose       |
| -----: | ------------- |
|  375px | Small mobile  |
|  430px | Large mobile  |
|  768px | Tablet        |
| 1024px | Small desktop |
| 1280px | Desktop       |
| 1440px | Large desktop |
| 1728px | Wide desktop  |

Check:

* [ ] Typography
* [ ] Navigation
* [ ] Project grids
* [ ] Image cropping
* [ ] Project metadata
* [ ] Long headings
* [ ] Case-study layouts
* [ ] Horizontal overflow
* [ ] Footer
* [ ] Touch targets

Fix the responsive system rather than applying viewport-specific patches.

### Phase 7 — Interaction

Add only after layout is stable:

* [ ] Navigation states
* [ ] Link states
* [ ] Project-card hover
* [ ] Image interactions
* [ ] Page entrance motion
* [ ] Intentional scroll interactions
* [ ] Reduced-motion behavior

### Phase 8 — Accessibility

Audit:

* [ ] Heading hierarchy
* [ ] Landmarks
* [ ] Alt text
* [ ] Keyboard navigation
* [ ] Focus states
* [ ] Contrast
* [ ] Button/link semantics
* [ ] Reduced motion
* [ ] Accessible names

### Phase 9 — Performance

Audit:

* [ ] Image sizes
* [ ] Image formats
* [ ] Responsive media
* [ ] Lazy loading
* [ ] Video loading
* [ ] Font loading
* [ ] Layout shift
* [ ] Bundle size
* [ ] Unused dependencies

### Phase 10 — SEO

Verify:

* [ ] Page titles
* [ ] Meta descriptions
* [ ] Canonical URLs
* [ ] Open Graph metadata
* [ ] Social images
* [ ] `robots.txt`
* [ ] `sitemap.xml`
* [ ] Favicon

---

## Component Decision Rules

Before creating a component, ask:

1. Does this pattern already exist?
2. Can an existing component support it with a prop or variant?
3. Will this pattern be reused?
4. Is this a layout primitive, UI primitive, or content-specific component?
5. Can project-specific content remain outside the component?

Create a new reusable component when the pattern has meaningful:

* Structure
* Behavior
* Styling
* Accessibility requirements

Do not componentize arbitrary wrappers purely to reduce line count.

---

## Styling Rules

### Prefer

```css
.project-title {
  margin-block-end: var(--space-5);
  color: var(--color-text);
  font-size: var(--text-3xl);
}
```

### Avoid

```css
.project-title {
  margin-bottom: 29px;
  color: #111111;
  font-size: 47px;
}
```

If a value represents a repeated design decision, create or use a token.

If a value is truly unique to a single composition, a local value is acceptable.

---

## Implementation Checklist

Before marking a component complete:

* [ ] Uses design tokens
* [ ] Works from mobile through desktop
* [ ] Works with short and long content
* [ ] Uses semantic HTML
* [ ] Supports keyboard interaction when interactive
* [ ] Has visible focus behavior
* [ ] Does not introduce unnecessary dependencies
* [ ] Does not duplicate an existing component
* [ ] Handles reduced motion where applicable
* [ ] Does not create horizontal overflow

---

## Design Principle

> **Consistency first. Exceptions should be intentional.**

Projects may establish their own personality through:

* Art direction
* Project colors
* Media
* Composition
* Typography moments
* Motion

The portfolio remains cohesive through:

* Navigation
* Typography hierarchy
* Spacing
* Containers
* Grid
* Metadata
* Interaction patterns
* Responsive behavior
* Accessibility

The system should make the portfolio feel connected without making every project look identical.
