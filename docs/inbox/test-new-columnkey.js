// Test the updated columnKey function
const normalizeColumnDisplayName = (value) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : 'Todo';
};

const columnKey = (name) =>
  normalizeColumnDisplayName(name)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\s-]+/g, '_') // Convert spaces and hyphens to underscores
    .replace(/[^a-z0-9_]+/g, ''); // Remove other special chars

console.log('Testing updated columnKey function:');
console.log('===================================');

const testCases = [
  'in_progress',
  'in-progress',
  'in progress',
  'todo',
  'to_do',
  'to-do',
  'to do',
  'done',
  'in_review',
  'in-review',
  'in review',
];

testCases.forEach((name) => {
  const result = columnKey(name);
  console.log(`${name.padEnd(12)} → ${result}`);
});

console.log('\nConsistency checks:');
console.log(
  'in_progress variants match:',
  columnKey('in_progress') === columnKey('in-progress') &&
    columnKey('in-progress') === columnKey('in progress'),
);

console.log(
  'todo variants match:',
  columnKey('todo') === columnKey('to_do') &&
    columnKey('to_do') === columnKey('to-do') &&
    columnKey('to-do') === columnKey('to do'),
);
