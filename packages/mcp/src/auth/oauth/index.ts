/**
 * OAuth System Main Module
 *
 * Central OAuth 2.1 + PKCE implementation with provider management
 * following security best practices and the project's functional programming style.
 * Updated for ChatGPT compatibility.
 */

import crypto from 'node:crypto';
import type {
  OAuthProvider,
  OAuthState,
  OAuthSession,
  OAuthSystemConfig,
  OAuthError,
} from './types.js';

// Re-export OAuthSession for use in other modules
export type { OAuthSession };

import { GitHubOAuthProvider } from './providers/github.js';
import { GoogleOAuthProvider } from './providers/google.js';

/**
 * OAuth system manager
 */
export class OAuthSystem {
  private readonly config: OAuthSystemConfig;
  private readonly providers = new Map<string, OAuthProvider>();
  private readonly states = new Map<string, OAuthState>();
  private readonly sessions = new Map<string, OAuthSession>();
  // Map OAuth client IDs to provider names for ChatGPT/MCP token flows
  private readonly clientIdToProvider = new Map<string, string>();
  constructor(config: OAuthSystemConfig) {
    this.config = config;

    // Initialize providers
    this.initializeProviders();

    // Cleanup expired states and sessions periodically
    this.startCleanupTimer();
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): readonly string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if provider is available
   */
  isProviderAvailable(provider: string): boolean {
    return this.providers.has(provider);
  }

  /**
   * Start OAuth flow
   */
  startOAuthFlow(
    provider: string,
    redirectUri?: string,
    pkceOptions?: {
      codeVerifier?: string;
      codeChallenge?: string;
      codeChallengeMethod?: string;
    },
  ): { authUrl: string; state: string } {
    const oauthProvider = this.providers.get(provider);
    if (!oauthProvider) {
      throw new Error(`OAuth provider not available: ${provider}`);
    }

    let codeVerifier: string | undefined;
    let codeChallenge: string | undefined;
    let codeChallengeMethod: string | undefined;

    if (pkceOptions?.codeVerifier) {
      codeVerifier = pkceOptions.codeVerifier;
      const derivedChallenge = this.generateCodeChallenge(codeVerifier);

      if (pkceOptions.codeChallenge && pkceOptions.codeChallenge !== derivedChallenge) {
        throw new Error('Provided PKCE code challenge does not match the code verifier');
      }

      codeChallenge = pkceOptions.codeChallenge ?? derivedChallenge;
      codeChallengeMethod = pkceOptions.codeChallengeMethod ?? 'S256';
    } else {
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
    const oauthState: OAuthState = {
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
  async handleOAuthCallback(
    code: string,
    state: string,
    error?: string,
  ): Promise<{ success: boolean; userId?: string; sessionId?: string; error?: OAuthError }> {
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
      const tokenResponse = await provider.exchangeCodeForTokens(
        code,
        oauthState.codeVerifier,
        oauthState.redirectUri,
      );

      // Get user information
      const userInfo = await provider.getUserInfo(tokenResponse.accessToken);

      // Create OAuth session
      const sessionId = this.generateSessionId();
      const oauthSession: OAuthSession = {
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
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'token_exchange_failed',
          message: (error as Error).message,
          provider: oauthState.provider,
        },
      };
    }
  }

  /**
   * Get OAuth session
   */
  getSession(sessionId: string): OAuthSession | null {
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
    const updatedSession: OAuthSession = {
      ...session,
      lastAccessAt: new Date(),
    };
    this.sessions.set(sessionId, updatedSession);

    return updatedSession;
  }

  /**
   * Refresh OAuth session tokens
   */
  async refreshSession(sessionId: string): Promise<OAuthSession | null> {
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
      const updatedSession: OAuthSession = {
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
    } catch (error) {
      // Remove invalid session
      this.sessions.delete(sessionId);
      return null;
    }
  }

  /**
   * Revoke OAuth session
   */
  async revokeSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    try {
      const provider = this.providers.get(session.provider);
      if (provider) {
        await provider.revokeToken(session.accessToken);
      }
    } catch (error) {
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
  getUserSessions(userId: string): readonly OAuthSession[] {
    return Array.from(this.sessions.values())
      .filter((session) => session.userId === userId)
      .filter((session) => !this.isSessionExpired(session));
  }

  /**
   * Revoke all sessions for a user
   */
  async revokeUserSessions(userId: string): Promise<number> {
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
  private initializeProviders(): void {
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
  private generateSecureState(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Derive PKCE code challenge from verifier
   */
  private generateCodeChallenge(codeVerifier: string): string {
    return crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return crypto.randomUUID();
  }

  /**
   * Check if session is expired
   */
  private isSessionExpired(session: OAuthSession): boolean {
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
  private startCleanupTimer(): void {
    // Cleanup every 5 minutes
    setInterval(
      () => {
        this.cleanupExpiredStates();
        this.cleanupExpiredSessions();
      },
      5 * 60 * 1000,
    );
  }

  /**
   * Cleanup expired OAuth states
   */
  private cleanupExpiredStates(): void {
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
  private cleanupExpiredSessions(): void {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (this.isSessionExpired(session)) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Get system statistics
   */
  getStats(): {
    providers: readonly string[];
    activeStates: number;
    activeSessions: number;
  } {
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
  getProviderByClientId(clientId: string): string | null {
    return this.clientIdToProvider.get(clientId) ?? null;
  }

  /**
   * Directly exchange an authorization code for tokens without state.
   * Used for ChatGPT/MCP, which posts (code, code_verifier, redirect_uri, client_id).
   */
  async exchangeCodeForTokensDirect(
    providerName: string,
    code: string,
    opts: { codeVerifier?: string; redirectUri?: string } = {},
  ) {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Provider not found: ${providerName}`);
    }
    return await provider.exchangeCodeForTokens(code, opts.codeVerifier, opts.redirectUri);
  }
}
