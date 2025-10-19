#!/usr/bin/env node

// Simple test to verify the timestamp fix
import { indexedTaskToTask } from './packages/kanban/dist/board/task-operations.js';

console.log('Testing timestamp preservation fix...');

// Test 1: created_at should be preferred over created
const indexedTask1 = {
  id: 'test-uuid-123',
  uuid: 'test-uuid-123',
  title: 'Test Task',
  status: 'open',
  priority: 'medium',
  owner: 'test-owner',
  labels: ['test', 'timestamp'],
  created: '2023-01-01T00:00:00.000Z', // Older timestamp
  created_at: '2025-10-13T21:47:43.050Z', // Newer timestamp that should be preserved
  path: '/test/path.md',
  content: 'Test content',
};

const task1 = indexedTaskToTask(indexedTask1);
console.log('Test 1 - created_at should be preferred:');
console.log('  Expected: 2025-10-13T21:47:43.050Z');
console.log('  Actual:  ', task1.created_at);
console.log('  Pass:    ', task1.created_at === '2025-10-13T21:47:43.050Z' ? '✅' : '❌');

// Test 2: fallback to created when created_at is missing
const indexedTask2 = {
  id: 'test-uuid-456',
  uuid: 'test-uuid-456',
  title: 'Test Task 2',
  status: 'open',
  priority: 'high',
  owner: 'test-owner',
  labels: ['test', 'fallback'],
  created: '2023-06-15T12:30:00.000Z',
  created_at: undefined, // Missing created_at
  path: '/test/path2.md',
  content: 'Test content 2',
};

const task2 = indexedTaskToTask(indexedTask2);
console.log('\nTest 2 - fallback to created when created_at is missing:');
console.log('  Expected: 2023-06-15T12:30:00.000Z');
console.log('  Actual:  ', task2.created_at);
console.log('  Pass:    ', task2.created_at === '2023-06-15T12:30:00.000Z' ? '✅' : '❌');

console.log('\nAll tests completed!');
