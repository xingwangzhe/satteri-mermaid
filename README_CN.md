# @xingwangzhe/satteri-mermaid

[English](README.md) | [中文文档](#)

> Satteri MDAST 插件：检测并转换 Mermaid 图表代码块

## 特性

- **零配置** — 开箱即用，默认行为覆盖大多数场景
- **可配置** — 通过 `createMermaidPlugin` 自定义语言别名和渲染函数
- **特性检测** — `popFlags()` 告诉你当前页面是否包含图表，方便按需加载 mermaid 库
- **实例隔离** — 每个插件实例维护独立状态，互不干扰
- **TypeScript** — 全类型安全

## 安装

```bash
bun add @xingwangzhe/satteri-mermaid
```

需要 `satteri >= 0.8.0` 和 `mermaid >= 11.0.0` 作为 peer dependencies。

## 使用

### 默认用法（覆盖大多数场景）

```ts
import { mermaidPlugin, popFlags } from "@xingwangzhe/satteri-mermaid";

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

插件检测 Markdown 中的 ` ```mermaid ` 代码块，转换为 `<pre class="mermaid">` HTML。处理完后用 `popFlags()` 判断是否需要加载 mermaid 运行时：

```ts
const { hasMermaid } = popFlags();
// 仅当页面有图表时才加载 mermaid.js
if (hasMermaid) {
  await import("mermaid");
  mermaid.run({ querySelector: ".mermaid" });
}
```

### 自定义（多语言别名、自定义渲染）

```ts
import { createMermaidPlugin } from "@xingwangzhe/satteri-mermaid";

const { plugin, popFlags } = createMermaidPlugin({
  langs: ["mermaid", "mmd", "diagram"],
  render: (code) => `<figure class="diagram"><pre class="mermaid">${code}</pre></figure>`,
});
```

## API

### `mermaidPlugin`

默认插件实例，等同于 `createMermaidPlugin()`。

### `popFlags(): MermaidFlags`

返回 `{ hasMermaid: boolean }` 并重置内部状态。处理完页面后调用，判断是否包含 mermaid 图表。

### `createMermaidPlugin(options?)`

| 参数     | 类型                                       | 默认值                                      | 说明               |
| -------- | ------------------------------------------ | ------------------------------------------- | ------------------ |
| `langs`  | `string[]`                                 | `["mermaid"]`                               | 匹配的代码块语言   |
| `render` | `(code: string, node: Code) => string`     | `` (code) => `<pre class="mermaid">${code}</pre>` `` | 自定义 HTML 输出   |

返回 `{ plugin, popFlags }` — 每个实例状态独立。

## 工作原理

```
Markdown                    构建时                      浏览器
─────────                   ──────────                  ───────
```mermaid              mermaidPlugin 检测          <pre class="mermaid">
graph TD                   lang === "mermaid"            graph TD
  A --> B        ──►       返回 rawHtml            ──►   A --> B
```                                                         </pre>
                                                              │
                                                    mermaid.run()
                                                          │
                                                          ▼
                                                       SVG 图表
```

## 开发

```bash
bun install
bun run build   # vite build + tsc → dist/
bun run test    # vitest
bun run lint    # oxlint
bun run fmt     # oxfmt
```

## 许可

MIT
