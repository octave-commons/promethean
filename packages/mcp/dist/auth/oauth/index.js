/**
 * OAuth System Main Module
 *
 * Central OAuth 2.1 + PKCE implementation with provider management
 * following security best practices and the project's functional programming style.
 * Updated for ChatGPT compatibility.
 */
import crypto from 'node:crypto';
import { GitHubOAuthProvider } from './providers/github.js';
import { GoogleOAuthProvider } from './providers/google.js';
/**
 * OAuth system manager
 */
export class OAuthSystem {
    config;
    providers = new Map();
    states = new Map();
    sessions = new Map();
    // Map OAuth client IDs to provider names for ChatGPT/MCP token flows
    clientIdToProvider = new Map();
    constructor(config) {
        this.config = config;
        // Initialize providers
        this.initializeProviders();
        // Cleanup expired states and sessions periodically
        this.startCleanupTimer();
    }
    /**
     * Get available providers
     */
    getAvailableProviders() {
        return Array.from(this.providers.keys());
    }
    /**
     * Check if provider is available
     */
    isProviderAvailable(provider) {
        return this.providers.has(provider);
    }
    /**
     * Start OAuth flow
     */
    startOAuthFlow(provider, redirectUri, pkceOptions) {
        const oauthProvider = this.providers.get(provider);
        if (!oauthProvider) {
            throw new Error(`OAuth provider not available: ${provider}`);
        }
        let codeVerifier;
        let codeChallenge;
        let codeChallengeMethod;
        if (pkceOptions?.codeVerifier) {
            codeVerifier = pkceOptions.codeVerifier;
            const derivedChallenge = this.generateCodeChallenge(codeVerifier);
            if (pkceOptions.codeChallenge && pkceOptions.codeChallenge !== derivedChallenge) {
                throw new Error('Provided PKCE code challenge does not match the code verifier');
            }
            codeChallenge = pkceOptions.codeChallenge ?? derivedChallenge;
            codeChallengeMethod = pkceOptions.codeChallengeMethod ?? 'S256';
        }
        else {
            // For ChatGPT compatibility, only use PKCE when explicitly provided
            // Don't auto-generate PKCE for legacy flows
            codeVerifier = pkceOptions?.codeVerifier;
            codeChallenge = codeVerifier ? pkceOptions?.codeChallenge : undefined;
            codeChallengeMethod = codeVerifier ? pkceOptions?.codeChallengeMethod : undefined;
        }
        const state = this.generateSecureState();
        // Use dynamic redirect URI if provided, otherwise fall back to config
        const finalRedirectUri = redirectUri || this.config.redirectUri;
        // Create OAuth state
        const oauthState = {
            state,
            codeVerifier,
            codeChallenge,
            codeChallengeMethod,
            provider,
            redirectUri: finalRedirectUri,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + this.config.stateTimeout * 1000),
        };
        // Store state
        this.states.set(state, oauthState);
        // Generate authorization URL with dynamic redirect URI
        // Only pass codeVerifier if we have one (either from PKCE options or generated for legacy flow)
        const authUrl = oauthProvider.generateAuthUrl(state, codeVerifier, finalRedirectUri);
        return { authUrl, state };
    }
    /**
     * Handle OAuth callback
     */
    async handleOAuthCallback(code, state, error) {
        // Retrieve and validate state
        const oauthState = this.states.get(state);
        if (!oauthState) {
            return {
                success: false,
                error: {
                    type: 'invalid_state',
                    message: 'Invalid or expired OAuth state',
                },
            };
        }
        // Remove used state
        this.states.delete(state);
        // Check for OAuth errors
        if (error) {
            return {
                success: false,
                error: {
                    type: 'access_denied',
                    message: `OAuth error: ${error}`,
                    provider: oauthState.provider,
                },
            };
        }
        try {
            const provider = this.providers.get(oauthState.provider);
            if (!provider) {
                throw new Error(`Provider not found: ${oauthState.provider}`);
            }
            // Exchange code for tokens
            const tokenResponse = await provider.exchangeCodeForTokens(code, oauthState.codeVerifier, oauthState.redirectUri);
            // Get user information
            const userInfo = await provider.getUserInfo(tokenResponse.accessToken);
            // Create OAuth session
            const sessionId = this.generateSessionId();
            const oauthSession = {
                sessionId,
                userId: userInfo.id,
                provider: oauthState.provider,
                accessToken: tokenResponse.accessToken,
                refreshToken: tokenResponse.refreshToken,
                tokenExpiresAt: tokenResponse.expiresIn
                    ? new Date(Date.now() + tokenResponse.expiresIn * 1000)
                    : undefined,
                createdAt: new Date(),
                lastAccessAt: new Date(),
                metadata: {
                    tokenType: tokenResponse.tokenType,
                    scope: tokenResponse.scope,
                    raw: tokenResponse.raw,
                },
            };
            // Store session
            this.sessions.set(sessionId, oauthSession);
            return {
                success: true,
                userId: userInfo.id,
                sessionId: sessionId,
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    type: 'token_exchange_failed',
                    message: error.message,
                    provider: oauthState.provider,
                },
            };
        }
    }
    /**
     * Get OAuth session
     */
    getSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return null;
        }
        // Check if session is expired
        if (this.isSessionExpired(session)) {
            this.sessions.delete(sessionId);
            return null;
        }
        // Update last access time
        const updatedSession = {
            ...session,
            lastAccessAt: new Date(),
        };
        this.sessions.set(sessionId, updatedSession);
        return updatedSession;
    }
    /**
     * Refresh OAuth session tokens
     */
    async refreshSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.refreshToken) {
            return null;
        }
        try {
            const provider = this.providers.get(session.provider);
            if (!provider) {
                throw new Error(`Provider not found: ${session.provider}`);
            }
            // Refresh tokens
            const tokenResponse = await provider.refreshToken(session.refreshToken);
            // Update session
            const updatedSession = {
                ...session,
                accessToken: tokenResponse.accessToken,
                refreshToken: tokenResponse.refreshToken || session.refreshToken,
                tokenExpiresAt: tokenResponse.expiresIn
                    ? new Date(Date.now() + tokenResponse.expiresIn * 1000)
                    : undefined,
                lastAccessAt: new Date(),
                metadata: {
                    ...session.metadata,
                    tokenRefreshedAt: new Date().toISOString(),
                    raw: tokenResponse.raw,
                },
            };
            this.sessions.set(sessionId, updatedSession);
            return updatedSession;
        }
        catch (error) {
            // Remove invalid session
            this.sessions.delete(sessionId);
            return null;
        }
    }
    /**
     * Revoke OAuth session
     */
    async revokeSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return false;
        }
        try {
            const provider = this.providers.get(session.provider);
            if (provider) {
                await provider.revokeToken(session.accessToken);
            }
        }
        catch (error) {
            // Log error but continue with cleanup
            console.warn('Failed to revoke OAuth token:', error);
        }
        // Remove session
        this.sessions.delete(sessionId);
        return true;
    }
    /**
     * Get all sessions for a user
     */
    getUserSessions(userId) {
        return Array.from(this.sessions.values())
            .filter((session) => session.userId === userId)
            .filter((session) => !this.isSessionExpired(session));
    }
    /**
     * Revoke all sessions for a user
     */
    async revokeUserSessions(userId) {
        const userSessions = this.getUserSessions(userId);
        let revokedCount = 0;
        for (const session of userSessions) {
            if (await this.revokeSession(session.sessionId)) {
                revokedCount++;
            }
        }
        return revokedCount;
    }
    /**
     * Initialize OAuth providers
     */
    initializeProviders() {
        // GitHub provider
        if (this.config.providers.github) {
            const githubProvider = new GitHubOAuthProvider({
                clientId: this.config.providers.github.clientId,
                clientSecret: this.config.providers.github.clientSecret,
                redirectUri: this.config.redirectUri,
                scopes: this.config.providers.github.scopes || [],
                allowSignup: this.config.providers.github.allowSignup || false,
            });
            this.providers.set('github', githubProvider);
            this.clientIdToProvider.set(this.config.providers.github.clientId, 'github');
        }
        // Google provider
        if (this.config.providers.google) {
            const googleProvider = new GoogleOAuthProvider({
                clientId: this.config.providers.google.clientId,
                clientSecret: this.config.providers.google.clientSecret,
                redirectUri: this.config.redirectUri,
                scopes: this.config.providers.google.scopes || [],
                hostedDomain: this.config.providers.google.hostedDomain,
                prompt: this.config.providers.google.prompt,
            });
            this.providers.set('google', googleProvider);
            this.clientIdToProvider.set(this.config.providers.google.clientId, 'google');
        }
    }
    /**
     * Generate secure random state
     */
    generateSecureState() {
        return crypto.randomBytes(32).toString('base64url');
    }
    /**
     * Derive PKCE code challenge from verifier
     */
    generateCodeChallenge(codeVerifier) {
        return crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    }
    /**
     * Generate session ID
     */
    generateSessionId() {
        return crypto.randomUUID();
    }
    /**
     * Check if session is expired
     */
    isSessionExpired(session) {
        if (session.tokenExpiresAt) {
            return Date.now() >= session.tokenExpiresAt.getTime();
        }
        // Fallback to session timeout
        const sessionAge = Date.now() - session.createdAt.getTime();
        return sessionAge >= this.config.sessionTimeout * 1000;
    }
    /**
     * Start cleanup timer
     */
    startCleanupTimer() {
        // Cleanup every 5 minutes
        setInterval(() => {
            this.cleanupExpiredStates();
            this.cleanupExpiredSessions();
        }, 5 * 60 * 1000);
    }
    /**
     * Cleanup expired OAuth states
     */
    cleanupExpiredStates() {
        const now = Date.now();
        for (const [state, oauthState] of this.states.entries()) {
            if (now >= oauthState.expiresAt.getTime()) {
                this.states.delete(state);
            }
        }
    }
    /**
     * Cleanup expired OAuth sessions
     */
    cleanupExpiredSessions() {
        for (const [sessionId, session] of this.sessions.entries()) {
            if (this.isSessionExpired(session)) {
                this.sessions.delete(sessionId);
            }
        }
    }
    /**
     * Get system statistics
     */
    getStats() {
        return {
            providers: this.getAvailableProviders(),
            activeStates: this.states.size,
            activeSessions: this.sessions.size,
        };
    }
    /**
     * Resolve the configured provider name by OAuth client_id.
     * Useful for ChatGPT/MCP token exchanges where state isn't returned.
     */
    getProviderByClientId(clientId) {
        return this.clientIdToProvider.get(clientId) ?? null;
    }
    /**
     * Directly exchange an authorization code for tokens without state.
     * Used for ChatGPT/MCP, which posts (code, code_verifier, redirect_uri, client_id).
     */
    async exchangeCodeForTokensDirect(providerName, code, opts = {}) {
        const provider = this.providers.get(providerName);
        if (!provider) {
            throw new Error(`Provider not found: ${providerName}`);
        }
        return await provider.exchangeCodeForTokens(code, opts.codeVerifier, opts.redirectUri);
    }
}
//# sourceMappingURL=index.js.map