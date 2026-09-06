/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { remarkSection } from "./plugins/remark-section";

export default defineConfig({
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [
          remarkFrontmatter,
          [remarkMdxFrontmatter, { name: "frontmatter" }],
          remarkSection,
        ],
      }),
    },
    react({ include: /\.(jsx|tsx|mdx)$/ }),
  ],
  test: {
    environment: "node",
    include: ["plugins/**/*.test.ts"],
  },
});
