import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { PlayItem } from "../../content/play/manifest";
import PlayMedia from "./PlayMedia";

const EASE = [0.22, 1, 0.36, 1] as const;

function hasCopy(item: PlayItem) {
  return Boolean(item.title || item.description || item.link);
}
function isExternal(href: string) {
  return /^https?:\/\//i.test(href) || href.startsWith("//");
}

/**
 * Play detail modal. Framer Motion drives the enter/exit (backdrop fade + dialog
 * scale) and the per-item copy/media swap; behaviour (focus trap, Esc, arrows,
 * backdrop close, scroll lock) is ported from js/play-gallery.js.
 */
export default function PlayModal({
  items,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  items: PlayItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const reduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const item = items[index];
  const showNav = items.length > 1;
  const showCopy = hasCopy(item);
  const dur = reduce ? 0 : undefined;

  // Scroll lock + focus management for the modal's lifetime.
  useEffect(() => {
    restoreFocus.current = document.activeElement as HTMLElement | null;
    document.body.classList.add("play-modal-open");
    dialogRef.current?.focus();
    return () => {
      document.body.classList.remove("play-modal-open");
      restoreFocus.current?.focus?.();
    };
  }, []);

  // Keyboard: Esc closes, arrows navigate, Tab is trapped within the modal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const root = rootRef.current;
        if (!root) return;
        const focusable = [
          ...root.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), video[controls]'
          ),
        ].filter((el) => !el.hidden && el.getAttribute("aria-hidden") !== "true");
        if (focusable.length === 0) {
          e.preventDefault();
          dialogRef.current?.focus();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || !root.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !root.contains(active))) {
          e.preventDefault();
          first.focus();
        }
        return;
      }
      if (items.length <= 1) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [items.length, onClose, onPrev, onNext]);

  return (
    <motion.div
      className="play-modal"
      ref={rootRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: dur ?? 0.25, ease: EASE }}
    >
      <motion.button
        type="button"
        className="play-modal__backdrop"
        aria-label="Close"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: dur ?? 0.5, ease: EASE }}
      />

      {showNav && (
        <>
          <button
            type="button"
            className="play-modal__nav play-modal__nav--prev"
            aria-label="Previous project"
            onClick={onPrev}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            className="play-modal__nav play-modal__nav--next"
            aria-label="Next project"
            onClick={onNext}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </>
      )}

      <motion.div
        className={`play-modal__dialog${showCopy ? "" : " play-modal__dialog--media-only"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="play-modal-title"
        tabIndex={-1}
        ref={dialogRef}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: dur ?? 0.35, ease: EASE }}
      >
        <button type="button" className="play-modal__close" aria-label="Close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="play-modal__layout">
          <motion.div
            className="play-modal__media"
            key={`media-${item.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: dur ?? 0.2, ease: EASE }}
          >
            <PlayMedia item={item} modal />
          </motion.div>

          {showCopy && (
            <motion.div
              className="play-modal__copy"
              key={`copy-${item.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: dur ?? 0.25, ease: EASE, delay: reduce ? 0 : 0.12 }}
            >
              {item.title && (
                <h2 className="play-modal__title" id="play-modal-title">
                  {item.title}
                </h2>
              )}
              {item.description && <div className="play-modal__desc">{item.description}</div>}
              {item.link && (
                <a
                  className="play-modal__link"
                  href={item.link}
                  {...(isExternal(item.link)
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <span className="play-modal__link-text">{item.linkLabel || "See it live"}</span>
                  <svg className="play-modal__link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path d="M7 17 17 7" />
                    <path d="M8 7h9v9" />
                  </svg>
                </a>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
