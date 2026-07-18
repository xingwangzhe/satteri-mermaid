// @ts-check
import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import { mermaidMdast, mermaidHast } from "../dist/index.mjs";

export default defineConfig({
  site: "http://localhost:4321",
  markdown: {
    processor: satteri({
      mdastPlugins: [mermaidMdast()],
      hastPlugins: [
        mermaidHast({
          ssg: true,
          svgOptions: {
            bg: "var(--mermaid-bg, #161b22)",
            fg: "var(--mermaid-fg, #c9d1d9)",
            line: "var(--mermaid-line, #58a6ff)",
            accent: "var(--mermaid-accent, #58a6ff)",
            muted: "var(--mermaid-muted, #8b949e)",
            surface: "var(--mermaid-surface, #0d1117)",
            border: "var(--mermaid-border, #30363d)",
          },
        }),
      ],
    }),
  },
});
