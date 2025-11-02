#!/usr/bin/env node

import path from 'node:path';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { loadBoard } from './dist/lib/kanban-compatibility.js';

async function testBoardLoading() {
  const tempDir = '/tmp/kanban-board-test';
  const boardPath = path.join(tempDir, 'board.md');

  await mkdir(tempDir, { recursive: true });

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

  console.log('Testing board loading...');
  console.log('Initial board content:');
  console.log(initialBoardContent);

  try {
    const board = await loadBoard(boardPath);
    console.log('\nLoaded board:');
    console.log('Columns:', board.columns.length);
    board.columns.forEach((col, i) => {
      console.log(
        `  Column ${i}: "${col.name}" - ${col.count} tasks, ${col.tasks.length} tasks in array`,
      );
    });
  } catch (error) {
    console.error('Failed to load board:', error);
    console.error('Stack trace:', error.stack);
  }
}

testBoardLoading().catch(console.error);
