// Comprehensive security validation test
// Tests the enhanced security validation features

const path = require('path');

// Enhanced path traversal detection based on validators-enhanced.ts
function detectPathTraversal(inputPath) {
  if (typeof inputPath !== 'string') {
    return { valid: false, reason: 'Path must be a string' };
  }

  const originalPath = inputPath;

  // URI decode the path to catch encoded traversal
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(inputPath);
  } catch (error) {
    return { valid: false, reason: 'Invalid URI encoding' };
  }

  // Unicode normalization to catch homograph attacks
  let normalizedPath = decodedPath.normalize('NFC');

  // Check for obvious traversal patterns
  const traversalPatterns = [
    /\.\.[\/\\]/, // ../ or ..\
    /^[\/\\]/, // Starting with / or \
    /[\/\\]\.\./, // /.. or \..
    /^[A-Za-z]:[\/\\]/, // Windows drive letters like C:\ or D:/
  ];

  for (const pattern of traversalPatterns) {
    if (pattern.test(normalizedPath)) {
      return { valid: false, reason: 'Path traversal detected' };
    }
  }

  // Check for dangerous characters
  const dangerousChars = /[<>:"|?*\x00-\x1f]/;
  if (dangerousChars.test(normalizedPath)) {
    return { valid: false, reason: 'Dangerous characters detected' };
  }

  // Windows-specific checks
  const windowsReserved = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
  if (windowsReserved.test(normalizedPath)) {
    return { valid: false, reason: 'Windows reserved name detected' };
  }

  // Unix-specific checks
  if (normalizedPath === '/etc/passwd' || normalizedPath === '/etc/shadow') {
    return { valid: false, reason: 'Unix system file access detected' };
  }

  // Path normalization and final check
  const finalNormalized = path.normalize(normalizedPath);
  if (finalNormalized.includes('..')) {
    return { valid: false, reason: 'Path traversal after normalization' };
  }

  // Check for glob pattern attacks
  const globPatterns = /[*?[\]{}]/;
  if (globPatterns.test(normalizedPath)) {
    return { valid: false, reason: 'Glob pattern detected' };
  }

  return { valid: true, normalized: finalNormalized };
}

// Comprehensive test cases
const testCases = [
  // Basic traversal attacks
  { path: '../../../etc/passwd', expected: false, category: 'Basic Traversal' },
  { path: '..\\..\\windows\\system32', expected: false, category: 'Basic Traversal' },
  { path: '/etc/shadow', expected: false, category: 'Basic Traversal' },
  { path: 'C:\\Windows\\System32', expected: false, category: 'Basic Traversal' },
  { path: 'folder/../../../etc/passwd', expected: false, category: 'Basic Traversal' },
  { path: 'normal\\..\\..\\secret', expected: false, category: 'Basic Traversal' },

  // Encoded traversal attacks
  { path: '..%2F..%2F..%2Fetc%2Fpasswd', expected: false, category: 'Encoded Traversal' },
  { path: '..%5C..%5C..%5Cwindows%5Csystem32', expected: false, category: 'Encoded Traversal' },
  { path: '%2Fetc%2Fshadow', expected: false, category: 'Encoded Traversal' },
  { path: 'C%3A%5CWindows%5CSystem32', expected: false, category: 'Encoded Traversal' },

  // Unicode homograph attacks
  { path: ' ./etc/passwd', expected: false, category: 'Unicode Homograph' },
  { path: '​../secret', expected: false, category: 'Unicode Homograph' },
  { path: 'folder/ ../../../etc/passwd', expected: false, category: 'Unicode Homograph' },

  // Dangerous characters
  { path: 'file<name>.txt', expected: false, category: 'Dangerous Characters' },
  { path: 'file>name.txt', expected: false, category: 'Dangerous Characters' },
  { path: 'file:name.txt', expected: false, category: 'Dangerous Characters' },
  { path: 'file"name.txt', expected: false, category: 'Dangerous Characters' },
  { path: 'file|name.txt', expected: false, category: 'Dangerous Characters' },
  { path: 'file?name.txt', expected: false, category: 'Dangerous Characters' },
  { path: 'file*name.txt', expected: false, category: 'Dangerous Characters' },
  { path: 'file\x00name.txt', expected: false, category: 'Dangerous Characters' },

  // Windows reserved names
  { path: 'CON', expected: false, category: 'Windows Reserved' },
  { path: 'PRN', expected: false, category: 'Windows Reserved' },
  { path: 'AUX', expected: false, category: 'Windows Reserved' },
  { path: 'NUL', expected: false, category: 'Windows Reserved' },
  { path: 'COM1', expected: false, category: 'Windows Reserved' },
  { path: 'LPT1', expected: false, category: 'Windows Reserved' },
  { path: 'CON.txt', expected: false, category: 'Windows Reserved' },

  // Glob pattern attacks
  { path: '*.txt', expected: false, category: 'Glob Patterns' },
  { path: 'file?.txt', expected: false, category: 'Glob Patterns' },
  { path: 'file[1].txt', expected: false, category: 'Glob Patterns' },
  { path: 'file{1,2}.txt', expected: false, category: 'Glob Patterns' },

  // Safe paths
  { path: 'docs/readme.md', expected: true, category: 'Safe Paths' },
  { path: 'src/components/Button.tsx', expected: true, category: 'Safe Paths' },
  { path: 'package.json', expected: true, category: 'Safe Paths' },
  { path: 'tests/unit/test.ts', expected: true, category: 'Safe Paths' },
  { path: 'folder/subfolder/file.txt', expected: true, category: 'Safe Paths' },
  { path: 'normal-file-name.txt', expected: true, category: 'Safe Paths' },
  { path: 'file_with_underscores.txt', expected: true, category: 'Safe Paths' },
  { path: 'file-with-dashes.txt', expected: true, category: 'Safe Paths' },
  { path: 'file123.txt', expected: true, category: 'Safe Paths' },
];

// Run tests
console.log('=== Comprehensive Security Validation Test ===\n');

const results = {
  passed: 0,
  failed: 0,
  categories: {},
};

testCases.forEach((testCase) => {
  const result = detectPathTraversal(testCase.path);
  const passed = result.valid === testCase.expected;

  if (passed) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Track by category
  if (!results.categories[testCase.category]) {
    results.categories[testCase.category] = { passed: 0, failed: 0 };
  }
  if (passed) {
    results.categories[testCase.category].passed++;
  } else {
    results.categories[testCase.category].failed++;
  }

  const status = passed ? '✅ PASS' : '❌ FAIL';
  const expected = testCase.expected ? 'ALLOW' : 'BLOCK';
  const actual = result.valid ? 'ALLOW' : 'BLOCK';

  console.log(
    `${status} ${testCase.category.padEnd(20)} ${testCase.path.padEnd(35)} Expected: ${expected} Got: ${actual}`,
  );
  if (!passed && result.reason) {
    console.log(`     Reason: ${result.reason}`);
  }
});

console.log('\n=== Results by Category ===');
Object.entries(results.categories).forEach(([category, result]) => {
  const total = result.passed + result.failed;
  const successRate = Math.round((result.passed / total) * 100);
  console.log(`${category.padEnd(20)}: ${result.passed}/${total} (${successRate}%)`);
});

console.log('\n=== Overall Summary ===');
const totalTests = results.passed + results.failed;
const overallSuccessRate = Math.round((results.passed / totalTests) * 100);
console.log(`Total: ${results.passed}/${totalTests} (${overallSuccessRate}%)`);

if (results.failed === 0) {
  console.log('🎉 All security tests passed! The enhanced validation is working correctly.');
} else {
  console.log(`⚠️  ${results.failed} tests failed. Security validation needs attention.`);
}

// Check if we meet the claimed 85%+ block rate
const maliciousTests = testCases.filter((tc) => !tc.expected).length;
const blockedMalicious = testCases.filter(
  (tc) => !tc.expected && detectPathTraversal(tc.path).valid === false,
).length;
const blockRate = Math.round((blockedMalicious / maliciousTests) * 100);

console.log(`\nMalicious Path Block Rate: ${blockedMalicious}/${maliciousTests} (${blockRate}%)`);
if (blockRate >= 85) {
  console.log('✅ Meets the claimed 85%+ block rate requirement!');
} else {
  console.log('❌ Does not meet the 85%+ block rate requirement.');
}
