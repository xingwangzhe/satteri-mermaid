# Configuration and themes

This reference describes `@xingwangzhe/satteri-mermaid@0.8.0`, Merman 0.7.0, and Sätteri 0.10.5. Register both `mermaidMdast()` and `mermaidHast()`. Use `renderMermaidSVG()` for direct rendering. [中文](./configuration.zh-CN.md)

## Theme names

There are **11 presets** and one compatibility alias, `modern`; the alias is not a twelfth distinct theme. The example preview displays all 11 presets.

| Name               | Family / purpose                                     |
| ------------------ | ---------------------------------------------------- |
| `default`          | Default Mermaid theme; plugin default                |
| `base`             | Base theme suitable for theme-variable customization |
| `dark`             | Mermaid dark theme                                   |
| `forest`           | Mermaid forest theme                                 |
| `neutral`          | Mermaid neutral theme                                |
| `neo`              | Neo light theme                                      |
| `neo-dark`         | Neo dark theme                                       |
| `redux`            | Redux light theme                                    |
| `redux-dark`       | Redux dark theme                                     |
| `redux-color`      | Redux color theme                                    |
| `redux-dark-color` | Redux dark color theme                               |
| `modern`           | Legacy alias for `default`                           |

Merman 0.7.0 also has seven upstream **host-theme presets**: `editor-light`, `editor-dark`, `one-dark`, `gruvbox-light`, `gruvbox-dark`, `ayu-light`, and `ayu-dark`. This plugin does not expose that separate host API. These names are not valid `theme` values and are not included in this plugin's theme count.

## Plugin options

| Option                 | Type / default                                | Effect                                                                                        |
| ---------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `langs`                | `string[]` / `["mermaid"]`                    | MDAST fence languages; pass the same configuration to both plugins when customizing languages |
| `ssg`                  | `boolean` / `true`                            | Build-time SVG; `false` preserves escaped source for a host-provided client renderer          |
| `responsive`           | `boolean` / `true`                            | Remove only root SVG dimensions and fit the container; preserve shape dimensions              |
| `theme`                | Theme name above / `default`                  | Theme preset                                                                                  |
| `font`                 | `string` / engine default                     | Font family; direct rendering uses `fontFamily`                                               |
| `fontSize`             | `number` / engine default                     | Font size in px                                                                               |
| `nodeSpacing`          | `number` / engine default                     | Flowchart spacing between nodes at the same rank                                              |
| `rankSpacing`          | `number` / engine default                     | Flowchart spacing between ranks                                                               |
| `siteConfig`           | `Record<string, unknown>` / unset             | Full Mermaid configuration, including diagram-specific settings such as `flowchart.curve`     |
| `themeVariables`       | `Record<string, unknown>` / unset             | Mermaid variables; override legacy color fields                                               |
| `themeOverrides`       | `ThemeOverrides` / unset                      | Legacy compatibility mapping described below                                                  |
| `themeCSS`             | `string` / unset                              | Upstream Mermaid theme CSS                                                                    |
| `scopedCSS`            | `string` / unset                              | Diagram-scoped CSS through Merman's postprocessor, including stroke-width controls            |
| `viewportWidth`        | `number` / engine default                     | Finite positive layout viewport width; not a fixed SVG width                                  |
| `viewportHeight`       | `number` / engine default                     | Finite positive layout viewport height; not an aspect-ratio guarantee                         |
| `fastTextMetrics`      | `boolean` / `false`                           | Deterministic text estimation; can change layout and does not promise a fixed speedup         |
| `onError`              | `throw`, `warn-and-code`, or `code` / `throw` | Fail compilation, warn and preserve source, or silently preserve source                       |
| `preferredAspectRatio` | Deprecated                                    | Unsupported by Merman; passing it throws. Viewport dimensions have different semantics        |

Native defaults are `theme: "default"`, `htmlLabels: false`, and `securityLevel: "strict"`. `siteConfig` can override them. Tests verify that a JavaScript link is absent from default flowchart output; arbitrary custom configuration, CSS, and input are not covered by a universal sanitizer guarantee.

## Legacy color mappings

Colors are strings. CSS variables can appear in SVG/CSS, but their effect on layout and derived colors depends on the upstream renderer. These groups cover all fields of `ThemeOverrides`; accepting a key does not prove every diagram uses it.

| Legacy fields                                                                                  | Mermaid variables                                         |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `fontFamily`, `fontSize`                                                                       | Same names; numeric font sizes become px strings          |
| `primaryColor`, `primaryBorderColor`, `primaryTextColor`                                       | Same names                                                |
| `lineColor`, `secondaryColor`, `tertiaryColor`, `textColor`, `edgeLabelBackground`             | Same names                                                |
| `background`                                                                                   | `background`, plus a native root-background postprocessor |
| `clusterBackground`, `clusterBorder`                                                           | `clusterBkg`, `clusterBorder`                             |
| `sequenceActorFill`, `sequenceActorBorder`, `sequenceActorLine`                                | `actorBkg`, `actorBorder`, `actorLineColor`               |
| `sequenceNoteFill`, `sequenceNoteBorder`                                                       | `noteBkgColor`, `noteBorderColor`                         |
| `sequenceActivationFill`, `sequenceActivationBorder`                                           | `activationBkgColor`, `activationBorderColor`             |
| `git0`…`git7`                                                                                  | Same names; eight primary palette slots                   |
| `gitInv0`…`gitInv7`                                                                            | Same names; eight inverted palette slots                  |
| `gitBranchLabel0`…`gitBranchLabel7`                                                            | Same names; eight branch-label slots                      |
| `gitCommitLabelColor`, `gitCommitLabelBackground`                                              | `commitLabelColor`, `commitLabelBackground`               |
| `gitTagLabelColor`, `gitTagLabelBackground`, `gitTagLabelBorder`                               | `tagLabelColor`, `tagLabelBackground`, `tagLabelBorder`   |
| `pie1`…`pie12`                                                                                 | Same names; twelve palette slots                          |
| `pieTitleTextSize`, `pieSectionTextSize`, `pieLegendTextSize`                                  | Same names; numeric sizes become px strings               |
| `pieTitleTextColor`, `pieSectionTextColor`, `pieLegendTextColor`                               | Same names                                                |
| `pieStrokeColor`, `pieStrokeWidth`, `pieOuterStrokeWidth`, `pieOuterStrokeColor`, `pieOpacity` | Same names; widths and opacity are numbers                |

## Precedence and example

Merge order is engine defaults → `siteConfig.themeVariables` → `themeOverrides` → `themeVariables`. Top-level `theme`, `themeCSS`, `nodeSpacing`, and `rankSpacing` override matching `siteConfig` fields. `themeOverrides.fontFamily/fontSize` override top-level `font/fontSize`. Input configuration objects are not mutated.

```ts
import { mermaidMdast, mermaidHast } from "@xingwangzhe/satteri-mermaid";

const options = {
  theme: "neo-dark" as const,
  themeVariables: { primaryColor: "#243347", primaryBorderColor: "#91baff" },
  scopedCSS: ".node rect { stroke-width: 3px; }",
  siteConfig: { flowchart: { curve: "linear" } },
  onError: "throw" as const,
};
const plugins = {
  mdastPlugins: [mermaidMdast(options)],
  hastPlugins: [mermaidHast(options)],
};
```

## Direct renderer

`renderMermaidSVG(code, options)` accepts rendering settings above, but legacy colors go directly on `options`, without a `themeOverrides` wrapper. Use `fontFamily` for the font. `langs`, `ssg`, `responsive`, and `onError` are plugin-only options; direct rendering always throws on failure.

The additional `diagramId?: string` makes repeated output deterministic. Omit it for automatic process-local unique IDs, or ensure each explicit ID is unique on a page.

```ts
import { renderMermaidSVG } from "@xingwangzhe/satteri-mermaid";

const svg = renderMermaidSVG("flowchart LR\n A --> B", {
  theme: "forest",
  fontFamily: "sans-serif",
  primaryColor: "#dcefe0",
  diagramId: "overview",
});
```

Direct rendering trims the source and accepts case-insensitive theme names. `supportedDiagrams()` returns the compiled engine's catalog, not a full syntax-conformance guarantee. Native loading is lazy; importing the package and using `ssg: false` does not load the native binding.
