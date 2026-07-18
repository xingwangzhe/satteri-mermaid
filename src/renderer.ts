/**
 * Mermaid SVG 渲染器 — 基于 @mermanjs/web (Rust WASM)。
 * 在 Node.js 构建时（Astro SSG）使用，支持全部 24 种 mermaid 图类型。
 */
import { initMerman, renderSvg, isMermanInitialized } from "@mermanjs/web";
import { existsSync, readFileSync } from "node:fs";

let initPromise: Promise<void> | null = null;

function findWasm(): string {
  let dir = process.cwd();
  for (let i = 0; i < 20; i++) {
    const p = dir + "/node_modules/@mermanjs/web/pkg/merman_wasm_bg.wasm";
    if (existsSync(p)) return p;
    const sep = dir.lastIndexOf("/");
    if (sep <= 0) break;
    dir = dir.slice(0, sep);
  }
  throw new Error("Cannot find @mermanjs/web WASM");
}

async function doInit(): Promise<void> {
  const wasmPath = findWasm();
  const wasmBytes = readFileSync(wasmPath);
  const wasmModule = await WebAssembly.compile(wasmBytes);

  await initMerman({
    loader: async () =>
      (await import("@mermanjs/web/pkg/merman_wasm.js")) as any,
    wasm: wasmModule,
  } as any);
}

function ensureInit(): Promise<void> {
  if (isMermanInitialized()) return Promise.resolve();
  if (!initPromise) initPromise = doInit();
  return initPromise;
}

let initialized = false;
let initError: Error | null = null;

export async function initRenderer(): Promise<void> {
  try {
    await ensureInit();
    initialized = true;
  } catch (e) {
    initError = e instanceof Error ? e : new Error(String(e));
    throw initError;
  }
}

export function renderMermaidSVG(code: string, optionsJson: string): string {
  if (!initialized) {
    if (initError) throw initError;
    throw new Error("merman WASM not initialized");
  }
  return renderSvg(code.trim(), optionsJson);
}
