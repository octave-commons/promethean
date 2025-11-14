import { Agent, run, setDefaultOpenAIClient, tool } from "@openai/agents";
import OpenAI from "openai";
import { z } from "zod";
import { spawn } from "node:child_process";
import { readFileSlice, createApplyEditsTool, createDoneTool } from "./shared";

export type TestFixAgentOptions = {
  readonly baseURL?: string;
  readonly apiKey?: string;
  readonly model?: string;
  readonly batch?: number;
  readonly maxIter?: number;
  readonly cmd?: string; // e.g., "pnpm test --silent"
};

async function runTests(cmd: string) {
  const [bin, ...args] = cmd.split(/\s+/);
  return new Promise<string>((resolve) => {
    const p = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";
    p.stdout.on("data", (d) => (out += String(d)));
    p.stderr.on("data", (d) => (err += String(d)));
    p.on("close", () => resolve(out + err));
  });
}

function parseFailures(output: string) {
  // Heuristic: capture lines like path:line:col or at file:line
  const items: Array<{ file: string; line: number; message: string }> = [];
  const regex = /(\S+\.(?:ts|tsx|js|jsx)):(\d+)(?::\d+)?[\s\S]*?\n([^\n]{0,200})/g;
  for (const m of output.matchAll(regex)) {
    items.push({ file: m[1], line: Number(m[2]), message: m[3] });
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

export async function runTestFixAgent(opts: TestFixAgentOptions = {}) {
  const baseURL = opts.baseURL ?? process.env.OPENAI_BASE_URL ?? "http://localhost:11434/v1";
  const apiKey = opts.apiKey ?? process.env.OPENAI_API_KEY ?? "ollama";
  const model = opts.model ?? process.env.MODEL ?? "gpt-oss:20b-cloud";
  const batch = Math.max(1, opts.batch ?? 5);
  const maxIter = Math.max(1, opts.maxIter ?? 2);
  const cmd = opts.cmd ?? "pnpm test --silent";

  setDefaultOpenAIClient(new OpenAI({ baseURL, apiKey }));

  const scanTool = tool({
    name: "scan_test_failures",
    description: "Run tests and return a batch of failures with context",
    parameters: z.object({ cmd: z.string(), limit: z.number().min(1).max(50) }),
    execute: async ({ cmd, limit }) => {
      const out = await runTests(cmd);
      const fails = parseFailures(out);
      const batchItems = fails.slice(0, limit);
      const enriched: any[] = [];
      for (const f of batchItems) {
        const ctx = await readFileSlice(f.file, f.line);
        enriched.push({ file: f.file, lineNumber: f.line, message: f.message, context: ctx.slice, contextStart: ctx.start });
      }
      return JSON.stringify({ count: fails.length, batch: enriched });
    },
  });

  const applyEditsTool = createApplyEditsTool("apply_edits", "Apply minimal code edits to address test failures");

  const doneTool = createDoneTool("done", "Finish when tests pass or budget exhausted");

  const agent = new Agent({
    name: "test-fixer",
    model,
    instructions: [
      "You fix test failures iteratively.",
      "Always call scan_test_failures first with the provided command and batch size.",
      "If count is zero, call done with a summary.",
      "From each batch item, propose minimal safe edits to address the failure cause.",
      `Do not attempt to fix more than ${batch} issues per iteration.`,
    ].join("\n"),
    tools: [scanTool, applyEditsTool, doneTool],
  });

  const result = await run(agent, { input: `Fix test failures with batch=${batch}, maxIter=${maxIter}.`, context: { batch, maxIter, cmd }, maxIterations: maxIter });
  return { output: result?.finalOutput ?? null };
}
