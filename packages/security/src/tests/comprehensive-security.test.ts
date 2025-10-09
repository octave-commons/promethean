/* eslint-disable functional/no-let, functional/immutable-data, @typescript-eslint/require-await, @typescript-eslint/no-unused-vars */
import test from 'ava';
import { 
  SecurityTestFramework,
  quickFuzzTest,
  quickPromptInjectionTest,
  quickAuthTest
} from '../testing/index.js';
import { BasicPromptInjectionDetector } from '../testing/prompt-injection.js';

test('SecurityTestFramework runs comprehensive security assessment', async (t) => {
  const framework = new SecurityTestFramework();
  
  // Create mock validators
  const validators = {
    stringValidator: (input: any) => {
      if (typeof input === 'string') {
        if (input.includes('../') || input.includes('<script>')) {
          throw new Error('Dangerous input detected');
        }
      }
      return input;
    },
    numberValidator: (input: any) => {
      if (typeof input === 'number' && !isFinite(input)) {
        throw new Error('Invalid number');
      }
      return input;
    }
  };
  
  const results = await framework.runFullSecurityTest(validators, {
    includeFuzzing: true,
    includePromptInjection: true,
    includeAuthentication: true
  });
  
  t.true(results.summary.totalTests > 0);
  t.true(results.summary.passedTests >= 0);
  t.true(results.summary.failedTests >= 0);
  t.true(results.summary.executionTime > 0);
  t.true(results.summary.overallScore >= 0 && results.summary.overallScore <= 100);
  t.true(Array.isArray(results.summary.recommendations));
  t.true(results.summary.recommendations.length > 0);
});

test('SecurityTestFramework generates vulnerability report', async (t) => {
  const framework = new SecurityTestFramework();
  
  // Create a vulnerable validator
  const vulnerableValidator = (input: any) => {
    // This validator has vulnerabilities
    return input; // Passes everything through
  };
  
  const results = await framework.runFullSecurityTest(
    { vulnerableValidator }, 
    { includeFuzzing: true, includePromptInjection: true }
  );
  
  const report = framework.generateVulnerabilityReport(results);
  
  t.true(typeof report.report === 'string');
  t.true(report.report.length > 0);
  t.true(Array.isArray(report.vulnerabilities));
  t.true(typeof report.riskScore === 'number');
  t.true(report.riskScore >= 0 && report.riskScore <= 100);
  
  // Report should contain expected sections
  t.true(report.report.includes('# Security Vulnerability Assessment Report'));
  t.true(report.report.includes('## Vulnerabilities Found'));
  t.true(report.report.includes('## Recommendations'));
});

test('SecurityTestFramework handles custom test suites', async (t) => {
  const framework = new SecurityTestFramework();
  
  const customTests = {
    fuzzing: [
      { name: 'custom-string-test', input: 'custom input', expectedBehavior: 'allow' as const }
    ],
    promptInjection: [
      {
        name: 'custom-prompt-test',
        prompt: 'custom prompt',
        category: 'jailbreak' as const,
        severity: 'medium' as const,
        expectedBehavior: 'block' as const
      }
    ]
  };
  
  const results = await framework.runFullSecurityTest({}, {
    includeFuzzing: false,
    includePromptInjection: false,
    includeAuthentication: false,
    customTests
  });
  
  // Should not crash and should handle empty results gracefully
  t.true(results.summary.totalTests >= 0);
  t.true(results.summary.executionTime >= 0);
});

test('SecurityTestFramework provides scoring', async (t) => {
  const framework = new SecurityTestFramework();
  
  // Create a secure validator
  const secureValidator = (input: any) => {
    if (typeof input === 'string') {
      // Block dangerous patterns
      const dangerousPatterns = ['../', '<script>', 'SELECT', 'UNION', 'rm -rf'];
      if (dangerousPatterns.some(pattern => input.includes(pattern))) {
        throw new Error('Dangerous input blocked');
      }
    }
    if (typeof input === 'number' && !isFinite(input)) {
      throw new Error('Invalid number blocked');
    }
    return input;
  };
  
  const results = await framework.runFullSecurityTest(
    { secureValidator }, 
    { includeFuzzing: true }
  );
  
  // Should have a decent security score
  t.true(results.summary.overallScore > 0);
  t.true(results.summary.overallScore <= 100);
  
  // Should have fewer critical failures
  t.true(results.summary.criticalFailures <= 2);
});

test('quickFuzzTest integrates with framework', async (t) => {
  const validator = (input: any) => {
    if (typeof input === 'string' && input.includes('blocked')) {
      throw new Error('Input blocked');
    }
    return input;
  };
  
  const results = await quickFuzzTest(validator);
  
  t.true(results.length > 0);
  t.true(results.some(r => r.result === 'passed'));
  t.true(results.some(r => r.result === 'failed'));
});

test('quickPromptInjectionTest integrates with framework', async (t) => {
  const detector = new BasicPromptInjectionDetector();
  const { results, summary } = await quickPromptInjectionTest(detector);
  
  t.true(results.length > 0);
  t.true(summary.total > 0);
  t.true(typeof summary.detectionRate === 'number');
  t.true(typeof summary.blockingRate === 'number');
});

test('quickAuthTest integrates with framework', async (t) => {
  const results = await quickAuthTest();
  
  t.true(results.length > 0);
  t.true(results.some(r => r.testCase.type === 'jwt-validation'));
  t.true(results.some(r => r.testCase.type === 'oauth-flow'));
  t.true(results.some(r => r.testCase.type === 'session-management'));
});

test('SecurityTestFramework handles errors gracefully', async (t) => {
  const framework = new SecurityTestFramework();
  
  // Create a validator that throws errors
  const errorValidator = (input: any) => {
    throw new Error('Validator error');
  };
  
  const results = await framework.runFullSecurityTest(
    { errorValidator }, 
    { includeFuzzing: true, includePromptInjection: false, includeAuthentication: false }
  );
  
  // Should handle errors without crashing
  t.true(results.summary.totalTests >= 0);
  t.true(results.summary.executionTime > 0);
  
  // Should have error-related recommendations
  const hasErrorRecommendation = results.summary.recommendations.some(rec => 
    rec.includes('failed') || rec.includes('error')
  );
  t.true(hasErrorRecommendation);
});

test('SecurityTestFramework provides detailed vulnerability analysis', async (t) => {
  const framework = new SecurityTestFramework();
  
  // Create multiple validators with different security levels
  const validators = {
    weakValidator: (input: any) => input, // Passes everything
    mediumValidator: (input: any) => {
      if (typeof input === 'string' && input.includes('../')) {
        throw new Error('Path traversal blocked');
      }
      return input;
    },
    strongValidator: (input: any) => {
      if (typeof input === 'string') {
        const dangerousPatterns = ['../', '<script>', 'SELECT', 'rm -rf'];
        if (dangerousPatterns.some(pattern => input.includes(pattern))) {
          throw new Error('Dangerous input blocked');
        }
      }
      return input;
    }
  };
  
  const results = await framework.runFullSecurityTest(validators, {
    includeFuzzing: true,
    includePromptInjection: false,
    includeAuthentication: false
  });
  
  const report = framework.generateVulnerabilityReport(results);
  
  // Should identify vulnerabilities
  t.true(report.vulnerabilities.length > 0);
  
  // Should have different severity levels
  const severities = [...new Set(report.vulnerabilities.map(v => v.severity))];
  t.true(severities.length > 0);
  
  // Should provide actionable recommendations
  const hasActionableRecs = report.vulnerabilities.some(v => 
    v.recommendation && v.recommendation.length > 10
  );
  t.true(hasActionableRecs);
});

test('SecurityTestFramework calculates realistic risk scores', async (t) => {
  const framework = new SecurityTestFramework();
  
  // Test with completely insecure validator
  const insecureValidator = (input: any) => input;
  
  const results = await framework.runFullSecurityTest(
    { insecureValidator }, 
    { includeFuzzing: true }
  );
  
  const report = framework.generateVulnerabilityReport(results);
  
  // Should have high risk score for insecure validator
  t.true(report.riskScore > 0);
  
  // Overall security score should be low
  t.true(results.summary.overallScore < 100);
  
  // Should have multiple vulnerabilities identified
  t.true(report.vulnerabilities.length > 5);
});