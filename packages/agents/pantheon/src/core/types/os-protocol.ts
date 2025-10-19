/**
 * Agent OS Core Message Protocol - Type Definitions
 *
 * This file contains the complete TypeScript interface definitions
 * for the Agent OS Core Message Protocol.
 */

import { z } from 'zod';

// ============================================================================
// Core Message Types
// ============================================================================

export enum MessageType {
  // Core Communication
  REQUEST = 'request',
  RESPONSE = 'response',
  EVENT = 'event',
  STREAM = 'stream',

  // Protocol Management
  HANDSHAKE = 'handshake',
  HEARTBEAT = 'heartbeat',
  DISCOVERY = 'discovery',
  CAPABILITY_NEGOTIATION = 'capability_negotiation',

  // Error Handling
  ERROR = 'error',
  TIMEOUT = 'timeout',
  CIRCUIT_BREAK = 'circuit_break',

  // Lifecycle Management
  AGENT_REGISTER = 'agent_register',
  AGENT_UNREGISTER = 'agent_unregister',
  AGENT_STATUS = 'agent_status',
  SERVICE_HEALTH = 'service_health',
}

export enum Priority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3,
}

export enum QoSLevel {
  AT_MOST_ONCE = 0, // Fire and forget
  AT_LEAST_ONCE = 1, // Guaranteed delivery
  EXACTLY_ONCE = 2, // Exactly once delivery
}

export enum TrustLevel {
  UNTRUSTED = 'untrusted',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  SYSTEM = 'system',
}

export enum LoadBalancingStrategy {
  ROUND_ROBIN = 'round_robin',
  LEAST_CONNECTIONS = 'least_connections',
  WEIGHTED_ROUND_ROBIN = 'weighted_round_robin',
  RANDOM = 'random',
  CONSISTENT_HASH = 'consistent_hash',
}

export enum BackoffStrategy {
  FIXED = 'fixed',
  LINEAR = 'linear',
  EXPONENTIAL = 'exponential',
  EXPONENTIAL_WITH_JITTER = 'exponential_with_jitter',
}

// ============================================================================
// Core Interfaces
// ============================================================================

export interface CoreMessage {
  // Core Identification
  id: string; // UUID v4
  version: string; // Protocol version: "1.0.0"
  type: MessageType; // Message type enumeration
  timestamp: string; // ISO 8601 timestamp

  // Routing Information
  sender: AgentAddress; // Sender agent identifier
  recipient: AgentAddress; // Recipient agent identifier
  replyTo?: AgentAddress; // Reply-to address for responses
  correlationId?: string; // Request correlation tracking

  // Security & Trust
  signature?: MessageSignature; // Cryptographic signature
  capabilities: string[]; // Required capabilities
  token?: string; // Authentication token

  // Content & Metadata
  payload: MessagePayload; // Actual message content
  metadata: MessageMetadata; // Extensible metadata
  headers: Record<string, string>; // Transport headers

  // Quality of Service
  priority: Priority; // Message priority level
  ttl?: number; // Time-to-live in milliseconds
  qos: QoSLevel; // Quality of service level

  // Flow Control
  retryPolicy?: RetryPolicy; // Retry configuration
  deadline?: string; // Processing deadline
  traceId?: string; // Distributed trace ID
  spanId?: string; // Span identifier
}

export interface AgentAddress {
  id: string; // Unique agent identifier
  namespace: string; // Agent namespace/tenant
  domain: string; // Domain or service group
  version?: string; // Agent version
  endpoint?: string; // Network endpoint
}

export interface MessagePayload {
  type: string; // Payload type identifier
  data: unknown; // Payload data
  encoding?: string; // Data encoding (json, binary, etc.)
  compression?: string; // Compression algorithm
  size?: number; // Payload size in bytes
  checksum?: string; // Data integrity checksum
}

export interface MessageMetadata {
  source?: string; // Message source system
  category?: string; // Message category
  tags?: string[]; // Message tags
  version?: string; // Payload version
  schema?: string; // Payload schema identifier
  custom?: Record<string, unknown>; // Custom metadata
}

export interface MessageSignature {
  algorithm: 'ES256' | 'RS256' | 'HS256';
  keyId: string; // Key identifier
  signature: string; // Base64-encoded signature
  certificate?: string; // X.509 certificate chain
  timestamp: string; // Signature timestamp
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: BackoffStrategy;
  initialDelay: number; // Initial delay in milliseconds
  maxDelay: number; // Maximum delay in milliseconds
  multiplier?: number; // Backoff multiplier
  jitter?: boolean; // Add jitter to delays
  retryConditions: string[]; // Error types to retry on
  deadLetterQueue?: string; // DLQ identifier
}

// ============================================================================
// Security Interfaces
// ============================================================================

export interface SecurityContext {
  // Authentication
  principal: AgentIdentity; // Authenticated agent identity
  credentials: Credentials; // Authentication credentials
  tokenExpiry: string; // Token expiration time

  // Authorization
  capabilities: Capability[]; // Granted capabilities
  permissions: Permission[]; // Specific permissions
  roles: string[]; // Assigned roles

  // Trust & Isolation
  trustLevel: TrustLevel; // Trust classification
  sandbox: SandboxConfig; // Execution sandbox
  resourceLimits: ResourceLimits; // Resource constraints
}

export interface AgentIdentity {
  id: string; // Agent identifier
  type: string; // Agent type
  namespace: string; // Agent namespace
  version: string; // Agent version
  owner: string; // Agent owner
  metadata: Record<string, unknown>;
}

export interface Credentials {
  type: 'token' | 'certificate' | 'api_key' | 'basic';
  value: string; // Credential value
  expires?: string; // Expiration time
  issuer?: string; // Credential issuer
  scope?: string[]; // Credential scope
}

export interface Capability {
  id: string; // Capability identifier
  namespace: string; // Capability namespace
  actions: string[]; // Allowed actions
  resources: string[]; // Accessible resources
  conditions: Condition[]; // Access conditions
  expires?: string; // Capability expiration
}

export interface Permission {
  resource: string; // Resource identifier
  actions: string[]; // Allowed actions
  conditions: Condition[]; // Access conditions
  expires?: string; // Permission expiration
}

export interface Condition {
  type: 'time' | 'ip' | 'rate' | 'custom';
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in';
  value: unknown; // Condition value
  parameters?: Record<string, unknown>; // Additional parameters
}

export interface SandboxConfig {
  enabled: boolean;
  isolation: 'process' | 'container' | 'vm';
  allowedPaths: string[]; // Allowed file system paths
  networkAccess: boolean; // Network access permission
  maxMemory?: number; // Maximum memory in bytes
  maxCpu?: number; // Maximum CPU percentage
  timeout?: number; // Execution timeout in milliseconds
}

export interface ResourceLimits {
  maxMemory: number; // Maximum memory in bytes
  maxCpu: number; // Maximum CPU percentage
  maxConnections: number; // Maximum concurrent connections
  maxMessagesPerSecond: number; // Maximum message rate
  maxPayloadSize: number; // Maximum payload size in bytes
}

// ============================================================================
// Service Mesh Interfaces
// ============================================================================

export interface ServiceRegistry {
  // Registration
  register(agent: AgentRegistration): Promise<void>;
  unregister(agentId: string): Promise<void>;

  // Discovery
  discover(query: ServiceQuery): Promise<AgentInstance[]>;
  resolve(address: AgentAddress): Promise<AgentEndpoint>;

  // Health Monitoring
  healthCheck(agentId: string): Promise<HealthStatus>;
  watchHealth(agentId: string): Promise<Observable<HealthStatus>>;

  // Lifecycle Management
  listAgents(filter?: AgentFilter): Promise<AgentInstance[]>;
  getAgent(agentId: string): Promise<AgentInstance | null>;
}

export interface AgentRegistration {
  agent: AgentInfo;
  endpoints: Endpoint[];
  capabilities: Capability[];
  healthCheck: HealthCheckConfig;
  loadBalancing: LoadBalancingConfig;
  metadata: Record<string, unknown>;
}

export interface AgentInfo {
  id: string;
  name: string;
  type: string;
  version: string;
  namespace: string;
  domain: string;
  owner: string;
  description?: string;
  tags?: string[];
}

export interface Endpoint {
  id: string;
  type: 'http' | 'websocket' | 'amqp' | 'tcp' | 'udp';
  address: string;
  port?: number;
  path?: string;
  protocol: string;
  secure: boolean;
  metadata: Record<string, unknown>;
}

export interface HealthCheckConfig {
  enabled: boolean;
  interval: number; // Check interval in milliseconds
  timeout: number; // Check timeout in milliseconds
  retries: number; // Number of retries
  endpoint?: string; // Health check endpoint
  protocol: 'http' | 'tcp' | 'custom';
  expectedStatus?: number; // Expected HTTP status code
}

export interface LoadBalancingConfig {
  strategy: LoadBalancingStrategy;
  weight?: number; // Instance weight
  stickySessions?: boolean; // Enable sticky sessions
  healthCheckThreshold: number; // Health check failure threshold
}

export interface ServiceQuery {
  type?: string; // Agent type filter
  namespace?: string; // Namespace filter
  domain?: string; // Domain filter
  capabilities?: string[]; // Required capabilities
  tags?: string[]; // Tag filter
  healthy?: boolean; // Health status filter
  limit?: number; // Result limit
}

export interface AgentFilter {
  type?: string;
  namespace?: string;
  domain?: string;
  status?: AgentStatus;
  tags?: string[];
}

export interface AgentInstance {
  info: AgentInfo;
  endpoints: Endpoint[];
  capabilities: Capability[];
  status: AgentStatus;
  health: HealthStatus;
  loadBalancing: LoadBalancingConfig;
  registrationTime: string;
  lastHeartbeat: string;
  metadata: Record<string, unknown>;
}

export interface AgentEndpoint {
  instanceId: string;
  endpoint: Endpoint;
  load: number; // Current load (0-100)
  connections: number; // Active connections
  lastUsed: string; // Last usage timestamp
}

export enum AgentStatus {
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  ERROR = 'error',
  MAINTENANCE = 'maintenance',
}

export interface HealthStatus {
  healthy: boolean;
  status: 'healthy' | 'unhealthy' | 'degraded';
  lastCheck: string;
  responseTime?: number; // Response time in milliseconds
  error?: string; // Error message if unhealthy
  metrics?: HealthMetrics;
}

export interface HealthMetrics {
  cpu: number; // CPU usage percentage
  memory: number; // Memory usage percentage
  connections: number; // Active connections
  messagesPerSecond: number; // Message rate
  errorRate: number; // Error rate percentage
  uptime: number; // Uptime in milliseconds
}

// ============================================================================
// Flow Control Interfaces
// ============================================================================

export interface FlowControl {
  // Rate Limiting
  rateLimiter: RateLimiter;
  tokenBucket: TokenBucket;

  // Backpressure
  backpressureStrategy: BackoffStrategy;
  bufferSizes: Record<string, number>;

  // Circuit Breaking
  circuitBreaker: CircuitBreaker;
  bulkhead: Bulkhead;
}

export interface RateLimiter {
  limit: number; // Requests per time window
  window: number; // Time window in milliseconds
  strategy: 'fixed' | 'sliding';
  currentUsage: number; // Current usage
  resetTime: number; // Next reset time
}

export interface TokenBucket {
  capacity: number; // Bucket capacity
  tokens: number; // Current tokens
  refillRate: number; // Tokens per second
  lastRefill: number; // Last refill timestamp
}

export interface CircuitBreaker {
  state: 'closed' | 'open' | 'half_open';
  failureThreshold: number; // Failure count threshold
  recoveryTimeout: number; // Recovery timeout in milliseconds
  failureCount: number; // Current failure count
  lastFailureTime: number; // Last failure timestamp
}

export interface Bulkhead {
  maxConcurrent: number; // Maximum concurrent executions
  queueSize: number; // Queue size
  activeExecutions: number; // Current active executions
  queuedExecutions: number; // Current queued executions
}

// ============================================================================
// Observability Interfaces
// ============================================================================

export interface TraceContext {
  traceId: string; // Root trace identifier
  spanId: string; // Current span identifier
  parentSpanId?: string; // Parent span identifier
  baggage: Record<string, string>; // Trace metadata
  sampled: boolean; // Sampling decision
  flags: number; // Trace flags
}

export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags: Record<string, any>;
  logs: LogEntry[];
  status: SpanStatus;
  service: string;
  resource: Record<string, any>;
}

export interface LogEntry {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  fields?: Record<string, any>;
}

export enum SpanStatus {
  OK = 'ok',
  ERROR = 'error',
  TIMEOUT = 'timeout',
  CANCELLED = 'cancelled',
}

export interface Metrics {
  // Message Metrics
  messagesSent: Counter;
  messagesReceived: Counter;
  messageLatency: Histogram;
  messageErrors: Counter;

  // System Metrics
  activeConnections: Gauge;
  queueDepth: Gauge;
  processingTime: Histogram;
  resourceUtilization: Gauge;

  // Business Metrics
  agentInteractions: Counter;
  capabilityUsage: Counter;
  serviceAvailability: Gauge;
}

export interface Counter {
  name: string;
  value: number;
  labels: Record<string, string>;
  timestamp?: number;
}

export interface Gauge {
  name: string;
  value: number;
  labels: Record<string, string>;
  timestamp?: number;
}

export interface Histogram {
  name: string;
  buckets: Record<string, number>;
  count: number;
  sum: number;
  labels: Record<string, string>;
  timestamp?: number;
}

// ============================================================================
// Protocol Operation Interfaces
// ============================================================================

export interface HandshakeRequest {
  protocolVersion: string;
  agentId: string;
  capabilities: string[];
  securityContext: SecurityContext;
  metadata: Record<string, unknown>;
}

export interface HandshakeResponse {
  accepted: boolean;
  protocolVersion: string;
  assignedCapabilities: string[];
  securityContext: SecurityContext;
  connectionId: string;
  serverInfo: ServerInfo;
  reason?: string; // Rejection reason
}

export interface ServerInfo {
  version: string;
  capabilities: string[];
  maxConnections: number;
  maxMessageSize: number;
  supportedProtocols: string[];
}

export interface CapabilityNegotiation {
  requested: Capability[];
  offered: Capability[];
  negotiated: Capability[];
  rejected: Capability[];
  reason?: string;
}

export interface Heartbeat {
  timestamp: string;
  sequence: number;
  status: AgentStatus;
  metrics: HealthMetrics;
  capabilities: string[];
}

// ============================================================================
// Transport Interfaces
// ============================================================================

export interface Transport {
  // Connection Management
  connect(endpoint: string, options?: ConnectOptions): Promise<Connection>;
  disconnect(connectionId: string): Promise<void>;

  // Message Transport
  send(message: CoreMessage): Promise<void>;
  receive(): AsyncIterable<CoreMessage>;

  // Reliability
  acknowledge(messageId: string): Promise<void>;
  reject(messageId: string, reason: string): Promise<void>;

  // Flow Control
  setFlowControl(config: FlowControlConfig): void;
  getFlowControlStatus(): FlowControlStatus;

  // Status
  isConnected(): boolean;
  getConnectionInfo(): ConnectionInfo;
}

export interface Connection {
  id: string;
  endpoint: string;
  state: ConnectionState;
  established: string;
  lastActivity: string;
  messagesSent: number;
  messagesReceived: number;
  bytesTransferred: number;
}

export enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

export interface ConnectOptions {
  timeout?: number;
  retryPolicy?: RetryPolicy;
  security?: SecurityOptions;
  compression?: boolean;
  multiplexing?: boolean;
}

export interface SecurityOptions {
  tls?: boolean;
  certificate?: string;
  privateKey?: string;
  caCertificate?: string;
  verifyPeer?: boolean;
}

export interface FlowControlConfig {
  windowSize: number;
  maxMessages: number;
  rateLimit: number;
  backpressure: boolean;
}

export interface FlowControlStatus {
  windowUsed: number;
  queuedMessages: number;
  rateLimited: boolean;
  backpressureActive: boolean;
}

export interface ConnectionInfo {
  id: string;
  endpoint: string;
  protocol: string;
  secure: boolean;
  compression: boolean;
  multiplexing: boolean;
  established: string;
  lastActivity: string;
}

// ============================================================================
// Serialization Interfaces
// ============================================================================

export interface Serializer {
  serialize(message: CoreMessage): Uint8Array;
  deserialize(data: Uint8Array): CoreMessage;
  validate(message: CoreMessage): ValidationResult;
  getSchema(): MessageSchema;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface ValidationWarning {
  path: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface MessageSchema {
  version: string;
  schema: Record<string, unknown>;
  encoding: string;
  compression?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type Observable<T> = {
  subscribe(observer: (value: T) => void): () => void;
};

export type AsyncIterable<T> = AsyncGenerator<T, void, unknown>;

export interface SelectionContext {
  messageId: string;
  sender: AgentAddress;
  recipient: AgentAddress;
  payload: MessagePayload;
  timestamp: string;
  metadata: Record<string, unknown>;
}

// ============================================================================
// Zod Schemas for Runtime Validation
// ============================================================================

export const AgentAddressSchema = z.object({
  id: z.string().uuid(),
  namespace: z.string().min(1),
  domain: z.string().min(1),
  version: z.string().optional(),
  endpoint: z.string().url().optional(),
});

export const CoreMessageSchema = z.object({
  id: z.string().uuid(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  type: z.nativeEnum(MessageType),
  timestamp: z.string().datetime(),
  sender: AgentAddressSchema,
  recipient: AgentAddressSchema,
  replyTo: AgentAddressSchema.optional(),
  correlationId: z.string().uuid().optional(),
  signature: z
    .object({
      algorithm: z.enum(['ES256', 'RS256', 'HS256']),
      keyId: z.string(),
      signature: z.string(),
      certificate: z.string().optional(),
      timestamp: z.string().datetime(),
    })
    .optional(),
  capabilities: z.array(z.string()),
  token: z.string().optional(),
  payload: z.object({
    type: z.string(),
    data: z.unknown(),
    encoding: z.string().optional(),
    compression: z.string().optional(),
    size: z.number().nonnegative().optional(),
    checksum: z.string().optional(),
  }),
  metadata: z.object({
    source: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    version: z.string().optional(),
    schema: z.string().optional(),
    custom: z.record(z.unknown()).optional(),
  }),
  headers: z.record(z.string()),
  priority: z.nativeEnum(Priority),
  ttl: z.number().positive().optional(),
  qos: z.nativeEnum(QoSLevel),
  retryPolicy: z
    .object({
      maxAttempts: z.number().positive(),
      backoffStrategy: z.nativeEnum(BackoffStrategy),
      initialDelay: z.number().positive(),
      maxDelay: z.number().positive(),
      multiplier: z.number().positive().optional(),
      jitter: z.boolean().optional(),
      retryConditions: z.array(z.string()),
      deadLetterQueue: z.string().optional(),
    })
    .optional(),
  deadline: z.string().datetime().optional(),
  traceId: z.string().optional(),
  spanId: z.string().optional(),
});

export type ValidatedCoreMessage = z.infer<typeof CoreMessageSchema>;
