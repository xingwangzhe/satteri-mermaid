# @xingwangzhe/satteri-mermaid

[English](README.md) | [中文文档](README_CN.md)

> Sätteri MDAST + HAST 双插件：通过 [mermaid-rs](https://github.com/1jehuang/mermaid-rs-renderer)（napi-rs）在构建时渲染 Mermaid 图表为静态 SVG。**23 种图表类型，~3ms/图，零客户端 JS。**

## 特性

- **SSG SVG 渲染** — 通过 napi-rs 原生绑定在构建时渲染为静态内联 SVG。无 WASM，无 `mermaid.js`，零运行时开销。
- **23 种图表类型** — flowchart、sequence、class、state、gantt、pie、ER、gitgraph、mindmap、timeline、sankey 等。
- **5 种主题预设** — `modern`、`dark`、`default`、`forest`、`neutral` — 外加完整的逐字段颜色自定义。
- **ssg 开关** — `ssg: true` 构建时产出 SVG；`ssg: false` 保留原始代码块，交由客户端 mermaid.js 渲染。
- **自动响应式** — `responsive: true`（默认）自动移除固定宽高并添加 `width:100%`。
- **完整 mermaid-rs 参数覆盖** — 所有主题颜色、Git 图颜色、饼图样式、排版、布局和渲染选项均已暴露。
- **双插件架构** — MDAST 插件检测代码块，HAST 插件渲染或还原。免疫 Sätteri 文本变换。
- **TypeScript** — 完整类型定义。

## 安装

```bash
npm install @xingwangzhe/satteri-mermaid
```

依赖 `satteri >= 0.8.0`。无需其他运行时依赖 — napi-rs 渲染器已内置。

## 使用

### 基础配置

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

最简单的配置 — 全部使用默认值：`ssg: true`、`theme: "modern"`、`responsive: true`。

### 完整配置示例

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import { mermaidMdast, mermaidHast } from "@xingwangzhe/satteri-mermaid";

export default defineConfig({
  markdown: {
    processor: satteri({
      // MDAST 插件：检测代码块并存储原始 mermaid 代码
      mdastPlugins: [
        mermaidMdast({
          langs: ["mermaid", "mmd"], // 匹配多种语言标识，默认 ["mermaid"]
        }),
      ],

      // HAST 插件：将代码块替换为 SVG 或保留原始代码
      hastPlugins: [
        mermaidHast({
          // ── 渲染模式 ─────────────────────────────────────
          ssg: true,           // true=构建时渲染 SVG（默认）
                               // false=输出 <pre class="mermaid"> 给客户端

          // ── 响应式 ──────────────────────────────────────
          responsive: true,    // 自动移除 width/height，添加 width:100%

          // ── 主题 ────────────────────────────────────────
          theme: "dark",       // "modern" | "dark" | "default" | "forest" | "neutral"

          // ── 排版 ────────────────────────────────────────
          font: "Fira Code, monospace",
          fontSize: 14,

          // ── 布局 ────────────────────────────────────────
          nodeSpacing: 60,     // 节点垂直间距 (px)
          rankSpacing: 80,     // 层级水平间距 (px)
          preferredAspectRatio: 1.778,  // 16:9 宽高比

          // ── 渲染选项 ────────────────────────────────────
          fastTextMetrics: false,  // 使用快速文本宽度估算提升速度

          // ── 逐色覆盖（全部支持 CSS 变量）───────────────
          themeOverrides: {
            // 画布
            background: "#0f172a",

            // 节点
            primaryColor: "#1e293b",
            primaryBorderColor: "#ff6600",
            primaryTextColor: "#e2e8f0",

            // 备用 / 弱化表面
            secondaryColor: "#334155",
            tertiaryColor: "#475569",
            textColor: "#94a3b8",

            // 连线
            lineColor: "#ff6600",
            edgeLabelBackground: "#1e293b",

            // 子图 / Cluster
            clusterBackground: "#0a0f1e",
            clusterBorder: "#334155",

            // 时序图
            sequenceActorFill: "#1e293b",
            sequenceActorBorder: "#475569",
            sequenceActorLine: "#334155",
            sequenceNoteFill: "#1e293b",
            sequenceNoteBorder: "#f59e0b",
            sequenceActivationFill: "#065f46",
            sequenceActivationBorder: "#34d399",

            // Git 图 — 分支颜色 (8 slots)
            git0: "#ff0000",  git1: "#00ff00",
            git2: "#0000ff",  git3: "#ffff00",
            git4: "#ff00ff",  git5: "#00ffff",
            git6: "#800000",  git7: "#008000",
            // Git — 反色
            gitInv0: "#800000", gitInv1: "#008000",
            // Git — 分支标签颜色
            gitBranchLabel0: "white", gitBranchLabel1: "black",
            // Git — 提交/标签
            gitCommitLabelColor: "#333",
            gitCommitLabelBackground: "#eee",
            gitTagLabelColor: "#111",
            gitTagLabelBackground: "#ddd",
            gitTagLabelBorder: "#999",

            // 饼图 — 12 色板
            pie1: "#ff0000", pie2: "#00ff00", pie3: "#0000ff",
            pie4: "#ffff00", pie5: "#ff00ff", pie6: "#00ffff",
            pie7: "#800000", pie8: "#008000", pie9: "#000080",
            pie10: "#808000", pie11: "#800080", pie12: "#008080",
            // 饼图 — 样式
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

            // 排版（也可在此设置）
            fontFamily: "Fira Code, monospace",
            fontSize: 14,
          },
        }),
      ],
    }),
  },
});
```

### SSG 模式（默认）

```js
// 构建时渲染 — 零客户端 JS
mermaidHast({ ssg: true })
```

所有 ` ```mermaid ` 代码块在 `astro build` 时被替换为内联 `<svg>`：

```html
<div class="mermaid" data-mermaid-ssg="true">
  <svg viewBox="..." style="width:100%;display:block">...</svg>
</div>
```

### 客户端模式

```js
// 保留原始代码块，交给客户端 mermaid.js
mermaidHast({ ssg: false })
```

此时插件只输出 `<pre class="mermaid">code</pre>`，在 HTML 中引入 mermaid.js 即可：

```html
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  mermaid.initialize({ startOnLoad: true });
</script>
```

## 主题预设

通过 `theme` 选择 5 种预设主题：

| 预设 | 外观 |
|---|---|
| `"modern"` | 简洁石板色调（默认）— Inter, 14px |
| `"dark"` | 深色背景，浅色元素 |
| `"default"` | 经典 Mermaid 主题 |
| `"forest"` | 绿色系 |
| `"neutral"` | 灰色系 |

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

## 选项参考

### MermaidPluginOptions

| 选项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `langs` | `string[]` | `["mermaid"]` | 匹配的代码块语言标识 |
| `ssg` | `boolean` | `true` | 构建时 SVG 渲染 |
| `responsive` | `boolean` | `true` | SVG 自动 `width:100%;display:block` |
| `theme` | `ThemePreset` | `"modern"` | 预设主题 |
| `font` | `string` | — | 图表文字字体 |
| `fontSize` | `number` | — | 字号 (px) |
| `nodeSpacing` | `number` | — | 节点垂直间距 (px) |
| `rankSpacing` | `number` | — | 层级水平间距 (px) |
| `preferredAspectRatio` | `number` | — | 目标宽高比（如 1.778 = 16:9） |
| `fastTextMetrics` | `boolean` | `false` | 使用近似文本宽度加速渲染 |
| `themeOverrides` | `ThemeOverrides` | — | 逐字段颜色和样式覆盖（支持 CSS 变量） |

### ThemeOverrides — 节点与连线颜色

| 字段 | 控制元素 |
|---|---|
| `background` | 画布背景 |
| `primaryColor` | 节点填充 |
| `secondaryColor` | 备用表面填充 |
| `tertiaryColor` | 弱化表面填充 |
| `primaryTextColor` | 主文字 / 标签 |
| `textColor` | 次要文字 / 边标签 |
| `primaryBorderColor` | 节点和分组边框 |
| `lineColor` | 连线 / 连接器 |
| `edgeLabelBackground` | 边标签背景 |
| `clusterBackground` | 子图背景 |
| `clusterBorder` | 子图边框 |

### ThemeOverrides — 时序图

| 字段 | 控制元素 |
|---|---|
| `sequenceActorFill` | 参与者填充 |
| `sequenceActorBorder` | 参与者边框 |
| `sequenceActorLine` | 参与者生命线 |
| `sequenceNoteFill` | 注释填充 |
| `sequenceNoteBorder` | 注释边框 |
| `sequenceActivationFill` | 激活条填充 |
| `sequenceActivationBorder` | 激活条边框 |

### ThemeOverrides — Git 图（各 8 个槽位）

| 槽位类型 | 字段模式 |
|---|---|
| 分支颜色 | `git0` … `git7` |
| 反色 | `gitInv0` … `gitInv7` |
| 分支标签颜色 | `gitBranchLabel0` … `gitBranchLabel7` |
| 提交标签 | `gitCommitLabelColor`、`gitCommitLabelBackground` |
| Tag 标签 | `gitTagLabelColor`、`gitTagLabelBackground`、`gitTagLabelBorder` |

### ThemeOverrides — 饼图

| 槽位 / 样式 | 字段 |
|---|---|
| 12 色板 | `pie1` … `pie12` |
| 标题 | `pieTitleTextSize`、`pieTitleTextColor` |
| 扇区标签 | `pieSectionTextSize`、`pieSectionTextColor` |
| 图例 | `pieLegendTextSize`、`pieLegendTextColor` |
| 描边 | `pieStrokeColor`、`pieStrokeWidth`、`pieOuterStrokeWidth`、`pieOuterStrokeColor` |
| 透明度 | `pieOpacity` |

### ThemeOverrides — 排版

| 字段 | 控制元素 |
|---|---|
| `fontFamily` | 字体族字符串 |
| `fontSize` | 字号 (px) |

## 支持的图表类型

`architecture` `block` `c4` `class` `er` `flowchart` `gantt` `gitgraph` `info` `journey` `kanban` `mindmap` `packet` `pie` `quadrantchart` `radar` `requirement` `sankey` `sequence` `state` `timeline` `treemap` `venn` `xychart`

## 工作原理

```
Markdown 代码块 → MDAST 插件（存储代码，输出占位符）
  → Sätteri 处理（占位符不被破坏）
  → HAST 插件
      ssg: true  → napi-rs 渲染器 → 内联 SVG
      ssg: false → <pre class="mermaid">code</pre>（客户端渲染）
```

## API

| 导出 | 说明 |
|---|---|
| `mermaidMdast(options?)` | MDAST 插件 — 注册到 `mdastPlugins` |
| `mermaidHast(options?)` | HAST 插件 — 注册到 `hastPlugins` |
| `createMermaidMdastPlugin(options?)` | 工厂函数：返回 `{ plugin, popFlags }` |
| `createMermaidHastPlugin(options?)` | 工厂函数：返回 `{ plugin }` |
| `renderMermaidSVG(code, opts)` | 直接调用底层渲染器（支持所有 napi-rs 参数） |

## 平台支持

| 平台 | 架构 |
|---|---|
| Linux | x64、arm64 |
| macOS | x64、arm64（Apple Silicon） |
| Windows | x64 |

## License

MIT
