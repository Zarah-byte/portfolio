import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import "../styles/play.css";
import Seo from "../components/Seo";
import { PLAY_ITEMS, sortItems } from "../content/play/manifest";
import PlayGrid from "../components/play/PlayGrid";
import PlayModal from "../components/play/PlayModal";

const DESC =
  "An archive of experiments, side projects, and visual studies by Zarah Yaqub.";

export default function Play() {
  const items = useMemo(() => sortItems(PLAY_ITEMS), []);
  const [index, setIndex] = useState<number | null>(null);

  const wrap = (i: number) => ((i % items.length) + items.length) % items.length;

  return (
    <main className="play-content">
      <Seo
        title="Zarah Yaqub | Project Archive"
        description={DESC}
        canonical="/play"
        ogImage="/content/play/Mirae.png"
      />
      <header className="play-intro">
        <h1 className="play-title">Project Archive</h1>
      </header>

      <PlayGrid items={items} onOpen={setIndex} />

      <AnimatePresence>
        {index !== null && (
          <PlayModal
            key="play-modal"
            items={items}
            index={index}
            onClose={() => setIndex(null)}
            onPrev={() => setIndex((i) => (i === null ? i : wrap(i - 1)))}
            onNext={() => setIndex((i) => (i === null ? i : wrap(i + 1)))}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
