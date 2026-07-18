# @xingwangzhe/satteri-mermaid

[English](README.md) | 中文文档

> Sätteri MDAST + HAST 双插件：检测 Mermaid 图表并以 SSG 方式渲染为静态 SVG。
> **v0.5.0: [merman](https://github.com/Latias94/merman) (Rust WASM) — 支持全部 24 种图表类型，零浏览器依赖。**

## 特性

- **SSG SVG 渲染** — 通过 [`@mermanjs/web`](https://npm.im/@mermanjs/web)（Rust → WASM）在构建时渲染为静态内联 SVG。**无需客户端 `mermaid.js`，零运行时开销。**
- **24 种图表类型** — flowchart、sequence、class、state、gantt、pie、ER、gitgraph、mindmap、timeline、sankey 等，完整 mermaid 兼容。
- **主题预设** — 7 种内置主题（`one-dark`、`editor-dark`、`gruvbox-dark` 等），选一个即可。
- **自动响应式** — `responsive: true`（默认）自动移除固定宽高并添加 `width:100%`，无需额外 CSS。
- **双插件架构** — MDAST 插件检测代码块，HAST 插件渲染或还原。免疫 Sätteri 文本变换。
- **TypeScript** — 完整类型定义。

## 安装

```bash
bun add @xingwangzhe/satteri-mermaid @mermanjs/web
```

依赖 `satteri >= 0.8.0` 和 `@mermanjs/web >= 0.7.0`。**不需要**安装 `mermaid`。

## 使用

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
          responsive: true,       // 默认 true — 自动 width:100%
          theme: "one-dark",      // 主题预设
        }),
      ],
    }),
  },
});
```

## 主题

通过 `theme` 选择 7 种预设主题，可选 `themeOverrides` 覆盖个别颜色：

| 预设 | 外观 |
|--------|------------|
| `"one-dark"` | Atom One Dark |
| `"editor-dark"` | 深色编辑器（默认） |
| `"editor-light"` | 浅色编辑器 |
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

`themeOverrides` 支持 CSS 变量。可选角色：

| 角色 | 控制元素 |
|------|----------|
| `canvas` | 画布背景 |
| `surface` | 节点填充 |
| `text` | 主文字 / 标签 |
| `subtle_text` | 次要文字 / 边标签 |
| `border` | 节点和分组边框 |
| `line` | 连线 / 连接器 |
| `note_background` | 注释填充 |
| `note_text` | 注释文字 |
| `actor_background` | 时序图参与者填充 |
| `actor_border` | 参与者边框 |
| `actor_text` | 参与者标签 |
| `cluster_background` | 子图背景 |
| `cluster_border` | 子图边框 |
| `activation_border` | 激活条边框 |
| `error` / `warning` / `success` | 状态颜色 |

## 选项

| 选项 | 类型 | 默认值 | 说明 |
|--------|------|---------|------|
| `responsive` | `boolean` | `true` | SVG 自动 `width:100%;display:block` |
| `theme` | `HostThemePreset` | `"editor-dark"` | 预设主题 |
| `langs` | `string[]` | `["mermaid"]` | 匹配的代码块语言标识 |
| `font` | `string` | — | 图表文字字体 |

## 支持的图表类型

`architecture` `block` `c4` `class` `er` `flowchart` `gantt` `gitgraph` `info` `journey` `kanban` `mindmap` `packet` `pie` `quadrantchart` `radar` `requirement` `sankey` `sequence` `state` `timeline` `treemap` `venn` `xychart` `zenuml`

## 工作原理

```
Markdown 代码块 → MDAST 插件（存储代码，输出占位符）
  → Sätteri 处理（占位符不被破坏）
  → HAST 插件（merman WASM 渲染器 → 内联 SVG）
```

## API

| 导出 | 说明 |
|--------|-------------|
| `mermaidMdast(options?)` | MDAST 插件 — 注册到 `mdastPlugins` |
| `mermaidHast(options?)` | HAST 插件 — 注册到 `hastPlugins` |
| `createMermaidMdastPlugin(options?)` | 工厂函数：返回 `{ plugin, popFlags }` |
| `createMermaidHastPlugin(options?)` | 工厂函数：返回 `{ plugin }` |

## 迁移指南

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

> 旧版 `svgOptions` 不再支持，改用 `theme` 选择预设主题。

### v0.2.x → v0.3.0

删除客户端 mermaid 脚本和 `mermaid` 依赖。图表在构建时渲染。

## License

MIT
