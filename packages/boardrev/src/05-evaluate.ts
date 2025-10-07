import * as path from "path";
import { promises as fs } from "fs";

import matter from "gray-matter";
import { z } from "zod";
import {
  parseArgs,
  ollamaJSON,
  writeText,
  createLogger,
} from "@promethean/utils";

import { normStatus } from "./utils.js";
import type { PromptChunk, TaskContext, EvalItem, TaskFM } from "./types.js";

interface EnhancedTaskContext extends TaskContext {
  buildTestResults?: Array<{
    taskFile: string;
    affectedFiles: string[];
    buildResult?: {
      success: boolean;
      output: string;
      errors: string[];
    };
    testResult?: {
      success: boolean;
      output: string;
      failedTests: string[];
    };
    lintResult?: {
      success: boolean;
      output: string;
      warnings: string[];
      errors: string[];
    };
  }>;
}

const logger = createLogger({ service: "boardrev" });

const EvalSchema = z.object({
  inferred_status: z.string().min(1),
  confidence: z.number().min(0).max(1),
  summary: z.string().min(1),
  suggested_actions: z.array(z.string()).min(1),
  blockers: z.array(z.string()).optional(),
  suggested_labels: z.array(z.string()).optional(),
  suggested_assignee: z.string().optional(),
});

// eslint-disable-next-line max-lines-per-function, complexity, sonarjs/cognitive-complexity
export async function evaluate({
  prompts: promptsPath,
  context: contextPath,
  model,
  out,
}: Readonly<{
  prompts: string;
  context: string;
  model: string;
  out: string;
}>): Promise<void> {
  const promptsData: unknown = JSON.parse(
    await fs.readFile(path.resolve(promptsPath), "utf-8"),
  );
  const prompts = promptsData as { prompts: PromptChunk[] };
  const contextsData: unknown = JSON.parse(
    await fs.readFile(path.resolve(contextPath), "utf-8"),
  );
  const enhancedContexts = contextsData as { contexts: TaskContext[]; buildTestResults?: EnhancedTaskContext['buildTestResults'] };

  const items: EvalItem[] = [];

  for (const ctx of enhancedContexts.contexts) {
    // Find build test results for this task if available
    const buildTestResult = enhancedContexts.buildTestResults?.find(
      result => result.taskFile === ctx.taskFile
    );
    const raw = await fs.readFile(ctx.taskFile, "utf-8");
    const gm = matter(raw);
    const fm = gm.data as Partial<TaskFM>;
    const status = normStatus(fm.status ?? "todo");
    const p =
      prompts.prompts.find((x) => x.heading === status) ??
      prompts.prompts.find((x) => x.heading === "general");

    const sys = [
      "You are a delivery lead reviewing a task.",
      "Return ONLY JSON with keys: inferred_status, confidence (0..1), summary, suggested_actions[], blockers?[], suggested_labels?[], suggested_assignee?",
      "Be concise and specific. Prefer one crisp next action.",
    ].join("\n");

    const user = [
      `PROCESS_PROMPT: ${p?.prompt ?? ""}`,
      "",
      `TASK_TITLE: ${fm.title ?? ""}`,
      `TASK_STATUS: ${status}  PRIORITY: ${fm.priority ?? ""}`,
      "",
      "TASK_BODY:",
      (gm.content || "").slice(0, 4000),
      "",
      buildTestResult ? "BUILD_TEST_RESULTS:" : "",
      buildTestResult ? [
        `Build Status: ${buildTestResult.buildResult?.success ? '✅ PASSED' : '❌ FAILED'}`,
        `Test Status: ${buildTestResult.testResult?.success ? '✅ PASSED' : '❌ FAILED'}`,
        `Lint Status: ${buildTestResult.lintResult?.success ? '✅ PASSED' : '❌ FAILED'}`,
        "",
        `Affected Files: ${buildTestResult.affectedFiles.join(', ')}`,
        buildTestResult.buildResult?.errors.length ? `Build Errors: ${buildTestResult.buildResult.errors.slice(0, 200).join('; ')}` : '',
        buildTestResult.testResult?.failedTests.length ? `Failed Tests: ${buildTestResult.testResult.failedTests.slice(0, 200).join('; ')}` : '',
        buildTestResult.lintResult?.errors.length ? `Lint Errors: ${buildTestResult.lintResult.errors.slice(0, 200).join('; ')}` : '',
        "",
      ].filter(Boolean).join('\n') : '',
      "CONTEXT_TOP_MATCHES:",
      ...ctx.hits.map(
        (h) =>
          `- (${h.score.toFixed(2)}) ${h.path}\n  ${h.excerpt.slice(0, 400)}`,
      ),
      "",
      ctx.links.length
        ? `EXPLICIT_LINKS:\n${ctx.links.map((l) => "- " + l).join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const obj: unknown = await ollamaJSON(
      model,
      `SYSTEM:\n${sys}\n\nUSER:\n${user}`,
    ).catch(() => ({
      inferred_status: status,
      confidence: 0.5,
      summary: "Review failed; keep current status.",
      suggested_actions: ["Manually review this task."],
    }));

    const parsed = EvalSchema.safeParse(obj);
    const clean = parsed.success
      ? parsed.data
      : {
          inferred_status: status,
          confidence: 0.5,
          summary: "LLM parse failed",
          suggested_actions: ["Manual triage required."],
        };

    const item: EvalItem = {
      taskFile: ctx.taskFile,
      taskUuid: fm.uuid || "",
      inferred_status: normStatus(clean.inferred_status),
      confidence: clean.confidence,
      summary: clean.summary,
      suggested_actions: clean.suggested_actions,
      ...(clean.blockers ? { blockers: clean.blockers } : {}),
      ...(clean.suggested_labels
        ? { suggested_labels: clean.suggested_labels }
        : {}),
      ...(clean.suggested_assignee
        ? { suggested_assignee: clean.suggested_assignee }
        : {}),
    };
    items.push(item);
  }

  await writeText(path.resolve(out), JSON.stringify({ evals: items }, null, 2));
  logger.info(`boardrev: evaluated ${items.length} task(s)`);
}

if (import.meta.main) {
  const args = parseArgs({
    "--tasks": "docs/agile/tasks",
    "--prompts": ".cache/boardrev/prompts.json",
    "--context": ".cache/boardrev/context.json",
    "--model": "qwen3:4b",
    "--out": ".cache/boardrev/evals.json",
  });
  evaluate({
    prompts: args["--prompts"],
    context: args["--context"],
    model: args["--model"],
    out: args["--out"],
  }).catch((e) => {
    logger.error((e as Error).message);
    process.exit(1);
  });
}
