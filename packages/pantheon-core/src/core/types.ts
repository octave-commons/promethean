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

/**
 * Represents an action that an actor can perform
 *
 * Tool Action: Execute a tool with specified arguments
 * @property type - 'tool'
 * @property name - Name of the tool to execute
 * @property args - Arguments to pass to the tool
 * @property timeout - Optional timeout in milliseconds
 *
 * Message Action: Send a message to a target
 * @property type - 'message'
 * @property content - The message content
 * @property target - Optional target recipient (defaults to 'user')
 * @property priority - Optional message priority level
 *
 * Spawn Action: Create a new actor instance
 * @property type - 'spawn'
 * @property actor - The script for the new actor
 * @property goal - The goal for the new actor
 * @property config - Optional configuration for the new actor
 *
 * Wait Action: Pause execution for a specified duration
 * @property type - 'wait'
 * @property duration - Duration to wait in milliseconds
 * @property reason - Optional reason for waiting
 *
 * Context Action: Perform operations on context data
 * @property type - 'context'
 * @property operation - The operation to perform (read, write, delete)
 * @property target - The target context identifier
 * @property data - Optional data for write operations
 */
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

/**
 * Specification for a tool that can be invoked by actors
 * @property name - Unique name for the tool
 * @property description - Human-readable description of what the tool does
 * @property parameters - Schema defining the tool's parameters
 * @property runtime - Where the tool is executed (mcp, local, http)
 * @property endpoint - Optional endpoint URL for HTTP tools
 * @property timeout - Optional timeout in milliseconds
 * @property retryPolicy - Optional retry policy for failed invocations
 * @property schema - Optional detailed schema for the tool
 */
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

/**
 * Definition of a tool for use in agent workflows
 * @property name - Unique name for the tool
 * @property description - Optional description of the tool
 * @property parameters - Optional parameter schema
 * @property strict - Whether to enforce strict parameter validation
 * @property handler - Optional handler function reference
 * @property metadata - Additional metadata about the tool
 */
export type ToolDefinition = {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
  strict?: boolean;
  handler?: string;
  metadata?: Record<string, unknown>;
};

// === Transport and Protocol Types ===

/**
 * Envelope for transporting messages between system components
 * @property id - Unique identifier for the message
 * @property type - Type/category of the message
 * @property sender - Identifier of the message sender
 * @property recipient - Identifier of the intended recipient
 * @property timestamp - When the message was sent
 * @property payload - The actual message content/data
 * @property signature - Optional digital signature for verification
 * @property metadata - Additional metadata about the message
 * @property correlationId - Optional ID for correlating request/response pairs
 * @property replyTo - Optional address for replies
 * @property priority - Message priority level
 * @property ttl - Optional time-to-live in milliseconds
 * @property retryCount - Number of retry attempts made
 * @property maxRetries - Maximum number of retry attempts allowed
 */
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

/**
 * Configuration for message transport protocols
 * @property type - Transport protocol type (amqp, websocket, http)
 * @property url - Connection URL for the transport
 * @property options - Additional transport-specific options
 * @property auth - Authentication configuration
 * @property reconnect - Reconnection behavior configuration
 * @property queue - Optional queue configuration for message brokers
 */
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

/**
 * Defines retry behavior for failed operations
 * @property maxRetries - Maximum number of retry attempts
 * @property initialDelay - Initial delay before first retry in milliseconds
 * @property maxDelay - Maximum delay between retries in milliseconds
 * @property backoff - Backoff strategy (linear or exponential)
 * @property retryableErrors - Array of error types that should trigger retries
 */
export type RetryPolicy = {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoff: 'linear' | 'exponential';
  retryableErrors: string[];
};

// === Orchestration Types ===

/**
 * Represents a task being executed by an agent
 * @property sessionId - The session this task belongs to
 * @property task - Description of the task being performed
 * @property startTime - Timestamp when the task started
 * @property status - Current status of the task
 * @property lastActivity - Timestamp of last activity on the task
 * @property completionMessage - Optional message upon completion
 * @property progress - Optional progress percentage (0-100)
 * @property metadata - Additional metadata about the task
 */
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

/**
 * Status information for an agent's current task
 * @property sessionId - The session this status belongs to
 * @property task - Description of the task
 * @property status - Current status of the task
 * @property startTime - Formatted start time string
 * @property lastActivity - Formatted last activity string
 * @property duration - Duration in milliseconds since start
 * @property completionMessage - Optional completion message
 * @property progress - Optional progress percentage (0-100)
 * @property error - Optional error message if failed
 */
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

/**
 * Information about a session in the system
 * @property id - Unique session identifier
 * @property title - Human-readable session title
 * @property messageCount - Number of messages in the session
 * @property lastActivityTime - Formatted last activity time
 * @property sessionAge - Age of the session in milliseconds
 * @property activityStatus - Current activity status
 * @property isAgentTask - Whether this is an agent task session
 * @property agentTaskStatus - Optional agent task status
 * @property error - Optional error message
 * @property metadata - Additional session metadata
 */
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

/**
 * Response containing a paginated list of sessions
 * @property sessions - Array of session information
 * @property totalCount - Total number of sessions available
 * @property pagination - Pagination information
 * @property summary - Summary statistics about sessions
 */
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

/**
 * Configuration for the agent orchestrator
 * @property timeoutThreshold - Timeout threshold for tasks in milliseconds
 * @property monitoringInterval - Interval for monitoring tasks in milliseconds
 * @property autoCleanup - Whether to automatically clean up completed tasks
 * @property persistenceEnabled - Whether task persistence is enabled
 * @property maxConcurrentTasks - Maximum number of concurrent tasks
 * @property taskQueueSize - Maximum size of the task queue
 */
export type AgentOrchestratorConfig = {
  timeoutThreshold?: number;
  monitoringInterval?: number;
  autoCleanup?: boolean;
  persistenceEnabled?: boolean;
  maxConcurrentTasks?: number;
  taskQueueSize?: number;
};

// === Workflow Types ===

/**
 * Reference to a language model, either as a string or detailed configuration
 * @property provider - Model provider (e.g., 'openai', 'anthropic')
 * @property name - Model name (e.g., 'gpt-4', 'claude-3')
 * @property options - Additional model options
 * @property settings - Model-specific settings
 */
export type ModelReference =
  | string
  | {
      provider: string;
      name: string;
      options?: Record<string, unknown>;
      settings?: Record<string, unknown>;
    };

/**
 * Definition of an agent for use in workflows
 * @property name - Optional name for the agent
 * @property instructions - Instructions for the agent
 * @property handoffDescription - Description for handoff scenarios
 * @property model - Model reference for the agent
 * @property modelSettings - Model-specific settings
 * @property output - Expected output format
 * @property tools - Array of tools available to the agent
 * @property metadata - Additional metadata
 */
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

/**
 * A resolved agent definition with required fields guaranteed
 * @property name - Name for the agent (required)
 * @property instructions - Instructions for the agent (required)
 */
export type ResolvedAgentDefinition = AgentDefinition & {
  name: string;
  instructions: string;
};

/**
 * A node in a workflow graph representing an agent or process
 * @property id - Unique identifier for the node
 * @property label - Optional human-readable label
 * @property definition - Agent definition for this node
 * @property source - How the definition was provided
 * @property config - Node-specific configuration
 */
export type WorkflowNode = {
  id: string;
  label?: string;
  definition?: ResolvedAgentDefinition;
  source?: 'inline' | 'reference' | 'config';
  config?: Record<string, unknown>;
};

/**
 * An edge connecting two nodes in a workflow
 * @property from - Source node ID
 * @property to - Target node ID
 * @property label - Optional edge label
 * @property conditions - Conditions for traversing this edge
 */
export type WorkflowEdge = {
  from: string;
  to: string;
  label?: string;
  conditions?: Record<string, unknown>;
};

/**
 * Complete workflow definition
 * @property id - Unique workflow identifier
 * @property nodes - Array of workflow nodes
 * @property edges - Array of workflow edges
 * @property metadata - Additional workflow metadata
 * @property config - Workflow configuration
 */
export type WorkflowDefinition = {
  id: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata?: Record<string, unknown>;
  config?: Record<string, unknown>;
};

/**
 * Runtime representation of an agent workflow
 * @property id - Unique workflow identifier
 * @property nodes - Map of node IDs to node definitions
 * @property edges - Array of workflow edges
 * @property metadata - Additional workflow metadata
 */
export type AgentWorkflowGraph = {
  id: string;
  nodes: Map<string, WorkflowNode>;
  edges: WorkflowEdge[];
  metadata?: Record<string, unknown>;
};

// === Security and Auth Types ===

/**
 * Authentication token for system access
 * @property token - The actual token string
 * @property type - Type of token (bearer, basic, api_key)
 * @property expiresAt - Optional expiration time
 * @property permissions - Array of permissions granted by this token
 * @property metadata - Additional token metadata
 */
export type AuthToken = {
  token: string;
  type: 'bearer' | 'basic' | 'api_key';
  expiresAt?: Date;
  permissions: string[];
  metadata?: Record<string, unknown>;
};

/**
 * Security context for a session
 * @property sessionId - The session this context belongs to
 * @property userId - Optional user identifier
 * @property permissions - Array of permissions for this context
 * @property authLevel - Authentication level (none, basic, admin)
 * @property metadata - Additional security metadata
 */
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
