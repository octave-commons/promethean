#!/usr/bin/env node

import path from 'node:path';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { createTaskAction } from './dist/lib/actions/tasks/create-task.js';
import { loadBoardFunctional } from './dist/lib/actions/board/load-board-functional.js';

async function testCreateTaskWithBoard() {
  const tempDir = '/tmp/kanban-create-test';
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tempDir, { recursive: true });
  await mkdir(tasksDir, { recursive: true });

  // Create initial empty board
  const initialBoardContent = `---
kanban-plugin: board
---

## Todo

## In Progress

## Done

%% kanban:settings
\`\`\`
{"kanban-plugin":"board"}
\`\`\`
%%`;

  await writeFile(boardPath, initialBoardContent, 'utf8');

  console.log('Testing create task with board persistence...');

  try {
    // Load the board
    const boardResult = await loadBoardFunctional({ boardPath });
    const board = boardResult.board;

    console.log('Board loaded successfully');
    console.log(
      'Initial columns:',
      board.columns.map((c) => ({ name: c.name, taskCount: c.tasks.length })),
    );

    // Create a task
    const taskResult = await createTaskAction({
      board,
      column: 'Todo',
      input: {
        title: 'Test Board Task',
        content: 'This task should be added to the board',
        labels: ['test', 'board'],
      },
      tasksDir,
      boardPath,
    });

    console.log('Task created:', taskResult.task.title);
    console.log('Task UUID:', taskResult.task.uuid);

    // Read the board file to see if task was added
    const updatedBoardContent = await readFile(boardPath, 'utf8');
    console.log('\nUpdated board content:');
    console.log(updatedBoardContent);

    // Load board again to verify
    const reloadedResult = await loadBoardFunctional({ boardPath });
    console.log(
      '\nReloaded board columns:',
      reloadedResult.board.columns.map((c) => ({ name: c.name, taskCount: c.tasks.length })),
    );

    const todoColumn = reloadedResult.board.columns.find((c) => c.name === 'Todo');
    if (todoColumn && todoColumn.tasks.length > 0) {
      console.log('SUCCESS: Task found in Todo column:', todoColumn.tasks[0].title);
    } else {
      console.log('FAILURE: Task not found in Todo column');
    }
  } catch (error) {
    console.error('Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

testCreateTaskWithBoard().catch(console.error);
