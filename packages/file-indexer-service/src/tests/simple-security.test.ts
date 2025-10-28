/**
 * Simple security test for path validation
 */

import { validateFileSystemPath, validateFilePatterns } from '../path-validation.js';

console.log('🔒 Running Security Tests...\n');

// Test 1: Path traversal attacks
console.log('Test 1: Path traversal attacks');
const maliciousPaths = [
  '../../../etc/passwd',
  '..\\..\\..\\windows\\system32\\config\\sam',
  '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
  '/etc/passwd',
  '/proc/version',
  'C:\\Windows\\System32\\config\\SAM',
];

let blockedCount = 0;
for (const maliciousPath of maliciousPaths) {
  try {
    validateFileSystemPath(maliciousPath);
    console.log(`❌ FAILED: ${maliciousPath} was allowed`);
  } catch (error) {
    console.log(`✅ BLOCKED: ${maliciousPath} - ${(error as Error).message}`);
    blockedCount++;
  }
}

// Test 2: Safe paths
console.log('\nTest 2: Safe paths');
const safePaths = ['documents/file.txt', 'src/index.ts', 'config/app.json', 'logs/app.log'];

let allowedCount = 0;
for (const safePath of safePaths) {
  try {
    const result = validateFileSystemPath(safePath);
    console.log(`✅ ALLOWED: ${safePath} -> ${result}`);
    allowedCount++;
  } catch (error) {
    console.log(`❌ FAILED: ${safePath} was blocked - ${(error as Error).message}`);
  }
}

// Test 3: Pattern validation
console.log('\nTest 3: Pattern validation');
try {
  const safePatterns = validateFilePatterns(['*.ts', '*.json', 'src/**/*.js']);
  console.log(`✅ PATTERNS ALLOWED: ${safePatterns.join(', ')}`);
} catch (error) {
  console.log(`❌ PATTERNS FAILED: ${(error as Error).message}`);
}

try {
  validateFilePatterns(['../../../etc/passwd', '|cat /etc/passwd']);
  console.log(`❌ MALICIOUS PATTERNS ALLOWED - This should not happen!`);
} catch (error) {
  console.log(`✅ MALICIOUS PATTERNS BLOCKED: ${(error as Error).message}`);
}

// Results
console.log('\n📊 Test Results:');
console.log(`Path traversal attacks blocked: ${blockedCount}/${maliciousPaths.length}`);
console.log(`Safe paths allowed: ${allowedCount}/${safePaths.length}`);

const success = blockedCount === maliciousPaths.length && allowedCount === safePaths.length;
console.log(`\n🎯 Overall Security Status: ${success ? '✅ SECURE' : '❌ VULNERABLE'}`);

if (!success) {
  process.exit(1);
}
