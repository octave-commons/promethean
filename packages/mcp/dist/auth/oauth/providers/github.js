/**
 * GitHub OAuth Provider Implementation
 *
 * Implements OAuth 2.1 + PKCE flow for GitHub authentication
 * following security best practices and the project's functional programming style.
 */
import crypto from 'node:crypto';
/**
 * GitHub-specific OAuth provider
 */
export class GitHubOAuthProvider {
    config;
    baseUrl = 'https://github.com';
    apiUrl = 'https://api.github.com';
    constructor(config) {
        this.config = {
            ...config,
            scopes: config.scopes || ['user:email'],
            allowSignup: config.allowSignup ?? true,
        };
    }
    /**
     * Get provider name
     */
    getProviderName() {
        return 'github';
    }
    /**
     * Generate authorization URL with optional PKCE
     */
    generateAuthUrl(state, codeVerifier, redirectUri) {
        const codeChallenge = codeVerifier ? this.generateCodeChallenge(codeVerifier) : undefined;
        const finalRedirectUri = redirectUri || this.config.redirectUri;
        const params = new URLSearchParams();
        params.append('client_id', this.config.clientId);
        params.append('redirect_uri', finalRedirectUri);
        params.append('scope', this.config.scopes.join(' '));
        params.append('state', state);
        params.append('response_type', 'code');
        // Only add PKCE parameters if code challenge is provided
        if (codeChallenge) {
            params.append('code_challenge', codeChallenge);
            params.append('code_challenge_method', 'S256');
        }
        if (this.config.allowSignup) {
            params.append('allow_signup', 'true');
        }
        return `${this.baseUrl}/login/oauth/authorize?${params.toString()}`;
    }
    /**
     * Exchange authorization code for tokens
     */
    async exchangeCodeForTokens(code, codeVerifier, redirectUri) {
        const finalRedirectUri = redirectUri || this.config.redirectUri;
        const response = await fetch(`${this.baseUrl}/login/oauth/access_token`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Promethean-MCP/1.0',
            },
            body: (() => {
                const params = new URLSearchParams({
                    client_id: this.config.clientId,
                    client_secret: this.config.clientSecret,
                    code,
                    redirect_uri: finalRedirectUri,
                    grant_type: 'authorization_code',
                });
                // Only add code_verifier if PKCE is being used
                if (codeVerifier) {
                    params.append('code_verifier', codeVerifier);
                }
                return params;
            })(),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GitHub token exchange failed: ${response.status} ${errorText}`);
        }
        const data = (await response.json());
        if (data.error) {
            throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
        }
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            tokenType: data.token_type || 'bearer',
            expiresIn: data.expires_in ? parseInt(data.expires_in, 10) : undefined,
            scope: data.scope,
            raw: data,
        };
    }
    /**
     * Get user information from access token
     */
    async getUserInfo(accessToken) {
        // Get primary user data
        const userResponse = await fetch(`${this.apiUrl}/user`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'Promethean-MCP/1.0',
            },
        });
        if (!userResponse.ok) {
            throw new Error(`Failed to fetch GitHub user: ${userResponse.status}`);
        }
        const userData = (await userResponse.json());
        // Get user emails to find primary verified email
        const emailsResponse = await fetch(`${this.apiUrl}/user/emails`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'Promethean-MCP/1.0',
            },
        });
        let primaryEmail = userData.email;
        let isEmailVerified = false;
        if (emailsResponse.ok) {
            const emailsData = (await emailsResponse.json());
            const primaryEmailObj = emailsData.find((email) => email.primary && email.verified);
            if (primaryEmailObj) {
                primaryEmail = primaryEmailObj.email;
                isEmailVerified = true;
            }
        }
        return {
            id: userData.id.toString(),
            username: userData.login,
            email: primaryEmail,
            name: userData.name,
            avatar: userData.avatar_url,
            provider: 'github',
            raw: userData,
            metadata: {
                emailVerified: isEmailVerified,
                publicRepos: userData.public_repos,
                followers: userData.followers,
                following: userData.following,
                createdAt: userData.created_at,
                updatedAt: userData.updated_at,
                company: userData.company,
                location: userData.location,
                blog: userData.blog,
                bio: userData.bio,
            },
        };
    }
    /**
     * Refresh access token
     */
    async refreshToken(refreshToken) {
        const response = await fetch(`${this.baseUrl}/login/oauth/access_token`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Promethean-MCP/1.0',
            },
            body: new URLSearchParams({
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GitHub token refresh failed: ${response.status} ${errorText}`);
        }
        const data = (await response.json());
        if (data.error) {
            throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
        }
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token || refreshToken,
            tokenType: data.token_type || 'bearer',
            expiresIn: data.expires_in ? parseInt(data.expires_in, 10) : undefined,
            scope: data.scope,
            raw: data,
        };
    }
    /**
     * Revoke access token
     */
    async revokeToken(accessToken) {
        try {
            await fetch(`${this.baseUrl}/applications/${this.config.clientId}/token`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
                    'User-Agent': 'Promethean-MCP/1.0',
                },
                body: JSON.stringify({
                    access_token: accessToken,
                }),
            });
        }
        catch (error) {
            // Log error but don't throw - revocation is best-effort
            console.warn('Failed to revoke GitHub token:', error);
        }
    }
    /**
     * Validate access token
     */
    async validateToken(accessToken) {
        try {
            const response = await fetch(`${this.apiUrl}/user`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json',
                    'User-Agent': 'Promethean-MCP/1.0',
                },
            });
            return response.ok;
        }
        catch {
            return false;
        }
    }
    /**
     * Generate PKCE code challenge
     */
    generateCodeChallenge(codeVerifier) {
        return crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    }
}
//# sourceMappingURL=github.js.map