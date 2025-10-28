/**
 * Code Review Rules Engine
 *
 * Core engine for evaluating code review rules and managing
 * the automated code review process for kanban transitions.
 */
import type { CodeReviewConfig, CodeReviewRequest, CodeReviewResult, KanbanTransitionReviewRequest, KanbanTransitionReviewResult } from './types.js';
/**
 * Main Code Review Rules Engine
 */
export declare class CodeReviewRulesEngine {
    private config;
    private cache;
    private eslintAnalyzer;
    private typescriptAnalyzer;
    private securityAnalyzer;
    private aiAnalyzer;
    constructor(config?: CodeReviewConfig);
    /**
     * Initialize the rules engine and check dependencies
     */
    initialize(): Promise<void>;
    /**
     * Validate a kanban transition with code review
     */
    validateTransition(request: KanbanTransitionReviewRequest): Promise<KanbanTransitionReviewResult>;
    /**
     * Perform comprehensive code review
     */
    performCodeReview(request: CodeReviewRequest): Promise<CodeReviewResult>;
    /**
     * Get default configuration
     */
    getDefaultConfig(): CodeReviewConfig;
    /**
     * Get default rules
     */
    private getDefaultRules;
    /**
     * Helper methods
     */
    private getChangedFiles;
    private getAffectedPackages;
    private generateCacheKey;
    private isCacheValid;
    private getFileHashes;
    private getApplicableRules;
    private hasRulesOfType;
    private runESLintAnalysis;
    private runTypeScriptAnalysis;
    private runSecurityAnalysis;
    private runAIAnalysis;
    private calculateMetrics;
    private calculateScore;
    private generateSummary;
    private isBlocked;
    private meetsTransitionThresholds;
}
/**
 * Create and configure a code review rules engine
 */
export declare function createCodeReviewRulesEngine(configPath?: string): Promise<CodeReviewRulesEngine>;
//# sourceMappingURL=rules-engine.d.ts.map