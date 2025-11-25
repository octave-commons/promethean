import test from 'ava';
import path from 'node:path';

import { safeEvaluateTransition } from '../src/safe-rule-evaluation.js';
import type { Board, Task, TaskFM } from '@promethean-os/kanban-sdk';

const dslPath = path.resolve(process.cwd(), 'dist/tests/nbb/test_rules.cljs');

// Minimal test fixtures
const mockTask: TaskFM = {
  id: 'test-uuid',
  title: 'Test Task',
  status: 'incoming',
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
  status: 'incoming',
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
  const invalidTask = { ...mockTask, uuid: undefined as any }; // Missing UUID should fail validation
  const result = await safeEvaluateTransition(
    invalidTask,
    mockBoard,
    '(fn [task board] true)',
    dslPath,
  );

  t.false(result.success);
  t.true(result.validationErrors.length > 0);
  t.is(result.evaluationError, undefined);
});

test('safeEvaluateTransition handles evaluation errors gracefully', async (t) => {
  const malformedRule = '(fn [task board] (undefined-symbol))';
  const result = await safeEvaluateTransition(mockTask, mockBoard, malformedRule, dslPath);

  t.false(result.success);
  t.true(result.validationErrors.length === 0);
  t.is(typeof result.evaluationError, 'string');
  t.true(result.evaluationError!.includes('Rule evaluation failed'));
});

test('safeEvaluateTransition with direct function call format', async (t) => {
  const directCallRule = '(test-rules/direct-allow? "incoming" "ready")';
  const result = await safeEvaluateTransition(mockTask, mockBoard, directCallRule, dslPath);

  t.true(result.success);
  t.true(result.validationErrors.length === 0);
  t.is(result.evaluationError, undefined);
});

test('safeEvaluateTransition with inline function definition', async (t) => {
  const inlineRule = '(fn [task board] (= (:title task) "Test Task"))';
  const result = await safeEvaluateTransition(mockTask, mockBoard, inlineRule, dslPath);

  t.true(result.success);
  t.true(result.validationErrors.length === 0);
  t.is(result.evaluationError, undefined);
});
