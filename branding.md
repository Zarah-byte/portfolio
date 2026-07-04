# Branding — Zarah Yaqub

The brand rules of the personal site. Keep this in sync with
[styling.md](styling.md) (the technical design tokens) and
[content.md](content.md) (the copy). Branding defines *what the site feels like*;
styling defines *how that is built*.

---

## 1. Identity

| | |
|---|---|
| **Name** | Zarah Yaqub |
| **Alias** | Zarah by Design |
| **Discipline** | Brand & Product Designer |
| **One-liner** | Solving problems using technology and building ideas from the ground up. |
| **Home base** | New York City · from Karachi, Pakistan |

The brand sits at the intersection of **brand craft** and **product thinking** —
globally informed, deeply personal. Editorial and confident, never loud.

---

## 2. Logo

- The wordmark is a hand-shaped **"ZARAH YAQUB" logotype** with a small
  eight-point spark/asterisk standing in for the dot on the "i"/accent — see the
  inline `<svg class="logo">` in every page `<header>`.
- The logo is delivered as **inline SVG** (not an image) so it inherits color and
  stays crisp. Fill is `#000000` on light backgrounds.
- **Clear space:** keep at least the logo's cap-height of empty space around it.
- **Minimum width:** 61px (its native width). Scale up fluidly; never below.
- **Do not:** recolor to anything but black/near-black, stretch, add effects, or
  place on a busy background.
- The logo links **home** on every page except the homepage itself.

### The spark ✳
The eight-point spark from the logo is the brand's one recurring motif. Reuse it
sparingly as a marker/bullet (e.g. the dot after a case-study title). It signals
"a small moment of craft."

---

## 3. Voice & tone

**Personality:** thoughtful, warm, precise. A designer who explains clearly and
doesn't oversell.

Write like this:
- **Plain-spoken, not corporate.** "Solar owners couldn't see where their money
  went" — not "users lacked financial visibility."
- **Lead with the problem, then the human outcome.** Every case ends on what
  changed for a real person.
- **Short, confident sentences.** One idea each. Em dashes for asides.
- **Lowercase-friendly, sentence case** for body and captions. Display headings
  are UPPERCASE (set in Tanker).
- **Specific over grand.** Concrete numbers and moments beat adjectives.

Avoid: buzzwords ("synergy," "leverage," "seamless"), exclamation spam, and
jargon that hides the idea.

### Recurring phrases
- "aka Zarah by Design"
- "from the ground up"
- "as globally informed as it is deeply personal"
- "Let's build something."

---

## 4. Color as brand

The palette is deliberately quiet so **work is the loudest thing on screen.**
Near-black ink on white, warm gray for supporting text. (Exact hex values live in
[styling.md](styling.md#colors).)

| Role | Feel |
|------|------|
| **Ink** (`#080A0B`) | Headlines, logo, key text — the brand's black |
| **Paper** (`#FFFFFF`) | Background — generous, calm |
| **Muted** (`#727471`) | Body & captions — present but never competes |
| **Placeholder** (`#D9D9D9`) | Media wells before imagery loads |

A single accent — a soft **lilac (`#CFA4D2`)** — is used like punctuation: the
eight-point spark, tag/year markers, hover fills, and marquee. It stays quiet by
design; project imagery is still the loudest color on screen. Because the lilac is
light, accent *text* uses a deeper lilac (`#A06FA6`) for legibility. Exact tokens
live in [styling.md](styling.md#colors).

---

## 5. Typography as brand

Three voices, each with a job. (Sizes & weights in
[styling.md](styling.md#typography).)

- **Tanker** — the display voice. UPPERCASE, structural, used for the biggest
  moments (section titles, nav, project names).
- **Geist** — the reading voice. Bio, case prose, captions. Neutral and modern.
- **Space Mono** — the label voice. Tags, kickers, metadata, years. Technical but
  friendly, always small and letter-spaced.

Pairing rule: never more than one Tanker headline competing in the same view.

---

## 6. Imagery

- Project media sits in **rounded 1rem wells** at ~16:10.
- Before real assets exist, wells use the `#D9D9D9` placeholder — never leave a
  raw colored box in a shipped page.
- Prefer **product-in-context** shots and clean UI over decorative stock.
- On hover (desktop), media scales gently (1.06) and reveals a circular arrow —
  motion is subtle and quick, never bouncy.

---

## 7. Motion & interaction

- **Subtle and fast.** Transitions 0.15s–0.45s, ease. Nothing springy.
- Hover affordances (arrow, media zoom) only where `hover: hover`.
- Always respect `prefers-reduced-motion` — motion is an enhancement, not a
  requirement.
- The mobile nav is a **frosted-glass bottom sheet** toggled by a floating
  circular button; desktop uses a persistent top bar.

---

## 8. Don't

- Don't introduce a second display typeface.
- Don't add drop shadows, gradients, or glossy effects to the chrome.
- Don't center long-form body copy (headlines/short lines may center).
- Don't let decoration outshout the work.
