import { Link } from "react-router-dom";
import { WORK } from "../../content/work/meta";
import { useHorizontalWheel } from "../../hooks/useHorizontalWheel";
import ProjectCard from "./ProjectCard";

/** Horizontal project rail + archive end-card. Wheel maps to sideways scroll. */
export default function WorkRail() {
  const railRef = useHorizontalWheel<HTMLUListElement>();
  return (
    <section className="work" id="work" aria-label="Selected work">
      <ul className="work-rail" data-home-rail ref={railRef}>
        {WORK.map((work) => (
          <ProjectCard work={work} key={work.slug} />
        ))}
        <li>
          <article className="card card--archive">
            <Link to="/play" className="card-link" data-cursor-label="View Archive">
              <div className="card-archive-mark" aria-hidden="true">
                <img src="/assets/icons/logo-star.svg" alt="" />
              </div>
              <div className="card-meta">
                <h2 className="card-title">Project Archive</h2>
                <p className="card-archive-note">Select snippets from 2023 to Present</p>
              </div>
            </Link>
          </article>
        </li>
      </ul>
    </section>
  );
}
