#!/usr/bin/env node

import path from 'node:path';
import {
  validateAndSanitizePath,
  validateAndSanitizeFilename,
  DEFAULT_SECURITY_CONFIG,
} from './src/security-utils.js';

console.log('Testing path validation...\n');

// Test SECURITY-001 cases
const traversalAttempts = [
  '../../../etc',
  '..\\..\\windows\\system32',
  '%2e%2e%2fetc',
  '....//....//....//etc',
  '..%252f..%252f..%252fetc',
];

console.log('=== SECURITY-001: Path traversal in input directory ===');
for (const attempt of traversalAttempts) {
  console.log(`\nTesting: "${attempt}"`);
  const resolvedPath = path.resolve(attempt);
  console.log(`Resolved to: "${resolvedPath}"`);

  const result = validateAndSanitizePath(resolvedPath, 'input directory', DEFAULT_SECURITY_CONFIG);
  console.log(`Validation result:`, result);

  if (!result.success) {
    console.log(`✅ Would throw: ${result.error}`);
  } else {
    console.log(`❌ Would NOT throw - this is the problem!`);
  }
}

console.log('\n=== SECURITY-002: Path traversal in output directory ===');
const systemPaths = [
  '../../../etc',
  '..\\..\\windows\\system32',
  '/etc/passwd',
  'C:\\Windows\\System32',
];

for (const attempt of systemPaths) {
  console.log(`\nTesting: "${attempt}"`);
  const resolvedPath = path.resolve(attempt);
  console.log(`Resolved to: "${resolvedPath}"`);

  const result = validateAndSanitizePath(resolvedPath, 'output directory', DEFAULT_SECURITY_CONFIG);
  console.log(`Validation result:`, result);

  if (!result.success) {
    console.log(`✅ Would throw: ${result.error}`);
  } else {
    console.log(`❌ Would NOT throw - this is the problem!`);
  }
}

console.log('\n=== SECURITY-003: Code injection in filename ===');
const maliciousFilenames = [
  "<script>alert('xss')</script>.mjs",
  "javascript:alert('xss').mjs",
  "'; DROP TABLE apps; --.mjs",
  '$(rm -rf /).mjs',
  '`whoami`.mjs',
  'CON.mjs',
  'PRN.mjs',
  'AUX.mjs',
  'file/with/slashes.mjs',
  'file\\with\\backslashes.mjs',
  'file..with..dots.mjs',
];

for (const filename of maliciousFilenames) {
  console.log(`\nTesting filename: "${filename}"`);
  const result = validateAndSanitizeFilename(filename, DEFAULT_SECURITY_CONFIG);
  console.log(`Validation result:`, result);

  if (!result.success) {
    console.log(`✅ Would throw: ${result.error}`);
  } else {
    console.log(`❌ Would NOT throw - this is the problem!`);
  }
}
