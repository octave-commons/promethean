#!/usr/bin/env node

// Simple test script to verify validation functionality
const { validateStartingStatus } = require('./dist/lib/kanban.js');

console.log('=== Testing validateStartingStatus Function ===');

const testCases = [
  // Valid statuses
  { input: 'icebox', shouldPass: true },
  { input: 'incoming', shouldPass: true },
  { input: 'ICEBOX', shouldPass: true },
  { input: 'INCOMING', shouldPass: true },
  { input: 'IceBox', shouldPass: true },
  { input: 'In-Coming', shouldPass: true },

  // Invalid statuses
  { input: 'todo', shouldPass: false },
  { input: 'done', shouldPass: false },
  { input: 'ready', shouldPass: false },
  { input: 'in-progress', shouldPass: false },
  { input: 'invalid-status', shouldPass: false },

  // Edge cases
  { input: '', shouldPass: false },
  { input: '   ', shouldPass: false },
];

let passed = 0;
let failed = 0;

console.log('\n--- Running Tests ---');

testCases.forEach(({ input, shouldPass }) => {
  try {
    validateStartingStatus(input);
    if (shouldPass) {
      console.log(`✓ PASS: "${input}" correctly accepted`);
      passed++;
    } else {
      console.log(`✗ FAIL: "${input}" should be rejected but was accepted`);
      failed++;
    }
  } catch (error) {
    if (!shouldPass) {
      console.log(`✓ PASS: "${input}" correctly rejected`);
      console.log(`    Error: ${error.message}`);
      passed++;
    } else {
      console.log(`✗ FAIL: "${input}" should be accepted but was rejected`);
      console.log(`    Error: ${error.message}`);
      failed++;
    }
  }
});

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
