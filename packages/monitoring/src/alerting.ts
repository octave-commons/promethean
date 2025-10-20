/**
 * Alerting System for Performance Monitoring Framework
 * Handles alert rule evaluation, notification, and management
 */

import type { AlertRule, AlertEvent, PerformanceMetric, MonitoringConfig } from './types.js';
import { getPerformanceDataStorage, type PerformanceDataStorage } from './storage.js';

// Alert notification channels
export interface NotificationChannel {
  readonly id: string;
  readonly name: string;
  readonly type: 'email' | 'slack' | 'webhook' | 'pagerduty' | 'teams';
  readonly enabled: boolean;
  readonly config: Readonly<Record<string, unknown>>;
}

// Alert evaluation context
export interface AlertContext {
  readonly metric: PerformanceMetric;
  readonly rule: AlertRule;
  readonly previousValues: ReadonlyArray<number>;
  readonly evaluationTime: number;
}

// Alert notification message
export interface AlertNotification {
  readonly alertId: string;
  readonly ruleId: string;
  readonly ruleName: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly metricName: string;
  readonly currentValue: number;
  readonly threshold: number;
  readonly condition: string;
  readonly message: string;
  readonly timestamp: number;
  readonly labels: Readonly<Record<string, string>>;
  readonly evaluationDuration: number;
}

// Alerting configuration
export interface AlertingConfig extends MonitoringConfig {
  readonly evaluationInterval: number; // milliseconds
  readonly maxConcurrentEvaluations: number;
  readonly notificationRetries: number;
  readonly notificationTimeout: number; // milliseconds
  readonly alertCooldown: number; // milliseconds
  readonly historyRetentionPeriod: number; // milliseconds
}

// Default configuration
export const DEFAULT_ALERTING_CONFIG: AlertingConfig = {
  enabled: true,
  ingestionEndpoint: 'http://localhost:9090/metrics',
  batchSize: 100,
  flushInterval: 5000,
  retryAttempts: 3,
  timeout: 10000,
  compression: true,
  evaluationInterval: 30000, // 30 seconds
  maxConcurrentEvaluations: 10,
  notificationRetries: 3,
  notificationTimeout: 5000,
  alertCooldown: 300000, // 5 minutes
  historyRetentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Alerting Service
 */
export class AlertingService {
  private readonly config: AlertingConfig;
  private readonly storage: PerformanceDataStorage;
  private readonly alertRules = new Map<string, AlertRule>();
  private readonly notificationChannels = new Map<string, NotificationChannel>();
  private readonly activeAlerts = new Map<string, AlertEvent>();
  private readonly alertHistory = new Map<string, AlertEvent[]>();
  private readonly metricHistory = new Map<string, number[]>();
  private evaluationTimer: ReturnType<typeof setInterval> | null = null;
  private isDestroyed = false;
  private isEvaluating = false;

  constructor(config: Partial<AlertingConfig> = {}, storage?: PerformanceDataStorage) {
    this.config = { ...DEFAULT_ALERTING_CONFIG, ...config };
    this.storage = storage || getPerformanceDataStorage();

    if (this.config.enabled) {
      this.startEvaluation();
    }
  }

  /**
   * Add an alert rule
   */
  public addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
    console.log(`Added alert rule: ${rule.name}`);
  }

  /**
   * Remove an alert rule
   */
  public removeAlertRule(ruleId: string): void {
    this.alertRules.delete(ruleId);

    // Resolve any active alerts for this rule
    const activeAlert = this.activeAlerts.get(ruleId);
    if (activeAlert && !activeAlert.resolved) {
      this.resolveAlert(ruleId);
    }

    console.log(`Removed alert rule: ${ruleId}`);
  }

  /**
   * Update an alert rule
   */
  public updateAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
    console.log(`Updated alert rule: ${rule.name}`);
  }

  /**
   * Get all alert rules
   */
  public getAlertRules(): ReadonlyArray<AlertRule> {
    return Array.from(this.alertRules.values());
  }

  /**
   * Get alert rule by ID
   */
  public getAlertRule(ruleId: string): AlertRule | undefined {
    return this.alertRules.get(ruleId);
  }

  /**
   * Add a notification channel
   */
  public addNotificationChannel(channel: NotificationChannel): void {
    this.notificationChannels.set(channel.id, channel);
    console.log(`Added notification channel: ${channel.name}`);
  }

  /**
   * Remove a notification channel
   */
  public removeNotificationChannel(channelId: string): void {
    this.notificationChannels.delete(channelId);
    console.log(`Removed notification channel: ${channelId}`);
  }

  /**
   * Get all notification channels
   */
  public getNotificationChannels(): ReadonlyArray<NotificationChannel> {
    return Array.from(this.notificationChannels.values());
  }

  /**
   * Get active alerts
   */
  public getActiveAlerts(): ReadonlyArray<AlertEvent> {
    return Array.from(this.activeAlerts.values()).filter((alert) => !alert.resolved);
  }

  /**
   * Get alert history
   */
  public getAlertHistory(ruleId?: string): ReadonlyArray<AlertEvent> {
    if (ruleId) {
      return this.alertHistory.get(ruleId) || [];
    }

    const allHistory: AlertEvent[] = [];
    for (const history of this.alertHistory.values()) {
      allHistory.push(...history);
    }

    return allHistory.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Manually trigger alert evaluation
   */
  public async evaluateAlerts(metrics?: ReadonlyArray<PerformanceMetric>): Promise<void> {
    if (this.isEvaluating || this.isDestroyed || !this.config.enabled) {
      return;
    }

    this.isEvaluating = true;

    try {
      const enabledRules = Array.from(this.alertRules.values()).filter((rule) => rule.enabled);

      if (enabledRules.length === 0) {
        return;
      }

      // If no metrics provided, fetch recent metrics for all rules
      const metricsToEvaluate = metrics || (await this.fetchMetricsForRules(enabledRules));

      // Group metrics by rule
      const metricsByRule = new Map<string, PerformanceMetric[]>();

      for (const metric of metricsToEvaluate) {
        const applicableRules = enabledRules.filter((rule) =>
          this.isMetricApplicableToRule(metric, rule),
        );

        for (const rule of applicableRules) {
          if (!metricsByRule.has(rule.id)) {
            metricsByRule.set(rule.id, []);
          }
          metricsByRule.get(rule.id)!.push(metric);
        }
      }

      // Evaluate each rule
      const evaluationPromises = Array.from(metricsByRule.entries()).map(([ruleId, ruleMetrics]) =>
        this.evaluateRule(ruleId, ruleMetrics),
      );

      await Promise.all(evaluationPromises);
    } catch (error) {
      console.error('Error during alert evaluation:', error);
    } finally {
      this.isEvaluating = false;
    }
  }

  /**
   * Resolve an alert
   */
  public async resolveAlert(ruleId: string, resolvedAt?: number): Promise<void> {
    const activeAlert = this.activeAlerts.get(ruleId);

    if (!activeAlert || activeAlert.resolved) {
      return;
    }

    const resolvedAlert: AlertEvent = {
      ...activeAlert,
      resolved: true,
      resolvedAt: resolvedAt || Date.now(),
    };

    // Update active alerts
    this.activeAlerts.delete(ruleId);

    // Add to history
    this.addToHistory(resolvedAlert);

    // Store in persistent storage
    await this.storage.storeAlert(resolvedAlert);

    // Send resolution notification
    await this.sendResolutionNotification(resolvedAlert);

    console.log(`Resolved alert: ${activeAlert.id}`);
  }

  /**
   * Get alerting statistics
   */
  public getAlertingStats(): {
    readonly totalRules: number;
    readonly enabledRules: number;
    readonly activeAlerts: number;
    readonly totalNotifications: number;
    readonly lastEvaluation: number;
  } {
    const totalRules = this.alertRules.size;
    const enabledRules = Array.from(this.alertRules.values()).filter((rule) => rule.enabled).length;
    const activeAlerts = this.getActiveAlerts().length;

    let totalNotifications = 0;
    for (const history of this.alertHistory.values()) {
      totalNotifications += history.length;
    }

    return {
      totalRules,
      enabledRules,
      activeAlerts,
      totalNotifications,
      lastEvaluation: Date.now(), // In a real implementation, track actual last evaluation time
    };
  }

  /**
   * Destroy the alerting service
   */
  public destroy(): void {
    this.isDestroyed = true;

    if (this.evaluationTimer) {
      clearInterval(this.evaluationTimer);
      this.evaluationTimer = null;
    }

    this.alertRules.clear();
    this.notificationChannels.clear();
    this.activeAlerts.clear();
    this.alertHistory.clear();
    this.metricHistory.clear();
  }

  private startEvaluation(): void {
    this.evaluationTimer = setInterval(() => {
      this.evaluateAlerts().catch(console.error);
    }, this.config.evaluationInterval);
  }

  private async fetchMetricsForRules(
    _rules: ReadonlyArray<AlertRule>,
  ): Promise<PerformanceMetric[]> {
    // In a real implementation, this would query the storage for recent metrics
    // For now, return empty array - metrics will be provided via recordMetric method
    return [];
  }

  private isMetricApplicableToRule(metric: PerformanceMetric, rule: AlertRule): boolean {
    return metric.metricName === rule.metricName;
  }

  private async evaluateRule(ruleId: string, metrics: PerformanceMetric[]): Promise<void> {
    const rule = this.alertRules.get(ruleId);
    if (!rule || !rule.enabled) {
      return;
    }

    // Sort metrics by timestamp
    metrics.sort((a, b) => a.timestamp - b.timestamp);

    // Get metric history for trend analysis
    const historyKey = `${rule.metricName}:${JSON.stringify(rule.labels)}`;
    const previousValues = this.metricHistory.get(historyKey) || [];

    // Update metric history
    const newValues = [...previousValues, ...metrics.map((m) => m.value)];
    const maxHistorySize = 100; // Keep last 100 values
    if (newValues.length > maxHistorySize) {
      newValues.splice(0, newValues.length - maxHistorySize);
    }
    this.metricHistory.set(historyKey, newValues);

    // Evaluate each metric
    for (const metric of metrics) {
      const context: AlertContext = {
        metric,
        rule,
        previousValues: newValues.slice(0, -1), // All values except current
        evaluationTime: Date.now(),
      };

      await this.evaluateMetric(context);
    }
  }

  private async evaluateMetric(context: AlertContext): Promise<void> {
    const { metric, rule } = context;
    const isTriggered = this.evaluateCondition(metric.value, rule.condition, rule.threshold);

    const activeAlert = this.activeAlerts.get(rule.id);

    if (isTriggered && !activeAlert) {
      // New alert
      await this.triggerAlert(context);
    } else if (!isTriggered && activeAlert && !activeAlert.resolved) {
      // Alert resolved
      await this.resolveAlert(rule.id);
    } else if (isTriggered && activeAlert && !activeAlert.resolved) {
      // Alert continues - check if we should re-notify based on cooldown
      const timeSinceLastNotification = Date.now() - activeAlert.timestamp;
      if (timeSinceLastNotification > this.config.alertCooldown) {
        await this.sendRepeatNotification(context, activeAlert);
      }
    }
  }

  private evaluateCondition(value: number, condition: string, threshold: number): boolean {
    switch (condition) {
      case 'gt':
        return value > threshold;
      case 'gte':
        return value >= threshold;
      case 'lt':
        return value < threshold;
      case 'lte':
        return value <= threshold;
      case 'eq':
        return value === threshold;
      default:
        return false;
    }
  }

  private async triggerAlert(context: AlertContext): Promise<void> {
    const { metric, rule } = context;

    const alertEvent: AlertEvent = {
      id: this.generateAlertId(),
      ruleId: rule.id,
      metricName: rule.metricName,
      currentValue: metric.value,
      threshold: rule.threshold,
      severity: rule.severity,
      message: this.generateAlertMessage(context),
      timestamp: Date.now(),
      resolved: false,
    };

    // Store as active alert
    this.activeAlerts.set(rule.id, alertEvent);

    // Add to history
    this.addToHistory(alertEvent);

    // Store in persistent storage
    await this.storage.storeAlert(alertEvent);

    // Send notifications
    await this.sendAlertNotifications(alertEvent, context);

    console.log(`Triggered alert: ${alertEvent.id} for rule: ${rule.name}`);
  }

  private async sendAlertNotifications(alert: AlertEvent, context: AlertContext): Promise<void> {
    const rule = this.alertRules.get(alert.ruleId);
    if (!rule) {
      return;
    }

    const enabledChannels = Array.from(this.notificationChannels.values()).filter(
      (channel) => channel.enabled,
    );

    const notification: AlertNotification = {
      alertId: alert.id,
      ruleId: alert.ruleId,
      ruleName: rule.name,
      severity: alert.severity,
      metricName: alert.metricName,
      currentValue: alert.currentValue,
      threshold: alert.threshold,
      condition: rule.condition,
      message: alert.message,
      timestamp: alert.timestamp,
      labels: context.metric.labels,
      evaluationDuration: context.evaluationTime - context.metric.timestamp,
    };

    const notificationPromises = enabledChannels.map((channel) =>
      this.sendNotification(channel, notification).catch((error) =>
        console.error(`Failed to send notification to ${channel.name}:`, error),
      ),
    );

    await Promise.all(notificationPromises);
  }

  private async sendNotification(
    channel: NotificationChannel,
    notification: AlertNotification,
  ): Promise<void> {
    // In a real implementation, this would integrate with actual notification services
    console.log(
      `Sending ${notification.severity} alert to ${channel.name}: ${notification.message}`,
    );

    // Simulate notification delay
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  private async sendResolutionNotification(alert: AlertEvent): Promise<void> {
    const rule = this.alertRules.get(alert.ruleId);
    if (!rule) {
      return;
    }

    const enabledChannels = Array.from(this.notificationChannels.values()).filter(
      (channel) => channel.enabled,
    );

    const resolutionMessage = `Resolved: ${rule.name} - ${alert.metricName} is now within threshold`;

    for (const channel of enabledChannels) {
      console.log(`Sending resolution to ${channel.name}: ${resolutionMessage}`);
    }
  }

  private async sendRepeatNotification(
    _context: AlertContext,
    activeAlert: AlertEvent,
  ): Promise<void> {
    const rule = this.alertRules.get(activeAlert.ruleId);
    if (!rule) {
      return;
    }

    const message = `Continuing: ${rule.name} - ${activeAlert.metricName} = ${activeAlert.currentValue} (threshold: ${activeAlert.threshold})`;

    console.log(`Sending repeat notification: ${message}`);
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private generateAlertMessage(context: AlertContext): string {
    const { metric, rule } = context;
    const operator = this.getConditionOperator(rule.condition);
    return `${rule.name}: ${metric.metricName} = ${metric.value} ${operator} ${rule.threshold}`;
  }

  private getConditionOperator(condition: string): string {
    switch (condition) {
      case 'gt':
        return '>';
      case 'gte':
        return '>=';
      case 'lt':
        return '<';
      case 'lte':
        return '<=';
      case 'eq':
        return '==';
      default:
        return '?';
    }
  }

  private addToHistory(alert: AlertEvent): void {
    const ruleId = alert.ruleId;
    if (!this.alertHistory.has(ruleId)) {
      this.alertHistory.set(ruleId, []);
    }

    const history = this.alertHistory.get(ruleId)!;
    history.push(alert);

    // Maintain history size based on retention period
    const cutoffTime = Date.now() - this.config.historyRetentionPeriod;
    const filteredHistory = history.filter((a) => a.timestamp > cutoffTime);
    this.alertHistory.set(ruleId, filteredHistory);
  }
}

// Singleton instance for easy usage
let globalAlertingService: AlertingService | null = null;

/**
 * Get or create the global alerting service
 */
export const getAlertingService = (
  config?: Partial<AlertingConfig>,
  storage?: PerformanceDataStorage,
): AlertingService => {
  if (!globalAlertingService) {
    globalAlertingService = new AlertingService(config, storage);
  }
  return globalAlertingService;
};

/**
 * Destroy the global alerting service
 */
export const destroyAlertingService = (): void => {
  if (globalAlertingService) {
    globalAlertingService.destroy();
    globalAlertingService = null;
  }
};
