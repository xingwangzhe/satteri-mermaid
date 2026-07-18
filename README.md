# @xingwangzhe/satteri-mermaid

> Sätteri MDAST + HAST plugin for Mermaid diagram detection and transformation.
> **v0.3.0: SSG SVG rendering — zero client JS.**

## Features

- **SSG SVG rendering** — `ssg: true` (default) renders diagrams as static SVG at build time via [`beautiful-mermaid`](https://github.com/lukilabs/beautiful-mermaid). **No client-side `mermaid.js` needed.**
- **Theme-adaptive** — default SVG colors use CSS variables (`var(--card-bg)`, `var(--muted-text)`), follow your site's light/dark theme automatically.
- **Dual-plugin architecture** — MDAST plugin for detection, HAST plugin for safe rendering
- **Immune to Sätteri text transforms** — mermaid code is stored in `ctx.data` and inserted _after_ Sätteri processing
- **Feature detection** — `popFlags()` tells you whether the page has diagrams
- **TypeScript** — fully typed

## Install

```bash
bun add -D @xingwangzhe/satteri-mermaid beautiful-mermaid
```

Peer dependencies: `satteri >= 0.8.0`. `mermaid` is **no longer required** when using `ssg: true`.

## Usage

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import { katex } from "@nullpinter/satteri-katex";
import { photoswipe } from "@xingwangzhe/satteri-photoswipe";
import { mermaidMdast, mermaidHast } from "@xingwangzhe/satteri-mermaid";

export default defineConfig({
  markdown: {
    processor: satteri({
      mdastPlugins: [katex(), mermaidMdast()],
      hastPlugins: [
        photoswipe(),
        mermaidHast({
          ssg: true,                                // default: true — 构建时静态 SVG
          svgOptions: {
            bg: "var(--card-bg, #1a1b26)",          // CSS 变量跟随主题，逗号后是回退值
            fg: "var(--muted-text, #a9b1d6)",       // 同上
            font: "inherit",                         // 可选：字体
            padding: 40,                             // 可选：画布内边距
          },
        }),
        // 如果不需要 SSG，传统客户端渲染：
        // mermaidHast({ ssg: false }),
      ],
    }),
  },
});
```

The `responsive: true` (default) automatically adds responsive width — no extra CSS needed.Legacy client-side rendering: `mermaidHast({ ssg: false })` — outputs `<pre class="mermaid">code</pre>` for browser-side `mermaid.run()`.

## Options

| Option | Default | Controls |
|--------|---------|----------|
| `ssg` | `true` | `true` = build-time SVG, `false` = client-side `mermaid.run()` |
| `responsive` | `true` | 自动添加 `max-width:100%;height:auto`，无需手写 CSS |
| `langs` | `["mermaid"]` | Code block language identifiers to match |

### `svgOptions` — diagram colors

All color values accept CSS variables (e.g. `var(--card-bg)`) with a fallback hex after comma.

| Option | Default | Visual element |
|--------|---------|----------------|
| `bg` | `var(--card-bg, #1a1b26)` | Canvas background |
| `fg` | `var(--muted-text, #a9b1d6)` | Node labels, primary text |
| `line` | — | Edge lines / connectors |
| `accent` | — | Arrow heads, highlight nodes |
| `muted` | — | Edge labels, secondary text |
| `surface` | — | Node fill / box background |
| `border` | — | Node & group borders |

### `svgOptions` — layout

| Option | Default | Controls |
|--------|---------|----------|
| `font` | — | Font family (e.g. `"inherit"`) |
| `padding` | `40` | Canvas padding (px) |
| `nodeSpacing` | `24` | Horizontal spacing between nodes (px) |
| `layerSpacing` | `40` | Vertical spacing between layers (px) |

## How It Works

```
MDAST: code block → store in ctx.data → output empty placeholder
                       ↓
Sätteri processing (placeholder untouched)
                       ↓
HAST (ssg: true):  read code → renderMermaidSVG() → replace with <div class="mermaid"><svg>...</svg></div>
HAST (ssg: false): read code → restore <pre class="mermaid"> for client-side mermaid.run()
```

## Migration (v0.2.x → v0.3.0)

**If you were using client-side mermaid:**

1. Update to `v0.3.0` — `ssg: true` is the default.

2. From your Astro component, **remove** the client-side mermaid script:
```diff
- {props.hasMermaid && (
-   <script>
-     import mermaid from "mermaid";
-     mermaid.initialize({ startOnLoad: false, theme: "dark" });
-     document.addEventListener("astro:page-load", () => {
-       mermaid.run({ querySelector: ".mermaid" });
-     });
-   </script>
- )}
```

3. That's it — diagrams now render at build time with responsive width built-in, zero client JS.

## API

### `mermaidMdast(options?)`

Factory. Returns MDAST plugin for `mdastPlugins`.

### `mermaidHast(options?)`

Factory. Returns HAST plugin for `hastPlugins`. `ssg: true` by default.

### `createMermaidMdastPlugin(options?)`

Returns `{ plugin, popFlags }`. Use when you need `popFlags()`.

### `createMermaidHastPlugin(options?)`

Returns `{ plugin }`.

### `popFlags(): MermaidFlags`

Returns `{ hasMermaid: boolean }` and resets internal state.

## License

MIT
