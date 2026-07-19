---
title: "时序图：OAuth 2.0 认证流程"
description: "使用时序图展示 OAuth 2.0 授权码模式的完整交互过程"
pubDate: 2026-07-12
tags: ["sequence", "mermaid", "oauth", "security"]
---

## OAuth 2.0 授权码流程

这是最安全的 OAuth 2.0 认证方式，适用于有后端服务器的应用：

```mermaid
sequenceDiagram
    actor User as 用户
    participant App as 客户端应用
    participant Auth as 授权服务器
    participant API as 资源服务器

    User->>App: 1. 点击"登录"
    App->>Auth: 2. 重定向到授权页面
    Note over App,Auth: client_id, redirect_uri, scope, state
    Auth->>User: 3. 显示授权确认页面
    User->>Auth: 4. 同意授权
    Auth->>App: 5. 返回授权码 (code)
    Note over Auth,App: 通过 redirect_uri 回调

    App->>Auth: 6. 用授权码换取 Token
    Note over App,Auth: code + client_secret
    Auth->>App: 7. 返回 Access Token + Refresh Token
    Note over Auth,App: access_token, refresh_token, expires_in

    App->>API: 8. 携带 Access Token 请求资源
    API->>App: 9. 返回用户数据
    App->>User: 10. 显示个人信息

    Note over App,Auth: 11. Token 过期后使用 Refresh Token 刷新
    App->>Auth: 12. 发送 Refresh Token
    Auth->>App: 13. 返回新的 Access Token
```

## 关键安全点

| 步骤 | 安全措施 | 说明 |
|------|----------|------|
| 步骤 2 | `state` 参数 | 防止 CSRF 攻击 |
| 步骤 5-6 | 授权码一次性使用 | 防止重放攻击 |
| 步骤 6 | `client_secret` | 后端保密传输 |
| 步骤 8 | Bearer Token | 每次请求携带 |
