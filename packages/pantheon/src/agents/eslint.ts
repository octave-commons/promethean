import { Agent, run, setDefaultOpenAIClient, tool } from "@openai/agents";
import OpenAI from "openai";
import { z } from "zod";
import { createApplyEditsTool, createDoneTool, readFileSlice } from "./shared";

export type EslintAgentOptions = {
  readonly baseURL?: string;
  readonly apiKey?: string;
  readonly model?: string;
  readonly batch?: number;
  readonly maxIter?: number;
  readonly globs?: readonly string[];
};

async function eslintScan(globs: readonly string[]) {
  try {
    const { ESLint } = await import("eslint");
    const eslint = new ESLint({ fix: false, useEslintrc: true });
    const results = await eslint.lintFiles(globs as string[]);
    const problems: Array<any> = [];
    for (const r of results) {
      for (const m of r.messages) {
        problems.push({ file: r.filePath, lineNumber: m.line ?? 1, ruleId: m.ruleId, severity: m.severity, message: m.message });
      }
    }
    return problems;
  } catch (e) {
    throw new Error(`ESLint not available: ${String(e)}`);
  }
}

async function readFileSlice(file: string, lineStart: number) {
  const text = await fs.readFile(file, "utf8");
  const lines = text.split("\n");
  const start = Math.max(1, lineStart - 6);
  const end = Math.min(lines.length, lineStart + 6);
  const slice = lines.slice(start - 1, end).join("\n");
  return { slice, start, end };
}

export async function runEslintAgent(opts: EslintAgentOptions = {}) {
  const baseURL = opts.baseURL ?? process.env.OPENAI_BASE_URL ?? "http://localhost:11434/v1";
  const apiKey = opts.apiKey ?? process.env.OPENAI_API_KEY ?? "ollama";
  const model = opts.model ?? process.env.MODEL ?? "gpt-oss:20b-cloud";
  const batch = Math.max(1, opts.batch ?? 25);
  const maxIter = Math.max(1, opts.maxIter ?? 3);
  const globs = (opts.globs ?? ["**/*.{ts,tsx,js,jsx}"]) as readonly string[];

  setDefaultOpenAIClient(new OpenAI({ baseURL, apiKey }));

  const scanTool = tool({
    name: "scan_eslint_issues",
    description: "Scan files with ESLint and return a batch with context",
    parameters: z.object({ globs: z.array(z.string()), limit: z.number().min(1).max(200) }),
    execute: async ({ globs, limit }) => {
      const problems = await eslintScan(globs);
      problems.sort((a, b) => (a.file === b.file ? a.lineNumber - b.lineNumber : a.file.localeCompare(b.file)));
      const selected = problems.slice(0, limit);
      const enriched: any[] = [];
      for (const p of selected) {
        const ctx = await readFileSlice(p.file, p.lineNumber);
        enriched.push({ file: p.file, lineNumber: p.lineNumber, ruleId: p.ruleId, message: p.message, context: ctx.slice, contextStart: ctx.start });
      }
      return JSON.stringify({ count: problems.length, batch: enriched });
    },
  });

  const applyEditsTool = createApplyEditsTool("apply_edits", "Apply minimal edits to files to fix ESLint problems");

  const doneTool = createDoneTool("done", "Finish when no ESLint errors remain or budget exhausted");

  const agent = new Agent({
    name: "eslint-fixer",
    model,
    instructions: [
      "You fix ESLint problems iteratively.",
      "Always call scan_eslint_issues first with the provided globs and the given batch size.",
      "If count is zero, call done and include a short summary.",
      "From each batch item, produce precise minimal edits that resolve the reported lint without stylistic changes beyond what's necessary.",
      `Do not attempt to fix more than ${batch} issues per iteration.`,
    ].join("\n"),
    tools: [scanTool, applyEditsTool, doneTool],
  });

  const result = await run(agent, { input: `Fix ESLint errors with batch=${batch}, maxIter=${maxIter}. Globs=${globs.join(",")}.`, context: { batch, maxIter, globs }, maxIterations: maxIter });
  return { output: result?.finalOutput ?? null };
}
