/**
 * Core Message Implementation
 *
 * Implements the CoreMessage type with validation, serialization,
 * and protocol operations using functional programming patterns.
 */

import {
  CoreMessage,
  MessageType,
  Priority,
  QoSLevel,
  MessagePayloadSchema,
  MessageMetadataSchema,
  AgentAddress,
  createCoreMessage,
  validateMessage,
  ProtocolError,
  ValidationError,
} from '../types/index.js';

// ============================================================================
// MESSAGE FACTORY FUNCTIONS
// ============================================================================

export const createMessage = (params: {
  type: MessageType;
  sender: AgentAddress;
  recipient: AgentAddress;
  payload: unknown;
  priority?: Priority;
  qos?: QoSLevel;
}): CoreMessage => {
  const now = new Date().toISOString();

  return createCoreMessage({
    id: randomUUID(),
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
};

export const createRequest = (params: {
  sender: AgentAddress;
  recipient: AgentAddress;
  data: unknown;
  priority?: Priority;
}): CoreMessage => {
  return createMessage({
    type: 'REQUEST',
    sender: params.sender,
    recipient: params.recipient,
    payload: params.data,
    priority: params.priority || 'NORMAL',
  });
};

export const createResponse = (params: {
  sender: AgentAddress;
  recipient: AgentAddress;
  data: unknown;
  correlationId: string;
  priority?: Priority;
}): CoreMessage => {
  const message = createMessage({
    type: 'RESPONSE',
    sender: params.sender,
    recipient: params.recipient,
    payload: params.data,
    priority: params.priority || 'NORMAL',
  });

  return {
    ...message,
    correlationId: params.correlationId,
  };
};

export const createEvent = (params: {
  sender: AgentAddress;
  recipient?: AgentAddress;
  data: unknown;
  priority?: Priority;
}): CoreMessage => {
  return createMessage({
    type: 'EVENT',
    sender: params.sender,
    recipient: params.recipient || {
      id: 'broadcast',
      namespace: 'system',
      domain: 'global',
    },
    payload: params.data,
    priority: params.priority || 'NORMAL',
  });
};

export const createError = (params: {
  sender: AgentAddress;
  recipient: AgentAddress;
  error: Error | string;
  correlationId?: string;
  priority?: Priority;
}): CoreMessage => {
  const errorData =
    params.error instanceof Error
      ? { message: params.error.message, stack: params.error.stack }
      : { message: params.error };

  const message = createMessage({
    type: 'ERROR',
    sender: params.sender,
    recipient: params.recipient,
    payload: errorData,
    priority: params.priority || 'HIGH',
  });

  return {
    ...message,
    correlationId: params.correlationId,
  };
};

// ============================================================================
// MESSAGE PROCESSOR FUNCTIONS
// ============================================================================

export type MessageProcessor = {
  process(message: CoreMessage): Promise<CoreMessage | null>;
};

export const createDefaultMessageProcessor = (): MessageProcessor => ({
  async process(message: CoreMessage): Promise<CoreMessage | null> {
    if (!validateMessage(message)) {
      throw new ValidationError('Invalid message format');
    }

    switch (message.type) {
      case 'REQUEST':
        return processRequest(message);
      case 'RESPONSE':
        return processResponse(message);
      case 'EVENT':
        return processEvent(message);
      case 'ERROR':
        return processError(message);
      default:
        return null;
    }
  },
});

const processRequest = async (message: CoreMessage): Promise<CoreMessage | null> => {
  return createResponse({
    sender: message.recipient,
    recipient: message.sender,
    data: { status: 'received', timestamp: new Date().toISOString() },
    correlationId: message.id,
  });
};

const processResponse = async (message: CoreMessage): Promise<CoreMessage | null> => {
  console.log(`Received response for ${message.correlationId}`);
  return null;
};

const processEvent = async (message: CoreMessage): Promise<CoreMessage | null> => {
  console.log(`Received event: ${message.payload.type}`);
  return null;
};

const processError = async (message: CoreMessage): Promise<CoreMessage | null> => {
  console.error(`Received error: ${message.payload.data}`);
  return null;
};

// ============================================================================
// MESSAGE VALIDATION FUNCTIONS
// ============================================================================

export const validateMessageStructure = (
  message: CoreMessage,
): { valid: boolean; errors: string[] } => {
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
  if (message.sender && !validateAddress(message.sender)) {
    errors.push('Invalid sender address');
  }

  if (message.recipient && !validateAddress(message.recipient)) {
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
};

const validateAddress = (address: AgentAddress): boolean => {
  return !!(address.id && address.namespace && address.domain);
};

// ============================================================================
// MESSAGE SERIALIZATION FUNCTIONS
// ============================================================================

export const serializeMessage = (message: CoreMessage): Uint8Array => {
  try {
    const jsonString = JSON.stringify(message);
    return new TextEncoder().encode(jsonString);
  } catch (error) {
    throw new ProtocolError('Failed to serialize message', 'SERIALIZATION_ERROR', { error });
  }
};

export const deserializeMessage = (data: Uint8Array): CoreMessage => {
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
};

export const serializeMessageToString = (message: CoreMessage): string => {
  return JSON.stringify(message, null, 2);
};

export const deserializeMessageFromString = (jsonString: string): CoreMessage => {
  try {
    const message = JSON.parse(jsonString);

    if (!validateMessage(message)) {
      throw new ValidationError('Invalid message format during string deserialization');
    }

    return message;
  } catch (error) {
    throw new ProtocolError('Failed to deserialize message from string', 'DESERIALIZATION_ERROR', {
      error,
    });
  }
};

// ============================================================================
// MESSAGE BUILDER FUNCTIONS
// ============================================================================

export const createMessageBuilder = (type: MessageType) => {
  const message: Partial<CoreMessage> = {
    type,
    id: randomUUID(),
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  };

  return {
    sender: (address: AgentAddress) => {
      message.sender = address;
      return builder;
    },
    recipient: (address: AgentAddress) => {
      message.recipient = address;
      return builder;
    },
    replyTo: (address: AgentAddress) => {
      message.replyTo = address;
      return builder;
    },
    correlationId: (id: string) => {
      message.correlationId = id;
      return builder;
    },
    payload: (data: unknown, type: string = 'json') => {
      message.payload = MessagePayloadSchema.parse({
        type,
        data,
        encoding: 'json',
        compression: 'none',
        size: JSON.stringify(data).length,
      });
      return builder;
    },
    metadata: (metadata: Partial<CoreMessage['metadata']>) => {
      message.metadata = MessageMetadataSchema.parse({
        source: 'agent-os-protocol',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        tags: [],
        custom: {},
        ...metadata,
      });
      return builder;
    },
    headers: (headers: Record<string, string>) => {
      message.headers = { ...message.headers, ...headers };
      return builder;
    },
    priority: (priority: Priority) => {
      message.priority = priority;
      return builder;
    },
    qos: (level: QoSLevel) => {
      message.qos = level;
      return builder;
    },
    ttl: (milliseconds: number) => {
      message.ttl = milliseconds;
      return builder;
    },
    signature: (signature: CoreMessage['signature']) => {
      message.signature = signature;
      return builder;
    },
    capabilities: (capabilities: string[]) => {
      message.capabilities = capabilities;
      return builder;
    },
    token: (token: string) => {
      message.token = token;
      return builder;
    },
    retryPolicy: (policy: CoreMessage['retryPolicy']) => {
      message.retryPolicy = policy;
      return builder;
    },
    deadline: (deadline: string) => {
      message.deadline = deadline;
      return builder;
    },
    traceId: (traceId: string) => {
      message.traceId = traceId;
      return builder;
    },
    spanId: (spanId: string) => {
      message.spanId = spanId;
      return builder;
    },
    build: (): CoreMessage => {
      const finalMessage = message as CoreMessage;

      if (!validateMessage(finalMessage)) {
        throw new ValidationError('Invalid message configuration');
      }

      return finalMessage;
    },
  };
};

const builder = createMessageBuilder('REQUEST');

// ============================================================================
// LEGACY EXPORTS FOR BACKWARD COMPATIBILITY
// ============================================================================

export const MessageFactory = {
  createMessage,
  createRequest,
  createResponse,
  createEvent,
  createError,
};

export const DefaultMessageProcessor = createDefaultMessageProcessor();
export const MessageValidator = {
  validate: validateMessageStructure,
};
export const MessageSerializer = {
  serialize: serializeMessage,
  deserialize: deserializeMessage,
  serializeToString: serializeMessageToString,
  deserializeFromString: deserializeMessageFromString,
};
export const MessageBuilder = {
  create: createMessageBuilder,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const randomUUID = (): string => {
  return crypto.randomUUID();
};
