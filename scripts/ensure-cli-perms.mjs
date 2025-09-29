import {
  chmodSync as defaultChmodSync,
  existsSync as defaultExistsSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const modulePath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(modulePath), "..");

export const defaultTargets = [
  path.join(repoRoot, "bin", "promethean.js"),
  path.join(
    repoRoot,
    "packages",
    "promethean-cli",
    "dist",
    "promethean_cli.cjs",
  ),
];

function defaultOnError(message, error) {
  console.error(message, error);
}

export function ensureCliPerms(targets = defaultTargets, io = {}) {
  const {
    existsSync = defaultExistsSync,
    chmodSync = defaultChmodSync,
    onError = defaultOnError,
  } = io;

  let exitCode = 0;

  for (const target of targets) {
    try {
      if (existsSync(target)) {
        chmodSync(target, 0o755);
      }
    } catch (error) {
      if (error?.code !== "ENOENT") {
        onError(`Failed to adjust permissions for ${target}:`, error);
        exitCode = 1;
      }
    }
  }

  return exitCode;
}

export function runCliPerms(targets = defaultTargets, io) {
  const code = ensureCliPerms(targets, io);
  if (code !== 0) {
    process.exitCode = code;
  }

  return code;
}

if (process.argv[1] && path.resolve(process.argv[1]) === modulePath) {
  const code = ensureCliPerms();
  if (code !== 0) {
    process.exit(code);
  }
}
