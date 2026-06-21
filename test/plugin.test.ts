import { describe, expect, it } from "vitest";
import { createMermaidPlugin, mermaid, mermaidPlugin, popFlags } from "../src/plugin";

describe("mermaid() factory", () => {
  it("returns a plugin without options", () => {
    const plugin = mermaid();
    expect(plugin.name).toBe("satteri-mermaid");
    expect(typeof plugin.code).toBe("function");
  });

  it("returns rawHtml for mermaid code blocks", () => {
    const plugin = mermaid();
    const result = plugin.code!(
      { type: "code", lang: "mermaid", value: "graph TD" } as any,
      {} as any,
    );
    expect(result).toEqual({ rawHtml: '<pre class="mermaid">graph TD</pre>' });
  });

  it("supports custom options", () => {
    const plugin = mermaid({
      render: (code) => `<figure>${code}</figure>`,
    });
    const result = plugin.code!(
      { type: "code", lang: "mermaid", value: "X" } as any,
      {} as any,
    );
    expect(result).toEqual({ rawHtml: "<figure>X</figure>" });
  });

  it("supports custom langs", () => {
    const plugin = mermaid({ langs: ["mmd"] });
    expect(plugin.code!({ type: "code", lang: "mmd", value: "A" } as any, {} as any)).toBeDefined();
    expect(plugin.code!({ type: "code", lang: "mermaid", value: "B" } as any, {} as any)).toBeUndefined();
  });
});

describe("mermaidPlugin (default instance)", () => {
  it("has correct plugin name", () => {
    expect(mermaidPlugin.name).toBe("satteri-mermaid");
  });

  it("has code visitor function", () => {
    expect(typeof mermaidPlugin.code).toBe("function");
  });

  it("returns rawHtml for mermaid code blocks", () => {
    const result = mermaidPlugin.code!(
      { type: "code", lang: "mermaid", value: "graph TD\n  A --> B" } as any,
      {} as any,
    );
    expect(result).toEqual({
      rawHtml: '<pre class="mermaid">graph TD\n  A --> B</pre>',
    });
  });

  it("returns undefined for non-mermaid code blocks", () => {
    const result = mermaidPlugin.code!(
      { type: "code", lang: "javascript", value: "console.log(1)" } as any,
      {} as any,
    );
    expect(result).toBeUndefined();
  });

  it("sets hasMermaid flag for mermaid blocks", () => {
    mermaidPlugin.yaml!({ type: "yaml", value: "" } as any, {} as any);
    mermaidPlugin.code!(
      { type: "code", lang: "mermaid", value: "A" } as any,
      {} as any,
    );
    const flags = popFlags();
    expect(flags.hasMermaid).toBe(true);
  });

  it("does not set hasMermaid flag for non-mermaid blocks", () => {
    mermaidPlugin.yaml!({ type: "yaml", value: "" } as any, {} as any);
    mermaidPlugin.code!(
      { type: "code", lang: "python", value: "print(1)" } as any,
      {} as any,
    );
    const flags = popFlags();
    expect(flags.hasMermaid).toBe(false);
  });

  it("popFlags resets state after call", () => {
    mermaidPlugin.code!(
      { type: "code", lang: "mermaid", value: "A" } as any,
      {} as any,
    );
    expect(popFlags().hasMermaid).toBe(true);
    expect(popFlags().hasMermaid).toBe(false);
  });

  it("yaml resets internal state", () => {
    mermaidPlugin.code!(
      { type: "code", lang: "mermaid", value: "A" } as any,
      {} as any,
    );
    mermaidPlugin.yaml!({ type: "yaml", value: "title: test" } as any, {} as any);
    expect(popFlags().hasMermaid).toBe(false);
  });

  it("multiple mermaid blocks all set flag", () => {
    mermaidPlugin.yaml!({ type: "yaml", value: "" } as any, {} as any);
    mermaidPlugin.code!(
      { type: "code", lang: "mermaid", value: "first" } as any,
      {} as any,
    );
    mermaidPlugin.code!(
      { type: "code", lang: "mermaid", value: "second" } as any,
      {} as any,
    );
    expect(popFlags().hasMermaid).toBe(true);
  });
});

describe("createMermaidPlugin (custom)", () => {
  it("default options behave same as mermaidPlugin", () => {
    const { plugin, popFlags: pf } = createMermaidPlugin();
    expect(plugin.name).toBe("satteri-mermaid");

    plugin.yaml!({ type: "yaml", value: "" } as any, {} as any);
    const result = plugin.code!(
      { type: "code", lang: "mermaid", value: "test" } as any,
      {} as any,
    );
    expect(result).toEqual({ rawHtml: '<pre class="mermaid">test</pre>' });
    expect(pf().hasMermaid).toBe(true);
  });

  it("custom langs match", () => {
    const { plugin, popFlags: pf } = createMermaidPlugin({ langs: ["mmd", "diagram"] });

    plugin.yaml!({ type: "yaml", value: "" } as any, {} as any);
    plugin.code!(
      { type: "code", lang: "mmd", value: "A" } as any,
      {} as any,
    );
    expect(pf().hasMermaid).toBe(true);

    plugin.yaml!({ type: "yaml", value: "" } as any, {} as any);
    plugin.code!(
      { type: "code", lang: "mermaid", value: "B" } as any,
      {} as any,
    );
    expect(pf().hasMermaid).toBe(false);
  });

  it("custom render output", () => {
    const { plugin } = createMermaidPlugin({
      render: (code) => `<figure class="diagram"><pre class="mermaid">${code}</pre></figure>`,
    });

    const result = plugin.code!(
      { type: "code", lang: "mermaid", value: "graph TD" } as any,
      {} as any,
    );
    expect(result).toEqual({
      rawHtml: '<figure class="diagram"><pre class="mermaid">graph TD</pre></figure>',
    });
  });

  it("render receives the original node", () => {
    let receivedNode: any = null;
    const { plugin } = createMermaidPlugin({
      render: (code, node) => {
        receivedNode = node;
        return `<pre class="mermaid">${code}</pre>`;
      },
    });

    const codeNode = { type: "code", lang: "mermaid", value: "X", meta: "extra" };
    plugin.code!(codeNode as any, {} as any);
    expect(receivedNode).toEqual(codeNode);
  });

  it("instances have isolated state", () => {
    const a = createMermaidPlugin();
    const b = createMermaidPlugin();

    a.plugin.code!({ type: "code", lang: "mermaid", value: "A" } as any, {} as any);
    expect(a.popFlags().hasMermaid).toBe(true);
    expect(b.popFlags().hasMermaid).toBe(false);
  });
});
