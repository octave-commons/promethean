# Type System Reference

The Pantheon Framework features a comprehensive type system with 747 lines of well-documented interfaces. This reference provides a complete guide to all types and their purposes.

## Core Message Types

### Role

```typescript
export type Role = 'system' | 'user' | 'assistant';
```

**Purpose**: Defines the role of a message sender in a conversation
**Usage**: Used to categorize messages and determine their processing context

### Message

```typescript
export type Message = {
  role: Role;
  content: string;
  images?: string[];
};
```

**Purpose**: Represents a single message in a conversation
**Properties**:

- `role`: The sender role (system, user, or assistant)
- `content`: The text content of the message
- `images`: Optional array of image URLs or base64 encoded images

**Example**:

```typescript
const userMessage: Message = {
  role: 'user',
  content: 'Hello, how are you?',
  images: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...'],
};
```

## Context Management Types

### ContextSource

```typescript
export type ContextSource = {
  id: string;
  label: string;
  where?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};
```

**Purpose**: Represents a source of context data that can be compiled into messages
**Properties**:

- `id`: Unique identifier for the context source
- `label`: Human-readable label for the context source
- `where`: Optional query conditions for filtering context data
- `metadata`: Additional metadata about the context source

**Example**:

```typescript
const sessionSource: ContextSource = {
  id: 'sessions',
  label: 'Chat Sessions',
  where: { type: 'chat', status: 'active' },
  metadata: { priority: 'high' },
};
```

### ContextMetadata

```typescript
export type ContextMetadata = {
  id: string;
  sessionId: string;
  timestamp: Date;
  ttl?: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
};
```

**Purpose**: Metadata associated with a context entry
**Properties**:

- `id`: Unique identifier for the context metadata
- `sessionId`: The session this context belongs to
- `timestamp`: When the context was created
- `ttl`: Optional time-to-live in milliseconds
- `tags`: Optional tags for categorizing the context
- `metadata`: Additional metadata about the context

### ContextShare

```typescript
export type ContextShare = {
  id: string;
  sourceSessionId: string;
  targetSessionId: string;
  contextIds: string[];
  permissions: ContextPermission[];
  expiresAt?: Date;
  createdAt: Date;
};
```

**Purpose**: Represents a sharing of context between sessions
**Properties**:

- `id`: Unique identifier for the context share
- `sourceSessionId`: The session sharing the context
- `targetSessionId`: The session receiving the context
- `contextIds`: Array of context IDs being shared
- `permissions`: Permissions governing the shared context
- `expiresAt`: Optional expiration time for the share
- `createdAt`: When the share was created

### ContextPermission

```typescript
export type ContextPermission = {
  action: 'read' | 'write' | 'delete';
  resource: string;
  conditions?: Record<string, unknown>;
};
```

**Purpose**: Defines permissions for accessing shared context resources
**Properties**:

- `action`: The type of action allowed (read, write, delete)
- `resource`: The resource the permission applies to
- `conditions`: Optional conditions that must be met for the permission to apply

## Actor and Behavior Types

### BehaviorMode

```typescript
export type BehaviorMode = 'active' | 'passive' | 'persistent';
```

**Purpose**: Defines the execution mode of a behavior
**Values**:

- `'active'`: Only executes when there is user input
- `'passive'`: Only executes when there is no user input
- `'persistent'`: Always executes regardless of user input

### Behavior

```typescript
export type Behavior = {
  name: string;
  mode: BehaviorMode;
  plan: (input: { goal: string; context: Message[] }) => Promise<{ actions: Action[] }>;
  description?: string;
  config?: Record<string, unknown>;
};
```

**Purpose**: Represents a behavior that an actor can perform
**Properties**:

- `name`: Unique name for the behavior
- `mode`: When this behavior should be executed
- `plan`: Function that generates actions based on goal and context
- `description`: Optional description of what the behavior does
- `config`: Optional configuration for the behavior

**Example**:

```typescript
const greetingBehavior: Behavior = {
  name: 'greeting',
  mode: 'active',
  description: 'Greets users when they send messages',
  plan: async ({ goal, context }) => {
    return {
      actions: [
        {
          type: 'message',
          content: `Hello! I'm here to help with: ${goal}`,
          target: 'user',
        },
      ],
    };
  },
};
```

### Talent

```typescript
export type Talent = {
  name: string;
  behaviors: readonly Behavior[];
  description?: string;
  version?: string;
};
```

**Purpose**: Represents a collection of related behaviors that form a capability
**Properties**:

- `name`: Unique name for the talent
- `behaviors`: Array of behaviors that make up this talent
- `description`: Optional description of the talent
- `version`: Optional version string for the talent

**Example**:

```typescript
const socialTalent: Talent = {
  name: 'social',
  version: '1.0.0',
  description: 'Social interaction capabilities',
  behaviors: [greetingBehavior, farewellBehavior],
};
```

### ActorScript

```typescript
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
```

**Purpose**: Defines the script/blueprint for creating an actor
**Properties**:

- `name`: Name of the actor script
- `roleName`: Optional role name the actor should assume
- `contextSources`: Sources of context data for the actor
- `talents`: Array of talents the actor possesses
- `program`: Optional program code for the actor
- `description`: Optional description of the actor
- `version`: Optional version string for the script
- `config`: Optional configuration for the actor

### Actor

```typescript
export type Actor = {
  id: string;
  script: ActorScript;
  goals: readonly string[];
  state: ActorState;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
};
```

**Purpose**: Represents an active agent instance in the system
**Properties**:

- `id`: Unique identifier for the actor
- `script`: The script that defines this actor's capabilities
- `goals`: Array of goals the actor is working towards
- `state`: Current execution state of the actor
- `createdAt`: When the actor was created
- `updatedAt`: When the actor was last updated
- `metadata`: Additional metadata about the actor

### ActorState

```typescript
export type ActorState = 'idle' | 'running' | 'paused' | 'completed' | 'failed';
```

**Purpose**: Represents the current state of an actor
**Values**:

- `'idle'`: Actor is not currently executing
- `'running'`: Actor is actively executing
- `'paused'`: Actor execution is paused
- `'completed'`: Actor has successfully completed its goals
- `'failed'`: Actor execution has failed

## Action Types

### Action (Union Type)

```typescript
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
```

**Purpose**: Represents an action that an actor can perform

#### Tool Action

```typescript
{
  type: 'tool';
  name: string;
  args: Record<string, unknown>;
  timeout?: number;
}
```

**Purpose**: Execute a tool with specified arguments

#### Message Action

```typescript
{
  type: 'message';
  content: string;
  target?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}
```

**Purpose**: Send a message to a target

#### Spawn Action

```typescript
{
  type: 'spawn';
  actor: ActorScript;
  goal: string;
  config?: Record<string, unknown>;
}
```

**Purpose**: Create a new actor instance

#### Wait Action

```typescript
{
  type: 'wait';
  duration: number;
  reason?: string;
}
```

**Purpose**: Pause execution for a specified duration

#### Context Action

```typescript
{
  type: 'context';
  operation: 'read' | 'write' | 'delete';
  target: string;
  data?: Record<string, unknown>;
}
```

**Purpose**: Perform operations on context data

## Tool and Runtime Types

### ToolSpec

```typescript
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
```

**Purpose**: Specification for a tool that can be invoked by actors
**Properties**:

- `name`: Unique name for the tool
- `description`: Human-readable description of what the tool does
- `parameters`: Schema defining the tool's parameters
- `runtime`: Where the tool is executed (mcp, local, http)
- `endpoint`: Optional endpoint URL for HTTP tools
- `timeout`: Optional timeout in milliseconds
- `retryPolicy`: Optional retry policy for failed invocations
- `schema`: Optional detailed schema for the tool

### ToolDefinition

```typescript
export type ToolDefinition = {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
  strict?: boolean;
  handler?: string;
  metadata?: Record<string, unknown>;
};
```

**Purpose**: Definition of a tool for use in agent workflows
**Properties**:

- `name`: Unique name for the tool
- `description`: Optional description of the tool
- `parameters`: Optional parameter schema
- `strict`: Whether to enforce strict parameter validation
- `handler`: Optional handler function reference
- `metadata`: Additional metadata about the tool

## Transport and Protocol Types

### MessageEnvelope

```typescript
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
```

**Purpose**: Envelope for transporting messages between system components

### TransportConfig

```typescript
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
```

**Purpose**: Configuration for message transport protocols

### RetryPolicy

```typescript
export type RetryPolicy = {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoff: 'linear' | 'exponential';
  retryableErrors: string[];
};
```

**Purpose**: Defines retry behavior for failed operations

## Orchestration Types

### AgentTask

```typescript
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
```

**Purpose**: Represents a task being executed by an agent

### AgentStatus

```typescript
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
```

**Purpose**: Status information for an agent's current task

### SessionInfo

```typescript
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
```

**Purpose**: Information about a session in the system

### SessionListResponse

```typescript
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
```

**Purpose**: Response containing a paginated list of sessions

### AgentOrchestratorConfig

```typescript
export type AgentOrchestratorConfig = {
  timeoutThreshold?: number;
  monitoringInterval?: number;
  autoCleanup?: boolean;
  persistenceEnabled?: boolean;
  maxConcurrentTasks?: number;
  taskQueueSize?: number;
};
```

**Purpose**: Configuration for the agent orchestrator

## Workflow Types

### ModelReference

```typescript
export type ModelReference =
  | string
  | {
      provider: string;
      name: string;
      options?: Record<string, unknown>;
      settings?: Record<string, unknown>;
    };
```

**Purpose**: Reference to a language model, either as a string or detailed configuration

### AgentDefinition

```typescript
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
```

**Purpose**: Definition of an agent for use in workflows

### WorkflowNode

```typescript
export type WorkflowNode = {
  id: string;
  label?: string;
  definition?: ResolvedAgentDefinition;
  source?: 'inline' | 'reference' | 'config';
  config?: Record<string, unknown>;
};
```

**Purpose**: A node in a workflow graph representing an agent or process

### WorkflowEdge

```typescript
export type WorkflowEdge = {
  from: string;
  to: string;
  label?: string;
  conditions?: Record<string, unknown>;
};
```

**Purpose**: An edge connecting two nodes in a workflow

### WorkflowDefinition

```typescript
export type WorkflowDefinition = {
  id: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata?: Record<string, unknown>;
  config?: Record<string, unknown>;
};
```

**Purpose**: Complete workflow definition

### AgentWorkflowGraph

```typescript
export type AgentWorkflowGraph = {
  id: string;
  nodes: Map<string, WorkflowNode>;
  edges: WorkflowEdge[];
  metadata?: Record<string, unknown>;
};
```

**Purpose**: Runtime representation of an agent workflow

## Security and Auth Types

### AuthToken

```typescript
export type AuthToken = {
  token: string;
  type: 'bearer' | 'basic' | 'api_key';
  expiresAt?: Date;
  permissions: string[];
  metadata?: Record<string, unknown>;
};
```

**Purpose**: Authentication token for system access

### SecurityContext

```typescript
export type SecurityContext = {
  sessionId: string;
  userId?: string;
  permissions: string[];
  authLevel: 'none' | 'basic' | 'admin';
  metadata?: Record<string, unknown>;
};
```

**Purpose**: Security context for a session

## Error and Event Types

### PantheonError

```typescript
export type PantheonError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
  timestamp: Date;
  context?: Record<string, unknown>;
};
```

**Purpose**: Standardized error format for the Pantheon framework

### SystemEvent

```typescript
export type SystemEvent = {
  id: string;
  type: string;
  source: string;
  timestamp: Date;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  severity: 'info' | 'warning' | 'error' | 'critical';
};
```

**Purpose**: System event for logging and monitoring

## Utility Types

### Result

```typescript
export type Result<T, E = PantheonError> =
  | { success: true; data: T }
  | { success: false; error: E };
```

**Purpose**: Result type for operations that can succeed or fail

### AsyncResult

```typescript
export type AsyncResult<T, E = PantheonError> = Promise<Result<T, E>>;
```

**Purpose**: Async version of the Result type

### PaginatedResponse

```typescript
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};
```

**Purpose**: Standardized paginated response format

## Type Guards

The framework provides several type guards for runtime type checking:

### isMessage

```typescript
export const isMessage = (value: unknown): value is Message => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'role' in value &&
    'content' in value &&
    ['system', 'user', 'assistant'].includes((value as Message).role)
  );
};
```

### isToolSpec

```typescript
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
```

### isMessageEnvelope

```typescript
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
```

These type guards provide runtime validation and help ensure type safety when working with external data sources or user inputs.
