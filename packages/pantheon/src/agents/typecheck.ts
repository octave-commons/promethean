import { Agent, run, setDefaultOpenAIClient, tool } from "@openai/agents";
import OpenAI from "openai";
import { z } from "zod";
import { spawn } from "node:child_process";
import { readFileSlice, createApplyEditsTool, createDoneTool } from "./shared";

export type TypecheckAgentOptions = {
  readonly baseURL?: string;
  readonly apiKey?: string;
  readonly model?: string;
  readonly batch?: number;
  readonly maxIter?: number;
  readonly project?: string; // tsconfig path or cwd
};

async function runTsc(project?: string) {
  const args = ["--noEmit"]; // keep basic; rely on local ts
  if (project) args.push("-p", project);
  return new Promise<string>((resolve) => {
    const p = spawn("npx", ["-y", "tsc", ...args], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";
    p.stdout.on("data", (d) => (out += String(d)));
    p.stderr.on("data", (d) => (err += String(d)));
    p.on("close", () => resolve(out + err));
  });
}

function parseDiagnostics(output: string) {
  const items: Array<{ file: string; line: number; message: string }> = [];
  const regex = /(.*?\.tsx?|\.ts)\((\d+),(\d+)\): error (TS\d+): (.*)/g;
  for (const m of output.matchAll(regex)) {
    items.push({ file: m[1], line: Number(m[2]), message: `${m[4]}: ${m[5]}` });
  }
  return items;
}

async function readFileSlice(file: string, line: number) {
  try {
    const text = await fs.readFile(file, "utf8");
    const lines = text.split("\n");
    const start = Math.max(1, line - 6);
    const end = Math.min(lines.length, line + 6);
    return { slice: lines.slice(start - 1, end).join("\n"), start, end };
  } catch {
    return { slice: "", start: Math.max(1, line - 3), end: line + 3 };
  }
}

export async function runTypecheckAgent(opts: TypecheckAgentOptions = {}) {
  const baseURL = opts.baseURL ?? process.env.OPENAI_BASE_URL ?? "http://localhost:11434/v1";
  const apiKey = opts.apiKey ?? process.env.OPENAI_API_KEY ?? "ollama";
  const model = opts.model ?? process.env.MODEL ?? "gpt-oss:20b-cloud";
  const batch = Math.max(1, opts.batch ?? 10);
  const maxIter = Math.max(1, opts.maxIter ?? 3);

  setDefaultOpenAIClient(new OpenAI({ baseURL, apiKey }));

  const scanTool = tool({
    name: "scan_tsc_errors",
    description: "Run TypeScript typecheck and return up to limit diagnostics with context",
    parameters: z.object({ project: z.string().optional(), limit: z.number().min(1).max(100) }),
    execute: async ({ project, limit }) => {
      const out = await runTsc(project);
      const diags = parseDiagnostics(out);
      const batchItems = diags.slice(0, limit);
      const enriched: any[] = [];
      for (const d of batchItems) {
        const ctx = await readFileSlice(d.file, d.line);
        enriched.push({ file: d.file, lineNumber: d.line, message: d.message, context: ctx.slice, contextStart: ctx.start });
      }
      return JSON.stringify({ count: diags.length, batch: enriched });
    },
  });

  const applyEditsTool = createApplyEditsTool("apply_edits", "Apply minimal code edits to address type errors");

  const doneTool = createDoneTool("done", "Finish when no type errors remain or budget exhausted");

  const agent = new Agent({
    name: "ts-typecheck-fixer",
    model,
    instructions: [
      "You fix TypeScript type errors iteratively.",
      "Always call scan_tsc_errors first with the provided project and batch size.",
      "If count is zero, call done with a short summary.",
      "From each batch item, propose minimal safe edits that address the error.",
      `Do not attempt to fix more than ${batch} issues per iteration.`,
    ].join("\n"),
    tools: [scanTool, applyEditsTool, doneTool],
  });

  const result = await run(agent, { input: `Fix type errors with batch=${batch}, maxIter=${maxIter}.`, context: { batch, maxIter, project: opts.project }, maxIterations: maxIter });
  return { output: result?.finalOutput ?? null };
}
