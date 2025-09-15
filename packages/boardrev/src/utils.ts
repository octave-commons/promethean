// SPDX-License-Identifier: GPL-3.0-only
// Native ESM; NodeNext; no HTML here.

import { globby } from "globby";

/**
 * Find markdown task files (skip READMEs).
 * Globs require forward slashes; normalize on Windows.
 */
export async function listTaskFiles(
  dir: string,
): Promise<ReadonlyArray<string>> {
  return globby([`${dir.replace(/\\/g, "/")}/**/*.md`, "!**/README.md"]);
}

export function normStatus(s: string): string {
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
