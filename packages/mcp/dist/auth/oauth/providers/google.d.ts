/**
 * Google OAuth Provider Implementation
 *
 * Implements OAuth 2.1 + PKCE flow for Google authentication
 * following security best practices and the project's functional programming style.
 */
import type { OAuthProvider, OAuthUserInfo, OAuthTokenResponse, OAuthConfig } from '../types.js';
/**
 * Google OAuth configuration
 */
export type GoogleOAuthConfig = OAuthConfig & {
    readonly clientId: string;
    readonly clientSecret: string;
    readonly scopes: readonly string[];
    readonly hostedDomain?: string;
    readonly prompt?: 'consent' | 'none' | 'select_account';
};
/**
 * Google-specific OAuth provider
 */
export declare class GoogleOAuthProvider implements OAuthProvider {
    private readonly config;
    private readonly baseUrl;
    private readonly apiUrl;
    private readonly tokenUrl;
    constructor(config: GoogleOAuthConfig);
    /**
     * Get provider name
     */
    getProviderName(): string;
    /**
     * Generate authorization URL with PKCE
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
     * Get ID token claims (if available)
     */
    private getIdTokenClaims;
    /**
     * Generate PKCE code challenge
     */
    private generateCodeChallenge;
}
//# sourceMappingURL=google.d.ts.map