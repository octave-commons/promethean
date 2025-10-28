/**
 * Advanced Security Middleware for MCP Server
 *
 * Provides IP-based blocking, global rate limiting, input validation,
 * and enhanced security headers to achieve 9/10 security score.
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
export interface SecurityConfig {
    globalRateLimit: {
        requestsPerMinute: number;
        requestsPerHour: number;
        requestsPerDay: number;
    };
    ipBlocking: {
        maxViolations: number;
        blockDurationMinutes: number;
        violationDecayHours: number;
    };
    inputLimits: {
        maxRequestBodySize: number;
        maxQueryParamLength: number;
        maxHeaderSize: number;
        maxUrlLength: number;
    };
    securityHeaders: {
        enableCSP: boolean;
        enableHSTS: boolean;
        enableXFrameOptions: boolean;
        enableXContentTypeOptions: boolean;
        enableReferrerPolicy: boolean;
    };
}
export type ViolationType = 'rate_limit_exceeded' | 'invalid_authentication' | 'path_traversal_attempt' | 'injection_attempt' | 'oversized_input' | 'suspicious_pattern' | 'blocked_ip';
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
interface IPBlockEntry {
    ipAddress: string;
    blockedAt: Date;
    expiresAt: Date;
    reason: string;
    violationCount: number;
    lastViolation: Date;
}
export interface SecurityStats {
    totalRequests: number;
    blockedRequests: number;
    activeIPBlocks: number;
    rateLimitViolations: number;
    securityEvents: number;
    averageRequestsPerMinute: number;
}
export declare class SecurityMiddleware {
    private readonly config;
    private readonly ipBlocks;
    private readonly rateLimits;
    private readonly securityEvents;
    private readonly globalStats;
    private requestTimes;
    constructor(config?: Partial<SecurityConfig>);
    createMiddleware(): (request: FastifyRequest, reply: FastifyReply) => Promise<undefined>;
    private getClientIP;
    private isIPBlocked;
    private blockIP;
    private recordViolation;
    private getViolationSeverity;
    private validateInputSizes;
    private checkSuspiciousPatterns;
    private checkGlobalRateLimit;
    private addSecurityHeaders;
    private updateRequestTracking;
    private recordSecurityEvent;
    private cleanup;
    getSecurityStats(): SecurityStats;
    getRecentEvents(limit?: number): SecurityEvent[];
    getBlockedIPs(): IPBlockEntry[];
    blockIPManually(ipAddress: string, reason: string, durationMinutes?: number): void;
    unblockIP(ipAddress: string): boolean;
    clearExpiredBlocks(): number;
}
export declare const securityMiddleware: SecurityMiddleware;
export declare function createSecurityMiddleware(config?: Partial<SecurityConfig>): (request: FastifyRequest, reply: FastifyReply) => Promise<undefined>;
export {};
//# sourceMappingURL=security-middleware.d.ts.map