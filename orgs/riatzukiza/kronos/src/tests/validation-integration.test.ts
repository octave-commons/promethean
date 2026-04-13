/**
 * @fileoverview Integration tests for MCP comprehensive input validation
 */

import test from 'ava';
import { validateMcpOperation, validateMcpPath, validateMcpPathArray } from '../validation/index.js';

// Mock root path for testing
const TEST_ROOT = '/test/root';

test('validateMcpPath accepts valid paths', async (t) => {
  const validPaths = [
    'docs/readme.md',
    'src/index.ts',
    'package.json',
    'config/settings.json',
  ];

  for (const path of validPaths) {
    const result = await validateMcpOperation(TEST_ROOT, path, 'read');
    t.true(result.valid, `Valid path should pass: ${path}`);
    if (result.valid) {
      t.truthy(result.sanitizedPath);
    }
  }
});

test('validateMcpPath rejects dangerous paths', async (t) => {
  const dangerousPaths = [
    '../../../etc/passwd',
    '%2e%2e%2fetc/passwd',
    '..\\..\\windows\\system32',
    '/etc/passwd',
    '~/.ssh/authorized_keys',
    'file.txt; rm -rf /',
    'file.txt && cat /etc/passwd',
  ];

  for (const path of dangerousPaths) {
    const result = await validateMcpOperation(TEST_ROOT, path, 'read');
    t.false(result.valid, `Dangerous path should be rejected: ${path}`);
    t.truthy(result.error);
  }
});

test('validateMcpPathArray accepts valid arrays', async (t) => {
  const validArrays = [
    ['docs/readme.md', 'src/index.ts'],
    ['package.json', 'config/settings.json'],
  ];

  for (const array of validArrays) {
    const result = validateMcpPathArray(array);
    t.true(result.success, `Valid array should pass: ${JSON.stringify(array)}`);
  }
});

test('validateMcpPathArray rejects dangerous arrays', async (t) => {
  const dangerousArrays = [
    ['../../../etc/passwd', 'legitimate.txt'],
    ['docs/readme.md', '../secret'],
    ['%2e%2e%2fetc/passwd', 'normal.txt'],
  ];

  for (const array of dangerousArrays) {
    const result = validateMcpPathArray(array);
    t.false(result.success, `Dangerous array should be rejected: ${JSON.stringify(array)}`);
  }
});

test('validateMcpOperation handles different operation types', async (t) => {
  const validPath = 'docs/readme.md';
  
  const readResult = await validateMcpOperation(TEST_ROOT, validPath, 'read');
  t.true(readResult.valid, 'Read operation should work for valid path');
  
  const writeResult = await validateMcpOperation(TEST_ROOT, validPath, 'write');
  t.true(writeResult.valid, 'Write operation should work for valid path');
  
  const listResult = await validateMcpOperation(TEST_ROOT, validPath, 'list');
  t.true(listResult.valid, 'List operation should work for valid path');
  
  const treeResult = await validateMcpOperation(TEST_ROOT, validPath, 'tree');
  t.true(treeResult.valid, 'Tree operation should work for valid path');
});

test('validateMcpOperation rejects null/undefined inputs', async (t) => {
  const nullResult = await validateMcpOperation(TEST_ROOT, null as any, 'read');
  t.false(nullResult.valid, 'Null input should be rejected');
  
  const undefinedResult = await validateMcpOperation(TEST_ROOT, undefined as any, 'read');
  t.false(undefinedResult.valid, 'Undefined input should be rejected');
});

test('validateMcpOperation handles Unicode attacks', async (t) => {
  const unicodeAttacks = [
    '‥/etc/passwd', // Unicode two-dot leader
    '﹒/etc/passwd', // Unicode small full stop
    '．/etc/passwd', // Unicode fullwidth full stop
    '．．/etc/passwd', // Double fullwidth full stop
  ];

  for (const attack of unicodeAttacks) {
    const result = await validateMcpOperation(TEST_ROOT, attack, 'read');
    t.false(result.valid, `Unicode attack should be rejected: ${attack}`);
  }
});

test('validateMcpOperation handles type confusion attacks', async (t) => {
  const typeAttacks = [
    null,
    undefined,
    123,
    { toString: () => '../../../etc/passwd' },
    [],
    {},
  ];

  for (const attack of typeAttacks) {
    const result = await validateMcpOperation(TEST_ROOT, attack as any, 'read');
    t.false(result.valid, `Type attack should be rejected: ${typeof attack}`);
  }
});

test('validateMcpPath handles edge cases', async (t) => {
  const edgeCases = [
    '', // Empty string
    '.', // Current directory
    './', // Current directory with slash
    'file with spaces.txt', // Spaces in filename
    'file-with-dashes.txt', // Dashes in filename
    'file_with_underscores.txt', // Underscores in filename
    'file.with.dots.txt', // Multiple dots
  ];

  for (const edgeCase of edgeCases) {
    const result = validateMcpPath(edgeCase);
    if (edgeCase === '') {
      t.false(result.success, 'Empty string should be rejected');
    } else {
      t.true(result.success, `Edge case should pass: ${edgeCase}`);
    }
  }
});

test('validateMcpPathArray handles mixed valid/invalid arrays', async (t) => {
  const mixedArrays = [
    ['valid.txt', '../../../etc/passwd'], // Mixed valid/invalid
    ['../../../etc/passwd', 'valid.txt'], // Invalid first
    ['valid.txt', '../invalid.txt'], // Subtle invalid
  ];

  for (const mixedArray of mixedArrays) {
    const result = validateMcpPathArray(mixedArray);
    t.false(result.success, `Mixed array should be rejected: ${JSON.stringify(mixedArray)}`);
  }
});

test('validateMcpOperation provides detailed error messages', async (t) => {
  const dangerousPath = '../../../etc/passwd';
  const result = await validateMcpOperation(TEST_ROOT, dangerousPath, 'read');
  
  t.false(result.valid, 'Dangerous path should be rejected');
  t.truthy(result.error, 'Error message should be provided');
  t.true(result.error!.length > 0, 'Error message should not be empty');
});

test('validateMcpOperation handles very long paths', async (t) => {
  const veryLongPath = 'a'.repeat(300) + '.txt'; // Exceeds typical limits
  const result = await validateMcpOperation(TEST_ROOT, veryLongPath, 'read');
  
  t.false(result.valid, 'Very long path should be rejected');
  t.truthy(result.error);
});

test('validateMcpOperation handles special characters', async (t) => {
  const specialCharPaths = [
    'file.txt\r\n', // Newline injection
    'file.txt\x00', // Null byte injection
    'file.txt|rm -rf /', // Pipe injection
    'file.txt`cat /etc/passwd`', // Backtick injection
    'file.txt$(cat /etc/passwd)', // Command substitution
  ];

  for (const path of specialCharPaths) {
    const result = await validateMcpOperation(TEST_ROOT, path, 'read');
    t.false(result.valid, `Special character attack should be rejected: ${path}`);
  }
});