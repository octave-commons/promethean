#!/usr/bin/env node

/**
 * Simple test to verify underscore normalization without building
 */

// Test the regex patterns directly
const testNormalization = (input) => {
  return input
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\s-]+/g, '_') // Convert spaces and hyphens to underscores
    .replace(/[^a-z0-9_]+/g, ''); // Remove other special chars
};

console.log('🔍 Testing underscore normalization patterns\n');

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
  'test_case',
  'test-case',
  'test case',
  'test@case',
  'test#case',
  'test_case_123',
];

console.log('Input        | Normalized');
console.log('-------------|------------');

testCases.forEach((input) => {
  const normalized = testNormalization(input);
  console.log(`${input.padEnd(12)} | ${normalized}`);
});

console.log('\n🔧 Analysis:');
console.log('- Spaces and hyphens are converted to underscores');
console.log('- Existing underscores are preserved');
console.log('- Other special characters are removed');
console.log('- Multiple spaces/hyphens become single underscores');
