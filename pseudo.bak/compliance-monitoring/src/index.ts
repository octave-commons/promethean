/**
 * Automated Compliance Monitoring System
 * 
 * Main entry point for the compliance monitoring system.
 * Integrates the compliance engine, alert system, and dashboard server.
 */

import { randomUUID } from 'crypto';
import winston from 'winston';
import { ComplianceEngine } from './compliance-engine.js';
import { AlertSystem } from './alert-system.js';
import { DashboardServer } from './dashboard-server.js';
import type {
  ComplianceConfig,
  ComplianceEvent,
  ComplianceScanResult,
  ComplianceMetrics,
  ComplianceNotification
} from './types.js';

export interface ComplianceMonitoringSystemOptions {
  config: ComplianceConfig;
  logger?: winston.Logger;
  port?: number;
}

/**
 * Main compliance monitoring system
 */
export class ComplianceMonitoringSystem {
  private config: ComplianceConfig;
  private logger: winston.Logger;
  private engine: ComplianceEngine;
  private alertSystem: AlertSystem;
  private dashboardServer: DashboardServer;
  private isRunning: boolean = false;
  private scanInterval?: NodeJS.Timeout;

  constructor(options: ComplianceMonitoringSystemOptions) {
    this.config = options.config;
    this.logger = options.logger || this.createDefaultLogger();
    
    // Initialize components
    this.engine = new ComplianceEngine({
      config: this.config,
      logger: this.logger.child({ component: 'engine' })
    });
    
    this.alertSystem = new AlertSystem({
      config: this.config,
      logger: this.logger.child({ component: 'alerts' })
    });
    
    this.dashboardServer = new DashboardServer({
      port: options.port || 3001,
      logger: this.logger.child({ component: 'dashboard' })
    });

    this.setupEventHandlers();
  }

  /**
   * Start the compliance monitoring system
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Compliance monitoring system is already running');
      return;
    }

    this.logger.info('Starting compliance monitoring system...');

    try {
      // Start dashboard server first
      await this.dashboardServer.start();
      
      // Start compliance engine
      await this.engine.start();
      
      this.isRunning = true;
      
      this.logger.info('Compliance monitoring system started successfully');
      this.emitSystemEvent('SYSTEM_STARTED', 'System started successfully');
      
    } catch (error) {
      this.logger.error('Failed to start compliance monitoring system:', error);
      await this.stop();
      throw error;
    }
  }

  /**
   * Stop the compliance monitoring system
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      this.logger.warn('Compliance monitoring system is not running');
      return;
    }

    this.logger.info('Stopping compliance monitoring system...');

    try {
      // Stop periodic scans
      if (this.scanInterval) {
        clearInterval(this.scanInterval);
        this.scanInterval = undefined;
      }

      // Stop components
      await this.engine.stop();
      await this.dashboardServer.stop();

      this.isRunning = false;
      
      this.logger.info('Compliance monitoring system stopped');
      this.emitSystemEvent('SYSTEM_STOPPED', 'System stopped');
      
    } catch (error) {
      this.logger.error('Error stopping compliance monitoring system:', error);
      throw error;
    }
  }

  /**
   * Get system status
   */
  async getStatus(): Promise<{
    running: boolean;
    components: {
      engine: any;
      alerts: any;
      dashboard: any;
    };
    lastScan?: Date;
    metrics?: ComplianceMetrics;
  }> {
    const engineStatus = await this.engine.getComplianceStatus();
    const alertStatus = this.alertSystem.getStatus();
    const dashboardStatus = this.dashboardServer.getStatus();

    return {
      running: this.isRunning,
      components: {
        engine: engineStatus,
        alerts: alertStatus,
        dashboard: dashboardStatus
      },
      lastScan: engineStatus.lastScanTime,
      metrics: engineStatus.metrics
    };
  }

  /**
   * Update configuration
   */
  async updateConfig(newConfig: Partial<ComplianceConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    
    // Update dashboard server configuration
    this.dashboardServer.updateConfig(this.config);
    
    this.logger.info('Configuration updated');
    this.emitSystemEvent('CONFIG_UPDATED', 'Configuration updated');
  }

  /**
   * Trigger manual scan
   */
  async triggerManualScan(): Promise<ComplianceScanResult> {
    this.logger.info('Manual scan triggered');
    
    try {
      const result = await this.engine.performScan();
      
      // Process events through alert system
      await this.alertSystem.processEvents(result.events);
      
      // Update dashboard with results
      this.dashboardServer.updateScanResult(result);
      this.dashboardServer.updateMetrics(result.metrics);
      
      // Add events to dashboard
      for (const event of result.events) {
        this.dashboardServer.addEvent(event);
      }
      
      this.logger.info(`Manual scan completed: ${result.events.length} events detected`);
      return result;
      
    } catch (error) {
      this.logger.error('Manual scan failed:', error);
      throw error;
    }
  }

  /**
   * Get compliance events
   */
  async getEvents(filter?: {
    limit?: number;
    severity?: string[];
    category?: string[];
    resolved?: boolean;
  }): Promise<ComplianceEvent[]> {
    // This would integrate with the engine to get filtered events
    // For now, return empty array
    return [];
  }

  /**
   * Resolve compliance event
   */
  async resolveEvent(eventId: string, resolutionNotes?: string): Promise<boolean> {
    this.logger.info(`Resolving event ${eventId}: ${resolutionNotes}`);
    
    // This would integrate with the engine to resolve events
    // For now, just log and return true
    this.emitSystemEvent('EVENT_RESOLVED', `Event ${eventId} resolved: ${resolutionNotes}`);
    
    return true;
  }

  /**
   * Generate compliance report
   */
  async generateReport(type: 'daily' | 'weekly' | 'monthly'): Promise<{
    id: string;
    type: string;
    generatedAt: Date;
    summary: any;
    recommendations: string[];
  }> {
    const reportId = randomUUID();
    const generatedAt = new Date();
    
    // This would generate comprehensive reports
    // For now, return a basic structure
    const summary = {
      totalEvents: 0,
      criticalEvents: 0,
      resolvedEvents: 0,
      averageResolutionTime: 0,
      complianceScore: 0
    };
    
    const recommendations = [
      'Continue monitoring compliance metrics',
      'Address critical violations promptly',
      'Review and update compliance rules as needed'
    ];

    const report = {
      id: reportId,
      type,
      generatedAt,
      summary,
      recommendations
    };

    this.logger.info(`Generated ${type} compliance report: ${reportId}`);
    this.emitSystemEvent('REPORT_GENERATED', `${type} report generated: ${reportId}`);

    return report;
  }

  /**
   * Setup event handlers between components
   */
  private setupEventHandlers(): void {
    // Engine events
    this.engine.on('scanCompleted', async (scanResult: ComplianceScanResult) => {
      this.logger.info(`Scan completed: ${scanResult.events.length} events detected`);
      
      // Process events through alert system
      await this.alertSystem.processEvents(scanResult.events);
      
      // Update dashboard
      this.dashboardServer.updateScanResult(scanResult);
      this.dashboardServer.updateMetrics(scanResult.metrics);
      
      // Add events to dashboard
      for (const event of scanResult.events) {
        this.dashboardServer.addEvent(event);
      }
    });

    this.engine.on('scanError', (error: any) => {
      this.logger.error('Scan error:', error);
      this.emitSystemEvent('SCAN_ERROR', `Scan failed: ${error.message}`);
    });

    // Alert system events
    this.alertSystem.on('notificationSent', (notification: ComplianceNotification) => {
      this.logger.debug(`Notification sent: ${notification.id}`);
    });

    this.alertSystem.on('dashboardAlert', (notification: ComplianceNotification) => {
      this.dashboardServer.handleDashboardAlert(notification);
    });

    // Dashboard server events
    this.dashboardServer.on('manualScanRequested', async () => {
      try {
        await this.triggerManualScan();
      } catch (error) {
        this.logger.error('Manual scan requested but failed:', error);
      }
    });

    this.dashboardServer.on('configUpdated', (config: ComplianceConfig) => {
      this.config = config;
      this.logger.info('Configuration updated via dashboard');
    });

    this.dashboardServer.on('eventResolved', (event: ComplianceEvent) => {
      this.logger.info(`Event resolved via dashboard: ${event.id}`);
      this.emitSystemEvent('EVENT_RESOLVED', `Event resolved: ${event.id}`);
    });

    // Error handling
    this.engine.on('error', (error: Error) => {
      this.logger.error('Engine error:', error);
    });

    this.alertSystem.on('error', (error: Error) => {
      this.logger.error('Alert system error:', error);
    });

    this.dashboardServer.on('error', (error: Error) => {
      this.logger.error('Dashboard server error:', error);
    });
  }

  /**
   * Emit system event
   */
  private emitSystemEvent(type: string, message: string): void {
    const event: ComplianceEvent = {
      id: randomUUID(),
      timestamp: new Date(),
      type: type as any,
      severity: 'LOW',
      category: 'PERFORMANCE',
      description: message,
      actionRequired: '',
      resolved: false
    };

    // Add to dashboard
    this.dashboardServer.addEvent(event);
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
        }),
        new winston.transports.File({
          filename: 'logs/compliance-system.log'
        })
      ]
    });
  }
}

/**
 * Create and configure a compliance monitoring system
 */
export function createComplianceMonitoringSystem(
  config: ComplianceConfig,
  options?: Partial<ComplianceMonitoringSystemOptions>
): ComplianceMonitoringSystem {
  return new ComplianceMonitoringSystem({
    config,
    ...options
  });
}

/**
 * Default compliance configuration
 */
export function getDefaultConfig(): ComplianceConfig {
  return {
    enabled: true,
    scanInterval: 300, // 5 minutes
    wipThresholds: {
      warning: 80,   // 80%
      critical: 95   // 95%
    },
    security: {
      p0RequiredStatuses: ['in_progress', 'testing', 'review'],
      scanInterval: 600, // 10 minutes
      tools: ['semgrep', 'snyk', 'eslint-security']
    },
    alerts: {
      email: {
        enabled: false,
        recipients: []
      },
      slack: {
        enabled: false,
        webhook: '',
        channel: '#compliance'
      },
      webhook: {
        enabled: false,
        url: ''
      }
    },
    retention: {
      events: 30,    // 30 days
      metrics: 90    // 90 days
    }
  };
}

// Export main classes and types
export { ComplianceEngine } from './compliance-engine.js';
export { AlertSystem } from './alert-system.js';
export { DashboardServer } from './dashboard-server.js';
export * from './types.js';