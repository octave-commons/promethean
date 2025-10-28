/**
 * Security tests for file-indexer-service
 * Tests path traversal vulnerability fixes and input validation
 */

import test from 'ava';
import { request } from 'supertest';
import { FileIndexerService } from '../service.js';
import { validateFileSystemPath, validateFilePatterns } from '../path-validation.js';

let service: FileIndexerService;
const TEST_PORT = 3001;

test.before(async () => {
  service = new FileIndexerService(TEST_PORT);
  // Start service in background for integration tests
  await service.start();
  // Give it a moment to start
  await new Promise((resolve) => setTimeout(resolve, 100));
});

test.after.always(async () => {
  if (service) {
    await service.stop();
  }
});

// ===== Path Validation Unit Tests =====

test('validateFileSystemPath - blocks path traversal attacks', (t) => {
  const maliciousPaths = [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
    '....//....//....//etc/passwd',
    '/etc/passwd',
    '/proc/version',
    '/sys/kernel',
    'C:\\Windows\\System32\\config\\SAM',
    '~/.ssh/id_rsa',
    '/root/.bashrc',
  ];

  for (const maliciousPath of maliciousPaths) {
    t.throws(
      () => {
        validateFileSystemPath(maliciousPath);
      },
      {
        message: /Path traversal detected|Suspicious path pattern|Absolute paths not allowed/,
      },
      `Should block malicious path: ${maliciousPath}`,
    );
  }

  t.pass();
});

test('validateFileSystemPath - allows safe paths', (t) => {
  const safePaths = [
    'documents/file.txt',
    'src/index.ts',
    'config/app.json',
    'logs/app.log',
    'data/users.json',
    'public/css/style.css',
    'temp/cache.tmp',
  ];

  for (const safePath of safePaths) {
    t.notThrows(() => {
      const result = validateFileSystemPath(safePath);
      t.is(typeof result, 'string');
      t.truthy(result.length > 0);
    }, `Should allow safe path: ${safePath}`);
  }

  t.pass();
});

test('validateFilePatterns - blocks malicious patterns', (t) => {
  const maliciousPatterns = [
    '../../../etc/passwd',
    '|cat /etc/passwd',
    '$(whoami)',
    '`rm -rf /`',
    '../../secret',
  ];

  for (const maliciousPattern of maliciousPatterns) {
    t.throws(
      () => {
        validateFilePatterns([maliciousPattern]);
      },
      {
        message: /Path traversal detected|Pattern contains potentially dangerous characters/,
      },
      `Should block malicious pattern: ${maliciousPattern}`,
    );
  }

  t.pass();
});

test('validateFilePatterns - allows safe patterns', (t) => {
  const safePatterns = ['*.ts', '*.json', 'src/**/*.js', 'config/*.yml', 'docs/*.md'];

  for (const safePattern of safePatterns) {
    t.notThrows(() => {
      const result = validateFilePatterns(safePatterns);
      t.true(Array.isArray(result));
      t.is(result.length, safePatterns.length);
    }, `Should allow safe pattern: ${safePattern}`);
  }

  t.pass();
});

// ===== Integration Security Tests =====

test('POST /index - blocks path traversal attacks', async (t) => {
  const maliciousPayloads = [
    { path: '../../../etc/passwd' },
    { path: '..\\..\\..\\windows\\system32\\config' },
    { path: '/etc/passwd' },
    { path: '/proc/version' },
  ];

  for (const payload of maliciousPayloads) {
    const response = await request(`http://localhost:${TEST_PORT}`)
      .post('/index')
      .send(payload)
      .expect(400);

    t.truthy(response.body.success === false);
    t.truthy(response.body.error);
    t.true(
      response.body.error.includes('Path traversal') ||
        response.body.error.includes('Suspicious') ||
        response.body.error.includes('Absolute paths') ||
        response.body.error.includes('Invalid request'),
    );
  }

  t.pass();
});

test('POST /file - blocks path traversal attacks', async (t) => {
  const maliciousPayloads = [
    { path: '../../../etc/passwd' },
    { path: '..\\..\\..\\windows\\system32\\config' },
    { path: '/etc/passwd' },
    { path: '/proc/version' },
  ];

  for (const payload of maliciousPayloads) {
    const response = await request(`http://localhost:${TEST_PORT}`)
      .post('/file')
      .send(payload)
      .expect(400);

    t.truthy(response.body.success === false);
    t.truthy(response.body.error);
    t.true(
      response.body.error.includes('Path traversal') ||
        response.body.error.includes('Suspicious') ||
        response.body.error.includes('Absolute paths') ||
        response.body.error.includes('Invalid request'),
    );
  }

  t.pass();
});

test('DELETE /file - blocks path traversal attacks', async (t) => {
  const maliciousPayloads = [
    { path: '../../../etc/passwd' },
    { path: '..\\..\\..\\windows\\system32\\config' },
    { path: '/etc/passwd' },
    { path: '/proc/version' },
  ];

  for (const payload of maliciousPayloads) {
    const response = await request(`http://localhost:${TEST_PORT}`)
      .delete('/file')
      .send(payload)
      .expect(400);

    t.truthy(response.body.success === false);
    t.truthy(response.body.error);
    t.true(
      response.body.error.includes('Path traversal') ||
        response.body.error.includes('Suspicious') ||
        response.body.error.includes('Absolute paths') ||
        response.body.error.includes('Invalid request'),
    );
  }

  t.pass();
});

test('POST /index - validates include/exclude patterns', async (t) => {
  const maliciousPayloads = [
    {
      path: 'documents',
      includePatterns: ['../../../etc/passwd', '*.txt'],
    },
    {
      path: 'documents',
      excludePatterns: ['|cat /etc/passwd', '*.log'],
    },
  ];

  for (const payload of maliciousPayloads) {
    const response = await request(`http://localhost:${TEST_PORT}`)
      .post('/index')
      .send(payload)
      .expect(400);

    t.truthy(response.body.success === false);
    t.truthy(response.body.error);
  }

  t.pass();
});

test('POST /index - allows safe requests with patterns', async (t) => {
  const safePayload = {
    path: 'documents',
    includePatterns: ['*.txt', '*.md'],
    excludePatterns: ['*.tmp', '*.log'],
  };

  // This should not throw a validation error (though it might fail for other reasons)
  const response = await request(`http://localhost:${TEST_PORT}`).post('/index').send(safePayload);

  // We expect either success (200) or a non-security error (400/500)
  // The important thing is that it's not rejected for security reasons
  t.true([200, 400, 500].includes(response.status));

  if (response.status === 400) {
    // If it fails, make sure it's not a security error
    t.false(
      response.body.error?.includes('Path traversal') ||
        response.body.error?.includes('Suspicious') ||
        response.body.error?.includes('dangerous characters'),
    );
  }

  t.pass();
});

// ===== Edge Case Tests =====

test('validateFileSystemPath - handles edge cases', (t) => {
  // Empty string
  t.throws(
    () => {
      validateFileSystemPath('');
    },
    { message: /non-empty string/ },
  );

  // Null input
  t.throws(
    () => {
      validateFileSystemPath(null as any);
    },
    { message: /non-empty string/ },
  );

  // Very long path
  const longPath = 'a'.repeat(5000);
  t.throws(
    () => {
      validateFileSystemPath(longPath);
    },
    { message: /Path too long/ },
  );

  // Control characters
  t.throws(
    () => {
      validateFileSystemPath('file\x00name');
    },
    { message: /control characters/ },
  );

  // Unicode homograph attacks
  t.throws(
    () => {
      validateFileSystemPath('file‥name');
    },
    { message: /suspicious Unicode/ },
  );

  t.pass();
});

test('validateFilePatterns - handles edge cases', (t) => {
  // Non-array input
  t.throws(
    () => {
      validateFilePatterns('not-an-array' as any);
    },
    { message: /must be an array/ },
  );

  // Empty strings in array
  t.throws(
    () => {
      validateFilePatterns(['', '*.txt']);
    },
    { message: /non-empty string/ },
  );

  // Non-string elements
  t.throws(
    () => {
      validateFilePatterns([123, '*.txt'] as any);
    },
    { message: /non-empty string/ },
  );

  t.pass();
});

// ===== Security Bypass Prevention Tests =====

test('SECURITY-BYPASS-001: Array inputs cannot bypass validation', async (t) => {
  // Test that array inputs are properly handled and cannot bypass security
  const arrayPayloads = [
    { path: ['../../../etc/passwd', 'documents/file.txt'] },
    { path: ['safe.txt', '../../../etc/passwd'] },
  ];

  for (const payload of arrayPayloads) {
    const response = await request(`http://localhost:${TEST_PORT}`).post('/index').send(payload);

    // Should fail validation - arrays should be rejected
    t.true(response.status === 400);
    t.truthy(response.body.error);
  }

  t.pass();
});

test('SECURITY-BYPASS-002: Encoded attacks are blocked', async (t) => {
  const encodedPayloads = [
    { path: '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd' },
    { path: '%2E%2E%2F%2E%2E%2F%2E%2E%2Fetc%2Fpasswd' },
    { path: '..%2F..%2F..%2Fetc%2Fpasswd' },
  ];

  for (const payload of encodedPayloads) {
    const response = await request(`http://localhost:${TEST_PORT}`)
      .post('/index')
      .send(payload)
      .expect(400);

    t.truthy(response.body.success === false);
    t.truthy(response.body.error);
  }

  t.pass();
});
