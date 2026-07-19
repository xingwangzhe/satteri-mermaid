/**
 * Mermaid SVG 渲染器 — 基于 mermaid-rs (napi-rs)。
 * 在 Node.js 构建时（Astro SSG）使用，支持全部 23 种 mermaid 图类型。
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

interface NativeBinding {
  render: (code: string, opts?: Record<string, unknown>) => string;
}

let nativeBinding: NativeBinding | null = null;
let loadError: Error | null = null;

function getBinding(): NativeBinding {
  if (nativeBinding) return nativeBinding;
  try {
    // 使用绝对路径解析，避免在 Vite SSR 打包后 import.meta.url 变化导致找不到文件
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const indexPath = resolve(__dirname, "..", "index.cjs");
    const require = createRequire(import.meta.url);
    nativeBinding = require(indexPath) as NativeBinding;
    return nativeBinding;
  } catch (e) {
    loadError = e instanceof Error ? e : new Error(String(e));
    throw loadError;
  }
}

export function renderMermaidSVG(code: string, opts: Record<string, unknown>): string {
  const { render } = getBinding();
  return render(code.trim(), opts);
}
