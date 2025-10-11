import test from 'ava';
import { access, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { TaskLifecycleManager } from '../lib/task-content/lifecycle.js';

type StoredTask = {
  uuid: string;
  slug: string;
  title: string;
  status: string;
  content: string;
  sourcePath: string;
};

const createLifecycleTestContext = async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'kanban-lifecycle-test-'));
  const tasksDir = path.join(root, 'tasks');
  const archiveDir = path.join(root, 'archive');
  await mkdir(tasksDir, { recursive: true });

  const store = new Map<string, StoredTask>();

  const createTask = async (uuid: string, title: string, status: string, body: string) => {
    const slug = title.toLowerCase().replace(/\s+/g, '-');
    const filePath = path.join(tasksDir, `${slug}.md`);
    const content = `---
uuid: ${uuid}
title: ${JSON.stringify(title)}
status: ${status}
---
# Description
${body}
`;
    await writeFile(filePath, content, 'utf8');
    const task: StoredTask = { uuid, slug, title, status, content, sourcePath: filePath };
    store.set(uuid, task);
    return task;
  };

  const cache = {
    readTask: async (uuid: string) => {
      const task = store.get(uuid);
      return task ? { ...task } : null;
    },
    writeTask: async (task: StoredTask) => {
      store.set(task.uuid, { ...store.get(task.uuid), ...task });
    },
    backupTask: async (uuid: string) => {
      const task = store.get(uuid);
      if (!task) throw new Error('Task not found for backup');
      const backupPath = path.join(root, `${uuid}.backup.md`);
      await writeFile(backupPath, task.content, 'utf8');
      return backupPath;
    },
  };

  const manager = new TaskLifecycleManager({ cache } as any, tasksDir, archiveDir);

  return {
    root,
    tasksDir,
    archiveDir,
    cache,
    manager,
    createTask,
    getTask: (uuid: string) => store.get(uuid),
    cleanup: async () => {
      await rm(root, { recursive: true, force: true });
    },
  };
};

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await access(filePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
};

test('archiveTask moves task into archive directory and updates cache', async (t) => {
  const ctx = await createLifecycleTestContext();
  t.teardown(ctx.cleanup);

  const task = await ctx.createTask('task-1', 'Archive Target', 'todo', 'Body content');
  const result = await ctx.manager.archiveTask({
    uuid: task.uuid,
    reason: 'Cleanup',
    options: { updateTimestamp: false },
  });

  t.true(result.success);
  t.truthy(result.archiveLocation);
  t.true(await fileExists(result.archiveLocation!));
  t.is(ctx.getTask('task-1')?.status, 'archived');
  t.true((await readFile(result.archiveLocation!, 'utf8')).includes('Body content'));
});

test('archiveTask supports dry run mode without touching files', async (t) => {
  const ctx = await createLifecycleTestContext();
  t.teardown(ctx.cleanup);

  const task = await ctx.createTask('task-2', 'Archive Dry Run', 'todo', 'Dry-run content');
  const result = await ctx.manager.archiveTask({
    uuid: task.uuid,
    options: { dryRun: true },
  });

  t.true(result.success);
  t.truthy(result.archiveLocation);
  t.false(await fileExists(result.archiveLocation!));
  t.is(ctx.getTask('task-2')?.status, 'todo');
});

test('deleteTask requires confirmation unless forced', async (t) => {
  const ctx = await createLifecycleTestContext();
  t.teardown(ctx.cleanup);

  await ctx.createTask('task-3', 'Delete Protected', 'todo', 'Cannot delete yet');
  const result = await ctx.manager.deleteTask({ uuid: 'task-3', confirm: false });

  t.false(result.success);
  t.true(result.error?.includes('requires confirmation'));
  t.true(await fileExists(ctx.getTask('task-3')!.sourcePath));
});

test('deleteTask removes file and records backup metadata', async (t) => {
  const ctx = await createLifecycleTestContext();
  t.teardown(ctx.cleanup);

  const task = await ctx.createTask('task-4', 'Delete Confirmed', 'todo', 'To be deleted');
  const result = await ctx.manager.deleteTask({
    uuid: task.uuid,
    confirm: true,
    options: { createBackup: true },
  });

  t.true(result.success);
  t.true(result.deleted);
  t.false(await fileExists(task.sourcePath));
  t.truthy(result.metadata.backupLocation);
  t.truthy(await fileExists(result.metadata.backupLocation!));
});

test('mergeTasks appends content from sources into target', async (t) => {
  const ctx = await createLifecycleTestContext();
  t.teardown(ctx.cleanup);

  const target = await ctx.createTask('task-5', 'Target', 'todo', 'Initial body');
  await ctx.createTask('task-6', 'Source Task', 'todo', 'Source body');

  const result = await ctx.manager.mergeTasks({
    sourceUuids: ['task-6'],
    targetUuid: target.uuid,
    mergeStrategy: 'append',
    options: { updateTimestamp: false },
  });

  t.true(result.success);
  const merged = ctx.getTask('task-5');
  t.truthy(merged?.content.includes('Source body'));
});

test('mergeTasks reports missing source tasks', async (t) => {
  const ctx = await createLifecycleTestContext();
  t.teardown(ctx.cleanup);

  await ctx.createTask('task-7', 'Target', 'todo', 'Initial');
  const result = await ctx.manager.mergeTasks({
    sourceUuids: ['missing-uuid'],
    targetUuid: 'task-7',
    mergeStrategy: 'append',
  });

  t.false(result.success);
  t.true(result.error?.includes('not found'));
});

test('bulkArchive and bulkDelete process multiple tasks', async (t) => {
  const ctx = await createLifecycleTestContext();
  t.teardown(ctx.cleanup);

  await ctx.createTask('task-8', 'Bulk A', 'todo', 'One');
  await ctx.createTask('task-9', 'Bulk B', 'todo', 'Two');

  const archiveResults = await ctx.manager.bulkArchive(['task-8', 'task-9'], 'Bulk cleanup', {
    dryRun: true,
  });
  t.is(archiveResults.length, 2);
  t.true(archiveResults.every((result) => result.success));

  const deleteResults = await ctx.manager.bulkDelete(['task-8', 'task-9'], true, false, {
    dryRun: true,
  });
  t.is(deleteResults.length, 2);
  t.true(deleteResults.every((result) => result.success));
});
