/**
 * MCP Authentication Middleware
 *
 * Comprehensive authentication middleware that integrates JWT, API keys,
 * OAuth, and environment-based authentication with proper security controls.
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { AuthenticationManager, AuthContext } from '../core/authentication.js';
import type { McpAuthorizer, McpAuthContext } from './mcp-authorizer.js';
import type { OAuthIntegration } from './integration.js';
import type { UserRole } from '../core/authorization.js';
/**
 * Authentication middleware configuration
 */
export type AuthMiddlewareConfig = Readonly<{
    required?: boolean;
    allowedMethods?: readonly ('jwt' | 'api_key' | 'oauth' | 'env')[];
    allowedRoles?: readonly UserRole[];
    requiredPermissions?: readonly string[];
    resourcePath?: string;
    dangerous?: boolean;
    auditRequired?: boolean;
    enableRateLimit?: boolean;
    requestsPerMinute?: number;
    requestsPerHour?: number;
    allowedIpRanges?: readonly string[];
    blockedIpRanges?: readonly string[];
    requireValidSession?: boolean;
    maxSessionAge?: number;
    allowedOAuthProviders?: readonly string[];
    requireOAuthVerification?: boolean;
}>;
/**
 * Authentication result with enhanced context
 */
export type EnhancedAuthResult = Readonly<{
    success: boolean;
    context?: AuthContext;
    mcpContext?: McpAuthContext;
    error?: string;
    method?: 'jwt' | 'api_key' | 'oauth' | 'env';
    warnings?: string[];
}>;
/**
 * Comprehensive authentication middleware
 */
export declare class McpAuthMiddleware {
    private readonly authManager;
    private readonly mcpAuthorizer;
    private readonly oauthIntegration?;
    private readonly rateLimitMap;
    private readonly ipBlockList;
    private readonly failedAttempts;
    private readonly maxFailedAttempts;
    private readonly blockDuration;
    private readonly cleanupInterval;
    constructor(authManager: AuthenticationManager, mcpAuthorizer: McpAuthorizer, oauthIntegration?: OAuthIntegration);
    /**
     * Create authentication middleware with configuration
     */
    createMiddleware(config?: AuthMiddlewareConfig): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    /**
     * Authenticate request using multiple methods
     */
    private authenticateRequest;
    /**
     * Try JWT authentication
     */
    private tryJwtAuth;
    /**
     * Try API key authentication
     */
    private tryApiKeyAuth;
    /**
     * Try OAuth authentication
     */
    private tryOAuthAuth;
    /**
     * Try environment-based authentication
     */
    private tryEnvAuth;
    /**
     * Create MCP authentication context
     */
    private createMcpContext;
    /**
     * Create guest context for unauthenticated access
     */
    private createGuestContext;
    /**
     * Check IP restrictions
     */
    private checkIpRestrictions;
    /**
     * Check rate limiting
     */
    private checkRateLimit;
    /**
     * Validate session
     */
    private validateSession;
    /**
     * Track failed authentication attempts
     */
    private trackFailedAttempt;
    /**
     * Add security headers to response
     */
    private addSecurityHeaders;
    /**
     * Log security events
     */
    private logSecurityEvent;
    /**
     * Cleanup expired entries
     */
    private cleanup;
    /**
     * Get authentication statistics
     */
    getStats(): {
        blockedIps: number;
        rateLimitedClients: number;
        failedAttempts: number;
    };
}
/**
 * Create authentication middleware factory
 */
export declare function createAuthMiddleware(authManager: AuthenticationManager, mcpAuthorizer: McpAuthorizer, oauthIntegration?: OAuthIntegration): McpAuthMiddleware;
//# sourceMappingURL=middleware.d.ts.map