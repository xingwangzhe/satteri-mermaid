// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
// 直接使用本地构建产物测试，不通过 npm
import { mermaidMdast, mermaidHast } from "../dist/index.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  integrations: [mdx(), sitemap()],
  vite: {
    server: {
      fs: { allow: ["../.."] },
    },
  },
  markdown: {
    processor: satteri({
      mdastPlugins: [
        mermaidMdast({
          langs: ["mermaid", "mmd"],
        }),
      ],
      hastPlugins: [
        mermaidHast({
          ssg: true,
          responsive: true,
          theme: "modern",
        }),
      ],
    }),
  },
});
