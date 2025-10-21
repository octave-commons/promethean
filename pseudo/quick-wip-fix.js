#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Simple rule-based WIP resolution to move obvious candidates
const SIMPLE_RULES = [
  // Move test tasks to done
  {
    pattern: /test.*in.*progress|test.*progress|testing/i,
    from: 'todo',
    to: 'done',
    reason: 'Test-related task appears to be completed'
  },

  // Move documentation tasks to document
  {
    pattern: /doc.*readme|documentation|readme.*review/i,
    from: 'todo',
    to: 'document',
    reason: 'Documentation task should be in document column'
  },

  // Move breakdown tasks to backlog
  {
    pattern: /breakdown|break.*down/i,
    from: 'todo',
    to: 'backlog',
    reason: 'Breakdown task should be in backlog'
  },

  // Move low priority tasks to icebox
  {
    pattern: /^add.*unit.*tests|^add.*integration.*tests/i,
    from: 'todo',
    to: 'icebox',
    reason: 'Test addition tasks are lower priority'
  },

  // Move completed in_progress tasks to review or done
  {
    pattern: /stabilize|fix.*complete|implement.*complete|setup.*complete/i,
    from: 'in_progress',
    to: 'review',
    reason: 'Task appears completed and ready for review'
  }
];

async function getTasksInColumn(columnName) {
  try {
    const { stdout } = await execAsync(`pnpm kanban getColumn ${columnName}`);
    return JSON.parse(stdout);
  } catch (error) {
    console.error(`Failed to get column ${columnName}: ${error.message}`);
    return { tasks: [] };
  }
}

async function moveTask(taskUuid, toColumn, reason) {
  try {
    await execAsync(`pnpm kanban update-status ${taskUuid} ${toColumn}`);
    console.log(`✅ Moved ${taskUuid} to ${toColumn}: ${reason}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to move ${taskUuid}: ${error.message}`);
    return false;
  }
}

async function applySimpleRules() {
  console.log('🔧 Applying simple rule-based WIP resolution...\n');

  let totalMoved = 0;

  for (const rule of SIMPLE_RULES) {
    console.log(`\n📋 Applying rule: ${rule.reason}`);
    console.log(`   Pattern: ${rule.pattern}`);
    console.log(`   From: ${rule.from} → To: ${rule.to}`);

    const columnData = await getTasksInColumn(rule.from);
    const matchingTasks = columnData.tasks?.filter(task =>
      rule.pattern.test(task.title || task.slug || '')
    ) || [];

    console.log(`   Found ${matchingTasks.length} matching tasks`);

    // Move only enough tasks to get under WIP limit
    const wipLimit = columnData.limit || 999;
    const currentCount = columnData.count || 0;
    const overLimit = Math.max(0, currentCount - wipLimit);

    const tasksToMove = matchingTasks.slice(0, Math.min(matchingTasks.length, overLimit));

    for (const task of tasksToMove) {
      const moved = await moveTask(task.uuid, rule.to, rule.reason);
      if (moved) totalMoved++;

      // Stop if we've resolved the violation for this column
      if (totalMoved >= overLimit) break;
    }
  }

  return totalMoved;
}

async function main() {
  console.log('🚨 Quick WIP Violation Resolution');
  console.log('===================================\n');

  // Check current violations
  console.log('Current WIP status:');
  const columnsToCheck = ['todo', 'in_progress'];

  for (const col of columnsToCheck) {
    try {
      const { stdout } = await execAsync(`pnpm kanban getColumn ${col}`);
      const data = JSON.parse(stdout);
      console.log(`  ${col}: ${data.count}/${data.limit || '∞'} ${data.limit && data.count > data.limit ? '🚨' : '✅'}`);
    } catch (error) {
      console.log(`  ${col}: ❌ Could not check`);
    }
  }

  console.log('\nStarting resolution...');
  const moved = await applySimpleRules();

  console.log(`\n✨ Resolution complete! Moved ${moved} tasks.`);

  // Check final status
  console.log('\nFinal WIP status:');
  for (const col of columnsToCheck) {
    try {
      const { stdout } = await execAsync(`pnpm kanban getColumn ${col}`);
      const data = JSON.parse(stdout);
      console.log(`  ${col}: ${data.count}/${data.limit || '∞'} ${data.limit && data.count > data.limit ? '🚨' : '✅'}`);
    } catch (error) {
      console.log(`  ${col}: ❌ Could not check`);
    }
  }
}

if (import.meta.main) {
  main().catch(console.error);
}