#!/usr/bin/env node

// Simple test of the underscore normalization fix
import { execSync } from 'child_process';

console.log('🔧 Testing underscore normalization fix\n');

// Test cases that should behave the same after the fix
const testCases = ['in_progress', 'in-progress', 'in progress', 'to_do', 'to-do', 'todo'];

console.log('Testing CLI column access with different formats:');
console.log('===============================================');

testCases.forEach((columnName) => {
  try {
    const result = execSync(`pnpm kanban getColumn "${columnName}"`, {
      encoding: 'utf8',
      stdio: 'pipe',
    });
    const data = JSON.parse(result);
    console.log(`${columnName.padEnd(12)} → ${data.count} tasks`);
  } catch (error) {
    console.log(`${columnName.padEnd(12)} → Error: ${error.status}`);
  }
});

console.log('\n📝 Expected behavior after fix:');
console.log('- "in_progress" and "in-progress" should both access the same column');
console.log('- "to_do", "to-do", and "todo" should all access the same column');
console.log('- This demonstrates consistent underscore normalization');
