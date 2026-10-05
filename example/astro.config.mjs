import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  vite: {
    ssr: { external: ["satteri", "@xingwangzhe/satteri-mermaid"] },
    build: { rolldownOptions: { external: ["satteri", "@xingwangzhe/satteri-mermaid"] } },
  },
});
