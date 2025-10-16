#!/usr/bin/env node

import { readTasksFolder } from './packages/kanban/dist/lib/kanban.js';
import { loadBoard } from './packages/kanban/dist/lib/kanban.js';

const kanbanConfig = {
  boardPath: 'docs/agile/boards/generated.md',
  tasksDir: 'docs/agile/tasks',
};

async function debugSyncIssue() {
  console.log('=== Loading board and tasks ===');
  const board = await loadBoard(kanbanConfig.boardPath, kanbanConfig.tasksDir);
  const existingTasks = await readTasksFolder(kanbanConfig.tasksDir);

  const boardTaskCount = board.columns.reduce((sum, col) => sum + col.tasks.length, 0);
  console.log(`Board has ${boardTaskCount} tasks`);
  console.log(`Disk has ${existingTasks.length} task files`);

  const existingByUuid = new Map(existingTasks.map((task) => [task.uuid, task]));

  console.log('\n=== Checking for missing tasks ===');
  let missingFromDisk = 0;
  let boardTasksByUuid = new Map();

  for (const col of board.columns) {
    for (const task of col.tasks) {
      boardTasksByUuid.set(task.uuid, task);
      if (!existingByUuid.has(task.uuid)) {
        missingFromDisk++;
        console.log(`MISSING: ${task.title} (${task.uuid}) in column "${col.name}"`);
      }
    }
  }

  console.log(`\nTotal missing from disk: ${missingFromDisk}`);

  console.log('\n=== Checking for orphaned files ===');
  let orphanedFiles = 0;
  for (const task of existingTasks) {
    if (!boardTasksByUuid.has(task.uuid)) {
      orphanedFiles++;
      console.log(`ORPHANED: ${task.title} (${task.uuid}) from file ${task.sourcePath}`);
    }
  }

  console.log(`\nTotal orphaned files: ${orphanedFiles}`);

  // Let's examine a few specific missing tasks to see if we can find patterns
  console.log('\n=== Examining specific missing tasks ===');
  const missingTasks = [];
  for (const col of board.columns) {
    for (const task of col.tasks) {
      if (!existingByUuid.has(task.uuid)) {
        missingTasks.push({ task, column: col.name });
        if (missingTasks.length >= 3) break;
      }
    }
    if (missingTasks.length >= 3) break;
  }

  for (const { task, column } of missingTasks) {
    console.log(`\nMissing task: ${task.title}`);
    console.log(`UUID: ${task.uuid}`);
    console.log(`Column: ${column}`);
    console.log(`Has sourcePath: ${!!task.sourcePath}`);
    console.log(`Slug: ${task.slug}`);

    // Try to find if there's a file with similar name
    const possibleFiles = existingTasks.filter(
      (t) =>
        t.slug === task.slug || t.title.toLowerCase().trim() === task.title.toLowerCase().trim(),
    );
    console.log(`Possible matching files: ${possibleFiles.length}`);
    for (const match of possibleFiles) {
      console.log(`  - ${match.title} (${match.uuid})`);
    }
  }
}

debugSyncIssue().catch(console.error);
