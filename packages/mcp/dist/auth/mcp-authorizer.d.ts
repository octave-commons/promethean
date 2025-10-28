/**
 * MCP Authorization System
 *
 * Implements MCP-specific authorization following OAuth 2.1 + PKCE standards
 * with proper token validation, scope management, and resource protection.
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { OAuthSystemConfig, JwtTokenConfig } from './types.js';
import type { OAuthUserInfo } from './oauth/types.js';
import type { UserRole, PermissionLevel } from '../core/authorization.js';
/**
 * MCP Authorization context
 */
export type McpAuthContext = Readonly<{
    readonly userId: string;
    readonly username: string;
    readonly email: string;
    readonly role: UserRole;
    readonly scopes: readonly string[];
    readonly sessionId: string;
    readonly provider: string;
    readonly expiresAt: number;
    readonly issuer: string;
    readonly audience: string;
}>;
/**
 * MCP Resource access requirements
 */
export type McpResourceRequirements = Readonly<{
    readonly requiredScopes: readonly string[];
    readonly allowedRoles?: readonly UserRole[];
    readonly maxPermissionLevel?: PermissionLevel;
    readonly dangerous?: boolean;
    readonly auditRequired?: boolean;
}>;
/**
 * MCP Authorization error types
 */
export type McpAuthError = Readonly<{
    readonly code: 'invalid_token' | 'expired_token' | 'insufficient_scope' | 'invalid_request' | 'server_error';
    readonly message: string;
    readonly description?: string;
    readonly statusCode: number;
}>;
/**
 * MCP Authorization configuration
 */
export type McpAuthConfig = Readonly<{
    readonly jwt: JwtTokenConfig;
    readonly oauth: OAuthSystemConfig;
    readonly strictMode: boolean;
    readonly requireAuthForDangerous: boolean;
    readonly adminIpWhitelist: readonly string[];
    readonly enableAuditLog: boolean;
    readonly tokenRefreshThreshold: number;
}>;
/**
 * MCP Authorizer class
 *
 * Provides OAuth 2.1 compliant authorization for MCP resources
 * with proper token validation, scope checking, and audit logging.
 */
export declare class McpAuthorizer {
    private config;
    private auditLog;
    constructor(config: McpAuthConfig);
    /**
     * Validate JWT access token and extract auth context
     */
    validateAccessToken(token: string): McpAuthContext | McpAuthError;
    /**
     * Authorize access to MCP resource
     */
    authorizeResource(authContext: McpAuthContext, resourcePath: string, requirements: McpResourceRequirements, request?: FastifyRequest): {
        allowed: boolean;
        error?: McpAuthError;
    };
    /**
     * Create Fastify middleware for MCP authorization
     */
    createAuthMiddleware(resourceRequirements: McpResourceRequirements): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    /**
     * Send standardized authentication error response
     */
    private sendAuthError;
    /**
     * Check if route is public (doesn't require authentication)
     */
    private isPublicRoute;
    /**
     * Log audit entry for security events
     */
    private logAuditEntry;
    /**
     * Get recent audit log entries
     */
    getAuditLog(count?: number): typeof this.auditLog;
    /**
     * Get audit log for specific user
     */
    getUserAuditLog(userId: string, count?: number): typeof this.auditLog;
    /**
     * Get denied access attempts
     */
    getDeniedAttempts(count?: number): typeof this.auditLog;
    /**
     * Generate new access token for user
     */
    generateAccessToken(userInfo: OAuthUserInfo, sessionId: string): {
        accessToken: string;
        expiresIn: number;
    };
    /**
     * Generate refresh token
     */
    generateRefreshToken(userInfo: OAuthUserInfo, sessionId: string): {
        refreshToken: string;
        expiresIn: number;
    };
    /**
     * Validate refresh token and extract user info
     */
    validateRefreshToken(token: string): {
        valid: boolean;
        userId?: string;
        sessionId?: string;
        provider?: string;
    };
    /**
     * Get authorization system health
     */
    getHealth(): {
        status: 'healthy' | 'degraded';
        config: {
            strictMode: boolean;
            requireAuthForDangerous: boolean;
            adminIpWhitelistSize: number;
            auditLogEnabled: boolean;
            auditLogSize: number;
        };
        timestamp: string;
    };
}
/**
 * Create MCP authorizer with configuration
 */
export declare function createMcpAuthorizer(config: McpAuthConfig): McpAuthorizer;
/**
 * Default MCP resource requirements for common operations
 */
export declare const MCP_RESOURCE_REQUIREMENTS: {
    readonly read: McpResourceRequirements;
    readonly write: McpResourceRequirements;
    readonly delete: McpResourceRequirements;
    readonly admin: McpResourceRequirements;
    readonly executeTool: McpResourceRequirements;
    readonly system: McpResourceRequirements;
};
//# sourceMappingURL=mcp-authorizer.d.ts.map