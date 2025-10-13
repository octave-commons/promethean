import test from 'ava';
import path from 'node:path';
import { writeFile, mkdir } from 'node:fs/promises';

import { executeCommand, type CliContext } from '../cli/command-handlers.js';
import { withTempDir } from '../test-utils/helpers.js';

test('move_up - basic functionality', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const context: CliContext = {
    boardFile: boardPath,
    tasksDir,
  };

  // Create tasks first using the create command
  await executeCommand('create', ['First task', '--status=Todo'], context);
  const task2 = (await executeCommand('create', ['Second task', '--status=Todo'], context)) as any;
  await executeCommand('create', ['Third task', '--status=Todo'], context);

  // Test move_up command - move second task up
  const result = (await executeCommand('move_up', [task2.uuid], context)) as
    | { uuid: string; column: string; rank: number }
    | undefined;

  t.truthy(result);
  t.is(result!.uuid, task2.uuid);
  t.is(result!.column, 'Todo');
  t.is(result!.rank, 0); // Should be at position 0 after moving up
});

test('move_down - basic functionality', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const context: CliContext = {
    boardFile: boardPath,
    tasksDir,
  };

  // Create tasks first using the create command
  await executeCommand('create', ['First task', '--status=Todo'], context);
  const task2 = (await executeCommand('create', ['Second task', '--status=Todo'], context)) as any;
  await executeCommand('create', ['Third task', '--status=Todo'], context);

  // Test move_down command - move second task down
  const result = (await executeCommand('move_down', [task2.uuid], context)) as
    | { uuid: string; column: string; rank: number }
    | undefined;

  t.truthy(result);
  t.is(result!.uuid, task2.uuid);
  t.is(result!.column, 'Todo');
  t.is(result!.rank, 2); // Should be at position 2 after moving down
});

test('move_up - first task (no-op)', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const context: CliContext = {
    boardFile: boardPath,
    tasksDir,
  };

  // Create tasks first using the create command
  const task1 = (await executeCommand('create', ['First task', '--status=Todo'], context)) as any;
  await executeCommand('create', ['Second task', '--status=Todo'], context);

  // Moving first task up should be no-op
  const result = (await executeCommand('move_up', [task1.uuid], context)) as
    | { uuid: string; column: string; rank: number }
    | undefined;

  t.truthy(result);
  t.is(result!.uuid, task1.uuid);
  t.is(result!.column, 'Todo');
  t.is(result!.rank, 0); // Should still be at position 0
});

test('move_down - last task (no-op)', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const context: CliContext = {
    boardFile: boardPath,
    tasksDir,
  };

  // Create tasks first using the create command
  await executeCommand('create', ['First task', '--status=Todo'], context);
  const task2 = (await executeCommand('create', ['Second task', '--status=Todo'], context)) as any;

  // Moving last task down should be no-op
  const result = (await executeCommand('move_down', [task2.uuid], context)) as
    | { uuid: string; column: string; rank: number }
    | undefined;

  t.truthy(result);
  t.is(result!.uuid, task2.uuid);
  t.is(result!.column, 'Todo');
  t.is(result!.rank, 1); // Should still be at position 1
});

test('move_up - invalid task UUID', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const context: CliContext = {
    boardFile: boardPath,
    tasksDir,
  };

  // Try to move non-existent task
  const result = await executeCommand('move_up', ['non-existent-uuid'], context);

  t.is(result, undefined);
});

test('move_down - invalid task UUID', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const context: CliContext = {
    boardFile: boardPath,
    tasksDir,
  };

  // Try to move non-existent task
  const result = await executeCommand('move_down', ['non-existent-uuid'], context);

  t.is(result, undefined);
});

test('move commands - missing arguments', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const context: CliContext = {
    boardFile: boardPath,
    tasksDir,
  };

  // Test move_up without arguments
  try {
    await executeCommand('move_up', [], context);
    t.fail('Should have thrown an error');
  } catch (error: any) {
    t.true(error.message.includes('Missing required task id'));
  }

  // Test move_down without arguments
  try {
    await executeCommand('move_down', [], context);
    t.fail('Should have thrown an error');
  } catch (error: any) {
    t.true(error.message.includes('Missing required task id'));
  }
});
