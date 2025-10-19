// Core type definitions for OpenCode Client
// This file contains comprehensive TypeScript interfaces to eliminate 'any' type usage

export type Timestamp = string | number | Date;

// Session Management Types
export type SessionStatus = 'active' | 'idle' | 'closed' | 'error';

export interface SessionInfo {
  id: string;
  status: SessionStatus;
  createdAt: number;
  updatedAt: number;
  lastActivity: number;
  metadata?: Record<string, unknown>;
}

export interface SessionClient {
  session: {
    get: (params: { path: { id: string } }) => Promise<{ data?: unknown }>;
  };
}

// Agent Task Management Types
export type AgentTaskStatus = 'running' | 'completed' | 'failed' | 'idle';

export interface AgentTask {
  sessionId: string;
  task: string;
  startTime: number;
  status: AgentTaskStatus;
  lastActivity: number;
  completionMessage?: string;
  taskSummary?: string;
}

export interface TaskContext {
  agentTaskStore: DualStoreManager<'text', 'timestamp'>;
  agentTasks: Map<string, AgentTask>;
}

// Event Processing Types
export interface EventContext {
  client: SessionClient;
  taskContext: TaskContext;
}

export interface EventPayload {
  type: string;
  sessionId: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

// Ollama Queue Types
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type JobType = 'generate' | 'chat' | 'embedding';
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface JobOptions {
  status?: JobStatus;
  limit?: number;
  agentOnly?: boolean;
  agentId?: string;
  sessionId?: string;
}

export interface SubmitJobOptions {
  modelName: string;
  jobType: JobType;
  priority: JobPriority;
  jobName?: string;
  prompt?: string;
  messages?: Array<{ role: string; content: string }>;
  input?: string | string[];
  options?: {
    temperature?: number;
    top_p?: number;
    num_ctx?: number;
    num_predict?: number;
    stop?: string[];
    format?: 'json' | object;
  };
  agentId?: string;
  sessionId?: string;
}

export interface JobResult {
  id: string;
  modelName: string;
  jobType: string;
  status: string;
  jobName?: string;
  createdAt: string;
  updatedAt?: string;
  startedAt?: string;
  completedAt?: string;
  hasError?: boolean;
  hasResult?: boolean;
  priority?: string;
  queuePosition?: number;
}

export interface JobStatusResult {
  id: string;
  name?: string;
  status: JobStatus;
  priority?: JobPriority;
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: { message: string; code?: string };
}

export interface JobResultData {
  id: string;
  name?: string;
  status: JobStatus;
  result?: unknown;
  completedAt?: number;
}

// Ollama Model Types
export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}

export interface OllamaModelDetailed extends OllamaModel {
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
  model_info: Record<string, unknown>;
}

// Queue Management Types
export interface QueueInfo {
  totalJobs: number;
  pendingJobs: number;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
}

// Cache Management Types
export type CacheAction = 'stats' | 'clear' | 'clear-expired' | 'performance-analysis';

export interface CacheStats {
  totalEntries: number;
  hitRate: number;
  missRate: number;
  averageAccessTime: number;
  memoryUsage: number;
}

export interface CachePerformance {
  throughput: number;
  latency: {
    p50: number;
    p95: number;
    p99: number;
  };
  errorRate: number;
}

// Process Management Types
export type ProcessStatus = 'running' | 'stopped' | 'error' | 'unknown';

export interface ProcessInfo {
  id: string;
  name: string;
  status: ProcessStatus;
  cpu: number;
  memory: number;
  uptime: number;
  restarts: number;
}

export interface ProcessOptions {
  name?: string;
  script?: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  autorestart?: boolean;
  maxRestarts?: number;
}

// Message Types
export type MessageRole = 'system' | 'user' | 'assistant';

export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface SendMessageOptions {
  sessionId: string;
  role: MessageRole;
  content: string;
  priority?: 'low' | 'medium' | 'high';
}

// Agent Management Types
export type AgentStatus = 'idle' | 'running' | 'stopped' | 'error';

export interface AgentSession {
  id: string;
  agentId: string;
  status: AgentStatus;
  createdAt: number;
  updatedAt: number;
  lastActivity: number;
  task?: string;
  completionMessage?: string;
}

export interface CreateAgentSessionOptions {
  agentId: string;
  task: string;
  priority?: JobPriority;
  sessionId?: string;
}

export interface AgentSessionOptions {
  sessionId?: string;
  agentId?: string;
  status?: AgentStatus;
  limit?: number;
}

// Utility Types
export interface DualStoreManager {
  insert: (data: {
    id: string;
    text: string;
    timestamp: Timestamp;
    metadata?: Record<string, unknown>;
  }) => Promise<void>;
  get: (
    id: string,
  ) => Promise<{
    id: string;
    text: string;
    timestamp: Timestamp;
    metadata?: Record<string, unknown>;
  } | null>;
  getMostRecent: (
    limit: number,
  ) => Promise<
    Array<{ id: string; text: string; timestamp: Timestamp; metadata?: Record<string, unknown> }>
  >;
  update: (
    id: string,
    data: Partial<{ text: string; timestamp: Timestamp; metadata?: Record<string, unknown> }>,
  ) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

// Error Types
export interface OpenCodeError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: number;
}

export interface ApiError extends Error {
  code: string;
  details?: Record<string, unknown>;
}

// Configuration Types
export interface OpenCodeConfig {
  server: {
    endpoint: string;
    timeout: number;
    retries: number;
  };
  queue: {
    maxSize: number;
    concurrency: number;
    timeout: number;
  };
  cache: {
    enabled: boolean;
    maxSize: number;
    ttl: number;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
  };
}

// Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: OpenCodeError;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Event Types
export interface SessionEvent {
  type: 'session_created' | 'session_updated' | 'session_closed' | 'session_idle';
  sessionId: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface TaskEvent {
  type: 'task_created' | 'task_updated' | 'task_completed' | 'task_failed';
  sessionId: string;
  timestamp: number;
  data: {
    status: AgentTaskStatus;
    message?: string;
  };
}

export interface MessageEvent {
  type: 'message_sent' | 'message_received' | 'message_updated';
  sessionId: string;
  messageId: string;
  timestamp: number;
  data: {
    role: MessageRole;
    content: string;
  };
}

export type OpenCodeEvent = SessionEvent | TaskEvent | MessageEvent;

// Hook Types
export interface EventHook {
  eventType: string;
  handler: (event: OpenCodeEvent) => Promise<void>;
  priority?: number;
}

export interface ToolExecuteHook {
  toolName: string;
  before?: (params: Record<string, unknown>) => Promise<Record<string, unknown>>;
  after?: (result: unknown, params: Record<string, unknown>) => Promise<void>;
  onError?: (error: Error, params: Record<string, unknown>) => Promise<void>;
}
