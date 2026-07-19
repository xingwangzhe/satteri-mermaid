const { existsSync } = require("fs");
const path = require("path");

const targets = {
  "win32-x64": "mermaid-rs.win32-x64-msvc.node",
  "win32-arm64": "mermaid-rs.win32-arm64-msvc.node",
  "darwin-x64": "mermaid-rs.darwin-x64.node",
  "darwin-arm64": "mermaid-rs.darwin-arm64.node",
  "linux-x64": "mermaid-rs.linux-x64-gnu.node",
  "linux-arm64": "mermaid-rs.linux-arm64-gnu.node",
};

const key = `${process.platform}-${process.arch}`;
const binaryName = targets[key];

if (!binaryName) {
  throw new Error(
    `@xingwangzhe/mermaid-rs: unsupported platform "${key}". ` +
      `Supported: ${Object.keys(targets).join(", ")}`,
  );
}

const localPath = path.join(__dirname, binaryName);
if (!existsSync(localPath)) {
  throw new Error(
    `@xingwangzhe/mermaid-rs: native binary "${binaryName}" not found. ` +
      `Build it with: napi build --platform --release`,
  );
}

module.exports = require(localPath);
