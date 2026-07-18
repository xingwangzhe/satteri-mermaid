import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: () => "index.mjs",
    },
    rollupOptions: {
      external: [
        "satteri",
        "@mermanjs/web",
        /^@mermanjs\/web\/.*/,
        /^node:/,
        "fs",
        "path",
        "url",
        "module",
      ],
    },
  },
});
