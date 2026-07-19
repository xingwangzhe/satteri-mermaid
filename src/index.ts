// ── 底层渲染器（高级用户可直接使用）──────────────────────────────
export { renderMermaidSVG } from "./renderer";

// ── 插件 ──────────────────────────────────────────────────────────
export {
  createMermaidMdastPlugin,
  createMermaidHastPlugin,
  mermaidMdast,
  mermaidHast,
  // 兼容导出
  createMermaidMdastPlugin as createMermaidPlugin,
  mermaid,
  mermaidPlugin,
  popFlags,
} from "./plugin";

export type { MermaidFlags, MermaidPluginOptions, ThemeOverrides, ThemePreset } from "./plugin";
