import { useEffect } from "react";

/**
 * Custom cursor + magnetic pull. Direct port of js/cursor.js: one document-level
 * mousemove listener classifies whatever is under the pointer via `closest()`
 * and eases the dot toward the centre of any `[data-cursor-magnetic]` element.
 * Keeping the attribute-scan (rather than per-element refs) means the effect is
 * self-contained and works for any element that opts in with the data attribute.
 */
export default function Cursor() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const INTERACTIVE =
      'a, button, [role="button"], input, textarea, select, label, ' +
      ".card-link, .play-card, [data-cursor]";
    const CARD_SELECTOR = ".card-link, .play-card";
    const ICON_SELECTOR = ".site-menu__toggle, .site-menu__social";

    const LERP = 0.18;
    const MAGNET_STRENGTH = 0.35;
    const VARIANT_CLASSES = ["cursor--link", "cursor--icon", "cursor--card"];
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const cursor = document.createElement("div");
    cursor.className = "cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.innerHTML =
      '<div class="cursor-inner">' +
      '<span class="cursor-label" aria-hidden="true">View Project</span>' +
      '<svg class="cursor-arrow" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M4 12h16"/><path d="M14 6l6 6-6 6"/></svg></div>';

    document.body.append(cursor);
    document.body.classList.add("has-custom-cursor");

    const labelEl = cursor.querySelector<HTMLElement>(".cursor-label");
    const DEFAULT_CARD_LABEL = "View Project";

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let visible = false;
    let currentVariant = "";
    let rafId = 0;

    const setPosition = (x: number, y: number) => {
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    const tick = () => {
      if (reducedMotion) {
        currentX = targetX;
        currentY = targetY;
      } else {
        currentX += (targetX - currentX) * LERP;
        currentY += (targetY - currentY) * LERP;
      }
      setPosition(currentX, currentY);
      rafId = requestAnimationFrame(tick);
    };

    const show = () => {
      if (visible) return;
      visible = true;
      cursor.classList.add("is-visible");
    };
    const hide = () => {
      visible = false;
      cursor.classList.remove("is-visible");
    };

    const setVariant = (variant: string) => {
      if (variant === currentVariant) return;
      currentVariant = variant;
      cursor.classList.remove(...VARIANT_CLASSES);
      if (variant) cursor.classList.add("cursor--" + variant);
    };

    const classify = (el: HTMLElement) => {
      if (el.dataset.cursor) return el.dataset.cursor;
      if (el.matches(CARD_SELECTOR)) return "card";
      if (el.matches(ICON_SELECTOR)) return "icon";
      return "link";
    };

    const onMove = (event: MouseEvent) => {
      const el = event.target as HTMLElement | null;
      const target = el?.closest?.(INTERACTIVE) as HTMLElement | null;
      const variant = target ? classify(target) : "";
      setVariant(variant);

      if (variant === "card" && labelEl && target) {
        labelEl.innerHTML =
          target.getAttribute("data-cursor-label") || DEFAULT_CARD_LABEL;
      }

      let x = event.clientX;
      let y = event.clientY;
      if (target && !reducedMotion) {
        const magnet = target.closest("[data-cursor-magnetic]") as HTMLElement | null;
        if (magnet) {
          const rect = magnet.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          x += (cx - x) * MAGNET_STRENGTH;
          y += (cy - y) * MAGNET_STRENGTH;
        }
      }
      targetX = x;
      targetY = y;
      show();
    };

    const onDown = () => cursor.classList.add("is-pressed");
    const onUp = () => cursor.classList.remove("is-pressed");

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", hide);
    document.addEventListener("mouseenter", show);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", onUp);

    setPosition(currentX, currentY);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", hide);
      document.removeEventListener("mouseenter", show);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      cursor.remove();
      document.body.classList.remove("has-custom-cursor");
    };
  }, []);

  return null;
}
