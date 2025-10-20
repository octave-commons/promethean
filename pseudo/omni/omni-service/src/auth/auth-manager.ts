import type { FastifyRequest, FastifyReply } from 'fastify';
import type { AuthConfig, UserContext, AuthResult } from './types.js';
import { TokenManager } from './token-manager.js';
import { RBACManager } from './rbac-manager.js';

/**
 * Authentication Manager
 * Handles JWT token validation, user context creation, and auth middleware
 */
export class AuthManager {
  private tokenManager: TokenManager;
  private rbacManager: RBACManager;
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
    this.tokenManager = new TokenManager(config.jwt);
    this.rbacManager = new RBACManager(config.rbac.permissionsCacheTTL);
  }

  /**
   * Extract JWT token from request headers or query parameters
   */
  private extractToken(request: FastifyRequest): string | null {
    // Check Authorization header (Bearer token)
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check API key header if enabled
    if (this.config.apikey.enabled) {
      const apiKeyHeader = request.headers[this.config.apikey.headerName.toLowerCase()] as string;
      if (apiKeyHeader) {
        return apiKeyHeader;
      }

      // Check API key query parameter if configured
      if (this.config.apikey.queryParam) {
        const query = request.query as Record<string, any>;
        const queryApiKey = query[this.config.apikey.queryParam] as string;
        if (queryApiKey && typeof queryApiKey === 'string') {
          return queryApiKey;
        }
      }
    }

    // Check cookie if session management is enabled
    if (this.config.session.enabled && (request as any).cookies) {
      const cookieToken = (request as any).cookies[this.config.session.cookieName];
      if (typeof cookieToken === 'string') {
        return cookieToken;
      }
    }

    return null;
  }

  /**
   * Authenticate request and return user context
   */
  async authenticate(request: FastifyRequest): Promise<AuthResult> {
    const token = this.extractToken(request);

    if (!token) {
      return {
        success: false,
        error: 'No authentication token provided',
        statusCode: 401,
      };
    }

    // Check if it's an API key first (for efficiency)
    if (this.config.apikey.enabled && token.startsWith('omni_')) {
      return this.tokenManager.validateAPIKey(token);
    }

    // Validate as JWT token
    const result = this.tokenManager.validateToken(token);

    // Set token type for API keys
    if (result.success && result.user && token.startsWith('omni_')) {
      result.user.tokenType = 'apikey';
    }

    return result;
  }

  /**
   * Create optional authentication middleware (doesn't fail if no token)
   */
  createOptionalAuthMiddleware() {
    return async (request: FastifyRequest) => {
      const authResult = await this.authenticate(request);

      if (authResult.success && authResult.user) {
        request.user = authResult.user;
      }

      // Continue regardless of authentication result
    };
  }

  /**
   * Create authorization middleware with permission checking
   */
  createAuthMiddleware(
    options: {
      required?: boolean;
      permissions?: Array<{
        resource: string;
        actions: string[];
      }>;
      roles?: string[];
    } = {},
  ) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const authResult = await this.authenticate(request);

      if (!authResult.success) {
        if (options.required !== false) {
          return reply.status(authResult.statusCode || 401).send({
            error: 'Authentication required',
            message: authResult.error,
          });
        }
        // Optional auth failed but not required - continue without user context
        return;
      }

      if (!authResult.user) {
        return reply.status(500).send({
          error: 'Authentication failed',
          message: 'User context not available',
        });
      }

      request.user = authResult.user;

      // Check role requirements if specified
      if (options.roles && options.roles.length > 0) {
        const hasRequiredRole = this.rbacManager.hasAnyRole(
          request.user.id,
          request.user.roles,
          options.roles,
        );

        if (!hasRequiredRole) {
          return reply.status(403).send({
            error: 'Insufficient permissions',
            message: `Required roles: ${options.roles.join(', ')}`,
          });
        }
      }

      // Check permission requirements if specified
      if (options.permissions && options.permissions.length > 0) {
        for (const perm of options.permissions) {
          const hasPermission = this.rbacManager.hasAnyPermission(
            request.user.id,
            request.user.roles,
            perm.resource,
            perm.actions,
          );

          if (!hasPermission.granted) {
            return reply.status(403).send({
              error: 'Insufficient permissions',
              message: hasPermission.reason,
              required: hasPermission.requiredPermission,
            });
          }
        }
      }
    };
  }

  /**
   * Create permission checking helper for use in route handlers
   */
  createPermissionChecker(user: UserContext) {
    return {
      hasPermission: (resource: string, action: string) =>
        this.rbacManager.hasPermission(user.id, user.roles, resource, action),

      canRead: (resource: string) => this.rbacManager.canRead(user.id, user.roles, resource),

      canWrite: (resource: string) => this.rbacManager.canWrite(user.id, user.roles, resource),

      canDelete: (resource: string) => this.rbacManager.canDelete(user.id, user.roles, resource),

      hasAdminAccess: (resource: string) =>
        this.rbacManager.hasAdminAccess(user.id, user.roles, resource),

      hasRole: (roleName: string) => this.rbacManager.hasRole(user.id, user.roles, roleName),

      hasAnyRole: (roleNames: string[]) =>
        this.rbacManager.hasAnyRole(user.id, user.roles, roleNames),

      getRoleInfo: () => this.rbacManager.getUserRoleInfo(user.id, user.roles),
    };
  }

  /**
   * Generate authentication tokens for user
   */
  generateTokens(user: {
    id: string;
    username?: string;
    email?: string;
    roles: string[];
    metadata?: Record<string, any>;
  }) {
    return {
      accessToken: this.tokenManager.generateAccessToken(user),
      refreshToken: this.tokenManager.generateRefreshToken(user.id),
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(
    refreshToken: string,
    userRepository: {
      getUserById: (id: string) => Promise<{
        id: string;
        username?: string;
        email?: string;
        roles: string[];
        metadata?: Record<string, any>;
      } | null>;
    },
  ) {
    return this.tokenManager.refreshToken(refreshToken, userRepository);
  }

  /**
   * Generate API key for service-to-service authentication
   */
  generateAPIKey(serviceId: string, permissions: string[]): string {
    return this.tokenManager.generateAPIKey(serviceId, permissions);
  }

  /**
   * Validate API key
   */
  validateAPIKey(apiKey: string): AuthResult {
    return this.tokenManager.validateAPIKey(apiKey);
  }

  /**
   * Get RBAC manager for advanced permission checking
   */
  getRBACManager(): RBACManager {
    return this.rbacManager;
  }

  /**
   * Get token manager for advanced token operations
   */
  getTokenManager(): TokenManager {
    return this.tokenManager;
  }

  /**
   * Set authentication cookie for session management
   */
  setAuthCookie(reply: FastifyReply, token: string): void {
    if (this.config.session.enabled) {
      (reply as any).cookie(this.config.session.cookieName, token, {
        httpOnly: this.config.session.cookieOptions.httpOnly,
        secure: this.config.session.cookieOptions.secure,
        sameSite: this.config.session.cookieOptions.sameSite,
        maxAge: this.config.session.cookieOptions.maxAge,
        path: '/',
      });
    }
  }

  /**
   * Clear authentication cookie
   */
  clearAuthCookie(reply: FastifyReply): void {
    if (this.config.session.enabled) {
      (reply as any).clearCookie(this.config.session.cookieName, {
        path: '/',
      });
    }
  }
}

/**
 * Create and configure an AuthManager instance
 */
export function createAuthManager(config: AuthConfig): AuthManager {
  return new AuthManager(config);
}
