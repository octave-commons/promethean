import type { History } from '../types.js';

// eslint-disable-next-line max-lines-per-function
export function buildPrompt(
  err: {
    file: string;
    line: number;
    col: number;
    code: string;
    message: string;
    frame: string;
    key: string;
  },
  history: History,
  extraPrompt?: string,
): string {
  const prev = history.attempts
    .map(
      (a) =>
        `ATTEMPT #${a.n}
Plan: ${a.planSummary}
Commit: ${a.commitSha ?? '(no-commit)'} ${a.pushed ? '(pushed)' : ''}
Result: tsc ${a.resolved ? 'OK' : 'failed'}; after=${
          a.tscAfterCount
        }; stillPresent=${a.errorStillPresent}
`,
    )
    .join('\n');

  const supplemental = extraPrompt?.trim() ? `\n\nAdditional context:\n${extraPrompt.trim()}\n` : '';

  return [
    `You are a TypeScript refactoring agent.

 Return ONLY JSON with keys:
 - title (string)
 - rationale (string)
 - "dsl" (array of operations)

 Available operations with EXACT field names:
 - ensureExported: {"op":"ensureExported","file":"path/to/file.ts","symbol":"functionName","kind":"function"}
 - renameSymbol: {"op":"renameSymbol","file":"path/to/file.ts","from":"oldName","to":"newName"}
 - makeParamOptional: {"op":"makeParamOptional","file":"path/to/file.ts","fn":"functionName","param":"paramName"}
 - addImport: {"op":"addImport","file":"path/to/file.ts","from":"module","names":["import1","import2"]}
 - addTypeAnnotation: {"op":"addTypeAnnotation","file":"path/to/file.ts","selector":"expression","typeText":"string"}
 - insertStubFunction: {"op":"insertStubFunction","file":"path/to/file.ts","name":"functionName","signature":"() => void","returns":"void"}

 Rules:
 - Do NOT include backticks or markdown fences anywhere.
 - Use DSL operations for all fixes.
 - Prefer minimal, targeted edits.
 - Use EXACT field names as shown above.

Target error:
FILE: ${err.file}
LINE: ${err.line}, COL: ${err.col}
CODE: ${err.code}
MESSAGE: ${err.message}

Code frame:
${err.frame}

Previous attempts:
${prev || '(none)'}${supplemental}
`,
  ].join('\n');
}
