# @xingwangzhe/satteri-mermaid

在 Sätteri 编译阶段，把 Mermaid 代码块渲染为内联 SVG。后端通过 napi-rs 调用已发布的 **Merman 0.7.0** Rust 渲染器；插件使用 **Sätteri 0.10.5** 验证。静态渲染不需要 Mermaid 客户端脚本、DOM、浏览器或 WASM 运行时。

[English](./README.md)

本文对应 **0.8.0 版本**，后端为 Merman 原生渲染器。全部配置、11 个主题预设、兼容别名及颜色映射见 [配置与主题说明](./docs/configuration.zh-CN.md)，改动记录见 [CHANGELOG](./CHANGELOG.md)。

```sh
bun add @xingwangzhe/satteri-mermaid@0.8.0 satteri@0.10.5
```

要求 **Node.js 22.14.0 或更新版本**，原生绑定使用 Node-API 10。包入口为 **ES 模块**。发布矩阵提供 Linux glibc x64/arm64、macOS arm64、Windows x64 原生构建；其他平台需要自行构建兼容二进制。当前不提供 macOS x64、Windows arm64、Linux musl 二进制。

````ts
import { markdownToHtml } from "satteri";
import { mermaidMdast, mermaidHast } from "@xingwangzhe/satteri-mermaid";

const source = "```mermaid\nflowchart TD\n A[Start] --> B[Done]\n```";
const result = await markdownToHtml(source, {
  mdastPlugins: [mermaidMdast()],
  hastPlugins: [mermaidHast({ theme: "default" })],
});
console.log(result.html);
````

两个插件必须一起注册。MDAST 保存原始代码，HAST 渲染代码并替换占位节点。同样的注册方式适用于 `mdxToJs`；MDX 路径写入结构化 SVG 节点，无须调用者启用原始 HTML 编译。与其他 HAST 插件组合时，应在会丢弃占位符或共享数据的转换之前运行 Mermaid 插件。

默认输出为 `<div class="mermaid" data-mermaid-ssg="true">`，内部 SVG 带有 `viewBox`、可读文字标签及独立的图表 ID。自适应模式只移除 SVG 根节点的尺寸，保留内部矩形等图形的尺寸。

| 选项                              | 默认值        | 作用                                                                                  |
| --------------------------------- | ------------- | ------------------------------------------------------------------------------------- |
| `langs`                           | `["mermaid"]` | 匹配的代码块语言                                                                      |
| `ssg`                             | `true`        | 编译时渲染；设为 `false` 时输出转义的 `<pre class="mermaid">`，客户端渲染器由宿主提供 |
| `responsive`                      | `true`        | SVG 适应容器宽度                                                                      |
| `theme`                           | `"default"`   | Merman 主题预设                                                                       |
| `font`、`fontSize`                | 引擎默认值    | 字体族与像素字号                                                                      |
| `nodeSpacing`、`rankSpacing`      | 引擎默认值    | Mermaid 流程图间距                                                                    |
| `siteConfig`                      | 引擎默认值    | 完整 Mermaid 配置对象                                                                 |
| `themeVariables`                  | —             | Mermaid 主题变量覆盖                                                                  |
| `themeCSS`                        | —             | Mermaid 主题 CSS                                                                      |
| `scopedCSS`                       | —             | 通过 Merman SVG 后处理器添加作用域 CSS                                                |
| `themeOverrides`                  | —             | 旧版逐色选项的兼容映射                                                                |
| `viewportWidth`、`viewportHeight` | 引擎默认值    | 有限且大于零的布局视口尺寸；不保证 SVG 固定宽高比                                     |
| `fastTextMetrics`                 | `false`       | 使用 Merman 的确定性文本测量器                                                        |
| `onError`                         | `"throw"`     | 失败时抛错；`"warn-and-code"` 警告并保留代码；`"code"` 静默保留代码                   |

支持的主题名称为 `default`、`base`、`dark`、`forest`、`neutral`、`neo`、`neo-dark`、`redux`、`redux-dark`、`redux-color`、`redux-dark-color`。保留 `modern` 作为 `default` 的兼容别名；直接渲染 API 的主题名不区分大小写。

```ts
mermaidHast({
  theme: "base",
  themeVariables: { primaryColor: "#e8f3ff", primaryBorderColor: "#2864a0" },
  scopedCSS: ".node rect { stroke-width: 3px; }",
  siteConfig: { flowchart: { curve: "linear" } },
  onError: "throw",
});
```

主题变量优先级从低到高为引擎默认值、`siteConfig`、旧版逐色覆盖、显式 `themeVariables`。顶层 `theme`、`themeCSS` 和间距选项覆盖 `siteConfig` 中对应项；不会修改调用者传入的配置对象。具体变量和语法由 Merman 实现，接受配置键不代表所有图表都会应用该配置。

原生默认配置为 `htmlLabels: false`、`securityLevel: "strict"`。测试确认默认流程图输出不会保留 JavaScript 链接。这是特定默认配置的验证，不代表任意自定义配置、CSS 或不可信输入都经过完整安全净化。

也可以直接调用渲染器或查询引擎目录：

```ts
import { renderMermaidSVG, supportedDiagrams } from "@xingwangzhe/satteri-mermaid";

const svg = renderMermaidSVG("flowchart LR\n A --> B", {
  theme: "dark",
  diagramId: "overview", // 可选；同一页面的每张图请使用不同 ID
});
console.log(supportedDiagrams());
```

原生绑定采用延迟加载，导入包并使用 `ssg: false` 不会加载原生渲染器。自动 ID 在同一进程内互不相同；显式指定 `diagramId` 可以得到可重复的输出。图表目录直接来自编译的引擎，不额外维护一份名单；目录条目不等于完整 Mermaid 语法支持或与浏览器渲染器完全一致。

从 mermaid-rs-renderer 后端迁移时需要注意：

- 渲染引擎、布局、字体、默认主题及生成的 SVG 都可能变化，升级生产网站前应检查代表性图表。
- Merman 不支持 `preferredAspectRatio`，传入时会明确抛错。视口尺寸或容器 CSS 可以作为调整手段，但语义不同。
- 默认渲染失败会抛错。如需保留源代码，请显式选择回退策略。
- 不再声明 `require()` 导出，请使用 ESM `import`；原来声明的 `dist/index.cjs` 实际不存在。
- `mermaid()`、`mermaidPlugin`、`createMermaidPlugin` 仍保留为只注册 MDAST 的兼容入口，还需要注册 HAST 渲染插件。
- Sätteri peer 范围更新为 `>=0.10.5 <0.11.0`。此工作区原本已经使用 0.10.5，本次固定已测试版本并修正兼容范围。

已知上游限制：Merman 0.7.0 可能把流程图文字标签中的小于号重复转义，显示成 `&lt;` 文本；测试中有对应 TODO。类似 HTML 标签的内容也会受上游标签处理规则影响，即使使用原生 SVG 文字输出。本包不承诺完整语法覆盖、固定渲染耗时、与 Mermaid.js 像素级一致或保证搜索引擎收录。

在示例项目中直接预览本地包效果：

```sh
bun run preview
```

命令会构建本地包及静态示例，再启动 Astro preview（通常为 `http://127.0.0.1:4321/`）。页面展示 18 类图表与 11 个主题，直接使用包生成 SVG 自带的 Mermaid 样式。前台服务保持进程运行，Ctrl+C 停止；后台服务使用 `bun run preview:stop` 停止。`bun run dev` 启动示例开发服务器。

从源码构建需要 **Rust 1.95 或更新版本**、Node.js 22.14+ 与 Bun：

```sh
bun install --frozen-lockfile
bun run build:debug
bun run typecheck
bun run test
bun run lint
bun run fmt:check
cargo fmt -- --check
cargo clippy --locked -- -D warnings
bun run build
```

提交 `Cargo.lock` 与 `bun.lock`，原生构建使用 `--locked`。当前测试集为 **83 项通过、1 项上游问题 TODO**，已在 Linux x64、Node 22.14.0 与 24.21.0 下使用 release 产物验证。测试覆盖 18 类图表的实际渲染、XML 合法性、有限数值、11 个主题、配置的可观察效果、ID 隔离、错误策略、Markdown/MDX 编译、自适应模式内部图形尺寸，以及独立 Node 进程中的包入口。这是代表性覆盖，不是完整的上游一致性测试。CI 配置覆盖四种发布平台及最低 Node 版本，发布任务会先测试原生 release 产物。

本项目使用 MIT 许可证。Merman 是独立依赖，许可证为 MIT OR Apache-2.0。上游行为和许可证请参见 [Merman 源码](https://github.com/Latias94/merman)及 [Sätteri 源码](https://github.com/bruits/satteri)。

项目 [LICENSE](./LICENSE) 保持 MIT，版权署名为 Copyright (c) 2026 王兴家。Merman 的 MIT 声明另存于 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)，并随 npm 包分发。
