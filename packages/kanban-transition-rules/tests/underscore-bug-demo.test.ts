import test from 'ava';

import { columnKey as boardColumnKey } from '@promethean-os/kanban-sdk';
import { normalizeColumnName } from '../src/transition-rules-functional.js';

const COLUMN_CASES = [
  'in_progress',
  'in-progress',
  'in progress',
  'todo',
  'to_do',
  'to-do',
  'done',
  'in_review',
  'in review',
  'Document QA',
  'document-qa',
  'Document-qa',
  'Ready (QA)',
  'Ready QA',
  'ready-qa',
  'QA_ready',
  'QA Ready',
  'Follow-up 🧪',
  'Follow_up Tests',
  ' follow-up-tests ',
];

test('Transition rules normalization matches board columnKey()', (t) => {
  t.plan(COLUMN_CASES.length);

  for (const columnName of COLUMN_CASES) {
    const boardKey = boardColumnKey(columnName);
    const transitionKey = normalizeColumnName(columnName);

    t.is(
      transitionKey,
      boardKey,
      `Expected normalizeColumnName("${columnName}") to equal columnKey("${columnName}")`,
    );
  }
});
