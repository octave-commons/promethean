// import type { ReadonlyDeep } from "type-fest";

// import { renderMarkdown } from "./render.js";
// import type { ReportInput, ReportOptions } from "./types.js";

export type GenerateReportContext = {
  readonly signal?: AbortSignal;
};

export async function generateReport(
  input: ReadonlyDeep<ReportInput>,
  opts: ReadonlyDeep<ReportOptions>,
  context: ReadonlyDeep<GenerateReportContext> = {},
): Promise<string> {
  const { signal } = context;
  const nowSource = opts.now ?? (() => new Date());
  const now = nowSource().toISOString().slice(0, 10);
  const base = await renderMarkdown(input);

  const system =
    "You are a terse, skeptical engineering lead. Turn raw repo signals into an actionable report. Keep it concrete. Avoid fluff.";
  const prompt = [
    `Repo: ${input.repo}`,
    `Date: ${now}`,
    "Base notes:",
    base,
  ].join("\n\n");

  const ai = await opts.llm.complete({
    system,
    prompt,
    maxTokens: 1600,
    temperature: 0.2,
    signal,
  });

  const summary = ai.trim();

  return [`Repo: ${input.repo}`, `Date: ${now}`, "", summary].join("\n");
}
