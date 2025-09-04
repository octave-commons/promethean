import type { PiperPipeline, StepResult } from "../types.js";

export function renderReport(p: PiperPipeline, results: StepResult[]) {
  const rows = results.map(r => {
    const dur = r.durationMs ?? 0;
    const status = r.skipped ? "SKIP" : (r.exitCode === 0 ? "OK" : `FAIL(${r.exitCode})`);
    return `| ${r.id} | ${status} | ${dur} | ${r.reason ?? ""} |`;
  }).join("\n");

  return [
    `# Pipeline: ${p.name}`,
    "",
    "| Step | Status | Duration (ms) | Notes |",
    "|---|:---:|---:|---|",
    rows,
    ""
  ].join("\n");
}
