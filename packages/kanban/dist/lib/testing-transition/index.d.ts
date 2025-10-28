import type { TestCoverageRequest, TestingTransitionConfig, ComprehensiveScoreResult, PerformanceMetrics } from './types.js';
/**
 * Enhanced main orchestrator for testing→review transition validation with comprehensive scoring
 */
export declare function runComprehensiveTestingTransition(reportReq: TestCoverageRequest, executedTests: string[], initialMappings: Array<{
    requirementId: string;
    testIds: string[];
}>, config: TestingTransitionConfig, testFiles: string[], outputDir: string, performanceMetrics?: PerformanceMetrics): Promise<{
    reportPath: string;
    scoreResult: ComprehensiveScoreResult;
}>;
/**
 * Legacy main orchestrator for backward compatibility
 */
export declare function runTestingTransition(reportReq: TestCoverageRequest, executedTests: string[], initialMappings: Array<{
    requirementId: string;
    testIds: string[];
}>, config: TestingTransitionConfig, testFiles: string[], outputDir: string): Promise<string>;
//# sourceMappingURL=index.d.ts.map