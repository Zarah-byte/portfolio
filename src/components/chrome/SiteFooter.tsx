import { SOCIALS, RESUME_HREF, type Social } from "../../lib/site";
import { useNycClock } from "../../hooks/useNycClock";

// Design order, left to right — differs from the menu's ordering (site-footer.js).
const SOCIAL_ORDER: Social["id"][] = ["email", "github", "linkedin"];

export default function SiteFooter() {
  const { label, iso } = useNycClock();
  const socials = SOCIAL_ORDER.map((id) => SOCIALS.find((s) => s.id === id)!).filter(
    Boolean
  );

  return (
    <footer className="site-footer">
      <p className="site-footer__copy">&copy; 2026 Zarah Yaqub</p>
      <p className="site-footer__time">
        <time dateTime={iso}>{label}</time> NYC TIME
      </p>
      <div className="site-footer__end">
        <a
          className="site-footer__resume"
          href={RESUME_HREF}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor-magnetic
        >
          Résumé
        </a>
        <ul className="site-footer__socials">
          {socials.map((social) => (
            <li key={social.id}>
              <a
                className={`site-footer__social site-footer__social--${social.id}`}
                href={social.href}
                data-cursor-magnetic
                {...(social.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                <span className="visually-hidden">{social.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
