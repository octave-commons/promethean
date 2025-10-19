#!/usr/bin/env node

import { readTasksFolder } from './packages/kanban/dist/lib/kanban.js';
import { loadBoard } from './packages/kanban/dist/lib/kanban.js';

const kanbanConfig = {
  boardPath: 'docs/agile/boards/generated.md',
  tasksDir: 'docs/agile/tasks',
};

async function debugPushIssue() {
  const board = await loadBoard(kanbanConfig.boardPath, kanbanConfig.tasksDir);
  const existingTasks = await readTasksFolder(kanbanConfig.tasksDir);

  console.log(`Board has ${board.columns.reduce((sum, col) => sum + col.tasks.length, 0)} tasks`);
  console.log(`Disk has ${existingTasks.length} task files`);

  const existingByUuid = new Map(existingTasks.map((task) => [task.uuid, task]));

  let missingFromDisk = 0;
  let boardTasksByUuid = new Map();

  for (const col of board.columns) {
    for (const task of col.tasks) {
      boardTasksByUuid.set(task.uuid, task);
      if (!existingByUuid.has(task.uuid)) {
        missingFromDisk++;
        if (missingFromDisk <= 10) {
          // Only show first 10
          console.log(`Task on board but not on disk: ${task.title} (${task.uuid})`);
        }
      }
    }
  }

  let orphanedFiles = 0;
  for (const task of existingTasks) {
    if (!boardTasksByUuid.has(task.uuid)) {
      orphanedFiles++;
      if (orphanedFiles <= 10) {
        // Only show first 10
        console.log(`Task file on disk but not on board: ${task.title} (${task.uuid})`);
      }
    }
  }

  console.log(`\nSummary:`);
  console.log(`- Tasks on board but missing from disk: ${missingFromDisk}`);
  console.log(`- Task files on disk but not on board: ${orphanedFiles}`);
  console.log(`- These missing tasks explain why push keeps "adding" ${missingFromDisk} tasks`);
}

debugPushIssue().catch(console.error);
