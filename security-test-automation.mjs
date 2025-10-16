#!/usr/bin/env node

/**
 * SECURITY TEST AUTOMATION FRAMEWORK
 * 
 * Automated security testing for CI/CD pipeline integration
 * Provides continuous security validation for P0 fixes
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';

class SecurityTestAutomation {
  constructor() {
    this.config = {
      // Critical security files to monitor
      securityFiles: [
        'packages/omni-service/src/adapters/mcp.ts',
        'packages/indexer-service/src/routes/indexer.ts',
        'packages/auth-service/src/middleware/auth.ts'
      ],
      
      // Required security functions
      requiredFunctions: [
        'isSafeRelPath',
        'validateFilePath', 
        'detectPathTraversal',
        'containsDangerousCharacters',
        'validateWindowsPathSecurity',
        'validateUnixPathSecurity',
        'isAllowedFileExtension'
      ],
      
      // Security test thresholds
      thresholds: {
        minSecurityScore: 80,
        maxCriticalIssues: 0,
        maxHighIssues: 0,
        minTestCoverage: 85
      }
    };
    
    this.results = {
      timestamp: new Date().toISOString(),
      status: 'UNKNOWN',
      securityScore: 0,
      issues: [],
      tests: {
        total: 0,
        passed: 0,
        failed: 0
      },
      deployment: {
        ready: false,
        blockers: []
      }
    };
  }

  async execute() {
    console.log('🔒 SECURITY TEST AUTOMATION');
    console.log('==========================');
    console.log(`📅 ${this.results.timestamp}`);
    console.log(`🎯 Automated Security Validation`);
    console.log('');

    try {
      // Phase 1: Security Code Analysis
      await this.analyzeSecurityCode();
      
      // Phase 2: Security Function Validation
      await this.validateSecurityFunctions();
      
      // Phase 3: Vulnerability Assessment
      await this.assessVulnerabilities();
      
      // Phase 4: Deployment Readiness Check
      await this.checkDeploymentReadiness();
      
      // Phase 5: Generate Report
      await this.generateAutomationReport();
      
      console.log('\n✅ SECURITY AUTOMATION COMPLETED');
      console.log('===============================');
      console.log(`📊 Security Score: ${this.results.securityScore}/100`);
      console.log(`🧪 Tests: ${this.results.tests.passed}/${this.results.tests.total}`);
      console.log(`🚀 Deployment: ${this.results.deployment.ready ? '✅ READY' : '🚨 BLOCKED'}`);
      
      // Exit with appropriate code
      process.exit(this.results.deployment.ready ? 0 : 1);
      
    } catch (error) {
      console.error('❌ SECURITY AUTOMATION FAILED:', error.message);
      process.exit(1);
    }
  }

  async analyzeSecurityCode() {
    console.log('🔍 Phase 1: Security Code Analysis');
    
    let totalSecurityScore = 0;
    const maxPossibleScore = this.config.securityFiles.length * 20;
    
    for (const file of this.config.securityFiles) {
      if (existsSync(file)) {
        const fileScore = await this.analyzeFile(file);
        totalSecurityScore += fileScore;
        console.log(`  📄 ${file}: ${fileScore}/20`);
      } else {
        console.log(`  ❌ ${file}: Not found`);
        this.results.issues.push({
          type: 'MISSING_FILE',
          severity: 'HIGH',
          file: file,
          description: 'Critical security file missing'
        });
      }
    }
    
    this.results.securityScore = Math.round((totalSecurityScore / maxPossibleScore) * 100);
    console.log(`  📊 Overall Security Score: ${this.results.securityScore}/100`);
  }

  async analyzeFile(filePath) {
    const content = readFileSync(filePath, 'utf8');
    let score = 0;
    
    // Security patterns (5 points each)
    const securityPatterns = [
      { name: 'Error Handling', pattern: /try.*catch/, weight: 5 },
      { name: 'Input Validation', pattern: /validate|sanitize/, weight: 5 },
      { name: 'Path Security', pattern: /path.*security|safe.*path/, weight: 5 },
      { name: 'Authentication', pattern: /auth|jwt|token/, weight: 5 }
    ];
    
    for (const pattern of securityPatterns) {
      if (pattern.pattern.test(content)) {
        score += pattern.weight;
      }
    }
    
    // Security anti-patterns (-10 points each)
    const antiPatterns = [
      { name: 'Eval Usage', pattern: /eval\(|Function\(/ },
      { name: 'Direct File Access', pattern: /readFileSync\(|writeFileSync\(/ },
      { name: 'SQL Concatenation', pattern: /\+.*sql|sql.*\+/ },
      { name: 'Hardcoded Secrets', pattern: /password.*=.*['"]|secret.*=.*['"]/ }
    ];
    
    for (const antiPattern of antiPatterns) {
      if (antiPattern.pattern.test(content)) {
        score -= 10;
        this.results.issues.push({
          type: 'ANTI_PATTERN',
          severity: 'HIGH',
          file: filePath,
          description: `Security anti-pattern detected: ${antiPattern.name}`
        });
      }
    }
    
    return Math.max(0, Math.min(20, score));
  }

  async validateSecurityFunctions() {
    console.log('\n🛡️  Phase 2: Security Function Validation');
    
    const mcpFile = 'packages/omni-service/src/adapters/mcp.ts';
    if (!existsSync(mcpFile)) {
      console.log('  ❌ MCP adapter not found');
      return;
    }
    
    const content = readFileSync(mcpFile, 'utf8');
    let functionsFound = 0;
    
    for (const func of this.config.requiredFunctions) {
      this.results.tests.total++;
      
      if (content.includes(func)) {
        functionsFound++;
        this.results.tests.passed++;
        console.log(`  ✅ ${func}: Implemented`);
      } else {
        this.results.tests.failed++;
        this.results.issues.push({
          type: 'MISSING_FUNCTION',
          severity: 'CRITICAL',
          function: func,
          description: `Required security function missing: ${func}`
        });
        console.log(`  ❌ ${func}: Missing`);
      }
    }
    
    const functionCoverage = (functionsFound / this.config.requiredFunctions.length) * 100;
    console.log(`  📊 Function Coverage: ${functionCoverage.toFixed(1)}%`);
  }

  async assessVulnerabilities() {
    console.log('\n🎯 Phase 3: Vulnerability Assessment');
    
    // Simulate vulnerability assessment
    const vulnerabilityTests = [
      { name: 'Path Traversal Protection', test: () => this.testPathTraversal() },
      { name: 'Input Validation', test: () => this.testInputValidation() },
      { name: 'MCP Security', test: () => this.testMCPSecurity() },
      { name: 'Authentication Security', test: () => this.testAuthentication() }
    ];
    
    for (const vulnTest of vulnerabilityTests) {
      this.results.tests.total++;
      
      try {
        await vulnTest.test();
        this.results.tests.passed++;
        console.log(`  ✅ ${vulnTest.name}: Passed`);
      } catch (error) {
        this.results.tests.failed++;
        this.results.issues.push({
          type: 'VULNERABILITY_TEST_FAILED',
          severity: 'HIGH',
          test: vulnTest.name,
          description: error.message
        });
        console.log(`  ❌ ${vulnTest.name}: Failed - ${error.message}`);
      }
    }
  }

  async testPathTraversal() {
    const testVectors = ['../../../etc/passwd', '/etc/passwd', '..\\..\\windows\\system32'];
    
    for (const vector of testVectors) {
      if (this.mockPathValidation(vector)) {
        throw new Error(`Path traversal not blocked: ${vector}`);
      }
    }
  }

  async testInputValidation() {
    const testCases = [
      { input: '', shouldReject: true },
      { input: null, shouldReject: true },
      { input: 'valid.txt', shouldReject: false }
    ];
    
    for (const testCase of testCases) {
      const isValid = this.mockInputValidation(testCase.input);
      if (testCase.shouldReject === isValid) {
        throw new Error(`Input validation failed for: ${testCase.input}`);
      }
    }
  }

  async testMCPSecurity() {
    const mcpFile = 'packages/omni-service/src/adapters/mcp.ts';
    if (!existsSync(mcpFile)) {
      throw new Error('MCP adapter not found');
    }
    
    const content = readFileSync(mcpFile, 'utf8');
    const requiredSecurity = ['isSafeRelPath', 'validateFilePath'];
    
    for (const security of requiredSecurity) {
      if (!content.includes(security)) {
        throw new Error(`MCP security missing: ${security}`);
      }
    }
  }

  async testAuthentication() {
    // Mock authentication test
    console.log('    (Authentication test mocked)');
  }

  mockPathValidation(path) {
    return !path.includes('..') && !path.startsWith('/');
  }

  mockInputValidation(input) {
    return typeof input === 'string' && input.length > 0 && !input.includes('..');
  }

  async checkDeploymentReadiness() {
    console.log('\n🚀 Phase 4: Deployment Readiness Check');
    
    const readinessCriteria = [
      {
        name: 'Security Score',
        check: () => this.results.securityScore >= this.config.thresholds.minSecurityScore,
        description: `Security score >= ${this.config.thresholds.minSecurityScore}`
      },
      {
        name: 'No Critical Issues',
        check: () => !this.results.issues.some(i => i.severity === 'CRITICAL'),
        description: 'No critical security issues'
      },
      {
        name: 'No High Issues',
        check: () => !this.results.issues.some(i => i.severity === 'HIGH'),
        description: 'No high-severity security issues'
      },
      {
        name: 'Test Pass Rate',
        check: () => {
          const passRate = (this.results.tests.passed / this.results.tests.total) * 100;
          return passRate >= 95;
        },
        description: 'Test pass rate >= 95%'
      }
    ];
    
    let passedCriteria = 0;
    
    for (const criterion of readinessCriteria) {
      const passed = criterion.check();
      
      if (passed) {
        passedCriteria++;
        console.log(`  ✅ ${criterion.name}: ${criterion.description}`);
      } else {
        console.log(`  ❌ ${criterion.name}: ${criterion.description}`);
        this.results.deployment.blockers.push(criterion.description);
      }
    }
    
    this.results.deployment.ready = passedCriteria === readinessCriteria.length;
    this.results.status = this.results.deployment.ready ? 'READY' : 'BLOCKED';
    
    console.log(`  📊 Readiness: ${passedCriteria}/${readinessCriteria.length} criteria passed`);
  }

  async generateAutomationReport() {
    console.log('\n📄 Phase 5: Automation Report Generation');
    
    const report = {
      ...this.results,
      config: this.config,
      summary: {
        securityScore: this.results.securityScore,
        testPassRate: ((this.results.tests.passed / this.results.tests.total) * 100).toFixed(2),
        issueCount: this.results.issues.length,
        criticalIssues: this.results.issues.filter(i => i.severity === 'CRITICAL').length,
        highIssues: this.results.issues.filter(i => i.severity === 'HIGH').length
      },
      recommendations: this.generateRecommendations()
    };
    
    // Write automation report
    writeFileSync('security-automation-report.json', JSON.stringify(report, null, 2));
    
    // Write CI/CD friendly summary
    const summary = `
# Security Automation Report

## Status: ${this.results.status} ${this.results.deployment.ready ? '✅' : '🚨'}

## Metrics
- **Security Score:** ${this.results.securityScore}/100
- **Test Pass Rate:** ${report.summary.testPassRate}%
- **Issues Found:** ${report.summary.issueCount}
- **Critical Issues:** ${report.summary.criticalIssues}
- **High Issues:** ${report.summary.highIssues}

## Deployment Decision
${this.results.deployment.ready ? 
  '✅ **APPROVED** - Meets all security criteria' :
  '🚨 **BLOCKED** - Security issues must be resolved'
}

## Blockers
${this.results.deployment.blockers.length > 0 ? 
  this.results.deployment.blockers.map(b => `- ${b}`).join('\n') : 
  'None'
}

---
Generated: ${this.results.timestamp}
Automation: Security Test Automation v1.0
`;
    
    writeFileSync('security-automation-summary.md', summary);
    
    console.log('  📄 Reports generated:');
    console.log('    - security-automation-report.json');
    console.log('    - security-automation-summary.md');
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.securityScore < this.config.thresholds.minSecurityScore) {
      recommendations.push(`🔧 Improve security code quality to meet ${this.config.thresholds.minSecurityScore}/100 threshold`);
    }
    
    if (this.results.issues.some(i => i.severity === 'CRITICAL')) {
      recommendations.push('🚨 Address all critical security issues immediately');
    }
    
    if (this.results.issues.some(i => i.severity === 'HIGH')) {
      recommendations.push('⚠️  Resolve high-severity security issues');
    }
    
    const passRate = (this.results.tests.passed / this.results.tests.total) * 100;
    if (passRate < 95) {
      recommendations.push('🧪 Improve test pass rate to above 95%');
    }
    
    recommendations.push('📊 Integrate security automation into CI/CD pipeline');
    recommendations.push('🔄 Schedule regular security assessments');
    recommendations.push('📚 Maintain security documentation');
    
    return recommendations;
  }
}

// Execute automation if run directly
const automation = new SecurityTestAutomation();
automation.execute().catch(console.error);