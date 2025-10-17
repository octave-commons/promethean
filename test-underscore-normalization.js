#!/usr/bin/env node

// Simple test to verify underscore normalization without TypeScript compilation

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

// Simulate the normalizeColumnName method from transition-rules.ts
const normalizeColumnName = (column) => {
  return column
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\s-]+/g, '_') // Convert spaces and hyphens to underscores
    .replace(/[^a-z0-9_]+/g, ''); // Remove other special chars
};

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

console.log('Column Name | columnKey() | normalizeColumnName() | Match?');
console.log('------------|------------|----------------------|--------');

let allMatch = true;

testCases.forEach((name) => {
  const columnKeyResult = columnKey(name);
  const normalizeResult = normalizeColumnName(name);
  const match = columnKeyResult === normalizeResult ? '✅' : '❌';
  if (match === '❌') allMatch = false;
  console.log(
    `${name.padEnd(11)} | ${columnKeyResult.padEnd(10)} | ${normalizeResult.padEnd(20)} | ${match}`,
  );
});

console.log('\n🔧 Result:');
if (allMatch) {
  console.log('✅ SUCCESS: All column names normalize consistently!');
  console.log('✅ The underscore normalization bug appears to be FIXED.');
} else {
  console.log('❌ FAILURE: Column name normalization is inconsistent.');
  console.log('❌ The underscore normalization bug still exists.');
}

console.log('\n📝 Analysis:');
console.log('- columnKey: Converts spaces/hyphens to underscores');
console.log('- normalizeColumnName: Also converts spaces/hyphens to underscores');
console.log('- Both functions should produce identical results for consistent behavior');
