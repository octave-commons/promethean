import test from 'ava';

import { renderBoardHtml } from '../render.js';
import type { Board } from '../../lib/types.js';

const makeBoard = (overrides?: Partial<Board>): Board => ({
  columns: [],
  ...overrides,
});

test('renderBoardHtml renders columns and tasks', (t) => {
  const board = makeBoard({
    columns: [
      {
        name: 'Todo',
        count: 1,
        limit: null,
        tasks: [
          {
            uuid: 'abc-123',
            title: 'Implement Kanban UI',
            status: 'Todo',
            priority: 'P1',
            labels: ['kanban', 'ui'],
            created_at: '2025-10-03T00:00:00.000Z',
            estimates: { complexity: 2, scale: 3 },
            content: 'Create a small dashboard',
          },
        ],
      },
    ],
  });
  const html = renderBoardHtml(board);
  t.true(html.includes('Implement Kanban UI'));
  t.true(html.includes('kanban'));
  t.true(html.includes('Total tasks'));
});

test('renderBoardHtml escapes HTML-sensitive content', (t) => {
  const board = makeBoard({
    columns: [
      {
        name: '<Todo>',
        count: 1,
        limit: null,
        tasks: [
          {
            uuid: 'uuid-1',
            title: '<script>bad()</script>',
            status: 'Todo',
            priority: 'P2',
            labels: ['<alert>'],
            created_at: 'invalid',
          },
        ],
      },
    ],
  });
  const html = renderBoardHtml(board);
  t.false(html.includes('<script>'));
  t.true(html.includes('&lt;script&gt;bad()&lt;/script&gt;'));
  t.true(html.includes('&lt;Todo&gt;'));
});

test('renderBoardHtml renders placeholder for empty columns', (t) => {
  const board = makeBoard({
    columns: [
      {
        name: 'In Review',
        count: 0,
        limit: 2,
        tasks: [],
      },
    ],
  });
  const html = renderBoardHtml(board);
  t.true(html.includes('No tasks yet.'));
});

test('renderBoardHtml includes interactive controls when enabled', (t) => {
  const board = makeBoard({
    columns: [
      {
        name: 'Doing',
        count: 1,
        limit: null,
        tasks: [
          {
            uuid: 'task-123',
            title: 'Interactive task',
            status: 'Doing',
          },
        ],
      },
    ],
  });
  const html = renderBoardHtml(board, {
    interactive: true,
    selectedTaskId: 'task-123',
  });
  t.true(html.includes('data-command="move_up"'));
  t.true(html.includes('data-command="update_status"'));
  t.true(html.includes('is-selected'));
});
