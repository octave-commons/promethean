/**
 * JWT Token Management for OAuth System
 *
 * Secure JWT token generation, validation, and refresh
 * following security best practices and the project's functional programming style.
 */
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
/**
 * JWT token manager
 */
export class JwtTokenManager {
    config;
    blacklistedTokens = new Set();
    constructor(config) {
        this.config = config;
        // Validate configuration
        this.validateConfig();
    }
    /**
     * Generate JWT token pair for user session
     */
    generateTokenPair(userInfo, sessionId, oauthSession) {
        const now = Math.floor(Date.now() / 1000);
        const jti = crypto.randomUUID();
        // Access token payload
        const accessTokenPayload = {
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
        const refreshTokenPayload = {
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
        const signOptions = {
            algorithm: this.config.algorithm,
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
    validateAccessToken(token) {
        try {
            const decoded = jwt.verify(token, this.config.secret, {
                algorithms: [this.config.algorithm],
                issuer: this.config.issuer,
                audience: this.config.audience,
            });
            // Check if token is blacklisted
            if (this.blacklistedTokens.has(decoded.jti)) {
                return null;
            }
            // Ensure it's an access token
            if (decoded.type !== 'access') {
                return null;
            }
            return decoded;
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Validate and decode refresh token
     */
    validateRefreshToken(token) {
        try {
            const decoded = jwt.verify(token, this.config.secret, {
                algorithms: [this.config.algorithm],
                issuer: this.config.issuer,
                audience: this.config.audience,
            });
            // Check if token is blacklisted
            if (this.blacklistedTokens.has(decoded.jti)) {
                return null;
            }
            // Ensure it's a refresh token
            if (decoded.type !== 'refresh') {
                return null;
            }
            return decoded;
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Refresh access token using refresh token
     */
    refreshAccessToken(refreshToken, userInfo) {
        const refreshPayload = this.validateRefreshToken(refreshToken);
        if (!refreshPayload) {
            return null;
        }
        // Blacklist old refresh token
        this.blacklistToken(refreshPayload.jti);
        // Create new session ID for security
        const newSessionId = crypto.randomUUID();
        // Create new OAuth session mock
        const oauthSession = {
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
    blacklistToken(jti) {
        this.blacklistedTokens.add(jti);
        // Cleanup old blacklisted tokens periodically
        this.cleanupBlacklistedTokens();
    }
    /**
     * Extract user-friendly scopes from OAuth user info
     */
    extractScopes(userInfo) {
        const scopes = ['read']; // Base scope
        // Add provider-specific scopes based on metadata
        if (userInfo.metadata) {
            if (userInfo.provider === 'github') {
                const githubMeta = userInfo.metadata;
                if (githubMeta.publicRepos > 0)
                    scopes.push('github:read');
                if (githubMeta.emailVerified)
                    scopes.push('email:verified');
            }
            else if (userInfo.provider === 'google') {
                const googleMeta = userInfo.metadata;
                if (googleMeta.emailVerified)
                    scopes.push('email:verified');
                if (googleMeta.hostedDomain)
                    scopes.push('domain:restricted');
            }
        }
        return scopes;
    }
    /**
     * Validate JWT configuration
     */
    validateConfig() {
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
        const validAlgorithms = [
            'RS256',
            'RS384',
            'RS512',
            'ES256',
            'ES384',
            'ES512',
            'HS256',
            'HS384',
            'HS512',
        ];
        if (!validAlgorithms.includes(this.config.algorithm)) {
            throw new Error(`Invalid JWT algorithm: ${this.config.algorithm}`);
        }
    }
    /**
     * Cleanup old blacklisted tokens
     */
    cleanupBlacklistedTokens() {
        // In a production environment, this should use a more sophisticated
        // approach with TTL or persistent storage
        if (this.blacklistedTokens.size > 10000) {
            // Clear half of the tokens when we get too many
            const tokens = Array.from(this.blacklistedTokens);
            const toKeep = tokens.slice(-5000);
            this.blacklistedTokens.clear();
            toKeep.forEach((token) => this.blacklistedTokens.add(token));
        }
    }
    /**
     * Get token information without validation (for debugging)
     */
    decodeToken(token) {
        try {
            return jwt.decode(token);
        }
        catch {
            return null;
        }
    }
    /**
     * Check if token is expired
     */
    isTokenExpired(payload) {
        return Date.now() >= payload.exp * 1000;
    }
    /**
     * Check if token is close to expiry
     */
    isTokenExpiringSoon(payload, thresholdSeconds = 300) {
        const timeUntilExpiry = payload.exp * 1000 - Date.now();
        return timeUntilExpiry <= thresholdSeconds * 1000;
    }
}
//# sourceMappingURL=jwt.js.map