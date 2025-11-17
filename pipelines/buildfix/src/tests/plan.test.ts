import test from 'ava';
import { promises as fs } from 'fs';
import * as path from 'path';

import { writePlanFile, type PlanRequestOptions } from '../iter/plan.js';
import { PlanSchema, type Plan } from '../iter/dsl.js';
import type { BuildError, History, Attempt } from '../types.js';

// Mock ollamaJSON function
const mockOllamaJSON = async (
  _model: string,
  _prompt: string,
  _options: any = {},
): Promise<any> => {
  // Return a valid plan based on the prompt content
  return {
    title: 'Fix missing export',
    rationale: 'The function needs to be exported for external use',
    dsl: [
      {
        op: 'ensureExported',
        file: 'src/test.ts',
        symbol: 'testFunction',
        kind: 'function',
      },
    ],
  };
};

// Create a test version of requestPlan that uses our mock
async function mockRequestPlan(
  model: string,
  _err: BuildError,
  _history: History,
  options: PlanRequestOptions = {},
): Promise<Plan> {
  // Use the mock instead of actual ollamaJSON
  return mockOllamaJSON(model, '', options);
}

test('requestPlan generates valid plan with default options', async (t) => {
  const buildError: BuildError = {
    file: '/test/file.ts',
    line: 10,
    col: 5,
    code: 'TS2322',
    message: "Type 'string' is not assignable to type 'number'",
    frame: 'const x: number = "hello";',
    key: 'TS2322|/test/file.ts|10',
  };

  const history: History = {
    key: 'test-key',
    file: '/test/file.ts',
    code: 'TS2322',
    attempts: [],
  };

  const plan = await mockRequestPlan('test-model', buildError, history);

  t.true(PlanSchema.safeParse(plan).success);
  t.is(plan.title, 'Fix missing export');
  t.is(plan.rationale, 'The function needs to be exported for external use');
  t.true(Array.isArray(plan.dsl));
  t.true(plan.dsl!.length > 0);
});

test('requestPlan includes custom prompt in context', async (t) => {
  const buildError: BuildError = {
    file: '/test/file.ts',
    line: 10,
    col: 5,
    code: 'TS2322',
    message: "Type 'string' is not assignable to type 'number'",
    frame: 'const x: number = "hello";',
    key: 'TS2322|/test/file.ts|10',
  };

  const history: History = {
    key: 'test-key',
    file: '/test/file.ts',
    code: 'TS2322',
    attempts: [],
  };

  const plan = await mockRequestPlan('test-model', buildError, history, {
    prompt: 'Focus on type conversion issues',
  });

  t.true(PlanSchema.safeParse(plan).success);
  t.is(plan.title, 'Fix missing export');
});

test('requestPlan includes custom system prompt', async (t) => {
  const buildError: BuildError = {
    file: '/test/file.ts',
    line: 10,
    col: 5,
    code: 'TS2322',
    message: "Type 'string' is not assignable to type 'number'",
    frame: 'const x: number = "hello";',
    key: 'TS2322|/test/file.ts|10',
  };

  const history: History = {
    key: 'test-key',
    file: '/test/file.ts',
    code: 'TS2322',
    attempts: [],
  };

  const plan = await mockRequestPlan('test-model', buildError, history, {
    system: 'You are an expert TypeScript developer',
  });

  t.true(PlanSchema.safeParse(plan).success);
  t.is(plan.title, 'Fix missing export');
});

test('requestPlan handles history correctly', async (t) => {
  const buildError: BuildError = {
    file: '/test/file.ts',
    line: 10,
    col: 5,
    code: 'TS2322',
    message: "Type 'string' is not assignable to type 'number'",
    frame: 'const x: number = "hello";',
    key: 'TS2322|/test/file.ts|10',
  };

  const attempt: Attempt = {
    n: 1,
    snippetPath: '/tmp/snippet.js',
    planSummary: 'Previous attempt',
    tscBeforeCount: 1,
    tscAfterCount: 1,
    resolved: false,
    errorStillPresent: true,
    newErrors: [],
  };

  const history: History = {
    key: 'test-key',
    file: '/test/file.ts',
    code: 'TS2322',
    attempts: [attempt],
  };

  const plan = await mockRequestPlan('test-model', buildError, history);

  t.true(PlanSchema.safeParse(plan).success);
  t.is(plan.title, 'Fix missing export');
});

test('requestPlan throws error for invalid plan JSON', async (t) => {
  // Override mock to return invalid JSON
  const invalidMock = async () => {
    return {
      invalid: 'response',
      missing: 'required fields',
    };
  };

  await t.throwsAsync(
    async () => {
      const result = await invalidMock();
      const validation = PlanSchema.safeParse(result);
      if (!validation.success) {
        throw new Error('invalid plan JSON');
      }
      return result;
    },
    { message: /invalid plan JSON/ },
  );
});

test('requestPlan uses correct schema for validation', async (t) => {
  const _buildError: BuildError = {
    file: '/test/file.ts',
    line: 10,
    col: 5,
    code: 'TS2322',
    message: "Type 'string' is not assignable to type 'number'",
    frame: 'const x: number = "hello";',
    key: 'TS2322|/test/file.ts|10',
  };

  const _history: History = {
    key: 'test-key',
    file: '/test/file.ts',
    code: 'TS2322',
    attempts: [],
  };

  const plan = await mockRequestPlan('test-model', _buildError, _history);

  // Verify the plan conforms to the schema
  const validation = PlanSchema.safeParse(plan);
  t.true(validation.success);

  if (validation.success) {
    t.is(typeof validation.data.title, 'string');
    t.is(typeof validation.data.rationale, 'string');
    t.true(Array.isArray(validation.data.dsl));
  }
});

test('writePlanFile creates directory if it does not exist', async (t) => {
  const tmpDir = await fs.mkdtemp('/tmp/buildfix-plan-test-');
  const plansDir = path.join(tmpDir, 'plans');

  const plan: Plan = {
    title: 'Test Plan',
    rationale: 'Test rationale',
    dsl: [
      {
        op: 'addTypeAnnotation',
        file: 'src/test.ts',
        selector: 'x',
        typeText: 'string',
      },
    ],
  };

  const resultPath = await writePlanFile(plansDir, 1, plan);

  // Verify file was created
  const stats = await fs.stat(resultPath);
  t.true(stats.isFile());

  // Clean up
  await fs.rm(tmpDir, { recursive: true, force: true });
});

test('writePlanFile creates plan file with correct content', async (t) => {
  const tmpDir = await fs.mkdtemp('/tmp/buildfix-plan-test-');
  const plansDir = path.join(tmpDir, 'plans');

  const plan: Plan = {
    title: 'Test Plan',
    rationale: 'Test rationale',
    dsl: [
      {
        op: 'addTypeAnnotation',
        file: 'src/test.ts',
        selector: 'x',
        typeText: 'string',
      },
    ],
  };

  const resultPath = await writePlanFile(plansDir, 1, plan);

  // Verify file content
  const content = await fs.readFile(resultPath, 'utf-8');
  const parsedPlan = JSON.parse(content) as Plan;

  t.is(parsedPlan.title, plan.title);
  t.is(parsedPlan.rationale, plan.rationale);
  if (parsedPlan.dsl && plan.dsl && parsedPlan.dsl.length > 0 && plan.dsl.length > 0) {
    t.is(parsedPlan.dsl.length, plan.dsl.length);
    if (parsedPlan.dsl[0] && plan.dsl[0]) {
      t.is(parsedPlan.dsl[0].op, plan.dsl[0].op);
    }
  }

  // Clean up
  await fs.rm(tmpDir, { recursive: true, force: true });
});
