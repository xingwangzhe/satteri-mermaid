# @xingwangzhe/satteri-mermaid

[English](README.md) | 中文文档

> Sätteri MDAST + HAST 双插件，用于检测和渲染 Mermaid 图表。
> **v0.3.0: 支持构建时 SSG 静态 SVG 渲染，零客户端 JS。**

## 特性

- **SSG SVG 渲染** — `ssg: true`（默认）通过 [`beautiful-mermaid`](https://github.com/lukilabs/beautiful-mermaid) 在构建时将图表渲染为静态 SVG。**无需客户端 `mermaid.js`。**
- **自适应明暗主题** — 默认 SVG 颜色使用 CSS 变量（`var(--card-bg)`、`var(--muted-text)`），自动跟随站点主题切换。
- **双插件架构** — MDAST 插件负责检测，HAST 插件负责安全渲染
- **免疫 Sätteri 文本变换** — mermaid 代码存储在 `ctx.data` 中，在 Sätteri 处理后插入，避免 `{"` 被破坏
- **特性检测** — `popFlags()` 可查询当前页面是否包含图表
- **TypeScript** — 完整类型定义

## 安装

```bash
bun add -D @xingwangzhe/satteri-mermaid beautiful-mermaid
```

Peer dependencies: `satteri >= 0.8.0`。使用 `ssg: true` 时**不再需要** `mermaid`。

## 使用

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
          ssg: true,                                // 默认 true — 构建时静态 SVG
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

`responsive: true`（默认）自动添加自适应宽度——无需额外 CSS。

传统客户端渲染：`mermaidHast({ ssg: false })` — 输出 `<pre class="mermaid">code</pre>` 供浏览器端 `mermaid.run()`。

## 选项

| 选项 | 默认值 | 说明 |
|--------|---------|------|
| `ssg` | `true` | `true` = 构建时静态 SVG，`false` = 客户端 `mermaid.run()` |
| `responsive` | `true` | 自动添加 `width:100%`，无需手写 CSS |
| `langs` | `["mermaid"]` | 要匹配的代码块语言标识符 |

### `svgOptions` — 图表配色

所有颜色值支持 CSS 变量（如 `var(--card-bg)`），逗号后为回退色值。

| 选项 | 默认值 | 控制元素 |
|--------|---------|----------|
| `bg` | `var(--card-bg, #1a1b26)` | 画布背景 |
| `fg` | `var(--muted-text, #a9b1d6)` | 节点标签、主文字 |
| `line` | — | 连线 / 连接器 |
| `accent` | — | 箭头、高亮节点 |
| `muted` | — | 边标签、次要文字 |
| `surface` | — | 节点填充 / 盒背景 |
| `border` | — | 节点和分组边框 |

### `svgOptions` — 布局

| 选项 | 默认值 | 说明 |
|--------|---------|------|
| `font` | — | 字体（如 `"inherit"`） |
| `padding` | `40` | 画布内边距（px） |
| `nodeSpacing` | `24` | 节点水平间距（px） |
| `layerSpacing` | `40` | 层级垂直间距（px） |

### `svgOptions` — 布局

| 选项 | 默认值 | 说明 |
|--------|---------|------|
| `font` | — | 字体（如 `"inherit"`） |
| `padding` | `40` | 画布内边距（px） |
| `nodeSpacing` | `24` | 节点水平间距（px） |
| `layerSpacing` | `40` | 层级垂直间距（px） |

## 工作原理

```
MDAST: 代码块 → 存入 ctx.data → 输出空占位符
                       ↓
Sätteri 处理（占位符不会被修改）
                       ↓
HAST (ssg: true):  读取代码 → renderMermaidSVG() → 替换为 <div class="mermaid"><svg>...</svg></div>
HAST (ssg: false): 读取代码 → 还原为 <pre class="mermaid"> 供客户端 mermaid.run()
```

## 迁移（v0.2.x → v0.3.0）

**如果你之前使用客户端 mermaid 渲染：**

1. 升级到 `v0.3.0`，`ssg: true` 默认启用。

2. 从 Astro 组件中**删除**客户端 mermaid 脚本：
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

3. 如果其他地方不再使用，从 `package.json` **删除** `mermaid` 依赖。

4. 完成——图表在构建时渲染，自适应宽度内置，零客户端 JS。

## API

### `mermaidMdast(options?)`

工厂函数。返回 MDAST 插件，注册到 `mdastPlugins`。

### `mermaidHast(options?)`

工厂函数。返回 HAST 插件，注册到 `hastPlugins`。`ssg: true` 为默认值。

### `createMermaidMdastPlugin(options?)`

返回 `{ plugin, popFlags }`。需要 `popFlags()` 时使用。

### `createMermaidHastPlugin(options?)`

返回 `{ plugin }`。

### `popFlags(): MermaidFlags`

返回 `{ hasMermaid: boolean }` 并重置内部状态。

## License

MIT
