import test from 'ava';
import { formatTable, formatTableCell } from '../lib/markdown-output.js';
import type { Task, ColumnData } from '../lib/types.js';

// Test fixtures
const mockTask1: Task = {
  uuid: '12345678-1234-1234-1234-123456789abc',
  title: 'Test Task One',
  status: 'todo',
  priority: 'high',
  labels: ['bug', 'urgent'],
  created_at: '2024-01-01T00:00:00Z',
};

const mockTask2: Task = {
  uuid: '87654321-4321-4321-4321-cba987654321',
  title: 'Test Task Two',
  status: 'in_progress',
  priority: 'medium',
  created_at: '2024-01-02T00:00:00Z',
};

const mockTaskWithFlags: Task = {
  uuid: 'abcdef12-abcd-ef12-3456-789012345678',
  title: '--title Add OAuth Authentication --description Implement OAuth flow',
  status: 'ready',
  priority: 'low',
};

const mockColumnData: ColumnData = {
  name: 'todo',
  count: 2,
  limit: 10,
  tasks: [mockTask1, mockTask2],
};

// formatTableCell Unit Tests
test('formatTableCell handles null/undefined values', (t) => {
  t.is(formatTableCell(null), '');
  t.is(formatTableCell(undefined), '');
});

test('formatTableCell handles primitive values', (t) => {
  t.is(formatTableCell('string'), 'string');
  t.is(formatTableCell(42), '42');
  t.is(formatTableCell(true), 'true');
  t.is(formatTableCell(false), 'false');
});

test('formatTableCell handles empty arrays', (t) => {
  t.is(formatTableCell([]), '[]');
});

test('formatTableCell handles arrays of primitives', (t) => {
  t.is(formatTableCell([1, 2, 3]), '1, 2, 3');
  t.is(formatTableCell(['a', 'b', 'c']), 'a, b, c');
});

test('formatTableCell handles arrays of objects', (t) => {
  const objects = [{ name: 'test' }, { name: 'test2' }];
  const result = formatTableCell(objects);
  t.true(result.includes('{"name":"test"}'));
  t.true(result.includes('{"name":"test2"}'));
});

test('formatTableCell handles Task arrays correctly', (t) => {
  const tasks = [mockTask1, mockTask2];
  const result = formatTableCell(tasks);

  t.true(result.includes('Test Task One (12345678...)'));
  t.true(result.includes('Test Task Two (87654321...)'));
  t.true(result.includes(', '));
});

test('formatTableCell cleans up task titles with flags', (t) => {
  const tasks = [mockTaskWithFlags];
  const result = formatTableCell(tasks);

  // Should remove --title prefix and clean up formatting
  t.true(result.includes('Add OAuth Authentication'));
  t.false(result.includes('--title'));
  t.true(result.includes('(abcdef12...)'));
});

test('formatTableCell handles tasks with missing titles', (t) => {
  const taskWithoutTitle: Task = {
    uuid: 'missing-title-uuid',
    title: '',
    status: 'todo',
  };
  const result = formatTableCell([taskWithoutTitle]);
  t.true(result.includes('Untitled (missing-title-...)'));
});

test('formatTableCell handles tasks with missing UUIDs', (t) => {
  const taskWithoutUuid: Task = {
    uuid: '',
    title: 'Task without UUID',
    status: 'todo',
  };
  const result = formatTableCell([taskWithoutUuid]);
  t.true(result.includes('Task without UUID (unknown)'));
});

test('formatTableCell handles nested objects', (t) => {
  const nested = { user: { name: 'test', id: 123 } };
  const result = formatTableCell(nested);
  t.is(result, JSON.stringify(nested));
});

// formatTable Unit Tests
test('formatTable handles empty data', (t) => {
  t.is(formatTable([]), 'No data to display.');
});

test('formatTable creates basic table structure', (t) => {
  const data = [{ name: 'test', value: 42 }];
  const result = formatTable(data);

  t.true(result.includes('| name | value |'));
  t.true(result.includes('| --- | --- |'));
  t.true(result.includes('| test | 42 |'));
});

test('formatTable uses custom headers', (t) => {
  const data = [{ name: 'test', value: 42, extra: 'ignored' }];
  const result = formatTable(data, ['name', 'value']);

  t.true(result.includes('| name | value |'));
  t.false(result.includes('extra'));
});

test('formatTable handles ColumnData with Task arrays', (t) => {
  const data = [mockColumnData];
  const result = formatTable(data);

  // Should include table headers
  t.true(result.includes('| name | count | limit | tasks |'));

  // Should include column data
  t.true(result.includes('| todo | 2 | 10 |'));

  // Should NOT include [object Object]
  t.false(result.includes('[object Object]'));

  // Should include formatted task information
  t.true(result.includes('Test Task One (12345678...)'));
  t.true(result.includes('Test Task Two (87654321...)'));
});

test('formatTable handles empty column tasks', (t) => {
  const emptyColumn: ColumnData = {
    name: 'empty',
    count: 0,
    limit: 5,
    tasks: [],
  };
  const data = [emptyColumn];
  const result = formatTable(data);

  t.true(result.includes('| empty | 0 | 5 | [] |'));
});

test('formatTable handles multiple columns', (t) => {
  const column2: ColumnData = {
    name: 'done',
    count: 1,
    limit: null,
    tasks: [mockTask1],
  };
  const data = [mockColumnData, column2];
  const result = formatTable(data);

  t.true(result.includes('| todo | 2 | 10 |'));
  t.true(result.includes('| done | 1 |  |'));
  t.true(result.includes('Test Task One (12345678...)'));
});

test('formatTable handles special characters in task titles', (t) => {
  const specialTask: Task = {
    uuid: 'special-chars-uuid',
    title: 'Task with "quotes" & <brackets> and 🚀 emoji',
    status: 'todo',
  };
  const column: ColumnData = {
    name: 'special',
    count: 1,
    limit: null,
    tasks: [specialTask],
  };
  const result = formatTable([column]);

  t.true(result.includes('Task with "quotes" & <brackets> and 🚀 emoji'));
  t.true(result.includes('(special-chars...)'));
});

test('formatTable handles very long task titles', (t) => {
  const longTitle = 'A'.repeat(200);
  const longTask: Task = {
    uuid: 'long-title-uuid',
    title: longTitle,
    status: 'todo',
  };
  const column: ColumnData = {
    name: 'long',
    count: 1,
    limit: null,
    tasks: [longTask],
  };
  const result = formatTable([column]);

  t.true(result.includes(longTitle));
  t.true(result.includes('(long-title-...)'));
});

test('formatTable handles malformed task objects', (t) => {
  const malformedTask = {
    // Missing required fields
    uuid: 'malformed-uuid',
    // title missing
    status: 'todo',
  } as any;

  const column: ColumnData = {
    name: 'malformed',
    count: 1,
    limit: null,
    tasks: [malformedTask],
  };
  const result = formatTable([column]);

  // Should handle gracefully without crashing
  t.true(result.includes('Untitled (malformed-...)'));
  t.false(result.includes('[object Object]'));
});

test('formatTable performance with large task arrays', (t) => {
  const largeTaskArray: Task[] = [];
  for (let i = 0; i < 100; i++) {
    largeTaskArray.push({
      uuid: `task-${i.toString().padStart(4, '0')}-uuid`,
      title: `Task ${i}`,
      status: 'todo',
    });
  }

  const largeColumn: ColumnData = {
    name: 'large',
    count: 100,
    limit: 150,
    tasks: largeTaskArray,
  };

  const startTime = Date.now();
  const result = formatTable([largeColumn]);
  const endTime = Date.now();

  // Should complete within reasonable time (< 1 second for 100 tasks)
  t.true(endTime - startTime < 1000, `Format took ${endTime - startTime}ms, expected < 1000ms`);

  // Should include all tasks
  t.true(result.includes('Task 0 (task-0000-...)'));
  t.true(result.includes('Task 99 (task-0099-...)'));

  // Should not include [object Object]
  t.false(result.includes('[object Object]'));
});

test('formatTable handles mixed data types in same table', (t) => {
  const mixedData = [
    {
      name: 'string',
      value: 'test string',
      array: [1, 2, 3],
      object: { nested: true },
      null: null,
      undefined: undefined,
    },
  ];

  const result = formatTable(mixedData);

  t.true(result.includes('| string | test string | 1, 2, 3 | {"nested":true} |  |  |'));
});

test('formatTable regression test for original issue', (t) => {
  // This test specifically prevents regression of the original [object Object] issue
  const data = [mockColumnData];
  const result = formatTable(data);

  // The most important assertion: no [object Object] should appear
  t.false(result.includes('[object Object]'), 'Regression: [object Object] found in output');

  // Should contain properly formatted task information
  t.true(result.includes('Test Task One (12345678...)'));
  t.true(result.includes('Test Task Two (87654321...)'));

  // Should maintain proper table structure
  t.true(result.includes('| name | count | limit | tasks |'));
  t.true(result.includes('| --- | --- | --- | --- |'));
});
