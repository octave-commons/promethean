import test from 'ava';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  FileBasedTaskCache,
  TaskContentManager,
} from '../lib/task-content/index.js';

const INITIAL_MARKDOWN = `---
uuid: task-abc
title: Sample Task
status: todo
priority: P2
labels: [dev, backlog]
created_at: 2024-01-01T00:00:00.000Z
---
# Description
Original body content.
`;

const UPDATED_MARKDOWN = `---
uuid: task-abc
title: Updated Task
status: in_progress
priority: P1
labels: [dev, backlog, important]
created_at: 2024-01-01T00:00:00.000Z
---
# Description
Revised details.

## Notes
Additional context.
`;

const createWorkspace = async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'kanban-manager-'));
  const tasksDir = path.join(dir, 'tasks');
  await mkdir(tasksDir, { recursive: true });
  const filePath = path.join(tasksDir, 'Sample Task.md');
  await writeFile(filePath, INITIAL_MARKDOWN, 'utf8');
  return {
    dir,
    tasksDir,
    filePath,
    cleanup: async () => {
      await rm(dir, { recursive: true, force: true });
    },
  };
};

test('FileBasedTaskCache locates and reads tasks', async (t) => {
  const workspace = await createWorkspace();
  t.teardown(workspace.cleanup);

  const cache = new FileBasedTaskCache(workspace.tasksDir);
  const taskPath = await cache.getTaskPath('task-abc');
  t.truthy(taskPath);
  t.is(path.basename(taskPath ?? ''), 'Sample Task.md');

  const task = await cache.readTask('task-abc');
  t.truthy(task);
  t.is(task?.title, 'Sample Task');
  t.is(task?.status, 'todo');
});

test('FileBasedTaskCache writes task updates', async (t) => {
  const workspace = await createWorkspace();
  t.teardown(workspace.cleanup);

  const cache = new FileBasedTaskCache(workspace.tasksDir);
  const task = await cache.readTask('task-abc');
  t.truthy(task);

  await cache.writeTask({
    ...task!,
    title: 'Renamed Task',
    status: 'ready',
    content: '# Description\nChanged content.',
  });

  const updated = await cache.readTask('task-abc');
  t.is(updated?.title, 'Renamed Task');
  t.is(updated?.status, 'ready');
  const raw = await readFile(workspace.filePath, 'utf8');
  t.true(raw.includes('Renamed Task'));
  t.true(raw.includes('Changed content.'));
});

test('TaskContentManager.updateTaskBody validates and updates content', async (t) => {
  const workspace = await createWorkspace();
  t.teardown(workspace.cleanup);

  const cache = new FileBasedTaskCache(workspace.tasksDir);
  const manager = new TaskContentManager(cache);

  const result = await manager.updateTaskBody({
    uuid: 'task-abc',
    content: UPDATED_MARKDOWN,
    options: { createBackup: true },
  });

  t.true(result.success);
  t.truthy(result.sections.find((section) => section.header === 'Notes'));

  const raw = await readFile(workspace.filePath, 'utf8');
  t.true(raw.includes('Revised details.'));
  t.true(raw.includes('Sample Task')); // original frontmatter retained
});

test('TaskContentManager.updateTaskBody rejects invalid structure when requested', async (t) => {
  const workspace = await createWorkspace();
  t.teardown(workspace.cleanup);

  const cache = new FileBasedTaskCache(workspace.tasksDir);
  const manager = new TaskContentManager(cache);

  const result = await manager.updateTaskBody({
    uuid: 'task-abc',
    content: '# Missing metadata\n',
    options: { validateStructure: true },
  });

  t.false(result.success);
  t.is(result.error, 'Content validation failed');
});

test('TaskContentManager.updateTaskSection updates specific sections', async (t) => {
  const workspace = await createWorkspace();
  t.teardown(workspace.cleanup);

  const cache = new FileBasedTaskCache(workspace.tasksDir);
  const manager = new TaskContentManager(cache);

  const result = await manager.updateTaskSection({
    taskUuid: 'task-abc',
    sectionHeader: 'Description',
    newContent: 'Fresh details from manager.',
  });

  t.true(result.success);
  t.true(result.sections.some((section) => section.content.includes('Fresh details')));
});

test('TaskContentManager.getTaskSections returns parsed sections', async (t) => {
  const workspace = await createWorkspace();
  t.teardown(workspace.cleanup);

  const cache = new FileBasedTaskCache(workspace.tasksDir);
  const manager = new TaskContentManager(cache);

  const sections = await manager.getTaskSections('task-abc');
  t.is(sections.length, 1);
  t.is(sections[0]?.header, 'Description');
});

test('TaskContentManager.analyzeTaskContent produces metrics', async (t) => {
  const workspace = await createWorkspace();
  t.teardown(workspace.cleanup);

  const cache = new FileBasedTaskCache(workspace.tasksDir);
  const manager = new TaskContentManager(cache);

  const analysis = await manager.analyzeTaskContent('task-abc');
  t.truthy(analysis);
  t.true((analysis?.wordCount ?? 0) > 0);
  t.true((analysis?.sections.length ?? 0) > 0);
});
