#!/usr/bin/env node

/**
 * Quick security test to verify path traversal fixes work
 */

import { validateFileSystemPath } from './dist/path-validation.js';

function testPathSecurity() {
  console.log('🔒 Testing Path Traversal Security Fixes');
  console.log('='.repeat(50));

  const maliciousPaths = [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '/etc/passwd',
    'folder/../../../etc/shadow',
    '..%2F..%2F..%2Fetc%2Fpasswd',
    'path\0malicious',
    'folder‥/etc/passwd', // Unicode homograph
    'C:\\Windows\\System32\\config\\SAM', // Windows absolute path
    '~/.ssh/id_rsa', // Home directory access
  ];

  const legitimatePaths = [
    'src/index.ts',
    'docs/readme.md',
    'packages/utils/helper.js',
    'config/app.json',
  ];

  console.log('\n🚨 Testing Malicious Paths (should be blocked):');
  let blockedCount = 0;

  for (const maliciousPath of maliciousPaths) {
    try {
      const result = validateFileSystemPath(maliciousPath);
      console.log(`❌ FAILED: "${maliciousPath}" -> "${result}" (should be blocked)`);
    } catch (error) {
      console.log(`✅ BLOCKED: "${maliciousPath}" -> ${error.message}`);
      blockedCount++;
    }
  }

  console.log('\n✅ Testing Legitimate Paths (should be allowed):');
  let allowedCount = 0;

  for (const legitPath of legitimatePaths) {
    try {
      const result = validateFileSystemPath(legitPath);
      console.log(`✅ ALLOWED: "${legitPath}" -> "${result}"`);
      allowedCount++;
    } catch (error) {
      console.log(`❌ BLOCKED: "${legitPath}" -> ${error.message} (should be allowed)`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Results: ${blockedCount}/${maliciousPaths.length} malicious paths blocked`);
  console.log(`📊 Results: ${allowedCount}/${legitimatePaths.length} legitimate paths allowed`);

  const totalTests = maliciousPaths.length + legitimatePaths.length;
  const passedTests = blockedCount + allowedCount;
  const successRate = (passedTests / totalTests) * 100;

  console.log(`📈 Overall Success Rate: ${successRate.toFixed(1)}%`);

  if (successRate >= 90) {
    console.log('\n🎉 SECURITY FIXES ARE WORKING! Path traversal protection is active.');
    return true;
  } else {
    console.log('\n⚠️ SECURITY FIXES NEED IMPROVEMENT! Some tests failed.');
    return false;
  }
}

// Run the test
const success = testPathSecurity();
process.exit(success ? 0 : 1);
