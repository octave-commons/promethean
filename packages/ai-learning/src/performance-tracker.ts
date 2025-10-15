import type {
  AIPerformanceScore,
  AIModelPerformance,
  PerformanceQuery,
  PerformanceAnalysis,
  LearningMetrics,
  TaskCategory,
  ModelCapabilities,
} from './types.js';

/**
 * Performance Tracker - Tracks and analyzes AI model performance
 */
export class PerformanceTracker {
  private scores: AIPerformanceScore[] = [];
  private modelCapabilities: Map<string, ModelCapabilities> = new Map();
  private maxCacheSize: number;

  constructor(maxCacheSize: number = 10000) {
    this.maxCacheSize = maxCacheSize;
  }

  /**
   * Record a performance score
   */
  recordScore(score: AIPerformanceScore): void {
    this.scores.push(score);

    // Maintain cache size
    if (this.scores.length > this.maxCacheSize) {
      this.scores = this.scores.slice(-this.maxCacheSize);
    }
  }

  /**
   * Record multiple scores at once
   */
  recordScores(scores: AIPerformanceScore[]): void {
    this.scores.push(...scores);

    if (this.scores.length > this.maxCacheSize) {
      this.scores = this.scores.slice(-this.maxCacheSize);
    }
  }

  /**
   * Get performance scores for a specific query
   */
  getScores(query: PerformanceQuery): AIPerformanceScore[] {
    let filtered = [...this.scores];

    if (query.taskCategory) {
      filtered = filtered.filter((score) => score.taskCategory === query.taskCategory);
    }

    if (query.modelName) {
      filtered = filtered.filter((score) => score.modelName === query.modelName);
    }

    if (query.timeRange) {
      const start = new Date(query.timeRange.start).getTime();
      const end = new Date(query.timeRange.end).getTime();
      filtered = filtered.filter((score) => {
        const timestamp = new Date(score.timestamp).getTime();
        return timestamp >= start && timestamp <= end;
      });
    }

    if (query.minScore !== undefined) {
      filtered = filtered.filter((score) => score.score >= query.minScore!);
    }

    // Sort by timestamp (newest first) and apply limit
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return query.limit ? filtered.slice(0, query.limit) : filtered;
  }

  /**
   * Get model performance analysis
   */
  getModelPerformance(modelName: string, taskCategory?: TaskCategory): AIModelPerformance | null {
    const query: PerformanceQuery = { modelName, taskCategory };
    const scores = this.getScores(query);

    if (scores.length === 0) {
      return null;
    }

    const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
    const averageScore = totalScore / scores.length;
    const successCount = scores.filter((score) => score.score > 0).length;
    const successRate = successCount / scores.length;

    const totalExecutionTime = scores
      .filter((score) => score.executionTime !== undefined)
      .reduce((sum, score) => sum + (score.executionTime || 0), 0);
    const executionTimeCount = scores.filter((score) => score.executionTime !== undefined).length;
    const averageExecutionTime =
      executionTimeCount > 0 ? totalExecutionTime / executionTimeCount : 0;

    const recentScores = scores.slice(0, 10).map((score) => score.score);

    const capabilities =
      this.modelCapabilities.get(modelName) || this.getDefaultCapabilities(modelName);

    // Calculate confidence based on sample size and consistency
    const confidence = this.calculateConfidence(scores);

    return {
      modelName,
      taskCategory: taskCategory || 'general',
      averageScore,
      totalJobs: scores.length,
      successRate,
      averageExecutionTime,
      lastUpdated: new Date().toISOString(),
      recentScores,
      confidence,
      capabilities,
    };
  }

  /**
   * Get comprehensive performance analysis
   */
  getPerformanceAnalysis(): PerformanceAnalysis {
    const analysis: PerformanceAnalysis = {
      totalEntries: this.scores.length,
      models: {},
      taskCategories: {} as Record<TaskCategory, any>,
      recommendations: [],
      trends: {
        improving: [],
        declining: [],
        stable: [],
      },
    };

    // Analyze by model
    const modelNames = [...new Set(this.scores.map((score) => score.modelName))];
    for (const modelName of modelNames) {
      const modelScores = this.scores.filter((score) => score.modelName === modelName);
      const averageScore =
        modelScores.reduce((sum, score) => sum + score.score, 0) / modelScores.length;

      const taskDistribution: Record<string, number> = {};
      for (const score of modelScores) {
        taskDistribution[score.taskCategory] = (taskDistribution[score.taskCategory] || 0) + 1;
      }

      analysis.models[modelName] = {
        entries: modelScores.length,
        averageScore,
        taskDistribution,
      };
    }

    // Analyze by task category
    const categories = [...new Set(this.scores.map((score) => score.taskCategory))];
    for (const category of categories) {
      const categoryScores = this.scores.filter((score) => score.taskCategory === category);
      const totalScore = categoryScores.reduce((sum, score) => sum + score.score, 0);
      const averageScore = totalScore / categoryScores.length;

      const modelPerformance: Record<
        string,
        { averageScore: number; count: number; confidence: number }
      > = {};
      for (const modelName of modelNames) {
        const modelCategoryScores = categoryScores.filter((score) => score.modelName === modelName);
        if (modelCategoryScores.length > 0) {
          const modelAvgScore =
            modelCategoryScores.reduce((sum, score) => sum + score.score, 0) /
            modelCategoryScores.length;
          modelPerformance[modelName] = {
            averageScore: modelAvgScore,
            count: modelCategoryScores.length,
            confidence: this.calculateConfidence(modelCategoryScores),
          };
        }
      }

      const bestModel = Object.entries(modelPerformance).sort(
        ([, a], [, b]) => b.averageScore - a.averageScore,
      )[0]?.[0];

      analysis.taskCategories[category] = {
        totalScore,
        count: categoryScores.length,
        averageScore,
        bestModel: bestModel || 'unknown',
        modelPerformance,
      };
    }

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis);

    // Analyze trends
    analysis.trends = this.analyzeTrends();

    return analysis;
  }

  /**
   * Get overall learning metrics
   */
  getLearningMetrics(): LearningMetrics {
    const totalJobs = this.scores.length;
    const successfulJobs = this.scores.filter((score) => score.score > 0).length;
    const failedJobs = this.scores.filter((score) => score.score < 0).length;
    const averageScore =
      totalJobs > 0 ? this.scores.reduce((sum, score) => sum + score.score, 0) / totalJobs : 0;

    // Calculate model utilization
    const modelUtilization: Record<string, number> = {};
    for (const score of this.scores) {
      modelUtilization[score.modelName] = (modelUtilization[score.modelName] || 0) + 1;
    }

    // Calculate category distribution
    const categoryDistribution: Record<string, number> = {};
    for (const score of this.scores) {
      categoryDistribution[score.taskCategory] =
        (categoryDistribution[score.taskCategory] || 0) + 1;
    }

    // Calculate performance trend
    const performanceTrend = this.calculatePerformanceTrend();

    return {
      totalJobs,
      successfulJobs,
      failedJobs,
      averageScore,
      cacheHitRate: 0, // This would be provided by the cache system
      routingAccuracy: 0, // This would be calculated based on routing decisions
      modelUtilization,
      categoryDistribution: categoryDistribution as Record<TaskCategory, number>,
      performanceTrend,
    };
  }

  /**
   * Set model capabilities
   */
  setModelCapabilities(modelName: string, capabilities: ModelCapabilities): void {
    this.modelCapabilities.set(modelName, capabilities);
  }

  /**
   * Get model capabilities
   */
  getModelCapabilities(modelName: string): ModelCapabilities | null {
    return this.modelCapabilities.get(modelName) || null;
  }

  /**
   * Clear all performance data
   */
  clearData(): void {
    this.scores = [];
  }

  /**
   * Get recent scores for a model
   */
  getRecentScores(modelName: string, count: number = 10): AIPerformanceScore[] {
    return this.scores
      .filter((score) => score.modelName === modelName)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, count);
  }

  /**
   * Calculate confidence based on sample size and consistency
   */
  private calculateConfidence(scores: AIPerformanceScore[]): number {
    if (scores.length < 3) return 0.1; // Low confidence for small samples

    const mean = scores.reduce((sum, score) => sum + score.score, 0) / scores.length;
    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score.score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);

    // Higher confidence for larger samples and lower variance
    const sampleSizeFactor = Math.min(scores.length / 50, 1); // Max out at 50 samples
    const consistencyFactor = Math.max(0, 1 - standardDeviation); // Lower variance = higher confidence

    return sampleSizeFactor * consistencyFactor;
  }

  /**
   * Get default capabilities for unknown models
   */
  private getDefaultCapabilities(modelName: string): ModelCapabilities {
    return {
      maxTokens: 4096,
      supportsStreaming: true,
      supportsJson: true,
      supportsFunctionCalling: false,
      costPerToken: 0.0001,
      speed: 'medium',
      reliability: 0.8,
    };
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(analysis: PerformanceAnalysis): string[] {
    const recommendations: string[] = [];

    // Find underperforming models
    for (const [modelName, modelData] of Object.entries(analysis.models)) {
      if (modelData.averageScore < 0.3) {
        recommendations.push(
          `Consider replacing ${modelName} - low average score (${modelData.averageScore.toFixed(2)})`,
        );
      }
    }

    // Find categories with no good models
    for (const [category, categoryData] of Object.entries(analysis.taskCategories)) {
      if (categoryData.averageScore < 0.5) {
        recommendations.push(
          `Category "${category}" needs better model selection - current average: ${categoryData.averageScore.toFixed(2)}`,
        );
      }
    }

    // Suggest model specialization
    for (const [modelName, modelData] of Object.entries(analysis.models)) {
      const bestCategory = Object.entries(modelData.taskDistribution).sort(
        ([, a], [, b]) => (b as number) - (a as number),
      )[0]?.[0];

      if (bestCategory) {
        recommendations.push(
          `${modelName} performs best in "${bestCategory}" - consider specializing`,
        );
      }
    }

    return recommendations;
  }

  /**
   * Analyze performance trends
   */
  private analyzeTrends(): { improving: string[]; declining: string[]; stable: string[] } {
    const trends = { improving: [], declining: [], stable: [] };

    for (const modelName of [...new Set(this.scores.map((score) => score.modelName))]) {
      const recentScores = this.getRecentScores(modelName, 20);
      if (recentScores.length < 10) continue;

      const firstHalf = recentScores.slice(-10).map((s) => s.score);
      const secondHalf = recentScores.slice(0, 10).map((s) => s.score);

      const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;

      const difference = secondAvg - firstAvg;

      if (difference > 0.1) {
        trends.improving.push(modelName);
      } else if (difference < -0.1) {
        trends.declining.push(modelName);
      } else {
        trends.stable.push(modelName);
      }
    }

    return trends;
  }

  /**
   * Calculate overall performance trend
   */
  private calculatePerformanceTrend(): 'improving' | 'stable' | 'declining' {
    if (this.scores.length < 20) return 'stable';

    const sortedScores = [...this.scores].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    const firstQuarter = sortedScores.slice(0, Math.floor(sortedScores.length / 4));
    const lastQuarter = sortedScores.slice(-Math.floor(sortedScores.length / 4));

    const firstAvg =
      firstQuarter.reduce((sum, score) => sum + score.score, 0) / firstQuarter.length;
    const lastAvg = lastQuarter.reduce((sum, score) => sum + score.score, 0) / lastQuarter.length;

    const difference = lastAvg - firstAvg;

    if (difference > 0.05) return 'improving';
    if (difference < -0.05) return 'declining';
    return 'stable';
  }
}
