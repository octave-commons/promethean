import { 
  Task, 
  SyncEvent, 
  SyncEngine, 
  TaskMapper, 
  ConflictResolver, 
  BridgeConfig,
  EventStorage,
  SyncQueue 
} from './types';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

export class DefaultSyncEngine extends EventEmitter implements SyncEngine {
  private isRunning: boolean = false;
  private syncInterval?: NodeJS.Timeout;

  constructor(
    private config: BridgeConfig,
    private storage: EventStorage,
    private queue: SyncQueue,
    private taskMapper: TaskMapper,
    private conflictResolver: ConflictResolver,
    private mcpClient: any,
    private kanbanClient: any
  ) {
    super();
  }

  async syncTask(taskId: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Get task from both systems
      const [mcpTask, kanbanTask] = await Promise.all([
        this.mcpClient.getTask(taskId).catch(() => null),
        this.kanbanClient.getTask(taskId).catch(() => null)
      ]);

      if (!mcpTask && !kanbanTask) {
        throw new Error(`Task ${taskId} not found in either system`);
      }

      let finalTask: Task;

      if (mcpTask && kanbanTask) {
        // Both exist - check for conflicts
        if (this.conflictResolver.detectConflict(mcpTask, kanbanTask)) {
          finalTask = await this.conflictResolver.resolve(mcpTask, kanbanTask);
          this.emit('conflictResolved', { taskId, finalTask });
        } else {
          // No conflict, use MCP version as source of truth
          finalTask = mcpTask;
        }
      } else if (mcpTask) {
        // Only MCP has the task
        finalTask = mcpTask;
        await this.kanbanClient.createTask(finalTask);
      } else {
        // Only Kanban has the task
        finalTask = kanbanTask;
        await this.mcpClient.createTask(finalTask);
      }

      // Update both systems with final state
      if (mcpTask && kanbanTask) {
        await Promise.all([
          this.mcpClient.updateTask(finalTask),
          this.kanbanClient.updateTask(finalTask)
        ]);
      }

      // Record sync event
      await this.recordSyncEvent('task_synced', taskId, {
        direction: 'bidirectional',
        conflict: mcpTask && kanbanTask && this.conflictResolver.detectConflict(mcpTask, kanbanTask),
        duration: Date.now() - startTime
      });

      this.emit('taskSynced', { taskId, task: finalTask });

    } catch (error) {
      await this.recordSyncEvent('sync_failed', taskId, {
        error: (error as Error).message,
        duration: Date.now() - startTime
      });
      
      this.emit('syncError', { taskId, error });
      throw error;
    }
  }

  async syncAll(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Sync already in progress');
    }

    this.isRunning = true;
    this.emit('syncStarted');

    try {
      const batchSize = this.config.sync.batchSize;
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        // Get tasks from MCP
        const mcpTasks = await this.mcpClient.getTasks({ 
          limit: batchSize, 
          offset 
        });

        // Get tasks from Kanban
        const kanbanTasks = await this.kanbanClient.getTasks({
          boardId: this.config.kanban.boardId,
          limit: batchSize,
          offset
        });

        // Process batch
        const allTaskIds = new Set([
          ...mcpTasks.map((t: any) => t.id),
          ...kanbanTasks.map((t: any) => t.id)
        ]);

        for (const taskId of allTaskIds) {
          await this.syncTask(taskId);
        }

        hasMore = mcpTasks.length === batchSize || kanbanTasks.length === batchSize;
        offset += batchSize;
      }

      this.emit('syncCompleted');

    } finally {
      this.isRunning = false;
    }
  }

  async handleMcpEvent(event: any): Promise<void> {
    const syncEvent: SyncEvent = {
      id: uuidv4(),
      type: this.mapEventType(event.type),
      source: 'mcp',
      taskId: event.taskId,
      data: event,
      timestamp: new Date()
    };

    await this.queue.add(syncEvent);
    this.processQueue();
  }

  async handleKanbanEvent(event: any): Promise<void> {
    const syncEvent: SyncEvent = {
      id: uuidv4(),
      type: this.mapEventType(event.type),
      source: 'kanban',
      taskId: event.taskId,
      data: event,
      timestamp: new Date()
    };

    await this.queue.add(syncEvent);
    this.processQueue();
  }

  async resolveConflict(taskId: string): Promise<Task> {
    const [mcpTask, kanbanTask] = await Promise.all([
      this.mcpClient.getTask(taskId),
      this.kanbanClient.getTask(taskId)
    ]);

    if (!mcpTask || !kanbanTask) {
      throw new Error(`Cannot resolve conflict: task ${taskId} not found in both systems`);
    }

    const resolvedTask = await this.conflictResolver.resolve(mcpTask, kanbanTask);

    // Update both systems with resolved task
    await Promise.all([
      this.mcpClient.updateTask(resolvedTask),
      this.kanbanClient.updateTask(resolvedTask)
    ]);

    await this.recordSyncEvent('conflict_resolved', taskId, {
      resolution: this.config.sync.conflictResolution
    });

    this.emit('conflictResolved', { taskId, task: resolvedTask });
    return resolvedTask;
  }

  startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.syncAll().catch(error => {
        this.emit('syncError', { error });
      });
    }, this.config.mcp.pollInterval);
  }

  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
  }

  private async processQueue(): Promise<void> {
    const events = await this.queue.get(this.config.sync.batchSize);
    
    for (const event of events) {
      try {
        await this.processSyncEvent(event);
        await this.queue.markProcessed(event.id);
      } catch (error) {
        console.error(`Failed to process sync event ${event.id}:`, error);
        // Event will be retried later
      }
    }
  }

  private async processSyncEvent(event: SyncEvent): Promise<void> {
    switch (event.type) {
      case 'task_created':
        await this.handleTaskCreated(event);
        break;
      case 'task_updated':
        await this.handleTaskUpdated(event);
        break;
      case 'task_deleted':
        await this.handleTaskDeleted(event);
        break;
      case 'status_changed':
        await this.handleStatusChanged(event);
        break;
      default:
        console.warn(`Unknown sync event type: ${event.type}`);
    }
  }

  private async handleTaskCreated(event: SyncEvent): Promise<void> {
    if (event.source === 'mcp' && this.shouldSyncToKanban()) {
      const mcpTask = await this.mcpClient.getTask(event.taskId);
      const normalizedTask = await this.taskMapper.mcpToKanban(mcpTask);
      await this.kanbanClient.createTask(normalizedTask);
    } else if (event.source === 'kanban' && this.shouldSyncToMcp()) {
      const kanbanTask = await this.kanbanClient.getTask(event.taskId);
      const normalizedTask = await this.taskMapper.kanbanToMcp(kanbanTask);
      await this.mcpClient.createTask(normalizedTask);
    }
  }

  private async handleTaskUpdated(event: SyncEvent): Promise<void> {
    await this.syncTask(event.taskId);
  }

  private async handleTaskDeleted(event: SyncEvent): Promise<void> {
    if (event.source === 'mcp' && this.shouldSyncToKanban()) {
      await this.kanbanClient.deleteTask(event.taskId);
    } else if (event.source === 'kanban' && this.shouldSyncToMcp()) {
      await this.mcpClient.deleteTask(event.taskId);
    }
  }

  private async handleStatusChanged(event: SyncEvent): Promise<void> {
    await this.syncTask(event.taskId);
  }

  private mapEventType(eventType: string): SyncEvent['type'] {
    const mapping: Record<string, SyncEvent['type']> = {
      'TASK_CREATED': 'task_created',
      'TASK_UPDATED': 'task_updated',
      'TASK_DELETED': 'task_deleted',
      'STATUS_CHANGED': 'status_changed',
      'task.created': 'task_created',
      'task.updated': 'task_updated',
      'task.deleted': 'task_deleted',
      'status.changed': 'status_changed'
    };

    return mapping[eventType] || 'task_updated';
  }

  private shouldSyncToKanban(): boolean {
    return this.config.sync.direction === 'mcp_to_kanban' || 
           this.config.sync.direction === 'bidirectional';
  }

  private shouldSyncToMcp(): boolean {
    return this.config.sync.direction === 'kanban_to_mcp' || 
           this.config.sync.direction === 'bidirectional';
  }

  private async recordSyncEvent(type: string, taskId: string, data: any): Promise<void> {
    const event: SyncEvent = {
      id: uuidv4(),
      type: type as SyncEvent['type'],
      source: 'bridge',
      taskId,
      data,
      timestamp: new Date(),
      processed: true
    };

    await this.storage.saveEvent(event);
  }
}