import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

import test from 'ava';

import { indexedTaskToTask } from '../board/task-operations.js';
import { readTasksFolder } from '../lib/kanban.js';
import { withTempDir } from '../test-utils/helpers.js';
import type { IndexedTask } from '../board/types.js';

test('indexedTaskToTask preserves created_at timestamp correctly', async (t) => {
  // Create an IndexedTask with both created and created_at fields
  const indexedTask: IndexedTask = {
    id: 'test-uuid-123',
    uuid: 'test-uuid-123',
    title: 'Test Task',
    status: 'open',
    priority: 'medium',
    owner: 'test-owner',
    labels: ['test', 'timestamp'],
    created: '2023-01-01T00:00:00.000Z', // Older timestamp
    created_at: '2025-10-13T21:47:43.050Z', // Newer timestamp that should be preserved
    path: '/test/path.md',
    content: 'Test content',
  };

  const task = indexedTaskToTask(indexedTask);

  // The task should prefer created_at over created
  t.is(task.created_at, '2025-10-13T21:47:43.050Z');
  t.is(task.uuid, 'test-uuid-123');
  t.is(task.title, 'Test Task');
});

test('indexedTaskToTask falls back to created when created_at is missing', async (t) => {
  // Create an IndexedTask with only created field
  const indexedTask: IndexedTask = {
    id: 'test-uuid-456',
    uuid: 'test-uuid-456',
    title: 'Test Task 2',
    status: 'open',
    priority: 'high',
    owner: 'test-owner',
    labels: ['test', 'fallback'],
    created: '2023-06-15T12:30:00.000Z',
    created_at: undefined, // Missing created_at
    path: '/test/path2.md',
    content: 'Test content 2',
  };

  const task = indexedTaskToTask(indexedTask);

  // The task should fall back to created when created_at is missing
  t.is(task.created_at, '2023-06-15T12:30:00.000Z');
});

test('task file preserves created_at during read and write operations', async (t) => {
  const tempDir = await withTempDir(t);
  const tasksDir = path.join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });

  const originalCreatedAt = '2025-01-01T10:00:00.000Z';
  const taskContent = `---
title: "Timestamp Test Task"
uuid: "timestamp-test-123"
status: "todo"
priority: "medium"
created_at: "${originalCreatedAt}"
labels:
  - test
  - timestamp
---

# Timestamp Test Task

This is a test task to verify created_at timestamp preservation.

## ⛓️ Blocked By

Nothing

## ⛓️ Blocks

Nothing
`;

  const taskPath = path.join(tasksDir, 'timestamp-test-task.md');
  await writeFile(taskPath, taskContent, 'utf8');

  // Read the task back
  const tasks = await readTasksFolder(tasksDir);
  t.is(tasks.length, 1);

  const readTask = tasks[0];
  if (!readTask) {
    t.fail('Task should be found');
    return;
  }
  t.is(readTask.created_at, originalCreatedAt);
  t.is(readTask.title, 'Timestamp Test Task');
  t.is(readTask.uuid, 'timestamp-test-123');
});
