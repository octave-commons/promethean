// Simple test to verify the path validation fix logic
import path from 'path';

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
