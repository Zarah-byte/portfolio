import { useEffect } from "react";

/**
 * Desktop-only flourish: a labelled illustration trails the cursor while a bold
 * phrase (`[data-hover-image]`) is hovered. Direct port of js/about-hover.js;
 * coarse pointers just get the bold black text.
 */
export function useAboutHover() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const targets = document.querySelectorAll<HTMLElement>(
      ".about-prose [data-hover-image]"
    );
    if (!targets.length) return;

    const LERP = 0.16;
    const OFFSET_X = 28;
    const OFFSET_Y = 28;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const media = document.createElement("img");
    media.className = "about-hover-media";
    media.alt = "";
    media.setAttribute("aria-hidden", "true");
    media.decoding = "async";
    document.body.append(media);

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let active = false;
    let placed = false;
    let rafId = 0;

    const render = () => {
      if (reducedMotion) {
        currentX = targetX;
        currentY = targetY;
      } else {
        currentX += (targetX - currentX) * LERP;
        currentY += (targetY - currentY) * LERP;
      }
      const scale = active ? 1 : 0.85;
      media.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${scale})`;
      rafId = requestAnimationFrame(render);
    };

    const moveTo = (event: PointerEvent) => {
      targetX = event.clientX + OFFSET_X;
      targetY = event.clientY + OFFSET_Y;
      if (!placed) {
        currentX = targetX;
        currentY = targetY;
        placed = true;
      }
    };

    const cleanups: (() => void)[] = [];
    targets.forEach((el) => {
      const onEnter = (event: PointerEvent) => {
        const src = el.getAttribute("data-hover-image");
        if (!src) return;
        if (media.getAttribute("src") !== src) media.src = src;
        active = true;
        placed = false;
        moveTo(event);
        media.classList.add("is-visible");
      };
      const onLeave = () => {
        active = false;
        media.classList.remove("is-visible");
      };
      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointermove", moveTo);
      el.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("pointermove", moveTo);
        el.removeEventListener("pointerleave", onLeave);
      });
    });

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      cleanups.forEach((fn) => fn());
      media.remove();
    };
  }, []);
}
