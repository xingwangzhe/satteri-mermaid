# @xingwangzhe/satteri-mermaid

Render Mermaid fences to inline SVG during a Sätteri build. The backend uses the published **Merman 0.7.0** Rust renderer through napi-rs; the plugin is tested with **Sätteri 0.10.5**. Static rendering requires no Mermaid client script, DOM, browser, or WASM runtime.

[中文文档](./README_CN.md)

This document describes **version 0.8.0**, with the Merman native backend. See the [complete configuration and theme reference](./docs/configuration.md) and [changelog](./CHANGELOG.md).

```sh
bun add @xingwangzhe/satteri-mermaid@0.8.0 satteri@0.10.5
```

Use Node.js **22.14.0 or newer** (the binding uses Node-API 10). The package exposes an **ES module** entry point. Native build targets are Linux x64/arm64 with glibc, macOS arm64, and Windows x64. Other platforms need a compatible source build; macOS x64, Windows arm64, and Linux musl binaries are not supplied by this repository's release matrix.

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

Register both plugins. MDAST captures the original fence; HAST renders it and replaces its placeholder. The same pair works with `mdxToJs`. MDX output contains structured SVG nodes so callers do not need to enable raw HTML compilation. With another HAST plugin, run Mermaid before a transformation that discards its placeholders or shared data.

The default output is a `<div class="mermaid" data-mermaid-ssg="true">` containing an SVG with a `viewBox`, readable SVG text labels, and unique diagram IDs. Responsive mode removes only the root SVG dimensions and preserves the dimensions of shapes inside the diagram.

| Option                            | Default         | Behavior                                                                                                             |
| --------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------- |
| `langs`                           | `["mermaid"]`   | Fence languages to handle                                                                                            |
| `ssg`                             | `true`          | Render during compilation; `false` produces escaped `<pre class="mermaid">` code for a host-provided client renderer |
| `responsive`                      | `true`          | Fit SVG to its container                                                                                             |
| `theme`                           | `"default"`     | Merman theme preset                                                                                                  |
| `font`, `fontSize`                | Engine defaults | Font family and font size in pixels                                                                                  |
| `nodeSpacing`, `rankSpacing`      | Engine defaults | Mermaid flowchart spacing                                                                                            |
| `siteConfig`                      | Engine defaults | Full Mermaid configuration object                                                                                    |
| `themeVariables`                  | —               | Mermaid theme-variable overrides                                                                                     |
| `themeCSS`                        | —               | Mermaid theme CSS                                                                                                    |
| `scopedCSS`                       | —               | CSS added through Merman's scoped SVG postprocessor                                                                  |
| `themeOverrides`                  | —               | Compatibility mapping for the previous flat color options                                                            |
| `viewportWidth`, `viewportHeight` | Engine defaults | Positive finite layout viewport dimensions; these do not guarantee a fixed SVG aspect ratio                          |
| `fastTextMetrics`                 | `false`         | Use Merman's deterministic text measurer                                                                             |
| `onError`                         | `"throw"`       | Throw on rendering failure; `"warn-and-code"` logs a warning and preserves code; `"code"` preserves code silently    |

Supported theme names are `default`, `base`, `dark`, `forest`, `neutral`, `neo`, `neo-dark`, `redux`, `redux-dark`, `redux-color`, and `redux-dark-color`. `modern` is retained as an alias for `default`. For direct rendering, theme names are case-insensitive.

```ts
mermaidHast({
  theme: "base",
  themeVariables: { primaryColor: "#e8f3ff", primaryBorderColor: "#2864a0" },
  scopedCSS: ".node rect { stroke-width: 3px; }",
  siteConfig: { flowchart: { curve: "linear" } },
  onError: "throw",
});
```

Configuration precedence is engine defaults, `siteConfig`, legacy flat overrides, then explicit `themeVariables`. Explicit top-level `theme`, `themeCSS`, and spacing override their equivalents in `siteConfig`. The caller's configuration object is not mutated. Mermaid variables and diagram syntax are implemented by Merman; accepting a configuration key does not prove that every diagram applies it.

The default native configuration sets `htmlLabels: false` and `securityLevel: "strict"`. Tests verify that a JavaScript URL is absent from default flowchart output. This is a tested default, not a sanitizer guarantee for arbitrary caller-supplied configurations, CSS, or untrusted source.

Direct rendering and engine discovery are also available:

```ts
import { renderMermaidSVG, supportedDiagrams } from "@xingwangzhe/satteri-mermaid";

const svg = renderMermaidSVG("flowchart LR\n A --> B", {
  theme: "dark",
  diagramId: "overview", // optional: use a unique value for each diagram on a page
});
console.log(supportedDiagrams());
```

`renderMermaidSVG` loads the native binding lazily. Importing the package and using `ssg: false` does not load it. Automatic IDs are distinct within a process; an explicit `diagramId` makes repeated rendering deterministic. The catalog is queried from the compiled engine rather than maintained as a separate list. A catalog entry is not a guarantee of complete Mermaid syntax or browser-renderer parity.

Migration from the previous mermaid-rs-renderer backend:

- The rendering engine, layouts, fonts, default theme, and generated SVG may change. Review representative diagrams before upgrading a production site.
- `preferredAspectRatio` is unsupported by Merman and now raises an error. Consider viewport dimensions or container CSS; they have different semantics.
- Rendering failures throw by default. Choose a fallback policy explicitly if preserving source code is appropriate.
- `require()` is not exported. Use ESM `import`; the previous declared `dist/index.cjs` did not exist.
- The older `mermaid()`, `mermaidPlugin`, and `createMermaidPlugin` exports remain MDAST-only compatibility shortcuts. Register a HAST renderer as well.
- The Sätteri peer range is `>=0.10.5 <0.11.0`. This checkout already used 0.10.5; this change pins that tested version and updates the compatibility contract.

Known upstream limitation: Merman 0.7.0 can double-escape a less-than sign in a flowchart text label, producing visible `&lt;` text. A TODO regression tracks this behavior. Labels containing HTML-like tags also follow the renderer's HTML-label processing rules even with native text output. This package does not claim full syntax coverage, fixed rendering times, pixel identity with Mermaid.js, or guaranteed search indexing.

Preview the local package in the example site:

```sh
bun run preview
```

This builds the package and static example, then starts Astro preview (normally `http://127.0.0.1:4321/`). The page displays 18 diagram families and 11 themes using the SVG styles emitted by the package. For a foreground server, keep the process running and use Ctrl+C to stop it. For a background server, use `bun run preview:stop`. `bun run dev` starts the example development server.

To build from source, use Rust **1.95 or newer**, Node.js 22.14+, and Bun:

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

`Cargo.lock` and `bun.lock` are committed; native builds use `--locked`. The current suite has **83 passing tests and one upstream TODO**, verified locally on Linux x64 with Node 22.14.0 and 24.21.0 against the release build. Tests exercise 18 diagram families through the real renderer, XML validity, finite output, 11 themes, visible configuration effects, ID isolation, error policies, Markdown and MDX compilation, responsive shape preservation, and package imports in separate Node processes. They are representative coverage, not an exhaustive upstream conformance suite. CI tests all four release platforms and the minimum Node version; release jobs run tests against the native release artifacts before publication.

Licensed under MIT. Merman is a separate dependency licensed under MIT OR Apache-2.0. See the [Merman source](https://github.com/Latias94/merman) and [Sätteri source](https://github.com/bruits/satteri) for upstream behavior and licenses.

The project [LICENSE](./LICENSE) remains MIT, Copyright (c) 2026 王兴家. The Merman MIT notice is preserved separately in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md), which is included in the npm package.
