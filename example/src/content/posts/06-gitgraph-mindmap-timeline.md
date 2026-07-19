---
title: "Git 分支图、思维导图与时间线"
description: "展示 Git 工作流可视化、知识体系思维导图和技术发展时间线"
pubDate: 2026-07-15
tags: ["gitgraph", "mindmap", "timeline", "mermaid"]
---

## Git 分支图：Git Flow 工作流

```mermaid
gitGraph
   commit id: "初始化项目"
   branch develop
   checkout develop
   commit id: "搭建基础框架"

   branch feature/auth
   checkout feature/auth
   commit id: "实现登录接口"
   commit id: "添加 JWT 中间件"

   checkout develop
   branch feature/mermaid
   checkout feature/mermaid
   commit id: "集成 mermaid-rs"
   commit id: "实现 MDAST 插件"

   checkout develop
   merge feature/auth
   commit id: "解决合并冲突"

   checkout feature/mermaid
   commit id: "实现 HAST 插件"
   commit id: "添加主题系统"

   checkout develop
   merge feature/mermaid

   checkout main
   merge develop tag: "v0.1.0"
   commit id: "更新文档"

   branch hotfix/theme-fix
   checkout hotfix/theme-fix
   commit id: "修复暗色主题背景"

   checkout main
   merge hotfix/theme-fix tag: "v0.1.1"

   checkout develop
   merge hotfix/theme-fix
```

## 思维导图：前端知识体系

```mermaid
mindmap
  root((前端开发))
    HTML
      语义化标签
      表单元素
      SEO 基础
    CSS
      布局
        Flexbox
        Grid
      动画
        CSS Animation
        Web Animations API
      预处理器
        Sass
        PostCSS
    JavaScript
      核心概念
        闭包
        原型链
        事件循环
      ES6+
        Promise
        async/await
        模块化
      TypeScript
        类型系统
        泛型
    ::((
    框架生态
      Astro
        岛屿架构
        Sätteri 插件
      React
        Hooks
        Server Components
      Vue
        组合式 API
        Pinia
    :)))
    工程化
      构建工具
        Vite
        Turbopack
      包管理
        npm
        pnpm
      代码质量
        ESLint
        Prettier
```

## 时间线：Web 渲染技术演进

```mermaid
timeline
    title Web 页面渲染技术演进
    1991 : 静态 HTML
         : 纯服务端渲染 (SSR)
         : CGI 动态内容

    2000 : AJAX 兴起
         : 客户端异步请求
         : 单页应用雏形

    2010 : SPA 爆发
         : AngularJS
         : React (2013)
         : Vue.js (2014)

    2018 : 混合渲染
         : SSR + 客户端水合
         : Next.js / Nuxt

    2022 : 岛屿架构
         : Astro 发布
         : 零 JS 交互岛
         : 混合渲染模式

    2026 : 零 JS 时代
         : 静态站点生成为主流
         : Sätteri + mermaid-rs
         : 构建时渲染一切
```
