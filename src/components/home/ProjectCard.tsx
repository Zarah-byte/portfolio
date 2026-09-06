import { Link } from "react-router-dom";
import type { WorkMeta } from "../../content/work/meta";

/** Portrait rail unit — full-bleed media + overlay meta. From index.html cards. */
export default function ProjectCard({ work }: { work: WorkMeta }) {
  const { slug, home } = work;
  return (
    <li>
      <article className={`card card--${home.theme}`}>
        <Link to={`/projects/${slug}`} className="card-link">
          <figure className="card-media">
            <img
              src={home.cover}
              alt={home.alt}
              className="card-img"
              width={home.width}
              height={home.height}
            />
            <figcaption className="card-role">{home.role}</figcaption>
          </figure>
          <div className="card-meta">
            <h2 className="card-title">{home.title}</h2>
            <p className="card-desc">{home.desc}</p>
            <ul className="tags">
              {home.tags.map((tag) => (
                <li className="tag" key={tag}>
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </Link>
      </article>
    </li>
  );
}
