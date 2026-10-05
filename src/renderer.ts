/** Build-time SVG rendering through the native Merman Rust binding. */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

interface NativeBinding {
  render: (code: string, opts?: Record<string, unknown>) => string;
  supportedDiagrams: () => string[];
}
let nativeBinding: NativeBinding | null = null;
function getBinding(): NativeBinding {
  nativeBinding ??= createRequire(import.meta.url)(
    resolve(dirname(fileURLToPath(import.meta.url)), "..", "index.cjs"),
  ) as NativeBinding;
  return nativeBinding;
}

/** Query the compiled engine's catalog rather than duplicating a diagram list. */
export function supportedDiagrams(): string[] {
  return getBinding().supportedDiagrams();
}

const legacyThemeNames: Record<string, string> = {
  clusterBackground: "clusterBkg",
  sequenceActorFill: "actorBkg",
  sequenceActorBorder: "actorBorder",
  sequenceActorLine: "actorLineColor",
  sequenceNoteFill: "noteBkgColor",
  sequenceNoteBorder: "noteBorderColor",
  sequenceActivationFill: "activationBkgColor",
  sequenceActivationBorder: "activationBorderColor",
  gitCommitLabelColor: "commitLabelColor",
  gitCommitLabelBackground: "commitLabelBackground",
  gitTagLabelColor: "tagLabelColor",
  gitTagLabelBackground: "tagLabelBackground",
  gitTagLabelBorder: "tagLabelBorder",
};
const transportKeys = new Set([
  "theme",
  "siteConfig",
  "themeVariables",
  "themeCSS",
  "scopedCSS",
  "diagramId",
  "fastTextMetrics",
  "preferredAspectRatio",
  "viewportWidth",
  "viewportHeight",
  "nodeSpacing",
  "rankSpacing",
]);
function objectOption(value: unknown, name: string): Record<string, unknown> {
  if (value === undefined) return {};
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${name} must be an object`);
  }
  return { ...value };
}

/** Legacy flat colors map to Mermaid variables; explicit themeVariables take precedence. */
export function renderMermaidSVG(code: string, opts: Record<string, unknown> = {}): string {
  const siteConfig = objectOption(opts.siteConfig, "siteConfig");
  const variables = objectOption(siteConfig.themeVariables, "siteConfig.themeVariables");
  for (const [key, value] of Object.entries(opts)) {
    if (value === undefined || transportKeys.has(key)) continue;
    const name = legacyThemeNames[key] ?? key;
    variables[name] =
      typeof value === "number" && /(?:TextSize|fontSize)$/.test(key) ? `${value}px` : value;
  }
  Object.assign(variables, objectOption(opts.themeVariables, "themeVariables"));
  if (Object.keys(variables).length) siteConfig.themeVariables = variables;
  if (opts.theme !== undefined) {
    if (typeof opts.theme !== "string") throw new TypeError("theme must be a string");
    const theme = opts.theme.toLowerCase();
    siteConfig.theme = theme === "modern" ? "default" : theme;
  }
  if (opts.themeCSS !== undefined) siteConfig.themeCSS = opts.themeCSS;
  if (opts.nodeSpacing !== undefined || opts.rankSpacing !== undefined) {
    const flowchart = objectOption(siteConfig.flowchart, "siteConfig.flowchart");
    if (opts.nodeSpacing !== undefined) flowchart.nodeSpacing = opts.nodeSpacing;
    if (opts.rankSpacing !== undefined) flowchart.rankSpacing = opts.rankSpacing;
    siteConfig.flowchart = flowchart;
  }
  if (opts.preferredAspectRatio !== undefined) {
    throw new TypeError(
      "preferredAspectRatio is not supported by Merman; use viewportWidth and viewportHeight",
    );
  }
  return getBinding().render(code.trim(), {
    siteConfigJson: JSON.stringify(siteConfig),
    diagramId: opts.diagramId,
    scopedCss: opts.scopedCSS,
    fastTextMetrics: opts.fastTextMetrics,
    viewportWidth: opts.viewportWidth,
    viewportHeight: opts.viewportHeight,
  });
}
