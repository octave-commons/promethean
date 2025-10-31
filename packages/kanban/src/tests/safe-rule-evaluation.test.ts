import test from 'ava';
import { safeEvaluateTransition } from '../lib/safe-rule-evaluation.js';
import type { TaskFM } from '../board/types.js';
import type { Board, Task } from '../lib/types.js';

// Minimal test fixtures
const mockTask: TaskFM = {
  id: 'test-uuid',
  title: 'Test Task',
  status: 'open',
  priority: 'medium',
  owner: 'test',
  labels: [],
  created: new Date().toISOString(),
  uuid: 'test-uuid',
};

// Convert TaskFM to Task for Board compatibility
const mockTaskForBoard: Task = {
  uuid: 'test-uuid',
  title: 'Test Task',
  status: 'open',
  priority: 'medium',
  labels: [],
  created_at: new Date().toISOString(),
  estimates: { complexity: 1 },
};

const mockBoard: Board = {
  columns: [
    {
      name: 'incoming',
      limit: null,
      tasks: [mockTaskForBoard],
      count: 1,
    },
    {
      name: 'ready',
      limit: null,
      tasks: [],
      count: 0,
    },
  ],
};

test('safeEvaluateTransition returns validation errors when inputs are invalid', async (t) => {
  const invalidTask = { ...mockTask, title: '' }; // Empty title should fail validation
  const result = await safeEvaluateTransition(
    invalidTask,
    mockBoard,
    '(fn [from to task board] true)', // Simple always-true rule
    '/nonexistent/dsl.clj',
  );

  t.false(result.success);
  t.true(result.validationErrors.length > 0);
  t.is(result.evaluationError, undefined);
});

test('safeEvaluateTransition handles evaluation errors gracefully', async (t) => {
  const malformedRule = '(fn [from to task board] (undefined-symbol))';
  const result = await safeEvaluateTransition(
    mockTask,
    mockBoard,
    malformedRule,
    '/nonexistent/dsl.clj',
  );

  t.false(result.success);
  t.true(result.validationErrors.length === 0);
  t.is(typeof result.evaluationError, 'string');
  t.true(result.evaluationError!.includes('Rule evaluation failed'));
});

test('safeEvaluateTransition with direct function call format', async (t) => {
  // This test requires a real DSL file with a function; for now we expect evaluation error due to missing file
  const directCallRule = '(evaluate-transition/test-fn "incoming" "ready")';
  const result = await safeEvaluateTransition(
    mockTask,
    mockBoard,
    directCallRule,
    '/nonexistent/dsl.clj',
  );

  // Should fail due to missing DSL file, but not due to validation
  t.false(result.success);
  t.true(result.validationErrors.length === 0);
  t.is(typeof result.evaluationError, 'string');
});

test('safeEvaluateTransition with inline function definition', async (t) => {
  const inlineRule = '(fn [from to task board] (= from "incoming"))';
  const result = await safeEvaluateTransition(
    mockTask,
    mockBoard,
    inlineRule,
    '/nonexistent/dsl.clj',
  );

  // Should fail due to missing Clojure context, but not due to validation
  t.false(result.success);
  t.true(result.validationErrors.length === 0);
  t.is(typeof result.evaluationError, 'string');
});
