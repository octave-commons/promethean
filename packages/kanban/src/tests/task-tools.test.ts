import test from 'ava';
import esmock from 'esmock';
import { readFileSync as realReadFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { compareTasks } from '../lib/task-tools.js';

const createBoardWorkspace = async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'kanban-tools-'));
  const boardDir = path.join(root, 'docs/agile/boards');
  const tasksDir = path.join(root, 'docs/agile/tasks');
  await mkdir(boardDir, { recursive: true });
  await mkdir(tasksDir, { recursive: true });

  const boardPath = path.join(boardDir, 'generated.md');
  const boardContent = [
    '- [[Task One|Task One]] (uuid:task-1)',
    '- [[Task Two|Task Two]] (uuid:task-2)',
  ].join('\n');
  await writeFile(boardPath, boardContent, 'utf8');

  const taskOne = `---
uuid: task-1
title: Task One
status: todo
priority: P1
labels: [backend, api]
---
- Implement feature A
- Document API changes
`;
  const taskTwo = `---
uuid: task-2
title: Task Two
status: in_progress
priority: P2
labels: [backend, refactor]
---
# Scope
- Refactor module
- Improve performance
`;
  await writeFile(path.join(tasksDir, 'Task One.md'), taskOne, 'utf8');
  await writeFile(path.join(tasksDir, 'Task Two.md'), taskTwo, 'utf8');

  return {
    root,
    boardPath,
    tasksDir,
    cleanup: async () => {
      await rm(root, { recursive: true, force: true });
    },
  };
};

test('compareTasks returns similarity insights', async (t) => {
  const workspace = await createBoardWorkspace();
  t.teardown(workspace.cleanup);

  const comparisons = await compareTasks(
    ['task-1', 'task-2'],
    workspace.boardPath,
    workspace.tasksDir,
  );

  t.true(comparisons.length > 0);
  const [first] = comparisons;
  t.truthy(first);
  if (!first) return;
  t.true(first.similarity >= 0);
  t.truthy(first.reasons.length);
});

const createFsStub = (root: string) => ({
  readFileSync: (filePath: string, options?: BufferEncoding | { encoding?: null; flag?: string }) => {
    const resolved = path.isAbsolute(filePath) ? filePath : path.join(root, filePath);
    if (typeof options === 'string' || options === undefined) {
      const encoding: BufferEncoding = typeof options === 'string' ? options : 'utf8';
      return realReadFileSync(resolved, { encoding });
    }
    return realReadFileSync(resolved, options);
  },
});

test.serial('suggestTaskBreakdown extracts subtasks and strategy', async (t) => {
  const workspace = await createBoardWorkspace();
  t.teardown(workspace.cleanup);

  const modulePath = fileURLToPath(new URL('../lib/task-tools.js', import.meta.url));
  const { suggestTaskBreakdown } = await esmock<typeof import('../lib/task-tools.js')>(modulePath, {
    fs: createFsStub(workspace.root),
  });
  t.teardown(() => esmock.purge(modulePath));

  const breakdown = await suggestTaskBreakdown('task-2');
  t.is(breakdown.originalTask.uuid, 'task-2');
  t.true(breakdown.subtasks.length > 0);
  t.truthy(breakdown.breakdownStrategy);
});

test.serial('prioritizeTasks produces priority scores', async (t) => {
  const workspace = await createBoardWorkspace();
  t.teardown(workspace.cleanup);

  const modulePath = fileURLToPath(new URL('../lib/task-tools.js', import.meta.url));
  const { prioritizeTasks } = await esmock<typeof import('../lib/task-tools.js')>(modulePath, {
    fs: createFsStub(workspace.root),
  });
  t.teardown(() => esmock.purge(modulePath));

  const priorities = await prioritizeTasks(['task-1', 'task-2']);
  t.is(priorities.length, 2);
  t.truthy(priorities[0]?.suggestedPriority);
});
