#!/usr/bin/env node

/**
 * Comprehensive investigation of kanban column underscore normalization bug
 */

import { columnKey } from './src/lib/kanban.js';
import { normalizeColumnName } from './src/lib/transition-rules-functional.js';
import { loadBoard } from './src/lib/kanban.js';
import { loadKanbanConfig } from './src/board/config.js';

console.log('🔍 Comprehensive Kanban Column Underscore Bug Investigation\n');

// Test 1: Verify normalization functions work correctly
console.log('=== Test 1: Normalization Function Consistency ===');
const testCases = [
  'in_progress',
  'in-progress',
  'in progress',
  'to_do',
  'to-do',
  'to do',
  'in_review',
  'in-review',
  'in review',
  'ready',
  'testing',
  'review',
  'done',
];

console.log('Input\t\t| columnKey()\t| normalizeColumnName()\t| Match?');
console.log('-------\t\t|-----------\t|-------------------\t|-------');

let allMatch = true;
testCases.forEach((input) => {
  const boardResult = columnKey(input);
  const transitionResult = normalizeColumnName(input);
  const match = boardResult === transitionResult ? '✅' : '❌';
  if (boardResult !== transitionResult) allMatch = false;
  console.log(
    `${input.padEnd(15)} | ${boardResult.padEnd(11)} | ${transitionResult.padEnd(17)} | ${match}`,
  );
});

console.log(`\nResult: ${allMatch ? '✅ All normalization functions match' : '❌ Mismatch found'}`);

// Test 2: Check actual board columns
console.log('\n=== Test 2: Actual Board Column Analysis ===');
try {
  const configResult = await loadKanbanConfig();
  const board = await loadBoard('docs/agile/boards/generated.md');

  console.log('Board Columns:');
  console.log('Display Name\t\t| Normalized Key\t| Tasks Count');
  console.log('------------\t\t|--------------\t|-----------');

  const columnAnalysis = [];
  for (const column of board.columns) {
    const displayName = column.name;
    const normalizedKey = columnKey(displayName);
    const taskCount = column.tasks.length;

    columnAnalysis.push({ displayName, normalizedKey, taskCount });
    console.log(`${displayName.padEnd(20)} | ${normalizedKey.padEnd(14)} | ${taskCount}`);
  }

  // Check for duplicate normalized keys
  const keyGroups = new Map();
  for (const col of columnAnalysis) {
    if (!keyGroups.has(col.normalizedKey)) {
      keyGroups.set(col.normalizedKey, []);
    }
    keyGroups.get(col.normalizedKey).push(col.displayName);
  }

  console.log('\nDuplicate Key Analysis:');
  let duplicatesFound = false;
  for (const [key, names] of keyGroups) {
    if (names.length > 1) {
      duplicatesFound = true;
      console.log(`❌ Duplicate key "${key}": ${names.join(', ')}`);
    }
  }

  if (!duplicatesFound) {
    console.log('✅ No duplicate normalized keys found');
  }

  // Test 3: Check task statuses vs columns
  console.log('\n=== Test 3: Task Status vs Column Mapping ===');
  const statusCounts = new Map();
  const allTasks = [];

  for (const column of board.columns) {
    for (const task of column.tasks) {
      const taskStatus = task.status;
      const normalizedTaskStatus = columnKey(taskStatus);
      const normalizedColumnName = columnKey(column.name);

      allTasks.push({
        taskTitle: task.title || 'Untitled',
        taskStatus,
        normalizedTaskStatus,
        columnName: column.name,
        normalizedColumnName,
        matches: normalizedTaskStatus === normalizedColumnName,
      });

      statusCounts.set(normalizedTaskStatus, (statusCounts.get(normalizedTaskStatus) || 0) + 1);
    }
  }

  // Find mismatches
  const mismatches = allTasks.filter((t) => !t.matches);
  if (mismatches.length > 0) {
    console.log(`❌ Found ${mismatches.length} task/column mismatches:`);
    mismatches.slice(0, 10).forEach((mismatch) => {
      console.log(`  Task: "${mismatch.taskTitle}"`);
      console.log(`    Status: "${mismatch.taskStatus}" → "${mismatch.normalizedTaskStatus}"`);
      console.log(`    Column: "${mismatch.columnName}" → "${mismatch.normalizedColumnName}"`);
      console.log('');
    });
    if (mismatches.length > 10) {
      console.log(`  ... and ${mismatches.length - 10} more`);
    }
  } else {
    console.log('✅ All task statuses match their column normalized keys');
  }

  // Test 4: Config status values
  console.log('\n=== Test 4: Config Status Values ===');
  console.log('Config Status Values:');
  for (const status of configResult.config.statusValues) {
    const normalized = columnKey(status);
    console.log(`  "${status}" → "${normalized}"`);
  }
} catch (error) {
  console.error('Error analyzing board:', error);
}

console.log('\n🔧 Investigation Complete');
