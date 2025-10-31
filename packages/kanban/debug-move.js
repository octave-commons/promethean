#!/usr/bin/env node

import path from 'node:path';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { executeCommand } from './dist/cli/command-handlers.js';

async function debug() {
  const tempDir = '/tmp/kanban-debug';
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });

  // Create a proper initial board with columns
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

  const context = {
    boardFile: boardPath,
    tasksDir,
    argv: [],
  };

  // Check initial board state
  const { loadBoard } = await import('./dist/lib/kanban.js');
  try {
    const initialBoard = await loadBoard({ boardPath: boardPath });
    console.log('Initial board structure:', JSON.stringify(initialBoard.board, null, 2));
  } catch (error) {
    console.log('Initial board read failed:', error.message);
  }

  console.log('Creating task...');
  const task = await executeCommand('create', ['Debug task', '--status=Todo'], context);
  console.log('Created task:', task);

  if (task && typeof task === 'object' && 'uuid' in task) {
    console.log('Task UUID:', task.uuid);

    // Check what's in the board file
    const boardContent = await readFile(boardPath, 'utf8');
    console.log('Board content after task creation:', boardContent || '(empty)');

    // Try to read the board using the board reader
    const { readBoard } = await import('./dist/lib/board-reader.js');
    const board = await readBoard(boardPath);
    console.log('Board structure after task creation:', JSON.stringify(board, null, 2));

    console.log('Trying to move task...');
    try {
      const moveResult = await executeCommand('move_up', [task.uuid], context);
      console.log('Move result:', moveResult);
    } catch (error) {
      console.error('Move failed:', error);
    }
  }
}

debug().catch(console.error);
