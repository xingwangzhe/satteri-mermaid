import { mkdirSync, realpathSync, rmSync, symlinkSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packagePath = resolve(root, "example/node_modules/@xingwangzhe/satteri-mermaid");
let alreadyLinked = false;
try {
  alreadyLinked = realpathSync(packagePath) === realpathSync(root);
} catch {
  // A first install has no local package link yet.
}
if (!alreadyLinked) {
  mkdirSync(dirname(packagePath), { recursive: true });
  rmSync(packagePath, { recursive: true, force: true });
  symlinkSync(root, packagePath, process.platform === "win32" ? "junction" : "dir");
}
