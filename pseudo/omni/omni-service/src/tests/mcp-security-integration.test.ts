/**
 * @fileoverview MCP Security Integration Test Suite
 * Comprehensive integration tests for MCP security hardening
 */

import test from 'ava';
import { FastifyInstance } from 'fastify';
import MCPAdapter from '../adapters/mcp.js';

// Mock Fastify instance for testing
const createMockFastify = (): FastifyInstance => {
  const mockApp = {
    get: () => {},
    post: () => {},
    log: {
      debug: () => {},
      warn: () => {},
      error: () => {},
      info: () => {},
    },
  } as any;
  return mockApp;
};

// Mock request object
const createMockRequest = (user?: any, headers?: any): any => ({
  user,
  headers: headers || {},
  ip: '127.0.0.1',
  requestId: 'test-request-id',
  params: {},
  query: {},
  raw: {},
  log: {
    debug: () => {},
    warn: () => {},
    error: () => {},
    info: () => {},
  },
});

test.serial('MCP Security Integration: Complete security pipeline', async (t) => {
  const mockApp = createMockFastify();
  const adapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: true,
    enableSecurityLogging: true,
    enableAuditLogging: true,
    enableRateLimit: true,
    rateLimitWindow: 60,
    rateLimitMax: 5,
    allowedBasePaths: ['/home/err/devel/promethean'],
    maxFileSize: 1024 * 1024, // 1MB
  });

  // Test 1: Authentication enforcement
  const unauthenticatedRequest = createMockRequest();

  try {
    await adapter['listFiles']('src', false, unauthenticatedRequest);
    t.fail('Unauthenticated request should have been blocked');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '';
    t.true(
      errorMessage.includes('Authentication required'),
      'Should require authentication for file operations',
    );
  }

  // Test 2: Role-based access control
  const guestRequest = createMockRequest({ id: 'guest1', role: 'guest' });
  const userRequest = createMockRequest({ id: 'user1', role: 'user' });
  const adminRequest = createMockRequest({ id: 'admin1', role: 'admin' });

  // Guest should only access basic tools
  let access = adapter['validateToolAccess']('echo', guestRequest);
  t.true(access.allowed, 'Guest should access echo tool');

  access = adapter['validateToolAccess']('list_files', guestRequest);
  t.false(access.allowed, 'Guest should not access list_files tool');

  // User should access file operations
  access = adapter['validateToolAccess']('list_files', userRequest);
  t.true(access.allowed, 'User should access list_files tool');

  // Admin should access all tools
  access = adapter['validateToolAccess']('read_file', adminRequest);
  t.true(access.allowed, 'Admin should access read_file tool');

  // Test 3: Path traversal protection
  const maliciousPaths = [
    '../../../etc/passwd',
    '..%2f..%2f..%2fetc%2fpasswd',
    '‥/etc/passwd',
    '**/../etc/passwd',
    '/dev/null',
    'CON',
  ];

  for (const maliciousPath of maliciousPaths) {
    try {
      await adapter['listFiles'](maliciousPath, false, adminRequest);
      t.fail(`Malicious path should have been blocked: ${maliciousPath}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      t.true(
        errorMessage.includes('Invalid path') ||
          errorMessage.includes('unsafe') ||
          errorMessage.includes('not allowed'),
        `Should block malicious path: ${maliciousPath}`,
      );
    }
  }

  // Test 4: Rate limiting
  const rateLimitRequest = createMockRequest({ id: 'ratelimit1', role: 'user' });
  rateLimitRequest.ip = '192.168.1.100';

  let allowedCount = 0;
  for (let i = 0; i < 10; i++) {
    const result = adapter['checkRateLimit'](rateLimitRequest);
    if (result.allowed) {
      allowedCount++;
    }
  }

  t.true(allowedCount <= 5, 'Should enforce rate limit (max 5 requests)');
  t.true(allowedCount >= 2, 'Should allow some requests before limiting');

  // Test 5: File type restrictions
  const disallowedFiles = ['malicious.exe', 'virus.bat', 'script.sh', 'payload.dll'];

  for (const disallowedFile of disallowedFiles) {
    try {
      await adapter['readFile'](disallowedFile, 'utf8', adminRequest);
      t.fail(`Disallowed file type should have been blocked: ${disallowedFile}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      t.true(
        errorMessage.includes('not allowed') || errorMessage.includes('Invalid path'),
        `Should block disallowed file type: ${disallowedFile}`,
      );
    }
  }

  // Test 6: Security logging
  const initialLogSize = adapter['auditLog'].length;

  // Trigger some security events
  adapter['logSecurityEvent']({
    userId: 'testuser',
    role: 'user',
    action: 'test_security_event',
    resource: 'test_resource',
    result: 'allowed',
    ipAddress: '127.0.0.1',
    userAgent: 'test-agent',
  });

  t.true(adapter['auditLog'].length > initialLogSize, 'Security events should be logged');

  // Test 7: MCP request integration
  const mcpRequest = createMockRequest({ id: 'user1', role: 'user' });

  // Initialize request
  const initMessage = {
    jsonrpc: '2.0' as const,
    id: 1,
    method: 'initialize',
    params: {},
  };

  const initResult = await adapter['handleMCPRequest'](initMessage, mcpRequest);
  t.truthy(initResult.result, 'Initialize should succeed');
  t.falsy(initResult.error, 'Initialize should not return error');

  // Tool call request
  const toolCallMessage = {
    jsonrpc: '2.0' as const,
    id: 2,
    method: 'tools/call',
    params: {
      name: 'echo',
      arguments: { text: 'Hello Security Test' },
    },
  };

  const toolResult = await adapter['handleMCPRequest'](toolCallMessage, mcpRequest);
  t.truthy(toolResult.result, 'Allowed tool call should succeed');
  t.falsy(toolResult.error, 'Allowed tool call should not return error');

  // Unauthorized tool call
  const unauthorizedToolMessage = {
    jsonrpc: '2.0' as const,
    id: 3,
    method: 'tools/call',
    params: {
      name: 'list_files',
      arguments: { path: 'src' },
    },
  };

  const unauthorizedResult = await adapter['handleMCPRequest'](
    unauthorizedToolMessage,
    guestRequest,
  );
  t.truthy(unauthorizedResult.error, 'Unauthorized tool call should return error');
  t.true(
    unauthorizedResult.error?.message?.includes('not authorized'),
    'Should return authorization error',
  );

  t.pass();
});

test.serial('MCP Security Integration: Performance under load', async (t) => {
  const mockApp = createMockFastify();
  const adapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: true,
    enableSecurityLogging: true,
    enableRateLimit: true,
    rateLimitWindow: 60,
    rateLimitMax: 100, // Higher limit for load testing
  });

  const startTime = Date.now();
  const promises: Promise<any>[] = [];

  // Simulate 50 concurrent requests
  for (let i = 0; i < 50; i++) {
    const request = createMockRequest({ id: `user${i}`, role: 'user' });
    request.ip = `192.168.1.${(i % 254) + 1}`;

    const promise = Promise.resolve(adapter['validateToolAccess']('echo', request));
    promises.push(promise);
  }

  const results = await Promise.all(promises);
  const endTime = Date.now();

  // All requests should be processed
  t.is(results.length, 50, 'All requests should be processed');

  // Most should be allowed (echo is allowed for all roles)
  const allowedCount = results.filter((r) => r.allowed).length;
  t.true(allowedCount >= 45, 'Most requests should be allowed');

  // Performance check - should complete within reasonable time
  const duration = endTime - startTime;
  t.true(duration < 5000, `Security checks should complete quickly (${duration}ms)`);

  t.pass();
});

test.serial('MCP Security Integration: Edge cases and error handling', async (t) => {
  const mockApp = createMockFastify();
  const adapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: true,
    enableSecurityLogging: true,
  });

  // Test 1: Invalid user data
  const invalidUserRequest = createMockRequest({ id: null, role: 'invalid' });

  let access = adapter['validateToolAccess']('echo', invalidUserRequest);
  t.false(access.allowed, 'Should deny access for invalid role');

  // Test 2: Missing request data
  const emptyRequest = createMockRequest();
  delete emptyRequest.ip;
  delete emptyRequest.headers;

  const rateLimitResult = adapter['checkRateLimit'](emptyRequest);
  t.true(rateLimitResult.allowed, 'Should handle missing IP gracefully');

  // Test 3: Extreme input values
  const extremePath = 'a'.repeat(1000);
  const validRequest = createMockRequest({ id: 'user1', role: 'admin' });

  try {
    await adapter['listFiles'](extremePath, false, validRequest);
    t.fail('Extremely long path should have been blocked');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '';
    t.true(
      errorMessage.includes('Invalid path') || errorMessage.includes('unsafe'),
      'Should block extremely long paths',
    );
  }

  // Test 4: Null and undefined inputs
  try {
    await adapter['listFiles'](null as any, false, validRequest);
    t.fail('Null path should have been blocked');
  } catch (error) {
    t.true(true, 'Should handle null input gracefully');
  }

  try {
    await adapter['listFiles'](undefined as any, false, validRequest);
    t.fail('Undefined path should have been blocked');
  } catch (error) {
    t.true(true, 'Should handle undefined input gracefully');
  }

  // Test 5: Malformed JSON-RPC requests
  const malformedMessage = {
    jsonrpc: '1.0', // Wrong version
    id: 'test',
    method: 'tools/call',
    params: null,
  } as any;

  const malformedResult = await adapter['handleMCPRequest'](malformedMessage, validRequest);
  t.truthy(malformedResult.error, 'Should reject malformed JSON-RPC');
  t.true(
    malformedResult.error?.message?.includes('Invalid JSON-RPC version'),
    'Should return version error',
  );

  t.pass();
});

test.serial('MCP Security Integration: Comprehensive attack simulation', async (t) => {
  const mockApp = createMockFastify();
  const adapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: true,
    enableSecurityLogging: true,
    enableAuditLogging: true,
    enableRateLimit: true,
    rateLimitWindow: 60,
    rateLimitMax: 20,
    allowedBasePaths: ['/home/err/devel/promethean'],
  });

  // Simulate a sophisticated attack scenario
  const attackScenarios = [
    // Scenario 1: Brute force tool access
    async () => {
      const guestRequest = createMockRequest({ id: 'attacker', role: 'guest' });
      const tools = ['list_files', 'read_file', 'get_user_info', 'echo'];

      for (const tool of tools) {
        const access = adapter['validateToolAccess'](tool, guestRequest);
        if (tool !== 'echo') {
          t.false(access.allowed, `Guest should not access ${tool}`);
        }
      }
    },

    // Scenario 2: Path traversal bombardment
    async () => {
      const adminRequest = createMockRequest({ id: 'admin', role: 'admin' });
      const traversalAttempts = [
        '../../../etc/passwd',
        '..%2f..%2f..%2fetc%2fpasswd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '‥/etc/passwd',
        '**/../etc/passwd',
        '/dev/null',
        '/proc/version',
        'CON',
        'PRN',
        'AUX',
      ];

      for (const path of traversalAttempts) {
        try {
          await adapter['listFiles'](path, false, adminRequest);
          t.fail(`Path traversal should have been blocked: ${path}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '';
          t.true(
            errorMessage.includes('Invalid path') ||
              errorMessage.includes('unsafe') ||
              errorMessage.includes('not allowed'),
            `Should block traversal attempt: ${path}`,
          );
        }
      }
    },

    // Scenario 3: Rate limit bypass attempt
    async () => {
      const requests = [];
      for (let i = 0; i < 25; i++) {
        const request = createMockRequest({ id: 'attacker', role: 'user' });
        request.ip = '192.168.1.100'; // Use same IP to trigger rate limiting
        requests.push(request);
      }

      let blockedCount = 0;
      for (const request of requests) {
        const result = adapter['checkRateLimit'](request);
        if (!result.allowed) {
          blockedCount++;
        }
      }

      t.true(blockedCount > 0, 'Some requests should be rate limited');
    },

    // Scenario 4: File type injection
    async () => {
      const adminRequest = createMockRequest({ id: 'admin', role: 'admin' });
      const maliciousFiles = [
        '../../etc/passwd.exe',
        'script.sh',
        'payload.dll',
        'backdoor.py',
        'config.conf',
        '.env',
        'id_rsa',
      ];

      for (const file of maliciousFiles) {
        try {
          await adapter['readFile'](file, 'utf8', adminRequest);
          t.fail(`Malicious file should have been blocked: ${file}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '';
          t.true(
            errorMessage.includes('not allowed') ||
              errorMessage.includes('Invalid path') ||
              errorMessage.includes('not found'),
            `Should block malicious file: ${file}`,
          );
        }
      }
    },
  ];

  // Run all attack scenarios
  for (const scenario of attackScenarios) {
    await scenario();
  }

  // Verify security events were logged
  const auditLog = adapter['auditLog'];
  t.true(auditLog.length > 0, 'Security events should be logged');

  const deniedEvents = auditLog.filter((entry) => entry.result === 'denied');
  t.true(deniedEvents.length > 0, 'Should have logged denied events');

  // Verify no security breaches
  const allowedMaliciousEvents = auditLog.filter(
    (entry) =>
      entry.result === 'allowed' &&
      entry.resource &&
      (entry.resource.includes('..') ||
        entry.resource.includes('etc/passwd') ||
        entry.resource.includes('.exe') ||
        entry.resource.includes('.sh')),
  );
  t.is(allowedMaliciousEvents.length, 0, 'No malicious operations should be allowed');

  t.pass();
});
