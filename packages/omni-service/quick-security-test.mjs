#!/usr/bin/env node

/**
 * Quick MCP Security Test - Emergency Validation
 * Tests the critical security functions without full test framework
 */

import MCPAdapter from './dist/adapters/mcp.js';

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

// Mock request
const mockRequest = {
  user: null,
  headers: {},
  ip: '127.0.0.1',
};

async function runCriticalSecurityTests() {
  console.log('🚨 EMERGENCY MCP SECURITY VALIDATION');
  console.log('=====================================');

  const adapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: false,
    allowedBasePaths: ['/home/err/devel/promethean'],
    maxFileSize: 1024 * 1024, // 1MB
  });

  let testsPassed = 0;
  let testsTotal = 0;
  let criticalFailures = 0;

  // Test 1: Command Injection Prevention
  console.log('\n📋 Testing Command Injection Prevention...');
  const maliciousCommands = [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    'file;rm -rf /',
    'file|cat /etc/passwd',
    'file`whoami`',
    'file$HOME',
  ];

  for (const cmd of maliciousCommands) {
    testsTotal++;
    try {
      await adapter['listFiles'](cmd, false, mockRequest);
      console.log(`  ❌ FAILED: Should block command injection: ${cmd}`);
      criticalFailures++;
    } catch (error) {
      const msg = error.message;
      if (msg.includes('Invalid path') || msg.includes('unsafe') || msg.includes('traversal')) {
        console.log(`  ✅ PASSED: Blocked command injection: ${cmd}`);
        testsPassed++;
      } else {
        console.log(`  ❌ FAILED: Wrong error for ${cmd}: ${msg}`);
        criticalFailures++;
      }
    }
  }

  // Test 2: File Access Control
  console.log('\n📋 Testing File Access Control...');
  const restrictedPaths = [
    '/etc/passwd',
    '/etc/shadow',
    '~/.ssh/id_rsa',
    '/proc/version',
    '/sys/kernel/debug',
  ];

  for (const path of restrictedPaths) {
    testsTotal++;
    try {
      await adapter['readFile'](path, 'utf8', mockRequest);
      console.log(`  ❌ FAILED: Should block restricted path: ${path}`);
      criticalFailures++;
    } catch (error) {
      const msg = error.message;
      if (msg.includes('Invalid path') || msg.includes('unsafe') || msg.includes('not allowed')) {
        console.log(`  ✅ PASSED: Blocked restricted path: ${path}`);
        testsPassed++;
      } else {
        console.log(`  ❌ FAILED: Wrong error for ${path}: ${msg}`);
        criticalFailures++;
      }
    }
  }

  // Test 3: Authentication Enforcement
  console.log('\n📋 Testing Authentication Enforcement...');
  const authAdapter = new MCPAdapter(mockApp, {
    prefix: '/mcp',
    enableAuth: true, // Enable auth
  });

  testsTotal++;
  try {
    await authAdapter['listFiles']('src', false, mockRequest);
    console.log(`  ❌ FAILED: Should require authentication`);
    criticalFailures++;
  } catch (error) {
    const msg = error.message;
    if (msg.includes('Authentication required')) {
      console.log(`  ✅ PASSED: Correctly requires authentication`);
      testsPassed++;
    } else {
      console.log(`  ❌ FAILED: Wrong auth error: ${msg}`);
      criticalFailures++;
    }
  }

  // Test 4: Valid Paths Allowed
  console.log('\n📋 Testing Valid Paths Allowed...');
  const validPaths = ['src', 'docs', 'package.json', 'README.md'];

  for (const path of validPaths) {
    testsTotal++;
    try {
      await adapter['listFiles'](path, false, mockRequest);
      console.log(`  ✅ PASSED: Valid path allowed: ${path}`);
      testsPassed++;
    } catch (error) {
      const msg = error.message;
      if (msg.includes('Invalid path') || msg.includes('unsafe') || msg.includes('traversal')) {
        console.log(`  ❌ FAILED: Valid path blocked: ${path} - ${msg}`);
        criticalFailures++;
      } else {
        // Other errors (like file not found) are acceptable
        console.log(`  ✅ PASSED: Valid path not security-blocked: ${path}`);
        testsPassed++;
      }
    }
  }

  // Results
  console.log('\n📊 SECURITY VALIDATION RESULTS:');
  console.log(`Tests Passed: ${testsPassed}/${testsTotal}`);
  console.log(`Critical Failures: ${criticalFailures}`);
  console.log(`Security Status: ${criticalFailures === 0 ? '✅ SECURE' : '🚨 VULNERABLE'}`);

  if (criticalFailures === 0) {
    console.log('\n✅ MCP SECURITY HARDENING IMPLEMENTATION COMPLETE');
    console.log('All critical security tests are passing!');
    process.exit(0);
  } else {
    console.log('\n🚨 CRITICAL SECURITY FAILURES DETECTED');
    console.log('Immediate fixes required!');
    process.exit(1);
  }
}

runCriticalSecurityTests().catch(console.error);
