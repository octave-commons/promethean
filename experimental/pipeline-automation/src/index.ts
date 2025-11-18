/**
 * Main pipeline automation integration
 * Brings together all components for comprehensive pipeline automation
 */

import { EventEmitter } from 'events';
import { PipelineAutomation } from './automation-core.js';
import { BuildFixIntegration } from './buildfix-integration.js';
import { ResourceMonitor } from './resource-monitor.js';
import { TimeoutManager } from './timeout-manager.js';
import { ParallelExecutor } from './parallel-executor.js';
import { AlertingSystem } from './alerting-system.js';
import {
  PipelineConfig,
  PipelineStep,
  BuildFixConfig,
  ResourceMonitorConfig,
  TimeoutConfig,
  ParallelExecutionConfig,
  MonitoringConfig,
  AutomationState,
} from './types.js';

export interface PipelineAutomationConfig {
  buildFix: BuildFixConfig;
  resourceMonitor: ResourceMonitorConfig;
  timeout: TimeoutConfig;
  parallel: ParallelExecutionConfig;
  monitoring: MonitoringConfig;
}

export class PipelineOrchestrator extends EventEmitter {
  private automation: PipelineAutomation;
  private buildFix: BuildFixIntegration;
  private resourceMonitor: ResourceMonitor;
  private timeoutManager: TimeoutManager;
  private parallelExecutor: ParallelExecutor;
  private alertingSystem: AlertingSystem;

  constructor(
    private pipelineConfig: PipelineConfig,
    private automationConfig: PipelineAutomationConfig,
  ) {
    super();
    // Initialize all components
    this.buildFix = new BuildFixIntegration(automationConfig.buildFix);
    this.resourceMonitor = new ResourceMonitor(automationConfig.resourceMonitor);
    this.timeoutManager = new TimeoutManager(automationConfig.timeout);
    this.parallelExecutor = new ParallelExecutor(automationConfig.parallel, this.resourceMonitor);
    this.alertingSystem = new AlertingSystem(automationConfig.monitoring);

    // Initialize main automation with enhanced capabilities
    this.automation = new PipelineAutomation(pipelineConfig);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Pipeline level events
    this.automation.on('pipeline:start', async (data) => {
      await this.alertingSystem.sendAlert(
        'pipeline_start',
        `Pipeline ${data.pipeline} started`,
        'info',
        { pipeline: data.pipeline },
      );
      this.resourceMonitor.start();
    });

    this.automation.on('pipeline:success', async (data) => {
      await this.alertingSystem.sendAlert(
        'pipeline_success',
        `Pipeline ${this.pipelineConfig.name} completed successfully`,
        'info',
        {
          pipeline: this.pipelineConfig.name,
          metrics: data.metrics,
        },
      );
      this.resourceMonitor.stop();
    });

    this.automation.on('pipeline:failure', async (data) => {
      await this.alertingSystem.sendAlert(
        'pipeline_failure',
        `Pipeline ${this.pipelineConfig.name} failed: ${data.errors?.join(', ')}`,
        'critical',
        {
          pipeline: this.pipelineConfig.name,
          metrics: data.metrics,
        },
      );
      this.resourceMonitor.stop();
    });

    this.automation.on('pipeline:error', async (data) => {
      await this.alertingSystem.sendAlert(
        'pipeline_error',
        `Pipeline ${this.pipelineConfig.name} error: ${data.errors?.join(', ')}`,
        'error',
        {
          pipeline: this.pipelineConfig.name,
          metrics: data.metrics,
        },
      );
    });

    // Step level events
    this.automation.on('step:start', async (data) => {
      this.timeoutManager.startTimer(data.step);
      await this.alertingSystem.sendAlert('step_start', `Step ${data.name} started`, 'info', {
        pipeline: this.pipelineConfig.name,
        step: data.step,
      });
    });

    this.automation.on('step:success', async (data) => {
      this.timeoutManager.clearTimer(data.id);
      await this.alertingSystem.sendAlert(
        'step_success',
        `Step ${data.name} completed successfully`,
        'info',
        {
          pipeline: this.pipelineConfig.name,
          step: data.id,
          metrics: data.metrics,
        },
      );
    });

    this.automation.on('step:failure', async (data) => {
      this.timeoutManager.clearTimer(data.id);

      // Attempt BuildFix if configured
      if (this.automationConfig.buildFix.enabled) {
        await this.attemptBuildFix(data);
      }

      await this.alertingSystem.sendAlert(
        'step_failure',
        `Step ${data.name} failed: ${data.error}`,
        'error',
        {
          pipeline: this.pipelineConfig.name,
          step: data.id,
        },
      );
    });

    this.automation.on('step:retry', async (data) => {
      await this.alertingSystem.sendAlert(
        'step_retry',
        `Retrying step ${data.step} (attempt ${data.attempt})`,
        'warning',
        {
          pipeline: this.pipelineConfig.name,
          step: data.step,
        },
      );
    });

    // Resource monitoring events
    this.resourceMonitor.on('resource:alert', async (alert) => {
      await this.alertingSystem.sendAlert(
        `resource_${alert.type}`,
        `Resource ${alert.type} ${alert.severity}: ${alert.value}%`,
        alert.severity as 'warning' | 'critical',
        {
          pipeline: this.pipelineConfig.name,
          metrics: { [alert.type]: alert.value },
        },
      );
    });

    // Timeout events
    this.timeoutManager.on('timeout:warning', async (data) => {
      await this.alertingSystem.sendAlert('timeout_warning', data.message, 'warning', {
        pipeline: this.pipelineConfig.name,
        step: data.stepId,
      });
    });

    this.timeoutManager.on('timeout:reached', async (data) => {
      await this.alertingSystem.sendAlert('timeout_reached', data.message, 'critical', {
        pipeline: this.pipelineConfig.name,
        step: data.stepId,
      });
    });
  }

  private async attemptBuildFix(stepData: any): Promise<void> {
    try {
      const step = this.pipelineConfig.steps.find((s) => s.id === stepData.id);
      if (!step) return;

      const buildFixResult = await this.buildFix.applyBuildFix(step, stepData.error || '');

      if (buildFixResult.success) {
        await this.alertingSystem.sendAlert(
          'buildfix_success',
          `BuildFix successfully resolved ${buildFixResult.errorsResolved} errors for step ${stepData.id}`,
          'info',
          {
            pipeline: this.pipelineConfig.name,
            step: stepData.id,
            metrics: {
              errorsResolved: buildFixResult.errorsResolved,
              patchesGenerated: buildFixResult.patchesGenerated,
            },
          },
        );
      } else {
        await this.alertingSystem.sendAlert(
          'buildfix_failure',
          `BuildFix failed to resolve errors for step ${stepData.id}`,
          'error',
          {
            pipeline: this.pipelineConfig.name,
            step: stepData.id,
          },
        );
      }
    } catch (error) {
      await this.alertingSystem.sendAlert(
        'buildfix_error',
        `BuildFix error for step ${stepData.id}: ${error instanceof Error ? error.message : String(error)}`,
        'error',
        {
          pipeline: this.pipelineConfig.name,
          step: stepData.id,
        },
      );
    }
  }

  async execute(): Promise<any> {
    try {
      // Validate BuildFix environment if enabled
      if (this.automationConfig.buildFix.enabled) {
        const isValid = await this.buildFix.validateBuildFixEnvironment();
        if (!isValid) {
          await this.alertingSystem.sendAlert(
            'buildfix_validation',
            'BuildFix environment validation failed',
            'warning',
            { pipeline: this.pipelineConfig.name },
          );
        }
      }

      // Execute the pipeline with all enhancements
      return await this.automation.execute();
    } catch (error) {
      await this.alertingSystem.sendAlert(
        'orchestrator_error',
        `Pipeline orchestrator error: ${error instanceof Error ? error.message : String(error)}`,
        'critical',
        { pipeline: this.pipelineConfig.name },
      );
      throw error;
    }
  }

  stop(): void {
    this.automation.stop();
    this.resourceMonitor.stop();
    this.timeoutManager.clearAllTimers();
    this.parallelExecutor.stop();
  }

  getState(): AutomationState & {
    resourceMonitoring: boolean;
    activeTimers: string[];
    parallelExecution: any;
    alertProviders: string[];
  } {
    return {
      ...this.automation.getState(),
      resourceMonitoring: this.resourceMonitor.isMonitoring(),
      activeTimers: this.timeoutManager.getActiveTimers(),
      parallelExecution: this.parallelExecutor.getExecutionStats(),
      alertProviders: this.alertingSystem.getProviders(),
    };
  }

  async getHealthStatus(): Promise<{
    automation: boolean;
    buildFix: boolean;
    resourceMonitor: boolean;
    alertProviders: Record<string, boolean>;
  }> {
    return {
      automation: this.automation.isRunning(),
      buildFix: await this.buildFix.validateBuildFixEnvironment(),
      resourceMonitor: this.resourceMonitor.isMonitoring(),
      alertProviders: await this.alertingSystem.checkProviderHealth(),
    };
  }
}

// Factory function to create orchestrator from existing pipelines.json
export function createOrchestratorFromPipelineConfig(
  pipelineName: string,
  pipelinesJson: any,
  customConfig?: Partial<PipelineAutomationConfig>,
): PipelineOrchestrator {
  const pipeline = pipelinesJson.pipelines.find((p: any) => p.name === pipelineName);
  if (!pipeline) {
    throw new Error(`Pipeline ${pipelineName} not found in pipelines.json`);
  }

  // Convert pipeline steps to our format
  const steps: PipelineStep[] = pipeline.steps.map(
    (step: any): PipelineStep => ({
      id: step.id,
      name: step.id,
      command: step.shell || `node ${step.js?.module || ''}`,
      timeout: step.timeout,
      dependencies: step.deps,
      buildFix: {
        enabled: true,
        model: 'qwen3:8b',
        maxAttempts: 3,
        timeoutMs: 30000,
        errorContext: true,
        fixStrategy: 'conservative',
        autoApply: false,
      },
      monitoring: true,
    }),
  );

  const pipelineConfig: PipelineConfig = {
    name: pipeline.name,
    steps,
    timeout: 600000, // 10 minutes default
    retries: 2,
    parallel: true,
  };

  // Default automation configuration
  const defaultConfig: PipelineAutomationConfig = {
    buildFix: {
      enabled: true,
      model: 'qwen3:8b',
      maxAttempts: 3,
      timeoutMs: 30000,
      errorContext: true,
      fixStrategy: 'conservative',
      autoApply: false,
    },
    resourceMonitor: {
      enabled: true,
      interval: 5,
      thresholds: {
        memory: 80,
        cpu: 90,
        disk: 85,
      },
      actions: {
        warning: 'log',
        critical: 'alert',
      },
    },
    timeout: {
      default: 300000,
      step: {},
      strategy: 'graceful',
    },
    parallel: {
      enabled: true,
      maxConcurrency: 4,
      dependencyResolution: 'auto',
      resourceAware: true,
    },
    monitoring: {
      enabled: true,
      metrics: ['memory', 'cpu', 'disk', 'duration'],
      alerts: [],
      interval: 10,
    },
  };

  const automationConfig = {
    ...defaultConfig,
    ...customConfig,
  };

  return new PipelineOrchestrator(pipelineConfig, automationConfig);
}
