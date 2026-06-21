# @xingwangzhe/satteri-mermaid

[English](README.md) | [中文文档](#)

> Satteri MDAST 插件：检测并转换 Mermaid 图表代码块

## 特性

- **零配置** — `mermaid()` 开箱即用，与 `katex()` 风格一致
- **可配置** — 通过参数自定义语言别名和渲染函数
- **特性检测** — `popFlags()` 告诉你当前页面是否包含图表，方便按需加载 mermaid 库
- **实例隔离** — 每次 `mermaid()` 调用返回独立插件实例
- **TypeScript** — 全类型安全

## 安装

```bash
bun add @xingwangzhe/satteri-mermaid
```

需要 `satteri >= 0.8.0` 和 `mermaid >= 11.0.0` 作为 peer dependencies。

## 使用

### 默认用法（覆盖大多数场景）

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

插件检测 ` ```mermaid ` 代码块，转换为 `<pre class="mermaid">` HTML。

### 自定义（多语言别名、自定义渲染）

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

### 高级用法（配合特性检测）

```ts
import { createMermaidPlugin } from "@xingwangzhe/satteri-mermaid";

const { plugin, popFlags } = createMermaidPlugin({ langs: ["mermaid"] });

// 处理后：
const { hasMermaid } = popFlags();
if (hasMermaid) {
  await import("mermaid");
  mermaid.run({ querySelector: ".mermaid" });
}
```

## API

### `mermaid(options?)`

工厂函数，返回 Satteri MDAST 插件。与 `katex()` 调用方式一致。

| 参数     | 类型                                     | 默认值                                        | 说明               |
| -------- | ---------------------------------------- | --------------------------------------------- | ------------------ |
| `langs`  | `string[]`                               | `["mermaid"]`                                 | 匹配的代码块语言   |
| `render` | `(code: string, node: Code) => string`   | `` (code) => `<pre class="mermaid">${code}</pre>` `` | 自定义 HTML 输出   |

### `createMermaidPlugin(options?)`

返回 `{ plugin, popFlags }`。需要 `popFlags` 做特性检测时使用。每次调用创建独立实例。

### `popFlags(): MermaidFlags`

返回 `{ hasMermaid: boolean }` 并重置内部状态。

## 工作原理

```
Markdown                    构建时                      浏览器
─────────                   ──────────                  ───────
```mermaid              mermaid() 检测             <pre class="mermaid">
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
