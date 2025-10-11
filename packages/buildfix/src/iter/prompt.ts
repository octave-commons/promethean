import type { History } from '../types.js';

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
) {
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

  return [
    `You are a TypeScript refactoring agent.

 Return ONLY JSON with keys:
 - title (string)
 - rationale (string)
 - "dsl" (array of operations). Example op: {"op":"ensureExported","file":"src/foo.ts","symbol":"bar","kind":"function"}

 Available operations:
 - ensureExported: Make a function/class/variable exported
 - renameSymbol: Rename a function, class, or variable
 - makeParamOptional: Make a function parameter optional
 - addImport: Add an import statement
 - addTypeAnnotation: Add type annotation to function or variable
 - insertStubFunction: Insert a new function stub

 Rules:
 - Do NOT include backticks or markdown fences anywhere.
 - Use DSL operations for all fixes.
 - Prefer minimal, targeted edits.

Target error:
FILE: ${err.file}
LINE: ${err.line}, COL: ${err.col}
CODE: ${err.code}
MESSAGE: ${err.message}

Code frame:
${err.frame}

Previous attempts:
${prev || '(none)'}
`,
  ].join('\n');
}
