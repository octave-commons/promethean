// SPDX-License-Identifier: GPL-3.0-only
import * as path from "path";
import type { History } from "../types.js";

export function buildPrompt(err: {file:string; line:number; col:number; code:string; message:string; frame:string; key:string}, history: History){
  const prev = history.attempts.map(a =>
`ATTEMPT #${a.n}
Plan: ${a.planSummary}
Commit: ${a.commitSha ?? "(no-commit)"} ${a.pushed ? "(pushed)" : ""}
Result: tsc ${a.resolved ? "OK" : "failed"}; after=${a.tscAfterCount}; stillPresent=${a.errorStillPresent}
`).join("\n");

  return [
`You are a TypeScript ts-morph refactoring agent.

Return ONLY JSON with keys:
- title (string)
- rationale (string)
- EITHER "snippet_b64" (base64-encoded UTF-8 of an ESM JS file exporting: "export async function apply(project){...}")
- OR "dsl" (array of operations). Example op: {"op":"ensureExported","file":"src/foo.ts","symbol":"bar","kind":"function"}

Rules:
- Do NOT include backticks or markdown fences anywhere.
- If you provide "snippet_b64", the JS must import nothing except what's available in ts-morph Project and standard runtime.
- Prefer minimal, targeted edits.

Target error:
FILE: ${err.file}
LINE: ${err.line}, COL: ${err.col}
CODE: ${err.code}
MESSAGE: ${err.message}

Code frame:
${err.frame}

Previous attempts:
${prev || "(none)"}
`
  ].join("\n");
}
