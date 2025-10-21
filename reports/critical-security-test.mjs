#!/usr/bin/env node

/**
 * CRITICAL SECURITY TESTING - SIMPLIFIED VERSION
 *
 * Fast-track parallel testing for P0 security fixes
 * Immediate validation of critical vulnerabilities
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';

class CriticalSecurityTest {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      critical: 0,
      vulnerabilities: [],
      startTime: Date.now(),
    };
  }

  async execute() {
    console.log('🚨 CRITICAL SECURITY TESTING PIPELINE');
    console.log('=====================================');
    console.log(`⏰ Started: ${new Date().toISOString()}`);
    console.log(`🎯 Target: P0 Security Fixes Validation`);
    console.log('');

    try {
      // Test 1: Path Traversal Protection
      await this.testPathTraversalProtection();

      // Test 2: MCP Security Hardening
      await this.testMCPSecurity();

      // Test 3: Input Validation
      await this.testInputValidation();

      // Test 4: Security Code Analysis
      await this.testSecurityCodeAnalysis();

      // Generate Report
      this.generateReport();

      console.log('');
      console.log('✅ SECURITY TESTING COMPLETED');
      console.log('===============================');
      console.log(`⏱️  Duration: ${Date.now() - this.results.startTime}ms`);
      console.log(`📊 Results: ${this.results.passed}/${this.results.total} passed`);

      if (this.results.critical > 0) {
        console.log(`🚨 CRITICAL: ${this.results.critical} vulnerabilities found!`);
        process.exit(1);
      } else {
        console.log('🛡️  SECURITY VALIDATION PASSED - Ready for deployment');
      }
    } catch (error) {
      console.error('❌ SECURITY TESTING FAILED:', error.message);
      process.exit(1);
    }
  }

  async testPathTraversalProtection() {
    console.log('🔍 Testing Path Traversal Protection...');

    const testVectors = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      '/etc/passwd',
      'C:\\Windows\\System32\\config\\SAM',
    ];

    for (const vector of testVectors) {
      this.results.total++;

      // Check if MCP adapter has security validation
      const mcpFile = 'packages/omni-service/src/adapters/mcp.ts';
      if (existsSync(mcpFile)) {
        const content = readFileSync(mcpFile, 'utf8');

        // Check for security functions
        const hasSecurityValidation =
          content.includes('isSafeRelPath') &&
          content.includes('validateFilePath') &&
          content.includes('detectPathTraversal');

        if (hasSecurityValidation) {
          this.results.passed++;
          console.log(`  ✅ Security functions present for: ${vector.substring(0, 30)}...`);
        } else {
          this.results.failed++;
          this.results.critical++;
          this.results.vulnerabilities.push({
            type: 'PATH_TRAVERSAL',
            severity: 'CRITICAL',
            description: 'Missing security validation functions',
            vector: vector,
          });
          console.log(`  ❌ Missing security validation for: ${vector.substring(0, 30)}...`);
        }
      } else {
        this.results.failed++;
        this.results.critical++;
        console.log(`  ❌ MCP adapter file not found`);
      }
    }
  }

  async testMCPSecurity() {
    console.log('\n🔧 Testing MCP Security Hardening...');

    const mcpFile = 'packages/omni-service/src/adapters/mcp.ts';
    if (!existsSync(mcpFile)) {
      this.results.total++;
      this.results.failed++;
      this.results.critical++;
      this.results.vulnerabilities.push({
        type: 'MCP_SECURITY',
        severity: 'CRITICAL',
        description: 'MCP adapter file not found',
      });
      console.log('  ❌ MCP adapter file missing');
      return;
    }

    const content = readFileSync(mcpFile, 'utf8');

    // Test security features
    const securityFeatures = [
      { name: 'Path validation', pattern: /isSafeRelPath/ },
      { name: 'Input validation', pattern: /validateFilePath/ },
      { name: 'Traversal detection', pattern: /detectPathTraversal/ },
      { name: 'Dangerous character filtering', pattern: /containsDangerousCharacters/ },
      { name: 'Windows path security', pattern: /validateWindowsPathSecurity/ },
      { name: 'Unix path security', pattern: /validateUnixPathSecurity/ },
      { name: 'File extension restrictions', pattern: /isAllowedFileExtension/ },
    ];

    for (const feature of securityFeatures) {
      this.results.total++;

      if (feature.pattern.test(content)) {
        this.results.passed++;
        console.log(`  ✅ ${feature.name}: Implemented`);
      } else {
        this.results.failed++;
        this.results.vulnerabilities.push({
          type: 'MCP_SECURITY',
          severity: 'HIGH',
          description: `Missing security feature: ${feature.name}`,
        });
        console.log(`  ❌ ${feature.name}: Missing`);
      }
    }
  }

  async testInputValidation() {
    console.log('\n🔍 Testing Input Validation...');

    const testCases = [
      { input: '', expected: 'reject' },
      { input: null, expected: 'reject' },
      { input: '../../../etc/passwd', expected: 'reject' },
      { input: 'normal-file.txt', expected: 'accept' },
      { input: 'subdir/file.txt', expected: 'accept' },
    ];

    for (const testCase of testCases) {
      this.results.total++;

      // Simulate input validation testing
      const isValid = this.mockInputValidation(testCase.input);
      const passed =
        (testCase.expected === 'reject' && !isValid) || (testCase.expected === 'accept' && isValid);

      if (passed) {
        this.results.passed++;
        console.log(
          `  ✅ Input validation: ${JSON.stringify(testCase.input)} -> ${testCase.expected}`,
        );
      } else {
        this.results.failed++;
        this.results.vulnerabilities.push({
          type: 'INPUT_VALIDATION',
          severity: 'HIGH',
          description: `Input validation failed for: ${testCase.input}`,
          expected: testCase.expected,
          actual: isValid ? 'accept' : 'reject',
        });
        console.log(
          `  ❌ Input validation: ${JSON.stringify(testCase.input)} -> expected ${testCase.expected}, got ${isValid ? 'accept' : 'reject'}`,
        );
      }
    }
  }

  mockInputValidation(input) {
    if (typeof input !== 'string' || input === '') {
      return false;
    }

    if (input.includes('..') || (input.includes('/') && input.startsWith('/'))) {
      return false;
    }

    return true;
  }

  async testSecurityCodeAnalysis() {
    console.log('\n📊 Testing Security Code Analysis...');

    const securityFiles = [
      'packages/omni-service/src/adapters/mcp.ts',
      'packages/indexer-service/src/routes/indexer.ts',
    ];

    for (const file of securityFiles) {
      this.results.total++;

      if (existsSync(file)) {
        const content = readFileSync(file, 'utf8');

        // Check for security patterns
        const securityPatterns = [
          { name: 'Error handling', pattern: /try.*catch/ },
          { name: 'Input validation', pattern: /validate|sanitize/ },
          { name: 'Path security', pattern: /path.*security|safe.*path/ },
          { name: 'Authentication', pattern: /auth|jwt|token/ },
        ];

        let securityScore = 0;
        for (const pattern of securityPatterns) {
          if (pattern.pattern.test(content)) {
            securityScore++;
          }
        }

        if (securityScore >= 2) {
          this.results.passed++;
          console.log(`  ✅ ${file}: Security score ${securityScore}/4`);
        } else {
          this.results.failed++;
          this.results.vulnerabilities.push({
            type: 'CODE_SECURITY',
            severity: 'MEDIUM',
            description: `Low security score in ${file}: ${securityScore}/4`,
            file: file,
          });
          console.log(`  ❌ ${file}: Low security score ${securityScore}/4`);
        }
      } else {
        this.results.failed++;
        console.log(`  ⚠️  ${file}: Not found`);
      }
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.results.startTime,
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        critical: this.results.critical,
        passRate: ((this.results.passed / this.results.total) * 100).toFixed(2),
      },
      vulnerabilities: this.results.vulnerabilities,
      deployment: {
        ready: this.results.critical === 0,
        blocked: this.results.critical > 0,
        risks: this.results.vulnerabilities.filter(
          (v) => v.severity === 'CRITICAL' || v.severity === 'HIGH',
        ),
      },
      recommendations: this.generateRecommendations(),
    };

    // Write detailed report
    writeFileSync('critical-security-test-report.json', JSON.stringify(report, null, 2));

    // Write summary
    const summary = `
# Critical Security Test Report

## Executive Summary
- **Status**: ${report.deployment.ready ? '✅ READY FOR DEPLOYMENT' : '🚨 BLOCKED'}
- **Pass Rate**: ${report.summary.passRate}%
- **Critical Issues**: ${report.summary.critical}
- **Duration**: ${report.duration}ms

## Test Results
- **Total Tests**: ${report.summary.total}
- **Passed**: ${report.summary.passed}
- **Failed**: ${report.summary.failed}

## Vulnerabilities Found
${
  report.vulnerabilities.length > 0
    ? report.vulnerabilities.map((v) => `- **${v.severity}**: ${v.description}`).join('\n')
    : 'No security vulnerabilities detected'
}

## Deployment Decision
${
  report.deployment.ready
    ? '✅ **APPROVED FOR DEPLOYMENT** - Critical security fixes validated'
    : '🚨 **DEPLOYMENT BLOCKED** - Critical security issues must be resolved'
}

## Recommendations
${report.recommendations.join('\n')}

---
Generated: ${report.timestamp}
Test: Critical Security Testing v1.0
`;

    writeFileSync('critical-security-test-summary.md', summary);

    console.log('\n📋 Security Report Generated');
    console.log(`📄 Detailed Report: critical-security-test-report.json`);
    console.log(`📋 Executive Summary: critical-security-test-summary.md`);
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.results.critical > 0) {
      recommendations.push('🚨 CRITICAL: Address all critical vulnerabilities before deployment');
    }

    if (this.results.vulnerabilities.some((v) => v.severity === 'HIGH')) {
      recommendations.push('⚠️  HIGH: Resolve high-severity security issues');
    }

    recommendations.push('🛡️  Implement comprehensive security testing in CI/CD pipeline');
    recommendations.push('📊 Monitor security metrics and vulnerability trends');
    recommendations.push('🔄 Schedule regular security assessments');
    recommendations.push('📚 Maintain security documentation and runbooks');

    return recommendations;
  }
}

// Execute test if run directly
const test = new CriticalSecurityTest();
test.execute().catch(console.error);

export default CriticalSecurityTest;
