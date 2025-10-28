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

// Input validation utilities
export class SecurityValidator {
  static validateAgentId(id: unknown): string {
    return AgentIdSchema.parse(id);
  }

  static validateContextKey(key: unknown): string {
    return ContextKeySchema.parse(key);
  }

  static validateContextValue(value: unknown): unknown {
    return ContextValueSchema.parse(value);
  }

  static validateShareType(shareType: unknown): 'read' | 'write' | 'admin' {
    return ShareTypeSchema.parse(shareType);
  }

  static validatePermissions(permissions: unknown): string[] {
    if (Array.isArray(permissions)) {
      return permissions.map((p) => PermissionSchema.parse(p));
    }
    throw new Error('Permissions must be an array');
  }

  static validateToken(token: unknown): string {
    return TokenSchema.parse(token);
  }

  static validateEventData(data: unknown): Record<string, unknown> {
    return EventDataSchema.parse(data);
  }

  static validateSnapshotId(snapshotId: unknown): string {
    return SnapshotIdSchema.parse(snapshotId);
  }

  static validateMetadataQuery(query: unknown): any {
    return MetadataQuerySchema.parse(query);
  }

  // Sanitization utilities
  static sanitizeString(input: unknown, maxLength: number = 1000): string {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }

    // Remove potentially dangerous characters
    let sanitized = input
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Control characters
      .replace(/[\uFFFE\uFFFF]/g, '') // Invalid Unicode
      .trim();

    // Truncate if too long
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  }

  static sanitizeObject(obj: unknown): unknown {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    const sanitized: Record<string, unknown> = {};
    const objRecord = obj as Record<string, unknown>;
    for (const key in objRecord) {
      // Skip dangerous prototype properties
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }

      sanitized[key] = this.sanitizeObject(objRecord[key]);
    }

    return sanitized;
  }
}

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
