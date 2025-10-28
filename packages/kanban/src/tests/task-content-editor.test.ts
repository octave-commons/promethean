import test from 'ava';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  getTaskSection,
  getTaskSections,
  updateTaskBody,
  updateTaskSection,
} from '../lib/task-content/editor.js';
import { parseTaskContent } from '../lib/task-content/parser.js';

type MockTask = {
  uuid: string;
  slug: string;
  status: string;
  title: string;
  sourcePath: string;
  content: string;
};

const INITIAL_CONTENT = `---
uuid: task-123
title: Original Task
status: todo
labels:
  - backlog
---
# Description
Initial details.

## Notes
Some context.
`;

const createEditorTestContext = async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'kanban-editor-test-'));
  const filePath = path.join(dir, 'task.md');
  await writeFile(filePath, INITIAL_CONTENT, 'utf8');

  let task: MockTask = {
    uuid: 'task-123',
    slug: 'original-task',
    status: 'todo',
    title: 'Original Task',
    sourcePath: filePath,
    content: INITIAL_CONTENT,
  };

  const cache = {
    readTask: async (uuid: string) => (uuid === task.uuid ? { ...task } : null),
    writeTask: async (updated: MockTask) => {
      task = { ...task, ...updated };
    },
    backupTask: async (uuid: string) => {
      if (uuid !== task.uuid) throw new Error('unexpected uuid');
      const backupPath = path.join(dir, `${uuid}.backup.md`);
      await writeFile(backupPath, task.content, 'utf8');
      return backupPath;
    },
  };

  return {
    dir,
    filePath,
    cache,
    getTask: () => task,
    cleanup: async () => {
      await rm(dir, { recursive: true, force: true });
    },
  };
};

test('updateTaskBody replaces content and creates backup', async (t) => {
  const ctx = await createEditorTestContext();
  t.teardown(ctx.cleanup);

  const updatedContent = `---
uuid: task-123
title: Updated Task
status: doing
---
# Description
Updated content.
`;

  const result = await updateTaskBody(ctx.cache, {
    uuid: 'task-123',
    content: updatedContent,
  });

  t.true(result.success);
  t.truthy(result.backupPath);
  const persisted = await readFile(ctx.filePath, 'utf8');
  t.is(persisted, updatedContent);
  t.is(ctx.getTask().content, updatedContent);
});

test('updateTaskBody preserves existing frontmatter when requested', async (t) => {
  const ctx = await createEditorTestContext();
  t.teardown(ctx.cleanup);

  const newContent = `---
status: in-progress
labels:
  - backlog
  - enhancements
---
# Description
Revised details.
`;

  const result = await updateTaskBody(ctx.cache, {
    uuid: 'task-123',
    content: newContent,
    options: {
      preserveFrontmatter: true,
      updateTimestamp: false,
    },
  });

  t.true(result.success);
  const parsed = parseTaskContent(await readFile(ctx.filePath, 'utf8'));
  t.is(parsed.frontmatter.uuid, 'task-123');
  t.is(parsed.frontmatter.status, 'in-progress');
  t.deepEqual(parsed.frontmatter.labels, ['backlog', 'enhancements']);
});

test('updateTaskBody fails validation when structure invalid', async (t) => {
  const ctx = await createEditorTestContext();
  t.teardown(ctx.cleanup);

  const invalidContent = '# Missing frontmatter\n';
  const result = await updateTaskBody(ctx.cache, {
    uuid: 'task-123',
    content: invalidContent,
  });

  t.false(result.success);
  t.true(result.error?.includes('Content validation failed'));
});

test('updateTaskSection rewrites target section and updates cache', async (t) => {
  const ctx = await createEditorTestContext();
  t.teardown(ctx.cleanup);

  const result = await updateTaskSection(ctx.cache, {
    taskUuid: 'task-123',
    sectionHeader: 'Description',
    newContent: 'Refined details for the task.',
    options: { updateTimestamp: false },
  });

  t.true(result.success);
  const persisted = await readFile(ctx.filePath, 'utf8');
  t.true(persisted.includes('Refined details for the task.'));
  t.is(ctx.getTask().content, persisted);
});

test('updateTaskSection returns failure when section missing', async (t) => {
  const ctx = await createEditorTestContext();
  t.teardown(ctx.cleanup);

  const result = await updateTaskSection(ctx.cache, {
    taskUuid: 'task-123',
    sectionHeader: 'Nonexistent',
    newContent: 'N/A',
  });

  t.false(result.success);
  t.true(result.error?.includes('Section not found'));
});

test('getTaskSections returns parsed sections', async (t) => {
  const ctx = await createEditorTestContext();
  t.teardown(ctx.cleanup);

  const sections = await getTaskSections(ctx.cache, 'task-123');
  t.is(sections.length, 2);
  t.true(sections.some((section) => section.header === 'Description'));
});

test('getTaskSection returns specific section or null', async (t) => {
  const ctx = await createEditorTestContext();
  t.teardown(ctx.cleanup);

  const description = await getTaskSection(ctx.cache, 'task-123', 'description');
  t.truthy(description);
  const missing = await getTaskSection(ctx.cache, 'task-123', 'acceptance');
  t.is(missing, null);
});
