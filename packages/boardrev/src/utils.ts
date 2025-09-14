// SPDX-License-Identifier: GPL-3.0-only
// Native ESM; NodeNext; no HTML here.

import { promises as fs } from "fs"; // Node fs/promises ESM is fine on modern Node.
import * as path from "path";

import { globby } from "globby";

/**
 * Minimal, side-effect-free arg parser.
 * Keeps your existing convention of keys including the leading `--`.
 * Supports `--flag value` and bare flags (`--flag` => "true").
 */
export function parseArgs(defaults: Record<string, string>) {
  const out: Record<string, string> = { ...defaults };
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    const k = a[i]!;
    if (!k.startsWith("--")) continue;
    const v = a[i + 1] && !a[i + 1]!.startsWith("--") ? a[++i]! : "true";
    out[k] = v;
  }
  return out;
}

/**
 * Find markdown task files (skip READMEs).
 * Globs require forward slashes; normalize on Windows.
 */
export async function listTaskFiles(dir: string) {
  return globby([`${dir.replace(/\\/g, "/")}/**/*.md`, "!**/README.md"]); // forward slashes per globby docs
}

export async function readText(p: string) {
  return fs.readFile(p, "utf-8");
}

export async function writeText(p: string, s: string) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, s, "utf-8");
}

export async function readMaybe(p: string) {
  try {
    return await fs.readFile(p, "utf-8");
  } catch {
    return undefined;
  }
}

export function normStatus(s: string) {
  const t = (s || "").toLowerCase();
  if (/backlog/.test(t)) return "backlog";
  if (/todo|to[-\s]?do/.test(t)) return "todo";
  if (/doing|in[-\s]?progress/.test(t)) return "doing";
  if (/review|pr|code[-\s]?review/.test(t)) return "review";
  if (/block/.test(t)) return "blocked";
  if (/done|complete/.test(t)) return "done";
  return "todo";
}

/**
 * Ollama embeddings.
 * NOTE: Some tooling/docs reference /api/embed; /api/embeddings is widely used.
 */

/** Cosine similarity: safe when vectors differ in length. */
