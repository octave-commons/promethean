import test from 'ava';
import path from 'node:path';
import { writeFile, mkdir } from 'node:fs/promises';

import { AVAILABLE_COMMANDS, REMOTE_COMMANDS, COMMAND_HANDLERS } from '../cli/command-handlers.js';
import { executeCommand } from '../cli/command-handlers.js';
import { withTempDir, makeBoard } from '../test-utils/helpers.js';

test('remote commands mirror available CLI commands except ui', (t) => {
  const expected = AVAILABLE_COMMANDS.filter((command) => command !== 'ui');
  const sortedRemote = [...REMOTE_COMMANDS].sort();
  const sortedExpected = [...expected].sort();
  t.deepEqual(sortedRemote, sortedExpected);
});

test('each available command has a registered handler', (t) => {
  for (const command of AVAILABLE_COMMANDS) {
    t.true(
      typeof COMMAND_HANDLERS[command] === 'function',
      `${command} should map to a command handler`,
    );
  }
});

// CRUD Command Tests

const setupTestEnvironment = async (t: any) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const board = makeBoard([
    { name: 'incoming', tasks: [], count: 0, limit: undefined },
    { name: 'ready', tasks: [], count: 0, limit: undefined },
    { name: 'todo', tasks: [], count: 0, limit: undefined },
  ]);

  const context = {
    boardFile: boardPath,
    tasksDir,
  };

  return { tempDir, boardPath, tasksDir, board, context };
};

test('create command creates a new task with basic title', async (t) => {
  const { context } = await setupTestEnvironment(t);

  const result = (await executeCommand('create', ['Test task'], context)) as any;

  t.is(result.title, 'Test task');
  t.is(result.status, 'incoming');
  t.truthy(result.uuid);
  t.truthy(result.created_at);
});

test('create command with optional flags', async (t) => {
  const { context } = await setupTestEnvironment(t);

  const result = (await executeCommand(
    'create',
    [
      'Test task with flags',
      '--priority=P1',
      '--labels=test,crud,cli',
      '--content=Test content here',
      '--status=icebox',
    ],
    context,
  )) as any;

  t.is(result.title, 'Test task with flags');
  t.is(result.priority, 'P1');
  t.deepEqual(result.labels, ['test', 'crud', 'cli']);
  t.true(result.content?.includes('Test content here'));
  t.is(result.status, 'icebox');
});

test('create command fails without title', async (t) => {
  const { context } = await setupTestEnvironment(t);

  try {
    await executeCommand('create', [], context);
    t.fail('Should have thrown an error');
  } catch (error: any) {
    t.true(error.message.includes('create requires a title'));
  }
});

test('update command updates task title', async (t) => {
  const { context } = await setupTestEnvironment(t);

  // First create a task
  const created = (await executeCommand('create', ['Original title'], context)) as any;

  // Then update the title
  const result = (await executeCommand(
    'update',
    [created.uuid, '--title=Updated title'],
    context,
  )) as any;

  t.is(result.title, 'Updated title');
  t.is(result.uuid, created.uuid);
});

test('update command updates task content', async (t) => {
  const { context } = await setupTestEnvironment(t);

  // First create a task
  const created = (await executeCommand('create', ['Test content'], context)) as any;

  // Then update the content
  const result = (await executeCommand(
    'update',
    [created.uuid, '--content=Updated content goes here'],
    context,
  )) as any;

  t.is(result.content?.trim(), 'Updated content goes here');
  t.is(result.uuid, created.uuid);
});

test('update command updates both title and content', async (t) => {
  const { context } = await setupTestEnvironment(t);

  // First create a task
  const created = (await executeCommand('create', ['Original title'], context)) as any;

  // Then update both title and content
  const result = (await executeCommand(
    'update',
    [created.uuid, '--title=New title', '--content=New content'],
    context,
  )) as any;

  t.is(result.title, 'New title');
  t.is(result.content?.trim(), 'New content');
  t.is(result.uuid, created.uuid);
});

test('update command fails for non-existent task', async (t) => {
  const { context } = await setupTestEnvironment(t);

  try {
    await executeCommand('update', ['non-existent-uuid', '--title=New title'], context);
    t.fail('Should have thrown an error');
  } catch (error: any) {
    t.true(error.message.includes('not found'));
  }
});

test('create command rejects invalid starting status via CLI', async (t) => {
  const { context } = await setupTestEnvironment(t);

  try {
    await executeCommand('create', ['Test task with invalid status', '--status=todo'], context);
    t.fail('Should have thrown an error');
  } catch (error: any) {
    t.true(error.message.includes('Invalid starting status'));
    t.true(error.message.includes('"todo"'));
    t.true(error.message.includes('Tasks can only be created with starting statuses'));
    t.true(error.message.includes('icebox, incoming'));
  }
});

test('create command allows valid starting status icebox via CLI', async (t) => {
  const { context } = await setupTestEnvironment(t);

  const result = (await executeCommand(
    'create',
    ['Test task in icebox', '--status=icebox'],
    context,
  )) as any;

  t.is(result.title, 'Test task in icebox');
  t.is(result.status, 'icebox');
});

test('create command allows valid starting status incoming via CLI', async (t) => {
  const { context } = await setupTestEnvironment(t);

  const result = (await executeCommand(
    'create',
    ['Test task in incoming', '--status=incoming'],
    context,
  )) as any;

  t.is(result.title, 'Test task in incoming');
  t.is(result.status, 'incoming');
});

test('delete command requires confirmation', async (t) => {
  const { context } = await setupTestEnvironment(t);

  // First create a task
  const created = (await executeCommand('create', ['Task to delete'], context)) as any;

  // Try to delete without confirmation
  const result = (await executeCommand('delete', [created.uuid], context)) as any;

  t.is(result.deleted, false);
  t.truthy(result.task);
  t.is(result.task.uuid, created.uuid);
});

test('delete command with confirmation', async (t) => {
  const { context } = await setupTestEnvironment(t);

  // First create a task
  const created = (await executeCommand('create', ['Task to delete confirmed'], context)) as any;

  // Delete with confirmation
  const result = (await executeCommand('delete', [created.uuid, '--confirm'], context)) as any;

  t.is(result.deleted, true);
  t.truthy(result.task);
  t.is(result.task.uuid, created.uuid);
});

test('delete command fails for non-existent task', async (t) => {
  const { context } = await setupTestEnvironment(t);

  try {
    await executeCommand('delete', ['non-existent-uuid', '--confirm'], context);
    t.fail('Should have thrown an error');
  } catch (error: any) {
    t.true(error.message.includes('not found'));
  }
});

test('CRUD commands are available in command list', (t) => {
  t.true(AVAILABLE_COMMANDS.includes('create'));
  t.true(AVAILABLE_COMMANDS.includes('update'));
  t.true(AVAILABLE_COMMANDS.includes('delete'));
});

test('CRUD commands are available in remote commands', (t) => {
  t.true(REMOTE_COMMANDS.includes('create'));
  t.true(REMOTE_COMMANDS.includes('update'));
  t.true(REMOTE_COMMANDS.includes('delete'));
});
