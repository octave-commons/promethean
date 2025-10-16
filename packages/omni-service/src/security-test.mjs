#!/usr/bin/env node

/**
 * MCP Security Validation Script
 * Tests path traversal and input validation security
 */

import { MCPAdapter } from '../dist/adapters/mcp.js';

// Mock Fastify instance
const mockApp = {
  get: () => {},
  post: () => {},
  log: {
    debug: () => {},
    warn: () => {},
    error: () => {},
    info: () => {},
  },
};

// Mock request object
const createMockRequest = (user = null) => ({
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

async function testSecurity() {
  console.log('🔒 Starting MCP Security Validation...\n');

  const adapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: false,
    allowedBasePaths: ['/home/err/devel/promethean'],
  });

  let testsPassed = 0;
  let testsTotal = 0;

  // Test cases for path traversal attempts
  const traversalAttempts = [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '/etc/passwd',
    '/etc/shadow',
    '....//....//....//etc/passwd',
    '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
    '..%2f..%2f..%2fetc%2fpasswd',
    'CON',
    'PRN',
    'AUX',
    'NUL',
  ];

  console.log('🧪 Testing Path Traversal Protection:');
  for (const maliciousPath of traversalAttempts) {
    testsTotal++;
    const mockRequest = createMockRequest();

    try {
      await adapter.listFiles(maliciousPath, false, mockRequest);
      console.log(`❌ FAILED: Path traversal not blocked: ${maliciousPath}`);
    } catch (error) {
      const errorMessage = error.message || '';
      if (
        errorMessage.includes('Invalid path') ||
        errorMessage.includes('unsafe') ||
        errorMessage.includes('not allowed')
      ) {
        console.log(`✅ PASSED: Path traversal blocked: ${maliciousPath}`);
        testsPassed++;
      } else {
        console.log(`❌ FAILED: Unexpected error for ${maliciousPath}: ${errorMessage}`);
      }
    }
  }

  // Test dangerous characters
  const dangerousPaths = [
    'file<script>alert("xss")</script>.txt',
    'file|rm -rf /',
    'file&whoami',
    'file;cat /etc/passwd',
    'file`id`',
    'file$HOME',
  ];

  console.log('\n🧪 Testing Dangerous Character Protection:');
  for (const dangerousPath of dangerousPaths) {
    testsTotal++;
    const mockRequest = createMockRequest();

    try {
      await adapter.listFiles(dangerousPath, false, mockRequest);
      console.log(`❌ FAILED: Dangerous characters not blocked: ${dangerousPath}`);
    } catch (error) {
      const errorMessage = error.message || '';
      if (errorMessage.includes('Invalid path') || errorMessage.includes('unsafe')) {
        console.log(`✅ PASSED: Dangerous characters blocked: ${dangerousPath}`);
        testsPassed++;
      } else {
        console.log(`❌ FAILED: Unexpected error for ${dangerousPath}: ${errorMessage}`);
      }
    }
  }

  // Test valid paths
  const validPaths = ['src', 'src/index.ts', 'docs/readme.md', 'package.json'];

  console.log('\n🧪 Testing Valid Paths (should not trigger security errors):');
  for (const validPath of validPaths) {
    testsTotal++;
    const mockRequest = createMockRequest();

    try {
      await adapter.listFiles(validPath, false, mockRequest);
      console.log(`✅ PASSED: Valid path accepted: ${validPath}`);
      testsPassed++;
    } catch (error) {
      const errorMessage = error.message || '';
      if (
        !errorMessage.includes('Invalid path') &&
        !errorMessage.includes('unsafe') &&
        !errorMessage.includes('not allowed') &&
        !errorMessage.includes('traversal')
      ) {
        console.log(`✅ PASSED: Valid path (non-security error): ${validPath} - ${errorMessage}`);
        testsPassed++;
      } else {
        console.log(`❌ FAILED: Valid path blocked by security: ${validPath} - ${errorMessage}`);
      }
    }
  }

  // Test file type restrictions
  const disallowedFiles = ['malicious.exe', 'virus.bat', 'script.sh', 'payload.dll'];

  console.log('\n🧪 Testing File Type Restrictions:');
  for (const disallowedFile of disallowedFiles) {
    testsTotal++;
    const mockRequest = createMockRequest();

    try {
      await adapter.readFile(disallowedFile, 'utf8', mockRequest);
      console.log(`❌ FAILED: Disallowed file type not blocked: ${disallowedFile}`);
    } catch (error) {
      const errorMessage = error.message || '';
      if (errorMessage.includes('not allowed') || errorMessage.includes('Invalid path')) {
        console.log(`✅ PASSED: Disallowed file type blocked: ${disallowedFile}`);
        testsPassed++;
      } else {
        console.log(`❌ FAILED: Unexpected error for ${disallowedFile}: ${errorMessage}`);
      }
    }
  }

  // Test authentication enforcement
  console.log('\n🧪 Testing Authentication Enforcement:');
  testsTotal++;
  const authAdapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: true, // Enable authentication
  });

  const mockRequest = createMockRequest(); // No user provided

  try {
    await authAdapter.listFiles('src', false, mockRequest);
    console.log('❌ FAILED: Unauthenticated request not blocked');
  } catch (error) {
    const errorMessage = error.message || '';
    if (errorMessage.includes('Authentication required')) {
      console.log('✅ PASSED: Authentication properly enforced');
      testsPassed++;
    } else {
      console.log(`❌ FAILED: Unexpected error: ${errorMessage}`);
    }
  }

  console.log(`\n📊 Security Test Results:`);
  console.log(`Passed: ${testsPassed}/${testsTotal}`);
  console.log(`Success Rate: ${((testsPassed / testsTotal) * 100).toFixed(1)}%`);

  if (testsPassed === testsTotal) {
    console.log('\n🎉 All security tests passed! MCP adapter is properly secured.');
    process.exit(0);
  } else {
    console.log('\n🚨 Some security tests failed. Immediate attention required.');
    process.exit(1);
  }
}

// Run the security test
testSecurity().catch(console.error);
