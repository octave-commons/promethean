/**
 * Security Testing Framework - Main Entry Point
 * 
 * Comprehensive security testing utilities for vulnerability assessment,
 * including input validation fuzzing, prompt injection testing, and
 * authentication security testing.
 */

export * from './fuzzing.js';
export * from './prompt-injection.js';
export * from './auth-testing.js';

import { Fuzzer, FuzzRunner, FuzzTestCase, FuzzTestResult } from './fuzzing.js';
import { PromptInjectionTester, PromptInjectionDetector, PromptInjectionTestCase, PromptInjectionResult } from './prompt-injection.js';
import { ComprehensiveAuthTester, AuthTestCase, AuthTestResult } from './auth-testing.js';

export type SecurityTestSuite = {
  fuzzing?: FuzzTestCase[];
  promptInjection?: PromptInjectionTestCase[];
  authentication?: AuthTestCase[];
};

export type SecurityTestResults = {
  fuzzing?: FuzzTestResult[];
  promptInjection?: PromptInjectionResult[];
  authentication?: AuthTestResult[];
  summary: SecurityTestSummary;
};

export type SecurityTestSummary = {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  criticalFailures: number;
  overallScore: number;
  recommendations: string[];
  executionTime: number;
};

/**
 * Main security testing orchestrator
 */
export class SecurityTestFramework {
  private fuzzer: Fuzzer;
  private fuzzRunner: FuzzRunner;
  private promptInjectionTester: PromptInjectionTester;
  private authTester: ComprehensiveAuthTester;

  constructor(promptInjectionDetector?: PromptInjectionDetector) {
    this.fuzzer = new Fuzzer();
    this.fuzzRunner = new FuzzRunner();
    this.promptInjectionTester = new PromptInjectionTester(
      promptInjectionDetector || this.createDefaultDetector()
    );
    this.authTester = new ComprehensiveAuthTester();
  }

  /**
   * Run comprehensive security test suite
   */
  async runFullSecurityTest(
    validators: Record<string, (input: any) => any>,
    options: {
      includeFuzzing?: boolean;
      includePromptInjection?: boolean;
      includeAuthentication?: boolean;
      customTests?: SecurityTestSuite;
    } = {}
  ): Promise<SecurityTestResults> {
    const startTime = Date.now();
    const results: SecurityTestResults = {
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        criticalFailures: 0,
        overallScore: 0,
        recommendations: [],
        executionTime: 0
      }
    };

    try {
      // Run fuzzing tests
      if (options.includeFuzzing !== false && Object.keys(validators).length > 0) {
        const fuzzingResults = await this.runFuzzingTests(validators);
        results.fuzzing = fuzzingResults;
        results.summary.totalTests += fuzzingResults.length;
        results.summary.passedTests += fuzzingResults.filter(r => r.result === 'passed').length;
        results.summary.failedTests += fuzzingResults.filter(r => r.result === 'failed').length;
      }

      // Run prompt injection tests
      if (options.includePromptInjection !== false) {
        const promptInjectionResults = await this.promptInjectionTester.runAllTests();
        results.promptInjection = promptInjectionResults.results;
        results.summary.totalTests += promptInjectionResults.results.length;
        results.summary.passedTests += promptInjectionResults.results.filter(r => r.blocked || (!r.detected && !r.testCase.expectedBehavior)).length;
        results.summary.failedTests += promptInjectionResults.results.filter(r => {
          if (!r.testCase.expectedBehavior) return false;
          return !this.isExpectedPromptInjectionBehavior(r.testCase.expectedBehavior, r);
        }).length;
      }

      // Run authentication tests
      if (options.includeAuthentication !== false) {
        const authResults = await this.authTester.runTestSuite();
        results.authentication = authResults;
        results.summary.totalTests += authResults.length;
        results.summary.passedTests += authResults.filter(r => r.result === 'passed').length;
        results.summary.failedTests += authResults.filter(r => r.result === 'failed').length;
        results.summary.criticalFailures += authResults.filter(r => 
          r.testCase.severity === 'critical' && r.result !== 'passed'
        ).length;
      }

      // Calculate final summary
      results.summary.executionTime = Date.now() - startTime;
      results.summary.overallScore = this.calculateOverallScore(results);
      results.summary.recommendations = this.generateRecommendations(results);

    } catch (error) {
      results.summary.recommendations.push(`Test execution failed: ${(error as Error).message}`);
    }

    return results;
  }

  /**
   * Run fuzzing tests against provided validators
   */
  async runFuzzingTests(
    validators: Record<string, (input: any) => any>
  ): Promise<FuzzTestResult[]> {
    const allResults: FuzzTestResult[] = [];
    const testCases = this.fuzzer.generateFullTestSuite();

    for (const [validatorName, validator] of Object.entries(validators)) {
      const results = await this.fuzzRunner.runTests(validator, testCases);
      
      // Add validator context to results
      results.forEach(result => {
        (result.testCase as any).validatorName = validatorName;
      });
      
      allResults.push(...results);
    }

    return allResults;
  }

  /**
   * Run prompt injection tests
   */
  async runPromptInjectionTests(
    detector?: PromptInjectionDetector
  ): Promise<{ results: PromptInjectionResult[]; summary: any }> {
    if (detector) {
      this.promptInjectionTester = new PromptInjectionTester(detector);
    }
    
    return await this.promptInjectionTester.runAllTests();
  }

  /**
   * Run authentication security tests
   */
  async runAuthenticationTests(testCases?: AuthTestCase[]): Promise<AuthTestResult[]> {
    return await this.authTester.runTestSuite(testCases);
  }

  /**
   * Generate security vulnerability report
   */
  generateVulnerabilityReport(results: SecurityTestResults): {
    report: string;
    vulnerabilities: Array<{
      type: string;
      severity: string;
      description: string;
      recommendation: string;
    }>;
    riskScore: number;
  } {
    const vulnerabilities: Array<{
      type: string;
      severity: string;
      description: string;
      recommendation: string;
    }> = [];

    // Analyze fuzzing results
    if (results.fuzzing) {
      const fuzzingFailures = results.fuzzing.filter(r => r.result === 'failed');
      fuzzingFailures.forEach(failure => {
        vulnerabilities.push({
          type: 'Input Validation',
          severity: this.getSeverityFromTestCase(failure.testCase),
          description: `Input validation failed for: ${failure.testCase.name}`,
          recommendation: 'Implement proper input sanitization and validation'
        });
      });
    }

    // Analyze prompt injection results
    if (results.promptInjection) {
      const injectionFailures = results.promptInjection.filter(r => {
        if (!r.testCase.expectedBehavior) return false;
        return !this.isExpectedPromptInjectionBehavior(r.testCase.expectedBehavior, r);
      });
      
      injectionFailures.forEach(failure => {
        vulnerabilities.push({
          type: 'Prompt Injection',
          severity: failure.testCase.severity,
          description: `Prompt injection test failed: ${failure.testCase.description}`,
          recommendation: 'Implement stronger prompt injection detection and filtering'
        });
      });
    }

    // Analyze authentication results
    if (results.authentication) {
      const authFailures = results.authentication.filter(r => r.result !== 'passed');
      authFailures.forEach(failure => {
        vulnerabilities.push({
          type: 'Authentication',
          severity: failure.testCase.severity,
          description: `Authentication test failed: ${failure.testCase.description}`,
          recommendation: 'Strengthen authentication and authorization mechanisms'
        });
      });
    }

    const riskScore = this.calculateRiskScore(vulnerabilities);
    const report = this.generateReportText(results, vulnerabilities, riskScore);

    return { report, vulnerabilities, riskScore };
  }

  private isExpectedPromptInjectionBehavior(expected: string, result: PromptInjectionResult): boolean {
    switch (expected) {
      case 'block':
        return result.blocked;
      case 'sanitize':
        return result.sanitizationApplied || (!result.detected && !result.blocked);
      case 'warn':
        return result.detected && !result.blocked;
      case 'allow':
        return !result.detected && !result.blocked;
      default:
        return true;
    }
  }

  private getSeverityFromTestCase(testCase: FuzzTestCase): string {
    // Determine severity based on test case characteristics
    if (testCase.name.includes('critical') || testCase.name.includes('escape')) {
      return 'critical';
    }
    if (testCase.name.includes('injection') || testCase.name.includes('traversal')) {
      return 'high';
    }
    if (testCase.name.includes('xss') || testCase.name.includes('script')) {
      return 'high';
    }
    return 'medium';
  }

  private calculateOverallScore(results: SecurityTestResults): number {
    if (results.summary.totalTests === 0) return 0;
    
    const passRate = results.summary.passedTests / results.summary.totalTests;
    const criticalFailurePenalty = results.summary.criticalFailures * 0.2;
    
    return Math.max(0, Math.min(100, (passRate * 100) - (criticalFailurePenalty * 100)));
  }

  private calculateRiskScore(vulnerabilities: Array<{ severity: string }>): number {
    const severityWeights = { critical: 10, high: 7, medium: 4, low: 1 };
    const totalRisk = vulnerabilities.reduce((sum, vuln) => {
      return sum + (severityWeights[vuln.severity as keyof typeof severityWeights] || 1);
    }, 0);
    
    return Math.min(100, totalRisk);
  }

  private generateRecommendations(results: SecurityTestResults): string[] {
    const recommendations: string[] = [];

    if (results.fuzzing) {
      const fuzzingFailures = results.fuzzing.filter(r => r.result === 'failed');
      if (fuzzingFailures.length > 0) {
        recommendations.push('Implement comprehensive input validation and sanitization');
      }
    }

    if (results.promptInjection) {
      const criticalInjections = results.promptInjection.filter(r => 
        r.testCase.severity === 'critical' && !r.blocked
      );
      if (criticalInjections.length > 0) {
        recommendations.push('URGENT: Strengthen prompt injection protection mechanisms');
      }
    }

    if (results.authentication) {
      const criticalAuthFailures = results.authentication.filter(r => 
        r.testCase.severity === 'critical' && r.result !== 'passed'
      );
      if (criticalAuthFailures.length > 0) {
        recommendations.push('CRITICAL: Fix authentication security vulnerabilities immediately');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Security posture appears strong - continue monitoring and testing');
    }

    return recommendations;
  }

  private generateReportText(
    results: SecurityTestResults,
    vulnerabilities: Array<{ type: string; severity: string; description: string }>,
    riskScore: number
  ): string {
    const report = [
      '# Security Vulnerability Assessment Report',
      '',
      `**Execution Time:** ${results.summary.executionTime}ms`,
      `**Total Tests:** ${results.summary.totalTests}`,
      `**Passed:** ${results.summary.passedTests} (${((results.summary.passedTests / results.summary.totalTests) * 100).toFixed(1)}%)`,
      `**Failed:** ${results.summary.failedTests}`,
      `**Critical Failures:** ${results.summary.criticalFailures}`,
      `**Overall Security Score:** ${results.summary.overallScore.toFixed(1)}/100`,
      `**Risk Score:** ${riskScore}/100`,
      '',
      '## Vulnerabilities Found',
      ''
    ];

    if (vulnerabilities.length === 0) {
      report.push('✅ No critical vulnerabilities detected.');
    } else {
      vulnerabilities.forEach((vuln, index) => {
        report.push(`${index + 1}. **${vuln.type}** (${vuln.severity.toUpperCase()})`);
        report.push(`   - ${vuln.description}`);
        report.push(`   - Recommendation: ${vuln.recommendation}`);
        report.push('');
      });
    }

    report.push('## Recommendations');
    report.push('');
    results.summary.recommendations.forEach((rec, index) => {
      report.push(`${index + 1}. ${rec}`);
    });

    return report.join('\n');
  }

  private createDefaultDetector(): PromptInjectionDetector {
    // Import and create default detector implementation
    // This would be the BasicPromptInjectionDetector from prompt-injection.ts
    return new (class {
      async detect(prompt: string): Promise<any> {
        // Basic detection logic
        const suspiciousPatterns = [
          'ignore.*instructions',
          'jailbreak',
          'system.*prompt',
          'developer.*mode'
        ];
        
        const detected = suspiciousPatterns.some(pattern => 
          new RegExp(pattern, 'i').test(prompt)
        );
        
        return {
          detected,
          blocked: detected,
          confidence: detected ? 0.8 : 0.1,
          response: detected ? 'Content blocked for security reasons' : undefined
        };
      }
      
      scanForSuspiciousPatterns(prompt: string): string[] {
        return [];
      }
      
      calculateRiskScore(prompt: string): number {
        return 0.1;
      }
    })();
  }
}

// Convenience functions for quick testing
export async function quickFuzzTest(
  validator: (input: any) => any,
  options?: { maxStringLength?: number; includeUnicode?: boolean }
): Promise<FuzzTestResult[]> {
  const framework = new SecurityTestFramework();
  const fuzzer = new Fuzzer(options);
  const fuzzRunner = new FuzzRunner();
  const testCases = fuzzer.generateFullTestSuite();
  
  return await fuzzRunner.runTests(validator, testCases);
}

export async function quickPromptInjectionTest(
  detector: PromptInjectionTester['detector']
): Promise<{ results: PromptInjectionResult[]; summary: any }> {
  const framework = new SecurityTestFramework(detector);
  return await framework.runPromptInjectionTests();
}

export async function quickAuthTest(): Promise<AuthTestResult[]> {
  const framework = new SecurityTestFramework();
  return await framework.runAuthenticationTests();
}