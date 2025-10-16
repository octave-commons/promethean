#!/usr/bin/env node

import { readTasksFolder } from './packages/kanban/dist/lib/kanban.js';
import { readFile, unlink, readdir } from 'node:fs/promises';

const kanbanConfig = {
  boardPath: 'docs/agile/boards/generated.md',
  tasksDir: 'docs/agile/tasks',
};

async function cleanupDuplicates() {
  console.log('=== Cleaning up duplicate task files ===');

  const existingTasks = await readTasksFolder(kanbanConfig.tasksDir);
  console.log(`Found ${existingTasks.length} task files`);

  // Group tasks by title (case-insensitive)
  const tasksByTitle = new Map();

  for (const task of existingTasks) {
    const normalizedTitle = task.title.trim().toLowerCase();
    if (!tasksByTitle.has(normalizedTitle)) {
      tasksByTitle.set(normalizedTitle, []);
    }
    tasksByTitle.get(normalizedTitle).push(task);
  }

  // Find duplicates
  const duplicates = [];
  for (const [title, tasks] of tasksByTitle) {
    if (tasks.length > 1) {
      duplicates.push({ title, tasks });
    }
  }

  console.log(`Found ${duplicates.length} titles with duplicates`);

  let deletedCount = 0;
  let keptCount = 0;

  // For each duplicate group, keep the one with the most recent created_at
  for (const { title, tasks } of duplicates) {
    // Sort by created_at (most recent first), fallback to UUID for consistency
    tasks.sort((a, b) => {
      const dateA = new Date(a.created_at || '1970-01-01');
      const dateB = new Date(b.created_at || '1970-01-01');
      if (dateB.getTime() !== dateA.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      // If same date, use UUID to ensure deterministic ordering
      return b.uuid.localeCompare(a.uuid);
    });

    const [keep, ...toDelete] = tasks;

    console.log(`\nTitle: "${keep.title}"`);
    console.log(`  Keeping: ${keep.uuid} (${keep.created_at}) -> ${keep.sourcePath}`);

    for (const task of toDelete) {
      console.log(`  Deleting: ${task.uuid} (${task.created_at}) -> ${task.sourcePath}`);
      try {
        await unlink(task.sourcePath);
        deletedCount++;
      } catch (error) {
        console.log(`    ERROR: Could not delete ${task.sourcePath}: ${error.message}`);
      }
    }

    keptCount++;
  }

  console.log(`\n=== Summary ===`);
  console.log(`Duplicate titles found: ${duplicates.length}`);
  console.log(`Files deleted: ${deletedCount}`);
  console.log(`Files kept: ${keptCount}`);

  // Show final count
  const remainingTasks = await readTasksFolder(kanbanConfig.tasksDir);
  console.log(`Remaining task files: ${remainingTasks.length}`);
}

cleanupDuplicates().catch(console.error);
