/**
 * Core automation engine for pipeline execution
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import {
  PipelineConfig,
  PipelineResult,
  StepResult,
  PipelineMetrics,
  AutomationState,
  PipelineStep,
} from './types.js';

export class PipelineAutomation extends EventEmitter {
  private state: AutomationState;
  private currentProcesses: Map<string, ChildProcess> = new Map();

  constructor(private config: PipelineConfig) {
    super();
    this.state = {
      running: false,
      metrics: {
        totalDuration: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        diskUsage: 0,
      },
      errors: [],
    };
  }

  async execute(): Promise<PipelineResult> {
    const startTime = Date.now();
    this.state.running = true;
    this.state.startTime = new Date();
    this.state.currentPipeline = this.config.name;

    this.emit('pipeline:start', { pipeline: this.config.name });

    try {
      const steps = await this.executeSteps();
      const duration = Date.now() - startTime;

      const result: PipelineResult = {
        success: steps.every((step) => step.success),
        duration,
        steps,
        metrics: await this.collectMetrics(),
      };

      if (result.success) {
        this.emit('pipeline:success', result);
      } else {
        this.emit('pipeline:failure', result);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: PipelineResult = {
        success: false,
        duration,
        steps: [],
        errors: [error instanceof Error ? error.message : String(error)],
        metrics: await this.collectMetrics(),
      };

      this.emit('pipeline:error', result);
      return result;
    } finally {
      this.state.running = false;
      this.state.currentPipeline = undefined;
      this.state.currentStep = undefined;
    }
  }

  private async executeSteps(): Promise<StepResult[]> {
    const results: StepResult[] = [];
    const executed = new Set<string>();

    // Execute steps in topological order with parallel execution where possible
    while (executed.size < this.config.steps.length) {
      const readySteps = this.config.steps.filter(
        (step) =>
          !executed.has(step.id) && (step.dependencies || []).every((dep) => executed.has(dep)),
      );

      if (readySteps.length === 0) {
        throw new Error('Circular dependency detected in pipeline steps');
      }

      // Execute ready steps in parallel if configured
      if (this.config.parallel) {
        const parallelResults = await Promise.allSettled(
          readySteps.map((step) => this.executeStep(step)),
        );

        parallelResults.forEach((result, index) => {
          const readyStep = readySteps[index];
          if (!readyStep) return;

          if (result.status === 'fulfilled') {
            results.push(result.value);
            executed.add(readyStep.id);
          } else {
            const stepResult: StepResult = {
              id: readyStep.id,
              name: readyStep.name,
              success: false,
              duration: 0,
              startTime: new Date(),
              endTime: new Date(),
              error: result.reason instanceof Error ? result.reason.message : String(result.reason),
            };
            results.push(stepResult);
            executed.add(readyStep.id);
          }
        });
      } else {
        // Sequential execution
        for (const step of readySteps) {
          const stepResult = await this.executeStep(step);
          results.push(stepResult);
          executed.add(step.id);

          // Stop on failure if not configured to continue
          if (!stepResult.success && this.config.retries === 0) {
            throw new Error(`Step ${step.name} failed: ${stepResult.error}`);
          }
        }
      }
    }

    return results;
  }

  private async executeStep(step: PipelineStep): Promise<StepResult> {
    const startTime = new Date();
    this.state.currentStep = step.id;

    this.emit('step:start', { step: step.id, name: step.name });

    const stepTimeout = step.timeout || this.config.timeout || 300000; // 5 minutes default
    const maxRetries = step.retries || this.config.retries || 0;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await this.executeStepWithTimeout(step, stepTimeout);
        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();

        const stepResult: StepResult = {
          id: step.id,
          name: step.name,
          success: true,
          duration,
          startTime,
          endTime,
          metrics: await this.collectStepMetrics(step.id),
        };

        this.emit('step:success', stepResult);
        return stepResult;
      } catch (error) {
        if (attempt === maxRetries) {
          const endTime = new Date();
          const duration = endTime.getTime() - startTime.getTime();

          const stepResult: StepResult = {
            id: step.id,
            name: step.name,
            success: false,
            duration,
            startTime,
            endTime,
            error: error instanceof Error ? error.message : String(error),
          };

          this.emit('step:failure', stepResult);
          return stepResult;
        }

        this.emit('step:retry', {
          step: step.id,
          attempt: attempt + 1,
          error: error instanceof Error ? error.message : String(error),
        });

        // Wait before retry with exponential backoff
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }

    // This should never be reached
    throw new Error(`Step ${step.name} failed after ${maxRetries} retries`);
  }

  private async executeStepWithTimeout(step: PipelineStep, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(step.command, {
        shell: true,
        stdio: 'pipe',
        env: { ...process.env, ...this.getStepEnvironment(step) },
      });

      this.currentProcesses.set(step.id, child);

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
        this.emit('step:output', { step: step.id, stream: 'stdout', data: data.toString() });
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
        this.emit('step:output', { step: step.id, stream: 'stderr', data: data.toString() });
      });

      const timeoutHandle = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`Step ${step.name} timed out after ${timeout}ms`));
      }, timeout);

      child.on('close', (code) => {
        clearTimeout(timeoutHandle);
        this.currentProcesses.delete(step.id);

        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Step ${step.name} failed with exit code ${code}\n${stderr}`));
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeoutHandle);
        this.currentProcesses.delete(step.id);
        reject(error);
      });
    });
  }

  private getStepEnvironment(step: PipelineStep): Record<string, string> {
    const env: Record<string, string> = {};

    if (step.resources) {
      if (step.resources.memory) {
        env['STEP_MEMORY_LIMIT'] = step.resources.memory.toString();
      }
      if (step.resources.cpu) {
        env['STEP_CPU_LIMIT'] = step.resources.cpu.toString();
      }
    }

    return env;
  }

  private async collectMetrics(): Promise<PipelineMetrics> {
    // Basic metrics collection - would be enhanced with actual system monitoring
    return {
      totalDuration: 0,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      cpuUsage: 0, // Would need actual CPU monitoring
      diskUsage: 0, // Would need actual disk monitoring
    };
  }

  private async collectStepMetrics(_stepId: string): Promise<any> {
    // Basic step metrics - would be enhanced with actual monitoring
    return {
      memoryPeak: 0,
      cpuAverage: 0,
      diskUsage: 0,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  stop(): void {
    // Kill all running processes
    for (const [stepId, process] of this.currentProcesses) {
      this.emit('step:killed', { step: stepId });
      process.kill('SIGTERM');
    }
    this.currentProcesses.clear();

    this.state.running = false;
    this.emit('pipeline:stopped');
  }

  getState(): AutomationState {
    return { ...this.state };
  }

  isRunning(): boolean {
    return this.state.running;
  }
}
