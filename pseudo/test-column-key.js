#!/usr/bin/env node

/**
 * Simple test to verify column key normalization behavior
 */

// Simulate the columnKey function from kanban.ts
const columnKey = (name) => {
  const normalizeColumnDisplayName = (value) => {
    const stripTrailingCount = (value) => value.replace(/\s*\(\s*\d+\s*\)\s*$/g, '').trim();
    const trimmed = stripTrailingCount(value.trim());
    return trimmed.length > 0 ? trimmed : 'Todo';
  };

  return normalizeColumnDisplayName(name)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\s-]+/g, '_') // Convert spaces and hyphens to underscores
    .replace(/[^a-z0-9_]+/g, ''); // Remove other special chars
};

console.log('🔍 Testing column key normalization\n');

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
  'In Progress', // Test case sensitivity
  'In-Progress', // Test mixed case with hyphen
  '  in  progress  ', // Test extra spaces
  'in-progress (limit 3)', // Test with trailing count
];

console.log('Column Name | Normalized Key');
console.log('------------|---------------');

testCases.forEach((name) => {
  const key = columnKey(name);
  console.log(`${name.padEnd(20)} | ${key}`);
});

console.log('\n🎯 Expected behavior:');
console.log('- All variations should normalize to the same key');
console.log('- Spaces and hyphens become underscores');
console.log('- Case is normalized to lowercase');
console.log('- Trailing counts like "(limit 3)" are removed');
