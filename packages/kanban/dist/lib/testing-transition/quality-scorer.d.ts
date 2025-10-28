import type { TestQualityScore } from './types.js';
export interface QualityMetrics {
    complexity: number;
    passRate: number;
    flakiness: number;
    assertionQuality: number;
    edgeCaseCoverage: number;
    mockQuality: number;
    testDuplication: number;
    maintainabilityIndex: number;
}
/**
 * Calculate a comprehensive quality score for tests.
 * Combines multiple quality dimensions into a 0-100 score.
 */
export declare function calculateQualityScore(details: QualityMetrics): TestQualityScore;
/**
 * Analyze test file for quality metrics
 */
export declare function analyzeTestQuality(testContent: string, testResults?: TestRunResults): QualityMetrics;
export interface TestRunResults {
    passRate: number;
    flakiness: number;
    executionTime: number;
    memoryUsage: number;
}
//# sourceMappingURL=quality-scorer.d.ts.map