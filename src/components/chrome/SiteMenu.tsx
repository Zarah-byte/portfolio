import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SOCIALS, RESUME_HREF, STAR_PATH } from "../../lib/site";

type PageId = "work" | "play" | "about";

const PAGES: { id: PageId; label: string; to: string }[] = [
  { id: "work", label: "Work", to: "/" },
  { id: "play", label: "Archive", to: "/play" },
  { id: "about", label: "About", to: "/about" },
];

/**
 * Header menu — port of js/site-menu.js. The open/close animation is entirely
 * CSS (.is-open + [hidden] in site-menu.css), so we drive those with state and
 * keep the panel mounted for the exit transition, rather than re-implementing
 * the spring in JS.
 */
export default function SiteMenu({ current }: { current?: PageId }) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(true);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  const openMenu = () => {
    setHidden(false);
    requestAnimationFrame(() => {
      setOpen(true);
      panelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    });
  };
  const closeMenu = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  };

  // Hide the panel from the a11y tree once its close transition finishes.
  useEffect(() => {
    if (open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const onEnd = (e: TransitionEvent) => {
      if (e.target === panel && e.propertyName === "transform") setHidden(true);
    };
    panel.addEventListener("transitionend", onEnd);
    const fallback = setTimeout(() => setHidden(true), 400);
    return () => {
      panel.removeEventListener("transitionend", onEnd);
      clearTimeout(fallback);
    };
  }, [open]);

  // Outside-click + Escape close.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!triggerRef.current?.contains(e.target as Node)) closeMenu(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu(true);
    };
    const id = setTimeout(() => document.addEventListener("click", onDocClick), 0);
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(id);
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Close on navigation.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="site-menu">
      <Link className="site-menu__wordmark" to="/" aria-label="Zarah Yaqub, home">
        <span className="wordmark-star" aria-hidden="true">
          <svg viewBox="0 0 73 72" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d={STAR_PATH} />
          </svg>
        </span>
        <span className="wordmark-text">Zarah Yaqub</span>
      </Link>

      <div className="site-menu__trigger" ref={triggerRef}>
        <span className="site-menu__toggle-label" aria-hidden="true">
          Menu
        </span>
        <button
          type="button"
          ref={toggleRef}
          className={`site-menu__toggle${open ? " is-open" : ""}`}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? "Close menu" : "Open menu"}
          data-cursor-magnetic
          onClick={() => (open ? closeMenu(true) : openMenu())}
        >
          <span className="site-menu__toggle-icon" aria-hidden="true" />
        </button>

        <div
          className={`site-menu__panel${open ? " is-open" : ""}`}
          id={panelId}
          ref={panelRef}
          hidden={hidden}
        >
          <nav className="site-menu__primary" aria-label="Primary">
            {PAGES.map((page) => (
              <Link
                key={page.id}
                className="site-menu__link"
                to={page.to}
                aria-current={page.id === current ? "page" : undefined}
              >
                {page.label}
              </Link>
            ))}
          </nav>

          <nav className="site-menu__secondary" aria-label="Resume">
            <a
              className="site-menu__link-sub"
              href={RESUME_HREF}
              target="_blank"
              rel="noopener noreferrer"
            >
              Resume
            </a>
          </nav>

          <ul className="site-menu__socials">
            {SOCIALS.map((social) => (
              <li key={social.id}>
                <a
                  className="site-menu__social"
                  data-cursor-magnetic
                  href={social.href}
                  {...(social.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <img src={social.icon} alt="" width={28} height={28} />
                  <span className="visually-hidden">{social.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}

export type { PageId };
