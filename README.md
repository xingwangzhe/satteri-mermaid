# @xingwangzhe/satteri-mermaid

[English](README.md) | [中文文档](README_CN.md)

> Sätteri MDAST + HAST plugin: render Mermaid diagrams as static SVG at build time via [mermaid-rs](https://github.com/1jehuang/mermaid-rs-renderer) (napi-rs). **23 diagram types, ~3ms/diagram, zero client JS.**

## Features

- **SSG SVG rendering** — renders diagrams as static inline SVG at build time via napi-rs native bindings. No WASM, no `mermaid.js`, zero runtime overhead.
- **23 diagram types** — flowchart, sequence, class, state, gantt, pie, ER, gitgraph, mindmap, timeline, sankey, and more.
- **5 theme presets** — `modern`, `dark`, `default`, `forest`, `neutral` — plus full per-role color customization.
- **ssg switch** — `ssg: true` produces SVG at build time; `ssg: false` emits raw code blocks for client-side mermaid.js.
- **Auto-responsive** — `responsive: true` (default) removes fixed SVG dimensions and adds `width:100%`.
- **Full mermaid-rs parameter coverage** — all theme colors, git graph colors, pie chart styling, typography, layout, and render options exposed.
- **Dual-plugin architecture** — MDAST plugin detects code blocks, HAST plugin renders or restores them. Immune to Sätteri text transforms.
- **TypeScript** — fully typed with exported interfaces.

## Install

```bash
npm install @xingwangzhe/satteri-mermaid
```

Requires `satteri >= 0.8.0`. No other runtime dependencies — the napi-rs renderer is bundled.

## Usage

### Basic Config

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import { mermaidMdast, mermaidHast } from "@xingwangzhe/satteri-mermaid";

export default defineConfig({
  markdown: {
    processor: satteri({
      mdastPlugins: [mermaidMdast()],
      hastPlugins: [mermaidHast()],
    }),
  },
});
```

Simplest config — all defaults: `ssg: true`, `theme: "modern"`, `responsive: true`.

### Full Configuration

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import { mermaidMdast, mermaidHast } from "@xingwangzhe/satteri-mermaid";

export default defineConfig({
  markdown: {
    processor: satteri({
      // MDAST plugin: detects code blocks and stores raw mermaid code
      mdastPlugins: [
        mermaidMdast({
          langs: ["mermaid", "mmd"], // match multiple language identifiers
        }),
      ],

      // HAST plugin: replaces code blocks with SVG or preserves raw code
      hastPlugins: [
        mermaidHast({
          // ── Render mode ─────────────────────────────────────
          ssg: true,           // true = build-time SVG rendering (default)
                               // false = emit <pre class="mermaid"> for client-side

          // ── Responsive ──────────────────────────────────────
          responsive: true,    // auto-remove width/height, add width:100%

          // ── Theme ───────────────────────────────────────────
          theme: "dark",       // "modern" | "dark" | "default" | "forest" | "neutral"

          // ── Typography ──────────────────────────────────────
          font: "Fira Code, monospace",
          fontSize: 14,

          // ── Layout ──────────────────────────────────────────
          nodeSpacing: 60,     // vertical spacing between nodes (px)
          rankSpacing: 80,     // horizontal spacing between ranks (px)
          preferredAspectRatio: 1.778,  // 16:9 aspect ratio

          // ── Render options ──────────────────────────────────
          fastTextMetrics: false,  // use approximate text widths for speed

          // ── Theme color overrides (all support CSS variables) ─
          themeOverrides: {
            // Canvas
            background: "#0f172a",

            // Nodes
            primaryColor: "#1e293b",
            primaryBorderColor: "#ff6600",
            primaryTextColor: "#e2e8f0",

            // Surfaces
            secondaryColor: "#334155",
            tertiaryColor: "#475569",
            textColor: "#94a3b8",

            // Edges
            lineColor: "#ff6600",
            edgeLabelBackground: "#1e293b",

            // Subgraph / Cluster
            clusterBackground: "#0a0f1e",
            clusterBorder: "#334155",

            // Sequence diagram
            sequenceActorFill: "#1e293b",
            sequenceActorBorder: "#475569",
            sequenceActorLine: "#334155",
            sequenceNoteFill: "#1e293b",
            sequenceNoteBorder: "#f59e0b",
            sequenceActivationFill: "#065f46",
            sequenceActivationBorder: "#34d399",

            // Git graph — branch colors (8 slots)
            git0: "#ff0000",  git1: "#00ff00",
            git2: "#0000ff",  git3: "#ffff00",
            git4: "#ff00ff",  git5: "#00ffff",
            git6: "#800000",  git7: "#008000",
            // Git — inverse colors
            gitInv0: "#800000", gitInv1: "#008000",
            // Git — branch label colors
            gitBranchLabel0: "white", gitBranchLabel1: "black",
            // Git — commit / tag labels
            gitCommitLabelColor: "#333",
            gitCommitLabelBackground: "#eee",
            gitTagLabelColor: "#111",
            gitTagLabelBackground: "#ddd",
            gitTagLabelBorder: "#999",

            // Pie chart — 12-slice palette
            pie1: "#ff0000", pie2: "#00ff00", pie3: "#0000ff",
            pie4: "#ffff00", pie5: "#ff00ff", pie6: "#00ffff",
            pie7: "#800000", pie8: "#008000", pie9: "#000080",
            pie10: "#808000", pie11: "#800080", pie12: "#008080",
            // Pie — styling
            pieTitleTextSize: 25,
            pieTitleTextColor: "#333",
            pieSectionTextSize: 17,
            pieSectionTextColor: "#666",
            pieLegendTextSize: 17,
            pieLegendTextColor: "#999",
            pieStrokeColor: "#000",
            pieStrokeWidth: 2,
            pieOuterStrokeWidth: 2,
            pieOuterStrokeColor: "#ccc",
            pieOpacity: 0.85,

            // Typography (can also be set here)
            fontFamily: "Fira Code, monospace",
            fontSize: 14,
          },
        }),
      ],
    }),
  },
});
```

### SSG Mode (default)

```js
// Build-time rendering — zero client JS
mermaidHast({ ssg: true })
```

All ` ```mermaid ` blocks are replaced with inline `<svg>` at `astro build`:

```html
<div class="mermaid" data-mermaid-ssg="true">
  <svg viewBox="..." style="width:100%;display:block">...</svg>
</div>
```

### Client Mode

```js
// Preserve raw code blocks for client-side mermaid.js
mermaidHast({ ssg: false })
```

Emits `<pre class="mermaid">code</pre>`. Include mermaid.js in your HTML:

```html
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  mermaid.initialize({ startOnLoad: true });
</script>
```

## Theme Presets

5 built-in presets via the `theme` option:

| Preset | Appearance |
|---|---|
| `"modern"` | Clean slate palette (default) — Inter, 14px |
| `"dark"` | Dark background, light elements |
| `"default"` | Classic Mermaid theme |
| `"forest"` | Green-based |
| `"neutral"` | Greyscale |

```js
mermaidHast({
  theme: "dark",
  themeOverrides: {
    primaryBorderColor: "#ff6600",
    background: "#1a1a2e",
    lineColor: "var(--accent, #58a6ff)",
    primaryTextColor: "var(--muted-text, #8b949e)",
  },
})
```

## Options Reference

### MermaidPluginOptions

| Option | Type | Default | Description |
|---|---|---|---|
| `langs` | `string[]` | `["mermaid"]` | Code block language identifiers |
| `ssg` | `boolean` | `true` | Build-time SVG rendering |
| `responsive` | `boolean` | `true` | Auto `width:100%;display:block` on SVG |
| `theme` | `ThemePreset` | `"modern"` | Preset theme |
| `font` | `string` | — | Font family for diagram text |
| `fontSize` | `number` | — | Font size in px |
| `nodeSpacing` | `number` | — | Vertical spacing between nodes (px) |
| `rankSpacing` | `number` | — | Horizontal spacing between ranks (px) |
| `preferredAspectRatio` | `number` | — | Target aspect ratio (e.g. 1.778 = 16:9) |
| `fastTextMetrics` | `boolean` | `false` | Use approximate text widths for faster rendering |
| `themeOverrides` | `ThemeOverrides` | — | Per-field color and style overrides (CSS var support) |

### ThemeOverrides — Node & Edge Colors

| Field | Controls |
|---|---|
| `background` | Canvas background |
| `primaryColor` | Node fill |
| `secondaryColor` | Alt surface fill |
| `tertiaryColor` | Muted surface fill |
| `primaryTextColor` | Primary text / labels |
| `textColor` | Secondary text / edge labels |
| `primaryBorderColor` | Node & cluster borders |
| `lineColor` | Edge lines / connectors |
| `edgeLabelBackground` | Edge label background |
| `clusterBackground` | Subgraph background |
| `clusterBorder` | Subgraph border |

### ThemeOverrides — Sequence Diagram

| Field | Controls |
|---|---|
| `sequenceActorFill` | Actor fill |
| `sequenceActorBorder` | Actor border |
| `sequenceActorLine` | Actor lifeline |
| `sequenceNoteFill` | Note fill |
| `sequenceNoteBorder` | Note border |
| `sequenceActivationFill` | Activation bar fill |
| `sequenceActivationBorder` | Activation bar border |

### ThemeOverrides — Git Graph (8 slots each)

| Slots | Field pattern |
|---|---|
| Branch colors | `git0` … `git7` |
| Inverse colors | `gitInv0` … `gitInv7` |
| Branch label colors | `gitBranchLabel0` … `gitBranchLabel7` |
| Commit label | `gitCommitLabelColor`, `gitCommitLabelBackground` |
| Tag label | `gitTagLabelColor`, `gitTagLabelBackground`, `gitTagLabelBorder` |

### ThemeOverrides — Pie Chart

| Slots / style | Field |
|---|---|
| 12-slice palette | `pie1` … `pie12` |
| Title | `pieTitleTextSize`, `pieTitleTextColor` |
| Section labels | `pieSectionTextSize`, `pieSectionTextColor` |
| Legend | `pieLegendTextSize`, `pieLegendTextColor` |
| Strokes | `pieStrokeColor`, `pieStrokeWidth`, `pieOuterStrokeWidth`, `pieOuterStrokeColor` |
| Opacity | `pieOpacity` |

### ThemeOverrides — Typography

| Field | Controls |
|---|---|
| `fontFamily` | Font family string |
| `fontSize` | Font size in px |

## Supported Diagram Types

`architecture` `block` `c4` `class` `er` `flowchart` `gantt` `gitgraph` `info` `journey` `kanban` `mindmap` `packet` `pie` `quadrantchart` `radar` `requirement` `sankey` `sequence` `state` `timeline` `treemap` `venn` `xychart`

## How It Works

```
Markdown code block → MDAST Plugin (store code, output placeholder)
  → Sätteri processing (placeholder untouched)
  → HAST Plugin
      ssg: true  → napi-rs renderer → inline SVG
      ssg: false → <pre class="mermaid">code</pre> (client-side)
```

## API

| Export | Description |
|---|---|
| `mermaidMdast(options?)` | MDAST plugin — register in `mdastPlugins` |
| `mermaidHast(options?)` | HAST plugin — register in `hastPlugins` |
| `createMermaidMdastPlugin(options?)` | Factory: returns `{ plugin, popFlags }` |
| `createMermaidHastPlugin(options?)` | Factory: returns `{ plugin }` |
| `renderMermaidSVG(code, opts)` | Direct renderer access (low-level, all napi-rs parameters) |

## Platform Support

| Platform | Arch |
|---|---|
| Linux | x64, arm64 |
| macOS | x64, arm64 (Apple Silicon) |
| Windows | x64 |

## License

MIT
