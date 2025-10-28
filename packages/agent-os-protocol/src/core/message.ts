/**
 * Core Message Implementation
 *
 * Implements the CoreMessage interface with validation, serialization,
 * and protocol operations.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  CoreMessage,
  MessageType,
  Priority,
  QoSLevel,
  MessagePayload,
  MessageMetadata,
  MessageSignature,
  Encryption,
  AgentAddress,
  createCoreMessage,
  validateMessage,
  ProtocolError,
  ValidationError,
} from '../types/index.js';

// ============================================================================
// MESSAGE FACTORY
// ============================================================================

export class MessageFactory {
  /**
   * Create a new CoreMessage with required fields
   */
  static createMessage(params: {
    type: MessageType;
    sender: AgentAddress;
    recipient: AgentAddress;
    payload: unknown;
    priority?: Priority;
    qos?: QoSLevel;
  }): CoreMessage {
    const now = new Date().toISOString();

    return createCoreMessage({
      id: uuidv4(),
      version: '1.0.0',
      type: params.type,
      timestamp: now,
      sender: params.sender,
      recipient: params.recipient,
      payload: MessagePayloadSchema.parse({
        type: typeof params.payload === 'string' ? 'text' : 'json',
        data: params.payload,
        encoding: 'json',
        compression: 'none',
        size: JSON.stringify(params.payload).length,
      }),
      metadata: MessageMetadataSchema.parse({
        source: 'agent-os-protocol',
        version: '1.0.0',
        timestamp: now,
        tags: [],
        custom: {},
      }),
      headers: {},
      priority: params.priority || 'NORMAL',
      qos: params.qos || 'AT_LEAST_ONCE',
    });
  }

  /**
   * Create a request message
   */
  static createRequest(params: {
    sender: AgentAddress;
    recipient: AgentAddress;
    data: unknown;
    priority?: Priority;
  }): CoreMessage {
    return this.createMessage({
      ...params,
      type: 'REQUEST',
    });
  }

  /**
   * Create a response message
   */
  static createResponse(params: {
    sender: AgentAddress;
    recipient: AgentAddress;
    data: unknown;
    correlationId: string;
    priority?: Priority;
  }): CoreMessage {
    return this.createMessage({
      ...params,
      type: 'RESPONSE',
      correlationId,
    });
  }

  /**
   * Create an event message
   */
  static createEvent(params: {
    sender: AgentAddress;
    recipient?: AgentAddress;
    data: unknown;
    priority?: Priority;
  }): CoreMessage {
    return this.createMessage({
      ...params,
      type: 'EVENT',
      recipient: params.recipient || {
        id: 'broadcast',
        namespace: 'system',
        domain: 'global',
      },
    });
  }

  /**
   * Create an error message
   */
  static createError(params: {
    sender: AgentAddress;
    recipient: AgentAddress;
    error: Error | string;
    correlationId?: string;
    priority?: Priority;
  }): CoreMessage {
    const errorData =
      params.error instanceof Error
        ? { message: params.error.message, stack: params.error.stack }
        : { message: params.error };

    return this.createMessage({
      ...params,
      type: 'ERROR',
      data: errorData,
      correlationId: params.correlationId,
      priority: params.priority || 'HIGH',
    });
  }
}

// ============================================================================
// MESSAGE PROCESSOR
// ============================================================================

export interface MessageProcessor {
  process(message: CoreMessage): Promise<CoreMessage | null>;
}

export class DefaultMessageProcessor implements MessageProcessor {
  async process(message: CoreMessage): Promise<CoreMessage | null> {
    if (!validateMessage(message)) {
      throw new ValidationError('Invalid message format');
    }

    switch (message.type) {
      case 'REQUEST':
        return this.processRequest(message);
      case 'RESPONSE':
        return this.processResponse(message);
      case 'EVENT':
        return this.processEvent(message);
      case 'ERROR':
        return this.processError(message);
      default:
        return null;
    }
  }

  protected async processRequest(message: CoreMessage): Promise<CoreMessage | null> {
    // Default request processing - can be overridden
    return MessageFactory.createResponse({
      sender: message.recipient,
      recipient: message.sender,
      data: { status: 'received', timestamp: new Date().toISOString() },
      correlationId: message.id,
    });
  }

  protected async processResponse(message: CoreMessage): Promise<CoreMessage | null> {
    // Default response processing - can be overridden
    console.log(`Received response for ${message.correlationId}`);
    return null;
  }

  protected async processEvent(message: CoreMessage): Promise<CoreMessage | null> {
    // Default event processing - can be overridden
    console.log(`Received event: ${message.payload.type}`);
    return null;
  }

  protected async processError(message: CoreMessage): Promise<CoreMessage | null> {
    // Default error processing - can be overridden
    console.error(`Received error: ${message.payload.data}`);
    return null;
  }
}

// ============================================================================
// MESSAGE VALIDATOR
// ============================================================================

export class MessageValidator {
  static validate(message: CoreMessage): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required field validation
    if (!message.id) errors.push('Message ID is required');
    if (!message.type) errors.push('Message type is required');
    if (!message.sender) errors.push('Sender is required');
    if (!message.recipient) errors.push('Recipient is required');
    if (!message.payload) errors.push('Payload is required');

    // Type-specific validation
    if (message.type === 'REQUEST' && !message.payload.data) {
      errors.push('Request messages must have data in payload');
    }

    if (message.type === 'RESPONSE' && !message.correlationId) {
      errors.push('Response messages must have correlation ID');
    }

    // Address validation
    if (message.sender && !this.validateAddress(message.sender)) {
      errors.push('Invalid sender address');
    }

    if (message.recipient && !this.validateAddress(message.recipient)) {
      errors.push('Invalid recipient address');
    }

    // Timestamp validation
    if (message.timestamp) {
      const timestamp = new Date(message.timestamp);
      if (isNaN(timestamp.getTime())) {
        errors.push('Invalid timestamp format');
      }
    }

    // QoS validation
    if (message.ttl && message.ttl < 0) {
      errors.push('TTL must be positive');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private static validateAddress(address: AgentAddress): boolean {
    return !!(address.id && address.namespace && address.domain);
  }
}

// ============================================================================
// MESSAGE SERIALIZER
// ============================================================================

export class MessageSerializer {
  static serialize(message: CoreMessage): Uint8Array {
    try {
      const jsonString = JSON.stringify(message);
      return new TextEncoder().encode(jsonString);
    } catch (error) {
      throw new ProtocolError('Failed to serialize message', 'SERIALIZATION_ERROR', { error });
    }
  }

  static deserialize(data: Uint8Array): CoreMessage {
    try {
      const jsonString = new TextDecoder().decode(data);
      const message = JSON.parse(jsonString);

      if (!validateMessage(message)) {
        throw new ValidationError('Invalid message format during deserialization');
      }

      return message;
    } catch (error) {
      throw new ProtocolError('Failed to deserialize message', 'DESERIALIZATION_ERROR', { error });
    }
  }

  static serializeToString(message: CoreMessage): string {
    return JSON.stringify(message, null, 2);
  }

  static deserializeFromString(jsonString: string): CoreMessage {
    try {
      const message = JSON.parse(jsonString);

      if (!validateMessage(message)) {
        throw new ValidationError('Invalid message format during string deserialization');
      }

      return message;
    } catch (error) {
      throw new ProtocolError(
        'Failed to deserialize message from string',
        'DESERIALIZATION_ERROR',
        { error },
      );
    }
  }
}

// ============================================================================
// MESSAGE BUILDER
// ============================================================================

export class MessageBuilder {
  private message: Partial<CoreMessage> = {};

  constructor(type: MessageType) {
    this.message.type = type;
    this.message.id = uuidv4();
    this.message.version = '1.0.0';
    this.message.timestamp = new Date().toISOString();
  }

  sender(address: AgentAddress): this {
    this.message.sender = address;
    return this;
  }

  recipient(address: AgentAddress): this {
    this.message.recipient = address;
    return this;
  }

  replyTo(address: AgentAddress): this {
    this.message.replyTo = address;
    return this;
  }

  correlationId(id: string): this {
    this.message.correlationId = id;
    return this;
  }

  payload(data: unknown, type: string = 'json'): this {
    this.message.payload = MessagePayloadSchema.parse({
      type,
      data,
      encoding: 'json',
      compression: 'none',
      size: JSON.stringify(data).length,
    });
    return this;
  }

  metadata(metadata: Partial<MessageMetadata>): this {
    this.message.metadata = MessageMetadataSchema.parse({
      source: 'agent-os-protocol',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      tags: [],
      custom: {},
      ...metadata,
    });
    return this;
  }

  headers(headers: Record<string, string>): this {
    this.message.headers = { ...this.message.headers, ...headers };
    return this;
  }

  priority(priority: Priority): this {
    this.message.priority = priority;
    return this;
  }

  qos(level: QoSLevel): this {
    this.message.qos = level;
    return this;
  }

  ttl(milliseconds: number): this {
    this.message.ttl = milliseconds;
    return this;
  }

  signature(signature: MessageSignature): this {
    this.message.signature = signature;
    return this;
  }

  capabilities(capabilities: string[]): this {
    this.message.capabilities = capabilities;
    return this;
  }

  token(token: string): this {
    this.message.token = token;
    return this;
  }

  retryPolicy(policy: CoreMessage['retryPolicy']): this {
    this.message.retryPolicy = policy;
    return this;
  }

  deadline(deadline: string): this {
    this.message.deadline = deadline;
    return this;
  }

  traceId(traceId: string): this {
    this.message.traceId = traceId;
    return this;
  }

  spanId(spanId: string): this {
    this.message.spanId = spanId;
    return this;
  }

  build(): CoreMessage {
    const message = this.message as CoreMessage;

    if (!validateMessage(message)) {
      throw new ValidationError('Invalid message configuration');
    }

    return message;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  MessageFactory,
  DefaultMessageProcessor,
  MessageValidator,
  MessageSerializer,
  MessageBuilder,
  type MessageProcessor,
};
