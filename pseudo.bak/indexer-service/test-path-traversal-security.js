#!/usr/bin/env node

/**
 * Security Test for Path Traversal Vulnerability Fix
 * Tests various malicious payloads to ensure no bypass exists
 */

import { isSafeRelPath } from './src/routes/indexer.js';

// Test cases for path traversal attacks
const maliciousPayloads = [
  // Basic traversal attempts
  '../../../etc/passwd',
  '..\\..\\..\\windows\\system32',
  '/etc/passwd',
  'C:\\Windows\\System32',

  // Encoded traversal attempts
  '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
  '%2E%2E%2F%2E%2E%2F%2E%2E%2Fetc%2Fpasswd',
  '..%2f..%2f..%2fetc%2fpasswd',
  '..%2F..%2F..%2Fetc%2Fpasswd',

  // Mixed encoding
  '%2e%2e/%2e%2e/%2e%2e/etc/passwd',
  '../%2e%2e/../%2e%2e/../etc/passwd',

  // Double encoding
  '%252e%252e%252f%252e%252e%252f%252e%252e%252fetc%252fpasswd',

  // Unicode and special characters
  '..%c0%af..%c0%af..%c0%afetc%c0%afpasswd',
  '..%c1%9c..%c1%9c..%c1%9cetc%c1%9cpasswd',

  // Null byte injection
  '../../../etc/passwd\0',
  '../etc/passwd\0\0\0',
  'file.txt\0../../../etc/passwd',

  // Long path attacks
  '../../../' + 'a'.repeat(250) + '/etc/passwd',
  'a'.repeat(300),

  // Command injection characters
  'file.txt; cat /etc/passwd',
  'file.txt|cat /etc/passwd',
  'file.txt`cat /etc/passwd`',
  'file.txt$(cat /etc/passwd)',

  // Newline and carriage return
  'file.txt\ncat /etc/passwd',
  'file.txt\rcat /etc/passwd',
  'file.txt\r\ncat /etc/passwd',

  // Tab characters
  'file.txt\tcat /etc/passwd',

  // Windows-specific attacks
  'CON',
  'PRN',
  'AUX',
  'NUL',
  'COM1',
  'LPT1',
  '\\\\.\\PhysicalDrive0',
  '\\\\?\\C:\\Windows\\System32',

  // UNC path attacks
  '\\\\server\\share\\file',
  '\\\\127.0.0.1\\c$\\windows\\system32',

  // Glob pattern attacks
  '**/../../../etc/passwd',
  '../**',
  '{../,../,../}etc/passwd',
  '**/*',

  // Symlink attacks
  'symlink_to_etc',
  'link/../../../etc/passwd',

  // Case variations
  '..\\..\\..\\WINDOWS\\SYSTEM32',
  '/ETC/PASSWD',
  '%2E%2E%2F%2E%2E%2F%2E%2E%2FETC%2FPASSWD',

  // Mixed slashes
  '..\\../..\\../etc/passwd',
  '..//..//..//etc/passwd',

  // Path normalization bypass attempts
  '././../etc/passwd',
  'foo/bar/../../../etc/passwd',
  'foo/./bar/../../etc/passwd',

  // Whitespace attacks
  ' ../etc/passwd',
  '../etc/passwd ',
  '../etc/passwd\t',
  '../etc/passwd\n',

  // Reserved characters
  'file.txt:Zone.Identifier',
  'file.txt:$DATA',

  // Device file attacks
  '/dev/null',
  '/dev/zero',
  '/dev/random',
  '/proc/version',
  '/proc/self/environ',
  '/sys/class/block',
];

// Valid paths that should be allowed
const validPaths = [
  'file.txt',
  'src/components/Button.tsx',
  'docs/README.md',
  'package.json',
  'src/utils/helper.js',
  'test/spec/test.test.js',
  'config/app.config.json',
  'public/images/logo.png',
  'styles/main.css',
  'scripts/build.sh',
];

console.log('🔒 Testing Path Traversal Security Fixes\n');

let failedTests = 0;
let passedTests = 0;

console.log('🚨 Testing Malicious Payloads (should be rejected):');
maliciousPayloads.forEach((payload, index) => {
  try {
    const result = isSafeRelPath(payload);
    if (!result) {
      console.log(
        `✅ Test ${index + 1}: REJECTED (correct) - ${payload.substring(0, 50)}${payload.length > 50 ? '...' : ''}`,
      );
      passedTests++;
    } else {
      console.log(`❌ Test ${index + 1}: ACCEPTED (vulnerability!) - ${payload}`);
      failedTests++;
    }
  } catch (error) {
    console.log(`⚠️  Test ${index + 1}: ERROR - ${payload} - ${error.message}`);
    failedTests++;
  }
});

console.log('\n✅ Testing Valid Paths (should be accepted):');
validPaths.forEach((path, index) => {
  try {
    const result = isSafeRelPath(path);
    if (result) {
      console.log(`✅ Valid ${index + 1}: ACCEPTED (correct) - ${path}`);
      passedTests++;
    } else {
      console.log(`❌ Valid ${index + 1}: REJECTED (overly strict) - ${path}`);
      failedTests++;
    }
  } catch (error) {
    console.log(`⚠️  Valid ${index + 1}: ERROR - ${path} - ${error.message}`);
    failedTests++;
  }
});

console.log('\n📊 Test Results:');
console.log(`Total tests: ${maliciousPayloads.length + validPaths.length}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log(
  `Success rate: ${((passedTests / (maliciousPayloads.length + validPaths.length)) * 100).toFixed(2)}%`,
);

if (failedTests > 0) {
  console.log('\n🚨 SECURITY VULNERABILITY DETECTED!');
  process.exit(1);
} else {
  console.log('\n✅ All security tests passed!');
  process.exit(0);
}
