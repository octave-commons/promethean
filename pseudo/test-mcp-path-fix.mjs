// Test the MCP package path validation fix
import path from 'path';

// Copy the fixed detectPathTraversal logic from MCP package
function detectPathTraversal(trimmed) {
  let decoded = trimmed;
  try {
    decoded = decodeURIComponent(trimmed);
  } catch {
    // If decoding fails, continue with original
  }

  let hasUnicodeAttack = false;
  let hasTraversal = false;

  // Check for %2e%2e patterns in both encoded and decoded forms
  if (/%2e%2e/i.test(trimmed) || /%2e%2e/i.test(decoded)) {
    hasTraversal = true;
  }

  // Apply Unicode normalization to catch homograph attacks
  const normalized = decoded.normalize('NFKC');

  // Check for unicode homograph characters
  const unicodeHomographs = [
    '‥', // Unicode two-dot leader (U+2025)
    '﹒', // Unicode small full stop (U+FE52)
    '．', // Unicode fullwidth full stop (U+FF0E)
    '．．', // Double fullwidth full stop
    '‥．', // Mixed unicode dots
    '．‥', // Mixed unicode dots
  ];

  // Check original string for unicode homographs
  for (const homograph of unicodeHomographs) {
    if (decoded.includes(homograph)) {
      hasUnicodeAttack = true;
      hasTraversal = true;
      break;
    }
  }

  // Check normalized string for dangerous patterns
  if (/\.\.\./.test(normalized)) {
    hasUnicodeAttack = true;
    hasTraversal = true;
  }

  const pathComponents = normalized.split(/[\\/]/);
  // FIXED: Only block '..' not '.'
  if (pathComponents.includes('..')) {
    hasTraversal = true;
  }

  const isAbsolutePath = path.isAbsolute(normalized);

  return {
    isTraversal: hasTraversal,
    isAbsolutePath,
    hasUnicodeAttack,
  };
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
const blockedPaths = ['..', '../file.txt', '../../etc/passwd', 'dir/../../../etc', '/etc/passwd'];

console.log('Testing allowed paths (should all be ✅ ALLOWED):');
let allowedFailures = 0;
allowedPaths.forEach((testPath) => {
  const result = detectPathTraversal(testPath);
  const isBlocked = result.isTraversal;
  const status = isBlocked ? '❌ BLOCKED' : '✅ ALLOWED';
  console.log(`${JSON.stringify(testPath)}: ${status}`);
  if (isBlocked) allowedFailures++;
});

console.log('\nTesting blocked paths (should all be ❌ BLOCKED):');
let blockedFailures = 0;
blockedPaths.forEach((testPath) => {
  const result = detectPathTraversal(testPath);
  const isBlocked = result.isTraversal;
  const status = isBlocked ? '✅ BLOCKED' : '❌ ALLOWED (should be blocked)';
  console.log(`${JSON.stringify(testPath)}: ${status}`);
  if (!isBlocked) blockedFailures++;
});

console.log(`\nSummary:`);
console.log(`Allowed paths failures: ${allowedFailures}/${allowedPaths.length}`);
console.log(`Blocked paths failures: ${blockedFailures}/${blockedPaths.length}`);

if (allowedFailures === 0 && blockedFailures === 0) {
  console.log('🎉 All tests passed! The MCP fix is working correctly.');
} else {
  console.log('❌ Some tests failed. The MCP fix needs more work.');
}
