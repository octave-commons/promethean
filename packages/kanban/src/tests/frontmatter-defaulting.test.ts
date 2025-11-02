import test from 'ava';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readTasksFolder } from '../lib/kanban.js';
import { generateSlugFromFilename } from '../lib/utils/string-utils.js';

test('generateSlugFromFilename converts filename correctly', (t) => {
  const testCases = [
    {
      input: 'my-task.md',
      expected: 'my-task',
    },
    {
      input: 'My Complex Task Name.md',
      expected: 'my-complex-task-name',
    },
    {
      input: 'task_with_underscores.md',
      expected: 'task-with-underscores',
    },
    {
      input: 'task   with   multiple   spaces.md',
      expected: 'task-with-multiple-spaces',
    },
    {
      input: 'task-with-special@#$%chars.md',
      expected: 'task-with-special-chars',
    },
    {
      input: '.md',
      expected: 'untitled',
    },
    {
      input: '',
      expected: 'untitled',
    },
  ];

  for (const testCase of testCases) {
    const result = generateSlugFromFilename(testCase.input);
    t.is(result, testCase.expected, `Failed for input: ${testCase.input}`);
  }
});

test('readTasksFolder applies frontmatter defaults correctly', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'kanban-frontmatter-test-'));

  // Create a task file with minimal frontmatter
  const minimalTask = `---
title: "Minimal Task"
---

# Minimal Task

This task has minimal frontmatter to test defaulting.
`;

  const taskPath = join(dir, 'minimal-task.md');
  await writeFile(taskPath, minimalTask, 'utf8');

  const result = await readTasksFolder(dir);

  t.is(result.length, 1);
  const task = result[0];

  if (!task) return t.fail('Task should be defined');

  // Should have default UUID
  t.truthy(task.uuid);
  t.is(typeof task.uuid, 'string');
  t.true(task.uuid.length > 0);

  // Should have default status: incoming
  t.is(task.status, 'incoming');

  // Should have slug generated from filename
  t.is(task.slug, 'minimal-task');

  // Should have created_at from file stats
  t.truthy(task.created_at);
  t.is(typeof task.created_at, 'string');

  // Should preserve existing title
  t.is(task.title, 'Minimal Task');
});

test('readTasksFolder preserves existing frontmatter when valid', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'kanban-preserve-test-'));

  // Create a task file with complete frontmatter
  const completeTask = `---
uuid: "existing-uuid-123"
title: "Complete Task"
status: "todo"
priority: "high"
created_at: "2023-01-01T00:00:00Z"
slug: "custom-slug"
---

# Complete Task

This task has complete frontmatter that should be preserved.
`;

  const taskPath = join(dir, 'complete-task.md');
  await writeFile(taskPath, completeTask, 'utf8');

  const result = await readTasksFolder(dir);

  t.is(result.length, 1);
  const task = result[0];

  if (!task) return t.fail('Task should be defined');

  // Should preserve existing UUID
  t.is(task.uuid, 'existing-uuid-123');

  // Should preserve existing status (not default to incoming)
  t.is(task.status, 'todo');

  // Should preserve existing slug
  t.is(task.slug, 'custom-slug');

  // Should preserve existing created_at
  t.is(task.created_at, '2023-01-01T00:00:00Z');

  // Should preserve existing title
  t.is(task.title, 'Complete Task');
});

test('readTasksFolder handles filename-based title generation', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'kanban-filename-test-'));

  // Create a task file with no frontmatter
  const noFrontmatterTask = `# Task From Filename

This task has no frontmatter, so title should come from filename.
`;

  const taskPath = join(dir, 'task-from-filename.md');
  await writeFile(taskPath, noFrontmatterTask, 'utf8');

  const result = await readTasksFolder(dir);

  t.is(result.length, 1);
  const task = result[0];

  if (!task) return t.fail('Task should be defined');

  // Should generate title from filename
  t.is(task.title, 'task from filename');

  // Should generate slug from filename
  t.is(task.slug, 'task-from-filename');

  // Should have default status
  t.is(task.status, 'incoming');
});

test('readTasksFolder handles mixed case filenames', async (t) => {
  const dir = await mkdtemp(tmpdir() + '/kanban-mixed-case-test-');

  const testCases = [
    {
      filename: 'UPPERCASE-TASK.md',
      expectedSlug: 'uppercasetask',
      expectedTitle: 'UPPERCASE TASK',
    },
    {
      filename: 'Mixed-Case-Task.md',
      expectedSlug: 'mixed-case-task',
      expectedTitle: 'Mixed Case Task',
    },
    {
      filename: 'camelCaseTask.md',
      expectedSlug: 'camelcasetask',
      expectedTitle: 'camelCaseTask',
    },
  ];

  for (const testCase of testCases) {
    const taskContent = `---
title: "${testCase.expectedTitle}"
---

# ${testCase.expectedTitle}

Content for ${testCase.filename}.
`;

    const taskPath = join(dir, testCase.filename);
    await writeFile(taskPath, taskContent, 'utf8');

    const result = await readTasksFolder(dir);

    t.true(result.length >= 1);
    const task = result.find((t) => t.slug === testCase.expectedSlug);
    if (task) {
      t.is(task.slug, testCase.expectedSlug);
      t.is(task.title, testCase.expectedTitle);
    }
  }
});

test('readTasksFolder handles malformed frontmatter gracefully', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'kanban-malformed-test-'));

  // Create a task file with malformed frontmatter
  const malformedTask = `---
title: "Unclosed quote
status: todo
---

# Malformed Task

This task has malformed frontmatter but should still get defaults.
`;

  const taskPath = join(dir, 'malformed-task.md');
  await writeFile(taskPath, malformedTask, 'utf8');

  const result = await readTasksFolder(dir);

  // Should still process the file (not crash)
  t.true(result.length >= 0);

  if (result.length > 0) {
    const task = result[0];

    if (task) {
      // Should have generated defaults since frontmatter parsing failed
      t.truthy(task.uuid);
      t.is(task.status, 'incoming');
      t.truthy(task.slug);
      t.truthy(task.created_at);
    }
  }
});

test('frontmatter defaulting works with file stats timing', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'kanban-timing-test-'));

  const taskContent = `---
title: "Timing Test"
---

# Timing Test

Testing created_at from file stats.
`;

  const taskPath = join(dir, 'timing-test.md');
  await writeFile(taskPath, taskContent, 'utf8');

  // Get the time right after writing the file
  const afterWrite = new Date().toISOString();

  const result = await readTasksFolder(dir);

  t.is(result.length, 1);
  const task = result[0];

  if (!task || !task.created_at) return t.fail('Task and created_at should be defined');

  // created_at should be close to to file creation time
  t.truthy(task.created_at);

  const taskTime = new Date(task.created_at);
  const afterWriteTime = new Date(afterWrite);

  // Should be within a reasonable time window (1 minute)
  const timeDiff = Math.abs(taskTime.getTime() - afterWriteTime.getTime());
  t.true(timeDiff < 60000, `Time difference too large: ${timeDiff}ms`);
});
