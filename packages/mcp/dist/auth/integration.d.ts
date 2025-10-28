/**
 * OAuth Authentication Integration
 *
 * Integrates OAuth system with existing MCP authentication and authorization
 * following the project's functional programming style and security requirements.
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { OAuthSystem, OAuthSession } from './oauth/index.js';
import type { JwtTokenManager, JwtTokenPair } from './oauth/jwt.js';
import type { UserRegistry, User } from './users/registry.js';
import type { AuthenticationManager } from '../core/authentication.js';
import type { UserRole } from '../core/authorization.js';
/**
 * OAuth integration configuration
 */
export type OAuthIntegrationConfig = Readonly<{
    readonly autoCreateUsers: boolean;
    readonly defaultRole: UserRole;
    readonly trustedProviders: readonly string[];
    readonly enableUserSync: boolean;
    readonly syncInterval: number;
    readonly sessionTimeout: number;
}>;
/**
 * OAuth authentication result
 */
export type OAuthAuthResult = Readonly<{
    readonly success: boolean;
    readonly user?: User;
    readonly tokens?: JwtTokenPair;
    readonly session?: OAuthSession;
    readonly error?: string;
}>;
/**
 * OAuth integration manager
 */
export declare class OAuthIntegration {
    private readonly config;
    private readonly oauthSystem;
    private readonly jwtManager;
    private readonly userRegistry;
    private readonly authManager;
    private readonly syncCache;
    private readonly syncCooldown;
    constructor(config: OAuthIntegrationConfig, oauthSystem: OAuthSystem, jwtManager: JwtTokenManager, userRegistry: UserRegistry, authManager: AuthenticationManager);
    /**
     * Start OAuth flow
     */
    startOAuthFlow(provider: string, redirectUri?: string): {
        authUrl: string;
        state: string;
    };
    /**
     * Handle OAuth callback and authenticate user
     */
    handleOAuthCallback(code: string, state: string, error?: string, request?: FastifyRequest): Promise<OAuthAuthResult>;
    /**
     * Refresh OAuth tokens
     */
    refreshOAuthTokens(refreshToken: string): Promise<OAuthAuthResult>;
    /**
     * Logout user and revoke tokens
     */
    logout(userId: string, sessionId?: string): Promise<boolean>;
    /**
     * Get current user from request
     */
    getCurrentUser(request: FastifyRequest): Promise<User | null>;
    /**
     * Create OAuth authentication middleware
     */
    createOAuthAuthMiddleware(options?: {
        required?: boolean;
        allowedRoles?: UserRole[];
        allowedProviders?: string[];
    }): (request: FastifyRequest, reply: FastifyReply) => Promise<undefined>;
    /**
     * Get user info from OAuth session
     */
    private getUserInfoFromSession;
    /**
     * Create user from OAuth info
     */
    private createUserFromOAuth;
    /**
     * Sync user data with OAuth provider
     */
    private syncUserData;
    /**
     * Start periodic user sync
     */
    private startPeriodicSync;
    /**
     * Sync all OAuth users
     */
    private syncAllUsers;
    /**
     * Get integration statistics
     */
    getIntegrationStats(): Promise<{
        totalOAuthUsers: number;
        activeOAuthSessions: number;
        usersByProvider: Record<string, number>;
        recentLogins: number;
    }>;
}
//# sourceMappingURL=integration.d.ts.map