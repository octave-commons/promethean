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
import type { OAuthUserInfo } from './oauth/types.js';

/**
 * OAuth integration configuration
 */
export type OAuthIntegrationConfig = Readonly<{
  readonly autoCreateUsers: boolean;
  readonly defaultRole: UserRole;
  readonly trustedProviders: readonly string[];
  readonly enableUserSync: boolean;
  readonly syncInterval: number; // seconds
  readonly sessionTimeout: number; // seconds
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
export class OAuthIntegration {
  private readonly config: OAuthIntegrationConfig;
  private readonly oauthSystem: OAuthSystem;
  private readonly jwtManager: JwtTokenManager;
  private readonly userRegistry: UserRegistry;
  private readonly authManager: AuthenticationManager;

  // Sync cache to avoid excessive API calls
  private readonly syncCache = new Map<string, number>();
  private readonly syncCooldown = 5 * 60 * 1000; // 5 minutes

  constructor(
    config: OAuthIntegrationConfig,
    oauthSystem: OAuthSystem,
    jwtManager: JwtTokenManager,
    userRegistry: UserRegistry,
    authManager: AuthenticationManager,
  ) {
    this.config = config;
    this.oauthSystem = oauthSystem;
    this.jwtManager = jwtManager;
    this.userRegistry = userRegistry;
    this.authManager = authManager;

    // Start periodic sync if enabled
    if (config.enableUserSync) {
      this.startPeriodicSync();
    }
  }

  /**
   * Start OAuth flow
   */
  startOAuthFlow(provider: string, redirectUri?: string): { authUrl: string; state: string } {
    if (!this.oauthSystem.isProviderAvailable(provider)) {
      throw new Error(`OAuth provider not available: ${provider}`);
    }

    if (!this.config.trustedProviders.includes(provider)) {
      throw new Error(`OAuth provider not trusted: ${provider}`);
    }

    return this.oauthSystem.startOAuthFlow(provider, redirectUri);
  }

  /**
   * Handle OAuth callback and authenticate user
   */
  async handleOAuthCallback(
    code: string,
    state: string,
    error?: string,
    request?: FastifyRequest,
  ): Promise<OAuthAuthResult> {
    try {
      // Handle OAuth callback
      const callbackResult = await this.oauthSystem.handleOAuthCallback(code, state, error);

      if (!callbackResult.success) {
        return {
          success: false,
          error: callbackResult.error?.message || 'OAuth callback failed',
        };
      }

      // Get OAuth session
      const oauthSessions = this.oauthSystem.getUserSessions(callbackResult.userId!);
      if (oauthSessions.length === 0) {
        return {
          success: false,
          error: 'No OAuth session found',
        };
      }

      const oauthSession = oauthSessions[0];
      if (!oauthSession) {
        return {
          success: false,
          error: 'No valid OAuth session found',
        };
      }
      const provider = oauthSession.provider;

      // Get user info from provider
      const userInfo = await this.getUserInfoFromSession(oauthSession);
      if (!userInfo) {
        return {
          success: false,
          error: 'Failed to get user info from OAuth provider',
        };
      }

      // Find or create user
      let user = await this.userRegistry.getUserByProvider(provider, userInfo.id);

      if (!user) {
        if (!this.config.autoCreateUsers) {
          return {
            success: false,
            error: 'User not found and auto-creation is disabled',
          };
        }

        // Create new user
        user = await this.createUserFromOAuth(userInfo, provider);
      } else {
        // Sync user data if enabled
        if (this.config.enableUserSync) {
          user = await this.syncUserData(user, userInfo);
        }
      }

      // Update last login
      await this.userRegistry.updateLastLogin(user.id);

      // Create user session
      const userSession = await this.userRegistry.createSession(
        user.id,
        'oauth',
        provider,
        request?.ip,
        request?.headers['user-agent'],
      );

      // Generate JWT tokens
      const tokens = this.jwtManager.generateTokenPair(
        userInfo,
        userSession.sessionId,
        oauthSession,
      );

      return {
        success: true,
        user,
        tokens,
        session: oauthSession,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Refresh OAuth tokens
   */
  async refreshOAuthTokens(refreshToken: string): Promise<OAuthAuthResult> {
    try {
      // Validate refresh token
      const refreshPayload = this.jwtManager.validateRefreshToken(refreshToken);
      if (!refreshPayload) {
        return {
          success: false,
          error: 'Invalid refresh token',
        };
      }

      // Get OAuth session
      const oauthSession = this.oauthSystem.getSession(refreshPayload.sessionId);
      if (!oauthSession) {
        return {
          success: false,
          error: 'OAuth session not found or expired',
        };
      }

      // Refresh OAuth tokens
      const refreshedSession = await this.oauthSystem.refreshSession(oauthSession.sessionId);
      if (!refreshedSession) {
        return {
          success: false,
          error: 'Failed to refresh OAuth tokens',
        };
      }

      // Get updated user info
      const userInfo = await this.getUserInfoFromSession(refreshedSession);
      if (!userInfo) {
        return {
          success: false,
          error: 'Failed to get updated user info',
        };
      }

      // Get user
      const user = await this.userRegistry.getUser(refreshPayload.sub);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Generate new JWT tokens
      const tokens = this.jwtManager.refreshAccessToken(refreshToken, userInfo);
      if (!tokens) {
        return {
          success: false,
          error: 'Failed to generate new tokens',
        };
      }

      return {
        success: true,
        user,
        tokens,
        session: refreshedSession,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Logout user and revoke tokens
   */
  async logout(userId: string, sessionId?: string): Promise<boolean> {
    try {
      // Revoke user sessions
      await this.userRegistry.revokeUserSessions(userId);

      // Revoke OAuth sessions
      await this.oauthSystem.revokeUserSessions(userId);

      // If specific session provided, revoke it
      if (sessionId) {
        await this.oauthSystem.revokeSession(sessionId);
      }

      return true;
    } catch (error) {
      console.error('[OAuthIntegration] Logout failed:', error);
      return false;
    }
  }

  /**
   * Get current user from request
   */
  async getCurrentUser(request: FastifyRequest): Promise<User | null> {
    try {
      // Extract auth context from existing authentication
      const authResult = this.authManager.authenticateRequest(request);

      if (!authResult.success || !authResult.userId) {
        return null;
      }

      // Get user from registry
      const user = await this.userRegistry.getUser(authResult.userId);

      // Verify it's an OAuth user if that's the method
      if (authResult.method === 'jwt' && user?.authMethod === 'oauth') {
        return user;
      }

      return user;
    } catch (error) {
      console.error('[OAuthIntegration] Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Create OAuth authentication middleware
   */
  createOAuthAuthMiddleware(
    options: {
      required?: boolean;
      allowedRoles?: UserRole[];
      allowedProviders?: string[];
    } = {},
  ) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Try to get current user
        const user = await this.getCurrentUser(request);

        if (!user) {
          if (options.required !== false) {
            return reply.status(401).send({
              error: 'Authentication required',
              message: 'Please authenticate to access this resource',
            });
          }
          // Continue with guest access
          (request as any).oauthUser = null;
          return;
        }

        // Check provider restrictions
        if (
          options.allowedProviders &&
          user.provider &&
          !options.allowedProviders.includes(user.provider)
        ) {
          return reply.status(403).send({
            error: 'Provider not allowed',
            message: `OAuth provider '${user.provider}' is not allowed for this resource`,
          });
        }

        // Check role restrictions
        if (options.allowedRoles && !options.allowedRoles.includes(user.role)) {
          return reply.status(403).send({
            error: 'Insufficient privileges',
            message: `Role '${user.role}' is not allowed for this resource`,
          });
        }

        // Store user in request
        (request as any).oauthUser = user;
      } catch (error) {
        console.error('[OAuthIntegration] Middleware error:', error);
        return reply.status(500).send({
          error: 'Authentication error',
          message: 'Failed to process authentication',
        });
      }
    };
  }

  /**
   * Get user info from OAuth session
   */
  private async getUserInfoFromSession(oauthSession: OAuthSession): Promise<OAuthUserInfo | null> {
    try {
      // Get provider from OAuth system
      const providerName = oauthSession.provider;

      // This is a simplified approach - in a real implementation,
      // you'd need to get the provider instance from the OAuth system
      // and call getUserInfo with the access token

      // For now, we'll create a minimal user info from the session
      return {
        id: oauthSession.userId,
        provider: providerName,
        username: `user_${oauthSession.userId}`,
        raw: {},
        metadata: {},
      };
    } catch (error) {
      console.error('[OAuthIntegration] Failed to get user info from session:', error);
      return null;
    }
  }

  /**
   * Create user from OAuth info
   */
  private async createUserFromOAuth(userInfo: OAuthUserInfo, provider: string): Promise<User> {
    const createUserRequest = {
      username: userInfo.username || `${provider}_${userInfo.id}`,
      email: userInfo.email,
      name: userInfo.name,
      role: this.config.defaultRole,
      authMethod: 'oauth' as const,
      provider,
      providerUserId: userInfo.id,
      permissions: [], // Will be determined by role
      metadata: {
        avatar: userInfo.avatar,
        provider: userInfo.provider,
        syncedAt: new Date().toISOString(),
        ...userInfo.metadata,
      },
    };

    return await this.userRegistry.createUser(createUserRequest);
  }

  /**
   * Sync user data with OAuth provider
   */
  private async syncUserData(user: User, userInfo: OAuthUserInfo): Promise<User> {
    // Check if we need to sync (avoid excessive API calls)
    const syncKey = `${user.provider}:${user.providerUserId}`;
    const lastSync = this.syncCache.get(syncKey) || 0;

    if (Date.now() - lastSync < this.syncCooldown) {
      return user;
    }

    try {
      const updateUserRequest = {
        email: userInfo.email || user.email,
        name: userInfo.name || user.name,
        metadata: {
          ...user.metadata,
          avatar: userInfo.avatar || user.metadata?.avatar,
          syncedAt: new Date().toISOString(),
          ...userInfo.metadata,
        },
      };

      const updatedUser = await this.userRegistry.updateUser(user.id, updateUserRequest);
      this.syncCache.set(syncKey, Date.now());

      return updatedUser;
    } catch (error) {
      console.error('[OAuthIntegration] Failed to sync user data:', error);
      return user;
    }
  }

  /**
   * Start periodic user sync
   */
  private startPeriodicSync(): void {
    setInterval(async () => {
      try {
        await this.syncAllUsers();
      } catch (error) {
        console.error('[OAuthIntegration] Periodic sync failed:', error);
      }
    }, this.config.syncInterval * 1000);
  }

  /**
   * Sync all OAuth users
   */
  private async syncAllUsers(): Promise<void> {
    const users = await this.userRegistry.listUsers();
    const oauthUsers = users.filter((user) => user.authMethod === 'oauth');

    for (const user of oauthUsers) {
      if (user.provider && user.providerUserId) {
        try {
          // Get user sessions to find active OAuth sessions
          const sessions = this.oauthSystem.getUserSessions(user.id);

          if (sessions.length > 0) {
            const session = sessions[0];
            if (session) {
              const userInfo = await this.getUserInfoFromSession(session);
              if (userInfo) {
                await this.syncUserData(user, userInfo);
              }
            }
          }
        } catch (error) {
          console.error(`[OAuthIntegration] Failed to sync user ${user.id}:`, error);
        }
      }
    }
  }

  /**
   * Get integration statistics
   */
  async getIntegrationStats(): Promise<{
    totalOAuthUsers: number;
    activeOAuthSessions: number;
    usersByProvider: Record<string, number>;
    recentLogins: number;
  }> {
    const users = await this.userRegistry.listUsers();
    const oauthUsers = users.filter((user) => user.authMethod === 'oauth');

    const usersByProvider: Record<string, number> = {};
    let recentLogins = 0;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    for (const user of oauthUsers) {
      if (user.provider) {
        usersByProvider[user.provider] = (usersByProvider[user.provider] || 0) + 1;
      }

      if (user.lastLoginAt && user.lastLoginAt >= oneDayAgo) {
        recentLogins++;
      }
    }

    const oauthStats = this.oauthSystem.getStats();

    return {
      totalOAuthUsers: oauthUsers.length,
      activeOAuthSessions: oauthStats.activeSessions,
      usersByProvider,
      recentLogins,
    };
  }
}
