#!/usr/bin/env node

/*
  Markdown Lint Agent (Tool-Calling)
  - Uses OpenAI SDK (OpenAI-compatible) with function tools
  - Targets Ollama via OPENAI_BASE_URL with model gpt-oss:20b-cloud
  - Falls back to JSON edits if the model does not return tool_calls

  Env:
  - OPENAI_BASE_URL (default http://localhost:11434/v1)
  - OPENAI_API_KEY  (default "ollama")
  - MODEL (default gpt-oss:20b-cloud)
*/

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import markdownlint from "markdownlint";
import OpenAI from "openai";

const BASE_URL = process.env.OPENAI_BASE_URL || "http://localhost:11434/v1";
const API_KEY = process.env.OPENAI_API_KEY || "ollama";
const MODEL = process.env.MODEL || "gpt-oss:20b-cloud";

const DEFAULT_GLOBS = ["README.md", "*.md", "docs/**/*.md", "spec/**/*.md"];
const DEFAULT_IGNORE = ["orgs/**", "**/dist/**", "**/build/**", ".git/**", "node_modules/**"];

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { batch: 25, maxIter: 6 };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--batch") out.batch = Number(args[++i]);
    else if (a === "--max-iter") out.maxIter = Number(args[++i]);
  }
  return out;
}

async function readMarkdownlintConfig() {
  try {
    const jsonc = await fs.readFile(".markdownlint.jsonc", "utf8");
    const cleaned = jsonc.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\n)\s*\/\/.*$/gm, "");
    return JSON.parse(cleaned);
  } catch (_) {
    return { MD013: false };
  }
}

async function runLint(globs) {
  const options = { files: globs, config: await readMarkdownlintConfig(), resultVersion: 3, ignorePatterns: DEFAULT_IGNORE };
  const results = await markdownlint.promises.markdownlint(options);
  const problems = [];
  for (const [file, issues] of Object.entries(results)) {
    if (!Array.isArray(issues)) continue;
    for (const issue of issues) problems.push({ file, ...issue });
  }
  return problems;
}

async function readFileSlice(file, lineStart, lineEnd) {
  const text = await fs.readFile(file, "utf8");
  const lines = text.split("\n");
  const start = Math.max(1, lineStart - 6);
  const end = Math.min(lines.length, lineEnd + 6);
  const slice = lines.slice(start - 1, end).join("\n");
  return { slice, start, end, total: lines.length };
}

const tools = [
  {
    type: "function",
    function: {
      name: "scan_lint_issues",
      description: "Scan markdown files for lint problems and return a batch with context",
      parameters: {
        type: "object",
        properties: {
          globs: { type: "array", items: { type: "string" } },
          limit: { type: "integer", minimum: 1, maximum: 200 },
        },
        required: ["globs", "limit"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "apply_edits",
      description: "Apply a set of minimal edits to files (by start/end lines)",
      parameters: {
        type: "object",
        properties: {
          edits: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: { type: "string" },
                startLine: { type: "integer", minimum: 1 },
                endLine: { type: "integer", minimum: 1 },
                replacement: { type: "string" },
              },
              required: ["path", "startLine", "endLine", "replacement"],
              additionalProperties: false,
            },
          },
        },
        required: ["edits"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "done",
      description: "Finish the session with a message",
      parameters: {
        type: "object",
        properties: { reason: { type: "string" } },
        required: ["reason"],
        additionalProperties: false,
      },
    },
  },
];

async function tool_scan_lint_issues(args, batch) {
  const globs = Array.isArray(args?.globs) && args.globs.length ? args.globs : DEFAULT_GLOBS;
  const limit = Math.max(1, Math.min(Number(args?.limit || batch), 200));
  const problems = await runLint(globs);
  problems.sort((a, b) => (a.file === b.file ? a.lineNumber - b.lineNumber : a.file.localeCompare(b.file)));
  const selected = problems.slice(0, limit);
  const enriched = [];
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
  return { count: problems.length, batch: enriched };
}

async function tool_apply_edits(args) {
  const edits = Array.isArray(args?.edits) ? args.edits : [];
  let changed = 0;
  for (const e of edits) {
    const full = path.join(process.cwd(), e.path);
    const content = await fs.readFile(full, "utf8");
    const lines = content.split("\n");
    const s = Math.max(1, e.startLine) - 1;
    const t = Math.min(lines.length, e.endLine);
    const replacementLines = (e.replacement ?? "").replace(/\r\n/g, "\n").split("\n");
    const newLines = [...lines.slice(0, s), ...replacementLines, ...lines.slice(t)];
    const newText = newLines.join("\n");
    if (newText !== content) {
      await fs.writeFile(full, newText, "utf8");
      changed++;
    }
  }
  return { changed };
}

async function main() {
  const { batch, maxIter } = parseArgs();
  const client = new OpenAI({ apiKey: API_KEY, baseURL: BASE_URL });
  const messages = [
    {
      role: "system",
      content:
        "You are a markdown fixer agent. Use scan_lint_issues to get a batch of problems, then apply_edits with minimal changes. Iterate in small batches until clean, then call done. Do not change meaning; only formatting and languages for code fences and headings/blank lines.",
    },
    { role: "user", content: `Start. Use batches of ${batch}.` },
  ];

  for (let iter = 1; iter <= maxIter; iter++) {
    const resp = await client.chat.completions.create({ model: MODEL, messages, tools, temperature: 0 });
    const choice = resp.choices[0];
    const msg = choice.message;

    if (msg.tool_calls && msg.tool_calls.length) {
      for (const tc of msg.tool_calls) {
        const name = tc.function?.name;
        const args = tc.function?.arguments ? JSON.parse(tc.function.arguments) : {};
        let result = null;
        if (name === "scan_lint_issues") result = await tool_scan_lint_issues(args, batch);
        else if (name === "apply_edits") result = await tool_apply_edits(args);
        else if (name === "done") {
          messages.push({ role: "assistant", content: "done" });
          console.log(`[agent] done: ${args?.reason || "no reason"}`);
          const remain = await runLint(DEFAULT_GLOBS);
          console.log(`[agent] remaining: ${remain.length}`);
          process.exit(remain.length === 0 ? 0 : 1);
        }
        messages.push({ role: "assistant", tool_call_id: tc.id, name, content: JSON.stringify(result ?? {}) });
      }
      continue;
    }

    // Fallback path: model did not use tools; try to parse JSON edits
    const text = msg.content?.trim() || "";
    try {
      const json = JSON.parse(text);
      const edits = Array.isArray(json?.edits) ? json.edits : [];
      if (edits.length > 0) await tool_apply_edits({ edits });
    } catch (_) {
      // no-op
    }

    // Check if clean or keep going
    const problems = await runLint(DEFAULT_GLOBS);
    if (problems.length === 0) break;
    messages.push({ role: "user", content: `Continue. Remaining problems: ${problems.length}` });
  }

  const remain = await runLint(DEFAULT_GLOBS);
  console.log(`[agent] remaining: ${remain.length}`);
  process.exit(remain.length === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
