import test from 'ava';
import { createWIPLimitEnforcement } from '../lib/wip-enforcement.js';
import { loadKanbanConfig } from '../board/config.js';
import type { Board } from '../lib/types.js';

// Helper function to get numeric priority
const getPriorityNumeric = (priority: string | number | undefined): number => {
  if (typeof priority === 'number') return priority;
  if (typeof priority === 'string') {
    const match = priority.match(/P(\d+)/i);
    if (match?.[1]) return parseInt(match[1], 10);
    if (priority.toLowerCase() === 'critical') return 0;
    if (priority.toLowerCase() === 'high') return 1;
    if (priority.toLowerCase() === 'medium') return 2;
    if (priority.toLowerCase() === 'low') return 3;
  }
  return 3; // Default to low priority
};

// Helper to create mock tasks
const createMockTask = (params: {
  readonly uuid: string;
  readonly title: string;
  readonly status: string;
  readonly priority: string;
  readonly labels: string[];
}) => ({
  uuid: params.uuid,
  title: params.title,
  status: params.status,
  priority: params.priority,
  labels: params.labels,
  created_at: `2024-01-0${params.uuid.split('-')[1]}T00:00:00Z`,
});

// Helper to create todo column
const createTodoColumn = () => ({
  name: 'todo',
  count: 3,
  limit: 5,
  tasks: [
    createMockTask({
      uuid: 'task-1',
      title: 'Task 1',
      status: 'todo',
      priority: 'P1',
      labels: ['feature'],
    }),
    createMockTask({
      uuid: 'task-2',
      title: 'Task 2',
      status: 'todo',
      priority: 'P2',
      labels: ['bug'],
    }),
    createMockTask({
      uuid: 'task-3',
      title: 'Task 3',
      status: 'todo',
      priority: 'P3',
      labels: ['enhancement'],
    }),
  ],
});

// Helper to create in_progress column
const createInProgressColumn = () => ({
  name: 'in_progress',
  count: 4,
  limit: 3,
  tasks: [
    createMockTask({
      uuid: 'task-4',
      title: 'Task 4',
      status: 'in_progress',
      priority: 'P1',
      labels: ['feature'],
    }),
    createMockTask({
      uuid: 'task-5',
      title: 'Task 5',
      status: 'in_progress',
      priority: 'P2',
      labels: ['bug'],
    }),
    createMockTask({
      uuid: 'task-6',
      title: 'Task 6',
      status: 'in_progress',
      priority: 'P3',
      labels: ['enhancement'],
    }),
    createMockTask({
      uuid: 'task-7',
      title: 'Task 7',
      status: 'in_progress',
      priority: 'P1',
      labels: ['feature'],
    }),
  ],
});

// Helper to create done column
const createDoneColumn = () => ({
  name: 'done',
  count: 2,
  limit: null,
  tasks: [
    createMockTask({
      uuid: 'task-8',
      title: 'Task 8',
      status: 'done',
      priority: 'P1',
      labels: ['feature'],
    }),
    createMockTask({
      uuid: 'task-9',
      title: 'Task 9',
      status: 'done',
      priority: 'P2',
      labels: ['bug'],
    }),
  ],
});

// Mock board data for testing
const createMockBoard = (overrides?: Partial<Board>): Board => ({
  columns: [createTodoColumn(), createInProgressColumn(), createDoneColumn()],
  ...overrides,
});

test('WIPLimitEnforcement - validates WIP limits correctly', async (t) => {
  const config = await loadKanbanConfig();
  const enforcement = await createWIPLimitEnforcement({ config: config.config });
  const board = createMockBoard();

  // Test column within limits
  const todoValidation = await enforcement.validateWIPLimits('todo', 0, board);
  t.true(todoValidation.valid);
  t.is(todoValidation.current, 3);
  t.is(todoValidation.limit, 5);
  t.is(todoValidation.projected, 3);

  // Test column over limits
  const inProgressValidation = await enforcement.validateWIPLimits('in_progress', 0, board);
  t.false(inProgressValidation.valid);
  t.is(inProgressValidation.current, 4);
  t.is(inProgressValidation.limit, 3);
  t.is(inProgressValidation.projected, 4);
  t.is(inProgressValidation.violation?.severity, 'error');

  // Test column with no limits
  const doneValidation = await enforcement.validateWIPLimits('done', 0, board);
  t.true(doneValidation.valid);
  t.is(doneValidation.limit, null);
});

test('WIPLimitEnforcement - intercepts status transitions', async (t) => {
  // Create a mock config with WIP limits that match our test board
  const mockConfig = {
    repo: '/test',
    tasksDir: '/test/tasks',
    indexFile: '/test/index.md',
    boardFile: '/test/board.md',
    cachePath: '/test/cache',
    exts: new Set(['.md']),
    requiredFields: ['title'],
    statusValues: new Set(['todo', 'in_progress', 'review', 'done']),
    priorityValues: new Set(['P1', 'P2', 'P3']),
    wipLimits: {
      todo: 5,
      in_progress: 3,
    },
  };
  const enforcement = await createWIPLimitEnforcement({ config: mockConfig });
  const board = createMockBoard();

  // Test blocked transition
  const blockedResult = await enforcement.interceptStatusTransition(
    'task-1',
    'todo',
    'in_progress',
    board,
  );
  t.true(blockedResult.blocked);
  t.true(blockedResult.reason?.includes('exceed WIP limit'));

  // Test allowed transition
  const allowedResult = await enforcement.interceptStatusTransition(
    'task-4',
    'in_progress',
    'done',
    board,
  );
  t.false(allowedResult.blocked);
});

test('WIPLimitEnforcement - generates capacity suggestions', async (t) => {
  const config = await loadKanbanConfig();
  const enforcement = await createWIPLimitEnforcement({ config: config.config });
  const board = createMockBoard();

  const suggestions = await enforcement.generateCapacitySuggestions('in_progress', board);
  t.true(suggestions.length > 0);

  // Should suggest moving tasks to underutilized columns
  const moveSuggestions = suggestions.filter((s) => s.action === 'move_tasks');
  t.true(moveSuggestions.length > 0);

  const firstSuggestion = moveSuggestions[0];
  t.truthy(firstSuggestion);
  t.is(firstSuggestion?.action, 'move_tasks');
  t.true(firstSuggestion?.description?.includes('in_progress'));
  t.true(firstSuggestion?.tasks && firstSuggestion.tasks.length > 0);
});

test('WIPLimitEnforcement - provides capacity monitoring', async (t) => {
  const config = await loadKanbanConfig();
  const enforcement = await createWIPLimitEnforcement({ config: config.config });
  const board = createMockBoard();

  const monitor = await enforcement.getCapacityMonitor(board);

  t.is(monitor.columns.length, 3);
  t.is(monitor.totalViolations, 1); // in_progress is over limit

  const inProgressColumn = monitor.columns.find((c) => c.name === 'in_progress');
  t.truthy(inProgressColumn);
  t.is(inProgressColumn?.status, 'critical');
  t.is(inProgressColumn?.current, 4);
  t.is(inProgressColumn?.limit, 3);

  const todoColumn = monitor.columns.find((c) => c.name === 'todo');
  t.truthy(todoColumn);
  t.is(todoColumn?.status, 'healthy');
});

test('WIPLimitEnforcement - tracks violation history', async (t) => {
  const config = await loadKanbanConfig();
  const enforcement = await createWIPLimitEnforcement({ config: config.config });
  const board = createMockBoard();

  // Generate a violation
  await enforcement.interceptStatusTransition('task-1', 'todo', 'in_progress', board);

  const violations = enforcement.getViolationHistory();
  t.true(violations.length > 0);

  const firstViolation = violations[0];
  if (firstViolation) {
    t.is(firstViolation.taskId, 'task-1');
    t.is(firstViolation.fromStatus, 'todo');
    t.is(firstViolation.toStatus, 'in_progress');
    t.true(firstViolation.blocked);
    t.is(firstViolation.severity, 'error');
  }
});

test('WIPLimitEnforcement - generates compliance reports', async (t) => {
  const config = await loadKanbanConfig();
  const enforcement = await createWIPLimitEnforcement({ config: config.config });

  // Generate some violations first
  const board = createMockBoard();
  await enforcement.interceptStatusTransition('task-1', 'todo', 'in_progress', board);
  await enforcement.interceptStatusTransition('task-2', 'todo', 'in_progress', board);

  const report = await enforcement.generateComplianceReport('24h');

  t.is(report.timeframe, '24h');
  t.true(report.totalViolations >= 2);
  t.true(Object.keys(report.violationsByColumn).includes('in_progress'));
  t.true(Object.keys(report.violationsBySeverity).includes('error'));
  t.true(report.recommendations.length > 0);
});

test('WIPLimitEnforcement - handles admin overrides', async (t) => {
  const config = await loadKanbanConfig();
  const enforcement = await createWIPLimitEnforcement({ config: config.config });
  const board = createMockBoard();

  const overrideResult = await enforcement.interceptStatusTransition(
    'task-1',
    'todo',
    'in_progress',
    board,
    {
      force: true,
      overrideReason: 'Critical hotfix required',
      overrideBy: 'admin',
    },
  );

  t.false(overrideResult.blocked);
  t.true(overrideResult.reason?.includes('override'));

  const violations = enforcement.getViolationHistory();
  const overrideViolation = violations.find((v) => v.overrideReason);
  t.truthy(overrideViolation);
  if (overrideViolation) {
    t.is(overrideViolation.overrideReason, 'Critical hotfix required');
    t.is(overrideViolation.overrideBy, 'admin');
  }
});

// Helper to create review column at 80% capacity
const createReviewColumn = () => ({
  name: 'review',
  count: 4,
  limit: 5, // 80% utilization
  tasks: [
    {
      uuid: 'review-1',
      title: 'Review Task 1',
      status: 'review',
      priority: 'P1',
      labels: ['review'],
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      uuid: 'review-2',
      title: 'Review Task 2',
      status: 'review',
      priority: 'P2',
      labels: ['review'],
      created_at: '2024-01-02T00:00:00Z',
    },
    {
      uuid: 'review-3',
      title: 'Review Task 3',
      status: 'review',
      priority: 'P3',
      labels: ['review'],
      created_at: '2024-01-03T00:00:00Z',
    },
    {
      uuid: 'review-4',
      title: 'Review Task 4',
      status: 'review',
      priority: 'P1',
      labels: ['review'],
      created_at: '2024-01-04T00:00:00Z',
    },
  ],
});

test('WIPLimitEnforcement - warning threshold detection', async (t) => {
  const config = await loadKanbanConfig();
  const enforcement = await createWIPLimitEnforcement({ config: config.config });

  const nearLimitBoard = createMockBoard({
    columns: [createReviewColumn()],
  });

  const warningValidation = await enforcement.validateWIPLimits('review', +1, nearLimitBoard);
  t.true(warningValidation.valid); // Still valid, but with warning
  t.is(warningValidation.violation?.severity, 'warning');
  t.true(warningValidation.violation?.reason?.includes('approaching capacity'));
});

test('WIPLimitEnforcement - priority-based task selection', async (t) => {
  const config = await loadKanbanConfig();
  const enforcement = await createWIPLimitEnforcement({ config: config.config });
  const board = createMockBoard();

  const suggestions = await enforcement.generateCapacitySuggestions('in_progress', board);
  const moveSuggestion = suggestions.find((s) => s.action === 'move_tasks');

  t.truthy(moveSuggestion);
  if (moveSuggestion && moveSuggestion.tasks) {
    // Tasks should be sorted by priority (lowest priority first for moving)
    const tasks = moveSuggestion.tasks;
    for (const i of tasks.keys()) {
      const prevTask = tasks[i - 1];
      const currTask = tasks[i];
      if (prevTask && currTask) {
        const prevPriority = getPriorityNumeric(prevTask.priority);
        const currPriority = getPriorityNumeric(currTask.priority);
        t.true(prevPriority <= currPriority);
      }
    }
  }
});
