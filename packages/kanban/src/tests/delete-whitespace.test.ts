import test from 'ava';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { deleteTask, toFrontmatter } from '../lib/kanban.js';
import type { Task } from '../lib/types.js';

const createTestTask = (): Task => ({
  uuid: 'test-uuid-123',
  title: 'Test Task',
  status: 'todo',
  priority: 'P2',
  labels: ['test'],
  created_at: '2025-10-13T00:00:00.000Z',
  estimates: {
    complexity: 0,
    scale: 0,
    time_to_completion: '0',
  },
  content: '', // Empty content to trigger the whitespace issue
});

test('toFrontmatter does not add extra whitespace when content is empty', (t) => {
  const task = createTestTask();

  // Test with empty content
  const result = toFrontmatter(task);

  // Should not have multiple consecutive newlines at the end
  t.false(result.endsWith('\n\n\n'), 'Should not end with multiple newlines');
  t.false(result.includes('---\n\n\n'), 'Should not have multiple newlines after frontmatter');

  // Should end with exactly one newline
  t.true(result.endsWith('\n'), 'Should end with exactly one newline');

  // Should not have empty lines between frontmatter and end when content is empty
  const lines = result.split('\n');
  const frontmatterEndIndex = lines.findIndex((line) => line === '---' && lines.indexOf(line) > 0);
  if (frontmatterEndIndex !== -1) {
    const remainingLines = lines.slice(frontmatterEndIndex + 1);
    // Should not have multiple empty lines at the end
    let emptyLinesAtEnd = 0;
    for (let i = remainingLines.length - 1; i >= 0; i--) {
      if (remainingLines[i] === '') {
        emptyLinesAtEnd++;
      } else {
        break;
      }
    }
    t.true(emptyLinesAtEnd <= 1, 'Should have at most one empty line at the end');
  }
});

test('toFrontmatter handles content with proper spacing', (t) => {
  const task = createTestTask();
  task.content = 'Some content here';

  const result = toFrontmatter(task);

  // Should have proper spacing when content exists
  t.true(result.includes('---\n\nSome content here'), 'Should have proper spacing with content');
  t.true(result.endsWith('\n'), 'Should end with exactly one newline');
});

test('deleteTask does not leave extra whitespace in remaining files', async (t) => {
  const tempDir = await mkdtemp(path.join(tmpdir(), 'kanban-delete-test-'));
  t.teardown(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  const tasksDir = path.join(tempDir, 'tasks');
  const boardPath = path.join(tempDir, 'board.md');

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  // Create a board with two tasks
  const board = {
    columns: [
      {
        name: 'Todo',
        count: 2,
        limit: null,
        tasks: [
          createTestTask(),
          {
            ...createTestTask(),
            uuid: 'test-uuid-456',
            title: 'Another Test Task',
          },
        ],
      },
    ],
  };

  // Create task files for both tasks
  const task1Path = path.join(tasksDir, 'Test Task.md');
  const task2Path = path.join(tasksDir, 'Another Test Task.md');

  await writeFile(task1Path, toFrontmatter(createTestTask()), 'utf8');
  await writeFile(
    task2Path,
    toFrontmatter({
      ...createTestTask(),
      uuid: 'test-uuid-456',
      title: 'Another Test Task',
    }),
    'utf8',
  );

  // Delete the first task
  const deleted = await deleteTask(board, 'test-uuid-123', tasksDir, boardPath);
  t.true(deleted);

  // Verify the deleted task file is removed
  await t.throwsAsync(fs.access(task1Path), { message: /ENOENT/ });

  // Verify the remaining task file doesn't have extra whitespace
  const remainingContent = await fs.readFile(task2Path, 'utf8');
  t.false(remainingContent.endsWith('\n\n\n'), 'Remaining task should not have extra whitespace');
  t.true(remainingContent.endsWith('\n'), 'Remaining task should end with single newline');

  // Verify board is updated
  const boardContent = await fs.readFile(boardPath, 'utf8');
  t.false(boardContent.includes('test-uuid-123'), 'Board should not contain deleted task');
  t.true(boardContent.includes('test-uuid-456'), 'Board should contain remaining task');
});
