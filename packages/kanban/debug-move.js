#!/usr/bin/env node

import path from 'node:path';
import { writeFile, mkdir } from 'node:fs/promises';
import { executeCommand, type CliContext } from './src/cli/command-handlers.js';
import { withTempDir } from './test-utils/helpers.js';

async function debug() {
  const tempDir = '/tmp/kanban-debug';
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tasksDir, { recursive: true });
  await writeFile(boardPath, '', 'utf8');

  const context: CliContext = {
    boardFile: boardPath,
    tasksDir,
    argv: [],
  };

  console.log('Creating task...');
  const task = await executeCommand('create', ['Debug task', '--status=Todo'], context);
  console.log('Created task:', task);
  
  if (task && typeof task === 'object' && 'uuid' in task) {
    console.log('Task UUID:', task.uuid);
    
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