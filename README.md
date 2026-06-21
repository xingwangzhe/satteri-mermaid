# @xingwangzhe/satteri-mermaid

[中文文档](README_CN.md) | [English](#)

> Satteri MDAST plugin for Mermaid diagram detection and transformation

## Features

- **Zero-config** — `mermaid()` just works, consistent with `katex()` style
- **Configurable** — custom language aliases and rendering via options
- **Feature detection** — `popFlags()` tells you whether the page has diagrams, so you can lazy-load mermaid
- **Isolated instances** — each `mermaid()` call returns an independent plugin instance
- **TypeScript** — fully typed

## Install

```bash
bun add @xingwangzhe/satteri-mermaid
```

Requires `satteri >= 0.8.0` and `mermaid >= 11.0.0` as peer dependencies.

## Usage

### Default (works for most cases)

```js
// astro.config.mjs
import { mermaid } from "@xingwangzhe/satteri-mermaid";

export default defineConfig({
  markdown: {
    processor: satteri({
      mdastPlugins: [katex(), mermaid()],
    }),
  },
});
```

The plugin detects ` ```mermaid ` code blocks and transforms them to `<pre class="mermaid">` HTML.

### Custom (multiple language aliases, custom rendering)

```js
import { mermaid } from "@xingwangzhe/satteri-mermaid";

mdastPlugins: [
  katex(),
  mermaid({
    langs: ["mermaid", "mmd", "diagram"],
    render: (code) => `<figure class="diagram"><pre class="mermaid">${code}</pre></figure>`,
  }),
],
```

### Advanced (with feature detection)

```ts
import { createMermaidPlugin } from "@xingwangzhe/satteri-mermaid";

const { plugin, popFlags } = createMermaidPlugin({ langs: ["mermaid"] });

// After processing:
const { hasMermaid } = popFlags();
if (hasMermaid) {
  await import("mermaid");
  mermaid.run({ querySelector: ".mermaid" });
}
```

## API

### `mermaid(options?)`

Factory function. Returns a Satteri MDAST plugin. Call it like `katex()`.

| Option   | Type                                   | Default                                      | Description                     |
| -------- | -------------------------------------- | -------------------------------------------- | ------------------------------- |
| `langs`  | `string[]`                             | `["mermaid"]`                                | Code block language identifiers |
| `render` | `(code: string, node: Code) => string` | `` (code) => `<pre class="mermaid">${code}</pre>` `` | Custom HTML output              |

### `createMermaidPlugin(options?)`

Returns `{ plugin, popFlags }`. Use this when you need access to `popFlags` for feature detection. Each call creates an isolated instance.

### `popFlags(): MermaidFlags`

Returns `{ hasMermaid: boolean }` and resets internal state.

## How It Works

```
Markdown                    Build time                  Browser
─────────                   ──────────                  ───────
```mermaid              mermaid() detects           <pre class="mermaid">
graph TD                   lang === "mermaid"            graph TD
  A --> B        ──►       returns rawHtml          ──►   A --> B
```                                                         </pre>
                                                              │
                                                    mermaid.run()
                                                          │
                                                          ▼
                                                       SVG diagram
```

## Development

```bash
bun install
bun run build   # vite build + tsc → dist/
bun run test    # vitest
bun run lint    # oxlint
bun run fmt     # oxfmt
```

## License

MIT
