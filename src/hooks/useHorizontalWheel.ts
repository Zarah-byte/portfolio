import { useEffect, useRef } from "react";

/**
 * Map vertical wheel input to sideways scroll on the home rail. Port of
 * js/home-gallery.js — releases to normal page scroll at the rail's edges and
 * respects prefers-reduced-motion. Returns a ref to attach to the rail element.
 */
export function useHorizontalWheel<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const rail = ref.current;
    if (!rail) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const atStart = () => rail.scrollLeft <= 1;
    const atEnd = () =>
      rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 1;
    const hasOverflow = () => rail.scrollWidth > rail.clientWidth + 1;

    const onWheel = (event: WheelEvent) => {
      if (prefersReducedMotion.matches || !hasOverflow()) return;
      const dominantY = Math.abs(event.deltaY) >= Math.abs(event.deltaX);
      if (!dominantY || event.deltaY === 0) return;
      const scrollingDown = event.deltaY > 0;
      const scrollingUp = event.deltaY < 0;
      if ((scrollingDown && atEnd()) || (scrollingUp && atStart())) return;
      event.preventDefault();
      rail.scrollLeft += event.deltaY;
    };

    rail.addEventListener("wheel", onWheel, { passive: false });
    return () => rail.removeEventListener("wheel", onWheel);
  }, []);

  return ref;
}
