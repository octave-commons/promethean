/**
 * @fileoverview Comprehensive security middleware for MCP service
 * Provides rate limiting, security headers, audit logging, and abuse prevention
 */
import type { FastifyInstance } from 'fastify';
export interface SecurityConfig {
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
    globalRateLimitMaxPerMinute: number;
    globalRateLimitMaxPerHour: number;
    maxFailedAttempts: number;
    ipBlockDurationMs: number;
    violationDecayHours: number;
    maxRequestSizeBytes: number;
    maxUrlLength: number;
    enableSecurityHeaders: boolean;
    allowedOrigins: string[];
    enableAuditLog: boolean;
    auditLogSensitiveData: boolean;
}
export declare const DEFAULT_SECURITY_CONFIG: SecurityConfig;
export interface SecurityContext {
    requestId: string;
    clientIp: string;
    userAgent: string;
    timestamp: number;
    method: string;
    url: string;
    path: string;
    userAgentHash: string;
}
export interface SecurityViolation {
    type: 'rate_limit' | 'blocked_ip' | 'large_request' | 'invalid_url' | 'suspicious_pattern' | 'path_traversal_attempt' | 'injection_attempt' | 'oversized_input';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    context: SecurityContext;
    timestamp: number;
}
export interface AuditLogEntry {
    timestamp: string;
    requestId: string;
    clientIp: string;
    method: string;
    url: string;
    path: string;
    userAgent: string;
    statusCode?: number;
    duration?: number;
    requestSize?: number;
    responseSize?: number;
    violations?: SecurityViolation[];
    blocked: boolean;
    reason?: string;
}
export declare class McpSecurityMiddleware {
    private config;
    private rateLimitStore;
    private blockedIpStore;
    private auditLog;
    private cleanupInterval?;
    constructor(config?: Partial<SecurityConfig>);
    destroy(): void;
    register(app: FastifyInstance): void;
    private createSecurityContext;
    private enforceRateLimit;
    private validateRequestSize;
    private detectSuspiciousPatterns;
    private addSecurityHeaders;
    private logRequestStart;
    private logRequestEnd;
    private logError;
    private handleRepeatedViolations;
    private logViolation;
    private getClientIp;
    private sendSecurityResponse;
    private addAuditEntry;
    private trimAuditLog;
    getAuditLog(options?: {
        limit?: number;
        clientIp?: string;
        startTime?: Date;
        endTime?: Date;
        onlyViolations?: boolean;
    }): AuditLogEntry[];
    getBlockedIps(): Array<{
        ip: string;
        blockedUntil: Date;
        reason: string;
        attempts: number;
    }>;
    getSecurityStats(): {
        totalRequests: number;
        blockedRequests: number;
        violationsByType: Record<string, number>;
        topBlockedIps: Array<{
            ip: string;
            count: number;
        }>;
    };
}
export declare function createSecurityMiddleware(config?: Partial<SecurityConfig>): McpSecurityMiddleware;
//# sourceMappingURL=middleware.d.ts.map