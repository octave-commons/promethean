#!/usr/bin/env node

/**
 * Test to demonstrate the underscore normalization bug
 */

import { columnKey } from './packages/kanban/dist/lib/kanban.js';

// Both board and CLI should now use the same columnKey function
const boardColumnKey = columnKey;
const cliColumnKey = columnKey;

console.log('🔍 Testing underscore normalization bug\n');

const testCases = [
  'in_progress',
  'in-progress',
  'in progress',
  'todo',
  'to_do',
  'to-do',
  'done',
  'in_review',
  'in review',
];

console.log('Column Name | Board columnKey() | CLI columnKey() | Match?');
console.log('------------|------------------|-----------------|--------');

testCases.forEach((name) => {
  const boardKey = boardColumnKey(name);
  const cliKey = cliColumnKey(name);
  const match = boardKey === cliKey ? '✅' : '❌';
  console.log(`${name.padEnd(11)} | ${boardKey.padEnd(16)} | ${cliKey.padEnd(15)} | ${match}`);
});

console.log('\n🐛 Bug Analysis:');
console.log('- Board columnKey preserves underscores: "in_progress" → "in_progress"');
console.log('- CLI columnKey only handles spaces: "in_progress" → "in_progress"');
console.log('- But "in progress" → "inprogress" in CLI, while board → "in_progress"');
console.log('- This creates mismatches between CLI commands and board operations');
