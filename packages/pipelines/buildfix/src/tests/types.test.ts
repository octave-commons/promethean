import test from 'ava';
import type { BuildError, RawTscDiagnostic, History, Attempt } from '../types.js';

test('BuildError type has required properties', (t) => {
  const error: BuildError = {
    file: '/test/file.ts',
    line: 10,
    col: 5,
    code: 'TS2345',
    message: 'Type error',
    frame: 'code frame',
    key: 'TS2345|/test/file.ts|10',
  };

  t.is(error.file, '/test/file.ts');
  t.is(error.line, 10);
  t.is(error.col, 5);
  t.is(error.code, 'TS2345');
  t.is(error.message, 'Type error');
  t.is(error.frame, 'code frame');
  t.is(error.key, 'TS2345|/test/file.ts|10');
});

test('RawTscDiagnostic type structure', (t) => {
  const diagnostic: RawTscDiagnostic = {
    file: '/test/file.ts',
    line: 10,
    col: 5,
    code: 'TS2345',
    message: 'Type error',
  };

  t.is(diagnostic.file, '/test/file.ts');
  t.is(diagnostic.line, 10);
  t.is(diagnostic.col, 5);
  t.is(diagnostic.code, 'TS2345');
  t.is(diagnostic.message, 'Type error');
});

test('History type structure', (t) => {
  const attempt: Attempt = {
    n: 1,
    snippetPath: '/path/to/snippet.mjs',
    planSummary: 'Fix type error',
    tscBeforeCount: 5,
    tscAfterCount: 2,
    resolved: true,
    errorStillPresent: false,
    newErrors: [],
  };

  const history: History = {
    key: 'TS2345|/test/file.ts|10',
    file: '/test/file.ts',
    code: 'TS2345',
    attempts: [attempt],
    resolvedAt: '2023-10-11T12:00:00.000Z',
  };

  t.is(history.key, 'TS2345|/test/file.ts|10');
  t.is(history.file, '/test/file.ts');
  t.is(history.code, 'TS2345');
  t.is(history.attempts.length, 1);
  if (history.attempts[0]) {
    t.is(history.attempts[0].n, 1);
  }
  t.truthy(history.resolvedAt);
});

test('Attempt type structure', (t) => {
  const attempt: Attempt = {
    n: 2,
    snippetPath: '/path/to/snippet.mjs',
    planSummary: 'Add export keyword',
    tscBeforeCount: 3,
    tscAfterCount: 1,
    resolved: false,
    errorStillPresent: true,
    newErrors: ['TS2300 Test error'],
    branch: 'fix/TS2345-file-10',
    commitSha: 'abc123',
    pushed: true,
    prUrl: 'https://github.com/test/pr/1',
    regressed: false,
    rolledBack: false,
  };

  t.is(attempt.n, 2);
  t.is(attempt.snippetPath, '/path/to/snippet.mjs');
  t.is(attempt.planSummary, 'Add export keyword');
  t.is(attempt.tscBeforeCount, 3);
  t.is(attempt.tscAfterCount, 1);
  t.is(attempt.resolved, false);
  t.is(attempt.errorStillPresent, true);
  t.deepEqual(attempt.newErrors, ['TS2300 Test error']);
  t.is(attempt.branch, 'fix/TS2345-file-10');
  t.is(attempt.commitSha, 'abc123');
  t.is(attempt.pushed, true);
  t.is(attempt.prUrl, 'https://github.com/test/pr/1');
  t.is(attempt.regressed, false);
  t.is(attempt.rolledBack, false);
});
