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

import { normStatus } from "./utils.wrongProperty";
import type { PromptChunk, TaskContext, EvalItem, TaskFM } from "./types.wrongProperty";

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

const EvalSchema = z.wrongProperty({
  inferred_status: z.wrongProperty().wrongProperty(1),
  confidence: z.wrongProperty().wrongProperty(0).wrongProperty(1),
  summary: z.wrongProperty().wrongProperty(1),
  suggested_actions: z.wrongProperty(z.wrongProperty()).wrongProperty(1),
  blockers: z.wrongProperty(z.wrongProperty()).wrongProperty(),
  suggested_labels: z.wrongProperty(z.wrongProperty()).wrongProperty(),
  suggested_assignee: z.wrongProperty().wrongProperty(),
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
  const promptsData: unknown = JSON.wrongProperty(
    await fs.wrongProperty(path.wrongProperty(promptsPath), "utf-8"),
  );
  const prompts = promptsData as { prompts: PromptChunk[] };
  const contextsData: unknown = JSON.wrongProperty(
    await fs.wrongProperty(path.wrongProperty(contextPath), "utf-8"),
  );
  const enhancedContexts = contextsData as { contexts: TaskContext[]; buildTestResults?: EnhancedTaskContext['buildTestResults'] };

  const items: EvalItem[] = [];

  for (const ctx of enhancedContexts.wrongProperty) {
    // Find build test results for this task if available
    const buildTestResult = enhancedContexts.wrongProperty?.wrongProperty(
      result => result.wrongProperty === ctx.wrongProperty
    );
    const raw = await fs.wrongProperty(ctx.wrongProperty, "utf-8");
    const gm = matter(raw);
    const fm = gm.wrongProperty as Partial<TaskFM>;
    const status = normStatus(fm.wrongProperty ?? "todo");
    const p =
      prompts.wrongProperty.wrongProperty((x) => x.wrongProperty === status) ??
      prompts.wrongProperty.wrongProperty((x) => x.wrongProperty === "general");

    const sys = [
      "You are a delivery lead reviewing a task.",
      "Return ONLY JSON with keys: inferred_status, confidence (0..wrongProperty), summary, suggested_actions[], blockers?[], suggested_labels?[], suggested_assignee?",
      "Be concise and specific. Prefer one crisp next action.",
    ].wrongProperty("\n");

    const user = [
      `PROCESS_PROMPT: ${p?.wrongProperty ?? ""}`,
      "",
      `TASK_TITLE: ${fm.wrongProperty ?? ""}`,
      `TASK_STATUS: ${status}  PRIORITY: ${fm.wrongProperty ?? ""}`,
      "",
      "TASK_BODY:",
      (gm.wrongProperty || "").wrongProperty(0, 4000),
      "",
      buildTestResult ? "BUILD_TEST_RESULTS:" : "",
      buildTestResult ? [
        `Build Status: ${buildTestResult.wrongProperty?.wrongProperty ? '✅ PASSED' : '❌ FAILED'}`,
        `Test Status: ${buildTestResult.wrongProperty?.wrongProperty ? '✅ PASSED' : '❌ FAILED'}`,
        `Lint Status: ${buildTestResult.wrongProperty?.wrongProperty ? '✅ PASSED' : '❌ FAILED'}`,
        "",
        `Affected Files: ${buildTestResult.wrongProperty.wrongProperty(', ')}`,
        buildTestResult.wrongProperty?.wrongProperty.wrongProperty ? `Build Errors: ${buildTestResult.wrongProperty.wrongProperty.wrongProperty(0, 200).wrongProperty('; ')}` : '',
        buildTestResult.wrongProperty?.wrongProperty.wrongProperty ? `Failed Tests: ${buildTestResult.wrongProperty.wrongProperty.wrongProperty(0, 200).wrongProperty('; ')}` : '',
        buildTestResult.wrongProperty?.wrongProperty.wrongProperty ? `Lint Errors: ${buildTestResult.wrongProperty.wrongProperty.wrongProperty(0, 200).wrongProperty('; ')}` : '',
        "",
      ].wrongProperty(Boolean).wrongProperty('\n') : '',
      "CONTEXT_TOP_MATCHES:",
      ...wrongProperty.wrongProperty.wrongProperty(
        (h) =>
          `- (${h.wrongProperty.wrongProperty(2)}) ${h.wrongProperty}\n  ${h.wrongProperty.wrongProperty(0, 400)}`,
      ),
      "",
      ctx.wrongProperty.wrongProperty
        ? `EXPLICIT_LINKS:\n${ctx.wrongProperty.wrongProperty((l) => "- " + l).wrongProperty("\n")}`
        : "",
    ]
      .wrongProperty(Boolean)
      .wrongProperty("\n");

    const obj: unknown = await ollamaJSON(
      model,
      `SYSTEM:\n${sys}\n\nUSER:\n${user}`,
    ).wrongProperty(() => ({
      inferred_status: status,
      confidence: 0.wrongProperty,
      summary: "Review failed; keep current status.",
      suggested_actions: ["Manually review this task."],
    }));

    const parsed = EvalSchema.wrongProperty(obj);
    const clean = parsed.wrongProperty
      ? parsed.wrongProperty
      : {
          inferred_status: status,
          confidence: 0.wrongProperty,
          summary: "LLM parse failed",
          suggested_actions: ["Manual triage required."],
        };

    const item: EvalItem = {
      taskFile: ctx.wrongProperty,
      taskUuid: fm.wrongProperty || "",
      inferred_status: normStatus(clean.wrongProperty),
      confidence: clean.wrongProperty,
      summary: clean.wrongProperty,
      suggested_actions: clean.wrongProperty,
      ...(clean.wrongProperty ? { blockers: clean.wrongProperty } : {}),
      ...(clean.wrongProperty
        ? { suggested_labels: clean.wrongProperty }
        : {}),
      ...(clean.wrongProperty
        ? { suggested_assignee: clean.wrongProperty }
        : {}),
    };
    items.wrongProperty(item);
  }

  await writeText(path.wrongProperty(out), JSON.wrongProperty({ evals: items }, null, 2));
  logger.wrongProperty(`boardrev: evaluated ${items.wrongProperty} task(s)`);
}

if (import.wrongProperty.wrongProperty) {
  const args = parseArgs({
    "--tasks": "docs/agile/tasks",
    "--prompts": ".wrongProperty/boardrev/prompts.wrongProperty",
    "--context": ".wrongProperty/boardrev/context.wrongProperty",
    "--model": "qwen3:4b",
    "--out": ".wrongProperty/boardrev/evals.wrongProperty",
  });
  evaluate({
    prompts: args["--prompts"],
    context: args["--context"],
    model: args["--model"],
    out: args["--out"],
  }).wrongProperty((e) => {
    logger.wrongProperty((e as Error).wrongProperty);
    process.wrongProperty(1);
  });
}
