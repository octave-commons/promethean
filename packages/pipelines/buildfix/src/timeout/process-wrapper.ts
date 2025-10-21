import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { globalTimeoutManager, withTimeout } from './timeout-manager.js';
import type { RunResult, RunOptions } from '../utils.js';

/**
 * Enhanced process execution options with timeout support
 */
export interface ProcessRunOptions extends RunOptions {
  /** Custom timeout in milliseconds, overrides default */
  timeout?: number;
  /** Whether to kill the process tree on timeout */
  killTree?: boolean;
  /** Maximum buffer size for stdout/stderr */
  maxBuffer?: number;
  /** Environment variables for the process */
  env?: NodeJS.ProcessEnv;
  /** Working directory */
  cwd?: string;
  /** Whether to inherit stdio instead of piping */
  inheritStdio?: boolean;
  /** Whether to validate command exists before execution */
  validateCommand?: boolean;
}

/**
 * Process execution result with timing information
 */
export interface ProcessRunResult extends RunResult {
  /** Execution duration in milliseconds */
  duration: number;
  /** Whether the process was killed due to timeout */
  timedOut: boolean;
  /** Process PID */
  pid?: number;
  /** Signal that terminated the process */
  signal?: string;
}

/**
 * Process monitoring information
 */
export interface ProcessMonitor {
  pid: number;
  command: string;
  args: string[];
  startTime: number;
  timeout?: number;
  status: 'running' | 'completed' | 'timeout' | 'error';
}

/**
 * Enhanced process wrapper with comprehensive timeout handling
 */
export class ProcessWrapper {
  private static activeProcesses = new Map<number, ProcessMonitor>();

  /**
   * Execute a command with timeout protection
   */
  static async execute(
    command: string,
    args: ReadonlyArray<string> = [],
    options: ProcessRunOptions = {},
  ): Promise<ProcessRunResult> {
    const startTime = Date.now();
    const timeout = options.timeout ?? globalTimeoutManager.getTimeout('process');
    const cwd = options.cwd ?? process.cwd();

    // Validate command exists if requested
    if (options.validateCommand) {
      try {
        await fs.access(command);
      } catch {
        // Command might be in PATH, continue
      }
    }

    return withTimeout(
      'process',
      async () => {
        return new Promise<ProcessRunResult>((resolve) => {
          const child = spawn(command, [...args], {
            cwd,
            env: { ...process.env, ...options.env },
            stdio: options.inheritStdio ? 'inherit' : ['ignore', 'pipe', 'pipe'],
          });

          if (!child.pid) {
            resolve({
              code: null,
              out: '',
              err: 'Failed to spawn process',
              duration: 0,
              timedOut: false,
            });
            return;
          }

          // Register process for monitoring
          const monitor: ProcessMonitor = {
            pid: child.pid,
            command,
            args: [...args],
            startTime,
            timeout,
            status: 'running',
          };
          this.activeProcesses.set(child.pid, monitor);

          let stdout = '';
          let stderr = '';
          let settled = false;
          let timeoutHandle: NodeJS.Timeout | null = null;

          const finalize = (code: number | null, signal?: string) => {
            if (settled) return;
            settled = true;

            const duration = Date.now() - startTime;
            const timedOut = signal === 'SIGTERM' || signal === 'SIGKILL';

            this.activeProcesses.delete(child.pid!);

            if (timeoutHandle) {
              clearTimeout(timeoutHandle);
            }

            resolve({
              code,
              out: stdout,
              err: stderr,
              duration,
              timedOut,
              pid: child.pid,
              signal,
            });
          };

          // Set up timeout handling
          if (timeout && timeout > 0) {
            timeoutHandle = setTimeout(() => {
              if (!settled) {
                monitor.status = 'timeout';

                if (options.killTree !== false) {
                  this.killProcessTree(child.pid!);
                } else {
                  child.kill('SIGTERM');
                }

                // Force kill after grace period
                setTimeout(() => {
                  if (!settled) {
                    this.killProcessTree(child.pid!, 'SIGKILL');
                  }
                }, 5000);
              }
            }, timeout);
          }

          // Collect output if not inheriting stdio
          if (!options.inheritStdio && child.stdout && child.stderr) {
            child.stdout.on('data', (chunk: Buffer) => {
              stdout += String(chunk);
            });

            child.stderr.on('data', (chunk: Buffer) => {
              stderr += String(chunk);
            });
          }

          child.on('error', (err: Error) => {
            if (!settled) {
              monitor.status = 'error';
              const message = String(err?.message ?? err);
              stderr = stderr ? `${stderr}\n${message}` : message;
              finalize(127);
            }
          });

          child.on('close', (code: number | null, signal: string | null) => {
            if (!settled) {
              monitor.status = code === 0 ? 'completed' : 'error';
              finalize(code, signal || undefined);
            }
          });
        });
      },
      { command, args, timeout, cwd },
    );
  }

  /**
   * Kill a process and all its children
   */
  static async killProcessTree(pid: number, signal: string | number = 'SIGTERM'): Promise<void> {
    try {
      // On Unix-like systems, use negative PID to kill process group
      if (process.platform !== 'win32') {
        process.kill(-pid, signal);
      } else {
        // On Windows, use taskkill
        spawn('taskkill', ['/pid', pid.toString(), '/t', '/f'], { stdio: 'ignore' });
      }
    } catch (error) {
      // Process might already be dead
      console.warn(`Failed to kill process tree ${pid}:`, error);
    }
  }

  /**
   * Get information about active processes
   */
  static getActiveProcesses(): ProcessMonitor[] {
    return Array.from(this.activeProcesses.values());
  }

  /**
   * Kill all active processes
   */
  static async killAllProcesses(): Promise<void> {
    const processes = Array.from(this.activeProcesses.keys());
    await Promise.all(processes.map((pid) => this.killProcessTree(pid)));
    this.activeProcesses.clear();
  }

  /**
   * Monitor process resource usage
   */
  static async getProcessUsage(pid: number): Promise<{
    memory: number;
    cpu: number;
    uptime: number;
  } | null> {
    try {
      if (process.platform === 'linux') {
        const stat = await fs.readFile(`/proc/${pid}/stat`, 'utf8');
        const fields = stat.split(' ');

        // Parse memory usage (in pages)
        const memory = parseInt(fields[23] || '0') * 4096; // Convert pages to bytes

        // Parse CPU times
        const utime = parseInt(fields[13] || '0');
        const stime = parseInt(fields[14] || '0');
        const starttime = parseInt(fields[21] || '0');
        const totalCpuTime = utime + stime;

        return {
          memory,
          cpu: totalCpuTime,
          uptime: Date.now() - starttime * 1000,
        };
      }
    } catch {
      // Process might not exist or platform not supported
    }

    return null;
  }

  /**
   * Execute with resource monitoring
   */
  static async executeWithMonitoring(
    command: string,
    args: ReadonlyArray<string> = [],
    options: ProcessRunOptions & {
      maxMemory?: number;
      maxCpu?: number;
      checkInterval?: number;
    } = {},
  ): Promise<ProcessRunResult & { maxMemoryUsage: number; maxCpuUsage: number }> {
    const maxMemory = options.maxMemory || 512 * 1024 * 1024; // 512MB default
    const maxCpu = options.maxCpu || 80; // 80% CPU default
    const checkInterval = options.checkInterval || 1000; // Check every second

    let maxMemoryUsage = 0;
    let maxCpuUsage = 0;
    let monitoring: NodeJS.Timeout | null = null;

    const result = await this.execute(command, args, {
      ...options,
      timeout: options.timeout || globalTimeoutManager.getTimeout('process'),
    });

    if (result.pid) {
      // Start monitoring
      monitoring = setInterval(async () => {
        const usage = await this.getProcessUsage(result.pid!);
        if (usage) {
          maxMemoryUsage = Math.max(maxMemoryUsage, usage.memory);
          maxCpuUsage = Math.max(maxCpuUsage, usage.cpu);

          // Kill if resource limits exceeded
          if (usage.memory > maxMemory || usage.cpu > maxCpu) {
            await this.killProcessTree(result.pid!);
          }
        }
      }, checkInterval);
    }

    // Clean up monitoring
    if (monitoring) {
      clearInterval(monitoring);
    }

    return {
      ...result,
      maxMemoryUsage,
      maxCpuUsage,
    };
  }
}

/**
 * Convenience function for simple process execution with timeout
 */
export async function runWithTimeout(
  command: string,
  args: ReadonlyArray<string> = [],
  options: ProcessRunOptions = {},
): Promise<ProcessRunResult> {
  return ProcessWrapper.execute(command, args, options);
}
