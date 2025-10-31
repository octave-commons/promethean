#!/usr/bin/env node

import { serializeMarkdownBoard } from './dist/lib/serializers/board.js';

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

console.log('Testing serializeMarkdownBoard with test board...');
console.log('Input board:', JSON.stringify(testBoard, null, 2));

const result = serializeMarkdownBoard(testBoard);
console.log('\nSerialized output:');
console.log(result);
console.log('\nOutput length:', result.length);
