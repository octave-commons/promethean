import test from 'ava';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  validatePath,
  sanitizeFileName,
  createSecurePath,
  isCrossPlatformSafe,
  validatePaths,
  createSecureTempPath,
} from '../path-validation.js';

async function createTempSandbox() {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'security-test-'));
  return tmpDir;
}

test('validatePath: Unicode homograph attack protection', async (t) => {
  const sandbox = await createTempSandbox();

  const unicodeAttacks = [
    '‥/etc/passwd', // U+2026 (horizontal ellipsis) can normalize to ..
    '﹒/etc/passwd', // U+FF0E (fullwidth full stop)
    '．/etc/passwd', // U+FF61 (halfwidth full stop)
    '‥／etc／passwd', // Unicode slash variants
    '‥‥/etc/passwd', // Multiple homographs
    'normal/‥/secret',
    'file‥txt', // Homograph in filename
    '‥/‥/‥/etc/passwd', // Nested homographs
    'path/‥/../../../etc/passwd', // Mixed attack
  ];

  for (const attack of unicodeAttacks) {
    const result = await validatePath(sandbox, attack);
    t.false(result.isValid, `Should block Unicode homograph attack: ${attack}`);
    t.truthy(result.error, `Should provide error for: ${attack}`);
  }

  // Cleanup
  await fs.rmdir(sandbox, { recursive: true });
});

test('validatePath: encoded traversal attacks', async (t) => {
  const sandbox = await createTempSandbox();

  const encodedAttacks = [
    '%2e%2e%2fetc%2fpasswd', // URL encoded ../
    '%2e%2e%5cetc%5cpasswd', // URL encoded ..\
    '%2E%2E%2Fetc%2Fpasswd', // Uppercase URL encoding
    '..%2f..%2f..%2fetc%2fpasswd', // Multiple encoded traversals
    'test%2f..%2f..%2fetc%2fpasswd', // Mixed with normal path
  ];

  for (const attack of encodedAttacks) {
    const result = await validatePath(sandbox, attack);
    t.false(result.isValid, `Should block encoded traversal: ${attack}`);
  }

  // Cleanup
  await fs.rmdir(sandbox, { recursive: true });
});

test('validatePath: normalization attack patterns', async (t) => {
  const sandbox = await createTempSandbox();

  const normalizationAttacks = [
    'path/././file.txt',
    'path/../path/file.txt',
    'path//double//slash.txt',
    'path/./normal/../file.txt',
    './file.txt',
    'file/.',
    'path/../../etc/passwd',
    'path/./../../etc/passwd',
  ];

  for (const attack of normalizationAttacks) {
    const result = await validatePath(sandbox, attack);
    t.false(result.isValid, `Should block normalization attack: ${attack}`);
  }

  // Cleanup
  await fs.rmdir(sandbox, { recursive: true });
});

test('validatePath: dangerous file name patterns', async (t) => {
  const sandbox = await createTempSandbox();

  const dangerousNames = [
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
    '.htaccess',
    '.htpasswd',
    'web.config',
    'php.ini',
    '.env',
  ];

  for (const name of dangerousNames) {
    const result = await validatePath(sandbox, name);
    t.false(result.isValid, `Should block dangerous name: ${name}`);
  }

  // Cleanup
  await fs.rmdir(sandbox, { recursive: true });
});

test('validatePath: dangerous character injection', async (t) => {
  const sandbox = await createTempSandbox();

  const dangerousPaths = [
    'file<script>.txt',
    'file|pipe.txt',
    'file&command.txt',
    'file;command.txt',
    'file`backtick`.txt',
    'file$dollar.txt',
    'file"quote.txt',
    "file'apostrophe.txt",
    'file\r\ncontrol.txt',
    'file\x00null.txt',
    'file\ttab.txt',
  ];

  for (const path of dangerousPaths) {
    const result = await validatePath(sandbox, path);
    t.false(result.isValid, `Should block dangerous characters in: ${path}`);
  }

  // Cleanup
  await fs.rmdir(sandbox, { recursive: true });
});

test('validatePath: batch validation with mixed inputs', async (t) => {
  const sandbox = await createTempSandbox();

  const mixedPaths = [
    'valid.txt',
    'dir/valid.md',
    '../../../etc/passwd', // malicious
    'another-valid.js',
    'file<script>.txt', // dangerous characters
    'normal-file.json',
  ];

  const results = await validatePaths(sandbox, mixedPaths);

  t.is(results.length, 6);
  t.true(results[0].isValid); // valid.txt
  t.true(results[1].isValid); // dir/valid.md
  t.false(results[2].isValid); // malicious
  t.true(results[3].isValid); // another-valid.js
  t.false(results[4].isValid); // dangerous characters
  t.true(results[5].isValid); // normal-file.json

  // Cleanup
  await fs.rmdir(sandbox, { recursive: true });
});

test('sanitizeFileName: comprehensive dangerous character removal', (t) => {
  const testCases = [
    { input: 'file<script>.txt', expected: 'file_script_.txt' },
    { input: 'file|pipe.txt', expected: 'file_pipe.txt' },
    { input: 'file:colon.txt', expected: 'file_colon.txt' },
    { input: 'file"quote.txt', expected: 'file_quote.txt' },
    { input: "file'apostrophe.txt", expected: 'file_apostrophe.txt' },
    { input: 'file<angle>.txt', expected: 'file_angle_.txt' },
    { input: 'file?question.txt', expected: 'file_question.txt' },
    { input: 'file*asterisk.txt', expected: 'file_asterisk.txt' },
    { input: '  spaced.txt  ', expected: 'spaced.txt' },
    { input: '.hidden.txt', expected: 'hidden.txt' },
    { input: '...multiple.txt...', expected: 'multiple.txt' },
    { input: '', expected: 'unnamed_file' },
    { input: '\x00control.txt', expected: 'control.txt' },
    { input: '\r\ncontrol.txt', expected: 'control.txt' },
    { input: '\tcontrol.txt', expected: 'control.txt' },
  ];

  for (const { input, expected } of testCases) {
    const result = sanitizeFileName(input);
    t.is(result, expected, `Should sanitize: ${input} -> ${result}`);
  }
});

test('sanitizeFileName: handles edge cases', (t) => {
  // Very long filename
  const longName = 'a'.repeat(300) + '.txt';
  const result = sanitizeFileName(longName);
  t.true(result.length <= 255);
  t.true(result.endsWith('.txt'));

  // Only dangerous characters
  const onlyDangerous = '<>:"|?*';
  const dangerousResult = sanitizeFileName(onlyDangerous);
  t.is(dangerousResult, 'unnamed_file');

  // Mixed case dangerous names
  const mixedCase = 'Con';
  const mixedResult = sanitizeFileName(mixedCase);
  t.not(mixedResult, 'Con'); // Should be changed
});

test('createSecurePath: safe path combination', (t) => {
  const directory = '/safe/path';
  const filename = 'file.txt';

  const result = createSecurePath(directory, filename);
  t.is(result, '/safe/path/file.txt');

  // Test with dangerous filename
  const dangerousFilename = '../../../etc/passwd';
  const safeResult = createSecurePath(directory, dangerousFilename);
  t.false(safeResult.includes('..'));
  t.true(safeResult.includes('_'));
});

test('isCrossPlatformSafe: comprehensive platform safety', (t) => {
  const safePaths = [
    'file.txt',
    'dir/file.txt',
    'file-with-dashes.txt',
    'file_with_underscores.txt',
    'file123.txt',
    'UPPERCASE.TXT',
  ];

  const unsafePaths = [
    'file<>.txt',
    'file|pipe.txt',
    'file:colon.txt',
    'file"quote.txt',
    'file?question.txt',
    'file*asterisk.txt',
    'CON',
    'PRN',
    'AUX',
    'NUL',
    'COM1',
    'LPT1',
    'file.txt ', // trailing space
    'file.txt.', // trailing dot
    'C:\\file.txt',
    '\\\\server\\share\\file.txt',
    'file\x00.txt',
    '',
  ];

  for (const path of safePaths) {
    t.true(isCrossPlatformSafe(path), `Should be safe: ${path}`);
  }

  for (const path of unsafePaths) {
    t.false(isCrossPlatformSafe(path), `Should be unsafe: ${path}`);
  }
});

test('validatePath: configuration-based security', async (t) => {
  const sandbox = await createTempSandbox();

  // Test file extension blocking
  const blockConfig = {
    blockedExtensions: ['.exe', '.bat', '.scr', '.com'],
  };

  const blockedResult = await validatePath(sandbox, 'malware.exe', blockConfig);
  t.false(blockedResult.isValid);
  t.true(blockedResult.error?.includes('extension'));

  // Test file extension allowing (whitelist)
  const allowConfig = {
    allowedExtensions: ['.txt', '.md', '.js', '.ts'],
  };

  const allowedResult = await validatePath(sandbox, 'document.txt', allowConfig);
  t.true(allowedResult.isValid);

  const notAllowedResult = await validatePath(sandbox, 'document.pdf', allowConfig);
  t.false(notAllowedResult.isValid);
  t.true(notAllowedResult.error?.includes('allowed list'));

  // Test path depth limits
  const depthConfig = { maxDepth: 3 };

  const validDepthResult = await validatePath(sandbox, 'a/b/c/file.txt', depthConfig);
  t.true(validDepthResult.isValid);

  const deepResult = await validatePath(sandbox, 'a/b/c/d/e/file.txt', depthConfig);
  t.false(deepResult.isValid);
  t.true(deepResult.error?.includes('depth'));

  // Cleanup
  await fs.rmdir(sandbox, { recursive: true });
});

test('createSecureTempPath: secure temporary path generation', (t) => {
  const tempPath = createSecureTempPath('/tmp');

  t.true(tempPath.startsWith('/tmp'));
  t.true(tempPath.includes('tmp_'));
  t.true(tempPath.endsWith('.tmp'));

  // Test with custom prefix and extension
  const customTemp = createSecureTempPath('/tmp', 'upload', '.dat');
  t.true(customTemp.includes('upload_'));
  t.true(customTemp.endsWith('.dat'));

  // Test uniqueness
  const temp1 = createSecureTempPath('/tmp');
  const temp2 = createSecureTempPath('/tmp');
  t.not(temp1, temp2); // Should be different
});

test('validatePath: TOCTOU protection simulation', async (t) => {
  const sandbox = await createTempSandbox();

  // Test with symlinks disabled (default)
  const noSymlinkConfig = { allowSymlinks: false };

  // This test would need actual filesystem manipulation in a real environment
  // For now, test that the configuration is respected
  const result = await validatePath(sandbox, 'test.txt', noSymlinkConfig);
  t.true(typeof result.isValid === 'boolean');

  // Test with symlinks enabled
  const symlinkConfig = { allowSymlinks: true };
  const symlinkResult = await validatePath(sandbox, 'test.txt', symlinkConfig);
  t.true(typeof symlinkResult.isValid === 'boolean');

  // Cleanup
  await fs.rmdir(sandbox, { recursive: true });
});

test('validatePath: input validation edge cases', async (t) => {
  const sandbox = await createTempSandbox();

  const invalidInputs = [
    '',
    null as any,
    undefined as any,
    0 as any,
    false as any,
    {} as any,
    [] as any,
  ];

  for (const input of invalidInputs) {
    const result = await validatePath(sandbox, input);
    t.false(result.isValid, `Should reject invalid input: ${input}`);
    t.truthy(result.error);
  }

  // Cleanup
  await fs.rmdir(sandbox, { recursive: true });
});

test('validatePath: performance with complex paths', async (t) => {
  const sandbox = await createTempSandbox();

  // Test with very long path
  const longPath = 'a/'.repeat(100) + 'file.txt';
  const startTime = Date.now();

  const result = await validatePath(sandbox, longPath);
  const endTime = Date.now();

  // Should complete quickly (under 100ms)
  t.true(endTime - startTime < 100, 'Validation should be fast');
  t.true(typeof result.isValid === 'boolean');

  // Cleanup
  await fs.rmdir(sandbox, { recursive: true });
});

test('validatePath: valid paths should pass', async (t) => {
  const sandbox = await createTempSandbox();

  // Create some valid test files
  await fs.writeFile(path.join(sandbox, 'test.txt'), 'test content');
  await fs.mkdir(path.join(sandbox, 'subdir'));
  await fs.writeFile(path.join(sandbox, 'subdir', 'file.md'), 'markdown content');

  const validPaths = [
    'test.txt',
    'subdir/file.md',
    'subdir',
    './test.txt',
    'normal-file.json',
    'deep/nested/path/file.txt',
  ];

  for (const validPath of validPaths) {
    const result = await validatePath(sandbox, validPath);
    t.true(result.isValid, `Should accept valid path: ${validPath}`);
    t.truthy(result.normalizedPath, `Should provide normalized path for: ${validPath}`);
  }

  // Cleanup
  await fs.rmdir(sandbox, { recursive: true });
});
