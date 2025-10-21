import { BaseProvider } from './base.js';
import { ProviderConfig, BenchmarkRequest, BenchmarkResponse } from '../types/index.js';
import { spawn, ChildProcess } from 'child_process';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';
import { findRepositoryRoot, getBuildFixDirectories } from './path-utils.js';

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
}

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

interface CacheEntry {
  result: BuildFixResult[];
  timestamp: number;
  ttl: number;
  key: string;
}

// Enhanced interfaces for optimizations
interface PooledProcess {
  process: ChildProcess;
  inUse: boolean;
  lastUsed: number;
  healthStatus: 'healthy' | 'unhealthy' | 'unknown';
  spawnTime: number;
  requestCount: number;
  avgResponseTime: number;
}

interface ProcessPoolConfig {
  minSize: number;
  maxSize: number;
  healthCheckInterval: number;
  maxIdleTime: number;
  processTimeout: number;
}

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
  pressure: 'low' | 'medium' | 'high' | 'critical';
}

// Enhanced error types
export class EnhancedBuildFixTimeoutError extends Error {
  constructor(
    message: string,
    public readonly timeout: number,
    public readonly operation: string,
  ) {
    super(message);
    this.name = 'EnhancedBuildFixTimeoutError';
  }
}

export class EnhancedBuildFixProcessError extends Error {
  constructor(
    message: string,
    public readonly exitCode: number | null,
    public readonly stderr: string,
    public readonly operation: string,
  ) {
    super(message);
    this.name = 'EnhancedBuildFixProcessError';
  }
}

export class EnhancedBuildFixCacheError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly cacheKey: string,
  ) {
    super(message);
    this.name = 'EnhancedBuildFixCacheError';
  }
}

export class EnhancedBuildFixProvider extends BaseProvider {
  private buildFixPath: string;
  private tempDir: string;
  private cacheDir: string;
  private metricsDir: string;
  private cache: Map<string, CacheEntry> = new Map();
  private processPool: PooledProcess[] = [];
  private poolConfig: ProcessPoolConfig = {
    minSize: 3,
    maxSize: 7,
    healthCheckInterval: 30000,
    maxIdleTime: 300000,
    processTimeout: 120000,
  };
  private metrics: CircularBuffer<PerformanceMetrics>;
  private eventEmitter = new EventEmitter();
  private cacheStats = { hits: 0, misses: 0, evictions: 0 };

  // Memory management
  private memoryStats: CircularBuffer<MemoryStats>;
  private maxMemoryStats = 2000;

  // Timeout configurations
  private defaultTimeout = 120000;

  constructor(config: ProviderConfig) {
    super(config);
    // Use centralized path resolution
    const dirs = getBuildFixDirectories();
    this.buildFixPath = dirs.buildFixPath;
    this.tempDir = dirs.tempDir;
    this.cacheDir = dirs.cacheDir;
    this.metricsDir = dirs.metricsDir;

    // Initialize circular buffers
    this.metrics = this.createCircularBuffer<PerformanceMetrics>(1000);
    this.memoryStats = this.createCircularBuffer<MemoryStats>(this.maxMemoryStats);

    // Initialize cache cleanup interval
    setInterval(() => this.cleanupCache(), 60000); // Cleanup every minute

    // Start health monitoring
    this.startHealthMonitoring();
  }

  public override async connect(): Promise<void> {
    const startTime = performance.now();

    try {
      await readFile(join(this.buildFixPath, 'package.json'), 'utf8');
    } catch (error) {
      throw new Error(`BuildFix package not found at ${this.buildFixPath}`);
    }

    // Create necessary directories
    await Promise.all([
      mkdir(this.tempDir, { recursive: true }),
      mkdir(this.cacheDir, { recursive: true }),
      mkdir(this.metricsDir, { recursive: true }),
    ]);

    // Initialize process pool
    await this.initializeProcessPool();

    const connectionTime = performance.now() - startTime;
    this.eventEmitter.emit('connection-established', { connectionTime });
  }

  public override async disconnect(): Promise<void> {
    // Cleanup process pool
    await Promise.all(
      this.processPool.map((pooledProcess) => this.killProcess(pooledProcess.process)),
    );
    this.processPool = [];

    // Save final metrics
    await this.saveMetrics();

    // Cleanup cache
    this.cache.clear();
  }

  public override async execute(request: BenchmarkRequest): Promise<BenchmarkResponse> {
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
      cacheHits: this.cacheStats.hits,
      cacheMisses: this.cacheStats.misses,
    };

    try {
      // Get baseline resource metrics
      const resourcesBefore = await this.measureResources();
      perfMetrics.memoryBefore = resourcesBefore.memoryUsage;
      perfMetrics.cpuBefore = resourcesBefore.cpuUsage;

      // Check cache first
      const cacheKey = this.generateCacheKey(request);
      const cachedResult = this.getFromCache(cacheKey);

      if (cachedResult) {
        this.cacheStats.hits++;
        return this.createCachedResponse(cachedResult, perfMetrics);
      }

      this.cacheStats.misses++;
      perfMetrics.ioStartTime = performance.now();

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

      // Execute BuildFix benchmark with process pool
      const result = await this.executeWithProcessPool(args);
      perfMetrics.processEndTime = performance.now();

      // Parse BuildFix results
      const buildFixResults = await this.parseBuildFixResults(result);
      perfMetrics.ioEndTime = performance.now();

      // Cache the results
      this.addToCache(cacheKey, buildFixResults);

      // Get final resource metrics
      const resourcesAfter = await this.measureResources();
      perfMetrics.memoryAfter = resourcesAfter.memoryUsage;
      perfMetrics.cpuAfter = resourcesAfter.cpuUsage;

      // Store performance metrics
      this.addToCircularBuffer(this.metrics, perfMetrics);

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
          cacheStats: { ...this.cacheStats },
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
      const errorResponse = {
        content: `BuildFix benchmark failed: ${error instanceof Error ? error.message : String(error)}`,
        tokens: 0,
        time: Date.now() - perfMetrics.requestStartTime,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
          performanceMetrics: perfMetrics,
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

  public override async isHealthy(): Promise<boolean> {
    try {
      const { statSync } = await import('fs');
      const testFile = join(this.buildFixPath, 'src/benchmark/run-memoized.ts');
      statSync(testFile);

      // Check process pool health
      const healthyProcesses = this.processPool.filter((p) => !p.process.killed).length;
      return healthyProcesses > 0;
    } catch (error) {
      return false;
    }
  }

  public async listModels(): Promise<string[]> {
    try {
      const { execSync } = await import('child_process');
      const output = execSync('ollama list', { encoding: 'utf8' });
      const lines = output.trim().split('\n').slice(1);
      return lines
        .map((line) => line.split(/\s+/)[0])
        .filter((model): model is string => Boolean(model));
    } catch {
      return [this.config.model || 'qwen3:8b'];
    }
  }

  // Enhanced performance monitoring methods
  public async getPerformanceMetrics(): Promise<PerformanceMetrics[]> {
    const result: PerformanceMetrics[] = [];
    for (let i = 0; i < this.metrics.count; i++) {
      const index = (this.metrics.tail + i) % this.metrics.size;
      const metric = this.metrics.buffer[index];
      if (metric) {
        result.push(metric);
      }
    }
    return result;
  }

  public getCacheStats() {
    return { ...this.cacheStats };
  }

  public getProcessPoolStatus() {
    return {
      size: this.processPool.length,
      active: this.processPool.filter((p) => !p.process.killed).length,
      maxSize: this.poolConfig.maxSize,
    };
  }

  public async clearCache(): Promise<void> {
    this.cache.clear();
    this.cacheStats = { hits: 0, misses: 0, evictions: 0 };

    // Clear cache directory
    try {
      const { readdir, unlink } = await import('fs/promises');
      const files = await readdir(this.cacheDir);
      await Promise.all(files.map((file) => unlink(join(this.cacheDir, file))));
    } catch (error) {
      // Cache directory might not exist
    }
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
        requestCount: 0,
        avgResponseTime: 0,
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
              new EnhancedBuildFixProcessError(
                `Process initialization failed: ${data.toString()}`,
                null,
                data.toString(),
                'spawn',
              ),
            );
          }
        };

        child.stdout?.on('data', initHandler);
        child.stderr?.on('data', errorHandler);
      });

      child.on('error', (error) => {
        cleanup();
        reject(
          new EnhancedBuildFixProcessError(
            `Failed to spawn process: ${error.message}`,
            null,
            '',
            'spawn',
          ),
        );
      });

      child.on('exit', (code) => {
        if (!isResolved) {
          cleanup();
          reject(
            new EnhancedBuildFixProcessError(
              `Process exited during initialization with code ${code}`,
              code,
              '',
              'spawn',
            ),
          );
        }
      });

      // Set timeout for process spawn and initialization
      initTimeout = setTimeout(() => {
        cleanup();
        reject(
          new EnhancedBuildFixTimeoutError(
            'Process spawn and initialization timeout',
            15000,
            'spawn',
          ),
        );
      }, 15000);
    });
  }

  private async executeWithProcessPool(args: string[]): Promise<string> {
    // Find available process
    let availableProcess = this.processPool.find((p) => !p.inUse && p.healthStatus === 'healthy');

    if (!availableProcess) {
      if (this.processPool.length < this.poolConfig.maxSize) {
        availableProcess = await this.createPooledProcess();
      } else {
        throw new EnhancedBuildFixTimeoutError('No available process in pool', 30000, 'execute');
      }
    }

    availableProcess.inUse = true;
    availableProcess.lastUsed = Date.now();
    availableProcess.requestCount++;

    const startTime = performance.now();

    try {
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
            availableProcess.healthStatus = 'unhealthy';
            reject(
              new EnhancedBuildFixTimeoutError(
                `Process timeout after ${this.defaultTimeout}ms`,
                this.defaultTimeout,
                'execute',
              ),
            );
          }
        }, this.defaultTimeout);

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
                  availableProcess.healthStatus = 'healthy';
                  resolve(commandOutput);
                } else {
                  const error = new EnhancedBuildFixProcessError(
                    `BuildFix failed with code ${exitCode}`,
                    exitCode,
                    stderr,
                    'execute',
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

        availableProcess.process.stdout?.on('data', outputHandler);
        availableProcess.process.stderr?.on('data', errorHandler);

        // Send command to the pooled process
        availableProcess.process.stdin?.write(fullCommand + '\n');

        // Clean up event listeners after completion or timeout
        const cleanup = () => {
          clearTimeout(timeoutHandle);
          availableProcess.process.stdout?.removeListener('data', outputHandler);
          availableProcess.process.stderr?.removeListener('data', errorHandler);
        };

        // Ensure cleanup happens
        setTimeout(cleanup, this.defaultTimeout + 1000);
      });
    } finally {
      // Update performance metrics
      const responseTime = performance.now() - startTime;
      availableProcess.avgResponseTime =
        (availableProcess.avgResponseTime * (availableProcess.requestCount - 1) + responseTime) /
        availableProcess.requestCount;

      availableProcess.inUse = false;
      availableProcess.lastUsed = Date.now();
    }
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

  private generateCacheKey(request: BenchmarkRequest): string {
    const keyData = {
      model: this.config.model,
      fixtureType: request.metadata?.fixtureType || 'small',
      prompt: request.prompt,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
    };
    return Buffer.from(JSON.stringify(keyData)).toString('base64');
  }

  private getFromCache(key: string): BuildFixResult[] | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if cache entry is still valid
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.cacheStats.evictions++;
      return null;
    }

    return entry.result;
  }

  private addToCache(key: string, result: BuildFixResult[]): void {
    const entry: CacheEntry = {
      result,
      timestamp: Date.now(),
      ttl: 300000, // 5 minutes TTL
      key,
    };

    this.cache.set(key, entry);

    // Persist cache to disk
    this.persistCacheEntry(key, entry);

    // Cleanup old entries if cache is too large
    if (this.cache.size > 100) {
      this.cleanupCache();
    }
  }

  private async persistCacheEntry(key: string, entry: CacheEntry): Promise<void> {
    try {
      const cacheFile = join(this.cacheDir, `${key}.json`);
      await writeFile(cacheFile, JSON.stringify(entry), 'utf8');
    } catch (error) {
      // Ignore cache persistence errors
    }
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        this.cacheStats.evictions++;
      }
    }
  }

  private createCachedResponse(
    cachedResult: BuildFixResult[],
    perfMetrics: PerformanceMetrics,
  ): BenchmarkResponse {
    return {
      content: this.formatResponse(cachedResult),
      tokens: this.estimateTokens(cachedResult),
      time: performance.now() - perfMetrics.requestStartTime,
      metadata: {
        buildFixResults: cachedResult,
        cached: true,
        performanceMetrics: perfMetrics,
        cacheStats: { ...this.cacheStats },
      },
    };
  }

  private async parseBuildFixResults(output: string): Promise<BuildFixResult[]> {
    try {
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
      const results: BuildFixResult[] = [];
      const successMatch = output.match(/Successful Tests: (\d+)/);
      const totalMatch = output.match(/Total Tests: (\d+)/);

      if (successMatch && totalMatch && successMatch[1] && totalMatch[1]) {
        const successful = parseInt(successMatch[1]);
        const total = parseInt(totalMatch[1]);

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
BuildFix Enhanced Benchmark Results:
- Total Tests: ${totalTests}
- Successful Tests: ${successfulTests} (${((successfulTests / totalTests) * 100).toFixed(1)}%)
- Errors Resolved: ${errorsResolved} (${((errorsResolved / totalTests) * 100).toFixed(1)}%)
- Average Duration: ${(avgDuration / 1000).toFixed(1)}s
- Cache Hit Rate: ${((this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses)) * 100).toFixed(1)}%

Top Issues:
${results
  .filter((r) => r.errorMessage)
  .slice(0, 3)
  .map((r) => `- ${r.errorMessage}`)
  .join('\n')}
    `.trim();
  }

  private estimateTokens(results: BuildFixResult[]): number {
    return results.length * 100;
  }

  private async saveMetrics(): Promise<void> {
    try {
      const metricsFile = join(this.metricsDir, `buildfix-metrics-${Date.now()}.json`);
      const metricsData = {
        timestamp: new Date().toISOString(),
        metrics: this.getPerformanceMetrics(),
        cacheStats: this.cacheStats,
        processPoolStats: this.getProcessPoolStatus(),
      };
      await writeFile(metricsFile, JSON.stringify(metricsData, null, 2), 'utf8');
    } catch (error) {
      // Ignore metrics saving errors
    }
  }

  public override async measureResources() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      memoryUsage: memUsage.heapUsed,
      cpuUsage: cpuUsage.user + cpuUsage.system,
    };
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

  private recordMemoryStats(): void {
    const memUsage = process.memoryUsage();
    const stats: MemoryStats = {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      timestamp: Date.now(),
      pressure: this.calculateMemoryPressure(memUsage),
    };

    this.addToCircularBuffer(this.memoryStats, stats);
  }

  private calculateMemoryPressure(
    memUsage: NodeJS.MemoryUsage,
  ): 'low' | 'medium' | 'high' | 'critical' {
    const usageRatio = memUsage.heapUsed / memUsage.heapTotal;

    if (usageRatio > 0.9) return 'critical';
    if (usageRatio > 0.75) return 'high';
    if (usageRatio > 0.5) return 'medium';
    return 'low';
  }
}
