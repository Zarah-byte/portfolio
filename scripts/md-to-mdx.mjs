/**
 * One-shot converter: content/work/*.md → src/content/work/*.mdx.
 * Ports the block grouping of scripts/build-work-pages.py (section_content_to_blocks)
 * so galleries/card-grids/faq-grids match the old build exactly, and rewrites the
 * custom [tag] syntax to the JSX components in src/components/mdx. `##` headings
 * are kept verbatim — remark-section wraps them into <Section> at build time.
 *
 * Run once:  node scripts/md-to-mdx.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "content", "work");
const OUT = join(ROOT, "src", "content", "work");

const VIMEO = /^\[vimeo:(\d+)(?:\s+(.*))?\]$/;
const YOUTUBE = /^\[youtube:([\w-]{11})(?:\s+(.*))?\]$/;
const IMAGE = /^\[image:([^\]\s]+)(?:\s+(.*))?\]$/;
const CALLOUT = /^\[callout:\s*(.+)\]$/;
const PLACEHOLDER = /^\[placeholder:\s*(.+)\]$/;
const CARD = /^\[card:\s*(.+)\]$/;
const FAQ = /^\[faq:\s*(.+)\]$/;
const PANEL = /^\[panel:\s*(.+)\]$/;
const QUOTE = /^\[quote:\s*(.+)\]$/;
const FIGURE = /^\[figure:([^\]\s]+)\s*\|\s*(.+)\]$/;
const DECK = /^\[deck\]\s+(.+)$/;
const ORDERED = /^\d+\.\s+/;
const UNORDERED = /^[-*]\s+/;

const attr = (s) => String(s).replace(/"/g, "&quot;");
const asset = (p) => {
  let s = p.trim().replace(/\\/g, "/");
  while (s.startsWith("../")) s = s.slice(3);
  while (s.startsWith("./")) s = s.slice(2);
  return "/" + s.replace(/^\/+/, "");
};
// MDX parses `{` and `}` as expressions and `<` as JSX — escape any stray ones
// in prose so plain text survives.
const mdxText = (s) => s.replace(/([{}<])/g, "\\$1");

const splitCard = (t) => {
  if (t.includes("|")) {
    const [a, ...b] = t.split("|");
    return [a.trim(), b.join("|").trim()];
  }
  return ["", t.trim()];
};

function trailingTokens(rest, keywords) {
  const tokens = rest.split(/\s+/);
  const flags = {};
  while (tokens.length) {
    const last = tokens[tokens.length - 1].toLowerCase();
    const kw = keywords(last);
    if (!kw) break;
    Object.assign(flags, kw);
    tokens.pop();
  }
  return [tokens.join(" ").trim(), flags];
}

function parseImage(rest) {
  const [text, flags] = trailingTokens(rest || "", (l) =>
    l === "flush" ? { flush: true } : l === "contained" || l === "contain" ? { contained: true } : null
  );
  return { alt: text, ...flags };
}

function parseVimeo(rest) {
  const [text, flags] = trailingTokens(rest || "", (l) => {
    if (/^\d+x\d+$/.test(l)) return { ratio: l };
    if (l === "controls") return { background: false };
    if (l === "background") return { background: true };
    return null;
  });
  return { title: text, ...flags };
}

function convertSection(text, sectionTitle) {
  const lines = text.split("\n");
  const out = [];
  let paras = [];
  let list = [];
  let listTag = "ol";
  let cards = [];
  let faq = [];
  let media = [];

  const emitMedia = () => {
    if (!media.length) return;
    if (media.length === 1) out.push(media[0]);
    else out.push(`<Gallery>\n${media.map((m) => "  " + m).join("\n")}\n</Gallery>`);
    media = [];
  };
  const emitCards = () => {
    if (!cards.length) return;
    const inner = cards
      .map(([t, b]) => `  <Card${t ? ` title="${attr(t)}"` : ""}>${b}</Card>`)
      .join("\n");
    out.push(`<CardGrid>\n${inner}\n</CardGrid>`);
    cards = [];
  };
  const emitFaq = () => {
    if (!faq.length) return;
    const inner = faq
      .map(([q, a]) => `  <Faq${q ? ` question="${attr(q)}"` : ""}>${a}</Faq>`)
      .join("\n");
    out.push(`<FaqGrid>\n${inner}\n</FaqGrid>`);
    faq = [];
  };
  const emitList = () => {
    if (!list.length) return;
    emitMedia();
    out.push(list.join("\n"));
    list = [];
  };
  const emitParas = () => {
    if (!paras.length) return;
    emitList();
    emitCards();
    emitFaq();
    emitMedia();
    // paragraphs separated by blank lines become separate <p> in the old build;
    // markdown does the same, so emit the buffered text with its blank lines.
    out.push(paras.join("\n").replace(/\n{2,}/g, "\n\n").trim());
    paras = [];
  };

  for (const raw of lines) {
    const s = raw.trim();
    if (!s) {
      if (paras.length) paras.push("");
      emitList();
      emitCards();
      emitFaq();
      emitMedia();
      continue;
    }

    const ordered = ORDERED.test(s);
    if (ordered || UNORDERED.test(s)) {
      emitParas();
      const tag = ordered ? "ol" : "ul";
      if (tag !== listTag) {
        emitList();
        listTag = tag;
      }
      const clean = s.replace(ordered ? ORDERED : UNORDERED, "");
      list.push((ordered ? "1. " : "- ") + mdxText(clean));
      continue;
    }

    let m;
    if ((m = DECK.exec(s))) {
      emitParas();
      emitMedia();
      out.push(`<Deck>${mdxText(m[1].trim())}</Deck>`);
      continue;
    }
    if ((m = CARD.exec(s))) {
      emitParas();
      cards.push(splitCard(m[1].trim()).map(mdxText));
      continue;
    }
    if ((m = FAQ.exec(s))) {
      emitParas();
      faq.push(splitCard(m[1].trim()).map(mdxText));
      continue;
    }

    emitList();
    emitCards();
    emitFaq();

    if ((m = PANEL.exec(s))) {
      emitParas();
      emitMedia();
      const [h, b] = splitCard(m[1].trim());
      out.push(`<Panel${h ? ` heading="${attr(h)}"` : ""}>${mdxText(b)}</Panel>`);
      continue;
    }
    if ((m = QUOTE.exec(s))) {
      emitParas();
      emitMedia();
      out.push(`<Quote>${mdxText(m[1].trim())}</Quote>`);
      continue;
    }
    if ((m = FIGURE.exec(s))) {
      emitParas();
      emitMedia();
      out.push(`<Figure src="${attr(asset(m[1].trim()))}" caption="${attr(m[2].trim())}" />`);
      continue;
    }
    if ((m = CALLOUT.exec(s))) {
      emitParas();
      emitMedia();
      out.push(`<Callout>${mdxText(m[1].trim())}</Callout>`);
      continue;
    }
    if ((m = PLACEHOLDER.exec(s))) {
      emitParas();
      media.push(`<Placeholder label="${attr(m[1].trim())}" />`);
      continue;
    }
    if ((m = VIMEO.exec(s))) {
      emitParas();
      const { title, ratio, background } = parseVimeo(m[2] || "");
      const t = title || sectionTitle;
      const parts = [`id="${m[1]}"`, `title="${attr(t)}"`];
      if (ratio) parts.push(`ratio="${ratio}"`);
      if (background === false) parts.push(`background={false}`);
      media.push(`<Vimeo ${parts.join(" ")} />`);
      continue;
    }
    if ((m = YOUTUBE.exec(s))) {
      // No YouTube tags exist in current content; keep as a plain note if seen.
      emitParas();
      media.push(`{/* youtube ${m[1]} unsupported */}`);
      continue;
    }
    if ((m = IMAGE.exec(s))) {
      emitParas();
      const { alt, flush, contained } = parseImage(m[2] || "");
      const a = alt || sectionTitle;
      const parts = [`src="${attr(asset(m[1].trim()))}"`, `alt="${attr(a)}"`];
      if (flush) parts.push("flush");
      if (contained) parts.push("contained");
      const tag = `<Image ${parts.join(" ")} />`;
      if (contained) {
        emitMedia();
        out.push(tag); // contained → prose lane
      } else {
        media.push(tag);
      }
      continue;
    }

    emitMedia();
    paras.push(mdxText(s));
  }

  emitParas();
  emitList();
  emitCards();
  emitFaq();
  emitMedia();
  return out.filter(Boolean).join("\n\n");
}

function convert(md) {
  const fm = md.match(/^---\r?\n(.*?)\r?\n---\r?\n?(.*)$/s);
  const front = fm ? fm[1] : "";
  const body = fm ? fm[2] : md;

  const parts = [];
  let title = null;
  let buf = [];
  const flushSection = () => {
    if (title === null) return;
    const content = convertSection(buf.join("\n").trim(), title);
    parts.push(`## ${title}\n\n${content}`.trimEnd());
    buf = [];
  };
  for (const line of body.split("\n")) {
    const h = line.trim().match(/^##(?:\s+(.*\S))?\s*$/);
    if (h) {
      flushSection();
      title = (h[1] || "").trim();
      continue;
    }
    buf.push(line);
  }
  flushSection();

  return `---\n${front}\n---\n\n${parts.join("\n\n")}\n`;
}

for (const file of readdirSync(SRC).filter((f) => f.endsWith(".md"))) {
  const md = readFileSync(join(SRC, file), "utf8");
  const mdx = convert(md);
  const outName = file.replace(/\.md$/, ".mdx");
  writeFileSync(join(OUT, outName), mdx);
  console.log("wrote", outName);
}
