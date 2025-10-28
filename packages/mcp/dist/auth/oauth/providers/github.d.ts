/**
 * GitHub OAuth Provider Implementation
 *
 * Implements OAuth 2.1 + PKCE flow for GitHub authentication
 * following security best practices and the project's functional programming style.
 */
import type { OAuthProvider, OAuthUserInfo, OAuthTokenResponse, OAuthConfig } from '../types.js';
/**
 * GitHub OAuth configuration
 */
export type GitHubOAuthConfig = OAuthConfig & {
    readonly clientId: string;
    readonly clientSecret: string;
    readonly scopes: readonly string[];
    readonly allowSignup: boolean;
};
/**
 * GitHub-specific OAuth provider
 */
export declare class GitHubOAuthProvider implements OAuthProvider {
    private readonly config;
    private readonly baseUrl;
    private readonly apiUrl;
    constructor(config: GitHubOAuthConfig);
    /**
     * Get provider name
     */
    getProviderName(): string;
    /**
     * Generate authorization URL with optional PKCE
     */
    generateAuthUrl(state: string, codeVerifier?: string, redirectUri?: string): string;
    /**
     * Exchange authorization code for tokens
     */
    exchangeCodeForTokens(code: string, codeVerifier?: string, redirectUri?: string): Promise<OAuthTokenResponse>;
    /**
     * Get user information from access token
     */
    getUserInfo(accessToken: string): Promise<OAuthUserInfo>;
    /**
     * Refresh access token
     */
    refreshToken(refreshToken: string): Promise<OAuthTokenResponse>;
    /**
     * Revoke access token
     */
    revokeToken(accessToken: string): Promise<void>;
    /**
     * Validate access token
     */
    validateToken(accessToken: string): Promise<boolean>;
    /**
     * Generate PKCE code challenge
     */
    private generateCodeChallenge;
}
//# sourceMappingURL=github.d.ts.map