import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "crypto";

import type { 
  JWTPayload, 
  UserContext, 
  AuthConfig, 
  AuthResult,
  JWTPayloadSchema 
} from "./types.js";
import { DEFAULT_ROLES, PermissionUtils } from "./types.js";

/**
 * JWT Token Manager
 * Handles token creation, validation, and refresh
 */
export class TokenManager {
  private config: AuthConfig["jwt"];
  
  constructor(config: AuthConfig["jwt"]) {
    this.config = config;
  }
  
  /**
   * Generate access token for user
   */
  generateAccessToken(user: {
    id: string;
    username?: string;
    email?: string;
    roles: string[];
    metadata?: Record<string, any>;
  }): string {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = this.parseExpiration(this.config.expiresIn);
    
    const payload: Omit<JWTPayload, "type"> = {
      sub: user.id,
      iat: now,
      exp: now + expiresIn,
      aud: this.config.audience,
      iss: this.config.issuer,
      roles: user.roles,
      permissions: PermissionUtils.flattenPermissions(DEFAULT_ROLES, user.roles),
    };
    
    return jwt.sign(payload, this.config.secret, {
      algorithm: this.config.algorithm,
      subject: user.id,
      audience: this.config.audience,
      issuer: this.config.issuer,
      jwtid: this.generateJWTID(),
    });
  }
  
  /**
   * Generate refresh token for user
   */
  generateRefreshToken(userId: string): string {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = this.parseExpiration(this.config.refreshExpiresIn);
    
    const payload: Omit<JWTPayload, "roles" | "permissions" | "type"> = {
      sub: userId,
      iat: now,
      exp: now + expiresIn,
      aud: this.config.audience,
      iss: this.config.issuer,
    };
    
    return jwt.sign(payload, this.config.secret, {
      algorithm: this.config.algorithm,
      subject: userId,
      audience: this.config.audience,
      issuer: this.config.issuer,
      jwtid: this.generateJWTID(),
    });
  }
  
  /**
   * Validate and decode JWT token
   */
  validateToken(token: string, expectedType?: "access" | "refresh"): AuthResult {
    try {
      const decoded = jwt.verify(token, this.config.secret, {
        algorithms: [this.config.algorithm],
        audience: this.config.audience,
        issuer: this.config.issuer,
      }) as JWTPayload;
      
      // Validate with schema
      const validated = JWTPayloadSchema.parse(decoded);
      
      // Check token type if specified
      if (expectedType && validated.type !== expectedType) {
        return {
          success: false,
          error: `Invalid token type. Expected: ${expectedType}, got: ${validated.type}`,
          statusCode: 401,
        };
      }
      
      // Check expiration (jwt.verify already does this, but double-check)
      if (validated.exp < Math.floor(Date.now() / 1000)) {
        return {
          success: false,
          error: "Token has expired",
          statusCode: 401,
        };
      }
      
      // Create user context
      const userContext: UserContext = {
        id: validated.sub,
        roles: validated.roles,
        permissions: new Set(validated.permissions),
        tokenType: validated.type,
      };
      
      return {
        success: true,
        user: userContext,
      };
      
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return {
          success: false,
          error: "Token has expired",
          statusCode: 401,
        };
      }
      
      if (error instanceof jwt.JsonWebTokenError) {
        return {
          success: false,
          error: `Invalid token: ${error.message}`,
          statusCode: 401,
        };
      }
      
      return {
        success: false,
        error: "Authentication error",
        statusCode: 500,
      };
    }
  }
  
  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string, userRepository: {
    getUserById: (id: string) => Promise<{
      id: string;
      username?: string;
      email?: string;
      roles: string[];
      metadata?: Record<string, any>;
    } | null>;
  }): Promise<AuthResult> {
    // Validate refresh token
    const refreshResult = this.validateToken(refreshToken, "refresh");
    if (!refreshResult.success || !refreshResult.user) {
      return {
        success: false,
        error: "Invalid refresh token",
        statusCode: 401,
      };
    }
    
    // Get user from repository
    const user = await userRepository.getUserById(refreshResult.user.id);
    if (!user) {
      return {
        success: false,
        error: "User not found",
        statusCode: 401,
      };
    }
    
    // Generate new access token
    const accessToken = this.generateAccessToken(user);
    
    // Validate new access token
    const accessResult = this.validateToken(accessToken, "access");
    
    return accessResult;
  }
  
  /**
   * Generate API key for service-to-service authentication
   */
  generateAPIKey(serviceId: string, permissions: string[]): string {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 365 * 24 * 60 * 60; // 1 year for API keys
    
    const payload = {
      sub: serviceId,
      iat: now,
      exp: now + expiresIn,
      aud: this.config.audience,
      iss: this.config.issuer,
      roles: ["service"],
      permissions,
      type: "access" as const,
    };
    
    // Create API key with prefix
    const token = jwt.sign(payload, this.config.secret, {
      algorithm: this.config.algorithm,
      subject: serviceId,
      audience: this.config.audience,
      issuer: this.config.issuer,
      jwtid: this.generateJWTID(),
    });
    
    return `omni_${this.hashAPIKey(token)}.${token}`;
  }
  
  /**
   * Validate API key
   */
  validateAPIKey(apiKey: string): AuthResult {
    if (!apiKey.startsWith("omni_")) {
      return {
        success: false,
        error: "Invalid API key format",
        statusCode: 401,
      };
    }
    
    const [, token] = apiKey.split(".", 2);
    if (!token) {
      return {
        success: false,
        error: "Invalid API key format",
        statusCode: 401,
      };
    }
    
    // Validate as regular JWT token
    return this.validateToken(token, "access");
  }
  
  /**
   * Parse expiration string to seconds
   */
  private parseExpiration(expiration: string): number {
    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1), 10);
    
    switch (unit) {
      case "s": return value;
      case "m": return value * 60;
      case "h": return value * 3600;
      case "d": return value * 86400;
      case "w": return value * 604800;
      case "M": return value * 2592000; // ~30 days
      case "Y": return value * 31536000;
      default: return 3600; // Default to 1 hour
    }
  }
  
  /**
   * Generate JWT ID
   */
  private generateJWTID(): string {
    return randomBytes(16).toString("hex");
  }
  
  /**
   * Hash API key for storage
   */
  private hashAPIKey(token: string): string {
    return createHash("sha256").update(token).digest("hex").substring(0, 16);
  }
}