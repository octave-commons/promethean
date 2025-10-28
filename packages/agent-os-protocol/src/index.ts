/**
 * Agent OS Core Message Protocol - Main Export
 *
 * Provides unified access to all protocol components
 */

export {
  // Core Types
  MessageFactory,
  DefaultMessageProcessor,
  MessageValidator,
  MessageSerializer,
  MessageBuilder,
  type MessageProcessor,

  // Security Types
  SecurityContext,
  MessageSignature,
  Encryption,
  Capability,

  // Transport Types
  Transport,
  TransportConfig,
  Connection,
  ConnectionMetrics,
  FlowControlConfig,
  FlowControlStatus,

  // Service Mesh Types
  AgentAddress,
  ServiceQuery,
  AgentInstance,
  HealthStatus,
  LoadBalancingStrategy,

  // Observability Types
  TraceContext,
  Span,

  // Error Types
  ProtocolError,
  ValidationError,
  SecurityError,
  TransportError,
};

// Core Message Types
export type {
  CoreMessage,
  MessageType,
  Priority,
  QoSLevel,
  MessagePayload,
  MessageMetadata,
  AgentAddress,
  SecurityContext,
  MessageSignature,
  Encryption,
  Capability,
  TransportConfig,
  Connection,
  ConnectionMetrics,
  FlowControlConfig,
  FlowControlStatus,
  HealthStatus,
  ServiceQuery,
  AgentInstance,
  LoadBalancingStrategy,
  TraceContext,
  Span,
};

// Security Types
export type { SecurityContext, MessageSignature, Encryption, Capability };

// Transport Types
export type {
  Transport,
  TransportConfig,
  Connection,
  ConnectionMetrics,
  FlowControlConfig,
  FlowControlStatus,
};

// Service Mesh Types
export type { AgentAddress, ServiceQuery, AgentInstance, HealthStatus, LoadBalancingStrategy };

// Observability Types
export type { TraceContext, Span };

// Error Types
export { ProtocolError, ValidationError, SecurityError, TransportError };

// ============================================================================
// LEGACY EXPORTS
// ============================================================================

export {
  // Legacy exports for backward compatibility
  MessageProcessor as DefaultMessageProcessor,
  MessageValidator as MessageValidator,
  MessageSerializer as MessageSerializer,
};

// ============================================================================
// CONVENIENCE HELPERS
// ============================================================================

export const createMessage = MessageFactory.createMessage;
export const validateMessage = MessageValidator.validate;
export const serializeMessage = MessageSerializer.serialize;
export const createRequest = MessageFactory.createRequest;
export const createResponse = MessageFactory.createResponse;
export const createEvent = MessageFactory.createEvent;
export const createError = MessageFactory.createError;

export {
  MessageFactory,
  DefaultMessageProcessor,
  MessageValidator,
  MessageSerializer,
  MessageBuilder,
  type MessageProcessor,
};
