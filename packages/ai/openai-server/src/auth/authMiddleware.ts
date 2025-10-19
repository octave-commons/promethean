import type { FastifyRequest, FastifyReply } from "fastify";
import type { User, AuthResult, SecurityContext, AuthConfig } from "../types/security.js";
import { JWTService } from "./jwtService.js";
import { RBAC } from "./rbac.js";

/**
 * Authentication middleware for Fastify routes
 */
export class AuthMiddleware {
  private readonly jwtService: JWTService;
  private readonly users: Map<string, User> = new Map();

  constructor(config: AuthConfig) {
    this.jwtService = new JWTService(config);
    this.initializeDefaultUsers(config);
  }

  /**
   * Initialize default users from API keys
   */
  private initializeDefaultUsers(config: AuthConfig): void {
    // Create admin user from first API key if available
    if (config.apiKeys.length > 0) {
      const adminUser = RBAC.createUser("admin", config.apiKeys[0], ["admin"]);
      this.users.set(adminUser.id, adminUser);
    }

    // Create additional users for remaining API keys
    config.apiKeys.slice(1).forEach((apiKey, index) => {
      const user = RBAC.createUser(`user-${index + 1}`, apiKey, ["user"]);
      this.users.set(user.id, user);
    });
  }

  /**
   * Authenticate request using JWT token or API key
   */
  async authenticate(request: FastifyRequest): Promise<AuthResult> {
    // Try JWT token authentication first
    const token = this.extractToken(request);
    if (token) {
      const result = await this.authenticateWithToken(token);
      if (result.success) {
        return result;
      }
    }

    // Fallback to API key authentication
    const apiKey = this.extractApiKey(request);
    if (apiKey) {
      return this.authenticateWithApiKey(apiKey);
    }

    return {
      success: false,
      error: "No authentication credentials provided",
      statusCode: 401,
    };
  }

  /**
   * Extract JWT token from request headers
   */
  private extractToken(request: FastifyRequest): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    return authHeader.substring(7);
  }

  /**
   * Extract API key from request headers
   */
  private extractApiKey(request: FastifyRequest): string | null {
    return (request.headers["x-api-key"] as string) || null;
  }

  /**
   * Authenticate using JWT token
   */
  private async authenticateWithToken(token: string): Promise<AuthResult> {
    try {
      const payload = await this.jwtService.verifyToken(token);
      if (!payload) {
        return {
          success: false,
          error: "Invalid or expired token",
          statusCode: 401,
        };
      }

      if (payload.type !== "access") {
        return {
          success: false,
          error: "Invalid token type",
          statusCode: 401,
        };
      }

      const user = this.users.get(payload.sub);
      if (!user) {
        return {
          success: false,
          error: "User not found",
          statusCode: 401,
        };
      }

      // Update last active timestamp
      const updatedUser = { ...user, lastActive: new Date() };
      this.users.set(user.id, updatedUser);

      return {
        success: true,
        user: updatedUser,
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        error: "Authentication failed",
        statusCode: 401,
      };
    }
  }

  /**
   * Authenticate using API key
   */
  private authenticateWithApiKey(apiKey: string): AuthResult {
    const user = Array.from(this.users.values()).find(u => u.apiKey === apiKey);
    
    if (!user) {
      return {
        success: false,
        error: "Invalid API key",
        statusCode: 401,
      };
    }

    // Update last active timestamp
    const updatedUser = { ...user, lastActive: new Date() };
    this.users.set(user.id, updatedUser);

    return {
      success: true,
      user: updatedUser,
      statusCode: 200,
    };
  }

  /**
   * Create authentication middleware for Fastify
   */
  createAuthMiddleware(options: {
    required?: boolean;
    permissions?: readonly string[];
    roles?: readonly string[];
  } = {}) {
    const { required = true, permissions = [], roles = [] } = options;

    return async (request: FastifyRequest, reply: FastifyReply) => {
      const authResult = await this.authenticate(request);

      if (!authResult.success) {
        if (required) {
          return reply.status(authResult.statusCode).send({
            error: authResult.error,
            code: "AUTHENTICATION_FAILED",
          });
        }
        // If authentication is not required, continue without user context
        return;
      }

      // Check permissions if specified
      if (permissions.length > 0 && !RBAC.hasAllPermissions(authResult.user, permissions)) {
        return reply.status(403).send({
          error: "Insufficient permissions",
          code: "INSUFFICIENT_PERMISSIONS",
          required: permissions,
          current: authResult.user.permissions,
        });
      }

      // Check roles if specified
      if (roles.length > 0 && !RBAC.hasAnyRole(authResult.user, roles)) {
        return reply.status(403).send({
          error: "Insufficient role privileges",
          code: "INSUFFICIENT_ROLES",
          required: roles,
          current: authResult.user.roles,
        });
      }

      // Attach security context to request
      (request as any).securityContext = RBAC.createSecurityContext(authResult.user);
    };
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  /**
   * Get all users (for admin purposes)
   */
  getAllUsers(): readonly User[] {
    return Array.from(this.users.values());
  }

  /**
   * Generate tokens for a user
   */
  async generateTokens(user: User) {
    return this.jwtService.generateTokens(user);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<string | null> {
    return this.jwtService.refreshToken(refreshToken);
  }
}