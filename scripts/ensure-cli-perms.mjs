import { chmodSync, existsSync } from "fs";
import path from "path";

const targets = [
  path.resolve("bin/promethean.js"),
  path.resolve("packages/promethean-cli/dist/promethean_cli.js"),
];

let exitCode = 0;

for (const target of targets) {
  try {
    if (existsSync(target)) {
      chmodSync(target, 0o755);
    }
  } catch (error) {
    if (error?.code !== "ENOENT") {
      console.error(`Failed to adjust permissions for ${target}:`, error);
      exitCode = 1;
    }
  }
}

if (exitCode !== 0) {
  process.exit(exitCode);
}
