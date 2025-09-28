#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, "../../packages/clj-hacks");

function commandAvailable(command, args) {
  const result = spawnSync(command, args, {
    stdio: "ignore",
  });

  if (result.error) {
    if (result.error.code !== "ENOENT") {
      console.warn(`Unable to execute \`${command}\`:`, result.error.message);
    }

    return false;
  }

  return result.status === 0;
}

function run(command, args, options) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    ...options,
  });

  if (result.error) {
    console.error(`Failed to execute \`${command}\`:`, result.error.message);
    process.exit(result.status ?? 1);
  }

  if (typeof result.status === "number") {
    process.exit(result.status);
  }

  process.exit(1);
}

if (commandAvailable("clojure", ["-Sdescribe"])) {
  run("clojure", ["-M:test"], { cwd: projectRoot });
}

if (commandAvailable("bb", ["--version"])) {
  run("bb", ["clj-hacks:test"], { cwd: projectRoot });
}

console.warn(
  "Skipping clj-hacks tests because neither `clojure` nor `bb` is available on PATH.",
);
console.warn(
  "Install the Clojure CLI or Babashka to enable the full test suite.",
);
process.exit(0);
