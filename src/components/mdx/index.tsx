import {
  Children,
  cloneElement,
  isValidElement,
  type ComponentType,
  type ReactNode,
} from "react";

/**
 * MDX tag → component map for case studies. Each maps to the exact class markup
 * the old scripts/build-work-pages.py produced, so css/project.css applies
 * unchanged. Components tagged `.bleed` are laid out full-width by <Section>;
 * everything else groups into the prose column.
 */

type Bleeded<P = Record<string, unknown>> = ComponentType<P> & { bleed?: boolean };

const VIMEO_BG =
  "?background=1&loop=1&autoplay=1&muted=1&title=0&byline=0&portrait=0&badge=0&app_id=58479";
const VIMEO_CTRL = "?title=0&byline=0&portrait=0&badge=0&app_id=58479";
const IFRAME_ALLOW =
  "autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share";

const els = (children: ReactNode) => Children.toArray(children).filter(isValidElement);

/* ---- prose ------------------------------------------------------------- */

export const Deck: Bleeded<{ children: ReactNode }> = ({ children }) => (
  <p className="project-deck">{children}</p>
);
Deck.bleed = false;

export const Quote: Bleeded<{ children: ReactNode }> = ({ children }) => (
  <blockquote className="project-quote">
    <p>{children}</p>
  </blockquote>
);
Quote.bleed = false;

/* ---- media (bleed) ----------------------------------------------------- */

export const Image: Bleeded<{
  src: string;
  alt?: string;
  flush?: boolean;
  contained?: boolean;
}> = ({ src, alt = "", flush, contained }) => {
  const mods = [flush && "project-media--flush", contained && "project-media--contained"]
    .filter(Boolean)
    .join(" ");
  return (
    <figure className={`project-media${mods ? " " + mods : ""}`}>
      <img src={src} alt={alt} loading="lazy" />
    </figure>
  );
};
Image.bleed = true; // <Section> treats a `contained` Image as prose (see below)

export const Placeholder: Bleeded<{ children?: ReactNode; label?: string }> = ({
  children,
  label,
}) => (
  <figure className="project-media project-media--placeholder">
    <p>{label ?? children}</p>
  </figure>
);
Placeholder.bleed = true;

export const Vimeo: Bleeded<{
  id: string | number;
  title?: string;
  ratio?: string;
  background?: boolean;
}> = ({ id, title = "", ratio = "16x9", background = true }) => {
  const [w, h] = ratio.split("x");
  const src = `https://player.vimeo.com/video/${id}${background ? VIMEO_BG : VIMEO_CTRL}`;
  return (
    <figure
      className={`project-media project-media--embed project-media--flush project-media--ratio-${ratio}`}
      style={{ aspectRatio: `${w} / ${h}` }}
    >
      <iframe
        className="project-video"
        src={src}
        allow={IFRAME_ALLOW}
        referrerPolicy="strict-origin-when-cross-origin"
        title={title}
      />
    </figure>
  );
};
Vimeo.bleed = true;

export const Figure: Bleeded<{ src: string; caption: string }> = ({ src, caption }) => (
  <figure className="project-figure">
    <div className="project-figure__media">
      <img src={src} alt={caption} loading="lazy" />
    </div>
    <figcaption className="project-figure__note">{caption}</figcaption>
  </figure>
);
Figure.bleed = true;

/** A single figure renders as-is; two or more tile into a grid gallery. */
export const Gallery: Bleeded<{ children: ReactNode }> = ({ children }) => {
  const items = els(children);
  if (items.length === 1) return <>{items[0]}</>;
  const count = Math.min(items.length, 4);
  return <div className={`project-gallery project-gallery--${count}`}>{items}</div>;
};
Gallery.bleed = true;

/* ---- statements (bleed) ------------------------------------------------ */

export const Panel: Bleeded<{ heading?: string; children: ReactNode }> = ({
  heading,
  children,
}) => (
  <aside className="project-panel">
    {heading && <h3 className="project-panel__heading">{heading}</h3>}
    <p>{children}</p>
  </aside>
);
Panel.bleed = true;

export const Callout: Bleeded<{ children: ReactNode }> = ({ children }) => (
  <aside className="project-callout">
    <p>{children}</p>
  </aside>
);
Callout.bleed = true;

/* ---- card grid (bleed) ------------------------------------------------- */

export const Card: Bleeded<{ title?: string; tint?: number; children?: ReactNode }> = ({
  title,
  tint = 1,
  children,
}) => (
  <div className={`project-card project-card--${tint}`}>
    {title && <h3 className="project-card__title">{title}</h3>}
    {children && <p>{children}</p>}
  </div>
);
Card.bleed = false;

/** Consecutive [card]s tile into a grid, tinted by position (1..4 cycling). */
export const CardGrid: Bleeded<{ children: ReactNode }> = ({ children }) => {
  const cards = els(children);
  const count = Math.min(cards.length, 4);
  return (
    <div className={`project-cards project-cards--${count}`}>
      {cards.map((card, i) =>
        cloneElement(card as React.ReactElement<{ tint?: number }>, { tint: (i % 4) + 1 })
      )}
    </div>
  );
};
CardGrid.bleed = true;

/* ---- FAQ grid (bleed) -------------------------------------------------- */

export const Faq: Bleeded<{ question?: string; children?: ReactNode }> = ({
  question,
  children,
}) => (
  <div className="project-faq__item">
    {question && <h3 className="project-faq__q">{question}</h3>}
    {children && <p>{children}</p>}
  </div>
);
Faq.bleed = false;

export const FaqGrid: Bleeded<{ children: ReactNode }> = ({ children }) => (
  <div className="project-faq">{els(children)}</div>
);
FaqGrid.bleed = true;

/* ---- section ----------------------------------------------------------- */

function isBleed(node: ReactNode): boolean {
  if (!isValidElement(node)) return false;
  const type = node.type as Bleeded;
  if (typeof type === "string") return false;
  if (type.bleed !== true) return false;
  // A `contained` Image lives in the prose column, not the bleed lane.
  if (type === Image && (node.props as { contained?: boolean }).contained) return false;
  return true;
}

/**
 * One case-study section. Injected around each `##` by remark-section.
 * Groups consecutive prose children into `.project-section__body` and drops
 * each bleed child into its own `.project-section__bleed`, mirroring
 * render_section() in the old build.
 */
export const Section: ComponentType<{ id?: string; title?: string; children: ReactNode }> = ({
  id,
  title,
  children,
}) => {
  const out: ReactNode[] = [];
  let prose: ReactNode[] = [];
  const flush = () => {
    if (!prose.length) return;
    out.push(
      <div className="project-section__body" key={`body-${out.length}`}>
        {prose}
      </div>
    );
    prose = [];
  };

  Children.forEach(children, (child) => {
    if (typeof child === "string" && child.trim() === "") return; // MDX whitespace
    if (isBleed(child)) {
      flush();
      out.push(
        <div className="project-section__bleed" key={`bleed-${out.length}`}>
          {child}
        </div>
      );
    } else {
      prose.push(child);
    }
  });
  flush();

  return (
    <section className="project-section" {...(id ? { id } : {})}>
      {title && <h2>{title}</h2>}
      {out}
    </section>
  );
};

/* Markdown lists in case-study prose carry the .project-list class. */
const Ul = (props: React.HTMLAttributes<HTMLUListElement>) => (
  <ul className="project-list" {...props} />
);
const Ol = (props: React.HTMLAttributes<HTMLOListElement>) => (
  <ol className="project-list" {...props} />
);

export const mdxComponents = {
  ul: Ul,
  ol: Ol,
  Section,
  Deck,
  Quote,
  Image,
  Placeholder,
  Vimeo,
  Figure,
  Gallery,
  Panel,
  Callout,
  Card,
  CardGrid,
  Faq,
  FaqGrid,
};
