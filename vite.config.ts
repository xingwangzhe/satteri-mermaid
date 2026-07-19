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
        /^node:/,
        // 原生 .node 加载由 renderer.ts 运行时 createRequire 处理
        "../index.cjs",
      ],
    },
  },
});
