/**
 * Alerting system for pipeline monitoring and notifications
 */

import { EventEmitter } from 'events';
import { AlertMessage, MonitoringConfig } from './types.js';

export interface AlertProvider {
  name: string;
  send(message: AlertMessage): Promise<void>;
  isHealthy(): Promise<boolean>;
}

export class ConsoleAlertProvider implements AlertProvider {
  name = 'console';

  async send(message: AlertMessage): Promise<void> {
    const timestamp = message.timestamp.toISOString();
    const prefix = this.getSeverityPrefix(message.severity);

    console.log(`${prefix} [${timestamp}] ${message.type}: ${message.message}`);

    if (message.pipeline) {
      console.log(`  Pipeline: ${message.pipeline}`);
      if (message.step) {
        console.log(`  Step: ${message.step}`);
      }
    }

    if (message.metrics) {
      console.log('  Metrics:', message.metrics);
    }
  }

  async isHealthy(): Promise<boolean> {
    return true;
  }

  private getSeverityPrefix(severity: string): string {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📋';
    }
  }
}

export class EmailAlertProvider implements AlertProvider {
  name = 'email';

  constructor(private config: { smtp: any; from: string; to: string[] }) {}

  async send(message: AlertMessage): Promise<void> {
    // Implementation would use nodemailer or similar
    console.log(`[EMAIL] To: ${this.config.to.join(', ')}`);
    console.log(`[EMAIL] Subject: ${message.severity.toUpperCase()}: ${message.type}`);
    console.log(`[EMAIL] Body: ${message.message}`);
  }

  async isHealthy(): Promise<boolean> {
    // Check SMTP connectivity
    return true;
  }
}

export class SlackAlertProvider implements AlertProvider {
  name = 'slack';

  constructor(private webhookUrl: string) {}

  async send(message: AlertMessage): Promise<void> {
    const payload = {
      text: `${this.getEmoji(message.severity)} *${message.type}*`,
      attachments: [
        {
          color: this.getColor(message.severity),
          fields: [
            { title: 'Message', value: message.message, short: false },
            { title: 'Pipeline', value: message.pipeline, short: true },
            ...(message.step ? [{ title: 'Step', value: message.step, short: true }] : []),
            { title: 'Severity', value: message.severity, short: true },
            { title: 'Time', value: message.timestamp.toISOString(), short: true },
          ],
          ...(message.metrics
            ? [
                {
                  title: 'Metrics',
                  value: Object.entries(message.metrics)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n'),
                  short: false,
                },
              ]
            : []),
        },
      ],
    };

    // Implementation would use fetch or axios to send to Slack
    console.log(`[SLACK] Webhook: ${this.webhookUrl}`);
    console.log(`[SLACK] Payload:`, JSON.stringify(payload, null, 2));
  }

  async isHealthy(): Promise<boolean> {
    // Check webhook accessibility
    return true;
  }

  private getEmoji(severity: string): string {
    switch (severity) {
      case 'critical':
        return ':rotating_light:';
      case 'error':
        return ':x:';
      case 'warning':
        return ':warning:';
      case 'info':
        return ':information_source:';
      default:
        return ':speech_balloon:';
    }
  }

  private getColor(severity: string): string {
    switch (severity) {
      case 'critical':
        return 'danger';
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
        return 'good';
      default:
        return 'good';
    }
  }
}

export class AlertingSystem extends EventEmitter {
  private providers: Map<string, AlertProvider> = new Map();
  private alertHistory: AlertMessage[] = [];
  private maxHistorySize = 1000;
  private rateLimiter = new Map<string, number[]>();

  constructor(private config: MonitoringConfig) {
    super();
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Always add console provider
    this.providers.set('console', new ConsoleAlertProvider());

    // Add other providers based on alert configurations
    if (this.config.alerts && Array.isArray(this.config.alerts)) {
      for (const alertConfig of this.config.alerts) {
        if (alertConfig.action === 'email' && alertConfig.destination) {
          this.providers.set(
            'email',
            new EmailAlertProvider({
              smtp: {}, // Would be configured properly
              from: 'pipelines@example.com',
              to: alertConfig.destination.split(','),
            }),
          );
        }

        if (alertConfig.action === 'slack' && alertConfig.destination) {
          this.providers.set('slack', new SlackAlertProvider(alertConfig.destination));
        }
      }
    }
  }

  async sendAlert(
    type: string,
    message: string,
    severity: 'info' | 'warning' | 'error' | 'critical',
    context?: {
      pipeline?: string;
      step?: string;
      metrics?: Record<string, number>;
    },
  ): Promise<void> {
    const alertMessage: AlertMessage = {
      type,
      message,
      severity,
      timestamp: new Date(),
      ...context,
    };

    // Check rate limiting
    if (this.isRateLimited(type, severity)) {
      this.emit('alert:rate-limited', alertMessage);
      return;
    }

    // Add to history
    this.alertHistory.push(alertMessage);
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory = this.alertHistory.slice(-this.maxHistorySize);
    }

    // Find relevant alert configurations
    const relevantConfigs = (this.config.alerts || []).filter(
      (config) =>
        config.type === type ||
        (config.type === 'error' && (severity === 'error' || severity === 'critical')),
    );

    if (relevantConfigs.length === 0) {
      // Send to console by default
      const consoleProvider = this.providers.get('console');
      if (consoleProvider) {
        await consoleProvider.send(alertMessage);
      }
    } else {
      // Send to configured providers
      for (const config of relevantConfigs) {
        const provider = this.providers.get(config.action);
        if (provider) {
          try {
            await provider.send(alertMessage);
            this.emit('alert:sent', { provider: provider.name, message: alertMessage });
          } catch (error) {
            this.emit('alert:failed', { provider: provider.name, error, message: alertMessage });
          }
        }
      }
    }

    this.emit('alert:created', alertMessage);
  }

  private isRateLimited(type: string, severity: string): boolean {
    const key = `${type}:${severity}`;
    const now = Date.now();
    const window = 60000; // 1 minute window
    const maxAlerts = severity === 'critical' ? 10 : 5;

    if (!this.rateLimiter.has(key)) {
      this.rateLimiter.set(key, []);
    }

    const timestamps = this.rateLimiter.get(key)!;

    // Remove old timestamps
    const recent = timestamps.filter((timestamp) => now - timestamp < window);

    if (recent.length >= maxAlerts) {
      return true;
    }

    recent.push(now);
    this.rateLimiter.set(key, recent);
    return false;
  }

  async checkProviderHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};

    for (const [name, provider] of this.providers) {
      try {
        health[name] = await provider.isHealthy();
      } catch {
        health[name] = false;
      }
    }

    return health;
  }

  getAlertHistory(timeRange?: number): AlertMessage[] {
    if (!timeRange) {
      return [...this.alertHistory];
    }

    const cutoff = Date.now() - timeRange;
    return this.alertHistory.filter((alert) => alert.timestamp.getTime() >= cutoff);
  }

  getAlertStats(timeRange?: number): {
    total: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    byProvider: Record<string, number>;
  } {
    const relevantHistory = this.getAlertHistory(timeRange);

    const stats = {
      total: relevantHistory.length,
      bySeverity: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      byProvider: {} as Record<string, number>,
    };

    for (const alert of relevantHistory) {
      stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1;
      stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;
    }

    // Provider stats would be tracked during sending
    for (const providerName of this.providers.keys()) {
      stats.byProvider[providerName] = 0; // Would be tracked properly
    }

    return stats;
  }

  addProvider(name: string, provider: AlertProvider): void {
    this.providers.set(name, provider);
    this.emit('provider:added', { name, provider });
  }

  removeProvider(name: string): void {
    this.providers.delete(name);
    this.emit('provider:removed', { name });
  }

  getProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  clearHistory(): void {
    this.alertHistory = [];
    this.rateLimiter.clear();
    this.emit('history:cleared');
  }
}
