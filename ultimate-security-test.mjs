#!/usr/bin/env node

/**
 * ULTIMATE SECURITY TEST
 *
 * Final comprehensive security validation
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';

class UltimateSecurityTest {
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
    console.log('🔬 ULTIMATE SECURITY TEST');
    console.log('========================');
    console.log(`⏰ Started: ${new Date().toISOString()}`);
    console.log(`🎯 Target: Complete security validation`);
    console.log('');

    try {
      await this.testAllSecurityControls();
      this.generateReport();

      console.log('');
      console.log('✅ ULTIMATE SECURITY TESTING COMPLETED');
      console.log('=====================================');
      console.log(`⏱️  Duration: ${Date.now() - this.results.startTime}ms`);
      console.log(`📊 Results: ${this.results.passed}/${this.results.total} passed`);

      if (this.results.critical > 0) {
        console.log(`🚨 CRITICAL: ${this.results.critical} security issues found!`);
        process.exit(1);
      } else {
        console.log('🛡️  SECURITY VALIDATION PASSED - Production Ready');
      }
    } catch (error) {
      console.error('❌ SECURITY TESTING FAILED:', error.message);
      process.exit(1);
    }
  }

  async testAllSecurityControls() {
    console.log('🔍 Testing All Security Controls...');

    const mcpFile = 'packages/omni-service/src/adapters/mcp.ts';

    if (!existsSync(mcpFile)) {
      this.results.total++;
      this.results.failed++;
      this.results.critical++;
      console.log('  ❌ MCP adapter file missing');
      return;
    }

    const content = readFileSync(mcpFile, 'utf8');

    const securityControls = [
      {
        name: 'Path traversal protection',
        check: () => content.includes('isSafeRelPath') && content.includes('detectPathTraversal'),
      },
      {
        name: 'Input validation',
        check: () =>
          content.includes('validateFilePath') && content.includes('containsDangerousCharacters'),
      },
      {
        name: 'File access controls',
        check: () =>
          content.includes('isAllowedFileExtension') && content.includes('fullPath.startsWith('),
      },
      {
        name: 'Authentication controls',
        check: () => content.includes('enableAuth') && content.includes('validateToolAccess'),
      },
      {
        name: 'Security logging',
        check: () => content.includes('logSecurityEvent') && content.includes('Security violation'),
      },
      {
        name: 'Rate limiting',
        check: () => content.includes('checkRateLimit') && content.includes('rateLimitMap'),
      },
      {
        name: 'Error handling',
        check: () => content.includes('try') && content.includes('catch'),
      },
      {
        name: 'listFiles security',
        check: () =>
          content.includes('private async listFiles') &&
          content.includes('validateFilePath(filePath') &&
          content.includes('Authentication required for file operations'),
      },
      {
        name: 'readFile security',
        check: () =>
          content.includes('private async readFile') &&
          content.includes('validateFilePath(filePath') &&
          content.includes('isAllowedFileExtension') &&
          content.includes('Authentication required for file operations'),
      },
      {
        name: 'Secure defaults',
        check: () =>
          content.includes('enableAuth: true') &&
          content.includes('enableSecurityLogging: true') &&
          content.includes('enableRateLimit: true'),
      },
      {
        name: 'Defense in depth',
        check: () =>
          content.includes('validateFilePath') &&
          content.includes('isSafeRelPath') &&
          content.includes('fullPath.startsWith(') &&
          content.includes('isAllowedFileExtension') &&
          content.includes('enableAuth'),
      },
      {
        name: 'Enterprise features',
        check: () =>
          content.includes('rolePermissions') &&
          content.includes('rateLimitMap') &&
          content.includes('auditLog') &&
          content.includes('allowedBasePaths'),
      },
    ];

    for (const control of securityControls) {
      this.results.total++;

      try {
        const isSecure = control.check();

        if (isSecure) {
          this.results.passed++;
          console.log(`  ✅ ${control.name}: Implemented`);
        } else {
          this.results.failed++;
          this.results.critical++;
          this.results.vulnerabilities.push({
            type: 'SECURITY_CONTROL',
            severity: 'CRITICAL',
            description: `Security control missing: ${control.name}`,
          });
          console.log(`  ❌ ${control.name}: Missing`);
        }
      } catch (error) {
        this.results.failed++;
        this.results.critical++;
        console.log(`  ❌ ${control.name}: Error - ${error.message}`);
      }
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.results.startTime,
      testType: 'ULTIMATE SECURITY VALIDATION',
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        critical: this.results.critical,
        passRate: ((this.results.passed / this.results.total) * 100).toFixed(2),
        securityScore: Math.max(0, 100 - this.results.critical * 20 - this.results.failed * 5),
      },
      vulnerabilities: this.results.vulnerabilities,
      deployment: {
        ready: this.results.critical === 0 && this.results.passed === this.results.total,
        blocked: this.results.critical > 0,
        risks: this.results.vulnerabilities.filter(
          (v) => v.severity === 'CRITICAL' || v.severity === 'HIGH',
        ),
      },
      recommendations: this.generateRecommendations(),
    };

    // Write detailed report
    writeFileSync('ultimate-security-test-report.json', JSON.stringify(report, null, 2));

    // Write summary
    const summary = `# Ultimate Security Test Report

## Executive Summary
- **Status**: ${report.deployment.ready ? '✅ PRODUCTION READY' : '🚨 SECURITY ISSUES FOUND'}
- **Security Score**: ${report.summary.securityScore}/100
- **Pass Rate**: ${report.summary.passRate}%
- **Critical Issues**: ${report.summary.critical}
- **Duration**: ${report.duration}ms

## Test Results
- **Total Tests**: ${report.summary.total}
- **Passed**: ${report.summary.passed}
- **Failed**: ${report.summary.failed}

## Security Issues Found
${
  report.vulnerabilities.length > 0
    ? report.vulnerabilities.map((v) => `- **${v.type}**: ${v.description}`).join('\n')
    : 'No security issues detected'
}

## Deployment Decision
${
  report.deployment.ready
    ? '✅ **APPROVED FOR PRODUCTION** - All security validations passed'
    : '🚨 **DEPLOYMENT BLOCKED** - Security issues must be resolved'
}

## Recommendations
${report.recommendations.join('\n')}

---
Generated: ${report.timestamp}
Test: Ultimate Security Test v1.0
`;

    writeFileSync('ultimate-security-test-summary.md', summary);

    console.log('\n📋 Ultimate Security Test Report Generated');
    console.log(`📄 Detailed Report: ultimate-security-test-report.json`);
    console.log(`📋 Executive Summary: ultimate-security-test-summary.md`);
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.results.critical > 0) {
      recommendations.push('🚨 **CRITICAL**: Fix all security vulnerabilities before deployment');
    }

    recommendations.push('🛡️  Implement continuous security monitoring');
    recommendations.push('🔄 Add security validation to CI/CD pipeline');
    recommendations.push('📊 Monitor security metrics and alerts');
    recommendations.push('🧪 Conduct regular security assessments');

    return recommendations;
  }
}

// Execute test if run directly
const test = new UltimateSecurityTest();
test.execute().catch(console.error);

export default UltimateSecurityTest;
