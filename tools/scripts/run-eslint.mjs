#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const IGNORED_FLAGS = new Set(["--paralell", "--parallel"]);

const userArgs = process.argv.slice(2).filter((arg) => !IGNORED_FLAGS.has(arg));

if (userArgs.length === 0) {
  userArgs.push(".");
}

const result = spawnSync(
  process.platform === "win32" ? "pnpm.cmd" : "pnpm",
  ["exec", "eslint", ...userArgs],
  { stdio: "inherit" },
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
