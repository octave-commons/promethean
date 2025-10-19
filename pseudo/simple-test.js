// Simple test of validation logic
const columnKey = (column) => {
  return column.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const validateStartingStatus = (column) => {
  const validStartingStatuses = ['icebox', 'incoming'];
  const normalizedColumn = columnKey(column);

  if (!validStartingStatuses.includes(normalizedColumn)) {
    throw new Error(
      `Invalid starting status: "${column}". Tasks can only be created with starting statuses: ${validStartingStatuses.join(', ')}. ` +
        `Use --status flag to specify a valid starting status when creating tasks.`,
    );
  }
};

console.log('=== TDD Analysis Results ===\n');

// Valid cases
console.log('✅ Valid inputs:');
['icebox', 'incoming', 'ICEBOX', 'In-Coming'].forEach((test) => {
  try {
    validateStartingStatus(test);
    console.log(`  ✓ ${test}: PASS`);
  } catch (e) {
    console.log(`  ✗ ${test}: FAIL - ${e.message}`);
  }
});

// Invalid cases
console.log('\n❌ Invalid inputs:');
['todo', 'done', 'ready', 'in-progress', '', '   ', 'invalid'].forEach((test) => {
  try {
    validateStartingStatus(test);
    console.log(`  ✗ ${test}: Should have failed`);
  } catch (e) {
    console.log(`  ✓ ${test}: Correctly rejected`);
  }
});

// Error message test
console.log('\n📝 Error message quality:');
try {
  validateStartingStatus('invalid-status');
} catch (e) {
  console.log(`Message: ${e.message}`);
  console.log(`  ✓ Has original input: ${e.message.includes('invalid-status')}`);
  console.log(`  ✓ Has valid options: ${e.message.includes('icebox, incoming')}`);
  console.log(`  ✓ Has guidance: ${e.message.includes('--status flag')}`);
}
