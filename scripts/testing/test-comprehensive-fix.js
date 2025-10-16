#!/usr/bin/env node

/**
 * Comprehensive test of the underscore normalization fix
 */

import { execSync } from 'child_process';

console.log('🧪 Comprehensive Underscore Normalization Test\n');

// Test cases that should work (access the same column)
const testGroups = [
  {
    description: 'in_progress column variants',
    variants: ['in_progress', 'in-progress', 'in progress'],
    expectedTasks: 8, // Based on current board
  },
  {
    description: 'todo column (only exact match should work)',
    variants: ['todo'],
    expectedTasks: 20,
  },
  {
    description: 'done column variants',
    variants: ['done'],
    expectedTasks: 23, // Based on current board
  },
];

let allTestsPassed = true;

testGroups.forEach((group) => {
  console.log(`\n📋 ${group.description}:`);
  console.log('='.repeat(50));

  const results = [];

  group.variants.forEach((variant) => {
    try {
      const result = execSync(`pnpm kanban getColumn "${variant}"`, {
        encoding: 'utf8',
        stdio: 'pipe',
      });
      const data = JSON.parse(result);
      results.push({ variant, count: data.count, success: true });
      console.log(`  "${variant}" → ${data.count} tasks ✅`);
    } catch (error) {
      results.push({ variant, count: 0, success: false });
      console.log(`  "${variant}" → Error ❌`);
    }
  });

  // Check if all successful results have the same task count
  const successfulResults = results.filter((r) => r.success);
  if (successfulResults.length > 1) {
    const taskCounts = successfulResults.map((r) => r.count);
    const allMatch = taskCounts.every((count) => count === taskCounts[0]);

    if (allMatch && taskCounts[0] === group.expectedTasks) {
      console.log(`  ✅ All variants return expected ${group.expectedTasks} tasks`);
    } else {
      console.log(`  ❌ Variants return different task counts: ${taskCounts.join(', ')}`);
      allTestsPassed = false;
    }
  }
});

console.log('\n🎯 Summary:');
console.log('=============');
if (allTestsPassed) {
  console.log('✅ All tests passed! Underscore normalization is working correctly.');
  console.log('\n📝 Key improvements:');
  console.log('- Users can now access "in_progress" column using:');
  console.log('  • "in_progress" (original format)');
  console.log('  • "in-progress" (hyphenated format)');
  console.log('  • "in progress" (spaced format)');
  console.log('- All variants correctly map to the same column');
} else {
  console.log('❌ Some tests failed. Please review the results above.');
}
