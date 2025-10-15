// Core interfaces for the testing→review transition system

export interface TestCoverageRequest {
  format: 'lcov' | 'cobertura' | 'json';
  reportPath: string;
}

export interface TestCoverageResult {
  totalCoverage: number; // overall percentage (0-100)
  fileCoverage: Record<string, number>; // per-file coverage percentages
}

export interface TestingTransitionConfig {
  hardBlockCoverageThreshold: number; // e.g., 90
  softBlockQualityScoreThreshold: number; // e.g., 75
  supportedFormats: Array<'lcov' | 'cobertura' | 'json'>;
  performanceTimeoutSeconds: number; // max allowed analysis time in seconds
}

export interface TestQualityScore {
  score: number; // 0-100 composite quality score
  details?: {
    complexity: number; // average test complexity
    passRate: number; // percentage of passing tests
    flakiness: number; // flakiness indicator 0-100
  };
}

export interface RequirementMapping {
  requirementId: string;
  testIds: string[]; // list of test identifiers covering this requirement
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
  overallScore: number; // AI-provided aggregate score
}

export interface Report {
  coverage: TestCoverageResult;
  qualityScore: TestQualityScore;
  mappings: RequirementMapping[];
  aiAnalysis: AIAnalysisResult;
}
