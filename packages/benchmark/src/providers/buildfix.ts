import { BaseProvider } from './base.js';
import { ProviderConfig, BenchmarkRequest, BenchmarkResponse } from '../types/index.js';
import { spawn, ChildProcess } from 'child_process';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';
import { findRepositoryRoot, getBuildFixDirectories } from './path-utils.js';

interface BuildFixResult {
  fixture: string;
  model: string;
  success: boolean;
  errorCountBefore: number;
  errorCountAfter: number;
  errorsResolved: boolean;
  planGenerated: boolean;
  duration: number;
  attempts: number;
  planTitle?: string;
  errorMessage?: string;
}

// Error types for better error handling
export class BuildFixTimeoutError extends Error {
  constructor(
    message: string,
    public readonly timeout: number,
  ) {
    super(message);
    this.name = 'BuildFixTimeoutError';
  }
}

export class BuildFixProcessError extends Error {
  constructor(
    message: string,
    public readonly exitCode: number | null,
    public readonly stderr: string,
  ) {
    super(message);
    this.name = 'BuildFixProcessError';
  }
}

export class BuildFixResourceError extends Error {
  constructor(
    message: string,
    public readonly resource: string,
    public readonly usage: number,
  ) {
    super(message);
    this.name = 'BuildFixResourceError';
  }
}

// Process pool interfaces
interface PooledProcess {
  process: ChildProcess;
  inUse: boolean;
  lastUsed: number;
  healthStatus: 'healthy' | 'unhealthy' | 'unknown';
  spawnTime: number;
}

interface ProcessPoolConfig {
  minSize: number;
  maxSize: number;
  healthCheckInterval: number;
  maxIdleTime: number;
  processTimeout: number;
}

// Circuit breaker for preventing cascading failures
interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
  nextAttemptTime: number;
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

// Memory management interfaces
interface CircularBuffer<T> {
  buffer: T[];
  size: number;
  head: number;
  tail: number;
  count: number;
}

interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  timestamp: number;
}

interface PerformanceMetrics {
  requestStartTime: number;
  processStartTime: number;
  processEndTime: number;
  ioStartTime: number;
  ioEndTime: number;
  memoryBefore: number;
  memoryAfter: number;
  cpuBefore: number;
  cpuAfter: number;
  cacheHits: number;
  cacheMisses: number;
  fixtureCount: number;
  parallelProcessingTime: number;
  errors: Array<{
    type: string;
    message: string;
    timestamp: number;
  }>;
}

export class BuildFixProvider extends BaseProvider {
  private buildFixPath: string;
  private tempDir: string;

  // Process pool management
  private processPool: PooledProcess[] = [];
  private poolConfig: ProcessPoolConfig = {
    minSize: 2,
    maxSize: 5,
    healthCheckInterval: 30000, // 30 seconds
    maxIdleTime: 300000, // 5 minutes
    processTimeout: 120000, // 2 minutes
  };

  // Circuit breaker for fault tolerance
  private circuitBreaker: CircuitBreakerState = {
    failures: 0,
    lastFailureTime: 0,
    state: 'closed',
    nextAttemptTime: 0,
  };
  private circuitBreakerConfig: CircuitBreakerConfig = {
    failureThreshold: 5,
    recoveryTimeout: 60000, // 1 minute
    monitoringPeriod: 300000, // 5 minutes
  };

  // Memory management
  private metricsBuffer: CircularBuffer<PerformanceMetrics>;
  private memoryStats: CircularBuffer<MemoryStats>;
  private maxMemoryStats = 1000; // Keep last 1000 memory snapshots

  // Event emitter for monitoring
  private eventEmitter = new EventEmitter();

  // Timeout configuration
  private defaultTimeout = 120000; // 2 minutes
  private fixtureProcessingTimeout = 300000; // 5 minutes for parallel processing

  constructor(config: ProviderConfig) {
    super(config);
    // Use centralized path resolution
    const dirs = getBuildFixDirectories();
    this.buildFixPath = dirs.buildFixPath;
    this.tempDir = dirs.tempDir;

    // Initialize circular buffers for metrics (max 1000 entries)
    this.metricsBuffer = this.createCircularBuffer<PerformanceMetrics>(1000);
    this.memoryStats = this.createCircularBuffer<MemoryStats>(this.maxMemoryStats);

    // Start health monitoring
    this.startHealthMonitoring();
  }

  async connect(): Promise<void> {
    const startTime = performance.now();

    try {
      await readFile(join(this.buildFixPath, 'package.json'), 'utf8');
    } catch (error) {
      throw new Error(`BuildFix package not found at ${this.buildFixPath}`);
    }

    // Create temp directory
    await mkdir(this.tempDir, { recursive: true });

    // Initialize process pool
    await this.initializeProcessPool();

    const connectionTime = performance.now() - startTime;
    this.eventEmitter.emit('connected', { connectionTime });
  }

  async disconnect(): Promise<void> {
    // Cleanup process pool
    await this.cleanupProcessPool();

    // Save final metrics
    await this.saveMetrics();

    // Remove all event listeners
    this.eventEmitter.removeAllListeners();
  }

  async execute(request: BenchmarkRequest): Promise<BenchmarkResponse> {
    const perfMetrics: PerformanceMetrics = {
      requestStartTime: performance.now(),
      processStartTime: 0,
      processEndTime: 0,
      ioStartTime: 0,
      ioEndTime: 0,
      memoryBefore: 0,
      memoryAfter: 0,
      cpuBefore: 0,
      cpuAfter: 0,
      cacheHits: 0,
      cacheMisses: 0,
      fixtureCount: 0,
      parallelProcessingTime: 0,
      errors: [],
    };

    try {
      // Check circuit breaker first
      if (!this.canExecuteRequest()) {
        throw new Error('Circuit breaker is open - requests are temporarily blocked');
      }

      // Get baseline resource metrics
      const resourcesBefore = await this.measureResources();
      perfMetrics.memoryBefore = resourcesBefore.memoryUsage;
      perfMetrics.cpuBefore = resourcesBefore.cpuUsage;

      // Parse fixture type from metadata
      const fixtureType = request.metadata?.fixtureType || 'small';
      const useMassive = fixtureType === 'massive';

      // Build the BuildFix benchmark command
      const args: string[] = [
        'tsx',
        'packages/buildfix/src/benchmark/run-memoized.ts',
        '--models',
        this.config.model,
        ...(useMassive ? [] : ['--small-fixtures']),
        '--force-refresh',
      ];

      perfMetrics.processStartTime = performance.now();

      let buildFixResults: BuildFixResult[];

      // Use parallel processing for multiple fixtures
      if (request.metadata?.fixtures && Array.isArray(request.metadata.fixtures)) {
        perfMetrics.fixtureCount = request.metadata.fixtures.length;
        const parallelStartTime = performance.now();

        buildFixResults = await this.processFixturesInParallel(request.metadata.fixtures, args);

        perfMetrics.parallelProcessingTime = performance.now() - parallelStartTime;
      } else {
        // Single execution with process pool
        const pooledProcess = await this.acquireProcess();

        try {
          const result = await this.executeWithTimeout(pooledProcess, args, this.defaultTimeout);

          buildFixResults = await this.parseBuildFixResults(result);
          this.recordSuccess();
        } finally {
          this.releaseProcess(pooledProcess);
        }
      }

      perfMetrics.processEndTime = performance.now();
      perfMetrics.ioStartTime = performance.now();

      // Get final resource metrics
      const resourcesAfter = await this.measureResources();
      perfMetrics.memoryAfter = resourcesAfter.memoryUsage;
      perfMetrics.cpuAfter = resourcesAfter.cpuUsage;

      perfMetrics.ioEndTime = performance.now();

      // Store performance metrics in circular buffer
      this.addToCircularBuffer(this.metricsBuffer, perfMetrics);

      const response = {
        content: this.formatResponse(buildFixResults),
        tokens: this.estimateTokens(buildFixResults),
        time: Date.now() - perfMetrics.requestStartTime,
        metadata: {
          buildFixResults,
          fixtureType,
          totalTests: buildFixResults.length,
          successfulTests: buildFixResults.filter((r) => r.success).length,
          performanceMetrics: perfMetrics,
          processPoolStatus: this.getProcessPoolStatus(),
          circuitBreakerStatus: this.getCircuitBreakerStatus(),
          resourceUsage: {
            before: resourcesBefore,
            after: resourcesAfter,
            delta: {
              memory: resourcesAfter.memoryUsage - resourcesBefore.memoryUsage,
              cpu: resourcesAfter.cpuUsage - resourcesBefore.cpuUsage,
            },
          },
        },
      };

      this.eventEmitter.emit('request-completed', { request, response, metrics: perfMetrics });
      return response;
    } catch (error) {
      // Record error in metrics
      perfMetrics.errors.push({
        type: error instanceof Error ? error.constructor.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
      });

      this.recordFailure();

      const errorResponse = {
        content: `BuildFix benchmark failed: ${error instanceof Error ? error.message : String(error)}`,
        tokens: 0,
        time: Date.now() - perfMetrics.requestStartTime,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
          performanceMetrics: perfMetrics,
          processPoolStatus: this.getProcessPoolStatus(),
          circuitBreakerStatus: this.getCircuitBreakerStatus(),
        },
      };

      this.eventEmitter.emit('request-failed', {
        request,
        error: errorResponse,
        metrics: perfMetrics,
      });
      return errorResponse;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      // Check if BuildFix package exists and has required files
      const { statSync } = await import('fs');
      const testFile = join(this.buildFixPath, 'src/benchmark/run-memoized.ts');
      statSync(testFile);
      return true;
    } catch (error) {
      return false;
    }
  }

  async listModels(): Promise<string[]> {
    // BuildFix uses Ollama models, return available Ollama models
    try {
      const { execSync } = await import('child_process');
      const output = execSync('ollama list', { encoding: 'utf8' });
      const lines = output.trim().split('\n').slice(1); // Skip header
      return lines
        .map((line) => line.split(/\s+/)[0])
        .filter((model): model is string => Boolean(model));
    } catch {
      return [this.config.model || 'qwen3:8b'];
    }
  }

  private async parseBuildFixResults(output: string): Promise<BuildFixResult[]> {
    try {
      // Extract JSON result file path from output
      const jsonMatch = output.match(/Results saved to: (.+\.json)/);
      if (!jsonMatch) {
        throw new Error('Could not find BuildFix results file');
      }

      const resultsPath = jsonMatch[1];
      if (!resultsPath) {
        throw new Error('Invalid results file path');
      }

      const resultsData = JSON.parse(await readFile(resultsPath, 'utf8'));

      return resultsData.results || [];
    } catch (error) {
      // Fallback: try to parse from output directly
      const results: BuildFixResult[] = [];

      // Look for success rate in output
      const successMatch = output.match(/Successful Tests: (\d+)/);
      const totalMatch = output.match(/Total Tests: (\d+)/);

      if (successMatch && totalMatch && successMatch[1] && totalMatch[1]) {
        const successful = parseInt(successMatch[1]);
        const total = parseInt(totalMatch[1]);

        // Create a synthetic result
        results.push({
          fixture: 'benchmark-suite',
          model: this.config.model ?? 'unknown',
          success: successful > 0,
          errorCountBefore: total,
          errorCountAfter: total - successful,
          errorsResolved: successful > 0,
          planGenerated: true,
          duration: 0,
          attempts: 3,
        });
      }

      return results;
    }
  }

  private formatResponse(results: BuildFixResult[]): string {
    const totalTests = results.length;
    const successfulTests = results.filter((r) => r.success).length;
    const errorsResolved = results.filter((r) => r.errorsResolved).length;
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / totalTests;

    return `
BuildFix Benchmark Results:
- Total Tests: ${totalTests}
- Successful Tests: ${successfulTests} (${((successfulTests / totalTests) * 100).toFixed(1)}%)
- Errors Resolved: ${errorsResolved} (${((errorsResolved / totalTests) * 100).toFixed(1)}%)
- Average Duration: ${(avgDuration / 1000).toFixed(1)}s

Top Issues:
${results
  .filter((r) => r.errorMessage)
  .slice(0, 3)
  .map((r) => `- ${r.errorMessage}`)
  .join('\n')}
    `.trim();
  }

  private estimateTokens(results: BuildFixResult[]): number {
    // Rough estimation based on result content
    return results.length * 100; // ~100 tokens per result on average
  }

  // Helper methods for optimizations

  private createCircularBuffer<T>(size: number): CircularBuffer<T> {
    return {
      buffer: new Array(size),
      size,
      head: 0,
      tail: 0,
      count: 0,
    };
  }

  private addToCircularBuffer<T>(buffer: CircularBuffer<T>, item: T): void {
    buffer.buffer[buffer.head] = item;
    buffer.head = (buffer.head + 1) % buffer.size;
    if (buffer.count < buffer.size) {
      buffer.count++;
    } else {
      buffer.tail = (buffer.tail + 1) % buffer.size;
    }
  }

  private startHealthMonitoring(): void {
    setInterval(() => {
      this.checkProcessPoolHealth();
      this.cleanupIdleProcesses();
      this.recordMemoryStats();
    }, this.poolConfig.healthCheckInterval);
  }

  private async initializeProcessPool(): Promise<void> {
    const promises = [];
    for (let i = 0; i < this.poolConfig.minSize; i++) {
      promises.push(this.createPooledProcess());
    }
    await Promise.all(promises);
  }

  private async createPooledProcess(): Promise<PooledProcess> {
    return new Promise((resolve, reject) => {
      const repoRoot = findRepositoryRoot();

      // Create a persistent shell process for reuse
      const child = spawn('bash', [], {
        cwd: repoRoot,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          NODE_OPTIONS: '--max-old-space-size=4096',
          BUILDFIX_POOL_PROCESS: 'true',
        },
      });

      const pooledProcess: PooledProcess = {
        process: child,
        inUse: false,
        lastUsed: Date.now(),
        healthStatus: 'unknown',
        spawnTime: Date.now(),
      };

      let initTimeout: NodeJS.Timeout;
      let isResolved = false;

      const cleanup = () => {
        if (initTimeout) clearTimeout(initTimeout);
        if (!isResolved) {
          isResolved = true;
          child.kill('SIGKILL');
        }
      };

      child.on('spawn', () => {
        // Initialize the shell with a warmup command
        child.stdin?.write('echo "Process pool ready"\n');

        // Wait for initialization response
        const initHandler = (data: Buffer) => {
          if (data.toString().includes('Process pool ready')) {
            child.stdout?.removeListener('data', initHandler);
            child.stderr?.removeListener('data', errorHandler);

            if (!isResolved) {
              isResolved = true;
              clearTimeout(initTimeout);
              this.processPool.push(pooledProcess);
              pooledProcess.healthStatus = 'healthy';
              resolve(pooledProcess);
            }
          }
        };

        const errorHandler = (data: Buffer) => {
          if (!isResolved) {
            cleanup();
            reject(
              new BuildFixProcessError(
                `Process initialization failed: ${data.toString()}`,
                null,
                data.toString(),
              ),
            );
          }
        };

        child.stdout?.on('data', initHandler);
        child.stderr?.on('data', errorHandler);
      });

      child.on('error', (error) => {
        cleanup();
        reject(new BuildFixProcessError(`Failed to spawn process: ${error.message}`, null, ''));
      });

      child.on('exit', (code) => {
        if (!isResolved) {
          cleanup();
          reject(
            new BuildFixProcessError(
              `Process exited during initialization with code ${code}`,
              code,
              '',
            ),
          );
        }
      });

      // Set timeout for process spawn and initialization
      initTimeout = setTimeout(() => {
        cleanup();
        reject(new BuildFixTimeoutError('Process spawn and initialization timeout', 15000));
      }, 15000);
    });
  }

  private async acquireProcess(): Promise<PooledProcess> {
    // Check circuit breaker
    if (!this.canExecuteRequest()) {
      throw new Error('Circuit breaker is open - requests are temporarily blocked');
    }

    // Find available process
    let availableProcess = this.processPool.find((p) => !p.inUse && p.healthStatus === 'healthy');

    if (!availableProcess) {
      if (this.processPool.length < this.poolConfig.maxSize) {
        // Create new process
        availableProcess = await this.createPooledProcess();
      } else {
        // Wait for a process to become available
        availableProcess = await this.waitForAvailableProcess();
      }
    }

    availableProcess.inUse = true;
    availableProcess.lastUsed = Date.now();

    return availableProcess;
  }

  private releaseProcess(pooledProcess: PooledProcess): void {
    pooledProcess.inUse = false;
    pooledProcess.lastUsed = Date.now();
  }

  private async waitForAvailableProcess(): Promise<PooledProcess> {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        const availableProcess = this.processPool.find(
          (p) => !p.inUse && p.healthStatus === 'healthy',
        );
        if (availableProcess) {
          clearInterval(checkInterval);
          resolve(availableProcess);
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new BuildFixTimeoutError('No available process in pool', 30000));
      }, 30000);
    });
  }

  private async executeWithTimeout(
    pooledProcess: PooledProcess,
    args: string[],
    timeout: number,
  ): Promise<string> {
    return this.executeWithRetry(pooledProcess, args, timeout, 3);
  }

  private async executeWithRetry(
    pooledProcess: PooledProcess,
    args: string[],
    timeout: number,
    maxRetries: number,
  ): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeSingleAttempt(pooledProcess, args, timeout);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxRetries) {
          this.recordFailure();
          throw lastError;
        }

        // Exponential backoff: wait 1s, 2s, 4s...
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.warn(
          `⚠️  Attempt ${attempt} failed, retrying in ${backoffMs}ms: ${lastError.message}`,
        );

        await new Promise((resolve) => setTimeout(resolve, backoffMs));

        // Mark process as unhealthy and get a new one for retry
        pooledProcess.healthStatus = 'unhealthy';
      }
    }

    throw lastError;
  }

  private async executeSingleAttempt(
    pooledProcess: PooledProcess,
    args: string[],
    timeout: number,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const repoRoot = findRepositoryRoot();
      const command = `cd "${repoRoot}" && pnpm ${args.join(' ')}`;

      let stdout = '';
      let stderr = '';
      let isResolved = false;
      let commandId = Math.random().toString(36).substr(2, 9);

      // Create a unique marker to identify command completion
      const startMarker = `START_${commandId}`;
      const endMarker = `END_${commandId}`;
      const fullCommand = `echo "${startMarker}"; ${command}; echo "${endMarker}$?";`;

      const timeoutHandle = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          pooledProcess.healthStatus = 'unhealthy';
          reject(new BuildFixTimeoutError(`Process timeout after ${timeout}ms`, timeout));
        }
      }, timeout);

      const outputHandler = (data: Buffer) => {
        const output = data.toString();
        stdout += output;

        // Check if command completed
        if (output.includes(endMarker)) {
          const lines = stdout.split('\n');
          const endMarkerLine = lines.find((line) => line.includes(endMarker));

          if (endMarkerLine) {
            const exitCodeStr = endMarkerLine.replace(endMarker, '');
            const exitCode = parseInt(exitCodeStr);

            clearTimeout(timeoutHandle);
            if (!isResolved) {
              isResolved = true;

              // Extract command output (between markers)
              const startIndex = stdout.indexOf(startMarker);
              const endIndex = stdout.indexOf(endMarker);
              const commandOutput =
                startIndex !== -1 && endIndex !== -1
                  ? stdout.substring(startIndex + startMarker.length, endIndex).trim()
                  : stdout;

              if (exitCode === 0) {
                pooledProcess.healthStatus = 'healthy';
                resolve(commandOutput);
              } else {
                const error = new BuildFixProcessError(
                  `BuildFix failed with code ${exitCode}`,
                  exitCode,
                  stderr,
                );
                reject(error);
              }
            }
          }
        }
      };

      const errorHandler = (data: Buffer) => {
        stderr += data.toString();
      };

      pooledProcess.process.stdout?.on('data', outputHandler);
      pooledProcess.process.stderr?.on('data', errorHandler);

      // Send command to the pooled process
      pooledProcess.process.stdin?.write(fullCommand + '\n');

      // Clean up event listeners after completion or timeout
      const cleanup = () => {
        clearTimeout(timeoutHandle);
        pooledProcess.process.stdout?.removeListener('data', outputHandler);
        pooledProcess.process.stderr?.removeListener('data', errorHandler);
      };

      // Ensure cleanup happens
      setTimeout(cleanup, timeout + 1000);
    });
  }

  private async processFixturesInParallel(
    fixtures: string[],
    args: string[],
  ): Promise<BuildFixResult[]> {
    const batchSize = Math.min(fixtures.length, this.poolConfig.maxSize);
    const batches: string[][] = [];

    for (let i = 0; i < fixtures.length; i += batchSize) {
      batches.push(fixtures.slice(i, i + batchSize));
    }

    const allResults: BuildFixResult[] = [];

    for (const batch of batches) {
      const batchPromises = batch.map(async (fixture) => {
        try {
          const pooledProcess = await this.acquireProcess();
          const fixtureArgs = [...args, '--fixture', fixture];

          const result = await this.executeWithTimeout(
            pooledProcess,
            fixtureArgs,
            this.fixtureProcessingTimeout,
          );

          this.releaseProcess(pooledProcess);
          this.recordSuccess();

          return await this.parseBuildFixResults(result);
        } catch (error) {
          this.recordFailure();
          return [
            {
              fixture,
              model: this.config.model,
              success: false,
              errorCountBefore: 0,
              errorCountAfter: 0,
              errorsResolved: false,
              planGenerated: false,
              duration: 0,
              attempts: 1,
              errorMessage: error instanceof Error ? error.message : String(error),
            },
          ];
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);

      // Aggregate results from this batch
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          allResults.push(...result.value);
        } else {
          // Handle rejected promise
          allResults.push({
            fixture: 'unknown',
            model: this.config.model,
            success: false,
            errorCountBefore: 0,
            errorCountAfter: 0,
            errorsResolved: false,
            planGenerated: false,
            duration: 0,
            attempts: 1,
            errorMessage:
              result.reason instanceof Error ? result.reason.message : String(result.reason),
          });
        }
      });
    }

    return allResults;
  }

  private canExecuteRequest(): boolean {
    const now = Date.now();

    switch (this.circuitBreaker.state) {
      case 'closed':
        return true;

      case 'open':
        if (now >= this.circuitBreaker.nextAttemptTime) {
          this.circuitBreaker.state = 'half-open';
          return true;
        }
        return false;

      case 'half-open':
        return true;

      default:
        return false;
    }
  }

  private recordSuccess(): void {
    if (this.circuitBreaker.state === 'half-open') {
      this.circuitBreaker.failures = 0;
      this.circuitBreaker.state = 'closed';
    }
  }

  private recordFailure(): void {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailureTime = Date.now();

    if (this.circuitBreaker.failures >= this.circuitBreakerConfig.failureThreshold) {
      this.circuitBreaker.state = 'open';
      this.circuitBreaker.nextAttemptTime = Date.now() + this.circuitBreakerConfig.recoveryTimeout;
    }
  }

  private checkProcessPoolHealth(): void {
    const now = Date.now();

    this.processPool.forEach((pooledProcess) => {
      if (pooledProcess.process.killed) {
        pooledProcess.healthStatus = 'unhealthy';
      } else if (now - pooledProcess.lastUsed > this.poolConfig.maxIdleTime) {
        pooledProcess.healthStatus = 'unhealthy';
      } else {
        pooledProcess.healthStatus = 'healthy';
      }
    });

    // Remove unhealthy processes
    this.processPool = this.processPool.filter((p) => p.healthStatus !== 'unhealthy');

    // Maintain minimum pool size
    if (this.processPool.length < this.poolConfig.minSize) {
      const processesToAdd = this.poolConfig.minSize - this.processPool.length;
      for (let i = 0; i < processesToAdd; i++) {
        this.createPooledProcess().catch(console.error);
      }
    }
  }

  private cleanupIdleProcesses(): void {
    const now = Date.now();
    const activeProcesses = this.processPool.filter(
      (p) => p.inUse || now - p.lastUsed <= this.poolConfig.maxIdleTime,
    );

    // Kill processes that have been idle too long
    const processesToKill = this.processPool.filter(
      (p) => !p.inUse && now - p.lastUsed > this.poolConfig.maxIdleTime,
    );

    processesToKill.forEach((pooledProcess) => {
      pooledProcess.process.kill('SIGTERM');
    });

    this.processPool = activeProcesses;
  }

  private async cleanupProcessPool(): Promise<void> {
    const killPromises = this.processPool.map((pooledProcess) =>
      this.killProcess(pooledProcess.process),
    );

    await Promise.all(killPromises);
    this.processPool = [];
  }

  private async killProcess(process: ChildProcess): Promise<void> {
    return new Promise((resolve) => {
      if (process.killed) {
        resolve();
        return;
      }

      process.kill('SIGTERM');
      setTimeout(() => {
        if (!process.killed) {
          process.kill('SIGKILL');
        }
        resolve();
      }, 5000);
    });
  }

  private recordMemoryStats(): void {
    const memUsage = process.memoryUsage();
    const stats: MemoryStats = {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      timestamp: Date.now(),
    };

    // Use circular buffer for memory stats to prevent unbounded growth
    this.addToCircularBuffer(this.memoryStats, stats);
  }

  private async saveMetrics(): Promise<void> {
    try {
      const metricsData = {
        timestamp: new Date().toISOString(),
        metrics: Array.from({ length: this.metricsBuffer.count }, (_, i) => {
          const index = (this.metricsBuffer.tail + i) % this.metricsBuffer.size;
          return this.metricsBuffer.buffer[index];
        }),
        memoryStats: this.memoryStats,
        circuitBreakerState: this.circuitBreaker,
        processPoolStats: {
          size: this.processPool.length,
          active: this.processPool.filter((p) => p.inUse).length,
          healthy: this.processPool.filter((p) => p.healthStatus === 'healthy').length,
        },
      };

      const metricsFile = join(this.tempDir, `buildfix-metrics-${Date.now()}.json`);
      await writeFile(metricsFile, JSON.stringify(metricsData, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }

  // Public methods for monitoring
  public getProcessPoolStatus() {
    return {
      size: this.processPool.length,
      active: this.processPool.filter((p) => p.inUse).length,
      healthy: this.processPool.filter((p) => p.healthStatus === 'healthy').length,
      config: this.poolConfig,
    };
  }

  public getCircuitBreakerStatus() {
    return { ...this.circuitBreaker };
  }

  public getMemoryStats() {
    return Array.from({ length: this.memoryStats.count }, (_, i) => {
      const index = (this.memoryStats.tail + i) % this.memoryStats.size;
      return this.memoryStats.buffer[index];
    });
  }

  public getPerformanceMetrics() {
    return Array.from({ length: this.metricsBuffer.count }, (_, i) => {
      const index = (this.metricsBuffer.tail + i) % this.metricsBuffer.size;
      return this.metricsBuffer.buffer[index];
    });
  }
}
