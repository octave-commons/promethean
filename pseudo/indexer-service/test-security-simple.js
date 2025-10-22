// Simple security validation test
// This bypasses TypeScript compilation issues to test core logic

const path = require('path');

// Simple path traversal detection
function detectPathTraversal(inputPath) {
  if (typeof inputPath !== 'string') {
    return { valid: false, reason: 'Path must be a string' };
  }

  // Check for obvious traversal patterns
  const traversalPatterns = [
    /\.\.[\/\\]/, // ../ or ..\
    /^[\/\\]/, // Starting with / or \
    /[\/\\]\.\./, // /.. or \..
  ];

  for (const pattern of traversalPatterns) {
    if (pattern.test(inputPath)) {
      return { valid: false, reason: 'Path traversal detected' };
    }
  }

  // Normalize and check if it resolves outside current directory
  const normalized = path.normalize(inputPath);
  if (normalized.includes('..')) {
    return { valid: false, reason: 'Path traversal after normalization' };
  }

  return { valid: true, normalized };
}

// Test cases
const maliciousPaths = [
  '../../../etc/passwd',
  '..\\..\\windows\\system32',
  '/etc/shadow',
  'C:\\Windows\\System32',
  'folder/../../../etc/passwd',
  'normal\\..\\..\\secret',
];

const safePaths = [
  'docs/readme.md',
  'src/components/Button.tsx',
  'package.json',
  'tests/unit/test.ts',
  'folder/subfolder/file.txt',
];

console.log('=== Testing Malicious Paths ===');
let blockedCount = 0;
maliciousPaths.forEach((testPath) => {
  const result = detectPathTraversal(testPath);
  console.log(
    `${testPath.padEnd(30)} -> ${result.valid ? 'ALLOWED' : 'BLOCKED'}${result.valid ? '' : ': ' + result.reason}`,
  );
  if (!result.valid) blockedCount++;
});

console.log(
  `\nBlocked ${blockedCount}/${maliciousPaths.length} malicious paths (${Math.round((blockedCount / maliciousPaths.length) * 100)}%)`,
);

console.log('\n=== Testing Safe Paths ===');
let allowedCount = 0;
safePaths.forEach((testPath) => {
  const result = detectPathTraversal(testPath);
  console.log(
    `${testPath.padEnd(30)} -> ${result.valid ? 'ALLOWED' : 'BLOCKED'}${result.valid ? '' : ': ' + result.reason}`,
  );
  if (result.valid) allowedCount++;
});

console.log(
  `\nAllowed ${allowedCount}/${safePaths.length} safe paths (${Math.round((allowedCount / safePaths.length) * 100)}%)`,
);

console.log('\n=== Summary ===');
const totalTests = maliciousPaths.length + safePaths.length;
const correctDecisions = blockedCount + allowedCount;
console.log(
  `Overall success rate: ${correctDecisions}/${totalTests} (${Math.round((correctDecisions / totalTests) * 100)}%)`,
);

if (correctDecisions === totalTests) {
  console.log('✅ All tests passed! Basic security validation is working.');
} else {
  console.log('❌ Some tests failed. Security validation needs improvement.');
}
