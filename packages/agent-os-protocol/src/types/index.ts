/**
 * Agent OS Core Message Protocol Types
 *
 * Unified messaging protocol for agent communication with enterprise-grade
 * security, observability, and scalability.
 */

import { z } from 'zod';

// ============================================================================
// CORE MESSAGE TYPES
// ============================================================================

export const MessageTypeEnum = z.enum([
  // Core Communication
  'REQUEST',
  'RESPONSE',
  'EVENT',
  'STREAM',

  // Protocol Management
  'HANDSHAKE',
  'HEARTBEAT',
  'DISCOVERY',
  'CAPABILITY_NEGOTIATION',

  // Error Handling
  'ERROR',
  'TIMEOUT',
  'CIRCUIT_BREAK',

  // Lifecycle Management
  'AGENT_REGISTER',
  'AGENT_UNREGISTER',
  'AGENT_STATUS',
  'SERVICE_HEALTH',
]);

export type MessageType = z.infer<typeof MessageTypeEnum>;

export const PriorityEnum = z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']);

export type Priority = z.infer<typeof PriorityEnum>;

export const QoSLevelEnum = z.enum(['AT_MOST_ONCE', 'AT_LEAST_ONCE', 'EXACTLY_ONCE']);

export type QoSLevel = z.infer<typeof QoSLevelEnum>;

// ============================================================================
// AGENT ADDRESSING
// ============================================================================

export const AgentAddressSchema = z.object({
  id: z.string().uuid(),
  namespace: z.string().min(1),
  domain: z.string().min(1),
  version: z.string().optional(),
  endpoint: z.string().url().optional(),
});

export type AgentAddress = z.infer<typeof AgentAddressSchema>;

// ============================================================================
// SECURITY TYPES
// ============================================================================

export const MessageSignatureSchema = z.object({
  algorithm: z.enum(['ES256', 'RS256', 'HS256']),
  keyId: z.string(),
  signature: z.string(),
  certificate: z.string().optional(),
});

export type MessageSignature = z.infer<typeof MessageSignatureSchema>;

export const EncryptionSchema = z.object({
  algorithm: z.enum(['AES-256-GCM', 'ChaCha20-Poly1305']),
  keyId: z.string(),
  iv: z.string(),
  ciphertext: z.string(),
  tag: z.string(),
});

export type Encryption = z.infer<typeof EncryptionSchema>;

export const CapabilitySchema = z.object({
  id: z.string(),
  namespace: z.string(),
  actions: z.array(z.string()),
  resources: z.array(z.string()),
  conditions: z.array(z.record(z.unknown())),
});

export type Capability = z.infer<typeof CapabilitySchema>;

export const SecurityContextSchema = z.object({
  // Authentication
  principal: z.object({
    id: z.string(),
    type: z.string(),
    attributes: z.record(z.unknown()),
  }),
  credentials: z.record(z.unknown()),
  tokenExpiry: z.string().datetime(),

  // Authorization
  capabilities: z.array(CapabilitySchema),
  permissions: z.array(z.string()),
  roles: z.array(z.string()),

  // Trust & Isolation
  trustLevel: z.enum(['untrusted', 'partial', 'trusted', 'verified']),
  sandbox: z.object({
    enabled: z.boolean(),
    limits: z.record(z.unknown()),
  }),
  resourceLimits: z.object({
    cpu: z.number(),
    memory: z.number(),
    disk: z.number(),
    network: z.number(),
  }),
});

export type SecurityContext = z.infer<typeof SecurityContextSchema>;

// ============================================================================
// MESSAGE PAYLOADS
// ============================================================================

export const MessagePayloadSchema = z.object({
  type: z.string(),
  data: z.unknown(),
  encoding: z.enum(['json', 'binary', 'text']).default('json'),
  compression: z.enum(['none', 'gzip', 'brotli']).default('none'),
  size: z.number().nonnegative(),
});

export type MessagePayload = z.infer<typeof MessagePayloadSchema>;

export const MessageMetadataSchema = z.object({
  source: z.string(),
  version: z.string(),
  timestamp: z.string().datetime(),
  tags: z.array(z.string()),
  custom: z.record(z.unknown()),
});

export type MessageMetadata = z.infer<typeof MessageMetadataSchema>;

// ============================================================================
// CORE MESSAGE ENVELOPE
// ============================================================================

export const CoreMessageSchema = z.object({
  // Core Identification
  id: z.string().uuid(),
  version: z.string().default('1.0.0'),
  type: MessageTypeEnum,
  timestamp: z.string().datetime(),

  // Routing Information
  sender: AgentAddressSchema,
  recipient: AgentAddressSchema,
  replyTo: AgentAddressSchema.optional(),
  correlationId: z.string().uuid().optional(),

  // Security & Trust
  signature: MessageSignatureSchema.optional(),
  capabilities: z.array(z.string()),
  token: z.string().optional(),

  // Content & Metadata
  payload: MessagePayloadSchema,
  metadata: MessageMetadataSchema,
  headers: z.record(z.string()),

  // Quality of Service
  priority: PriorityEnum.default('NORMAL'),
  ttl: z.number().nonnegative().optional(),
  qos: QoSLevelEnum.default('AT_LEAST_ONCE'),

  // Flow Control
  retryPolicy: z
    .object({
      maxAttempts: z.number().min(0).max(10),
      backoffStrategy: z.enum(['fixed', 'linear', 'exponential', 'exponential_with_jitter']),
      retryConditions: z.array(z.string()),
      deadLetterQueue: z.string().optional(),
    })
    .optional(),
  deadline: z.string().datetime().optional(),
  traceId: z.string().optional(),
  spanId: z.string().optional(),
});

export type CoreMessage = z.infer<typeof CoreMessageSchema>;

// ============================================================================
// PROTOCOL OPERATIONS
// ============================================================================

export const HandshakeRequestSchema = z.object({
  protocolVersion: z.string(),
  agentId: z.string(),
  capabilities: z.array(z.string()),
  securityContext: SecurityContextSchema,
});

export type HandshakeRequest = z.infer<typeof HandshakeRequestSchema>;

export const HandshakeResponseSchema = z.object({
  accepted: z.boolean(),
  protocolVersion: z.string(),
  assignedCapabilities: z.array(z.string()),
  securityContext: SecurityContextSchema,
  connectionId: z.string(),
});

export type HandshakeResponse = z.infer<typeof HandshakeResponseSchema>;

export const HeartbeatSchema = z.object({
  timestamp: z.string().datetime(),
  sequence: z.number(),
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  metrics: z.object({
    cpu: z.number(),
    memory: z.number(),
    activeConnections: z.number(),
    messagesProcessed: z.number(),
  }),
});

export type Heartbeat = z.infer<typeof HeartbeatSchema>;

// ============================================================================
// SERVICE MESH TYPES
// ============================================================================

export const HealthStatusSchema = z.object({
  status: z.enum(['healthy', 'unhealthy', 'degraded']),
  lastCheck: z.string().datetime(),
  responseTime: z.number(),
  errorRate: z.number().min(0).max(100),
  uptime: z.number().min(0).max(100),
  details: z.record(z.unknown()),
});

export type HealthStatus = z.infer<typeof HealthStatusSchema>;

export const ServiceQuerySchema = z.object({
  namespace: z.string().optional(),
  domain: z.string().optional(),
  capabilities: z.array(z.string()).optional(),
  healthStatus: z.enum(['healthy', 'unhealthy', 'degraded', 'any']).default('any'),
});

export type ServiceQuery = z.infer<typeof ServiceQuerySchema>;

export const AgentInstanceSchema = z.object({
  agent: AgentAddressSchema,
  endpoints: z.array(z.string().url()),
  capabilities: z.array(CapabilitySchema),
  health: HealthStatusSchema,
  load: z.object({
    cpu: z.number(),
    memory: z.number(),
    connections: z.number(),
  }),
  lastSeen: z.string().datetime(),
});

export type AgentInstance = z.infer<typeof AgentInstanceSchema>;

export const LoadBalancingStrategyEnum = z.enum([
  'ROUND_ROBIN',
  'LEAST_CONNECTIONS',
  'WEIGHTED_ROUND_ROBIN',
  'RANDOM',
  'CONSISTENT_HASH',
]);

export type LoadBalancingStrategy = z.infer<typeof LoadBalancingStrategyEnum>;

// ============================================================================
// OBSERVABILITY TYPES
// ============================================================================

export const TraceContextSchema = z.object({
  traceId: z.string(),
  spanId: z.string(),
  parentSpanId: z.string().optional(),
  baggage: z.record(z.string()),
  sampled: z.boolean(),
});

export type TraceContext = z.infer<typeof TraceContextSchema>;

export const SpanSchema = z.object({
  traceId: z.string(),
  spanId: z.string(),
  operationName: z.string(),
  startTime: z.number(),
  endTime: z.number().optional(),
  tags: z.record(z.unknown()),
  logs: z.array(
    z.object({
      timestamp: z.number(),
      level: z.string(),
      message: z.string(),
      fields: z.record(z.unknown()),
    }),
  ),
  status: z.enum(['ok', 'error', 'timeout', 'cancelled']),
});

export type Span = z.infer<typeof SpanSchema>;

// ============================================================================
// TRANSPORT TYPES
// ============================================================================

export const TransportConfigSchema = z.object({
  type: z.enum(['http', 'websocket', 'tcp', 'udp', 'memory']),
  endpoint: z.string(),
  timeout: z.number().positive().default(30000),
  retryAttempts: z.number().min(0).max(5).default(3),
  security: z.object({
    tls: z.boolean().default(false),
    certificates: z.array(z.string()).optional(),
    ca: z.string().optional(),
  }),
  compression: z.boolean().default(false),
  serialization: z.enum(['json', 'protobuf', 'msgpack', 'cbor']).default('json'),
});

export type TransportConfig = z.infer<typeof TransportConfigSchema>;

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
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastActivity: Date;
  metrics: ConnectionMetrics;
}

export interface ConnectionMetrics {
  messagesSent: number;
  messagesReceived: number;
  bytesTransferred: number;
  errorCount: number;
  averageLatency: number;
}

export interface FlowControlConfig {
  rateLimit: number;
  bufferSize: number;
  backpressureThreshold: number;
}

export interface FlowControlStatus {
  currentRate: number;
  bufferUtilization: number;
  backpressureActive: boolean;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export const createCoreMessage = (data: unknown): CoreMessage => {
  return CoreMessageSchema.parse(data);
};

export const validateMessage = (message: CoreMessage): boolean => {
  return CoreMessageSchema.safeParse(message).success;
};

export const createAgentAddress = (data: unknown): AgentAddress => {
  return AgentAddressSchema.parse(data);
};

export const createSecurityContext = (data: unknown): SecurityContext => {
  return SecurityContextSchema.parse(data);
};

// ============================================================================
// ERROR TYPES
// ============================================================================

export class ProtocolError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ProtocolError';
  }
}

export class ValidationError extends ProtocolError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class SecurityError extends ProtocolError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'SECURITY_ERROR', details);
    this.name = 'SecurityError';
  }
}

export class TransportError extends ProtocolError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'TRANSPORT_ERROR', details);
    this.name = 'TransportError';
  }
}
