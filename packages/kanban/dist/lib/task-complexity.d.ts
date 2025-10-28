/**
 * Task complexity factors to consider
 */
interface ComplexityFactors {
    /** Lines of code estimated to be touched */
    locImpact: number;
    /** Number of files that need modification */
    fileCount: number;
    /** Technical complexity (1-5 scale) */
    technicalComplexity: number;
    /** Research/learning required (1-5 scale) */
    researchComplexity: number;
    /** Testing complexity (1-5 scale) */
    testingComplexity: number;
    /** Integration complexity with other systems (1-5 scale) */
    integrationComplexity: number;
    /** Estimated time in hours */
    estimatedHours: number;
    /** Whether task requires human judgment/creativity */
    requiresHumanJudgment: boolean;
    /** Whether task has clear acceptance criteria */
    hasClearAcceptanceCriteria: boolean;
    /** Whether task involves external dependencies/APIs */
    hasExternalDependencies: boolean;
}
/**
 * Complexity estimation result
 */
interface ComplexityEstimate {
    taskId: string;
    taskTitle: string;
    factors: ComplexityFactors;
    overallScore: number;
    complexityLevel: 'simple' | 'moderate' | 'complex' | 'expert';
    suitableForLocalModel: boolean;
    recommendedModel: string | null;
    reasoning: string;
    breakdownSteps: string[];
    estimatedTokens: number;
}
/**
 * Batch estimate complexity for multiple tasks
 */
export declare function estimateBatchComplexity(tasksDir: string, options?: {
    statusFilter?: string;
    priorityFilter?: string;
    maxTasks?: number;
    model?: string;
}): Promise<ComplexityEstimate[]>;
/**
 * Get tasks suitable for local model work
 */
export declare function getTasksForLocalModel(estimates: ComplexityEstimate[], maxComplexity?: number): ComplexityEstimate[];
/**
 * Save complexity estimates to file
 */
export declare function saveComplexityEstimates(estimates: ComplexityEstimate[], outputPath: string): Promise<void>;
export {};
//# sourceMappingURL=task-complexity.d.ts.map