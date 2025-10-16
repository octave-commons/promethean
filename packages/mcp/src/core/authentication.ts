/**
 * MCP Authentication System
 *
 * Provides JWT and API key based authentication for the MCP server.
 * This complements the existing authorization system.
 */

import crypto from 'node:crypto';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ToolContext } from './types.js';
import type { UserRole } from './authorization.js';

// JWT Configuration
export interface JwtConfig {
  secret: string;
  expiresIn: string;
  issuer: string;
  audience: string;
}

// API Key Configuration
export interface ApiKeyConfig {
  keys: Map<string, ApiKeyInfo>;
  headerName: string;
  queryParam: string;
}

// API Key Information
export interface ApiKeyInfo {
  id: string;
  name: string;
  userId: string;
  role: UserRole;
  permissions: string[];
  expiresAt?: Date;
  createdAt: Date;
  lastUsedAt?: Date;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

// Authentication Result
export interface AuthResult {
  success: boolean;
  userId?: string;
  role?: UserRole;
  permissions?: string[];
  error?: string;
  method?: 'jwt' | 'api_key' | 'none';
}

// Authentication Context
export interface AuthContext {
  userId: string;
  role: UserRole;
  permissions: string[];
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  method: 'jwt' | 'api_key' | 'env';
}

// Rate Limiting
interface RateLimitEntry {
  count: number;
  resetTime: number;
  windowStart: number;
}

class RateLimiter {
  private readonly limits = new Map<string, RateLimitEntry>();

  constructor(
    private readonly requestsPerMinute: number,
    private readonly requestsPerHour: number,
  ) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const minuteMs = 60 * 1000;
    const hourMs = 60 * 60 * 1000;

    let entry = this.limits.get(key);
    if (!entry) {
      entry = {
        count: 0,
        resetTime: now + hourMs,
        windowStart: now,
      };
      this.limits.set(key, entry);
    }

    // Reset if window expired
    if (now > entry.resetTime) {
      entry.count = 0;
      entry.windowStart = now;
      entry.resetTime = now + hourMs;
    }

    // Check minute limit
    if (
      entry.count > 0 &&
      now - entry.windowStart < minuteMs &&
      entry.count >= this.requestsPerMinute
    ) {
      return false;
    }

    // Check hour limit
    if (entry.count >= this.requestsPerHour) {
      return false;
    }

    entry.count++;
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// Main Authentication Class
export class AuthenticationManager {
  private readonly jwtConfig: JwtConfig;
  private readonly apiKeyConfig: ApiKeyConfig;
  private readonly rateLimiters = new Map<string, RateLimiter>();

  constructor(jwtConfig: Partial<JwtConfig> = {}, apiKeyConfig: Partial<ApiKeyConfig> = {}) {
    this.jwtConfig = {
      secret: jwtConfig.secret || process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
      expiresIn: jwtConfig.expiresIn || process.env.JWT_EXPIRES_IN || '1h',
      issuer: jwtConfig.issuer || process.env.JWT_ISSUER || 'promethean-mcp',
      audience: jwtConfig.audience || process.env.JWT_AUDIENCE || 'promethean-mcp-clients',
      ...jwtConfig,
    };

    this.apiKeyConfig = {
      keys: new Map(),
      headerName: 'X-API-Key',
      queryParam: 'api_key',
      ...apiKeyConfig,
    };

    // Initialize with environment-based API keys if provided
    this.initializeEnvironmentApiKeys();

    // Cleanup rate limiters periodically
    setInterval(
      () => {
        for (const limiter of this.rateLimiters.values()) {
          limiter.cleanup();
        }
      },
      5 * 60 * 1000,
    ); // Every 5 minutes
  }

  private initializeEnvironmentApiKeys(): void {
    // Support environment variable based API keys for development
    const envKeys = process.env.MCP_API_KEYS;
    if (envKeys) {
      try {
        const keys = JSON.parse(envKeys);
        for (const [keyId, keyInfo] of Object.entries(keys)) {
          if (typeof keyInfo === 'object' && keyInfo !== null) {
            const info = keyInfo as any;
            this.apiKeyConfig.keys.set(keyId, {
              id: keyId,
              name: info.name || keyId,
              userId: info.userId || 'env-user',
              role: info.role || 'user',
              permissions: info.permissions || [],
              createdAt: new Date(info.createdAt || Date.now()),
              expiresAt: info.expiresAt ? new Date(info.expiresAt) : undefined,
              rateLimit: info.rateLimit,
            });
          }
        }
      } catch (error) {
        console.warn('[auth] Failed to parse MCP_API_KEYS environment variable:', error);
      }
    }
  }

  // JWT Token Management
  generateToken(payload: {
    userId: string;
    role: UserRole;
    permissions?: string[];
    sessionId?: string;
  }): string {
    const jwtPayload: JwtPayload = {
      sub: payload.userId,
      role: payload.role,
      permissions: payload.permissions || [],
      sid: payload.sessionId,
      iat: Math.floor(Date.now() / 1000),
      iss: this.jwtConfig.issuer,
      aud: this.jwtConfig.audience,
    };

    return jwt.sign(jwtPayload, this.jwtConfig.secret, {
      expiresIn: this.jwtConfig.expiresIn,
    } as jwt.SignOptions);
  }

  verifyToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtConfig.secret, {
        issuer: this.jwtConfig.issuer,
        audience: this.jwtConfig.audience,
      }) as JwtPayload;

      return decoded;
    } catch (error) {
      return null;
    }
  }

  // API Key Management
  createApiKey(info: Omit<ApiKeyInfo, 'id' | 'createdAt'>): string {
    const keyId = crypto.randomBytes(16).toString('hex');
    const apiKey = `mcp_${keyId}_${crypto.randomBytes(32).toString('hex')}`;

    const fullInfo: ApiKeyInfo = {
      ...info,
      id: keyId,
      createdAt: new Date(),
    };

    this.apiKeyConfig.keys.set(keyId, fullInfo);
    return apiKey;
  }

  revokeApiKey(keyId: string): boolean {
    return this.apiKeyConfig.keys.delete(keyId);
  }

  getApiKeyInfo(keyId: string): ApiKeyInfo | undefined {
    return this.apiKeyConfig.keys.get(keyId);
  }

  listApiKeys(userId?: string): ApiKeyInfo[] {
    const keys = Array.from(this.apiKeyConfig.keys.values());
    return userId ? keys.filter((key) => key.userId === userId) : keys;
  }

  // Authentication Methods
  authenticateRequest(request: FastifyRequest): AuthResult {
    // Try JWT authentication first
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = this.verifyToken(token);

      if (payload) {
        return {
          success: true,
          userId: payload.sub,
          role: payload.role as UserRole,
          permissions: payload.permissions || [],
          method: 'jwt',
        };
      }

      return {
        success: false,
        error: 'Invalid JWT token',
        method: 'jwt',
      };
    }

    // Try API key authentication
    const apiKey = this.extractApiKey(request);
    if (apiKey) {
      const keyInfo = this.validateApiKey(apiKey);
      if (keyInfo) {
        // Check rate limiting
        const rateLimiter = this.getRateLimiter(keyInfo);
        if (!rateLimiter.isAllowed(keyInfo.id)) {
          return {
            success: false,
            error: 'Rate limit exceeded',
            method: 'api_key',
          };
        }

        // Update last used timestamp
        keyInfo.lastUsedAt = new Date();

        return {
          success: true,
          userId: keyInfo.userId,
          role: keyInfo.role,
          permissions: keyInfo.permissions,
          method: 'api_key',
        };
      }

      return {
        success: false,
        error: 'Invalid API key',
        method: 'api_key',
      };
    }

    // No authentication provided - return success for guest access
    return {
      success: true,
      userId: 'anonymous',
      role: 'guest',
      permissions: [],
      method: 'none',
    };
  }

  private extractApiKey(request: FastifyRequest): string | null {
    // Try header first
    const headerKey = request.headers[this.apiKeyConfig.headerName.toLowerCase()] as string;
    if (headerKey) {
      return headerKey;
    }

    // Try query parameter
    const query = request.query as Record<string, unknown>;
    const queryKey = query[this.apiKeyConfig.queryParam] as string;
    if (queryKey && typeof queryKey === 'string') {
      return queryKey;
    }

    return null;
  }

  private validateApiKey(apiKey: string): ApiKeyInfo | null {
    // API key format: mcp_<keyId>_<signature>
    if (!apiKey.startsWith('mcp_')) {
      return null;
    }

    const parts = apiKey.split('_');
    if (parts.length !== 3) {
      return null;
    }

    const keyId = parts[1];
    if (!keyId) return null;
    const keyInfo = this.apiKeyConfig.keys.get(keyId);

    if (!keyInfo) {
      return null;
    }

    // Check expiration
    if (keyInfo.expiresAt && keyInfo.expiresAt < new Date()) {
      return null;
    }

    return keyInfo;
  }

  private getRateLimiter(keyInfo: ApiKeyInfo): RateLimiter {
    const cacheKey = keyInfo.id;

    if (!this.rateLimiters.has(cacheKey)) {
      const rpm = keyInfo.rateLimit?.requestsPerMinute || 100;
      const rph = keyInfo.rateLimit?.requestsPerHour || 1000;
      this.rateLimiters.set(cacheKey, new RateLimiter(rpm, rph));
    }

    return this.rateLimiters.get(cacheKey)!;
  }

  // Context Extraction
  extractAuthContext(request: FastifyRequest): AuthContext {
    const authResult = this.authenticateRequest(request);

    if (!authResult.success || !authResult.userId || !authResult.role) {
      throw new Error(authResult.error || 'Authentication failed');
    }

    return {
      userId: authResult.userId,
      role: authResult.role,
      permissions: authResult.permissions || [],
      sessionId: (request as any).sessionId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      method: authResult.method as 'jwt' | 'api_key' | 'env',
    };
  }

  // Middleware Factory
  createAuthMiddleware(
    options: {
      required?: boolean;
      allowedRoles?: UserRole[];
      requiredPermissions?: string[];
    } = {},
  ) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const authResult = this.authenticateRequest(request);

      if (!authResult.success) {
        if (options.required !== false) {
          return reply.status(401).send({
            error: 'Authentication required',
            message: authResult.error,
          });
        }
        // Continue with guest access if not required
        (request as any).authContext = {
          userId: 'anonymous',
          role: 'guest' as UserRole,
          permissions: [],
          method: 'env' as const,
        };
        return;
      }

      // Check role requirements
      if (
        options.allowedRoles &&
        authResult.role &&
        !options.allowedRoles.includes(authResult.role)
      ) {
        return reply.status(403).send({
          error: 'Insufficient privileges',
          message: `Role '${authResult.role}' is not allowed`,
        });
      }

      // Check permission requirements
      if (options.requiredPermissions && authResult.permissions) {
        const hasAllPermissions = options.requiredPermissions.every((permission) =>
          authResult.permissions!.includes(permission),
        );
        if (!hasAllPermissions) {
          return reply.status(403).send({
            error: 'Insufficient permissions',
            message: `Required permissions: ${options.requiredPermissions.join(', ')}`,
          });
        }
      }

      // Store auth context for later use
      (request as any).authContext = {
        userId: authResult.userId,
        role: authResult.role,
        permissions: authResult.permissions || [],
        sessionId: (request as any).sessionId,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        method: authResult.method,
      };
    };
  }
}

// Global instance
export const authenticationManager = new AuthenticationManager();

// Helper functions
export function createAuthContext(request: FastifyRequest): ToolContext {
  const authContext =
    (request as any).authContext || authenticationManager.extractAuthContext(request);

  return {
    env: {
      ...process.env,
      MCP_USER_ID: authContext.userId,
      MCP_USER_ROLE: authContext.role,
      MCP_SESSION_TOKEN: authContext.sessionId,
      REMOTE_ADDR: authContext.ipAddress,
      USER_AGENT: authContext.userAgent,
    },
    fetch: global.fetch.bind(global),
    now: () => new Date(),
  };
}
