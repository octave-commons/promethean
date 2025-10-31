#!/usr/bin/env node

import path from 'node:path';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { executeCommand } from './dist/cli/command-handlers.js';
import { loadBoard } from './dist/index.js';

async function testCreateThenMove() {
  const tempDir = '/tmp/kanban-create-move-test';
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await mkdir(tempDir, { recursive: true });
  await mkdir(tasksDir, { recursive: true });
  const initialBoardContent = `---
kanban-plugin: board
---

## Todo

%% kanban:settings
\`\`\`
{"kanban-plugin":"board"}
\`\`\`
%%
`;
  await writeFile(boardPath, initialBoardContent, 'utf8');

  const context = {
    boardFile: boardPath,
    tasksDir,
    argv: [],
  };

  console.log('Testing create then move workflow...');

  try {
    // Create tasks
    console.log('Creating tasks...');
    console.log('Creating first task...');
    const result1 = await executeCommand('create', ['First task', '--status=Todo'], context);
    console.log('First task result:', result1);

    console.log('Creating second task...');
    const task2 = await executeCommand('create', ['Second task', '--status=Todo'], context);
    console.log('Second task result:', task2);

    console.log('Creating third task...');
    const result3 = await executeCommand('create', ['Third task', '--status=Todo'], context);
    console.log('Third task result:', result3);

    console.log('Created task 2 with UUID:', task2.uuid);

    // Regenerate board from task files
    console.log('\nRegenerating board from task files...');
    await executeCommand('regenerate', [], context);

    // Read board content to see what was written
    const boardContent = await readFile(boardPath, 'utf8');
    console.log('\nBoard content after regeneration:');
    console.log('BOARD PATH:', boardPath);
    console.log('BOARD CONTENT:');
    console.log(boardContent);
    console.log('BOARD CONTENT LENGTH:', boardContent.length);

    // Now test moving a task
    console.log('\nTesting move operation...');
    try {
      const moveResult = await executeCommand('move', [task2.uuid, 'In Progress'], context);
      console.log('Move result:', moveResult);

      // Regenerate board again to see the updated state
      console.log('\nRegenerating board after move...');
      await executeCommand('regenerate', [], context);

      const finalBoardContent = await readFile(boardPath, 'utf8');
      console.log('\nFinal board content after move:');
      console.log(finalBoardContent);
    } catch (moveError) {
      console.error('Move failed:', moveError.message);
      console.error('Stack trace:', moveError.stack);
    }
  } catch (error) {
    console.error('Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

testCreateThenMove().catch(console.error);
