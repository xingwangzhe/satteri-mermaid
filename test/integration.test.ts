import { describe, expect, it, vi } from "vitest";
import {
  defineHastPlugin,
  markdownToHtml as compileMarkdown,
  mdxToJs as compileMdx,
} from "satteri";
import { createMermaidMdastPlugin, mermaidMdast, mermaidHast } from "../src/index";
import type { MermaidPluginOptions } from "../src/index";
import { parseSvg } from "./svg";

function synchronous<T>(value: T | Promise<T>): T {
  if (value instanceof Promise) throw new Error("These plugins must compile synchronously");
  return value;
}
const markdownToHtml = (...args: Parameters<typeof compileMarkdown>) =>
  synchronous(compileMarkdown(...args));
const mdxToJs = (...args: Parameters<typeof compileMdx>) => synchronous(compileMdx(...args));

const fence = (code: string, lang = "mermaid") => `\`\`\`${lang}\n${code}\n\`\`\``;
const chart = 'flowchart TD\n A["Start"] --> B["Done"]';
function compile(source: string, options?: MermaidPluginOptions) {
  return markdownToHtml(source, {
    mdastPlugins: [mermaidMdast(options)],
    hastPlugins: [mermaidHast(options)],
  });
}

describe("Sätteri 0.10.5 end-to-end integration", () => {
  it("turns a real Markdown fence into static SVG with readable labels", () => {
    const { html } = compile(fence(chart));
    expect(html).toContain('data-mermaid-ssg="true"');
    expect(html).toContain("Start");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("data-mermaid-id");
    const elements = parseSvg(html.match(/<svg\b[\s\S]*?<\/svg>/)![0]);
    expect(elements.filter((element) => element.name === "text").length).toBeGreaterThan(0);
  });

  it("preserves punctuation, braces, ampersands, and Chinese labels", () => {
    const { html } = compile(fence('flowchart LR\n A["你好 {value} & hello"] --> B["Done"]'));
    expect(html).toContain("你好");
    expect(html).toContain("{value}");
    expect(html).toContain("&amp;");
    parseSvg(html.match(/<svg\b[\s\S]*?<\/svg>/)![0]);
  });

  it.todo("Merman 0.7.0 should render a literal less-than sign instead of visible &lt; text");

  it("keeps multiple diagrams and their internal IDs independent", () => {
    const { html } = compile(`${fence(chart)}\n\n${fence(chart)}`);
    const svgs = html.match(/<svg\b[\s\S]*?<\/svg>/g)!;
    expect(svgs).toHaveLength(2);
    const ids = svgs.flatMap((svg) =>
      parseSvg(svg)
        .map((element) => element.attributes.id)
        .filter(Boolean),
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("changes only root sizing in responsive mode, preserving node rectangles", () => {
    const svg = compile(fence(chart)).html.match(/<svg\b[\s\S]*?<\/svg>/)![0];
    const [root, ...children] = parseSvg(svg);
    expect(root.attributes.width).toBeUndefined();
    expect(root.attributes.height).toBeUndefined();
    expect(root.attributes.style).toContain("width:100%");
    const rectangles = children.filter((element) => element.name === "rect");
    expect(rectangles.length).toBeGreaterThan(0);
    expect(
      rectangles.some(
        (element) => Number(element.attributes.width) > 0 && Number(element.attributes.height) > 0,
      ),
    ).toBe(true);
  });

  it("preserves the renderer's root sizing when responsive is false", () => {
    const svg = compile(fence(chart), { responsive: false }).html.match(
      /<svg\b[\s\S]*?<\/svg>/,
    )![0];
    expect(parseSvg(svg)[0].attributes.style ?? "").not.toContain("display:block");
  });

  it("forwards custom theme variables and scoped border CSS", () => {
    const { html } = compile(fence(chart), {
      theme: "base",
      themeVariables: { primaryColor: "#123456" },
      scopedCSS: ".node rect { stroke-width: 7px; }",
    });
    expect(html).toContain("#123456");
    expect(html).toMatch(/stroke-width:\s*7px/);
  });

  it("leaves ordinary fences and prose alone", () => {
    const { html } = compile(`# Title\n\n${fence("const n = 1", "javascript")}`);
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("const n = 1");
    expect(html).not.toContain("<svg");
  });

  it("supports a custom fence language", () => {
    const { html } = compile(fence(chart, "mmd"), { langs: ["mmd"] });
    expect(html).toContain("<svg");
  });

  it("ssg:false escapes code and leaves client rendering to the host", () => {
    const { html } = compile(fence('flowchart TD\n A["<script>alert(1)</script>"]'), {
      ssg: false,
    });
    expect(html).toContain('<pre class="mermaid">');
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<svg");
    expect(html).not.toContain("<script");
  });

  it("fails the build for invalid syntax by default", () => {
    expect(() => compile(fence("flowchart TD\n A[broken"))).toThrow(/Merman/);
  });

  it("allows an explicit code fallback without publishing a broken SVG", () => {
    const { html } = compile(fence("flowchart TD\n A[broken"), { onError: "code" });
    expect(html).toContain("A[broken");
    expect(html).not.toContain("<svg");
  });

  it("warn-and-code emits a visible warning", () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const result = compile(fence("flowchart TD\n A[broken"), { onError: "warn-and-code" });
      expect(result.html).toContain("A[broken");
      expect(warning).toHaveBeenCalledWith(expect.stringContaining("Mermaid rendering failed"));
    } finally {
      warning.mockRestore();
    }
  });

  it("resets flags for documents without YAML frontmatter", () => {
    const mdast = createMermaidMdastPlugin();
    const options = { mdastPlugins: [mdast.plugin], hastPlugins: [mermaidHast()] };
    markdownToHtml(fence(chart), options);
    expect(mdast.popFlags().hasMermaid).toBe(true);
    markdownToHtml("Plain document", options);
    expect(mdast.popFlags().hasMermaid).toBe(false);
    expect(markdownToHtml(fence(chart), options).html).toContain("<svg");
  });

  it("recovers placeholders after an intervening HAST HTML parse", () => {
    const htmlParser = defineHastPlugin({
      name: "parse-placeholder",
      raw(node, ctx) {
        const match = node.value.match(/data-mermaid-id="([^"]+)"/);
        if (match)
          ctx.replaceNode(node, {
            type: "element",
            tagName: "pre",
            properties: {
              className: ["mermaid"],
              dataMermaidId: match[1],
            },
            children: [],
          });
      },
    });
    const { html } = markdownToHtml(fence(chart), {
      mdastPlugins: [mermaidMdast()],
      hastPlugins: [htmlParser, mermaidHast()],
    });
    expect(html).toContain("<svg");
    expect(html).toContain("Start");
  });

  it("renders a highlighted element with nested text children", () => {
    const { html } = markdownToHtml('<pre class="mermaid">flowchart TD\n A --&gt; B</pre>', {
      hastPlugins: [mermaidHast()],
    });
    expect(html).toContain("<svg");
  });

  it("compiles Mermaid fences through the MDX pipeline", () => {
    const { code } = mdxToJs(`# MDX\n\n${fence(chart)}`, {
      mdastPlugins: [mermaidMdast()],
      hastPlugins: [mermaidHast()],
    });
    expect(code).toContain("Start");
    expect(code).toContain("svg");
    expect(code).not.toContain("data-mermaid-id");
  });
});
