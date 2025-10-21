import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

export interface ResourcePool<T> {
  acquire(): Promise<T>;
  release(resource: T): void;
  destroy(): void;
  getStats(): PoolStats;
}

export interface PoolStats {
  total: number;
  active: number;
  idle: number;
  waiting: number;
  maxUsed: number;
  avgWaitTime: number;
}

export interface ResourceConfig {
  minSize?: number;
  maxSize?: number;
  acquireTimeout?: number;
  idleTimeout?: number;
  createResource?: () => Promise<any>;
  destroyResource?: (resource: any) => Promise<void>;
  validateResource?: (resource: any) => boolean;
}

export class ResourceManager extends EventEmitter {
  private pools = new Map<string, ResourcePool<any>>();
  private monitors = new Map<string, ResourceMonitor>();
  private cleanupInterval?: NodeJS.Timeout;

  constructor(private options: { cleanupInterval?: number } = {}) {
    super();
    this.options.cleanupInterval = options.cleanupInterval || 30000; // 30 seconds
    this.startCleanup();
  }

  createPool<T>(name: string, config: ResourceConfig): ResourcePool<T> {
    if (this.pools.has(name)) {
      throw new Error(`Resource pool '${name}' already exists`);
    }

    const pool = new GenericResourcePool<T>(config);
    const monitor = new ResourceMonitor(name, pool);

    this.pools.set(name, pool);
    this.monitors.set(name, monitor);

    // Forward pool events
    pool.on('acquired', (resource) => this.emit('resource-acquired', { name, resource }));
    pool.on('released', (resource) => this.emit('resource-released', { name, resource }));
    pool.on('created', (resource) => this.emit('resource-created', { name, resource }));
    pool.on('destroyed', (resource) => this.emit('resource-destroyed', { name, resource }));
    pool.on('error', (error) => this.emit('pool-error', { name, error }));

    monitor.on('alert', (alert) => this.emit('resource-alert', { name, alert }));

    return pool;
  }

  getPool<T>(name: string): ResourcePool<T> | undefined {
    return this.pools.get(name);
  }

  destroyPool(name: string): void {
    const pool = this.pools.get(name);
    const monitor = this.monitors.get(name);

    if (pool) {
      pool.destroy();
      this.pools.delete(name);
    }

    if (monitor) {
      monitor.destroy();
      this.monitors.delete(name);
    }
  }

  getAllStats(): Record<string, PoolStats> {
    const stats: Record<string, PoolStats> = {};
    for (const [name, pool] of this.pools) {
      stats[name] = pool.getStats();
    }
    return stats;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    for (const [name] of this.pools) {
      this.destroyPool(name);
    }
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      for (const monitor of this.monitors.values()) {
        monitor.checkResources();
      }
    }, this.options.cleanupInterval);
  }
}

class GenericResourcePool<T> extends EventEmitter implements ResourcePool<T> {
  private resources: T[] = [];
  private activeResources = new Set<T>();
  private waitingQueue: Array<{
    resolve: (resource: T) => void;
    reject: (error: Error) => void;
    timestamp: number;
  }> = [];
  private config: Required<ResourceConfig>;
  private stats: PoolStats = {
    total: 0,
    active: 0,
    idle: 0,
    waiting: 0,
    maxUsed: 0,
    avgWaitTime: 0,
  };
  private waitTimes: number[] = [];

  constructor(config: ResourceConfig) {
    super();
    this.config = {
      minSize: config.minSize || 2,
      maxSize: config.maxSize || 10,
      acquireTimeout: config.acquireTimeout || 30000,
      idleTimeout: config.idleTimeout || 60000,
      createResource: config.createResource || (async () => ({}) as T),
      destroyResource: config.destroyResource || (async () => {}),
      validateResource: config.validateResource || (() => true),
    };

    // Initialize minimum resources
    this.initializePool();
  }

  async acquire(): Promise<T> {
    const startTime = performance.now();

    // Try to get an idle resource
    if (this.resources.length > 0) {
      const resource = this.resources.pop()!;
      if (this.config.validateResource(resource)) {
        this.activeResources.add(resource);
        this.updateStats();
        this.emit('acquired', resource);
        return resource;
      } else {
        // Resource is invalid, destroy it
        this.config.destroyResource(resource).catch(() => {});
        this.stats.total--;
      }
    }

    // Create new resource if under max size
    if (this.stats.total < this.config.maxSize) {
      try {
        const resource = await this.config.createResource();
        this.activeResources.add(resource);
        this.stats.total++;
        this.updateStats();
        this.emit('created', resource);
        this.emit('acquired', resource);
        return resource;
      } catch (error) {
        this.emit('error', error);
        throw error;
      }
    }

    // Wait for a resource to become available
    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.waitingQueue.findIndex((item) => item.resolve === resolve);
        if (index !== -1) {
          this.waitingQueue.splice(index, 1);
          this.updateStats();
        }
        reject(new Error('Resource acquire timeout'));
      }, this.config.acquireTimeout);

      this.waitingQueue.push({
        resolve: (resource) => {
          clearTimeout(timeout);
          const waitTime = performance.now() - startTime;
          this.waitTimes.push(waitTime);
          if (this.waitTimes.length > 100) {
            this.waitTimes = this.waitTimes.slice(-100);
          }
          this.stats.avgWaitTime =
            this.waitTimes.reduce((a, b) => a + b, 0) / this.waitTimes.length;
          resolve(resource);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
        timestamp: startTime,
      });

      this.updateStats();
    });
  }

  release(resource: T): void {
    if (!this.activeResources.has(resource)) {
      return; // Resource not from this pool
    }

    this.activeResources.delete(resource);

    // Check if someone is waiting
    if (this.waitingQueue.length > 0) {
      const waiter = this.waitingQueue.shift()!;
      this.activeResources.add(resource);
      waiter.resolve(resource);
      this.emit('acquired', resource);
    } else {
      // Add back to idle resources
      this.resources.push(resource);

      // Destroy excess resources
      if (this.resources.length > this.config.minSize) {
        const excessResource = this.resources.pop()!;
        this.config.destroyResource(excessResource).catch(() => {});
        this.stats.total--;
      }
    }

    this.updateStats();
    this.emit('released', resource);
  }

  destroy(): void {
    // Reject all waiting requests
    for (const waiter of this.waitingQueue) {
      waiter.reject(new Error('Pool is being destroyed'));
    }
    this.waitingQueue = [];

    // Destroy all resources
    const allResources = [...this.resources, ...this.activeResources];
    Promise.all(allResources.map((r) => this.config.destroyResource(r).catch(() => {}))).then(
      () => {
        this.resources = [];
        this.activeResources.clear();
        this.stats.total = 0;
        this.updateStats();
      },
    );
  }

  getStats(): PoolStats {
    return { ...this.stats };
  }

  private async initializePool(): Promise<void> {
    const promises = [];
    for (let i = 0; i < this.config.minSize; i++) {
      promises.push(
        this.config
          .createResource()
          .then((resource) => {
            this.resources.push(resource);
            this.stats.total++;
            this.emit('created', resource);
          })
          .catch(() => {}), // Ignore initialization errors
      );
    }
    await Promise.all(promises);
    this.updateStats();
  }

  private updateStats(): void {
    this.stats.active = this.activeResources.size;
    this.stats.idle = this.resources.length;
    this.stats.waiting = this.waitingQueue.length;
    this.stats.maxUsed = Math.max(this.stats.maxUsed, this.stats.active);
  }
}

class ResourceMonitor extends EventEmitter {
  private alertThresholds = {
    highUtilization: 0.8,
    longWaitTime: 5000, // 5 seconds
    resourceErrors: 5, // 5 errors in a minute
  };

  constructor(
    private name: string,
    private pool: ResourcePool<any>,
  ) {
    super();
  }

  checkResources(): void {
    const stats = this.pool.getStats();

    // Check for high utilization
    const utilization = stats.active / stats.total;
    if (utilization > this.alertThresholds.highUtilization && stats.total > 0) {
      this.emit('alert', {
        type: 'high-utilization',
        severity: 'warning',
        message: `Pool '${this.name}' utilization at ${(utilization * 100).toFixed(1)}%`,
        value: utilization,
        threshold: this.alertThresholds.highUtilization,
      });
    }

    // Check for long wait times
    if (stats.avgWaitTime > this.alertThresholds.longWaitTime) {
      this.emit('alert', {
        type: 'long-wait-time',
        severity: 'warning',
        message: `Pool '${this.name}' average wait time at ${stats.avgWaitTime.toFixed(1)}ms`,
        value: stats.avgWaitTime,
        threshold: this.alertThresholds.longWaitTime,
      });
    }

    // Check if pool is at capacity
    if (stats.active >= stats.total && stats.waiting > 0) {
      this.emit('alert', {
        type: 'pool-exhausted',
        severity: 'critical',
        message: `Pool '${this.name}' is exhausted with ${stats.waiting} requests waiting`,
        value: stats.waiting,
        threshold: 0,
      });
    }
  }

  destroy(): void {
    // Cleanup if needed
  }
}

// Memory management utilities
export class MemoryManager {
  private static instance: MemoryManager;
  private thresholds = {
    heapUsed: 0.8, // 80% of heap limit
    external: 0.5, // 50% of external memory
    rss: 0.9, // 90% of RSS
  };

  private constructor() {}

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  checkMemoryUsage(): { ok: boolean; issues: string[] } {
    const usage = process.memoryUsage();
    const issues: string[] = [];

    // Check heap usage
    const heapLimit = (performance as any).memory?.usedJSHeapSize || 0;
    if (heapLimit > 0 && usage.heapUsed / heapLimit > this.thresholds.heapUsed) {
      issues.push(`Heap usage at ${((usage.heapUsed / heapLimit) * 100).toFixed(1)}%`);
    }

    // Check external memory
    if (usage.external > 0) {
      const externalLimit = usage.heapTotal * 2; // Estimate
      if (usage.external / externalLimit > this.thresholds.external) {
        issues.push(`External memory at ${((usage.external / externalLimit) * 100).toFixed(1)}%`);
      }
    }

    // Check RSS
    const systemMemory = require('os').totalmem();
    if (usage.rss / systemMemory > this.thresholds.rss) {
      issues.push(`RSS at ${((usage.rss / systemMemory) * 100).toFixed(1)}%`);
    }

    return {
      ok: issues.length === 0,
      issues,
    };
  }

  forceGC(): void {
    if ('gc' in global) {
      (global as any).gc();
    }
  }

  setThresholds(thresholds: Partial<typeof this.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }
}
