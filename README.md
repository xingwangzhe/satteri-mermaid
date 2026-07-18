# @xingwangzhe/satteri-mermaid

[English](README.md) | [中文文档](README_CN.md)

> Sätteri MDAST + HAST plugin for Mermaid diagram detection and SSG SVG rendering.
> **v0.5.0: [merman](https://github.com/Latias94/merman) (Rust WASM) — all 24 diagram types, zero browser dependency.**

## Features

- **SSG SVG rendering** — renders diagrams as static inline SVG at build time via [`@mermanjs/web`](https://npm.im/@mermanjs/web) (Rust → WASM). No client-side `mermaid.js` required, no runtime overhead.
- **24 diagram types** — flowchart, sequence, class, state, gantt, pie, ER, gitgraph, mindmap, timeline, sankey, and more. Full mermaid parity.
- **Theme presets** — 7 built-in host themes (`one-dark`, `editor-dark`, `gruvbox-dark`, etc.). Pick one, done.
- **Auto-responsive** — `responsive: true` (default) removes fixed SVG dimensions and adds `width:100%`. Zero extra CSS.
- **Dual-plugin architecture** — MDAST plugin detects code blocks, HAST plugin renders or restores them. Immune to Sätteri text transforms.
- **TypeScript** — fully typed with exported interfaces.

## Install

```bash
bun add @xingwangzhe/satteri-mermaid @mermanjs/web
```

Requires `satteri >= 0.8.0` and `@mermanjs/web >= 0.7.0`. `mermaid` is **not needed**.

## Usage

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import { mermaidMdast, mermaidHast } from "@xingwangzhe/satteri-mermaid";

export default defineConfig({
  markdown: {
    processor: satteri({
      mdastPlugins: [mermaidMdast()],
      hastPlugins: [
        mermaidHast({
          responsive: true,       // default: true — auto width:100%
          theme: "one-dark",      // preset theme
        }),
      ],
    }),
  },
});
```

## Theme

Merman provides 7 preset themes via the `theme` option, with optional `themeOverrides` for individual colors:

| Preset | Appearance |
|--------|------------|
| `"one-dark"` | Atom One Dark |
| `"editor-dark"` | Dark editor (default) |
| `"editor-light"` | Light editor |
| `"gruvbox-dark"` | Gruvbox Dark |
| `"gruvbox-light"` | Gruvbox Light |
| `"ayu-dark"` | Ayu Dark |
| `"ayu-light"` | Ayu Light |

```js
mermaidHast({
  theme: "one-dark",
  themeOverrides: {
    border: "var(--border, #30363d)",
    line: "var(--accent, #58a6ff)",
    text: "var(--muted-text, #8b949e)",
  },
})
```

All `themeOverrides` values support CSS variables. Available roles:

| Role | Controls |
|------|----------|
| `canvas` | Canvas background |
| `surface` | Node fill |
| `text` | Primary text / labels |
| `subtle_text` | Secondary text / edge labels |
| `border` | Node & cluster borders |
| `line` | Edge lines / connectors |
| `note_background` | Note fill |
| `note_text` | Note text |
| `actor_background` | Sequence actor fill |
| `actor_border` | Actor border |
| `actor_text` | Actor label |
| `cluster_background` | Subgraph background |
| `cluster_border` | Subgraph border |
| `activation_border` | Sequence activation bar border |
| `error` / `warning` / `success` | Status colors |

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `responsive` | `boolean` | `true` | Auto `width:100%;display:block` on SVG |
| `theme` | `HostThemePreset` | `"editor-dark"` | Preset theme |
| `langs` | `string[]` | `["mermaid"]` | Code block language identifiers |
| `font` | `string` | — | Font family for diagram text |

## Supported Diagram Types

`architecture` `block` `c4` `class` `er` `flowchart` `gantt` `gitgraph` `info` `journey` `kanban` `mindmap` `packet` `pie` `quadrantchart` `radar` `requirement` `sankey` `sequence` `state` `timeline` `treemap` `venn` `xychart` `zenuml`

## How It Works

```
Markdown code block → MDAST Plugin (store code, output placeholder)
  → Sätteri processing (placeholder untouched)
  → HAST Plugin (merman WASM renderer → inline SVG)
```

## API

| Export | Description |
|--------|-------------|
| `mermaidMdast(options?)` | MDAST plugin — register in `mdastPlugins` |
| `mermaidHast(options?)` | HAST plugin — register in `hastPlugins` |
| `createMermaidMdastPlugin(options?)` | Factory: returns `{ plugin, popFlags }` |
| `createMermaidHastPlugin(options?)` | Factory: returns `{ plugin }` |

## Migration

### v0.4.x → v0.5.0

```bash
bun add @mermanjs/web
bun remove beautiful-mermaid
```

```diff
  mermaidHast({
-   svgOptions: { ... },
+   theme: "one-dark",
  }),
```

> The old `svgOptions` are no longer supported. Use `theme` to pick a preset.

### v0.2.x → v0.3.0

Remove client-side mermaid script and `mermaid` dependency. Diagrams render at build time.

## License

MIT
