/**
 * Agent OS Core Message Protocol Types
 * Unified messaging protocol for agent coordination and crisis management
 */

// ============================================================================
// Core Message Types
// ============================================================================

export interface CoreMessage {
  // Core Identification
  id: string; // UUID v4
  version: string; // Protocol version: "1.0.0"
  type: MessageType; // Message type enumeration
  timestamp: string; // RFC 3339 timestamp

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

  // Crisis Management
  CRISIS_ALERT = 'crisis_alert',
  CRISIS_COORDINATION = 'crisis_coordination',
  CRISIS_RESOLUTION = 'crisis_resolution',
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

// ============================================================================
// Agent Addressing
// ============================================================================

export interface AgentAddress {
  id: string; // Unique agent identifier
  namespace: string; // Agent namespace/tenant
  domain: string; // Domain or service group
  version?: string; // Agent version
  endpoint?: string; // Network endpoint
}

// ============================================================================
// Security Types
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
  id: string;
  type: string;
  namespace: string;
  domain: string;
  version?: string;
  metadata?: Record<string, any>;
}

export interface Credentials {
  type: 'jwt' | 'api_key' | 'certificate' | 'shared_secret';
  token: string;
  expires?: string;
  issuer?: string;
}

export interface Capability {
  id: string; // Capability identifier
  namespace: string; // Capability namespace
  actions: string[]; // Allowed actions
  resources: string[]; // Accessible resources
  conditions: Condition[]; // Access conditions
}

export interface Permission {
  resource: string;
  actions: string[];
  conditions?: Condition[];
}

export interface Condition {
  type: 'time' | 'rate_limit' | 'resource' | 'custom';
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in';
  value: any;
  description?: string;
}

export enum TrustLevel {
  UNTRUSTED = 'untrusted',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface SandboxConfig {
  enabled: boolean;
  isolationLevel: 'none' | 'process' | 'container' | 'vm';
  resourceLimits: ResourceLimits;
  allowedOperations: string[];
  blockedOperations: string[];
}

export interface ResourceLimits {
  maxMemory?: number; // MB
  maxCpu?: number; // percentage
  maxNetwork?: number; // MB/s
  maxDisk?: number; // MB
  maxExecutionTime?: number; // seconds
}

export interface MessageSignature {
  algorithm: 'ES256' | 'RS256' | 'HS256';
  keyId: string; // Key identifier
  signature: string; // Base64-encoded signature
  certificate?: string; // X.509 certificate chain
}

export interface Encryption {
  algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  keyId: string; // Encryption key identifier
  iv: string; // Initialization vector
  ciphertext: string; // Encrypted payload
  tag: string; // Authentication tag
}

// ============================================================================
// Message Content Types
// ============================================================================

export interface MessagePayload {
  type: string;
  data: any;
  encoding?: 'json' | 'binary' | 'text';
  compression?: 'none' | 'gzip' | 'brotli';
  size?: number; // bytes
}

export interface MessageMetadata {
  source?: string;
  tags?: string[];
  custom?: Record<string, any>;
  version?: string;
  schema?: string;
}

// ============================================================================
// Flow Control Types
// ============================================================================

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: BackoffStrategy;
  retryConditions: RetryCondition[];
  deadLetterQueue?: string;
}

export enum BackoffStrategy {
  FIXED = 'fixed',
  LINEAR = 'linear',
  EXPONENTIAL = 'exponential',
  EXPONENTIAL_WITH_JITTER = 'exponential_with_jitter',
}

export interface RetryCondition {
  type: 'error_code' | 'exception_type' | 'timeout' | 'custom';
  value: any;
  description?: string;
}

// ============================================================================
// Service Mesh Types
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
}

export interface AgentRegistration {
  agent: AgentInfo;
  endpoints: Endpoint[];
  capabilities: Capability[];
  healthCheck: HealthCheckConfig;
  loadBalancing: LoadBalancingConfig;
}

export interface AgentInfo {
  id: string;
  type: string;
  version: string;
  namespace: string;
  domain: string;
  metadata?: Record<string, any>;
}

export interface Endpoint {
  id: string;
  type: 'http' | 'websocket' | 'tcp' | 'udp';
  address: string;
  port?: number;
  path?: string;
  protocol?: string;
  metadata?: Record<string, any>;
}

export interface HealthCheckConfig {
  enabled: boolean;
  interval: number; // milliseconds
  timeout: number; // milliseconds
  retries: number;
  endpoint?: string;
  expectedStatus?: number;
}

export interface LoadBalancingConfig {
  strategy: LoadBalancingStrategy;
  weight?: number;
  sticky?: boolean;
  healthCheck?: boolean;
}

export enum LoadBalancingStrategy {
  ROUND_ROBIN = 'round_robin',
  LEAST_CONNECTIONS = 'least_connections',
  WEIGHTED_ROUND_ROBIN = 'weighted_round_robin',
  RANDOM = 'random',
  CONSISTENT_HASH = 'consistent_hash',
}

export interface ServiceQuery {
  type?: string;
  namespace?: string;
  domain?: string;
  capabilities?: string[];
  healthStatus?: 'healthy' | 'unhealthy' | 'unknown';
  metadata?: Record<string, any>;
}

export interface AgentInstance {
  id: string;
  info: AgentInfo;
  endpoints: Endpoint[];
  status: AgentStatus;
  lastSeen: string;
  health: HealthStatus;
  loadBalancing: LoadBalancingConfig;
}

export interface AgentEndpoint {
  instanceId: string;
  endpoint: Endpoint;
  health: HealthStatus;
  connections: number;
  lastUsed: string;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  lastCheck: string;
  responseTime?: number; // milliseconds
  errorRate?: number; // percentage
  message?: string;
  details?: Record<string, any>;
}

export enum AgentStatus {
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  ERROR = 'error',
  MAINTENANCE = 'maintenance',
}

// ============================================================================
// Observability Types
// ============================================================================

export interface TraceContext {
  traceId: string; // Root trace identifier
  spanId: string; // Current span identifier
  parentSpanId?: string; // Parent span identifier
  baggage: Record<string, string>; // Trace metadata
  sampled: boolean; // Sampling decision
}

export interface Span {
  traceId: string;
  spanId: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  tags: Record<string, any>;
  logs: LogEntry[];
  status: SpanStatus;
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
  labels?: Record<string, string>;
  description?: string;
}

export interface Gauge {
  name: string;
  value: number;
  labels?: Record<string, string>;
  description?: string;
}

export interface Histogram {
  name: string;
  buckets: number[];
  count: number;
  sum: number;
  labels?: Record<string, string>;
  description?: string;
}

// ============================================================================
// Transport Types
// ============================================================================

export interface Transport {
  // Connection Management
  connect(endpoint: string): Promise<Connection>;
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
}

export interface Connection {
  id: string;
  endpoint: string;
  status: ConnectionStatus;
  established: string;
  lastActivity: string;
  metadata?: Record<string, any>;
}

export enum ConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

export interface FlowControlConfig {
  rateLimit?: RateLimit;
  backpressure?: BackpressureConfig;
  bufferSize?: number;
}

export interface RateLimit {
  requestsPerSecond: number;
  burstSize?: number;
  windowSize?: number; // milliseconds
}

export interface BackpressureConfig {
  strategy: BackpressureStrategy;
  highWaterMark: number;
  lowWaterMark: number;
  maxBuffer: number;
}

export enum BackpressureStrategy {
  DROP = 'drop',
  BUFFER = 'buffer',
  REJECT = 'reject',
  THROTTLE = 'throttle',
}

export interface FlowControlStatus {
  active: boolean;
  queueSize: number;
  dropCount: number;
  rejectCount: number;
  throttleCount: number;
}

// ============================================================================
// Protocol Operations Types
// ============================================================================

export interface HandshakeRequest {
  protocolVersion: string;
  agentId: string;
  capabilities: string[];
  securityContext: SecurityContext;
}

export interface HandshakeResponse {
  accepted: boolean;
  protocolVersion: string;
  assignedCapabilities: string[];
  securityContext: SecurityContext;
  connectionId: string;
}

export interface CapabilityNegotiation {
  requested: Capability[];
  offered: Capability[];
  negotiated: Capability[];
  rejected: Capability[];
}

export interface Heartbeat {
  timestamp: string;
  sequence: number;
  status: AgentStatus;
  metrics: HealthMetrics;
}

export interface HealthMetrics {
  cpu: number; // percentage
  memory: number; // percentage
  disk: number; // percentage
  network: NetworkMetrics;
  custom?: Record<string, number>;
}

export interface NetworkMetrics {
  latency: number; // milliseconds
  bandwidth: number; // Mbps
  packetLoss: number; // percentage
  connections: number;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface Observable<T> {
  subscribe(observer: Observer<T>): Subscription;
  next(value: T): void;
  error(error: Error): void;
  complete(): void;
}

export interface Observer<T> {
  next(value: T): void;
  error(error: Error): void;
  complete(): void;
}

export interface Subscription {
  unsubscribe(): void;
  closed: boolean;
}

export interface Serializer {
  serialize(message: CoreMessage): Uint8Array;
  deserialize(data: Uint8Array): CoreMessage;
  validate(message: CoreMessage): ValidationResult;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

// ============================================================================
// Crisis Management Types
// ============================================================================

export interface CrisisMessage {
  id: string;
  type: CrisisMessageType;
  level: CrisisLevel;
  coordinationId: string;
  affectedAgents: AgentAddress[];
  requiredActions: string[];
  deadline: string;
  metadata?: Record<string, any>;
}

export enum CrisisMessageType {
  SYSTEM_EMERGENCY = 'system_emergency',
  SECURITY_VALIDATION = 'security_validation',
  DEPLOYMENT_SYNC = 'deployment_sync',
  BOARD_MANAGEMENT = 'board_management',
  TASK_PRIORITIZATION = 'task_prioritization',
  DUPLICATE_TASKS = 'duplicate_tasks',
  AGENT_OVERLOAD = 'agent_overload',
  RESOURCE_CONTENTION = 'resource_contention',
}

export enum CrisisLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  SYSTEM_EMERGENCY = 'system_emergency',
}

export interface CrisisResolution {
  crisisId: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'failed';
  progress: number; // percentage
  startTime: string;
  endTime?: string;
  actions: CrisisAction[];
  results?: CrisisResults;
}

export interface CrisisAction {
  id: string;
  type: string;
  agentId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  result?: any;
  error?: string;
}

export interface CrisisResults {
  tasksConsolidated: number;
  agentsCoordinated: number;
  timeSavings: number; // minutes
  resourcesAllocated: number;
  issuesResolved: number;
}
