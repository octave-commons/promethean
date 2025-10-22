/**
 * Agent OS Core Message Protocol
 * 
 * A comprehensive communication framework for Agent OS that extends MCP JSON-RPC 2.0
 * with agent-specific capabilities for discovery, job queues, routing, events, and async operations.
 */

export * from './types/index.js';
export * from './protocol/index.js';
export * from './transport/index.js';
export * from './router/index.js';
export * from './job-queue/index.js';
export * from './events/index.js';
export * from './security/index.js';
export * from './registry/index.js';

// Version information
export const AOS_VERSION = '1.0.0';
export const PROTOCOL_VERSION = '2.0'; // Compatible with MCP JSON-RPC 2.0