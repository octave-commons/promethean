/**
 * Core Compliance Monitoring Engine
 * 
 * This is the heart of the automated compliance monitoring system.
 * It continuously scans for violations, validates compliance rules,
 * and generates alerts for detected issues.
 */

import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';
import cron from 'node-cron';
import chokidar from 'chokidar';
import winston from 'winston';
import type {
  ComplianceEvent,
  TaskCompliance,
  WIPComplianceStatus,
  ProcessComplianceStatus,
  SecurityComplianceStatus,
  ComplianceMetrics,
  ComplianceConfig,
  ComplianceScanResult,
  ComplianceViolation,
  Task,
  Board
} from './types.js';

export interface ComplianceEngineOptions {
  config: ComplianceConfig;
  logger?: winston.Logger;
}

/**
 * Main compliance monitoring engine
 */
export class ComplianceEngine extends EventEmitter {
  private config: ComplianceConfig;
  private logger: winston.Logger;
  private isRunning: boolean = false;
  private scanTimer?: NodeJS.Timeout;
  private fileWatcher?: chokidar.FSWatcher;
  private lastScanTime?: Date;
  private eventHistory: ComplianceEvent[] = [];
  private activeViolations: Map<string, ComplianceViolation> = new Map();

  constructor(options: ComplianceEngineOptions) {
    super();
    this.config = options.config;
    this.logger = options.logger || this.createDefaultLogger();
    
    this.setupEventHandlers();
  }

  /**
   * Start the compliance monitoring engine
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Compliance engine is already running');
      return;
    }

    this.logger.info('Starting compliance monitoring engine...');
    this.isRunning = true;

    // Start periodic scanning
    this.startPeriodicScanning();

    // Start file watching for real-time updates
    this.startFileWatching();

    // Perform initial scan
    await this.performScan();

    this.logger.info('Compliance monitoring engine started successfully');
    this.emit('started');
  }

  /**
   * Stop the compliance monitoring engine
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      this.logger.warn('Compliance engine is not running');
      return;
    }

    this.logger.info('Stopping compliance monitoring engine...');
    this.isRunning = false;

    // Stop periodic scanning
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = undefined;
    }

    // Stop file watching
    if (this.fileWatcher) {
      await this.fileWatcher.close();
      this.fileWatcher = undefined;
    }

    this.logger.info('Compliance monitoring engine stopped');
    this.emit('stopped');
  }

  /**
   * Perform a comprehensive compliance scan
   */
  async performScan(): Promise<ComplianceScanResult> {
    const scanId = randomUUID();
    const startTime = new Date();

    this.logger.info(`Starting compliance scan ${scanId}`);

    try {
      // Get current board state
      const board = await this.getCurrentBoard();
      
      // Scan WIP compliance
      const wipStatus = await this.scanWIPCompliance(board);
      
      // Scan process compliance
      const processStatus = await this.scanProcessCompliance(board);
      
      // Scan security compliance
      const securityStatus = await this.scanSecurityCompliance(board);
      
      // Generate events for violations
      const events = this.generateComplianceEvents(wipStatus, processStatus, securityStatus);
      
      // Calculate metrics
      const metrics = this.calculateMetrics(events, wipStatus, processStatus, securityStatus);
      
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      const scanResult: ComplianceScanResult = {
        scanId,
        startTime,
        endTime,
        duration,
        wipStatus,
        processStatus,
        securityStatus,
        events,
        metrics
      };

      this.lastScanTime = endTime;
      
      // Store events in history
      this.eventHistory.push(...events);
      this.trimEventHistory();

      // Emit scan completion
      this.emit('scanCompleted', scanResult);

      this.logger.info(`Compliance scan ${scanId} completed in ${duration}ms with ${events.length} events`);
      
      return scanResult;

    } catch (error) {
      this.logger.error(`Compliance scan ${scanId} failed:`, error);
      this.emit('scanError', { scanId, error });
      throw error;
    }
  }

  /**
   * Scan WIP limit compliance
   */
  private async scanWIPCompliance(board: Board): Promise<WIPComplianceStatus[]> {
    const wipStatus: WIPComplianceStatus[] = [];

    for (const column of board.columns) {
      const currentCount = column.count;
      const limit = column.limit || Infinity;
      const utilization = limit === Infinity ? 0 : (currentCount / limit) * 100;
      
      let status: WIPComplianceStatus['status'];
      if (utilization >= 100) {
        status = 'VIOLATION';
      } else if (utilization >= this.config.wipThresholds.critical) {
        status = 'CRITICAL';
      } else if (utilization >= this.config.wipThresholds.warning) {
        status = 'WARNING';
      } else {
        status = 'COMPLIANT';
      }

      const headroom = Math.max(0, limit - currentCount);
      const tasksOverLimit = status === 'VIOLATION' 
        ? column.tasks.slice(limit).map(task => task.title)
        : undefined;

      wipStatus.push({
        columnName: column.name,
        currentCount,
        limit,
        utilization,
        status,
        headroom,
        tasksOverLimit
      });
    }

    return wipStatus;
  }

  /**
   * Scan process compliance
   */
  private async scanProcessCompliance(board: Board): Promise<ProcessComplianceStatus> {
    const startTime = Date.now();
    const violations: ComplianceEvent[] = [];
    let compliantTasks = 0;

    // Check each task for process compliance
    for (const column of board.columns) {
      for (const task of column.tasks) {
        const taskCompliance = await this.validateTaskCompliance(task, board);
        
        if (taskCompliance.violations.length === 0) {
          compliantTasks++;
        } else {
          // Create violation events
          for (const violation of taskCompliance.violations) {
            violations.push(this.createViolationEvent(violation, task, column.name));
          }
        }
      }
    }

    const totalTasks = board.columns.reduce((sum, col) => sum + col.count, 0);
    const overallCompliance = totalTasks > 0 ? (compliantTasks / totalTasks) * 100 : 100;
    const scanDuration = Date.now() - startTime;

    return {
      overallCompliance,
      totalTasks,
      compliantTasks,
      violations,
      lastScanTime: new Date(),
      scanDuration
    };
  }

  /**
   * Scan security compliance
   */
  private async scanSecurityCompliance(board: Board): Promise<SecurityComplianceStatus> {
    const p0TasksInWrongStatus: TaskCompliance[] = [];
    const securityGatesFailed: string[] = [];
    let vulnerabilitiesUnresolved = 0;

    // Find P0 tasks and validate their status
    for (const column of board.columns) {
      for (const task of column.tasks) {
        if (task.priority === 'P0') {
          const taskCompliance = await this.validateP0TaskCompliance(task, column.name);
          
          if (!this.config.security.p0RequiredStatuses.includes(column.name)) {
            p0TasksInWrongStatus.push(taskCompliance);
          }

          if (!taskCompliance.securityGatesPassed) {
            securityGatesFailed.push(task.uuid);
          }
        }
      }
    }

    // Count unresolved vulnerabilities (would integrate with security tools)
    vulnerabilitiesUnresolved = await this.countUnresolvedVulnerabilities();

    const overallSecurityScore = this.calculateSecurityScore(
      p0TasksInWrongStatus.length,
      securityGatesFailed.length,
      vulnerabilitiesUnresolved
    );

    return {
      p0TasksInWrongStatus,
      securityGatesFailed,
      vulnerabilitiesUnresolved,
      lastSecurityScan: new Date(),
      overallSecurityScore
    };
  }

  /**
   * Validate individual task compliance
   */
  private async validateTaskCompliance(task: Task, board: Board): Promise<TaskCompliance> {
    const violations: ComplianceViolation[] = [];
    
    // Check for required fields
    if (!task.title || task.title.trim() === '') {
      violations.push({
        id: randomUUID(),
        type: 'MISSING_TITLE',
        severity: 'HIGH',
        description: 'Task title is missing or empty',
        suggestion: 'Add a descriptive title to the task',
        detectedAt: new Date(),
        resolved: false
      });
    }

    if (!task.priority) {
      violations.push({
        id: randomUUID(),
        type: 'MISSING_PRIORITY',
        severity: 'MEDIUM',
        description: 'Task priority is not set',
        suggestion: 'Set an appropriate priority (P0, P1, P2, P3)',
        detectedAt: new Date(),
        resolved: false
      });
    }

    // Check for estimates on complex tasks
    if (task.priority === 'P0' && !task.estimates) {
      violations.push({
        id: randomUUID(),
        type: 'MISSING_ESTIMATES',
        severity: 'HIGH',
        description: 'P0 task missing complexity estimates',
        suggestion: 'Add complexity and time estimates for P0 tasks',
        detectedAt: new Date(),
        resolved: false
      });
    }

    const complianceScore = Math.max(0, 100 - (violations.length * 10));

    return {
      taskId: task.uuid,
      taskTitle: task.title,
      priority: task.priority || 'UNSET',
      currentStatus: task.status || 'unknown',
      violations,
      complianceScore,
      lastScanned: new Date(),
      securityGatesPassed: true, // Would be validated by security scanner
      implementationVerified: false // Would be validated by code analysis
    };
  }

  /**
   * Validate P0 task compliance specifically
   */
  private async validateP0TaskCompliance(task: Task, currentColumn: string): Promise<TaskCompliance> {
    const baseCompliance = await this.validateTaskCompliance(task, {} as Board);
    
    // P0-specific validations
    const violations = [...baseCompliance.violations];

    // Check if P0 task is in appropriate status
    if (!this.config.security.p0RequiredStatuses.includes(currentColumn)) {
      violations.push({
        id: randomUUID(),
        type: 'P0_WRONG_STATUS',
        severity: 'CRITICAL',
        description: `P0 task is in wrong column: ${currentColumn}`,
        suggestion: `Move P0 task to one of: ${this.config.security.p0RequiredStatuses.join(', ')}`,
        detectedAt: new Date(),
        resolved: false
      });
    }

    // Check for security implementation
    if (!task.content?.includes('security') && !task.content?.includes('vulnerability')) {
      violations.push({
        id: randomUUID(),
        type: 'P0_NO_SECURITY_IMPLEMENTATION',
        severity: 'CRITICAL',
        description: 'P0 task does not contain security implementation details',
        suggestion: 'Add security implementation details and vulnerability fix information',
        detectedAt: new Date(),
        resolved: false
      });
    }

    const complianceScore = Math.max(0, 100 - (violations.length * 15));

    return {
      ...baseCompliance,
      violations,
      complianceScore,
      securityGatesPassed: violations.filter(v => v.type.startsWith('P0_')).length === 0,
      implementationVerified: task.content?.includes('implementation') || false
    };
  }

  /**
   * Generate compliance events from scan results
   */
  private generateComplianceEvents(
    wipStatus: WIPComplianceStatus[],
    processStatus: ProcessComplianceStatus,
    securityStatus: SecurityComplianceStatus
  ): ComplianceEvent[] {
    const events: ComplianceEvent[] = [];

    // WIP violation events
    for (const wip of wipStatus) {
      if (wip.status === 'VIOLATION' || wip.status === 'CRITICAL') {
        events.push({
          id: randomUUID(),
          timestamp: new Date(),
          type: 'VIOLATION',
          severity: wip.status === 'VIOLATION' ? 'HIGH' : 'MEDIUM',
          category: 'WIP',
          column: wip.columnName,
          description: `WIP limit ${wip.status === 'VIOLATION' ? 'exceeded' : 'critically approached'} in ${wip.columnName}`,
          actionRequired: wip.status === 'VIOLATION' 
            ? `Move ${wip.tasksOverLimit?.length || 0} tasks to create capacity`
            : 'Process tasks to prevent WIP limit violation',
          resolved: false,
          metadata: {
            currentCount: wip.currentCount,
            limit: wip.limit,
            utilization: wip.utilization,
            tasksOverLimit: wip.tasksOverLimit
          }
        });
      }
    }

    // Process violation events
    events.push(...processStatus.violations);

    // Security violation events
    for (const p0Task of securityStatus.p0TasksInWrongStatus) {
      events.push({
        id: randomUUID(),
        timestamp: new Date(),
        type: 'VIOLATION',
        severity: 'CRITICAL',
        category: 'SECURITY',
        taskId: p0Task.taskId,
        taskTitle: p0Task.taskTitle,
        description: `P0 security task in wrong status: ${p0Task.currentStatus}`,
        actionRequired: `Move P0 task to appropriate status immediately`,
        resolved: false,
        metadata: {
          currentStatus: p0Task.currentStatus,
          requiredStatuses: this.config.security.p0RequiredStatuses,
          violations: p0Task.violations
        }
      });
    }

    return events;
  }

  /**
   * Calculate overall compliance metrics
   */
  private calculateMetrics(
    events: ComplianceEvent[],
    wipStatus: WIPComplianceStatus[],
    processStatus: ProcessComplianceStatus,
    securityStatus: SecurityComplianceStatus
  ): ComplianceMetrics {
    const wipCompliance = wipStatus.filter(w => w.status === 'COMPLIANT').length / wipStatus.length * 100;
    const processCompliance = processStatus.overallCompliance;
    const securityCompliance = securityStatus.overallSecurityScore;
    const overallCompliance = (wipCompliance + processCompliance + securityCompliance) / 3;

    // Calculate violation trends
    const now = new Date();
    const last24h = events.filter(e => now.getTime() - e.timestamp.getTime() <= 24 * 60 * 60 * 1000).length;
    const last7d = events.filter(e => now.getTime() - e.timestamp.getTime() <= 7 * 24 * 60 * 60 * 1000).length;
    const last30d = events.filter(e => now.getTime() - e.timestamp.getTime() <= 30 * 24 * 60 * 60 * 1000).length;

    return {
      wipCompliance,
      processCompliance,
      securityCompliance,
      overallCompliance,
      violationTrend: {
        last24h,
        last7d,
        last30d
      },
      resolutionTime: {
        average: 0, // Would calculate from resolved events
        median: 0,
        p95: 0
      }
    };
  }

  /**
   * Create violation event from violation
   */
  private createViolationEvent(violation: ComplianceViolation, task: Task, column: string): ComplianceEvent {
    return {
      id: randomUUID(),
      timestamp: violation.detectedAt,
      type: 'VIOLATION',
      severity: violation.severity,
      category: 'PROCESS',
      taskId: task.uuid,
      taskTitle: task.title,
      column,
      description: violation.description,
      actionRequired: violation.suggestion,
      resolved: violation.resolved,
      resolvedAt: violation.resolvedAt,
      metadata: {
        violationId: violation.id,
        violationType: violation.type
      }
    };
  }

  /**
   * Start periodic scanning
   */
  private startPeriodicScanning(): void {
    if (this.config.scanInterval > 0) {
      this.scanTimer = setInterval(async () => {
        try {
          await this.performScan();
        } catch (error) {
          this.logger.error('Periodic scan failed:', error);
        }
      }, this.config.scanInterval * 1000);

      this.logger.info(`Periodic scanning started with ${this.config.scanInterval}s interval`);
    }
  }

  /**
   * Start file watching for real-time updates
   */
  private startFileWatching(): void {
    // Watch kanban board and task files for changes
    const watchPaths = [
      'docs/agile/boards/**/*.md',
      'docs/agile/tasks/**/*.md'
    ];

    this.fileWatcher = chokidar.watch(watchPaths, {
      ignored: /node_modules/,
      persistent: true
    });

    this.fileWatcher.on('change', async (path) => {
      this.logger.debug(`File changed: ${path}`);
      
      // Debounce rapid changes
      setTimeout(async () => {
        try {
          await this.performScan();
        } catch (error) {
          this.logger.error(`Scan triggered by file change failed: ${path}`, error);
        }
      }, 1000);
    });

    this.logger.info('File watching started for real-time compliance monitoring');
  }

  /**
   * Get current board state
   */
  private async getCurrentBoard(): Promise<Board> {
    // This would integrate with the kanban package to get current board state
    // For now, return a mock structure
    return {
      columns: [],
      metadata: {
        lastUpdated: new Date(),
        totalTasks: 0
      }
    };
  }

  /**
   * Count unresolved vulnerabilities
   */
  private async countUnresolvedVulnerabilities(): Promise<number> {
    // This would integrate with security scanning tools
    // For now, return 0
    return 0;
  }

  /**
   * Calculate security score
   */
  private calculateSecurityScore(
    p0Violations: number,
    gateFailures: number,
    vulnerabilities: number
  ): number {
    const p0Score = Math.max(0, 100 - (p0Violations * 25));
    const gateScore = Math.max(0, 100 - (gateFailures * 10));
    const vulnScore = Math.max(0, 100 - (vulnerabilities * 5));
    
    return (p0Score + gateScore + vulnScore) / 3;
  }

  /**
   * Trim event history to prevent memory leaks
   */
  private trimEventHistory(): void {
    const maxAge = this.config.retention.events * 24 * 60 * 60 * 1000; // Convert days to ms
    const cutoff = new Date(Date.now() - maxAge);
    
    this.eventHistory = this.eventHistory.filter(event => event.timestamp > cutoff);
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.on('error', (error) => {
      this.logger.error('Compliance engine error:', error);
    });
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
          filename: 'logs/compliance-engine.log'
        })
      ]
    });
  }

  /**
   * Get current compliance status
   */
  async getComplianceStatus(): Promise<{
    isRunning: boolean;
    lastScanTime?: Date;
    recentEvents: ComplianceEvent[];
    metrics?: ComplianceMetrics;
  }> {
    return {
      isRunning: this.isRunning,
      lastScanTime: this.lastScanTime,
      recentEvents: this.eventHistory.slice(-50), // Last 50 events
      metrics: undefined // Would be calculated from last scan
    };
  }
}