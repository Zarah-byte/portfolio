import type { CSSProperties, ReactNode } from "react";
import "../styles/about.css";
import Seo from "../components/Seo";
import { useAboutHover } from "../hooks/useAboutHover";

const DESC =
  "Zarah Yaqub is a brand and product designer in New York City. Parsons MPS Communication Design, 2026. Branding, product design, and visual systems.";

/** Bold phrase that reveals a trailing illustration on hover (about-hover.js). */
function H({ img, children }: { img: string; children: ReactNode }) {
  return <strong data-hover-image={img}>{children}</strong>;
}

const stackIcon = (file: string): CSSProperties =>
  ({ "--icon": `url('/assets/icons/stack/${file}')` } as CSSProperties);

export default function About() {
  useAboutHover();

  return (
    <main className="about-content">
      <Seo
        title="Zarah Yaqub | About"
        description={DESC}
        canonical="/about"
        ogImage="/assets/media/about/portrait.jpg"
        ogType="profile"
      />
      <div className="about-column">
        <h1 className="about-title visually-hidden">About</h1>

        <figure className="about-figure">
          <img
            className="about-photo"
            src="/assets/media/about/portrait.jpg?v=732b"
            alt="Portrait of Zarah Yaqub"
            width={732}
            height={467}
          />
        </figure>

        <div className="about-prose">
          <p>
            Hi there, I'm Zarah, a brand and product designer passionate about
            building inclusive, human-centered work. Originally from{" "}
            <H img="/assets/media/about/karachi-pakistan.jpg">Karachi, Pakistan</H>, I
            now call <H img="/assets/media/about/new-york-city.jpg">New York City</H>{" "}
            home.
          </p>

          <p>
            My practice spans branding, product design, and visual systems, from
            identity and packaging to interfaces and digital experiences. I'm drawn to
            work that sits at the intersection of culture, accessibility, and craft, and
            I care deeply about designing for people who are often left out of the
            conversation.
          </p>

          <p>
            I recently completed my{" "}
            <H img="/assets/media/about/mps-communication-design.jpg">
              MPS Communication Design
            </H>{" "}
            degree from{" "}
            <H img="/assets/media/about/parsons.jpg">The Parsons School of Design</H>{" "}
            (Class of 2026), building on a BA (Hons) in Communication &amp; Design from
            Habib University (Class of 2025). Recent recognition includes first place at
            the Designpreneurs Hackathon 2026 and participation in FigBuild 2026.
          </p>

          <p>
            Outside of design you can find me{" "}
            <H img="/assets/media/about/pop-up-hopping.jpg">pop-up hopping</H> across New
            York, <H img="/assets/media/about/crafting.jpg">crafting</H> or curled up on
            my couch{" "}
            <H img="/assets/media/about/binging-tv-shows.jpg">binging TV shows</H>.
          </p>

          <div className="about-contact">
            <p className="about-contact__lead">
              Want to work together, say hey, or just talk design?
            </p>
            <ul className="about-contact__links">
              <li>
                <a
                  className="about-contact__link about-contact__link--email"
                  href="mailto:zarahyaqubdesign@gmail.com"
                >
                  Email
                </a>
              </li>
              <li>
                <a
                  className="about-contact__link about-contact__link--github"
                  href="https://github.com/Zarah-byte"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  className="about-contact__link about-contact__link--linkedin"
                  href="https://www.linkedin.com/in/zarahbydesign"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <section className="about-section about-experience">
          <h2 className="about-section__heading">Experience</h2>
          <ul className="experience-list">
            {[
              {
                role: "Freelance Designer",
                dates: "2025 – Present",
                summary:
                  "Design systems, brand language, and social assets for clients including Strata G Consulting Group and Shado.",
              },
              {
                role: "User Experience Consultant, Teesquare",
                dates: "Dec 2022 – Mar 2023",
                summary:
                  "Led user testing and resolved UX/UI issues to improve app performance and accessibility across devices.",
              },
              {
                role: "Social Media Manager, Sanam Jung",
                dates: "Jun 2022 – Dec 2022",
                summary:
                  "Managed and grew Sanam Jung’s presence across Instagram, YouTube, and Wikipedia, and produced showreel and portfolio content.",
              },
              {
                role: "Intern, Teesquare",
                dates: "Jun 2018 – Aug 2018",
                summary:
                  "Created early-literacy digital content and consulted on the design and user experience of Team Taleem.",
              },
            ].map((item) => (
              <li className="experience-item" key={item.role}>
                <div className="experience-item__head">
                  <h3 className="experience-item__role">{item.role}</h3>
                  <span className="experience-item__dates">{item.dates}</span>
                </div>
                <p className="experience-item__summary">{item.summary}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="about-section about-awards">
          <h2 className="about-section__heading">Awards &amp; Competitions</h2>
          <ul className="awards-list">
            <li className="award-item">
              <div className="award-item__head">
                <h3 className="award-item__name">Designpreneurs Hackathon</h3>
                <span className="award-item__result">1st Place</span>
              </div>
            </li>
            <li className="award-item">
              <div className="award-item__head">
                <h3 className="award-item__name">FigBuild 2026</h3>
                <span className="award-item__result">Participant</span>
              </div>
            </li>
          </ul>
          <p className="about-resume">
            <a href="/resume/Zarah_Yaqub_Resume.pdf" target="_blank" rel="noopener noreferrer">
              Download my Resume
              <img
                className="about-resume__icon"
                src="/assets/icons/arrow-up-right-light.svg"
                alt=""
                width={24}
                height={24}
                aria-hidden="true"
              />
            </a>
          </p>
        </section>

        <section className="about-section about-approach">
          <h2 className="about-section__heading">Approach</h2>
          <div className="about-approach__body">
            <p>
              I design for the people usually left out of the conversation — starting
              from culture, accessibility, and real context rather than a template. My
              work moves between brand and product, and I care most about systems that
              stay coherent and humane as they scale.
            </p>
            <p>
              I like to work fast and concretely: prototyping early, testing with real
              people, and treating AI as a collaborator to explore more directions than
              I could alone — while keeping the craft, and the judgment, my own.
            </p>
          </div>
        </section>

        <section className="about-section about-stack">
          <h2 className="about-section__heading">Stack</h2>
          <div className="stack-groups">
            <div className="stack-group">
              <p className="stack-group__label">AI &amp; Generative</p>
              <ul className="stack-list">
                <li className="stack-item"><span className="stack-icon" style={stackIcon("claude.svg")} aria-hidden="true" />Claude Code</li>
                <li className="stack-item"><span className="stack-icon" style={stackIcon("cursor.svg")} aria-hidden="true" />Cursor</li>
                <li className="stack-item"><span className="stack-icon" style={stackIcon("sparkle.svg")} aria-hidden="true" />Kling AI</li>
                <li className="stack-item"><span className="stack-icon" style={stackIcon("chatgpt.svg")} aria-hidden="true" />ChatGPT</li>
                <li className="stack-item"><span className="stack-icon" style={stackIcon("gemini.svg")} aria-hidden="true" />Gemini</li>
                <li className="stack-item"><span className="stack-icon" style={stackIcon("sparkle.svg")} aria-hidden="true" />Midjourney</li>
              </ul>
            </div>
            <div className="stack-group">
              <p className="stack-group__label">Design</p>
              <ul className="stack-list">
                <li className="stack-item"><span className="stack-icon" style={stackIcon("figma.svg")} aria-hidden="true" />Figma</li>
                <li className="stack-item"><span className="stack-icon" style={stackIcon("adobe.svg")} aria-hidden="true" />Adobe Creative Suite</li>
                <li className="stack-item"><span className="stack-icon" style={stackIcon("framer.svg")} aria-hidden="true" />Framer</li>
                <li className="stack-item"><span className="stack-icon" style={stackIcon("blender.svg")} aria-hidden="true" />Blender</li>
              </ul>
            </div>
            <div className="stack-group">
              <p className="stack-group__label">Development</p>
              <ul className="stack-list">
                <li className="stack-item"><span className="stack-icon" style={stackIcon("html.svg")} aria-hidden="true" />HTML</li>
                <li className="stack-item"><span className="stack-icon" style={stackIcon("css.svg")} aria-hidden="true" />CSS</li>
                <li className="stack-item"><span className="stack-icon" style={stackIcon("javascript.svg")} aria-hidden="true" />JavaScript</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="about-section about-meta">
          <h2 className="about-meta__heading">About this Site</h2>
          <div className="about-meta__body">
            <p>Site design: Zarah Yaqub</p>
            <p>Site dev: Zarah Yaqub, Claude Code, Cursor AI</p>
            <p>Typography: General Sans, Fira Code</p>
          </div>
        </section>
      </div>
    </main>
  );
}
