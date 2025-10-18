import type {
  AIRoutingDecision,
  AIModelPerformance,
  RoutingStrategy,
  TaskCategory,
  ModelCapabilities,
} from './types.js';
import { PerformanceTracker } from './performance-tracker.js';
import { TaskClassifier } from './task-classifier.js';

/**
 * Model Router - Intelligent routing of AI tasks to optimal models
 */
export class ModelRouter {
  private performanceTracker: PerformanceTracker;
  private availableModels: Map<string, ModelCapabilities> = new Map();
  private routingHistory: AIRoutingDecision[] = [];
  private defaultStrategy: RoutingStrategy;

  constructor(
    performanceTracker: PerformanceTracker,
    defaultStrategy: RoutingStrategy = 'balanced',
  ) {
    this.performanceTracker = performanceTracker;
    this.defaultStrategy = defaultStrategy;
  }

  /**
   * Register an available model with its capabilities
   */
  registerModel(modelName: string, capabilities: ModelCapabilities): void {
    this.availableModels.set(modelName, capabilities);
    this.performanceTracker.setModelCapabilities(modelName, capabilities);
  }

  /**
   * Get the best model for a given task
   */
  async selectBestModel(
    prompt: string,
    availableModels?: string[],
    strategy?: RoutingStrategy,
    context?: {
      jobType?: 'generate' | 'chat' | 'embedding';
      messages?: Array<{ role: string; content: string }>;
      taskId?: string;
    },
  ): Promise<AIRoutingDecision> {
    const modelsToConsider = availableModels || Array.from(this.availableModels.keys());
    const routingStrategy = strategy || this.defaultStrategy;

    // Classify the task
    const taskCategory = TaskClassifier.classifyTask(prompt, context);

    // Get performance data for all available models
    const modelPerformances: AIModelPerformance[] = [];
    for (const modelName of modelsToConsider) {
      const performance = this.performanceTracker.getModelPerformance(modelName, taskCategory);
      if (performance) {
        modelPerformances.push(performance);
      } else if (this.availableModels.has(modelName)) {
        // Create a default performance for new models
        const capabilities = this.availableModels.get(modelName)!;
        modelPerformances.push({
          modelName,
          taskCategory,
          averageScore: 0.5, // Neutral score for new models
          totalJobs: 0,
          successRate: 0.5,
          averageExecutionTime: 0,
          lastUpdated: new Date().toISOString(),
          recentScores: [],
          confidence: 0.1, // Low confidence for new models
          capabilities,
        });
      }
    }

    // Select model based on strategy
    const selectedModel = this.selectModelByStrategy(modelPerformances, routingStrategy);

    // Calculate confidence and alternatives
    const sortedModels = modelPerformances.sort((a, b) => b.averageScore - a.averageScore);
    const alternatives = sortedModels
      .filter((m) => m.modelName !== selectedModel.modelName)
      .slice(0, 3)
      .map((m) => m.modelName);

    const confidence = this.calculateRoutingConfidence(selectedModel, modelPerformances);
    const reasoning = this.generateReasoning(selectedModel, routingStrategy, taskCategory);
    const expectedPerformance = selectedModel.averageScore;
    const riskLevel = this.assessRiskLevel(selectedModel, confidence);

    const decision: AIRoutingDecision = {
      taskId: context?.taskId,
      prompt,
      taskCategory,
      selectedModel: selectedModel.modelName,
      alternativeModels: alternatives,
      confidence,
      reasoning,
      timestamp: new Date().toISOString(),
      expectedPerformance,
      riskLevel,
    };

    // Store routing decision for learning
    this.routingHistory.push(decision);

    // Maintain history size
    if (this.routingHistory.length > 1000) {
      this.routingHistory = this.routingHistory.slice(-1000);
    }

    return decision;
  }

  /**
   * Record feedback on a routing decision
   */
  recordRoutingFeedback(decisionId: string, actualScore: number): void {
    const decision = this.routingHistory.find((d) => `${d.taskId}-${d.timestamp}` === decisionId);

    if (decision) {
      // This would be used to improve routing decisions over time
      console.log(`Routing feedback recorded for ${decision.selectedModel}: ${actualScore}`);
    }
  }

  /**
   * Get routing statistics
   */
  getRoutingStatistics(): {
    totalRoutings: number;
    modelUsage: Record<string, number>;
    categoryDistribution: Record<TaskCategory, number>;
    averageConfidence: number;
    strategy: RoutingStrategy;
  } {
    const modelUsage: Record<string, number> = {};
    const categoryDistribution: Record<string, number> = {};
    let totalConfidence = 0;

    for (const decision of this.routingHistory) {
      modelUsage[decision.selectedModel] = (modelUsage[decision.selectedModel] || 0) + 1;
      categoryDistribution[decision.taskCategory] =
        (categoryDistribution[decision.taskCategory] || 0) + 1;
      totalConfidence += decision.confidence;
    }

    return {
      totalRoutings: this.routingHistory.length,
      modelUsage,
      categoryDistribution: categoryDistribution as Record<TaskCategory, number>,
      averageConfidence:
        this.routingHistory.length > 0 ? totalConfidence / this.routingHistory.length : 0,
      strategy: this.defaultStrategy,
    };
  }

  /**
   * Get recent routing decisions
   */
  getRecentRoutings(limit: number = 50): AIRoutingDecision[] {
    return this.routingHistory
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Update routing strategy
   */
  setRoutingStrategy(strategy: RoutingStrategy): void {
    this.defaultStrategy = strategy;
  }

  /**
   * Get available models
   */
  getAvailableModels(): string[] {
    return Array.from(this.availableModels.keys());
  }

  /**
   * Get model capabilities
   */
  getModelCapabilities(modelName: string): ModelCapabilities | null {
    return this.availableModels.get(modelName) || null;
  }

  /**
   * Select model based on routing strategy
   */
  private selectModelByStrategy(
    performances: AIModelPerformance[],
    strategy: RoutingStrategy,
  ): AIModelPerformance {
    if (performances.length === 0) {
      throw new Error('No models available for routing');
    }

    switch (strategy) {
      case 'best-performance':
        return performances.sort((a, b) => b.averageScore - a.averageScore)[0]!;

      case 'fastest':
        return performances.sort((a, b) =>
          a.capabilities.speed.localeCompare(b.capabilities.speed),
        )[0]!;

      case 'cheapest':
        return performances.sort(
          (a, b) => a.capabilities.costPerToken - b.capabilities.costPerToken,
        )[0]!;

      case 'most-reliable':
        return performances.sort(
          (a, b) => b.capabilities.reliability - a.capabilities.reliability,
        )[0]!;

      case 'balanced':
        // Use a weighted score combining performance, speed, and cost
        const weightedScores = performances.map((p) => ({
          performance: p,
          weightedScore: this.calculateBalancedScore(p),
        }));
        return weightedScores.sort((a, b) => b.weightedScore - a.weightedScore)[0]!.performance;

      default:
        return performances[0]!;
    }
  }

  /**
   * Calculate balanced score for model selection
   */
  private calculateBalancedScore(performance: AIModelPerformance): number {
    const performanceWeight = 0.4;
    const speedWeight = 0.3;
    const costWeight = 0.2;
    const reliabilityWeight = 0.1;

    // Normalize speed (fast=3, medium=2, slow=1)
    const speedScore =
      performance.capabilities.speed === 'fast'
        ? 3
        : performance.capabilities.speed === 'medium'
          ? 2
          : 1;

    // Normalize cost (inverse, lower cost = higher score)
    const maxCost = Math.max(
      ...Array.from(this.availableModels.values()).map((c) => c.costPerToken),
    );
    const costScore = maxCost > 0 ? (maxCost - performance.capabilities.costPerToken) / maxCost : 1;

    const balancedScore =
      performance.averageScore * performanceWeight +
      (speedScore / 3) * speedWeight +
      costScore * costWeight +
      performance.capabilities.reliability * reliabilityWeight;

    return balancedScore;
  }

  /**
   * Calculate routing confidence
   */
  private calculateRoutingConfidence(
    selectedModel: AIModelPerformance,
    allPerformances: AIModelPerformance[],
  ): number {
    if (allPerformances.length <= 1) return 0.5;

    // Higher confidence if the selected model is significantly better than alternatives
    const sortedScores = allPerformances.map((p) => p.averageScore).sort((a, b) => b - a);
    const topScore = sortedScores[0]!;
    const secondScore = sortedScores[1] || 0;

    const scoreDifference = topScore - secondScore;
    const confidenceFromScore = Math.min(scoreDifference * 2, 1); // Scale difference to 0-1

    // Factor in the confidence of the performance data
    const confidenceFromData = selectedModel.confidence;

    // Combine both factors
    return confidenceFromScore * 0.6 + confidenceFromData * 0.4;
  }

  /**
   * Generate reasoning for routing decision
   */
  private generateReasoning(
    selectedModel: AIModelPerformance,
    strategy: RoutingStrategy,
    taskCategory: TaskCategory,
  ): string {
    const reasons: string[] = [];

    switch (strategy) {
      case 'best-performance':
        reasons.push(
          `Selected for highest performance score (${selectedModel.averageScore.toFixed(2)})`,
        );
        break;
      case 'fastest':
        reasons.push(`Selected for fastest response speed (${selectedModel.capabilities.speed})`);
        break;
      case 'cheapest':
        reasons.push(
          `Selected for lowest cost per token ($${selectedModel.capabilities.costPerToken.toFixed(6)})`,
        );
        break;
      case 'most-reliable':
        reasons.push(
          `Selected for highest reliability (${(selectedModel.capabilities.reliability * 100).toFixed(1)}%)`,
        );
        break;
      case 'balanced':
        reasons.push(`Selected for balanced performance across speed, cost, and quality`);
        break;
    }

    // Add task-specific reasoning
    if (selectedModel.totalJobs > 0) {
      reasons.push(`Has ${selectedModel.totalJobs} previous jobs in ${taskCategory} category`);
    }

    // Add confidence reasoning
    if (selectedModel.confidence > 0.7) {
      reasons.push('High confidence in performance data');
    } else if (selectedModel.confidence < 0.3) {
      reasons.push('Limited performance data - using default capabilities');
    }

    return reasons.join('. ');
  }

  /**
   * Assess risk level of routing decision
   */
  private assessRiskLevel(
    performance: AIModelPerformance,
    confidence: number,
  ): 'low' | 'medium' | 'high' {
    if (confidence > 0.8 && performance.averageScore > 0.7) {
      return 'low';
    } else if (confidence > 0.5 && performance.averageScore > 0.4) {
      return 'medium';
    } else {
      return 'high';
    }
  }

  /**
   * Clear routing history
   */
  clearHistory(): void {
    this.routingHistory = [];
  }
}
