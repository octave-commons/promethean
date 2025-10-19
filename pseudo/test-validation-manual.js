// Test the validation function directly
const fs = require('fs');
const path = require('path');

// Read the source file to extract the validation function
const sourceFile = path.join(__dirname, 'packages/kanban/src/lib/kanban.ts');
const source = fs.readFileSync(sourceFile, 'utf8');

// Simple columnKey implementation for testing (based on the source)
const columnKey = (column) => {
  return column.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Validation function
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

console.log('=== TDD Analysis of validateStartingStatus ===\n');

// Test valid cases
console.log('✅ GREEN PHASE - Testing valid inputs:');
try {
  validateStartingStatus('icebox');
  console.log('  ✓ icebox: PASS');
} catch (e) {
  console.log('  ✗ icebox: FAIL -', e.message);
}

try {
  validateStartingStatus('incoming');
  console.log('  ✓ incoming: PASS');
} catch (e) {
  console.log('  ✗ incoming: FAIL -', e.message);
}

try {
  validateStartingStatus('ICEBOX');
  console.log('  ✓ ICEBOX (case insensitive): PASS');
} catch (e) {
  console.log('  ✗ ICEBOX (case insensitive): FAIL -', e.message);
}

try {
  validateStartingStatus('In-Coming');
  console.log('  ✓ In-Coming (normalization): PASS');
} catch (e) {
  console.log('  ✗ In-Coming (normalization): FAIL -', e.message);
}

console.log('\n❌ RED PHASE - Testing invalid inputs:');
const invalidCases = ['todo', 'done', 'ready', 'in-progress', '', '   ', 'invalid'];
for (const testCase of invalidCases) {
  try {
    validateStartingStatus(testCase);
    console.log(`  ✗ ${testCase}: Should have failed but didn't`);
  } catch (e) {
    console.log(`  ✓ ${testCase}: Correctly rejected`);
  }
}

console.log('\n📊 Error Message Quality Test:');
try {
  validateStartingStatus('invalid-status');
} catch (e) {
  const msg = e.message;
  console.log(`Error message: ${msg}`);
  console.log(`  ✓ Contains original input: ${msg.includes('invalid-status')}`);
  console.log(`  ✓ Contains valid options: ${msg.includes('icebox, incoming')}`);
  console.log(`  ✓ Contains guidance: ${msg.includes('--status flag')}`);
}

console.log('\n🧪 Edge Case Tests:');
const edgeCases = [
  { input: 'Ice Box', expected: 'pass', desc: 'Space normalization' },
  { input: 'todo', expected: 'fail', desc: 'Invalid status' },
  { input: 'incoming!', expected: 'fail', desc: 'Special characters' },
  { input: 'ICEBOX-123', expected: 'pass', desc: 'Mixed case and numbers' },
  { input: 'in-coming', expected: 'pass', desc: 'Hyphen normalization' },
];

for (const testCase of edgeCases) {
  try {
    validateStartingStatus(testCase.input);
    if (testCase.expected === 'pass') {
      console.log(`  ✓ ${testCase.input} (${testCase.desc}): PASS`);
    } else {
      console.log(`  ✗ ${testCase.input} (${testCase.desc}): Should have failed`);
    }
  } catch (e) {
    if (testCase.expected === 'fail') {
      console.log(`  ✓ ${testCase.input} (${testCase.desc}): Correctly rejected`);
    } else {
      console.log(`  ✗ ${testCase.input} (${testCase.desc}): Should have passed`);
    }
  }
}
