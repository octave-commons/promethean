import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import * as path from 'path';
import { TimeoutEvent } from './timeout-manager.js';

/**
 * Monitoring event types
 */
export interface MonitoringEvent {
  timestamp: Date;
  type: 'timeout' | 'process_start' | 'process_end' | 'resource_warning' | 'error';
  data: Record<string, unknown>;
}

/**
 * Resource usage metrics
 */
export interface ResourceMetrics {
  timestamp: Date;
  memoryUsage: number;
  cpuUsage: number;
  activeProcesses: number;
  activeTimeouts: number;
}

/**
 * Performance statistics
 */
export interface PerformanceStats {
  totalOperations: number;
  successfulOperations: number;
  timeoutOperations: number;
  averageDuration: number;
  maxDuration: number;
  minDuration: number;
  operationCounts: Record<string, number>;
  timeoutCounts: Record<string, number>;
}

/**
 * Monitoring configuration
 */
export interface MonitoringConfig {
  /** Whether to enable monitoring */
  enabled: boolean;
  /** Log file path */
  logFile?: string;
  /** Metrics file path */
  metricsFile?: string;
  /** Maximum log file size in bytes */
  maxLogSize?: number;
  /** Whether to log to console */
  logToConsole?: boolean;
  /** Monitoring interval in milliseconds */
  monitoringInterval?: number;
  /** Resource warning thresholds */
  resourceThresholds?: {
    memoryUsage: number;
    cpuUsage: number;
    activeProcesses: number;
  };
}

/**
 * Comprehensive monitoring and logging system for BuildFix operations
 */
export class BuildFixMonitor extends EventEmitter {
  private config: Required<MonitoringConfig>;
  private events: MonitoringEvent[] = [];
  private metrics: ResourceMetrics[] = [];
  private performanceStats: PerformanceStats = {
    totalOperations: 0,
    successfulOperations: 0,
    timeoutOperations: 0,
    averageDuration: 0,
    maxDuration: 0,
    minDuration: Infinity,
    operationCounts: {},
    timeoutCounts: {},
  };
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<MonitoringConfig> = {}) {
    super();

    this.config = {
      enabled: config.enabled ?? true,
      logFile: config.logFile ?? './logs/buildfix-monitor.log',
      metricsFile: config.metricsFile ?? './logs/buildfix-metrics.json',
      maxLogSize: config.maxLogSize ?? 10 * 1024 * 1024, // 10MB
      logToConsole: config.logToConsole ?? true,
      monitoringInterval: config.monitoringInterval ?? 5000, // 5 seconds
      resourceThresholds: config.resourceThresholds ?? {
        memoryUsage: 1024 * 1024 * 1024, // 1GB
        cpuUsage: 90, // 90%
        activeProcesses: 50,
      },
    };

    if (this.config.enabled) {
      this.startMonitoring();
    }
  }

  /**
   * Start the monitoring system
   */
  async startMonitoring(): Promise<void> {
    if (!this.config.enabled) return;

    // Ensure log directory exists
    await this.ensureLogDirectory();

    // Start periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.monitoringInterval);

    this.logEvent({
      timestamp: new Date(),
      type: 'process_start',
      data: { message: 'BuildFix monitoring started' },
    });
  }

  /**
   * Stop the monitoring system
   */
  async stopMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    await this.saveMetrics();

    this.logEvent({
      timestamp: new Date(),
      type: 'process_end',
      data: { message: 'BuildFix monitoring stopped' },
    });
  }

  /**
   * Log a timeout event
   */
  logTimeout(event: TimeoutEvent): void {
    this.performanceStats.timeoutOperations++;
    this.performanceStats.timeoutCounts[event.operation] =
      (this.performanceStats.timeoutCounts[event.operation] || 0) + 1;

    this.logEvent({
      timestamp: event.timestamp,
      type: 'timeout',
      data: {
        operation: event.operation,
        timeoutMs: event.timeoutMs,
        actualDuration: event.actualDuration,
        metadata: event.metadata,
      },
    });

    this.emit('timeout', event);
  }

  /**
   * Log a general monitoring event
   */
  logEvent(event: MonitoringEvent): void {
    this.events.push(event);

    // Keep only recent events (last 1000)
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    // Log to file if configured
    if (this.config.logFile) {
      this.writeToLogFile(event);
    }

    // Log to console if configured
    if (this.config.logToConsole) {
      this.logToConsole(event);
    }

    this.emit('event', event);
  }

  /**
   * Record operation start
   */
  recordOperationStart(operation: string, metadata?: Record<string, unknown>): void {
    this.performanceStats.totalOperations++;
    this.performanceStats.operationCounts[operation] =
      (this.performanceStats.operationCounts[operation] || 0) + 1;

    this.logEvent({
      timestamp: new Date(),
      type: 'process_start',
      data: { operation, metadata },
    });
  }

  /**
   * Record operation completion
   */
  recordOperationEnd(
    operation: string,
    duration: number,
    success: boolean,
    metadata?: Record<string, unknown>,
  ): void {
    if (success) {
      this.performanceStats.successfulOperations++;
    }

    // Update duration statistics
    this.performanceStats.maxDuration = Math.max(this.performanceStats.maxDuration, duration);
    this.performanceStats.minDuration = Math.min(this.performanceStats.minDuration, duration);

    const totalDuration =
      this.performanceStats.averageDuration * (this.performanceStats.totalOperations - 1) +
      duration;
    this.performanceStats.averageDuration = totalDuration / this.performanceStats.totalOperations;

    this.logEvent({
      timestamp: new Date(),
      type: 'process_end',
      data: { operation, duration, success, metadata },
    });
  }

  /**
   * Record resource warning
   */
  recordResourceWarning(
    type: 'memory' | 'cpu' | 'processes',
    current: number,
    threshold: number,
    metadata?: Record<string, unknown>,
  ): void {
    this.logEvent({
      timestamp: new Date(),
      type: 'resource_warning',
      data: { warningType: type, current, threshold, metadata },
    });

    this.emit('resource-warning', { type, current, threshold, metadata });
  }

  /**
   * Collect system metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      // Get active processes from ProcessWrapper
      const { ProcessWrapper } = await import('./process-wrapper.js');
      const activeProcesses = ProcessWrapper.getActiveProcesses().length;

      // Get active timeouts from timeout manager
      const { globalTimeoutManager } = await import('./timeout-manager.js');
      const timeoutStats = globalTimeoutManager.getStats();

      const metrics: ResourceMetrics = {
        timestamp: new Date(),
        memoryUsage: memUsage.heapUsed,
        cpuUsage: cpuUsage.user + cpuUsage.system,
        activeProcesses,
        activeTimeouts: timeoutStats.activeTimeouts,
      };

      this.metrics.push(metrics);

      // Keep only recent metrics (last 1000)
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }

      // Check resource thresholds
      this.checkResourceThresholds(metrics);
    } catch (error) {
      this.logEvent({
        timestamp: new Date(),
        type: 'error',
        data: { error: error instanceof Error ? error.message : String(error) },
      });
    }
  }

  /**
   * Check resource usage against thresholds
   */
  private checkResourceThresholds(metrics: ResourceMetrics): void {
    const { resourceThresholds } = this.config;

    if (metrics.memoryUsage > resourceThresholds.memoryUsage) {
      this.recordResourceWarning('memory', metrics.memoryUsage, resourceThresholds.memoryUsage);
    }

    if (metrics.activeProcesses > resourceThresholds.activeProcesses) {
      this.recordResourceWarning(
        'processes',
        metrics.activeProcesses,
        resourceThresholds.activeProcesses,
      );
    }
  }

  /**
   * Write event to log file
   */
  private async writeToLogFile(event: MonitoringEvent): Promise<void> {
    try {
      const logLine = JSON.stringify(event) + '\n';

      // Check file size and rotate if necessary
      if (this.config.logFile) {
        try {
          const stats = await fs.stat(this.config.logFile);
          if (stats.size > this.config.maxLogSize) {
            await this.rotateLogFile();
          }
        } catch {
          // File doesn't exist, will be created
        }

        await fs.appendFile(this.config.logFile, logLine, 'utf8');
      }
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Rotate log file
   */
  private async rotateLogFile(): Promise<void> {
    if (!this.config.logFile) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rotatedFile = this.config.logFile.replace('.log', `-${timestamp}.log`);

    try {
      await fs.rename(this.config.logFile, rotatedFile);
    } catch (error) {
      console.error('Failed to rotate log file:', error);
    }
  }

  /**
   * Log event to console
   */
  private logToConsole(event: MonitoringEvent): void {
    const timestamp = event.timestamp.toISOString();
    const message = `[${timestamp}] ${event.type.toUpperCase()}: ${JSON.stringify(event.data)}`;

    switch (event.type) {
      case 'timeout':
        console.warn(`⏰ ${message}`);
        break;
      case 'resource_warning':
        console.warn(`⚠️ ${message}`);
        break;
      case 'error':
        console.error(`❌ ${message}`);
        break;
      default:
        console.log(`ℹ️ ${message}`);
    }
  }

  /**
   * Ensure log directory exists
   */
  private async ensureLogDirectory(): Promise<void> {
    if (this.config.logFile) {
      const logDir = path.dirname(this.config.logFile);
      await fs.mkdir(logDir, { recursive: true });
    }

    if (this.config.metricsFile) {
      const metricsDir = path.dirname(this.config.metricsFile);
      await fs.mkdir(metricsDir, { recursive: true });
    }
  }

  /**
   * Save metrics to file
   */
  private async saveMetrics(): Promise<void> {
    if (!this.config.metricsFile) return;

    try {
      const data = {
        timestamp: new Date(),
        metrics: this.metrics.slice(-100), // Last 100 metrics
        performance: this.performanceStats,
        recentEvents: this.events.slice(-50), // Last 50 events
      };

      await fs.writeFile(this.config.metricsFile, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): PerformanceStats {
    return { ...this.performanceStats };
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(count: number = 100): ResourceMetrics[] {
    return this.metrics.slice(-count);
  }

  /**
   * Get recent events
   */
  getRecentEvents(count: number = 100): MonitoringEvent[] {
    return this.events.slice(-count);
  }

  /**
   * Generate monitoring report
   */
  generateReport(): string {
    const stats = this.performanceStats;
    const successRate =
      stats.totalOperations > 0
        ? ((stats.successfulOperations / stats.totalOperations) * 100).toFixed(1)
        : '0';
    const timeoutRate =
      stats.totalOperations > 0
        ? ((stats.timeoutOperations / stats.totalOperations) * 100).toFixed(1)
        : '0';

    return `
📊 BuildFix Monitoring Report
=============================

📈 Performance Statistics:
- Total Operations: ${stats.totalOperations}
- Successful Operations: ${stats.successfulOperations} (${successRate}%)
- Timeout Operations: ${stats.timeoutOperations} (${timeoutRate}%)
- Average Duration: ${stats.averageDuration.toFixed(0)}ms
- Max Duration: ${stats.maxDuration}ms
- Min Duration: ${stats.minDuration === Infinity ? 'N/A' : stats.minDuration}ms

🔍 Operation Breakdown:
${Object.entries(stats.operationCounts)
  .map(([op, count]) => `- ${op}: ${count} operations`)
  .join('\n')}

⏰ Timeout Breakdown:
${Object.entries(stats.timeoutCounts)
  .map(([op, count]) => `- ${op}: ${count} timeouts`)
  .join('\n')}

📋 Recent Events (last 10):
${this.events
  .slice(-10)
  .map(
    (event) => `- [${event.timestamp.toISOString()}] ${event.type}: ${JSON.stringify(event.data)}`,
  )
  .join('\n')}
    `.trim();
  }
}

/**
 * Global monitor instance
 */
export const globalMonitor = new BuildFixMonitor();
