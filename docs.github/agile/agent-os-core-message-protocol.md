# Agent OS Core Message Protocol

## Overview

The Agent OS Core Message Protocol is a comprehensive communication framework designed to enable seamless agent-to-agent communication, async operations, and job queue management within the Promethean ecosystem. This protocol builds upon the existing Model Context Protocol (MCP) infrastructure while extending it with agent-specific capabilities.

## Core Principles

1. **Backward Compatibility**: Fully compatible with existing MCP JSON-RPC 2.0 messages
2. **Agent-Centric**: Designed specifically for agent-to-agent communication patterns
3. **Async-First**: Built-in support for asynchronous operations and job queues
4. **Type Safety**: Full TypeScript support with Zod validation
5. **Extensible**: Plugin-based architecture for custom message types and handlers

## Message Architecture

### Base Message Structure

All Agent OS messages extend the standard MCP JSON-RPC 2.0 format:

```typescript
interface AgentOSMessage {
  jsonrpc: '2.0';
  id?: string | number | null;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
  // Agent OS extensions
  aosVersion?: string;
  sourceAgent?: AgentIdentifier;
  targetAgent?: AgentIdentifier;
  priority?: MessagePriority;
  timestamp?: ISO8601String;
  correlationId?: string;
  asyncContext?: AsyncContext;
}
```

### Agent Identifier

```typescript
interface AgentIdentifier {
  id: string;
  type: AgentType;
  version: string;
  capabilities: AgentCapability[];
}

enum AgentType {
  WORKER = 'worker',
  COORDINATOR = 'coordinator',
  ORCHESTRATOR = 'orchestrator',
  PROXY = 'proxy',
  GATEWAY = 'gateway',
}

enum AgentCapability {
  TOOLS = 'tools',
  RESOURCES = 'resources',
  PROMPTS = 'prompts',
  SAMPLING = 'sampling',
  JOB_QUEUE = 'job_queue',
  ROUTING = 'routing',
  PERSISTENCE = 'persistence',
}
```

### Message Priority

```typescript
enum MessagePriority {
  CRITICAL = 0,
  HIGH = 1,
  NORMAL = 2,
  LOW = 3,
  BACKGROUND = 4,
}
```

## Message Types

### 1. Agent Discovery Messages

#### `agents/discover`

Request information about available agents in the ecosystem.

```typescript
interface AgentsDiscoverRequest {
  type?: AgentType[];
  capabilities?: AgentCapability[];
  version?: string;
}

interface AgentsDiscoverResponse {
  agents: AgentInfo[];
}

interface AgentInfo {
  identifier: AgentIdentifier;
  status: AgentStatus;
  endpoints: AgentEndpoint[];
  metadata: Record<string, unknown>;
}

enum AgentStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  BUSY = 'busy',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
}

interface AgentEndpoint {
  type: 'mcp' | 'http' | 'websocket' | 'stdio';
  url?: string;
  path?: string;
  authentication?: AuthenticationMethod;
}
```

#### `agents/register`

Register a new agent with the ecosystem.

```typescript
interface AgentsRegisterRequest {
  agent: AgentInfo;
  ttl?: number; // Time to live in seconds
}

interface AgentsRegisterResponse {
  success: boolean;
  agentId: string;
  expiresAt?: ISO8601String;
}
```

### 2. Job Queue Messages

#### `jobs/submit`

Submit a job for asynchronous execution.

```typescript
interface JobsSubmitRequest {
  job: JobDefinition;
  options?: JobOptions;
}

interface JobDefinition {
  id?: string;
  type: string;
  targetAgent: AgentIdentifier;
  payload: unknown;
  timeout?: number; // milliseconds
  retryPolicy?: RetryPolicy;
  dependencies?: string[]; // job IDs
}

interface JobOptions {
  priority?: MessagePriority;
  deliverAt?: ISO8601String;
  maxRetries?: number;
  callback?: JobCallback;
}

interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'fixed' | 'exponential' | 'linear';
  baseDelay: number; // milliseconds
  maxDelay?: number; // milliseconds
}

interface JobCallback {
  type: 'webhook' | 'poll' | 'event';
  endpoint?: string;
  event?: string;
}

interface JobsSubmitResponse {
  jobId: string;
  status: JobStatus;
  estimatedCompletion?: ISO8601String;
  queuePosition?: number;
}

enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout',
}
```

#### `jobs/status`

Query the status of one or more jobs.

```typescript
interface JobsStatusRequest {
  jobIds: string[];
  includeResults?: boolean;
}

interface JobsStatusResponse {
  jobs: JobStatusInfo[];
}

interface JobStatusInfo {
  id: string;
  status: JobStatus;
  progress?: number; // 0-100
  result?: unknown;
  error?: JobError;
  createdAt: ISO8601String;
  startedAt?: ISO8601String;
  completedAt?: ISO8601String;
  attempts: number;
}

interface JobError {
  code: string;
  message: string;
  details?: unknown;
  retryable: boolean;
}
```

#### `jobs/cancel`

Cancel a pending or running job.

```typescript
interface JobsCancelRequest {
  jobId: string;
  reason?: string;
  force?: boolean; // force cancellation even if running
}

interface JobsCancelResponse {
  success: boolean;
  jobId: string;
  finalStatus: JobStatus;
}
```

### 3. Routing Messages

#### `routing/forward`

Forward a message to another agent.

```typescript
interface RoutingForwardRequest {
  targetAgent: AgentIdentifier;
  message: AgentOSMessage;
  route?: RouteOptions;
}

interface RouteOptions {
  timeout?: number;
  retryPolicy?: RetryPolicy;
  transform?: MessageTransform;
}

interface MessageTransform {
  type: 'header' | 'payload' | 'full';
  operation: 'add' | 'remove' | 'modify';
  path?: string; // JSONPath for payload transforms
  value?: unknown;
}

interface RoutingForwardResponse {
  success: boolean;
  messageId: string;
  deliveryStatus: DeliveryStatus;
  result?: unknown;
}

enum DeliveryStatus {
  DELIVERED = 'delivered',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
  REJECTED = 'rejected',
}
```

#### `routing/broadcast`

Send a message to multiple agents.

```typescript
interface RoutingBroadcastRequest {
  targetAgents: AgentSelector;
  message: AgentOSMessage;
  options?: BroadcastOptions;
}

interface AgentSelector {
  type?: AgentType[];
  capabilities?: AgentCapability[];
  status?: AgentStatus[];
  custom?: Record<string, unknown>; // custom filter criteria
}

interface BroadcastOptions {
  parallel?: boolean;
  timeout?: number;
  aggregation?: AggregationStrategy;
}

interface AggregationStrategy {
  type: 'all' | 'any' | 'majority' | 'first';
  timeout?: number;
}

interface RoutingBroadcastResponse {
  messageId: string;
  deliveries: DeliveryResult[];
  summary?: BroadcastSummary;
}

interface DeliveryResult {
  agentId: string;
  status: DeliveryStatus;
  result?: unknown;
  error?: string;
  deliveredAt?: ISO8601String;
}

interface BroadcastSummary {
  total: number;
  successful: number;
  failed: number;
  timeout: number;
}
```

### 4. Async Context Messages

#### `async/create`

Create an async operation context.

```typescript
interface AsyncCreateRequest {
  operation: AsyncOperation;
  options?: AsyncOptions;
}

interface AsyncOperation {
  id?: string;
  type: string;
  timeout?: number;
  checkpoint?: boolean;
  cleanup?: CleanupPolicy;
}

interface AsyncOptions {
  priority?: MessagePriority;
  callbacks?: AsyncCallbacks;
  persistence?: PersistenceOptions;
}

interface AsyncCallbacks {
  onProgress?: string; // event name
  onComplete?: string; // event name
  onError?: string; // event name
  onTimeout?: string; // event name
}

interface PersistenceOptions {
  enabled: boolean;
  storage?: 'memory' | 'redis' | 'database';
  ttl?: number; // seconds
}

interface AsyncCreateResponse {
  operationId: string;
  status: AsyncStatus;
  expiresAt?: ISO8601String;
}

enum AsyncStatus {
  CREATED = 'created',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout',
}
```

#### `async/update`

Update an async operation.

```typescript
interface AsyncUpdateRequest {
  operationId: string;
  updates: AsyncUpdates;
}

interface AsyncUpdates {
  status?: AsyncStatus;
  progress?: number; // 0-100
  result?: unknown;
  error?: AsyncError;
  metadata?: Record<string, unknown>;
}

interface AsyncError {
  code: string;
  message: string;
  recoverable: boolean;
  details?: unknown;
}

interface AsyncUpdateResponse {
  operationId: string;
  status: AsyncStatus;
  previousStatus: AsyncStatus;
}
```

### 5. Event Messages

#### `events/subscribe`

Subscribe to events from agents.

```typescript
interface EventsSubscribeRequest {
  filter: EventFilter;
  options?: SubscriptionOptions;
}

interface EventFilter {
  sourceAgents?: AgentIdentifier[];
  eventTypes?: string[];
  patterns?: EventPattern[];
  priority?: MessagePriority[];
}

interface EventPattern {
  type: 'regex' | 'glob' | 'jsonpath';
  pattern: string;
  field?: string; // field to match against
}

interface SubscriptionOptions {
  durable?: boolean;
  bufferSize?: number;
  timeout?: number;
  delivery?: DeliveryMode;
}

enum DeliveryMode {
  IMMEDIATE = 'immediate',
  BATCHED = 'batched',
  POLLING = 'polling',
}

interface EventsSubscribeResponse {
  subscriptionId: string;
  status: SubscriptionStatus;
  expiresAt?: ISO8601String;
}

enum SubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  ERROR = 'error',
}
```

#### `events/publish`

Publish an event to subscribers.

```typescript
interface EventsPublishRequest {
  event: AgentEvent;
  options?: PublishOptions;
}

interface AgentEvent {
  id?: string;
  type: string;
  source: AgentIdentifier;
  data: unknown;
  timestamp: ISO8601String;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}

interface PublishOptions {
  targetAgents?: AgentSelector;
  priority?: MessagePriority;
  ttl?: number; // seconds
  persistent?: boolean;
}

interface EventsPublishResponse {
  eventId: string;
  delivered: number;
  failed: number;
  timestamp: ISO8601String;
}
```

## Transport Layer

### HTTP Transport

Extends MCP StreamableHTTP with Agent OS features:

```typescript
interface AgentOSHTTPTransport extends StreamableHTTPServerTransport {
  // Agent OS extensions
  agentRegistry: AgentRegistry;
  jobQueue: JobQueue;
  eventBus: EventBus;
  router: MessageRouter;
}
```

### WebSocket Transport

Real-time bidirectional communication:

```typescript
interface AgentOSWebSocketTransport {
  connect(url: string, options?: WebSocketOptions): Promise<Connection>;
  subscribe(events: EventFilter): Subscription;
  publish(event: AgentEvent): Promise<void>;
  forward(message: AgentOSMessage): Promise<DeliveryResult>;
}
```

### Message Queue Transport

For reliable, persistent message delivery:

```typescript
interface AgentOSQueueTransport {
  publish(topic: string, message: AgentOSMessage): Promise<void>;
  subscribe(topic: string, handler: MessageHandler): Subscription;
  createJob(job: JobDefinition): Promise<string>;
  getJobStatus(jobId: string): Promise<JobStatusInfo>;
}
```

## Routing and Discovery

### Agent Registry

Central registry for agent discovery and management:

```typescript
interface AgentRegistry {
  register(agent: AgentInfo): Promise<string>;
  unregister(agentId: string): Promise<void>;
  discover(filter: AgentSelector): Promise<AgentInfo[]>;
  update(agentId: string, updates: Partial<AgentInfo>): Promise<void>;
  getStatus(agentId: string): Promise<AgentStatus>;
}
```

### Message Router

Intelligent message routing based on agent capabilities and load:

```typescript
interface MessageRouter {
  route(message: AgentOSMessage): Promise<RoutingResult>;
  addRoute(pattern: RoutePattern, handler: RouteHandler): void;
  removeRoute(routeId: string): void;
  getRoutes(): RouteInfo[];
}

interface RoutingResult {
  success: boolean;
  route: RouteInfo;
  delivery?: DeliveryResult;
  alternatives?: RouteInfo[];
}

interface RoutePattern {
  id: string;
  priority: number;
  condition: RouteCondition;
  target: RouteTarget;
}

interface RouteCondition {
  agentType?: AgentType;
  capability?: AgentCapability;
  messageType?: string;
  custom?: (message: AgentOSMessage) => boolean;
}
```

## Job Queue System

### Queue Interface

```typescript
interface JobQueue {
  submit(job: JobDefinition): Promise<string>;
  getStatus(jobId: string): Promise<JobStatusInfo>;
  cancel(jobId: string, reason?: string): Promise<boolean>;
  list(filter?: JobFilter): Promise<JobStatusInfo[]>;
  retry(jobId: string): Promise<string>;
}

interface JobFilter {
  status?: JobStatus[];
  agentId?: string;
  type?: string;
  createdAfter?: ISO8601String;
  createdBefore?: ISO8601String;
  limit?: number;
  offset?: number;
}
```

### Job Processing

```typescript
interface JobProcessor {
  process(job: JobDefinition): Promise<JobResult>;
  canProcess(jobType: string): boolean;
  getCapabilities(): ProcessorCapability[];
}

interface JobResult {
  success: boolean;
  result?: unknown;
  error?: JobError;
  metadata?: Record<string, unknown>;
}

interface ProcessorCapability {
  jobType: string;
  maxConcurrency: number;
  timeout: number;
  resources: ResourceRequirement[];
}
```

## Security and Authentication

### Agent Authentication

```typescript
interface AgentAuth {
  authenticate(credentials: AgentCredentials): Promise<AuthToken>;
  validate(token: AuthToken): Promise<AgentInfo>;
  revoke(token: string): Promise<void>;
  refresh(token: string): Promise<AuthToken>;
}

interface AgentCredentials {
  type: 'jwt' | 'api_key' | 'certificate';
  value: string;
  metadata?: Record<string, unknown>;
}

interface AuthToken {
  token: string;
  type: string;
  expiresAt: ISO8601String;
  scopes: string[];
  agentId: string;
}
```

### Message Security

```typescript
interface MessageSecurity {
  sign(message: AgentOSMessage, key: CryptoKey): Promise<SignedMessage>;
  verify(signedMessage: SignedMessage): Promise<boolean>;
  encrypt(message: AgentOSMessage, key: CryptoKey): Promise<EncryptedMessage>;
  decrypt(encryptedMessage: EncryptedMessage, key: CryptoKey): Promise<AgentOSMessage>;
}

interface SignedMessage {
  message: AgentOSMessage;
  signature: string;
  algorithm: string;
  keyId: string;
}

interface EncryptedMessage {
  data: string;
  algorithm: string;
  keyId: string;
  iv: string;
}
```

## Implementation Examples

### Basic Agent Implementation

```typescript
import { AgentOSServer } from '@promethean-os/agent-os';

const agent = new AgentOSServer({
  id: 'worker-001',
  type: AgentType.WORKER,
  version: '1.0.0',
  capabilities: [AgentCapability.TOOLS, AgentCapability.JOB_QUEUE],
});

// Register tool handlers
agent.registerTool('process-data', {
  inputSchema: { data: z.string() },
  handler: async ({ data }) => {
    // Process data asynchronously
    const jobId = await agent.submitJob({
      type: 'data-processing',
      targetAgent: agent.identifier,
      payload: { data },
    });

    return { jobId, status: 'submitted' };
  },
});

// Start the agent
await agent.start({
  transport: 'http',
  port: 3001,
});
```

### Job Queue Consumer

```typescript
agent.onJob('data-processing', async (job) => {
  try {
    // Update progress
    await agent.updateJob(job.id, { progress: 25 });

    // Process the data
    const result = await processData(job.payload.data);

    // Update progress again
    await agent.updateJob(job.id, { progress: 75 });

    // Complete the job
    await agent.completeJob(job.id, { result });
  } catch (error) {
    await agent.failJob(job.id, {
      code: 'PROCESSING_ERROR',
      message: error.message,
      retryable: true,
    });
  }
});
```

### Event-Driven Communication

```typescript
// Subscribe to events from other agents
await agent.subscribe(
  {
    sourceAgents: [{ type: AgentType.COORDINATOR }],
    eventTypes: ['task-assigned', 'task-completed'],
  },
  async (event) => {
    if (event.type === 'task-assigned') {
      await agent.handleTaskAssignment(event.data);
    } else if (event.type === 'task-completed') {
      await agent.handleTaskCompletion(event.data);
    }
  },
);

// Publish events
await agent.publish({
  type: 'worker-ready',
  data: {
    capabilities: ['data-processing', 'file-conversion'],
    load: 0.3,
  },
});
```

### Message Forwarding

```typescript
// Forward a message to another agent
const result = await agent.forward({
  targetAgent: {
    id: 'coordinator-001',
    type: AgentType.COORDINATOR,
  },
  message: {
    method: 'tools/call',
    params: {
      name: 'analyze-data',
      arguments: { dataset: 'sales-2024.csv' },
    },
  },
  route: {
    timeout: 30000,
    retryPolicy: {
      maxAttempts: 3,
      backoffStrategy: 'exponential',
      baseDelay: 1000,
    },
  },
});
```

## Integration with Existing MCP

The Agent OS protocol is designed to work seamlessly with existing MCP infrastructure:

1. **Transport Compatibility**: Uses existing MCP transports (stdio, HTTP, WebSocket)
2. **Message Compatibility**: All Agent OS messages are valid MCP JSON-RPC 2.0 messages
3. **Tool Compatibility**: Existing MCP tools work unchanged within Agent OS
4. **Gradual Migration**: Agents can adopt Agent OS features incrementally

### Migration Path

1. **Phase 1**: Deploy Agent OS alongside existing MCP servers
2. **Phase 2**: Enable agent discovery and registration
3. **Phase 3**: Implement job queue and async operations
4. **Phase 4**: Add event-driven communication
5. **Phase 5**: Full Agent OS ecosystem with routing and security

## Configuration

### Agent Configuration

```typescript
interface AgentOSConfig {
  agent: AgentConfig;
  transport: TransportConfig;
  security: SecurityConfig;
  jobQueue: JobQueueConfig;
  events: EventConfig;
}

interface AgentConfig {
  id: string;
  type: AgentType;
  version: string;
  capabilities: AgentCapability[];
  metadata?: Record<string, unknown>;
}

interface TransportConfig {
  type: 'http' | 'websocket' | 'stdio' | 'queue';
  options: Record<string, unknown>;
}

interface SecurityConfig {
  authentication?: AuthenticationConfig;
  encryption?: EncryptionConfig;
  authorization?: AuthorizationConfig;
}

interface JobQueueConfig {
  provider: 'memory' | 'redis' | 'database';
  options: Record<string, unknown>;
  maxConcurrency?: number;
  defaultTimeout?: number;
}

interface EventConfig {
  provider: 'memory' | 'redis' | 'message-broker';
  options: Record<string, unknown>;
  maxSubscriptions?: number;
  defaultTTL?: number;
}
```

## Monitoring and Observability

### Metrics

```typescript
interface AgentOSMetrics {
  messageCount: Counter;
  messageLatency: Histogram;
  jobQueueDepth: Gauge;
  jobProcessingTime: Histogram;
  eventRate: Counter;
  errorRate: Counter;
  agentStatus: Gauge;
}
```

### Health Checks

```typescript
interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheckResult[];
  timestamp: ISO8601String;
}

interface HealthCheckResult {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}
```

## Best Practices

1. **Message Design**: Keep messages focused and single-purpose
2. **Error Handling**: Always provide structured error information with retry hints
3. **Async Operations**: Use job queues for long-running operations
4. **Event Design**: Use events for loose coupling and scalability
5. **Security**: Sign and encrypt sensitive messages
6. **Monitoring**: Track key metrics for operational visibility
7. **Testing**: Test message flows and error scenarios thoroughly
8. **Documentation**: Document custom message types and event schemas

## Future Extensions

1. **Streaming**: Support for streaming message payloads
2. **Distributed Tracing**: Integration with OpenTelemetry
3. **Circuit Breakers**: Built-in fault tolerance patterns
4. **Load Balancing**: Intelligent agent selection based on load
5. **Multi-tenancy**: Support for isolated agent environments
6. **GraphQL**: GraphQL interface for agent queries
7. **WebAssembly**: Support for WASM-based agents

This protocol provides a solid foundation for building sophisticated, scalable agent systems while maintaining compatibility with the existing MCP ecosystem.
