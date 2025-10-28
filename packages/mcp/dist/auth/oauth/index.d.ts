/**
 * OAuth System Main Module
 *
 * Central OAuth 2.1 + PKCE implementation with provider management
 * following security best practices and the project's functional programming style.
 * Updated for ChatGPT compatibility.
 */
import type { OAuthSession, OAuthSystemConfig, OAuthError } from './types.js';
export type { OAuthSession };
/**
 * OAuth system manager
 */
export declare class OAuthSystem {
    private readonly config;
    private readonly providers;
    private readonly states;
    private readonly sessions;
    private readonly clientIdToProvider;
    constructor(config: OAuthSystemConfig);
    /**
     * Get available providers
     */
    getAvailableProviders(): readonly string[];
    /**
     * Check if provider is available
     */
    isProviderAvailable(provider: string): boolean;
    /**
     * Start OAuth flow
     */
    startOAuthFlow(provider: string, redirectUri?: string, pkceOptions?: {
        codeVerifier?: string;
        codeChallenge?: string;
        codeChallengeMethod?: string;
    }): {
        authUrl: string;
        state: string;
    };
    /**
     * Handle OAuth callback
     */
    handleOAuthCallback(code: string, state: string, error?: string): Promise<{
        success: boolean;
        userId?: string;
        sessionId?: string;
        error?: OAuthError;
    }>;
    /**
     * Get OAuth session
     */
    getSession(sessionId: string): OAuthSession | null;
    /**
     * Refresh OAuth session tokens
     */
    refreshSession(sessionId: string): Promise<OAuthSession | null>;
    /**
     * Revoke OAuth session
     */
    revokeSession(sessionId: string): Promise<boolean>;
    /**
     * Get all sessions for a user
     */
    getUserSessions(userId: string): readonly OAuthSession[];
    /**
     * Revoke all sessions for a user
     */
    revokeUserSessions(userId: string): Promise<number>;
    /**
     * Initialize OAuth providers
     */
    private initializeProviders;
    /**
     * Generate secure random state
     */
    private generateSecureState;
    /**
     * Derive PKCE code challenge from verifier
     */
    private generateCodeChallenge;
    /**
     * Generate session ID
     */
    private generateSessionId;
    /**
     * Check if session is expired
     */
    private isSessionExpired;
    /**
     * Start cleanup timer
     */
    private startCleanupTimer;
    /**
     * Cleanup expired OAuth states
     */
    private cleanupExpiredStates;
    /**
     * Cleanup expired OAuth sessions
     */
    private cleanupExpiredSessions;
    /**
     * Get system statistics
     */
    getStats(): {
        providers: readonly string[];
        activeStates: number;
        activeSessions: number;
    };
    /**
     * Resolve the configured provider name by OAuth client_id.
     * Useful for ChatGPT/MCP token exchanges where state isn't returned.
     */
    getProviderByClientId(clientId: string): string | null;
    /**
     * Directly exchange an authorization code for tokens without state.
     * Used for ChatGPT/MCP, which posts (code, code_verifier, redirect_uri, client_id).
     */
    exchangeCodeForTokensDirect(providerName: string, code: string, opts?: {
        codeVerifier?: string;
        redirectUri?: string;
    }): Promise<Readonly<{
        readonly accessToken: string;
        readonly refreshToken?: string;
        readonly tokenType: string;
        readonly expiresIn?: number;
        readonly scope?: string;
        readonly idToken?: string;
        readonly raw: Record<string, unknown>;
    }>>;
}
//# sourceMappingURL=index.d.ts.map