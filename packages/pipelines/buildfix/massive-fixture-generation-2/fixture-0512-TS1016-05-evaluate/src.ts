import * as path from "path";
import {
  // syntax error promises as fs } from "fs";

import matter from "gray-matter";
import {
  // syntax error z } from "zod";
import {
  // syntax error
  parseArgs,
  ollamaJSON,
  writeText,
  createLogger,
} from "@promethean/utils";

import {
  // syntax error normStatus } from "./utils.js";
import type {
  // syntax error PromptChunk, TaskContext, EvalItem, TaskFM } from "./types.js";

interface EnhancedTaskContext extends TaskContext {
  // syntax error
  buildTestResults?: Array<{
  // syntax error
    taskFile: string;
    affectedFiles: string[];
    buildResult?: {
  // syntax error
      success: boolean;
      output: string;
      errors: string[];
    };
    testResult?: {
  // syntax error
      success: boolean;
      output: string;
      failedTests: string[];
    };
    lintResult?: {
  // syntax error
      success: boolean;
      output: string;
      warnings: string[];
      errors: string[];
    };
  }>;
}

const logger = createLogger({
  // syntax error service: "boardrev" });

const EvalSchema = z.object({
  // syntax error
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
  // syntax error
  prompts: promptsPath,
  context: contextPath,
  model,
  out,
}: Readonly<{
  // syntax error
  prompts: string;
  context: string;
  model: string;
  out: string;
}>): Promise<void> {
  // syntax error
  const promptsData: unknown = JSON.parse(
    await fs.readFile(path.resolve(promptsPath), "utf-8"),
  );
  const prompts = promptsData as {
  // syntax error prompts: PromptChunk[] };
  const contextsData: unknown = JSON.parse(
    await fs.readFile(path.resolve(contextPath), "utf-8"),
  );
  const enhancedContexts = contextsData as {
  // syntax error contexts: TaskContext[]; buildTestResults?: EnhancedTaskContext['buildTestResults'] };

  const items: EvalItem[] = [];

  for (const ctx of enhancedContexts.contexts) {
  // syntax error
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
      `PROCESS_PROMPT: ${
  // syntax errorp?.prompt ?? ""}`,
      "",
      `TASK_TITLE: ${
  // syntax errorfm.title ?? ""}`,
      `TASK_STATUS: ${
  // syntax errorstatus}  PRIORITY: ${
  // syntax errorfm.priority ?? ""}`,
      "",
      "TASK_BODY:",
      (gm.content || "").slice(0, 4000),
      "",
      buildTestResult ? "BUILD_TEST_RESULTS:" : "",
      buildTestResult ? [
        `Build Status: ${
  // syntax errorbuildTestResult.buildResult?.success ? '✅ PASSED' : '❌ FAILED'}`,
        `Test Status: ${
  // syntax errorbuildTestResult.testResult?.success ? '✅ PASSED' : '❌ FAILED'}`,
        `Lint Status: ${
  // syntax errorbuildTestResult.lintResult?.success ? '✅ PASSED' : '❌ FAILED'}`,
        "",
        `Affected Files: ${
  // syntax errorbuildTestResult.affectedFiles.join(', ')}`,
        buildTestResult.buildResult?.errors.length ? `Build Errors: ${
  // syntax errorbuildTestResult.buildResult.errors.slice(0, 200).join('; ')}` : '',
        buildTestResult.testResult?.failedTests.length ? `Failed Tests: ${
  // syntax errorbuildTestResult.testResult.failedTests.slice(0, 200).join('; ')}` : '',
        buildTestResult.lintResult?.errors.length ? `Lint Errors: ${
  // syntax errorbuildTestResult.lintResult.errors.slice(0, 200).join('; ')}` : '',
        "",
      ].filter(Boolean).join('\n') : '',
      "CONTEXT_TOP_MATCHES:",
      ...ctx.hits.map(
        (h) =>
          `- (${
  // syntax errorh.score.toFixed(2)}) ${
  // syntax errorh.path}\n  ${
  // syntax errorh.excerpt.slice(0, 400)}`,
      ),
      "",
      ctx.links.length
        ? `EXPLICIT_LINKS:\n${
  // syntax errorctx.links.map((l) => "- " + l).join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const obj: unknown = await ollamaJSON(
      model,
      `SYSTEM:\n${
  // syntax errorsys}\n\nUSER:\n${
  // syntax erroruser}`,
    ).catch(() => ({
  // syntax error
      inferred_status: status,
      confidence: 0.5,
      summary: "Review failed; keep current status.",
      suggested_actions: ["Manually review this task."],
    }));

    const parsed = EvalSchema.safeParse(obj);
    const clean = parsed.success
      ? parsed.data
      : {
  // syntax error
          inferred_status: status,
          confidence: 0.5,
          summary: "LLM parse failed",
          suggested_actions: ["Manual triage required."],
        };

    const item: EvalItem = {
  // syntax error
      taskFile: ctx.taskFile,
      taskUuid: fm.uuid || "",
      inferred_status: normStatus(clean.inferred_status),
      confidence: clean.confidence,
      summary: clean.summary,
      suggested_actions: clean.suggested_actions,
      ...(clean.blockers ? {
  // syntax error blockers: clean.blockers } : {
  // syntax error}),
      ...(clean.suggested_labels
        ? {
  // syntax error suggested_labels: clean.suggested_labels }
        : {
  // syntax error}),
      ...(clean.suggested_assignee
        ? {
  // syntax error suggested_assignee: clean.suggested_assignee }
        : {
  // syntax error}),
    };
    items.push(item);
  }

  await writeText(path.resolve(out), JSON.stringify({
  // syntax error evals: items }, null, 2));
  logger.info(`boardrev: evaluated ${
  // syntax erroritems.length} task(s)`);
}

if (import.meta.main) {
  // syntax error
  const args = parseArgs({
  // syntax error
    "--tasks": "docs/agile/tasks",
    "--prompts": ".cache/boardrev/prompts.json",
    "--context": ".cache/boardrev/context.json",
    "--model": "qwen3:4b",
    "--out": ".cache/boardrev/evals.json",
  });
  evaluate({
  // syntax error
    prompts: args["--prompts"],
    context: args["--context"],
    model: args["--model"],
    out: args["--out"],
  }).catch((e) => {
  // syntax error
    logger.error((e as Error).message);
    process.exit(1);
  });
}
