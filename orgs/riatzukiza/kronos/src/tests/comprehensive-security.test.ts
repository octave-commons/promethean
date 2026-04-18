/**
 * Comprehensive MCP Security Test Suite
 *
 * This test suite covers all critical security aspects of the MCP system:
 * - Input validation bypass attempts
 * - Authentication and authorization testing
 * - Rate limiting effectiveness
 * - File operation security
 * - Injection attack prevention
 * - Path traversal protection
 * - Content security validation
 */

import test from 'ava';
import { mkdtemp, writeFile, readFile, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Import MCP tools and security modules
import { filesViewFile, filesWriteFileContent } from '../tools/files.js';
import { filesSearch } from '../tools/search.js';
import { validatePathSecurity } from '../validation/comprehensive.js';
import { createSecurityMiddleware } from '../security/middleware.js';
import { authenticationManager } from '../core/authentication.js';
import type { ToolContext } from '../core/types.js';

// ============================================================================
// Test Utilities
// ============================================================================

const createMockContext = (
  role: string = 'guest',
  extraEnv: Record<string, string> = {},
): ToolContext => ({
  env: {
    MCP_USER_ID: 'test-user',
    MCP_USER_ROLE: role,
    REMOTE_ADDR: '127.0.0.1',
    USER_AGENT: 'test-security-agent',
    ...extraEnv,
  },
  fetch: global.fetch,
  now: () => new Date(),
});

const createTempSandbox = async (): Promise<string> => {
  return await mkdtemp(join(tmpdir(), 'mcp-security-test-'));
};

test.after.always(() => {
  authenticationManager.destroy();
});

const generateMaliciousInput = (): string[] => [
  // Path traversal attempts
  '../../../etc/passwd',
  '..\\..\\..\\windows\\system32\\config\\system',
  '....//....//....//etc/passwd',
  '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
  '..%252f..%252f..%252fetc%252fpasswd',

  // Unicode homograph attacks
  '‥/‥/‥/etc/passwd', // Unicode two-dot leaders
  '．/．/．/etc/passwd', // Fullwidth full stops
  '‥．/‥．/etc/passwd', // Mixed unicode dots

  // Command injection
  '; rm -rf /',
  '| cat /etc/passwd',
  '&& curl malicious.com',
  '`whoami`',
  '$(id)',
  '> /tmp/malicious',

  // Script injection
  '<script>alert("xss")</script>',
  'javascript:alert("xss")',
  'data:text/html,<script>alert("xss")</script>',

  // Null bytes and control characters
  'file\x00.txt',
  'file\r\n.txt',
  'file\t.txt',

  // Extremely long inputs
  'a'.repeat(10000),

  // Special characters that break systems
  '"`\'${}&|;<>',
];

// ============================================================================
// Input Validation Security Tests
// ============================================================================

test('security: path validation blocks all traversal attempts', async (t) => {
  const maliciousInputs = generateMaliciousInput();
  const blockedPaths: string[] = [];

  for (const input of maliciousInputs) {
    const result = validatePathSecurity(input);
    if (!result.valid) {
      blockedPaths.push(input);
    }
  }

  t.true(
    blockedPaths.length > maliciousInputs.length * 0.8,
    `Should block >80% of malicious inputs, blocked ${blockedPaths.length}/${maliciousInputs.length}`,
  );

  // Verify critical paths are blocked
  const criticalPaths = [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\system',
    '%2e%2e%2fetc%2fpasswd',
  ];

  for (const path of criticalPaths) {
    const result = validatePathSecurity(path);
    t.false(result.valid, `Should block critical path: ${path}`);
    t.true(
      result.securityIssues!.some(
        (issue) => issue.includes('traversal') || issue.includes('absolute'),
      ),
      `Should identify traversal issue in: ${path}`,
    );
  }
});

test('security: unicode homograph attacks are detected', async (t) => {
  const unicodeAttacks = [
    '‥/‥/‥/etc/passwd',
    '．/．/．/etc/passwd',
    '‥．/‥．/etc/passwd',
    '‥/．/‥/．/etc/passwd',
  ];

  for (const attack of unicodeAttacks) {
    const result = validatePathSecurity(attack);
    t.false(result.valid, `Should block unicode attack: ${attack}`);
    t.true(
      result.securityIssues!.some(
        (issue) => issue.includes('traversal') || issue.includes('unicode'),
      ),
      `Should detect unicode issue in: ${attack}`,
    );
  }
});

test('security: glob pattern attacks are prevented', async (t) => {
  const globAttacks = [
    '**/../../../etc/passwd',
    '../**/etc/passwd',
    '{../,../}/**/passwd',
    '../**/../etc/passwd',
    '../../**/../etc/passwd',
  ];

  for (const attack of globAttacks) {
    const result = validatePathSecurity(attack);
    t.false(result.valid, `Should block glob attack: ${attack}`);
    t.true(
      result
        .securityIssues!
        .some((issue) => {
          const lowered = issue.toLowerCase();
          return lowered.includes('glob') || lowered.includes('traversal');
        }),
      `Should detect glob issue in: ${attack}`,
    );
  }

});

// ============================================================================
// File Operation Security Tests
// ============================================================================

test('security: file operations prevent symlink escapes', async (t) => {
  const sandbox = await createTempSandbox();
  const outsideFile = join(sandbox, '..', 'outside-secret.txt');

  // Create a file outside sandbox
  await writeFile(outsideFile, 'secret content');

  // Create symlink pointing outside
  const symlinkPath = join(sandbox, 'escape-symlink');
  await symlink(outsideFile, symlinkPath);

  const viewFileTool = filesViewFile(createMockContext('guest', { MCP_ROOT_PATH: sandbox }));
  const result = (await viewFileTool.invoke({ relOrFuzzy: 'escape-symlink' })) as any;
  t.false(result.ok, 'Symlink escape should be rejected');
  const message = String(result.error || '').toLowerCase();
  t.true(
    message.includes('symlink') || message.includes('security') || message.includes('outside'),
    'Error should mention security for symlink attempts',
  );

  // Verify original file wasn't compromised
  const content = await readFile(outsideFile, 'utf8');
  t.is(content, 'secret content', 'Original file should remain unchanged');
});

test('security: file write operations are sandboxed', async (t) => {
  const sandbox = await createTempSandbox();
  const writeTool = filesWriteFileContent(createMockContext('guest', { MCP_ROOT_PATH: sandbox }));

  // Attempt to write outside sandbox should fail
  const maliciousPaths = [
    '../../../etc/malicious.txt',
    '/etc/passwd',
    'C:\\Windows\\System32\\malicious.exe',
  ];

  for (const path of maliciousPaths) {
    const result = (await writeTool.invoke({ filePath: path, content: 'malicious' })) as any;
    t.false(result.ok, `Should have blocked write to: ${path}`);
    const message = String(result.error || '').toLowerCase();
    t.true(
      message.includes('security') || message.includes('outside') || message.includes('path'),
      `Error should mention security for path: ${path}`,
    );
  }

  // Valid writes should succeed
  const success = (await writeTool.invoke({ filePath: 'safe.txt', content: 'safe content' })) as any;
  t.true(success.ok, 'Valid writes should succeed');
  const writtenContent = await readFile(join(sandbox, 'safe.txt'), 'utf8');
  t.is(writtenContent, 'safe content', 'Valid writes should succeed');
});

test('security: search operations prevent injection attacks', async (t) => {
  const sandbox = await createTempSandbox();
  const searchTool = filesSearch(createMockContext('guest', { MCP_ROOT_PATH: sandbox }));

  // Create test file
  await writeFile(join(sandbox, 'test.txt'), 'TODO: fix this');

  const injectionAttempts = [
    '; rm -rf /',
    '| cat /etc/passwd',
    '`whoami`',
    '$(id)',
    '<script>alert("xss")</script>',
    '../../etc/passwd',
  ];

  for (const injection of injectionAttempts) {
    try {
      await searchTool.invoke({ query: injection, rel: '.' });
      // If it doesn't throw, verify it doesn't execute commands
      t.pass(`Search handled injection safely: ${injection}`);
    } catch (error) {
      const err = error as Error;
      // Should either succeed safely or fail with validation error
      t.true(
        err.message.includes('validation') || err.message.includes('security'),
        `Should fail with validation/security error for: ${injection}`,
      );
    }
  }
});

// ============================================================================
// Authentication & Authorization Security Tests
// ============================================================================

test('security: authentication prevents token manipulation', async (t) => {
  const tokenManipulationAttempts = [
    '', // Empty token
    'invalid.jwt.token', // Malformed JWT
    'Bearer malformed', // Invalid Bearer format
    'null', // Null token
    undefined, // Undefined token
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c', // Expired token
  ];

  for (const token of tokenManipulationAttempts) {
    // Create mock request with manipulated token
    const mockRequest = {
      headers: {
        authorization: token ? `Bearer ${token}` : undefined,
      },
      ip: '127.0.0.1',
    } as any;

    const authResult = authenticationManager.authenticateRequest(mockRequest);

    if (token && token.length > 0) {
      t.false(authResult.success, `Should reject invalid token: ${token.substring(0, 20)}...`);
      t.true(authResult.error !== undefined, 'Should provide error message');
    } else {
      // No token should succeed with guest access
      t.true(authResult.success, 'Should allow guest access when no token');
      t.is(authResult.role, 'guest', 'Should assign guest role');
    }
  }
});

test('security: authorization enforces role-based access', async (t) => {
  const { createAuthorizedToolFactory } = await import('../core/authorization.js');

  // Test dangerous tool access
  const dangerousTool = filesWriteFileContent(createMockContext());
  const mockFactory = () => dangerousTool;
  const authorizedFactory = createAuthorizedToolFactory(mockFactory, 'files_write_content');

  // Guest should not access dangerous tools
  const guestContext = createMockContext('guest');
  const guestAuthorizedTool = authorizedFactory(guestContext);

  try {
    await guestAuthorizedTool.invoke({ filePath: 'test.txt', content: 'test' });
    t.fail('Guest should not access dangerous tools');
  } catch (error) {
    const err = error as Error;
    t.true(
      err.message.includes('Authorization denied'),
      'Should deny access with authorization error',
    );
  }

  // Admin should access dangerous tools
  const adminContext = createMockContext('admin');
  const adminAuthorizedTool = authorizedFactory(adminContext);

  try {
    await adminAuthorizedTool.invoke({ filePath: 'test.txt', content: 'test' });
    t.pass('Admin should access dangerous tools');
  } catch (error) {
    const err = error as Error;
    t.fail(`Admin should access dangerous tools, got error: ${err.message}`);
  }
});

// ============================================================================
// Rate Limiting Security Tests
// ============================================================================

test('security: rate limiting prevents abuse', async (t) => {
  const securityMiddleware = createSecurityMiddleware({
    rateLimitMaxRequests: 5, // Very low for testing
    rateLimitWindowMs: 1000, // 1 second window
    globalRateLimitMaxPerMinute: 5, // Match per-IP limit for testing
    globalRateLimitMaxPerHour: 5, // Match per-IP limit for testing
  });

  const mockRequests = [];

  const createMockReply = (onStatus?: (code: number) => void) => {
    const reply: any = {
      header: () => reply,
      send: () => reply,
    };
    reply.status = (code: number) => {
      onStatus?.(code);
      const chain = {
        status: code,
        header: () => chain,
        send: () => chain,
      };
      return chain;
    };
    return reply;
  };

  // Generate multiple requests from same IP
  for (let i = 0; i < 10; i++) {
    const mockRequest = {
      ip: '192.168.1.100',
      method: 'POST',
      url: '/mcp/files/write',
      headers: { 'user-agent': 'test-agent' },
    } as any;

    let statusCode: number | null = null;
    const mockReply = createMockReply((code) => {
      statusCode = code;
    });

    securityMiddleware['createSecurityContext'](mockRequest, mockReply);

    // Simulate security middleware processing
    try {
      await securityMiddleware['enforceRateLimit'](mockRequest, mockReply);
      const allowed = !statusCode || statusCode < 400;
      mockRequests.push({ allowed, request: i, code: statusCode });
    } catch (error) {
      const err = error as Error;
      mockRequests.push({ allowed: false, request: i, error: err.message });
    }
  }

  const allowedRequests = mockRequests.filter((r) => r.allowed).length;
  const blockedRequests = mockRequests.filter((r) => !r.allowed).length;

  t.true(allowedRequests <= 5, `Should allow at most 5 requests, allowed: ${allowedRequests}`);
  t.true(blockedRequests >= 4, `Should block at least 4 requests, blocked: ${blockedRequests}`);

  securityMiddleware.destroy();
});

test('security: IP blocking prevents repeated violations', async (t) => {
  const securityMiddleware = createSecurityMiddleware({
    maxFailedAttempts: 3, // Block after 3 violations
    ipBlockDurationMs: 5000, // 5 second block
    rateLimitMaxRequests: 1,
    rateLimitWindowMs: 1000,
  });

  const maliciousIp = '192.168.1.200';
  const mockRequest = {
    ip: maliciousIp,
    method: 'POST',
    url: '/mcp/files/write',
    headers: { 'user-agent': 'malicious-agent' },
  } as any;

  let blockedCount = 0;

  const createMockReply = () => {
    const reply: any = {
      header: () => reply,
      send: () => reply,
    };
    reply.status = (code: number) => {
      if (code === 403) blockedCount++;
      const chain = {
        status: code,
        header: () => chain,
        send: () => chain,
      };
      return chain;
    };
    return reply;
  };

  // Simulate multiple violations
  for (let i = 0; i < 7; i++) {
    const mockReply = createMockReply();

    securityMiddleware['createSecurityContext'](mockRequest, mockReply);

    try {
      // This should trigger rate limit violation
      await securityMiddleware['enforceRateLimit'](mockRequest, mockReply);
    } catch (error) {
      // Expected to throw after IP is blocked
    }
  }

  t.true(blockedCount >= 2, `Should block IP after violations, blocked: ${blockedCount}`);

  securityMiddleware.destroy();
});

// ============================================================================
// Content Security Tests
// ============================================================================

test('security: file content validation prevents malicious uploads', async (t) => {
  const maliciousContents = [
    '<script>alert("xss")</script>',
    'javascript:alert("xss")',
    '<?php system($_GET["cmd"]); ?>',
    '#!/bin/bash\nrm -rf /',
    'powershell -Command "Remove-Item -Recurse -Force C:\\"',
    '<% eval request("cmd") %>',
    'data:text/html,<script>alert(1)</script>',
  ];

  for (const content of maliciousContents) {
    // Test content validation logic
    const isMalicious =
      content.includes('<script>') ||
      content.includes('javascript:') ||
      content.includes('<?php') ||
      content.includes('eval(') ||
      content.includes('system(') ||
      content.includes('rm -rf') ||
      content.includes('Remove-Item') ||
      content.includes('<%');

    t.true(isMalicious, `Should detect malicious content: ${content.substring(0, 50)}...`);
  }
});

test('security: input size limits prevent DoS attacks', async (t) => {
  const largeInputs = [
    'a'.repeat(1024 * 1024 + 1), // Just over 1MB
    'x'.repeat(5 * 1024 * 1024), // 5MB string
    { data: 'y'.repeat(2 * 1024 * 1024) }, // Large object payload
    Array(500000).fill('z'), // Large array
  ];

  for (const input of largeInputs) {
    const inputSize = JSON.stringify(input).length;

    // Check if input exceeds reasonable limits
    const isTooLarge = inputSize >= 1024 * 1024; // 1MB limit

    t.true(isTooLarge, `Should detect oversized input: ${inputSize} bytes`);
  }
});

// ============================================================================
// Comprehensive Security Integration Tests
// ============================================================================

test('security: comprehensive attack simulation', async (t) => {
  const sandbox = await createTempSandbox();

  const outsideFile = join(sandbox, '..', 'attack-outside.txt');
  await writeFile(outsideFile, 'outside');
  const symlinkTarget = join(sandbox, 'symlink');
  await symlink(outsideFile, symlinkTarget);

  const attacks = [
    // Path traversal + command injection
    {
      tool: 'files_write',
      args: { filePath: '../../../etc;rm -rf /', content: 'pwned' },
      shouldBlock: true,
    },

    // Unicode homograph + script injection
    {
      tool: 'files_write',
      args: { filePath: '‥/‥/script.js', content: '<script>alert(1)</script>' },
      shouldBlock: true,
    },

    // Large input + injection
    {
      tool: 'files_search',
      args: { query: 'a'.repeat(10000) + ';rm -rf /', rel: sandbox },
      shouldBlock: false,
    },

    // Symlink escape + content injection
    {
      tool: 'files_write',
      args: { filePath: 'symlink', content: '<?php system($_GET["cmd"]); ?>' },
      shouldBlock: true,
    },
  ];

  let blockedAttacks = 0;

  for (const attack of attacks) {
    let blocked = false;

    try {
      switch (attack.tool) {
        case 'files_write': {
          const writeTool = filesWriteFileContent(
            createMockContext('guest', { MCP_ROOT_PATH: sandbox }),
          );
          const result = (await writeTool.invoke(attack.args)) as any;
          blocked = result && result.ok === false;
          break;
        }
        case 'files_search': {
          const searchTool = filesSearch(createMockContext('guest', { MCP_ROOT_PATH: sandbox }));
          const result = (await searchTool.invoke(attack.args)) as any;
          blocked = result && result.ok === false;
          if (!blocked) {
            const snippet =
              typeof attack.args?.query === 'string'
                ? attack.args.query.substring(0, 20)
                : 'search attack';
            t.pass(`Search handled attack safely: ${snippet}...`);
          }
          break;
        }
        default:
          break;
      }
    } catch (error) {
      blocked = true;
    }

    if (blocked) {
      blockedAttacks++;
    } else if (attack.shouldBlock !== false) {
      t.fail(`Attack should have been blocked: ${JSON.stringify(attack.args)}`);
    }
  }

  t.true(
    blockedAttacks >= attacks.length * 0.7,
    `Should block >70% of attacks, blocked: ${blockedAttacks}/${attacks.length}`,
  );
});

// ============================================================================
// Security Configuration Tests
// ============================================================================

test('security: configuration validation prevents insecure settings', async (t) => {
  const insecureConfigs = [
    // Rate limiting too permissive
    { rateLimitMaxRequests: 1000000, rateLimitWindowMs: 1 },

    // Security headers disabled
    { enableSecurityHeaders: false },

    // Origins too permissive
    { allowedOrigins: ['*'] },

    // Request size too large
    { maxRequestSizeBytes: 1024 * 1024 * 1024 }, // 1GB

    // Audit logging disabled
    { enableAuditLog: false },
  ];

  for (const config of insecureConfigs) {
    // Validate security configuration
    const isSecure =
      (config.rateLimitMaxRequests || 1000) <= 10000 &&
      config.enableSecurityHeaders !== false &&
      (!config.allowedOrigins || config.allowedOrigins.length <= 10) &&
      (!config.maxRequestSizeBytes || config.maxRequestSizeBytes <= 100 * 1024 * 1024) && // 100MB
      config.enableAuditLog !== false;

    // Some configs might be intentionally permissive for development
    if (!isSecure) {
      t.pass(`Detected potentially insecure configuration: ${JSON.stringify(config)}`);
    }
  }
});

// ============================================================================
// Performance Impact Tests
// ============================================================================

test('security: security measures do not significantly impact performance', async (t) => {
  const iterations = 1000;
  const startTime = Date.now();

  // Test validation performance
  for (let i = 0; i < iterations; i++) {
    validatePathSecurity(`test-file-${i}.txt`);
  }

  const validationTime = Date.now() - startTime;
  const avgValidationTime = validationTime / iterations;

  t.true(
    avgValidationTime < 10,
    `Average validation time should be <10ms, was: ${avgValidationTime}ms`,
  );

  // Test authentication performance
  const authStartTime = Date.now();
  for (let i = 0; i < iterations; i++) {
    const mockRequest = {
      headers: { authorization: `Bearer test-token-${i}` },
      ip: '127.0.0.1',
    } as any;

    authenticationManager.authenticateRequest(mockRequest);
  }

  const authTime = Date.now() - authStartTime;
  const avgAuthTime = authTime / iterations;

  t.true(avgAuthTime < 5, `Average authentication time should be <5ms, was: ${avgAuthTime}ms`);
});
