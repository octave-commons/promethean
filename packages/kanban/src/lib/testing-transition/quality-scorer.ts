import type { TestQualityScore } from './types.js';

export interface QualityMetrics {
  complexity: number; // average cyclomatic complexity per test
  passRate: number; // percentage 0-100
  flakiness: number; // indicator 0-100 where lower is better
  assertionQuality: number; // quality of assertions 0-100
  edgeCaseCoverage: number; // edge case coverage 0-100
  mockQuality: number; // quality of test mocks 0-100
  testDuplication: number; // test duplication percentage 0-100 (lower better)
  maintainabilityIndex: number; // code maintainability 0-100
}

/**
 * Calculate a comprehensive quality score for tests.
 * Combines multiple quality dimensions into a 0-100 score.
 */
export function calculateQualityScore(details: QualityMetrics): TestQualityScore {
  // Normalize individual metrics (higher is better for all)
  const complexityScore = Math.max(0, 100 - details.complexity * 8); // Less penalty than before
  const passScore = details.passRate;
  const flakinessScore = Math.max(0, 100 - details.flakiness);
  const assertionScore = details.assertionQuality;
  const edgeCaseScore = details.edgeCaseCoverage;
  const mockScore = details.mockQuality;
  const duplicationScore = Math.max(0, 100 - details.testDuplication);
  const maintainabilityScore = details.maintainabilityIndex;

  // Enhanced weighted sum with more factors
  const weights = {
    passRate: 0.25, // Most important: tests must pass
    complexity: 0.15, // Complex tests are harder to maintain
    flakiness: 0.2, // Flaky tests undermine confidence
    assertionQuality: 0.15, // Good assertions catch real issues
    edgeCaseCoverage: 0.1, // Edge cases prevent production bugs
    mockQuality: 0.05, // Good mocks improve test reliability
    duplication: 0.05, // Less duplication improves maintainability
    maintainability: 0.05, // Maintainable tests are easier to update
  };

  const score =
    passScore * weights.passRate +
    complexityScore * weights.complexity +
    flakinessScore * weights.flakiness +
    assertionScore * weights.assertionQuality +
    edgeCaseScore * weights.edgeCaseCoverage +
    mockScore * weights.mockQuality +
    duplicationScore * weights.duplication +
    maintainabilityScore * weights.maintainability;

  return {
    score: Math.round(score),
    details: {
      complexity: details.complexity,
      passRate: details.passRate,
      flakiness: details.flakiness,
      assertionQuality: details.assertionQuality,
      edgeCaseCoverage: details.edgeCaseCoverage,
      mockQuality: details.mockQuality,
      testDuplication: details.testDuplication,
      maintainabilityIndex: details.maintainabilityIndex,
    },
  };
}

/**
 * Analyze test file for quality metrics
 */
export function analyzeTestQuality(
  testContent: string,
  testResults?: TestRunResults,
): QualityMetrics {
  const complexity = calculateComplexity(testContent);
  const assertionQuality = analyzeAssertionQuality(testContent);
  const edgeCaseCoverage = analyzeEdgeCaseCoverage(testContent);
  const mockQuality = analyzeMockQuality(testContent);
  const duplication = detectTestDuplication(testContent);
  const maintainability = calculateMaintainabilityIndex(testContent);

  return {
    complexity,
    passRate: testResults?.passRate ?? 100,
    flakiness: testResults?.flakiness ?? 0,
    assertionQuality,
    edgeCaseCoverage,
    mockQuality,
    testDuplication: duplication,
    maintainabilityIndex: maintainability,
  };
}

/**
 * Calculate cyclomatic complexity from test code
 */
function calculateComplexity(code: string): number {
  // Simple complexity calculation based on control flow
  const complexityPatterns = [
    /\bif\b/g,
    /\belse\b/g,
    /\bfor\b/g,
    /\bwhile\b/g,
    /\bdo\b/g,
    /\bswitch\b/g,
    /\bcase\b/g,
    /\bcatch\b/g,
    /\b&&\b/g,
    /\|\|\b/g,
    /\?/g,
  ];

  let complexity = 1; // Base complexity
  complexityPatterns.forEach((pattern) => {
    const matches = code.match(pattern);
    if (matches) {
      complexity += matches.length;
    }
  });

  return complexity;
}

/**
 * Analyze quality of assertions in tests
 */
function analyzeAssertionQuality(code: string): number {
  // Look for specific assertion patterns
  const specificAssertions = [
    /toStrictEqual|toEqual|toBe/g,
    /toThrow|toThrowError/g,
    /toHaveLength|toContain|toHaveProperty/g,
    /toBeInstanceOf|toBeNull|toBeUndefined/g,
  ];

  const genericAssertions = [/toBeTruthy|toBeFalsy/g, /toBeDefined|toBeUndefined/g];

  let specificCount = 0;
  let genericCount = 0;

  specificAssertions.forEach((pattern) => {
    const matches = code.match(pattern);
    if (matches) specificCount += matches.length;
  });

  genericAssertions.forEach((pattern) => {
    const matches = code.match(pattern);
    if (matches) genericCount += matches.length;
  });

  const totalAssertions = specificCount + genericCount;
  if (totalAssertions === 0) return 50; // Neutral score

  const specificRatio = specificCount / totalAssertions;
  return Math.round(specificRatio * 100);
}

/**
 * Analyze edge case coverage in tests
 */
function analyzeEdgeCaseCoverage(code: string): number {
  const edgeCasePatterns = [
    /null|undefined/g,
    /empty|""|''|\[\]/g,
    /zero|0/g,
    /negative|-\d+/g,
    /boundary|limit|max|min/g,
    /error|exception|throw/g,
    /async|await|promise/g,
  ];

  let edgeCaseCount = 0;
  edgeCasePatterns.forEach((pattern) => {
    const matches = code.match(pattern);
    if (matches) edgeCaseCount += matches.length;
  });

  // Score based on density of edge case testing
  const codeLines = code.split('\n').length;
  const edgeCaseDensity = edgeCaseCount / Math.max(codeLines, 1);

  return Math.min(100, Math.round(edgeCaseDensity * 500)); // Scale to 0-100
}

/**
 * Analyze quality of mocks in tests
 */
function analyzeMockQuality(code: string): number {
  const goodMockPatterns = [
    /jest\.fn\(\)/g,
    /vi\.fn\(\)/g,
    /sinon\.stub\(\)/g,
    /mockImplementation/g,
    /mockReturnValue/g,
  ];

  const badMockPatterns = [/__mock__/g, /jest\.doMock/g, /manual mock/gi];

  let goodMockCount = 0;
  let badMockCount = 0;

  goodMockPatterns.forEach((pattern) => {
    const matches = code.match(pattern);
    if (matches) goodMockCount += matches.length;
  });

  badMockPatterns.forEach((pattern) => {
    const matches = code.match(pattern);
    if (matches) badMockCount += matches.length;
  });

  const totalMocks = goodMockCount + badMockCount;
  if (totalMocks === 0) return 80; // Good score if no mocks needed

  const goodMockRatio = goodMockCount / totalMocks;
  return Math.round(goodMockRatio * 100);
}

/**
 * Detect test duplication
 */
function detectTestDuplication(code: string): number {
  const lines = code.split('\n').filter((line) => line.trim().length > 0);
  const lineFrequency: Record<string, number> = {};

  lines.forEach((line) => {
    const normalized = line.trim().replace(/\s+/g, ' ');
    lineFrequency[normalized] = (lineFrequency[normalized] || 0) + 1;
  });

  const duplicatedLines = Object.values(lineFrequency).filter((count) => count > 1);
  const totalLines = lines.length;

  if (totalLines === 0) return 0;

  const duplicationPercentage =
    (duplicatedLines.reduce((sum, count) => sum + (count - 1), 0) / totalLines) * 100;
  return Math.round(duplicationPercentage);
}

/**
 * Calculate maintainability index for test code
 */
function calculateMaintainabilityIndex(code: string): number {
  const lines = code.split('\n');
  const totalLines = lines.length;
  const commentLines = lines.filter(
    (line) => line.trim().startsWith('//') || line.trim().startsWith('*'),
  ).length;
  const emptyLines = lines.filter((line) => line.trim().length === 0).length;

  const codeLines = totalLines - commentLines - emptyLines;
  const commentRatio = totalLines > 0 ? (commentLines / totalLines) * 100 : 0;

  // Good maintainability: reasonable comment ratio, not too long functions
  const avgFunctionLength = calculateAverageFunctionLength(code);
  const lengthScore = Math.max(0, 100 - (avgFunctionLength - 20) * 2); // Penalize long functions
  const commentScore = Math.min(100, commentRatio * 2); // Reward comments up to 50%

  return Math.round((lengthScore + commentScore) / 2);
}

function calculateAverageFunctionLength(code: string): number {
  const functionMatches = code.match(/(?:function|test|it|describe)\s*\([^)]*\)\s*[{]/g) || [];
  if (functionMatches.length === 0) return 0;

  // Simple heuristic: estimate based on test blocks
  const testBlocks = code.split(/(?:test|it)\s*\([^)]*\)\s*[{]/);
  return testBlocks.length > 1
    ? testBlocks.slice(1).reduce((sum, block) => {
        const lines = block.split('\n').length;
        return sum + lines;
      }, 0) /
        (testBlocks.length - 1)
    : 0;
}

// Interface for test run results
export interface TestRunResults {
  passRate: number;
  flakiness: number;
  executionTime: number;
  memoryUsage: number;
}
