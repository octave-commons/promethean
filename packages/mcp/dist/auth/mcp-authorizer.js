/**
 * MCP Authorization System
 *
 * Implements MCP-specific authorization following OAuth 2.1 + PKCE standards
 * with proper token validation, scope management, and resource protection.
 */
import * as jwt from 'jsonwebtoken';
/**
 * MCP Authorizer class
 *
 * Provides OAuth 2.1 compliant authorization for MCP resources
 * with proper token validation, scope checking, and audit logging.
 */
export class McpAuthorizer {
    config;
    auditLog = [];
    constructor(config) {
        this.config = config;
    }
    /**
     * Validate JWT access token and extract auth context
     */
    validateAccessToken(token) {
        try {
            // Verify JWT token
            const decoded = jwt.verify(token, this.config.jwt.secret, {
                issuer: this.config.jwt.issuer,
                audience: this.config.jwt.audience,
                algorithms: [this.config.jwt.algorithm],
            });
            // Validate token structure
            if (!decoded.sub || !decoded.role || !decoded.scopes) {
                return {
                    code: 'invalid_token',
                    message: 'Token missing required claims',
                    statusCode: 401,
                };
            }
            // Check token expiration
            const now = Math.floor(Date.now() / 1000);
            if (decoded.exp && decoded.exp < now) {
                return {
                    code: 'expired_token',
                    message: 'Token has expired',
                    statusCode: 401,
                };
            }
            // Validate role
            const validRoles = ['guest', 'user', 'developer', 'admin'];
            if (!validRoles.includes(decoded.role)) {
                return {
                    code: 'invalid_token',
                    message: 'Invalid user role in token',
                    statusCode: 401,
                };
            }
            // Validate scopes
            if (!Array.isArray(decoded.scopes) || decoded.scopes.length === 0) {
                return {
                    code: 'invalid_token',
                    message: 'Invalid scopes in token',
                    statusCode: 401,
                };
            }
            return {
                userId: decoded.sub,
                username: decoded.username || decoded.sub,
                email: decoded.email || `${decoded.sub}@mcp.local`,
                role: decoded.role,
                scopes: decoded.scopes,
                sessionId: decoded.sid || 'unknown',
                provider: decoded.provider || 'unknown',
                expiresAt: decoded.exp || 0,
                issuer: decoded.iss || this.config.jwt.issuer,
                audience: decoded.aud || this.config.jwt.audience,
            };
        }
        catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return {
                    code: 'expired_token',
                    message: 'Token has expired',
                    statusCode: 401,
                };
            }
            if (error instanceof jwt.JsonWebTokenError) {
                return {
                    code: 'invalid_token',
                    message: 'Invalid token format or signature',
                    statusCode: 401,
                };
            }
            return {
                code: 'server_error',
                message: 'Token validation failed',
                description: error instanceof Error ? error.message : 'Unknown error',
                statusCode: 500,
            };
        }
    }
    /**
     * Authorize access to MCP resource
     */
    authorizeResource(authContext, resourcePath, requirements, request) {
        // 1. Check required scopes
        if (requirements.requiredScopes.length > 0) {
            const hasRequiredScopes = requirements.requiredScopes.every((scope) => authContext.scopes.includes(scope));
            if (!hasRequiredScopes) {
                const error = {
                    code: 'insufficient_scope',
                    message: 'Insufficient scopes for resource access',
                    description: `Required scopes: ${requirements.requiredScopes.join(', ')}. User scopes: ${authContext.scopes.join(', ')}`,
                    statusCode: 403,
                };
                this.logAuditEntry(authContext, resourcePath, 'denied', error.message, request);
                return { allowed: false, error };
            }
        }
        // 2. Check role restrictions
        if (requirements.allowedRoles && requirements.allowedRoles.length > 0) {
            if (!requirements.allowedRoles.includes(authContext.role)) {
                const error = {
                    code: 'insufficient_scope',
                    message: 'User role not allowed for this resource',
                    description: `Allowed roles: ${requirements.allowedRoles.join(', ')}. User role: ${authContext.role}`,
                    statusCode: 403,
                };
                this.logAuditEntry(authContext, resourcePath, 'denied', error.message, request);
                return { allowed: false, error };
            }
        }
        // 3. Check permission level (if specified)
        if (requirements.maxPermissionLevel) {
            const roleHierarchy = { guest: 0, user: 1, developer: 2, admin: 3 };
            const permissionHierarchy = {
                read: 0,
                write: 1,
                delete: 2,
                admin: 3,
            };
            const userLevel = roleHierarchy[authContext.role];
            const requiredLevel = permissionHierarchy[requirements.maxPermissionLevel];
            if (userLevel < requiredLevel) {
                const error = {
                    code: 'insufficient_scope',
                    message: 'Insufficient permission level',
                    description: `Required level: ${requirements.maxPermissionLevel}. User level: ${authContext.role}`,
                    statusCode: 403,
                };
                this.logAuditEntry(authContext, resourcePath, 'denied', error.message, request);
                return { allowed: false, error };
            }
        }
        // 4. Admin IP whitelist check
        if (authContext.role === 'admin' && this.config.adminIpWhitelist.length > 0) {
            const clientIp = request?.ip ||
                (Array.isArray(request?.headers['x-forwarded-for'])
                    ? request?.headers['x-forwarded-for'][0]
                    : request?.headers['x-forwarded-for']) ||
                'unknown';
            const isWhitelisted = this.config.adminIpWhitelist.includes(clientIp);
            if (!isWhitelisted) {
                const error = {
                    code: 'insufficient_scope',
                    message: 'Admin access not allowed from this IP',
                    description: `IP ${clientIp} not in admin whitelist`,
                    statusCode: 403,
                };
                this.logAuditEntry(authContext, resourcePath, 'denied', error.message, request);
                return { allowed: false, error };
            }
        }
        // 5. Dangerous operations require authentication
        if (requirements.dangerous && this.config.requireAuthForDangerous) {
            if (authContext.role === 'guest' || authContext.userId === 'anonymous') {
                const error = {
                    code: 'insufficient_scope',
                    message: 'Authentication required for dangerous operations',
                    statusCode: 403,
                };
                this.logAuditEntry(authContext, resourcePath, 'denied', error.message, request);
                return { allowed: false, error };
            }
        }
        // Log successful access for auditable resources
        if (requirements.auditRequired || requirements.dangerous) {
            this.logAuditEntry(authContext, resourcePath, 'allowed', undefined, request);
        }
        return { allowed: true };
    }
    /**
     * Create Fastify middleware for MCP authorization
     */
    createAuthMiddleware(resourceRequirements) {
        return async (request, reply) => {
            // Skip authorization for public routes
            if (this.isPublicRoute(request.url)) {
                return;
            }
            // Extract Authorization header
            const authHeader = request.headers.authorization;
            if (!authHeader) {
                const error = {
                    code: 'invalid_request',
                    message: 'Missing Authorization header',
                    statusCode: 401,
                };
                this.sendAuthError(reply, error);
                return;
            }
            // Parse Bearer token
            const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/);
            if (!bearerMatch || !bearerMatch[1]) {
                const error = {
                    code: 'invalid_request',
                    message: 'Invalid Authorization header format. Expected: Bearer <token>',
                    statusCode: 401,
                };
                this.sendAuthError(reply, error);
                return;
            }
            const token = bearerMatch[1];
            // Validate token
            const authResult = this.validateAccessToken(token);
            if ('code' in authResult) {
                this.sendAuthError(reply, authResult);
                return;
            }
            // Authorize resource access
            const resourcePath = request.url;
            const authzResult = this.authorizeResource(authResult, resourcePath, resourceRequirements, request);
            if (!authzResult.allowed && authzResult.error) {
                this.sendAuthError(reply, authzResult.error);
                return;
            }
            // Add auth context to request for downstream handlers
            request.authContext = authResult;
        };
    }
    /**
     * Send standardized authentication error response
     */
    sendAuthError(reply, error) {
        const wwwAuthenticateHeader = `Bearer realm="MCP", error="${error.code}"${error.description ? `, error_description="${error.description}"` : ''}`;
        reply
            .status(error.statusCode)
            .header('WWW-Authenticate', wwwAuthenticateHeader)
            .header('Cache-Control', 'no-store')
            .header('Pragma', 'no-cache')
            .send({
            error: error.code,
            error_description: error.message,
            timestamp: new Date().toISOString(),
        });
    }
    /**
     * Check if route is public (doesn't require authentication)
     */
    isPublicRoute(url) {
        const publicRoutes = [
            '/healthz',
            '/.well-known/oauth-authorization-server',
            '/.well-known/oauth-protected-resource',
            '/.well-known/openid-configuration',
            '/.well-known/oauth-registration',
            '/auth/oauth/providers',
            '/auth/oauth/login',
            '/auth/oauth/callback',
            '/auth/oauth/health',
            '/ui',
            '/ui/assets',
        ];
        return publicRoutes.some((route) => url.startsWith(route));
    }
    /**
     * Log audit entry for security events
     */
    logAuditEntry(authContext, resource, result, reason, request) {
        if (!this.config.enableAuditLog) {
            return;
        }
        const clientIp = request?.ip ||
            (Array.isArray(request?.headers['x-forwarded-for'])
                ? request?.headers['x-forwarded-for'][0]
                : request?.headers['x-forwarded-for']);
        const entry = {
            timestamp: new Date(),
            userId: authContext.userId,
            action: 'resource_access',
            resource,
            result,
            reason,
            ipAddress: clientIp,
            userAgent: request?.headers['user-agent'],
        };
        this.auditLog.push(entry);
        // Keep audit log size manageable
        if (this.auditLog.length > 10000) {
            this.auditLog = this.auditLog.slice(-5000);
        }
        // Log to console for immediate visibility
        const level = result === 'denied' ? 'WARN' : 'INFO';
        console.log(`[MCP-AUTH:${level}] ${entry.timestamp.toISOString()} ${authContext.userId}:${authContext.role} ${resource} ${result}${reason ? ` - ${reason}` : ''}`);
    }
    /**
     * Get recent audit log entries
     */
    getAuditLog(count = 100) {
        return this.auditLog.slice(-count);
    }
    /**
     * Get audit log for specific user
     */
    getUserAuditLog(userId, count = 100) {
        return this.auditLog.filter((entry) => entry.userId === userId).slice(-count);
    }
    /**
     * Get denied access attempts
     */
    getDeniedAttempts(count = 100) {
        return this.auditLog.filter((entry) => entry.result === 'denied').slice(-count);
    }
    /**
     * Generate new access token for user
     */
    generateAccessToken(userInfo, sessionId) {
        const now = Math.floor(Date.now() / 1000);
        const payload = {
            sub: userInfo.id,
            username: userInfo.username,
            email: userInfo.email,
            role: 'user', // Default role, should be overridden from user registry
            scopes: ['read', 'write'], // Default scopes, should be customized
            sid: sessionId,
            provider: userInfo.provider,
            iat: now,
            exp: now + this.config.jwt.accessTokenExpiry,
            iss: this.config.jwt.issuer,
            aud: this.config.jwt.audience,
        };
        const accessToken = jwt.sign(payload, this.config.jwt.secret, {
            algorithm: this.config.jwt.algorithm,
            header: { typ: 'JWT', alg: this.config.jwt.algorithm },
        });
        return {
            accessToken,
            expiresIn: this.config.jwt.accessTokenExpiry,
        };
    }
    /**
     * Generate refresh token
     */
    generateRefreshToken(userInfo, sessionId) {
        const now = Math.floor(Date.now() / 1000);
        const payload = {
            sub: userInfo.id,
            sid: sessionId,
            provider: userInfo.provider,
            type: 'refresh',
            iat: now,
            exp: now + this.config.jwt.refreshTokenExpiry,
            iss: this.config.jwt.issuer,
            aud: this.config.jwt.audience,
        };
        const refreshToken = jwt.sign(payload, this.config.jwt.secret, {
            algorithm: this.config.jwt.algorithm,
            header: { typ: 'JWT', alg: this.config.jwt.algorithm },
        });
        return {
            refreshToken,
            expiresIn: this.config.jwt.refreshTokenExpiry,
        };
    }
    /**
     * Validate refresh token and extract user info
     */
    validateRefreshToken(token) {
        try {
            const decoded = jwt.verify(token, this.config.jwt.secret, {
                issuer: this.config.jwt.issuer,
                audience: this.config.jwt.audience,
                algorithms: [this.config.jwt.algorithm],
            });
            if (decoded.type !== 'refresh') {
                return { valid: false };
            }
            return {
                valid: true,
                userId: decoded.sub,
                sessionId: decoded.sid,
                provider: decoded.provider,
            };
        }
        catch (error) {
            return { valid: false };
        }
    }
    /**
     * Get authorization system health
     */
    getHealth() {
        return {
            status: 'healthy',
            config: {
                strictMode: this.config.strictMode,
                requireAuthForDangerous: this.config.requireAuthForDangerous,
                adminIpWhitelistSize: this.config.adminIpWhitelist.length,
                auditLogEnabled: this.config.enableAuditLog,
                auditLogSize: this.auditLog.length,
            },
            timestamp: new Date().toISOString(),
        };
    }
}
/**
 * Create MCP authorizer with configuration
 */
export function createMcpAuthorizer(config) {
    return new McpAuthorizer(config);
}
/**
 * Default MCP resource requirements for common operations
 */
export const MCP_RESOURCE_REQUIREMENTS = {
    // Read operations
    read: {
        requiredScopes: ['read'],
        dangerous: false,
        auditRequired: false,
    },
    // Write operations
    write: {
        requiredScopes: ['write'],
        dangerous: true,
        auditRequired: true,
    },
    // Delete operations
    delete: {
        requiredScopes: ['write', 'delete'],
        dangerous: true,
        auditRequired: true,
    },
    // Admin operations
    admin: {
        requiredScopes: ['admin'],
        allowedRoles: ['admin'],
        dangerous: true,
        auditRequired: true,
    },
    // Tool execution
    executeTool: {
        requiredScopes: ['write'],
        dangerous: true,
        auditRequired: true,
    },
    // System operations
    system: {
        requiredScopes: ['admin'],
        allowedRoles: ['developer', 'admin'],
        dangerous: true,
        auditRequired: true,
    },
};
//# sourceMappingURL=mcp-authorizer.js.map