#!/usr/bin/env node

/**
 * Test script to verify the indexer-service path traversal vulnerability fix
 */

import { validatePathSecurity } from './packages/indexer-service/src/validation/validators.js';

console.log('🔒 Testing indexer-service path traversal vulnerability fix...\n');

// Test cases that should be BLOCKED
const dangerousPatterns = [
  // Basic traversal
  '../../../etc/passwd',
  '../etc/passwd',
  '../../etc/passwd',

  // Glob-based traversal attacks
  '**/../etc/**',
  '../**',
  '**/..',
  '{../,../,../}**',
  '{..,..,..}/**',
  '**/{..,..}/**',

  // Brace expansion attacks
  '{etc/passwd,../etc/passwd}',
  '{**/..,../**}',
  '{a,b,../c}/**',

  // Unicode attacks
  '‥/etc/passwd', // Unicode two-dot leader
  '．．/etc/passwd', // Double fullwidth full stop
  '%2e%2e/etc/passwd', // URL encoded
  '%2E%2E/etc/passwd', // URL encoded uppercase

  // Mixed attacks
  '**/‥/**',
  '{../,‥,..}/**',
];

// Test cases that should be ALLOWED
const safePatterns = [
  'src/**/*.ts',
  'packages/*/src/**',
  'docs/**/*.md',
  'test/**/*.test.js',
  '{src,lib}/**/*.{ts,js}',
  'packages/**/!(*.test).ts',
  'src/components/**/[A-Z]*.tsx',
];

let blockedCount = 0;
let allowedCount = 0;
let falsePositives = 0;
let falseNegatives = 0;

console.log('🚫 Testing dangerous patterns (should be blocked):');
for (const pattern of dangerousPatterns) {
  const result = validatePathSecurity(pattern);
  const isBlocked = !result.valid;

  if (isBlocked) {
    console.log(`✅ BLOCKED: ${pattern} (${result.riskLevel})`);
    blockedCount++;
  } else {
    console.log(`❌ ALLOWED (VULNERABILITY!): ${pattern}`);
    falseNegatives++;
  }
}

console.log('\n✅ Testing safe patterns (should be allowed):');
for (const pattern of safePatterns) {
  const result = validatePathSecurity(pattern);
  const isAllowed = result.valid;

  if (isAllowed) {
    console.log(`✅ ALLOWED: ${pattern}`);
    allowedCount++;
  } else {
    console.log(`❌ BLOCKED (false positive): ${pattern} - ${result.securityIssues?.join(', ')}`);
    falsePositives++;
  }
}

console.log('\n📊 Results:');
console.log(`Dangerous patterns blocked: ${blockedCount}/${dangerousPatterns.length}`);
console.log(`Safe patterns allowed: ${allowedCount}/${safePatterns.length}`);
console.log(`False positives: ${falsePositives}`);
console.log(`False negatives: ${falseNegatives}`);

if (falseNegatives === 0 && falsePositives === 0) {
  console.log('\n🎉 All tests passed! The vulnerability fix is working correctly.');
  process.exit(0);
} else {
  console.log('\n💥 Tests failed! The vulnerability fix needs more work.');
  process.exit(1);
}
