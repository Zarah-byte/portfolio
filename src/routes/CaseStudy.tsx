import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { Link, useParams } from "react-router-dom";
import "../styles/project.css";
import Seo from "../components/Seo";
import { mdxComponents, Vimeo } from "../components/mdx";
import { relatedTo } from "../content/work/meta";

interface Frontmatter {
  eyebrow?: string;
  title?: string;
  status?: string;
  duration?: string;
  role?: string;
  team?: string;
  tools?: string;
  hero?: string;
  heroType?: "image" | "vimeo" | "icon";
  heroTint?: string;
  heroControls?: string;
  presentation?: string;
  presentationLabel?: string;
  cover?: string;
}

type MdxModule = {
  default: ComponentType<{ components?: Record<string, unknown> }>;
  frontmatter: Frontmatter;
};

const loaders = import.meta.glob<MdxModule>("../content/work/*.mdx");

function assetPath(p: string) {
  let s = p.trim().replace(/\\/g, "/");
  while (s.startsWith("../")) s = s.slice(3);
  while (s.startsWith("./")) s = s.slice(2);
  return "/" + s.replace(/^\/+/, "");
}

/** Join comma- or newline-separated values with <br>, like format_meta_value(). */
function multiline(value: string, kind: "list" | "team" | "plain"): ReactNode {
  let parts: string[];
  if (kind === "list") parts = value.split(",").map((s) => s.trim()).filter(Boolean);
  else if (kind === "team")
    parts = value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split(/\s+[—–-]\s+/)[0].trim());
  else parts = value.split("\n").map((s) => s.trim()).filter(Boolean);
  return parts.map((part, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {part}
    </span>
  ));
}

const META_FIELDS: [keyof Frontmatter, string, "list" | "team" | "plain"][] = [
  ["duration", "Timeline", "plain"],
  ["role", "Role", "list"],
  ["team", "Team", "team"],
  ["tools", "Tools", "list"],
];

function Masthead({ fm }: { fm: Frontmatter }) {
  const eyebrow = (fm.eyebrow || "").trim();
  const tagline = (fm.title || eyebrow).trim();

  return (
    <header className="project-masthead">
      <div className="project-masthead__text">
        {fm.status && (
          <p className="project-status">
            <span className="project-status__dot" aria-hidden="true" />
            {fm.status}
          </p>
        )}
        <h1 className="project-title">{eyebrow}</h1>
        {tagline && (
          <div className="project-lead">
            <p className="project-tagline">{tagline}</p>
          </div>
        )}
        <dl className="project-meta">
          {META_FIELDS.map(([key, label, kind]) => {
            const value = (fm[key] || "").trim();
            if (!value) return null;
            return (
              <div className="project-meta__row" key={key}>
                <dt className="project-meta__label">{label}</dt>
                <dd className="project-meta__value">{multiline(value, kind)}</dd>
              </div>
            );
          })}
        </dl>
        {fm.presentation && (
          <a
            className="project-lead__link"
            href={fm.presentation}
            target="_blank"
            rel="noopener"
          >
            {fm.presentationLabel || "See the Presentation"}
          </a>
        )}
      </div>
      <Hero fm={fm} eyebrow={eyebrow} />
    </header>
  );
}

function Hero({ fm, eyebrow }: { fm: Frontmatter; eyebrow: string }) {
  if (!fm.hero) return null;
  const type = (fm.heroType || "image").toLowerCase();
  let hero: ReactNode;

  if (type === "vimeo") {
    const controls = ["true", "1", "yes"].includes((fm.heroControls || "").toLowerCase());
    hero = <Vimeo id={fm.hero} title={`${eyebrow} cover`} background={!controls} />;
  } else if (type === "icon") {
    const tint = (fm.heroTint || "1").trim() || "1";
    hero = (
      <div className={`project-hero__graphic project-hero__graphic--tint-${tint}`}>
        <img className="project-hero__icon" src={assetPath(fm.hero)} alt={eyebrow} />
      </div>
    );
  } else {
    hero = (
      <figure className="project-media project-media--flush">
        <img
          src={assetPath(fm.hero)}
          alt={`${eyebrow} cover`}
          loading="eager"
        />
      </figure>
    );
  }

  return <div className="project-masthead__media">{hero}</div>;
}

function Related({ slug }: { slug: string }) {
  const items = relatedTo(slug);
  if (!items.length) return null;
  return (
    <aside className="project-related">
      <h2 className="project-related__title">More Projects</h2>
      <ul className="project-related__grid">
        {items.map((w) => (
          <li key={w.slug}>
            <Link className="project-related__card" to={`/projects/${w.slug}`}>
              <div className="project-related__thumb">
                <img src={w.relatedCover} alt="" loading="lazy" />
              </div>
              <h3 className="project-related__name">{w.eyebrow}</h3>
              <p className="project-related__desc">{w.tagline}</p>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

interface TocItem {
  id: string;
  title: string;
}

/** Sticky "On this page" rail + active-segment scroll spy (port of project-nav.js). */
function Toc({ items, activeId }: { items: TocItem[]; activeId: string | null }) {
  if (!items.length) return null;
  return (
    <aside className="project-nav">
      <div className="project-nav__inner">
        <p className="project-nav__eyebrow">On this page</p>
        <nav className="project-nav__sections" aria-label="On this page">
          <ul className="project-nav__list" role="list">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  className="project-nav__link"
                  href={`#${item.id}`}
                  {...(item.id === activeId ? { "aria-current": "true" } : {})}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

export default function CaseStudy() {
  const { slug } = useParams();
  const [mod, setMod] = useState<MdxModule | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMod(null);
    setNotFound(false);
    const key = Object.keys(loaders).find((k) => k.endsWith(`/${slug}.mdx`));
    if (!key) {
      setNotFound(true);
      return;
    }
    let cancelled = false;
    loaders[key]().then((m) => {
      if (!cancelled) setMod(m);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Build the TOC from rendered sections + wire the scroll spy.
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body || !mod) return;
    const sections = [...body.querySelectorAll<HTMLElement>(".project-section[id]")];
    setToc(
      sections.map((el) => ({
        id: el.id,
        title: el.querySelector("h2")?.textContent?.trim() || el.id,
      }))
    );

    let queued = false;
    const update = () => {
      queued = false;
      const line = window.innerHeight / 3;
      let current = sections[0];
      for (const el of sections) {
        if (el.getBoundingClientRect().top <= line) current = el;
      }
      const firstTop = sections[0]?.getBoundingClientRect().top ?? 0;
      const lastBottom =
        sections[sections.length - 1]?.getBoundingClientRect().bottom ?? 0;
      if (firstTop > line) current = sections[0];
      else if (lastBottom < 0) current = sections[sections.length - 1];
      setActiveId(current?.id ?? null);
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [mod]);

  const components = useMemo(() => mdxComponents, []);

  if (notFound) {
    return (
      <main className="project-content">
        <p>Project not found.</p>
      </main>
    );
  }
  if (!mod) return <main className="project-content" />;

  const { default: Body, frontmatter } = mod;
  const eyebrow = (frontmatter.eyebrow || slug || "").trim();
  const tagline = (frontmatter.title || eyebrow).trim();
  const ogImage = frontmatter.cover ? assetPath(frontmatter.cover) : undefined;

  return (
    <main className="project-content">
      <Seo
        title={`Zarah Yaqub | ${eyebrow}`}
        description={tagline}
        canonical={`/projects/${slug}`}
        ogImage={ogImage}
        ogType="article"
      />
      <Masthead fm={frontmatter} />
      <div className="project-layout">
        <Toc items={toc} activeId={activeId} />
        <div className="project-body" ref={bodyRef}>
          <Body components={components} />
        </div>
      </div>
      <Related slug={slug || ""} />
    </main>
  );
}
