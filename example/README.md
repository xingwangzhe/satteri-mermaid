# 本地效果预览

在仓库根目录运行：

```sh
bun run preview
```

命令会构建本地包、安装示例的锁定依赖、生成静态页面并启动 Astro preview。终端显示预览地址，默认是 `http://127.0.0.1:4321/`。保持命令运行，在浏览器访问即可；普通前台运行时按 Ctrl+C 停止服务；后台运行时，在根目录运行 `bun run preview:stop`。

也可以在已构建包和示例后，直接进入本目录运行 `bun run preview`。开发模式在仓库根目录运行 `bun run dev`。

示例通过准备脚本链接本地包，使用 `dist` 构建产物，真实调用 `markdownToHtml` 与 Mermaid 双插件。页面展示 18 类图表、11 个主题和实际引擎目录。图表直接使用包生成 SVG 中的 Mermaid 样式；页面 CSS 仅处理页面排版和卡片，不覆盖图表内部样式。不加载 Mermaid 客户端脚本。

首次使用先在仓库根目录安装依赖：

```sh
bun install --frozen-lockfile
bun run preview
```

本地原生构建需要 Rust 1.95+、Node.js 22.14+ 和 Bun。根目录 `preview` 使用 debug 原生构建以缩短开发等待；正式 release 构建使用 `bun run build`。预览引用当前工作区构建，无需等待 npm 版本传播。

当前测试与迁移说明见 [中文 README](../README_CN.md) 和 [CHANGELOG](../CHANGELOG.md)。
