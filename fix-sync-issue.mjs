#!/usr/bin/env node

import { readTasksFolder } from './packages/kanban/dist/lib/kanban.js';
import { loadBoard, writeBoard } from './packages/kanban/dist/lib/kanban.js';

const kanbanConfig = {
  boardPath: 'docs/agile/boards/generated.md',
  tasksDir: 'docs/agile/tasks',
};

async function fixSyncIssue() {
  console.log('=== Fixing board-disk synchronization issue ===');

  const board = await loadBoard(kanbanConfig.boardPath, kanbanConfig.tasksDir);
  const existingTasks = await readTasksFolder(kanbanConfig.tasksDir);

  // Create maps for efficient lookup
  const tasksByTitle = new Map();

  // Group tasks by title (case-insensitive)
  for (const task of existingTasks) {
    const normalizedTitle = task.title.trim().toLowerCase();
    if (!tasksByTitle.has(normalizedTitle)) {
      tasksByTitle.set(normalizedTitle, []);
    }
    tasksByTitle.get(normalizedTitle).push(task);
  }

  let fixedCount = 0;
  let missingCount = 0;

  // Fix board tasks by matching with disk tasks by title
  for (const col of board.columns) {
    const originalTasks = [...col.tasks];
    col.tasks = [];
    col.count = 0;

    for (const boardTask of originalTasks) {
      const normalizedTitle = boardTask.title.trim().toLowerCase();
      const matchingDiskTasks = tasksByTitle.get(normalizedTitle);

      if (matchingDiskTasks && matchingDiskTasks.length > 0) {
        // Use the first matching disk task (prefer one with same UUID if exists)
        let bestMatch =
          matchingDiskTasks.find((t) => t.uuid === boardTask.uuid) || matchingDiskTasks[0];

        // Update board task to match disk task
        const updatedTask = {
          ...bestMatch,
          status: col.name, // Preserve the board column status
        };

        col.tasks.push(updatedTask);
        col.count++;
        fixedCount++;

        if (bestMatch.uuid !== boardTask.uuid) {
          console.log(
            `Fixed UUID mismatch for "${boardTask.title}": ${boardTask.uuid} -> ${bestMatch.uuid}`,
          );
        }
      } else {
        console.log(`No matching disk task found for: ${boardTask.title} (${boardTask.uuid})`);
        missingCount++;
      }
    }
  }

  console.log(`\nFixed ${fixedCount} tasks with UUID mismatches`);
  console.log(`${missingCount} board tasks have no matching disk files`);

  // Write the fixed board
  await writeBoard(kanbanConfig.boardPath, board);
  console.log(`\nUpdated board file: ${kanbanConfig.boardPath}`);

  // Show final counts
  const finalBoardTaskCount = board.columns.reduce((sum, col) => sum + col.tasks.length, 0);
  console.log(`\nFinal counts:`);
  console.log(`- Board tasks: ${finalBoardTaskCount}`);
  console.log(`- Disk files: ${existingTasks.length}`);
  console.log(`- Synchronized: ${finalBoardTaskCount === existingTasks.length ? 'YES' : 'NO'}`);
}

fixSyncIssue().catch(console.error);
