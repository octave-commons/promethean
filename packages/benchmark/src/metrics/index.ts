import { BenchmarkResult, BenchmarkMetrics, ResourceMetrics } from '../types/index.js';

export class MetricsCalculator {
  static calculateTPS(tokens: number, timeMs: number): number {
    return timeMs > 0 ? (tokens / timeMs) * 1000 : 0;
  }

  static calculateLatency(startTime: number, endTime: number): number {
    return endTime - startTime;
  }

  static calculateEffectiveness(response: string, expected?: string): number {
    if (!expected) return 0.5; // Default effectiveness when no expected output

    // Simple similarity metric - can be enhanced with more sophisticated algorithms
    const responseWords = response.toLowerCase().split(/\s+/);
    const expectedWords = expected.toLowerCase().split(/\s+/);

    const intersection = responseWords.filter((word) => expectedWords.includes(word));
    const union = [...new Set([...responseWords, ...expectedWords])];

    return intersection.length / union.length;
  }

  static calculateErrorRate(results: BenchmarkResult[]): number {
    if (results.length === 0) return 0;
    const errors = results.filter((result) => !result.success).length;
    return errors / results.length;
  }

  static calculateAverageMetrics(results: BenchmarkResult[]): BenchmarkMetrics {
    if (results.length === 0) {
      return {
        tps: 0,
        latency: 0,
        timeToFirstToken: 0,
        timeToCompletion: 0,
        effectiveness: 0,
        errorRate: 0,
      };
    }

    const validResults = results.filter((r) => r.success);
    if (validResults.length === 0) {
      return {
        tps: 0,
        latency: 0,
        timeToFirstToken: 0,
        timeToCompletion: 0,
        effectiveness: 0,
        errorRate: 1,
      };
    }

    const totalTPS = validResults.reduce((sum, r) => sum + r.metrics.tps, 0);
    const totalLatency = validResults.reduce((sum, r) => sum + r.metrics.latency, 0);
    const totalTimeToFirstToken = validResults.reduce(
      (sum, r) => sum + r.metrics.timeToFirstToken,
      0,
    );
    const totalTimeToCompletion = validResults.reduce(
      (sum, r) => sum + r.metrics.timeToCompletion,
      0,
    );
    const totalEffectiveness = validResults.reduce(
      (sum, r) => sum + (r.metrics.effectiveness || 0),
      0,
    );

    return {
      tps: totalTPS / validResults.length,
      latency: totalLatency / validResults.length,
      timeToFirstToken: totalTimeToFirstToken / validResults.length,
      timeToCompletion: totalTimeToCompletion / validResults.length,
      effectiveness: totalEffectiveness / validResults.length,
      errorRate: this.calculateErrorRate(results),
    };
  }

  static calculateAverageResourceUsage(results: BenchmarkResult[]): ResourceMetrics {
    if (results.length === 0) {
      return {
        memoryUsage: 0,
        cpuUsage: 0,
      };
    }

    const validResults = results.filter((r) => r.success);
    if (validResults.length === 0) {
      return {
        memoryUsage: 0,
        cpuUsage: 0,
      };
    }

    const totalMemory = validResults.reduce((sum, r) => sum + r.resources.memoryUsage, 0);
    const totalCPU = validResults.reduce((sum, r) => sum + r.resources.cpuUsage, 0);
    const totalGPU = validResults.reduce((sum, r) => sum + (r.resources.gpuUsage || 0), 0);
    const totalGPUMemory = validResults.reduce(
      (sum, r) => sum + (r.resources.gpuMemoryUsage || 0),
      0,
    );
    const totalPower = validResults.reduce(
      (sum, r) => sum + (r.resources.powerConsumption || 0),
      0,
    );

    return {
      memoryUsage: totalMemory / validResults.length,
      cpuUsage: totalCPU / validResults.length,
      gpuUsage: totalGPU / validResults.length,
      gpuMemoryUsage: totalGPUMemory / validResults.length,
      powerConsumption: totalPower / validResults.length,
    };
  }

  static calculateScore(
    metrics: BenchmarkMetrics,
    weights?: {
      tps?: number;
      latency?: number;
      effectiveness?: number;
      errorRate?: number;
    },
  ): number {
    const w = {
      tps: weights?.tps ?? 0.3,
      latency: weights?.latency ?? 0.3,
      effectiveness: weights?.effectiveness ?? 0.3,
      errorRate: weights?.errorRate ?? 0.1,
    };

    // Normalize metrics to 0-1 scale
    const normalizedTPS = Math.min(metrics.tps / 100, 1); // Assume 100 TPS is excellent
    const normalizedLatency = Math.max(0, 1 - metrics.latency / 10000); // 10s is bad
    const normalizedEffectiveness = metrics.effectiveness || 0;
    const normalizedErrorRate = Math.max(0, 1 - (metrics.errorRate || 0));

    return (
      normalizedTPS * w.tps +
      normalizedLatency * w.latency +
      normalizedEffectiveness * w.effectiveness +
      normalizedErrorRate * w.errorRate
    );
  }

  static rankProviders(results: BenchmarkResult[]): Array<{
    provider: string;
    score: number;
    metrics: BenchmarkMetrics;
  }> {
    const providerResults = new Map<string, BenchmarkResult[]>();

    // Group results by provider
    for (const result of results) {
      const providerName = result.provider.name;
      if (!providerResults.has(providerName)) {
        providerResults.set(providerName, []);
      }
      providerResults.get(providerName)!.push(result);
    }

    // Calculate scores for each provider
    const rankings = Array.from(providerResults.entries()).map(([provider, providerResults]) => {
      const avgMetrics = this.calculateAverageMetrics(providerResults);
      const score = this.calculateScore(avgMetrics);

      return {
        provider,
        score,
        metrics: avgMetrics,
      };
    });

    // Sort by score (descending)
    return rankings.sort((a, b) => b.score - a.score);
  }
}
