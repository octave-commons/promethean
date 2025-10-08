import { Task, TaskSource, TaskTarget, SyncOperation, SyncResult, TaskConflict, SyncOptions } from '../types';
import { KanbanAdapter } from './adapters/kanban-adapter';
import { GitHubAdapter } from './adapters/github-adapter';
import { TrelloAdapter } from './adapters/trello-adapter';
import { TaskDeduplicator } from './deduplication';

export class SyncEngine {
  private adapters: Map<string, KanbanAdapter | GitHubAdapter | TrelloAdapter> = new Map();
  private deduplicator: TaskDeduplicator;

  constructor() {
    // Adapters will be initialized on demand
    this.deduplicator = new TaskDeduplicator();
  }

  public getAdapter(source: TaskSource | TaskTarget): KanbanAdapter | GitHubAdapter | TrelloAdapter {
    const key = `${source.type}-${source.name}`;

    if (!this.adapters.has(key)) {
      switch (source.type) {
        case 'kanban':
          this.adapters.set(key, new KanbanAdapter(source));
          break;
        case 'github':
          this.adapters.set(key, new GitHubAdapter(source));
          break;
        case 'trello':
          this.adapters.set(key, new TrelloAdapter(source));
          break;
        default:
          throw new Error(`Unknown adapter type: ${source.type}`);
      }
    }

    return this.adapters.get(key)!;
  }

  async execute(operation: SyncOperation): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: false,
      operation,
      summary: {
        totalTasks: 0,
        processedTasks: 0,
        succeededTasks: 0,
        failedTasks: 0,
        conflicts: 0
      },
      errors: [],
      conflicts: [],
      duration: 0
    };

    try {
      console.log(`🚀 Starting ${operation.direction} operation...`);
      console.log(`📋 Sources: ${operation.sources.map(s => s.name).join(', ')}`);
      console.log(`🎯 Targets: ${operation.targets.map(t => t.name).join(', ')}`);

      // Test connections
      await this.testConnections(operation.sources, operation.targets);

      switch (operation.direction) {
        case 'pull':
          await this.executePull(operation, result);
          break;
        case 'push':
          await this.executePush(operation, result);
          break;
        case 'sync':
          await this.executeSync(operation, result);
          break;
        default:
          throw new Error(`Unknown operation direction: ${operation.direction}`);
      }

      result.success = result.errors.length === 0 || result.summary.succeededTasks > 0;

    } catch (error) {
      result.errors.push(`Sync operation failed: ${error}`);
      result.success = false;
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  private async testConnections(sources: TaskSource[], targets: TaskTarget[]): Promise<void> {
    const allSystems = [...sources, ...targets];

    for (const system of allSystems) {
      if (!system.enabled) continue;

      try {
        const adapter = this.getAdapter(system);
        const connected = await adapter.testConnection();

        if (!connected) {
          throw new Error(`Failed to connect to ${system.name} (${system.type})`);
        }

        console.log(`✅ Connected to ${system.name} (${system.type})`);
      } catch (error) {
        console.error(`❌ Connection failed for ${system.name}: ${error}`);
        throw error;
      }
    }
  }

  private async executePull(operation: SyncOperation, result: SyncResult): Promise<void> {
    console.log('\n📥 Pulling tasks from sources...');

    const allTasks: Task[] = [];

    // Collect tasks from all enabled sources
    for (const source of operation.sources) {
      if (!source.enabled) continue;

      try {
        const adapter = this.getAdapter(source);
        const tasks = await adapter.getTasks(operation.options);
        allTasks.push(...tasks);
        console.log(`📋 ${source.name}: ${tasks.length} tasks`);
      } catch (error) {
        result.errors.push(`Failed to fetch tasks from ${source.name}: ${error}`);
        console.error(`❌ ${source.name}: ${error}`);
      }
    }

    result.summary.totalTasks = allTasks.length;

    if (operation.options.dryRun) {
      console.log(`\n🔍 DRY RUN: Would pull ${allTasks.length} tasks`);
      return;
    }

    // For pull operation, we typically just collect the data
    // The actual processing would be handled by the caller
    console.log(`\n✅ Successfully pulled ${allTasks.length} tasks`);
    result.summary.processedTasks = allTasks.length;
    result.summary.succeededTasks = allTasks.length;
  }

  private async executePush(operation: SyncOperation, result: SyncResult): Promise<void> {
    console.log('\n📤 Pushing tasks to targets...');

    // First collect tasks from sources
    const allTasks: Task[] = [];
    for (const source of operation.sources) {
      if (!source.enabled) continue;

      try {
        const adapter = this.getAdapter(source);
        const tasks = await adapter.getTasks(operation.options);
        allTasks.push(...tasks);
      } catch (error) {
        result.errors.push(`Failed to fetch tasks from ${source.name}: ${error}`);
      }
    }

    result.summary.totalTasks = allTasks.length;
    console.log(`📋 Found ${allTasks.length} tasks to push`);

    // Push to all enabled targets
    for (const target of operation.targets) {
      if (!target.enabled) continue;

      try {
        const adapter = this.getAdapter(target);
        console.log(`\n🎯 Pushing to ${target.name}...`);

        // Use improved deduplication
        const existingTasks = await adapter.getTasks({ maxTasks: 1000 });
        const strategy = operation.options.deduplicationStrategy || 'normalized';

        const { newTasks, duplicates, matchedExisting } = this.deduplicator.filterDuplicates(
          allTasks,
          existingTasks,
          strategy
        );

        console.log(`📝 ${target.name}: ${newTasks.length} new tasks (${duplicates.length} duplicates avoided)`);
        console.log(`   🔍 Using strategy: ${strategy}`);

        if (operation.options.dryRun) {
          console.log(`🔍 DRY RUN: Would create ${newTasks.length} tasks in ${target.name}`);
          continue;
        }

        let successCount = 0;
        let failCount = 0;

        for (const task of newTasks.slice(0, operation.options.maxTasks || newTasks.length)) {
          try {
            await adapter.createTask(task);
            successCount++;
          } catch (error) {
            failCount++;
            result.errors.push(`Failed to create task '${task.title}' in ${target.name}: ${error}`);
          }
        }

        result.summary.succeededTasks += successCount;
        result.summary.failedTasks += failCount;
        console.log(`✅ ${target.name}: ${successCount} created, ${failCount} failed`);

      } catch (error) {
        result.errors.push(`Failed to push to ${target.name}: ${error}`);
        console.error(`❌ ${target.name}: ${error}`);
      }
    }
  }

  private async executeSync(operation: SyncOperation, result: SyncResult): Promise<void> {
    console.log('\n🔄 Synchronizing tasks between sources and targets...');

    // Sync is essentially pull + push with conflict detection
    await this.executePull(operation, result);
    await this.executePush(operation, result);
  }

  async detectConflicts(sources: TaskSource[], targets: TaskTarget[]): Promise<TaskConflict[]> {
    const conflicts: TaskConflict[] = [];

    // Collect all tasks from sources
    const allSourceTasks: Task[] = [];
    for (const source of sources) {
      if (!source.enabled) continue;

      try {
        const adapter = this.getAdapter(source);
        const tasks = await adapter.getTasks();
        allSourceTasks.push(...tasks);
      } catch (error) {
        console.error(`Failed to fetch tasks from ${source.name}: ${error}`);
      }
    }

    // Check for conflicts in each target using improved deduplication
    for (const target of targets) {
      if (!target.enabled) continue;

      try {
        const adapter = this.getAdapter(target);
        const targetTasks = await adapter.getTasks({ maxTasks: 1000 });

        const strategyConflicts = this.deduplicator.findConflicts(allSourceTasks, targetTasks, 'normalized');

        for (const { source, target, conflictType } of strategyConflicts) {
          const conflict: TaskConflict = {
            task: source,
            sourceType: source.source || 'unknown',
            targetType: target.type,
            conflictType: conflictType as any,
            sourceData: source,
            targetData: target
          };

          conflicts.push(conflict);
        }
      } catch (error) {
        console.error(`Failed to check conflicts in ${target.name}: ${error}`);
      }
    }

    return conflicts;
  }

  private detectConflict(sourceTask: Task, targetTask: Task, sourceType: string, targetType: string): TaskConflict | null {
    const conflicts: string[] = [];

    if (sourceTask.status !== targetTask.status) {
      conflicts.push('status_mismatch');
    }

    if (sourceTask.content !== targetTask.content) {
      conflicts.push('content_mismatch');
    }

    if (sourceTask.priority !== targetTask.priority) {
      conflicts.push('priority_mismatch');
    }

    if (conflicts.length === 0) {
      return null;
    }

    return {
      task: sourceTask,
      sourceType,
      targetType,
      conflictType: conflicts[0] as any, // Primary conflict type
      sourceData: sourceTask,
      targetData: targetTask
    };
  }
}