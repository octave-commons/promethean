import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import test from 'ava';
import { loadBoard } from '../lib/kanban.js';
import { withTempDir } from '../test-utils/helpers.js';

test('loadBoard correctly parses hyphenated labels without duplication', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });

  // Create a board with hyphenated labels
  const boardContent = `## Todo

- [ ] [[task-1|Test task with quality control]] #quality-control prio:P2 (uuid:123)
- [ ] [[task-2|Test with tool codex]] #tool:codex (uuid:456)
- [ ] [[task-3|Test with env no egress]] #env:no-egress (uuid:789)
`;

  await writeFile(boardPath, boardContent, 'utf8');

  const board = await loadBoard(boardPath, tasksDir);

  t.is(board.columns.length, 1);
  t.is(board.columns[0]?.tasks.length, 3);

  // Check that titles are clean without dangling label parts
  t.is(board.columns[0]?.tasks[0]?.title, 'Test task with quality control');
  t.is(board.columns[0]?.tasks[1]?.title, 'Test with tool codex');
  t.is(board.columns[0]?.tasks[2]?.title, 'Test with env no egress');

  // Check that labels are correctly extracted
  t.deepEqual(board.columns[0]?.tasks[0]?.labels, ['quality-control']);
  t.deepEqual(board.columns[0]?.tasks[1]?.labels, ['tool:codex']);
  t.deepEqual(board.columns[0]?.tasks[2]?.labels, ['env:no-egress']);
});

test('loadBoard handles complex label combinations', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });

  const boardContent = `## Todo

- [ ] [[complex|Complex task]] #security #critical #CVE-2024-1144 #tool:writefilecontent prio:P0 (uuid:complex)
`;

  await writeFile(boardPath, boardContent, 'utf8');

  const board = await loadBoard(boardPath, tasksDir);

  t.is(board.columns.length, 1);
  t.is(board.columns[0]?.tasks.length, 1);

  // Title should be clean without any label remnants
  t.is(board.columns[0]?.tasks[0]?.title, 'Complex task');

  // All labels should be extracted correctly
  t.deepEqual(board.columns[0]?.tasks[0]?.labels, [
    'security',
    'critical',
    'CVE-2024-1144',
    'tool:writefilecontent',
  ]);
  t.is(board.columns[0]?.tasks[0]?.priority, 'P0');
});

test('loadBoard handles edge case labels', async (t) => {
  const tempDir = await withTempDir(t);
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });

  const boardContent = `## Todo

- [ ] [[edge|Edge case with underscores]] #test_label #another_test (uuid:edge)
- [ ] [[numeric|Numeric labels]] #p1 #version-2.0 #123test (uuid:numeric)
`;

  await writeFile(boardPath, boardContent, 'utf8');

  const board = await loadBoard(boardPath, tasksDir);

  t.is(board.columns.length, 1);
  t.is(board.columns[0]?.tasks.length, 2);

  // Titles should be clean
  t.is(board.columns[0]?.tasks[0]?.title, 'Edge case with underscores');
  t.is(board.columns[0]?.tasks[1]?.title, 'Numeric labels');

  // Labels should be extracted correctly
  t.deepEqual(board.columns[0]?.tasks[0]?.labels, ['test_label', 'another_test']);
  t.deepEqual(board.columns[0]?.tasks[1]?.labels, ['p1', 'version-2.0', '123test']);
});
