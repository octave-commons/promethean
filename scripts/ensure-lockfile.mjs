#!/usr/bin/env node
import { spawnSync } from "node:child_process";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", ...options });
  if (result.status !== 0) {
    const code = typeof result.status === "number" ? result.status : 1;
    process.exit(code);
  }
  return result;
}

run("pnpm", ["install", "--lockfile-only"]);

const statusResult = spawnSync("git", ["status", "--short", "pnpm-lock.yaml"], {
  encoding: "utf8",
});

if (statusResult.status !== 0) {
  process.stderr.write(statusResult.stderr ?? "");
  const code =
    typeof statusResult.status === "number" ? statusResult.status : 1;
  process.exit(code);
}

const output = (statusResult.stdout ?? "").trim();

if (output.length > 0) {
  console.error(
    "pnpm-lock.yaml is out of date. Run pnpm install to regenerate the lockfile.",
  );
  process.exit(1);
}

console.log("pnpm-lock.yaml is up to date.");
