import type { Plugin, PluginContext, HookRegistration, HookResult, HookContext } from '../types.js';

interface LogEntry {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, unknown>;
}

export class LoggerPlugin implements Plugin {
  metadata = {
    name: 'logger',
    version: '1.0.0',
    description: 'Simple logging plugin that captures system events',
    hooks: ['system.startup', 'system.shutdown', 'user.action', 'error.occurred'],
  };

  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  async initialize(context: PluginContext): Promise<void> {
    console.log('Logger plugin initialized');

    // Register a cleanup hook
    context.registerHook<string, void>({
      pluginName: this.metadata.name,
      hookName: 'system.shutdown',
      handler: this.handleShutdown.bind(this),
      priority: 10,
    });
  }

  async destroy(): Promise<void> {
    console.log(`Logger plugin destroyed. Captured ${this.logs.length} log entries.`);
    this.logs = [];
  }

  getHooks(): HookRegistration<any, any>[] {
    return [
      {
        pluginName: this.metadata.name,
        hookName: 'system.startup',
        handler: this.handleStartup.bind(this),
        priority: 10,
      },
      {
        pluginName: this.metadata.name,
        hookName: 'user.action',
        handler: this.handleUserAction.bind(this),
        priority: 5,
      },
      {
        pluginName: this.metadata.name,
        hookName: 'error.occurred',
        handler: this.handleError.bind(this),
        priority: 20,
      },
    ];
  }

  private handleStartup(data: string, context: HookContext): HookResult<void> {
    this.addLog('info', `System startup: ${data}`, {
      plugin: context.pluginName,
      hook: context.hookName,
    });

    return { success: true };
  }

  private handleShutdown(data: string, context: HookContext): HookResult<void> {
    this.addLog('info', `System shutdown: ${data}`, {
      plugin: context.pluginName,
      hook: context.hookName,
    });

    return { success: true };
  }

  private handleUserAction(
    data: { userId: string; action: string; timestamp: number },
    context: HookContext,
  ): HookResult<void> {
    this.addLog('info', `User ${data.userId} performed ${data.action}`, {
      plugin: context.pluginName,
      hook: context.hookName,
      userId: data.userId,
      action: data.action,
    });

    return { success: true };
  }

  private handleError(
    data: { error: Error; context?: string },
    context: HookContext,
  ): HookResult<void> {
    this.addLog('error', `Error in ${data.context || 'unknown'}: ${data.error.message}`, {
      plugin: context.pluginName,
      hook: context.hookName,
      error: data.error,
      stack: data.error.stack,
    });

    return { success: true };
  }

  private addLog(
    level: LogEntry['level'],
    message: string,
    metadata?: Record<string, unknown>,
  ): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      metadata,
    };

    this.logs.push(entry);

    // Maintain log size limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log to console for visibility
    console.log(`[${level.toUpperCase()}] ${message}`);
  }

  // Public API for other plugins/system to query logs
  getLogs(level?: LogEntry['level'], limit?: number): LogEntry[] {
    let filteredLogs = this.logs;

    if (level) {
      filteredLogs = this.logs.filter((log) => log.level === level);
    }

    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }

    return filteredLogs;
  }

  getLogStats(): { total: number; byLevel: Record<LogEntry['level'], number> } {
    const stats = {
      total: this.logs.length,
      byLevel: {
        info: 0,
        warn: 0,
        error: 0,
        debug: 0,
      } as Record<LogEntry['level'], number>,
    };

    for (const log of this.logs) {
      stats.byLevel[log.level]++;
    }

    return stats;
  }
}
