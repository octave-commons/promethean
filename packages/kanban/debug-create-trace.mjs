#!/usr/bin/env node

import { createTask } from './dist/lib/kanban.js';
import { loadBoard } from './dist/lib/kanban.js';
import { loadKanbanConfig } from './dist/board/config.js';

console.log('1. Starting debug test...');

async function testCreate() {
  try {
    console.log('2. Loading config...');
    const { config } = await loadKanbanConfig({
      argv: process.argv,
      env: process.env,
    });

    console.log('3. Loading board...');
    const board = await loadBoard(config.boardFile, config.tasksDir);

    console.log('4. Creating task...');
    const newTask = await createTask(
      board,
      'incoming',
      {
        title: 'Debug Test Task',
        content: 'This is a test task to debug hanging issue',
      },
      config.tasksDir,
      config.boardFile,
    );

    console.log('5. Task created successfully:', newTask.uuid);
  } catch (error) {
    console.error('Error:', error);
  }
}

testCreate();
