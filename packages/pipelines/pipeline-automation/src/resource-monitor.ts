/**
 * Resource monitoring for pipeline execution
 */

import { EventEmitter } from 'events';
import { ResourceMonitorConfig, ResourceLimits } from './types.js';

export interface ResourceUsage {
  memory: {
    used: number; // MB
    total: number; // MB
    percentage: number;
  };
  cpu: {
    usage: number; // percentage
    loadAverage: number[];
  };
  disk: {
    used: number; // MB
    total: number; // MB
    percentage: number;
  };
  timestamp: number;
}

export class ResourceMonitor extends EventEmitter {
  private monitoring = false;
  private intervalId?: NodeJS.Timeout;
  private baseline: ResourceUsage | null = null;
  private history: ResourceUsage[] = [];
  private maxHistorySize = 1000;

  constructor(private config: ResourceMonitorConfig) {
    super();
  }

  start(): void {
    if (this.monitoring) {
      return;
    }

    this.monitoring = true;
    this.baseline = this.getCurrentUsage();

    this.intervalId = setInterval(() => {
      this.collectMetrics();
    }, this.config.interval * 1000);

    this.emit('monitor:started');
  }

  stop(): void {
    if (!this.monitoring) {
      return;
    }

    this.monitoring = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    this.emit('monitor:stopped');
  }

  private async collectMetrics(): Promise<void> {
    try {
      const usage = this.getCurrentUsage();
      this.history.push(usage);

      // Trim history if it gets too large
      if (this.history.length > this.maxHistorySize) {
        this.history = this.history.slice(-this.maxHistorySize);
      }

      // Check thresholds and emit alerts
      this.checkThresholds(usage);

      this.emit('metrics:collected', usage);
    } catch (error) {
      this.emit('monitor:error', error);
    }
  }

  private getCurrentUsage(): ResourceUsage {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Get memory info
    const memoryUsed = memUsage.heapUsed / 1024 / 1024; // MB
    const memoryTotal = memUsage.heapTotal / 1024 / 1024; // MB
    const memoryPercentage = (memoryUsed / memoryTotal) * 100;

    // Get CPU info (simplified)
    const cpuPercentage = this.calculateCPUPercentage(cpuUsage);
    const loadAverage = require('os').loadavg();

    // Get disk usage (simplified - would need actual disk monitoring)
    const diskUsed = 0; // Would need actual implementation
    const diskTotal = 0; // Would need actual implementation
    const diskPercentage = diskTotal > 0 ? (diskUsed / diskTotal) * 100 : 0;

    return {
      memory: {
        used: memoryUsed,
        total: memoryTotal,
        percentage: memoryPercentage,
      },
      cpu: {
        usage: cpuPercentage,
        loadAverage,
      },
      disk: {
        used: diskUsed,
        total: diskTotal,
        percentage: diskPercentage,
      },
      timestamp: Date.now(),
    };
  }

  private calculateCPUPercentage(cpuUsage: NodeJS.CpuUsage): number {
    // Simplified CPU calculation - would need more sophisticated implementation
    const total = cpuUsage.user + cpuUsage.system;
    return Math.min(100, total / 1000000); // Convert to percentage
  }

  private checkThresholds(usage: ResourceUsage): void {
    const { thresholds } = this.config;

    // Memory checks
    if (usage.memory.percentage >= thresholds.memory) {
      const severity = usage.memory.percentage >= thresholds.memory * 1.2 ? 'critical' : 'warning';
      this.emitAlert('memory', usage.memory.percentage, severity, usage);
    }

    // CPU checks
    if (usage.cpu.usage >= thresholds.cpu) {
      const severity = usage.cpu.usage >= thresholds.cpu * 1.2 ? 'critical' : 'warning';
      this.emitAlert('cpu', usage.cpu.usage, severity, usage);
    }

    // Disk checks
    if (usage.disk.percentage >= thresholds.disk) {
      const severity = usage.disk.percentage >= thresholds.disk * 1.2 ? 'critical' : 'warning';
      this.emitAlert('disk', usage.disk.percentage, severity, usage);
    }
  }

  private emitAlert(
    type: string,
    value: number,
    severity: 'warning' | 'critical',
    usage: ResourceUsage,
  ): void {
    const alert = {
      type,
      value,
      severity,
      threshold: this.config.thresholds[type as keyof typeof this.config.thresholds],
      usage,
      timestamp: Date.now(),
    };

    this.emit('resource:alert', alert);

    // Take action based on severity
    const action =
      severity === 'critical' ? this.config.actions.critical : this.config.actions.warning;

    switch (action) {
      case 'throttle':
        this.emit('action:throttle', alert);
        break;
      case 'stop':
        this.emit('action:stop', alert);
        break;
      case 'alert':
        this.emit('action:alert', alert);
        break;
      case 'log':
      default:
        console.warn(
          `Resource ${type} ${severity}: ${value}% (threshold: ${this.config.thresholds[type as keyof typeof this.config.thresholds]}%)`,
        );
        break;
    }
  }

  getCurrentMetrics(): ResourceUsage | null {
    return this.history.length > 0 ? (this.history[this.history.length - 1] ?? null) : null;
  }

  getHistory(timeRange?: number): ResourceUsage[] {
    if (!timeRange) {
      return [...this.history];
    }

    const cutoff = Date.now() - timeRange;
    return this.history.filter((entry) => entry.timestamp >= cutoff);
  }

  getAverageMetrics(timeRange?: number): Partial<ResourceUsage> {
    const relevantHistory = this.getHistory(timeRange);

    if (relevantHistory.length === 0) {
      return {};
    }

    const sum = relevantHistory.reduce(
      (acc, entry) => ({
        memory: {
          used: acc.memory.used + entry.memory.used,
          total: acc.memory.total + entry.memory.total,
          percentage: acc.memory.percentage + entry.memory.percentage,
        },
        cpu: {
          usage: acc.cpu.usage + entry.cpu.usage,
          loadAverage: acc.cpu.loadAverage.map((val, i) => val + (entry.cpu.loadAverage[i] || 0)),
        },
        disk: {
          used: acc.disk.used + entry.disk.used,
          total: acc.disk.total + entry.disk.total,
          percentage: acc.disk.percentage + entry.disk.percentage,
        },
      }),
      {
        memory: { used: 0, total: 0, percentage: 0 },
        cpu: { usage: 0, loadAverage: [0, 0, 0] },
        disk: { used: 0, total: 0, percentage: 0 },
      },
    );

    const count = relevantHistory.length;

    return {
      memory: {
        used: sum.memory.used / count,
        total: sum.memory.total / count,
        percentage: sum.memory.percentage / count,
      },
      cpu: {
        usage: sum.cpu.usage / count,
        loadAverage: sum.cpu.loadAverage.map((val) => val / count),
      },
      disk: {
        used: sum.disk.used / count,
        total: sum.disk.total / count,
        percentage: sum.disk.percentage / count,
      },
    };
  }

  checkLimits(limits: ResourceLimits): { withinLimits: boolean; violations: string[] } {
    const current = this.getCurrentMetrics();

    if (!current) {
      return { withinLimits: true, violations: [] };
    }

    const violations: string[] = [];

    if (limits.memory && current.memory.used > limits.memory) {
      violations.push(`Memory usage (${current.memory.used}MB) exceeds limit (${limits.memory}MB)`);
    }

    if (limits.cpu && current.cpu.usage > limits.cpu) {
      violations.push(`CPU usage (${current.cpu.usage}%) exceeds limit (${limits.cpu}%)`);
    }

    if (limits.disk && current.disk.used > limits.disk) {
      violations.push(`Disk usage (${current.disk.used}MB) exceeds limit (${limits.disk}MB)`);
    }

    return {
      withinLimits: violations.length === 0,
      violations,
    };
  }

  isMonitoring(): boolean {
    return this.monitoring;
  }

  getBaseline(): ResourceUsage | null {
    return this.baseline;
  }

  resetBaseline(): void {
    this.baseline = this.getCurrentUsage();
  }

  clearHistory(): void {
    this.history = [];
  }
}
