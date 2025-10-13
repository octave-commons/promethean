import path from 'node:path';
import { mkdir, writeFile, readdir } from 'node:fs/promises';

import test from 'ava';

import { createTask, loadBoard, regenerateBoard, pushToTasks } from '../lib/kanban.js';
import { withTempDir, makeBoard } from '../test-utils/helpers.js';

test('FAILING REPRODUCTION: Descriptive filenames with dots get duplicated with " 2.md" suffix', async (t) => {
  // This test reproduces the exact bug described in the issue by testing the root cause
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  // Create a task with descriptive name containing dots (like the observed pattern)
  const descriptiveTitle = 'implement-lmdb-cache-package';
  const timestamp = '2025.10.12.15.30.00';
  const fullTitle = `${timestamp}.${descriptiveTitle}`;

  const board = makeBoard([]);

  // Create the first task
  await createTask(
    board,
    'todo',
    { title: fullTitle, content: 'First task content' },
    tasksDir,
    boardPath,
  );

  // Now simulate the bug condition: create a board with tasks that have similar slugs
  // but different UUIDs, which triggers the ensureUniqueFileBase logic incorrectly
  const problematicBoard = makeBoard([
    {
      name: 'todo',
      count: 2,
      limit: null,
      tasks: [
        {
          uuid: 'uuid-1',
          title: fullTitle,
          status: 'todo',
          priority: 'P2',
          labels: ['kanban'],
          created_at: '2025-10-12T15:30:00.000Z',
          estimates: {},
          content: 'Content 1',
          slug: descriptiveTitle,
        },
        {
          uuid: 'uuid-2',
          title: fullTitle, // Same title!
          status: 'todo',
          priority: 'P2',
          labels: ['kanban'],
          created_at: '2025-10-12T15:30:00.000Z',
          estimates: {},
          content: 'Content 2',
          slug: descriptiveTitle, // Same slug! This should trigger duplication
        },
      ],
    },
  ]);

  // This pushToTasks operation should trigger the duplication bug
  await pushToTasks(problematicBoard, tasksDir);

  // Check files - this should FAIL because the bug creates duplicates
  const files = await readdir(tasksDir);
  const descriptiveFiles = files.filter(
    (file) => file.includes(descriptiveTitle) && file.endsWith('.md'),
  );

  // This assertion will FAIL due to the bug - it finds 2 files when it should handle duplicates properly
  t.is(
    descriptiveFiles.length,
    1,
    `BUG REPRODUCED: Expected 1 file for "${descriptiveTitle}" but found ${descriptiveFiles.length}: ${descriptiveFiles.join(', ')}`,
  );

  // Check for the specific " 2.md" duplication pattern
  const duplicateFiles = files.filter((file) => file.includes(' 2.md'));
  t.true(
    duplicateFiles.length === 0,
    `BUG REPRODUCED: Found files with " 2.md" suffix: ${duplicateFiles.join(', ')}`,
  );
});

test('FAILING REPRODUCTION: Pure numeric filenames do not get duplicated', async (t) => {
  // This test verifies that pure numeric filenames work correctly (control test)
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const board = makeBoard([]);

  // Create a task with pure numeric name (these should work correctly)
  const numericTitle = '20251011235145';

  await createTask(
    board,
    'todo',
    { title: numericTitle, content: 'Numeric task content' },
    tasksDir,
    boardPath,
  );

  // Simulate the operation that triggers duplication
  await regenerateBoard(tasksDir, boardPath);

  // Check files - this should PASS (numeric names work correctly)
  const files = await readdir(tasksDir);
  const numericFiles = files.filter((file) => file.includes(numericTitle) && file.endsWith('.md'));

  t.is(
    numericFiles.length,
    1,
    `Numeric filenames should work: Expected 1 file for "${numericTitle}" but found ${numericFiles.length}: ${numericFiles.join(', ')}`,
  );

  // Should not have any duplicates
  const duplicateFiles = files.filter((file) => file.includes(' 2.md'));
  t.true(
    duplicateFiles.length === 0,
    `Numeric filenames should not create duplicates: ${duplicateFiles.join(', ')}`,
  );
});

test('FAILING REPRODUCTION: Multiple duplication creates " 2 2.md" pattern', async (t) => {
  // This test reproduces the multiple duplication case
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const board = makeBoard([]);

  // Create a task that gets duplicated multiple times
  const problematicTitle = 'kanban-board-refinement-and-cleanup';

  await createTask(
    board,
    'todo',
    { title: problematicTitle, content: 'First task content' },
    tasksDir,
    boardPath,
  );

  // Simulate multiple operations that each trigger duplication
  await regenerateBoard(tasksDir, boardPath);
  await regenerateBoard(tasksDir, boardPath);
  await regenerateBoard(tasksDir, boardPath);

  // Check files - this should FAIL due to multiple duplications
  const files = await readdir(tasksDir);
  const problematicFiles = files.filter(
    (file) => file.includes(problematicTitle) && file.endsWith('.md'),
  );

  // This assertion will FAIL - it expects 1 but finds multiple including " 2 2.md"
  t.is(
    problematicFiles.length,
    1,
    `BUG REPRODUCED: Expected 1 file for "${problematicTitle}" but found ${problematicFiles.length}: ${problematicFiles.join(', ')}`,
  );

  // Check for the specific " 2 2.md" pattern
  const doubleDuplicateFiles = files.filter((file) => file.includes(' 2 2.md'));
  t.true(
    doubleDuplicateFiles.length === 0,
    `BUG REPRODUCED: Found files with " 2 2.md" pattern: ${doubleDuplicateFiles.join(', ')}`,
  );
});

test('FAILING REPRODUCTION: pushToTasks operation triggers descriptive filename duplication', async (t) => {
  // This test specifically targets the pushToTasks function
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  // Create a board with a task that has descriptive filename
  const descriptiveTitle = 'migrate-kanban-to-lmdb-cache';
  const timestamp = '2025.10.12.16.00.00';
  const fullTitle = `${timestamp}.${descriptiveTitle}`;

  const board = makeBoard([
    {
      name: 'todo',
      count: 1,
      limit: null,
      tasks: [
        {
          uuid: 'test-uuid-12345',
          title: fullTitle,
          status: 'todo',
          priority: 'P2',
          labels: ['kanban'],
          created_at: '2025-10-12T16:00:00.000Z',
          estimates: {},
          content: 'Test content',
          slug: fullTitle,
        },
      ],
    },
  ]);

  // This operation should trigger the duplication bug
  await pushToTasks(board, tasksDir);

  // Check files - this should FAIL due to the bug in pushToTasks
  const files = await readdir(tasksDir);
  const descriptiveFiles = files.filter(
    (file) => file.includes(descriptiveTitle) && file.endsWith('.md'),
  );

  t.is(
    descriptiveFiles.length,
    1,
    `BUG REPRODUCED in pushToTasks: Expected 1 file for "${descriptiveTitle}" but found ${descriptiveFiles.length}: ${descriptiveFiles.join(', ')}`,
  );

  const duplicateFiles = files.filter((file) => file.includes(' 2.md'));
  t.true(
    duplicateFiles.length === 0,
    `BUG REPRODUCED in pushToTasks: Found files with " 2.md" suffix: ${duplicateFiles.join(', ')}`,
  );
});

test('FAILING REPRODUCTION: Complex descriptive names with special characters get duplicated', async (t) => {
  // Test with complex filenames that contain various patterns
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const board = makeBoard([]);

  // Create tasks with various complex descriptive names that were observed to duplicate
  const complexTitles = [
    '2025.10.12.16.15.00-fix-template-injection-vulnerability-applyTemplateReplacements',
    '2025.10.12.16.20.00-add-missing-authorization-mcp-tools',
    '2025.10.12.16.40.00-add-performance-monitoring-optimization',
  ];

  for (const title of complexTitles) {
    await createTask(
      board,
      'todo',
      { title, content: `Content for ${title}` },
      tasksDir,
      boardPath,
    );
  }

  // Trigger the duplication
  await regenerateBoard(tasksDir, boardPath);

  // Check files - this should FAIL for complex descriptive names
  const files = await readdir(tasksDir);
  const duplicateFiles = files.filter((file) => file.includes(' 2.md'));

  t.true(
    duplicateFiles.length === 0,
    `BUG REPRODUCED: Complex descriptive names created duplicates: ${duplicateFiles.join(', ')}`,
  );

  // Each title should have exactly one file
  for (const title of complexTitles) {
    const titleFiles = files.filter(
      (file) => file.includes(title.replace(/^[\d.]+\./, '')) && file.endsWith('.md'),
    );
    t.is(
      titleFiles.length,
      1,
      `BUG REPRODUCED: Title "${title}" has ${titleFiles.length} files instead of 1: ${titleFiles.join(', ')}`,
    );
  }
});

test('FAILING REPRODUCTION: Mixed filename types show inconsistent behavior', async (t) => {
  // This test shows that the bug affects descriptive names but not numeric ones
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const board = makeBoard([]);

  // Create both types of tasks
  const descriptiveTitle = '2025.10.12.15.30.00.implement-lmdb-cache-package';
  const numericTitle = '20251011235145';

  await createTask(
    board,
    'todo',
    { title: descriptiveTitle, content: 'Descriptive content' },
    tasksDir,
    boardPath,
  );

  await createTask(
    board,
    'todo',
    { title: numericTitle, content: 'Numeric content' },
    tasksDir,
    boardPath,
  );

  // Trigger the duplication
  await regenerateBoard(tasksDir, boardPath);

  const files = await readdir(tasksDir);

  // Numeric should work fine (1 file)
  const numericFiles = files.filter((file) => file.includes(numericTitle));
  t.is(
    numericFiles.length,
    1,
    `Numeric files should work: found ${numericFiles.length} for ${numericTitle}`,
  );

  // Descriptive should fail (creates duplicates)
  const descriptiveFiles = files.filter((file) => file.includes('implement-lmdb-cache-package'));
  t.is(
    descriptiveFiles.length,
    1,
    `BUG REPRODUCED: Descriptive files duplicated: found ${descriptiveFiles.length} for implement-lmdb-cache-package: ${descriptiveFiles.join(', ')}`,
  );

  const duplicateFiles = files.filter((file) => file.includes(' 2.md'));
  t.true(
    duplicateFiles.length === 0,
    `BUG REPRODUCED: Found ${duplicateFiles.length} files with " 2.md" suffix: ${duplicateFiles.join(', ')}`,
  );
});

test('FAILING REPRODUCTION: Board load and save cycle creates duplicates', async (t) => {
  // Test the specific cycle that causes the issue
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const board = makeBoard([]);

  // Create a descriptive task
  const descriptiveTitle = 'test-descriptive-task-for-duplication';
  await createTask(
    board,
    'todo',
    { title: descriptiveTitle, content: 'Test content' },
    tasksDir,
    boardPath,
  );

  // Simulate the load -> modify -> save cycle that triggers duplication
  await loadBoard(boardPath, tasksDir);
  await regenerateBoard(tasksDir, boardPath);

  // This should FAIL due to duplication during the cycle
  const files = await readdir(tasksDir);
  const taskFiles = files.filter((file) => file.includes(descriptiveTitle) && file.endsWith('.md'));

  t.is(
    taskFiles.length,
    1,
    `BUG REPRODUCED: Load/save cycle created ${taskFiles.length} files for "${descriptiveTitle}": ${taskFiles.join(', ')}`,
  );

  const duplicateFiles = files.filter((file) => file.includes(' 2.md'));
  t.true(
    duplicateFiles.length === 0,
    `BUG REPRODUCED: Load/save cycle created duplicates: ${duplicateFiles.join(', ')}`,
  );
});
