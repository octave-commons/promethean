import { z } from 'zod';

/**
 * Security context types for agent collaboration
 */
export const SECURITY_CONTEXT_TYPES = {
  TASK_ISOLATION: 'task_isolation',
  TEAM_BOUNDARY: 'team_boundary',
  PRIVACY_ENFORCEMENT: 'privacy_enforcement',
  AUDIT_LOGGING: 'audit_logging',
  ACCESS_CONTROL: 'access_control',
  DATA_CLASSIFICATION: 'data_classification',
  COMPLIANCE_FRAMEWORK: 'compliance_framework',
} as const;

export type SecurityContextType = typeof SECURITY_CONTEXT_TYPES[keyof typeof SECURITY_CONTEXT_TYPES];

/**
 * Data classification levels
 */
export const DATA_CLASSIFICATION_LEVELS = {
  PUBLIC: 'public',
  INTERNAL: 'internal',
  CONFIDENTIAL: 'confidential',
  RESTRICTED: 'restricted',
  TOP_SECRET: 'top_secret',
} as const;

export type DataClassificationLevel = typeof DATA_CLASSIFICATION_LEVELS[keyof typeof DATA_CLASSIFICATION_LEVELS];

/**
 * Trust levels for agent interactions
 */
export const TRUST_LEVELS = {
  UNTRUSTED: 'untrusted',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  TRUSTED: 'trusted',
} as const;

export type TrustLevel = typeof TRUST_LEVELS[keyof typeof TRUST_LEVELS];

/**
 * Security context definition
 */
export const SecurityContextSchema = z.object({
  contextId: z.string().uuid(),
  type: z.nativeEnum(SECURITY_CONTEXT_TYPES),
  name: z.string(),
  description: z.string().optional(),
  scope: z.enum(['room', 'team', 'task', 'agent', 'global']),
  scopeId: z.string().uuid().optional(),
  rules: z.array(z.object({
    ruleId: z.string().uuid(),
    type: z.enum(['allow', 'deny', 'require', 'transform', 'audit']),
    target: z.string(), // capability, data_type, agent_role, etc.
    conditions: z.array(z.string()).optional(),
    action: z.string().optional(),
    priority: z.number().min(0).max(100).default(50),
    enabled: z.boolean().default(true),
  })),
  dataClassification: z.nativeEnum(DATA_CLASSIFICATION_LEVELS).optional(),
  trustLevel: z.nativeEnum(TRUST_LEVELS).default(TRUST_LEVELS.MEDIUM),
  encryptionRequired: z.boolean().default(false),
  auditEnabled: z.boolean().default(true),
  retentionPeriod: z.number().optional(), // in seconds
  expiration: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Security context definition
 */
export interface SecurityContext {
  contextId: string;
  type: SecurityContextType;
  name: string;
  description?: string;
  scope: 'room' | 'team' | 'task' | 'agent' | 'global';
  scopeId?: string;
  rules: Array<{
    ruleId: string;
    type: 'allow' | 'deny' | 'require' | 'transform' | 'audit';
    target: string;
    conditions?: string[];
    action?: string;
    priority: number;
    enabled: boolean;
  }>;
  dataClassification?: DataClassificationLevel;
  trustLevel: TrustLevel;
  encryptionRequired: boolean;
  auditEnabled: boolean;
  retentionPeriod?: number; // in seconds
  expiration?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Privacy profile for agent interactions
 */
export const PrivacyProfileSchema = z.object({
  profileId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  level: z.enum(['public', 'pseudonymous', 'anonymous', 'e2e_encrypted']),
  dataSharing: z.object({
    allowPersonalData: z.boolean().default(false),
    allowIdentitySharing: z.boolean().default(false),
    allowCapabilitySharing: z.boolean().default(true),
    allowStatusSharing: z.boolean().default(true),
    allowPerformanceMetrics: z.boolean().default(false),
  }),
  retention: z.object({
    messageRetention: z.number().optional(), // in seconds
    contextRetention: z.number().optional(), // in seconds
    auditRetention: z.number().optional(), // in seconds
    autoCleanup: z.boolean().default(true),
  }),
  encryption: z.object({
    inTransit: z.boolean().default(true),
    atRest: z.boolean().default(false),
    endToEnd: z.boolean().default(false),
    keyRotation: z.number().optional(), // in seconds
  }),
  compliance: z.array(z.string()).optional(), // GDPR, HIPAA, etc.
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Privacy profile for agent interactions
 */
export interface PrivacyProfile {
  profileId: string;
  name: string;
  description?: string;
  level: 'public' | 'pseudonymous' | 'anonymous' | 'e2e_encrypted';
  dataSharing: {
    allowPersonalData: boolean;
    allowIdentitySharing: boolean;
    allowCapabilitySharing: boolean;
    allowStatusSharing: boolean;
    allowPerformanceMetrics: boolean;
  };
  retention: {
    messageRetention?: number; // in seconds
    contextRetention?: number; // in seconds
    auditRetention?: number; // in seconds
    autoCleanup: boolean;
  };
  encryption: {
    inTransit: boolean;
    atRest: boolean;
    endToEnd: boolean;
    keyRotation?: number; // in seconds
  };
  compliance?: string[]; // GDPR, HIPAA, etc.
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Access control entry
 */
export const AccessControlEntrySchema = z.object({
  aceId: z.string().uuid(),
  principal: z.string(), // agent ID, role, or group
  principalType: z.enum(['agent', 'role', 'group', 'anonymous']),
  resource: z.string(), // room, context, tool, capability
  resourceType: z.enum(['room', 'context', 'tool', 'capability', 'data']),
  permissions: z.array(z.string()),
  conditions: z.array(z.object({
    type: z.string(),
    operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than']),
    value: z.unknown(),
  })).optional(),
  effect: z.enum(['allow', 'deny']),
  priority: z.number().min(0).max(100).default(50),
  expiresAt: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Access control entry
 */
export interface AccessControlEntry {
  aceId: string;
  principal: string; // agent ID, role, or group
  principalType: 'agent' | 'role' | 'group' | 'anonymous';
  resource: string; // room, context, tool, capability
  resourceType: 'room' | 'context' | 'tool' | 'capability' | 'data';
  permissions: string[];
  conditions?: Array<{
    type: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
    value: unknown;
  }>;
  effect: 'allow' | 'deny';
  priority: number;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Audit log entry
 */
export const AuditLogEntrySchema = z.object({
  logId: z.string().uuid(),
  timestamp: z.string().datetime(),
  agentId: z.string().uuid(),
  sessionId: z.string(),
  action: z.string(),
  resource: z.string(),
  resourceType: z.enum(['room', 'context', 'tool', 'capability', 'data', 'message']),
  outcome: z.enum(['success', 'failure', 'denied', 'error']),
  details: z.record(z.unknown()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  riskScore: z.number().min(0).max(100).optional(),
  complianceTags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  logId: string;
  timestamp: string;
  agentId: string;
  sessionId: string;
  action: string;
  resource: string;
  resourceType: 'room' | 'context' | 'tool' | 'capability' | 'data' | 'message';
  outcome: 'success' | 'failure' | 'denied' | 'error';
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  riskScore?: number; // 0-100
  complianceTags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Security policy
 */
export const SecurityPolicySchema = z.object({
  policyId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  version: z.string(),
  scope: z.enum(['global', 'organization', 'team', 'room', 'task']),
  scopeId: z.string().uuid().optional(),
  rules: z.array(z.object({
    ruleId: z.string().uuid(),
    name: z.string(),
    description: z.string().optional(),
    conditions: z.array(z.object({
      field: z.string(),
      operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'in', 'not_in']),
      value: z.unknown(),
    })),
    actions: z.array(z.object({
      type: z.enum(['allow', 'deny', 'transform', 'log', 'alert', 'quarantine']),
      parameters: z.record(z.unknown()).optional(),
    })),
    priority: z.number().min(0).max(100).default(50),
    enabled: z.boolean().default(true),
  })),
  enforcement: z.object({
    strictMode: z.boolean().default(false),
    failClosed: z.boolean().default(true),
    auditOnly: z.boolean().default(false),
  }),
  compliance: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Security policy
 */
export interface SecurityPolicy {
  policyId: string;
  name: string;
  description?: string;
  version: string;
  scope: 'global' | 'organization' | 'team' | 'room' | 'task';
  scopeId?: string;
  rules: Array<{
    ruleId: string;
    name: string;
    description?: string;
    conditions: Array<{
      field: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'in' | 'not_in';
      value: unknown;
    }>;
    actions: Array<{
      type: 'allow' | 'deny' | 'transform' | 'log' | 'alert' | 'quarantine';
      parameters?: Record<string, unknown>;
    }>;
    priority: number;
    enabled: boolean;
  }>;
  enforcement: {
    strictMode: boolean;
    failClosed: boolean;
    auditOnly: boolean;
  };
  compliance?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Security evaluation request
 */
export const SecurityEvaluationRequestSchema = z.object({
  requestId: z.string().uuid(),
  agentId: z.string().uuid(),
  sessionId: z.string(),
  action: z.string(),
  resource: z.string(),
  resourceType: z.enum(['room', 'context', 'tool', 'capability', 'data', 'message']),
  context: z.record(z.unknown()).optional(),
  data: z.unknown().optional(),
  timestamp: z.string().datetime(),
});

/**
 * Security evaluation request
 */
export interface SecurityEvaluationRequest {
  requestId: string;
  agentId: string;
  sessionId: string;
  action: string;
  resource: string;
  resourceType: 'room' | 'context' | 'tool' | 'capability' | 'data' | 'message';
  context?: Record<string, unknown>;
  data?: unknown;
  timestamp: string;
}

/**
 * Security evaluation response
 */
export const SecurityEvaluationResponseSchema = z.object({
  requestId: z.string().uuid(),
  allowed: z.boolean(),
  reason: z.string(),
  riskScore: z.number().min(0).max(100),
  conditions: z.array(z.string()).optional(),
  transformations: z.array(z.object({
    type: z.string(),
    description: z.string(),
    parameters: z.record(z.unknown()).optional(),
  })).optional(),
  auditRequired: z.boolean().default(true),
  additionalChecks: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
  evaluatedAt: z.string().datetime(),
});

/**
 * Security evaluation response
 */
export interface SecurityEvaluationResponse {
  requestId: string;
  allowed: boolean;
  reason: string;
  riskScore: number; // 0-100
  conditions?: string[];
  transformations?: Array<{
    type: string;
    description: string;
    parameters?: Record<string, unknown>;
  }>;
  auditRequired?: boolean;
  additionalChecks?: string[];
  metadata?: Record<string, unknown>;
  evaluatedAt: string;
}