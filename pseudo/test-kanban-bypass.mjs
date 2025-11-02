#!/usr/bin/env node

import { createTask } from './packages/kanban/dist/lib/kanban.js';
import { loadBoard } from './packages/kanban/dist/lib/kanban.js';

async function testCreate() {
  try {
    console.log('Testing task creation...');

    const boardFile = '/home/err/devel/promethean/docs/agile/boards/generated.md';
    const tasksDir = '/home/err/devel/promethean/docs/agile/tasks';

    // Load existing board
    const board = await loadBoard(boardFile, tasksDir);
    console.log('✅ Board loaded');

    // Create task
    const newTask = await createTask(
      board,
      'incoming',
      {
        title: 'Test task from bypass script',
        content: 'This is a test task',
        priority: 'P2',
      },
      tasksDir,
      boardFile,
    );

    console.log('✅ Task created successfully:');
    console.log('  Title:', newTask.title);
    console.log('  UUID:', newTask.uuid);
    console.log('  Status:', newTask.status);
  } catch (error) {
    console.error('❌ Task creation failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testCreate();
