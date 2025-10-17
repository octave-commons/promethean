import { z } from 'zod';

/**
 * Agent coordination message types
 */
export const COORDINATION_MESSAGE_TYPES = {
  TASK_ASSIGNMENT: 'task.assignment',
  TASK_STATUS_UPDATE: 'task.status_update',
  TASK_COMPLETION: 'task.completion',
  COLLABORATION_REQUEST: 'collaboration.request',
  COLLABORATION_RESPONSE: 'collaboration.response',
  RESOURCE_REQUEST: 'resource.request',
  RESOURCE_OFFER: 'resource.offer',
  STATUS_HEARTBEAT: 'status.heartbeat',
  COORDINATION_SYNC: 'coordination.sync',
  EMERGENCY_ALERT: 'emergency.alert',
} as const;

export type CoordinationMessageType = typeof COORDINATION_MESSAGE_TYPES[keyof typeof COORDINATION_MESSAGE_TYPES];

/**
 * Agent task status
 */
export const TASK_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  BLOCKED: 'blocked',
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];

/**
 * Agent priority levels
 */
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical',
} as const;

export type PriorityLevel = typeof PRIORITY_LEVELS[keyof typeof PRIORITY_LEVELS];

/**
 * Agent coordination task definition
 */
export const CoordinationTaskSchema = z.object({
  taskId: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  assigneeId: z.string().uuid().optional(),
  assignerId: z.string().uuid(),
  status: z.nativeEnum(TASK_STATUS),
  priority: z.nativeEnum(PRIORITY_LEVELS),
  capabilities: z.array(z.string()),
  estimatedDuration: z.number().optional(), // in seconds
  deadline: z.string().datetime().optional(),
  dependencies: z.array(z.string().uuid()).optional(),
  context: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Agent coordination task
 */
export interface CoordinationTask {
  taskId: string;
  title: string;
  description: string;
  assigneeId?: string;
  assignerId: string;
  status: TaskStatus;
  priority: PriorityLevel;
  capabilities: string[];
  estimatedDuration?: number; // in seconds
  deadline?: string;
  dependencies?: string[];
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Task assignment message
 */
export const TaskAssignmentMessageSchema = z.object({
  type: z.literal(COORDINATION_MESSAGE_TYPES.TASK_ASSIGNMENT),
  taskId: z.string().uuid(),
  task: CoordinationTaskSchema,
  roomId: z.string(),
  timestamp: z.string().datetime(),
});

/**
 * Task status update message
 */
export const TaskStatusUpdateMessageSchema = z.object({
  type: z.literal(COORDINATION_MESSAGE_TYPES.TASK_STATUS_UPDATE),
  taskId: z.string().uuid(),
  previousStatus: z.nativeEnum(TASK_STATUS),
  newStatus: z.nativeEnum(TASK_STATUS),
  agentId: z.string().uuid(),
  progress: z.number().min(0).max(1).optional(),
  message: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  roomId: z.string(),
  timestamp: z.string().datetime(),
});

/**
 * Task completion message
 */
export const TaskCompletionMessageSchema = z.object({
  type: z.literal(COORDINATION_MESSAGE_TYPES.TASK_COMPLETION),
  taskId: z.string().uuid(),
  agentId: z.string().uuid(),
  result: z.unknown().optional(),
  success: z.boolean(),
  message: z.string().optional(),
  duration: z.number().optional(), // actual duration in seconds
  metadata: z.record(z.unknown()).optional(),
  roomId: z.string(),
  timestamp: z.string().datetime(),
});

/**
 * Collaboration request message
 */
export const CollaborationRequestMessageSchema = z.object({
  type: z.literal(COORDINATION_MESSAGE_TYPES.COLLABORATION_REQUEST),
  requestId: z.string().uuid(),
  requesterId: z.string().uuid(),
  targetId: z.string().uuid(),
  collaborationType: z.enum(['task_sharing', 'resource_sharing', 'knowledge_sharing', 'coordination']),
  description: z.string(),
  requirements: z.array(z.string()).optional(),
  duration: z.number().optional(), // in seconds
  priority: z.nativeEnum(PRIORITY_LEVELS),
  context: z.record(z.unknown()).optional(),
  roomId: z.string(),
  timestamp: z.string().datetime(),
});

/**
 * Collaboration response message
 */
export const CollaborationResponseMessageSchema = z.object({
  type: z.literal(COORDINATION_MESSAGE_TYPES.COLLABORATION_RESPONSE),
  requestId: z.string().uuid(),
  responderId: z.string().uuid(),
  requesterId: z.string().uuid(),
  accepted: z.boolean(),
  reason: z.string().optional(),
  conditions: z.array(z.string()).optional(),
  alternativeSuggestions: z.array(z.string()).optional(),
  roomId: z.string(),
  timestamp: z.string().datetime(),
});

/**
 * Resource request message
 */
export const ResourceRequestMessageSchema = z.object({
  type: z.literal(COORDINATION_MESSAGE_TYPES.RESOURCE_REQUEST),
  requestId: z.string().uuid(),
  requesterId: z.string().uuid(),
  resourceType: z.enum(['tool', 'context', 'compute', 'data', 'expertise']),
  resourceName: z.string(),
  specifications: z.record(z.unknown()).optional(),
  duration: z.number().optional(), // in seconds
  priority: z.nativeEnum(PRIORITY_LEVELS),
  roomId: z.string(),
  timestamp: z.string().datetime(),
});

/**
 * Resource offer message
 */
export const ResourceOfferMessageSchema = z.object({
  type: z.literal(COORDINATION_MESSAGE_TYPES.RESOURCE_OFFER),
  requestId: z.string().uuid(),
  providerId: z.string().uuid(),
  requesterId: z.string().uuid(),
  resourceType: z.enum(['tool', 'context', 'compute', 'data', 'expertise']),
  resourceName: z.string(),
  availability: z.object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    capacity: z.number().optional(),
  }),
  conditions: z.array(z.string()).optional(),
  roomId: z.string(),
  timestamp: z.string().datetime(),
});

/**
 * Status heartbeat message
 */
export const StatusHeartbeatMessageSchema = z.object({
  type: z.literal(COORDINATION_MESSAGE_TYPES.STATUS_HEARTBEAT),
  agentId: z.string().uuid(),
  status: z.enum(['active', 'idle', 'busy', 'offline', 'error']),
  currentTasks: z.array(z.string().uuid()).optional(),
  availableCapabilities: z.array(z.string()).optional(),
  load: z.number().min(0).max(1).optional(), // 0 = idle, 1 = fully loaded
  health: z.enum(['healthy', 'degraded', 'critical']).optional(),
  metadata: z.record(z.unknown()).optional(),
  roomId: z.string(),
  timestamp: z.string().datetime(),
});

/**
 * Coordination sync message
 */
export const CoordinationSyncMessageSchema = z.object({
  type: z.literal(COORDINATION_MESSAGE_TYPES.COORDINATION_SYNC),
  syncId: z.string().uuid(),
  initiatorId: z.string().uuid(),
  syncType: z.enum(['full', 'incremental', 'task_status', 'capability_update']),
  data: z.record(z.unknown()).optional(),
  targetAgents: z.array(z.string().uuid()).optional(),
  roomId: z.string(),
  timestamp: z.string().datetime(),
});

/**
 * Emergency alert message
 */
export const EmergencyAlertMessageSchema = z.object({
  type: z.literal(COORDINATION_MESSAGE_TYPES.EMERGENCY_ALERT),
  alertId: z.string().uuid(),
  reporterId: z.string().uuid(),
  severity: z.enum(['info', 'warning', 'error', 'critical']),
  category: z.enum(['system_failure', 'security_breach', 'task_failure', 'resource_exhaustion', 'communication_loss']),
  title: z.string(),
  description: z.string(),
  affectedAgents: z.array(z.string().uuid()).optional(),
  affectedTasks: z.array(z.string().uuid()).optional(),
  immediateAction: z.string().optional(),
  roomId: z.string(),
  timestamp: z.string().datetime(),
});

/**
 * Union of all coordination message types
 */
export const CoordinationMessageSchema = z.discriminatedUnion('type', [
  TaskAssignmentMessageSchema,
  TaskStatusUpdateMessageSchema,
  TaskCompletionMessageSchema,
  CollaborationRequestMessageSchema,
  CollaborationResponseMessageSchema,
  ResourceRequestMessageSchema,
  ResourceOfferMessageSchema,
  StatusHeartbeatMessageSchema,
  CoordinationSyncMessageSchema,
  EmergencyAlertMessageSchema,
]);

/**
 * Coordination message union type
 */
export type CoordinationMessage = z.infer<typeof CoordinationMessageSchema>;

/**
 * Agent team definition
 */
export const AgentTeamSchema = z.object({
  teamId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  leaderId: z.string().uuid(),
  memberIds: z.array(z.string().uuid()),
  capabilities: z.array(z.string()),
  roomId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Agent team
 */
export interface AgentTeam {
  teamId: string;
  name: string;
  description?: string;
  leaderId: string;
  memberIds: string[];
  capabilities: string[];
  roomId: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * Agent coordination state
 */
export interface AgentCoordinationState {
  agentId: string;
  currentTasks: string[];
  capabilities: string[];
  status: 'active' | 'idle' | 'busy' | 'offline' | 'error';
  load: number; // 0 = idle, 1 = fully loaded
  health: 'healthy' | 'degraded' | 'critical';
  lastHeartbeat: string;
  currentRoom?: string;
  teams: string[];
  metadata: Record<string, unknown>;
}