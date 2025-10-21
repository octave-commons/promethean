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
import { OptimizedBenchmarkRunner } from './benchmark-optimized.js';

export class BenchmarkRunner {
  private providers: Map<string, BaseProvider> = new Map();
  private optimizedRunner: OptimizedBenchmarkRunner;

  constructor(enableOptimizations = true) {
    this.optimizedRunner = new OptimizedBenchmarkRunner({
      parallelProviders: enableOptimizations,
      maxConcurrentRequests: enableOptimizations ? 10 : 1,
      timeoutMs: 300000,
      retryAttempts: 3,
      circuitBreakerThreshold: 5,
      enableMemoryMonitoring: enableOptimizations,
      enablePerformanceTracking: enableOptimizations,
    });
  }

  async addProvider(config: ProviderConfig): Promise<void> {
    const provider = createProvider(config);
    await provider.connect();
    this.providers.set(config.name, provider);

    // Also add to optimized runner
    await this.optimizedRunner.addProvider(config);
  }

  async removeProvider(name: string): Promise<void> {
    const provider = this.providers.get(name);
    if (provider) {
      await provider.disconnect();
      this.providers.delete(name);
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

    const startTime = Date.now();
    let success = true;
    let response: BenchmarkResponse;
    let error: string | undefined;

    try {
      response = await provider.execute(request);
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : String(err);
      response = {
        content: '',
        tokens: 0,
        time: Date.now() - startTime,
      };
    }

    const metrics = provider.calculateMetrics(response, startTime);
    const resources = await provider.measureResources();

    return {
      provider: provider.getConfig(),
      request,
      response,
      metrics,
      resources,
      timestamp: new Date(),
      success,
      error,
    };
  }

  async runBenchmarkSuite(suite: BenchmarkSuite): Promise<BenchmarkReport> {
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
        // Use a simple warmup request
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
    const summary = this.generateSummary(results, suite);

    return {
      suite,
      results,
      summary,
      generatedAt: new Date(),
    };
  }

  private generateSummary(results: BenchmarkResult[], suite: BenchmarkSuite) {
    const totalTests = results.length;
    const successRate = (results.filter((r) => r.success).length / totalTests) * 100;

    // Calculate average metrics per provider
    const averageMetrics: Record<string, any> = {};
    const resourceUsage: Record<string, any> = {};

    for (const providerConfig of suite.providers) {
      const providerResults = results.filter((r) => r.provider.name === providerConfig.name);
      averageMetrics[providerConfig.name] =
        MetricsCalculator.calculateAverageMetrics(providerResults);
      resourceUsage[providerConfig.name] =
        MetricsCalculator.calculateAverageResourceUsage(providerResults);
    }

    const rankings = MetricsCalculator.rankProviders(results);

    return {
      totalTests,
      successRate,
      averageMetrics,
      resourceUsage,
      rankings,
    };
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

  async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.providers.values()).map((provider) =>
      provider.disconnect().catch((error) => console.error('Error disconnecting provider:', error)),
    );

    await Promise.all(disconnectPromises);
    this.providers.clear();
  }
}
