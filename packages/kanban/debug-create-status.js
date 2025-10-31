#!/usr/bin/env node

import { executeCommand } from './dist/cli/command-handlers.js';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';

async function debugCreateAndStatus() {
  const tempDir = join(tmpdir(), 'kanban-debug-status');
  await mkdir(tempDir, { recursive: true });

  const boardPath = join(tempDir, 'board.md');
  const tasksDir = join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });

  // Create a simple board with columns
  const boardContent = `# Test Board

## Todo

## In Progress

## Done
`;
  await writeFile(boardPath, boardContent, 'utf8');

  const context = {
    boardFile: boardPath,
    tasksDir,
    argv: [],
  };

  console.log('=== Creating task with status=In Progress ===');
  const task = await executeCommand('create', ['Test Task', '--status=In Progress'], context);
  console.log('Created task:', task);

  console.log('\n=== Board content after creation ===');
  const boardContentAfter = await executeCommand('list', [], context);
  console.log(JSON.stringify(boardContentAfter, null, 2));

  console.log('\n=== Updating task status to Todo ===');
  const updateResult = await executeCommand('update-status', [task.uuid, 'Todo'], context);
  console.log('Update result:', updateResult);

  console.log('\n=== Board content after status update ===');
  const boardContentAfterUpdate = await executeCommand('list', [], context);
  console.log(JSON.stringify(boardContentAfterUpdate, null, 2));
}

debugCreateAndStatus().catch(console.error);
