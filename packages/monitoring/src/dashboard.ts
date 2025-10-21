/**
 * Real-time Monitoring Dashboard
 * Provides real-time visualization and monitoring capabilities
 */

import type {
  PerformanceMetric,
  PerformanceTrend,
  AlertEvent,
  AlertRule,
  HealthCheck,
  MonitoringConfig,
} from './types.js';
import { getPerformanceDataStorage, type PerformanceDataStorage } from './storage.js';
import { getAlertingService, type AlertingService } from './alerting.js';

// Dashboard configuration
export interface DashboardConfig extends MonitoringConfig {
  readonly refreshInterval: number; // milliseconds
  readonly maxDataPoints: number;
  readonly enableAnimations: boolean;
  readonly theme: 'light' | 'dark' | 'auto';
  readonly timezone: string;
}

// Widget configuration
export interface WidgetConfig {
  readonly id: string;
  readonly type: 'metric' | 'chart' | 'alert' | 'health' | 'trend';
  readonly title: string;
  readonly metricName?: string;
  readonly timeRange?: number; // milliseconds
  readonly refreshRate?: number; // milliseconds
  readonly position: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
  readonly config: Readonly<Record<string, unknown>>;
}

// Dashboard data
export interface DashboardData {
  readonly metrics: ReadonlyArray<PerformanceMetric>;
  readonly alerts: ReadonlyArray<AlertEvent>;
  readonly trends: ReadonlyArray<PerformanceTrend>;
  readonly health: HealthCheck;
  readonly lastUpdated: number;
}

// Widget data
export interface WidgetData {
  readonly widgetId: string;
  readonly data: unknown;
  readonly lastUpdated: number;
  readonly status: 'loading' | 'success' | 'error';
  readonly error?: string;
}

// Default configuration
export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  enabled: true,
  ingestionEndpoint: 'http://localhost:9090/metrics',
  batchSize: 100,
  flushInterval: 5000,
  retryAttempts: 3,
  timeout: 10000,
  compression: true,
  refreshInterval: 5000, // 5 seconds
  maxDataPoints: 100,
  enableAnimations: true,
  theme: 'auto',
  timezone: 'UTC',
};

/**
 * Real-time Monitoring Dashboard
 */
export class MonitoringDashboard {
  private readonly config: DashboardConfig;
  private readonly storage: PerformanceDataStorage;
  private readonly alerting: AlertingService;
  private readonly widgets = new Map<string, WidgetConfig>();
  private readonly widgetData = new Map<string, WidgetData>();
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private isDestroyed = false;
  private subscribers = new Set<(data: DashboardData) => void>();

  constructor(
    config: Partial<DashboardConfig> = {},
    storage?: PerformanceDataStorage,
    alerting?: AlertingService,
  ) {
    this.config = { ...DEFAULT_DASHBOARD_CONFIG, ...config };
    this.storage = storage || getPerformanceDataStorage();
    this.alerting = alerting || getAlertingService();

    if (this.config.enabled) {
      this.startRefresh();
    }
  }

  /**
   * Add a widget to the dashboard
   */
  public addWidget(widget: WidgetConfig): void {
    this.widgets.set(widget.id, widget);

    // Initialize widget data
    this.widgetData.set(widget.id, {
      widgetId: widget.id,
      data: null,
      lastUpdated: 0,
      status: 'loading',
    });

    console.log(`Added widget: ${widget.title} (${widget.id})`);
  }

  /**
   * Remove a widget from the dashboard
   */
  public removeWidget(widgetId: string): void {
    this.widgets.delete(widgetId);
    this.widgetData.delete(widgetId);
    console.log(`Removed widget: ${widgetId}`);
  }

  /**
   * Get all widgets
   */
  public getWidgets(): ReadonlyArray<WidgetConfig> {
    return Array.from(this.widgets.values());
  }

  /**
   * Get widget data
   */
  public getWidgetData(widgetId: string): WidgetData | undefined {
    return this.widgetData.get(widgetId);
  }

  /**
   * Update widget configuration
   */
  public updateWidget(widgetId: string, updates: Partial<WidgetConfig>): void {
    const existing = this.widgets.get(widgetId);
    if (!existing) {
      return;
    }

    const updated = { ...existing, ...updates };
    this.widgets.set(widgetId, updated);
    console.log(`Updated widget: ${widgetId}`);
  }

  /**
   * Subscribe to dashboard data updates
   */
  public subscribe(callback: (data: DashboardData) => void): () => void {
    this.subscribers.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Get current dashboard data
   */
  public async getDashboardData(): Promise<DashboardData> {
    const metrics = await this.getRecentMetrics();
    const alerts = this.alerting.getActiveAlerts();
    const trends = await this.getPerformanceTrends();
    const health = await this.storage.healthCheck();

    return {
      metrics,
      alerts,
      trends,
      health,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Force refresh of all widgets
   */
  public async refresh(): Promise<void> {
    if (this.isDestroyed) {
      return;
    }

    const refreshPromises = Array.from(this.widgets.entries()).map(([widgetId, widget]) =>
      this.refreshWidget(widgetId, widget),
    );

    await Promise.allSettled(refreshPromises);

    // Notify subscribers
    const dashboardData = await this.getDashboardData();
    this.subscribers.forEach((callback) => {
      try {
        callback(dashboardData);
      } catch (error) {
        console.error('Error notifying dashboard subscriber:', error);
      }
    });
  }

  /**
   * Export dashboard configuration
   */
  public exportConfig(): {
    readonly config: DashboardConfig;
    readonly widgets: ReadonlyArray<WidgetConfig>;
  } {
    return {
      config: this.config,
      widgets: Array.from(this.widgets.values()),
    };
  }

  /**
   * Import dashboard configuration
   */
  public importConfig(config: {
    readonly config: Partial<DashboardConfig>;
    readonly widgets: ReadonlyArray<WidgetConfig>;
  }): void {
    // Update widgets
    this.widgets.clear();
    this.widgetData.clear();

    for (const widget of config.widgets) {
      this.addWidget(widget);
    }

    console.log('Imported dashboard configuration');
  }

  /**
   * Get dashboard statistics
   */
  public getDashboardStats(): {
    readonly totalWidgets: number;
    readonly activeWidgets: number;
    readonly errorWidgets: number;
    readonly lastRefresh: number;
    readonly subscriberCount: number;
  } {
    const totalWidgets = this.widgets.size;
    const activeWidgets = Array.from(this.widgetData.values()).filter(
      (data) => data.status === 'success',
    ).length;
    const errorWidgets = Array.from(this.widgetData.values()).filter(
      (data) => data.status === 'error',
    ).length;

    return {
      totalWidgets,
      activeWidgets,
      errorWidgets,
      lastRefresh: Date.now(),
      subscriberCount: this.subscribers.size,
    };
  }

  /**
   * Destroy the dashboard
   */
  public destroy(): void {
    this.isDestroyed = true;

    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }

    this.widgets.clear();
    this.widgetData.clear();
    this.subscribers.clear();
  }

  private startRefresh(): void {
    this.refreshTimer = setInterval(() => {
      this.refresh().catch(console.error);
    }, this.config.refreshInterval);
  }

  private async refreshWidget(widgetId: string, widget: WidgetConfig): Promise<void> {
    try {
      let data: unknown = null;

      switch (widget.type) {
        case 'metric':
          data = await this.getMetricData(widget);
          break;
        case 'chart':
          data = await this.getChartData(widget);
          break;
        case 'alert':
          data = await this.getAlertData(widget);
          break;
        case 'health':
          data = await this.getHealthData(widget);
          break;
        case 'trend':
          data = await this.getTrendData(widget);
          break;
        default:
          throw new Error(`Unknown widget type: ${widget.type}`);
      }

      this.widgetData.set(widgetId, {
        widgetId,
        data,
        lastUpdated: Date.now(),
        status: 'success',
      });
    } catch (error) {
      console.error(`Error refreshing widget ${widgetId}:`, error);

      this.widgetData.set(widgetId, {
        widgetId,
        data: null,
        lastUpdated: Date.now(),
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async getMetricData(widget: WidgetConfig): Promise<PerformanceMetric[]> {
    if (!widget.metricName) {
      return [];
    }

    const timeRange = widget.timeRange || 300000; // 5 minutes default
    const endTime = Date.now();
    const startTime = endTime - timeRange;

    const results = await this.storage.queryMetrics({
      metricNames: [widget.metricName],
      startTime,
      endTime,
      limit: this.config.maxDataPoints,
    });

    return results.length > 0
      ? results[0]!.dataPoints.map((dp) => ({
          metricName: results[0]!.metricName,
          timestamp: dp.timestamp,
          value: dp.value,
          labels: dp.labels || {},
        }))
      : [];
  }

  private async getChartData(widget: WidgetConfig): Promise<{
    readonly labels: ReadonlyArray<string>;
    readonly datasets: ReadonlyArray<{
      readonly label: string;
      readonly data: ReadonlyArray<number>;
      readonly borderColor?: string;
      readonly backgroundColor?: string;
    }>;
  }> {
    if (!widget.metricName) {
      return { labels: [], datasets: [] };
    }

    const timeRange = widget.timeRange || 300000;
    const endTime = Date.now();
    const startTime = endTime - timeRange;

    const results = await this.storage.queryMetrics({
      metricNames: [widget.metricName],
      startTime,
      endTime,
      limit: this.config.maxDataPoints,
    });

    if (results.length === 0) {
      return { labels: [], datasets: [] };
    }

    const dataPoints = results[0]!.dataPoints;
    const labels = dataPoints.map((dp) => new Date(dp.timestamp).toLocaleTimeString());
    const data = dataPoints.map((dp) => dp.value);

    return {
      labels,
      datasets: [
        {
          label: widget.metricName,
          data,
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
        },
      ],
    };
  }

  private async getAlertData(_widget: WidgetConfig): Promise<{
    readonly activeAlerts: ReadonlyArray<AlertEvent>;
    readonly recentAlerts: ReadonlyArray<AlertEvent>;
    readonly alertRules: ReadonlyArray<AlertRule>;
  }> {
    const activeAlerts = this.alerting.getActiveAlerts();
    const recentAlerts = this.alerting.getAlertHistory().slice(0, 10);
    const alertRules = this.alerting.getAlertRules();

    return {
      activeAlerts,
      recentAlerts,
      alertRules,
    };
  }

  private async getHealthData(_widget: WidgetConfig): Promise<HealthCheck> {
    return await this.storage.healthCheck();
  }

  private async getTrendData(widget: WidgetConfig): Promise<PerformanceTrend | null> {
    if (!widget.metricName) {
      return null;
    }

    const timeRange = widget.timeRange || 3600000; // 1 hour default
    const endTime = Date.now();
    const startTime = endTime - timeRange;

    return await this.storage.getPerformanceTrend(
      widget.metricName,
      { start: startTime, end: endTime },
      '5m',
    );
  }

  private async getRecentMetrics(): Promise<PerformanceMetric[]> {
    const endTime = Date.now();
    const startTime = endTime - 300000; // Last 5 minutes

    const metricNames = Array.from(this.widgets.values())
      .filter((widget) => widget.metricName)
      .map((widget) => widget.metricName!);

    if (metricNames.length === 0) {
      return [];
    }

    const results = await this.storage.queryMetrics({
      metricNames,
      startTime,
      endTime,
      limit: this.config.maxDataPoints,
    });

    return results.flatMap((result) =>
      result.dataPoints.map((dp) => ({
        metricName: result.metricName,
        timestamp: dp.timestamp,
        value: dp.value,
        labels: dp.labels || {},
      })),
    );
  }

  private async getPerformanceTrends(): Promise<PerformanceTrend[]> {
    const trends: PerformanceTrend[] = [];

    for (const widget of this.widgets.values()) {
      if (widget.type === 'trend' && widget.metricName) {
        const trend = await this.getTrendData(widget);
        if (trend) {
          trends.push(trend);
        }
      }
    }

    return trends;
  }
}

// Singleton instance for easy usage
let globalDashboard: MonitoringDashboard | null = null;

/**
 * Get or create the global monitoring dashboard
 */
export const getMonitoringDashboard = (
  config?: Partial<DashboardConfig>,
  storage?: PerformanceDataStorage,
  alerting?: AlertingService,
): MonitoringDashboard => {
  if (!globalDashboard) {
    globalDashboard = new MonitoringDashboard(config, storage, alerting);
  }
  return globalDashboard;
};

/**
 * Destroy the global monitoring dashboard
 */
export const destroyMonitoringDashboard = (): void => {
  if (globalDashboard) {
    globalDashboard.destroy();
    globalDashboard = null;
  }
};
