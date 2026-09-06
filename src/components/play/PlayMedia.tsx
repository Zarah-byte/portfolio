import type { PlayItem } from "../../content/play/manifest";

/** Renders an archive item's media for either a grid card or the modal.
 * Port of createMediaElement() in js/play-gallery.js. */
export default function PlayMedia({
  item,
  modal = false,
}: {
  item: PlayItem;
  modal?: boolean;
}) {
  const src = modal ? item.modalSrc || item.src : item.src;

  if (item.type === "image") {
    return (
      <img
        className={modal ? "play-modal__img" : "play-card__img"}
        src={src}
        alt={item.alt || item.title || ""}
        loading="lazy"
        decoding="async"
      />
    );
  }

  if (item.type === "video") {
    if (item.kind === "embed") {
      return (
        <iframe
          className={modal ? "play-modal__embed" : "play-card__embed"}
          src={src}
          allow={
            modal
              ? "fullscreen; picture-in-picture"
              : "autoplay; fullscreen; picture-in-picture"
          }
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
          title={item.title || item.id}
        />
      );
    }
    return (
      <video
        className={modal ? "play-modal__video" : undefined}
        src={src}
        muted
        playsInline
        preload="metadata"
        autoPlay
        {...(modal ? { controls: true } : { loop: true })}
      />
    );
  }

  return <div className="play-card__placeholder" aria-hidden="true" />;
}
