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
): readonly string[] => {
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

export const sanitizeString = (input: SanitizeStringInput): string => {
  if (typeof input.input !== 'string') {
    throw new Error('Input must be a string');
  }

  const maxLength = input.maxLength || 1000;

  // Remove potentially dangerous characters
  const sanitized = input.input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Control characters
    .replace(/[\uFFFE\uFFFF]/g, '') // Invalid Unicode
    .trim();

  // Truncate if too long
  if (sanitized.length > maxLength) {
    return sanitized.substring(0, maxLength);
  }

  return sanitized;
};

export type SanitizeObjectInput = {
  obj: unknown;
};

export const sanitizeObject = (input: SanitizeObjectInput): unknown => {
  if (input.obj === null || input.obj === undefined) {
    return input.obj;
  }

  if (typeof input.obj !== 'object') {
    return input.obj;
  }

  if (Array.isArray(input.obj)) {
    return input.obj.map((item) => sanitizeObject({ obj: item }));
  }

  const objRecord = input.obj as Record<string, unknown>;
  const keys = Object.keys(objRecord);

  return keys.reduce(
    (acc, key) => {
      // Skip dangerous prototype properties
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return acc;
      }

      return {
        ...acc,
        [key]: sanitizeObject({ obj: objRecord[key] }),
      };
    },
    {} as Record<string, unknown>,
  );
};

// Rate limiting actions
export type RateLimitRecord = {
  readonly count: number;
  readonly resetTime: number;
};

export type CreateRateLimiterInput = {
  windowMs?: number;
  maxAttempts?: number;
};

export const createRateLimiter = (
  input: CreateRateLimiterInput,
): {
  isAllowed: (key: string) => boolean;
  getRemainingAttempts: (key: string) => number;
  getResetTime: (key: string) => number | null;
  reset: (key: string) => void;
  cleanup: () => void;
} => {
  const windowMs = input.windowMs || 60000;
  const maxAttempts = input.maxAttempts || 10;
  const attempts = new Map<string, RateLimitRecord>();

  const isAllowed = (key: string): boolean => {
    const now = Date.now();
    const record = attempts.get(key);

    if (!record || now - record.resetTime >= windowMs) {
      attempts.set(key, { count: 1, resetTime: now });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    const updatedRecord: RateLimitRecord = { ...record, count: record.count + 1 };
    attempts.set(key, updatedRecord);
    return true;
  };

  const getRemainingAttempts = (key: string): number => {
    const now = Date.now();
    const record = attempts.get(key);

    if (!record || now - record.resetTime >= windowMs) {
      return maxAttempts;
    }

    return Math.max(0, maxAttempts - record.count);
  };

  const getResetTime = (key: string): number | null => {
    const record = attempts.get(key);
    return record ? record.resetTime : null;
  };

  const reset = (key: string): void => {
    attempts.delete(key);
  };

  const cleanup = (): void => {
    const now = Date.now();
    const keysToDelete: string[] = [];

    attempts.forEach((record, key) => {
      if (now - record.resetTime >= windowMs) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => attempts.delete(key));
  };

  return {
    isAllowed,
    getRemainingAttempts,
    getResetTime,
    reset,
    cleanup,
  };
};

// Rate limiter factory with singleton pattern
const rateLimiterInstances = new Map<string, ReturnType<typeof createRateLimiter>>();

export type GetRateLimiterInput = {
  identifier: string;
  windowMs?: number;
  maxAttempts?: number;
};

export const getRateLimiter = (
  input: GetRateLimiterInput,
): ReturnType<typeof createRateLimiter> => {
  const key = `${input.identifier}:${input.windowMs || 60000}:${input.maxAttempts || 10}`;

  if (!rateLimiterInstances.has(key)) {
    const instance = createRateLimiter({
      windowMs: input.windowMs,
      maxAttempts: input.maxAttempts,
    });
    rateLimiterInstances.set(key, instance);
  }

  return rateLimiterInstances.get(key)!;
};

// Security logging actions
export interface SecurityEvent {
  type: 'authentication' | 'authorization' | 'input_validation' | 'rate_limit' | 'data_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  agentId?: string;
  action: string;
  details: Readonly<Record<string, unknown>>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export type LogSecurityEventInput = Omit<SecurityEvent, 'timestamp'>;

export const logSecurityEvent = (input: LogSecurityEventInput): SecurityEvent => {
  const securityEvent: SecurityEvent = {
    ...input,
    timestamp: new Date(),
  };

  // In a real implementation, this would store events
  if (process.env.NODE_ENV === 'production') {
    console.warn('SECURITY EVENT:', JSON.stringify(securityEvent));
  }

  return securityEvent;
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
  sanitizeObject: (obj: unknown) => sanitizeObject({ obj }),
};

export const RateLimiter = {
  getInstance: (identifier: string, windowMs?: number, maxAttempts?: number) =>
    getRateLimiter({ identifier, windowMs, maxAttempts }),
};
