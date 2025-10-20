/**
 * A/B Testing Framework for Prompt Optimization v2.0
 * qwen3:4b-instruct 100k context optimization
 */

import { adaptiveRouting, RoutingResult, TemplateType } from './adaptive-routing';

export interface TestConfig {
  name: string;
  description: string;
  controlGroup: ControlGroup;
  testGroups: TestGroup[];
  sampleSize: number;
  successCriteria: SuccessCriteria;
  duration: number; // days
  status: 'planned' | 'active' | 'completed' | 'paused';
}

export interface ControlGroup {
  template: TemplateType;
  description: string;
  expectedMetrics: PerformanceMetrics;
}

export interface TestGroup {
  name: string;
  templates: TemplateType[];
  routing: 'static' | 'adaptive_with_fallback' | 'complexity_based';
  description: string;
  expectedMetrics: PerformanceMetrics;
}

export interface SuccessCriteria {
  minSuccessRate: number;
  maxProcessingTime: number;
  minTokenEfficiency: number;
  minConfidence: number;
}

export interface PerformanceMetrics {
  successRate: number;
  processingTime: number;
  tokenUsage: number;
  confidence: number;
  userSatisfaction?: number;
}

export interface TestResult {
  groupId: string;
  template: TemplateType;
  input: string;
  output?: string;
  success: boolean;
  processingTime: number;
  tokenUsage: number;
  confidence: number;
  timestamp: Date;
  error?: string;
  fallbackUsed?: boolean;
  fallbackChain?: TemplateType[];
}

export interface TestStatistics {
  totalRequests: number;
  successRate: number;
  averageProcessingTime: number;
  averageTokenUsage: number;
  averageConfidence: number;
  templateDistribution: Record<TemplateType, number>;
  errorDistribution: Record<string, number>;
  fallbackUsage: number;
  userSatisfaction?: number;
}

export interface ABTestComparison {
  control: TestStatistics;
  test: Record<string, TestStatistics>;
  significance: {
    successRate: number;
    processingTime: number;
    tokenUsage: number;
    confidence: number;
  };
  recommendation: 'control' | 'test' | 'inconclusive';
  confidence: number;
  reasoning: string;
}

/**
 * A/B Testing Manager
 */
export class ABTestingFramework {
  private activeTests: Map<string, TestConfig> = new Map();
  private testResults: Map<string, TestResult[]> = new Map();
  private testStatistics: Map<string, Record<string, TestStatistics>> = new Map();

  constructor() {
    this.initializeDefaultTests();
  }

  /**
   * Initialize default A/B test configurations
   */
  private initializeDefaultTests(): void {
    // Test 1: Adaptive Routing vs Static T1-BASE
    const adaptiveRoutingTest: TestConfig = {
      name: 'adaptive_routing_v1',
      description: 'Compare adaptive routing system with static T1-BASE template',
      controlGroup: {
        template: 'T1-BASE',
        description: 'Static T1-BASE template for all queries',
        expectedMetrics: {
          successRate: 0.99,
          processingTime: 1.8,
          tokenUsage: 450,
          confidence: 0.95,
        },
      },
      testGroups: [
        {
          name: 'adaptive_routing',
          templates: ['T1-BASE', 'T2-FOCUSED', 'T6-SIMPLE'],
          routing: 'adaptive_with_fallback',
          description: 'Adaptive routing with fallback mechanisms',
          expectedMetrics: {
            successRate: 0.99,
            processingTime: 2.3,
            tokenUsage: 550,
            confidence: 0.92,
          },
        },
      ],
      sampleSize: 1000,
      successCriteria: {
        minSuccessRate: 0.95,
        maxProcessingTime: 3.0,
        minTokenEfficiency: 0.7,
        minConfidence: 0.85,
      },
      duration: 7,
      status: 'planned',
    };

    // Test 2: Full v2.0 Templates vs Current System
    const fullV2Test: TestConfig = {
      name: 'full_v2_optimization',
      description: 'Compare complete v2.0 template system with current implementation',
      controlGroup: {
        template: 'T1-BASE',
        description: 'Current working template (T1-BASE only)',
        expectedMetrics: {
          successRate: 0.99,
          processingTime: 1.8,
          tokenUsage: 450,
          confidence: 0.95,
        },
      },
      testGroups: [
        {
          name: 'full_v2_adaptive',
          templates: [
            'T1-BASE',
            'T2-FOCUSED',
            'T2-CONTEXT',
            'T3-CONSTRAINTS',
            'T3-EXAMPLES',
            'T4-EDGE',
            'T4-VALIDATION',
            'T5-COMPLEX',
            'T6-SIMPLE',
            'T7-TECHNICAL',
            'T8-CREATIVE',
            'T9-DATA',
            'T10-DEBUG',
            'T11-REVIEW',
            'T12-FALLBACK',
          ],
          routing: 'adaptive_with_fallback',
          description: 'Complete v2.0 template system with adaptive routing',
          expectedMetrics: {
            successRate: 0.99,
            processingTime: 2.58,
            tokenUsage: 691,
            confidence: 0.9,
          },
        },
      ],
      sampleSize: 2000,
      successCriteria: {
        minSuccessRate: 0.95,
        maxProcessingTime: 3.5,
        minTokenEfficiency: 0.65,
        minConfidence: 0.8,
      },
      duration: 14,
      status: 'planned',
    };

    this.activeTests.set('adaptive_routing_v1', adaptiveRoutingTest);
    this.activeTests.set('full_v2_optimization', fullV2Test);
  }

  /**
   * Start an A/B test
   */
  public startTest(testId: string): boolean {
    const test = this.activeTests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    if (test.status !== 'planned' && test.status !== 'paused') {
      throw new Error(`Test ${testId} is already ${test.status}`);
    }

    test.status = 'active';
    this.testResults.set(testId, []);
    this.testStatistics.set(testId, {});

    console.log(`Started A/B test: ${test.name}`);
    return true;
  }

  /**
   * Pause an active test
   */
  public pauseTest(testId: string): boolean {
    const test = this.activeTests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    if (test.status !== 'active') {
      throw new Error(`Test ${testId} is not active`);
    }

    test.status = 'paused';
    console.log(`Paused A/B test: ${test.name}`);
    return true;
  }

  /**
   * Complete a test and generate final results
   */
  public completeTest(testId: string): ABTestComparison {
    const test = this.activeTests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    if (test.status !== 'active') {
      throw new Error(`Test ${testId} is not active`);
    }

    test.status = 'completed';

    const comparison = this.generateComparison(testId);
    console.log(`Completed A/B test: ${test.name}`);
    console.log(
      `Recommendation: ${comparison.recommendation} (${Math.round(comparison.confidence * 100)}% confidence)`,
    );

    return comparison;
  }

  /**
   * Execute a test request
   */
  public async executeTestRequest(
    testId: string,
    input: string,
    userGroup?: string,
  ): Promise<{
    result: RoutingResult;
    groupId: string;
    testType: 'control' | 'test';
  }> {
    const test = this.activeTests.get(testId);
    if (!test || test.status !== 'active') {
      throw new Error(`Test ${testId} is not active`);
    }

    const results = this.testResults.get(testId) || [];
    const statistics = this.testStatistics.get(testId) || {};

    // Determine group assignment (50/50 split for simplicity)
    const isControl = Math.random() < 0.5;
    let groupId: string;
    let template: TemplateType;
    let testType: 'control' | 'test';

    if (isControl) {
      groupId = 'control';
      template = test.controlGroup.template;
      testType = 'control';
    } else {
      // Select test group (for now, use first test group)
      const testGroup = test.testGroups[0];
      groupId = testGroup.name;
      testType = 'test';

      // Apply routing logic for test group
      if (testGroup.routing === 'adaptive_with_fallback') {
        const routingResult = await adaptiveRouting.selectTemplate(input);
        template = routingResult.template;
      } else {
        // Static routing - use first template
        template = testGroup.templates[0];
      }
    }

    // Execute the template application
    const startTime = Date.now();
    let success = false;
    let output: string | undefined;
    let error: string | undefined;
    let fallbackUsed = false;
    let fallbackChain: TemplateType[] | undefined;

    try {
      // Simulate template application (in real implementation, this would call the actual template)
      output = await this.applyTemplate(template, input);
      success = true;

      // Record performance for adaptive routing
      adaptiveRouting.recordPerformance(template, success);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      success = false;

      // Try fallback if available
      if (testType === 'test') {
        const routingResult = await adaptiveRouting.selectTemplate(input, [template]);
        if (routingResult.template !== template) {
          fallbackUsed = true;
          fallbackChain = [template, ...routingResult.fallbackChain];

          try {
            output = await this.applyTemplate(routingResult.template, input);
            success = true;
            adaptiveRouting.recordPerformance(routingResult.template, success);
            adaptiveRouting.recordFallbackUsage(template);
          } catch (fallbackErr) {
            error = fallbackErr instanceof Error ? fallbackErr.message : 'Fallback failed';
          }
        }
      }
    }

    const processingTime = (Date.now() - startTime) / 1000;
    const tokenUsage = this.estimateTokenUsage(template, input);
    const confidence = this.calculateConfidence(template, input, success);

    // Record test result
    const testResult: TestResult = {
      groupId,
      template,
      input,
      output,
      success,
      processingTime,
      tokenUsage,
      confidence,
      timestamp: new Date(),
      error,
      fallbackUsed,
      fallbackChain,
    };

    results.push(testResult);
    this.testResults.set(testId, results);

    // Update statistics
    this.updateStatistics(testId, groupId, testResult);

    const routingResult: RoutingResult = {
      template,
      confidence,
      reasoning: `A/B test ${testId} - ${testType} group ${groupId}`,
      fallbackChain: fallbackChain || [],
      estimatedTokens: tokenUsage,
      estimatedTime: processingTime,
    };

    return { result: routingResult, groupId, testType };
  }

  /**
   * Apply template to input (simulated implementation)
   */
  private async applyTemplate(template: TemplateType, input: string): Promise<string> {
    // Simulate template processing time
    const processingTimes: Record<TemplateType, number> = {
      'T1-BASE': 1.8,
      'T2-FOCUSED': 2.5,
      'T2-CONTEXT': 2.8,
      'T3-CONSTRAINTS': 3.2,
      'T3-EXAMPLES': 3.5,
      'T4-EDGE': 3.8,
      'T4-VALIDATION': 4.0,
      'T5-COMPLEX': 4.0,
      'T6-SIMPLE': 1.5,
      'T7-TECHNICAL': 3.3,
      'T8-CREATIVE': 3.0,
      'T9-DATA': 3.5,
      'T10-DEBUG': 3.3,
      'T11-REVIEW': 2.8,
      'T12-FALLBACK': 1.2,
    };

    const baseTime = processingTimes[template] || 2.0;
    const actualTime = baseTime * (0.8 + Math.random() * 0.4); // ±20% variation

    await new Promise((resolve) => setTimeout(resolve, actualTime * 100)); // Simulate processing

    // Simulate success/failure based on template success rates
    const successRates: Record<TemplateType, number> = {
      'T1-BASE': 0.99,
      'T2-FOCUSED': 0.95,
      'T2-CONTEXT': 0.93,
      'T3-CONSTRAINTS': 0.91,
      'T3-EXAMPLES': 0.89,
      'T4-EDGE': 0.87,
      'T4-VALIDATION': 0.85,
      'T5-COMPLEX': 0.83,
      'T6-SIMPLE': 0.96,
      'T7-TECHNICAL': 0.88,
      'T8-CREATIVE': 0.86,
      'T9-DATA': 0.87,
      'T10-DEBUG': 0.89,
      'T11-REVIEW': 0.92,
      'T12-FALLBACK': 0.99,
    };

    const successRate = successRates[template] || 0.9;
    if (Math.random() > successRate) {
      throw new Error(`Template ${template} failed to process input`);
    }

    return `Optimized output using ${template} for input: ${input.substring(0, 50)}...`;
  }

  /**
   * Estimate token usage for template
   */
  private estimateTokenUsage(template: TemplateType, input: string): number {
    const baseTokens: Record<TemplateType, number> = {
      'T1-BASE': 450,
      'T2-FOCUSED': 750,
      'T2-CONTEXT': 800,
      'T3-CONSTRAINTS': 850,
      'T3-EXAMPLES': 900,
      'T4-EDGE': 950,
      'T4-VALIDATION': 1000,
      'T5-COMPLEX': 1200,
      'T6-SIMPLE': 500,
      'T7-TECHNICAL': 950,
      'T8-CREATIVE': 900,
      'T9-DATA': 1000,
      'T10-DEBUG': 950,
      'T11-REVIEW': 800,
      'T12-FALLBACK': 400,
    };

    const inputTokens = Math.ceil(input.length / 4); // Rough estimate
    return baseTokens[template] + inputTokens;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(template: TemplateType, input: string, success: boolean): number {
    const baseConfidence: Record<TemplateType, number> = {
      'T1-BASE': 0.95,
      'T2-FOCUSED': 0.92,
      'T2-CONTEXT': 0.9,
      'T3-CONSTRAINTS': 0.88,
      'T3-EXAMPLES': 0.86,
      'T4-EDGE': 0.84,
      'T4-VALIDATION': 0.82,
      'T5-COMPLEX': 0.8,
      'T6-SIMPLE': 0.93,
      'T7-TECHNICAL': 0.85,
      'T8-CREATIVE': 0.83,
      'T9-DATA': 0.84,
      'T10-DEBUG': 0.86,
      'T11-REVIEW': 0.89,
      'T12-FALLBACK': 0.97,
    };

    let confidence = baseConfidence[template] || 0.85;

    // Adjust based on input complexity
    if (input.length > 1000) confidence -= 0.05;
    if (input.length > 2000) confidence -= 0.05;

    // Adjust based on success
    if (!success) confidence -= 0.1;

    return Math.max(0.5, Math.min(0.99, confidence));
  }

  /**
   * Update test statistics
   */
  private updateStatistics(testId: string, groupId: string, result: TestResult): void {
    const statistics = this.testStatistics.get(testId) || {};

    if (!statistics[groupId]) {
      statistics[groupId] = {
        totalRequests: 0,
        successRate: 0,
        averageProcessingTime: 0,
        averageTokenUsage: 0,
        averageConfidence: 0,
        templateDistribution: {} as Record<TemplateType, number>,
        errorDistribution: {},
        fallbackUsage: 0,
      };
    }

    const stats = statistics[groupId];
    stats.totalRequests++;

    // Update template distribution
    stats.templateDistribution[result.template] =
      (stats.templateDistribution[result.template] || 0) + 1;

    // Update error distribution
    if (result.error) {
      stats.errorDistribution[result.error] = (stats.errorDistribution[result.error] || 0) + 1;
    }

    // Update fallback usage
    if (result.fallbackUsed) {
      stats.fallbackUsage++;
    }

    // Calculate running averages
    const successCount = Array.from(this.testResults.get(testId) || []).filter(
      (r) => r.groupId === groupId && r.success,
    ).length;

    stats.successRate = successCount / stats.totalRequests;

    const groupResults = Array.from(this.testResults.get(testId) || []).filter(
      (r) => r.groupId === groupId,
    );

    stats.averageProcessingTime =
      groupResults.reduce((sum, r) => sum + r.processingTime, 0) / groupResults.length;
    stats.averageTokenUsage =
      groupResults.reduce((sum, r) => sum + r.tokenUsage, 0) / groupResults.length;
    stats.averageConfidence =
      groupResults.reduce((sum, r) => sum + r.confidence, 0) / groupResults.length;

    this.testStatistics.set(testId, statistics);
  }

  /**
   * Generate A/B test comparison
   */
  public generateComparison(testId: string): ABTestComparison {
    const test = this.activeTests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    const statistics = this.testStatistics.get(testId) || {};
    const control = statistics['control'];
    const testGroups = Object.entries(statistics).filter(([key]) => key !== 'control');

    if (!control) {
      throw new Error('Control group statistics not available');
    }

    // Calculate statistical significance
    const significance: Record<string, number> = {};

    testGroups.forEach(([groupId, testStats]) => {
      // Simple significance calculation (would use proper statistical tests in production)
      const successRateDiff = Math.abs(testStats.successRate - control.successRate);
      const processingTimeDiff = Math.abs(
        testStats.averageProcessingTime - control.averageProcessingTime,
      );
      const tokenUsageDiff = Math.abs(testStats.averageTokenUsage - control.averageTokenUsage);
      const confidenceDiff = Math.abs(testStats.averageConfidence - control.averageConfidence);

      significance[groupId] =
        (successRateDiff + processingTimeDiff + tokenUsageDiff + confidenceDiff) / 4;
    });

    // Determine recommendation
    let recommendation: 'control' | 'test' | 'inconclusive' = 'inconclusive';
    let maxConfidence = 0;
    let bestGroupId = '';

    testGroups.forEach(([groupId, testStats]) => {
      const meetsCriteria =
        testStats.successRate >= test.successCriteria.minSuccessRate &&
        testStats.averageProcessingTime <= test.successCriteria.maxProcessingTime &&
        testStats.averageTokenUsage <=
          control.averageTokenUsage * (1 / test.successCriteria.minTokenEfficiency) &&
        testStats.averageConfidence >= test.successCriteria.minConfidence;

      if (meetsCriteria && significance[groupId] > maxConfidence) {
        recommendation = 'test';
        maxConfidence = significance[groupId];
        bestGroupId = groupId;
      }
    });

    // Check if control is better
    const controlMeetsCriteria =
      control.successRate >= test.successCriteria.minSuccessRate &&
      control.averageProcessingTime <= test.successCriteria.maxProcessingTime &&
      control.averageConfidence >= test.successCriteria.minConfidence;

    if (controlMeetsCriteria && maxConfidence < 0.1) {
      recommendation = 'control';
      maxConfidence = 0.8;
    }

    const reasoning = this.generateReasoning(
      test,
      control,
      testGroups,
      recommendation,
      bestGroupId,
    );

    return {
      control,
      test: Object.fromEntries(testGroups),
      significance,
      recommendation,
      confidence: maxConfidence,
      reasoning,
    };
  }

  /**
   * Generate reasoning for recommendation
   */
  private generateReasoning(
    test: TestConfig,
    control: TestStatistics,
    testGroups: Array<[string, TestStatistics]>,
    recommendation: 'control' | 'test' | 'inconclusive',
    bestGroupId: string,
  ): string {
    if (recommendation === 'control') {
      return `Control group outperforms test groups with ${Math.round(control.successRate * 100)}% success rate and ${control.averageProcessingTime}s average processing time. Test groups did not meet success criteria.`;
    }

    if (recommendation === 'test') {
      const bestGroup = testGroups.find(([groupId]) => groupId === bestGroupId)?.[1];
      if (!bestGroup) return 'Unable to determine best test group';

      return `Test group '${bestGroupId}' shows superior performance with ${Math.round(bestGroup.successRate * 100)}% success rate vs ${Math.round(control.successRate * 100)}% for control. Processing time: ${bestGroup.averageProcessingTime}s vs ${control.averageProcessingTime}s for control. Meets all success criteria.`;
    }

    return 'Results are inconclusive. Neither control nor test groups show statistically significant improvement while meeting all success criteria.';
  }

  /**
   * Get test status and statistics
   */
  public getTestStatus(testId: string): {
    config: TestConfig;
    statistics: Record<string, TestStatistics>;
    progress: number;
  } | null {
    const test = this.activeTests.get(testId);
    if (!test) {
      return null;
    }

    const statistics = this.testStatistics.get(testId) || {};
    const totalRequests = Object.values(statistics).reduce(
      (sum, stats) => sum + stats.totalRequests,
      0,
    );
    const progress = Math.min(100, (totalRequests / test.sampleSize) * 100);

    return {
      config: test,
      statistics,
      progress,
    };
  }

  /**
   * Get all active tests
   */
  public getAllTests(): Array<{ id: string; config: TestConfig; status: string }> {
    return Array.from(this.activeTests.entries()).map(([id, config]) => ({
      id,
      config,
      status: config.status,
    }));
  }

  /**
   * Export test results
   */
  public exportResults(testId: string): {
    config: TestConfig;
    results: TestResult[];
    statistics: Record<string, TestStatistics>;
    comparison?: ABTestComparison;
  } | null {
    const test = this.activeTests.get(testId);
    if (!test) {
      return null;
    }

    const results = this.testResults.get(testId) || [];
    const statistics = this.testStatistics.get(testId) || {};
    let comparison: ABTestComparison | undefined;

    if (test.status === 'completed') {
      comparison = this.generateComparison(testId);
    }

    return {
      config: test,
      results,
      statistics,
      comparison,
    };
  }
}

/**
 * Singleton instance for global use
 */
export const abTesting = new ABTestingFramework();
