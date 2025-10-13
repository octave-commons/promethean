import test from 'ava';
import path from 'node:path';
import { writeFile, mkdir } from 'node:fs/promises';

import { executeCommand, type CliContext } from '../cli/command-handlers.js';
import { withTempDir } from '../test-utils/helpers.js';

test('move_up - empty board', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const context: CliContext = {
    boardFile: boardPath,
    tasksDir,
  };

  // Try to move on empty board
  const result = await executeCommand('move_up', ['non-existent-uuid'], context);
  t.is(result, undefined);
});

test('move_down - empty board', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const context: CliContext = {
    boardFile: boardPath,
    tasksDir,
  };

  // Try to move on empty board
  const result = await executeCommand('move_down', ['non-existent-uuid'], context);
  t.is(result, undefined);
});

test('move operations - single task in column', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const context: CliContext = {
    boardFile: boardPath,
    tasksDir,
  };

  // Create single task
  const task1 = (await executeCommand('create', ['Single Task', '--status=Todo'], context)) as any;

  // Both moves should be no-ops
  const upResult = (await executeCommand('move_up', [task1.uuid], context)) as any;
  t.truthy(upResult);
  t.is(upResult.rank, 0);

  const downResult = (await executeCommand('move_down', [task1.uuid], context)) as any;
  t.truthy(downResult);
  t.is(downResult.rank, 0);
});

test('move operations - empty UUID', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const context: CliContext = {
    boardFile: boardPath,
    tasksDir,
  };

  // Create a task first
  await executeCommand('create', ['Test Task', '--status=Todo'], context);

  // Empty string should throw CommandUsageError
  try {
    await executeCommand('move_up', [''], context);
    t.fail('Should have thrown an error');
  } catch (error: any) {
    t.true(error.message.includes('Missing required task id'));
  }
});

test('move operations - malformed UUID', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const context: CliContext = {
    boardFile: boardPath,
    tasksDir,
  };

  // Create a task first
  await executeCommand('create', ['Test Task', '--status=Todo'], context);

  // Try malformed UUIDs (excluding empty string which is caught by argument validation)
  const malformedUuids = [
    'not-a-uuid',
    '123-456-789',
    'abc-def-ghi-jkl',
    'short',
    'very-long-uuid-that-exceeds-normal-length-and-contains-many-characters',
  ];

  for (const uuid of malformedUuids) {
    const result = await executeCommand('move_up', [uuid], context);
    t.is(result, undefined, `Should return undefined for malformed UUID: ${uuid}`);
  }
});

test('move operations - special characters in UUID', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const context: CliContext = {
    boardFile: boardPath,
    tasksDir,
  };

  // Create a task first
  await executeCommand('create', ['Test Task', '--status=Todo'], context);

  // Try UUIDs with special characters
  const specialCharUuids = [
    '../../../etc/passwd',
    'uuid\nwith\nnewlines',
    'uuid\twith\ttabs',
    'uuid with spaces',
    'uuid/with/slashes',
    'uuid\\with\\backslashes',
    'uuid|with|pipes',
    'uuid;with;semicolons',
  ];

  for (const uuid of specialCharUuids) {
    const result = await executeCommand('move_up', [uuid], context);
    t.is(result, undefined, `Should return undefined for UUID with special chars: ${uuid}`);
  }
});

test('move operations - very long UUID', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const context: CliContext = {
    boardFile: boardPath,
    tasksDir,
  };

  // Create a task first
  await executeCommand('create', ['Test Task', '--status=Todo'], context);

  // Try very long UUID
  const longUuid = 'a'.repeat(1000);
  const result = await executeCommand('move_up', [longUuid], context);
  t.is(result, undefined);
});

test('move operations - null and undefined inputs', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const context: CliContext = {
    boardFile: boardPath,
    tasksDir,
  };

  // Create a task first
  await executeCommand('create', ['Test Task', '--status=Todo'], context);

  // Test with null and undefined (these will be converted to strings)
  const result1 = await executeCommand('move_up', ['null'], context);
  t.is(result1, undefined);

  const result2 = await executeCommand('move_up', ['undefined'], context);
  t.is(result2, undefined);
});

test('move operations - concurrent same task', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const context: CliContext = {
    boardFile: boardPath,
    tasksDir,
  };

  // Create 3 tasks
  await executeCommand('create', ['Task 1', '--status=Todo'], context);
  await executeCommand('create', ['Task 2', '--status=Todo'], context);
  const task3 = (await executeCommand('create', ['Task 3', '--status=Todo'], context)) as any;

  // Move task3 up twice concurrently
  const [result1, result2] = await Promise.all([
    executeCommand('move_up', [task3.uuid], context),
    executeCommand('move_up', [task3.uuid], context),
  ]);

  // Both should succeed, but the second should be a no-op since task3 is already at position 1 after first move
  t.truthy(result1);
  t.truthy(result2);

  const typedResult1 = result1 as any;
  const typedResult2 = result2 as any;

  t.is(typedResult1.rank, 1); // Should move from position 2 to 1
  t.is(typedResult2.rank, 1); // Should stay at position 1 (no-op)
});

test('move operations - board file corruption resistance', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });

  // Write corrupted board content
  await writeFile(boardPath, 'This is not valid markdown kanban content', 'utf8');

  const context: CliContext = {
    boardFile: boardPath,
    tasksDir,
  };

  // Try to move - should handle gracefully
  const result = await executeCommand('move_up', ['some-uuid'], context);
  t.is(result, undefined);
});

test('move operations - non-existent board file', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'non-existent-board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });
  // Don't create the board file

  const context: CliContext = {
    boardFile: boardPath,
    tasksDir,
  };

  // Try to move - should handle gracefully
  const result = await executeCommand('move_up', ['some-uuid'], context);
  t.is(result, undefined);
});
