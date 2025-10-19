/**
 * Google OAuth Provider Implementation
 *
 * Implements OAuth 2.1 + PKCE flow for Google authentication
 * following security best practices and the project's functional programming style.
 */

import crypto from 'node:crypto';
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
export class GoogleOAuthProvider implements OAuthProvider {
  private readonly config: GoogleOAuthConfig;
  private readonly baseUrl = 'https://accounts.google.com';
  private readonly apiUrl = 'https://www.googleapis.com';
  private readonly tokenUrl = 'https://oauth2.googleapis.com/token';

  constructor(config: GoogleOAuthConfig) {
    this.config = {
      ...config,
      scopes: config.scopes || [
        'openid',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
    };
  }

  /**
   * Get provider name
   */
  getProviderName(): string {
    return 'google';
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
      access_type: 'offline', // Enable refresh tokens
    });

    if (this.config.hostedDomain) {
      params.append('hd', this.config.hostedDomain);
    }

    if (this.config.prompt) {
      params.append('prompt', this.config.prompt);
    }

    return `${this.baseUrl}/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(
    code: string,
    codeVerifier: string,
  ): Promise<OAuthTokenResponse> {
    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
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
      throw new Error(`Google token exchange failed: ${response.status} ${errorText}`);
    }

    const data = await response.json() as any;

    if (data.error) {
      throw new Error(`Google OAuth error: ${data.error_description || data.error}`);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenType: data.token_type || 'Bearer',
      expiresIn: data.expires_in ? parseInt(data.expires_in, 10) : undefined,
      scope: data.scope,
      idToken: data.id_token,
      raw: data,
    };
  }

  /**
   * Get user information from access token
   */
  async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    // Get user info from userinfo endpoint
    const userInfoResponse = await fetch(`${this.apiUrl}/oauth2/v2/userinfo`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error(`Failed to fetch Google user: ${userInfoResponse.status}`);
    }

    const userData = await userInfoResponse.json() as any;

    // Parse ID token for additional claims if available
    let idTokenClaims: any = null;
    const idToken = await this.getIdTokenClaims(accessToken);
    if (idToken) {
      idTokenClaims = idToken;
    }

    return {
      id: userData.sub || userData.id,
      username: userData.email?.split('@')[0], // Google doesn't have usernames
      email: userData.email,
      name: userData.name,
      avatar: userData.picture,
      provider: 'google',
      raw: userData,
      metadata: {
        emailVerified: userData.email_verified || false,
        locale: userData.locale,
        hostedDomain: userData.hd,
        idTokenClaims,
        givenName: userData.given_name,
        familyName: userData.family_name,
      },
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<OAuthTokenResponse> {
    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
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
      throw new Error(`Google token refresh failed: ${response.status} ${errorText}`);
    }

    const data = await response.json() as any;

    if (data.error) {
      throw new Error(`Google OAuth error: ${data.error_description || data.error}`);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      tokenType: data.token_type || 'Bearer',
      expiresIn: data.expires_in ? parseInt(data.expires_in, 10) : undefined,
      scope: data.scope,
      idToken: data.id_token,
      raw: data,
    };
  }

  /**
   * Revoke access token
   */
  async revokeToken(accessToken: string): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/oauth2/v2/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token: accessToken,
        }),
      });
    } catch (error) {
      // Log error but don't throw - revocation is best-effort
      console.warn('Failed to revoke Google token:', error);
    }
  }

  /**
   * Validate access token
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/oauth2/v2/userinfo`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get ID token claims (if available)
   */
  private async getIdTokenClaims(accessToken: string): Promise<any> {
    try {
      // Try to get token info from Google
      const response = await fetch(`${this.apiUrl}/oauth2/v2/tokeninfo?access_token=${accessToken}`);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Ignore errors - ID token claims are optional
    }
    return null;
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