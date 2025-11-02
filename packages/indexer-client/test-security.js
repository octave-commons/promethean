#!/usr/bin/env node

/**
 * Simple security test runner for path validation
 */

// Import the path validation functions
import {
  validateAndNormalizePath,
  validateFilePatterns,
  createPathValidator,
} from './src/path-validation.js';

console.log('🔒 Running Path Traversal Security Tests...\n');

let passed = 0;
let failed = 0;

function test(description, testFn) {
  try {
    testFn();
    console.log(`✅ ${description}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${description}: ${error.message}`);
    failed++;
  }
}

function testThrows(description, fn, expectedMessage) {
  try {
    fn();
    console.log(`❌ ${description}: Expected function to throw`);
    failed++;
  } catch (error) {
    if (expectedMessage && !error.message.includes(expectedMessage)) {
      console.log(
        `❌ ${description}: Expected message containing "${expectedMessage}", got "${error.message}"`,
      );
      failed++;
    } else {
      console.log(`✅ ${description}`);
      passed++;
    }
  }
}

// Test 1: Null byte injection
testThrows('should reject null byte injection', () => {
  validateAndNormalizePath('path\0malicious');
});

testThrows('should reject null byte at end', () => {
  validateAndNormalizePath('path\0');
});

// Test 2: Path traversal attempts
testThrows(
  'should reject obvious path traversal',
  () => {
    validateAndNormalizePath('../../../etc/passwd');
  },
  'Path traversal detected',
);

testThrows(
  'should reject Windows path traversal',
  () => {
    validateAndNormalizePath('..\\..\\..\\windows\\system32\\config\\sam');
  },
  'Path traversal detected',
);

testThrows(
  'should reject mixed traversal',
  () => {
    validateAndNormalizePath('folder/../../../etc/passwd');
  },
  'Path traversal detected',
);

// Test 3: Encoded traversal
testThrows(
  'should reject URL encoded traversal',
  () => {
    validateAndNormalizePath('..%2F..%2F..%2Fetc%2Fpasswd');
  },
  'Encoded path traversal detected',
);

testThrows(
  'should reject Windows encoded traversal',
  () => {
    validateAndNormalizePath('..%5C..%5C..%5Cwindows%5Csystem32');
  },
  'Encoded path traversal detected',
);

// Test 4: Absolute paths
testThrows(
  'should reject absolute Linux paths',
  () => {
    validateAndNormalizePath('/etc/passwd');
  },
  'Absolute paths not allowed',
);

testThrows(
  'should reject absolute Windows paths',
  () => {
    validateAndNormalizePath('C:\\Windows\\System32');
  },
  'Absolute paths not allowed',
);

// Test 5: Suspicious system directories
testThrows(
  'should reject etc directory access',
  () => {
    validateAndNormalizePath('folder/etc/passwd');
  },
  'Suspicious path pattern detected',
);

testThrows(
  'should reject proc directory access',
  () => {
    validateAndNormalizePath('folder/proc/cpuinfo');
  },
  'Suspicious path pattern detected',
);

testThrows(
  'should reject sys directory access',
  () => {
    validateAndNormalizePath('folder/sys/kernel');
  },
  'Suspicious path pattern detected',
);

testThrows(
  'should reject Windows system directory',
  () => {
    validateAndNormalizePath('folder/windows/system32');
  },
  'Suspicious path pattern detected',
);

// Test 6: Safe paths should work
test('should allow safe relative paths', () => {
  const result = validateAndNormalizePath('src/index.ts');
  if (result !== 'src/index.ts') throw new Error(`Expected "src/index.ts", got "${result}"`);
});

test('should normalize path separators', () => {
  const result = validateAndNormalizePath('src\\index.ts');
  if (result !== 'src/index.ts') throw new Error(`Expected "src/index.ts", got "${result}"`);
});

test('should handle current directory components', () => {
  const result = validateAndNormalizePath('src/./index.ts');
  if (result !== 'src/index.ts') throw new Error(`Expected "src/index.ts", got "${result}"`);
});

// Test 7: Pattern validation
testThrows(
  'should reject non-array patterns',
  () => {
    validateFilePatterns('not-an-array');
  },
  'Patterns must be an array',
);

testThrows(
  'should reject empty patterns',
  () => {
    validateFilePatterns(['']);
  },
  'Each pattern must be a non-empty string',
);

testThrows(
  'should reject dangerous characters in patterns',
  () => {
    validateFilePatterns(['$(rm -rf /)']);
  },
  'Pattern contains potentially dangerous characters',
);

test('should allow safe glob patterns', () => {
  const result = validateFilePatterns(['*.ts', '*.js']);
  if (JSON.stringify(result) !== JSON.stringify(['*.ts', '*.js'])) {
    throw new Error(`Expected ["*.ts", "*.js"], got ${JSON.stringify(result)}`);
  }
});

// Test 8: Real-world attack scenarios
const attacks = [
  '../../../etc/passwd',
  '..%2F..%2F..%2Fetc%2Fpasswd',
  '/etc/passwd',
  '/etc/shadow',
  '/proc/version',
  '/sys/kernel/version',
  '..\\..\\..\\windows\\system32\\config\\sam',
  'C:\\Windows\\System32\\drivers\\etc\\hosts',
  'windows/system32/config/sam',
  'program files/internet explorer/iexplore.exe',
];

attacks.forEach((attack, i) => {
  testThrows(`attack ${i + 1}: should block ${attack}`, () => {
    validateAndNormalizePath(attack);
  });
});

// Test 9: Legitimate paths
const legitimate = [
  'src/index.ts',
  'docs/readme.md',
  'packages/utils/helper.js',
  'tests/security.test.js',
  'config/app.json',
  'public/css/style.css',
  'scripts/build.sh',
  'assets/images/logo.png',
];

legitimate.forEach((path, i) => {
  test(`legitimate ${i + 1}: should allow ${path}`, () => {
    const result = validateAndNormalizePath(path);
    if (!result || result.length === 0) {
      throw new Error(`Expected valid result for "${path}"`);
    }
  });
});

console.log(`\n📊 Test Results:`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (failed > 0) {
  console.log(
    '\n⚠️  Some security tests failed! The path validation may not be working correctly.',
  );
  process.exit(1);
} else {
  console.log('\n🎉 All security tests passed! Path traversal vulnerability is fixed.');
  process.exit(0);
}
