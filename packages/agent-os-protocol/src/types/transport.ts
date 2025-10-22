/**
 * Transport Layer Types for Agent OS
 * 
 * Defines transport interfaces and configurations for different communication methods.
 */

import { z } from 'zod';

import type { AgentOSMessage } from './message.js';
import type { AgentIdentifier } from './agent.js';
import type { AgentEndpoint } from './agent.js';

/**
 * Transport Type - supported transport mechanisms
 */
export enum TransportType {
  HTTP = 'http',
  WEBSOCKET = 'websocket',
  STDIO = 'stdio',
  MESSAGE_QUEUE = 'message_queue',
}

export const TransportTypeSchema = z.nativeEnum(TransportType);

/**
 * Transport Configuration - base configuration for all transports
 */
export type TransportConfig = {
  type: TransportType;
  endpoint?: string;
  authentication?: any; // AuthenticationMethod - circular reference
  timeout?: number;
  retryPolicy?: any; // RetryPolicy - circular reference
  compression?: boolean;
  encryption?: boolean;
  metadata?: Record<string, unknown>;
}

export const TransportConfigSchema = z.object({
  type: TransportTypeSchema,
  endpoint: z.string().optional(),
  authentication: z.any().optional(),
  timeout: z.number().optional(),
  retryPolicy: z.any().optional(),
  compression: z.boolean().optional(),
  encryption: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * HTTP Transport Configuration
 */
export type HTTPTransportConfig = {
  type: TransportType.HTTP;
  port?: number;
  host?: string;
  path?: string;
  ssl?: boolean;
  cors?: boolean;
  rateLimit?: RateLimitConfig;
} & TransportConfig

export const HTTPTransportConfigSchema = TransportConfigSchema.extend({
  type: z.literal(TransportType.HTTP),
  port: z.number().optional(),
  host: z.string().optional(),
  path: z.string().optional(),
  ssl: z.boolean().optional(),
  cors: z.boolean().optional(),
  rateLimit: RateLimitConfigSchema.optional(),
});

/**
 * WebSocket Transport Configuration
 */
export type WebSocketTransportConfig = {
  type: TransportType.WEBSOCKET;
  port?: number;
  host?: string;
  path?: string;
  ssl?: boolean;
  heartbeat?: HeartbeatConfig;
  compression?: boolean;
} & TransportConfig

export const WebSocketTransportConfigSchema = TransportConfigSchema.extend({
  type: z.literal(TransportType.WEBSOCKET),
  port: z.number().optional(),
  host: z.string().optional(),
  path: z.string().optional(),
  ssl: z.boolean().optional(),
  heartbeat: HeartbeatConfigSchema.optional(),
  compression: z.boolean().optional(),
});

/**
 * Message Queue Transport Configuration
 */
export type MessageQueueTransportConfig = {
  type: TransportType.MESSAGE_QUEUE;
  provider: 'redis' | 'rabbitmq' | 'kafka' | 'memory';
  connectionString?: string;
  topic?: string;
  consumerGroup?: string;
  maxConcurrency?: number;
} & TransportConfig

export const MessageQueueTransportConfigSchema = TransportConfigSchema.extend({
  type: z.literal(TransportType.MESSAGE_QUEUE),
  provider: z.enum(['redis', 'rabbitmq', 'kafka', 'memory']),
  connectionString: z.string().optional(),
  topic: z.string().optional(),
  consumerGroup: z.string().optional(),
  maxConcurrency: z.number().optional(),
});

/**
 * Rate Limit Configuration
 */
export type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export const RateLimitConfigSchema = z.object({
  windowMs: z.number(),
  maxRequests: z.number(),
  skipSuccessfulRequests: z.boolean().optional(),
  skipFailedRequests: z.boolean().optional(),
});

/**
 * Heartbeat Configuration
 */
export type HeartbeatConfig = {
  interval: number; // milliseconds
  timeout: number; // milliseconds
  maxMissed: number;
}

export const HeartbeatConfigSchema = z.object({
  interval: z.number(),
  timeout: z.number(),
  maxMissed: z.number(),
});

/**
 * Transport Interface - base interface for all transports
 */
export type Transport = {
  readonly type: TransportType;
  readonly config: TransportConfig;
  
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  send(message: AgentOSMessage): Promise<void>;
  receive(): Promise<AgentOSMessage | null>;
  
  onMessage(handler: MessageHandler): void;
  onError(handler: ErrorHandler): void;
  onConnect(handler: ConnectionHandler): void;
  onDisconnect(handler: ConnectionHandler): void;
}

/**
 * Message Handler - function to handle received messages
 */
export type MessageHandler = (message: AgentOSMessage) => Promise<void> | void;

/**
 * Error Handler - function to handle transport errors
 */
export type ErrorHandler = (error: Error) => void;

/**
 * Connection Handler - function to handle connection events
 */
export type ConnectionHandler = (agentId?: string) => void;

/**
 * Transport Factory - creates transport instances
 */
export type TransportFactory = {
  create(config: TransportConfig): Transport;
  supportedTypes(): TransportType[];
}

/**
 * Connection Information - details about a connection
 */
export type ConnectionInfo = {
  id: string;
  agentId?: string;
  transportType: TransportType;
  endpoint: string;
  connectedAt: string; // ISO8601
  lastActivity: string; // ISO8601
  messageCount: number;
  bytesReceived: number;
  bytesSent: number;
}

export const ConnectionInfoSchema = z.object({
  id: z.string(),
  agentId: z.string().optional(),
  transportType: TransportTypeSchema,
  endpoint: z.string(),
  connectedAt: z.string().datetime(),
  lastActivity: z.string().datetime(),
  messageCount: z.number(),
  bytesReceived: z.number(),
  bytesSent: z.number(),
});

/**
 * Transport Statistics - transport performance metrics
 */
export type TransportStats = {
  type: TransportType;
  uptime: number; // milliseconds
  messagesSent: number;
  messagesReceived: number;
  bytesSent: number;
  bytesReceived: number;
  errors: number;
  reconnections: number;
  averageLatency: number; // milliseconds
  lastError?: string;
}

export const TransportStatsSchema = z.object({
  type: TransportTypeSchema,
  uptime: z.number(),
  messagesSent: z.number(),
  messagesReceived: z.number(),
  bytesSent: z.number(),
  bytesReceived: z.number(),
  errors: z.number(),
  reconnections: z.number(),
  averageLatency: z.number(),
  lastError: z.string().optional(),
});

/**
 * Transport Manager Interface
 */
export type TransportManager = {
  registerTransport(type: TransportType, factory: TransportFactory): void;
  createTransport(config: TransportConfig): Promise<Transport>;
  getTransport(agentId: string): Transport | null;
  removeTransport(agentId: string): Promise<void>;
  listTransports(): ConnectionInfo[];
  getStats(agentId?: string): TransportStats[];
}

/**
 * Helper functions
 */
export function createTransportConfig(
  type: TransportType,
  endpoint?: string,
  options?: Partial<TransportConfig>
): TransportConfig {
  return {
    type,
    endpoint,
    ...options,
  };
}

export function createHTTPTransportConfig(
  port?: number,
  host?: string,
  options?: Partial<HTTPTransportConfig>
): HTTPTransportConfig {
  return {
    type: TransportType.HTTP,
    port,
    host,
    ...options,
  };
}

export function createWebSocketTransportConfig(
  port?: number,
  host?: string,
  options?: Partial<WebSocketTransportConfig>
): WebSocketTransportConfig {
  return {
    type: TransportType.WEBSOCKET,
    port,
    host,
    ...options,
  };
}

export function createMessageQueueTransportConfig(
  provider: MessageQueueTransportConfig['provider'],
  connectionString?: string,
  options?: Partial<MessageQueueTransportConfig>
): MessageQueueTransportConfig {
  return {
    type: TransportType.MESSAGE_QUEUE,
    provider,
    connectionString,
    ...options,
  };
}

export function createRateLimitConfig(
  windowMs: number,
  maxRequests: number,
  options?: Partial<RateLimitConfig>
): RateLimitConfig {
  return {
    windowMs,
    maxRequests,
    ...options,
  };
}

export function createHeartbeatConfig(
  interval: number,
  timeout: number,
  maxMissed: number
): HeartbeatConfig {
  return { interval, timeout, maxMissed };
}

export function createConnectionInfo(
  id: string,
  transportType: TransportType,
  endpoint: string,
  options?: Partial<ConnectionInfo>
): ConnectionInfo {
  const now = new Date().toISOString();
  return {
    id,
    transportType,
    endpoint,
    connectedAt: now,
    lastActivity: now,
    messageCount: 0,
    bytesReceived: 0,
    bytesSent: 0,
    ...options,
  };
}

export function createTransportStats(
  type: TransportType,
  options?: Partial<TransportStats>
): TransportStats {
  return {
    type,
    uptime: 0,
    messagesSent: 0,
    messagesReceived: 0,
    bytesSent: 0,
    bytesReceived: 0,
    errors: 0,
    reconnections: 0,
    averageLatency: 0,
    ...options,
  };
}