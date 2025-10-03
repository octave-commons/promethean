#!/usr/bin/env node
/**
 * apply_patch — shim for Codex-style patch tool calls.
 * Supports:
 *   - Unified diffs via stdin -> git apply
 *   - JSON edits via stdin: { changes:[{path, action, content?}] }
 *
 * Actions (JSON):
 *   - { path, action: "rewrite", content }
 *   - { path, action: "append",  content }
 *   - { path, action: "delete" }
 *   - { path, action: "chmod",   mode }     // e.g. "755"
 *
 * Flags:
 *   --check       Dry-run/validate (git apply --check or no-op verify)
 *   --allow-add   Allow creating new files from JSON (default true)
 *   --no-allow-add  Disallow creating new files from JSON
 *
 * Exit codes:
 *   0 success, 1 usage/input error, 2 apply failed
 */
import { spawnSync } from "node:child_process";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  statSync,
  rmSync,
  chmodSync,
} from "node:fs";
import { dirname, resolve, sep, isAbsolute } from "node:path";

function readStdinSync() {
  let data = "";
  try {
    const buf = readFileSync(0, "utf8");
    data = buf.toString();
  } catch (_) {}
  return data.trim();
}

function die(msg, code = 1) {
  console.error(`[apply_patch] ${msg}`);
  process.exit(code);
}

function insideRepo(path, repoRoot) {
  const abs = resolve(repoRoot, path);
  return abs.startsWith(repoRoot + sep);
}

function getRepoRoot() {
  const probe = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    encoding: "utf8",
  });
  if (probe.status === 0) return probe.stdout.trim();
  // Fallback to CWD if not a git repo; still enforce path safety.
  return process.cwd();
}

function isUnifiedDiff(s) {
  if (!s) return false;
  // Heuristics: presence of diff headers
  return /^(diff --git|Index: |\+\+\+ |--- )/m.test(s);
}

function maybeJson(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function applyUnifiedDiff(patch, repoRoot, checkOnly) {
  const baseArgs = ["apply", "--whitespace=nowarn"];
  if (checkOnly) baseArgs.push("--check");
  const baseResult = spawnSync("git", baseArgs, {
    encoding: "utf8",
    cwd: repoRoot,
    input: patch,
  });
  if (baseResult.status === 0) return;

  const fallbackArgs = ["apply", "--whitespace=nowarn", "--3way"];
  if (checkOnly) fallbackArgs.push("--check");
  const fallbackResult = spawnSync("git", fallbackArgs, {
    encoding: "utf8",
    cwd: repoRoot,
    input: patch,
  });
  if (fallbackResult.status === 0) return;

  for (const output of [
    baseResult.stdout,
    baseResult.stderr,
    fallbackResult.stdout,
    fallbackResult.stderr,
  ]) {
    if (output) {
      console.error(output);
    }
  }

  die("git apply failed after attempting --3way", 2);
}

function ensureDir(p) {
  mkdirSync(dirname(p), { recursive: true });
}

function applyJsonEdits(doc, repoRoot, checkOnly, allowAdd) {
  if (!doc || !Array.isArray(doc.changes))
    die("Invalid JSON: expected { changes: [...] }", 1);

  // Validate all paths first
  for (const c of doc.changes) {
    if (!c || typeof c.path !== "string" || !c.path.length)
      die("Invalid change entry (missing path)", 1);
    if (isAbsolute(c.path) || c.path.includes(".."))
      die(`Unsafe path: ${c.path}`, 1);
    const abs = resolve(repoRoot, c.path);
    if (!insideRepo(abs, repoRoot)) die(`Path escapes repo: ${c.path}`, 1);
  }

  if (checkOnly) {
    // For check, just verify we *could* do the operations
    for (const c of doc.changes) {
      const abs = resolve(repoRoot, c.path);
      switch (c.action) {
        case "rewrite":
        case "append":
          if (!allowAdd) {
            try {
              statSync(abs);
            } catch {
              die(`File does not exist and --no-allow-add: ${c.path}`, 1);
            }
          }
          if (typeof c.content !== "string")
            die(`Missing content for ${c.action}: ${c.path}`, 1);
          break;
        case "delete":
          try {
            statSync(abs);
          } catch {
            /* ok: deleting non-existent is a no-op */
          }
          break;
        case "chmod":
          if (!c.mode) die(`Missing mode for chmod: ${c.path}`, 1);
          break;
        default:
          die(`Unknown action: ${c.action}`, 1);
      }
    }
    return;
  }

  // Apply
  for (const c of doc.changes) {
    const abs = resolve(repoRoot, c.path);
    switch (c.action) {
      case "rewrite": {
        ensureDir(abs);
        writeFileSync(abs, c.content ?? "", "utf8");
        break;
      }
      case "append": {
        ensureDir(abs);
        let prev = "";
        try {
          prev = readFileSync(abs, "utf8");
        } catch {}
        writeFileSync(abs, prev + (c.content ?? ""), "utf8");
        break;
      }
      case "delete": {
        try {
          rmSync(abs, { force: true });
        } catch {}
        break;
      }
      case "chmod": {
        chmodSync(abs, c.mode);
        break;
      }
      default:
        die(`Unknown action: ${c.action}`, 1);
    }
  }
}

(function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes("--check");
  const allowAdd = args.includes("--no-allow-add") ? false : true;

  const input = readStdinSync();
  if (!input)
    die("No input provided on stdin (expecting unified diff or JSON).", 1);

  const repoRoot = getRepoRoot();

  if (isUnifiedDiff(input)) {
    applyUnifiedDiff(input, repoRoot, checkOnly);
    console.log(
      checkOnly
        ? "[apply_patch] OK (diff validated)"
        : "[apply_patch] OK (diff applied)",
    );
    process.exit(0);
  }

  const asJson = maybeJson(input);
  if (asJson) {
    applyJsonEdits(asJson, repoRoot, checkOnly, allowAdd);
    console.log(
      checkOnly
        ? "[apply_patch] OK (json validated)"
        : "[apply_patch] OK (json applied)",
    );
    process.exit(0);
  }

  die("Unrecognized input. Provide a unified diff or JSON edits.", 1);
})();
