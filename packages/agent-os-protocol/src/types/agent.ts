/**
 * Agent Identification and Capability Types
 */

import { z } from 'zod';

/**
 * Agent Identifier - uniquely identifies an agent in the ecosystem
 */
export type AgentIdentifier = {
  id: string;
  type: AgentType;
  version: string;
  capabilities: AgentCapability[];
}

export const AgentIdentifierSchema = z.object({
  id: z.string(),
  type: AgentTypeSchema,
  version: z.string(),
  capabilities: z.array(AgentCapabilitySchema),
});

/**
 * Agent Types - classification of agent roles
 */
export enum AgentType {
  WORKER = 'worker',
  COORDINATOR = 'coordinator',
  ORCHESTRATOR = 'orchestrator',
  PROXY = 'proxy',
  GATEWAY = 'gateway',
}

export const AgentTypeSchema = z.nativeEnum(AgentType);

/**
 * Agent Capabilities - what an agent can do
 */
export enum AgentCapability {
  TOOLS = 'tools',
  RESOURCES = 'resources',
  PROMPTS = 'prompts',
  SAMPLING = 'sampling',
  JOB_QUEUE = 'job_queue',
  ROUTING = 'routing',
  PERSISTENCE = 'persistence',
}

export const AgentCapabilitySchema = z.nativeEnum(AgentCapability);

/**
 * Message Priority levels
 */
export enum MessagePriority {
  CRITICAL = 0,
  HIGH = 1,
  NORMAL = 2,
  LOW = 3,
  BACKGROUND = 4,
}

export const MessagePrioritySchema = z.nativeEnum(MessagePriority);

/**
 * Agent Status - current operational state
 */
export enum AgentStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  BUSY = 'busy',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
}

export const AgentStatusSchema = z.nativeEnum(AgentStatus);

/**
 * Agent Information - detailed agent metadata
 */
export type AgentInfo = {
  identifier: AgentIdentifier;
  status: AgentStatus;
  endpoints: AgentEndpoint[];
  metadata: Record<string, unknown>;
}

export const AgentInfoSchema = z.object({
  identifier: AgentIdentifierSchema,
  status: AgentStatusSchema,
  endpoints: z.array(AgentEndpointSchema),
  metadata: z.record(z.unknown()),
});

/**
 * Agent Endpoint - how to connect to an agent
 */
export type AgentEndpoint = {
  type: 'mcp' | 'http' | 'websocket' | 'stdio';
  url?: string;
  path?: string;
  authentication?: AuthenticationMethod;
}

export const AgentEndpointSchema = z.object({
  type: z.enum(['mcp', 'http', 'websocket', 'stdio']),
  url: z.string().optional(),
  path: z.string().optional(),
  authentication: AuthenticationMethodSchema.optional(),
});

/**
 * Authentication Method
 */
export type AuthenticationMethod = {
  type: 'jwt' | 'api_key' | 'certificate' | 'none';
  credentials?: string;
  metadata?: Record<string, unknown>;
}

export const AuthenticationMethodSchema = z.object({
  type: z.enum(['jwt', 'api_key', 'certificate', 'none']),
  credentials: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Agent Selector - for filtering agents
 */
export type AgentSelector = {
  type?: AgentType[];
  capabilities?: AgentCapability[];
  status?: AgentStatus[];
  custom?: Record<string, unknown>;
}

export const AgentSelectorSchema = z.object({
  type: z.array(AgentTypeSchema).optional(),
  capabilities: z.array(AgentCapabilitySchema).optional(),
  status: z.array(AgentStatusSchema).optional(),
  custom: z.record(z.unknown()).optional(),
});

/**
 * Agent creation and update types
 */
export type AgentCreationConfig = {
  identifier: AgentIdentifier;
  endpoints: AgentEndpoint[];
  metadata?: Record<string, unknown>;
  ttl?: number; // Time to live in seconds
}

export const AgentCreationConfigSchema = z.object({
  identifier: AgentIdentifierSchema,
  endpoints: z.array(AgentEndpointSchema),
  metadata: z.record(z.unknown()).optional(),
  ttl: z.number().optional(),
});

export type AgentUpdateConfig = {
  status?: AgentStatus;
  endpoints?: AgentEndpoint[];
  metadata?: Record<string, unknown>;
  ttl?: number;
}

export const AgentUpdateConfigSchema = z.object({
  status: AgentStatusSchema.optional(),
  endpoints: z.array(AgentEndpointSchema).optional(),
  metadata: z.record(z.unknown()).optional(),
  ttl: z.number().optional(),
});

/**
 * Helper functions
 */
export function createAgentIdentifier(
  id: string,
  type: AgentType,
  version: string,
  capabilities: AgentCapability[]
): AgentIdentifier {
  return { id, type, version, capabilities };
}

export function createAgentEndpoint(
  type: AgentEndpoint['type'],
  url?: string,
  path?: string,
  authentication?: AuthenticationMethod
): AgentEndpoint {
  return { type, url, path, authentication };
}

export function createAuthenticationMethod(
  type: AuthenticationMethod['type'],
  credentials?: string,
  metadata?: Record<string, unknown>
): AuthenticationMethod {
  return { type, credentials, metadata };
}