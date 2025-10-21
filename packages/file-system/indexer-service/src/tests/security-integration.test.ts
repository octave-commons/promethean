/**
 * CRITICAL SECURITY INTEGRATION TESTS - P0 VALIDATION
 * Tests to verify comprehensive input validation framework integration
 * Ensures no SECURITY FRAMEWORK BYPASS vulnerabilities remain
 */

import test from 'ava';
import { buildServer } from '../server.js';
import type { FastifyInstance } from 'fastify';
import type { InjectOptions } from 'fastify';

let app: FastifyInstance;

test.before(async () => {
  const server = await buildServer();
  app = server.app;
});

test.after.always(async () => {
  if (app) {
    await app.close();
  }
});

// ============================================================================
// SEARCH ENDPOINT SECURITY INTEGRATION TESTS
// ============================================================================

test.serial('SECURITY-INTEGRATION-001: Search endpoint must validate queries', async (t) => {
  const response = await app.inject({
    method: 'POST',
    url: '/search',
    payload: { q: 'test query' },
  });

  t.is(response.statusCode, 200);
  const body = JSON.parse(response.payload);
  t.true(body.ok);
});

test.serial('SECURITY-INTEGRATION-002: Search endpoint must reject missing query', async (t) => {
  const response = await app.inject({
    method: 'POST',
    url: '/search',
    payload: {},
  });

  t.is(response.statusCode, 400);
  const body = JSON.parse(response.payload);
  t.false(body.ok);
  t.true(body.error.includes('Missing'));
});

test.serial(
  'SECURITY-INTEGRATION-003: Search endpoint must reject injection attacks',
  async (t) => {
    const injectionPayloads = [
      { q: '<script>alert("xss")</script>' },
      { q: 'javascript:alert(1)' },
      { q: 'data:text/html,<script>alert(1)</script>' },
      { q: 'vbscript:msgbox(1)' },
      { q: 'onclick=alert(1)' },
      { q: 'onerror=alert(1)' },
    ];

    for (const payload of injectionPayloads) {
      const response = await app.inject({
        method: 'POST',
        url: '/search',
        payload,
      });

      t.is(response.statusCode, 400, `Should reject injection: ${payload.q}`);
      const body = JSON.parse(response.payload);
      t.false(body.ok);
    }
  },
);

test.serial('SECURITY-INTEGRATION-004: Search endpoint must validate result count', async (t) => {
  const invalidCounts = [
    { q: 'test', n: 0 }, // Too low
    { q: 'test', n: 101 }, // Too high
    { q: 'test', n: -1 }, // Negative
    { q: 'test', n: 1.5 }, // Not integer
  ];

  for (const payload of invalidCounts) {
    const response = await app.inject({
      method: 'POST',
      url: '/search',
      payload,
    });

    t.is(response.statusCode, 400, `Should reject invalid count: ${payload.n}`);
    const body = JSON.parse(response.payload);
    t.false(body.ok);
  }
});

test.serial('SECURITY-INTEGRATION-005: Search endpoint must accept valid parameters', async (t) => {
  const validPayloads = [
    { q: 'test query' },
    { q: 'test query', n: 8 },
    { q: 'test query', n: 1 },
    { q: 'test query', n: 100 },
    { q: 'search with spaces and numbers 123' },
  ];

  for (const payload of validPayloads) {
    const response = await app.inject({
      method: 'POST',
      url: '/search',
      payload,
    });

    // Should not return validation errors (may return other errors due to test setup)
    t.not(response.statusCode, 400, `Should accept valid payload: ${JSON.stringify(payload)}`);
  }
});

// ============================================================================
// INDEXER ENDPOINTS SECURITY INTEGRATION TESTS
// ============================================================================

test.serial('SECURITY-INTEGRATION-006: Index endpoints must validate paths', async (t) => {
  const maliciousPaths = [
    '../../../etc/passwd',
    '%2e%2e/secret',
    '~/.ssh/authorized_keys',
    '/etc/passwd',
    '<script>alert(1)</script>',
    'file|cat /etc/passwd',
  ];

  for (const path of maliciousPaths) {
    const response = await app.inject({
      method: 'POST',
      url: '/indexer/index',
      payload: { path },
    });

    t.is(response.statusCode, 400, `Should reject malicious path: ${path}`);
    const body = JSON.parse(response.payload);
    t.false(body.ok);
  }
});

test.serial('SECURITY-INTEGRATION-007: Reindex files must validate path arrays', async (t) => {
  const maliciousArrays = [
    { path: ['docs/readme.md', '../../../etc/passwd'] },
    { path: ['%2e%2e/secret', 'config/app.json'] },
    { path: ['/etc/passwd', '/proc/version'] },
  ];

  for (const payload of maliciousArrays) {
    const response = await app.inject({
      method: 'POST',
      url: '/indexer/files/reindex',
      payload,
    });

    t.is(response.statusCode, 400, `Should reject malicious array: ${JSON.stringify(payload)}`);
    const body = JSON.parse(response.payload);
    t.false(body.ok);
  }
});

test.serial('SECURITY-INTEGRATION-008: Remove endpoint must validate paths', async (t) => {
  const maliciousPaths = ['../../../etc/passwd', '%2e%2e/secret', '~/.ssh/authorized_keys'];

  for (const path of maliciousPaths) {
    const response = await app.inject({
      method: 'POST',
      url: '/indexer/remove',
      payload: { path },
    });

    t.is(response.statusCode, 400, `Should reject malicious remove path: ${path}`);
    const body = JSON.parse(response.payload);
    t.false(body.ok);
  }
});

// ============================================================================
// FRAMEWORK BYPASS PREVENTION TESTS
// ============================================================================

test.serial('SECURITY-BYPASS-001: No endpoint should bypass validation framework', async (t) => {
  // Test that all endpoints that accept user input are properly validated
  const endpoints: InjectOptions[] = [
    { method: 'POST', url: '/search', payload: { q: '<script>' } },
    { method: 'POST', url: '/indexer/index', payload: { path: '../../../etc/passwd' } },
    { method: 'POST', url: '/indexer/remove', payload: { path: '../../../etc/passwd' } },
    { method: 'POST', url: '/indexer/files/reindex', payload: { path: ['../../../etc/passwd'] } },
  ];

  for (const endpoint of endpoints) {
    const response = await app.inject(endpoint);

    // All should be caught by validation and return 400
    t.is(
      response.statusCode,
      400,
      `Endpoint ${endpoint.method} ${endpoint.url} must validate input`,
    );

    const body = JSON.parse(response.payload);
    t.false(body.ok, `Endpoint ${endpoint.method} ${endpoint.url} should reject malicious input`);
  }
});

test.serial(
  'SECURITY-BYPASS-002: Error messages must not leak sensitive information',
  async (t) => {
    const response = await app.inject({
      method: 'POST',
      url: '/search',
      payload: { q: '<script>alert(1)</script>' },
    });

    t.is(response.statusCode, 400);
    const body = JSON.parse(response.payload);

    // Error messages should be generic, not reveal internal details
    t.false(body.error.includes('<script>'));
    t.false(body.error.includes('javascript:'));
    t.false(body.error.includes('/etc/'));
    t.false(body.error.includes('node_modules'));
  },
);

// ============================================================================
// COMPREHENSIVE COVERAGE TESTS
// ============================================================================

test.serial('SECURITY-COVERAGE-001: All input types must be validated', async (t) => {
  // Test various input types that could bypass validation
  const testCases = [
    // Search queries
    { endpoint: '/search', payload: { q: null }, shouldFail: true },
    { endpoint: '/search', payload: { q: undefined }, shouldFail: true },
    { endpoint: '/search', payload: { q: '' }, shouldFail: true },
    { endpoint: '/search', payload: { q: 'a'.repeat(1001) }, shouldFail: true }, // Too long

    // Path operations
    { endpoint: '/indexer/index', payload: { path: null }, shouldFail: true },
    { endpoint: '/indexer/index', payload: { path: '' }, shouldFail: true },
    { endpoint: '/indexer/index', payload: { path: 'a'.repeat(257) }, shouldFail: true }, // Too long

    // Array operations
    { endpoint: '/indexer/files/reindex', payload: { path: [] }, shouldFail: true },
    {
      endpoint: '/indexer/files/reindex',
      payload: { path: new Array(51).fill('test.txt') },
      shouldFail: true,
    }, // Too many
  ];

  for (const testCase of testCases) {
    const response = await app.inject({
      method: 'POST',
      url: testCase.endpoint,
      payload: testCase.payload,
    });

    if (testCase.shouldFail) {
      t.is(response.statusCode, 400, `Should reject: ${JSON.stringify(testCase)}`);
    }
  }
});

test.serial('SECURITY-COVERAGE-002: Framework integration must be comprehensive', async (t) => {
  // Verify that the validation framework is actually being used
  // This test ensures we're not just doing basic checks but using the comprehensive framework

  const testPayload = { q: '%2e%2e%2fetc%2fpasswd' }; // URL encoded traversal

  const response = await app.inject({
    method: 'POST',
    url: '/search',
    payload: testPayload,
  });

  t.is(response.statusCode, 400);

  // The comprehensive framework should catch this with proper security validation
  const body = JSON.parse(response.payload);
  t.false(body.ok);

  // Should be caught by the comprehensive validation, not just basic checks
  t.true(body.error.length > 0);
});

test.serial('SECURITY-BYPASS-001b: Array inputs must not bypass security validation', async (t) => {
  // CRITICAL: Test for the path traversal vulnerability fix
  // Array inputs should be validated for security threats BEFORE type checking
  const maliciousArrays = [
    { path: ['../../../etc/passwd'] },
    { path: ['%2e%2e/secret', 'config/app.json'] },
    { path: ['<script>alert(1)</script>', 'docs/readme.md'] },
    { path: ['file|cat /etc/passwd', 'normal.txt'] },
    { path: ['/etc/passwd', '/proc/version'] },
  ];

  // Test index endpoint
  for (const payload of maliciousArrays) {
    const response = await app.inject({
      method: 'POST',
      url: '/indexer/index',
      payload,
    });

    t.is(
      response.statusCode,
      400,
      `Index endpoint should reject malicious array: ${JSON.stringify(payload)}`,
    );
    const body = JSON.parse(response.payload);
    t.false(body.ok);
  }

  // Test remove endpoint
  for (const payload of maliciousArrays) {
    const response = await app.inject({
      method: 'POST',
      url: '/indexer/remove',
      payload,
    });

    t.is(
      response.statusCode,
      400,
      `Remove endpoint should reject malicious array: ${JSON.stringify(payload)}`,
    );
    const body = JSON.parse(response.payload);
    t.false(body.ok);
  }
});
