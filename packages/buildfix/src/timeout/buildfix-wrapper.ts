import { globalTimeoutManager, withTimeout, TimeoutError } from './timeout-manager.js';
import { ProcessWrapper } from './process-wrapper.js';
import { globalOllamaWrapper } from './ollama-wrapper.js';
import { BuildFix, FixOptions, FixResult } from '../buildfix.js';
import { tsc, run, git } from '../utils.js';

/**
 * Enhanced BuildFix options with timeout support
 */
export interface BuildFixTimeoutOptions extends Omit<FixOptions, 'filePath'> {
  /** File path to fix (required for operation) */
  filePath?: string;
  /** Custom timeout for the entire BuildFix operation */
  timeout?: number;
  /** Timeout per attempt */
  attemptTimeout?: number;
  /** Timeout for TypeScript compilation */
  tscTimeout?: number;
  /** Timeout for Ollama API calls */
  ollamaTimeout?: number;
  /** Timeout for file operations */
  fileTimeout?: number;
  /** Whether to enable resource monitoring */
  enableMonitoring?: boolean;
  /** Maximum memory usage per attempt */
  maxMemory?: number;
  /** Maximum CPU usage per attempt */
  maxCpu?: number;
}

/**
 * BuildFix execution result with detailed timing information
 */
export interface BuildFixTimeoutResult extends FixResult {
  /** Total execution duration */
  totalDuration: number;
  /** Duration per attempt */
  attemptDurations: number[];
  /** Number of timeouts that occurred */
  timeouts: number;
  /** Resource usage statistics */
  resourceUsage?: {
    maxMemoryUsage: number;
    maxCpuUsage: number;
  };
  /** Timeout details */
  timeoutDetails?: Array<{
    attempt: number;
    operation: string;
    timeoutMs: number;
    actualDuration: number;
  }>;
}

/**
 * Enhanced BuildFix wrapper with comprehensive timeout handling
 */
export class BuildFixWrapper {
  private buildFix: BuildFix;
  private config: BuildFixTimeoutOptions;

  constructor(config: BuildFixTimeoutOptions = {}) {
    this.buildFix = new BuildFix(config as FixOptions);
    this.config = {
      timeout: config.timeout || globalTimeoutManager.getTimeout('buildfix'),
      attemptTimeout: config.attemptTimeout || 180000, // 3 minutes per attempt
      tscTimeout: config.tscTimeout || globalTimeoutManager.getTimeout('tsc'),
      ollamaTimeout: config.ollamaTimeout || globalTimeoutManager.getTimeout('ollama'),
      fileTimeout: config.fileTimeout || globalTimeoutManager.getTimeout('fileIO'),
      enableMonitoring: config.enableMonitoring || false,
      maxMemory: config.maxMemory || 512 * 1024 * 1024, // 512MB
      maxCpu: config.maxCpu || 80, // 80% CPU
      ...config,
    };
  }

  /**
   * Execute BuildFix with comprehensive timeout protection
   */
  async fixErrorsWithTimeout(
    source: string,
    options: BuildFixTimeoutOptions,
  ): Promise<BuildFixTimeoutResult> {
    const startTime = Date.now();
    const mergedOptions = { ...this.config, ...options, filePath: options.filePath || '' };
    const attemptDurations: number[] = [];
    const timeoutDetails: Array<{
      attempt: number;
      operation: string;
      timeoutMs: number;
      actualDuration: number;
    }> = [];
    let timeouts = 0;
    let resourceUsage: { maxMemoryUsage: number; maxCpuUsage: number } | undefined;

    try {
      return await withTimeout(
        'buildfix',
        async () => {
          // Execute the original BuildFix logic with timeout protection
          const result = await this.executeBuildFixWithTimeouts(source, mergedOptions, {
            attemptDurations,
            timeoutDetails,
            timeouts,
            startTime,
          });

          if (mergedOptions.enableMonitoring) {
            resourceUsage = {
              maxMemoryUsage: 0, // Would be populated by monitoring
              maxCpuUsage: 0,
            };
          }

          return {
            ...result,
            totalDuration: Date.now() - startTime,
            attemptDurations,
            timeouts,
            resourceUsage,
            timeoutDetails: timeoutDetails.length > 0 ? timeoutDetails : undefined,
          };
        },
        { source, options: mergedOptions },
      );
    } catch (error) {
      if (error instanceof TimeoutError) {
        timeoutDetails.push({
          attempt: 0,
          operation: error.operation,
          timeoutMs: error.timeoutMs,
          actualDuration: error.actualDuration || 0,
        });
        timeouts++;
      }

      return {
        success: false,
        errorCountBefore: 0,
        errorCountAfter: 0,
        errorsResolved: false,
        planGenerated: false,
        attempts: 0,
        duration: Date.now() - startTime,
        totalDuration: Date.now() - startTime,
        attemptDurations,
        timeouts,
        error: error instanceof Error ? error.message : String(error),
        model: mergedOptions.model || 'unknown',
        attemptDetails: [],
        timeoutDetails: timeoutDetails.length > 0 ? timeoutDetails : undefined,
      };
    }
  }

  /**
   * Execute BuildFix with per-operation timeout protection
   */
  private async executeBuildFixWithTimeouts(
    source: string,
    options: BuildFixTimeoutOptions,
    context: {
      attemptDurations: number[];
      timeoutDetails: Array<{
        attempt: number;
        operation: string;
        timeoutMs: number;
        actualDuration: number;
      }>;
      timeouts: number;
      startTime: number;
    },
  ): Promise<FixResult> {
    // Override the utility functions with timeout-protected versions
    const originalTsc = tsc;
    const originalRun = run;
    const originalGit = git;

    // Temporarily replace utility functions with timeout-protected versions
    (globalThis as any).tsc = async (tsconfig: string) => {
      return withTimeout(
        'tsc',
        async () => {
          const result = await originalTsc(tsconfig);
          return result;
        },
        { tsconfig },
      );
    };

    (globalThis as any).run = async (
      command: string,
      args: ReadonlyArray<string> = [],
      runOptions: any = {},
    ) => {
      return ProcessWrapper.execute(command, args, {
        ...runOptions,
        timeout: options.tscTimeout,
      });
    };

    (globalThis as any).git = async (args: ReadonlyArray<string>, cwd = process.cwd()) => {
      return withTimeout(
        'git',
        async () => {
          return originalGit(args, cwd);
        },
        { args, cwd },
      );
    };

    // Override Ollama calls with timeout protection
    const originalOllamaGenerate = globalOllamaWrapper.generateJSON.bind(globalOllamaWrapper);
    (globalOllamaWrapper as any).generateJSON = async (
      model: string,
      prompt: string,
      ollamaOptions: any = {},
    ) => {
      return withTimeout(
        'ollama',
        async () => {
          const result = await originalOllamaGenerate(model, prompt, {
            ...ollamaOptions,
            timeout: options.ollamaTimeout,
          });
          return result;
        },
        { model, prompt, options: ollamaOptions },
      );
    };

    try {
      // Execute the original BuildFix logic
      const result = await this.buildFix.fixErrors(source, options as FixOptions);

      // Track attempt durations
      if (result.attemptDetails) {
        for (const detail of result.attemptDetails) {
          context.attemptDurations.push(detail.durationMs);
        }
      }

      return result;
    } finally {
      // Restore original functions
      (globalThis as any).tsc = originalTsc;
      (globalThis as any).run = originalRun;
      (globalThis as any).git = originalGit;
      globalOllamaWrapper.generateJSON = originalOllamaGenerate;
    }
  }

  /**
   * Execute with resource monitoring
   */
  async fixErrorsWithMonitoring(
    source: string,
    options: BuildFixTimeoutOptions,
  ): Promise<BuildFixTimeoutResult> {
    const monitoringOptions = {
      ...options,
      enableMonitoring: true,
      maxMemory: options.maxMemory || this.config.maxMemory,
      maxCpu: options.maxCpu || this.config.maxCpu,
    };

    return this.fixErrorsWithTimeout(source, monitoringOptions);
  }

  /**
   * Get configuration
   */
  getConfig(): Readonly<BuildFixTimeoutOptions> {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<BuildFixTimeoutOptions>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await ProcessWrapper.killAllProcesses();
    globalTimeoutManager.clearAllTimeouts();
  }
}

/**
 * Global BuildFix wrapper instance
 */
export const globalBuildFixWrapper = new BuildFixWrapper();

/**
 * Convenience function for BuildFix with timeout protection
 */
export async function fixErrorsWithTimeout(
  source: string,
  options: BuildFixTimeoutOptions = {},
): Promise<BuildFixTimeoutResult> {
  const optionsWithFilePath = { ...options, filePath: options.filePath || '' };
  return globalBuildFixWrapper.fixErrorsWithTimeout(source, optionsWithFilePath);
}

/**
 * Convenience function for BuildFix with monitoring
 */
export async function fixErrorsWithMonitoring(
  source: string,
  options: BuildFixTimeoutOptions = {},
): Promise<BuildFixTimeoutResult> {
  const optionsWithFilePath = { ...options, filePath: options.filePath || '' };
  return globalBuildFixWrapper.fixErrorsWithMonitoring(source, optionsWithFilePath);
}
