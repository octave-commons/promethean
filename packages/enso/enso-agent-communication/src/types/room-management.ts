import { z } from 'zod';

/**
 * Room types for agent collaboration
 */
export const ROOM_TYPES = {
  TASK_COORDINATION: 'task_coordination',
  TEAM_COLLABORATION: 'team_collaboration',
  SERVICE_DISCOVERY: 'service_discovery',
  EMERGENCY_RESPONSE: 'emergency_response',
  RESOURCE_SHARING: 'resource_sharing',
  KNOWLEDGE_SHARING: 'knowledge_sharing',
  PRIVACY_ENFORCED: 'privacy_enforced',
  TEMPORARY_TASK: 'temporary_task',
} as const;

export type RoomType = typeof ROOM_TYPES[keyof typeof ROOM_TYPES];

/**
 * Room privacy levels
 */
export const ROOM_PRIVACY_LEVELS = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  ANONYMOUS: 'anonymous',
  E2E_ENCRYPTED: 'e2e_encrypted',
} as const;

export type RoomPrivacyLevel = typeof ROOM_PRIVACY_LEVELS[keyof typeof ROOM_PRIVACY_LEVELS];

/**
 * Room access control levels
 */
export const ACCESS_LEVELS = {
  READ_ONLY: 'read_only',
  PARTICIPATE: 'participate',
  CONTRIBUTE: 'contribute',
  MODERATE: 'moderate',
  ADMIN: 'admin',
} as const;

export type AccessLevel = typeof ACCESS_LEVELS[keyof typeof ACCESS_LEVELS];

/**
 * Agent room configuration
 */
export const AgentRoomConfigSchema = z.object({
  roomId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  type: z.nativeEnum(ROOM_TYPES),
  privacyLevel: z.nativeEnum(ROOM_PRIVACY_LEVELS),
  accessLevel: z.nativeEnum(ACCESS_LEVELS),
  creatorId: z.string().uuid(),
  memberIds: z.array(z.string().uuid()),
  allowedCapabilities: z.array(z.string()).optional(),
  requiredCapabilities: z.array(z.string()).optional(),
  maxMembers: z.number().optional(),
  autoCleanup: z.boolean().default(false),
  cleanupDelay: z.number().optional(), // in seconds
  retentionPolicy: z.object({
    messageRetention: z.number().optional(), // in seconds
    contextRetention: z.number().optional(), // in seconds
    assetRetention: z.number().optional(), // in seconds
  }).optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Agent room configuration
 */
export interface AgentRoomConfig {
  roomId: string;
  name: string;
  description?: string;
  type: RoomType;
  privacyLevel: RoomPrivacyLevel;
  accessLevel: AccessLevel;
  creatorId: string;
  memberIds: string[];
  allowedCapabilities?: string[];
  requiredCapabilities?: string[];
  maxMembers?: number;
  autoCleanup?: boolean;
  cleanupDelay?: number; // in seconds
  retentionPolicy?: {
    messageRetention?: number; // in seconds
    contextRetention?: number; // in seconds
    assetRetention?: number; // in seconds
  };
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Room member information
 */
export const RoomMemberSchema = z.object({
  agentId: z.string().uuid(),
  sessionId: z.string(),
  role: z.enum(['creator', 'admin', 'moderator', 'participant', 'observer']),
  capabilities: z.array(z.string()),
  accessLevel: z.nativeEnum(ACCESS_LEVELS),
  joinedAt: z.string().datetime(),
  lastActive: z.string().datetime(),
  status: z.enum(['active', 'idle', 'away', 'offline']),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Room member information
 */
export interface RoomMember {
  agentId: string;
  sessionId: string;
  role: 'creator' | 'admin' | 'moderator' | 'participant' | 'observer';
  capabilities: string[];
  accessLevel: AccessLevel;
  joinedAt: string;
  lastActive: string;
  status: 'active' | 'idle' | 'away' | 'offline';
  metadata?: Record<string, unknown>;
}

/**
 * Room state information
 */
export const RoomStateSchema = z.object({
  config: AgentRoomConfigSchema,
  members: z.array(RoomMemberSchema),
  activeContexts: z.array(z.string()).optional(),
  activeStreams: z.array(z.object({
    streamId: z.string(),
    type: z.string(),
    provider: z.string(),
    participants: z.array(z.string().uuid()),
    startTime: z.string().datetime(),
  })).optional(),
  sharedTools: z.array(z.object({
    name: z.string(),
    provider: z.string(),
    providerId: z.string().uuid(),
    description: z.string().optional(),
    schema: z.unknown().optional(),
  })).optional(),
  metrics: z.object({
    messageCount: z.number().default(0),
    lastActivity: z.string().datetime(),
    averageLoad: z.number().min(0).max(1).default(0),
  }),
});

/**
 * Room state information
 */
export interface RoomState {
  config: AgentRoomConfig;
  members: RoomMember[];
  activeContexts?: string[];
  activeStreams?: Array<{
    streamId: string;
    type: string;
    provider: string;
    participants: string[];
    startTime: string;
  }>;
  sharedTools?: Array<{
    name: string;
    provider: string;
    providerId: string;
    description?: string;
    schema?: unknown;
  }>;
  metrics: {
    messageCount: number;
    lastActivity: string;
    averageLoad: number; // 0 = idle, 1 = fully loaded
  };
}

/**
 * Room creation request
 */
export const RoomCreationRequestSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  type: z.nativeEnum(ROOM_TYPES),
  privacyLevel: z.nativeEnum(ROOM_PRIVACY_LEVELS),
  accessLevel: z.nativeEnum(ACCESS_LEVELS),
  initialMembers: z.array(z.string().uuid()).optional(),
  allowedCapabilities: z.array(z.string()).optional(),
  requiredCapabilities: z.array(z.string()).optional(),
  maxMembers: z.number().optional(),
  autoCleanup: z.boolean().default(false),
  cleanupDelay: z.number().optional(),
  retentionPolicy: z.object({
    messageRetention: z.number().optional(),
    contextRetention: z.number().optional(),
    assetRetention: z.number().optional(),
  }).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Room creation request
 */
export interface RoomCreationRequest {
  name: string;
  description?: string;
  type: RoomType;
  privacyLevel: RoomPrivacyLevel;
  accessLevel: AccessLevel;
  initialMembers?: string[];
  allowedCapabilities?: string[];
  requiredCapabilities?: string[];
  maxMembers?: number;
  autoCleanup?: boolean;
  cleanupDelay?: number;
  retentionPolicy?: {
    messageRetention?: number;
    contextRetention?: number;
    assetRetention?: number;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Room join request
 */
export const RoomJoinRequestSchema = z.object({
  roomId: z.string().uuid(),
  agentId: z.string().uuid(),
  requestedCapabilities: z.array(z.string()),
  accessLevel: z.nativeEnum(ACCESS_LEVELS).optional(),
  message: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Room join request
 */
export interface RoomJoinRequest {
  roomId: string;
  agentId: string;
  requestedCapabilities: string[];
  accessLevel?: AccessLevel;
  message?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Room join response
 */
export const RoomJoinResponseSchema = z.object({
  roomId: z.string().uuid(),
  agentId: z.string().uuid(),
  accepted: z.boolean(),
  grantedCapabilities: z.array(z.string()),
  deniedCapabilities: z.array(z.string()),
  accessLevel: z.nativeEnum(ACCESS_LEVELS),
  sessionId: z.string(),
  restrictions: z.array(z.object({
    capability: z.string(),
    limitation: z.string(),
    reason: z.string(),
  })).optional(),
  message: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Room join response
 */
export interface RoomJoinResponse {
  roomId: string;
  agentId: string;
  accepted: boolean;
  grantedCapabilities: string[];
  deniedCapabilities: string[];
  accessLevel: AccessLevel;
  sessionId: string;
  restrictions?: Array<{
    capability: string;
    limitation: string;
    reason: string;
  }>;
  message?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Room event types
 */
export const ROOM_EVENT_TYPES = {
  ROOM_CREATED: 'room.created',
  ROOM_UPDATED: 'room.updated',
  ROOM_DELETED: 'room.deleted',
  MEMBER_JOINED: 'member.joined',
  MEMBER_LEFT: 'member.left',
  MEMBER_UPDATED: 'member.updated',
  CAPABILITY_GRANTED: 'capability.granted',
  CAPABILITY_REVOKED: 'capability.revoked',
  TOOL_ADVERTISED: 'tool.advertised',
  TOOL_REMOVED: 'tool.removed',
  CONTEXT_SHARED: 'context.shared',
  STREAM_STARTED: 'stream.started',
  STREAM_ENDED: 'stream.ended',
  PRIVACY_CHANGED: 'privacy.changed',
  CLEANUP_SCHEDULED: 'cleanup.scheduled',
} as const;

export type RoomEventType = typeof ROOM_EVENT_TYPES[keyof typeof ROOM_EVENT_TYPES];

/**
 * Room event
 */
export const RoomEventSchema = z.object({
  type: z.nativeEnum(ROOM_EVENT_TYPES),
  roomId: z.string().uuid(),
  agentId: z.string().uuid().optional(),
  timestamp: z.string().datetime(),
  data: z.record(z.unknown()),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Room event
 */
export interface RoomEvent {
  type: RoomEventType;
  roomId: string;
  agentId?: string;
  timestamp: string;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}