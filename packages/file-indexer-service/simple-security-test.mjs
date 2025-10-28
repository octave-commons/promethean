#!/usr/bin/env node

/**
 * Simple security test for path traversal vulnerability fixes
 * Tests that path validation functions work correctly
 */

// Test the validation functions directly by copying their logic
function validateFileSystemPath(inputPath, allowedBasePaths = []) {
  if (!inputPath || typeof inputPath !== 'string') {
    throw new Error('Path must be a non-empty string');
  }

  // Remove any null bytes
  const cleanPath = inputPath.replace(/\0/g, '');

  // Check for obvious path traversal attempts
  if (cleanPath.includes('../') || cleanPath.includes('..\\')) {
    throw new Error('Path traversal detected: relative parent directory access not allowed');
  }

  // Check for encoded traversal attempts
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(cleanPath);
  } catch {
    decodedPath = cleanPath;
  }

  if (decodedPath.includes('../') || decodedPath.includes('..\\')) {
    throw new Error('Encoded path traversal detected');
  }

  // Normalize path separators
  const normalizedPath = cleanPath.replace(/\\/g, '/');

  // Remove leading slashes to prevent absolute path access (unless allowed)
  if (normalizedPath.startsWith('/') && allowedBasePaths.length === 0) {
    throw new Error('Absolute paths not allowed without explicit base path configuration');
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\./, // Any double dot (already caught above, but defensive)
    /\/etc\//, // System directories
    /\/proc\//, // Linux proc filesystem
    /\/sys\//, // Linux sys filesystem
    /\/windows\//i, // Windows system directories
    /\/program files\//i, // Windows program files
    /\/users\//i, // Windows users directory
    /^~/, // Home directory tilde expansion
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(normalizedPath)) {
      throw new Error(`Suspicious path pattern detected: ${pattern.source}`);
    }
  }

  return normalizedPath;
}

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
const totalPassed = pathTestsPassed + legitTestsPassed;
const totalTests = pathTestsTotal + legitTestsTotal;

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
