/**
 * JWT Token Management for OAuth System
 *
 * Secure JWT token generation, validation, and refresh
 * following security best practices and the project's functional programming style.
 */

import crypto from 'node:crypto';
import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import type { OAuthSession, OAuthUserInfo } from './types.js';

/**
 * JWT token configuration
 */
export type JwtTokenConfig = Readonly<{
  readonly secret: string;
  readonly issuer: string;
  readonly audience: string;
  readonly accessTokenExpiry: number; // seconds
  readonly refreshTokenExpiry: number; // seconds
  readonly algorithm: jwt.Algorithm;
}>;

/**
 * JWT token payload
 */
export type JwtTokenPayload = Readonly<{
  readonly sub: string; // User ID
  readonly iss: string; // Issuer
  readonly aud: string; // Audience
  readonly iat: number; // Issued at
  readonly exp: number; // Expires at
  readonly jti: string; // JWT ID
  readonly type: 'access' | 'refresh';
  readonly provider: string;
  readonly sessionId: string;
  readonly scope?: string[];
  readonly metadata?: Record<string, unknown>;
}>;

/**
 * JWT token pair
 */
export type JwtTokenPair = Readonly<{
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
  readonly tokenType: 'Bearer';
}>;

/**
 * JWT token manager
 */
export class JwtTokenManager {
  private readonly config: JwtTokenConfig;
  private readonly keyRotationEnabled: boolean;
  private readonly blacklistedTokens = new Set<string>();

  constructor(config: JwtTokenConfig, options: { enableKeyRotation?: boolean } = {}) {
    this.config = config;
    this.keyRotationEnabled = options.enableKeyRotation ?? true;

    // Validate configuration
    this.validateConfig();
  }

  /**
   * Generate JWT token pair for user session
   */
  generateTokenPair(
    userInfo: OAuthUserInfo,
    sessionId: string,
    oauthSession: OAuthSession,
  ): JwtTokenPair {
    const now = Math.floor(Date.now() / 1000);
    const jti = crypto.randomUUID();

    // Access token payload
    const accessTokenPayload: JwtTokenPayload = {
      sub: userInfo.id,
      iss: this.config.issuer,
      aud: this.config.audience,
      iat: now,
      exp: now + this.config.accessTokenExpiry,
      jti,
      type: 'access',
      provider: userInfo.provider,
      sessionId,
      scope: this.extractScopes(userInfo),
      metadata: {
        username: userInfo.username,
        email: userInfo.email,
        name: userInfo.name,
        avatar: userInfo.avatar,
        ...userInfo.metadata,
      },
    };

    // Refresh token payload
    const refreshTokenPayload: JwtTokenPayload = {
      sub: userInfo.id,
      iss: this.config.issuer,
      aud: this.config.audience,
      iat: now,
      exp: now + this.config.refreshTokenExpiry,
      jti: crypto.randomUUID(),
      type: 'refresh',
      provider: userInfo.provider,
      sessionId,
      metadata: {
        oauthSessionId: oauthSession.sessionId,
        originalProvider: oauthSession.provider,
      },
    };

    const signOptions: SignOptions = {
      algorithm: this.config.algorithm,
      issuer: this.config.issuer,
      audience: this.config.audience,
      jwtid: jti,
    };

    const accessToken = jwt.sign(accessTokenPayload, this.config.secret, signOptions);
    const refreshToken = jwt.sign(refreshTokenPayload, this.config.secret, signOptions);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.accessTokenExpiry,
      tokenType: 'Bearer',
    };
  }

  /**
   * Validate and decode access token
   */
  validateAccessToken(token: string): JwtTokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.config.secret, {
        algorithms: [this.config.algorithm],
        issuer: this.config.issuer,
        audience: this.config.audience,
      }) as JwtTokenPayload;

      // Check if token is blacklisted
      if (this.blacklistedTokens.has(decoded.jti)) {
        return null;
      }

      // Ensure it's an access token
      if (decoded.type !== 'access') {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate and decode refresh token
   */
  validateRefreshToken(token: string): JwtTokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.config.secret, {
        algorithms: [this.config.algorithm],
        issuer: this.config.issuer,
        audience: this.config.audience,
      }) as JwtTokenPayload;

      // Check if token is blacklisted
      if (this.blacklistedTokens.has(decoded.jti)) {
        return null;
      }

      // Ensure it's a refresh token
      if (decoded.type !== 'refresh') {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  refreshAccessToken(refreshToken: string, userInfo: OAuthUserInfo): JwtTokenPair | null {
    const refreshPayload = this.validateRefreshToken(refreshToken);
    if (!refreshPayload) {
      return null;
    }

    // Blacklist old refresh token
    this.blacklistToken(refreshPayload.jti);

    // Create new session ID for security
    const newSessionId = crypto.randomUUID();

    // Create new OAuth session mock
    const oauthSession: OAuthSession = {
      sessionId: newSessionId,
      userId: userInfo.id,
      provider: userInfo.provider,
      accessToken: '', // Not used in JWT context
      createdAt: new Date(),
      lastAccessAt: new Date(),
      metadata: refreshPayload.metadata,
    };

    return this.generateTokenPair(userInfo, newSessionId, oauthSession);
  }

  /**
   * Blacklist a token by JWT ID
   */
  blacklistToken(jti: string): void {
    this.blacklistedTokens.add(jti);

    // Cleanup old blacklisted tokens periodically
    this.cleanupBlacklistedTokens();
  }

  /**
   * Extract user-friendly scopes from OAuth user info
   */
  private extractScopes(userInfo: OAuthUserInfo): string[] {
    const scopes = ['read']; // Base scope

    // Add provider-specific scopes based on metadata
    if (userInfo.metadata) {
      if (userInfo.provider === 'github') {
        const githubMeta = userInfo.metadata as any;
        if (githubMeta.publicRepos > 0) scopes.push('github:read');
        if (githubMeta.emailVerified) scopes.push('email:verified');
      } else if (userInfo.provider === 'google') {
        const googleMeta = userInfo.metadata as any;
        if (googleMeta.emailVerified) scopes.push('email:verified');
        if (googleMeta.hostedDomain) scopes.push('domain:restricted');
      }
    }

    return scopes;
  }

  /**
   * Validate JWT configuration
   */
  private validateConfig(): void {
    if (!this.config.secret || this.config.secret.length < 32) {
      throw new Error('JWT secret must be at least 32 characters long');
    }

    if (!this.config.issuer) {
      throw new Error('JWT issuer is required');
    }

    if (!this.config.audience) {
      throw new Error('JWT audience is required');
    }

    if (this.config.accessTokenExpiry <= 0) {
      throw new Error('Access token expiry must be positive');
    }

    if (this.config.refreshTokenExpiry <= 0) {
      throw new Error('Refresh token expiry must be positive');
    }

    const validAlgorithms: jwt.Algorithm[] = ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'HS256', 'HS384', 'HS512'];
    if (!validAlgorithms.includes(this.config.algorithm)) {
      throw new Error(`Invalid JWT algorithm: ${this.config.algorithm}`);
    }
  }

  /**
   * Cleanup old blacklisted tokens
   */
  private cleanupBlacklistedTokens(): void {
    // In a production environment, this should use a more sophisticated
    // approach with TTL or persistent storage
    if (this.blacklistedTokens.size > 10000) {
      // Clear half of the tokens when we get too many
      const tokens = Array.from(this.blacklistedTokens);
      const toKeep = tokens.slice(-5000);
      this.blacklistedTokens.clear();
      toKeep.forEach(token => this.blacklistedTokens.add(token));
    }
  }

  /**
   * Get token information without validation (for debugging)
   */
  decodeToken(token: string): JwtTokenPayload | null {
    try {
      return jwt.decode(token) as JwtTokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(payload: JwtTokenPayload): boolean {
    return Date.now() >= payload.exp * 1000;
  }

  /**
   * Check if token is close to expiry
   */
  isTokenExpiringSoon(payload: JwtTokenPayload, thresholdSeconds: number = 300): boolean {
    const timeUntilExpiry = payload.exp * 1000 - Date.now();
    return timeUntilExpiry <= thresholdSeconds * 1000;
  }
}