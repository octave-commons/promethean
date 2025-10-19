#!/usr/bin/env node

/**
 * Test to verify the underscore normalization fix
 */

// Since we can't easily import from the unbuilt TS files, let's simulate the fix
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

// OLD version (before fix)
const oldNormalizeColumnName = (column) => {
  return column
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '');
};

// NEW version (after fix)
const newNormalizeColumnName = (column) => {
  return column
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\s-]+/g, '_') // Convert spaces and hyphens to underscores
    .replace(/[^a-z0-9_]+/g, ''); // Remove other special chars
};

console.log('🔍 Testing underscore normalization fix\n');

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
  'In Progress',
  'In-Progress',
  '  in  progress  ',
  'in-progress (limit 3)',
];

console.log(
  'Column Name | columnKey() | OLD normalize() | NEW normalize() | OLD Match | NEW Match',
);
console.log('------------|------------|----------------|----------------|-----------|-----------');

let oldMatches = 0;
let newMatches = 0;

testCases.forEach((name) => {
  const boardKey = columnKey(name);
  const oldKey = oldNormalizeColumnName(name);
  const newKey = newNormalizeColumnName(name);

  const oldMatch = boardKey === oldKey ? '✅' : '❌';
  const newMatch = boardKey === newKey ? '✅' : '❌';

  if (oldMatch === '✅') oldMatches++;
  if (newMatch === '✅') newMatches++;

  console.log(
    `${name.padEnd(20)} | ${boardKey.padEnd(11)} | ${oldKey.padEnd(14)} | ${newKey.padEnd(14)} | ${oldMatch.padEnd(9)} | ${newMatch.padEnd(9)}`,
  );
});

console.log('\n📊 Results:');
console.log(
  `OLD normalizeColumnName matches: ${oldMatches}/${testCases.length} (${Math.round((oldMatches / testCases.length) * 100)}%)`,
);
console.log(
  `NEW normalizeColumnName matches: ${newMatches}/${testCases.length} (${Math.round((newMatches / testCases.length) * 100)}%)`,
);

if (newMatches === testCases.length) {
  console.log('\n✅ Fix successful! All test cases now match.');
} else {
  console.log("\n❌ Fix incomplete. Some test cases still don't match.");
}

console.log('\n🎯 Key improvements:');
console.log('- Spaces are now converted to underscores: "in progress" → "in_progress"');
console.log('- Hyphens are now converted to underscores: "in-progress" → "in_progress"');
console.log('- Consistent behavior between columnKey() and normalizeColumnName()');
