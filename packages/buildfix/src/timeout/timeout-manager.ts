import { EventEmitter } from 'events';

/**
 * Timeout configuration for different operation types
 */
export interface TimeoutConfig {
  /** Default timeout in milliseconds */
  default: number;
  /** Process execution timeout (spawn, exec) */
  process: number;
  /** Ollama API call timeout */
  ollama: number;
  /** TypeScript compilation timeout */
  tsc: number;
  /** Git operation timeout */
  git: number;
  /** File I/O timeout */
  fileIO: number;
  /** BuildFix main operation timeout */
  buildfix: number;
  /** Benchmark timeout */
  benchmark: number;
}

/**
 * Default timeout configurations (in milliseconds)
 */
export const DEFAULT_TIMEOUTS: TimeoutConfig = {
  default: 30000, // 30 seconds
  process: 60000, // 1 minute
  ollama: 120000, // 2 minutes
  tsc: 180000, // 3 minutes
  git: 90000, // 1.5 minutes
  fileIO: 30000, // 30 seconds
  buildfix: 600000, // 10 minutes
  benchmark: 1800000, // 30 minutes
};

/**
 * Timeout error types
 */
export class TimeoutError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly timeoutMs: number,
    public readonly actualDuration?: number,
  ) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Timeout event data
 */
export interface TimeoutEvent {
  operation: string;
  timeoutMs: number;
  actualDuration: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Comprehensive timeout manager for BuildFix operations
 */
export class TimeoutManager extends EventEmitter {
  private activeTimeouts = new Map<string, NodeJS.Timeout>();
  private operationStartTimes = new Map<string, number>();

  constructor(private config: TimeoutConfig = DEFAULT_TIMEOUTS) {
    super();
  }

  /**
   * Get timeout for a specific operation type
   */
  getTimeout(operation: keyof TimeoutConfig): number {
    return this.config[operation] ?? this.config.default;
  }

  /**
   * Update timeout configuration
   */
  updateConfig(config: Partial<TimeoutConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Execute a function with timeout protection
   */
  async executeWithTimeout<T>(
    operation: keyof TimeoutConfig,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>,
  ): Promise<T> {
    const operationId = `${operation}-${Date.now()}-${Math.random()}`;
    const timeoutMs = this.getTimeout(operation);
    const startTime = Date.now();

    this.operationStartTimes.set(operationId, startTime);

    try {
      const result = await Promise.race([
        fn(),
        this.createTimeoutPromise(operationId, operation, timeoutMs),
      ]);

      this.clearTimeout(operationId);
      return result;
    } catch (error) {
      this.clearTimeout(operationId);

      if (error instanceof TimeoutError) {
        this.emit('timeout', {
          operation,
          timeoutMs,
          actualDuration: error.actualDuration || Date.now() - startTime,
          timestamp: new Date(),
          metadata,
        } as TimeoutEvent);
      }

      throw error;
    }
  }

  /**
   * Create a timeout promise
   */
  private createTimeoutPromise(
    operationId: string,
    operation: keyof TimeoutConfig,
    timeoutMs: number,
  ): Promise<never> {
    return new Promise((_, reject) => {
      const timeout = setTimeout(() => {
        const startTime = this.operationStartTimes.get(operationId);
        const actualDuration = startTime ? Date.now() - startTime : timeoutMs;

        reject(
          new TimeoutError(
            `Operation ${operation} timed out after ${timeoutMs}ms`,
            operation,
            timeoutMs,
            actualDuration,
          ),
        );
      }, timeoutMs);

      this.activeTimeouts.set(operationId, timeout);
    });
  }

  /**
   * Clear a specific timeout
   */
  private clearTimeout(operationId: string): void {
    const timeout = this.activeTimeouts.get(operationId);
    if (timeout) {
      clearTimeout(timeout);
      this.activeTimeouts.delete(operationId);
    }
    this.operationStartTimes.delete(operationId);
  }

  /**
   * Clear all active timeouts
   */
  clearAllTimeouts(): void {
    Array.from(this.activeTimeouts.values()).forEach((timeout) => clearTimeout(timeout));
    this.activeTimeouts.clear();
    this.operationStartTimes.clear();
  }

  /**
   * Get statistics about active timeouts
   */
  getStats(): {
    activeTimeouts: number;
    longestRunning: { operation: string; duration: number } | null;
  } {
    const now = Date.now();
    let longestRunning: { operation: string; duration: number } | null = null;

    Array.from(this.operationStartTimes.entries()).forEach(([operationId, startTime]) => {
      const duration = now - startTime;
      if (!longestRunning || duration > longestRunning.duration) {
        longestRunning = {
          operation: operationId.split('-')[0] || 'unknown',
          duration,
        };
      }
    });

    return {
      activeTimeouts: this.activeTimeouts.size,
      longestRunning,
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.clearAllTimeouts();
    this.removeAllListeners();
  }

  /**
   * Validate timeout configuration
   */
  validateTimeoutConfig(config: Partial<TimeoutConfig>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Check for negative values
    for (const [key, value] of Object.entries(config)) {
      if (typeof value === 'number' && value <= 0) {
        errors.push(`Timeout ${key} must be positive, got ${value}`);
      }
    }
    
    // Check for reasonable ranges
    if (config.ollama && config.ollama > 600000) {
      errors.push('Ollama timeout should not exceed 10 minutes for good user experience');
    }
    
    if (config.buildfix && config.buildfix > 3600000) {
      errors.push('BuildFix timeout should not exceed 1 hour to prevent hanging');
    }
    
    if (config.tsc && config.tsc > 600000) {
      errors.push('TypeScript compilation timeout should not exceed 10 minutes');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Global timeout manager instance
 */
export const globalTimeoutManager = new TimeoutManager();

/**
 * Convenience function to execute with timeout using global manager
 */
export function withTimeout<T>(
  operation: keyof TimeoutConfig,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>,
): Promise<T> {
  return globalTimeoutManager.executeWithTimeout(operation, fn, metadata);
}
