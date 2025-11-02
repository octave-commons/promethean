import { z } from 'zod';

// Security-focused validation schemas
export const AgentIdSchema = z
  .string()
  .min(1, 'Agent ID cannot be empty')
  .max(255, 'Agent ID too long')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Agent ID can only contain alphanumeric characters, hyphens, and underscores',
  )
  .refine(
    (id) => !id.includes('..') && !id.includes('/') && !id.includes('\\'),
    'Agent ID cannot contain path traversal characters',
  );

export const ContextKeySchema = z
  .string()
  .min(1, 'Context key cannot be empty')
  .max(500, 'Context key too long')
  .regex(/^[a-zA-Z0-9_.:-]+$/, 'Context key contains invalid characters')
  .refine(
    (key) => !key.includes('..') && !key.includes('/') && !key.includes('\\'),
    'Context key cannot contain path traversal characters',
  );

export const ContextValueSchema = z.any().refine((value) => {
  // Prevent prototype pollution
  if (value && typeof value === 'object') {
    return !('__proto__' in value) && !('constructor' in value) && !('prototype' in value);
  }
  return true;
}, 'Context value contains prohibited properties');

export const ShareTypeSchema = z.enum(['read', 'write', 'admin']);

export const PermissionSchema = z
  .string()
  .min(1, 'Permission cannot be empty')
  .max(100, 'Permission too long')
  .regex(/^[a-zA-Z0-9_:.-]+$/, 'Permission contains invalid characters');

export const TokenSchema = z.string().min(10, 'Token too short').max(2000, 'Token too long');

export const EventDataSchema = z.record(z.unknown()).refine((data) => {
  // Prevent prototype pollution in event data
  for (const key in data) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return false;
    }
  }
  return true;
}, 'Event data contains prohibited properties');

export const SnapshotIdSchema = z
  .string()
  .min(1, 'Snapshot ID cannot be empty')
  .max(255, 'Snapshot ID too long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Snapshot ID contains invalid characters');

export const MetadataQuerySchema = z.object({
  agentId: AgentIdSchema.optional(),
  contextType: z.string().max(100).optional(),
  visibility: z.enum(['private', 'shared', 'public']).optional(),
  keyPattern: z.string().max(500).optional(),
  limit: z.number().int().min(1).max(1000).optional(),
  offset: z.number().int().min(0).max(10000).optional(),
});

// Security validation actions
export type ValidateAgentIdInput = {
  agentId: unknown;
};

export type ValidateAgentIdScope = {
  schemas: {
    AgentIdSchema: typeof AgentIdSchema;
  };
};

export const validateAgentId = (
  input: ValidateAgentIdInput,
  scope: ValidateAgentIdScope,
): string => {
  return scope.schemas.AgentIdSchema.parse(input.agentId);
};

export type ValidateContextKeyInput = {
  key: unknown;
};

export type ValidateContextKeyScope = {
  schemas: {
    ContextKeySchema: typeof ContextKeySchema;
  };
};

export const validateContextKey = (
  input: ValidateContextKeyInput,
  scope: ValidateContextKeyScope,
): string => {
  return scope.schemas.ContextKeySchema.parse(input.key);
};

export type ValidateContextValueInput = {
  value: unknown;
};

export type ValidateContextValueScope = {
  schemas: {
    ContextValueSchema: typeof ContextValueSchema;
  };
};

export const validateContextValue = (
  input: ValidateContextValueInput,
  scope: ValidateContextValueScope,
): unknown => {
  return scope.schemas.ContextValueSchema.parse(input.value);
};

export type ValidateShareTypeInput = {
  shareType: unknown;
};

export type ValidateShareTypeScope = {
  schemas: {
    ShareTypeSchema: typeof ShareTypeSchema;
  };
};

export const validateShareType = (
  input: ValidateShareTypeInput,
  scope: ValidateShareTypeScope,
): 'read' | 'write' | 'admin' => {
  return scope.schemas.ShareTypeSchema.parse(input.shareType);
};

export type ValidatePermissionsInput = {
  permissions: unknown;
};

export type ValidatePermissionsScope = {
  schemas: {
    PermissionSchema: typeof PermissionSchema;
  };
};

export const validatePermissions = (
  input: ValidatePermissionsInput,
  scope: ValidatePermissionsScope,
): string[] => {
  if (Array.isArray(input.permissions)) {
    return input.permissions.map((p) => scope.schemas.PermissionSchema.parse(p));
  }
  throw new Error('Permissions must be an array');
};

export type ValidateTokenInput = {
  token: unknown;
};

export type ValidateTokenScope = {
  schemas: {
    TokenSchema: typeof TokenSchema;
  };
};

export const validateToken = (input: ValidateTokenInput, scope: ValidateTokenScope): string => {
  return scope.schemas.TokenSchema.parse(input.token);
};

export type ValidateEventDataInput = {
  data: unknown;
};

export type ValidateEventDataScope = {
  schemas: {
    EventDataSchema: typeof EventDataSchema;
  };
};

export const validateEventData = (
  input: ValidateEventDataInput,
  scope: ValidateEventDataScope,
): Record<string, unknown> => {
  return scope.schemas.EventDataSchema.parse(input.data);
};

export type ValidateSnapshotIdInput = {
  snapshotId: unknown;
};

export type ValidateSnapshotIdScope = {
  schemas: {
    SnapshotIdSchema: typeof SnapshotIdSchema;
  };
};

export const validateSnapshotId = (
  input: ValidateSnapshotIdInput,
  scope: ValidateSnapshotIdScope,
): string => {
  return scope.schemas.SnapshotIdSchema.parse(input.snapshotId);
};

export type ValidateMetadataQueryInput = {
  query: unknown;
};

export type ValidateMetadataQueryScope = {
  schemas: {
    MetadataQuerySchema: typeof MetadataQuerySchema;
  };
};

export const validateMetadataQuery = (
  input: ValidateMetadataQueryInput,
  scope: ValidateMetadataQueryScope,
): unknown => {
  return scope.schemas.MetadataQuerySchema.parse(input.query);
};

// Sanitization actions
export type SanitizeStringInput = {
  input: unknown;
  maxLength?: number;
};

export type SanitizeStringScope = Record<string, never>;

export const sanitizeString = (input: SanitizeStringInput): string => {
  if (typeof input.input !== 'string') {
    throw new Error('Input must be a string');
  }

  const maxLength = input.maxLength || 1000;

  // Remove potentially dangerous characters
  const cleanInput = input.input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Control characters
    .replace(/[\uFFFE\uFFFF]/g, '') // Invalid Unicode
    .trim();

  // Truncate if too long
  return cleanInput.length > maxLength ? cleanInput.substring(0, maxLength) : cleanInput;
};

export type SanitizeObjectInput = {
  obj: unknown;
};

export type SanitizeObjectScope = Record<string, never>;

export const sanitizeObject = (input: SanitizeObjectInput, scope: SanitizeObjectScope): unknown => {
  if (input.obj === null || input.obj === undefined) {
    return input.obj;
  }

  if (typeof input.obj !== 'object') {
    return input.obj;
  }

  if (Array.isArray(input.obj)) {
    return input.obj.map((item) => sanitizeObject({ obj: item }, scope));
  }

  const sanitized: Record<string, unknown> = {};
  const objRecord = input.obj as Record<string, unknown>;
  for (const key in objRecord) {
    // Skip dangerous prototype properties
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    sanitized[key] = sanitizeObject({ obj: objRecord[key] }, scope);
  }

  return sanitized;
};

// Legacy compatibility exports
export const SecurityValidator = {
  validateAgentId: (id: unknown) =>
    validateAgentId({ agentId: id }, { schemas: { AgentIdSchema } }),
  validateContextKey: (key: unknown) =>
    validateContextKey({ key }, { schemas: { ContextKeySchema } }),
  validateContextValue: (value: unknown) =>
    validateContextValue({ value }, { schemas: { ContextValueSchema } }),
  validateShareType: (shareType: unknown) =>
    validateShareType({ shareType }, { schemas: { ShareTypeSchema } }),
  validatePermissions: (permissions: unknown) =>
    validatePermissions({ permissions }, { schemas: { PermissionSchema } }),
  validateToken: (token: unknown) => validateToken({ token }, { schemas: { TokenSchema } }),
  validateEventData: (data: unknown) =>
    validateEventData({ data }, { schemas: { EventDataSchema } }),
  validateSnapshotId: (snapshotId: unknown) =>
    validateSnapshotId({ snapshotId }, { schemas: { SnapshotIdSchema } }),
  validateMetadataQuery: (query: unknown) =>
    validateMetadataQuery({ query }, { schemas: { MetadataQuerySchema } }),
  sanitizeString: (input: unknown, maxLength?: number) => sanitizeString({ input, maxLength }),
  sanitizeObject: (obj: unknown) => sanitizeObject({ obj }, {}),
};

// Rate limiting utilities
export class RateLimiter {
  private static instances = new Map<string, RateLimiter>();
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(
    private readonly windowMs: number = 60000, // 1 minute
    private readonly maxAttempts: number = 10,
  ) {}

  static getInstance(identifier: string, windowMs?: number, maxAttempts?: number): RateLimiter {
    const key = `${identifier}:${windowMs || 60000}:${maxAttempts || 10}`;
    if (!this.instances.has(key)) {
      this.instances.set(key, new RateLimiter(windowMs, maxAttempts));
    }
    return this.instances.get(key)!;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now - record.resetTime >= this.windowMs) {
      this.attempts.set(key, { count: 1, resetTime: now });
      return true;
    }

    if (record.count >= this.maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingAttempts(key: string): number {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now - record.resetTime >= this.windowMs) {
      return this.maxAttempts;
    }

    return Math.max(0, this.maxAttempts - record.count);
  }

  getResetTime(key: string): number | null {
    const record = this.attempts.get(key);
    return record ? record.resetTime : null;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.attempts.entries()) {
      if (now - record.resetTime >= this.windowMs) {
        this.attempts.delete(key);
      }
    }
  }
}

// Security logging utilities
export interface SecurityEvent {
  type: 'authentication' | 'authorization' | 'input_validation' | 'rate_limit' | 'data_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  agentId?: string;
  action: string;
  details: Record<string, unknown>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export class SecurityLogger {
  private static events: SecurityEvent[] = [];
  private static maxEvents: number = 10000;

  static log(event: Omit<SecurityEvent, 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
    };

    this.events.push(securityEvent);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // In production, send to external logging system
    if (process.env.NODE_ENV === 'production') {
      console.warn('SECURITY EVENT:', JSON.stringify(securityEvent));
    }
  }

  static getEvents(filter?: {
    type?: SecurityEvent['type'];
    severity?: SecurityEvent['severity'];
    agentId?: string;
    since?: Date;
  }): SecurityEvent[] {
    let filtered = this.events;

    if (filter) {
      if (filter.type) {
        filtered = filtered.filter((e) => e.type === filter.type);
      }
      if (filter.severity) {
        filtered = filtered.filter((e) => e.severity === filter.severity);
      }
      if (filter.agentId) {
        filtered = filtered.filter((e) => e.agentId === filter.agentId);
      }
      if (filter.since) {
        filtered = filtered.filter((e) => e.timestamp >= filter.since!);
      }
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  static clear(): void {
    this.events = [];
  }

  static getStatistics(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    last24h: number;
  } {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    for (const event of this.events) {
      byType[event.type] = (byType[event.type] || 0) + 1;
      bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;
    }

    return {
      total: this.events.length,
      byType,
      bySeverity,
      last24h: this.events.filter((e) => e.timestamp >= last24h).length,
    };
  }
}
