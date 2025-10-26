#!/usr/bin/env node

/**
 * Debug script to test the failing security validation functions
 */

import { validatePathSecurity, validateSinglePath } from './dist/validation/validators.js';

console.log('🔍 Testing Security Validation Functions\n');

// Test the failing cases
console.log('1. Testing validateSinglePath with malicious paths:');
const maliciousPaths = [
  '%2e%2e/secret',
  '~/.ssh/authorized_keys',
  '../../../etc/passwd',
  '/etc/passwd',
];

maliciousPaths.forEach((path, index) => {
  console.log(`\nTest ${index + 1}: ${path}`);
  const result = validateSinglePath(path);
  console.log('Success:', result.success);
  if (!result.success) {
    console.log('Error message:', result.error?.message);
    console.log(
      'Error includes "Security validation failed":',
      result.error?.message.includes('Security validation failed'),
    );
  }
});

console.log('\n\n2. Testing validatePathSecurity risk levels:');
const riskTests = [
  { path: '%2e%2e/etc/passwd', expected: 'critical' },
  { path: '/etc/passwd', expected: 'high' },
  { path: '**/../file', expected: 'medium' },
  { path: 'docs/readme.md', expected: 'low' },
];

riskTests.forEach((test, index) => {
  console.log(`\nRisk Test ${index + 1}: ${test.path}`);
  const result = validatePathSecurity(test.path);
  console.log('Expected risk level:', test.expected);
  console.log('Actual risk level:', result.riskLevel);
  console.log('Valid:', result.valid);
  console.log('Security issues:', result.securityIssues);
  console.log('Match:', result.riskLevel === test.expected);
});
