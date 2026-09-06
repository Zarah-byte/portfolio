import type { PlayItem } from "../../content/play/manifest";
import PlayMedia from "./PlayMedia";

/** Square responsive archive grid. Port of buildGallery() in play-gallery.js. */
export default function PlayGrid({
  items,
  onOpen,
}: {
  items: PlayItem[];
  onOpen: (index: number) => void;
}) {
  return (
    <div className="play-gallery" id="play-gallery">
      {items.map((item, index) => (
        <button
          type="button"
          className={`play-card${item.type === "video" ? " play-card--video" : ""}`}
          aria-label={item.title || item.id}
          data-play-id={item.id}
          key={item.id}
          onClick={() => onOpen(index)}
        >
          <div className="play-card__media">
            <PlayMedia item={item} />
          </div>
          <div className="play-card__caption">
            <span className="play-card__label">{item.title || item.id}</span>
            {item.tag && <span className="play-card__tag">{item.tag}</span>}
          </div>
        </button>
      ))}
    </div>
  );
}
