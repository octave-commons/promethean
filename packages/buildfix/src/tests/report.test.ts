import test from 'ava';

import { renderReport } from '../report.js';
import type { AttemptDetail } from '../buildfix.js';

test('renderReport generates basic markdown structure', (t) => {
  const runs = [
    {
      model: 'test-model',
      result: {
        success: true,
        errorCountBefore: 2,
        errorCountAfter: 0,
        errorsResolved: true,
        planGenerated: true,
        attempts: 1,
        duration: 1500,
        model: 'test-model',
        attemptDetails: [],
      },
    },
  ];

  const report = renderReport('Test File', runs);

  t.true(report.includes('# BuildFix Report — Test File'));
  t.true(report.includes('## Model test-model'));
  t.true(report.includes('- Success: ✅'));
  t.true(report.includes('- Attempts: 0'));
  t.true(report.includes('- Errors before → after: 2 → 0'));
});

test('renderReport handles failed runs', (t) => {
  const runs = [
    {
      model: 'test-model',
      result: {
        success: false,
        errorCountBefore: 2,
        errorCountAfter: 3,
        errorsResolved: false,
        planGenerated: false,
        attempts: 2,
        duration: 3000,
        model: 'test-model',
        error: 'Failed to generate plan',
        attemptDetails: [],
      },
    },
  ];

  const report = renderReport('Test File', runs);

  t.true(report.includes('- Success: ❌'));
  t.true(report.includes('- Attempts: 0'));
  t.true(report.includes('- Errors before → after: 2 → 3'));
  t.true(report.includes('- Error: Failed to generate plan'));
});

test('renderReport includes plan rationale when available', (t) => {
  const runs = [
    {
      model: 'test-model',
      result: {
        success: true,
        errorCountBefore: 1,
        errorCountAfter: 0,
        errorsResolved: true,
        planGenerated: true,
        attempts: 1,
        duration: 1000,
        model: 'test-model',
        plan: {
          title: 'Fix type error',
          rationale: 'Add proper type annotation',
          dsl: [],
        },
        attemptDetails: [],
      },
    },
  ];

  const report = renderReport('Test File', runs);

  t.true(report.includes('- Final rationale: Add proper type annotation'));
});

test('renderReport handles empty runs', (t) => {
  const runs: any[] = [];

  const report = renderReport('Test File', runs);

  t.true(report.includes('# BuildFix Report — Test File'));
  t.true(report.includes('_No runs executed._'));
});

test('renderReport includes attempt details', (t) => {
  const attemptDetail: AttemptDetail = {
    n: 1,
    snippetPath: '/test/snippet.mjs',
    planSummary: 'Add type annotation',
    tscBeforeCount: 2,
    tscAfterCount: 0,
    resolved: true,
    errorStillPresent: false,
    newErrors: [],
    regressed: false,
    rolledBack: false,
    model: 'test-model',
    beforeContent: 'const x: number = "hello";',
    afterContent: 'const x: number = 42;',
    durationMs: 500,
    planRationale: 'Fix type mismatch',
  };

  const runs = [
    {
      model: 'test-model',
      result: {
        success: true,
        errorCountBefore: 2,
        errorCountAfter: 0,
        errorsResolved: true,
        planGenerated: true,
        attempts: 1,
        duration: 500,
        model: 'test-model',
        attemptDetails: [attemptDetail],
      },
    },
  ];

  const report = renderReport('Test File', runs);

  t.true(report.includes('### Attempt 1 (test-model)'));
  t.true(report.includes('- TSC: 2 → 0'));
  t.true(report.includes('- Resolved: ✅'));
  t.true(report.includes('- Regressed: ⚠️ yes'));
  t.true(report.includes('- Rolled back: yes'));
  t.true(report.includes('- Duration: 500ms'));
  t.true(report.includes('- Plan: Add type annotation'));
  t.true(report.includes('- Rationale: Fix type mismatch'));
  t.true(report.includes('```diff'));
});

test('renderReport handles attempts with new errors', (t) => {
  const attemptDetail: AttemptDetail = {
    n: 1,
    snippetPath: '/test/snippet.mjs',
    planSummary: 'Failed attempt',
    tscBeforeCount: 1,
    tscAfterCount: 3,
    resolved: false,
    errorStillPresent: true,
    newErrors: ['TS2322: Type error', 'TS2581: Undefined variable'],
    regressed: true,
    rolledBack: true,
    model: 'test-model',
    beforeContent: 'const x = "hello";',
    afterContent: 'const x: number = "hello";',
    durationMs: 750,
  };

  const runs = [
    {
      model: 'test-model',
      result: {
        success: false,
        errorCountBefore: 1,
        errorCountAfter: 1,
        errorsResolved: false,
        planGenerated: true,
        attempts: 1,
        duration: 750,
        model: 'test-model',
        attemptDetails: [attemptDetail],
      },
    },
  ];

  const report = renderReport('Test File', runs);

  t.true(report.includes('- New errors:'));
  t.true(report.includes('  - TS2322: Type error'));
  t.true(report.includes('  - TS2581: Undefined variable'));
});

test('renderReport handles missing content gracefully', (t) => {
  const attemptDetail: AttemptDetail = {
    n: 1,
    snippetPath: '/test/snippet.mjs',
    planSummary: 'Test attempt',
    tscBeforeCount: 1,
    tscAfterCount: 1,
    resolved: false,
    errorStillPresent: true,
    newErrors: [],
    regressed: false,
    rolledBack: false,
    model: 'test-model',
    // beforeContent and afterContent are undefined
    durationMs: 300,
  };

  const runs = [
    {
      model: 'test-model',
      result: {
        success: false,
        errorCountBefore: 1,
        errorCountAfter: 1,
        errorsResolved: false,
        planGenerated: true,
        attempts: 1,
        duration: 300,
        model: 'test-model',
        attemptDetails: [attemptDetail],
      },
    },
  ];

  const report = renderReport('Test File', runs);

  t.true(report.includes('_Diff unavailable (file content could not be determined)._'));
});

test('renderReport handles multiple models', (t) => {
  const runs = [
    {
      model: 'model-1',
      result: {
        success: true,
        errorCountBefore: 2,
        errorCountAfter: 0,
        errorsResolved: true,
        planGenerated: true,
        attempts: 1,
        duration: 1000,
        model: 'model-1',
        attemptDetails: [],
      },
    },
    {
      model: 'model-2',
      result: {
        success: false,
        errorCountBefore: 2,
        errorCountAfter: 2,
        errorsResolved: false,
        planGenerated: false,
        attempts: 0,
        duration: 500,
        model: 'model-2',
        error: 'Model failed to respond',
        attemptDetails: [],
      },
    },
  ];

  const report = renderReport('Test File', runs);

  t.true(report.includes('## Model model-1'));
  t.true(report.includes('## Model model-2'));
  t.true(report.includes('- Success: ✅'));
  t.true(report.includes('- Success: ❌'));
});

test('renderReport formats regression correctly', (t) => {
  const attemptDetail: AttemptDetail = {
    n: 1,
    snippetPath: '/test/snippet.mjs',
    planSummary: 'Regressive attempt',
    tscBeforeCount: 1,
    tscAfterCount: 3,
    resolved: false,
    errorStillPresent: true,
    newErrors: [],
    regressed: true,
    rolledBack: true,
    model: 'test-model',
    beforeContent: 'const x = 42;',
    afterContent: 'const x: string = 42;',
    durationMs: 400,
  };

  const runs = [
    {
      model: 'test-model',
      result: {
        success: false,
        errorCountBefore: 1,
        errorCountAfter: 1,
        errorsResolved: false,
        planGenerated: true,
        attempts: 1,
        duration: 400,
        model: 'test-model',
        attemptDetails: [attemptDetail],
      },
    },
  ];

  const report = renderReport('Test File', runs);

  t.true(report.includes('- Regressed: ⚠️ yes'));
  t.true(report.includes('- Rolled back: yes'));
});
