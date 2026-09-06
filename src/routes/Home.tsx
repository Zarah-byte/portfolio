import "../styles/home.css";
import Seo from "../components/Seo";
import WorkRail from "../components/home/WorkRail";

const DESC =
  "Selected work by Zarah Yaqub, a brand and product designer in New York City working at the intersection of intention and interfaces.";

export default function Home() {
  return (
    <main className="home-body">
      <Seo
        title="Zarah Yaqub | Work"
        description={DESC}
        canonical="/"
        ogImage="/assets/media/covers/iris-cover.png"
      />
      <h1 className="visually-hidden">Zarah Yaqub: Selected Work</h1>

      <section className="home-intro" aria-label="Introduction">
        <p className="hero-status">
          <span className="hero-status__dot" aria-hidden="true" />
          Looking for Fall 2026 opportunities
        </p>
        <p className="hero-line hero-line--lead">
          I'm Zarah a <strong>brand</strong> and <strong>product designer</strong>
        </p>
        <p className="hero-line hero-line--sub">
          working at the intersection of <strong>intention &amp; interfaces</strong>,
          from branding to screens. Based in NYC.
        </p>
      </section>

      <WorkRail />
    </main>
  );
}
