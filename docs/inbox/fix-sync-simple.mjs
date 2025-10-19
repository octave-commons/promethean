#!/usr/bin/env node

import { loadBoard, pullFromTasks } from './packages/kanban/dist/lib/kanban.js';

const kanbanConfig = {
  boardPath: 'docs/agile/boards/generated.md',
  tasksDir: 'docs/agile/tasks',
};

async function fixSyncSimple() {
  console.log('=== Fixing board-disk synchronization with pullFromTasks ===');

  const board = await loadBoard(kanbanConfig.boardPath, kanbanConfig.tasksDir);

  console.log(
    `Before sync: Board has ${board.columns.reduce((sum, col) => sum + col.tasks.length, 0)} tasks`,
  );

  // Use pullFromTasks to sync board from disk (task files are source of truth)
  const result = await pullFromTasks(board, kanbanConfig.tasksDir, kanbanConfig.boardPath);

  console.log(`Sync result: ${result.added} added, ${result.moved} moved`);

  // Reload board to see final state
  const updatedBoard = await loadBoard(kanbanConfig.boardPath, kanbanConfig.tasksDir);
  console.log(
    `After sync: Board has ${updatedBoard.columns.reduce((sum, col) => sum + col.tasks.length, 0)} tasks`,
  );
}

fixSyncSimple().catch(console.error);
