/**
 * Core types for the Pantheon Agent Management Framework
 */

// === Core Message Types ===

/**
 * Represents the role of a message sender in a conversation
 * - 'system': System-level instructions or metadata
 * - 'user': Human user input
 * - 'assistant': AI agent responses
 */
export type Role = 'system' | 'user' | 'assistant';

/**
 * Represents a single message in a conversation
 * @property role - The sender role (system, user, or assistant)
 * @property content - The text content of the message
 * @property images - Optional array of image URLs or base64 encoded images
 */
export type Message = {
  role: Role;
  content: string;
  images?: string[];
};

// === Context Management Types ===

/**
 * Represents a source of context data that can be compiled into messages
 * @property id - Unique identifier for the context source
 * @property label - Human-readable label for the context source
 * @property where - Optional query conditions for filtering context data
 * @property metadata - Additional metadata about the context source
 */
export type ContextSource = {
  id: string;
  label: string;
  where?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

/**
 * Metadata associated with a context entry
 * @property id - Unique identifier for the context metadata
 * @property sessionId - The session this context belongs to
 * @property timestamp - When the context was created
 * @property ttl - Optional time-to-live in milliseconds
 * @property tags - Optional tags for categorizing the context
 * @property metadata - Additional metadata about the context
 */
export type ContextMetadata = {
  id: string;
  sessionId: string;
  timestamp: Date;
  ttl?: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
};

/**
 * Represents a sharing of context between sessions
 * @property id - Unique identifier for the context share
 * @property sourceSessionId - The session sharing the context
 * @property targetSessionId - The session receiving the context
 * @property contextIds - Array of context IDs being shared
 * @property permissions - Permissions governing the shared context
 * @property expiresAt - Optional expiration time for the share
 * @property createdAt - When the share was created
 */
export type ContextShare = {
  id: string;
  sourceSessionId: string;
  targetSessionId: string;
  contextIds: string[];
  permissions: ContextPermission[];
  expiresAt?: Date;
  createdAt: Date;
};

/**
 * Defines permissions for accessing shared context resources
 * @property action - The type of action allowed (read, write, delete)
 * @property resource - The resource the permission applies to
 * @property conditions - Optional conditions that must be met for the permission to apply
 */
export type ContextPermission = {
  action: 'read' | 'write' | 'delete';
  resource: string;
  conditions?: Record<string, unknown>;
};

// === Actor and Behavior Types ===

/**
 * Defines the execution mode of a behavior
 * - 'active': Only executes when there is user input
 * - 'passive': Only executes when there is no user input
 * - 'persistent': Always executes regardless of user input
 */
export type BehaviorMode = 'active' | 'passive' | 'persistent';

/**
 * Represents a behavior that an actor can perform
 * @property name - Unique name for the behavior
 * @property mode - When this behavior should be executed
 * @property plan - Function that generates actions based on goal and context
 * @property description - Optional description of what the behavior does
 * @property config - Optional configuration for the behavior
 */
export type Behavior = {
  name: string;
  mode: BehaviorMode;
  plan: (input: { goal: string; context: Message[] }) => Promise<{ actions: Action[] }>;
  description?: string;
  config?: Record<string, unknown>;
};

/**
 * Represents a collection of related behaviors that form a capability
 * @property name - Unique name for the talent
 * @property behaviors - Array of behaviors that make up this talent
 * @property description - Optional description of the talent
 * @property version - Optional version string for the talent
 */
export type Talent = {
  name: string;
  behaviors: readonly Behavior[];
  description?: string;
  version?: string;
};

/**
 * Defines the script/blueprint for creating an actor
 * @property name - Name of the actor script
 * @property roleName - Optional role name the actor should assume
 * @property contextSources - Sources of context data for the actor
 * @property talents - Array of talents the actor possesses
 * @property program - Optional program code for the actor
 * @property description - Optional description of the actor
 * @property version - Optional version string for the script
 * @property config - Optional configuration for the actor
 */
export type ActorScript = {
  name: string;
  roleName?: string;
  contextSources: readonly ContextSource[];
  talents: readonly Talent[];
  program?: string;
  description?: string;
  version?: string;
  config?: Record<string, unknown>;
};

/**
 * Represents an active agent instance in the system
 * @property id - Unique identifier for the actor
 * @property script - The script that defines this actor's capabilities
 * @property goals - Array of goals the actor is working towards
 * @property state - Current execution state of the actor
 * @property createdAt - When the actor was created
 * @property updatedAt - When the actor was last updated
 * @property metadata - Additional metadata about the actor
 */
export type Actor = {
  id: string;
  script: ActorScript;
  goals: readonly string[];
  state: ActorState;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
};

/**
 * Represents the current state of an actor
 * - 'idle': Actor is not currently executing
 * - 'running': Actor is actively executing
 * - 'paused': Actor execution is paused
 * - 'completed': Actor has successfully completed its goals
 * - 'failed': Actor execution has failed
 */
export type ActorState = 'idle' | 'running' | 'paused' | 'completed' | 'failed';

// === Action Types ===

export type Action =
  | { type: 'tool'; name: string; args: Record<string, unknown>; timeout?: number }
  | {
      type: 'message';
      content: string;
      target?: string;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
    }
  | { type: 'spawn'; actor: ActorScript; goal: string; config?: Record<string, unknown> }
  | { type: 'wait'; duration: number; reason?: string }
  | {
      type: 'context';
      operation: 'read' | 'write' | 'delete';
      target: string;
      data?: Record<string, unknown>;
    };

// === Tool and Runtime Types ===

export type ToolSpec = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  runtime: 'mcp' | 'local' | 'http';
  endpoint?: string;
  timeout?: number;
  retryPolicy?: RetryPolicy;
  schema?: Record<string, unknown>;
};

export type ToolDefinition = {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
  strict?: boolean;
  handler?: string;
  metadata?: Record<string, unknown>;
};

// === Transport and Protocol Types ===

export type MessageEnvelope = {
  id: string;
  type: string;
  sender: string;
  recipient: string;
  timestamp: Date;
  payload: Record<string, unknown>;
  signature?: string;
  metadata?: Record<string, unknown>;
  correlationId?: string;
  replyTo?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  ttl?: number;
  retryCount: number;
  maxRetries: number;
};

export type TransportConfig = {
  type: 'amqp' | 'websocket' | 'http';
  url: string;
  options?: Record<string, unknown>;
  auth: {
    type: 'none' | 'basic' | 'token' | 'certificate';
    credentials?: Record<string, unknown>;
  };
  reconnect: {
    enabled: boolean;
    maxAttempts: number;
    delay: number;
    backoff: 'linear' | 'exponential';
  };
  queue?: {
    name: string;
    durable: boolean;
    exclusive: boolean;
    autoDelete: boolean;
    arguments?: Record<string, unknown>;
  };
};

export type RetryPolicy = {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoff: 'linear' | 'exponential';
  retryableErrors: string[];
};

// === Orchestration Types ===

export type AgentTask = {
  sessionId: string;
  task: string;
  startTime: number;
  status: 'running' | 'completed' | 'failed' | 'idle';
  lastActivity: number;
  completionMessage?: string;
  progress?: number;
  metadata?: Record<string, unknown>;
};

export type AgentStatus = {
  sessionId: string;
  task: string;
  status: 'running' | 'completed' | 'failed' | 'idle';
  startTime: string;
  lastActivity: string;
  duration: number;
  completionMessage?: string;
  progress?: number;
  error?: string;
};

export type SessionInfo = {
  id: string;
  title: string;
  messageCount: number;
  lastActivityTime: string;
  sessionAge: number;
  activityStatus: 'active' | 'waiting_for_input' | 'idle';
  isAgentTask: boolean;
  agentTaskStatus?: 'running' | 'completed' | 'failed' | 'idle';
  error?: string;
  metadata?: Record<string, unknown>;
};

export type SessionListResponse = {
  sessions: SessionInfo[];
  totalCount: number;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
    currentPage: number;
    totalPages: number;
  };
  summary: {
    active: number;
    waiting_for_input: number;
    idle: number;
    agentTasks: number;
  };
};

export type AgentOrchestratorConfig = {
  timeoutThreshold?: number;
  monitoringInterval?: number;
  autoCleanup?: boolean;
  persistenceEnabled?: boolean;
  maxConcurrentTasks?: number;
  taskQueueSize?: number;
};

// === Workflow Types ===

export type ModelReference =
  | string
  | {
      provider: string;
      name: string;
      options?: Record<string, unknown>;
      settings?: Record<string, unknown>;
    };

export type AgentDefinition = {
  name?: string;
  instructions?: string;
  handoffDescription?: string;
  model?: ModelReference;
  modelSettings?: Record<string, unknown>;
  output?: 'text' | Record<string, unknown>;
  tools?: ToolDefinition[];
  metadata?: Record<string, unknown>;
};

export type ResolvedAgentDefinition = AgentDefinition & {
  name: string;
  instructions: string;
};

export type WorkflowNode = {
  id: string;
  label?: string;
  definition?: ResolvedAgentDefinition;
  source?: 'inline' | 'reference' | 'config';
  config?: Record<string, unknown>;
};

export type WorkflowEdge = {
  from: string;
  to: string;
  label?: string;
  conditions?: Record<string, unknown>;
};

export type WorkflowDefinition = {
  id: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata?: Record<string, unknown>;
  config?: Record<string, unknown>;
};

export type AgentWorkflowGraph = {
  id: string;
  nodes: Map<string, WorkflowNode>;
  edges: WorkflowEdge[];
  metadata?: Record<string, unknown>;
};

// === Security and Auth Types ===

export type AuthToken = {
  token: string;
  type: 'bearer' | 'basic' | 'api_key';
  expiresAt?: Date;
  permissions: string[];
  metadata?: Record<string, unknown>;
};

export type SecurityContext = {
  sessionId: string;
  userId?: string;
  permissions: string[];
  authLevel: 'none' | 'basic' | 'admin';
  metadata?: Record<string, unknown>;
};

// === Error and Event Types ===

export type PantheonError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
  timestamp: Date;
  context?: Record<string, unknown>;
};

export type SystemEvent = {
  id: string;
  type: string;
  source: string;
  timestamp: Date;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  severity: 'info' | 'warning' | 'error' | 'critical';
};

// === Utility Types ===

export type Result<T, E = PantheonError> =
  | { success: true; data: T }
  | { success: false; error: E };

export type AsyncResult<T, E = PantheonError> = Promise<Result<T, E>>;

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

// === Type Guards ===

export const isMessage = (value: unknown): value is Message => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'role' in value &&
    'content' in value &&
    ['system', 'user', 'assistant'].includes((value as Message).role)
  );
};

export const isToolSpec = (value: unknown): value is ToolSpec => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'description' in value &&
    'runtime' in value &&
    ['mcp', 'local', 'http'].includes((value as ToolSpec).runtime)
  );
};

export const isMessageEnvelope = (value: unknown): value is MessageEnvelope => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'type' in value &&
    'sender' in value &&
    'recipient' in value &&
    'timestamp' in value &&
    'payload' in value
  );
};
