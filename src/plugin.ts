import { defineMdastPlugin, defineHastPlugin } from "satteri";
import type { HastVisitorContext, MdastPluginDefinition, HastPluginDefinition } from "satteri";

const DATA_KEY = "__satteri_mermaid_codes";

export interface MermaidFlags {
  hasMermaid: boolean;
}

export interface MermaidPluginOptions {
  /** 要匹配的代码块语言标识，默认 ["mermaid"] */
  langs?: string[];
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
        const bag = ctx.data[DATA_KEY] as Record<string, string> | undefined;
        if (bag) {
          bag[id] = node.value;
        } else {
          ctx.data[DATA_KEY] = { [id]: node.value };
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
// HAST Plugin — reads code from ctx.data, populates <pre class="mermaid">
// =============================================================================
// HAST Plugin — reads code from ctx.data, populates <pre class="mermaid">
//
// The MDAST plugin's `rawHtml` output becomes a HAST `raw` node (not `element`),
// because Sätteri passes raw HTML through as-is. So we use the `raw` visitor
// to intercept our placeholder and replace it with a proper `<pre>` element
// containing the real mermaid code (which is now safe from Sätteri's
// text transformations).
// =============================================================================

export function createMermaidHastPlugin(_options?: MermaidPluginOptions): {
  plugin: HastPluginDefinition;
} {
  const plugin = defineHastPlugin({
    name: "satteri-mermaid-hast",

    raw(node, ctx: HastVisitorContext) {
      // Only process our placeholder <pre> elements
      const match = node.value.match(/^<pre class="mermaid" data-mermaid-id="([^"]+)"><\/pre>$/);
      if (!match) return;

      const id = match[1];
      const bag = ctx.data[DATA_KEY] as Record<string, string> | undefined;
      const code = bag?.[id];
      if (!code) return;

      // Replace the raw placeholder with a proper HAST element.
      // At this point Sätteri has finished all processing,
      // so {" patterns inside `code` are safe.
      ctx.replaceNode(node, {
        type: "element",
        tagName: "pre",
        properties: { className: ["mermaid"] },
        children: [{ type: "text", value: code }],
      });
    },
  });

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
