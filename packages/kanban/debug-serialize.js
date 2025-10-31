#!/usr/bin/env node

import { writeBoard } from './dist/lib/serializers/board.js';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

// Test board with tasks
const testBoard = {
  columns: [
    {
      name: 'Todo',
      count: 2,
      limit: null,
      tasks: [
        {
          uuid: 'test-uuid-1',
          title: 'Test Task 1',
          status: 'Todo',
          labels: ['test'],
          created_at: '2025-10-31T01:45:53.518Z',
          estimates: { complexity: '', scale: '', time_to_completion: '' },
          content: 'Test content 1',
          slug: 'Test Task 1',
        },
        {
          uuid: 'test-uuid-2',
          title: 'Test Task 2',
          status: 'Todo',
          labels: ['test2'],
          created_at: '2025-10-31T01:45:53.530Z',
          estimates: { complexity: '', scale: '', time_to_completion: '' },
          content: 'Test content 2',
          slug: 'Test Task 2',
        },
      ],
    },
  ],
};

console.log('Testing writeBoard with test board...');
console.log('Input board:', JSON.stringify(testBoard, null, 2));

const testDir = '/tmp/kanban-serialize-test';
const testBoardPath = path.join(testDir, 'test-board.md');

await mkdir(testDir, { recursive: true });

try {
  await writeBoard(testBoardPath, testBoard);
  console.log('\nBoard file written successfully to:', testBoardPath);

  // Read back and display
  const content = await readFile(testBoardPath, 'utf8');
  console.log('\nBoard content:');
  console.log(content);
  console.log('\nContent length:', content.length);
} catch (error) {
  console.error('Error:', error);
}
