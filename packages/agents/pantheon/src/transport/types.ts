import { z } from 'zod';

// Re-export core types from pantheon core
export {
  CoreMessage,
  MessageType,
  AgentAddress,
  Priority,
  QoSLevel,
  MessagePayload,
  MessageMetadata,
  RetryPolicy,
  BackoffStrategy,
} from '../core/types';

// Legacy transport types for compatibility
export const MessageEnvelopeSchema = z.object({
  id: z.string(),
  type: z.string(),
  sender: z.string(),
  recipient: z.string(),
  timestamp: z.date(),
  payload: z.record(z.any()),
  signature: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  correlationId: z.string().optional(),
  replyTo: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  ttl: z.number().optional(), // Time to live in milliseconds
  retryCount: z.number().default(0),
  maxRetries: z.number().default(3),
});

export const TransportConfigSchema = z.object({
  type: z.enum(['amqp', 'websocket', 'http']),
  url: z.string(),
  options: z.record(z.any()).optional(),
  auth: z
    .object({
      type: z.enum(['none', 'basic', 'token', 'certificate']),
      credentials: z.record(z.any()).optional(),
    })
    .default({ type: 'none' }),
  reconnect: z
    .object({
      enabled: z.boolean().default(true),
      maxAttempts: z.number().default(5),
      delay: z.number().default(1000),
      backoff: z.enum(['linear', 'exponential']).default('exponential'),
    })
    .default({}),
  queue: z
    .object({
      name: z.string(),
      durable: z.boolean().default(true),
      exclusive: z.boolean().default(false),
      autoDelete: z.boolean().default(false),
      arguments: z.record(z.any()).optional(),
    })
    .optional(),
});

export type MessageEnvelope = z.infer<typeof MessageEnvelopeSchema>;
export type TransportConfig = z.infer<typeof TransportConfigSchema>;

export interface Transport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(envelope: MessageEnvelope): Promise<void>;
  subscribe(pattern: string, handler: MessageHandler): Promise<void>;
  unsubscribe(pattern: string): Promise<void>;
  isConnected(): boolean;
}

export type MessageHandler = (
  envelope: MessageEnvelope
) => Promise<void | MessageEnvelope>;

export interface MessageProtocol {
  send(
    message: Omit<MessageEnvelope, 'id' | 'timestamp' | 'signature'>
  ): Promise<string>;
  sendAndWait(
    message: Omit<MessageEnvelope, 'id' | 'timestamp' | 'signature'>,
    timeout?: number
  ): Promise<MessageEnvelope>;
  subscribe(pattern: string, handler: MessageHandler): Promise<void>;
  unsubscribe(pattern: string): Promise<void>;
  signMessage(envelope: MessageEnvelope, secretKey: string): MessageEnvelope;
  verifySignature(envelope: MessageEnvelope, publicKey: string): boolean;
}

export interface DeadLetterQueue {
  addMessage(envelope: MessageEnvelope, error: Error): Promise<void>;
  getMessages(limit?: number): Promise<MessageEnvelope[]>;
  requeue(messageId: string): Promise<void>;
  deleteMessage(messageId: string): Promise<void>;
}

export interface MessageMetrics {
  sent: number;
  received: number;
  failed: number;
  retried: number;
  deadLettered: number;
  averageLatency: number;
  lastActivity: Date;
}

export interface ProtocolMetrics {
  getMessageMetrics(): Promise<MessageMetrics>;
  getTransportMetrics(): Promise<Record<string, any>>;
  resetMetrics(): Promise<void>;
}
