import test from 'ava';
import { createWIPLimitEnforcement } from '../lib/wip-enforcement.js';
import { loadKanbanConfig } from '../board/config.js';
// Helper function to get numeric priority
const getPriorityNumeric = (priority) => {
    if (typeof priority === 'number')
        return priority;
    if (typeof priority === 'string') {
        const match = priority.match(/P(\d+)/i);
        if (match?.[1])
            return parseInt(match[1], 10);
        if (priority.toLowerCase() === 'critical')
            return 0;
        if (priority.toLowerCase() === 'high')
            return 1;
        if (priority.toLowerCase() === 'medium')
            return 2;
        if (priority.toLowerCase() === 'low')
            return 3;
    }
    return 3; // Default to low priority
};
// Mock board data for testing
const createMockBoard = (overrides) => ({
    columns: [
        {
            name: 'todo',
            count: 3,
            limit: 5,
            tasks: [
                {
                    uuid: 'task-1',
                    title: 'Task 1',
                    status: 'todo',
                    priority: 'P1',
                    labels: ['feature'],
                    created_at: '2024-01-01T00:00:00Z',
                },
                {
                    uuid: 'task-2',
                    title: 'Task 2',
                    status: 'todo',
                    priority: 'P2',
                    labels: ['bug'],
                    created_at: '2024-01-02T00:00:00Z',
                },
                {
                    uuid: 'task-3',
                    title: 'Task 3',
                    status: 'todo',
                    priority: 'P3',
                    labels: ['enhancement'],
                    created_at: '2024-01-03T00:00:00Z',
                },
            ],
        },
        {
            name: 'in_progress',
            count: 4,
            limit: 3,
            tasks: [
                {
                    uuid: 'task-4',
                    title: 'Task 4',
                    status: 'in_progress',
                    priority: 'P0',
                    labels: ['critical'],
                    created_at: '2024-01-04T00:00:00Z',
                },
                {
                    uuid: 'task-5',
                    title: 'Task 5',
                    status: 'in_progress',
                    priority: 'P1',
                    labels: ['feature'],
                    created_at: '2024-01-05T00:00:00Z',
                },
                {
                    uuid: 'task-6',
                    title: 'Task 6',
                    status: 'in_progress',
                    priority: 'P2',
                    labels: ['bug'],
                    created_at: '2024-01-06T00:00:00Z',
                },
                {
                    uuid: 'task-7',
                    title: 'Task 7',
                    status: 'in_progress',
                    priority: 'P3',
                    labels: ['enhancement'],
                    created_at: '2024-01-07T00:00:00Z',
                },
            ],
        },
        {
            name: 'done',
            count: 10,
            limit: null, // No limit
            tasks: Array.from({ length: 10 }, (_, i) => ({
                uuid: `done-task-${i}`,
                title: `Done Task ${i}`,
                status: 'done',
                priority: 'P2',
                labels: ['completed'],
                created_at: '2024-01-08T00:00:00Z',
            })),
        },
    ],
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
    const config = await loadKanbanConfig();
    const enforcement = await createWIPLimitEnforcement({ config: config.config });
    const board = createMockBoard();
    // Test blocked transition
    const blockedResult = await enforcement.interceptStatusTransition('task-1', 'todo', 'in_progress', board);
    t.true(blockedResult.blocked);
    t.true(blockedResult.reason?.includes('exceed WIP limit'));
    // Test allowed transition
    const allowedResult = await enforcement.interceptStatusTransition('task-4', 'in_progress', 'done', board);
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
    const overrideResult = await enforcement.interceptStatusTransition('task-1', 'todo', 'in_progress', board, {
        force: true,
        overrideReason: 'Critical hotfix required',
        overrideBy: 'admin',
    });
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
test('WIPLimitEnforcement - warning threshold detection', async (t) => {
    const config = await loadKanbanConfig();
    const enforcement = await createWIPLimitEnforcement({ config: config.config });
    // Create a board at 80% capacity
    const nearLimitBoard = createMockBoard({
        columns: [
            {
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
            },
        ],
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
        for (let i = 1; i < tasks.length; i++) {
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
//# sourceMappingURL=wip-enforcement.test.js.map