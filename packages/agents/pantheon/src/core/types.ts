/**
 * Core unified types for the Pantheon Agent Framework
 * Consolidates common types across all agent modules
 */

// ============================================================================
// Base Agent Types
// ============================================================================

export type AgentId = {
  value: string;
  type: 'uuid' | 'name' | 'custom';
}

export type AgentCapability = {
  name: string;
  version: string;
  description: string;
  dependencies?: string[];
}

export type AgentMetadata = {
  id: AgentId;
  name: string;
  version: string;
  description: string;
  capabilities: AgentCapability[];
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  status: AgentStatus;
}

export enum AgentStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  BUSY = 'busy',
  ERROR = 'error',
  MAINTENANCE = 'maintenance',
}

// ============================================================================
// Context Management Types
// ============================================================================

export type ContextId = {
  value: string;
  type: 'session' | 'agent' | 'workflow' | 'global';
}

export type ContextMetadata = {
  id: ContextId;
  agentId?: AgentId;
  parentId?: ContextId;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  tags?: string[];
  permissions: ContextPermissions;
}

export type ContextPermissions = {
  read: AgentId[];
  write: AgentId[];
  admin: AgentId[];
  public: boolean;
}

export type ContextEvent = {
  id: string;
  contextId: ContextId;
  type: string;
  data: unknown;
  timestamp: Date;
  agentId?: AgentId;
  sequence: number;
}

export type ContextSnapshot = {
  id: string;
  contextId: ContextId;
  data: unknown;
  metadata: ContextMetadata;
  timestamp: Date;
  version: number;
}

// ============================================================================
// Protocol Types
// ============================================================================

export type MessageId = {
  value: string;
  type: 'uuid' | 'correlation';
}

export type MessageEnvelope = {
  id: MessageId;
  from: AgentId;
  to: AgentId;
  type: string;
  payload: unknown;
  timestamp: Date;
  correlationId?: MessageId;
  priority: MessagePriority;
  ttl?: number;
  metadata?: Record<string, unknown>;
}

export enum MessagePriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3,
}

export type TransportConfig = {
  type: 'amqp' | 'websocket' | 'http' | 'memory';
  connection: unknown;
  options?: Record<string, unknown>;
}

// ============================================================================
// Workflow Types
// ============================================================================

export type WorkflowId = {
  value: string;
  type: 'uuid' | 'name';
}

export type WorkflowDefinition = {
  id: WorkflowId;
  name: string;
  description: string;
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata: WorkflowMetadata;
}

export type WorkflowNode = {
  id: string;
  type: 'agent' | 'condition' | 'parallel' | 'sequence' | 'data';
  name: string;
  config: unknown;
  position?: { x: number; y: number };
}

export type WorkflowEdge = {
  id: string;
  from: string;
  to: string;
  condition?: string;
  label?: string;
}

export type WorkflowMetadata = {
  author?: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  category?: string;
}

export type WorkflowExecution = {
  id: string;
  workflowId: WorkflowId;
  status: ExecutionStatus;
  startedAt: Date;
  completedAt?: Date;
  currentNode?: string;
  context: Record<string, unknown>;
  error?: string;
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// ============================================================================
// Orchestration Types
// ============================================================================

export type OrchestrationConfig = {
  maxConcurrentAgents: number;
  resourceLimits: ResourceLimits;
  schedulingPolicy: SchedulingPolicy;
  healthCheck: HealthCheckConfig;
}

export type ResourceLimits = {
  maxMemory: number;
  maxCpu: number;
  maxExecutionTime: number;
}

export enum SchedulingPolicy {
  FIFO = 'fifo',
  PRIORITY = 'priority',
  ROUND_ROBIN = 'round_robin',
  LEAST_LOADED = 'least_loaded',
}

export type HealthCheckConfig = {
  interval: number;
  timeout: number;
  retries: number;
  checkEndpoint?: string;
}

export type AgentInstance = {
  agentId: AgentId;
  instanceId: string;
  status: AgentStatus;
  resources: ResourceUsage;
  lastHeartbeat: Date;
  config: Record<string, unknown>;
}

export type ResourceUsage = {
  memory: number;
  cpu: number;
  network?: number;
  disk?: number;
}

// ============================================================================
// OS Protocol Types
// ============================================================================

export type OSCommand = {
  id: string;
  type: OSCommandType;
  payload: unknown;
  agentId: AgentId;
  timestamp: Date;
}

export enum OSCommandType {
  READ_FILE = 'read_file',
  WRITE_FILE = 'write_file',
  EXECUTE = 'execute',
  LIST_DIR = 'list_dir',
  DELETE = 'delete',
  MOVE = 'move',
  COPY = 'copy',
}

export type OSResponse = {
  commandId: string;
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: Date;
}

// ============================================================================
// Generator Types
// ============================================================================

export type AgentTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  template: string;
  variables: TemplateVariable[];
  metadata: Record<string, unknown>;
}

export type TemplateVariable = {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: unknown;
}

export type GenerationConfig = {
  templateId: string;
  variables: Record<string, unknown>;
  outputPath: string;
  options: GenerationOptions;
}

export type GenerationOptions = {
  format: 'typescript' | 'javascript' | 'clojure' | 'json';
  includeTests: boolean;
  includeDocs: boolean;
  overwrite: boolean;
}

// ============================================================================
// Management UI Types
// ============================================================================

export type UIComponent = {
  id: string;
  type: ComponentType;
  props: Record<string, unknown>;
  children?: UIComponent[];
  layout?: LayoutConfig;
}

export enum ComponentType {
  AGENT_CARD = 'agent_card',
  AGENT_LIST = 'agent_list',
  WORKFLOW_DIAGRAM = 'workflow_diagram',
  METRICS_DASHBOARD = 'metrics_dashboard',
  LOG_VIEWER = 'log_viewer',
  CONFIG_EDITOR = 'config_editor',
}

export type LayoutConfig = {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  flex?: number;
  direction?: 'row' | 'column';
}

// ============================================================================
// Error Types
// ============================================================================

export class PantheonError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly module: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'PantheonError';
  }
}

export class ContextError extends PantheonError {
  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message, code, 'context', details);
    this.name = 'ContextError';
  }
}

export class ProtocolError extends PantheonError {
  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message, code, 'protocol', details);
    this.name = 'ProtocolError';
  }
}

export class WorkflowError extends PantheonError {
  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message, code, 'workflow', details);
    this.name = 'WorkflowError';
  }
}

export class OrchestrationError extends PantheonError {
  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message, code, 'orchestration', details);
    this.name = 'OrchestrationError';
  }
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type EventHandler<T = unknown> = (event: T) => void | Promise<void>;

export type AsyncFunction<T = unknown, R = unknown> = (...args: T[]) => Promise<R>;

export type Logger = {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, error?: Error, ...args: unknown[]): void;
}

export type Cache = {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}
