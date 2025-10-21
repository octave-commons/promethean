import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.string(),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']),
  assignee: z.string().optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
  dueDate: z.date().optional(),
  metadata: z.record(z.any()).optional(),
});

export const SyncEventSchema = z.object({
  id: z.string(),
  type: z.enum(['task_created', 'task_updated', 'task_deleted', 'status_changed']),
  source: z.enum(['mcp', 'kanban']),
  taskId: z.string(),
  data: z.record(z.any()),
  timestamp: z.date(),
  processed: z.boolean().default(false),
});

export const WebhookEventSchema = z.object({
  id: z.string(),
  source: z.string(),
  type: z.string(),
  payload: z.record(z.any()),
  signature: z.string().optional(),
  timestamp: z.date(),
});

export const BridgeConfigSchema = z.object({
  mcp: z.object({
    url: z.string(),
    apiKey: z.string(),
    webhookSecret: z.string(),
    pollInterval: z.number().default(30000), // 30 seconds
  }),
  kanban: z.object({
    url: z.string(),
    apiKey: z.string(),
    webhookSecret: z.string(),
    boardId: z.string(),
  }),
  sync: z.object({
    direction: z.enum(['mcp_to_kanban', 'kanban_to_mcp', 'bidirectional']).default('bidirectional'),
    conflictResolution: z.enum(['mcp_wins', 'kanban_wins', 'most_recent', 'manual']).default('most_recent'),
    batchSize: z.number().default(50),
    retryAttempts: z.number().default(3),
    retryDelay: z.number().default(5000),
  }),
  storage: z.object({
    type: z.enum(['redis', 'memory']).default('memory'),
    redis: z.object({
      host: z.string().default('localhost'),
      port: z.number().default(6379),
      db: z.number().default(0),
      password: z.string().optional(),
    }).optional(),
  }),
  server: z.object({
    port: z.number().default(3000),
    host: z.string().default('localhost'),
    webhookPath: z.string().default('/webhook'),
  }),
});

export type Task = z.infer<typeof TaskSchema>;
export type SyncEvent = z.infer<typeof SyncEventSchema>;
export type WebhookEvent = z.infer<typeof WebhookEventSchema>;
export type BridgeConfig = z.infer<typeof BridgeConfigSchema>;

export interface SyncQueue {
  add(event: SyncEvent): Promise<void>;
  get(limit?: number): Promise<SyncEvent[]>;
  markProcessed(eventId: string): Promise<void>;
  retryFailed(): Promise<void>;
  getSize(): Promise<number>;
}

export interface EventStorage {
  saveEvent(event: SyncEvent): Promise<void>;
  getEvent(eventId: string): Promise<SyncEvent | null>;
  getEvents(filter?: { source?: string; processed?: boolean; limit?: number }): Promise<SyncEvent[]>;
  updateEvent(eventId: string, updates: Partial<SyncEvent>): Promise<void>;
  deleteEvent(eventId: string): Promise<void>;
}

export interface TaskMapper {
  mcpToKanban(mcpTask: any): Promise<Task>;
  kanbanToMcp(kanbanTask: any): Promise<Task>;
  normalizeTask(task: any, source: 'mcp' | 'kanban'): Promise<Task>;
}

export interface ConflictResolver {
  resolve(mcpTask: Task, kanbanTask: Task): Promise<Task>;
  detectConflict(mcpTask: Task, kanbanTask: Task): boolean;
}

export interface WebhookHandler {
  handleWebhook(event: WebhookEvent): Promise<void>;
  verifySignature(event: WebhookEvent, secret: string): boolean;
}

export interface SyncEngine {
  syncTask(taskId: string): Promise<void>;
  syncAll(): Promise<void>;
  handleMcpEvent(event: any): Promise<void>;
  handleKanbanEvent(event: any): Promise<void>;
  resolveConflict(taskId: string): Promise<Task>;
}

export interface BridgeMetrics {
  eventsProcessed: number;
  eventsFailed: number;
  tasksSynced: number;
  conflictsResolved: number;
  lastSyncTime: Date;
  averageSyncTime: number;
  queueSize: number;
}

export interface MetricsCollector {
  recordEventProcessed(type: string, source: string, duration: number): void;
  recordEventFailed(type: string, source: string, error: Error): void;
  recordTaskSynced(taskId: string): void;
  recordConflictResolved(taskId: string): void;
  getMetrics(): Promise<BridgeMetrics>;
  resetMetrics(): Promise<void>;
}