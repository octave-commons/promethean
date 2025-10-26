import type { JWTPayload, AuthTokens, AuthConfig } from '../types/security.js';
// Mock imports for type checking - will be resolved when dependencies are installed
// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * JWT service for token management and validation
 */
export class JWTService {
  private readonly config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  /**
   * Generate access and refresh tokens for a user
   */
  async generateTokens(user: {
    readonly id: string;
    readonly roles: readonly string[];
    readonly permissions: readonly string[];
  }): Promise<AuthTokens> {
    const now = Math.floor(Date.now() / 1000);

    const accessTokenPayload: JWTPayload = {
      sub: user.id,
      roles: user.roles,
      permissions: user.permissions,
      iat: now,
      exp: now + this.parseExpiration(this.config.jwtExpiresIn),
      type: 'access',
    };

    const refreshTokenPayload: JWTPayload = {
      sub: user.id,
      roles: user.roles,
      permissions: user.permissions,
      iat: now,
      exp: now + this.parseExpiration(this.config.refreshExpiresIn),
      type: 'refresh',
    };

    const accessToken = jwt.sign(accessTokenPayload, this.config.jwtSecret, {
      algorithm: 'HS256',
    });

    const refreshToken = jwt.sign(refreshTokenPayload, this.config.jwtSecret, {
      algorithm: 'HS256',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiration(this.config.jwtExpiresIn),
    };
  }

  /**
   * Verify and decode a JWT token
   */
  async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const decoded = jwt.verify(token, this.config.jwtSecret, {
        algorithms: ['HS256'],
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      // Token is invalid or expired
      return null;
    }
  }

  /**
   * Refresh an access token using a refresh token
   */
  async refreshToken(refreshToken: string): Promise<string | null> {
    try {
      const decoded = await this.verifyToken(refreshToken);

      if (!decoded || decoded.type !== 'refresh') {
        return null;
      }

      // Generate new access token with same user data
      const now = Math.floor(Date.now() / 1000);
      const accessTokenPayload: JWTPayload = {
        sub: decoded.sub,
        roles: decoded.roles,
        permissions: decoded.permissions,
        iat: now,
        exp: now + this.parseExpiration(this.config.jwtExpiresIn),
        type: 'access',
      };

      return jwt.sign(accessTokenPayload, this.config.jwtSecret, {
        algorithm: 'HS256',
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Hash an API key using bcrypt
   */
  async hashApiKey(apiKey: string): Promise<string> {
    return bcrypt.hash(apiKey, this.config.bcryptRounds);
  }

  /**
   * Verify an API key against a hash
   */
  async verifyApiKey(apiKey: string, hashedKey: string): Promise<boolean> {
    return bcrypt.compare(apiKey, hashedKey);
  }

  /**
   * Parse expiration time string to seconds
   */
  private parseExpiration(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid expiration format: ${expiration}`);
    }

    const [, value, unit] = match;
    const num = parseInt(value!, 10);

    switch (unit) {
      case 's':
        return num;
      case 'm':
        return num * 60;
      case 'h':
        return num * 60 * 60;
      case 'd':
        return num * 24 * 60 * 60;
      default:
        throw new Error(`Unknown time unit: ${unit}`);
    }
  }
}
