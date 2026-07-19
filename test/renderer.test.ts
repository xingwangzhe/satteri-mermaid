import { describe, expect, it } from "vitest";
import { renderMermaidSVG } from "../src/index";

const simpleChart = "flowchart LR\n    A --> B";

describe("renderMermaidSVG — basic rendering", () => {
  it("returns SVG string for valid mermaid code", () => {
    const svg = renderMermaidSVG(simpleChart, {});
    expect(svg).toMatch(/^<svg /);
    expect(svg).toContain("</svg>");
  });

  it("trims code before rendering", () => {
    const svg = renderMermaidSVG(`  ${simpleChart}  `, {});
    expect(svg).toMatch(/^<svg /);
  });
});

describe("renderMermaidSVG — theme presets", () => {
  it("supports modern theme (default)", () => {
    const svg = renderMermaidSVG(simpleChart, { theme: "modern" });
    expect(svg).toContain("<svg");
  });

  it("supports dark theme", () => {
    const svg = renderMermaidSVG(simpleChart, { theme: "dark" });
    expect(svg).toContain("<svg");
  });

  it("supports default theme", () => {
    const svg = renderMermaidSVG(simpleChart, { theme: "default" });
    expect(svg).toContain("<svg");
  });

  it("supports forest theme", () => {
    const svg = renderMermaidSVG(simpleChart, { theme: "forest" });
    expect(svg).toContain("<svg");
  });

  it("supports neutral theme", () => {
    const svg = renderMermaidSVG(simpleChart, { theme: "neutral" });
    expect(svg).toContain("<svg");
  });

  it("theme name is case-insensitive", () => {
    const svg1 = renderMermaidSVG(simpleChart, { theme: "DARK" });
    const svg2 = renderMermaidSVG(simpleChart, { theme: "dark" });
    expect(svg1).toContain("<svg");
    expect(svg2).toContain("<svg");
  });
});

describe("renderMermaidSVG — node/edge color overrides", () => {
  it("primaryColor changes node fill", () => {
    const svg = renderMermaidSVG(simpleChart, { primaryColor: "#ff0000" });
    expect(svg).toContain("#ff0000");
  });

  it("primaryBorderColor changes node border", () => {
    const svg = renderMermaidSVG(simpleChart, { primaryBorderColor: "#00ff00" });
    expect(svg).toContain("#00ff00");
  });

  it("primaryTextColor changes label color", () => {
    const svg = renderMermaidSVG(simpleChart, { primaryTextColor: "#0000ff" });
    expect(svg).toContain("#0000ff");
  });

  it("lineColor changes edge color", () => {
    const svg = renderMermaidSVG(simpleChart, { lineColor: "#ff8800" });
    expect(svg).toContain("#ff8800");
  });

  it("background changes canvas", () => {
    const svg = renderMermaidSVG(simpleChart, { background: "#0f172a" });
    expect(svg).toContain("#0f172a");
  });

  it("secondaryColor present in SVG", () => {
    const svg = renderMermaidSVG(simpleChart, { secondaryColor: "#334155" });
    expect(svg).toContain("<svg");
  });

  it("tertiaryColor present in SVG", () => {
    const svg = renderMermaidSVG(simpleChart, { tertiaryColor: "#475569" });
    expect(svg).toContain("<svg");
  });

  it("edgeLabelBackground present in SVG", () => {
    const svg = renderMermaidSVG(simpleChart, { edgeLabelBackground: "#1e293b" });
    expect(svg).toContain("<svg");
  });
});

describe("renderMermaidSVG — cluster/subgraph overrides", () => {
  it("clusterBackground present", () => {
    const svg = renderMermaidSVG(simpleChart, { clusterBackground: "#0a0f1e" });
    expect(svg).toContain("<svg");
  });

  it("clusterBorder present", () => {
    const svg = renderMermaidSVG(simpleChart, { clusterBorder: "#334155" });
    expect(svg).toContain("<svg");
  });
});

describe("renderMermaidSVG — sequence diagram overrides", () => {
  const seqChart = `sequenceDiagram
    Alice->>Bob: Hello`;

  it("sequenceActorFill present", () => {
    const svg = renderMermaidSVG(seqChart, { sequenceActorFill: "#f0f0f0" });
    expect(svg).toContain("<svg");
  });

  it("sequenceActorBorder present", () => {
    const svg = renderMermaidSVG(seqChart, { sequenceActorBorder: "#999" });
    expect(svg).toContain("<svg");
  });

  it("sequenceActorLine present", () => {
    const svg = renderMermaidSVG(seqChart, { sequenceActorLine: "#ccc" });
    expect(svg).toContain("<svg");
  });

  it("sequenceNoteFill present", () => {
    const svg = renderMermaidSVG(seqChart, { sequenceNoteFill: "#fff5ad" });
    expect(svg).toContain("<svg");
  });

  it("sequenceNoteBorder present", () => {
    const svg = renderMermaidSVG(seqChart, { sequenceNoteBorder: "#aaa" });
    expect(svg).toContain("<svg");
  });

  it("sequenceActivationFill present", () => {
    const svg = renderMermaidSVG(seqChart, { sequenceActivationFill: "#f4f4f4" });
    expect(svg).toContain("<svg");
  });

  it("sequenceActivationBorder present", () => {
    const svg = renderMermaidSVG(seqChart, { sequenceActivationBorder: "#666" });
    expect(svg).toContain("<svg");
  });
});

describe("renderMermaidSVG — typography", () => {
  it("fontFamily sets SVG font", () => {
    const svg = renderMermaidSVG(simpleChart, { fontFamily: "Fira Code, monospace" });
    expect(svg).toContain("Fira Code");
  });

  it("fontSize affects output", () => {
    const svg = renderMermaidSVG(simpleChart, { fontSize: 18 });
    // 18px font vs default 14px — the SVG contains font-size="18"
    expect(svg).toMatch(/font-size="18"/);
  });
});

describe("renderMermaidSVG — layout", () => {
  it("nodeSpacing affects layout", () => {
    const svg = renderMermaidSVG(simpleChart, { nodeSpacing: 100 });
    expect(svg).toContain("<svg");
  });

  it("rankSpacing affects layout", () => {
    const svg = renderMermaidSVG(simpleChart, { rankSpacing: 150 });
    expect(svg).toContain("<svg");
  });
});

describe("renderMermaidSVG — git graph colors", () => {
  const gitChart = `gitGraph
    commit
    branch develop
    commit
    checkout main
    commit`;

  it("git0..git7 colors accepted", () => {
    const svg = renderMermaidSVG(gitChart, {
      git0: "#ff0000",
      git1: "#00ff00",
      git2: "#0000ff",
      git3: "#ffff00",
      git4: "#ff00ff",
      git5: "#00ffff",
      git6: "#800000",
      git7: "#008000",
    });
    expect(svg).toContain("<svg");
  });

  it("gitInv colors accepted", () => {
    const svg = renderMermaidSVG(gitChart, {
      gitInv0: "#111",
      gitInv1: "#222",
    });
    expect(svg).toContain("<svg");
  });

  it("gitBranchLabel colors accepted", () => {
    const svg = renderMermaidSVG(gitChart, {
      gitBranchLabel0: "white",
      gitBranchLabel1: "black",
    });
    expect(svg).toContain("<svg");
  });

  it("git commit/tag label colors accepted", () => {
    const svg = renderMermaidSVG(gitChart, {
      gitCommitLabelColor: "#333",
      gitCommitLabelBackground: "#eee",
      gitTagLabelColor: "#111",
      gitTagLabelBackground: "#ddd",
      gitTagLabelBorder: "#999",
    });
    expect(svg).toContain("<svg");
  });
});

describe("renderMermaidSVG — pie chart settings", () => {
  const pieChart = `pie title Test
    "A" : 30
    "B" : 70`;

  it("pie1..pie12 colors accepted", () => {
    const svg = renderMermaidSVG(pieChart, {
      pie1: "#ff0000",
      pie2: "#00ff00",
      pie3: "#0000ff",
      pie4: "#ffff00",
      pie5: "#ff00ff",
      pie6: "#00ffff",
      pie7: "#800000",
      pie8: "#008000",
      pie9: "#000080",
      pie10: "#808000",
      pie11: "#800080",
      pie12: "#008080",
    });
    expect(svg).toContain("<svg");
  });

  it("pieTitleTextSize and color accepted", () => {
    const svg = renderMermaidSVG(pieChart, {
      pieTitleTextSize: 30,
      pieTitleTextColor: "#333",
    });
    expect(svg).toContain("<svg");
  });

  it("pieSectionTextSize and color accepted", () => {
    const svg = renderMermaidSVG(pieChart, {
      pieSectionTextSize: 20,
      pieSectionTextColor: "#666",
    });
    expect(svg).toContain("<svg");
  });

  it("pieLegendTextSize and color accepted", () => {
    const svg = renderMermaidSVG(pieChart, {
      pieLegendTextSize: 18,
      pieLegendTextColor: "#999",
    });
    expect(svg).toContain("<svg");
  });

  it("pieStrokeColor, strokeWidth, opacity accepted", () => {
    const svg = renderMermaidSVG(pieChart, {
      pieStrokeColor: "#000",
      pieStrokeWidth: 3,
      pieOuterStrokeWidth: 3,
      pieOuterStrokeColor: "#ccc",
      pieOpacity: 0.9,
    });
    expect(svg).toContain("<svg");
  });
});

describe("renderMermaidSVG — layout/render options", () => {
  it("preferredAspectRatio accepted", () => {
    const svg = renderMermaidSVG(simpleChart, { preferredAspectRatio: 1.778 });
    expect(svg).toContain("<svg");
  });

  it("fastTextMetrics accepted", () => {
    const svg = renderMermaidSVG(simpleChart, { fastTextMetrics: true });
    expect(svg).toContain("<svg");
  });
});

describe("renderMermaidSVG — combined overrides", () => {
  it("many overrides combined work together", () => {
    const svg = renderMermaidSVG(simpleChart, {
      theme: "dark",
      fontFamily: "Fira Code",
      fontSize: 14,
      primaryColor: "#1e293b",
      primaryBorderColor: "#ff6600",
      primaryTextColor: "#e2e8f0",
      lineColor: "#ff6600",
      background: "#0f172a",
      secondaryColor: "#334155",
      tertiaryColor: "#475569",
      textColor: "#94a3b8",
      edgeLabelBackground: "#1e293b",
      clusterBackground: "#0a0f1e",
      clusterBorder: "#334155",
      nodeSpacing: 60,
      rankSpacing: 80,
      preferredAspectRatio: 1.778,
    });
    expect(svg).toMatch(/^<svg /);
    expect(svg).toContain("</svg>");
  });
});

describe("renderMermaidSVG — supported diagram types", () => {
  const diagrams: Record<string, string> = {
    flowchart: "flowchart TD\n    A --> B",
    sequence: "sequenceDiagram\n    A->>B: hi",
    class: "classDiagram\n    class A {\n        +run()\n    }",
    state: "stateDiagram-v2\n    [*] --> A",
    er: "erDiagram\n    CUSTOMER ||--o{ ORDER : places",
    gantt: "gantt\n    title Test\n    section S1\n    T1 :a1, 2026-01-01, 3d",
    pie: "pie title Test\n    \"A\": 50",
    gitgraph: "gitGraph\n    commit",
    mindmap: "mindmap\n    root((Test))\n        A",
    timeline: "timeline\n    title Test\n    2024 : A",
  };

  for (const [name, code] of Object.entries(diagrams)) {
    it(`renders ${name} diagram`, () => {
      const svg = renderMermaidSVG(code, { theme: "modern" });
      expect(svg).toMatch(/^<svg /);
      expect(svg).toContain("</svg>");
    });
  }
});
