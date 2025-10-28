// AI Learning System - Core Types

export type TaskCategory =
  | 'buildfix-ts-errors'
  | 'buildfix-general'
  | 'code-review'
  | 'tdd-analysis'
  | 'documentation'
  | 'coding'
  | 'testing'
  | 'refactoring'
  | 'debugging'
  | 'general';

export type AIPerformanceScore = {
  score: number; // -1 to 1 (negative = failed, positive = succeeded)
  scoreSource: 'deterministic' | 'user-feedback' | 'auto-eval';
  scoreReason?: string; // Why it got this score
  taskCategory: TaskCategory;
  executionTime?: number; // How long the response took to generate
  tokensUsed?: number; // Token usage for cost tracking
  modelName: string; // Which AI model was used
  timestamp: string; // When the performance was recorded
  prompt?: string; // The prompt that generated this score
  result?: any; // The actual result for reference
};

export type AIModelPerformance = {
  modelName: string;
  taskCategory: TaskCategory;
  averageScore: number;
  totalJobs: number;
  successRate: number;
  averageExecutionTime: number;
  lastUpdated: string;
  recentScores: number[]; // Last 10 scores for trend analysis
  confidence: number; // How confident we are in this model's performance
  capabilities: ModelCapabilities;
};

export type ModelCapabilities = {
  maxTokens: number;
  supportsStreaming: boolean;
  supportsJson: boolean;
  supportsFunctionCalling: boolean;
  costPerToken: number;
  speed: 'fast' | 'medium' | 'slow';
  reliability: number; // 0 to 1
};

export type AIRoutingDecision = {
  taskId?: string;
  prompt: string;
  taskCategory: TaskCategory;
  selectedModel: string;
  alternativeModels: string[];
  confidence: number; // 0 to 1
  reasoning: string;
  timestamp: string;
  expectedPerformance: number;
  riskLevel: 'low' | 'medium' | 'high';
};

export type RoutingStrategy =
  | 'best-performance'
  | 'fastest'
  | 'cheapest'
  | 'most-reliable'
  | 'balanced';

export type LearningConfig = {
  cacheSize: number;
  similarityThreshold: number;
  maxAgeHours: number;
  minSamplesForRouting: number;
  defaultStrategy: RoutingStrategy;
  enableAutoScoring: boolean;
  enableUserFeedback: boolean;
};

export type PerformanceQuery = {
  taskCategory?: TaskCategory;
  modelName?: string;
  timeRange?: {
    start: string;
    end: string;
  };
  minScore?: number;
  limit?: number;
};

export type PerformanceAnalysis = {
  totalEntries: number;
  models: Record<
    string,
    {
      entries: number;
      averageScore: number;
      taskDistribution: Record<TaskCategory, number>;
    }
  >;
  taskCategories: Record<
    TaskCategory,
    {
      totalScore: number;
      count: number;
      averageScore: number;
      bestModel: string;
      modelPerformance: Record<
        string,
        {
          averageScore: number;
          count: number;
          confidence: number;
        }
      >;
    }
  >;
  recommendations: string[];
  trends: {
    improving: string[];
    declining: string[];
    stable: string[];
  };
};

export type CacheEntry = {
  id: string;
  prompt: string;
  response: any;
  modelName: string;
  jobType: 'generate' | 'chat' | 'embedding';
  createdAt: number;
  embedding?: number[];
  performance?: AIPerformanceScore;
};

export type LearningMetrics = {
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  averageScore: number;
  cacheHitRate: number;
  routingAccuracy: number;
  modelUtilization: Record<string, number>;
  categoryDistribution: Record<TaskCategory, number>;
  performanceTrend: 'improving' | 'stable' | 'declining';
};

// Eidolon Field Classifier Types
export interface TaskEmbedding {
  taskId: string;
  prompt: string;
  embedding: number[];
  category?: string;
  timestamp: number;
  performance?: number;
}

export interface ClusterAttractor {
  id: string;
  center: any; // VectorN from eidolon-field
  strength: number;
  category: string;
  taskCount: number;
  averagePerformance: number;
}

export interface EidolonClassificationResult {
  taskId: string;
  prompt: string;
  embedding: number[];
  predictedCategory: string;
  confidence: number;
  nearestAttractor?: ClusterAttractor;
  distanceToCenter: number;
  clusterMembership: number[];
  reasoning: string;
}

export interface LearningStats {
  totalTasks: number;
  attractorCount: number;
  fieldGridSize: number;
  averageFieldStrength: number;
  attractors: ClusterAttractor[];
}
