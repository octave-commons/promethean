#!/usr/bin/env node

// Debug test sequence to reproduce the status preservation issue

import { tmpdir } from 'os';
import { join } from 'path';
import { promises as fs } from 'fs';

// Import kanban functions
import { executeCommand } from './dist/cli/command-handlers.js';

async function runDebugTest() {
  const testDir = await fs.mkdtemp(join(tmpdir(), 'kanban-debug-'));
  const boardFile = join(testDir, 'board.md');
  const tasksDir = join(testDir, 'tasks');

  await fs.mkdir(tasksDir, { recursive: true });

  console.log('🔍 Debug Test Sequence');
  console.log(`Test dir: ${testDir}`);
  console.log('');

  // Create initial board
  const initialBoard = `# Test Board

## Todo

- Task 1 <!--id:task1-->

## In Progress

## Done
`;

  await fs.writeFile(boardFile, initialBoard, 'utf8');

  const context = {
    boardFile,
    tasksDir,
    argv: [],
  };

  try {
    console.log('1️⃣ Creating task...');
    const createResult = await executeCommand('create', ['Test Task', '--status=Todo'], context);
    console.log(`Created task: ${createResult.title} (${createResult.uuid})`);
    console.log(`Status: ${createResult.status}`);
    console.log('');

    const taskId = createResult.uuid;

    console.log('2️⃣ Updating status to In Progress...');
    const updateResult = await executeCommand('update-status', [taskId, 'In Progress'], context);
    console.log(`Update success: ${updateResult.success}`);
    if (updateResult.task) {
      console.log(`Task status after update: ${updateResult.task.status}`);
    }
    console.log('');

    console.log('3️⃣ Reading board file content after update-status...');
    const boardContentAfterUpdate = await fs.readFile(boardFile, 'utf8');
    console.log('Board content:');
    console.log(boardContentAfterUpdate);
    console.log('');

    console.log('4️⃣ Moving task up...');
    const moveResult = await executeCommand('move_up', [taskId], context);
    console.log(`Move success: ${moveResult.success}`);
    if (moveResult.column) {
      console.log(`Task column after move: ${moveResult.column}`);
    }
    console.log('');

    console.log('5️⃣ Reading board file content after move_up...');
    const boardContentAfterMove = await fs.readFile(boardFile, 'utf8');
    console.log('Board content:');
    console.log(boardContentAfterMove);
    console.log('');

    console.log('6️⃣ Reading task file content...');
    const taskFiles = await fs.readdir(tasksDir);
    const taskFile = taskFiles.find(f => f.includes(taskId));
    if (taskFile) {
      const taskContent = await fs.readFile(join(tasksDir, taskFile), 'utf8');
      console.log('Task file content:');
      console.log(taskContent);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Cleanup
    await fs.rm(testDir, { recursive: true, force: true });
  }
}

runDebugTest().catch(console.error);