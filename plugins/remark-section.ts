/**
 * remark-section — wrap every `## Heading` and the content that follows it
 * (until the next `##`) into a `<Section id title>` MDX element.
 *
 * The runtime <Section> component owns the body/bleed grouping; this plugin
 * only needs to draw reliable section boundaries, which `##` headings give us
 * unambiguously (no blank-line sensitivity). Mirrors split_sections() +
 * section_id() in the old scripts/build-work-pages.py.
 */
import type { Root, RootContent, Heading } from "mdast";

interface MdxJsxAttribute {
  type: "mdxJsxAttribute";
  name: string;
  value: string;
}
interface MdxJsxFlowElement {
  type: "mdxJsxFlowElement";
  name: string;
  attributes: MdxJsxAttribute[];
  children: RootContent[];
}

function headingText(node: Heading): string {
  return node.children
    .map((c) => ("value" in c ? c.value : ""))
    .join("")
    .trim();
}

/** Anchor slug for the sticky nav; de-duped like the old section_id(). */
function slugify(title: string, seen: Set<string>): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!base) return "";
  let slug = base;
  let n = 2;
  while (seen.has(slug)) slug = `${base}-${n++}`;
  seen.add(slug);
  return slug;
}

function section(
  id: string,
  title: string,
  children: RootContent[]
): MdxJsxFlowElement {
  const attributes: MdxJsxAttribute[] = [
    { type: "mdxJsxAttribute", name: "title", value: title },
  ];
  if (id) attributes.unshift({ type: "mdxJsxAttribute", name: "id", value: id });
  return { type: "mdxJsxFlowElement", name: "Section", attributes, children };
}

export function remarkSection() {
  return (tree: Root) => {
    const out: RootContent[] = [];
    const seen = new Set<string>();
    let current: MdxJsxFlowElement | null = null;

    for (const node of tree.children) {
      if (node.type === "heading" && node.depth === 2) {
        const title = headingText(node);
        current = section(slugify(title, seen), title, []);
        out.push(current as unknown as RootContent);
        continue;
      }
      if (current) current.children.push(node);
      else out.push(node); // anything before the first ## stays at the root
    }

    tree.children = out;
  };
}
