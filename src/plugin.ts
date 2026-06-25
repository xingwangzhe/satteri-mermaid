import type { Code } from "mdast";
import { defineMdastPlugin } from "satteri";

export interface MermaidFlags {
  hasMermaid: boolean;
}

export interface MermaidPluginOptions {
  /** 要匹配的代码块语言标识，默认 ["mermaid"] */
  langs?: string[];
  /** 自定义渲染函数，默认 (code) => `<pre class="mermaid">${code}</pre>` */
  render?: (code: string, node: Readonly<Code>) => string;
}

/**
 * HTML-encode curly braces adjacent to quotes to prevent the
 * Sätteri processor from transforming `{"` / `"}` patterns
 * in raw HTML (which would break mermaid diamond nodes `C{"text"}`).
 */
function escapeCurlyBraces(code: string): string {
  return code
    .replace(/\{"/g, '&#123;"')
    .replace(/"\}/g, '"&#125;');
}

function defaultRender(code: string): string {
  return `<pre class="mermaid">${escapeCurlyBraces(code)}</pre>`;
}

export function createMermaidPlugin(options?: MermaidPluginOptions) {
  const langs = options?.langs ?? ["mermaid"];
  const render = options?.render ?? defaultRender;

  let hasMermaid = false;
  let lastFlags: MermaidFlags | null = null;

  const reset = () => {
    hasMermaid = false;
  };
  const flush = () => {
    lastFlags = { hasMermaid };
  };
  const popFlags = (): MermaidFlags => {
    const f = lastFlags ?? { hasMermaid: false };
    lastFlags = null;
    return f;
  };

  const plugin = defineMdastPlugin({
    name: "satteri-mermaid",

    yaml() {
      reset();
      flush();
    },

    code(node) {
      if (langs.includes(node.lang ?? "")) {
        hasMermaid = true;
        flush();
        return { rawHtml: render(node.value, node) };
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

  return { plugin, popFlags };
}

/** 工厂函数，返回 Satteri MDAST 插件。用法同 `katex()` */
export function mermaid(options?: MermaidPluginOptions) {
  return createMermaidPlugin(options).plugin;
}

const defaultInstance = createMermaidPlugin();

/** @deprecated 使用 `mermaid` 替代 */
export const mermaidPlugin = defaultInstance.plugin;
export const popFlags = defaultInstance.popFlags;
