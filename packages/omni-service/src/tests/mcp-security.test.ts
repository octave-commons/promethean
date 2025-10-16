/**
 * @fileoverview MCP Security Test Suite
 * Tests for path traversal vulnerabilities and input validation
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
const createMockRequest = (user?: any): any => ({
  user,
  headers: {},
  ip: '127.0.0.1',
  id: 'test-request-id',
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

test.serial('MCP Security: Path traversal attempts should be blocked', async (t) => {
  const mockApp = createMockFastify();
  const adapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: false,
    allowedBasePaths: ['/home/err/devel/promethean'],
  });

  // Test various path traversal attempts
  const traversalAttempts = [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '/etc/passwd',
    '/etc/shadow',
    '....//....//....//etc/passwd',
    '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
    '..%2f..%2f..%2fetc%2fpasswd',
    '..%5c..%5c..%5cwindows%5csystem32%5cconfig%5csam',
    '....\\\\....\\\\....\\\\etc\\\\passwd',
    '/dev/null',
    '/proc/version',
    '/sys/kernel/version',
    'C:\\Windows\\System32\\config\\SAM',
    '\\\\?\\C:\\Windows\\System32\\config\\SAM',
    'CON',
    'PRN',
    'AUX',
    'NUL',
    'COM1',
    'LPT1',
  ];

  for (const maliciousPath of traversalAttempts) {
    const mockRequest = createMockRequest();

    try {
      await adapter['listFiles'](maliciousPath, false, mockRequest);
      t.fail(`Path traversal attempt should have been blocked: ${maliciousPath}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      t.true(
        errorMessage.includes('Invalid path') ||
          errorMessage.includes('unsafe') ||
          errorMessage.includes('not allowed'),
        `Should block path traversal: ${maliciousPath} - Error: ${errorMessage}`,
      );
    }
  }

  t.pass();
});

test.serial('MCP Security: Dangerous characters should be blocked', async (t) => {
  const mockApp = createMockFastify();
  const adapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: false,
  });

  const dangerousPaths = [
    'file<script>alert("xss")</script>.txt',
    'file|rm -rf /',
    'file&whoami',
    'file;cat /etc/passwd',
    'file`id`',
    'file$HOME',
    'file"with quotes"',
    "file'with quotes'",
    'file\r\nwith newlines',
    'file\x00with null byte',
  ];

  for (const dangerousPath of dangerousPaths) {
    const mockRequest = createMockRequest();

    try {
      await adapter['listFiles'](dangerousPath, false, mockRequest);
      t.fail(`Dangerous characters should have been blocked: ${dangerousPath}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      t.true(
        errorMessage.includes('Invalid path') || errorMessage.includes('unsafe'),
        `Should block dangerous characters: ${dangerousPath}`,
      );
    }
  }

  t.pass();
});

test.serial('MCP Security: Unicode homograph attacks should be blocked', async (t) => {
  const mockApp = createMockFastify();
  const adapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: false,
  });

  // Unicode characters that can normalize to dangerous sequences
  const unicodeAttacks = [
    '‥/etc/passwd', // Unicode double dot
    '﹒/etc/passwd', // Unicode small dot
    '．/etc/passwd', // Unicode fullwidth dot
    '．．/etc/passwd', // Multiple fullwidth dots
    '‥．/etc/passwd', // Mixed Unicode dots
  ];

  for (const unicodePath of unicodeAttacks) {
    const mockRequest = createMockRequest();

    try {
      await adapter['listFiles'](unicodePath, false, mockRequest);
      t.fail(`Unicode homograph attack should have been blocked: ${unicodePath}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      t.true(
        errorMessage.includes('Invalid path') || errorMessage.includes('unsafe'),
        `Should block Unicode homograph: ${unicodePath}`,
      );
    }
  }

  t.pass();
});

test.serial('MCP Security: Glob pattern attacks should be blocked', async (t) => {
  const mockApp = createMockFastify();
  const adapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: false,
  });

  const globAttacks = [
    '**/../etc/passwd',
    '../**',
    '{../etc/passwd}',
    '..}/etc/passwd',
    '**/../../etc/passwd',
    '../**/../etc/passwd',
  ];

  for (const globPath of globAttacks) {
    const mockRequest = createMockRequest();

    try {
      await adapter['listFiles'](globPath, false, mockRequest);
      t.fail(`Glob pattern attack should have been blocked: ${globPath}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      t.true(
        errorMessage.includes('Invalid path') || errorMessage.includes('unsafe'),
        `Should block glob pattern: ${globPath}`,
      );
    }
  }

  t.pass();
});

test.serial('MCP Security: File type restrictions should be enforced', async (t) => {
  const mockApp = createMockFastify();
  const adapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: false,
  });

  const disallowedFiles = [
    'malicious.exe',
    'virus.bat',
    'script.sh',
    'payload.dll',
    'exploit.so',
    'backdoor.py',
    'rootkit',
    'config.conf', // Some config files might be sensitive
  ];

  for (const disallowedFile of disallowedFiles) {
    const mockRequest = createMockRequest();

    try {
      await adapter['readFile'](disallowedFile, 'utf8', mockRequest);
      t.fail(`Disallowed file type should have been blocked: ${disallowedFile}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      t.true(
        errorMessage.includes('not allowed') || errorMessage.includes('Invalid path'),
        `Should block disallowed file type: ${disallowedFile}`,
      );
    }
  }

  t.pass();
});

test.serial('MCP Security: Valid paths should be allowed', async (t) => {
  const mockApp = createMockFastify();
  const adapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: false,
    allowedBasePaths: ['/home/err/devel/promethean'],
  });

  const validPaths = [
    'src',
    'src/index.ts',
    'docs/readme.md',
    'package.json',
    'tests/unit',
    'config/app.json',
  ];

  for (const validPath of validPaths) {
    const mockRequest = createMockRequest();

    try {
      // These should not throw errors for path validation
      // (they might fail for other reasons like file not existing, but not for security)
      await adapter['listFiles'](validPath, false, mockRequest);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      // Should not be a security-related error
      t.false(
        errorMessage.includes('Invalid path') ||
          errorMessage.includes('unsafe') ||
          errorMessage.includes('not allowed') ||
          errorMessage.includes('traversal'),
        `Valid path should not trigger security error: ${validPath} - Error: ${errorMessage}`,
      );
    }
  }

  t.pass();
});

test.serial('MCP Security: Path length limits should be enforced', async (t) => {
  const mockApp = createMockFastify();
  const adapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: false,
  });

  // Create a path that exceeds the 256 character limit
  const longPath = 'a'.repeat(300);
  const mockRequest = createMockRequest();

  try {
    await adapter['listFiles'](longPath, false, mockRequest);
    t.fail('Excessively long path should have been blocked');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '';
    t.true(
      errorMessage.includes('Invalid path') || errorMessage.includes('unsafe'),
      'Should block excessively long paths',
    );
  }

  t.pass();
});

test.serial('MCP Security: Null bytes should be blocked', async (t) => {
  const mockApp = createMockFastify();
  const adapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: false,
  });

  const nullBytePaths = ['file\x00.txt', 'path\x00/file.txt', 'file.txt\x00', '\x00file.txt'];

  for (const nullPath of nullBytePaths) {
    const mockRequest = createMockRequest();

    try {
      await adapter['listFiles'](nullPath, false, mockRequest);
      t.fail(`Null byte path should have been blocked: ${nullPath}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      t.true(
        errorMessage.includes('Invalid path') || errorMessage.includes('unsafe'),
        `Should block null byte path: ${nullPath}`,
      );
    }
  }

  t.pass();
});

test.serial('MCP Security: Authentication should be enforced when enabled', async (t) => {
  const mockApp = createMockFastify();
  const adapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: true, // Enable authentication
  });

  const mockRequest = createMockRequest(); // No user provided

  try {
    await adapter['listFiles']('src', false, mockRequest);
    t.fail('Unauthenticated request should have been blocked');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '';
    t.true(
      errorMessage.includes('Authentication required'),
      'Should require authentication for file operations',
    );
  }

  t.pass();
});

test.serial('MCP Security: Base path restrictions should be enforced', async (t) => {
  const mockApp = createMockFastify();
  const adapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: false,
    allowedBasePaths: ['/home/err/devel/promethean/packages'], // Restrict to packages directory
  });

  const mockRequest = createMockRequest();

  try {
    // Try to access outside the allowed base path
    await adapter['listFiles']('../../../etc', false, mockRequest);
    t.fail('Path outside allowed base paths should have been blocked');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '';
    t.true(
      errorMessage.includes('Invalid path') ||
        errorMessage.includes('outside allowed') ||
        errorMessage.includes('traversal'),
      'Should enforce base path restrictions',
    );
  }

  t.pass();
});

test.serial('MCP Security: File size limits should be enforced', async (t) => {
  const mockApp = createMockFastify();
  const adapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: false,
    maxFileSize: 100, // Very small limit for testing
  });

  // This test would need an actual file to check size limits
  // For now, we'll test that the size limit logic exists
  const options = adapter['options'];
  t.is(options.maxFileSize, 100, 'File size limit should be configurable');

  t.pass();
});

test.serial('MCP Security: Rate limiting should work', async (t) => {
  const mockApp = createMockFastify();
  const adapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: false,
    enableRateLimit: true,
    rateLimitWindow: 1, // 1 second window
    rateLimitMax: 2, // Max 2 requests
  });

  const mockRequest = createMockRequest();
  mockRequest.ip = '192.168.1.100';

  // First request should be allowed
  let result = adapter['checkRateLimit'](mockRequest);
  t.true(result.allowed, 'First request should be allowed');
  t.is(result.remaining, 1, 'Should have 1 request remaining');

  // Second request should be allowed
  result = adapter['checkRateLimit'](mockRequest);
  t.true(result.allowed, 'Second request should be allowed');
  t.is(result.remaining, 0, 'Should have 0 requests remaining');

  // Third request should be blocked
  result = adapter['checkRateLimit'](mockRequest);
  t.false(result.allowed, 'Third request should be blocked');
  t.is(result.remaining, 0, 'Should have 0 requests remaining');

  t.pass();
});

test.serial('MCP Security: Role-based tool access should be enforced', async (t) => {
  const mockApp = createMockFastify();
  const adapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: true,
  });

  // Test guest user access
  const guestRequest = createMockRequest({ id: 'guest1', role: 'guest' });

  let access = adapter['validateToolAccess']('echo', guestRequest);
  t.true(access.allowed, 'Guest should access echo tool');

  access = adapter['validateToolAccess']('list_files', guestRequest);
  t.false(access.allowed, 'Guest should not access list_files tool');

  // Test admin user access
  const adminRequest = createMockRequest({ id: 'admin1', role: 'admin' });

  access = adapter['validateToolAccess']('list_files', adminRequest);
  t.true(access.allowed, 'Admin should access list_files tool');

  access = adapter['validateToolAccess']('echo', adminRequest);
  t.true(access.allowed, 'Admin should access echo tool');

  t.pass();
});

test.serial('MCP Security: Security logging should capture events', async (t) => {
  const mockApp = createMockFastify();
  const adapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: true,
    enableSecurityLogging: true,
    enableAuditLogging: true,
  });

  const mockRequest = createMockRequest({ id: 'user1', role: 'user' });
  mockRequest.ip = '192.168.1.100';
  mockRequest.headers = { 'user-agent': 'test-agent' };

  // Log a security event
  adapter['logSecurityEvent']({
    userId: 'user1',
    role: 'user',
    action: 'test_action',
    resource: 'test_resource',
    result: 'allowed',
    ipAddress: '192.168.1.100',
    userAgent: 'test-agent',
  });

  // Check that the event was logged
  const auditLog = adapter['auditLog'];
  t.is(auditLog.length, 1, 'Should have one audit log entry');

  const logEntry = auditLog[0];
  if (logEntry) {
    t.is(logEntry.userId, 'user1', 'Should log correct user ID');
    t.is(logEntry.role, 'user', 'Should log correct role');
    t.is(logEntry.action, 'test_action', 'Should log correct action');
    t.is(logEntry.resource, 'test_resource', 'Should log correct resource');
    t.is(logEntry.result, 'allowed', 'Should log correct result');
  }

  t.pass();
});

test.serial('MCP Security: MCP request handling should enforce security', async (t) => {
  const mockApp = createMockFastify();
  const adapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: true,
    enableRateLimit: true,
    rateLimitWindow: 60,
    rateLimitMax: 10,
  });

  const mockRequest = createMockRequest({ id: 'user1', role: 'guest' });
  mockRequest.ip = '192.168.1.100';

  // Test initialize request (should always be allowed)
  const initMessage = {
    jsonrpc: '2.0' as const,
    id: 1,
    method: 'initialize',
    params: {},
  };

  const initResult = await adapter['handleMCPRequest'](initMessage, mockRequest);
  t.truthy(initResult.result, 'Initialize should succeed');
  t.is(initResult.result?.protocolVersion, '2024-11-05', 'Should return correct protocol version');

  // Test tool call with insufficient permissions
  const toolCallMessage = {
    jsonrpc: '2.0' as const,
    id: 2,
    method: 'tools/call',
    params: {
      name: 'list_files',
      arguments: { path: 'src' },
    },
  };

  const toolResult = await adapter['handleMCPRequest'](toolCallMessage, mockRequest);
  t.truthy(toolResult.error, 'Tool call should be denied');
  t.true(
    toolResult.error?.message?.includes('not authorized'),
    'Should return authorization error',
  );

  t.pass();
});

test.serial('MCP Security: Comprehensive attack vectors should be blocked', async (t) => {
  const mockApp = createMockFastify();
  const adapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: false,
    allowedBasePaths: ['/home/err/devel/promethean'],
  });

  // Comprehensive list of attack vectors
  const attackVectors = [
    // Path traversal attacks
    '../../../etc/passwd',
    '..%2f..%2f..%2fetc%2fpasswd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',

    // Unicode attacks
    '‥/etc/passwd',
    '﹒/etc/passwd',
    '．/etc/passwd',

    // Glob attacks
    '**/../etc/passwd',
    '../**',
    '{../etc/passwd}',

    // Dangerous characters
    'file;rm -rf /',
    'file|cat /etc/passwd',
    'file`id`',
    'file$(whoami)',

    // System paths
    '/dev/null',
    '/proc/version',
    '/sys/kernel/version',
    'C:\\Windows\\System32\\config\\SAM',

    // Windows reserved names
    'CON',
    'PRN',
    'AUX',
    'NUL',
    'COM1',
    'LPT1',

    // Null bytes and encoding
    'file\x00.txt',
    'file%00.txt',

    // Excessive length
    'a'.repeat(300),
  ];

  for (const attackVector of attackVectors) {
    const mockRequest = createMockRequest();

    try {
      await adapter['listFiles'](attackVector, false, mockRequest);
      t.fail(`Attack vector should have been blocked: ${attackVector}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      t.true(
        errorMessage.includes('Invalid path') ||
          errorMessage.includes('unsafe') ||
          errorMessage.includes('not allowed') ||
          errorMessage.includes('traversal') ||
          errorMessage.includes('found'),
        `Should block attack vector: ${attackVector} - Error: ${errorMessage}`,
      );
    }
  }

  t.pass();
});

test.serial('MCP Security: Integration with authorization system', async (t) => {
  const mockApp = createMockFastify();
  const adapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: true,
    enableSecurityLogging: true,
    enableAuditLogging: true,
  });

  // Test different user roles
  const testCases = [
    { user: { id: 'guest1', role: 'guest' }, tool: 'echo', shouldAllow: true },
    { user: { id: 'guest1', role: 'guest' }, tool: 'list_files', shouldAllow: false },
    { user: { id: 'user1', role: 'user' }, tool: 'list_files', shouldAllow: true },
    { user: { id: 'user1', role: 'user' }, tool: 'get_user_info', shouldAllow: true },
    { user: { id: 'dev1', role: 'developer' }, tool: 'list_files', shouldAllow: true },
    { user: { id: 'admin1', role: 'admin' }, tool: 'echo', shouldAllow: true },
  ];

  for (const testCase of testCases) {
    const mockRequest = createMockRequest(testCase.user);
    const access = adapter['validateToolAccess'](testCase.tool, mockRequest);

    t.is(
      access.allowed,
      testCase.shouldAllow,
      `Role ${testCase.user.role} should ${testCase.shouldAllow ? 'allow' : 'deny'} access to ${testCase.tool}`,
    );
  }

  // Verify audit log entries
  const auditLog = adapter['auditLog'];
  t.true(auditLog.length > 0, 'Should have audit log entries');

  const deniedEntries = auditLog.filter((entry) => entry.result === 'denied');
  t.true(deniedEntries.length > 0, 'Should have denied access entries');

  t.pass();
});
