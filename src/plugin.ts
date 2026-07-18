import { defineMdastPlugin, defineHastPlugin } from "satteri";
import type { HastVisitorContext, MdastPluginDefinition, HastPluginDefinition } from "satteri";
import { renderMermaidSVG } from "beautiful-mermaid";

const DATA_KEY = "__satteri_mermaid_codes";

export interface MermaidFlags {
  hasMermaid: boolean;
}

export interface MermaidPluginOptions {
  /** 要匹配的代码块语言标识，默认 ["mermaid"] */
  langs?: string[];
  /** SSG 构建时渲染为 SVG，默认 true */
  ssg?: boolean;
  /** SVG 自适应容器宽度，默认 true。自动添加 max-width:100%;height:auto */
  responsive?: boolean;
  /** SVG 渲染选项（仅 ssg: true 时生效） */
  svgOptions?: {
    /** 背景色，支持 CSS 变量。默认 var(--card-bg, #1a1b26) */
    bg?: string;
    /** 前景/主文字色，支持 CSS 变量。默认 var(--muted-text, #a9b1d6) */
    fg?: string;
    /** 连线/箭头颜色 */
    line?: string;
    /** 高亮/特殊节点颜色 */
    accent?: string;
    /** 次要文字/边标签颜色 */
    muted?: string;
    /** 节点填充色 */
    surface?: string;
    /** 节点/分组边框色 */
    border?: string;
    /** 字体，默认 inherit */
    font?: string;
    /** 画布内边距(px)，默认 40 */
    padding?: number;
    /** 节点水平间距(px)，默认 24 */
    nodeSpacing?: number;
    /** 层级垂直间距(px)，默认 40 */
    layerSpacing?: number;
  };
}

// =============================================================================
// MDAST Plugin — stores mermaid code in ctx.data, outputs empty <pre> placeholder
// =============================================================================

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
        // Store the raw mermaid code in the shared data bag
        if (ctx.data) {
          const bag = ctx.data[DATA_KEY] as Record<string, string> | undefined;
          if (bag) {
            bag[id] = node.value;
          } else {
            ctx.data[DATA_KEY] = { [id]: node.value };
          }
        }
        // Output an empty placeholder — Sätteri won't corrupt this
        return {
          rawHtml: `<pre class="mermaid" data-mermaid-id="${id}"></pre>`,
        };
      }
      flush();
    },

    heading() {
      flush();
    },
    paragraph() {
      flush();
    },
    blockquote() {
      flush();
    },
    list() {
      flush();
    },
    table() {
      flush();
    },
    html() {
      flush();
    },
    thematicBreak() {
      flush();
    },
    math() {
      flush();
    },
    inlineMath() {
      flush();
    },
    image() {
      flush();
    },
    imageReference() {
      flush();
    },
  });

  const popFlags = (): MermaidFlags => {
    const f = lastFlags ?? { hasMermaid: false };
    lastFlags = null;
    return f;
  };

  return { plugin, popFlags };
}

// =============================================================================
// HAST Plugin — 还原 mermaid 代码块。ssg: true 时直接渲染为静态 SVG
// =============================================================================

export function createMermaidHastPlugin(options?: MermaidPluginOptions): {
  plugin: HastPluginDefinition;
} {
  const ssg = options?.ssg ?? true;
  const responsive = options?.responsive ?? true;
  const svgOpts = options?.svgOptions;
  const wrapperStyle = responsive ? "max-width:100%;overflow:hidden" : "";

  const plugin = defineHastPlugin({
    name: "satteri-mermaid-hast",

    // 路径 A：raw 节点 — 处理被语法高亮插件转换后的 <pre class="mermaid"> 占位符
    // MDAST 阶段通过 rawHtml 输出的 <pre class="mermaid" data-mermaid-id="xxx"></pre>
    // 以 HAST raw 节点进入管线。语法高亮插件可能将其包裹为带 <code> 的格式。
    raw(node, ctx) {
      // 匹配 <pre class="mermaid" ...> ... </pre>
      const preMatch = node.value.match(
        /<pre\s[^>]*\bclass="mermaid"[^>]*>([\s\S]*?)<\/pre>/i,
      );
      if (!preMatch) return;

      let code: string | undefined;

      // 优先从 data-mermaid-id 读取 MDAST 阶段存储的原始代码（未经高亮污染）
      const idMatch = node.value.match(/data-mermaid-id="([^"]*)"/);
      if (idMatch) {
        const bag = ctx.data?.[DATA_KEY] as Record<string, string> | undefined;
        code = bag?.[idMatch[1]];
      }

      // 回退：高亮后 innerHTML 中含 <code><span>…</span></code>，剥离标签取纯文本
      if (!code) {
        const inner = preMatch[1];
        if (!inner.trim()) return; // 空占位符且 ctx.data 中无对应代码 → 跳过
        code = inner
          .replace(/<[^>]*>/g, "")       // 去掉高亮 span/code 标签
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&")
          .trim();
      }

      if (!code) return;
      replaceWithSVG(node, code, ctx);
    },

    // 路径 B：element 节点 — <pre class="mermaid">code</pre>，直接匹配 className
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
      // 传统模式：保留代码，运行时客户端渲染
      ctx.replaceNode(node, {
        type: "element",
        tagName: "pre",
        properties: { className: ["mermaid"] },
        children: [{ type: "text", value: code }],
      });
      return;
    }
    // SSG：构建时渲染为静态 SVG
    try {
      const svgRaw = renderMermaidSVG(code.trim(), {
        bg: svgOpts?.bg ?? "var(--card-bg, #1a1b26)",
        fg: svgOpts?.fg ?? "var(--muted-text, #a9b1d6)",
        line: svgOpts?.line,
        accent: svgOpts?.accent,
        muted: svgOpts?.muted,
        surface: svgOpts?.surface,
        border: svgOpts?.border,
        font: svgOpts?.font,
        padding: svgOpts?.padding ?? 40,
        nodeSpacing: svgOpts?.nodeSpacing,
        layerSpacing: svgOpts?.layerSpacing,
      });
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
      // 渲染失败时回退为纯代码块
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

// =============================================================================
// Factory functions
// =============================================================================

/** 返回 MDAST 插件，注册到 `mdastPlugins` */
export function mermaidMdast(options?: MermaidPluginOptions): MdastPluginDefinition {
  return createMermaidMdastPlugin(options).plugin;
}

/** 返回 HAST 插件，注册到 `hastPlugins` */
export function mermaidHast(options?: MermaidPluginOptions): HastPluginDefinition {
  return createMermaidHastPlugin(options).plugin;
}

// =============================================================================
// Legacy exports (backward compatibility)
// =============================================================================

const legacyMdast = createMermaidMdastPlugin();

/**
 * @deprecated 使用 `mermaidMdast()` + `mermaidHast()` 分别注册。
 *             仅返回 MDAST 插件，无法防止 Sätteri 破坏 mermaid 代码。
 */
export const mermaidPlugin = legacyMdast.plugin;
export const popFlags = legacyMdast.popFlags;

/** @deprecated 使用 `mermaidMdast()` + `mermaidHast()` 分别注册 */
export function mermaid(options?: MermaidPluginOptions): MdastPluginDefinition {
  return createMermaidMdastPlugin(options).plugin;
}
