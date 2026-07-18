---
title: "satteri-mermaid v0.3.0 — SSG SVG Example"
layout: ../layouts/Layout.astro
---

All diagrams below are **static SVGs** rendered at build time.
Zero client-side JS. Click the theme button to see dark/light adaptation.

## Flowchart

```mermaid
flowchart LR
  A[Markdown] -->|satteri-mermaid| B[pre.mermaid]
  B -->|beautiful-mermaid SSG| C[Static SVG]
  C -->|Zero JS| D[Browser Display]
```

## Sequence Diagram

```mermaid
sequenceDiagram
  participant U as User
  participant S as Satteri
  participant B as beautiful-mermaid
  U->>S: Markdown source
  S->>S: MDAST detects mermaid
  S->>B: HAST renders SVG
  B->>U: Static SVG output
```

## Class Diagram

```mermaid
classDiagram
  class Plugin {
    +name: string
    +ssg: boolean
    +render(code): SVG
  }
  class Options {
    +bg: string
    +fg: string
    +line: string
    +accent: string
    +muted: string
  }
  Plugin --> Options
```

## State Diagram

```mermaid
stateDiagram-v2
  [*] --> Markdown
  Markdown --> MDAST: Parse
  MDAST --> HAST: Transform
  HAST --> SSG: ssg=true
  HAST --> Client: ssg=false
  SSG --> SVG: Static output
  Client --> Browser: mermaid.run()
  SVG --> [*]
  Browser --> [*]
```
