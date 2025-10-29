#!/usr/bin/env node

console.log('1. Testing basic imports...');

import { loadKanbanConfig } from './dist/board/config.js';
import { loadBoard } from './dist/lib/kanban.js';

console.log('2. Testing config loading...');

async function testStep1() {
  try {
    const { config } = await loadKanbanConfig({
      argv: process.argv,
      env: process.env,
    });
    console.log('3. Config loaded successfully');
    console.log('Board file:', config.boardFile);
    console.log('Tasks dir:', config.tasksDir);
    return config;
  } catch (error) {
    console.error('Config loading failed:', error);
    throw error;
  }
}

async function testStep2(config) {
  try {
    console.log('4. Loading board...');
    const board = await loadBoard(config.boardFile, config.tasksDir);
    console.log('5. Board loaded successfully');
    console.log('Board columns:', board.columns.length);
    return board;
  } catch (error) {
    console.error('Board loading failed:', error);
    throw error;
  }
}

async function testStep3(board) {
  try {
    console.log('6. Testing readTasksFolder...');
    const { readTasksFolder } = await import('./dist/lib/kanban.js');
    const tasks = await readTasksFolder('/home/err/devel/promethean/docs/agile/tasks');
    console.log('7. ReadTasksFolder completed, tasks:', tasks.length);
    return tasks;
  } catch (error) {
    console.error('readTasksFolder failed:', error);
    throw error;
  }
}

async function runTests() {
  try {
    const config = await testStep1();
    const board = await testStep2(config);
    await testStep3(board);
    console.log('8. All tests completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTests();
