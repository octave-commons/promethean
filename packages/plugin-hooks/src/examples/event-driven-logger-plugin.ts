import type { Plugin, PluginContext, HookRegistration, HookResult, HookContext } from '../types.js';

interface EventDrivenLogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source: {
    hookName?: string;
    pluginName?: string;
    triggeredBy?: string;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Event-driven logger plugin that logs hook executions and system events
 */
export class EventDrivenLoggerPlugin implements Plugin {
  metadata = {
    name: 'event-driven-logger',
    version: '1.0.0',
    description: 'Event-driven logging plugin that captures hook executions and system events',
    hooks: [
      'hooks.started',
      'hooks.completed',
      'hooks.failed',
      'hooks.executed',
      'hooks.execution_failed',
      'system.startup',
      'system.shutdown',
      'user.action',
      'error.occurred',
    ],
  };

  private logs: EventDrivenLogEntry[] = [];
  private maxLogs = 1000;
  private context?: PluginContext;

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    console.log('Event-driven logger plugin initialized');

    // Subscribe to hook execution events
    await this.setupEventSubscriptions();
  }

  async destroy(): Promise<void> {
    console.log(`Event-driven logger plugin destroyed. Captured ${this.logs.length} log entries.`);

    // Log final statistics
    this.logFinalStatistics();
    this.logs = [];
  }

  getHooks(): HookRegistration[] {
    return [
      {
        pluginName: this.metadata.name,
        hookName: 'system.startup',
        handler: this.handleSystemStartup.bind(this) as any,
        priority: 10,
      },
      {
        pluginName: this.metadata.name,
        hookName: 'system.shutdown',
        handler: this.handleSystemShutdown.bind(this) as any,
        priority: 10,
      },
      {
        pluginName: this.metadata.name,
        hookName: 'user.action',
        handler: this.handleUserAction.bind(this) as any,
        priority: 5,
      },
      {
        pluginName: this.metadata.name,
        hookName: 'error.occurred',
        handler: this.handleError.bind(this) as any,
        priority: 20, // High priority for errors
      },
    ];
  }

  private async setupEventSubscriptions(): Promise<void> {
    if (!this.context) return;

    // Subscribe to hook execution events
    const hookEvents = [
      'hooks.started',
      'hooks.completed',
      'hooks.failed',
      'hooks.executed',
      'hooks.execution_failed',
    ];

    for (const eventTopic of hookEvents) {
      await this.context.eventBus.subscribe(eventTopic, 'event-driven-logger', async (event) => {
        await this.handleHookEvent(eventTopic, event);
      });
    }
  }

  private async handleHookEvent(eventTopic: string, event: any): Promise<void> {
    const payload = event.payload;

    const logEntry: EventDrivenLogEntry = {
      id: this.generateLogId(),
      timestamp: Date.now(),
      level: this.getLogLevelFromEvent(eventTopic),
      message: this.formatHookEventMessage(eventTopic, payload),
      source: {
        hookName: payload.hookName,
        pluginName: payload.pluginName,
      },
      metadata: {
        eventTopic,
        duration: payload.duration,
        data: payload.data,
        error: payload.error,
        result: payload.result,
      },
    };

    this.addLog(logEntry);
  }

  private getLogLevelFromEvent(eventTopic: string): EventDrivenLogEntry['level'] {
    if (eventTopic.includes('failed') || eventTopic.includes('error')) {
      return 'error';
    }
    if (eventTopic.includes('warn')) {
      return 'warn';
    }
    if (eventTopic === 'hooks.started') {
      return 'debug';
    }
    return 'info';
  }

  private formatHookEventMessage(eventTopic: string, payload: any): string {
    switch (eventTopic) {
      case 'hooks.started':
        return `Hook execution started: ${payload.hookName}`;
      case 'hooks.completed':
        return `Hook execution completed: ${payload.hookName} (${payload.duration}ms)`;
      case 'hooks.failed':
        return `Hook execution failed: ${payload.hookName} - ${payload.error}`;
      case 'hooks.executed':
        return `Hook executed: ${payload.hookName} by ${payload.pluginName} (${payload.duration}ms)`;
      case 'hooks.execution_failed':
        return `Hook execution failed: ${payload.hookName} by ${payload.pluginName} - ${payload.error}`;
      default:
        return `Hook event: ${eventTopic}`;
    }
  }

  private handleSystemStartup(data: string, context: HookContext): HookResult<void> {
    this.addLog({
      id: this.generateLogId(),
      timestamp: Date.now(),
      level: 'info',
      message: `System startup: ${data}`,
      source: {
        hookName: context.hookName,
        pluginName: context.pluginName,
      },
    });

    return { success: true };
  }

  private handleSystemShutdown(data: string, context: HookContext): HookResult<void> {
    this.addLog({
      id: this.generateLogId(),
      timestamp: Date.now(),
      level: 'info',
      message: `System shutdown: ${data}`,
      source: {
        hookName: context.hookName,
        pluginName: context.pluginName,
      },
    });

    return { success: true };
  }

  private handleUserAction(
    data: { userId: string; action: string; timestamp: number },
    context: HookContext,
  ): HookResult<void> {
    this.addLog({
      id: this.generateLogId(),
      timestamp: Date.now(),
      level: 'info',
      message: `User ${data.userId} performed ${data.action}`,
      source: {
        hookName: context.hookName,
        pluginName: context.pluginName,
      },
      metadata: {
        userId: data.userId,
        action: data.action,
        userTimestamp: data.timestamp,
      },
    });

    return { success: true };
  }

  private handleError(
    data: { error: Error; context?: string },
    context: HookContext,
  ): HookResult<void> {
    this.addLog({
      id: this.generateLogId(),
      timestamp: Date.now(),
      level: 'error',
      message: `Error in ${data.context || 'unknown'}: ${data.error.message}`,
      source: {
        hookName: context.hookName,
        pluginName: context.pluginName,
      },
      metadata: {
        errorContext: data.context,
        error: data.error,
        stack: data.error.stack,
      },
    });

    return { success: true };
  }

  private addLog(entry: EventDrivenLogEntry): void {
    this.logs.push(entry);

    // Maintain log size limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log to console for visibility
    console.log(`[${entry.level.toUpperCase()}] ${entry.message}`);
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logFinalStatistics(): void {
    const stats = this.getLogStatistics();

    console.log('\n=== Event-Driven Logger Statistics ===');
    console.log(`Total logs: ${stats.total}`);
    console.log(`By level:`, stats.byLevel);
    console.log(`By source:`, stats.bySource);
    console.log(
      `Time range: ${new Date(stats.timeRange.start).toISOString()} to ${new Date(stats.timeRange.end).toISOString()}`,
    );
    console.log('=====================================\n');
  }

  // Public API for querying logs
  getLogs(options?: {
    level?: EventDrivenLogEntry['level'];
    source?: { hookName?: string; pluginName?: string };
    limit?: number;
    since?: number;
  }): EventDrivenLogEntry[] {
    let filteredLogs = [...this.logs];

    if (options?.level) {
      filteredLogs = filteredLogs.filter((log) => log.level === options.level);
    }

    if (options?.source) {
      if (options.source.hookName) {
        filteredLogs = filteredLogs.filter(
          (log) => log.source.hookName === options.source!.hookName,
        );
      }
      if (options.source.pluginName) {
        filteredLogs = filteredLogs.filter(
          (log) => log.source.pluginName === options.source!.pluginName,
        );
      }
    }

    if (options?.since) {
      filteredLogs = filteredLogs.filter((log) => log.timestamp >= options.since!);
    }

    if (options?.limit) {
      filteredLogs = filteredLogs.slice(-options.limit);
    }

    return filteredLogs.sort((a, b) => b.timestamp - a.timestamp);
  }

  getLogStatistics(): {
    total: number;
    byLevel: Record<EventDrivenLogEntry['level'], number>;
    bySource: Record<string, number>;
    timeRange: { start: number; end: number };
  } {
    const stats = {
      total: this.logs.length,
      byLevel: {
        info: 0,
        warn: 0,
        error: 0,
        debug: 0,
      } as Record<EventDrivenLogEntry['level'], number>,
      bySource: {} as Record<string, number>,
      timeRange: {
        start: this.logs.length > 0 ? Math.min(...this.logs.map((l) => l.timestamp)) : Date.now(),
        end: this.logs.length > 0 ? Math.max(...this.logs.map((l) => l.timestamp)) : Date.now(),
      },
    };

    for (const log of this.logs) {
      stats.byLevel[log.level]++;

      const sourceKey = `${log.source.pluginName || 'unknown'}:${log.source.hookName || 'unknown'}`;
      stats.bySource[sourceKey] = (stats.bySource[sourceKey] || 0) + 1;
    }

    return stats;
  }

  clearLogs(): void {
    this.logs = [];
    console.log('Event-driven logger logs cleared');
  }
}
