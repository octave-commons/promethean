/**
 * Parallel execution engine for pipeline steps
 */

import { EventEmitter } from 'events';
import { PipelineStep, ParallelExecutionConfig, ResourceLimits } from './types.js';
import { ResourceMonitor } from './resource-monitor.js';

interface ExecutionPlan {
  steps: PipelineStep[];
  batches: PipelineStep[][];
  estimatedDuration: number;
  resourceRequirements: ResourceLimits;
}

export class ParallelExecutor extends EventEmitter {
  private running = false;
  private currentExecutions = new Map<string, Promise<any>>();
  private resourceMonitor?: ResourceMonitor;

  constructor(
    private config: ParallelExecutionConfig,
    resourceMonitor?: ResourceMonitor,
  ) {
    super();
    this.resourceMonitor = resourceMonitor;
  }

  async execute(steps: PipelineStep[]): Promise<any[]> {
    if (this.running) {
      throw new Error('Executor is already running');
    }

    this.running = true;
    this.emit('executor:started');

    try {
      const plan = this.createExecutionPlan(steps);
      this.emit('plan:created', plan);

      const results = await this.executeBatches(plan.batches);

      this.emit('executor:completed', results);
      return results;
    } finally {
      this.running = false;
      this.currentExecutions.clear();
    }
  }

  private createExecutionPlan(steps: PipelineStep[]): ExecutionPlan {
    const dependencyGraph = this.buildDependencyGraph(steps);
    const batches = this.createBatches(steps, dependencyGraph);

    return {
      steps,
      batches,
      estimatedDuration: this.estimateDuration(batches),
      resourceRequirements: this.calculateResourceRequirements(batches),
    };
  }

  private buildDependencyGraph(steps: PipelineStep[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    for (const step of steps) {
      graph.set(step.id, step.dependencies || []);
    }

    return graph;
  }

  private createBatches(
    steps: PipelineStep[],
    dependencyGraph: Map<string, string[]>,
  ): PipelineStep[][] {
    const batches: PipelineStep[][] = [];
    const executed = new Set<string>();
    const remaining = new Set(steps.map((s) => s.id));

    while (remaining.size > 0) {
      const currentBatch: PipelineStep[] = [];

      for (const step of steps) {
        if (executed.has(step.id) || !remaining.has(step.id)) {
          continue;
        }

        const dependencies = dependencyGraph.get(step.id) || [];
        const canExecute = dependencies.every((dep) => executed.has(dep));

        if (canExecute) {
          currentBatch.push(step);
        }
      }

      if (currentBatch.length === 0) {
        throw new Error('Circular dependency detected in pipeline steps');
      }

      // Limit batch size based on concurrency and resource constraints
      const limitedBatch = this.limitBatchSize(currentBatch);

      batches.push(limitedBatch);

      limitedBatch.forEach((step) => {
        executed.add(step.id);
        remaining.delete(step.id);
      });
    }

    return batches;
  }

  private limitBatchSize(batch: PipelineStep[]): PipelineStep[] {
    if (!this.config.resourceAware || !this.resourceMonitor) {
      // Simple concurrency limit
      return batch.slice(0, this.config.maxConcurrency);
    }

    // Resource-aware batching
    const limitedBatch: PipelineStep[] = [];
    let currentResources: ResourceLimits = { memory: 0, cpu: 0, disk: 0 };

    for (const step of batch) {
      const stepResources = step.resources || { memory: 512, cpu: 25, disk: 100 }; // defaults

      // Check if adding this step would exceed reasonable limits
      const wouldExceed =
        (currentResources.memory || 0) + (stepResources.memory || 0) > 4096 || // 4GB memory limit
        (currentResources.cpu || 0) + (stepResources.cpu || 0) > 100; // 100% CPU limit

      if (wouldExceed && limitedBatch.length > 0) {
        // Don't add this step to current batch to avoid resource exhaustion
        break;
      }

      limitedBatch.push(step);

      currentResources.memory = (currentResources.memory || 0) + (stepResources.memory || 0);
      currentResources.cpu = (currentResources.cpu || 0) + (stepResources.cpu || 0);
      currentResources.disk = (currentResources.disk || 0) + (stepResources.disk || 0);
    }

    return limitedBatch;
  }

  private async executeBatches(batches: PipelineStep[][]): Promise<any[]> {
    const allResults: any[] = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      if (!batch) continue;
      this.emit('batch:started', { batchIndex: i, steps: batch.map((s) => s.id) });

      const batchResults = await this.executeBatch(batch || []);
      allResults.push(...batchResults);

      this.emit('batch:completed', { batchIndex: i, results: batchResults });
    }

    return allResults;
  }

  private async executeBatch(batch: PipelineStep[]): Promise<any[]> {
    if (!this.config.enabled || batch.length === 1) {
      // Sequential execution
      const results = [];
      for (const step of batch) {
        const result = await this.executeStep(step);
        results.push(result);
      }
      return results;
    }

    // Parallel execution
    const promises = batch.map((step) => this.executeStep(step));
    return Promise.allSettled(promises);
  }

  private async executeStep(step: PipelineStep): Promise<any> {
    this.emit('step:started', { stepId: step.id });

    const executionPromise = new Promise((resolve, reject) => {
      // This would integrate with the actual step execution logic
      // For now, simulate execution
      setTimeout(
        () => {
          if (Math.random() > 0.1) {
            // 90% success rate
            resolve({ stepId: step.id, success: true });
          } else {
            reject(new Error(`Step ${step.id} failed`));
          }
        },
        Math.random() * 2000 + 1000,
      ); // 1-3 seconds
    });

    this.currentExecutions.set(step.id, executionPromise);

    try {
      const result = await executionPromise;
      this.emit('step:completed', { stepId: step.id, result });
      return result;
    } catch (error) {
      this.emit('step:failed', { stepId: step.id, error });
      throw error;
    } finally {
      this.currentExecutions.delete(step.id);
    }
  }

  private estimateDuration(batches: PipelineStep[][]): number {
    // Simple estimation: sum of longest step in each batch
    return batches.reduce((total, batch) => {
      const longestStep = Math.max(...batch.map((step) => this.estimateStepDuration(step)));
      return total + longestStep;
    }, 0);
  }

  private estimateStepDuration(step: PipelineStep): number {
    // Base duration estimation - could be enhanced with historical data
    const baseDuration = 30000; // 30 seconds base

    const factors = {
      build: 2.0,
      test: 1.5,
      lint: 0.5,
      deploy: 3.0,
    };

    const stepType = this.getStepType(step);
    const multiplier = factors[stepType as keyof typeof factors] || 1.0;

    return baseDuration * multiplier;
  }

  private getStepType(step: PipelineStep): string {
    const command = step.command.toLowerCase();

    if (command.includes('build') || command.includes('compile')) return 'build';
    if (command.includes('test')) return 'test';
    if (command.includes('lint') || command.includes('eslint')) return 'lint';
    if (command.includes('deploy') || command.includes('publish')) return 'deploy';

    return 'other';
  }

  private calculateResourceRequirements(batches: PipelineStep[][]): ResourceLimits {
    const maxResources: ResourceLimits = { memory: 0, cpu: 0, disk: 0 };

    for (const batch of batches) {
      const batchResources = batch.reduce(
        (acc, step) => ({
          memory: (acc.memory || 0) + (step.resources?.memory || 512),
          cpu: Math.max(acc.cpu || 0, step.resources?.cpu || 25),
          disk: (acc.disk || 0) + (step.resources?.disk || 100),
        }),
        { memory: 0, cpu: 0, disk: 0 },
      );

      maxResources.memory = Math.max(maxResources.memory || 0, batchResources.memory);
      maxResources.cpu = Math.max(maxResources.cpu || 0, batchResources.cpu);
      maxResources.disk = Math.max(maxResources.disk || 0, batchResources.disk);
    }

    return maxResources;
  }

  stop(): void {
    if (this.running) {
      this.emit('executor:stopped');
      this.running = false;

      // Cancel all running executions
      for (const [stepId] of this.currentExecutions) {
        this.emit('step:cancelled', { stepId });
      }

      this.currentExecutions.clear();
    }
  }

  isRunning(): boolean {
    return this.running;
  }

  getRunningSteps(): string[] {
    return Array.from(this.currentExecutions.keys());
  }

  getExecutionStats(): {
    running: boolean;
    activeExecutions: number;
    maxConcurrency: number;
    resourceAware: boolean;
  } {
    return {
      running: this.running,
      activeExecutions: this.currentExecutions.size,
      maxConcurrency: this.config.maxConcurrency,
      resourceAware: this.config.resourceAware,
    };
  }
}
