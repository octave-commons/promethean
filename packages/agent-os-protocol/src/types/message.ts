/**
 * Core Message Types for Agent OS Protocol
 * 
 * Extends MCP JSON-RPC 2.0 with agent-specific fields and capabilities.
 */

import { z } from 'zod';
import type { AgentIdentifier, MessagePriority } from './agent.js';
import type { AsyncContext } from './async.js';

/**
 * Base Agent OS Message Structure
 * All Agent OS messages extend the standard MCP JSON-RPC 2.0 format
 */
export interface AgentOSMessage {
  // Standard JSON-RPC 2.0 fields
  jsonrpc: '2.0';
  id?: string | number | null;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };

  // Agent OS extensions
  aosVersion?: string;
  sourceAgent?: AgentIdentifier;
  targetAgent?: AgentIdentifier;
  priority?: MessagePriority;
  timestamp?: string; // ISO8601
  correlationId?: string;
  asyncContext?: AsyncContext;
}

/**
 * Message validation schema
 */
export const AgentOSMessageSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number(), z.null()]).optional(),
  method: z.string().optional(),
  params: z.unknown().optional(),
  result: z.unknown().optional(),
  error: z.object({
    code: z.number(),
    message: z.string(),
    data: z.unknown().optional(),
  }).optional(),

  // Agent OS extensions
  aosVersion: z.string().optional(),
  sourceAgent: z.any().optional(), // AgentIdentifier - circular reference
  targetAgent: z.any().optional(), // AgentIdentifier - circular reference
  priority: z.enum(['critical', 'high', 'normal', 'low', 'background']).optional(),
  timestamp: z.string().datetime().optional(),
  correlationId: z.string().optional(),
  asyncContext: z.any().optional(), // AsyncContext - circular reference
});

/**
 * Message creation helpers
 */
export class MessageBuilder {
  private message: Partial<AgentOSMessage> = {
    jsonrpc: '2.0',
    timestamp: new Date().toISOString(),
  };

  static create(): MessageBuilder {
    return new MessageBuilder();
  }

  id(id: string | number): MessageBuilder {
    this.message.id = id;
    return this;
  }

  method(method: string): MessageBuilder {
    this.message.method = method;
    return this;
  }

  params(params: unknown): MessageBuilder {
    this.message.params = params;
    return this;
  }

  result(result: unknown): MessageBuilder {
    this.message.result = result;
    return this;
  }

  error(code: number, message: string, data?: unknown): MessageBuilder {
    this.message.error = { code, message, data };
    return this;
  }

  aosVersion(version: string): MessageBuilder {
    this.message.aosVersion = version;
    return this;
  }

  sourceAgent(agent: AgentIdentifier): MessageBuilder {
    this.message.sourceAgent = agent;
    return this;
  }

  targetAgent(agent: AgentIdentifier): MessageBuilder {
    this.message.targetAgent = agent;
    return this;
  }

  priority(priority: MessagePriority): MessageBuilder {
    this.message.priority = priority;
    return this;
  }

  correlationId(id: string): MessageBuilder {
    this.message.correlationId = id;
    return this;
  }

  asyncContext(context: AsyncContext): MessageBuilder {
    this.message.asyncContext = context;
    return this;
  }

  build(): AgentOSMessage {
    if (!this.message.method && !this.message.result && !this.message.error) {
      throw new Error('Message must have either method, result, or error');
    }
    return this.message as AgentOSMessage;
  }
}

/**
 * Message type guards
 */
export function isRequest(message: AgentOSMessage): message is AgentOSMessage & { method: string; id: string | number } {
  return message.method !== undefined && message.id !== undefined && message.id !== null;
}

export function isResponse(message: AgentOSMessage): message is AgentOSMessage & { result?: unknown; error?: { code: number; message: string } } {
  return (message.result !== undefined || message.error !== undefined) && message.id !== undefined;
}

export function isNotification(message: AgentOSMessage): message is AgentOSMessage & { method: string } {
  return message.method !== undefined && (message.id === undefined || message.id === null);
}

/**
 * Message validation
 */
export function validateMessage(message: unknown): AgentOSMessage {
  return AgentOSMessageSchema.parse(message);
}

/**
 * Message serialization helpers
 */
export function serializeMessage(message: AgentOSMessage): string {
  return JSON.stringify(message);
}

export function deserializeMessage(data: string): AgentOSMessage {
  try {
    const parsed = JSON.parse(data);
    return validateMessage(parsed);
  } catch (error) {
    throw new Error(`Invalid message format: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}