/**
 * Security utilities and validators for context management
 * Migrated from agent-context package
 */

import crypto from 'crypto';
import type { AgentId } from '../core/types/agent.js';

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
    'auth_token_revoked'
  ],
  sanitizedFields: ['password', 'token', 'secret', 'key', 'auth']
} as const;

export interface SecurityLogEntry {
  type: 'data_access' | 'auth' | 'rate_limit' | 'validation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  agentId?: string;
  action: string;
  details: Record<string, any>;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
}

export class SecurityValidator {
  static validateAgentId(agentId: string): string {
    if (!agentId || typeof agentId !== 'string') {
      throw new Error('Agent ID must be a non-empty string');
    }

    if (agentId.length > SECURITY_CONFIG.maxAgentIdLength) {
      throw new Error(`Agent ID exceeds maximum length of ${SECURITY_CONFIG.maxAgentIdLength}`);
    }

    // Check for potentially dangerous characters
    if (/[<>\"'&]/.test(agentId)) {
      throw new Error('Agent ID contains invalid characters');
    }

    return agentId.trim();
  }

  static validateToken(token: string): string {
    if (!token || typeof token !== 'string') {
      throw new Error('Token must be a non-empty string');
    }

    if (token.length > SECURITY_CONFIG.maxTokenLength) {
      throw new Error(`Token exceeds maximum length of ${SECURITY_CONFIG.maxTokenLength}`);
    }

    return token.trim();
  }

  static validateSnapshotId(snapshotId: string): string {
    if (!snapshotId || typeof snapshotId !== 'string') {
      throw new Error('Snapshot ID must be a non-empty string');
    }

    // Basic UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(snapshotId)) {
      throw new Error('Invalid snapshot ID format');
    }

    return snapshotId;
  }

  static validateEventData(data: unknown): Record<string, any> {
    if (!data || typeof data !== 'object') {
      throw new Error('Event data must be a valid object');
    }

    const dataStr = JSON.stringify(data);
    if (dataStr.length > SECURITY_CONFIG.maxEventDataSize) {
      throw new Error(`Event data exceeds maximum size of ${SECURITY_CONFIG.maxEventDataSize} bytes`);
    }

    // Sanitize sensitive fields
    return this.sanitizeObject(data);
  }

  static validateEventType(type: string): string {
    if (!type || typeof type !== 'string') {
      throw new Error('Event type must be a non-empty string');
    }

    if (!SECURITY_CONFIG.allowedEventTypes.includes(type as any)) {
      throw new Error(`Event type '${type}' is not allowed`);
    }

    return type;
  }

  static sanitizeObject(obj: unknown): Record<string, any> {
    if (!obj || typeof obj !== 'object') {
      return {};
    }

    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj as Record<string, any>)) {
      // Check if field should be sanitized
      const lowerKey = key.toLowerCase();
      const shouldSanitize = SECURITY_CONFIG.sanitizedFields.some(field => 
        lowerKey.includes(field.toLowerCase())
      );

      if (shouldSanitize) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  static validateContextSize(context: Record<string, any>): void {
    const size = JSON.stringify(context).length;
    if (size > SECURITY_CONFIG.maxContextSize) {
      throw new Error(`Context exceeds maximum size of ${SECURITY_CONFIG.maxContextSize} bytes`);
    }
  }

  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  static hashSensitiveData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

export class SecurityLogger {
  private static logs: SecurityLogEntry[] = [];
  private static maxLogs = 1000;

  static log(entry: Omit<SecurityLogEntry, 'timestamp'>): void {
    const logEntry: SecurityLogEntry = {
      ...entry,
      timestamp: new Date()
    };

    this.logs.push(logEntry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // In production, you'd want to send this to a proper logging service
    console.warn('[SECURITY]', JSON.stringify(logEntry, null, 2));
  }

  static getLogs(agentId?: string, limit?: number): SecurityLogEntry[] {
    let filteredLogs = this.logs;

    if (agentId) {
      filteredLogs = filteredLogs.filter(log => log.agentId === agentId);
    }

    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }

    return filteredLogs;
  }

  static clearLogs(): void {
    this.logs = [];
  }

  static getSecurityStats(): {
    totalLogs: number;
    criticalLogs: number;
    highSeverityLogs: number;
    recentActivity: SecurityLogEntry[];
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    return {
      totalLogs: this.logs.length,
      criticalLogs: this.logs.filter(log => log.severity === 'critical').length,
      highSeverityLogs: this.logs.filter(log => log.severity === 'high').length,
      recentActivity: this.logs.filter(log => log.timestamp >= oneHourAgo)
    };
  }
}

export class RateLimiter {
  private static instances: Map<string, RateLimiter> = new Map();
  private requests: Map<string, number[]> = new Map();

  private constructor(
    private name: string,
    private windowMs: number,
    private maxRequests: number
  ) {}

  static getInstance(name: string, windowMs: number, maxRequests: number): RateLimiter {
    if (!this.instances.has(name)) {
      this.instances.set(name, new RateLimiter(name, windowMs, maxRequests));
    }
    return this.instances.get(name)!;
  }

  async checkLimit(identifier: string): Promise<void> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing requests for this identifier
    let timestamps = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    timestamps = timestamps.filter(timestamp => timestamp > windowStart);

    // Check if limit exceeded
    if (timestamps.length >= this.maxRequests) {
      SecurityLogger.log({
        type: 'rate_limit',
        severity: 'medium',
        action: 'rate_limit_exceeded',
        details: {
          identifier,
          requestCount: timestamps.length,
          maxRequests: this.maxRequests,
          windowMs: this.windowMs
        }
      });

      throw new Error(`Rate limit exceeded for ${identifier}. Maximum ${this.maxRequests} requests per ${this.windowMs}ms.`);
    }

    // Add current request
    timestamps.push(now);
    this.requests.set(identifier, timestamps);

    // Clean up old entries periodically
    this.cleanup();
  }

  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [identifier, timestamps] of this.requests.entries()) {
      const filtered = timestamps.filter(timestamp => timestamp > windowStart);
      if (filtered.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, filtered);
      }
    }
  }

  getStats(): {
    totalIdentifiers: number;
    activeRequests: number;
    averageRequestsPerIdentifier: number;
  } {
    const totalIdentifiers = this.requests.size;
    const activeRequests = Array.from(this.requests.values())
      .reduce((sum, timestamps) => sum + timestamps.length, 0);
    const averageRequestsPerIdentifier = totalIdentifiers > 0 ? activeRequests / totalIdentifiers : 0;

    return {
      totalIdentifiers,
      activeRequests,
      averageRequestsPerIdentifier
    };
  }

  reset(): void {
    this.requests.clear();
  }
}

export default {
  SecurityValidator,
  SecurityLogger,
  RateLimiter,
  SECURITY_CONFIG
};