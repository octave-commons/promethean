/**
 * Integration Layer for Workflow Healing System
 *
 * Integrates the healing system with monitoring, kanban, and alerting systems
 * to provide a comprehensive workflow enhancement and healing solution.
 */

import type {
  WorkflowHealer,
  HealingConfig,
  WorkflowIssue,
  HealingResult,
  WorkflowHealth,
  HealingAnalysis,
  AlertChannel,
  EscalationPolicy,
} from './types.js';
import type { AgentWorkflowGraph } from '../workflow/types.js';
import { DefaultWorkflowHealer } from './healer.js';
import { DefaultWorkflowMonitor, type WorkflowMonitor } from './monitor.js';
import { DefaultRecoveryManager, type RecoveryManager } from './recovery.js';

export interface WorkflowHealingIntegration {
  // Core integration
  initialize(config: HealingIntegrationConfig): Promise<void>;
  shutdown(): Promise<void>;

  // Workflow management
  registerWorkflow(workflow: AgentWorkflowGraph): Promise<void>;
  unregisterWorkflow(workflowId: string): Promise<void>;

  // Healing operations
  analyzeWorkflow(workflowId: string): Promise<HealingAnalysis>;
  healWorkflow(workflowId: string, issueId?: string): Promise<HealingResult[]>;

  // Monitoring and alerts
  getWorkflowHealth(workflowId: string): Promise<WorkflowHealth>;
  getAllWorkflowHealth(): Promise<Record<string, WorkflowHealth>>;

  // Configuration
  updateConfiguration(config: Partial<HealingIntegrationConfig>): Promise<void>;
  getConfiguration(): Promise<HealingIntegrationConfig>;
}

export interface HealingIntegrationConfig extends HealingConfig {
  // Integration settings
  enableKanbanIntegration: boolean;
  enableMonitoringIntegration: boolean;
  enableAlertingIntegration: boolean;

  // Kanban settings
  kanbanBoardId: string;
  kanbanApiEndpoint: string;
  createHealingTasks: boolean;
  healingTaskPriority: 'P0' | 'P1' | 'P2' | 'P3';

  // Monitoring settings
  metricsCollectionInterval: number; // milliseconds
  healthCheckInterval: number; // milliseconds
  anomalyDetectionSensitivity: number; // 0-1

  // Alerting settings
  alertChannels: AlertChannel[];
  alertCooldownPeriod: number; // milliseconds
  escalationPolicy: EscalationPolicy;

  // Automation settings
  autoHealingEnabled: boolean;
  autoHealingThreshold: number; // 0-1
  maxConcurrentHealings: number;
  healingTimeout: number; // milliseconds
}

// Re-export types from types.ts to avoid duplication
export type {
  AlertChannel,
  EscalationPolicy,
  EscalationLevel,
  EscalationCondition,
} from './types.js';

export class DefaultWorkflowHealingIntegration implements WorkflowHealingIntegration {
  private config: HealingIntegrationConfig;
  private healer: WorkflowHealer;
  private monitor: WorkflowMonitor;
  // @ts-ignore - Unused in placeholder implementation
  private _recoveryManager: RecoveryManager;

  private workflows = new Map<string, AgentWorkflowGraph>();
  private monitoringIntervals = new Map<string, NodeJS.Timeout>();
  private isInitialized = false;

  constructor(config: Partial<HealingIntegrationConfig> = {}) {
    this.config = this.createDefaultConfig(config);
    this.healer = new DefaultWorkflowHealer(this.config);
    this.monitor = new DefaultWorkflowMonitor(this.config);
    this._recoveryManager = new DefaultRecoveryManager();
  }

  async initialize(config: HealingIntegrationConfig): Promise<void> {
    if (this.isInitialized) {
      throw new Error('Integration already initialized');
    }

    this.config = { ...this.config, ...config };

    // Update healer configuration
    await this.healer.configureHealing(this.config);

    // Initialize external integrations
    if (this.config.enableKanbanIntegration) {
      await this.initializeKanbanIntegration();
    }

    if (this.config.enableMonitoringIntegration) {
      await this.initializeMonitoringIntegration();
    }

    if (this.config.enableAlertingIntegration) {
      await this.initializeAlertingIntegration();
    }

    this.isInitialized = true;
    console.log('Workflow Healing Integration initialized successfully');
  }

  async shutdown(): Promise<void> {
    if (!this.isInitialized) return;

    // Stop all monitoring
    for (const [workflowId, interval] of this.monitoringIntervals) {
      clearInterval(interval);
      await this.monitor.stopMonitoring(workflowId);
    }
    this.monitoringIntervals.clear();

    // Unregister all workflows
    for (const workflowId of this.workflows.keys()) {
      await this.unregisterWorkflow(workflowId);
    }

    this.isInitialized = false;
    console.log('Workflow Healing Integration shut down successfully');
  }

  async registerWorkflow(workflow: AgentWorkflowGraph): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Integration not initialized');
    }

    const workflowId = workflow.id;

    if (this.workflows.has(workflowId)) {
      throw new Error(`Workflow ${workflowId} already registered`);
    }

    this.workflows.set(workflowId, workflow);

    // Start monitoring
    await this.monitor.startMonitoring(workflow);

    // Start periodic health checks
    const healthInterval = setInterval(async () => {
      try {
        const health = await this.getWorkflowHealth(workflowId);
        await this.handleHealthUpdate(workflowId, health);
      } catch (error) {
        console.error(`Health check failed for workflow ${workflowId}:`, error);
      }
    }, this.config.healthCheckInterval);

    this.monitoringIntervals.set(workflowId, healthInterval);

    console.log(`Workflow ${workflowId} registered and monitoring started`);
  }

  async unregisterWorkflow(workflowId: string): Promise<void> {
    if (!this.workflows.has(workflowId)) {
      return;
    }

    // Stop monitoring
    await this.monitor.stopMonitoring(workflowId);

    // Clear health check interval
    const interval = this.monitoringIntervals.get(workflowId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(workflowId);
    }

    // Remove from registry
    this.workflows.delete(workflowId);

    console.log(`Workflow ${workflowId} unregistered`);
  }

  async analyzeWorkflow(workflowId: string): Promise<HealingAnalysis> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    return await this.healer.analyzeWorkflow(workflow);
  }

  async healWorkflow(workflowId: string, issueId?: string): Promise<HealingResult[]> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const analysis = await this.healer.analyzeWorkflow(workflow);
    const issuesToHeal = issueId
      ? analysis.issues.filter((issue) => issue.id === issueId)
      : analysis.issues.filter(
          (issue) =>
            issue.confidence >= this.config.autoHealingThreshold &&
            !this.config.requireApprovalFor.includes(issue.severity),
        );

    const results: HealingResult[] = [];

    for (const issue of issuesToHeal) {
      try {
        const result = await this.healer.applyHealing(workflowId, issue);
        results.push(result);

        // Handle healing result
        await this.handleHealingResult(workflowId, issue, result);
      } catch (error) {
        console.error(`Healing failed for issue ${issue.id}:`, error);

        // Create failure result
        const failureResult: HealingResult = {
          success: false,
          strategy: 'unknown',
          executionTime: 0,
          changes: [],
          sideEffects: [],
          newIssues: [],
          resolvedIssues: [],
          metrics: {
            executionTime: 0,
            resourceUsage: { cpu: 0, memory: 0, network: 0 },
            successProbability: 0,
            confidence: 0,
            riskScore: 1,
          },
          summary: `Healing failed: ${error}`,
        };
        results.push(failureResult);
      }
    }

    return results;
  }

  async getWorkflowHealth(workflowId: string): Promise<WorkflowHealth> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    return await this.healer.getHealthStatus(workflowId);
  }

  async getAllWorkflowHealth(): Promise<Record<string, WorkflowHealth>> {
    const healthStatus: Record<string, WorkflowHealth> = {};

    for (const workflowId of this.workflows.keys()) {
      try {
        healthStatus[workflowId] = await this.getWorkflowHealth(workflowId);
      } catch (error) {
        console.error(`Failed to get health for workflow ${workflowId}:`, error);
      }
    }

    return healthStatus;
  }

  async updateConfiguration(config: Partial<HealingIntegrationConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    await this.healer.configureHealing(this.config);
  }

  async getConfiguration(): Promise<HealingIntegrationConfig> {
    return { ...this.config };
  }

  // Private methods
  private createDefaultConfig(
    userConfig: Partial<HealingIntegrationConfig>,
  ): HealingIntegrationConfig {
    return {
      // Base healing config
      enabled: true,
      automationLevel: 'assisted',
      detectionInterval: 30000,
      issueRetentionPeriod: 86400000,
      maxConcurrentHealings: 3,
      healingTimeout: 300000,
      autoHealThreshold: 0.8,
      requireApprovalFor: ['critical'],
      blacklistStrategies: [],
      rollbackOnError: true,
      enablePredictiveAnalysis: true,
      healthCheckInterval: 60000,
      metricsRetentionPeriod: 604800000,
      monitoringIntegration: {
        enabled: true,
        metricsEndpoint: '',
        alertEndpoint: '',
        healthCheckEndpoint: '',
      },
      kanbanIntegration: {
        enabled: true,
        boardId: '',
        createHealingTasks: true,
        updateTaskStatus: true,
        taskPriority: 'P1',
        customFields: {},
      },
      alertingIntegration: {
        enabled: true,
        channels: [],
        severityThresholds: {
          low: 0.1,
          medium: 0.3,
          high: 0.7,
          critical: 0.9,
        },
        cooldownPeriod: 300000,
        escalationPolicy: {
          enabled: true,
          levels: [],
          timeout: 600000,
        },
      },

      // Integration config
      enableKanbanIntegration: true,
      enableMonitoringIntegration: true,
      enableAlertingIntegration: true,
      kanbanBoardId: '',
      kanbanApiEndpoint: '',
      createHealingTasks: true,
      healingTaskPriority: 'P1',
      metricsCollectionInterval: 30000,
      anomalyDetectionSensitivity: 0.7,
      alertChannels: [],
      alertCooldownPeriod: 300000,
      escalationPolicy: {
        enabled: true,
        levels: [],
        timeout: 600000,
      },
      autoHealingEnabled: true,
      autoHealingThreshold: 0.8,

      ...userConfig,
    };
  }

  private async initializeKanbanIntegration(): Promise<void> {
    if (!this.config.kanbanBoardId) {
      console.warn('Kanban integration enabled but no board ID provided');
      return;
    }

    // In a real implementation, this would initialize the kanban client
    console.log('Kanban integration initialized');
  }

  private async initializeMonitoringIntegration(): Promise<void> {
    // In a real implementation, this would initialize the monitoring client
    console.log('Monitoring integration initialized');
  }

  private async initializeAlertingIntegration(): Promise<void> {
    // In a real implementation, this would initialize the alerting client
    console.log('Alerting integration initialized');
  }

  private async handleHealthUpdate(workflowId: string, health: WorkflowHealth): Promise<void> {
    // Check if auto-healing should be triggered
    if (this.config.autoHealingEnabled && health.status !== 'healthy') {
      const criticalIssues = health.activeIssues.filter((_issueId) => {
        // In a real implementation, we'd get the issue details
        return true; // Simplified for demo
      });

      if (criticalIssues.length > 0) {
        try {
          await this.healWorkflow(workflowId);
        } catch (error) {
          console.error(`Auto-healing failed for workflow ${workflowId}:`, error);
        }
      }
    }

    // Send alerts if needed
    if (this.config.enableAlertingIntegration) {
      await this.sendHealthAlerts(workflowId, health);
    }

    // Update kanban if needed
    if (this.config.enableKanbanIntegration && this.config.createHealingTasks) {
      await this.updateKanbanTasks(workflowId, health);
    }
  }

  private async handleHealingResult(
    workflowId: string,
    issue: WorkflowIssue,
    result: HealingResult,
  ): Promise<void> {
    if (result.success) {
      console.log(`Successfully healed issue ${issue.id} in workflow ${workflowId}`);

      // Send success notification
      if (this.config.enableAlertingIntegration) {
        await this.sendHealingAlert(workflowId, issue, result, 'success');
      }
    } else {
      console.error(`Failed to heal issue ${issue.id} in workflow ${workflowId}`);

      // Send failure notification and potentially escalate
      if (this.config.enableAlertingIntegration) {
        await this.sendHealingAlert(workflowId, issue, result, 'failure');
        await this.escalateIssue(workflowId, issue, result);
      }
    }

    // Update kanban tasks
    if (this.config.enableKanbanIntegration) {
      await this.updateHealingTasks(workflowId, issue, result);
    }
  }

  private async sendHealthAlerts(workflowId: string, health: WorkflowHealth): Promise<void> {
    // In a real implementation, this would send alerts to configured channels
    console.log(`Health alert for workflow ${workflowId}: ${health.status}`);
  }

  private async updateKanbanTasks(workflowId: string, _health: WorkflowHealth): Promise<void> {
    // In a real implementation, this would create/update kanban tasks
    console.log(`Updating kanban tasks for workflow ${workflowId}`);
  }

  private async sendHealingAlert(
    workflowId: string,
    issue: WorkflowIssue,
    _result: HealingResult,
    status: 'success' | 'failure',
  ): Promise<void> {
    // In a real implementation, this would send healing alerts
    console.log(`Healing ${status} alert for workflow ${workflowId}, issue ${issue.id}`);
  }

  private async escalateIssue(
    workflowId: string,
    issue: WorkflowIssue,
    _result: HealingResult,
  ): Promise<void> {
    // In a real implementation, this would escalate the issue
    console.log(`Escalating issue ${issue.id} in workflow ${workflowId}`);
  }

  private async updateHealingTasks(
    workflowId: string,
    issue: WorkflowIssue,
    _result: HealingResult,
  ): Promise<void> {
    // In a real implementation, this would update kanban tasks
    console.log(`Updating healing tasks for workflow ${workflowId}, issue ${issue.id}`);
  }
}
