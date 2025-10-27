import fs from 'fs/promises';
import path from 'path';

async function debugKanbanCreate() {
  console.log('🔍 Starting debug...');

  try {
    // Test 1: Basic imports
    console.log('1. Testing imports...');
    const { loadBoard } = await import('./packages/kanban/dist/lib/kanban.js');
    console.log('✅ Imports loaded');

    // Test 2: Board loading
    console.log('2. Testing board loading...');
    const boardFile = '/home/err/devel/promethean/docs/agile/boards/generated.md';
    const tasksDir = '/home/err/devel/promethean/docs/agile/tasks';

    const board = await loadBoard(boardFile, tasksDir);
    console.log('✅ Board loaded, columns:', board.columns.length);

    // Test 3: Task creation setup
    console.log('3. Testing task creation setup...');
    const { createTask } = await import('./packages/kanban/dist/lib/kanban.js');
    console.log('✅ createTask imported');

    // Test 4: Create task with minimal data
    console.log('4. Testing actual task creation...');
    const startTime = Date.now();

    const newTask = await createTask(
      board,
      'incoming',
      {
        title: 'Debug Test Task',
        content: 'Debug content',
        priority: 'P2',
      },
      tasksDir,
      boardFile,
    );

    const endTime = Date.now();
    console.log(`✅ Task created in ${endTime - startTime}ms`);
    console.log('Task UUID:', newTask.uuid);
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

debugKanbanCreate();
