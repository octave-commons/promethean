/**
 * Security utilities and validators for context management
 * Migrated from agent-context package with enhanced unified type system integration
 */

import crypto from 'crypto';
import { z } from 'zod';

// Security configuration
export const SECURITY_CONFIG = {
  maxAgentIdLength: 255,
  maxTokenLength: 1000,
  maxEventDataSize: 1024 * 1024, // 1MB
  maxContextSize: 10 * 1024 * 1024, // 10MB
  rateLimitWindow: 60000, // 1 minute
  maxRequestsPerWindow: 100,
  allowedEventTypes: [
    'context_created',
    'context_updated',
    'context_deleted',
    'context_shared',
    'context_archived',
    'snapshot_created',
    'auth_token_generated',
    'auth_token_validated',
    'auth_token_revoked',
  ],
  sanitizedFields: ['password', 'token', 'secret', 'key', 'auth'],
} as const;

export interface SecurityLogEntry {
  type:
    | 'data_access'
    | 'auth'
    | 'rate_limit'
    | 'validation'
    | 'authentication'
    | 'authorization';
  severity: 'low' | 'medium' | 'high' | 'critical';
  agentId?: string;
  action: string;
  details: Record<string, any>;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
}

// Security-focused validation schemas
export const AgentIdSchema = z
  .string()
  .min(1, 'Agent ID cannot be empty')
  .max(255, 'Agent ID too long')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Agent ID can only contain alphanumeric characters, hyphens, and underscores'
  )
  .refine(
    (id) => !id.includes('..') && !id.includes('/') && !id.includes('\\'),
    'Agent ID cannot contain path traversal characters'
  );

export const ContextKeySchema = z
  .string()
  .min(1, 'Context key cannot be empty')
  .max(500, 'Context key too long')
  .regex(/^[a-zA-Z0-9_.:-]+$/, 'Context key contains invalid characters')
  .refine(
    (key) => !key.includes('..') && !key.includes('/') && !key.includes('\\'),
    'Context key cannot contain path traversal characters'
  );

export const ContextValueSchema = z.any().refine((value) => {
  // Prevent prototype pollution
  if (value && typeof value === 'object') {
    return (
      !('__proto__' in value) &&
      !('constructor' in value) &&
      !('prototype' in value)
    );
  }
  return true;
}, 'Context value contains prohibited properties');

export const ShareTypeSchema = z.enum(['read', 'write', 'admin']);

export const PermissionSchema = z
  .string()
  .min(1, 'Permission cannot be empty')
  .max(100, 'Permission too long')
  .regex(/^[a-zA-Z0-9_:.-]+$/, 'Permission contains invalid characters');

export const TokenSchema = z
  .string()
  .min(10, 'Token too short')
  .max(2000, 'Token too long');

export const EventDataSchema = z.record(z.unknown()).refine((data) => {
  // Prevent prototype pollution in event data
  for (const key in data) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return false;
    }
  }
  return true;
}, 'Event data contains prohibited properties');

export class SecurityValidator {
  static validateAgentId(agentId: string): string {
    if (!agentId || typeof agentId !== 'string') {
      throw new Error('Agent ID must be a non-empty string');
    }

    if (agentId.length > SECURITY_CONFIG.maxAgentIdLength) {
      throw new Error(
        `Agent ID exceeds maximum length of ${SECURITY_CONFIG.maxAgentIdLength}`
      );
    }

    // Validate using schema
    const result = AgentIdSchema.safeParse(agentId);
    if (!result.success) {
      throw new Error(`Invalid agent ID: ${result.error.issues[0]?.message}`);
    }

    return agentId;
  }

  static validateContextKey(key: string): string {
    const result = ContextKeySchema.safeParse(key);
    if (!result.success) {
      throw new Error(
        `Invalid context key: ${result.error.issues[0]?.message}`
      );
    }
    return key;
  }

  static validateContextValue(value: any): any {
    const result = ContextValueSchema.safeParse(value);
    if (!result.success) {
      throw new Error(
        `Invalid context value: ${result.error.issues[0]?.message}`
      );
    }
    return value;
  }

  static validateShareType(shareType: string): string {
    const result = ShareTypeSchema.safeParse(shareType);
    if (!result.success) {
      throw new Error(`Invalid share type: ${result.error.issues[0]?.message}`);
    }
    return shareType;
  }

  static validatePermissions(permissions: string[]): string[] {
    if (!Array.isArray(permissions)) {
      throw new Error('Permissions must be an array');
    }

    const validPermissions = ['read', 'write', 'admin', 'delete', 'share'];
    const validatedPermissions: string[] = [];

    for (const permission of permissions) {
      if (typeof permission !== 'string') {
        throw new Error('All permissions must be strings');
      }

      const result = PermissionSchema.safeParse(permission);
      if (!result.success) {
        throw new Error(
          `Invalid permission: ${result.error.issues[0]?.message}`
        );
      }

      if (!validPermissions.includes(permission)) {
        throw new Error(`Unknown permission: ${permission}`);
      }

      validatedPermissions.push(permission);
    }

    return validatedPermissions;
  }

  static validateToken(token: string): string {
    const result = TokenSchema.safeParse(token);
    if (!result.success) {
      throw new Error(`Invalid token: ${result.error.issues[0]?.message}`);
    }
    return token;
  }

  static validateEventData(data: any): any {
    const result = EventDataSchema.safeParse(data);
    if (!result.success) {
      throw new Error(`Invalid event data: ${result.error.issues[0]?.message}`);
    }

    // Check data size
    const dataSize = JSON.stringify(data).length;
    if (dataSize > SECURITY_CONFIG.maxEventDataSize) {
      throw new Error(
        `Event data exceeds maximum size of ${SECURITY_CONFIG.maxEventDataSize} bytes`
      );
    }

    return data;
  }

  static sanitizeObject(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const sanitized: any = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
      // Skip prototype properties
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }

      // Check if key contains sensitive information
      const lowerKey = key.toLowerCase();
      const isSensitive = SECURITY_CONFIG.sanitizedFields.some((field) =>
        lowerKey.includes(field)
      );

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitized[key] = this.sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }

    return sanitized;
  }

static validateSnapshotId(snapshotId: string): string {
    if (!snapshotId || typeof snapshotId !== 'string') {
      throw new Error('Snapshot ID must be a non-empty string');
    }

    if (snapshotId.length > SECURITY_CONFIG.maxAgentIdLength) {
      throw new Error(`Snapshot ID exceeds maximum length of ${SECURITY_CONFIG.maxAgentIdLength}`);
    }

    return snapshotId;
  }

  static hashSensitiveData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

    if (snapshotId.length > SECURITY_CONFIG.maxAgentIdLength) {
      throw new Error(
        `Snapshot ID exceeds maximum length of ${SECURITY_CONFIG.maxAgentIdLength}`
      );
    }

    return snapshotId;
  }
}

export class SecurityLogger {
  private static logs: SecurityLogEntry[] = [];
  private static maxLogs = 1000;

  static log(entry: Omit<SecurityLogEntry, 'timestamp'>): void {
    const logEntry: SecurityLogEntry = {
      ...entry,
      timestamp: new Date(),
    };

    this.logs.push(logEntry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // In production, you might want to send this to a logging service
    console.warn('[Security]', logEntry);
  }

  static getLogs(): SecurityLogEntry[] {
    return [...this.logs];
  }

  static clearLogs(): void {
    this.logs = [];
  }

  static getLogsByAgentId(agentId: string): SecurityLogEntry[] {
    return this.logs.filter((log) => log.agentId === agentId);
  }

  static getLogsByType(type: SecurityLogEntry['type']): SecurityLogEntry[] {
    return this.logs.filter((log) => log.type === type);
  }

  static getLogsBySeverity(
    severity: SecurityLogEntry['severity']
  ): SecurityLogEntry[] {
    return this.logs.filter((log) => log.severity === severity);
  }
}

export class RateLimiter {
  private static instances: Map<string, RateLimiter> = new Map();
  private requests: number[] = [];

  private constructor(
    private key: string,
    private windowMs: number,
    private maxRequests: number
  ) {}

  static getInstance(
    key: string,
    windowMs: number,
    maxRequests: number
  ): RateLimiter {
    if (!this.instances.has(key)) {
      this.instances.set(key, new RateLimiter(key, windowMs, maxRequests));
    }
    return this.instances.get(key)!;
  }

  async checkLimit(identifier?: string): Promise<void> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Remove old requests outside the window
    this.requests = this.requests.filter(
      (timestamp) => timestamp > windowStart
    );

    if (this.requests.length >= this.maxRequests) {
      const error = new Error(
        `Rate limit exceeded for ${this.key}${identifier ? `:${identifier}` : ''}`
      );
      SecurityLogger.log({
        type: 'rate_limit',
        severity: 'medium',
        agentId: identifier || 'unknown',
        action: 'rate_limit_check',
        details: {
          requests: this.requests.length,
          maxRequests: this.maxRequests,
          windowMs: this.windowMs,
        },
      });
      throw error;
    }

    // Add current request
    this.requests.push(now);
  }

  getStats(): { current: number; max: number; windowMs: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const current = this.requests.filter(
      (timestamp) => timestamp > windowStart
    ).length;

    return {
      current,
      max: this.maxRequests,
      windowMs: this.windowMs,
    };
  }

  reset(): void {
    this.requests = [];
  }
}

export class SecurityAuditor {
  static auditContextAccess(
    agentId: string,
    action: string,
    result: 'success' | 'failure'
  ): void {
    SecurityLogger.log({
      type: 'data_access',
      severity: result === 'success' ? 'low' : 'medium',
      agentId,
      action,
      details: { result, timestamp: new Date() },
    });
  }

  static auditAuthenticationAttempt(
    agentId: string,
    token: string,
    result: 'success' | 'failure'
  ): void {
    SecurityLogger.log({
      type: 'authentication',
      severity: result === 'success' ? 'low' : 'high',
      agentId,
      action: 'auth_attempt',
      details: {
        result,
        tokenHash: SecurityValidator.hashSensitiveData(token.substring(0, 10)),
      },
    });
  }

  static auditPermissionCheck(
    agentId: string,
    permission: string,
    result: 'granted' | 'denied'
  ): void {
    SecurityLogger.log({
      type: 'authorization',
      severity: result === 'granted' ? 'low' : 'medium',
      agentId,
      action: 'permission_check',
      details: { permission, result },
    });
  }

  static auditDataModification(
    agentId: string,
    dataType: string,
    action: string
  ): void {
    SecurityLogger.log({
      type: 'data_access',
      severity: 'medium',
      agentId,
      action,
      details: { dataType, timestamp: new Date() },
    });
  }

  static generateSecurityReport(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    recentEvents: SecurityLogEntry[];
  } {
    const logs = SecurityLogger.getLogs();
    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};

    for (const log of logs) {
      eventsByType[log.type] = (eventsByType[log.type] || 0) + 1;
      eventsBySeverity[log.severity] =
        (eventsBySeverity[log.severity] || 0) + 1;
    }

    const recentEvents = logs.slice(-10); // Last 10 events

    return {
      totalEvents: logs.length,
      eventsByType,
      eventsBySeverity,
      recentEvents,
    };
  }
}

// Utility functions
export const hashSensitiveData = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

export const validateInput = (input: any, schema: z.ZodSchema): any => {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.issues[0]?.message}`);
  }
  return result.data;
};

export const sanitizeForLogging = (data: any): any => {
  return SecurityValidator.sanitizeObject(data);
};

export default {
  SecurityValidator,
  SecurityLogger,
  RateLimiter,
  SecurityAuditor,
  hashSensitiveData,
  validateInput,
  sanitizeForLogging,
  SECURITY_CONFIG,
};
