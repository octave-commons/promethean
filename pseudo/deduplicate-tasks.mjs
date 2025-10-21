#!/usr/bin/env node

import { readTasksFolder } from './packages/kanban/dist/lib/kanban.js';
import fs from 'fs';

async function deduplicateTasks() {
  const tasksDir = 'docs/agile/tasks';
  console.log('🔍 Analyzing tasks for duplicates...');

  const tasks = await readTasksFolder(tasksDir);
  console.log(`📁 Loaded ${tasks.length} tasks`);

  // Group tasks by slug
  const slugGroups = new Map();
  for (const task of tasks) {
    const slug = task.slug || 'no-slug';
    if (!slugGroups.has(slug)) {
      slugGroups.set(slug, []);
    }
    slugGroups.get(slug).push(task);
  }

  // Find duplicates
  const duplicates = [];
  for (const [slug, taskList] of slugGroups.entries()) {
    if (taskList.length > 1) {
      duplicates.push({ slug, tasks: taskList });
    }
  }

  console.log(`🔄 Found ${duplicates.length} duplicate groups`);

  if (duplicates.length === 0) {
    console.log('✅ No duplicates found!');
    return;
  }

  // Process each duplicate group
  for (const { slug, tasks: taskList } of duplicates) {
    console.log(`\n📋 Processing duplicate group: "${slug}" (${taskList.length} tasks)`);

    // Sort by created_at to find the original (oldest)
    const sortedTasks = taskList.sort((a, b) => {
      const dateA = new Date(a.created_at || '9999-12-31');
      const dateB = new Date(b.created_at || '9999-12-31');
      return dateA.getTime() - dateB.getTime();
    });

    const original = sortedTasks[0];
    const duplicatesToRemove = sortedTasks.slice(1);

    console.log(`  📄 Keeping: ${original.title} (${original.uuid}) - ${original.sourcePath}`);
    console.log(`  🗑️  Removing ${duplicatesToRemove.length} duplicates:`);

    for (const duplicate of duplicatesToRemove) {
      console.log(`    - ${duplicate.title} (${duplicate.uuid}) - ${duplicate.sourcePath}`);

      // Check if the duplicate has content that the original doesn't
      if (duplicate.content && !original.content) {
        console.log(`      ⚠️  Duplicate has content, original doesn't. Consider manual review.`);
      }

      // Delete the duplicate file
      try {
        fs.unlinkSync(duplicate.sourcePath);
        console.log(`      ✅ Deleted`);
      } catch (error) {
        console.log(`      ❌ Failed to delete: ${error.message}`);
      }
    }
  }

  console.log('\n🎉 Deduplication complete!');

  // Final count
  const finalTasks = await readTasksFolder(tasksDir);
  console.log(`📊 Final task count: ${finalTasks.length}`);
}

deduplicateTasks().catch(console.error);
