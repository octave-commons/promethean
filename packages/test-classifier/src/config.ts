import { TestType, ClassificationConfig } from './types.js';

/**
 * Default configuration for test classification
 */
export const DEFAULT_CONFIG: ClassificationConfig = {
  filenamePatterns: {
    [TestType.UNIT]: [
      '*.unit.test.ts',
      '*.unit.test.js',
      '*.unit.spec.ts',
      '*.unit.spec.js',
      '*.test.ts', // Default to unit for generic .test.ts
      '*.test.js',
      '*.spec.ts',
      '*.spec.js',
    ],
    [TestType.INTEGRATION]: [
      '*.integration.test.ts',
      '*.integration.test.js',
      '*.integration.spec.ts',
      '*.integration.spec.js',
      '*-integration.test.ts',
      '*-integration.test.js',
      '*-integration.spec.ts',
      '*-integration.spec.js',
    ],
    [TestType.E2E]: [
      '*.e2e.test.ts',
      '*.e2e.test.js',
      '*.e2e.spec.ts',
      '*.e2e.spec.js',
      '*.workflow.test.ts',
      '*.workflow.test.js',
      '*.workflow.spec.ts',
      '*.workflow.spec.js',
      '*-e2e.test.ts',
      '*-e2e.test.js',
      '*-e2e.spec.ts',
      '*-e2e.spec.js',
    ],
    [TestType.UNKNOWN]: [],
  },
  directoryPatterns: {
    [TestType.UNIT]: ['tests/unit/**', 'test/unit/**', 'src/tests/unit/**', 'src/test/unit/**'],
    [TestType.INTEGRATION]: [
      'tests/integration/**',
      'test/integration/**',
      'src/tests/integration/**',
      'src/test/integration/**',
    ],
    [TestType.E2E]: [
      'tests/e2e/**',
      'test/e2e/**',
      'tests/e2e/**',
      'src/tests/e2e/**',
      'src/test/e2e/**',
      'tests/workflow/**',
      'test/workflow/**',
    ],
    [TestType.UNKNOWN]: [],
  },
  contentPatterns: {
    [TestType.UNIT]: [
      // Unit test indicators
      'test\\(',
      'it\\(',
      'describe\\(',
      // Mock/stub patterns
      '\\.mock\\(',
      '\\.stub\\(',
      'sinon\\.',
      'jest\\.',
      // Pure function testing
      'pure\\s+function',
      'immutable',
      // No external dependencies
      'no.*external.*depend',
    ],
    [TestType.INTEGRATION]: [
      // Integration test indicators
      'integration',
      'multiple.*packages',
      'cross.*package',
      'adapter',
      'service',
      'database',
      'external.*api',
      // Real dependencies
      'real.*database',
      'actual.*service',
      'live.*endpoint',
      // Multiple components
      'multiple.*components',
      'component.*interaction',
    ],
    [TestType.E2E]: [
      // E2E test indicators
      'e2e',
      'end-to-end',
      'workflow',
      'full.*stack',
      'user.*journey',
      'complete.*flow',
      // Browser/UI testing
      'playwright',
      'puppeteer',
      'selenium',
      'cy\\.visit', // Cypress
      'cy\\.get',
      // HTTP/API testing
      'supertest',
      'axios',
      'fetch.*http',
      // Real infrastructure
      'docker',
      'container',
      'production.*like',
    ],
    [TestType.UNKNOWN]: [],
  },
  minConfidence: 0.6,
};
