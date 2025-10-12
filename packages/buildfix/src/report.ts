import { diffLines } from 'diff';

import type { AttemptDetail, FixResult } from './buildfix.js';

type ModelRun = {
  readonly model: string;
  readonly result: FixResult;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
function formatDiff(before: string | undefined, after: string | undefined): string {
  if (before === undefined || after === undefined) {
    return '_Diff unavailable (file content could not be determined)._';
  }
  const pieces = diffLines(before, after);
  const lines: string[] = ['```diff'];
  for (const piece of pieces) {
    const prefix = piece.added ? '+' : piece.removed ? '-' : ' ';
    const chunkLines = piece.value.split(/\r?\n/);
    for (const line of chunkLines) {
      if (line === '' && chunkLines.length === 1) continue;
      if (line === '' && chunkLines.at(-1) === '') continue;
      lines.push(`${prefix}${line}`);
    }
  }
  lines.push('```');
  return lines.join('\n');
}

function renderAttempt(model: string, attempt: AttemptDetail): string {
  const lines: string[] = [];
  lines.push(`### Attempt ${attempt.n} (${model})`);
  lines.push('');
  lines.push(`- TSC: ${attempt.tscBeforeCount} → ${attempt.tscAfterCount}`);
  lines.push(`- Resolved: ${attempt.resolved ? '✅' : '❌'}`);
  lines.push(`- Regressed: ${attempt.regressed ? '⚠️ yes' : 'no'}`);
  lines.push(`- Rolled back: ${attempt.rolledBack ? 'yes' : 'no'}`);
  lines.push(`- Duration: ${attempt.durationMs}ms`);
  lines.push(`- Plan: ${attempt.planSummary}`);
  if (attempt.planRationale) {
    lines.push(`- Rationale: ${attempt.planRationale}`);
  }
  if (attempt.newErrors.length > 0) {
    lines.push(`- New errors:`);
    for (const err of attempt.newErrors) {
      lines.push(`  - ${err}`);
    }
  }
  lines.push('');
  lines.push(formatDiff(attempt.beforeContent, attempt.afterContent));
  lines.push('');
  return lines.join('\n');
}

export function renderReport(title: string, runs: ReadonlyArray<ModelRun>): string {
  const sections: string[] = [`# BuildFix Report — ${title}`, ''];
  if (runs.length === 0) {
    sections.push('_No runs executed._');
    return sections.join('\n');
  }
  for (const { model, result } of runs) {
    sections.push(`## Model ${model}`);
    sections.push('');
    sections.push(`- Success: ${result.success ? '✅' : '❌'}`);
    sections.push(`- Attempts: ${result.attemptDetails.length}`);
    sections.push(`- Errors before → after: ${result.errorCountBefore} → ${result.errorCountAfter}`);
    if (result.plan?.rationale) {
      sections.push(`- Final rationale: ${result.plan.rationale}`);
    }
    if (result.error) {
      sections.push(`- Error: ${result.error}`);
    }
    sections.push('');
    for (const attempt of result.attemptDetails) {
      sections.push(renderAttempt(model, attempt));
    }
  }
  return sections.join('\n');
}
