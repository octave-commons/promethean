/**
 * Timeout management for pipeline steps
 */

import { EventEmitter } from 'events';
import { TimeoutConfig } from './types.js';

export class TimeoutManager extends EventEmitter {
  private timeouts: Map<string, NodeJS.Timeout> = new Map();
  private warnings: Map<string, NodeJS.Timeout> = new Map();

  constructor(private config: TimeoutConfig) {
    super();
  }

  startTimer(stepId: string, customTimeout?: number): void {
    const timeout = customTimeout || this.config.step[stepId] || this.config.default;

    // Clear any existing timers for this step
    this.clearTimer(stepId);

    // Set warning timeout at 80% of total timeout
    const warningTime = Math.floor(timeout * 0.8);
    const warningTimer = setTimeout(() => {
      this.emit('timeout:warning', {
        stepId,
        remainingTime: timeout - warningTime,
        message: `Step ${stepId} approaching timeout in ${timeout - warningTime}ms`,
      });
    }, warningTime);

    this.warnings.set(stepId, warningTimer);

    // Set actual timeout
    const timeoutTimer = setTimeout(() => {
      this.emit('timeout:reached', {
        stepId,
        timeout,
        message: `Step ${stepId} timed out after ${timeout}ms`,
      });

      this.clearTimer(stepId);
    }, timeout);

    this.timeouts.set(stepId, timeoutTimer);
  }

  clearTimer(stepId: string): void {
    const timeout = this.timeouts.get(stepId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(stepId);
    }

    const warning = this.warnings.get(stepId);
    if (warning) {
      clearTimeout(warning);
      this.warnings.delete(stepId);
    }
  }

  clearAllTimers(): void {
    for (const stepId of this.timeouts.keys()) {
      this.clearTimer(stepId);
    }
  }

  getRemainingTime(_stepId: string): number | null {
    // This would require tracking start times - simplified implementation
    return null;
  }

  isTimerActive(stepId: string): boolean {
    return this.timeouts.has(stepId);
  }

  getActiveTimers(): string[] {
    return Array.from(this.timeouts.keys());
  }

  updateConfig(newConfig: Partial<TimeoutConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getStepTimeout(stepId: string): number {
    return this.config.step[stepId] || this.config.default;
  }

  setStepTimeout(stepId: string, timeout: number): void {
    this.config.step[stepId] = timeout;
  }

  // Adaptive timeout based on historical performance
  calculateAdaptiveTimeout(
    stepId: string,
    historicalData: { averageDuration: number; maxDuration: number },
  ): number {
    const baseTimeout = this.getStepTimeout(stepId);

    switch (this.config.strategy) {
      case 'graceful':
        // Use 150% of max historical duration
        return Math.max(baseTimeout, Math.floor(historicalData.maxDuration * 1.5));

      case 'retry':
        // Use 200% of average duration
        return Math.max(baseTimeout, Math.floor(historicalData.averageDuration * 2));

      case 'fail-fast':
      default:
        // Use configured timeout
        return baseTimeout;
    }
  }

  // Get timeout statistics
  getStats(): {
    totalTimers: number;
    activeTimers: string[];
    configSummary: {
      default: number;
      stepSpecific: number;
      strategy: string;
    };
  } {
    return {
      totalTimers: this.timeouts.size,
      activeTimers: this.getActiveTimers(),
      configSummary: {
        default: this.config.default,
        stepSpecific: Object.keys(this.config.step).length,
        strategy: this.config.strategy,
      },
    };
  }
}
