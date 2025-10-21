import { EnhancedBuildFixProvider } from '../providers/buildfix-enhanced.js';
import { globalPerformanceMonitor } from '../metrics/performance-monitor.js';
import { ResourceManager, MemoryManager } from '../metrics/resource-manager.js';
import { MultiLevelCache } from '../cache/advanced-cache.js';
import { LoadTester, LoadTestReporter } from '../load-testing/load-tester.js';
import { ProviderConfig } from '../types/index.js';

export interface OptimizationConfig {
  monitoring?: {
    enabled: boolean;
    interval?: number;
    thresholds?: {
      memory?: number;
      cpu?: number;
      eventLoop?: number;
    };
  };
  caching?: {
    enabled: boolean;
    type?: 'lru' | 'lfu' | 'ttl' | 'size' | 'multilevel';
    config?: {
      maxSize?: number;
      maxMemory?: number;
      defaultTtl?: number;
    };
  };
  resourceManagement?: {
    enabled: boolean;
    processPool?: {
      minSize?: number;
      maxSize?: number;
      acquireTimeout?: number;
    };
  };
  loadTesting?: {
    enabled: boolean;
    config?: {
      concurrentUsers?: number;
      requestsPerUser?: number;
      testDuration?: number;
    };
  };
}

export class OptimizedBuildFixSystem {
  private provider: EnhancedBuildFixProvider;
  private resourceManager: ResourceManager;
  private cache: MultiLevelCache;
  private config: OptimizationConfig;
  private isInitialized = false;

  constructor(providerConfig: ProviderConfig, optimizationConfig: OptimizationConfig = {}) {
    this.config = {
      monitoring: { enabled: true, ...optimizationConfig.monitoring },
      caching: { enabled: true, type: 'multilevel', ...optimizationConfig.caching },
      resourceManagement: { enabled: true, ...optimizationConfig.resourceManagement },
      loadTesting: { enabled: false, ...optimizationConfig.loadTesting },
    };

    this.provider = new EnhancedBuildFixProvider(providerConfig);
    this.resourceManager = new ResourceManager();
    this.cache = this.setupCache();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Initialize provider
    await this.provider.connect();

    // Setup monitoring
    if (this.config.monitoring?.enabled) {
      this.setupMonitoring();
    }

    // Setup resource management
    if (this.config.resourceManagement?.enabled) {
      this.setupResourceManagement();
    }

    this.isInitialized = true;
    console.log('✅ Optimized BuildFix system initialized successfully');
  }

  async executeBenchmark(request: any): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('System not initialized. Call initialize() first.');
    }

    const startTime = performance.now();

    try {
      // Check cache first
      if (this.config.caching?.enabled) {
        const cacheKey = this.generateCacheKey(request);
        const cached = await this.cache.get(cacheKey);
        if (cached) {
          console.log('🎯 Cache hit for benchmark request');
          return cached;
        }
      }

      // Execute benchmark
      const result = await this.provider.execute(request);

      // Cache result
      if (this.config.caching?.enabled) {
        const cacheKey = this.generateCacheKey(request);
        await this.cache.set(cacheKey, result, this.config.caching.config?.defaultTtl);
      }

      const duration = performance.now() - startTime;
      console.log(`⚡ Benchmark completed in ${duration.toFixed(2)}ms`);

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`❌ Benchmark failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }

  async runLoadTest(): Promise<any> {
    if (!this.config.loadTesting?.enabled) {
      throw new Error('Load testing not enabled in configuration');
    }

    const config = {
      concurrentUsers: this.config.loadTesting.config?.concurrentUsers || 10,
      requestsPerUser: this.config.loadTesting.config?.requestsPerUser || 5,
      testDuration: this.config.loadTesting.config?.testDuration || 60000,
      rampUpTime: 30000,
      thinkTime: 1000,
      timeout: 30000,
    };

    const loadTester = new LoadTester(config);

    // Request generator
    const requestGenerator = (userId: number, requestId: string) => ({
      model: 'qwen3:8b',
      fixtureType: 'small',
      prompt: `Load test request ${requestId} from user ${userId}`,
      metadata: { userId, requestId, loadTest: true },
    });

    // Request executor
    const requestExecutor = async (payload: any) => {
      return await this.executeBenchmark(payload);
    };

    console.log(
      `🚀 Starting load test: ${config.concurrentUsers} users, ${config.requestsPerUser} requests each`,
    );

    const metrics = await loadTester.runTest(requestGenerator, requestExecutor);
    const report = LoadTestReporter.generateReport(metrics);

    console.log('\n📊 Load Test Results:');
    console.log(report);

    await loadTester.saveResults();

    return { metrics, report };
  }

  async getSystemStatus(): Promise<any> {
    const status = {
      initialized: this.isInitialized,
      provider: {
        connected: await this.provider.isHealthy(),
        performanceMetrics: this.provider.getPerformanceMetrics(),
        cacheStats: this.provider.getCacheStats(),
        processPoolStatus: this.provider.getProcessPoolStatus(),
      },
      monitoring: {
        enabled: this.config.monitoring?.enabled,
        snapshots: globalPerformanceMonitor.getSnapshots().length,
        alerts: globalPerformanceMonitor.getAlerts().length,
      },
      resourceManager: {
        enabled: this.config.resourceManagement?.enabled,
        pools: this.resourceManager.getAllStats(),
      },
      cache: {
        enabled: this.config.caching?.enabled,
        stats: this.cache.getStats(),
      },
      memory: MemoryManager.getInstance().checkMemoryUsage(),
    };

    return status;
  }

  async optimizeSystem(): Promise<any> {
    const beforeStatus = await this.getSystemStatus();

    console.log('🔧 Starting system optimization...');

    // Force garbage collection
    MemoryManager.getInstance().forceGC();

    // Clear cache if memory pressure is high
    const memoryCheck = MemoryManager.getInstance().checkMemoryUsage();
    if (!memoryCheck.ok && memoryCheck.issues.some((issue) => issue.includes('Memory'))) {
      console.log('🧹 Clearing cache due to memory pressure');
      await this.cache.clear();
      await this.provider.clearCache();
    }

    // Optimize resource pools
    const poolStats = this.resourceManager.getAllStats();
    for (const [poolName, stats] of Object.entries(poolStats)) {
      if (stats.active / stats.total > 0.8) {
        console.log(
          `⚠️  High utilization in pool ${poolName}: ${((stats.active / stats.total) * 100).toFixed(1)}%`,
        );
      }
    }

    const afterStatus = await this.getSystemStatus();

    return {
      before: beforeStatus,
      after: afterStatus,
      optimizations: [
        'Garbage collection forced',
        memoryCheck.ok ? 'Memory usage acceptable' : 'Cache cleared due to memory pressure',
        'Resource pools analyzed',
      ],
    };
  }

  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down optimized BuildFix system...');

    // Stop monitoring
    if (this.config.monitoring?.enabled) {
      globalPerformanceMonitor.stopMonitoring();
      globalPerformanceMonitor.exportMetrics('./final-performance-metrics.json');
    }

    // Cleanup resources
    this.resourceManager.destroy();
    await this.cache.clear();

    // Disconnect provider
    await this.provider.disconnect();

    this.isInitialized = false;
    console.log('✅ System shutdown complete');
  }

  private setupCache(): MultiLevelCache {
    if (!this.config.caching?.enabled) {
      return new MultiLevelCache();
    }

    const cacheConfig = this.config.caching.config || {};

    switch (this.config.caching.type) {
      case 'lru':
        return new MultiLevelCache({
          l1: { maxSize: cacheConfig.maxSize || 100, defaultTtl: cacheConfig.defaultTtl || 300000 },
        });
      case 'multilevel':
        return new MultiLevelCache({
          l1: { maxSize: 100, defaultTtl: 300000 },
          l2: { maxSize: 1000, defaultTtl: 3600000, persistToDisk: true },
        });
      default:
        return new MultiLevelCache();
    }
  }

  private setupMonitoring(): void {
    const thresholds = this.config.monitoring?.thresholds || {};
    globalPerformanceMonitor.setThresholds({
      memory: thresholds.memory || 0.8,
      cpu: thresholds.cpu || 0.8,
      eventLoop: thresholds.eventLoop || 100,
    });

    globalPerformanceMonitor.startMonitoring();

    // Setup alert handlers
    globalPerformanceMonitor.on('alert', (alert) => {
      console.warn(`🚨 Performance Alert [${alert.severity.toUpperCase()}]: ${alert.message}`);
    });

    // Setup periodic status reporting
    setInterval(async () => {
      const status = await this.getSystemStatus();
      console.log('📈 System Status:', {
        memory: `${(status.memory.memoryUsage / 1024).toFixed(1)}MB`,
        cacheHitRate: `${((status.provider.cacheStats.hits / (status.provider.cacheStats.hits + status.provider.cacheStats.misses)) * 100).toFixed(1)}%`,
        processPool: `${status.provider.processPoolStatus.active}/${status.provider.processPoolStatus.maxSize}`,
      });
    }, 30000); // Every 30 seconds
  }

  private setupResourceManagement(): void {
    const processConfig = this.config.resourceManagement?.processPool || {};

    this.resourceManager.createPool('buildfix-processes', {
      minSize: processConfig.minSize || 2,
      maxSize: processConfig.maxSize || 8,
      acquireTimeout: processConfig.acquireTimeout || 30000,
      createResource: async () => {
        // Create a reusable BuildFix process
        return { type: 'buildfix-process', created: Date.now() };
      },
      destroyResource: async (resource) => {
        // Cleanup process
        console.log('🗑️  Destroying BuildFix process:', resource);
      },
      validateResource: (resource) => {
        return resource.type === 'buildfix-process' && Date.now() - resource.created < 300000; // 5 minutes max lifetime
      },
    });

    // Setup resource monitoring
    this.resourceManager.on('resource-alert', ({ name, alert }) => {
      console.warn(`🚨 Resource Alert [${name}]: ${alert.message}`);
    });
  }

  private generateCacheKey(request: any): string {
    const keyData = {
      model: request.model,
      fixtureType: request.fixtureType,
      prompt: request.prompt,
      temperature: request.temperature,
    };
    return Buffer.from(JSON.stringify(keyData)).toString('base64');
  }
}

// Factory function for easy instantiation
export function createOptimizedBuildFixSystem(
  providerConfig: ProviderConfig,
  optimizationConfig: OptimizationConfig = {},
): OptimizedBuildFixSystem {
  return new OptimizedBuildFixSystem(providerConfig, optimizationConfig);
}

// Example usage
export async function exampleUsage(): Promise<void> {
  const system = createOptimizedBuildFixSystem(
    {
      name: 'buildfix-optimized',
      type: 'buildfix',
      model: 'qwen3:8b',
      endpoint: 'http://localhost:11434',
    },
    {
      monitoring: {
        enabled: true,
        thresholds: {
          memory: 0.7,
          cpu: 0.6,
        },
      },
      caching: {
        enabled: true,
        type: 'multilevel',
        config: {
          maxSize: 500,
          defaultTtl: 600000, // 10 minutes
        },
      },
      resourceManagement: {
        enabled: true,
        processPool: {
          minSize: 3,
          maxSize: 10,
        },
      },
      loadTesting: {
        enabled: true,
        config: {
          concurrentUsers: 5,
          requestsPerUser: 3,
        },
      },
    },
  );

  try {
    // Initialize system
    await system.initialize();

    // Execute benchmark
    const result = await system.executeBenchmark({
      prompt: 'Fix TypeScript compilation errors',
      metadata: { fixtureType: 'small' },
    });
    console.log('Benchmark result:', result);

    // Run load test
    const loadTestResults = await system.runLoadTest();
    console.log('Load test completed:', loadTestResults.metrics);

    // Get system status
    const status = await system.getSystemStatus();
    console.log('System status:', status);

    // Optimize system
    const optimization = await system.optimizeSystem();
    console.log('Optimization results:', optimization);
  } finally {
    // Cleanup
    await system.shutdown();
  }
}
