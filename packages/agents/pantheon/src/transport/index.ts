/**
 * Pantheon Transport Layer - Module Exports
 *
 * This module provides unified transport functionality consolidating:
 * - AMQP transport for message queuing
 * - WebSocket transport for real-time communication
 * - Message envelope handling and validation
 * - Transport base classes and utilities
 */

// ============================================================================
// Core Transport Types
// ============================================================================

export * from './types.js';

// ============================================================================
// Transport Implementations
// ============================================================================

export { BaseTransport, MemoryDeadLetterQueue } from './base-transport.js';
export { AMQPTransport } from './amqp/amqp-transport.js';
export { WebSocketTransport } from './websocket/websocket-transport.js';

// ============================================================================
// Message Envelope Utilities
// ============================================================================

export { EnvelopeBuilder } from './envelope/envelope-builder.js';
export { MessageSigner } from './envelope/message-signer.js';
export { MessageValidator } from './envelope/message-validator.js';

// ============================================================================
// Convenience Exports
// ============================================================================

// Re-export commonly used transport classes
export {
  // Transport interfaces
  Transport,
  MessageHandler,
  MessageProtocol,
  DeadLetterQueue,

  // Configuration types
  TransportConfig,
  MessageEnvelope,
  TransportRetryPolicy,

  // Metrics types
  MessageMetrics,
  ProtocolMetrics,
} from './types.js';

// ============================================================================
// Transport Factory
// ============================================================================

import { TransportConfig, Transport } from './types.js';
import { AMQPTransport } from './amqp/amqp-transport.js';
import { WebSocketTransport } from './websocket/websocket-transport.js';

/**
 * Factory function to create transport instances based on configuration
 */
export function createTransport(config: TransportConfig): Transport {
  switch (config.type) {
    case 'amqp':
      return new AMQPTransport(config);
    case 'websocket':
      return new WebSocketTransport(config);
    default:
      throw new Error(`Unsupported transport type: ${config.type}`);
  }
}

/**
 * Create AMQP transport with default configuration
 */
export function createAMQPTransport(url: string, options?: any): AMQPTransport {
  const config: TransportConfig = {
    type: 'amqp',
    url,
    options: options || {},
    auth: { type: 'none' },
    reconnect: {
      enabled: true,
      maxAttempts: 5,
      delay: 1000,
      backoff: 'exponential',
    },
  };
  return new AMQPTransport(config);
}

/**
 * Create WebSocket transport with default configuration
 */
export function createWebSocketTransport(
  url: string,
  options?: any
): WebSocketTransport {
  const config: TransportConfig = {
    type: 'websocket',
    url,
    options: options || {},
    auth: { type: 'none' },
    reconnect: {
      enabled: true,
      maxAttempts: 5,
      delay: 1000,
      backoff: 'exponential',
    },
  };
  return new WebSocketTransport(config);
}
