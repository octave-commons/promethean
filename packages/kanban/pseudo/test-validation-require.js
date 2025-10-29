#!/usr/bin/env node

try {
  // Simple test script to verify validation functionality
  const { validateStartingStatus } = require('./dist/lib/kanban.js');

  console.log('=== Testing validateStartingStatus Function ===');

  // Test valid statuses
  console.log('\n--- Valid Statuses ---');
  console.log('icebox:', validateStartingStatus('icebox'));
  console.log('incoming:', validateStartingStatus('incoming'));
  console.log('ICEBOX:', validateStartingStatus('ICEBOX'));
  console.log('INCOMING:', validateStartingStatus('INCOMING'));

  // Test invalid statuses
  console.log('\n--- Invalid Statuses ---');
  try {
    console.log('Todo:', validateStartingStatus('Todo'));
  } catch (err) {
    console.log('Todo threw error:', err.message);
  }
  try {
    console.log('done:', validateStartingStatus('done'));
  } catch (err) {
    console.log('done threw error:', err.message);
  }

  console.log('\n=== Test Complete ===');
} catch (err) {
  console.error('Error importing or running tests:', err.message);
  console.error('Stack:', err.stack);
}
