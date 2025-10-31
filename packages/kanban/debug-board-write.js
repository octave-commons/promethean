#!/usr/bin/env node

import path from 'node:path';
import { writeFile, mkdir } from 'node:fs/promises';
import { writeBoard } from './dist/lib/serializers/board.js';

async function testBoardWrite() {
  const tempDir = '/tmp/kanban-write-test';
  const boardPath = path.join(tempDir, 'board.md');

  await mkdir(tempDir, { recursive: true });

  // Create a simple board with one task
  const board = {
    columns: [
      {
        name: 'Todo',
        count: 1,
        limit: null,
        tasks: [
          {
            uuid: 'test-uuid-123',
            title: 'Test Task',
            status: 'Todo',
            priority: undefined,
            labels: ['test'],
            created_at: '2025-10-31T01:00:00.000Z',
            estimates: {},
            content: 'Test content',
            slug: 'test-task',
          },
        ],
      },
    ],
    frontmatter: { 'kanban-plugin': 'board' },
    settings: { 'kanban-plugin': 'board' },
  };

  console.log('Writing board with task:', board.columns[0].tasks[0].title);

  try {
    await writeBoard(boardPath, board);
    console.log('Board written successfully');

    // Read it back
    const content = await readFile(boardPath, 'utf8');
    console.log('Board content:');
    console.log(content);
  } catch (error) {
    console.error('Board write failed:', error);
  }
}

testBoardWrite().catch(console.error);
