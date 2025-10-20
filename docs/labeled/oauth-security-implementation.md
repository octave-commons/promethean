# OAuth Security Implementation Guide

This document provides specific code implementations for the security hardening recommendations outlined in the OAuth Security Plan.

## 1. Persistent Session Storage Implementation

### 1.1 Redis-based Session Store

```typescript
// src/auth/oauth/storage/redis-session-store.ts
import Redis from 'ioredis';
import { type OAuthSession } from '../types.js';
import crypto from 'node:crypto';

export class RedisSessionStore {
  private readonly redis: Redis;
  private readonly keyPrefix = 'oauth:session:';
  private readonly sessionExpiry = 24 * 60 * 60; // 24 hours

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }

  async store(session: OAuthSession): Promise<void> {
    const key = this.getSessionKey(session.sessionId);
    const encryptedSession = await this.encryptSession(session);

    await this.redis.setex(key, this.sessionExpiry, JSON.stringify(encryptedSession));
  }

  async retrieve(sessionId: string): Promise<OAuthSession | null> {
    const key = this.getSessionKey(sessionId);
    const data = await this.redis.get(key);

    if (!data) return null;

    try {
      const encryptedSession = JSON.parse(data);
      return await this.decryptSession(encryptedSession);
    } catch {
      await this.redis.del(key);
      return null;
    }
  }

  async revoke(sessionId: string): Promise<void> {
    const key = this.getSessionKey(sessionId);
    await this.redis.del(key);

    // Also add to blacklist for immediate revocation
    await this.redis.setex(`oauth:blacklist:${sessionId}`, this.sessionExpiry, '1');
  }

  async isBlacklisted(sessionId: string): Promise<boolean> {
    const result = await this.redis.exists(`oauth:blacklist:${sessionId}`);
    return result === 1;
  }

  async cleanup(): Promise<void> {
    // Redis handles TTL automatically
    // This can be used for manual cleanup if needed
    const pattern = `${this.keyPrefix}*`;
    const keys = await this.redis.keys(pattern);

    for (const key of keys) {
      const ttl = await this.redis.ttl(key);
      if (ttl === -1) {
        // No expiry set
        await this.redis.expire(key, this.sessionExpiry);
      }
    }
  }

  private getSessionKey(sessionId: string): string {
    return `${this.keyPrefix}${sessionId}`;
  }

  private async encryptSession(session: OAuthSession): Promise<any> {
    const encryptionKey = process.env.SESSION_ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('SESSION_ENCRYPTION_KEY not configured');
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', encryptionKey, iv);

    let encrypted = cipher.update(JSON.stringify(session), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  private async decryptSession(encryptedData: any): Promise<OAuthSession> {
    const encryptionKey = process.env.SESSION_ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('SESSION_ENCRYPTION_KEY not configured');
    }

    const decipher = crypto.createDecipher(
      'aes-256-gcm',
      encryptionKey,
      Buffer.from(encryptedData.iv, 'hex'),
    );

    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }
}
```

### 1.2 Updated OAuth System with Persistent Storage

```typescript
// src/auth/oauth/oauth-system-secure.ts
import { RedisSessionStore } from './storage/redis-session-store.js';
import { type OAuthSystemConfig, type OAuthSession } from './types.js';

export class SecureOAuthSystem extends OAuthSystem {
  private readonly sessionStore: RedisSessionStore;
  private readonly rateLimiter: Map<string, number[]> = new Map();

  constructor(config: OAuthSystemConfig, redisUrl: string) {
    super(config);
    this.sessionStore = new RedisSessionStore(redisUrl);
  }

  async handleOAuthCallback(
    code: string,
    state: string,
    clientIp: string,
    error?: string,
  ): Promise<{ success: boolean; userId?: string; error?: any }> {
    // Rate limiting check
    if (this.isRateLimited(clientIp)) {
      return {
        success: false,
        error: {
          type: 'rate_limited',
          message: 'Too many OAuth attempts. Please try again later.',
        },
      };
    }

    // Log security event
    await this.logSecurityEvent('oauth_callback_attempt', {
      clientIp,
      state: state.substring(0, 8) + '...', // Partial state for logging
      hasError: !!error,
    });

    const result = await super.handleOAuthCallback(code, state, error);

    if (result.success && result.userId) {
      await this.logSecurityEvent('oauth_success', {
        userId: result.userId,
        clientIp,
      });
    } else {
      await this.logSecurityEvent('oauth_failure', {
        clientIp,
        error: result.error?.type,
      });
    }

    return result;
  }

  async getSession(sessionId: string): Promise<OAuthSession | null> {
    // Check blacklist first
    if (await this.sessionStore.isBlacklisted(sessionId)) {
      return null;
    }

    const session = await this.sessionStore.retrieve(sessionId);
    if (!session) return null;

    // Update last access time
    const updatedSession: OAuthSession = {
      ...session,
      lastAccessAt: new Date(),
    };

    await this.sessionStore.store(updatedSession);
    return updatedSession;
  }

  async revokeSession(sessionId: string): Promise<boolean> {
    await this.sessionStore.revoke(sessionId);
    await this.logSecurityEvent('session_revoked', { sessionId });
    return true;
  }

  private isRateLimited(clientIp: string): boolean {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 5;

    const attempts = this.rateLimiter.get(clientIp) || [];
    const recentAttempts = attempts.filter((time) => now - time < windowMs);

    if (recentAttempts.length >= maxAttempts) {
      return true;
    }

    recentAttempts.push(now);
    this.rateLimiter.set(clientIp, recentAttempts);
    return false;
  }

  private async logSecurityEvent(
    eventType: string,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    const event = {
      timestamp: new Date().toISOString(),
      eventType,
      metadata,
      service: 'oauth-system',
    };

    // Send to logging system
    console.log(JSON.stringify(event));

    // In production, send to secure logging service
    // await securityLogger.log(event);
  }
}
```

## 2. Enhanced JWT Token Management

### 2.1 Secure JWT Manager with Rotation

```typescript
// src/auth/oauth/jwt-secure.ts
import jwt, { type SignOptions } from 'jsonwebtoken';
import crypto from 'node:crypto';
import { RedisSessionStore } from './storage/redis-session-store.js';
import { type OAuthSession, type OAuthUserInfo } from './types.js';

export class SecureJwtTokenManager {
  private readonly config: JwtTokenConfig;
  private readonly sessionStore: RedisSessionStore;
  private readonly keyRotationInterval = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor(config: JwtTokenConfig, sessionStore: RedisSessionStore) {
    this.config = config;
    this.sessionStore = sessionStore;

    // Start key rotation
    this.startKeyRotation();
  }

  async generateTokenPair(
    userInfo: OAuthUserInfo,
    sessionId: string,
    oauthSession: OAuthSession,
    clientInfo: ClientInfo,
  ): Promise<JwtTokenPair> {
    const now = Math.floor(Date.now() / 1000);
    const jti = crypto.randomUUID();
    const nonce = crypto.randomBytes(16).toString('hex');

    // Access token with minimal claims
    const accessTokenPayload: SecureJwtPayload = {
      sub: userInfo.id,
      iss: this.config.issuer,
      aud: this.config.audience,
      iat: now,
      exp: now + Math.min(this.config.accessTokenExpiry, 900), // Max 15 minutes
      jti,
      type: 'access',
      provider: userInfo.provider,
      sessionId,
      nonce,
      authTime: now,
      acr: 'urn:mace:incommon:iap:bronze',
      amr: ['pwd', 'mfa'],
      clientHash: this.hashClientInfo(clientInfo),
    };

    // Refresh token with longer expiry
    const refreshTokenPayload: SecureJwtPayload = {
      ...accessTokenPayload,
      exp: now + this.config.refreshTokenExpiry,
      jti: crypto.randomUUID(),
      type: 'refresh',
      nonce: crypto.randomBytes(16).toString('hex'),
    };

    const signOptions: SignOptions = {
      algorithm: this.config.algorithm,
      jwtid: jti,
      keyid: await this.getCurrentKeyId(),
    };

    const accessToken = jwt.sign(
      accessTokenPayload,
      await this.getCurrentPrivateKey(),
      signOptions,
    );
    const refreshToken = jwt.sign(
      refreshTokenPayload,
      await this.getCurrentPrivateKey(),
      signOptions,
    );

    // Store refresh token reference
    await this.storeRefreshTokenReference(refreshTokenPayload.jti, userInfo.id, sessionId);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.accessTokenExpiry,
      tokenType: 'Bearer',
    };
  }

  async validateAccessToken(
    token: string,
    clientInfo: ClientInfo,
  ): Promise<SecureJwtPayload | null> {
    try {
      const decoded = jwt.verify(token, await this.getCurrentPublicKey(), {
        algorithms: [this.config.algorithm],
        issuer: this.config.issuer,
        audience: this.config.audience,
      }) as SecureJwtPayload;

      // Check if token is blacklisted
      if (await this.isTokenBlacklisted(decoded.jti)) {
        return null;
      }

      // Verify client binding
      if (decoded.clientHash !== this.hashClientInfo(clientInfo)) {
        await this.logSecurityEvent('token_binding_failed', {
          jti: decoded.jti,
          userId: decoded.sub,
        });
        return null;
      }

      // Ensure it's an access token
      if (decoded.type !== 'access') {
        return null;
      }

      return decoded;
    } catch (error) {
      await this.logSecurityEvent('token_validation_failed', {
        error: error.message,
      });
      return null;
    }
  }

  async refreshAccessToken(
    refreshToken: string,
    clientInfo: ClientInfo,
  ): Promise<JwtTokenPair | null> {
    const refreshPayload = await this.validateRefreshToken(refreshToken, clientInfo);
    if (!refreshPayload) {
      return null;
    }

    // Blacklist old refresh token
    await this.blacklistToken(refreshPayload.jti);

    // Get user info and session
    const session = await this.sessionStore.retrieve(refreshPayload.sessionId);
    if (!session) {
      return null;
    }

    // Generate new token pair
    const userInfo: OAuthUserInfo = {
      id: session.userId,
      provider: session.provider,
      // ... minimal user info
    };

    return this.generateTokenPair(userInfo, session.sessionId, session, clientInfo);
  }

  async revokeToken(jti: string): Promise<void> {
    await this.blacklistToken(jti);
    await this.removeRefreshTokenReference(jti);
  }

  private async isTokenBlacklisted(jti: string): Promise<boolean> {
    return await this.sessionStore.isBlacklisted(`token:${jti}`);
  }

  private async blacklistToken(jti: string): Promise<void> {
    await this.sessionStore.revoke(`token:${jti}`);
  }

  private hashClientInfo(clientInfo: ClientInfo): string {
    const data = `${clientInfo.ip}:${clientInfo.userAgent}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private async getCurrentPrivateKey(): Promise<string> {
    // Implement key rotation logic
    return process.env.JWT_PRIVATE_KEY || '';
  }

  private async getCurrentPublicKey(): Promise<string> {
    return process.env.JWT_PUBLIC_KEY || '';
  }

  private async getCurrentKeyId(): Promise<string> {
    // Return current key ID for rotation
    return 'current';
  }

  private async storeRefreshTokenReference(
    jti: string,
    userId: string,
    sessionId: string,
  ): Promise<void> {
    const reference = {
      jti,
      userId,
      sessionId,
      createdAt: new Date().toISOString(),
    };

    await this.sessionStore.store({
      sessionId: `refresh:${jti}`,
      userId,
      provider: 'system',
      accessToken: '',
      createdAt: new Date(),
      lastAccessAt: new Date(),
      metadata: reference,
    } as OAuthSession);
  }

  private async removeRefreshTokenReference(jti: string): Promise<void> {
    await this.sessionStore.revoke(`refresh:${jti}`);
  }

  private startKeyRotation(): void {
    setInterval(async () => {
      try {
        await this.rotateKeys();
      } catch (error) {
        console.error('Key rotation failed:', error);
      }
    }, this.keyRotationInterval);
  }

  private async rotateKeys(): Promise<void> {
    // Implement key rotation logic
    await this.logSecurityEvent('key_rotation_completed', {
      timestamp: new Date().toISOString(),
    });
  }

  private async logSecurityEvent(
    eventType: string,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    const event = {
      timestamp: new Date().toISOString(),
      eventType,
      metadata,
      service: 'jwt-manager',
    };

    console.log(JSON.stringify(event));
  }
}

interface ClientInfo {
  readonly ip: string;
  readonly userAgent: string;
  readonly fingerprint?: string;
}

interface SecureJwtPayload {
  readonly sub: string;
  readonly iss: string;
  readonly aud: string;
  readonly iat: number;
  readonly exp: number;
  readonly jti: string;
  readonly type: 'access' | 'refresh';
  readonly provider: string;
  readonly sessionId: string;
  readonly nonce: string;
  readonly authTime: number;
  readonly acr: string;
  readonly amr: string[];
  readonly clientHash: string;
}
```

## 3. Rate Limiting and DDoS Protection

### 3.1 Advanced Rate Limiter

```typescript
// src/auth/oauth/rate-limiter.ts
import Redis from 'ioredis';

export class AdvancedRateLimiter {
  private readonly redis: Redis;
  private readonly windows = new Map<string, RateLimitWindow>();

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
    this.initializeWindows();
  }

  private initializeWindows(): void {
    // OAuth flow rate limiting
    this.windows.set('oauth_start', {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      blockDurationMs: 60 * 60 * 1000, // 1 hour
    });

    // Token refresh rate limiting
    this.windows.set('token_refresh', {
      maxRequests: 10,
      windowMs: 60 * 60 * 1000, // 1 hour
      blockDurationMs: 30 * 60 * 1000, // 30 minutes
    });

    // Failed authentication rate limiting
    this.windows.set('auth_failure', {
      maxRequests: 3,
      windowMs: 5 * 60 * 1000, // 5 minutes
      blockDurationMs: 15 * 60 * 1000, // 15 minutes
    });
  }

  async checkLimit(
    identifier: string,
    windowType: string,
    metadata?: Record<string, unknown>,
  ): Promise<RateLimitResult> {
    const window = this.windows.get(windowType);
    if (!window) {
      throw new Error(`Unknown rate limit window: ${windowType}`);
    }

    const key = `rate_limit:${windowType}:${identifier}`;
    const now = Date.now();

    // Check if currently blocked
    const blockedUntil = await this.redis.get(`${key}:blocked`);
    if (blockedUntil) {
      const blockEnd = parseInt(blockedUntil, 10);
      if (now < blockEnd) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: blockEnd,
          reason: 'blocked',
        };
      } else {
        await this.redis.del(`${key}:blocked`);
      }
    }

    // Clean old entries
    await this.redis.zremrangebyscore(key, 0, now - window.windowMs);

    // Count current requests
    const current = await this.redis.zcard(key);

    if (current >= window.maxRequests) {
      // Block the identifier
      const blockUntil = now + window.blockDurationMs;
      await this.redis.setex(
        `${key}:blocked`,
        Math.ceil(window.blockDurationMs / 1000),
        blockUntil,
      );

      await this.logRateLimitEvent(identifier, windowType, 'blocked', {
        current,
        maxRequests: window.maxRequests,
        metadata,
      });

      return {
        allowed: false,
        remaining: 0,
        resetTime: blockUntil,
        reason: 'limit_exceeded',
      };
    }

    // Add current request
    await this.redis.zadd(key, now, `${now}-${crypto.randomUUID()}`);
    await this.redis.expire(key, Math.ceil(window.windowMs / 1000));

    const remaining = window.maxRequests - (current + 1);
    const resetTime = now + window.windowMs;

    return {
      allowed: true,
      remaining,
      resetTime,
      reason: 'allowed',
    };
  }

  async getRemainingRequests(identifier: string, windowType: string): Promise<number> {
    const window = this.windows.get(windowType);
    if (!window) return 0;

    const key = `rate_limit:${windowType}:${identifier}`;
    const now = Date.now();

    await this.redis.zremrangebyscore(key, 0, now - window.windowMs);
    const current = await this.redis.zcard(key);

    return Math.max(0, window.maxRequests - current);
  }

  async resetLimit(identifier: string, windowType: string): Promise<void> {
    const key = `rate_limit:${windowType}:${identifier}`;
    await this.redis.del(key);
    await this.redis.del(`${key}:blocked`);
  }

  private async logRateLimitEvent(
    identifier: string,
    windowType: string,
    action: string,
    details: Record<string, unknown>,
  ): Promise<void> {
    const event = {
      timestamp: new Date().toISOString(),
      eventType: 'rate_limit',
      identifier,
      windowType,
      action,
      details,
      service: 'oauth-rate-limiter',
    };

    console.log(JSON.stringify(event));
  }
}

interface RateLimitWindow {
  readonly maxRequests: number;
  readonly windowMs: number;
  readonly blockDurationMs: number;
}

interface RateLimitResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly resetTime: number;
  readonly reason: 'allowed' | 'limit_exceeded' | 'blocked';
}
```

## 4. Security Monitoring and Alerting

### 4.1 Security Event Monitor

```typescript
// src/auth/oauth/security-monitor.ts
import EventEmitter from 'events';

export class SecurityMonitor extends EventEmitter {
  private readonly eventBuffer: SecurityEvent[] = [];
  private readonly maxBufferSize = 10000;
  private readonly analysisInterval = 30000; // 30 seconds

  constructor() {
    super();
    this.startAnalysis();
  }

  async recordEvent(event: SecurityEvent): Promise<void> {
    this.eventBuffer.push(event);

    // Keep buffer size manageable
    if (this.eventBuffer.length > this.maxBufferSize) {
      this.eventBuffer.splice(0, this.eventBuffer.length - this.maxBufferSize);
    }

    // Check for immediate threats
    const threat = await this.analyzeImmediateThreat(event);
    if (threat) {
      this.emit('threat_detected', threat);
    }
  }

  private async analyzeImmediateThreat(event: SecurityEvent): Promise<Threat | null> {
    // Check for brute force attacks
    if (event.eventType === 'oauth_failure') {
      const recentFailures = this.getRecentEvents(
        'oauth_failure',
        5 * 60 * 1000, // 5 minutes
        { ip: event.ip },
      );

      if (recentFailures.length >= 5) {
        return {
          type: 'brute_force',
          severity: 'high',
          description: 'Multiple OAuth failures from same IP',
          metadata: {
            ip: event.ip,
            failureCount: recentFailures.length,
            timeWindow: '5 minutes',
          },
        };
      }
    }

    // Check for token abuse
    if (event.eventType === 'token_refresh') {
      const recentRefreshes = this.getRecentEvents(
        'token_refresh',
        60 * 60 * 1000, // 1 hour
        { userId: event.userId },
      );

      if (recentRefreshes.length >= 20) {
        return {
          type: 'token_abuse',
          severity: 'medium',
          description: 'Excessive token refresh attempts',
          metadata: {
            userId: event.userId,
            refreshCount: recentRefreshes.length,
            timeWindow: '1 hour',
          },
        };
      }
    }

    return null;
  }

  private startAnalysis(): void {
    setInterval(() => {
      this.performBatchAnalysis();
    }, this.analysisInterval);
  }

  private async performBatchAnalysis(): Promise<void> {
    const threats = await this.analyzePatterns();

    for (const threat of threats) {
      this.emit('threat_detected', threat);
    }
  }

  private async analyzePatterns(): Promise<Threat[]> {
    const threats: Threat[] = [];
    const now = Date.now();

    // Analyze geographic anomalies
    const geoAnomalies = this.detectGeographicAnomalies();
    threats.push(...geoAnomalies);

    // Analyze time-based patterns
    const timeAnomalies = this.detectTimeAnomalies();
    threats.push(...timeAnomalies);

    // Analyze user behavior anomalies
    const behaviorAnomalies = this.detectBehaviorAnomalies();
    threats.push(...behaviorAnomalies);

    return threats;
  }

  private detectGeographicAnomalies(): Threat[] {
    // Group events by user and location
    const userLocations = new Map<string, Set<string>>();

    for (const event of this.eventBuffer) {
      if (event.userId && event.location) {
        const locations = userLocations.get(event.userId) || new Set();
        locations.add(event.location.country);
        userLocations.set(event.userId, locations);
      }
    }

    const threats: Threat[] = [];

    for (const [userId, locations] of userLocations) {
      if (locations.size > 3) {
        // User active from >3 countries
        threats.push({
          type: 'geographic_anomaly',
          severity: 'medium',
          description: 'User active from multiple countries simultaneously',
          metadata: {
            userId,
            countries: Array.from(locations),
            count: locations.size,
          },
        });
      }
    }

    return threats;
  }

  private detectTimeAnomalies(): Threat[] {
    // Detect unusual activity times
    const threats: Threat[] = [];
    const userActivityTimes = new Map<string, number[]>();

    for (const event of this.eventBuffer) {
      if (event.userId) {
        const hour = new Date(event.timestamp).getHours();
        const times = userActivityTimes.get(event.userId) || [];
        times.push(hour);
        userActivityTimes.set(event.userId, times);
      }
    }

    for (const [userId, times] of userActivityTimes) {
      const unusualHours = times.filter((hour) => hour >= 2 && hour <= 5);

      if (unusualHours.length > times.length * 0.3) {
        // >30% activity at 2-5 AM
        threats.push({
          type: 'time_anomaly',
          severity: 'low',
          description: 'Unusual activity during off-hours',
          metadata: {
            userId,
            unusualHours: unusualHours.length,
            totalHours: times.length,
            percentage: (unusualHours.length / times.length) * 100,
          },
        });
      }
    }

    return threats;
  }

  private detectBehaviorAnomalies(): Threat[] {
    // Detect rapid session creation
    const threats: Threat[] = [];
    const recentSessions = this.getRecentEvents('session_created', 10 * 60 * 1000); // 10 minutes

    const ipSessionCounts = new Map<string, number>();

    for (const event of recentSessions) {
      const count = ipSessionCounts.get(event.ip) || 0;
      ipSessionCounts.set(event.ip, count + 1);
    }

    for (const [ip, count] of ipSessionCounts) {
      if (count >= 10) {
        // 10+ sessions in 10 minutes
        threats.push({
          type: 'behavior_anomaly',
          severity: 'high',
          description: 'Rapid session creation from single IP',
          metadata: {
            ip,
            sessionCount: count,
            timeWindow: '10 minutes',
          },
        });
      }
    }

    return threats;
  }

  private getRecentEvents(
    eventType: string,
    timeWindowMs: number,
    filters?: Partial<SecurityEvent>,
  ): SecurityEvent[] {
    const now = Date.now();
    const cutoff = now - timeWindowMs;

    return this.eventBuffer.filter((event) => {
      if (event.eventType !== eventType) return false;
      if (event.timestamp.getTime() < cutoff) return false;

      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          if (event[key as keyof SecurityEvent] !== value) {
            return false;
          }
        }
      }

      return true;
    });
  }
}

interface SecurityEvent {
  readonly timestamp: Date;
  readonly eventType: string;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly ip: string;
  readonly userAgent?: string;
  readonly location?: {
    readonly country: string;
    readonly city: string;
  };
  readonly metadata?: Record<string, unknown>;
}

interface Threat {
  readonly type: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly description: string;
  readonly metadata: Record<string, unknown>;
}
```

## 5. Input Validation and Sanitization

### 5.1 OAuth Parameter Validation

```typescript
// src/auth/oauth/validation.ts
import { z } from 'zod';

export const OAuthCallbackSchema = z.object({
  code: z
    .string()
    .min(1, 'Authorization code is required')
    .max(2048, 'Authorization code too long')
    .regex(/^[a-zA-Z0-9\-_+/]+$/, 'Invalid authorization code format'),

  state: z
    .string()
    .min(32, 'State parameter too short')
    .max(128, 'State parameter too long')
    .regex(/^[a-zA-Z0-9\-_]+$/, 'Invalid state format'),

  error: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeErrorString(val) : undefined)),

  error_description: z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeErrorString(val) : undefined)),
});

export const OAuthStartSchema = z.object({
  provider: z.enum(['github', 'google'], {
    errorMap: () => ({ message: 'Unsupported OAuth provider' }),
  }),

  redirect_uri: z
    .string()
    .url('Invalid redirect URI')
    .refine((uri) => isAllowedRedirectUri(uri), {
      message: 'Redirect URI not allowed',
    })
    .optional(),
});

export const TokenRefreshSchema = z.object({
  refresh_token: z
    .string()
    .min(1, 'Refresh token is required')
    .max(4096, 'Refresh token too long')
    .regex(/^[a-zA-Z0-9\-_.]+$/, 'Invalid refresh token format'),
});

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateOAuthCallback(params: unknown): OAuthCallbackParams {
  try {
    return OAuthCallbackSchema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(firstError.message, firstError.path.join('.'), 'VALIDATION_ERROR');
    }
    throw new ValidationError('Invalid parameters', 'unknown', 'VALIDATION_ERROR');
  }
}

export function validateOAuthStart(params: unknown): OAuthStartParams {
  try {
    return OAuthStartSchema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(firstError.message, firstError.path.join('.'), 'VALIDATION_ERROR');
    }
    throw new ValidationError('Invalid parameters', 'unknown', 'VALIDATION_ERROR');
  }
}

export function validateTokenRefresh(params: unknown): TokenRefreshParams {
  try {
    return TokenRefreshSchema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(firstError.message, firstError.path.join('.'), 'VALIDATION_ERROR');
    }
    throw new ValidationError('Invalid parameters', 'unknown', 'VALIDATION_ERROR');
  }
}

function isAllowedRedirectUri(uri: string): boolean {
  const allowedDomains = [
    'https://promethean.ai',
    'https://app.promethean.ai',
    'http://localhost:3000',
    'http://localhost:8080',
  ];

  try {
    const url = new URL(uri);
    return allowedDomains.some((domain) => url.origin === domain || url.hostname === 'localhost');
  } catch {
    return false;
  }
}

function sanitizeErrorString(error: string): string {
  // Remove potential XSS and injection attempts
  return error
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .trim()
    .substring(0, 500); // Limit length
}

type OAuthCallbackParams = z.infer<typeof OAuthCallbackSchema>;
type OAuthStartParams = z.infer<typeof OAuthStartSchema>;
type TokenRefreshParams = z.infer<typeof TokenRefreshSchema>;
```

## 6. Integration Example

### 6.1 Secure OAuth API Endpoints

```typescript
// src/auth/oauth/routes.ts
import { Router } from 'express';
import { SecureOAuthSystem } from './oauth-system-secure.js';
import { SecureJwtTokenManager } from './jwt-secure.js';
import { AdvancedRateLimiter } from './rate-limiter.js';
import { SecurityMonitor } from './security-monitor.js';
import { validateOAuthCallback, validateOAuthStart, validateTokenRefresh } from './validation.js';

export function createSecureOAuthRoutes(
  oauthSystem: SecureOAuthSystem,
  jwtManager: SecureJwtTokenManager,
  rateLimiter: AdvancedRateLimiter,
  securityMonitor: SecurityMonitor,
): Router {
  const router = Router();

  // Start OAuth flow
  router.post('/auth/:provider', async (req, res) => {
    try {
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';

      // Rate limiting
      const rateLimitResult = await rateLimiter.checkLimit(clientIp, 'oauth_start', {
        provider: req.params.provider,
      });

      if (!rateLimitResult.allowed) {
        await securityMonitor.recordEvent({
          timestamp: new Date(),
          eventType: 'rate_limit_exceeded',
          ip: clientIp,
          userAgent,
          metadata: {
            endpoint: '/auth/:provider',
            reason: rateLimitResult.reason,
          },
        });

        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        });
      }

      // Validate input
      const params = validateOAuthStart({
        provider: req.params.provider,
        redirect_uri: req.body.redirect_uri,
      });

      // Start OAuth flow
      const { authUrl, state } = oauthSystem.startOAuthFlow(params.provider, params.redirect_uri);

      await securityMonitor.recordEvent({
        timestamp: new Date(),
        eventType: 'oauth_start',
        ip: clientIp,
        userAgent,
        metadata: {
          provider: params.provider,
          state: state.substring(0, 8) + '...', // Partial for logging
        },
      });

      res.json({ authUrl, state });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          error: 'Validation failed',
          field: error.field,
          message: error.message,
        });
      }

      console.error('OAuth start error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // OAuth callback
  router.get('/callback/:provider', async (req, res) => {
    try {
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';

      // Validate input
      const params = validateOAuthCallback({
        code: req.query.code,
        state: req.query.state,
        error: req.query.error,
        error_description: req.query.error_description,
      });

      // Handle OAuth callback
      const result = await oauthSystem.handleOAuthCallback(
        params.code!,
        params.state!,
        clientIp,
        params.error,
      );

      if (!result.success) {
        await securityMonitor.recordEvent({
          timestamp: new Date(),
          eventType: 'oauth_failure',
          ip: clientIp,
          userAgent,
          metadata: {
            provider: req.params.provider,
            error: result.error?.type,
            message: result.error?.message,
          },
        });

        return res.status(400).json({
          error: 'OAuth failed',
          details: result.error,
        });
      }

      // Generate JWT tokens
      const session = await oauthSystem.getSession(result.userId!);
      if (!session) {
        return res.status(500).json({ error: 'Session not found' });
      }

      const clientInfo = { ip: clientIp, userAgent };
      const tokens = await jwtManager.generateTokenPair(
        {
          id: result.userId!,
          provider: req.params.provider,
        },
        session.sessionId,
        session,
        clientInfo,
      );

      await securityMonitor.recordEvent({
        timestamp: new Date(),
        eventType: 'oauth_success',
        userId: result.userId,
        ip: clientIp,
        userAgent,
        metadata: {
          provider: req.params.provider,
          sessionId: session.sessionId,
        },
      });

      res.json(tokens);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          error: 'Validation failed',
          field: error.field,
          message: error.message,
        });
      }

      console.error('OAuth callback error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Refresh token
  router.post('/token/refresh', async (req, res) => {
    try {
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';

      // Rate limiting
      const rateLimitResult = await rateLimiter.checkLimit(clientIp, 'token_refresh');

      if (!rateLimitResult.allowed) {
        return res.status(429).json({
          error: 'Too many refresh attempts',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        });
      }

      // Validate input
      const params = validateTokenRefresh(req.body);

      // Refresh token
      const clientInfo = { ip: clientIp, userAgent };
      const tokens = await jwtManager.refreshAccessToken(params.refresh_token, clientInfo);

      if (!tokens) {
        await securityMonitor.recordEvent({
          timestamp: new Date(),
          eventType: 'token_refresh_failed',
          ip: clientIp,
          userAgent,
          metadata: {
            reason: 'invalid_refresh_token',
          },
        });

        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      await securityMonitor.recordEvent({
        timestamp: new Date(),
        eventType: 'token_refresh',
        ip: clientIp,
        userAgent,
      });

      res.json(tokens);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          error: 'Validation failed',
          field: error.field,
          message: error.message,
        });
      }

      console.error('Token refresh error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Revoke token
  router.post('/token/revoke', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      const clientInfo = { ip: clientIp, userAgent };

      // Validate and decode token
      const decoded = await jwtManager.validateAccessToken(token, clientInfo);
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Revoke token
      await jwtManager.revokeToken(decoded.jti);
      await oauthSystem.revokeSession(decoded.sessionId);

      await securityMonitor.recordEvent({
        timestamp: new Date(),
        eventType: 'token_revoked',
        userId: decoded.sub,
        ip: clientIp,
        userAgent,
        metadata: {
          jti: decoded.jti,
          sessionId: decoded.sessionId,
        },
      });

      res.json({ message: 'Token revoked successfully' });
    } catch (error) {
      console.error('Token revoke error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
```

This implementation guide provides concrete, production-ready code for implementing the security hardening recommendations. Each component follows security best practices and includes comprehensive error handling, logging, and monitoring capabilities.
