import test from 'ava';

import {
  analyzeColumnNormalization,
  applyColumnNormalization,
} from '../lib/pantheon/column-normalizer.js';
import type { Board } from '../lib/types.js';

const buildBoard = (columns: Array<{ name: string; limit?: number | null; tasks: string[] }>): Board => ({
  columns: columns.map(({ name, limit = null, tasks }) => ({
    name,
    limit,
    count: tasks.length,
    tasks: tasks.map((title, index) => ({
      uuid: `${name}-${index}`,
      title,
      status: name,
    })),
  })),
});

test('analyzeColumnNormalization detects review aliases', async (t) => {
  const analysis = await analyzeColumnNormalization(
    ['Review', 'In_Review', 'QA Review'],
    ['todo', 'in_progress', 'review', 'done'],
  );

  t.true(analysis.groups.length > 0);
  const reviewGroup = analysis.groups.find((group) => group.canonicalKey === 'review');
  t.truthy(reviewGroup);
  if (!reviewGroup) return;
  t.deepEqual(
    reviewGroup.members.map((member) => member.action).sort(),
    ['keep', 'merge', 'merge'],
  );
});

test('applyColumnNormalization merges duplicate review columns', async (t) => {
  const board = buildBoard([
    { name: 'Review', tasks: ['Task A'] },
    { name: 'In_Review', tasks: ['Task B'] },
  ]);

  const analysis = await analyzeColumnNormalization(
    board.columns.map((col) => col.name),
    ['todo', 'in_progress', 'review', 'done'],
  );

  const changes = applyColumnNormalization(board, analysis);
  t.true(changes > 0);
  t.is(board.columns.length, 1);
  const [reviewColumn] = board.columns;
  t.truthy(reviewColumn);
  if (!reviewColumn) return;
  t.is(reviewColumn.name, 'Review');
  t.is(reviewColumn.tasks.length, 2);
  t.true(reviewColumn.tasks.every((task) => task.status === 'Review'));
});

test('applyColumnNormalization renames lone alias when canonical missing', async (t) => {
  const board = buildBoard([
    { name: 'Ready_For_Review', tasks: ['Task C'] },
  ]);

  const analysis = await analyzeColumnNormalization(
    board.columns.map((col) => col.name),
    ['ready', 'review', 'done'],
  );

  const changes = applyColumnNormalization(board, analysis);
  t.true(changes > 0);
  t.is(board.columns.length, 1);
  const [renamedColumn] = board.columns;
  t.truthy(renamedColumn);
  if (!renamedColumn) return;
  t.is(renamedColumn.name, 'Review');
  t.true(renamedColumn.tasks.every((task) => task.status === 'Review'));
});
