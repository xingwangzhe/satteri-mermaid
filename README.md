# @xingwangzhe/satteri-mermaid

[中文文档](README_CN.md) | [English](#)

> Satteri MDAST plugin for Mermaid diagram detection and transformation

## Features

- **Zero-config** — works out of the box with sensible defaults
- **Configurable** — custom language aliases and rendering via `createMermaidPlugin`
- **Feature detection** — `popFlags()` tells you whether the page has diagrams, so you can lazy-load mermaid
- **Isolated instances** — each plugin instance maintains independent state
- **TypeScript** — fully typed

## Install

```bash
bun add @xingwangzhe/satteri-mermaid
```

Requires `satteri >= 0.8.0` and `mermaid >= 11.0.0` as peer dependencies.

## Usage

### Default (works for most cases)

```ts
import { mermaidPlugin, popFlags } from "@xingwangzhe/satteri-mermaid";

// In your Satteri / Astro config:
// astro.config.mjs
import { mermaidPlugin } from "@xingwangzhe/satteri-mermaid";

export default defineConfig({
  markdown: {
    processor: satteri({
      mdastPlugins: [mermaidPlugin],
    }),
  },
});
```

The plugin detects ` ```mermaid ` code blocks and transforms them to `<pre class="mermaid">` HTML. After processing all pages, use `popFlags()` to check if the current page needs the mermaid runtime:

```ts
const { hasMermaid } = popFlags();
// Only load mermaid.js when needed
if (hasMermaid) {
  await import("mermaid");
  mermaid.run({ querySelector: ".mermaid" });
}
```

### Custom (multiple language aliases, custom rendering)

```ts
import { createMermaidPlugin } from "@xingwangzhe/satteri-mermaid";

const { plugin, popFlags } = createMermaidPlugin({
  langs: ["mermaid", "mmd", "diagram"],
  render: (code) => `<figure class="diagram"><pre class="mermaid">${code}</pre></figure>`,
});
```

## API

### `mermaidPlugin`

Default plugin instance. Equivalent to `createMermaidPlugin()`.

### `popFlags(): MermaidFlags`

Returns `{ hasMermaid: boolean }` and resets internal state. Call after processing to know if a page contains mermaid diagrams.

### `createMermaidPlugin(options?)`

| Option   | Type                                       | Default                                    | Description                         |
| -------- | ------------------------------------------ | ------------------------------------------ | ----------------------------------- |
| `langs`  | `string[]`                                 | `["mermaid"]`                              | Code block language identifiers     |
| `render` | `(code: string, node: Code) => string`     | `` (code) => `<pre class="mermaid">${code}</pre>` `` | Custom HTML output |

Returns `{ plugin, popFlags }` — each instance has isolated state.

## How It Works

```
Markdown                    Build time                  Browser
─────────                   ──────────                  ───────
```mermaid              mermaidPlugin detects       <pre class="mermaid">
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
