/** Shared site data — ported from js/site-base.js. */

export interface Social {
  id: "email" | "linkedin" | "github";
  label: string;
  href: string;
  icon: string;
  external: boolean;
}

export const SOCIALS: Social[] = [
  {
    id: "email",
    label: "Email",
    href: "mailto:zarahyaqubdesign@gmail.com",
    icon: "/assets/icons/email-rounded.svg",
    external: false,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/zarahbydesign",
    icon: "/assets/icons/linkedin-svgrepo-com 1.svg",
    external: true,
  },
  {
    id: "github",
    label: "GitHub",
    href: "https://github.com/Zarah-byte",
    icon: "/assets/icons/github-rounded-svgrepo-com 1.svg",
    external: true,
  },
];

export const RESUME_HREF = "/resume/Zarah_Yaqub_Resume.pdf";

/** Purple star wordmark path (from js/site-menu.js). */
export const STAR_PATH =
  "M35.4495 0.665413C35.7639 -0.223309 37.0207 -0.223306 37.3351 0.665416L44.0755 19.7221C44.2587 20.2403 44.8259 20.5134 45.3453 20.3336L64.447 13.7218C65.3378 13.4135 66.1214 14.3961 65.6226 15.196L54.926 32.3475C54.6352 32.8138 54.7753 33.4276 55.2397 33.7216L72.3187 44.5335C73.1151 45.0377 72.8355 46.263 71.8991 46.3717L51.8203 48.7026C51.2744 48.766 50.8819 49.2581 50.9416 49.8045L53.1371 69.8985C53.2395 70.8356 52.1071 71.3809 51.4383 70.7166L37.097 56.4717C36.707 56.0844 36.0776 56.0844 35.6876 56.4717L21.3463 70.7166C20.6775 71.3809 19.5451 70.8356 19.6475 69.8985L21.843 49.8045C21.9027 49.2581 21.5102 48.766 20.9642 48.7026L0.885511 46.3717C-0.0508766 46.263 -0.330547 45.0377 0.465945 44.5334L17.5449 33.7216C18.0093 33.4276 18.1494 32.8138 17.8586 32.3475L7.16203 15.196C6.66319 14.3961 7.44682 13.4135 8.33764 13.7218L27.4393 20.3336C27.9587 20.5134 28.5259 20.2403 28.7091 19.7221L35.4495 0.665413Z";
