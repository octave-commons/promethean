/**
 * Alert System for Compliance Monitoring
 * 
 * Handles multi-channel alert delivery for compliance violations and events.
 * Supports email, Slack, webhooks, and real-time dashboard notifications.
 */

import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import nodemailer from 'nodemailer';
import { WebClient } from '@slack/web-api';
import winston from 'winston';
import type {
  ComplianceEvent,
  ComplianceAlert,
  ComplianceConfig,
  ComplianceNotification
} from './types.js';

export interface AlertSystemOptions {
  config: ComplianceConfig;
  logger?: winston.Logger;
}

/**
 * Alert system for compliance violations
 */
export class AlertSystem extends EventEmitter {
  private config: ComplianceConfig;
  private logger: winston.Logger;
  private emailTransporter?: nodemailer.Transporter;
  private slackClient?: WebClient;
  private alertQueue: ComplianceNotification[] = [];
  private processingAlerts = false;

  constructor(options: AlertSystemOptions) {
    super();
    this.config = options.config;
    this.logger = options.logger || this.createDefaultLogger();
    
    this.initializeAlertChannels();
  }

  /**
   * Initialize alert channels
   */
  private async initializeAlertChannels(): Promise<void> {
    // Initialize email transport
    if (this.config.alerts.email.enabled) {
      try {
        this.emailTransporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST || 'localhost',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        
        // Verify email configuration
        await this.emailTransporter.verify();
        this.logger.info('Email alert channel initialized');
      } catch (error) {
        this.logger.error('Failed to initialize email alerts:', error);
      }
    }

    // Initialize Slack client
    if (this.config.alerts.slack.enabled && this.config.alerts.slack.webhook) {
      try {
        this.slackClient = new WebClient(this.config.alerts.slack.webhook);
        this.logger.info('Slack alert channel initialized');
      } catch (error) {
        this.logger.error('Failed to initialize Slack alerts:', error);
      }
    }
  }

  /**
   * Process compliance events and generate alerts
   */
  async processEvents(events: ComplianceEvent[]): Promise<void> {
    for (const event of events) {
      await this.processEvent(event);
    }
    
    // Process queued alerts
    await this.processAlertQueue();
  }

  /**
   * Process a single compliance event
   */
  private async processEvent(event: ComplianceEvent): Promise<void> {
    // Skip resolved events for most alert types
    if (event.resolved && event.type !== 'RESOLVED') {
      return;
    }

    // Determine alert channels based on severity and type
    const channels = this.determineAlertChannels(event);
    
    if (channels.length === 0) {
      return;
    }

    // Create notification
    const notification = this.createNotification(event, channels);
    
    // Add to queue
    this.alertQueue.push(notification);
    
    this.logger.debug(`Alert queued for event ${event.id} via channels: ${channels.join(', ')}`);
  }

  /**
   * Determine which alert channels to use for an event
   */
  private determineAlertChannels(event: ComplianceEvent): string[] {
    const channels: string[] = [];

    // Always include dashboard for real-time display
    channels.push('dashboard');

    // Email for medium and above
    if (this.config.alerts.email.enabled && 
        ['HIGH', 'CRITICAL'].includes(event.severity)) {
      channels.push('email');
    }

    // Slack for high and critical
    if (this.config.alerts.slack.enabled && 
        ['HIGH', 'CRITICAL'].includes(event.severity)) {
      channels.push('slack');
    }

    // Webhook for critical events
    if (this.config.alerts.webhook.enabled && 
        event.severity === 'CRITICAL') {
      channels.push('webhook');
    }

    return channels;
  }

  /**
   * Create notification from event
   */
  private createNotification(event: ComplianceEvent, channels: string[]): ComplianceNotification {
    const title = this.generateAlertTitle(event);
    const message = this.generateAlertMessage(event);

    return {
      id: randomUUID(),
      type: event.type,
      title,
      message,
      severity: event.severity,
      channels,
      data: {
        eventId: event.id,
        taskId: event.taskId,
        taskTitle: event.taskTitle,
        column: event.column,
        category: event.category,
        actionRequired: event.actionRequired,
        metadata: event.metadata
      }
    };
  }

  /**
   * Generate alert title
   */
  private generateAlertTitle(event: ComplianceEvent): string {
    const severityEmoji = {
      CRITICAL: '🚨',
      HIGH: '⚠️',
      MEDIUM: '📋',
      LOW: 'ℹ️'
    };

    const categoryLabel = {
      WIP: 'WIP Limit',
      PROCESS: 'Process',
      SECURITY: 'Security',
      PERFORMANCE: 'Performance',
      QUALITY: 'Quality'
    };

    const emoji = severityEmoji[event.severity];
    const category = categoryLabel[event.category] || event.category;
    
    return `${emoji} ${category} ${event.type === 'VIOLATION' ? 'Violation' : 'Alert'}`;
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(event: ComplianceEvent): string {
    let message = `**${event.description}**\n\n`;
    
    if (event.taskTitle) {
      message += `**Task:** ${event.taskTitle}\n`;
    }
    
    if (event.column) {
      message += `**Column:** ${event.column}\n`;
    }
    
    message += `**Severity:** ${event.severity}\n`;
    message += `**Time:** ${event.timestamp.toISOString()}\n\n`;
    
    message += `**Action Required:** ${event.actionRequired}\n`;
    
    if (event.assignedTo) {
      message += `**Assigned To:** ${event.assignedTo}\n`;
    }

    return message;
  }

  /**
   * Process alert queue
   */
  private async processAlertQueue(): Promise<void> {
    if (this.processingAlerts || this.alertQueue.length === 0) {
      return;
    }

    this.processingAlerts = true;

    try {
      const notifications = [...this.alertQueue];
      this.alertQueue = [];

      for (const notification of notifications) {
        await this.sendNotification(notification);
      }
    } catch (error) {
      this.logger.error('Error processing alert queue:', error);
    } finally {
      this.processingAlerts = false;
    }
  }

  /**
   * Send notification through configured channels
   */
  private async sendNotification(notification: ComplianceNotification): Promise<void> {
    const results = await Promise.allSettled(
      notification.channels.map(channel => this.sendToChannel(notification, channel))
    );

    // Check for failures
    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length > 0) {
      this.logger.error(`Failed to send notification ${notification.id} to ${failures.length} channels:`, 
        failures.map(f => f.status === 'rejected' ? f.reason : 'unknown'));
    }

    // Mark as sent
    notification.sent = true;
    notification.sentAt = new Date();

    this.emit('notificationSent', notification);
  }

  /**
   * Send notification to specific channel
   */
  private async sendToChannel(notification: ComplianceNotification, channel: string): Promise<void> {
    switch (channel) {
      case 'email':
        await this.sendEmailAlert(notification);
        break;
      case 'slack':
        await this.sendSlackAlert(notification);
        break;
      case 'webhook':
        await this.sendWebhookAlert(notification);
        break;
      case 'dashboard':
        await this.sendDashboardAlert(notification);
        break;
      default:
        this.logger.warn(`Unknown alert channel: ${channel}`);
    }
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(notification: ComplianceNotification): Promise<void> {
    if (!this.emailTransporter || !this.config.alerts.email.enabled) {
      return;
    }

    const subject = `[${notification.severity}] ${notification.title}`;
    const html = this.formatEmailMessage(notification);

    await this.emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'compliance@promethean.local',
      to: this.config.alerts.email.recipients.join(', '),
      subject,
      html
    });

    this.logger.info(`Email alert sent for notification ${notification.id}`);
  }

  /**
   * Send Slack alert
   */
  private async sendSlackAlert(notification: ComplianceNotification): Promise<void> {
    if (!this.slackClient || !this.config.alerts.slack.enabled) {
      return;
    }

    const slackMessage = this.formatSlackMessage(notification);

    await this.slackClient.chat.postMessage({
      channel: this.config.alerts.slack.channel,
      ...slackMessage
    });

    this.logger.info(`Slack alert sent for notification ${notification.id}`);
  }

  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(notification: ComplianceNotification): Promise<void> {
    if (!this.config.alerts.webhook.enabled || !this.config.alerts.webhook.url) {
      return;
    }

    const payload = {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      severity: notification.severity,
      timestamp: notification.sentAt?.toISOString() || new Date().toISOString(),
      data: notification.data
    };

    const response = await fetch(this.config.alerts.webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}: ${response.statusText}`);
    }

    this.logger.info(`Webhook alert sent for notification ${notification.id}`);
  }

  /**
   * Send dashboard alert (real-time)
   */
  private async sendDashboardAlert(notification: ComplianceNotification): Promise<void> {
    // Emit for real-time dashboard updates
    this.emit('dashboardAlert', notification);
    
    this.logger.debug(`Dashboard alert emitted for notification ${notification.id}`);
  }

  /**
   * Format message for email
   */
  private formatEmailMessage(notification: ComplianceNotification): string {
    const severityColor = {
      CRITICAL: '#ff0000',
      HIGH: '#ff6600',
      MEDIUM: '#ffaa00',
      LOW: '#0066cc'
    };

    const color = severityColor[notification.severity] || '#666666';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${color}; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">${notification.title}</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f5f5f5;">
          <p style="font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
            ${notification.message.replace(/\*\*/g, '').replace(/\n/g, '<br>')}
          </p>
          
          <div style="background-color: white; padding: 15px; border-left: 4px solid ${color};">
            <strong>Time:</strong> ${notification.sentAt?.toLocaleString() || new Date().toLocaleString()}<br>
            <strong>Severity:</strong> ${notification.severity}<br>
            <strong>ID:</strong> ${notification.id}
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>This is an automated message from the Promethean Compliance Monitoring System</p>
        </div>
      </div>
    `;
  }

  /**
   * Format message for Slack
   */
  private formatSlackMessage(notification: ComplianceNotification): any {
    const severityColor = {
      CRITICAL: 'danger',
      HIGH: 'warning',
      MEDIUM: 'good',
      LOW: '#0066cc'
    };

    const color = severityColor[notification.severity] || 'good';

    return {
      text: notification.title,
      attachments: [
        {
          color,
          fields: [
            {
              title: 'Description',
              value: notification.message,
              short: false
            },
            {
              title: 'Severity',
              value: notification.severity,
              short: true
            },
            {
              title: 'Time',
              value: notification.sentAt?.toLocaleString() || new Date().toLocaleString(),
              short: true
            }
          ],
          footer: 'Promethean Compliance Monitor',
          ts: Math.floor((notification.sentAt?.getTime() || Date.now()) / 1000)
        }
      ]
    };
  }

  /**
   * Send summary report
   */
  async sendSummaryReport(summary: {
    period: string;
    totalEvents: number;
    criticalEvents: number;
    resolvedEvents: number;
    complianceScore: number;
  }): Promise<void> {
    const notification: ComplianceNotification = {
      id: randomUUID(),
      type: 'SUMMARY',
      title: `Compliance Summary Report - ${summary.period}`,
      message: this.formatSummaryMessage(summary),
      severity: 'LOW',
      channels: ['email', 'dashboard']
    };

    await this.sendNotification(notification);
  }

  /**
   * Format summary message
   */
  private formatSummaryMessage(summary: any): string {
    return `
**Compliance Summary Report - ${summary.period}**

📊 **Overview:**
- Total Events: ${summary.totalEvents}
- Critical Events: ${summary.criticalEvents}
- Resolved Events: ${summary.resolvedEvents}
- Overall Compliance Score: ${summary.complianceScore}%

📈 **Performance:**
- Resolution Rate: ${summary.totalEvents > 0 ? Math.round((summary.resolvedEvents / summary.totalEvents) * 100) : 0}%
- Critical Issues: ${summary.criticalEvents > 0 ? '⚠️ Attention Required' : '✅ All Clear'}

This is an automated summary from the Promethean Compliance Monitoring System.
    `.trim();
  }

  /**
   * Create default logger
   */
  private createDefaultLogger(): winston.Logger {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  /**
   * Get alert system status
   */
  getStatus(): {
    emailConfigured: boolean;
    slackConfigured: boolean;
    webhookConfigured: boolean;
    queueLength: number;
    processing: boolean;
  } {
    return {
      emailConfigured: !!this.emailTransporter && this.config.alerts.email.enabled,
      slackConfigured: !!this.slackClient && this.config.alerts.slack.enabled,
      webhookConfigured: this.config.alerts.webhook.enabled,
      queueLength: this.alertQueue.length,
      processing: this.processingAlerts
    };
  }
}