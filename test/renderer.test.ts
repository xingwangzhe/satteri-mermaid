import { describe, expect, it } from "vitest";
import { renderMermaidSVG, supportedDiagrams } from "../src/index";
import { diagrams } from "./fixtures/diagrams";
import { parseSvg } from "./svg";
const chart = diagrams.flowchart;
const fixed = { diagramId: "test-chart" };

describe("Merman native renderer", () => {
  it.each(Object.entries(diagrams))("renders well-formed, finite %s SVG", (_name, source) => {
    const svg = renderMermaidSVG(source, fixed);
    const elements = parseSvg(svg);
    expect(elements[0].attributes.viewBox).toBeTruthy();
    expect(elements.length).toBeGreaterThan(2);
    expect(svg).not.toMatch(/(?:NaN|Infinity)/);
  });
  it("exposes the engine catalog and includes xychart", () => {
    const catalog = supportedDiagrams();
    expect(catalog).toContain("xychart");
    expect(catalog).toContain("flowchart");
    expect(new Set(catalog).size).toBe(catalog.length);
  });
  it.each([
    "default",
    "base",
    "dark",
    "forest",
    "neutral",
    "neo",
    "neo-dark",
    "redux",
    "redux-dark",
    "redux-color",
    "redux-dark-color",
  ])("renders the %s theme", (theme) => {
    parseSvg(renderMermaidSVG(chart, { ...fixed, theme }));
  });
  it("maps legacy modern to default and keeps case-insensitive names", () => {
    expect(renderMermaidSVG(chart, { ...fixed, theme: "modern" })).toBe(
      renderMermaidSVG(chart, { ...fixed, theme: "default" }),
    );
    expect(renderMermaidSVG(chart, { ...fixed, theme: "DARK" })).toBe(
      renderMermaidSVG(chart, { ...fixed, theme: "dark" }),
    );
  });
  it("trims input while keeping source text inside the diagram", () => {
    expect(renderMermaidSVG(`  ${chart}  `, fixed)).toBe(renderMermaidSVG(chart, fixed));
  });
  it("produces deterministic output with an explicit diagramId", () => {
    expect(renderMermaidSVG(chart, fixed)).toBe(renderMermaidSVG(chart, fixed));
  });
  it("assigns distinct IDs to repeated diagrams by default", () => {
    const a = parseSvg(renderMermaidSVG(chart))[0].attributes.id;
    const b = parseSvg(renderMermaidSVG(chart))[0].attributes.id;
    expect(a).toBeTruthy();
    expect(a).not.toBe(b);
  });
  it.each(["primaryColor", "primaryBorderColor", "primaryTextColor", "lineColor"])(
    "applies the legacy %s override visibly",
    (field) => {
      const svg = renderMermaidSVG(chart, { theme: "base", [field]: "#123abc" });
      expect(svg).toContain("#123abc");
    },
  );
  it("applies an explicit canvas background to the SVG root", () => {
    const svg = renderMermaidSVG(chart, { background: "#123abc" });
    expect(parseSvg(svg)[0].attributes.style).toContain("background-color: #123abc");
  });
  it("maps legacy sequence actor and note colors", () => {
    const svg = renderMermaidSVG(diagrams.sequence, {
      theme: "base",
      sequenceActorFill: "#123abc",
      sequenceNoteFill: "#abc123",
    });
    expect(svg).toContain("#123abc");
    expect(svg).toContain("#abc123");
  });
  it("applies pie palette overrides to the SVG", () => {
    const svg = renderMermaidSVG(diagrams.pie, { theme: "base", pie1: "#123abc", pie2: "#abc123" });
    expect(svg).toContain("#123abc");
    expect(svg).toContain("#abc123");
  });
  it("lets explicit themeVariables override legacy flat colors", () => {
    const svg = renderMermaidSVG(chart, {
      theme: "base",
      primaryColor: "#aaaaaa",
      themeVariables: { primaryColor: "#123abc" },
    });
    expect(svg).toContain("#123abc");
  });
  it("passes themeCSS and scopedCSS without losing border-width controls", () => {
    const svg = renderMermaidSVG(chart, {
      themeCSS: ".node rect { stroke-width: 6px; }",
      scopedCSS: ".node rect { stroke-width: 7px; }",
    });
    expect(svg).toMatch(/stroke-width:\s*6px/);
    expect(svg).toMatch(/stroke-width:\s*7px/);
  });
  it("applies font settings rather than merely accepting them", () => {
    const svg = renderMermaidSVG(chart, { fontFamily: "Fira Code", fontSize: 18 });
    expect(svg).toContain("Fira Code");
    expect(svg).toMatch(/font-size[:=]\s*["']?18px/);
  });
  it("honors flowchart spacing in the resulting viewBox", () => {
    const base = parseSvg(renderMermaidSVG(chart, fixed))[0].attributes.viewBox;
    const spaced = parseSvg(renderMermaidSVG(chart, { ...fixed, rankSpacing: 180 }))[0].attributes
      .viewBox;
    expect(spaced).not.toBe(base);
  });
  it("preserves the caller's siteConfig object", () => {
    const siteConfig = { theme: "base", themeVariables: { primaryColor: "#123abc" } };
    const before = JSON.stringify(siteConfig);
    renderMermaidSVG(chart, { siteConfig, primaryBorderColor: "#abc123" });
    expect(JSON.stringify(siteConfig)).toBe(before);
  });
  it("rejects invalid syntax and missing diagrams", () => {
    expect(() => renderMermaidSVG("flowchart TD\n A[broken")).toThrow(/Merman/);
    expect(() => renderMermaidSVG("")).toThrow(/Merman/);
  });
  it("rejects invalid configuration and unsupported legacy aspect ratio", () => {
    expect(() => renderMermaidSVG(chart, { siteConfig: null })).toThrow(/object/);
    expect(() => renderMermaidSVG(chart, { viewportWidth: 0 })).toThrow(/positive/);
    expect(() => renderMermaidSVG(chart, { preferredAspectRatio: 1.778 })).toThrow(/not supported/);
  });
  it("does not serialize javascript links under the default strict policy", () => {
    const svg = renderMermaidSVG('flowchart TD\n A[Click]\n click A "javascript:alert(1)"');
    expect(svg).not.toContain("javascript:");
  });
});
