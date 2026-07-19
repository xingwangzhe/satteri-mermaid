---
title: "Sätteri Mermaid 架构详解"
description: "深入理解 satteri-mermaid 的双插件架构：MDAST 插件如何检测代码块，HAST 插件如何渲染 SVG"
pubDate: 2026-07-10
tags: ["architecture", "satteri", "mermaid"]
---

## 整体架构

Sätteri Mermaid 采用 **MDAST + HAST 双插件架构**，确保在整个 Markdown 处理流水线中，Mermaid 代码块不会被其他插件破坏：

```mermaid
flowchart TB
    subgraph Input["📥 输入层"]
        MD["Markdown 文件\n```mermaid\n...\n```"]
    end

    subgraph Mdast["🔍 MDAST 阶段"]
        P1["mermaidMdast()\n检测代码块"]
        Store["存储原始代码到 ctx.data\n输出占位符 pre 标签"]
    end

    subgraph Satteri["⚙️ Sätteri 处理"]
        Other["其他插件处理\n(highlight, heading-ids...)"]
        Note["占位符 pre 标签\n不被修改"]
    end

    subgraph Hast["🎨 HAST 阶段"]
        P2["mermaidHast()\n匹配占位符/代码块"]
        Render["调用 mermaid-rs\n(napi-rs 原生渲染)"]
        SVG["输出内联 SVG\n<div class='mermaid'>"]
    end

    subgraph Output["📤 输出"]
        HTML["最终 HTML\n零客户端 JS"]
    end

    MD --> P1 --> Store --> Other --> Note --> P2 --> Render --> SVG --> HTML
```

## 核心设计原则

### 1. 免疫文本变换

MDAST 插件将原始 Mermaid 代码存储在 `ctx.data` 中，并输出一个简单的 `<pre class="mermaid" data-mermaid-id="...">` 占位符。由于 Sätteri 的其他插件（如高亮、标题 ID 等）不会修改 raw HTML 节点，代码内容得以完整保留。

### 2. SSG 优先，也可降级

```mermaid
flowchart LR
    A[代码块] --> B{ssg 模式?}
    B -->|true| C[mermaid-rs 渲染]
    C --> D[内联 SVG]
    B -->|false| E[保留 pre 标签]
    E --> F[客户端 mermaid.js]
```

### 3. 渲染器细节

`mermaid-rs` 是通过 napi-rs 编译的 Rust 原生模块，通过在 Node.js 中加载 `.node` 二进制文件调用。相比 WASM 方案，原生模块避免了 JS↔WASM 的序列化开销，单图渲染时间约 3ms。
