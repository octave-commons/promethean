import type { Task, ComprehensiveScoreResult, ScoringWeights, PriorityThresholds, TestCoverageResult, TestQualityScore, RequirementMapping, AIAnalysisResult } from './types.js';
/**
 * Comprehensive scoring engine for testing transition validation
 * Implements weighted scoring algorithm with dynamic thresholds based on task priority
 */
export declare class ComprehensiveScorer {
    private weights;
    private priorityThresholds;
    constructor(weights?: Partial<ScoringWeights>, thresholds?: Partial<PriorityThresholds>);
    /**
     * Calculate comprehensive score for testing transition
     */
    calculateScore(params: {
        task: Task;
        coverage: TestCoverageResult;
        quality: TestQualityScore;
        requirementMappings: RequirementMapping[];
        aiAnalysis?: AIAnalysisResult;
        performanceMetrics?: PerformanceMetrics;
    }): Promise<ComprehensiveScoreResult>;
    /**
     * Calculate coverage component score
     */
    private calculateCoverageScore;
    /**
     * Calculate quality component score
     */
    private calculateQualityScore;
    /**
     * Calculate requirement mapping component score
     */
    private calculateRequirementScore;
    /**
     * Calculate AI analysis component score
     */
    private calculateAIAnalysisScore;
    /**
     * Calculate performance component score
     */
    private calculatePerformanceScore;
    /**
     * Generate recommendations based on component scores
     */
    private generateRecommendations;
    /**
     * Generate actionable items for improvement
     */
    private generateActionItems;
    /**
     * Generate detailed rationale for scoring
     */
    private generateDetailedRationale;
    /**
     * Normalize priority string to standard format
     */
    private normalizePriority;
    /**
     * Estimate effort for improvement based on component and score
     */
    private estimateEffort;
}
export interface PerformanceMetrics {
    testCount: number;
    averageExecutionTime: number;
    peakMemoryUsage: number;
    totalExecutionTime: number;
}
/**
 * Default scorer instance with standard weights and thresholds
 */
export declare const defaultScorer: ComprehensiveScorer;
//# sourceMappingURL=comprehensive-scorer.d.ts.map