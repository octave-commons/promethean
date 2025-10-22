#!/usr/bin/env node

/**
 * Security test for path traversal vulnerability fixes
 * Tests that the indexer-service properly blocks malicious path attempts
 */

import { validateFileSystemPath, validateFilePatterns } from './src/path-validation.js';

console.log('🔒 Testing Path Traversal Security Fixes\n');

// Test cases for path traversal attacks
const maliciousPaths = [
  '../../../etc/passwd',
  '..\\..\\..\\windows\\system32\\config\\sam',
  '/etc/passwd',
  '/etc/shadow',
  '....//....//....//etc/passwd',
  '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd', // URL encoded
  '..%2f..%2f..%2fetc%2fpasswd', // Partially encoded
  'test/../../../etc/passwd',
  'normal\\..\\..\\etc\\passwd',
  '/var/www/../../etc/passwd',
  'folder/../../../root/.ssh/id_rsa',
  '/proc/version',
  '/sys/kernel/version',
  '/etc/hosts',
  '~/.ssh/id_rsa',
  '../../.env',
  '../../../config/database.yml',
];

// Test cases for malicious patterns
const maliciousPatterns = [
  '../../../etc/passwd*',
  '..\\..\\..\\windows\\*',
  '/etc/*',
  '../../.env',
  'config/*.yml',
  '../secrets/*',
];

console.log('Testing malicious path validation:');
let pathTestsPassed = 0;
let pathTestsTotal = maliciousPaths.length;

for (const maliciousPath of maliciousPaths) {
  try {
    const result = validateFileSystemPath(maliciousPath);
    console.log(`❌ FAILED: "${maliciousPath}" -> "${result}" (should have been rejected)`);
  } catch (error) {
    console.log(`✅ PASSED: "${maliciousPath}" -> ${error.message}`);
    pathTestsPassed++;
  }
}

console.log(`\nPath validation tests: ${pathTestsPassed}/${pathTestsTotal} passed\n`);

console.log('Testing malicious pattern validation:');
let patternTestsPassed = 0;
let patternTestsTotal = maliciousPatterns.length;

for (const maliciousPattern of maliciousPatterns) {
  try {
    const result = validateFilePatterns([maliciousPattern]);
    console.log(
      `❌ FAILED: "${maliciousPattern}" -> ${JSON.stringify(result)} (should have been rejected)`,
    );
  } catch (error) {
    console.log(`✅ PASSED: "${maliciousPattern}" -> ${error.message}`);
    patternTestsPassed++;
  }
}

console.log(`\nPattern validation tests: ${patternTestsPassed}/${patternTestsTotal} passed\n`);

// Test legitimate paths to ensure they still work
const legitimatePaths = [
  'src/index.ts',
  './src/index.ts',
  'documents/report.pdf',
  'config/settings.json',
  'tests/unit/test.spec.js',
  'README.md',
  'package.json',
];

console.log('Testing legitimate path validation (should pass):');
let legitTestsPassed = 0;
let legitTestsTotal = legitimatePaths.length;

for (const legitPath of legitimatePaths) {
  try {
    const result = validateFileSystemPath(legitPath);
    console.log(`✅ PASSED: "${legitPath}" -> "${result}"`);
    legitTestsPassed++;
  } catch (error) {
    console.log(`❌ FAILED: "${legitPath}" -> ${error.message} (should have been accepted)`);
  }
}

console.log(`\nLegitimate path tests: ${legitTestsPassed}/${legitTestsTotal} passed\n`);

// Overall results
const totalPassed = pathTestsPassed + patternTestsPassed + legitTestsPassed;
const totalTests = pathTestsTotal + patternTestsTotal + legitTestsTotal;

console.log('📊 Overall Security Test Results:');
console.log(`Total tests: ${totalTests}`);
console.log(`Passed: ${totalPassed}`);
console.log(`Failed: ${totalTests - totalPassed}`);
console.log(`Success rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);

if (totalPassed === totalTests) {
  console.log('\n🎉 All security tests passed! Path traversal vulnerabilities have been fixed.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some security tests failed. Vulnerabilities may still exist.');
  process.exit(1);
}
