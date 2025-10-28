/**
 * Agent OS Core Message Protocol - Main Export
 *
 * Provides unified access to all protocol components
 */

// Re-export everything from types
export * from './types/index.js';

// Re-export core message functionality
export {
  createMessage,
  createRequest,
  createResponse,
  createEvent,
  createError,
  createDefaultMessageProcessor,
  validateMessageStructure,
  serializeMessage,
  deserializeMessage,
  serializeMessageToString,
  deserializeMessageFromString,
  createMessageBuilder,
  MessageFactory,
  DefaultMessageProcessor,
  MessageValidator,
  MessageSerializer,
  MessageBuilder,
  type MessageProcessor,
} from './core/message.js';

// Re-export HTTP transport
export {
  HttpTransport,
  createHttpTransport,
  isHttpTransport,
  type HttpTransportConfig,
  type HttpConnection,
} from './transports/http-transport.js';

// ============================================================================
// CONVENIENCE HELPERS
// ============================================================================

import { MessageValidator, MessageFactory } from './core/message.js';

export const validateMessage = (message: unknown) => {
  try {
    return MessageValidator.validate(message);
  } catch {
    return false;
  }
};

export const createRequestMessage = MessageFactory.createRequest;
export const createResponseMessage = MessageFactory.createResponse;
export const createEventMessage = MessageFactory.createEvent;
export const createErrorMessage = MessageFactory.createError;
