import { describe, it, expect } from "vitest";
import type { Root } from "mdast";
import { remarkSection } from "./remark-section";

/** Build a minimal mdast: two `##` sections, the first with a paragraph + a JSX node. */
function tree(): Root {
  return {
    type: "root",
    children: [
      { type: "heading", depth: 2, children: [{ type: "text", value: "The Challenge" }] },
      { type: "paragraph", children: [{ type: "text", value: "body a" }] },
      { type: "mdxJsxFlowElement", name: "Image", attributes: [], children: [] } as never,
      { type: "heading", depth: 2, children: [{ type: "text", value: "The Challenge" }] },
      { type: "paragraph", children: [{ type: "text", value: "body b" }] },
    ],
  };
}

describe("remarkSection", () => {
  it("wraps each ## and its following siblings into one <Section>", () => {
    const root = tree();
    remarkSection()(root);

    // Two headings → exactly two Section wrappers at the root.
    expect(root.children).toHaveLength(2);
    const [first, second] = root.children as unknown as {
      type: string;
      name: string;
      attributes: { name: string; value: string }[];
      children: unknown[];
    }[];

    expect(first.type).toBe("mdxJsxFlowElement");
    expect(first.name).toBe("Section");
    // The paragraph and the Image both moved inside the section (heading consumed).
    expect(first.children).toHaveLength(2);

    const title = first.attributes.find((a) => a.name === "title")?.value;
    const id = first.attributes.find((a) => a.name === "id")?.value;
    expect(title).toBe("The Challenge");
    expect(id).toBe("the-challenge");

    // Duplicate title gets a de-duped slug, matching the old section_id().
    const id2 = second.attributes.find((a) => a.name === "id")?.value;
    expect(id2).toBe("the-challenge-2");
  });
});
