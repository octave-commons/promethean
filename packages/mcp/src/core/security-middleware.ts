/**
 * Advanced Security Middleware for MCP Server
 *
 * Provides IP-based blocking, global rate limiting, input validation,
 * and enhanced security headers to achieve 9/10 security score.
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'node:crypto';

// Security Configuration
export interface SecurityConfig {
  // Rate Limiting
  globalRateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };

  // IP Blocking
  ipBlocking: {
    maxViolations: number;
    blockDurationMinutes: number;
    violationDecayHours: number;
  };

  // Input Validation
  inputLimits: {
    maxRequestBodySize: number; // bytes
    maxQueryParamLength: number;
    maxHeaderSize: number;
    maxUrlLength: number;
  };

  // Security Headers
  securityHeaders: {
    enableCSP: boolean;
    enableHSTS: boolean;
    enableXFrameOptions: boolean;
    enableXContentTypeOptions: boolean;
    enableReferrerPolicy: boolean;
  };
}

// Violation Types
export type ViolationType =
  | 'rate_limit_exceeded'
  | 'invalid_authentication'
  | 'path_traversal_attempt'
  | 'injection_attempt'
  | 'oversized_input'
  | 'suspicious_pattern'
  | 'blocked_ip';

// Security Event
export interface SecurityEvent {
  id: string;
  timestamp: Date;
  ipAddress: string;
  userId?: string;
  violationType: ViolationType;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userAgent?: string;
  endpoint?: string;
}

// IP Block Entry
interface IPBlockEntry {
  ipAddress: string;
  blockedAt: Date;
  expiresAt: Date;
  reason: string;
  violationCount: number;
  lastViolation: Date;
}

// Rate Limit Entry
interface RateLimitEntry {
  count: number;
  windowStart: number;
  resetTime: number;
  violations: number;
}

// Security Statistics
export interface SecurityStats {
  totalRequests: number;
  blockedRequests: number;
  activeIPBlocks: number;
  rateLimitViolations: number;
  securityEvents: number;
  averageRequestsPerMinute: number;
}

export class SecurityMiddleware {
  private readonly config: SecurityConfig;
  private readonly ipBlocks = new Map<string, IPBlockEntry>();
  private readonly rateLimits = new Map<string, RateLimitEntry>();
  private readonly securityEvents: SecurityEvent[] = [];
  private readonly globalStats: SecurityStats = {
    totalRequests: 0,
    blockedRequests: 0,
    activeIPBlocks: 0,
    rateLimitViolations: 0,
    securityEvents: 0,
    averageRequestsPerMinute: 0,
  };

  // Request tracking for rate limiting
  private requestTimes: number[] = [];

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      globalRateLimit: {
        requestsPerMinute: 1000,
        requestsPerHour: 10000,
        requestsPerDay: 100000,
      },
      ipBlocking: {
        maxViolations: 10,
        blockDurationMinutes: 60,
        violationDecayHours: 24,
      },
      inputLimits: {
        maxRequestBodySize: 1024 * 1024, // 1MB
        maxQueryParamLength: 2000,
        maxHeaderSize: 8000,
        maxUrlLength: 2000,
      },
      securityHeaders: {
        enableCSP: true,
        enableHSTS: true,
        enableXFrameOptions: true,
        enableXContentTypeOptions: true,
        enableReferrerPolicy: true,
      },
      ...config,
    };

    // Cleanup expired entries periodically
    setInterval(() => this.cleanup(), 5 * 60 * 1000); // Every 5 minutes
  }

  // Main middleware function
  createMiddleware() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const clientIP = this.getClientIP(request);

      try {
        // Update statistics
        this.globalStats.totalRequests++;
        this.updateRequestTracking();

        // Check if IP is blocked
        if (this.isIPBlocked(clientIP)) {
          await this.recordSecurityEvent({
            id: crypto.randomUUID(),
            timestamp: new Date(),
            ipAddress: clientIP,
            violationType: 'blocked_ip',
            details: { endpoint: request.url },
            severity: 'high',
            userAgent: request.headers['user-agent'],
            endpoint: request.url,
          });

          this.globalStats.blockedRequests++;
          return reply.status(403).send({
            error: 'Access Denied',
            message: 'Your IP address has been blocked due to suspicious activity',
          });
        }

        // Validate input sizes
        const inputValidation = this.validateInputSizes(request);
        if (!inputValidation.valid) {
          await this.recordViolation(clientIP, 'oversized_input', {
            reason: inputValidation.reason,
            endpoint: request.url,
          });

          return reply.status(413).send({
            error: 'Payload Too Large',
            message: inputValidation.reason,
          });
        }

        // Check for suspicious patterns
        const suspiciousCheck = this.checkSuspiciousPatterns(request);
        if (suspiciousCheck.isSuspicious) {
          await this.recordViolation(clientIP, suspiciousCheck.violationType!, {
            pattern: suspiciousCheck.pattern,
            endpoint: request.url,
          });

          if (suspiciousCheck.severity === 'critical') {
            return reply.status(400).send({
              error: 'Bad Request',
              message: 'Request contains suspicious content',
            });
          }
        }

        // Apply global rate limiting
        if (!this.checkGlobalRateLimit(clientIP)) {
          await this.recordViolation(clientIP, 'rate_limit_exceeded', {
            endpoint: request.url,
          });

          this.globalStats.rateLimitViolations++;
          return reply.status(429).send({
            error: 'Too Many Requests',
            message: 'Global rate limit exceeded',
            'retry-after': '60',
          });
        }

        // Add security headers
        this.addSecurityHeaders(reply);

        // Continue with request
        return;
      } catch (error) {
        console.error('[security] Middleware error:', error);
        // Fail open - allow request but log error
        return;
      }
    };
  }

  // Client IP extraction
  private getClientIP(request: FastifyRequest): string {
    // Check various headers for real IP
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor && typeof forwardedFor === 'string') {
      return forwardedFor.split(',')[0]?.trim() || forwardedFor;
    }

    const realIP = request.headers['x-real-ip'];
    if (realIP && typeof realIP === 'string') {
      return realIP;
    }

    const cfConnectingIP = request.headers['cf-connecting-ip'];
    if (cfConnectingIP && typeof cfConnectingIP === 'string') {
      return cfConnectingIP;
    }

    return request.ip || 'unknown';
  }

  // IP Blocking Management
  private isIPBlocked(ipAddress: string): boolean {
    const block = this.ipBlocks.get(ipAddress);
    if (!block) return false;

    // Check if block has expired
    if (Date.now() > block.expiresAt.getTime()) {
      this.ipBlocks.delete(ipAddress);
      return false;
    }

    return true;
  }

  private blockIP(ipAddress: string, reason: string, durationMinutes?: number): void {
    const duration = durationMinutes || this.config.ipBlocking.blockDurationMinutes;
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);

    const existingBlock = this.ipBlocks.get(ipAddress);
    if (existingBlock) {
      existingBlock.expiresAt = expiresAt;
      existingBlock.reason = reason;
      existingBlock.violationCount++;
      existingBlock.lastViolation = new Date();
    } else {
      this.ipBlocks.set(ipAddress, {
        ipAddress,
        blockedAt: new Date(),
        expiresAt,
        reason,
        violationCount: 1,
        lastViolation: new Date(),
      });
    }

    console.warn(
      `[security] IP blocked: ${ipAddress} - ${reason} (expires: ${expiresAt.toISOString()})`,
    );
  }

  // Violation Recording
  private async recordViolation(
    ipAddress: string,
    violationType: ViolationType,
    details: Record<string, any>,
  ): Promise<void> {
    const block = this.ipBlocks.get(ipAddress);
    const currentViolations = block?.violationCount || 0;

    // Record security event
    await this.recordSecurityEvent({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ipAddress,
      violationType,
      details,
      severity: this.getViolationSeverity(violationType),
    });

    // Check if IP should be blocked
    if (currentViolations >= this.config.ipBlocking.maxViolations - 1) {
      this.blockIP(ipAddress, `Too many violations: ${violationType}`);
    } else {
      // Update or create block entry for tracking
      if (block) {
        block.violationCount++;
        block.lastViolation = new Date();
      } else {
        // Create tracking entry without blocking
        this.ipBlocks.set(ipAddress, {
          ipAddress,
          blockedAt: new Date(),
          expiresAt: new Date(
            Date.now() + this.config.ipBlocking.violationDecayHours * 60 * 60 * 1000,
          ),
          reason: 'violation_tracking',
          violationCount: 1,
          lastViolation: new Date(),
        });
      }
    }
  }

  private getViolationSeverity(
    violationType: ViolationType,
  ): 'low' | 'medium' | 'high' | 'critical' {
    switch (violationType) {
      case 'rate_limit_exceeded':
        return 'low';
      case 'oversized_input':
        return 'medium';
      case 'invalid_authentication':
        return 'medium';
      case 'suspicious_pattern':
        return 'high';
      case 'path_traversal_attempt':
      case 'injection_attempt':
        return 'critical';
      case 'blocked_ip':
        return 'high';
      default:
        return 'medium';
    }
  }

  // Input Validation
  private validateInputSizes(request: FastifyRequest): { valid: boolean; reason?: string } {
    // Check URL length
    if (request.url.length > this.config.inputLimits.maxUrlLength) {
      return {
        valid: false,
        reason: `URL too long: ${request.url.length} > ${this.config.inputLimits.maxUrlLength}`,
      };
    }

    // Check query parameters
    const queryString = request.url.split('?')[1] || '';
    if (queryString.length > this.config.inputLimits.maxQueryParamLength) {
      return {
        valid: false,
        reason: `Query string too long: ${queryString.length} > ${this.config.inputLimits.maxQueryParamLength}`,
      };
    }

    // Check headers
    const headerSize = JSON.stringify(request.headers).length;
    if (headerSize > this.config.inputLimits.maxHeaderSize) {
      return {
        valid: false,
        reason: `Headers too large: ${headerSize} > ${this.config.inputLimits.maxHeaderSize}`,
      };
    }

    // Check content length for POST/PUT requests
    const contentLength = request.headers['content-length'];
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (size > this.config.inputLimits.maxRequestBodySize) {
        return {
          valid: false,
          reason: `Request body too large: ${size} > ${this.config.inputLimits.maxRequestBodySize}`,
        };
      }
    }

    return { valid: true };
  }

  // Suspicious Pattern Detection
  private checkSuspiciousPatterns(request: FastifyRequest): {
    isSuspicious: boolean;
    pattern?: string;
    violationType?: ViolationType;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  } {
    const url = request.url.toLowerCase();
    const userAgent = (request.headers['user-agent'] || '').toLowerCase();

    // Path traversal patterns
    const pathTraversalPatterns = ['../', '..\\', '%2e%2e%2f', '%2e%2e\\', '....//', '....\\\\'];

    for (const pattern of pathTraversalPatterns) {
      if (url.includes(pattern)) {
        return {
          isSuspicious: true,
          pattern,
          violationType: 'path_traversal_attempt',
          severity: 'critical',
        };
      }
    }

    // Injection patterns
    const injectionPatterns = [
      '<script',
      'javascript:',
      'vbscript:',
      'onload=',
      'onerror=',
      'onclick=',
      'eval(',
      'alert(',
      'prompt(',
      'confirm(',
      'document.cookie',
      'window.location',
      'union select',
      'drop table',
      'insert into',
      'delete from',
      'update set',
      'exec(',
      'system(',
      'shell_exec',
      'passthru',
    ];

    const fullRequest = url + JSON.stringify(request.query) + JSON.stringify(request.body);
    const fullRequestLower = fullRequest.toLowerCase();

    for (const pattern of injectionPatterns) {
      if (fullRequestLower.includes(pattern)) {
        return {
          isSuspicious: true,
          pattern,
          violationType: 'injection_attempt',
          severity: 'critical',
        };
      }
    }

    // Suspicious user agents
    const suspiciousUserAgents = [
      'sqlmap',
      'nikto',
      'nmap',
      'masscan',
      'zap',
      'burp',
      'scanner',
      'crawler',
      'bot',
    ];

    for (const pattern of suspiciousUserAgents) {
      if (userAgent.includes(pattern)) {
        return {
          isSuspicious: true,
          pattern,
          violationType: 'suspicious_pattern',
          severity: 'medium',
        };
      }
    }

    return { isSuspicious: false };
  }

  // Global Rate Limiting
  private checkGlobalRateLimit(ipAddress: string): boolean {
    const now = Date.now();
    const minuteMs = 60 * 1000;
    const hourMs = 60 * 60 * 1000;
    const dayMs = 24 * 60 * 60 * 1000;

    let entry = this.rateLimits.get(ipAddress);
    if (!entry) {
      entry = {
        count: 0,
        windowStart: now,
        resetTime: now + dayMs,
        violations: 0,
      };
      this.rateLimits.set(ipAddress, entry);
    }

    // Reset if window expired
    if (now > entry.resetTime) {
      entry.count = 0;
      entry.windowStart = now;
      entry.resetTime = now + dayMs;
      entry.violations = 0;
    }

    // Check per-minute limit
    const timeInMinute = now - entry.windowStart;
    if (timeInMinute < minuteMs && entry.count >= this.config.globalRateLimit.requestsPerMinute) {
      return false;
    }

    // Check per-hour limit
    if (timeInMinute < hourMs && entry.count >= this.config.globalRateLimit.requestsPerHour) {
      return false;
    }

    // Check per-day limit
    if (entry.count >= this.config.globalRateLimit.requestsPerDay) {
      return false;
    }

    entry.count++;
    return true;
  }

  // Security Headers
  private addSecurityHeaders(reply: FastifyReply): void {
    const headers = this.config.securityHeaders;

    if (headers.enableCSP) {
      reply.header(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
      );
    }

    if (headers.enableHSTS) {
      reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    if (headers.enableXFrameOptions) {
      reply.header('X-Frame-Options', 'DENY');
    }

    if (headers.enableXContentTypeOptions) {
      reply.header('X-Content-Type-Options', 'nosniff');
    }

    if (headers.enableReferrerPolicy) {
      reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    // Additional security headers
    reply.header('X-XSS-Protection', '1; mode=block');
    reply.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    reply.header('Cross-Origin-Embedder-Policy', 'require-corp');
    reply.header('Cross-Origin-Opener-Policy', 'same-origin');
  }

  // Request Tracking
  private updateRequestTracking(): void {
    const now = Date.now();
    this.requestTimes.push(now);

    // Keep only last minute of requests
    const oneMinuteAgo = now - 60 * 1000;
    this.requestTimes = this.requestTimes.filter((time) => time > oneMinuteAgo);

    // Update average
    this.globalStats.averageRequestsPerMinute = this.requestTimes.length;
  }

  // Security Event Recording
  private async recordSecurityEvent(event: SecurityEvent): Promise<void> {
    this.securityEvents.push(event);
    this.globalStats.securityEvents++;

    // Keep only last 10000 events
    if (this.securityEvents.length > 10000) {
      this.securityEvents.splice(0, 1000);
    }

    // Log critical events
    if (event.severity === 'critical') {
      console.error(
        `[security] Critical event: ${event.violationType} from ${event.ipAddress}`,
        event.details,
      );
    }
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();

    // Clean up expired IP blocks
    for (const [ip, block] of this.ipBlocks.entries()) {
      if (now > block.expiresAt.getTime()) {
        this.ipBlocks.delete(ip);
      }
    }

    // Clean up expired rate limits
    for (const [ip, entry] of this.rateLimits.entries()) {
      if (now > entry.resetTime) {
        this.rateLimits.delete(ip);
      }
    }

    // Clean up old security events
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const initialLength = this.securityEvents.length;
    this.securityEvents.filter((event) => event.timestamp.getTime() > oneDayAgo);

    if (this.securityEvents.length !== initialLength) {
      // Remove old events
      this.securityEvents.splice(0, initialLength - this.securityEvents.length);
    }

    this.globalStats.activeIPBlocks = this.ipBlocks.size;
  }

  // Public API Methods

  // Get security statistics
  getSecurityStats(): SecurityStats {
    return { ...this.globalStats };
  }

  // Get recent security events
  getRecentEvents(limit: number = 100): SecurityEvent[] {
    return this.securityEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get blocked IPs
  getBlockedIPs(): IPBlockEntry[] {
    return Array.from(this.ipBlocks.values())
      .filter((block) => Date.now() <= block.expiresAt.getTime())
      .sort((a, b) => b.expiresAt.getTime() - a.expiresAt.getTime());
  }

  // Manually block an IP
  blockIPManually(ipAddress: string, reason: string, durationMinutes: number = 60): void {
    this.blockIP(ipAddress, reason, durationMinutes);
  }

  // Unblock an IP
  unblockIP(ipAddress: string): boolean {
    return this.ipBlocks.delete(ipAddress);
  }

  // Clear all expired blocks
  clearExpiredBlocks(): number {
    const now = Date.now();
    let cleared = 0;

    for (const [ip, block] of this.ipBlocks.entries()) {
      if (now > block.expiresAt.getTime()) {
        this.ipBlocks.delete(ip);
        cleared++;
      }
    }

    return cleared;
  }
}

// Global instance
export const securityMiddleware = new SecurityMiddleware();

// Helper function to create middleware
export function createSecurityMiddleware(config?: Partial<SecurityConfig>) {
  const instance = new SecurityMiddleware(config);
  return instance.createMiddleware();
}
