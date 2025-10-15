/* eslint-disable functional/no-let, functional/immutable-data, @typescript-eslint/require-await, @typescript-eslint/no-unused-vars */
import test from 'ava';
import { SecurityTestFramework } from '../testing/index.js';

// Integration tests for comprehensive security validation
// Focus: Template Injection, Path Traversal, Input Validation, Authorization, OWASP Top 10

test('Security Integration - Template Injection Vulnerabilities', async (t) => {
  const framework = new SecurityTestFramework();

  // Test template replacement function for injection vulnerabilities
  const templateValidator = (input: any) => {
    if (typeof input === 'string') {
      // Block template injection patterns
      const injectionPatterns = [
        /\$\{.*\}/, // ${...} template syntax
        /\{\{.*\}\}/, // {{...}} template syntax
        /<%.*%>/, // <%...%> template syntax
        /\{\#.*\#\}/, // {#...#} template syntax
        /`.*\$\{.*\}`/, // Backtick template literals
      ];

      if (injectionPatterns.some((pattern) => pattern.test(input))) {
        throw new Error('Template injection detected');
      }
    }
    return input;
  };

  const results = await framework.runFullSecurityTest(
    {
      templateValidator,
    },
    {
      includeFuzzing: true,
      includePromptInjection: true,
      customTests: {
        fuzzing: [
          {
            name: 'template-injection-1',
            input: '${process.env}',
            expectedBehavior: 'reject' as const,
          },
          {
            name: 'template-injection-2',
            input: '{{config.secret}}',
            expectedBehavior: 'reject' as const,
          },
          {
            name: 'template-injection-3',
            input: '<%= system.command %>',
            expectedBehavior: 'reject' as const,
          },
          {
            name: 'template-injection-4',
            input: '{#user.input#}',
            expectedBehavior: 'reject' as const,
          },
          {
            name: 'template-injection-5',
            input: '`${malicious.code}`',
            expectedBehavior: 'reject' as const,
          },
        ],
      },
    },
  );

  // Should block all template injection attempts
  const templateTests =
    results.fuzzing?.filter((r) => r.testCase.name?.includes('template-injection')) || [];

  t.true(templateTests.length > 0);
  t.true(templateTests.every((test) => test.result === 'passed'));

  // Should have high security score for template protection
  t.true(results.summary.overallScore > 80);
});

test('Security Integration - Path Traversal Protection', async (t) => {
  const framework = new SecurityTestFramework();

  // Test path traversal protection
  const pathValidator = (input: any) => {
    if (typeof input === 'string') {
      // Block path traversal patterns
      const traversalPatterns = [
        /\.\.[\/\\]/, // ../ or ..\
        /\.\.%2f/, // ..%2f (URL encoded)
        /\.\.%5c/, // ..%5c (URL encoded)
        /%2e%2e[\/\\]/, // %2e%2e/ or %2e%2e\
        /\.\.%252f/, // ..%252f (double encoded)
        /\.\.%255c/, // ..%255c (double encoded)
      ];

      if (traversalPatterns.some((pattern) => pattern.test(input))) {
        throw new Error('Path traversal detected');
      }

      // Normalize and validate path
      const normalized = input.replace(/[\/\\]+/g, '/');
      if (normalized.includes('../') || normalized.startsWith('/')) {
        throw new Error('Invalid path detected');
      }
    }
    return input;
  };

  const results = await framework.runFullSecurityTest(
    {
      pathValidator,
    },
    {
      includeFuzzing: true,
      customTests: {
        fuzzing: [
          {
            name: 'path-traversal-1',
            input: '../../../etc/passwd',
            expectedBehavior: 'reject' as const,
          },
          {
            name: 'path-traversal-2',
            input: '..\\..\\windows\\system32',
            expectedBehavior: 'reject' as const,
          },
          {
            name: 'path-traversal-3',
            input: '..%2f..%2f..%2fetc%2fpasswd',
            expectedBehavior: 'reject' as const,
          },
          {
            name: 'path-traversal-4',
            input: '..%5c..%5c..%5cwindows',
            expectedBehavior: 'reject' as const,
          },
          { name: 'path-traversal-5', input: '/etc/shadow', expectedBehavior: 'reject' as const },
          {
            name: 'path-traversal-6',
            input: '....//....//....//etc',
            expectedBehavior: 'reject' as const,
          },
        ],
      },
    },
  );

  // Should block all path traversal attempts
  const traversalTests =
    results.fuzzing?.filter((r) => r.testCase.name?.includes('path-traversal')) || [];

  t.true(traversalTests.length > 0);
  t.true(traversalTests.every((test) => test.result === 'passed'));

  // Should have high security score for path protection
  t.true(results.summary.overallScore > 80);
});

test('Security Integration - Input Validation Framework', async (t) => {
  const framework = new SecurityTestFramework();

  // Comprehensive input validation
  const inputValidator = (input: any) => {
    // Type validation
    if (input === null || input === undefined) {
      throw new Error('Null/undefined input not allowed');
    }

    if (typeof input === 'string') {
      // Length validation
      if (input.length > 10000) {
        throw new Error('Input too long');
      }

      // Character validation
      if (!/^[\x20-\x7E\s]*$/.test(input)) {
        throw new Error('Invalid characters detected');
      }

      // SQL injection patterns
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/i,
        /(\b(UNION|OR|AND)\b.*\b(=|LIKE)\b)/i,
        /(--|\/\*|\*\/|;)/,
        /(\bEXEC\b|\bEXECUTE\b)/i,
      ];

      if (sqlPatterns.some((pattern) => pattern.test(input))) {
        throw new Error('SQL injection detected');
      }

      // XSS patterns
      const xssPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe[^>]*>/gi,
        /<object[^>]*>/gi,
        /<embed[^>]*>/gi,
      ];

      if (xssPatterns.some((pattern) => pattern.test(input))) {
        throw new Error('XSS detected');
      }
    }

    if (typeof input === 'number') {
      if (!isFinite(input)) {
        throw new Error('Invalid number');
      }
      if (input > Number.MAX_SAFE_INTEGER || input < Number.MIN_SAFE_INTEGER) {
        throw new Error('Number out of range');
      }
    }

    if (typeof input === 'object') {
      if (Array.isArray(input)) {
        if (input.length > 1000) {
          throw new Error('Array too large');
        }
      } else {
        const keys = Object.keys(input);
        if (keys.length > 100) {
          throw new Error('Object too large');
        }
      }
    }

    return input;
  };

  const results = await framework.runFullSecurityTest(
    {
      inputValidator,
    },
    {
      includeFuzzing: true,
      includePromptInjection: true,
      customTests: {
        fuzzing: [
          {
            name: 'sql-injection-1',
            input: "'; DROP TABLE users; --",
            expectedBehavior: 'sanitize' as const,
          },
          { name: 'sql-injection-2', input: "' OR '1'='1", expectedBehavior: 'sanitize' as const },
          {
            name: 'xss-1',
            input: '<script>alert("xss")</script>',
            expectedBehavior: 'sanitize' as const,
          },
          {
            name: 'xss-2',
            input: 'javascript:alert("xss")',
            expectedBehavior: 'sanitize' as const,
          },
          {
            name: 'xss-3',
            input: '<img src="x" onerror="alert(1)">',
            expectedBehavior: 'sanitize' as const,
          },
          { name: 'large-input', input: 'a'.repeat(10001), expectedBehavior: 'reject' as const },
          { name: 'invalid-number', input: NaN, expectedBehavior: 'reject' as const },
          { name: 'infinite-number', input: Infinity, expectedBehavior: 'reject' as const },
        ],
      },
    },
  );

  // Should block all malicious inputs
  const maliciousTests =
    results.fuzzing?.filter(
      (r) =>
        r.testCase.name?.includes('sql-injection') ||
        r.testCase.name?.includes('xss') ||
        r.testCase.name?.includes('large-input') ||
        r.testCase.name?.includes('invalid-number'),
    ) || [];

  t.true(maliciousTests.length > 0);
  t.true(maliciousTests.every((test) => test.result === 'passed'));

  // Should have excellent security score
  t.true(results.summary.overallScore > 85);
});

test('Security Integration - Authorization and Access Control', async (t) => {
  const framework = new SecurityTestFramework();

  // Mock authorization system
  const authValidator = (input: any) => {
    // Simulate authorization check
    const { user, resource, action } = input || {};

    if (!user || !resource || !action) {
      throw new Error('Missing authorization parameters');
    }

    // Check user permissions
    const permissions = user.permissions || [];
    const requiredPermission = `${resource}:${action}`;

    if (!permissions.includes(requiredPermission) && !permissions.includes('*')) {
      throw new Error('Access denied');
    }

    // Check role-based access
    const role = user.role;
    const adminResources = ['users', 'system', 'config'];

    if (action === 'delete' && adminResources.includes(resource) && role !== 'admin') {
      throw new Error('Insufficient privileges for destructive operation');
    }

    return { authorized: true, user, resource, action };
  };

  const results = await framework.runFullSecurityTest(
    {
      authValidator,
    },
    {
      customTests: {
        fuzzing: [
          {
            name: 'auth-missing-params',
            input: {},
            expectedBehavior: 'reject' as const,
          },
          {
            name: 'auth-no-permissions',
            input: { user: { permissions: [] }, resource: 'users', action: 'read' },
            expectedBehavior: 'reject' as const,
          },
          {
            name: 'auth-insufficient-role',
            input: {
              user: { role: 'user', permissions: ['users:read'] },
              resource: 'users',
              action: 'delete',
            },
            expectedBehavior: 'reject' as const,
          },
          {
            name: 'auth-valid-admin',
            input: {
              user: { role: 'admin', permissions: ['*'] },
              resource: 'system',
              action: 'delete',
            },
            expectedBehavior: 'allow' as const,
          },
          {
            name: 'auth-valid-user',
            input: {
              user: { role: 'user', permissions: ['tasks:read'] },
              resource: 'tasks',
              action: 'read',
            },
            expectedBehavior: 'allow' as const,
          },
        ],
      },
    },
  );

  // Should properly validate authorization
  const authTests = results.fuzzing?.filter((r) => r.testCase.name?.includes('auth-')) || [];

  t.true(authTests.length > 0);

  // Check that unauthorized attempts are blocked
  const blockedTests = authTests.filter(
    (t) => t.testCase.expectedBehavior === 'reject' && t.result === 'passed',
  );
  t.true(blockedTests.length > 0);

  // Check that authorized attempts are allowed
  const allowedTests = authTests.filter(
    (t) => t.testCase.expectedBehavior === 'allow' && t.result === 'passed',
  );
  t.true(allowedTests.length > 0);
});

test('Security Integration - OWASP Top 10 Coverage', async (t) => {
  const framework = new SecurityTestFramework();

  // OWASP Top 10 protection validator
  const owaspValidator = (input: any) => {
    if (typeof input === 'string') {
      // A01: Broken Access Control
      if (input.includes('admin=true') || input.includes('role=admin')) {
        throw new Error('Access control manipulation detected');
      }

      // A02: Cryptographic Failures
      if (input.includes('password=') || input.includes('secret=')) {
        throw new Error('Potential credential exposure');
      }

      // A03: Injection
      const injectionPatterns = [
        /['"]\s*;\s*DROP/i,
        /UNION\s+SELECT/i,
        /<script[^>]*>/i,
        /\$\{.*\}/,
      ];

      if (injectionPatterns.some((pattern) => pattern.test(input))) {
        throw new Error('Injection attack detected');
      }

      // A04: Insecure Design
      if (input.includes('debug=true') || input.includes('test_mode=true')) {
        throw new Error('Debug mode activation detected');
      }

      // A05: Security Misconfiguration
      if (input.includes('config=') || input.includes('.env')) {
        throw new Error('Configuration access detected');
      }

      // A06: Vulnerable Components
      if (input.includes('version=') || input.includes('vulnerable=')) {
        throw new Error('Component version probing detected');
      }

      // A07: Identity and Authentication Failures
      if (input.includes('token=') || input.includes('jwt=')) {
        throw new Error('Authentication token exposure detected');
      }

      // A08: Software and Data Integrity Failures
      if (input.includes('checksum=') || input.includes('signature=')) {
        throw new Error('Integrity validation bypass detected');
      }

      // A09: Security Logging and Monitoring Failures
      if (input.includes('log=') || input.includes('audit=')) {
        throw new Error('Log tampering detected');
      }

      // A10: Server-Side Request Forgery (SSRF)
      const ssrfPatterns = [
        /https?:\/\/localhost/i,
        /https?:\/\/127\.0\.0\.1/i,
        /https?:\/\/192\.168\./i,
        /https?:\/\/10\./i,
        /file:\/\//i,
      ];

      if (ssrfPatterns.some((pattern) => pattern.test(input))) {
        throw new Error('SSRF attempt detected');
      }
    }

    return input;
  };

  const results = await framework.runFullSecurityTest(
    {
      owaspValidator,
    },
    {
      includeFuzzing: true,
      includePromptInjection: true,
      customTests: {
        fuzzing: [
          {
            name: 'owasp-a01-access-control',
            input: 'admin=true&role=admin',
            expectedBehavior: 'reject' as const,
          },
          {
            name: 'owasp-a02-crypto',
            input: 'password=secret123',
            expectedBehavior: 'sanitize' as const,
          },
          {
            name: 'owasp-a03-injection',
            input: "'; DROP TABLE users; --",
            expectedBehavior: 'sanitize' as const,
          },
          {
            name: 'owasp-a04-insecure-design',
            input: 'debug=true&test_mode=true',
            expectedBehavior: 'reject' as const,
          },
          {
            name: 'owasp-a05-misconfig',
            input: 'config=production&.env',
            expectedBehavior: 'reject' as const,
          },
          {
            name: 'owasp-a06-components',
            input: 'version=1.0.0&vulnerable=true',
            expectedBehavior: 'reject' as const,
          },
          {
            name: 'owasp-a07-auth',
            input: 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
            expectedBehavior: 'sanitize' as const,
          },
          {
            name: 'owasp-a08-integrity',
            input: 'checksum=abc123&signature=def456',
            expectedBehavior: 'sanitize' as const,
          },
          {
            name: 'owasp-a09-logging',
            input: 'log=error&audit=false',
            expectedBehavior: 'sanitize' as const,
          },
          {
            name: 'owasp-a10-ssrf',
            input: 'http://localhost:8080/admin',
            expectedBehavior: 'reject' as const,
          },
        ],
      },
    },
  );

  // Should cover all OWASP Top 10 categories
  const owaspTests = results.fuzzing?.filter((r) => r.testCase.name?.includes('owasp-')) || [];

  t.true(owaspTests.length >= 10);
  t.true(owaspTests.every((test) => test.result === 'passed'));

  // Should have maximum security score
  t.true(results.summary.overallScore > 90);

  // Should generate comprehensive vulnerability report
  const report = framework.generateVulnerabilityReport(results);
  t.true(report.vulnerabilities.length === 0); // All should be blocked
  t.true(report.riskScore < 20); // Low risk score
});

test('Security Integration - Performance Impact Assessment', async (t) => {
  const framework = new SecurityTestFramework();

  // Test performance impact of security measures
  const performantValidator = (input: any) => {
    const startTime = performance.now();

    // Simulate security checks
    if (typeof input === 'string') {
      // Quick pattern matching (optimized)
      const quickPatterns = [/<script/, /javascript:/, /\.\./];
      if (quickPatterns.some((pattern) => pattern.test(input))) {
        throw new Error('Quick security check failed');
      }

      // More thorough validation for suspicious inputs
      if (input.length > 100) {
        const thoroughPatterns = [/\$\{.*\}/, /UNION.*SELECT/i];
        if (thoroughPatterns.some((pattern) => pattern.test(input))) {
          throw new Error('Thorough security check failed');
        }
      }
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Security validation should complete quickly
    if (duration > 10) {
      // 10ms threshold
      throw new Error(`Security validation too slow: ${duration}ms`);
    }

    return input;
  };

  const results = await framework.runFullSecurityTest(
    {
      performantValidator,
    },
    {
      includeFuzzing: true,
      customTests: {
        fuzzing: [
          { name: 'perf-small-input', input: 'hello', expectedBehavior: 'allow' as const },
          { name: 'perf-medium-input', input: 'a'.repeat(500), expectedBehavior: 'allow' as const },
          { name: 'perf-large-input', input: 'a'.repeat(5000), expectedBehavior: 'allow' as const },
          {
            name: 'perf-suspicious-input',
            input: '<script>alert("test")</script>',
            expectedBehavior: 'sanitize' as const,
          },
        ],
      },
    },
  );

  // All tests should pass (performance within limits)
  const perfTests = results.fuzzing?.filter((r) => r.testCase.name?.includes('perf-')) || [];

  t.true(perfTests.length > 0);
  t.true(perfTests.every((test) => test.result === 'passed'));

  // Should maintain good performance
  t.true(results.summary.overallScore > 75);
});

test('Security Integration - Cross-Component Validation', async (t) => {
  const framework = new SecurityTestFramework();

  // Test security across multiple components
  const componentValidator = (input: any) => {
    const { component, data } = input || {};

    if (!component || !data) {
      throw new Error('Missing component or data');
    }

    // Component-specific security rules
    switch (component) {
      case 'mcp-tools':
        // MCP tools need strict validation
        if (typeof data === 'string' && data.includes('rm -rf')) {
          throw new Error('Dangerous command in MCP tools');
        }
        break;

      case 'file-operations':
        // File operations need path validation
        if (typeof data === 'string' && data.includes('../')) {
          throw new Error('Path traversal in file operations');
        }
        break;

      case 'template-system':
        // Template system needs injection protection
        if (typeof data === 'string' && data.includes('${')) {
          throw new Error('Template injection in template system');
        }
        break;

      case 'user-input':
        // User input needs comprehensive validation
        if (typeof data === 'string') {
          if (data.length > 1000) {
            throw new Error('Input too long for user input');
          }
          if (!/^[\x20-\x7E\s]*$/.test(data)) {
            throw new Error('Invalid characters in user input');
          }
        }
        break;

      default:
        throw new Error('Unknown component');
    }

    return { component, data, validated: true };
  };

  const results = await framework.runFullSecurityTest(
    {
      componentValidator,
    },
    {
      customTests: {
        fuzzing: [
          {
            name: 'component-mcp-dangerous',
            input: { component: 'mcp-tools', data: 'rm -rf /' },
            expectedBehavior: 'reject' as const,
          },
          {
            name: 'component-file-traversal',
            input: { component: 'file-operations', data: '../../../etc/passwd' },
            expectedBehavior: 'reject' as const,
          },
          {
            name: 'component-template-injection',
            input: { component: 'template-system', data: '${process.env}' },
            expectedBehavior: 'reject' as const,
          },
          {
            name: 'component-user-invalid',
            input: { component: 'user-input', data: 'a'.repeat(1001) },
            expectedBehavior: 'reject' as const,
          },
          {
            name: 'component-valid-input',
            input: { component: 'user-input', data: 'Hello, World!' },
            expectedBehavior: 'allow' as const,
          },
        ],
      },
    },
  );

  // Should validate all components properly
  const componentTests =
    results.fuzzing?.filter((r) => r.testCase.name?.includes('component-')) || [];

  t.true(componentTests.length > 0);

  // Should block dangerous inputs
  const blockedTests = componentTests.filter(
    (t) => t.testCase.expectedBehavior === 'reject' && t.result === 'passed',
  );
  t.true(blockedTests.length > 0);

  // Should allow valid inputs
  const allowedTests = componentTests.filter(
    (t) => t.testCase.expectedBehavior === 'allow' && t.result === 'passed',
  );
  t.true(allowedTests.length > 0);

  // Should have good security coverage
  t.true(results.summary.overallScore > 80);
});
