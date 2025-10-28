/**
 * JWT Token Management for OAuth System
 *
 * Secure JWT token generation, validation, and refresh
 * following security best practices and the project's functional programming style.
 */
import jwt from 'jsonwebtoken';
import type { OAuthSession, OAuthUserInfo } from './types.js';
/**
 * JWT token configuration
 */
export type JwtTokenConfig = Readonly<{
    readonly secret: string;
    readonly issuer: string;
    readonly audience: string;
    readonly accessTokenExpiry: number;
    readonly refreshTokenExpiry: number;
    readonly algorithm: jwt.Algorithm;
}>;
/**
 * JWT token payload
 */
export type JwtTokenPayload = Readonly<{
    readonly sub: string;
    readonly iss: string;
    readonly aud: string;
    readonly iat: number;
    readonly exp: number;
    readonly jti: string;
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
export declare class JwtTokenManager {
    private readonly config;
    private readonly blacklistedTokens;
    constructor(config: JwtTokenConfig);
    /**
     * Generate JWT token pair for user session
     */
    generateTokenPair(userInfo: OAuthUserInfo, sessionId: string, oauthSession: OAuthSession): JwtTokenPair;
    /**
     * Validate and decode access token
     */
    validateAccessToken(token: string): JwtTokenPayload | null;
    /**
     * Validate and decode refresh token
     */
    validateRefreshToken(token: string): JwtTokenPayload | null;
    /**
     * Refresh access token using refresh token
     */
    refreshAccessToken(refreshToken: string, userInfo: OAuthUserInfo): JwtTokenPair | null;
    /**
     * Blacklist a token by JWT ID
     */
    blacklistToken(jti: string): void;
    /**
     * Extract user-friendly scopes from OAuth user info
     */
    private extractScopes;
    /**
     * Validate JWT configuration
     */
    private validateConfig;
    /**
     * Cleanup old blacklisted tokens
     */
    private cleanupBlacklistedTokens;
    /**
     * Get token information without validation (for debugging)
     */
    decodeToken(token: string): JwtTokenPayload | null;
    /**
     * Check if token is expired
     */
    isTokenExpired(payload: JwtTokenPayload): boolean;
    /**
     * Check if token is close to expiry
     */
    isTokenExpiringSoon(payload: JwtTokenPayload, thresholdSeconds?: number): boolean;
}
//# sourceMappingURL=jwt.d.ts.map