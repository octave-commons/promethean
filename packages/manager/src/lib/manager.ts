import { ManagerConfig, Task, TaskSource, TaskTarget, SyncOperation, SyncResult, SyncOptions } from '../types';
import { defaultConfig } from '../config/default-config';
import { SyncEngine } from './sync-engine';

export class Manager {
  private config: ManagerConfig;
  private syncEngine: SyncEngine;

  constructor(config?: Partial<ManagerConfig>) {
    this.config = {
      ...defaultConfig,
      ...config,
      sources: config?.sources || defaultConfig.sources,
      targets: config?.targets || defaultConfig.targets,
      defaultOptions: {
        ...defaultConfig.defaultOptions,
        ...config?.defaultOptions
      }
    };

    this.syncEngine = new SyncEngine();
  }

  // Core operations that mirror kanban CLI
  async pull(options?: Partial<SyncOptions>): Promise<SyncResult> {
    const mergedOptions = { ...this.config.defaultOptions, ...options };

    const operation: SyncOperation = {
      direction: 'pull',
      sources: this.config.sources.filter(s => s.enabled),
      targets: [],
      options: mergedOptions
    };

    return this.syncEngine.execute(operation);
  }

  async push(options?: Partial<SyncOptions>): Promise<SyncResult> {
    const mergedOptions = { ...this.config.defaultOptions, ...options };

    const operation: SyncOperation = {
      direction: 'push',
      sources: this.config.sources.filter(s => s.enabled),
      targets: this.config.targets.filter(t => t.enabled),
      options: mergedOptions
    };

    return this.syncEngine.execute(operation);
  }

  async sync(options?: Partial<SyncOptions>): Promise<SyncResult> {
    const mergedOptions = { ...this.config.defaultOptions, ...options };

    const operation: SyncOperation = {
      direction: 'sync',
      sources: this.config.sources.filter(s => s.enabled),
      targets: this.config.targets.filter(t => t.enabled),
      options: mergedOptions
    };

    return this.syncEngine.execute(operation);
  }

  // Kanban-like operations
  async search(query: string, options?: Partial<SyncOptions>): Promise<Task[]> {
    // Search across all enabled sources
    const allTasks: Task[] = [];

    for (const source of this.config.sources.filter(s => s.enabled)) {
      try {
        const adapter = this.syncEngine.getAdapter(source);
        const tasks = await adapter.getTasks(options);

        // Filter tasks by query
        const filteredTasks = tasks.filter(task =>
          task.title.toLowerCase().includes(query.toLowerCase()) ||
          (task.content && task.content.toLowerCase().includes(query.toLowerCase())) ||
          task.labels.some(label => label.toLowerCase().includes(query.toLowerCase()))
        );

        allTasks.push(...filteredTasks);
      } catch (error) {
        console.error(`Failed to search in ${source.name}: ${error}`);
      }
    }

    return allTasks;
  }

  async count(): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};

    for (const source of this.config.sources.filter(s => s.enabled)) {
      try {
        const adapter = this.syncEngine.getAdapter(source);
        const tasks = await adapter.getTasks();
        counts[source.name] = tasks.length;
      } catch (error) {
        console.error(`Failed to count tasks in ${source.name}: ${error}`);
        counts[source.name] = 0;
      }
    }

    return counts;
  }

  async status(taskUuid: string): Promise<Task | null> {
    // Search for task across all sources
    for (const source of this.config.sources.filter(s => s.enabled)) {
      try {
        const adapter = this.syncEngine.getAdapter(source);
        const task = await adapter.getTaskById(taskUuid);
        if (task) {
          return task;
        }
      } catch (error) {
        console.error(`Failed to find task in ${source.name}: ${error}`);
      }
    }

    return null;
  }

  async updateStatus(taskUuid: string, newStatus: string): Promise<SyncResult> {
    // Update task status across all targets
    const results: SyncResult[] = [];

    for (const target of this.config.targets.filter(t => t.enabled)) {
      try {
        const adapter = this.syncEngine.getAdapter(target);
        const task = await adapter.getTaskById(taskUuid);

        if (task) {
          task.status = newStatus;
          await adapter.updateTask(task);

          results.push({
            success: true,
            operation: {
              direction: 'sync',
              sources: [],
              targets: [target],
              options: this.config.defaultOptions
            },
            summary: {
              totalTasks: 1,
              processedTasks: 1,
              succeededTasks: 1,
              failedTasks: 0,
              conflicts: 0
            },
            errors: [],
            conflicts: [],
            duration: 0
          });
        }
      } catch (error) {
        results.push({
          success: false,
          operation: {
            direction: 'sync',
            sources: [],
            targets: [target],
            options: this.config.defaultOptions
          },
          summary: {
            totalTasks: 1,
            processedTasks: 1,
            succeededTasks: 0,
            failedTasks: 1,
            conflicts: 0
          },
          errors: [`Failed to update task in ${target.name}: ${error}`],
          conflicts: [],
          duration: 0
        });
      }
    }

    // Combine results
    return this.combineResults(results);
  }

  // Configuration management
  getConfig(): ManagerConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<ManagerConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
      sources: updates.sources || this.config.sources,
      targets: updates.targets || this.config.targets,
      defaultOptions: {
        ...this.config.defaultOptions,
        ...updates.defaultOptions
      }
    };
  }

  enableSource(sourceName: string): void {
    const source = this.config.sources.find(s => s.name === sourceName);
    if (source) {
      source.enabled = true;
    } else {
      throw new Error(`Source '${sourceName}' not found`);
    }
  }

  disableSource(sourceName: string): void {
    const source = this.config.sources.find(s => s.name === sourceName);
    if (source) {
      source.enabled = false;
    } else {
      throw new Error(`Source '${sourceName}' not found`);
    }
  }

  enableTarget(targetName: string): void {
    const target = this.config.targets.find(t => t.name === targetName);
    if (target) {
      target.enabled = true;
    } else {
      throw new Error(`Target '${targetName}' not found`);
    }
  }

  disableTarget(targetName: string): void {
    const target = this.config.targets.find(t => t.name === targetName);
    if (target) {
      target.enabled = false;
    } else {
      throw new Error(`Target '${targetName}' not found`);
    }
  }

  // Conflict detection and resolution
  async detectConflicts(): Promise<any[]> {
    return this.syncEngine.detectConflicts(
      this.config.sources.filter(s => s.enabled),
      this.config.targets.filter(t => t.enabled)
    );
  }

  // Health check
  async healthCheck(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};

    const allSystems = [...this.config.sources, ...this.config.targets];
    for (const system of allSystems) {
      if (!system.enabled) {
        health[system.name] = false;
        continue;
      }

      try {
        const adapter = this.syncEngine.getAdapter(system);
        health[system.name] = await adapter.testConnection();
      } catch (error) {
        health[system.name] = false;
      }
    }

    return health;
  }

  private combineResults(results: SyncResult[]): SyncResult {
    const totalDuration = results.reduce((sum, result) => sum + result.duration, 0);
    const totalErrors = results.flatMap(result => result.errors);
    const totalConflicts = results.flatMap(result => result.conflicts);

    return {
      success: results.every(result => result.success),
      operation: {
        direction: 'sync',
        sources: this.config.sources,
        targets: this.config.targets,
        options: this.config.defaultOptions
      },
      summary: {
        totalTasks: results.reduce((sum, result) => sum + result.summary.totalTasks, 0),
        processedTasks: results.reduce((sum, result) => sum + result.summary.processedTasks, 0),
        succeededTasks: results.reduce((sum, result) => sum + result.summary.succeededTasks, 0),
        failedTasks: results.reduce((sum, result) => sum + result.summary.failedTasks, 0),
        conflicts: totalConflicts.length
      },
      errors: totalErrors,
      conflicts: totalConflicts,
      duration: totalDuration
    };
  }
}