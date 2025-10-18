/**
 * Deployment Manager for Prompt Optimization v2.0
 * Handles phased rollout with shadow mode, gradual traffic increase, and monitoring
 */

import { adaptiveRouting, RoutingResult } from './adaptive-routing';
import { monitoringDashboard } from './monitoring-dashboard';
import { abTesting } from './ab-testing';

export interface DeploymentConfig {
  phase: 'shadow' | 'gradual' | 'full';
  trafficPercentage: number;
  enableABTesting: boolean;
  monitoringLevel: 'basic' | 'detailed' | 'comprehensive';
  fallbackToLegacy: boolean;
}

export interface DeploymentMetrics {
  phase: string;
  trafficPercentage: number;
  totalRequests: number;
  v2Requests: number;
  legacyRequests: number;
  v2SuccessRate: number;
  legacySuccessRate: number;
  performanceImprovement: number;
  errorRate: number;
  timestamp: Date;
}

export interface DeploymentStatus {
  currentPhase: DeploymentConfig['phase'];
  isHealthy: boolean;
  uptime: number;
  lastHealthCheck: Date;
  issues: string[];
  recommendations: string[];
}

class DeploymentManager {
  private config: DeploymentConfig;
  private startTime: Date;
  private metrics: DeploymentMetrics[] = [];
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(initialConfig: Partial<DeploymentConfig> = {}) {
    this.config = {
      phase: 'shadow',
      trafficPercentage: 10,
      enableABTesting: true,
      monitoringLevel: 'comprehensive',
      fallbackToLegacy: true,
      ...initialConfig,
    };
    this.startTime = new Date();
  }

  /**
   * Initialize deployment with health checks and monitoring
   */
  async initialize(): Promise<void> {
    console.log(`🚀 Initializing Prompt Optimization v2.0 Deployment`);
    console.log(`📊 Phase: ${this.config.phase}, Traffic: ${this.config.trafficPercentage}%`);

    // Start health monitoring
    this.startHealthChecks();

    // Initialize monitoring dashboard
    await monitoringDashboard.initialize();

    // Validate system health
    const healthCheck = await this.performHealthCheck();
    if (!healthCheck.isHealthy) {
      throw new Error(`System health check failed: ${healthCheck.issues.join(', ')}`);
    }

    console.log(`✅ Deployment initialized successfully`);
    console.log(`🔍 Health monitoring active`);
    console.log(`📈 Metrics collection started`);
  }

  /**
   * Process request with intelligent routing based on deployment phase
   */
  async processRequest(userPrompt: string): Promise<{
    output: string;
    usedV2: boolean;
    template: string;
    processingTime: number;
    success: boolean;
    metrics: any;
  }> {
    const startTime = Date.now();
    const shouldUseV2 = this.shouldRouteToV2();

    try {
      if (shouldUseV2) {
        // Use v2.0 system
        const routing = await adaptiveRouting.selectTemplate(userPrompt);
        const result = await this.applyTemplateWithFallback(routing.template, userPrompt);

        const processingTime = Date.now() - startTime;

        // Record metrics
        await this.recordMetrics(
          {
            phase: this.config.phase,
            trafficPercentage: this.config.trafficPercentage,
            totalRequests: 1,
            v2Requests: 1,
            legacyRequests: 0,
            v2SuccessRate: result.success ? 1 : 0,
            legacySuccessRate: 0,
            performanceImprovement: 0, // Calculated in aggregate
            errorRate: result.success ? 0 : 1,
            timestamp: new Date(),
          },
          routing.template,
          result.success,
          processingTime,
        );

        return {
          output: result.output,
          usedV2: true,
          template: routing.template,
          processingTime,
          success: result.success,
          metrics: result.metrics,
        };
      } else {
        // Use legacy system for comparison
        const result = await this.processWithLegacySystem(userPrompt);
        const processingTime = Date.now() - startTime;

        // Record legacy metrics
        await this.recordMetrics(
          {
            phase: this.config.phase,
            trafficPercentage: this.config.trafficPercentage,
            totalRequests: 1,
            v2Requests: 0,
            legacyRequests: 1,
            v2SuccessRate: 0,
            legacySuccessRate: result.success ? 1 : 0,
            performanceImprovement: 0,
            errorRate: result.success ? 0 : 1,
            timestamp: new Date(),
          },
          'legacy',
          result.success,
          processingTime,
        );

        return {
          output: result.output,
          usedV2: false,
          template: 'legacy',
          processingTime,
          success: result.success,
          metrics: result.metrics,
        };
      }
    } catch (error) {
      console.error(`❌ Request processing failed:`, error);

      // Fallback to legacy if configured
      if (this.config.fallbackToLegacy && shouldUseV2) {
        console.log(`🔄 Falling back to legacy system due to error`);
        return this.processRequest(userPrompt); // Recurse with legacy routing
      }

      throw error;
    }
  }

  /**
   * Determine if request should route to v2.0 based on traffic percentage
   */
  private shouldRouteToV2(): boolean {
    if (this.config.phase === 'full') return true;
    if (this.config.phase === 'shadow') {
      return Math.random() * 100 < this.config.trafficPercentage;
    }
    return Math.random() * 100 < this.config.trafficPercentage;
  }

  /**
   * Apply template with comprehensive fallback handling
   */
  private async applyTemplateWithFallback(
    template: string,
    input: string,
    fallbackHistory: string[] = [],
  ): Promise<{
    output: string;
    success: boolean;
    metrics: any;
  }> {
    try {
      // Apply template using the optimized template system
      const output = await this.applyTemplate(template, input);

      // Validate output quality
      const isValid = this.validateOutput(output);

      if (isValid) {
        return {
          output,
          success: true,
          metrics: {
            template,
            tokenUsage: this.estimateTokens(output),
            processingTime: Date.now(),
            fallbackDepth: 0,
          },
        };
      } else {
        throw new Error('Output validation failed');
      }
    } catch (error) {
      console.warn(`⚠️ Template ${template} failed, attempting fallback`);

      // Implement fallback chain
      const fallbackChain = this.getFallbackChain(template);

      for (const fallbackTemplate of fallbackChain) {
        if (fallbackHistory.includes(fallbackTemplate)) {
          continue; // Skip already tried templates
        }

        try {
          const result = await this.applyTemplateWithFallback(fallbackTemplate, input, [
            ...fallbackHistory,
            template,
          ]);

          if (result.success) {
            result.metrics.fallbackDepth = fallbackHistory.length + 1;
            return result;
          }
        } catch (fallbackError) {
          console.warn(`⚠️ Fallback template ${fallbackTemplate} also failed`);
          continue;
        }
      }

      // All fallbacks exhausted, try base template as last resort
      if (template !== 'T1-BASE' && !fallbackHistory.includes('T1-BASE')) {
        return this.applyTemplateWithFallback('T1-BASE', input, [...fallbackHistory, template]);
      }

      throw new Error(`All template fallbacks exhausted for input: ${input.substring(0, 100)}...`);
    }
  }

  /**
   * Get fallback chain for a template
   */
  private getFallbackChain(template: string): string[] {
    const fallbackChains: Record<string, string[]> = {
      'T5-COMPLEX': ['T2-FOCUSED', 'T1-BASE'],
      'T7-TECHNICAL': ['T2-FOCUSED', 'T1-BASE'],
      'T8-CREATIVE': ['T2-CONTEXT', 'T1-BASE'],
      'T9-DATA': ['T2-FOCUSED', 'T1-BASE'],
      'T10-DEBUG': ['T2-FOCUSED', 'T1-BASE'],
      'T11-ANALYSIS': ['T2-CONTEXT', 'T1-BASE'],
      'T3-CONSTRAINTS': ['T2-FOCUSED', 'T1-BASE'],
      'T3-EXAMPLES': ['T2-CONTEXT', 'T1-BASE'],
      'T4-EDGE': ['T3-CONSTRAINTS', 'T2-FOCUSED', 'T1-BASE'],
      'T4-VALIDATION': ['T3-EXAMPLES', 'T2-CONTEXT', 'T1-BASE'],
      'T2-FOCUSED': ['T1-BASE'],
      'T2-CONTEXT': ['T1-BASE'],
      'T6-SIMPLE': ['T1-BASE'],
    };

    return fallbackChains[template] || ['T1-BASE'];
  }

  /**
   * Apply template to input (simplified implementation)
   */
  private async applyTemplate(template: string, input: string): Promise<string> {
    // This would integrate with the actual template system
    // For now, return a mock implementation
    const templates: Record<string, string> = {
      'T1-BASE': `Optimized prompt for: ${input}`,
      'T2-FOCUSED': `Focused optimization for specific aspect: ${input}`,
      'T2-CONTEXT': `Context-aware optimization: ${input}`,
      'T3-CONSTRAINTS': `Constraint-driven optimization: ${input}`,
      'T3-EXAMPLES': `Example-based optimization: ${input}`,
      'T4-EDGE': `Edge case handling for: ${input}`,
      'T4-VALIDATION': `Validation-focused optimization: ${input}`,
      'T5-COMPLEX': `Complex query optimization: ${input}`,
      'T6-SIMPLE': `Simple query optimization: ${input}`,
      'T7-TECHNICAL': `Technical optimization: ${input}`,
      'T8-CREATIVE': `Creative optimization: ${input}`,
      'T9-DATA': `Data optimization: ${input}`,
      'T10-DEBUG': `Debug optimization: ${input}`,
      'T11-ANALYSIS': `Analysis optimization: ${input}`,
    };

    return templates[template] || `Default optimization: ${input}`;
  }

  /**
   * Validate output quality
   */
  private validateOutput(output: string): boolean {
    // Basic validation checks
    if (!output || output.length < 10) return false;
    if (output.length > 10000) return false; // Too long
    if (output.includes('error') || output.includes('failed')) return false;

    return true;
  }

  /**
   * Process with legacy system (for comparison)
   */
  private async processWithLegacySystem(userPrompt: string): Promise<{
    output: string;
    success: boolean;
    metrics: any;
  }> {
    // Mock legacy system processing
    const output = `Legacy system processing: ${userPrompt}`;
    const success = Math.random() > 0.25; // 75% success rate (current baseline)

    return {
      output,
      success,
      metrics: {
        system: 'legacy',
        tokenUsage: this.estimateTokens(output),
        processingTime: Date.now(),
      },
    };
  }

  /**
   * Estimate token usage (rough approximation)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Record deployment metrics
   */
  private async recordMetrics(
    metrics: DeploymentMetrics,
    template: string,
    success: boolean,
    processingTime: number,
  ): Promise<void> {
    // Store in metrics array
    this.metrics.push(metrics);

    // Send to monitoring dashboard
    await monitoringDashboard.recordRequest(
      template,
      metrics.phase,
      success,
      processingTime,
      metrics.v2Requests > 0
        ? this.estimateTokens('v2-output')
        : this.estimateTokens('legacy-output'),
    );

    // Update adaptive routing learning
    if (template !== 'legacy') {
      adaptiveRouting.recordPerformance(template as any, success);
    }
  }

  /**
   * Start automated health checks
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      const health = await this.performHealthCheck();
      if (!health.isHealthy) {
        console.error(`🚨 Health check failed:`, health.issues);
        // Could trigger alerts or automatic rollback here
      }
    }, 60000); // Check every minute
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<DeploymentStatus> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check system uptime
    const uptime = Date.now() - this.startTime.getTime();
    const uptimeMinutes = Math.floor(uptime / (1000 * 60));

    // Check error rates
    const recentMetrics = this.metrics.slice(-100); // Last 100 requests
    const errorRate =
      recentMetrics.length > 0
        ? recentMetrics.reduce((sum, m) => sum + m.errorRate, 0) / recentMetrics.length
        : 0;

    if (errorRate > 0.1) {
      issues.push(`High error rate: ${(errorRate * 100).toFixed(1)}%`);
      recommendations.push(
        'Consider reducing traffic percentage or investigating template failures',
      );
    }

    // Check v2.0 success rate
    const v2Metrics = recentMetrics.filter((m) => m.v2Requests > 0);
    const v2SuccessRate =
      v2Metrics.length > 0
        ? v2Metrics.reduce((sum, m) => sum + m.v2SuccessRate, 0) / v2Metrics.length
        : 0;

    if (v2SuccessRate < 0.9 && v2Metrics.length > 10) {
      issues.push(`Low v2.0 success rate: ${(v2SuccessRate * 100).toFixed(1)}%`);
      recommendations.push('Review template configurations and fallback mechanisms');
    }

    // Check if system is stable enough for next phase
    if (this.config.phase === 'shadow' && v2Metrics.length > 50) {
      if (v2SuccessRate >= 0.95 && errorRate < 0.05) {
        recommendations.push('System ready for Phase 2: Gradual rollout (50% traffic)');
      }
    }

    return {
      currentPhase: this.config.phase,
      isHealthy: issues.length === 0,
      uptime,
      lastHealthCheck: new Date(),
      issues,
      recommendations,
    };
  }

  /**
   * Transition to next deployment phase
   */
  async transitionToPhase(
    phase: DeploymentConfig['phase'],
    trafficPercentage?: number,
  ): Promise<void> {
    console.log(`🔄 Transitioning to ${phase} phase`);

    this.config.phase = phase;
    if (trafficPercentage !== undefined) {
      this.config.trafficPercentage = trafficPercentage;
    }

    // Perform health check before transition
    const health = await this.performHealthCheck();
    if (!health.isHealthy) {
      throw new Error(`Cannot transition to ${phase}: System health issues detected`);
    }

    console.log(`✅ Successfully transitioned to ${phase} phase`);
    console.log(`📊 Traffic percentage: ${this.config.trafficPercentage}%`);
  }

  /**
   * Get current deployment status
   */
  async getStatus(): Promise<
    DeploymentStatus & { config: DeploymentConfig; metrics: DeploymentMetrics[] }
  > {
    const health = await this.performHealthCheck();
    return {
      ...health,
      config: this.config,
      metrics: this.metrics,
    };
  }

  /**
   * Generate deployment report
   */
  generateReport(): {
    summary: any;
    performance: any;
    recommendations: string[];
  } {
    const totalRequests = this.metrics.reduce((sum, m) => sum + m.totalRequests, 0);
    const v2Requests = this.metrics.reduce((sum, m) => sum + m.v2Requests, 0);
    const legacyRequests = this.metrics.reduce((sum, m) => sum + m.legacyRequests, 0);

    const avgV2Success =
      this.metrics.filter((m) => m.v2Requests > 0).reduce((sum, m) => sum + m.v2SuccessRate, 0) /
      Math.max(1, this.metrics.filter((m) => m.v2Requests > 0).length);

    const avgLegacySuccess =
      this.metrics
        .filter((m) => m.legacyRequests > 0)
        .reduce((sum, m) => sum + m.legacySuccessRate, 0) /
      Math.max(1, this.metrics.filter((m) => m.legacyRequests > 0).length);

    return {
      summary: {
        phase: this.config.phase,
        trafficPercentage: this.config.trafficPercentage,
        uptime: Date.now() - this.startTime.getTime(),
        totalRequests,
        v2Requests,
        legacyRequests,
        v2AdoptionRate: totalRequests > 0 ? (v2Requests / totalRequests) * 100 : 0,
      },
      performance: {
        v2SuccessRate: avgV2Success * 100,
        legacySuccessRate: avgLegacySuccess * 100,
        improvement:
          avgV2Success > 0 ? ((avgV2Success - avgLegacySuccess) / avgLegacySuccess) * 100 : 0,
      },
      recommendations: this.generateRecommendations(avgV2Success, avgLegacySuccess),
    };
  }

  /**
   * Generate deployment recommendations
   */
  private generateRecommendations(v2Success: number, legacySuccess: number): string[] {
    const recommendations: string[] = [];

    if (v2Success > 0.95 && this.config.phase === 'shadow') {
      recommendations.push('✅ Ready for Phase 2: Increase traffic to 50%');
    }

    if (v2Success > 0.9 && this.config.phase === 'gradual') {
      recommendations.push('✅ Ready for Phase 3: Full migration');
    }

    if (v2Success < legacySuccess) {
      recommendations.push('⚠️ v2.0 underperforming: Investigate template configurations');
    }

    if (this.metrics.length > 1000) {
      recommendations.push('📊 Sufficient data collected: Consider finalizing deployment');
    }

    return recommendations;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    await monitoringDashboard.cleanup();
    console.log('🧹 Deployment manager cleaned up');
  }
}

export const deploymentManager = new DeploymentManager();
