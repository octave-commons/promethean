#!/usr/bin/env node

/**
 * Test to demonstrate the glob pattern bypass vulnerability
 */

import { validatePathArray } from './src/validation/validators.js';

console.log('🔍 Testing Glob Pattern Bypass Vulnerability\n');

// Test case: Malicious glob pattern that might bypass validation
const maliciousGlobs = [
  // These might be considered "safe" by path validation but dangerous as globs
  '**/../etc/**', // Could match files outside root
  '../**', // Could traverse up and match anything
  '**/*', // Could match everything including sensitive files
  '{../,../,../}**', // Brace expansion with traversal
];

console.log('🚨 Testing malicious glob patterns:');
maliciousGlobs.forEach((glob, index) => {
  const result = validatePathArray(glob);
  console.log(`Test ${index + 1}: "${glob}"`);
  console.log(`  Validation result: ${result.valid ? '✅ ALLOWED' : '❌ REJECTED'}`);
  if (!result.valid) {
    console.log(`  Error: ${result.error}`);
  }
  console.log('');
});

// Test case: Legitimate glob patterns
const legitimateGlobs = ['src/**/*.ts', 'docs/**/*.md', 'test/**/*.test.js', '*.json'];

console.log('✅ Testing legitimate glob patterns:');
legitimateGlobs.forEach((glob, index) => {
  const result = validatePathArray(glob);
  console.log(`Test ${index + 1}: "${glob}"`);
  console.log(`  Validation result: ${result.valid ? '✅ ALLOWED' : '❌ REJECTED'}`);
  if (!result.valid) {
    console.log(`  Error: ${result.error}`);
  }
  console.log('');
});
