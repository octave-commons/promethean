/* eslint-disable no-console */
import * as path from "path";
import { promises as fs } from "fs";
import matter from "gray-matter";
import { z } from "zod";
import { parseArgs, normStatus, ollamaJSON, writeText } from "./utils.js";
import type { PromptChunk, TaskContext, EvalItem } from "./types.js";

const args = parseArgs({
  "--tasks": "docs/agile/tasks",
  "--prompts": ".cache/boardrev/prompts.json",
  "--context": ".cache/boardrev/context.json",
  "--model": "qwen3:4b",
  "--out": ".cache/boardrev/evals.json"
});

const EvalSchema = z.object({
  inferred_status: z.string().min(1),
  confidence: z.number().min(0).max(1),
  summary: z.string().min(1),
  suggested_actions: z.array(z.string()).min(1),
  blockers: z.array(z.string()).optional(),
  suggested_labels: z.array(z.string()).optional(),
  suggested_assignee: z.string().optional()
});

async function main() {
  const prompts: { prompts: PromptChunk[] } = JSON.parse(await fs.readFile(path.resolve(args["--prompts"]!), "utf-8"));
  const contexts: { contexts: TaskContext[] } = JSON.parse(await fs.readFile(path.resolve(args["--context"]!), "utf-8"));

  const items: EvalItem[] = [];

  for (const ctx of contexts.contexts) {
    const raw = await fs.readFile(ctx.taskFile, "utf-8");
    const gm = matter(raw);
    const status = normStatus(gm.data?.status ?? "todo");
    const p = prompts.prompts.find(x => x.heading === status) ?? prompts.prompts.find(x => x.heading === "general");

    const sys = [
      "You are a delivery lead reviewing a task.",
      "Return ONLY JSON with keys: inferred_status, confidence (0..1), summary, suggested_actions[], blockers?[], suggested_labels?[], suggested_assignee?",
      "Be concise and specific. Prefer one crisp next action."
    ].join("\n");

    const user = [
      `PROCESS_PROMPT: ${p?.prompt ?? ""}`,
      "",
      `TASK_TITLE: ${gm.data?.title ?? ""}`,
      `TASK_STATUS: ${status}  PRIORITY: ${gm.data?.priority ?? ""}`,
      "",
      "TASK_BODY:",
      (gm.content || "").slice(0, 4000),
      "",
      "CONTEXT_TOP_MATCHES:",
      ...ctx.hits.map(h => `- (${h.score.toFixed(2)}) ${h.path}\n  ${h.excerpt.slice(0, 400)}`),
      "",
      ctx.links.length ? `EXPLICIT_LINKS:\n${ctx.links.map(l => "- "+l).join("\n")}` : ""
    ].filter(Boolean).join("\n");

    let obj: any;
    try { obj = await ollamaJSON(args["--model"]!, `SYSTEM:\n${sys}\n\nUSER:\n${user}`); }
    catch { obj = { inferred_status: status, confidence: 0.5, summary: "Review failed; keep current status.", suggested_actions: ["Manually review this task."] }; }

    const parsed = EvalSchema.safeParse(obj);
    const clean = parsed.success ? parsed.data : { inferred_status: status, confidence: 0.5, summary: "LLM parse failed", suggested_actions: ["Manual triage required."] };

    const item: EvalItem = {
      taskFile: ctx.taskFile,
      inferred_status: normStatus(clean.inferred_status),
      confidence: clean.confidence,
      summary: clean.summary,
      suggested_actions: clean.suggested_actions,
      ...(clean.blockers ? { blockers: clean.blockers } : {}),
      ...(clean.suggested_labels ? { suggested_labels: clean.suggested_labels } : {}),
      ...(clean.suggested_assignee ? { suggested_assignee: clean.suggested_assignee } : {})
    };
    items.push(item);
  }

  await writeText(path.resolve(args["--out"]!), JSON.stringify({ evals: items }, null, 2));
  console.log(`boardrev: evaluated ${items.length} task(s)`);
}

main().catch(e => { console.error(e); process.exit(1); });
