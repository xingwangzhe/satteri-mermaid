# @xingwangzhe/satteri-mermaid

[English](README.md) | [中文文档](README_CN.md)

> Sätteri MDAST + HAST plugin for Mermaid diagram detection and SSG SVG rendering.
> **v0.5.0: [merman](https://github.com/Latias94/merman) (Rust WASM) — all 24 diagram types, zero browser dependency.**

## Features

- **SSG SVG rendering** — `ssg: true` (default) renders diagrams as static inline SVG at build time via [`@mermanjs/web`](https://npm.im/@mermanjs/web) (Rust → WASM). No client-side `mermaid.js` required.
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
          ssg: true,              // default: true — build-time static SVG
          responsive: true,       // default: true — auto width:100%
          theme: "one-dark",      // preset theme
        }),
      ],
    }),
  },
});
```

## Theme

Merman provides 7 preset themes via the `theme` option:

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
mermaidHast({ theme: "one-dark" })
```

> **Note:** Custom per-element colors (CSS variables in `themeOverrides`) are not supported by the current merman renderer. Use preset-based theme selection.

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ssg` | `boolean` | `true` | Build-time SVG rendering |
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
    ssg: true,
-   svgOptions: {
-     bg: "var(--card-bg, #161b22)",
-     fg: "var(--muted-text, #8b949e)",
-     ...
-   },
+   theme: "one-dark",
  }),
```

> The old `svgOptions` are no longer supported. Use `theme` to pick a preset.

### v0.2.x → v0.3.0

Remove client-side mermaid script and `mermaid` dependency. Diagrams render at build time.

## License

MIT
