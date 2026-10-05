# 配置项与主题

本说明对应 `@xingwangzhe/satteri-mermaid@0.8.1`、Merman 0.7.0 和 Sätteri 0.10.5。注册 `mermaidMdast()` 与 `mermaidHast()` 两个插件；直接渲染则调用 `renderMermaidSVG()`。

## 主题名称

`theme` 有 **11 个预设**，另有 1 个兼容别名 `modern`，不是 12 个独立主题。预览页面展示全部 11 个预设。

| 名称               | 用途 / 主题系列                          |
| ------------------ | ---------------------------------------- |
| `default`          | 默认 Mermaid 主题；插件默认值            |
| `base`             | 基础主题，适合搭配 `themeVariables` 定制 |
| `dark`             | Mermaid 暗色主题                         |
| `forest`           | Mermaid forest 主题                      |
| `neutral`          | Mermaid neutral 主题                     |
| `neo`              | Neo 系列浅色主题                         |
| `neo-dark`         | Neo 系列暗色主题                         |
| `redux`            | Redux 系列浅色主题                       |
| `redux-dark`       | Redux 系列暗色主题                       |
| `redux-color`      | Redux 彩色主题                           |
| `redux-dark-color` | Redux 暗色彩色主题                       |
| `modern`           | 旧版兼容别名，映射到 `default`           |

Merman 0.7.0 上游还提供 7 个**宿主主题预设**：`editor-light`、`editor-dark`、`one-dark`、`gruvbox-light`、`gruvbox-dark`、`ayu-light`、`ayu-dark`。它们是另一套宿主配色接口，本插件当前没有暴露该接口，不能把这些名称传给 `theme`，也不能把它们加进本插件的预设数量。

## 插件选项

| 选项                   | 类型 / 默认值                                    | 输出或行为                                                       |
| ---------------------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| `langs`                | `string[]` / `["mermaid"]`                       | MDAST 匹配代码块语言；自定义语言时两个插件传同一配置             |
| `ssg`                  | `boolean` / `true`                               | 构建时生成 SVG；`false` 保留转义的代码，客户端渲染器由宿主提供   |
| `responsive`           | `boolean` / `true`                               | 只移除 SVG 根节点尺寸并设置容器宽度，保留内部图形尺寸            |
| `theme`                | 上表主题名 / `default`                           | 主题预设                                                         |
| `font`                 | `string` / 引擎默认值                            | 字体族；对应直接渲染的 `fontFamily`                              |
| `fontSize`             | `number` / 引擎默认值                            | 字号，单位 px                                                    |
| `nodeSpacing`          | `number` / 引擎默认值                            | 流程图同层节点间距                                               |
| `rankSpacing`          | `number` / 引擎默认值                            | 流程图层级间距                                                   |
| `siteConfig`           | `Record<string, unknown>` / 无                   | 完整 Mermaid 配置；例如 `flowchart.curve`、`sequence` 等图表配置 |
| `themeVariables`       | `Record<string, unknown>` / 无                   | Mermaid 主题变量，优先于旧版逐色覆盖                             |
| `themeOverrides`       | `ThemeOverrides` / 无                            | 旧版逐色选项的兼容映射，详见下表                                 |
| `themeCSS`             | `string` / 无                                    | 上游 Mermaid 主题 CSS                                            |
| `scopedCSS`            | `string` / 无                                    | 通过 Merman 后处理器添加图表作用域 CSS，适合线宽等控制           |
| `viewportWidth`        | `number` / 引擎默认值                            | 有限且大于零的布局视口宽度，不等于固定 SVG 宽度                  |
| `viewportHeight`       | `number` / 引擎默认值                            | 有限且大于零的布局视口高度，不保证指定宽高比                     |
| `fastTextMetrics`      | `boolean` / `false`                              | 使用确定性文本估算；可能改变布局，不等于固定性能提升             |
| `onError`              | `throw` / `warn-and-code` / `code`；默认 `throw` | 抛错阻止构建，或警告并保留代码，或静默保留代码                   |
| `preferredAspectRatio` | 已弃用                                           | Merman 不支持，传入时明确抛错；视口尺寸的语义不同                |

默认原生配置为 `theme: "default"`、`htmlLabels: false`、`securityLevel: "strict"`。`siteConfig` 可覆盖这些值；自定义安全配置、CSS 或输入的效果由调用者及上游实现决定。默认严格配置经过 JavaScript 链接不进入流程图 SVG 的测试，但不是任意输入的完整净化承诺。

## 旧版颜色选项映射

字符串类型的颜色可以写入 SVG/CSS，但 CSS 变量是否参与布局及派生配色取决于上游实现。以下列出接口中的全部分组；某个变量被接受不保证所有图表都会使用它。

| `themeOverrides` 字段                                                                          | 对应 Mermaid 变量                                       |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `fontFamily`、`fontSize`                                                                       | 同名；数字字号转换为 `px` 字符串                        |
| `primaryColor`、`primaryBorderColor`、`primaryTextColor`                                       | 同名                                                    |
| `lineColor`、`secondaryColor`、`tertiaryColor`、`textColor`、`edgeLabelBackground`             | 同名                                                    |
| `background`                                                                                   | `background`，并通过原生后处理器设置 SVG 根节点背景     |
| `clusterBackground`、`clusterBorder`                                                           | `clusterBkg`、`clusterBorder`                           |
| `sequenceActorFill`、`sequenceActorBorder`、`sequenceActorLine`                                | `actorBkg`、`actorBorder`、`actorLineColor`             |
| `sequenceNoteFill`、`sequenceNoteBorder`                                                       | `noteBkgColor`、`noteBorderColor`                       |
| `sequenceActivationFill`、`sequenceActivationBorder`                                           | `activationBkgColor`、`activationBorderColor`           |
| `git0`…`git7`                                                                                  | 同名，8 个主色槽                                        |
| `gitInv0`…`gitInv7`                                                                            | 同名，8 个反色槽                                        |
| `gitBranchLabel0`…`gitBranchLabel7`                                                            | 同名，8 个分支标签色槽                                  |
| `gitCommitLabelColor`、`gitCommitLabelBackground`                                              | `commitLabelColor`、`commitLabelBackground`             |
| `gitTagLabelColor`、`gitTagLabelBackground`、`gitTagLabelBorder`                               | `tagLabelColor`、`tagLabelBackground`、`tagLabelBorder` |
| `pie1`…`pie12`                                                                                 | 同名，12 个色板槽                                       |
| `pieTitleTextSize`、`pieSectionTextSize`、`pieLegendTextSize`                                  | 同名，数字转换为 `px` 字符串                            |
| `pieTitleTextColor`、`pieSectionTextColor`、`pieLegendTextColor`                               | 同名                                                    |
| `pieStrokeColor`、`pieStrokeWidth`、`pieOuterStrokeWidth`、`pieOuterStrokeColor`、`pieOpacity` | 同名；线宽与透明度为数字                                |

## 优先级与示例

主题变量依次合并：引擎默认值 → `siteConfig.themeVariables` → `themeOverrides` → `themeVariables`。顶层 `theme`、`themeCSS`、`nodeSpacing`、`rankSpacing` 覆盖 `siteConfig` 对应项。`themeOverrides.fontFamily/fontSize` 覆盖顶层 `font/fontSize`。调用者的配置对象不会被修改。

```ts
import { mermaidMdast, mermaidHast } from "@xingwangzhe/satteri-mermaid";

const options = {
  theme: "neo-dark" as const,
  themeVariables: { primaryColor: "#243347", primaryBorderColor: "#91baff" },
  scopedCSS: ".node rect { stroke-width: 3px; }",
  siteConfig: { flowchart: { curve: "linear" } },
  onError: "throw" as const,
};
// markdownToHtml / mdxToJs 的选项中：
const plugins = {
  mdastPlugins: [mermaidMdast(options)],
  hastPlugins: [mermaidHast(options)],
};
```

## 直接渲染 API

`renderMermaidSVG(code, options)` 接收上述渲染配置以及旧版颜色字段，但颜色字段直接放在 `options` 顶层，不使用 `themeOverrides` 容器。字体族使用 `fontFamily`。`langs`、`ssg`、`responsive`、`onError` 仅属于插件，不应传给直接渲染器；直接渲染失败始终抛错。

另有 `diagramId?: string`：省略时自动生成同一进程内不重复的 ID；指定后输出可重复，但调用者应确保同页每张图的 ID 唯一。

```ts
import { renderMermaidSVG } from "@xingwangzhe/satteri-mermaid";

const svg = renderMermaidSVG("flowchart LR\n A --> B", {
  theme: "forest",
  fontFamily: "sans-serif",
  primaryColor: "#dcefe0",
  diagramId: "overview",
});
```

`renderMermaidSVG()` 的主题名不区分大小写，自动去掉图源前后空白。`supportedDiagrams()` 查询编译引擎的实际目录；目录条目不保证全部语法或浏览器渲染一致性。所有原生调用采用延迟加载；仅导入插件并使用 `ssg: false` 不会加载原生绑定。
