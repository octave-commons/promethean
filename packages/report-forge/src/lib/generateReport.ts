import type { ReportInput, ReportOptions } from "./types.js";
import { renderMarkdown } from "./render.js";

export async function generateReport(
  input: ReportInput,
  opts: ReportOptions,
  signal?: AbortSignal,
): Promise<string> {
  const now = (opts.now ?? (() => new Date()))().toISOString().slice(0, 10);
  const base = renderMarkdown(input);

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

  return ai.trim();
}
