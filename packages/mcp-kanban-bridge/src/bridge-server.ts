#!/usr/bin/env node

/**
 * MCP-Kanban Bridge Server
 *
 * Main server that orchestrates synchronization between MCP and Kanban systems
 * Provides both MCP server functionality and webhooks for real-time sync
 */

import { EventEmitter } from 'events';
import {
  BridgeConfig,
  SyncEngine,
  TaskMapper,
  ConflictResolver,
  SyncQueue,
  EventStorage,
  MetricsCollector,
  WebhookHandler,
  WebhookEvent,
} from './types.js';
import { DefaultSyncEngine } from './sync.js';
import { WebhookServer } from './webhook-server.js';
import { QueueFactory } from './queue.js';
import { EventStorageFactory } from './storage.js';
import { TaskMapperFactory } from './task-mapper.js';
import { ConflictResolverFactory } from './conflict-resolver.js';
import { MetricsCollectorFactory } from './metrics-collector.js';

// Mock MCP and Kanban clients - these would be replaced with actual implementations
interface McpClient {
  getTask(taskId: string): Promise<any>;
  getTasks(options: { limit: number; offset: number }): Promise<any[]>;
  createTask(task: any): Promise<void>;
  updateTask(task: any): Promise<void>;
  deleteTask(taskId: string): Promise<void>;
}

interface KanbanClient {
  getTask(taskId: string): Promise<any>;
  getTasks(options: { boardId: string; limit: number; offset: number }): Promise<any[]>;
  createTask(task: any): Promise<void>;
  updateTask(task: any): Promise<void>;
  deleteTask(taskId: string): Promise<void>;
}

export class BridgeServer extends EventEmitter implements WebhookHandler {
  private config: BridgeConfig;
  private syncEngine: SyncEngine;
  private webhookServer: WebhookServer;
  private queue: SyncQueue;
  private storage: EventStorage;
  private taskMapper: TaskMapper;
  private conflictResolver: ConflictResolver;
  private metricsCollector: MetricsCollector;
  private mcpClient: McpClient;
  private kanbanClient: KanbanClient;

  constructor(config: BridgeConfig) {
    super();

    this.config = config;
    this.initializeComponents();
    this.setupEventHandlers();
  }

  private initializeComponents(): void {
    // Initialize core components
    this.queue = QueueFactory.create(this.config);
    this.storage = EventStorageFactory.create(this.config);
    this.taskMapper = TaskMapperFactory.create();
    this.conflictResolver = ConflictResolverFactory.create(this.config.sync.conflictResolution);
    this.metricsCollector = MetricsCollectorFactory.create('default');

    // Initialize webhook server
    this.webhookServer = new WebhookServer(this.config);

    // Initialize sync engine
    this.syncEngine = new DefaultSyncEngine(
      this.config,
      this.storage,
      this.queue,
      this.taskMapper,
      this.conflictResolver,
      this.mcpClient,
      this.kanbanClient,
    );

    // Mock clients - in real implementation, these would be actual API clients
    this.mcpClient = this.createMockMcpClient();
    this.kanbanClient = this.createMockKanbanClient();
  }

  private setupEventHandlers(): void {
    // Webhook event handlers
    this.webhookServer.onMcpWebhook(async (event: WebhookEvent) => {
      await this.handleWebhook(event);
    });

    this.webhookServer.onKanbanWebhook(async (event: WebhookEvent) => {
      await this.handleWebhook(event);
    });

    // Sync engine event handlers
    this.syncEngine.on('syncStarted', () => {
      this.emit('syncStarted');
      console.log('🚀 Synchronization started');
    });

    this.syncEngine.on('syncCompleted', () => {
      this.emit('syncCompleted');
      console.log('✅ Synchronization completed');
    });

    this.syncEngine.on('taskSynced', ({ taskId, task }) => {
      this.metricsCollector.recordTaskSynced(taskId);
      this.emit('taskSynced', { taskId, task });
      console.log(`📝 Task synced: ${taskId}`);
    });

    this.syncEngine.on('conflictResolved', ({ taskId, task }) => {
      this.metricsCollector.recordConflictResolved(taskId);
      this.emit('conflictResolved', { taskId, task });
      console.log(`⚖️ Conflict resolved for task: ${taskId}`);
    });

    this.syncEngine.on('syncError', ({ taskId, error }) => {
      this.emit('syncError', { taskId, error });
      console.error(`❌ Sync error for task ${taskId}:`, error);
    });

    // Metrics event handlers
    this.metricsCollector.on('metric:processed', (event) => {
      console.log(`📊 Event processed: ${event.type} from ${event.source}`);
    });

    this.metricsCollector.on('metric:failed', (event) => {
      console.error(`📊 Event failed: ${event.type} from ${event.source} - ${event.error}`);
    });
  }

  async start(): Promise<void> {
    try {
      // Start webhook server
      await this.webhookServer.start();
      console.log(
        `🌐 Webhook server started on ${this.config.server.host}:${this.config.server.port}`,
      );

      // Start periodic sync if configured
      if (this.config.mcp.pollInterval > 0) {
        this.syncEngine.startPeriodicSync();
        console.log(`⏰ Periodic sync started (interval: ${this.config.mcp.pollInterval}ms)`);
      }

      // Perform initial sync
      console.log('🔄 Performing initial synchronization...');
      await this.syncEngine.syncAll();

      this.emit('started');
      console.log('✅ MCP-Kanban Bridge server started successfully');
    } catch (error) {
      console.error('❌ Failed to start bridge server:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      // Stop periodic sync
      this.syncEngine.stopPeriodicSync();

      // Stop webhook server
      await this.webhookServer.stop();

      // Disconnect storage if needed
      if ('disconnect' in this.storage) {
        await (this.storage as any).disconnect();
      }

      this.emit('stopped');
      console.log('✅ MCP-Kanban Bridge server stopped');
    } catch (error) {
      console.error('❌ Error stopping bridge server:', error);
      throw error;
    }
  }

  async handleWebhook(event: WebhookEvent): Promise<void> {
    const startTime = Date.now();

    try {
      console.log(`🔔 Received webhook: ${event.type} from ${event.source}`);

      if (event.source === 'mcp') {
        await this.syncEngine.handleMcpEvent(event.payload);
      } else if (event.source === 'kanban') {
        await this.syncEngine.handleKanbanEvent(event.payload);
      }

      const duration = Date.now() - startTime;
      this.metricsCollector.recordEventProcessed(event.type, event.source, duration);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metricsCollector.recordEventFailed(event.type, event.source, error as Error);
      throw error;
    }
  }

  verifySignature(event: WebhookEvent, secret: string): boolean {
    return this.webhookServer.verifySignature(event, secret);
  }

  // Public API methods
  async syncTask(taskId: string): Promise<void> {
    return this.syncEngine.syncTask(taskId);
  }

  async syncAll(): Promise<void> {
    return this.syncEngine.syncAll();
  }

  async resolveConflict(taskId: string): Promise<any> {
    return this.syncEngine.resolveConflict(taskId);
  }

  async getMetrics(): Promise<any> {
    return this.metricsCollector.getMetrics();
  }

  async getHealth(): Promise<{
    status: 'healthy' | 'unhealthy';
    uptime: number;
    lastSync: Date | null;
    queueSize: number;
    errorRate: number;
  }> {
    const metrics = await this.metricsCollector.getMetrics();
    const errorRate = (this.metricsCollector as any).getErrorRate?.() || 0;

    return {
      status: errorRate < 10 ? 'healthy' : 'unhealthy',
      uptime: process.uptime(),
      lastSync: metrics.lastSyncTime,
      queueSize: metrics.queueSize,
      errorRate,
    };
  }

  // Mock client implementations - replace with real ones
  private createMockMcpClient(): McpClient {
    return {
      async getTask(taskId: string) {
        // Mock implementation
        return {
          id: taskId,
          title: `Mock Task ${taskId}`,
          description: 'Mock description',
          status: 'todo',
          priority: 'P2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      },

      async getTasks(options: { limit: number; offset: number }) {
        // Mock implementation
        return Array.from({ length: options.limit }, (_, i) => ({
          id: `task-${options.offset + i}`,
          title: `Mock Task ${options.offset + i}`,
          status: 'todo',
          priority: 'P2',
        }));
      },

      async createTask(task: any) {
        console.log(`MCP: Creating task ${task.id}`);
      },

      async updateTask(task: any) {
        console.log(`MCP: Updating task ${task.id}`);
      },

      async deleteTask(taskId: string) {
        console.log(`MCP: Deleting task ${taskId}`);
      },
    };
  }

  private createMockKanbanClient(): KanbanClient {
    return {
      async getTask(taskId: string) {
        // Mock implementation
        return {
          uuid: taskId,
          title: `Mock Kanban Task ${taskId}`,
          content: 'Mock description',
          status: 'incoming',
          priority: 'P2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      },

      async getTasks(options: { boardId: string; limit: number; offset: number }) {
        // Mock implementation
        return Array.from({ length: options.limit }, (_, i) => ({
          uuid: `kanban-task-${options.offset + i}`,
          title: `Mock Kanban Task ${options.offset + i}`,
          status: 'incoming',
          priority: 'P2',
        }));
      },

      async createTask(task: any) {
        console.log(`Kanban: Creating task ${task.id}`);
      },

      async updateTask(task: any) {
        console.log(`Kanban: Updating task ${task.id}`);
      },

      async deleteTask(taskId: string) {
        console.log(`Kanban: Deleting task ${taskId}`);
      },
    };
  }
}

// CLI entry point
if (require.main === module) {
  const config: BridgeConfig = {
    mcp: {
      url: process.env.MCP_URL || 'http://localhost:8080',
      apiKey: process.env.MCP_API_KEY || 'mock-api-key',
      webhookSecret: process.env.MCP_WEBHOOK_SECRET || 'mock-secret',
      pollInterval: parseInt(process.env.MCP_POLL_INTERVAL || '30000'),
    },
    kanban: {
      url: process.env.KANBAN_URL || 'http://localhost:3000',
      apiKey: process.env.KANBAN_API_KEY || 'mock-api-key',
      webhookSecret: process.env.KANBAN_WEBHOOK_SECRET || 'mock-secret',
      boardId: process.env.KANBAN_BOARD_ID || 'default',
    },
    sync: {
      direction: 'bidirectional',
      conflictResolution: 'most_recent',
      batchSize: 50,
      retryAttempts: 3,
      retryDelay: 5000,
    },
    storage: {
      type: 'memory',
    },
    server: {
      port: parseInt(process.env.BRIDGE_PORT || '3000'),
      host: process.env.BRIDGE_HOST || 'localhost',
      webhookPath: '/webhook',
    },
  };

  const server = new BridgeServer(config);

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  // Start the server
  server.start().catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
}

export { BridgeServer };
