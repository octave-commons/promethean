#!/usr/bin/env node

/**
 * Test to verify the underscore normalization fix
 */

import { columnKey as boardColumnKey } from '../lib/kanban.js';

// Import the transition rules to test the actual normalizeColumnName method
import { TransitionRulesEngine } from '../lib/transition-rules.js';

// Create a minimal transition rules engine to access normalizeColumnName
const testEngine = new TransitionRulesEngine({
  enabled: false,
  enforcement: 'warn',
  rules: [],
  globalRules: [],
  customChecks: {},
});

// Access the private normalizeColumnName method via reflection
const getNormalizeColumnName = (engine: TransitionRulesEngine) => {
  return (engine as any).normalizeColumnName.bind(engine);
};

const transitionRulesColumnKey = getNormalizeColumnName(testEngine);

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

console.log('Column Name | Board columnKey() | Transition Rules normalize() | Match?');
console.log('------------|------------------|---------------------------|--------');

testCases.forEach((name) => {
  const boardKey = boardColumnKey(name);
  const transitionKey = transitionRulesColumnKey(name);
  const match = boardKey === transitionKey ? '✅' : '❌';
  console.log(
    `${name.padEnd(11)} | ${boardKey.padEnd(16)} | ${transitionKey.padEnd(25)} | ${match}`,
  );
});

console.log('\n🔧 Fix Analysis:');
console.log('- Board columnKey: converts spaces/hyphens to underscores');
console.log('- Transition Rules normalize: NOW also converts spaces/hyphens to underscores');
console.log('- Both functions should now produce identical results');
console.log('- This ensures consistent behavior between CLI commands and transition rules');
