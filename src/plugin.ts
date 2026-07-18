import { defineMdastPlugin, defineHastPlugin } from "satteri";
import type { HastVisitorContext, MdastPluginDefinition, HastPluginDefinition } from "satteri";
import { renderMermaidSVG, initRenderer } from "./renderer";

const DATA_KEY = "__satteri_mermaid_codes";

// 模块加载时等待 WASM 初始化完成（ESM top-level await）
try {
  await initRenderer();
} catch (e) {
  console.error("[satteri-mermaid] merman WASM init failed:", (e as Error).message);
}

// ── 类型 ──────────────────────────────────────────────────────────

export interface MermaidFlags {
  hasMermaid: boolean;
}

/** merman 主机主题预设 */
export type HostThemePreset =
  | "editor-light"
  | "editor-dark"
  | "one-dark"
  | "gruvbox-light"
  | "gruvbox-dark"
  | "ayu-light"
  | "ayu-dark";

/** 逐色覆盖项（与 merman HostThemeRolesOptions 对齐） */
export interface ThemeRoles {
  canvas?: string;
  surface?: string;
  surface_alt?: string;
  surface_muted?: string;
  text?: string;
  subtle_text?: string;
  border?: string;
  line?: string;
  edge_label_background?: string;
  cluster_background?: string;
  cluster_border?: string;
  note_background?: string;
  note_border?: string;
  note_text?: string;
  actor_background?: string;
  actor_border?: string;
  actor_text?: string;
  activation_background?: string;
  activation_border?: string;
  error?: string;
  warning?: string;
  success?: string;
}

export interface MermaidPluginOptions {
  /** 要匹配的代码块语言标识，默认 ["mermaid"] */
  langs?: string[];
  /** SVG 自适应容器宽度，默认 true */
  responsive?: boolean;

  /** 主题预设，默认 "editor-dark" */
  theme?: HostThemePreset;
  /** 逐色覆盖预设中的颜色（支持 CSS 变量） */
  themeOverrides?: ThemeRoles;
  /** 字体族 */
  font?: string;

  /**
   * @deprecated 使用 theme + themeOverrides 代替。
   * 旧版 beautiful-mermaid 风格的颜色选项，自动映射到 themeOverrides。
   */
  svgOptions?: {
    bg?: string;
    fg?: string;
    line?: string;
    accent?: string;
    muted?: string;
    surface?: string;
    border?: string;
    font?: string;
    padding?: number;
    nodeSpacing?: number;
    layerSpacing?: number;
  };
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

function resolveRoles(opts?: MermaidPluginOptions): ThemeRoles {
  const roles: ThemeRoles = {};

  // 新版 themeOverrides 优先
  if (opts?.themeOverrides) {
    Object.assign(roles, opts.themeOverrides);
  }

  // 旧版 svgOptions → 自动映射
  const svg = opts?.svgOptions;
  if (svg) {
    if (svg.bg) {
      roles.canvas ??= svg.bg;
      roles.cluster_background ??= svg.bg;
    }
    if (svg.fg) {
      roles.text ??= svg.fg;
      roles.subtle_text ??= svg.fg;
    }
    if (svg.surface) roles.surface ??= svg.surface;
    if (svg.border) {
      roles.border ??= svg.border;
      roles.cluster_border ??= svg.border;
      roles.actor_border ??= svg.border;
    }
    if (svg.line) {
      roles.line ??= svg.line;
      roles.activation_border ??= svg.line;
    }
    if (svg.accent) {
      roles.note_background ??= svg.accent;
      roles.actor_background ??= svg.accent;
    }
    if (svg.muted) {
      roles.note_text ??= svg.muted;
      roles.actor_text ??= svg.muted;
    }
  }

  return roles;
}

export function createMermaidHastPlugin(options?: MermaidPluginOptions): {
  plugin: HastPluginDefinition;
} {
  const responsive = options?.responsive ?? true;
  const themePreset = options?.theme ?? "editor-dark";
  const themeRoles = resolveRoles(options);
  const font = options?.font ?? options?.svgOptions?.font;
  const wrapperStyle = responsive ? "max-width:100%;overflow:hidden" : "";

  function buildOptionsJson(): string {
    const hostTheme: Record<string, unknown> = {
      preset: themePreset,
      roles: themeRoles,
    };
    if (font) hostTheme.font_family = font;

    return JSON.stringify({
      svg: { pipeline: "readable" },
      host_theme: hostTheme,
    });
  }

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
    try {
      const svgRaw = renderMermaidSVG(code.trim(), buildOptionsJson());
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

// ── Factory functions ─────────────────────────────────────────────

export function mermaidMdast(options?: MermaidPluginOptions): MdastPluginDefinition {
  return createMermaidMdastPlugin(options).plugin;
}

export function mermaidHast(options?: MermaidPluginOptions): HastPluginDefinition {
  return createMermaidHastPlugin(options).plugin;
}

// ── Legacy exports ────────────────────────────────────────────────

const legacyMdast = createMermaidMdastPlugin();

/** @deprecated 使用 `mermaidMdast()` + `mermaidHast()` 分别注册 */
export const mermaidPlugin = legacyMdast.plugin;
export const popFlags = legacyMdast.popFlags;

/** @deprecated 使用 `mermaidMdast()` + `mermaidHast()` 分别注册 */
export function mermaid(options?: MermaidPluginOptions): MdastPluginDefinition {
  return createMermaidMdastPlugin(options).plugin;
}
