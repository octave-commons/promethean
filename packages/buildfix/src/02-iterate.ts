/* eslint-disable no-console */
import * as path from "path";
import { promises as fs } from "fs";
import { z } from "zod";
import { parseArgs, writeJSON, readJSON, tsc, ensureDir, applySnippetToProject, ollamaJSON } from "./utils.js";
import type { ErrorList, History, Attempt, Summary } from "./types.js";

const args = parseArgs({
  "--errors": ".cache/buildfix/errors.json",
  "--out": ".cache/buildfix",
  "--model": "qwen3:4b",
  "--max-cycles": "5",
  "--only-code": "",    // e.g. TS2345
  "--only-file": "",    // substring filter
  "--tsconfig": ""      // override if needed
});

const PlanSchema = z.object({
  title: z.string().min(1),
  rationale: z.string().min(1),
  snippet: z.string().min(30) // ESM JS code with 'export async function apply(project){...}'
});

function promptFor(error: any, history: History) {
  const prev = history.attempts.map(a =>
    `ATTEMPT #${a.n}
Plan: ${a.planSummary}
Snippet: ${path.basename(a.snippetPath)}
Result: tsc ${a.resolved ? "OK" : "failed"}; after=${a.tscAfterCount} errors; stillPresent=${a.errorStillPresent}
`).join("\n");

  return [
`You are a TypeScript refactoring agent using ts-morph.
Goal: fix the specific TypeScript error below by modifying source with ts-morph calls.

Return ONLY JSON with keys:
- title: short label of your approach
- rationale: why this fix should work
- snippet: ESM JavaScript code (NOT TypeScript). It MUST export:
    export async function apply(project) { /* ts-morph edits */ }
  You can: add imports/exports, adjust types, make params optional, rename symbols, create stubs, etc.
  Use project to navigate & save edits. Do NOT run shell commands. Do NOT use fs.

Target error:
FILE: ${error.file}
LINE: ${error.line}, COL: ${error.col}
CODE: ${error.code}
MESSAGE: ${error.message}

Code frame:
${error.frame}

Previous attempts (for context; avoid repeating ideas):
${prev || "(none)"}`
  ].join("\n");
}

function errorStillPresent(diags: any[], key: string) {
  // compare by code + file, and near the original line (±2)
  const [code, file, lineStr] = key.split("|");
  const line = Number(lineStr);
  return diags.some(d => d.code === code && path.resolve(d.file) === path.resolve(file) && Math.abs(d.line - line) <= 2);
}

async function main() {
  const errors = await readJSON<ErrorList>(path.resolve(args["--errors"]));
  if (!errors) throw new Error("errors.json not found");
  const tsconfig = args["--tsconfig"] || errors.tsconfig;
  const onlyCode = (args["--only-code"] || "").trim();
  const onlyFile = (args["--only-file"] || "").trim();
  const maxCycles = Number(args["--max-cycles"]);
  const OUT = path.resolve(args["--out"]);

  const filtered = errors.errors.filter(e =>
    (!onlyCode || e.code === onlyCode) && (!onlyFile || e.file.includes(onlyFile))
  );

  const summary: Summary = { iteratedAt: new Date().toISOString(), tsconfig, maxCycles, items: [] };

  for (const err of filtered) {
    const histPath = path.join(OUT, "history", err.key, "history.json");
    await ensureDir(path.dirname(histPath));
    const history: History = (await readJSON<History>(histPath)) ?? { key: err.key, file: err.file, code: err.code, attempts: [] };

    let resolved = false;

    for (let n = history.attempts.length + 1; n <= maxCycles; n++) {
      // 1) build current to know baseline
      const before = await tsc(tsconfig);

      // if the error already disappeared (e.g., manual fix), stop
      if (!errorStillPresent(before.diags, err.key)) { resolved = true; break; }

      // 2) ask LLM for a new plan (include prior attempts)
      let plan: z.infer<typeof PlanSchema>;
      try {
        const obj = await ollamaJSON(args["--model"], promptFor(err, history));
        const parsed = PlanSchema.safeParse(obj);
        if (!parsed.success) throw new Error("invalid plan JSON");
        plan = parsed.data;
      } catch (e) {
        console.error(`✖ plan generation failed for ${err.key}:`, e);
        break;
      }

      // 3) write snippet & execute
      const root = path.join(OUT, "snippets", err.key);
      await ensureDir(root);
      const snippetPath = path.join(root, `attempt-${String(n).padStart(2,"0")}.mjs`);
      await fs.writeFile(snippetPath, plan.snippet, "utf-8");

      try {
        await applySnippetToProject(tsconfig, snippetPath);
      } catch (e) {
        console.error(`✖ snippet apply failed (attempt #${n}) for ${err.key}:`, e);
        // record failed attempt anyway
      }

      // 4) rebuild and evaluate
      const after = await tsc(tsconfig);

      const att: Attempt = {
        n,
        snippetPath,
        planSummary: plan.title,
        tscBeforeCount: before.diags.length,
        tscAfterCount: after.diags.length,
        resolved: after.ok || !errorStillPresent(after.diags, err.key),
        errorStillPresent: errorStillPresent(after.diags, err.key),
        newErrors: after.diags.slice(0, 5).map(d => `${d.code} ${d.file}(${d.line},${d.col}) ${d.message}`)
      };

      history.attempts.push(att);
      await writeJSON(histPath, history);

      if (att.resolved) { resolved = true; history.resolvedAt = new Date().toISOString(); await writeJSON(histPath, history); break; }
    }

    summary.items.push({
      key: err.key,
      resolved,
      attempts: history.attempts.length,
      lastSnippet: history.attempts.at(-1)?.snippetPath
    });
  }

  await writeJSON(path.join(OUT, "summary.json"), summary);
  console.log(`buildfix: iterate complete — resolved ${summary.items.filter(i=>i.resolved).length}/${summary.items.length}`);
}

main().catch(e => { console.error(e); process.exit(1); });
