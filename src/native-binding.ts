import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const targets: Record<string, [packageName: string, binaryName: string]> = {
  "win32-x64": [
    "@xingwangzhe/satteri-mermaid-win32-x64-msvc",
    "mermaid-rs.win32-x64-msvc.node",
  ],
  "darwin-arm64": [
    "@xingwangzhe/satteri-mermaid-darwin-arm64",
    "mermaid-rs.darwin-arm64.node",
  ],
  "linux-x64": [
    "@xingwangzhe/satteri-mermaid-linux-x64-gnu",
    "mermaid-rs.linux-x64-gnu.node",
  ],
  "linux-arm64": [
    "@xingwangzhe/satteri-mermaid-linux-arm64-gnu",
    "mermaid-rs.linux-arm64-gnu.node",
  ],
};

export function loadNativeBinding(): unknown {
  const key = `${process.platform}-${process.arch}`;
  const target = targets[key];
  if (!target) {
    throw new Error(
      `@xingwangzhe/satteri-mermaid: unsupported platform "${key}". ` +
        `Supported: ${Object.keys(targets).join(", ")}`,
    );
  }

  const [packageName, binaryName] = target;
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const localPath = resolve(root, binaryName);
  const require = createRequire(import.meta.url);
  return existsSync(localPath) ? require(localPath) : require(packageName);
}
