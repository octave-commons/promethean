import fs from "node:fs/promises";
import markdownlint from "markdownlint";
import OpenAI from "openai";
import { Agent, run, setDefaultOpenAIClient, tool } from "@openai/agents";
import { z } from "zod";

export type MdlintAgentOptions = {
  readonly baseURL?: string;
  readonly apiKey?: string;
  readonly model?: string;
  readonly batch?: number; // issues per iteration
  readonly maxIter?: number;
  readonly globs?: readonly string[];
  readonly ignore?: readonly string[];
};

const DEFAULT_GLOBS = ["README.md", "*.md", "docs/**/*.md", "spec/**/*.md"] as const;
const DEFAULT_IGNORE = ["orgs/**", "**/dist/**", "**/build/**", ".git/**", "node_modules/**"] as const;

async function readMarkdownlintConfig(): Promise<Record<string, unknown>> {
  try {
    const jsonc = await fs.readFile(".markdownlint.jsonc", "utf8");
    const cleaned = jsonc.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\n)\s*\/\/.*$/gm, "");
    return JSON.parse(cleaned);
  } catch {
    return { MD013: false };
  }
}

async function runLint(globs: readonly string[], ignore: readonly string[]) {
  const options = {
    files: globs as string[],
    config: await readMarkdownlintConfig(),
    resultVersion: 3 as const,
    ignorePatterns: ignore as string[],
  };
  const results = await markdownlint.promises.markdownlint(options);
  const problems: Array<any> = [];
  for (const [file, issues] of Object.entries(results)) {
    if (!Array.isArray(issues)) continue;
    for (const issue of issues) problems.push({ file, ...issue });
  }
  return problems;
}

// shared file-slice via shared tool helpers
import { readFileSlice, createApplyEditsTool, createDoneTool } from "./shared";

export async function runMdlintAgent(opts: MdlintAgentOptions = {}) {
  const baseURL = opts.baseURL ?? process.env.OPENAI_BASE_URL ?? "http://localhost:11434/v1";
  const apiKey = opts.apiKey ?? process.env.OPENAI_API_KEY ?? "ollama";
  const model = opts.model ?? process.env.MODEL ?? "gpt-oss:20b-cloud";
  const batch = Math.max(1, opts.batch ?? 25);
  const maxIter = Math.max(1, opts.maxIter ?? 6);
  const globs = (opts.globs ?? DEFAULT_GLOBS) as readonly string[];
  const ignore = (opts.ignore ?? DEFAULT_IGNORE) as readonly string[];

  setDefaultOpenAIClient(new OpenAI({ baseURL, apiKey }));

  const scanLintIssuesTool = tool({
    name: "scan_lint_issues",
    description: "Scan markdown files for lint problems and return a batch with nearby context",
    parameters: z.object({ globs: z.array(z.string()), limit: z.number().min(1).max(200) }),
    execute: async ({ globs, limit }) => {
      const problems = await runLint(globs, ignore);
      problems.sort((a, b) => (a.file === b.file ? a.lineNumber - b.lineNumber : a.file.localeCompare(b.file)));
      const selected = problems.slice(0, limit);
      const enriched = [] as any[];
      for (const p of selected) {
        const ctx = await readFileSlice(p.file, p.lineNumber, p.lineNumber);
        enriched.push({
          file: p.file,
          lineNumber: p.lineNumber,
          ruleNames: p.ruleNames,
          ruleDescription: p.ruleDescription,
          errorDetail: p.errorDetail || "",
          context: ctx.slice,
          contextStart: ctx.start,
        });
      }
      return JSON.stringify({ count: problems.length, batch: enriched });
    },
  });

  const applyEditsTool = createApplyEditsTool("apply_edits", "Apply minimal edits to files to fix markdownlint problems");

  const doneTool = createDoneTool("done", "Finish when there are no remaining markdownlint errors or budget is exhausted");

  const agent = new Agent({
    name: "mdlint-fixer",
    model,
    instructions: [
      "You fix markdownlint problems iteratively.",
      "Always call scan_lint_issues first with the provided globs and the given batch size.",
      "If count is zero, call done and include a short summary.",
      "From each batch item, produce precise minimal edits that correct only formatting issues (headings, blank lines, fenced code languages, trailing spaces, final newline).",
      `Do not attempt to fix more than ${batch} issues per iteration.`,
    ].join("\n"),
    tools: [scanLintIssuesTool, applyEditsTool, doneTool],
  });

  const result = await run(agent, {
    input: `Fix markdownlint errors with batch=${batch}, maxIter=${maxIter}. Globs=${globs.join(",")}.
Repeat scan/apply until clean or limit reached.`,
    context: { batch, maxIter, globs },
    maxIterations: maxIter,
  });

  const remaining = await runLint(globs, ignore);
  return { remaining: remaining.length, output: result?.finalOutput ?? null };
}
