#!/usr/bin/env node

import path from 'node:path';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { createTaskAction } from './src/lib/actions/tasks/create-task.ts';
import { loadBoard } from './src/lib/actions/boards/load-board.ts';

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
    const boardMarkdown = await readFile(boardPath, 'utf8');
    const boardResult = loadBoard({ markdown: boardMarkdown });
    const board = boardResult.board;

    console.log('Board loaded successfully');
    console.log('Board structure:', JSON.stringify(board, null, 2));
    console.log(
      'Initial columns:',
      board.columns
        ? board.columns.map((c) => ({ name: c.name, taskCount: c.tasks ? c.tasks.length : 0 }))
        : 'NO COLUMNS',
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
    const reloadedMarkdown = await readFile(boardPath, 'utf8');
    const reloadedResult = loadBoard({ markdown: reloadedMarkdown });
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
