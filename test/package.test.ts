import { describe, expect, it } from "vitest";
import {
  readFileSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  cpSync,
  writeFileSync,
  symlinkSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

describe("built npm package contract", () => {
  it("points every declared export at a real build artifact", () => {
    for (const path of Object.values(manifest.exports["."]) as string[]) {
      expect(existsSync(join(root, path)), path).toBe(true);
    }
    expect(manifest.exports["."].require).toBeUndefined();
  });

  it("imports and renders through the built package in a fresh Node process", () => {
    const result = spawnSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `
      import {renderMermaidSVG, supportedDiagrams} from '@xingwangzhe/satteri-mermaid';
      const svg = renderMermaidSVG('flowchart TD\\n A --> B');
      if (!svg.includes('<svg') || !supportedDiagrams().includes('xychart')) process.exit(1);
    `,
      ],
      { cwd: root, encoding: "utf8" },
    );
    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
  });

  it("can import and use ssg:false without loading a native renderer", () => {
    const temporary = mkdtempSync(join(tmpdir(), "satteri-mermaid-client-"));
    try {
      const modules = join(temporary, "node_modules");
      const pkg = join(modules, "@xingwangzhe", "satteri-mermaid");
      mkdirSync(pkg, { recursive: true });
      cpSync(join(root, "dist"), join(pkg, "dist"), { recursive: true });
      writeFileSync(join(pkg, "package.json"), JSON.stringify(manifest));
      writeFileSync(
        join(pkg, "index.cjs"),
        'throw new Error("native binding must not be loaded");',
      );
      symlinkSync(
        join(root, "node_modules", "satteri"),
        join(modules, "satteri"),
        process.platform === "win32" ? "junction" : "dir",
      );
      const result = spawnSync(
        process.execPath,
        [
          "--input-type=module",
          "-e",
          `
        import {markdownToHtml} from 'satteri';
        import {mermaidMdast, mermaidHast} from '@xingwangzhe/satteri-mermaid';
        const {html} = markdownToHtml('\`\`\`mermaid\\nflowchart TD\\n A --> B\\n\`\`\`', {
          mdastPlugins: [mermaidMdast()], hastPlugins: [mermaidHast({ssg:false})]
        });
        if (!html.includes('<pre class="mermaid">') || html.includes('<svg')) process.exit(1);
      `,
        ],
        { cwd: temporary, encoding: "utf8" },
      );
      expect(result.stderr).toBe("");
      expect(result.status).toBe(0);
    } finally {
      rmSync(temporary, { recursive: true, force: true });
    }
  });
});
