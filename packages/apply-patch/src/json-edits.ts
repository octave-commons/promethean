import {
  chmodSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, resolve, sep } from "node:path";

import type { JsonEditChange, JsonEditDocument } from "./types.js";

const isUnsafePath = (path: string): boolean =>
  isAbsolute(path) || path.includes("..");

const ensureDirectory = (path: string): void => {
  mkdirSync(dirname(path), { recursive: true });
};

const withinRepo = (repoRoot: string, path: string): boolean => {
  const absolute = resolve(repoRoot, path);
  const normalizedRoot = repoRoot.endsWith(sep)
    ? repoRoot
    : `${repoRoot}${sep}`;
  return absolute.startsWith(normalizedRoot);
};

const validateChangePath = (repoRoot: string, change: JsonEditChange): void => {
  if (!change || typeof change.path !== "string" || change.path.length === 0) {
    throw new Error("Invalid change entry (missing path)");
  }
  if (isUnsafePath(change.path)) {
    throw new Error(`Unsafe path: ${change.path}`);
  }
  if (!withinRepo(repoRoot, change.path)) {
    throw new Error(`Path escapes repo: ${change.path}`);
  }
};

const validatePaths = (
  repoRoot: string,
  changes: readonly JsonEditChange[],
): void => {
  changes.forEach((change) => validateChangePath(repoRoot, change));
};

const ensureExists = (path: string): void => {
  statSync(path);
};

const ensureContentPresent = (change: JsonEditChange): void => {
  if (typeof change.content !== "string") {
    throw new Error(`Missing content for ${change.action}: ${change.path}`);
  }
};

const validateCheckChange = (
  repoRoot: string,
  change: JsonEditChange,
  allowAdd: boolean,
): void => {
  const absolute = resolve(repoRoot, change.path);
  switch (change.action) {
    case "rewrite":
    case "append": {
      if (!allowAdd) {
        try {
          ensureExists(absolute);
        } catch {
          throw new Error(
            `File does not exist and --no-allow-add: ${change.path}`,
          );
        }
      }
      ensureContentPresent(change);
      break;
    }
    case "delete": {
      try {
        ensureExists(absolute);
      } catch {
        // deleting missing files is a no-op
      }
      break;
    }
    case "chmod": {
      if (!change.mode) {
        throw new Error(`Missing mode for chmod: ${change.path}`);
      }
      break;
    }
    default: {
      const exhaustive: never = change.action;
      throw new Error(`Unknown action: ${exhaustive}`);
    }
  }
};

const validateForCheck = (
  repoRoot: string,
  changes: readonly JsonEditChange[],
  allowAdd: boolean,
): void => {
  changes.forEach((change) => validateCheckChange(repoRoot, change, allowAdd));
};

const readExisting = (path: string): string => {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
};

const applyChange = (repoRoot: string, change: JsonEditChange): void => {
  const absolute = resolve(repoRoot, change.path);
  switch (change.action) {
    case "rewrite": {
      ensureDirectory(absolute);
      writeFileSync(absolute, change.content ?? "", "utf8");
      break;
    }
    case "append": {
      ensureDirectory(absolute);
      const previous = readExisting(absolute);
      writeFileSync(absolute, `${previous}${change.content ?? ""}`, "utf8");
      break;
    }
    case "delete": {
      rmSync(absolute, { force: true });
      break;
    }
    case "chmod": {
      if (!change.mode) {
        throw new Error(`Missing mode for chmod: ${change.path}`);
      }
      chmodSync(absolute, change.mode);
      break;
    }
    default: {
      const exhaustive: never = change.action;
      throw new Error(`Unknown action: ${exhaustive}`);
    }
  }
};

const applyAllChanges = (
  repoRoot: string,
  changes: readonly JsonEditChange[],
): void => {
  changes.forEach((change) => applyChange(repoRoot, change));
};

export function applyJsonEdits(
  doc: JsonEditDocument,
  repoRoot: string,
  checkOnly: boolean,
  allowAdd: boolean,
): void {
  if (!doc || !Array.isArray(doc.changes)) {
    throw new Error("Invalid JSON: expected { changes: [...] }");
  }
  validatePaths(repoRoot, doc.changes);
  if (checkOnly) {
    validateForCheck(repoRoot, doc.changes, allowAdd);
    return;
  }
  applyAllChanges(repoRoot, doc.changes);
}
