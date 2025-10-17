#!/usr/bin/env node

/**
 * Security Test for Path Traversal Vulnerability Fix
 * Tests various malicious payloads to ensure no bypass exists
 */

// Copy of the security functions from indexer.ts for testing
function validateBasicPathProperties(rel) {
  if (typeof rel !== 'string') {
    return false;
  }

  if (rel.length === 0 || rel.length > 256) {
    return false;
  }

  if (rel.includes('\0')) {
    return false;
  }

  const trimmed = rel.trim();
  if (trimmed !== rel) {
    return false;
  }

  return true;
}

function detectPathTraversal(trimmed) {
  const pathComponents = trimmed.split(/[\\/]/);
  
  // Check for explicit traversal attempts
  if (pathComponents.includes('..')) {
    return true;
  }
  
  // Check for encoded traversal attempts
  if (pathComponents.some(comp => 
    comp.toLowerCase().includes('%2e%2e') || 
    comp.toLowerCase().includes('..') ||
    comp.includes('%2e') || comp.includes('%2E')
  )) {
    return true;
  }

  // Check for absolute paths (both Unix and Windows)
  if (trimmed.startsWith('/') || /^[a-zA-Z]:/.test(trimmed)) {
    return true;
  }

  // Check for UNC paths
  if (trimmed.startsWith('\\\\')) {
    return true;
  }

  return false;
}

  // Check for encoded traversal attempts
  if (
    pathComponents.some(
      (comp) =>
        comp.toLowerCase().includes('%2e%2e') ||
        comp.toLowerCase().includes('..') ||
        comp.includes('%2e') ||
        comp.includes('%2E'),
    )
  ) {
    return true;
  }

  // Check for absolute paths (both Unix and Windows)
  if (require('path').isAbsolute(trimmed) || /^[a-zA-Z]:/.test(trimmed)) {
    return true;
  }

  // Check for UNC paths
  if (trimmed.startsWith('\\\\')) {
    return true;
  }

  return false;
}

function containsDangerousCharacters(trimmed) {
  const dangerousChars = ['<', '>', '|', '&', ';', '`', '$', '"', "'", '\n', '\r', '\t'];
  return dangerousChars.some((char) => trimmed.includes(char));
}

function validateWindowsPathSecurity(trimmed) {
  // Block drive letters (C:, D:, etc.)
  if (/^[a-zA-Z]:/.test(trimmed)) {
    return false;
  }

  // Block UNC paths
  if (trimmed.startsWith('\\\\')) {
    return false;
  }

  // Block Windows-style backslash paths
  if (trimmed.includes('\\')) {
    return false;
  }

  // Block reserved device names
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9',
  ];
  
  // Simple basename extraction
  const baseName = trimmed.split(/[\\/]/).pop()?.toUpperCase() || '';
  if (reservedNames.includes(baseName)) {
    return false;
  }

  return true;
}

  // Block UNC paths
  if (trimmed.startsWith('\\\\')) {
    return false;
  }

  // Block Windows-style backslash paths
  if (trimmed.includes('\\')) {
    return false;
  }

  // Block reserved device names
  const reservedNames = [
    'CON',
    'PRN',
    'AUX',
    'NUL',
    'COM1',
    'COM2',
    'COM3',
    'COM4',
    'COM5',
    'COM6',
    'COM7',
    'COM8',
    'COM9',
    'LPT1',
    'LPT2',
    'LPT3',
    'LPT4',
    'LPT5',
    'LPT6',
    'LPT7',
    'LPT8',
    'LPT9',
  ];
  const baseName = require('path').basename(trimmed).toUpperCase();
  if (reservedNames.includes(baseName)) {
    return false;
  }

  return true;
}

function validateUnixPathSecurity(trimmed) {
  if (process.platform !== 'win32') {
    // Block device paths
    if (trimmed.startsWith('/dev/')) {
      return false;
    }
    // Block proc filesystem
    if (trimmed.startsWith('/proc/')) {
      return false;
    }
    // Block sys filesystem
    if (trimmed.startsWith('/sys/')) {
      return false;
    }
  }
  return true;
}

function validatePathNormalization(trimmed) {
  try {
    // Use Node.js path module
    const path =
      typeof require !== 'undefined'
        ? require('path')
        : {
            normalize: (p) => p,
            isAbsolute: (p) => p.startsWith('/'),
            resolve: (...args) => args.join('/').replace(/\/+/g, '/'),
          };

    // First normalize the path
    const normalized = path.normalize(trimmed);

    // Check for absolute paths or traversal after normalization
    if (path.isAbsolute(normalized) || normalized.includes('..')) {
      return false;
    }

    // Additional check: resolve against a fake root to ensure no traversal
    const fakeRoot = '/fake/root';
    const resolved = path.resolve(fakeRoot, normalized);
    if (!resolved.startsWith(fakeRoot)) {
      return false;
    }

    // Check for double slashes which might indicate bypass attempts
    if (normalized.includes('//') || normalized.includes('\\\\')) {
      return false;
    }

    // Final check: ensure no null bytes after normalization
    if (normalized.includes('\0')) {
      return false;
    }
  } catch {
    return false;
  }
  return true;
}

function containsGlobAttackPatterns(trimmed) {
  const attackPatterns = [
    /\*\*.*\.\./, // ** followed by ..
    /\.\.\/\*\*/, // ../**
    /\{\.\./, // {.. in brace expansion
    /\.\.\}/, // ..} in brace expansion
  ];

  return attackPatterns.some((pattern) => pattern.test(trimmed));
}

function isSafeRelPath(rel) {
  if (!validateBasicPathProperties(rel)) {
    return false;
  }

  const trimmed = rel.trim();

  if (detectPathTraversal(trimmed)) {
    return false;
  }

  if (containsDangerousCharacters(trimmed)) {
    return false;
  }

  if (!validateWindowsPathSecurity(trimmed)) {
    return false;
  }

  if (!validateUnixPathSecurity(trimmed)) {
    return false;
  }

  if (!validatePathNormalization(trimmed)) {
    return false;
  }

  if (containsGlobAttackPatterns(trimmed)) {
    return false;
  }

  return true;
}

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
