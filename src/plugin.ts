import { defineMdastPlugin, defineHastPlugin } from "satteri";
import type { HastVisitorContext, MdastPluginDefinition, HastPluginDefinition } from "satteri";
import { renderMermaidSVG } from "./renderer";

const DATA_KEY = "__satteri_mermaid_codes";

// ── 类型 ──────────────────────────────────────────────────────────

export interface MermaidFlags {
  hasMermaid: boolean;
}

/** mermaid-rs 主题预设 */
export type ThemePreset = "modern" | "dark" | "default" | "forest" | "neutral";

/** 逐色覆盖项（映射到 mermaid-rs Theme 字段） */
export interface ThemeOverrides {
  // 排版
  fontFamily?: string;
  fontSize?: number;

  // 节点 & 连线
  primaryColor?: string;
  primaryBorderColor?: string;
  primaryTextColor?: string;
  lineColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  textColor?: string;
  edgeLabelBackground?: string;

  // 画布
  background?: string;

  // 子图 / Cluster
  clusterBackground?: string;
  clusterBorder?: string;

  // 时序图
  sequenceActorFill?: string;
  sequenceActorBorder?: string;
  sequenceActorLine?: string;
  sequenceNoteFill?: string;
  sequenceNoteBorder?: string;
  sequenceActivationFill?: string;
  sequenceActivationBorder?: string;

  // Git 图 — 主色 (8 slots)
  git0?: string;
  git1?: string;
  git2?: string;
  git3?: string;
  git4?: string;
  git5?: string;
  git6?: string;
  git7?: string;
  // Git 图 — 反色 (8 slots)
  gitInv0?: string;
  gitInv1?: string;
  gitInv2?: string;
  gitInv3?: string;
  gitInv4?: string;
  gitInv5?: string;
  gitInv6?: string;
  gitInv7?: string;
  // Git 图 — 分支标签颜色 (8 slots)
  gitBranchLabel0?: string;
  gitBranchLabel1?: string;
  gitBranchLabel2?: string;
  gitBranchLabel3?: string;
  gitBranchLabel4?: string;
  gitBranchLabel5?: string;
  gitBranchLabel6?: string;
  gitBranchLabel7?: string;
  // Git 图 — 提交/标签
  gitCommitLabelColor?: string;
  gitCommitLabelBackground?: string;
  gitTagLabelColor?: string;
  gitTagLabelBackground?: string;
  gitTagLabelBorder?: string;

  // 饼图 — 12 色板
  pie1?: string;
  pie2?: string;
  pie3?: string;
  pie4?: string;
  pie5?: string;
  pie6?: string;
  pie7?: string;
  pie8?: string;
  pie9?: string;
  pie10?: string;
  pie11?: string;
  pie12?: string;
  // 饼图 — 样式
  pieTitleTextSize?: number;
  pieTitleTextColor?: string;
  pieSectionTextSize?: number;
  pieSectionTextColor?: string;
  pieLegendTextSize?: number;
  pieLegendTextColor?: string;
  pieStrokeColor?: string;
  pieStrokeWidth?: number;
  pieOuterStrokeWidth?: number;
  pieOuterStrokeColor?: string;
  pieOpacity?: number;
}

export interface MermaidPluginOptions {
  /** 要匹配的代码块语言标识，默认 ["mermaid"] */
  langs?: string[];

  /** SVG 自适应容器宽度，默认 true */
  responsive?: boolean;

  /**
   * SSG 模式：
   * - true（默认）：构建时渲染为内联 SVG
   * - false：保留原始代码块，交由客户端 mermaid.js 渲染
   */
  ssg?: boolean;

  /** 主题预设，默认 "modern" */
  theme?: ThemePreset;

  /** 逐色覆盖预设中的颜色（支持 CSS 变量） */
  themeOverrides?: ThemeOverrides;

  // ── 排版 ────────────────────────────────────────────────────
  /** 字体族 */
  font?: string;
  /** 字号 (px) */
  fontSize?: number;

  // ── 布局 ────────────────────────────────────────────────────
  /** 节点垂直间距 (px) */
  nodeSpacing?: number;
  /** 层级水平间距 (px) */
  rankSpacing?: number;
  /** 首选宽高比（如 1.778 = 16:9） */
  preferredAspectRatio?: number;

  // ── 渲染 ────────────────────────────────────────────────────
  /** 使用快速文本宽度估算（牺牲精度换速度） */
  fastTextMetrics?: boolean;
}

// ── MDAST Plugin ──────────────────────────────────────────────────

export function createMermaidMdastPlugin(options?: MermaidPluginOptions): {
  plugin: MdastPluginDefinition;
  popFlags: () => MermaidFlags;
} {
  const langs = options?.langs ?? ["mermaid"];

  let hasMermaid = false;
  let lastFlags: MermaidFlags | null = null;
  let counter = 0;

  const reset = () => {
    hasMermaid = false;
  };
  const flush = () => {
    lastFlags = { hasMermaid };
  };

  const plugin = defineMdastPlugin({
    name: "satteri-mermaid-mdast",

    yaml() {
      reset();
      flush();
    },

    code(node, ctx) {
      if (langs.includes(node.lang ?? "")) {
        hasMermaid = true;
        flush();
        const id = `mermaid-${counter++}`;
        if (ctx.data) {
          const bag = ctx.data[DATA_KEY] as Record<string, string> | undefined;
          if (bag) {
            bag[id] = node.value;
          } else {
            ctx.data[DATA_KEY] = { [id]: node.value };
          }
        }
        return {
          rawHtml: `<pre class="mermaid" data-mermaid-id="${id}"></pre>`,
        };
      }
      flush();
    },

    heading() { flush(); },
    paragraph() { flush(); },
    blockquote() { flush(); },
    list() { flush(); },
    table() { flush(); },
    html() { flush(); },
    thematicBreak() { flush(); },
    math() { flush(); },
    inlineMath() { flush(); },
    image() { flush(); },
    imageReference() { flush(); },
  });

  const popFlags = (): MermaidFlags => {
    const f = lastFlags ?? { hasMermaid: false };
    lastFlags = null;
    return f;
  };

  return { plugin, popFlags };
}

// ── HAST Plugin ───────────────────────────────────────────────────

/**
 * 将 MermaidPluginOptions 转换为 mermaid-rs render() 所需的对象。
 * JS camelCase → Rust snake_case 映射。
 */
function buildRenderOptions(opts?: MermaidPluginOptions): Record<string, unknown> {
  const r: Record<string, unknown> = {};

  // 主题预设
  if (opts?.theme) r.theme = opts.theme;

  // ── 排版 ────────────────────────────────────────────────────
  if (opts?.font) r.fontFamily = opts.font;
  if (opts?.fontSize != null) r.fontSize = opts.fontSize;

  // ── 主题覆盖 ────────────────────────────────────────────────
  const o = opts?.themeOverrides;
  if (o) {
    // 排版（在 themeOverrides 中可覆盖）
    if (o.fontFamily) r.fontFamily = o.fontFamily;
    if (o.fontSize != null) r.fontSize = o.fontSize;

    // 节点 & 连线
    if (o.primaryColor) r.primaryColor = o.primaryColor;
    if (o.primaryBorderColor) r.primaryBorderColor = o.primaryBorderColor;
    if (o.primaryTextColor) r.primaryTextColor = o.primaryTextColor;
    if (o.lineColor) r.lineColor = o.lineColor;
    if (o.secondaryColor) r.secondaryColor = o.secondaryColor;
    if (o.tertiaryColor) r.tertiaryColor = o.tertiaryColor;
    if (o.textColor) r.textColor = o.textColor;
    if (o.edgeLabelBackground) r.edgeLabelBackground = o.edgeLabelBackground;

    // 画布
    if (o.background) r.background = o.background;

    // 子图
    if (o.clusterBackground) r.clusterBackground = o.clusterBackground;
    if (o.clusterBorder) r.clusterBorder = o.clusterBorder;

    // 时序图
    if (o.sequenceActorFill) r.sequenceActorFill = o.sequenceActorFill;
    if (o.sequenceActorBorder) r.sequenceActorBorder = o.sequenceActorBorder;
    if (o.sequenceActorLine) r.sequenceActorLine = o.sequenceActorLine;
    if (o.sequenceNoteFill) r.sequenceNoteFill = o.sequenceNoteFill;
    if (o.sequenceNoteBorder) r.sequenceNoteBorder = o.sequenceNoteBorder;
    if (o.sequenceActivationFill) r.sequenceActivationFill = o.sequenceActivationFill;
    if (o.sequenceActivationBorder) r.sequenceActivationBorder = o.sequenceActivationBorder;

    // Git 图 — 主色
    if (o.git0) r.git0 = o.git0;
    if (o.git1) r.git1 = o.git1;
    if (o.git2) r.git2 = o.git2;
    if (o.git3) r.git3 = o.git3;
    if (o.git4) r.git4 = o.git4;
    if (o.git5) r.git5 = o.git5;
    if (o.git6) r.git6 = o.git6;
    if (o.git7) r.git7 = o.git7;
    if (o.gitInv0) r.gitInv0 = o.gitInv0;
    if (o.gitInv1) r.gitInv1 = o.gitInv1;
    if (o.gitInv2) r.gitInv2 = o.gitInv2;
    if (o.gitInv3) r.gitInv3 = o.gitInv3;
    if (o.gitInv4) r.gitInv4 = o.gitInv4;
    if (o.gitInv5) r.gitInv5 = o.gitInv5;
    if (o.gitInv6) r.gitInv6 = o.gitInv6;
    if (o.gitInv7) r.gitInv7 = o.gitInv7;
    if (o.gitBranchLabel0) r.gitBranchLabel0 = o.gitBranchLabel0;
    if (o.gitBranchLabel1) r.gitBranchLabel1 = o.gitBranchLabel1;
    if (o.gitBranchLabel2) r.gitBranchLabel2 = o.gitBranchLabel2;
    if (o.gitBranchLabel3) r.gitBranchLabel3 = o.gitBranchLabel3;
    if (o.gitBranchLabel4) r.gitBranchLabel4 = o.gitBranchLabel4;
    if (o.gitBranchLabel5) r.gitBranchLabel5 = o.gitBranchLabel5;
    if (o.gitBranchLabel6) r.gitBranchLabel6 = o.gitBranchLabel6;
    if (o.gitBranchLabel7) r.gitBranchLabel7 = o.gitBranchLabel7;
    if (o.gitCommitLabelColor) r.gitCommitLabelColor = o.gitCommitLabelColor;
    if (o.gitCommitLabelBackground) r.gitCommitLabelBackground = o.gitCommitLabelBackground;
    if (o.gitTagLabelColor) r.gitTagLabelColor = o.gitTagLabelColor;
    if (o.gitTagLabelBackground) r.gitTagLabelBackground = o.gitTagLabelBackground;
    if (o.gitTagLabelBorder) r.gitTagLabelBorder = o.gitTagLabelBorder;

    // 饼图 — 色板
    if (o.pie1) r.pie1 = o.pie1;
    if (o.pie2) r.pie2 = o.pie2;
    if (o.pie3) r.pie3 = o.pie3;
    if (o.pie4) r.pie4 = o.pie4;
    if (o.pie5) r.pie5 = o.pie5;
    if (o.pie6) r.pie6 = o.pie6;
    if (o.pie7) r.pie7 = o.pie7;
    if (o.pie8) r.pie8 = o.pie8;
    if (o.pie9) r.pie9 = o.pie9;
    if (o.pie10) r.pie10 = o.pie10;
    if (o.pie11) r.pie11 = o.pie11;
    if (o.pie12) r.pie12 = o.pie12;
    // 饼图 — 样式
    if (o.pieTitleTextSize != null) r.pieTitleTextSize = o.pieTitleTextSize;
    if (o.pieTitleTextColor) r.pieTitleTextColor = o.pieTitleTextColor;
    if (o.pieSectionTextSize != null) r.pieSectionTextSize = o.pieSectionTextSize;
    if (o.pieSectionTextColor) r.pieSectionTextColor = o.pieSectionTextColor;
    if (o.pieLegendTextSize != null) r.pieLegendTextSize = o.pieLegendTextSize;
    if (o.pieLegendTextColor) r.pieLegendTextColor = o.pieLegendTextColor;
    if (o.pieStrokeColor) r.pieStrokeColor = o.pieStrokeColor;
    if (o.pieStrokeWidth != null) r.pieStrokeWidth = o.pieStrokeWidth;
    if (o.pieOuterStrokeWidth != null) r.pieOuterStrokeWidth = o.pieOuterStrokeWidth;
    if (o.pieOuterStrokeColor) r.pieOuterStrokeColor = o.pieOuterStrokeColor;
    if (o.pieOpacity != null) r.pieOpacity = o.pieOpacity;
  }

  // ── 布局 ────────────────────────────────────────────────────
  if (opts?.nodeSpacing != null) r.nodeSpacing = opts.nodeSpacing;
  if (opts?.rankSpacing != null) r.rankSpacing = opts.rankSpacing;
  if (opts?.preferredAspectRatio != null) r.preferredAspectRatio = opts.preferredAspectRatio;

  // ── 渲染 ────────────────────────────────────────────────────
  if (opts?.fastTextMetrics != null) r.fastTextMetrics = opts.fastTextMetrics;

  return r;
}

export function createMermaidHastPlugin(options?: MermaidPluginOptions): {
  plugin: HastPluginDefinition;
} {
  const responsive = options?.responsive ?? true;
  const ssg = options?.ssg ?? true;
  const wrapperStyle = responsive ? "max-width:100%;overflow:hidden" : "";

  const plugin = defineHastPlugin({
    name: "satteri-mermaid-hast",

    // 路径 A：raw 节点
    raw(node, ctx) {
      const preMatch = node.value.match(
        /<pre\s[^>]*\bclass="mermaid"[^>]*>([\s\S]*?)<\/pre>/i,
      );
      if (!preMatch) return;

      let code: string | undefined;

      const idMatch = node.value.match(/data-mermaid-id="([^"]*)"/);
      if (idMatch) {
        const bag = ctx.data?.[DATA_KEY] as Record<string, string> | undefined;
        code = bag?.[idMatch[1]];
      }

      if (!code) {
        const inner = preMatch[1];
        if (!inner.trim()) return;
        code = inner
          .replace(/<[^>]*>/g, "")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&")
          .trim();
      }

      if (!code) return;
      replaceWithSVG(node, code, ctx);
    },

    // 路径 B：element 节点
    element: {
      filter: ["pre"],
      visit(node, ctx) {
        const cls = node.properties?.className;
        if (!Array.isArray(cls) || !cls.includes("mermaid")) return;
        const text = (node.children?.[0] as any)?.value;
        if (!text) return;
        replaceWithSVG(node, text, ctx);
      },
    },
  });

  function replaceWithSVG(node: any, code: string, ctx: any) {
    if (!ssg) {
      ctx.replaceNode(node, {
        type: "element",
        tagName: "pre",
        properties: { className: ["mermaid"] },
        children: [{ type: "text", value: code }],
      });
      return;
    }

    try {
      const renderOpts = buildRenderOptions(options);
      const svgRaw = renderMermaidSVG(code.trim(), renderOpts);
      const svg = responsive
        ? svgRaw
            .replace(/\b(width|height)="[^"]*"/g, "")
            .replace(/ style="([^"]+)"/, (_, inner) => ` style="width:100%;display:block;${inner}"`)
        : svgRaw;
      ctx.replaceNode(node, {
        type: "raw",
        value: `<div class="mermaid" data-mermaid-ssg="true" style="${wrapperStyle}">${svg}</div>`,
      });
    } catch {
      ctx.replaceNode(node, {
        type: "element",
        tagName: "pre",
        properties: { className: ["mermaid"] },
        children: [{ type: "text", value: code }],
      });
    }
  }

  return { plugin };
}

// ── 工厂函数 ──────────────────────────────────────────────────────

export function mermaidMdast(options?: MermaidPluginOptions): MdastPluginDefinition {
  return createMermaidMdastPlugin(options).plugin;
}

export function mermaidHast(options?: MermaidPluginOptions): HastPluginDefinition {
  return createMermaidHastPlugin(options).plugin;
}

// ── 兼容导出 ──────────────────────────────────────────────────────

const legacyMdast = createMermaidMdastPlugin();

/** @deprecated 使用 `mermaidMdast()` + `mermaidHast()` 分别注册 */
export const mermaidPlugin = legacyMdast.plugin;
export const popFlags = legacyMdast.popFlags;

/** @deprecated 使用 `mermaidMdast()` + `mermaidHast()` 分别注册 */
export function mermaid(options?: MermaidPluginOptions): MdastPluginDefinition {
  return createMermaidMdastPlugin(options).plugin;
}
