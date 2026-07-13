# Project Archive

Edit **this file** to change archive cards and popup content.
Images stay in `content/play/` next to this file.

After saving, refresh the gallery:

```bash
python3 scripts/build-play-manifest.py
```

**How each entry works**

- The `##` heading is the **popup title**
- Fields under it control the card / popup meta (`image`, `date`, `tag`, `order`, optional `link` / `linkLabel` / `alt` / `size`)
- Blank line, then the **popup description** (multiple paragraphs ok)
- Separate entries with `---`
- `image:` = media filename in this folder (e.g. `Mirae.png`)
- Leave `link` / `linkLabel` out if there is no external link

<!-- Entries below — keep the ## / fields / description / --- pattern -->

---

## Karachi Run Club
image: Karachi-Run-Club.png
date: 2024
tag: Branding
order: 1

Identity treatment for a community running club rooted in Karachi.

---

## Mismatch
image: Mismatch.png
date: 2025
tag: Web
order: 2
link: https://zarah-byte.github.io/01_manuscript/
linkLabel: See it live

Interactive manuscript experience.

---

## Homebodies
image: Homebodies.png
date: 2025
tag: Branding
order: 3

Wordmark exploration for a home fragrance brand centered on warmth and ritual.

---

## Homebodies candles
image: Homebodies-Candles.png
date: 2025
tag: Packaging
order: 4

Product and packaging study for the Homebodies candle line.

---

## Bear Witness
image: Bear-Witness.png
date: 2024
tag: Print
order: 5

Editorial poster exploring cultural discourse through collage and type.

---

## Raise Your Glass
image: Raise-Your-Glass.png
date: 2025
tag: Web
order: 6
link: https://zarah-byte.github.io/links/
linkLabel: See it live

Editorial link hub study.

---

## Karachi Run Club tees
image: Karachi-Run-Club-Tees.png
date: 2024
tag: Merch
order: 7

Apparel explorations for Karachi Run Club — front mark and back graphic.

---

## Mirae
image: Mirae.png
date: 2026
tag: Speculative
order: 8
alt: Mirae — speculative bio-adaptive sensing patch and companion interface

A speculative bio-adaptive system built for FigBuild 2026 with Chareese Lam — a wearable sensing patch and an AI guide that help you notice stress, avoidance, and habit loops before they surface.

Most wellness tools arrive too late, reporting on a state after it has passed. Mirae meets the moment as it forms: the patch reads quiet signals at the skin, the AI interprets the pattern, and the companion interface surfaces one small, timely nudge — a prompt to breathe, pause, or notice the loop you're about to repeat.

---

## Spark
image: Spark.png
date: 2026
tag: UI Study
order: 9
link: https://www.figma.com/proto/cTVZZJDPQk7Yd44iCH2Ltp/SPARK?p=f&viewport=676%2C438%2C0.02&t=4VXe677iEbLei7mx-1&scaling=scale-down&content-scaling=fixed&show-proto-sidebar=1&node-id=325-3519&starting-point-node-id=346%3A3669&page-id=0%3A1
linkLabel: View prototype

Spark is a fintech app designed to simplify financial transactions for a younger demographic. Created as part of an Advanced UI/UX course.
