// Simple test to verify the path validation fix logic
import path from 'path';

const WINDOWS_RESERVED_NAMES = [
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

// Copy the fixed logic from the MCP adapter
function detectPathTraversal(trimmed) {
  // Normalize Unicode first to prevent homograph attacks
  const normalized = trimmed.normalize('NFKC');

  const pathComponents = normalized.split(/[\\/]/);
  // FIXED: Only block '..' not '.'
  if (pathComponents.includes('..')) {
    return true;
  }

  if (path.isAbsolute(normalized)) {
    return true;
  }

  // Check for Unicode homograph attacks that can normalize to traversal
  if (/[‥﹒．．．]/.test(normalized) || /[‥﹒．]/.test(trimmed)) {
    return true;
  }

  return false;
}

function validateWindowsPathSecurity(trimmed) {
  // Block drive letters
  if (/^[a-zA-Z]:/.test(trimmed)) {
    return false;
  }

  // Block UNC paths
  if (trimmed.startsWith('\\\\')) {
    return false;
  }

  // Block backslash paths
  if (trimmed.includes('\\')) {
    return false;
  }

  // Block reserved device names
  const baseName = path.basename(trimmed).toUpperCase();
  if (WINDOWS_RESERVED_NAMES.includes(baseName)) {
    return false;
  }

  return true;
}

function isSafeRelPath(rel) {
  const trimmed = rel.trim();

  if (detectPathTraversal(trimmed)) {
    return false;
  }

  if (!validateWindowsPathSecurity(trimmed)) {
    return false;
  }

  return true;
}

// Test cases that should be allowed (current directory references)
const allowedPaths = [
  '.',
  './',
  './file.txt',
  'dir/.hidden',
  './src/components',
  '',
  'file.txt',
  'src/app.ts',
  '.config',
  'dir/.env',
];

// Test cases that should be blocked (parent directory traversal)
const blockedPaths = [
  '..',
  '../file.txt',
  '../../etc/passwd',
  'dir/../../../etc',
  '/etc/passwd',
  'C:\\Windows\\System32',
];

console.log('Testing allowed paths (should all be ✅):');
let allowedFailures = 0;
allowedPaths.forEach((testPath) => {
  const isBlocked = detectPathTraversal(testPath);
  const status = isBlocked ? '❌ BLOCKED' : '✅ ALLOWED';
  console.log(`${JSON.stringify(testPath)}: ${status}`);
  if (isBlocked) allowedFailures++;
});

console.log('\nTesting blocked paths (should all be ❌):');
let blockedFailures = 0;
blockedPaths.forEach((testPath) => {
  const isBlocked = detectPathTraversal(testPath);
  const status = isBlocked ? '✅ BLOCKED' : '❌ ALLOWED (should be blocked)';
  console.log(`${JSON.stringify(testPath)}: ${status}`);
  if (!isBlocked) blockedFailures++;
});

console.log(`\nSummary:`);
console.log(`Allowed paths failures: ${allowedFailures}/${allowedPaths.length}`);
console.log(`Blocked paths failures: ${blockedFailures}/${blockedPaths.length}`);

if (allowedFailures === 0 && blockedFailures === 0) {
  console.log('🎉 All tests passed! The fix is working correctly.');
} else {
  console.log('❌ Some tests failed. The fix needs more work.');
}
