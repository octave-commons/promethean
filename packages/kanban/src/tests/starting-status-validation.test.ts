import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

import test from 'ava';

import { createTask } from '../lib/kanban.js';
import { withTempDir, makeBoard } from '../test-utils/helpers.js';

// RED PHASE: Test validation logic through createTask integration

test("createTask allows 'icebox' as valid starting status", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const board = makeBoard([{ name: 'icebox', count: 0, limit: null, tasks: [] }]);

  const created = await createTask(
    board,
    'icebox',
    {
      title: 'Test task in icebox',
    },
    tasksDir,
    boardPath,
  );

  t.is(created.status, 'icebox');
  t.is(created.title, 'Test task in icebox');
});

test("createTask allows 'incoming' as valid starting status", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const board = makeBoard([{ name: 'incoming', count: 0, limit: null, tasks: [] }]);

  const created = await createTask(
    board,
    'incoming',
    {
      title: 'Test task in incoming',
    },
    tasksDir,
    boardPath,
  );

  t.is(created.status, 'incoming');
  t.is(created.title, 'Test task in incoming');
});

test("createTask allows case-insensitive 'ICEBOX'", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const board = makeBoard([{ name: 'ICEBOX', count: 0, limit: null, tasks: [] }]);

  const created = await createTask(
    board,
    'ICEBOX',
    {
      title: 'Test task with uppercase icebox',
    },
    tasksDir,
    boardPath,
  );

  t.is(created.status, 'ICEBOX');
  t.is(created.title, 'Test task with uppercase icebox');
});

test("createTask allows case-insensitive 'Incoming'", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const board = makeBoard([{ name: 'Incoming', count: 0, limit: null, tasks: [] }]);

  const created = await createTask(
    board,
    'Incoming',
    {
      title: 'Test task with mixed case incoming',
    },
    tasksDir,
    boardPath,
  );

  t.is(created.status, 'Incoming');
  t.is(created.title, 'Test task with mixed case incoming');
});

test("createTask rejects 'todo' as invalid starting status", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const board = makeBoard([{ name: 'todo', count: 0, limit: null, tasks: [] }]);

  await t.throwsAsync(
    async () => {
      await createTask(
        board,
        'todo',
        {
          title: 'Test task in todo',
        },
        tasksDir,
        boardPath,
      );
    },
    {
      message: /Invalid starting status: "todo"/,
    },
  );
});

test("createTask rejects 'done' as invalid starting status", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const board = makeBoard([{ name: 'done', count: 0, limit: null, tasks: [] }]);

  await t.throwsAsync(
    async () => {
      await createTask(
        board,
        'done',
        {
          title: 'Test task in done',
        },
        tasksDir,
        boardPath,
      );
    },
    {
      message: /Invalid starting status: "done"/,
    },
  );
});

test("createTask rejects 'ready' as invalid starting status", async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const board = makeBoard([{ name: 'ready', count: 0, limit: null, tasks: [] }]);

  await t.throwsAsync(
    async () => {
      await createTask(
        board,
        'ready',
        {
          title: 'Test task in ready',
        },
        tasksDir,
        boardPath,
      );
    },
    {
      message: /Invalid starting status: "ready"/,
    },
  );
});

test('createTask rejects empty string as starting status', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const board = makeBoard([{ name: '', count: 0, limit: null, tasks: [] }]);

  await t.throwsAsync(
    async () => {
      await createTask(
        board,
        '',
        {
          title: 'Test task with empty status',
        },
        tasksDir,
        boardPath,
      );
    },
    {
      message: /Invalid starting status: ""/,
    },
  );
});

test('createTask error message includes guidance about valid statuses', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const board = makeBoard([{ name: 'invalid', count: 0, limit: null, tasks: [] }]);

  const error = await t.throwsAsync(async () => {
    await createTask(
      board,
      'invalid',
      {
        title: 'Test task with invalid status',
      },
      tasksDir,
      boardPath,
    );
  });

  // Verify error message contains helpful guidance
  t.true(error.message.includes('Invalid starting status'));
  t.true(error.message.includes('"invalid"'));
  t.true(error.message.includes('Tasks can only be created with starting statuses'));
  t.true(error.message.includes('icebox, incoming'));
  t.true(error.message.includes('Use --status flag'));
});

test('createTask rejects various invalid statuses', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const invalidStatuses = [
    'backlog',
    'review',
    'testing',
    'deployed',
    'archived',
    'blocked',
    'in-progress',
    'priority',
  ];

  for (const status of invalidStatuses) {
    const board = makeBoard([{ name: status, count: 0, limit: null, tasks: [] }]);

    await t.throwsAsync(
      async () => {
        await createTask(
          board,
          status,
          {
            title: `Test task in ${status}`,
          },
          tasksDir,
          boardPath,
        );
      },
      {
        message: new RegExp(`Invalid starting status: "${status}"`),
      },
    );
  }
});
