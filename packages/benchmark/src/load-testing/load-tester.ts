import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';

export interface LoadTestConfig {
  concurrentUsers: number;
  requestsPerUser: number;
  rampUpTime: number; // milliseconds
  testDuration: number; // milliseconds
  thinkTime: number; // milliseconds between requests
  timeout: number; // request timeout
}

export interface LoadTestRequest {
  id: string;
  userId: number;
  timestamp: number;
  payload: any;
}

export interface LoadTestResponse {
  requestId: string;
  userId: number;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: string;
  statusCode?: number;
  responseSize?: number;
}

export interface LoadTestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerSecond: number;
  errorsPerSecond: number;
  throughput: number; // bytes per second
  concurrentUsers: number;
  testDuration: number;
  errorRate: number;
}

export interface UserSimulation {
  userId: number;
  requests: LoadTestRequest[];
  responses: LoadTestResponse[];
  startTime: number;
  endTime: number;
}

export class LoadTester extends EventEmitter {
  private config: LoadTestConfig;
  private userSimulations: Map<number, UserSimulation> = new Map();
  private responses: LoadTestResponse[] = [];
  private isRunning = false;
  private startTime = 0;
  private endTime = 0;

  constructor(config: LoadTestConfig) {
    super();
    this.config = config;
  }

  async runTest(
    requestGenerator: (userId: number, requestId: string) => any,
    requestExecutor: (payload: any) => Promise<any>,
  ): Promise<LoadTestMetrics> {
    if (this.isRunning) {
      throw new Error('Load test is already running');
    }

    this.isRunning = true;
    this.startTime = performance.now();
    this.responses = [];
    this.userSimulations.clear();

    this.emit('test-started', { config: this.config });

    try {
      // Initialize user simulations
      for (let userId = 1; userId <= this.config.concurrentUsers; userId++) {
        const userSimulation: UserSimulation = {
          userId,
          requests: [],
          responses: [],
          startTime: 0,
          endTime: 0,
        };

        // Generate requests for this user
        for (let reqId = 0; reqId < this.config.requestsPerUser; reqId++) {
          const requestId = `user-${userId}-req-${reqId}`;
          const request: LoadTestRequest = {
            id: requestId,
            userId,
            timestamp: 0, // Will be set during execution
            payload: requestGenerator(userId, requestId),
          };
          userSimulation.requests.push(request);
        }

        this.userSimulations.set(userId, userSimulation);
      }

      // Execute load test with ramp-up
      await this.executeWithRampUp(requestExecutor);

      this.endTime = performance.now();
      const metrics = this.calculateMetrics();

      this.emit('test-completed', { metrics, duration: this.endTime - this.startTime });
      return metrics;
    } finally {
      this.isRunning = false;
    }
  }

  async runStressTest(
    maxUsers: number,
    stepSize: number,
    stepDuration: number,
    requestGenerator: (userId: number, requestId: string) => any,
    requestExecutor: (payload: any) => Promise<any>,
  ): Promise<LoadTestMetrics[]> {
    const results: LoadTestMetrics[] = [];

    for (let users = stepSize; users <= maxUsers; users += stepSize) {
      this.emit('stress-step-started', { users, step: users / stepSize });

      const stepConfig: LoadTestConfig = {
        ...this.config,
        concurrentUsers: users,
        testDuration: stepDuration,
      };

      const stepTester = new LoadTester(stepConfig);
      const stepMetrics = await stepTester.runTest(requestGenerator, requestExecutor);
      results.push(stepMetrics);

      this.emit('stress-step-completed', { users, metrics: stepMetrics });

      // Check if we should stop (high error rate)
      if (stepMetrics.errorRate > 0.1) {
        // 10% error rate threshold
        this.emit('stress-test-threshold-reached', { users, errorRate: stepMetrics.errorRate });
        break;
      }

      // Brief pause between steps
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    return results;
  }

  async runEnduranceTest(
    duration: number,
    requestGenerator: (userId: number, requestId: string) => any,
    requestExecutor: (payload: any) => Promise<any>,
  ): Promise<LoadTestMetrics[]> {
    const results: LoadTestMetrics[] = [];
    const intervalDuration = 60000; // 1 minute intervals
    const intervals = Math.ceil(duration / intervalDuration);

    this.emit('endurance-test-started', { duration, intervals });

    for (let interval = 1; interval <= intervals; interval++) {
      const intervalConfig: LoadTestConfig = {
        ...this.config,
        testDuration: intervalDuration,
      };

      const intervalTester = new LoadTester(intervalConfig);
      const intervalMetrics = await intervalTester.runTest(requestGenerator, requestExecutor);
      results.push(intervalMetrics);

      this.emit('endurance-interval-completed', { interval, metrics: intervalMetrics });
    }

    return results;
  }

  private async executeWithRampUp(requestExecutor: (payload: any) => Promise<any>): Promise<void> {
    const rampUpDelay = this.config.rampUpTime / this.config.concurrentUsers;
    const userPromises: Promise<void>[] = [];

    for (let userId = 1; userId <= this.config.concurrentUsers; userId++) {
      const userPromise = this.simulateUser(userId, requestExecutor);
      userPromises.push(userPromise);

      // Ramp-up delay
      if (userId < this.config.concurrentUsers) {
        await new Promise((resolve) => setTimeout(resolve, rampUpDelay));
      }
    }

    await Promise.all(userPromises);
  }

  private async simulateUser(
    userId: number,
    requestExecutor: (payload: any) => Promise<any>,
  ): Promise<void> {
    const userSimulation = this.userSimulations.get(userId);
    if (!userSimulation) return;

    userSimulation.startTime = performance.now();

    for (const request of userSimulation.requests) {
      if (performance.now() - this.startTime > this.config.testDuration) {
        break; // Test duration exceeded
      }

      const response = await this.executeRequest(request, requestExecutor);
      userSimulation.responses.push(response);
      this.responses.push(response);

      // Think time between requests
      if (this.config.thinkTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, this.config.thinkTime));
      }
    }

    userSimulation.endTime = performance.now();
  }

  private async executeRequest(
    request: LoadTestRequest,
    requestExecutor: (payload: any) => Promise<any>,
  ): Promise<LoadTestResponse> {
    const startTime = performance.now();
    request.timestamp = startTime;

    try {
      const result = await Promise.race([
        requestExecutor(request.payload),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), this.config.timeout),
        ),
      ]);

      const endTime = performance.now();
      return {
        requestId: request.id,
        userId: request.userId,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: true,
        responseSize: JSON.stringify(result).length,
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        requestId: request.id,
        userId: request.userId,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private calculateMetrics(): LoadTestMetrics {
    if (this.responses.length === 0) {
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
        p50ResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        requestsPerSecond: 0,
        errorsPerSecond: 0,
        throughput: 0,
        concurrentUsers: this.config.concurrentUsers,
        testDuration: this.endTime - this.startTime,
        errorRate: 0,
      };
    }

    const successfulResponses = this.responses.filter((r) => r.success);
    const failedResponses = this.responses.filter((r) => !r.success);
    const responseTimes = successfulResponses.map((r) => r.duration).sort((a, b) => a - b);
    const totalBytes = this.responses.reduce((sum, r) => sum + (r.responseSize || 0), 0);
    const testDurationSeconds = (this.endTime - this.startTime) / 1000;

    return {
      totalRequests: this.responses.length,
      successfulRequests: successfulResponses.length,
      failedRequests: failedResponses.length,
      averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      p50ResponseTime: this.getPercentile(responseTimes, 0.5) || 0,
      p95ResponseTime: this.getPercentile(responseTimes, 0.95) || 0,
      p99ResponseTime: this.getPercentile(responseTimes, 0.99) || 0,
      requestsPerSecond: this.responses.length / testDurationSeconds,
      errorsPerSecond: failedResponses.length / testDurationSeconds,
      throughput: totalBytes / testDurationSeconds,
      concurrentUsers: this.config.concurrentUsers,
      testDuration: this.endTime - this.startTime,
      errorRate: failedResponses.length / this.responses.length,
    };
  }

  private getPercentile(sortedArray: number[], percentile: number): number | undefined {
    if (sortedArray.length === 0) return undefined;
    const index = Math.ceil(sortedArray.length * percentile) - 1;
    return sortedArray[Math.max(0, index)];
  }

  async saveResults(filePath?: string): Promise<void> {
    const results = {
      config: this.config,
      metrics: this.calculateMetrics(),
      responses: this.responses,
      userSimulations: Array.from(this.userSimulations.values()),
      timestamp: new Date().toISOString(),
    };

    const outputPath = filePath || join('.load-test-results', `load-test-${Date.now()}.json`);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, JSON.stringify(results, null, 2));

    this.emit('results-saved', { path: outputPath });
  }

  getResponses(): LoadTestResponse[] {
    return [...this.responses];
  }

  getUserSimulations(): UserSimulation[] {
    return Array.from(this.userSimulations.values());
  }

  isTestRunning(): boolean {
    return this.isRunning;
  }
}

export class LoadTestReporter {
  static generateReport(metrics: LoadTestMetrics): string {
    return `
Load Test Report
================

Test Configuration:
- Concurrent Users: ${metrics.concurrentUsers}
- Test Duration: ${(metrics.testDuration / 1000).toFixed(2)}s
- Total Requests: ${metrics.totalRequests}

Results:
- Successful Requests: ${metrics.successfulRequests} (${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)}%)
- Failed Requests: ${metrics.failedRequests} (${((metrics.failedRequests / metrics.totalRequests) * 100).toFixed(1)}%)
- Error Rate: ${(metrics.errorRate * 100).toFixed(2)}%

Performance Metrics:
- Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms
- Min Response Time: ${metrics.minResponseTime.toFixed(2)}ms
- Max Response Time: ${metrics.maxResponseTime.toFixed(2)}ms
- 50th Percentile: ${metrics.p50ResponseTime.toFixed(2)}ms
- 95th Percentile: ${metrics.p95ResponseTime.toFixed(2)}ms
- 99th Percentile: ${metrics.p99ResponseTime.toFixed(2)}ms

Throughput:
- Requests per Second: ${metrics.requestsPerSecond.toFixed(2)}
- Errors per Second: ${metrics.errorsPerSecond.toFixed(2)}
- Data Throughput: ${(metrics.throughput / 1024).toFixed(2)} KB/s

Performance Assessment:
${this.assessPerformance(metrics)}
    `.trim();
  }

  private static assessPerformance(metrics: LoadTestMetrics): string {
    const assessments: string[] = [];

    if (metrics.errorRate > 0.05) {
      assessments.push('❌ High error rate detected');
    } else if (metrics.errorRate > 0.01) {
      assessments.push('⚠️  Moderate error rate');
    } else {
      assessments.push('✅ Low error rate');
    }

    if (metrics.averageResponseTime > 5000) {
      assessments.push('❌ Very slow response times');
    } else if (metrics.averageResponseTime > 2000) {
      assessments.push('⚠️  Slow response times');
    } else if (metrics.averageResponseTime > 1000) {
      assessments.push('🟡 Moderate response times');
    } else {
      assessments.push('✅ Fast response times');
    }

    if (metrics.p95ResponseTime > 10000) {
      assessments.push('❌ Poor 95th percentile performance');
    } else if (metrics.p95ResponseTime > 5000) {
      assessments.push('⚠️  Moderate 95th percentile performance');
    } else {
      assessments.push('✅ Good 95th percentile performance');
    }

    if (metrics.requestsPerSecond < 10) {
      assessments.push('❌ Low throughput');
    } else if (metrics.requestsPerSecond < 50) {
      assessments.push('🟡 Moderate throughput');
    } else {
      assessments.push('✅ High throughput');
    }

    return assessments.join('\n');
  }

  static generateComparisonReport(results: LoadTestMetrics[]): string {
    if (results.length === 0) return 'No results to compare';

    let report = 'Load Test Comparison Report\n============================\n\n';

    report += '| Users | RPS (req/s) | Avg Time (ms) | 95th %ile (ms) | Error Rate |\n';
    report += '|-------|------------|---------------|----------------|------------|\n';

    for (const result of results) {
      report += `| ${result.concurrentUsers} | ${result.requestsPerSecond.toFixed(1)} | ${result.averageResponseTime.toFixed(1)} | ${result.p95ResponseTime.toFixed(1)} | ${(result.errorRate * 100).toFixed(1)}% |\n`;
    }

    // Find optimal performance point
    const bestThroughput = results.reduce((best, current) =>
      current.requestsPerSecond > best.requestsPerSecond ? current : best,
    );

    const bestResponseTime = results.reduce((best, current) =>
      current.averageResponseTime < best.averageResponseTime ? current : best,
    );

    report += '\nPerformance Summary:\n';
    report += `- Best Throughput: ${bestThroughput.concurrentUsers} users (${bestThroughput.requestsPerSecond.toFixed(1)} req/s)\n`;
    report += `- Best Response Time: ${bestResponseTime.concurrentUsers} users (${bestResponseTime.averageResponseTime.toFixed(1)}ms avg)\n`;

    return report;
  }
}
