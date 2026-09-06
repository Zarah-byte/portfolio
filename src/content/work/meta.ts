/**
 * Work registry — the home rail and case-study "More Projects" both read this.
 * Card copy/dimensions come from the old index.html cards; `eyebrow`/`tagline`/
 * `relatedCover` mirror the frontmatter fields the old related-cards used.
 *
 * The array is in HOME RAIL order (iris, tasks, micdrop, nura). Related cards
 * sort a copy by `order` (the frontmatter order), matching load_all_projects().
 */
export interface WorkMeta {
  slug: string;
  order: number;
  eyebrow: string;
  tagline: string;
  relatedCover: string;
  home: {
    cover: string;
    width: number;
    height: number;
    alt: string;
    role: string;
    title: string;
    desc: string;
    tags: string[];
    theme: "dark" | "light";
    priority?: boolean;
  };
}

export const WORK: WorkMeta[] = [
  {
    slug: "iris",
    order: 1,
    eyebrow: "Iris",
    tagline: "Creating wearable intelligence in 24 hours",
    relatedCover: "/assets/media/covers/iris-cover.png",
    home: {
      cover: "/assets/media/covers/iris-cover.png",
      width: 1236,
      height: 1764,
      alt: "Iris: smart glasses with AR interface overlays",
      role: "AR / Product Design",
      title: "Iris",
      desc: "AR smart glasses that surface context hands-free.",
      tags: ["2026", "Competition Winner", "AI"],
      theme: "dark",
      priority: true,
    },
  },
  {
    slug: "tasks",
    order: 4,
    eyebrow: "Google Tasks",
    tagline: "Bringing flexible organization to Google Tasks",
    relatedCover: "/assets/media/covers/tasks-cover.png",
    home: {
      cover: "/assets/media/covers/tasks-cover.png",
      width: 1236,
      height: 1764,
      alt: "Google Tasks: phone showing Welcome to Tasks onboarding",
      role: "UI Systems",
      title: "Google Tasks",
      desc: "Flexible organization brought to Google Tasks.",
      tags: ["2025", "Feature"],
      theme: "dark",
    },
  },
  {
    slug: "micdrop",
    order: 3,
    eyebrow: "Micdrop Mag",
    tagline: "A celebration of South Asian music and culture",
    relatedCover: "/assets/media/covers/micdrop-cover.png",
    home: {
      cover: "/assets/media/covers/micdrop-cover.png",
      width: 1236,
      height: 1764,
      alt: "Micdrop Magazine cover wrapped in plastic",
      role: "Editorial Design",
      title: "Micdrop",
      desc: "A print magazine celebrating South Asian music.",
      tags: ["2026", "Print"],
      theme: "dark",
    },
  },
  {
    slug: "nura",
    order: 2,
    eyebrow: "Nura",
    tagline: "Designing to ease the burden of dementia caregiving",
    relatedCover: "/assets/media/covers/nura-cover-landscape.jpg",
    home: {
      cover: "/assets/media/covers/nura-cover.png",
      width: 2139,
      height: 1764,
      alt: "Nura: caregiving app phone mockups",
      role: "Product Design",
      title: "Nura",
      desc: "Easing the burden of dementia caregiving.",
      tags: ["2025", "Healthcare"],
      theme: "dark",
    },
  },
];

/** Up to 3 related projects for a case study, in frontmatter order. */
export function relatedTo(slug: string): WorkMeta[] {
  return [...WORK]
    .sort((a, b) => a.order - b.order)
    .filter((w) => w.slug !== slug)
    .slice(0, 3);
}
