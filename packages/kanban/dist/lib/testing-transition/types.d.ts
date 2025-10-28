export interface Task {
    uuid: string;
    title: string;
    content?: string;
    status: string;
    priority?: string;
    tags?: string[];
    frontmatter?: Record<string, any>;
    [key: string]: any;
}
export interface TestCoverageRequest {
    task: Task;
    changedFiles: string[];
    affectedPackages: string[];
    reportPath: string;
    format: 'lcov' | 'cobertura' | 'json';
}
export interface TestCoverageResult {
    overallCoverage: number;
    totalCoverage: number;
    packageCoverage: Record<string, number>;
    fileCoverage: Record<string, number>;
    uncoveredLines: Record<string, number[]>;
    meetsThreshold: boolean;
    coverageGap: number;
}
export interface TestRequirementMapping {
    testFile: string;
    testName: string;
    testDescription: string;
    relatedRequirements: string[];
    relatedSubtasks: string[];
    relatedDoD: string[];
    coverageScore: number;
    relevanceScore: number;
    qualityScore: number;
}
export interface RequirementAnalysis {
    requirement: string;
    coveredBy: string[];
    coverageQuality: number;
    gaps: string[];
    recommendations: string[];
}
export interface CodeMatch {
    codeChunk: string;
    testReference: string;
    similarity: number;
    context: string;
}
export interface NeighborMatch {
    requirement: string;
    codeElement: string;
    similarity: number;
    matchType: 'semantic' | 'structural' | 'functional';
}
export interface ComponentScores {
    coverageScore: number;
    qualityScore: number;
    requirementMappingScore: number;
    contextualAnalysisScore: number;
}
export interface ScoreRationale {
    component: string;
    score: number;
    evidence: string[];
    reasoning: string;
    improvement: string;
}
export interface ActionItem {
    type: 'checklist' | 'recommendation';
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimatedEffort: string;
}
export interface TestAnalysisWorkflow {
    coverageAnalysis: TestCoverageResult;
    testQuality: {
        testCount: number;
        assertionQuality: number;
        edgeCaseCoverage: number;
        mockQuality: number;
    };
    requirementMapping: TestRequirementMapping[];
    contextualAnalysis: {
        codeChunkMatches: CodeMatch[];
        nearestNeighborMatches: NeighborMatch[];
        semanticSimilarity: number;
    };
    overallScore: number;
    componentScores: ComponentScores;
    rationale: ScoreRationale[];
    actionItems: ActionItem[];
}
export interface ComprehensiveScoreResult {
    totalScore: number;
    componentScores: {
        coverage: ComponentScore;
        quality: ComponentScore;
        requirementMapping: ComponentScore;
        aiAnalysis: ComponentScore;
        performance: ComponentScore;
    };
    threshold: number;
    meetsThreshold: boolean;
    priority: string;
    recommendations: string[];
    actionItems: ActionItem[];
    detailedRationale: ScoreRationale[];
}
export interface ComponentScore {
    score: number;
    weight: number;
    weightedScore: number;
    evidence: string[];
    gaps: string[];
    improvements: string[];
}
export interface PriorityThresholds {
    P0: {
        coverage: 95;
        quality: 90;
        overall: 92;
    };
    P1: {
        coverage: 90;
        quality: 85;
        overall: 87;
    };
    P2: {
        coverage: 85;
        quality: 80;
        overall: 82;
    };
    P3: {
        coverage: 80;
        quality: 75;
        overall: 77;
    };
}
export interface ScoringWeights {
    coverage: number;
    quality: number;
    requirementMapping: number;
    aiAnalysis: number;
    performance: number;
}
export interface TestingTransitionConfig {
    enabled: boolean;
    scoring: {
        enabled: boolean;
        weights: ScoringWeights;
        priorityThresholds: PriorityThresholds;
        adaptiveThresholds: boolean;
        historicalTrending: boolean;
    };
    thresholds: {
        coverage: number;
        quality: number;
        softBlock: number;
        hardBlock: number;
    };
    hardBlockCoverageThreshold: number;
    softBlockQualityScoreThreshold: number;
    weights: {
        coverage: number;
        quality: number;
        requirementMapping: number;
        contextualAnalysis: number;
    };
    timeouts: {
        coverageAnalysis: number;
        qualityAssessment: number;
        requirementMapping: number;
        totalAnalysis: number;
    };
    reporting: {
        includeDetailedRationale: boolean;
        generateActionItems: boolean;
        appendToTask: boolean;
    };
}
export interface TestQualityScore {
    score: number;
    details?: {
        complexity: number;
        passRate: number;
        flakiness: number;
        assertionQuality?: number;
        edgeCaseCoverage?: number;
        mockQuality?: number;
        testDuplication?: number;
        maintainabilityIndex?: number;
    };
}
export interface RequirementMapping {
    requirementId: string;
    testIds: string[];
    isCovered: boolean;
}
export interface AIAnalysisRequest {
    tests: string[];
    coverageResult: TestCoverageResult;
    qualityScore: TestQualityScore;
    mappings: RequirementMapping[];
}
export interface AIAnalysisResult {
    insights: string[];
    recommendations: string[];
    overallScore: number;
}
export interface Report {
    coverage: TestCoverageResult;
    qualityScore: TestQualityScore;
    mappings: RequirementMapping[];
    aiAnalysis: AIAnalysisResult;
}
export interface TransitionValidationRequest {
    task: Task;
    fromStatus: string;
    toStatus: string;
    board?: any;
}
export interface TransitionValidationResult {
    allowed: boolean;
    score?: number;
    violations: string[];
    recommendations?: string[];
    retryCount?: number;
}
export interface TestBlockMessage {
    type: 'hard' | 'soft';
    score: number;
    threshold: number;
    message: string;
    actionItems: ActionItem[];
    retryCount: number;
}
export interface PerformanceMetrics {
    testCount: number;
    averageExecutionTime: number;
    peakMemoryUsage: number;
    totalExecutionTime: number;
}
//# sourceMappingURL=types.d.ts.map