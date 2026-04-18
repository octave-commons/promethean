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
  // Authentication requirements
  required?: boolean;
  allowedMethods?: readonly ('jwt' | 'api_key' | 'oauth' | 'env')[];

  // Role and permission restrictions
  allowedRoles?: readonly UserRole[];
  requiredPermissions?: readonly string[];

  // Resource-specific requirements
  resourcePath?: string;
  dangerous?: boolean;
  auditRequired?: boolean;

  // Rate limiting
  enableRateLimit?: boolean;
  requestsPerMinute?: number;
  requestsPerHour?: number;

  // IP restrictions
  allowedIpRanges?: readonly string[];
  blockedIpRanges?: readonly string[];

  // Session requirements
  requireValidSession?: boolean;
  maxSessionAge?: number; // seconds

  // OAuth specific
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
export class McpAuthMiddleware {
  private readonly authManager: AuthenticationManager;
  private readonly mcpAuthorizer: McpAuthorizer;
  private readonly oauthIntegration?: OAuthIntegration;

  // Rate limiting and security tracking
  private readonly rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  private readonly ipBlockList = new Set<string>();
  private readonly failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

  // Configuration
  private readonly maxFailedAttempts = 10;
  private readonly blockDuration = 60 * 60 * 1000; // 1 hour
  private readonly cleanupInterval = 5 * 60 * 1000; // 5 minutes

  constructor(
    authManager: AuthenticationManager,
    mcpAuthorizer: McpAuthorizer,
    oauthIntegration?: OAuthIntegration,
  ) {
    this.authManager = authManager;
    this.mcpAuthorizer = mcpAuthorizer;
    this.oauthIntegration = oauthIntegration;

    // Start cleanup interval
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  /**
   * Create authentication middleware with configuration
   */
  createMiddleware(config: AuthMiddlewareConfig = {}) {
    return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const startTime = Date.now();

      try {
        // 1. IP-based blocking
        const ipCheck = this.checkIpRestrictions(request);
        if (!ipCheck.allowed) {
          await this.logSecurityEvent(request, 'ip_blocked', ipCheck.reason);
          return reply.status(403).send({
            error: 'Access denied',
            message: ipCheck.reason,
          });
        }

        // 2. Rate limiting
        if (config.enableRateLimit !== false) {
          const rateLimitCheck = this.checkRateLimit(request, config);
          if (!rateLimitCheck.allowed) {
            await this.logSecurityEvent(request, 'rate_limit_exceeded', rateLimitCheck.reason);
            return reply.status(429).send({
              error: 'Rate limit exceeded',
              message: rateLimitCheck.reason,
              retryAfter: rateLimitCheck.retryAfter,
            });
          }
        }

        // 3. Authentication
        const authResult = await this.authenticateRequest(request, config);

        if (!authResult.success) {
          // Track failed attempts
          this.trackFailedAttempt(request);

          await this.logSecurityEvent(request, 'authentication_failed', authResult.error);

          if (config.required !== false) {
            return reply.status(401).send({
              error: 'Authentication required',
              message: authResult.error,
              supported_methods: config.allowedMethods || ['jwt', 'api_key', 'oauth'],
            });
          }

          // Continue with guest access if authentication not required
          (request as any).authContext = this.createGuestContext(request);
          (request as any).mcpAuthContext = null;
          return;
        }

        // 4. Authorization (MCP-specific)
        if (authResult.mcpContext && config.resourcePath) {
          const authzResult = this.mcpAuthorizer.authorizeResource(
            authResult.mcpContext,
            config.resourcePath,
            {
              requiredScopes: config.requiredPermissions || [],
              allowedRoles: config.allowedRoles,
              dangerous: config.dangerous,
              auditRequired: config.auditRequired,
            },
            request,
          );

          if (!authzResult.allowed && authzResult.error) {
            await this.logSecurityEvent(request, 'authorization_failed', authzResult.error.message);
            return reply.status(403).send({
              error: 'Access denied',
              message: authzResult.error.message,
            });
          }
        }

        // 5. Session validation
        if (config.requireValidSession && authResult.context) {
          const sessionCheck = this.validateSession(authResult.context, config);
          if (!sessionCheck.valid) {
            await this.logSecurityEvent(request, 'session_invalid', sessionCheck.reason);
            return reply.status(401).send({
              error: 'Invalid session',
              message: sessionCheck.reason,
            });
          }
        }

        // 6. Store contexts in request
        (request as any).authContext = authResult.context;
        (request as any).mcpAuthContext = authResult.mcpContext;
        (request as any).authWarnings = authResult.warnings || [];

        // 7. Log successful authentication for audit
        if (config.auditRequired || config.dangerous) {
          await this.logSecurityEvent(request, 'authenticated', `Method: ${authResult.method}`);
        }

        // Add security headers
        this.addSecurityHeaders(reply);

        console.log(
          `[AUTH] ${authResult.method} authentication successful for ${authResult.context?.userId} (${Date.now() - startTime}ms)`,
        );
      } catch (error) {
        console.error('[AUTH] Middleware error:', error);
        await this.logSecurityEvent(request, 'middleware_error', (error as Error).message);

        return reply.status(500).send({
          error: 'Authentication error',
          message: 'Failed to process authentication request',
        });
      }
    };
  }

  /**
   * Authenticate request using multiple methods
   */
  private async authenticateRequest(
    request: FastifyRequest,
    config: AuthMiddlewareConfig,
  ): Promise<EnhancedAuthResult> {
    const allowedMethods = config.allowedMethods || ['jwt', 'api_key', 'oauth', 'env'];
    const warnings: string[] = [];

    // Try JWT authentication
    if (allowedMethods.includes('jwt')) {
      const jwtResult = this.tryJwtAuth(request);
      if (jwtResult.success) {
        const mcpContext = await this.createMcpContext(jwtResult.context!, 'jwt');
        return { ...jwtResult, mcpContext, method: 'jwt', warnings };
      }
    }

    // Try API key authentication
    if (allowedMethods.includes('api_key')) {
      const apiKeyResult = this.tryApiKeyAuth(request);
      if (apiKeyResult.success) {
        const mcpContext = await this.createMcpContext(apiKeyResult.context!, 'api_key');
        return { ...apiKeyResult, mcpContext, method: 'api_key', warnings };
      }
    }

    // Try OAuth authentication
    if (allowedMethods.includes('oauth') && this.oauthIntegration) {
      const oauthResult = await this.tryOAuthAuth(request);
      if (oauthResult.success) {
        const mcpContext = await this.createMcpContext(oauthResult.context!, 'oauth');
        return { ...oauthResult, mcpContext, method: 'oauth', warnings };
      }
    }

    // Try environment-based authentication (for development)
    if (allowedMethods.includes('env')) {
      const envResult = this.tryEnvAuth(request);
      if (envResult.success) {
        warnings.push('Using environment-based authentication (development mode)');
        const mcpContext = await this.createMcpContext(envResult.context!, 'env');
        return { ...envResult, mcpContext, method: 'env', warnings };
      }
    }

    return {
      success: false,
      error: 'No valid authentication method found',
    };
  }

  /**
   * Try JWT authentication
   */
  private tryJwtAuth(request: FastifyRequest): EnhancedAuthResult {
    try {
      const authHeader = request.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { success: false, error: 'No JWT token provided' };
      }

      const token = authHeader.substring(7);
      const payload = this.authManager.verifyToken(token);

      if (!payload) {
        return { success: false, error: 'Invalid JWT token' };
      }

      const context: AuthContext = {
        userId: payload.sub!,
        role: payload.role as UserRole,
        permissions: payload.permissions || [],
        sessionId: payload.sid,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        method: 'jwt',
      };

      return { success: true, context };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Try API key authentication
   */
  private tryApiKeyAuth(request: FastifyRequest): EnhancedAuthResult {
    try {
      const authResult = this.authManager.authenticateRequest(request);

      if (authResult.success && authResult.method === 'api_key') {
        const context: AuthContext = {
          userId: authResult.userId!,
          role: authResult.role!,
          permissions: authResult.permissions || [],
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          method: 'api_key',
        };

        return { success: true, context };
      }

      return { success: false, error: authResult.error || 'API key authentication failed' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Try OAuth authentication
   */
  private async tryOAuthAuth(request: FastifyRequest): Promise<EnhancedAuthResult> {
    if (!this.oauthIntegration) {
      return { success: false, error: 'OAuth integration not available' };
    }

    try {
      const user = await this.oauthIntegration.getCurrentUser(request);

      if (!user) {
        return { success: false, error: 'No OAuth session found' };
      }

      const context: AuthContext = {
        userId: user.id,
        role: user.role,
        permissions: [...user.permissions],
        sessionId: user.metadata?.sessionId as string | undefined,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        method: 'oauth' as const,
      };

      return { success: true, context };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Try environment-based authentication
   */
  private tryEnvAuth(request: FastifyRequest): EnhancedAuthResult {
    try {
      const userId = process.env.MCP_USER_ID || 'anonymous';
      const userRole = (process.env.MCP_USER_ROLE as UserRole) || 'guest';

      const context: AuthContext = {
        userId,
        role: userRole,
        permissions: [],
        sessionId: process.env.MCP_SESSION_TOKEN,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        method: 'env',
      };

      return { success: true, context };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Create MCP authentication context
   */
  private async createMcpContext(
    authContext: AuthContext,
    method: string,
  ): Promise<McpAuthContext> {
    // For OAuth users, we might have additional MCP-specific context
    if (method === 'oauth' && this.oauthIntegration) {
      // This would be enhanced with actual OAuth session data
      return {
        userId: authContext.userId,
        username: authContext.userId,
        email: `${authContext.userId}@oauth.local`,
        role: authContext.role,
        scopes: authContext.permissions,
        sessionId: authContext.sessionId || 'unknown',
        provider: 'oauth',
        expiresAt: Math.floor(Date.now() / 1000) + 3600, // 1 hour
        issuer: 'promethean-mcp',
        audience: 'promethean-mcp-clients',
      };
    }

    // Default MCP context for other methods
    return {
      userId: authContext.userId,
      username: authContext.userId,
      email: `${authContext.userId}@${method}.local`,
      role: authContext.role,
      scopes: authContext.permissions,
      sessionId: authContext.sessionId || 'unknown',
      provider: method,
      expiresAt: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      issuer: 'promethean-mcp',
      audience: 'promethean-mcp-clients',
    };
  }

  /**
   * Create guest context for unauthenticated access
   */
  private createGuestContext(request: FastifyRequest): AuthContext {
    return {
      userId: 'anonymous',
      role: 'guest',
      permissions: [],
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      method: 'env',
    };
  }

  /**
   * Check IP restrictions
   */
  private checkIpRestrictions(request: FastifyRequest): { allowed: boolean; reason?: string } {
    const clientIp = request.ip || 'unknown';

    // Check blocked IPs first
    if (this.ipBlockList.has(clientIp)) {
      return { allowed: false, reason: `IP ${clientIp} is blocked` };
    }

    // Check failed attempts
    const failedAttempt = this.failedAttempts.get(clientIp);
    if (failedAttempt && failedAttempt.count >= this.maxFailedAttempts) {
      const timeSinceBlock = Date.now() - failedAttempt.lastAttempt;
      if (timeSinceBlock < this.blockDuration) {
        const remainingTime = Math.ceil((this.blockDuration - timeSinceBlock) / 1000 / 60);
        return {
          allowed: false,
          reason: `Too many failed attempts. Try again in ${remainingTime} minutes`,
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(
    request: FastifyRequest,
    config: AuthMiddlewareConfig,
  ): { allowed: boolean; reason?: string; retryAfter?: number } {
    const clientIp = request.ip || 'unknown';
    const rpm = config.requestsPerMinute || 100;
    const rph = config.requestsPerHour || 1000;
    const now = Date.now();
    const minuteMs = 60 * 1000;
    const hourMs = 60 * 60 * 1000;

    let rateLimitEntry = this.rateLimitMap.get(clientIp);
    if (!rateLimitEntry || now > rateLimitEntry.resetTime) {
      rateLimitEntry = { count: 0, resetTime: now + hourMs };
      this.rateLimitMap.set(clientIp, rateLimitEntry);
    }

    // Check per-minute limit
    const timeInMinute = now - (rateLimitEntry.resetTime - hourMs);
    if (timeInMinute < minuteMs && rateLimitEntry.count >= rpm) {
      const retryAfter = Math.ceil((minuteMs - timeInMinute) / 1000);
      return {
        allowed: false,
        reason: `Rate limit exceeded: ${rpm} requests per minute`,
        retryAfter,
      };
    }

    // Check per-hour limit
    if (rateLimitEntry.count >= rph) {
      const retryAfter = Math.ceil((rateLimitEntry.resetTime - now) / 1000);
      return {
        allowed: false,
        reason: `Rate limit exceeded: ${rph} requests per hour`,
        retryAfter,
      };
    }

    rateLimitEntry.count++;
    return { allowed: true };
  }

  /**
   * Validate session
   */
  private validateSession(
    context: AuthContext,
    config: AuthMiddlewareConfig,
  ): { valid: boolean; reason?: string } {
    if (!context.sessionId) {
      return { valid: false, reason: 'No session ID provided' };
    }

    // In a real implementation, you'd check session expiration in a session store
    // For now, we'll assume sessions are valid if they exist
    const maxAge = config.maxSessionAge || 3600; // 1 hour default
    console.log(`[AUTH] Session validation: maxAge=${maxAge}s for session ${context.sessionId}`);

    return { valid: true };
  }

  /**
   * Track failed authentication attempts
   */
  private trackFailedAttempt(request: FastifyRequest): void {
    const clientIp = request.ip || 'unknown';
    const now = Date.now();

    let attempt = this.failedAttempts.get(clientIp);
    if (!attempt) {
      attempt = { count: 0, lastAttempt: 0 };
      this.failedAttempts.set(clientIp, attempt);
    }

    attempt.count++;
    attempt.lastAttempt = now;

    // Block IP if too many failed attempts
    if (attempt.count >= this.maxFailedAttempts) {
      this.ipBlockList.add(clientIp);
      console.warn(`[AUTH] IP ${clientIp} blocked after ${attempt.count} failed attempts`);

      // Unblock after duration
      setTimeout(() => {
        this.ipBlockList.delete(clientIp);
        this.failedAttempts.delete(clientIp);
        console.log(`[AUTH] IP ${clientIp} unblocked`);
      }, this.blockDuration);
    }
  }

  /**
   * Add security headers to response
   */
  private addSecurityHeaders(reply: FastifyReply): void {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-XSS-Protection', '1; mode=block');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    reply.header('Cache-Control', 'no-store, no-cache, must-revalidate');
    reply.header('Pragma', 'no-cache');
  }

  /**
   * Log security events
   */
  private async logSecurityEvent(
    request: FastifyRequest,
    eventType: string,
    details?: string,
  ): Promise<void> {
    const event = {
      timestamp: new Date().toISOString(),
      eventType,
      clientIp: request.ip,
      userAgent: request.headers['user-agent'],
      url: request.url,
      method: request.method,
      details,
    };

    console.log(`[AUTH-SECURITY] ${eventType}: ${details || 'No details'}`, event);

    // In a real implementation, you'd send this to a security monitoring system
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();

    // Cleanup rate limit entries
    for (const [ip, entry] of this.rateLimitMap.entries()) {
      if (now > entry.resetTime) {
        this.rateLimitMap.delete(ip);
      }
    }

    // Cleanup failed attempts
    for (const [ip, attempt] of this.failedAttempts.entries()) {
      if (now - attempt.lastAttempt > this.blockDuration) {
        this.failedAttempts.delete(ip);
        this.ipBlockList.delete(ip);
      }
    }
  }

  /**
   * Get authentication statistics
   */
  getStats(): {
    blockedIps: number;
    rateLimitedClients: number;
    failedAttempts: number;
  } {
    return {
      blockedIps: this.ipBlockList.size,
      rateLimitedClients: this.rateLimitMap.size,
      failedAttempts: Array.from(this.failedAttempts.values()).reduce((sum, a) => sum + a.count, 0),
    };
  }
}

/**
 * Create authentication middleware factory
 */
export function createAuthMiddleware(
  authManager: AuthenticationManager,
  mcpAuthorizer: McpAuthorizer,
  oauthIntegration?: OAuthIntegration,
): McpAuthMiddleware {
  return new McpAuthMiddleware(authManager, mcpAuthorizer, oauthIntegration);
}
