import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export interface PerformanceSnapshot {
  timestamp: number;
  memory: {
    used: number;
    total: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  eventLoop: {
    utilization: number;
    lag: number;
  };
  gc: {
    collections: number;
    duration: number;
  };
}

export interface PerformanceAlert {
  type: 'memory' | 'cpu' | 'eventloop' | 'gc';
  severity: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
}

export class PerformanceMonitor extends EventEmitter {
  private snapshots: PerformanceSnapshot[] = [];
  private alerts: PerformanceAlert[] = [];
  private isMonitoring = false;
  private intervalId?: NodeJS.Timeout;
  private lastCpuUsage = process.cpuUsage();
  private lastSnapshotTime = performance.now();
  private gcStats: { collections: number; duration: number } = { collections: 0, duration: 0 };
  private maxSnapshots = 1000;
  private thresholds = {
    memory: 0.8, // 80% of available memory
    cpu: 0.8, // 80% CPU usage
    eventLoop: 0.1, // 100ms event loop lag
    gcDuration: 100, // 100ms GC duration
  };

  constructor(private options: { interval?: number; outputDir?: string } = {}) {
    super();
    this.options.interval = options.interval || 1000; // 1 second default
    this.options.outputDir = options.outputDir || '.performance-metrics';

    // Setup GC monitoring if available
    this.setupGCMonitoring();
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.intervalId = setInterval(() => {
      this.collectSnapshot();
    }, this.options.interval);

    this.emit('monitoring-started');
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    this.emit('monitoring-stopped');
  }

  getSnapshots(): PerformanceSnapshot[] {
    return [...this.snapshots];
  }

  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  clearSnapshots(): void {
    this.snapshots = [];
  }

  clearAlerts(): void {
    this.alerts = [];
  }

  setThresholds(thresholds: Partial<typeof this.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  exportMetrics(filePath?: string): void {
    const outputPath =
      filePath || join(this.options.outputDir || '.', `performance-metrics-${Date.now()}.json`);

    if (!existsSync(this.options.outputDir || '.')) {
      mkdirSync(this.options.outputDir || '.', { recursive: true });
    }

    const metrics = {
      timestamp: new Date().toISOString(),
      snapshots: this.snapshots,
      alerts: this.alerts,
      thresholds: this.thresholds,
      summary: this.generateSummary(),
    };

    writeFileSync(outputPath, JSON.stringify(metrics, null, 2));
    this.emit('metrics-exported', { path: outputPath });
  }

  private collectSnapshot(): void {
    const timestamp = performance.now();
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage(this.lastCpuUsage);
    const timeDelta = timestamp - this.lastSnapshotTime;

    // Calculate CPU usage percentage
    const cpuPercent = ((cpuUsage.user + cpuUsage.system) / (timeDelta * 1000)) * 100;

    // Get event loop metrics
    const eventLoopUtilization = this.getEventLoopUtilization();
    const eventLoopLag = this.measureEventLoopLag();

    const snapshot: PerformanceSnapshot = {
      timestamp: Date.now(),
      memory: {
        used: memUsage.rss,
        total: memUsage.rss, // Node.js doesn't provide total system memory easily
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
      },
      cpu: {
        usage: Math.min(cpuPercent, 100),
        loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0],
      },
      eventLoop: {
        utilization: eventLoopUtilization,
        lag: eventLoopLag,
      },
      gc: {
        collections: this.gcStats.collections,
        duration: this.gcStats.duration,
      },
    };

    this.snapshots.push(snapshot);
    this.lastCpuUsage = process.cpuUsage();
    this.lastSnapshotTime = timestamp;

    // Check for performance issues
    this.checkThresholds(snapshot);

    // Cleanup old snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots = this.snapshots.slice(-this.maxSnapshots);
    }

    this.emit('snapshot-collected', snapshot);
  }

  private checkThresholds(snapshot: PerformanceSnapshot): void {
    // Memory threshold check
    const memoryUsagePercent = snapshot.memory.heapUsed / snapshot.memory.heapTotal;
    if (memoryUsagePercent > this.thresholds.memory) {
      this.createAlert(
        'memory',
        'critical',
        `Memory usage at ${(memoryUsagePercent * 100).toFixed(1)}% exceeds threshold`,
        memoryUsagePercent,
        this.thresholds.memory,
      );
    }

    // CPU threshold check
    if (snapshot.cpu.usage > this.thresholds.cpu * 100) {
      this.createAlert(
        'cpu',
        'warning',
        `CPU usage at ${snapshot.cpu.usage.toFixed(1)}% exceeds threshold`,
        snapshot.cpu.usage,
        this.thresholds.cpu * 100,
      );
    }

    // Event loop lag check
    if (snapshot.eventLoop.lag > this.thresholds.eventLoop * 1000) {
      this.createAlert(
        'eventloop',
        'critical',
        `Event loop lag at ${snapshot.eventLoop.lag.toFixed(1)}ms exceeds threshold`,
        snapshot.eventLoop.lag,
        this.thresholds.eventLoop * 1000,
      );
    }

    // GC duration check
    if (snapshot.gc.duration > this.thresholds.gcDuration) {
      this.createAlert(
        'gc',
        'warning',
        `GC duration at ${snapshot.gc.duration.toFixed(1)}ms exceeds threshold`,
        snapshot.gc.duration,
        this.thresholds.gcDuration,
      );
    }
  }

  private createAlert(
    type: PerformanceAlert['type'],
    severity: PerformanceAlert['severity'],
    message: string,
    value: number,
    threshold: number,
  ): void {
    const alert: PerformanceAlert = {
      type,
      severity,
      message,
      value,
      threshold,
      timestamp: Date.now(),
    };

    this.alerts.push(alert);
    this.emit('alert', alert);

    // Cleanup old alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  private getEventLoopUtilization(): number {
    // Node.js >= 14.0.0 has performance.eventLoopUtilization
    if ('eventLoopUtilization' in performance) {
      const utilization = (performance as any).eventLoopUtilization();
      return utilization.utilization || 0;
    }

    // Fallback estimation
    return 0;
  }

  private measureEventLoopLag(): number {
    const start = performance.now();

    return new Promise<number>((resolve) => {
      setImmediate(() => {
        const lag = performance.now() - start;
        resolve(lag);
      });
    }) as any;
  }

  private setupGCMonitoring(): void {
    // Monitor GC if available (Node.js >= 14.0.0)
    if ('gc' in global) {
      const originalGC = (global as any).gc;
      let gcStartTime = 0;

      (global as any).gc = () => {
        gcStartTime = performance.now();
        const result = originalGC();
        const duration = performance.now() - gcStartTime;

        this.gcStats.collections++;
        this.gcStats.duration += duration;

        this.emit('gc-completed', { duration, collections: this.gcStats.collections });
        return result;
      };
    }
  }

  private generateSummary() {
    if (this.snapshots.length === 0) return null;

    const firstSnapshot = this.snapshots[0];
    const lastSnapshot = this.snapshots[this.snapshots.length - 1];

    const memoryUsages = this.snapshots.map((s) => s.memory.heapUsed / s.memory.heapTotal);
    const cpuUsages = this.snapshots.map((s) => s.cpu.usage);
    const eventLoopLags = this.snapshots.map((s) => s.eventLoop.lag);

    return {
      duration: {
        start: firstSnapshot?.timestamp || 0,
        end: lastSnapshot?.timestamp || 0,
        totalMs: (lastSnapshot?.timestamp || 0) - (firstSnapshot?.timestamp || 0),
      },
      memory: {
        avg: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
        max: Math.max(...memoryUsages),
        min: Math.min(...memoryUsages),
      },
      cpu: {
        avg: cpuUsages.reduce((a, b) => a + b, 0) / cpuUsages.length,
        max: Math.max(...cpuUsages),
        min: Math.min(...cpuUsages),
      },
      eventLoop: {
        avgLag: eventLoopLags.reduce((a, b) => a + b, 0) / eventLoopLags.length,
        maxLag: Math.max(...eventLoopLags),
        minLag: Math.min(...eventLoopLags),
      },
      gc: {
        totalCollections: this.gcStats.collections,
        totalDuration: this.gcStats.duration,
        avgDuration:
          this.gcStats.collections > 0 ? this.gcStats.duration / this.gcStats.collections : 0,
      },
      alerts: {
        total: this.alerts.length,
        critical: this.alerts.filter((a) => a.severity === 'critical').length,
        warnings: this.alerts.filter((a) => a.severity === 'warning').length,
      },
    };
  }
}

// Singleton instance for global monitoring
export const globalPerformanceMonitor = new PerformanceMonitor();
