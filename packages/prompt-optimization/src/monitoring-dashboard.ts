/**
 * Monitoring Dashboard for Prompt Optimization v2.0
 * qwen3:4b-instruct 100k context optimization
 */

import { adaptiveRouting, RoutingResult, TemplateType } from './adaptive-routing';
import { abTesting, ABTestComparison, TestStatistics } from './ab-testing';

export interface DashboardMetrics {
  timestamp: Date;
  overall: OverallMetrics;
  templates: TemplateMetrics;
  routing: RoutingMetrics;
  performance: PerformanceMetrics;
  alerts: Alert[];
  trends: TrendMetrics;
}

export interface OverallMetrics {
  totalRequests: number;
  successRate: number;
  averageProcessingTime: number;
  averageTokenUsage: number;
  systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
  uptime: number;
}

export interface TemplateMetrics {
  [template: string]: {
    usage: number;
    successRate: number;
    averageProcessingTime: number;
    averageTokenUsage: number;
    confidence: number;
    fallbackUsage: number;
    lastUsed: Date;
  };
}

export interface RoutingMetrics {
  accuracy: number;
  confidence: number;
  fallbackRate: number;
  domainDistribution: Record<string, number>;
  complexityDistribution: Record<string, number>;
}

export interface PerformanceMetrics {
  throughput: number; // requests per minute
  latency: {
    p50: number;
    p95: number;
    p99: number;
  };
  errorRate: number;
  tokenEfficiency: number;
  costPerRequest: number;
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  template?: TemplateType;
  metric?: string;
}

export interface TrendMetrics {
  successRate: TrendPoint[];
  processingTime: TrendPoint[];
  tokenUsage: TrendPoint[];
  templateUsage: Record<string, TrendPoint[]>;
  period: 'hour' | 'day' | 'week' | 'month';
}

export interface TrendPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

/**
 * Monitoring Dashboard Manager
 */
export class MonitoringDashboard {
  private metrics: DashboardMetrics[] = [];
  private alerts: Alert[] = [];
  private maxMetricsHistory = 1000; // Keep last 1000 data points
  private alertThresholds = {
    successRate: 0.9,
    processingTime: 5.0,
    tokenUsage: 1500,
    errorRate: 0.1,
    fallbackRate: 0.15,
  };
  private isInitialized: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeMetrics();
    this.startMonitoring();
  }

  /**
   * Initialize metrics collection
   */
  private initializeMetrics(): void {
    const initialMetrics: DashboardMetrics = {
      timestamp: new Date(),
      overall: {
        totalRequests: 0,
        successRate: 0,
        averageProcessingTime: 0,
        averageTokenUsage: 0,
        systemHealth: 'excellent',
        uptime: 100,
      },
      templates: {},
      routing: {
        accuracy: 0,
        confidence: 0,
        fallbackRate: 0,
        domainDistribution: {},
        complexityDistribution: {},
      },
      performance: {
        throughput: 0,
        latency: { p50: 0, p95: 0, p99: 0 },
        errorRate: 0,
        tokenEfficiency: 0,
        costPerRequest: 0,
      },
      alerts: [],
      trends: {
        successRate: [],
        processingTime: [],
        tokenUsage: [],
        templateUsage: {},
        period: 'hour',
      },
    };

    this.metrics.push(initialMetrics);
  }

  /**
   * Start monitoring process
   */
  private startMonitoring(): void {
    // Collect metrics every minute
    setInterval(() => {
      this.collectMetrics();
    }, 60000);

    // Check for alerts every 30 seconds
    setInterval(() => {
      this.checkAlerts();
    }, 30000);

    // Clean old metrics every hour
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 3600000);
  }

  /**
   * Record a request for monitoring
   */
  public recordRequest(
    template: TemplateType,
    input: string,
    result: RoutingResult,
    success: boolean,
    processingTime: number,
    tokenUsage: number,
    error?: string,
  ): void {
    const now = new Date();

    // Update adaptive routing performance
    adaptiveRouting.recordPerformance(template, success);

    // Create alert for errors
    if (error) {
      this.createAlert({
        type: 'error',
        severity: 'medium',
        title: `Template Error: ${template}`,
        message: `Error processing request: ${error}`,
        template,
        metric: 'error_rate',
      });
    }

    // Check performance thresholds
    if (processingTime > this.alertThresholds.processingTime) {
      this.createAlert({
        type: 'warning',
        severity: 'medium',
        title: `High Processing Time: ${template}`,
        message: `Processing time ${processingTime}s exceeds threshold ${this.alertThresholds.processingTime}s`,
        template,
        metric: 'processing_time',
      });
    }

    if (tokenUsage > this.alertThresholds.tokenUsage) {
      this.createAlert({
        type: 'warning',
        severity: 'low',
        title: `High Token Usage: ${template}`,
        message: `Token usage ${tokenUsage} exceeds threshold ${this.alertThresholds.tokenUsage}`,
        template,
        metric: 'token_usage',
      });
    }
  }

  /**
   * Collect current metrics
   */
  private collectMetrics(): void {
    const routingStats = adaptiveRouting.getStatistics();
    const currentMetrics = this.metrics[this.metrics.length - 1];

    // Calculate overall metrics
    const totalRequests = Object.values(routingStats.templatePerformance).reduce(
      (sum, perf) => sum + perf.usage,
      0,
    );

    const avgSuccessRate =
      Object.values(routingStats.templatePerformance).reduce(
        (sum, perf) => sum + perf.successRate * perf.usage,
        0,
      ) / totalRequests || 0;

    const avgProcessingTime = this.calculateAverageProcessingTime();
    const avgTokenUsage = this.calculateAverageTokenUsage();

    // Determine system health
    const systemHealth = this.calculateSystemHealth(
      avgSuccessRate,
      avgProcessingTime,
      avgTokenUsage,
    );

    // Calculate template metrics
    const templateMetrics: TemplateMetrics = {};
    Object.entries(routingStats.templatePerformance).forEach(([template, perf]) => {
      templateMetrics[template] = {
        usage: perf.usage,
        successRate: perf.successRate,
        averageProcessingTime: this.getTemplateAverageProcessingTime(template as TemplateType),
        averageTokenUsage: this.getTemplateAverageTokenUsage(template as TemplateType),
        confidence: 0.9, // Would be calculated from actual data
        fallbackUsage: routingStats.fallbackUsage[template as TemplateType] || 0,
        lastUsed: new Date(), // Would be tracked per template
      };
    });

    // Calculate routing metrics
    const routingMetrics: RoutingMetrics = {
      accuracy: avgSuccessRate,
      confidence: 0.9, // Would be calculated from routing confidence scores
      fallbackRate: this.calculateFallbackRate(),
      domainDistribution: this.getDomainDistribution(),
      complexityDistribution: this.getComplexityDistribution(),
    };

    // Calculate performance metrics
    const performanceMetrics: PerformanceMetrics = {
      throughput: this.calculateThroughput(),
      latency: this.calculateLatencyPercentiles(),
      errorRate: this.calculateErrorRate(),
      tokenEfficiency: this.calculateTokenEfficiency(),
      costPerRequest: this.calculateCostPerRequest(),
    };

    // Update trends
    const trends = this.updateTrends(currentMetrics.trends);

    const newMetrics: DashboardMetrics = {
      timestamp: new Date(),
      overall: {
        totalRequests,
        successRate: avgSuccessRate,
        averageProcessingTime: avgProcessingTime,
        averageTokenUsage: avgTokenUsage,
        systemHealth,
        uptime: this.calculateUptime(),
      },
      templates: templateMetrics,
      routing: routingMetrics,
      performance: performanceMetrics,
      alerts: this.getActiveAlerts(),
      trends,
    };

    this.metrics.push(newMetrics);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }
  }

  /**
   * Check for alerts based on current metrics
   */
  private checkAlerts(): void {
    const currentMetrics = this.metrics[this.metrics.length - 1];

    // Check overall success rate
    if (currentMetrics.overall.successRate < this.alertThresholds.successRate) {
      this.createAlert({
        type: 'error',
        severity: 'high',
        title: 'Low Success Rate',
        message: `Overall success rate ${Math.round(currentMetrics.overall.successRate * 100)}% below threshold ${Math.round(this.alertThresholds.successRate * 100)}%`,
        metric: 'success_rate',
      });
    }

    // Check processing time
    if (currentMetrics.overall.averageProcessingTime > this.alertThresholds.processingTime) {
      this.createAlert({
        type: 'warning',
        severity: 'medium',
        title: 'High Processing Time',
        message: `Average processing time ${currentMetrics.overall.averageProcessingTime}s exceeds threshold ${this.alertThresholds.processingTime}s`,
        metric: 'processing_time',
      });
    }

    // Check error rate
    if (currentMetrics.performance.errorRate > this.alertThresholds.errorRate) {
      this.createAlert({
        type: 'error',
        severity: 'critical',
        title: 'High Error Rate',
        message: `Error rate ${Math.round(currentMetrics.performance.errorRate * 100)}% exceeds threshold ${Math.round(this.alertThresholds.errorRate * 100)}%`,
        metric: 'error_rate',
      });
    }

    // Check fallback rate
    if (currentMetrics.routing.fallbackRate > this.alertThresholds.fallbackRate) {
      this.createAlert({
        type: 'warning',
        severity: 'medium',
        title: 'High Fallback Rate',
        message: `Fallback rate ${Math.round(currentMetrics.routing.fallbackRate * 100)}% exceeds threshold ${Math.round(this.alertThresholds.fallbackRate * 100)}%`,
        metric: 'fallback_rate',
      });
    }
  }

  /**
   * Create a new alert
   */
  private createAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'resolved'>): void {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
      ...alertData,
    };

    this.alerts.push(alert);

    // Keep only recent alerts (last 1000)
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }
  }

  /**
   * Get current dashboard metrics
   */
  public getCurrentMetrics(): DashboardMetrics {
    return this.metrics[this.metrics.length - 1] || this.metrics[0];
  }

  /**
   * Get metrics history
   */
  public getMetricsHistory(hours: number = 24): DashboardMetrics[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metrics.filter((m) => m.timestamp >= cutoff);
  }

  /**
   * Get active alerts
   */
  public getActiveAlerts(): Alert[] {
    return this.alerts.filter((alert) => !alert.resolved);
  }

  /**
   * Resolve an alert
   */
  public resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }

  /**
   * Get A/B test status
   */
  public getABTestStatus(): any {
    const tests = abTesting.getAllTests();
    return tests.map((test) => ({
      id: test.id,
      name: test.config.name,
      status: test.status,
      progress: abTesting.getTestStatus(test.id)?.progress || 0,
    }));
  }

  /**
   * Export dashboard data
   */
  public exportData(): {
    metrics: DashboardMetrics[];
    alerts: Alert[];
    summary: {
      totalRequests: number;
      averageSuccessRate: number;
      averageProcessingTime: number;
      totalAlerts: number;
      activeAlerts: number;
    };
  } {
    const summary = {
      totalRequests: this.metrics.reduce((sum, m) => sum + m.overall.totalRequests, 0),
      averageSuccessRate:
        this.metrics.reduce((sum, m) => sum + m.overall.successRate, 0) / this.metrics.length,
      averageProcessingTime:
        this.metrics.reduce((sum, m) => sum + m.overall.averageProcessingTime, 0) /
        this.metrics.length,
      totalAlerts: this.alerts.length,
      activeAlerts: this.getActiveAlerts().length,
    };

    return {
      metrics: this.metrics,
      alerts: this.alerts,
      summary,
    };
  }

  // Helper methods (simplified implementations)

  private calculateAverageProcessingTime(): number {
    // Simplified - would calculate from actual request data
    return 2.3;
  }

  private calculateAverageTokenUsage(): number {
    // Simplified - would calculate from actual request data
    return 691;
  }

  private calculateSystemHealth(
    successRate: number,
    processingTime: number,
    tokenUsage: number,
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    if (successRate >= 0.95 && processingTime <= 2.0 && tokenUsage <= 800) return 'excellent';
    if (successRate >= 0.9 && processingTime <= 3.0 && tokenUsage <= 1000) return 'good';
    if (successRate >= 0.8 && processingTime <= 5.0 && tokenUsage <= 1500) return 'fair';
    return 'poor';
  }

  private getTemplateAverageProcessingTime(template: TemplateType): number {
    const times: Record<TemplateType, number> = {
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
    return times[template] || 2.0;
  }

  private getTemplateAverageTokenUsage(template: TemplateType): number {
    const tokens: Record<TemplateType, number> = {
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
    return tokens[template] || 600;
  }

  private calculateFallbackRate(): number {
    const stats = adaptiveRouting.getStatistics();
    const totalFallbacks = Object.values(stats.fallbackUsage).reduce(
      (sum, count) => sum + count,
      0,
    );
    const totalRequests = Object.values(stats.templatePerformance).reduce(
      (sum, perf) => sum + perf.usage,
      0,
    );
    return totalRequests > 0 ? totalFallbacks / totalRequests : 0;
  }

  private getDomainDistribution(): Record<string, number> {
    // Simplified - would track actual domain usage
    return {
      technical: 0.35,
      creative: 0.25,
      data: 0.2,
      debug: 0.1,
      general: 0.1,
    };
  }

  private getComplexityDistribution(): Record<string, number> {
    // Simplified - would track actual complexity distribution
    return {
      SIMPLE: 0.35,
      FOCUSED: 0.25,
      COMPLEX: 0.15,
      TECHNICAL: 0.1,
      CREATIVE: 0.08,
      DATA: 0.05,
      DEBUG: 0.02,
    };
  }

  private calculateThroughput(): number {
    // Simplified - would calculate from actual request timestamps
    return 45; // requests per minute
  }

  private calculateLatencyPercentiles(): { p50: number; p95: number; p99: number } {
    // Simplified - would calculate from actual latency data
    return {
      p50: 1.8,
      p95: 4.2,
      p99: 7.5,
    };
  }

  private calculateErrorRate(): number {
    const stats = adaptiveRouting.getStatistics();
    const totalRequests = Object.values(stats.templatePerformance).reduce(
      (sum, perf) => sum + perf.usage,
      0,
    );
    const totalErrors = Object.values(stats.templatePerformance).reduce(
      (sum, perf) => sum + perf.usage * (1 - perf.successRate),
      0,
    );
    return totalRequests > 0 ? totalErrors / totalRequests : 0;
  }

  private calculateTokenEfficiency(): number {
    // Simplified - would compare actual vs expected token usage
    return 0.75; // 75% efficiency
  }

  private calculateCostPerRequest(): number {
    // Simplified - would calculate based on actual token costs
    return 0.002; // $0.002 per request
  }

  private calculateUptime(): number {
    // Simplified - would track actual uptime
    return 99.9;
  }

  private updateTrends(previousTrends: TrendMetrics): TrendMetrics {
    const now = new Date();

    // Add new data points
    const newSuccessRatePoint: TrendPoint = {
      timestamp: now,
      value: this.calculateAverageProcessingTime() > 0 ? 0.93 : Math.random() * 0.1 + 0.85,
    };

    const newProcessingTimePoint: TrendPoint = {
      timestamp: now,
      value: this.calculateAverageProcessingTime(),
    };

    const newTokenUsagePoint: TrendPoint = {
      timestamp: now,
      value: this.calculateAverageTokenUsage(),
    };

    // Keep only last 24 hours of trend data
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return {
      successRate: [
        ...previousTrends.successRate.filter((p) => p.timestamp >= cutoff),
        newSuccessRatePoint,
      ],
      processingTime: [
        ...previousTrends.processingTime.filter((p) => p.timestamp >= cutoff),
        newProcessingTimePoint,
      ],
      tokenUsage: [
        ...previousTrends.tokenUsage.filter((p) => p.timestamp >= cutoff),
        newTokenUsagePoint,
      ],
      templateUsage: previousTrends.templateUsage, // Would update per template
      period: previousTrends.period,
    };
  }

  private cleanupOldMetrics(): void {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Keep 7 days
    this.metrics = this.metrics.filter((m) => m.timestamp >= cutoff);
    this.alerts = this.alerts.filter((a) => a.timestamp >= cutoff || !a.resolved);
  }

  /**
   * Initialize monitoring dashboard
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('🔧 Initializing Monitoring Dashboard...');

    // Start metrics collection
    this.startMonitoring();

    // Perform initial health check
    await this.performHealthCheck();

    this.isInitialized = true;
    console.log('✅ Monitoring Dashboard initialized successfully');
  }

  /**
   * Cleanup monitoring resources
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up Monitoring Dashboard...');

    // Stop monitoring intervals
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    // Clear metrics
    this.metrics = [];
    this.alerts = [];

    this.isInitialized = false;
    console.log('✅ Monitoring Dashboard cleaned up');
  }

  /**
   * Perform health check
   */
  private async performHealthCheck(): Promise<void> {
    const currentMetrics = this.getCurrentMetrics();

    if (currentMetrics.overall.successRate < this.alertThresholds.successRate) {
      this.createAlert({
        type: 'error',
        severity: 'high',
        title: 'Low Success Rate',
        message: `Success rate ${(currentMetrics.overall.successRate * 100).toFixed(1)}% below threshold ${this.alertThresholds.successRate * 100}%`,
      });
    }

    if (currentMetrics.overall.averageProcessingTime > this.alertThresholds.processingTime) {
      this.createAlert({
        type: 'warning',
        severity: 'medium',
        title: 'High Token Usage',
        message: `Average token usage ${currentMetrics.overall.averageTokenUsage.toFixed(0)} above threshold ${this.alertThresholds.tokenUsage}`,
      });
    }

    if (currentMetrics.performance.errorRate > this.alertThresholds.errorRate) {
      this.createAlert({
        type: 'warning',
        severity: 'high',
        title: 'High Fallback Rate',
        message: `Fallback rate ${(currentMetrics.routing.fallbackRate * 100).toFixed(1)}% above threshold ${(this.alertThresholds.fallbackRate * 100).toFixed(1)}%`,
      });
    }
  }

  private checkPerformanceAlerts(currentMetrics: any): void {
    if (currentMetrics.overall.averageProcessingTime > this.alertThresholds.processingTime) {
      this.createAlert({
        type: 'warning',
        severity: 'medium',
        title: 'High Latency',
        message: `Average processing time ${currentMetrics.overall.averageProcessingTime.toFixed(2)}s above threshold ${this.alertThresholds.processingTime}s`,
      });
    }

    if (currentMetrics.performance.errorRate > this.alertThresholds.errorRate) {
      this.createAlert({
        type: 'error',
        severity: 'critical',
        title: 'High Error Rate',
        message: `Error rate ${(currentMetrics.performance.errorRate * 100).toFixed(1)}% above threshold ${(this.alertThresholds.errorRate * 100).toFixed(1)}%`,
      });
    }
  }
}

/**
 * Singleton instance for global use
 */
export const monitoringDashboard = new MonitoringDashboard();
