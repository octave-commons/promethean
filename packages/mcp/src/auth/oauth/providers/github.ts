/**
 * GitHub OAuth Provider Implementation
 *
 * Implements OAuth 2.1 + PKCE flow for GitHub authentication
 * following security best practices and the project's functional programming style.
 */

import crypto from 'node:crypto';
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
export class GitHubOAuthProvider implements OAuthProvider {
  private readonly config: GitHubOAuthConfig;
  private readonly baseUrl = 'https://github.com';
  private readonly apiUrl = 'https://api.github.com';

  constructor(config: GitHubOAuthConfig) {
    this.config = {
      ...config,
      scopes: config.scopes || ['user:email'],
      allowSignup: config.allowSignup ?? true,
    };
  }

  /**
   * Get provider name
   */
  getProviderName(): string {
    return 'github';
  }

  /**
   * Generate authorization URL with PKCE
   */
  generateAuthUrl(state: string, codeVerifier: string): string {
    const codeChallenge = this.generateCodeChallenge(codeVerifier);
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      state,
      response_type: 'code',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    if (this.config.allowSignup) {
      params.append('allow_signup', 'true');
    }

    return `${this.baseUrl}/login/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(
    code: string,
    codeVerifier: string,
  ): Promise<OAuthTokenResponse> {
    const response = await fetch(`${this.baseUrl}/login/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Promethean-MCP/1.0',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.config.redirectUri,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub token exchange failed: ${response.status} ${errorText}`);
    }

    const data = await response.json() as any;

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
  async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    // Get primary user data
    const userResponse = await fetch(`${this.apiUrl}/user`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Promethean-MCP/1.0',
      },
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to fetch GitHub user: ${userResponse.status}`);
    }

    const userData = await userResponse.json() as any;

    // Get user emails to find primary verified email
    const emailsResponse = await fetch(`${this.apiUrl}/user/emails`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Promethean-MCP/1.0',
      },
    });

    let primaryEmail = userData.email;
    let isEmailVerified = false;

    if (emailsResponse.ok) {
      const emailsData = await emailsResponse.json() as any[];
      const primaryEmailObj = emailsData.find((email: any) => 
        email.primary && email.verified
      );
      
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
  async refreshToken(refreshToken: string): Promise<OAuthTokenResponse> {
    const response = await fetch(`${this.baseUrl}/login/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
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

    const data = await response.json() as any;

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
  async revokeToken(accessToken: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/applications/${this.config.clientId}/token`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
          'User-Agent': 'Promethean-MCP/1.0',
        },
        body: JSON.stringify({
          access_token: accessToken,
        }),
      });
    } catch (error) {
      // Log error but don't throw - revocation is best-effort
      console.warn('Failed to revoke GitHub token:', error);
    }
  }

  /**
   * Validate access token
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/user`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Promethean-MCP/1.0',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Generate PKCE code challenge
   */
  private generateCodeChallenge(codeVerifier: string): string {
    return crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
  }
}