import { BaseProvider, createProvider } from './providers/index.js';
import {
  BenchmarkRequest,
  BenchmarkResponse,
  BenchmarkResult,
  BenchmarkSuite,
  BenchmarkReport,
  ProviderConfig,
} from './types/index.js';
import { MetricsCalculator } from './metrics/index.js';

interface OptimizedBenchmarkConfig {
  parallelProviders: boolean;
  maxConcurrentRequests: number;
  timeoutMs: number;
  retryAttempts: number;
  circuitBreakerThreshold: number;
  enableMemoryMonitoring: boolean;
  enablePerformanceTracking: boolean;
}

interface ParallelExecutionResult {
  providerName: string;
  request: BenchmarkRequest;
  result: BenchmarkResult;
  executionTime: number;
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
  nextAttemptTime: number;
}

export class OptimizedBenchmarkRunner {
  private providers: Map<string, BaseProvider> = new Map();
  private config: OptimizedBenchmarkConfig;
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private performanceMetrics: Map<string, number[]> = new Map();
  private memorySnapshots: Array<{
    timestamp: number;
    heapUsed: number;
    heapTotal: number;
    rss: number;
  }> = [];

  constructor(config: Partial<OptimizedBenchmarkConfig> = {}) {
    this.config = {
      parallelProviders: true,
      maxConcurrentRequests: 10,
      timeoutMs: 300000, // 5 minutes
      retryAttempts: 3,
      circuitBreakerThreshold: 5,
      enableMemoryMonitoring: true,
      enablePerformanceTracking: true,
      ...config,
    };

    if (this.config.enableMemoryMonitoring) {
      this.startMemoryMonitoring();
    }
  }

  async addProvider(config: ProviderConfig): Promise<void> {
    const provider = createProvider(config);
    await provider.connect();
    this.providers.set(config.name, provider);

    // Initialize circuit breaker for this provider
    this.circuitBreakers.set(config.name, {
      failures: 0,
      lastFailureTime: 0,
      state: 'closed',
      nextAttemptTime: 0,
    });

    // Initialize performance metrics tracking
    this.performanceMetrics.set(config.name, []);
  }

  async removeProvider(name: string): Promise<void> {
    const provider = this.providers.get(name);
    if (provider) {
      await provider.disconnect();
      this.providers.delete(name);
      this.circuitBreakers.delete(name);
      this.performanceMetrics.delete(name);
    }
  }

  async runSingleBenchmark(
    providerName: string,
    request: BenchmarkRequest,
  ): Promise<BenchmarkResult> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    // Check circuit breaker
    if (!this.canExecuteRequest(providerName)) {
      throw new Error(`Circuit breaker is open for provider ${providerName}`);
    }

    const startTime = Date.now();
    let success = true;
    let response: BenchmarkResponse;
    let error: string | undefined;
    let attempts = 0;

    // Retry logic with exponential backoff
    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      attempts++;
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), this.config.timeoutMs);
        });

        response = await Promise.race([provider.execute(request), timeoutPromise]);

        // Record success
        this.recordSuccess(providerName);
        break;
      } catch (err) {
        error = err instanceof Error ? err.message : String(err);

        if (attempt === this.config.retryAttempts - 1) {
          success = false;
          this.recordFailure(providerName);
          response = {
            content: '',
            tokens: 0,
            time: Date.now() - startTime,
          };
        } else {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    const metrics = provider.calculateMetrics(response!, startTime);
    const resources = await provider.measureResources();

    // Record performance metrics
    if (this.config.enablePerformanceTracking) {
      const executionTime = Date.now() - startTime;
      const providerMetrics = this.performanceMetrics.get(providerName) || [];
      providerMetrics.push(executionTime);

      // Keep only last 100 metrics
      if (providerMetrics.length > 100) {
        providerMetrics.shift();
      }

      this.performanceMetrics.set(providerName, providerMetrics);
    }

    return {
      provider: provider.getConfig(),
      request,
      response: response!,
      metrics,
      resources,
      timestamp: new Date(),
      success,
      error,
    };
  }

  async runBenchmarkSuiteParallel(suite: BenchmarkSuite): Promise<BenchmarkReport> {
    const results: BenchmarkResult[] = [];

    // Add all providers
    for (const providerConfig of suite.providers) {
      if (!this.providers.has(providerConfig.name)) {
        await this.addProvider(providerConfig);
      }
    }

    // Warmup phase (parallel)
    const warmupPromises: Promise<void>[] = [];
    for (const providerConfig of suite.providers) {
      for (let warmupIter = 0; warmupIter < suite.warmupIterations; warmupIter++) {
        const warmupRequest: BenchmarkRequest = {
          prompt: 'Hello',
          maxTokens: 10,
        };

        warmupPromises.push(
          this.runSingleBenchmark(providerConfig.name, warmupRequest)
            .then(() => {}) // Ignore warmup results
            .catch(() => {}), // Ignore warmup errors
        );
      }
    }

    // Wait for all warmups to complete
    await Promise.allSettled(warmupPromises);

    // Main benchmark phase (parallel execution)
    const executionPromises: Promise<ParallelExecutionResult>[] = [];

    for (let iteration = 0; iteration < suite.iterations; iteration++) {
      for (const request of suite.requests) {
        for (const providerConfig of suite.providers) {
          const executionPromise = this.runSingleBenchmark(providerConfig.name, request)
            .then((result) => ({
              providerName: providerConfig.name,
              request,
              result,
              executionTime: result.metrics.latency,
            }))
            .catch((error) => ({
              providerName: providerConfig.name,
              request,
              result: {
                provider: providerConfig,
                request,
                response: {
                  content: '',
                  tokens: 0,
                  time: 0,
                },
                metrics: {
                  tps: 0,
                  latency: 0,
                  timeToFirstToken: 0,
                  timeToCompletion: 0,
                },
                resources: {
                  memoryUsage: 0,
                  cpuUsage: 0,
                },
                timestamp: new Date(),
                success: false,
                error: error instanceof Error ? error.message : String(error),
              },
              executionTime: 0,
            }));

          executionPromises.push(executionPromise);

          // Limit concurrent requests
          if (executionPromises.length >= this.config.maxConcurrentRequests) {
            const batchResults = await Promise.allSettled(executionPromises);

            // Process batch results
            batchResults.forEach((batchResult) => {
              if (batchResult.status === 'fulfilled') {
                results.push(batchResult.value.result);
              } else {
                console.error('Batch execution failed:', batchResult.reason);
              }
            });

            // Clear the batch
            executionPromises.length = 0;
          }
        }
      }
    }

    // Process remaining promises
    if (executionPromises.length > 0) {
      const finalResults = await Promise.allSettled(executionPromises);
      finalResults.forEach((batchResult) => {
        if (batchResult.status === 'fulfilled') {
          results.push(batchResult.value.result);
        } else {
          console.error('Final batch execution failed:', batchResult.reason);
        }
      });
    }

    // Generate report
    const summary = this.generateOptimizedSummary(results, suite);

    return {
      suite,
      results,
      summary,
      generatedAt: new Date(),
    };
  }

  async runBenchmarkSuite(suite: BenchmarkSuite): Promise<BenchmarkReport> {
    if (this.config.parallelProviders) {
      return this.runBenchmarkSuiteParallel(suite);
    } else {
      // Fallback to sequential execution
      return this.runBenchmarkSuiteSequential(suite);
    }
  }

  private async runBenchmarkSuiteSequential(suite: BenchmarkSuite): Promise<BenchmarkReport> {
    const results: BenchmarkResult[] = [];

    // Add all providers
    for (const providerConfig of suite.providers) {
      if (!this.providers.has(providerConfig.name)) {
        await this.addProvider(providerConfig);
      }
    }

    // Warmup phase
    for (let warmupIter = 0; warmupIter < suite.warmupIterations; warmupIter++) {
      for (const providerConfig of suite.providers) {
        const warmupRequest: BenchmarkRequest = {
          prompt: 'Hello',
          maxTokens: 10,
        };

        try {
          await this.runSingleBenchmark(providerConfig.name, warmupRequest);
        } catch (error) {
          // Ignore warmup errors
        }
      }
    }

    // Main benchmark phase
    for (let iteration = 0; iteration < suite.iterations; iteration++) {
      for (const request of suite.requests) {
        for (const providerConfig of suite.providers) {
          const result = await this.runSingleBenchmark(providerConfig.name, request);
          results.push(result);
        }
      }
    }

    // Generate report
    const summary = this.generateOptimizedSummary(results, suite);

    return {
      suite,
      results,
      summary,
      generatedAt: new Date(),
    };
  }

  private generateOptimizedSummary(results: BenchmarkResult[], suite: BenchmarkSuite) {
    const totalTests = results.length;
    const successRate = (results.filter((r) => r.success).length / totalTests) * 100;

    // Calculate average metrics per provider
    const averageMetrics: Record<string, any> = {};
    const resourceUsage: Record<string, any> = {};
    const performanceStats: Record<string, any> = {};

    for (const providerConfig of suite.providers) {
      const providerResults = results.filter((r) => r.provider.name === providerConfig.name);
      averageMetrics[providerConfig.name] =
        MetricsCalculator.calculateAverageMetrics(providerResults);
      resourceUsage[providerConfig.name] =
        MetricsCalculator.calculateAverageResourceUsage(providerResults);

      // Calculate performance statistics
      const providerMetrics = this.performanceMetrics.get(providerConfig.name) || [];
      if (providerMetrics.length > 0) {
        const sorted = [...providerMetrics].sort((a, b) => a - b);
        performanceStats[providerConfig.name] = {
          avg: providerMetrics.reduce((sum, time) => sum + time, 0) / providerMetrics.length,
          min: sorted[0],
          max: sorted[sorted.length - 1],
          p50: sorted[Math.floor(sorted.length * 0.5)],
          p95: sorted[Math.floor(sorted.length * 0.95)],
          p99: sorted[Math.floor(sorted.length * 0.99)],
        };
      }
    }

    const rankings = MetricsCalculator.rankProviders(results);

    return {
      totalTests,
      successRate,
      averageMetrics,
      resourceUsage,
      rankings,
      performanceStats,
      circuitBreakerStatus: Object.fromEntries(this.circuitBreakers),
      memorySnapshots: this.memorySnapshots,
      config: this.config,
    };
  }

  private canExecuteRequest(providerName: string): boolean {
    const circuitBreaker = this.circuitBreakers.get(providerName);
    if (!circuitBreaker) return true;

    const now = Date.now();

    switch (circuitBreaker.state) {
      case 'closed':
        return true;

      case 'open':
        if (now >= circuitBreaker.nextAttemptTime) {
          circuitBreaker.state = 'half-open';
          return true;
        }
        return false;

      case 'half-open':
        return true;

      default:
        return false;
    }
  }

  private recordSuccess(providerName: string): void {
    const circuitBreaker = this.circuitBreakers.get(providerName);
    if (circuitBreaker && circuitBreaker.state === 'half-open') {
      circuitBreaker.failures = 0;
      circuitBreaker.state = 'closed';
    }
  }

  private recordFailure(providerName: string): void {
    const circuitBreaker = this.circuitBreakers.get(providerName);
    if (!circuitBreaker) return;

    circuitBreaker.failures++;
    circuitBreaker.lastFailureTime = Date.now();

    if (circuitBreaker.failures >= this.config.circuitBreakerThreshold) {
      circuitBreaker.state = 'open';
      circuitBreaker.nextAttemptTime = Date.now() + 60000; // 1 minute recovery
    }
  }

  private startMemoryMonitoring(): void {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      this.memorySnapshots.push({
        timestamp: Date.now(),
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        rss: memUsage.rss,
      });

      // Keep only last 1000 snapshots
      if (this.memorySnapshots.length > 1000) {
        this.memorySnapshots.shift();
      }
    }, 30000); // Every 30 seconds
  }

  async listProviderModels(providerName: string): Promise<string[]> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    if ('listModels' in provider && typeof provider.listModels === 'function') {
      return await (provider as any).listModels();
    }

    throw new Error(`Provider ${providerName} does not support listing models`);
  }

  async checkProviderHealth(providerName: string): Promise<boolean> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      return false;
    }

    return await provider.isHealthy();
  }

  async checkAllProvidersHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};

    for (const [name, provider] of this.providers) {
      try {
        health[name] = await provider.isHealthy();
      } catch (error) {
        health[name] = false;
      }
    }

    return health;
  }

  getProviders(): BaseProvider[] {
    return Array.from(this.providers.values());
  }

  getPerformanceMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};

    for (const [providerName, times] of this.performanceMetrics) {
      if (times.length > 0) {
        const sorted = [...times].sort((a, b) => a - b);
        metrics[providerName] = {
          count: times.length,
          avg: times.reduce((sum, time) => sum + time, 0) / times.length,
          min: sorted[0],
          max: sorted[sorted.length - 1],
          p50: sorted[Math.floor(sorted.length * 0.5)],
          p95: sorted[Math.floor(sorted.length * 0.95)],
          p99: sorted[Math.floor(sorted.length * 0.99)],
        };
      }
    }

    return metrics;
  }

  getCircuitBreakerStatus(): Record<string, CircuitBreakerState> {
    return Object.fromEntries(this.circuitBreakers);
  }

  getMemorySnapshots() {
    return [...this.memorySnapshots];
  }

  async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.providers.values()).map((provider) =>
      provider.disconnect().catch((error) => console.error('Error disconnecting provider:', error)),
    );

    await Promise.all(disconnectPromises);
    this.providers.clear();
    this.circuitBreakers.clear();
    this.performanceMetrics.clear();
    this.memorySnapshots = [];
  }
}
