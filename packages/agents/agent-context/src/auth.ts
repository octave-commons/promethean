import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { AuthToken, AuthService } from './types';
import { SecurityValidator, SecurityLogger, RateLimiter } from './security';
import { AuthUtils } from './auth-utils';
import { ApiKeyManager } from './api-keys';

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
    const validatedPermissions = SecurityValidator.validatePermissions(permissions);

    this.checkRateLimit(validatedAgentId, 'generateToken');

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

  private checkRateLimit(agentId: string, action: string): void {
    if (!this.rateLimiter.isAllowed(`${action}:${agentId}`)) {
      SecurityLogger.log({
        type: 'rate_limit',
        severity: 'medium',
        agentId,
        action,
        details: { reason: 'Rate limit exceeded' },
      });
      throw new Error('Rate limit exceeded. Please try again later.');
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
      this.checkRateLimitByKey(key, 'validateToken');

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

  private checkRateLimitByKey(key: string, action: string): void {
    if (!this.rateLimiter.isAllowed(key)) {
      SecurityLogger.log({
        type: 'rate_limit',
        severity: 'medium',
        action,
        details: { reason: 'Rate limit exceeded' },
      });
      throw new Error('Rate limit exceeded');
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
    if (error instanceof Error && error.message === 'Rate limit exceeded') {
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

      // Validate the old token first
      const oldAuthToken = await this.validateToken(validatedToken);
      if (!oldAuthToken) {
        return null;
      }

      // Revoke the old token
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
      const validatedPermissions = SecurityValidator.validatePermissions([permission]);

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
}
