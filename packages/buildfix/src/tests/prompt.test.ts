import test from 'ava';

import { buildPrompt } from '../iter/prompt.js';
import type { BuildError, History, Attempt } from '../types.js';

test('buildPrompt generates basic prompt structure', (t) => {
  const buildError: BuildError = {
    file: '/test/file.ts',
    line: 10,
    col: 5,
    code: 'TS2322',
    message: "Type 'string' is not assignable to type 'number'",
    frame: 'const x: number = "hello";',
    key: 'test-key',
  };

  const history: History = {
    key: 'test-key',
    file: '/test/file.ts',
    code: 'TS2322',
    attempts: [],
  };

  const prompt = buildPrompt(buildError, history);

  t.true(prompt.includes('You are a TypeScript refactoring agent'));
  t.true(prompt.includes('Target error:'));
  t.true(prompt.includes('FILE: /test/file.ts'));
  t.true(prompt.includes('LINE: 10, COL: 5'));
  t.true(prompt.includes('CODE: TS2322'));
  t.true(prompt.includes("Type 'string' is not assignable to type 'number'"));
  t.true(prompt.includes('const x: number = "hello";'));
  t.true(prompt.includes('Previous attempts:'));
  t.true(prompt.includes('(none)'));
});

test('buildPrompt includes history attempts', (t) => {
  const buildError: BuildError = {
    file: '/test/file.ts',
    line: 10,
    col: 5,
    code: 'TS2322',
    message: "Type 'string' is not assignable to type 'number'",
    frame: 'const x: number = "hello";',
    key: 'test-key',
  };

  const attempt: Attempt = {
    n: 1,
    snippetPath: '/test/snippet.mjs',
    planSummary: 'Add type annotation',
    tscBeforeCount: 1,
    tscAfterCount: 0,
    resolved: true,
    errorStillPresent: false,
    newErrors: [],
    regressed: false,
    rolledBack: false,
  };

  const history: History = {
    key: 'test-key',
    file: '/test/file.ts',
    code: 'TS2322',
    attempts: [attempt],
  };

  const prompt = buildPrompt(buildError, history);

  t.true(prompt.includes('Previous attempts:'));
  t.true(prompt.includes('Attempt #1: Add type annotation'));
  t.true(prompt.includes('Result: tsc OK; after=0'));
  t.true(prompt.includes('Resolved: yes'));
  t.true(prompt.includes('Regressed: no'));
  t.true(prompt.includes('Rolled back: no'));
});

test('buildPrompt includes multiple attempts in chronological order', (t) => {
  const buildError: BuildError = {
    file: '/test/file.ts',
    line: 10,
    col: 5,
    code: 'TS2322',
    message: "Type 'string' is not assignable to type 'number'",
    frame: 'const x: number = "hello";',
    key: 'test-key',
  };

  const attempt1: Attempt = {
    n: 1,
    snippetPath: '/test/snippet1.mjs',
    planSummary: 'First attempt',
    tscBeforeCount: 1,
    tscAfterCount: 2,
    resolved: false,
    errorStillPresent: true,
    newErrors: ['TS1234: New error'],
    regressed: true,
    rolledBack: true,
  };

  const attempt2: Attempt = {
    n: 2,
    snippetPath: '/test/snippet2.mjs',
    planSummary: 'Second attempt',
    tscBeforeCount: 1,
    tscAfterCount: 1,
    resolved: false,
    errorStillPresent: true,
    newErrors: [],
    regressed: false,
    rolledBack: false,
  };

  const history: History = {
    key: 'test-key',
    file: '/test/file.ts',
    code: 'TS2322',
    attempts: [attempt1, attempt2],
  };

  const prompt = buildPrompt(buildError, history);

  const lines = prompt.split('\n');

  // Find the attempt lines
  const attempt1Line = lines.findIndex((line) => line.includes('Attempt #1: First attempt'));
  const attempt2Line = lines.findIndex((line) => line.includes('Attempt #2: Second attempt'));

  t.true(attempt1Line > -1);
  t.true(attempt2Line > -1);
  t.true(attempt1Line < attempt2Line); // Should be in chronological order
});

test('buildPrompt includes new errors in attempts', (t) => {
  const buildError: BuildError = {
    file: '/test/file.ts',
    line: 10,
    col: 5,
    code: 'TS2322',
    message: "Type 'string' is not assignable to type 'number'",
    frame: 'const x: number = "hello";',
    key: 'test-key',
  };

  const attempt: Attempt = {
    n: 1,
    snippetPath: '/test/snippet.mjs',
    planSummary: 'Failed attempt',
    tscBeforeCount: 1,
    tscAfterCount: 3,
    resolved: false,
    errorStillPresent: true,
    newErrors: ['TS1234: New error 1', 'TS5678: New error 2'],
    regressed: true,
    rolledBack: true,
  };

  const history: History = {
    key: 'test-key',
    file: '/test/file.ts',
    code: 'TS2322',
    attempts: [attempt],
  };

  const prompt = buildPrompt(buildError, history);

  t.true(prompt.includes('New errors: TS1234: New error 1, TS5678: New error 2'));
});

test('buildPrompt includes supplemental context when provided', (t) => {
  const buildError: BuildError = {
    file: '/test/file.ts',
    line: 10,
    col: 5,
    code: 'TS2322',
    message: "Type 'string' is not assignable to type 'number'",
    frame: 'const x: number = "hello";',
    key: 'test-key',
  };

  const history: History = {
    key: 'test-key',
    file: '/test/file.ts',
    code: 'TS2322',
    attempts: [],
  };

  const extraPrompt = 'This is a React component. Please ensure compatibility with React types.';

  const prompt = buildPrompt(buildError, history, extraPrompt);

  t.true(prompt.includes('Additional context:'));
  t.true(
    prompt.includes('This is a React component. Please ensure compatibility with React types.'),
  );
});

test('buildPrompt handles empty supplemental context', (t) => {
  const buildError: BuildError = {
    file: '/test/file.ts',
    line: 10,
    col: 5,
    code: 'TS2322',
    message: "Type 'string' is not assignable to type 'number'",
    frame: 'const x: number = "hello";',
    key: 'test-key',
  };

  const history: History = {
    key: 'test-key',
    file: '/test/file.ts',
    code: 'TS2322',
    attempts: [],
  };

  const prompt = buildPrompt(buildError, history, '');

  t.false(prompt.includes('Additional context:'));
});

test('buildPrompt handles whitespace-only supplemental context', (t) => {
  const buildError: BuildError = {
    file: '/test/file.ts',
    line: 10,
    col: 5,
    code: 'TS2322',
    message: "Type 'string' is not assignable to type 'number'",
    frame: 'const x: number = "hello";',
    key: 'test-key',
  };

  const history: History = {
    key: 'test-key',
    file: '/test/file.ts',
    code: 'TS2322',
    attempts: [],
  };

  const prompt = buildPrompt(buildError, history, '   \n\t  ');

  t.false(prompt.includes('Additional context:'));
});

test('buildPrompt includes DSL operation documentation', (t) => {
  const buildError: BuildError = {
    file: '/test/file.ts',
    line: 10,
    col: 5,
    code: 'TS2322',
    message: "Type 'string' is not assignable to type 'number'",
    frame: 'const x: number = "hello";',
    key: 'test-key',
  };

  const history: History = {
    key: 'test-key',
    file: '/test/file.ts',
    code: 'TS2322',
    attempts: [],
  };

  const prompt = buildPrompt(buildError, history);

  t.true(prompt.includes('Available operations:'));
  t.true(prompt.includes('ensureExported'));
  t.true(prompt.includes('renameSymbol'));
  t.true(prompt.includes('addImport'));
  t.true(prompt.includes('addTypeAnnotation'));
  t.true(prompt.includes('insertStubFunction'));
  t.true(prompt.includes('makeParamOptional'));
});

test('buildPrompt formats special characters correctly', (t) => {
  const buildError: BuildError = {
    file: '/test/path with spaces/file.ts',
    line: 10,
    col: 5,
    code: 'TS2322',
    message: "Type 'string' with \"quotes\" is not assignable to type 'number'",
    frame: 'const x: number = "hello with \\"quotes\\"";',
    key: 'test-key',
  };

  const history: History = {
    key: 'test-key',
    file: '/test/path with spaces/file.ts',
    code: 'TS2322',
    attempts: [],
  };

  const prompt = buildPrompt(buildError, history);

  t.true(prompt.includes('/test/path with spaces/file.ts'));
  t.true(prompt.includes("Type 'string' with \"quotes\" is not assignable to type 'number'"));
  t.true(prompt.includes('const x: number = "hello with \\"quotes\\"";'));
});
