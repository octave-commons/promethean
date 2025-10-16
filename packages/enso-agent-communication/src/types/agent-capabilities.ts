import { z } from 'zod';

/**
 * Agent capability definitions mapped to Enso protocol capabilities
 */
export const AGENT_CAPABILITIES = {
  // Core communication capabilities
  CAN_SEND_TEXT: 'can.send.text',
  CAN_RECV_TEXT: 'can.recv.text',
  CAN_SEND_AUDIO: 'can.send.audio',
  CAN_RECV_AUDIO: 'can.recv.audio',
  
  // Tool and service capabilities
  TOOL_CALL: 'tool.call',
  TOOL_HOST: 'tool.host',
  TOOL_ADVERTISE: 'tool.advertise',
  
  // Asset and cache capabilities
  ASSET_PUT: 'can.asset.put',
  ASSET_GET: 'can.asset.get',
  CACHE_WRITE: 'cache.write',
  CACHE_READ: 'cache.read',
  
  // Context and collaboration capabilities
  CONTEXT_WRITE: 'can.context.write',
  CONTEXT_READ: 'can.context.read',
  CONTEXT_APPLY: 'can.context.apply',
  
  // Privacy and security capabilities
  PRIVACY_E2E: 'privacy.e2e',
  PRIVACY_ANONYMOUS: 'privacy.anonymous',
  PRIVACY_PSEUDONYMOUS: 'privacy.pseudonymous',
  
  // Coordination capabilities
  COORDINATION_LEAD: 'coordination.lead',
  COORDINATION_FOLLOW: 'coordination.follow',
  COORDINATION_NEGOTIATE: 'coordination.negotiate',
  
  // Stream capabilities
  STREAM_VOICE: 'can.voice.stream',
  STREAM_DATA: 'can.stream.data',
  STREAM_ROUTE: 'can.route.streams',
} as const;

export type AgentCapability = typeof AGENT_CAPABILITIES[keyof typeof AGENT_CAPABILITIES];

/**
 * Agent role definitions with default capability sets
 */
export const AGENT_ROLES = {
  COORDINATOR: 'coordinator',
  WORKER: 'worker',
  SPECIALIST: 'specialist',
  OBSERVER: 'observer',
  MIXER: 'mixer',
} as const;

export type AgentRole = typeof AGENT_ROLES[keyof typeof AGENT_ROLES];

/**
 * Default capability sets for different agent roles
 */
export const ROLE_CAPABILITIES: Record<AgentRole, AgentCapability[]> = {
  [AGENT_ROLES.COORDINATOR]: [
    AGENT_CAPABILITIES.CAN_SEND_TEXT,
    AGENT_CAPABILITIES.CAN_RECV_TEXT,
    AGENT_CAPABILITIES.TOOL_CALL,
    AGENT_CAPABILITIES.TOOL_HOST,
    AGENT_CAPABILITIES.TOOL_ADVERTISE,
    AGENT_CAPABILITIES.CONTEXT_WRITE,
    AGENT_CAPABILITIES.CONTEXT_READ,
    AGENT_CAPABILITIES.CONTEXT_APPLY,
    AGENT_CAPABILITIES.COORDINATION_LEAD,
    AGENT_CAPABILITIES.COORDINATION_NEGOTIATE,
    AGENT_CAPABILITIES.CACHE_WRITE,
    AGENT_CAPABILITIES.CACHE_READ,
  ],
  
  [AGENT_ROLES.WORKER]: [
    AGENT_CAPABILITIES.CAN_SEND_TEXT,
    AGENT_CAPABILITIES.CAN_RECV_TEXT,
    AGENT_CAPABILITIES.TOOL_CALL,
    AGENT_CAPABILITIES.CONTEXT_READ,
    AGENT_CAPABILITIES.CONTEXT_APPLY,
    AGENT_CAPABILITIES.COORDINATION_FOLLOW,
    AGENT_CAPABILITIES.CACHE_READ,
    AGENT_CAPABILITIES.ASSET_PUT,
  ],
  
  [AGENT_ROLES.SPECIALIST]: [
    AGENT_CAPABILITIES.CAN_SEND_TEXT,
    AGENT_CAPABILITIES.CAN_RECV_TEXT,
    AGENT_CAPABILITIES.TOOL_CALL,
    AGENT_CAPABILITIES.TOOL_HOST,
    AGENT_CAPABILITIES.TOOL_ADVERTISE,
    AGENT_CAPABILITIES.CONTEXT_READ,
    AGENT_CAPABILITIES.CONTEXT_APPLY,
    AGENT_CAPABILITIES.COORDINATION_FOLLOW,
    AGENT_CAPABILITIES.CACHE_WRITE,
    AGENT_CAPABILITIES.CACHE_READ,
    AGENT_CAPABILITIES.ASSET_PUT,
    AGENT_CAPABILITIES.ASSET_GET,
  ],
  
  [AGENT_ROLES.OBSERVER]: [
    AGENT_CAPABILITIES.CAN_RECV_TEXT,
    AGENT_CAPABILITIES.CONTEXT_READ,
    AGENT_CAPABILITIES.CACHE_READ,
    AGENT_CAPABILITIES.ASSET_GET,
  ],
  
  [AGENT_ROLES.MIXER]: [
    AGENT_CAPABILITIES.CAN_SEND_AUDIO,
    AGENT_CAPABILITIES.CAN_RECV_AUDIO,
    AGENT_CAPABILITIES.STREAM_VOICE,
    AGENT_CAPABILITIES.STREAM_DATA,
    AGENT_CAPABILITIES.STREAM_ROUTE,
    AGENT_CAPABILITIES.CONTEXT_READ,
    AGENT_CAPABILITIES.CACHE_READ,
  ],
} as const;

/**
 * Agent capability schema
 */
export const AgentCapabilitySchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean().default(false),
    description: z.string().optional(),
  })).optional(),
  dependencies: z.array(z.string()).optional(),
  trustLevel: z.enum(['low', 'medium', 'high']).default('medium'),
});

/**
 * Agent capability definition
 */
export interface AgentCapabilityDefinition {
  name: string;
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description?: string;
  }>;
  dependencies?: string[];
  trustLevel: 'low' | 'medium' | 'high';
}

/**
 * Agent capability negotiation request
 */
export const CapabilityNegotiationRequestSchema = z.object({
  agentId: z.string().uuid(),
  requestedCapabilities: z.array(z.string()),
  role: z.nativeEnum(AGENT_ROLES).optional(),
  privacyProfile: z.enum(['public', 'pseudonymous', 'anonymous', 'e2e']).optional(),
  toolRequirements: z.array(z.object({
    name: z.string(),
    version: z.string().optional(),
    required: z.boolean(),
  })).optional(),
  contextRequirements: z.array(z.object({
    type: z.string(),
    access: z.enum(['read', 'write', 'apply']),
    required: z.boolean(),
  })).optional(),
});

/**
 * Agent capability negotiation request
 */
export interface CapabilityNegotiationRequest {
  agentId: string;
  requestedCapabilities: string[];
  role?: AgentRole;
  privacyProfile?: 'public' | 'pseudonymous' | 'anonymous' | 'e2e';
  toolRequirements?: Array<{
    name: string;
    version?: string;
    required: boolean;
  }>;
  contextRequirements?: Array<{
    type: string;
    access: 'read' | 'write' | 'apply';
    required: boolean;
  }>;
}

/**
 * Agent capability negotiation response
 */
export const CapabilityNegotiationResponseSchema = z.object({
  agentId: z.string().uuid(),
  grantedCapabilities: z.array(z.string()),
  deniedCapabilities: z.array(z.string()),
  negotiatedRole: z.nativeEnum(AGENT_ROLES),
  privacyProfile: z.enum(['public', 'pseudonymous', 'anonymous', 'e2e']),
  restrictions: z.array(z.object({
    capability: z.string(),
    limitation: z.string(),
    reason: z.string(),
  })).optional(),
  expiration: z.string().datetime().optional(),
  revision: z.number(),
});

/**
 * Agent capability negotiation response
 */
export interface CapabilityNegotiationResponse {
  agentId: string;
  grantedCapabilities: string[];
  deniedCapabilities: string[];
  negotiatedRole: AgentRole;
  privacyProfile: 'public' | 'pseudonymous' | 'anonymous' | 'e2e';
  restrictions?: Array<{
    capability: string;
    limitation: string;
    reason: string;
  }>;
  expiration?: string;
  revision: number;
}

/**
 * Agent capability update event
 */
export const CapabilityUpdateEventSchema = z.object({
  agentId: z.string().uuid(),
  sessionId: z.string(),
  capabilities: z.array(z.string()),
  revision: z.number(),
  granted: z.array(z.string()).optional(),
  revoked: z.array(z.string()).optional(),
  reason: z.string().optional(),
  requestId: z.string().optional(),
  acknowledgedAt: z.string().datetime(),
});

/**
 * Agent capability update event
 */
export interface CapabilityUpdateEvent {
  agentId: string;
  sessionId: string;
  capabilities: string[];
  revision: number;
  granted?: string[];
  revoked?: string[];
  reason?: string;
  requestId?: string;
  acknowledgedAt: string;
}