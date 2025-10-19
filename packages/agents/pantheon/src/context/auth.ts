/**
 * Authentication and Authorization services
 * Migrated from agent-context package with unified type system integration
 */

import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import type { AuthToken, AuthService } from './types.js';
import { SecurityValidator, SecurityLogger, RateLimiter } from './security.js';

// Utility functions that were in auth-utils
export class AuthUtils {
  static async hashPassword(password: string, saltRounds: number = 10): Promise<string> {
    return bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!password || typeof password !== 'string') {
      errors.push('Password is required and must be a string');
      return { isValid: false, errors };
    }

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      errors.push('Password must be less than 128 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static logAuthError(action: string, error: unknown): void {
    SecurityLogger.log({
      type: 'authentication',
      severity: 'medium',
      action,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
  }

  static generateSecureRandomString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// API Key Management
export class ApiKeyManager {
  private apiKeys: Map<string, AuthToken> = new Map();

  constructor(private secret: string) {}

  generateApiKey(agentId: string, permissions: string[]): string {
    const validatedAgentId = SecurityValidator.validateAgentId(agentId);
    const validatedPermissions = SecurityValidator.validatePermissions(permissions);

    const apiKey = `pk_${AuthUtils.generateSecureRandomString(32)}`;
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year expiry

    const authToken: AuthToken = {
      token: apiKey,
      agentId: validatedAgentId,
      expiresAt,
      permissions: validatedPermissions
    };

    this.apiKeys.set(apiKey, authToken);

    SecurityLogger.log({
      type: 'authentication',
      severity: 'low',
      agentId: validatedAgentId,
      action: 'generateApiKey',
      details: { permissions: validatedPermissions }
    });

    return apiKey;
  }

  async validateApiKey(apiKey: string): Promise<AuthToken | null> {
    try {
      if (!apiKey || typeof apiKey !== 'string' || !apiKey.startsWith('pk_')) {
        return null;
      }

      const authToken = this.apiKeys.get(apiKey);
      if (!authToken) {
        return null;
      }

      // Check if expired
      if (authToken.expiresAt < new Date()) {
        this.apiKeys.delete(apiKey);
        return null;
      }

      SecurityLogger.log({
        type: 'authentication',
        severity: 'low',
        agentId: authToken.agentId,
        action: 'validateApiKey',
        details: { success: true }
      });

      return authToken;
    } catch (error) {
      AuthUtils.logAuthError('validateApiKey', error);
      return null;
    }
  }

  revokeApiKey(apiKey: string): void {
    try {
      const authToken = this.apiKeys.get(apiKey);
      if (authToken) {
        this.apiKeys.delete(apiKey);
        
        SecurityLogger.log({
          type: 'authentication',
          severity: 'low',
          agentId: authToken.agentId,
          action: 'revokeApiKey',
          details: { revoked: true }
        });
      }
    } catch (error) {
      AuthUtils.logAuthError('revokeApiKey', error);
    }
  }

  getApiKeysForAgent(agentId: string): string[] {
    const validatedAgentId = SecurityValidator.validateAgentId(agentId);
    const apiKeys: string[] = [];

    for (const [apiKey, authToken] of this.apiKeys.entries()) {
      if (authToken.agentId === validatedAgentId) {
        apiKeys.push(apiKey);
      }
    }

    return apiKeys;
  }
}

// Main JWT Auth Service
export class JWTAuthService implements AuthService {
  private readonly jwtSecret: string;
  private readonly tokenExpiry: string;
  private revokedTokens: Set<string> = new Set();
  private rateLimiter: RateLimiter;
  private readonly rateLimitWindow: number = 60000; // 1 minute
  private readonly maxAttempts: number = 3; // 3 attempts
  private readonly apiKeyManager: ApiKeyManager;

  constructor(
    configOrSecret?:
      | string
      | {
          jwtSecret?: string;
          tokenExpiry?: string;
          rateLimitWindow?: number;
          maxAttempts?: number;
        },
    tokenExpiry: string = '24h',
  ) {
    // Get JWT secret from config or environment variable
    let jwtSecret: string | undefined;
    if (typeof configOrSecret === 'string') {
      jwtSecret = configOrSecret || process.env.JWT_SECRET;
      this.tokenExpiry = tokenExpiry;
    } else {
      jwtSecret = configOrSecret?.jwtSecret || process.env.JWT_SECRET;
      this.tokenExpiry = configOrSecret?.tokenExpiry || tokenExpiry;
      this.rateLimitWindow = configOrSecret?.rateLimitWindow || this.rateLimitWindow;
      this.maxAttempts = configOrSecret?.maxAttempts || this.maxAttempts;
    }

    if (!jwtSecret) {
      throw new Error(
        'JWT secret is required. Set JWT_SECRET environment variable or provide config.',
      );
    }

    this.jwtSecret = jwtSecret;
    this.rateLimiter = RateLimiter.getInstance(
      'auth-service',
      this.rateLimitWindow,
      this.maxAttempts,
    );
    this.apiKeyManager = new ApiKeyManager(jwtSecret);
  }

  async generateToken(agentId: string, permissions: string[]): Promise<AuthToken> {
    const validatedAgentId = SecurityValidator.validateAgentId(agentId);
    const validatedPermissions = this.validatePermissions(permissions);

    await this.checkRateLimit(validatedAgentId, 'generateToken');

    try {
      const tokenId = uuidv4();
      const expiresAt = this.calculateExpiryDate();
      const payload = this.createTokenPayload(tokenId, validatedAgentId, validatedPermissions);
      const token = this.signToken(payload);

      this.logTokenGeneration(validatedAgentId, tokenId, validatedPermissions);

      return {
        token,
        agentId: validatedAgentId,
        expiresAt,
        permissions: validatedPermissions,
      };
    } catch (error) {
      this.logTokenError(agentId, 'generateToken', error);
      throw error;
    }
  }

  private validatePermissions(permissions: string[]): string[] {
    if (!Array.isArray(permissions)) {
      throw new Error('Permissions must be an array');
    }

    const validPermissions = [
      'read',
      'write',
      'admin',
      'context:create',
      'context:read',
      'context:update',
      'context:delete',
      'context:share',
      'snapshot:create',
      'snapshot:read',
      'snapshot:delete',
      'event:create',
      'event:read',
      'auth:generate_token',
      'auth:validate_token',
      'auth:revoke_token'
    ];

    return permissions.filter(permission => 
      typeof permission === 'string' && validPermissions.includes(permission)
    );
  }

  private async checkRateLimit(agentId: string, action: string): Promise<void> {
    try {
      await this.rateLimiter.checkLimit(`${action}:${agentId}`);
    } catch (error) {
      SecurityLogger.log({
        type: 'rate_limit',
        severity: 'medium',
        agentId,
        action,
        details: { reason: 'Rate limit exceeded' },
      });
      throw error;
    }
  }

  private calculateExpiryDate(): Date {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    return expiresAt;
  }

  private createTokenPayload(tokenId: string, agentId: string, permissions: string[]) {
    return {
      tokenId,
      agentId,
      permissions,
      type: 'agent-auth',
    };
  }

  private signToken(payload: object): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.tokenExpiry,
      issuer: 'promethean-agent-os',
      audience: 'promethean-agents',
    } as jwt.SignOptions);
  }

  private logTokenGeneration(agentId: string, tokenId: string, permissions: string[]): void {
    SecurityLogger.log({
      type: 'authentication',
      severity: 'low',
      agentId,
      action: 'generateToken',
      details: { tokenId, permissions },
    });
  }

  private logTokenError(agentId: string, action: string, error: unknown): void {
    SecurityLogger.log({
      type: 'authentication',
      severity: 'medium',
      agentId,
      action,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
  }

  async validateToken(token: string): Promise<AuthToken | null> {
    const validatedToken = SecurityValidator.validateToken(token);
    const key = `validate:${validatedToken.substring(0, 10)}`;

    try {
      await this.checkRateLimitByKey(key, 'validateToken');

      if (this.revokedTokens.has(validatedToken)) {
        this.logValidationFailure('validateToken', 'Token revoked');
        return null;
      }

      const decoded = this.verifyToken(validatedToken);

      if (!this.isValidAgentToken(decoded)) {
        this.logValidationFailure(
          decoded.agentId || 'unknown',
          'validateToken',
          'Invalid token type',
        );
        return null;
      }

      this.logValidationSuccess(decoded.agentId || 'unknown', 'validateToken');

      return this.buildAuthToken(validatedToken, decoded);
    } catch (error) {
      return this.handleValidationError(error, 'validateToken');
    }
  }

  private async checkRateLimitByKey(key: string, action: string): Promise<void> {
    try {
      await this.rateLimiter.checkLimit(key);
    } catch (error) {
      SecurityLogger.log({
        type: 'rate_limit',
        severity: 'medium',
        action,
        details: { reason: 'Rate limit exceeded' },
      });
      throw error;
    }
  }

  private verifyToken(token: string): jwt.JwtPayload {
    return jwt.verify(token, this.jwtSecret, {
      issuer: 'promethean-agent-os',
      audience: 'promethean-agents',
    }) as jwt.JwtPayload;
  }

  private isValidAgentToken(decoded: jwt.JwtPayload): boolean {
    return decoded.type === 'agent-auth';
  }

  private logValidationFailure(agentId?: string, action?: string, reason?: string): void {
    SecurityLogger.log({
      type: 'authentication',
      severity: 'medium',
      agentId,
      action: action || 'validateToken',
      details: { reason: reason || 'Validation failed' },
    });
  }

  private logValidationSuccess(agentId: string, action: string): void {
    SecurityLogger.log({
      type: 'authentication',
      severity: 'low',
      agentId,
      action,
      details: { success: true },
    });
  }

  private buildAuthToken(token: string, decoded: jwt.JwtPayload): AuthToken {
    return {
      token,
      agentId: decoded.agentId as string,
      expiresAt: new Date((decoded.exp as number) * 1000),
      permissions: decoded.permissions as string[],
    };
  }

  private handleValidationError(error: unknown, action: string): null {
    if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
      throw error;
    }

    SecurityLogger.log({
      type: 'authentication',
      severity: 'medium',
      action,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    return null;
  }

  async revokeToken(token: string): Promise<void> {
    try {
      const validatedToken = SecurityValidator.validateToken(token);

      // Add to revoked tokens set
      this.revokedTokens.add(validatedToken);

      SecurityLogger.log({
        type: 'authentication',
        severity: 'low',
        action: 'revokeToken',
        details: { tokenHash: validatedToken.substring(0, 10) + '...' },
      });
    } catch (error) {
      SecurityLogger.log({
        type: 'authentication',
        severity: 'medium',
        action: 'revokeToken',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      // Re-throw error to match interface expectation
      throw error;
    }
  }

  async refreshToken(oldToken: string): Promise<AuthToken | null> {
    try {
      const validatedToken = SecurityValidator.validateToken(oldToken);

      // Validate old token first
      const oldAuthToken = await this.validateToken(validatedToken);
      if (!oldAuthToken) {
        return null;
      }

      // Revoke old token
      await this.revokeToken(validatedToken);

      // Generate new token with same permissions
      return this.generateToken(oldAuthToken.agentId, oldAuthToken.permissions);
    } catch (error) {
      SecurityLogger.log({
        type: 'authentication',
        severity: 'medium',
        action: 'refreshToken',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      return null;
    }
  }

  async hasPermission(token: string, permission: string): Promise<boolean> {
    try {
      const validatedToken = SecurityValidator.validateToken(token);
      const validatedPermissions = this.validatePermissions([permission]);

      if (validatedPermissions.length === 0) {
        return false;
      }

      const validatedPermission = validatedPermissions[0]!;

      const authToken = await this.validateToken(validatedToken);
      if (!authToken) {
        return false;
      }

      return authToken.permissions.includes(validatedPermission);
    } catch (error) {
      AuthUtils.logAuthError('hasPermission', error);
      return false;
    }
  }

  async hashPassword(password: string, saltRounds: number = 10): Promise<string> {
    return AuthUtils.hashPassword(password, saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return AuthUtils.verifyPassword(password, hash);
  }

  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    return AuthUtils.validatePassword(password);
  }

  generateApiKey(agentId: string, permissions: string[]): string {
    return this.apiKeyManager.generateApiKey(agentId, permissions);
  }

  async validateApiKey(apiKey: string): Promise<AuthToken | null> {
    return this.apiKeyManager.validateApiKey(apiKey);
  }

  revokeApiKey(apiKey: string): void {
    this.apiKeyManager.revokeApiKey(apiKey);
  }

  getApiKeysForAgent(agentId: string): string[] {
    return this.apiKeyManager.getApiKeysForAgent(agentId);
  }

  // Enhanced methods for unified system
  async getTokenInfo(token: string): Promise<{
    isValid: boolean;
    agentId?: string;
    permissions?: string[];
    expiresAt?: Date;
    remainingTime?: number;
  }> {
    try {
      const authToken = await this.validateToken(token);
      if (!authToken) {
        return { isValid: false };
      }

      const now = new Date();
      const remainingTime = authToken.expiresAt.getTime() - now.getTime();

      return {
        isValid: true,
        agentId: authToken.agentId,
        permissions: authToken.permissions,
        expiresAt: authToken.expiresAt,
        remainingTime: Math.max(0, remainingTime)
      };
    } catch (error) {
      return { isValid: false };
    }
  }

  async cleanupExpiredTokens(): Promise<number> {
    const now = new Date();
    let cleanedCount = 0;

    // Clean up revoked tokens (in a real implementation, you'd use a database)
    for (const token of this.revokedTokens) {
      try {
        const decoded = jwt.decode(token) as any;
        if (decoded && decoded.exp * 1000 < now.getTime()) {
          this.revokedTokens.delete(token);
          cleanedCount++;
        }
      } catch {
        // Invalid token, remove it
        this.revokedTokens.delete(token);
        cleanedCount++;
      }
    }

    SecurityLogger.log({
      type: 'authentication',
      severity: 'low',
      action: 'cleanupExpiredTokens',
      details: { cleanedCount }
    });

    return cleanedCount;
  }
}

export default {
  JWTAuthService,
  AuthUtils,
  ApiKeyManager
};