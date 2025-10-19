// Core interfaces for the comprehensive testing→review transition system

// Re-export Task type from main kanban types
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

// === Core Coverage Analysis Interfaces ===

export interface TestCoverageRequest {
  task: Task;
  changedFiles: string[];
  affectedPackages: string[];
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

// === Test-Requirement Mapping Interfaces ===

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

// === Agent Workflow Integration Interfaces ===

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
  // Phase 1: Coverage Analysis
  coverageAnalysis: TestCoverageResult;

  // Phase 2: Test Quality Assessment
  testQuality: {
    testCount: number;
    assertionQuality: number;
    edgeCaseCoverage: number;
    mockQuality: number;
  };

  // Phase 3: Requirement Mapping
  requirementMapping: TestRequirementMapping[];

  // Phase 4: Contextual Analysis
  contextualAnalysis: {
    codeChunkMatches: CodeMatch[];
    nearestNeighborMatches: NeighborMatch[];
    semanticSimilarity: number;
  };

  // Phase 5: Scoring & Recommendations
  overallScore: number;
  componentScores: ComponentScores;
  rationale: ScoreRationale[];
  actionItems: ActionItem[];
}

// === Configuration Interface ===

export interface TestingTransitionConfig {
  enabled: boolean;
  thresholds: {
    coverage: number; // default: 90
    quality: number; // default: 75
    softBlock: number; // default: 90
    hardBlock: number; // default: 75
  };
  weights: {
    coverage: number; // default: 0.4
    quality: number; // default: 0.3
    requirementMapping: number; // default: 0.2
    contextualAnalysis: number; // default: 0.1
  };
  timeouts: {
    coverageAnalysis: number; // default: 10000ms
    qualityAssessment: number; // default: 15000ms
    requirementMapping: number; // default: 20000ms
    totalAnalysis: number; // default: 60000ms
  };
  reporting: {
    includeDetailedRationale: boolean; // default: true
    generateActionItems: boolean; // default: true
    appendToTask: boolean; // default: true
  };
}

// === Legacy Interfaces (for backward compatibility) ===

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

// === Transition Validation Interfaces ===

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
