/**
 * OAuth Main Integration Module
 *
 * Complete OAuth authentication system integration with MCP
 * following security best practices and the project's functional programming style.
 */

import type { FastifyInstance } from 'fastify';
import { AuthenticationManager } from '../core/authentication.js';
import { OAuthFastifyIntegration, registerOAuthWithFastify } from './fastify-integration.js';
import { loadOAuthConfig, validateOAuthConfig } from './config.js';

/**
 * OAuth system options
 */
export type OAuthSystemOptions = Readonly<{
  readonly enabled?: boolean;
  readonly configPath?: string;
  readonly cookieDomain?: string;
  readonly secureCookies?: boolean;
  readonly sameSitePolicy?: 'strict' | 'lax' | 'none';
  readonly autoRegisterRoutes?: boolean;
}>;

/**
 * OAuth system manager
 */
export class OAuthSystemManager {
  private fastifyIntegration?: OAuthFastifyIntegration;
  private authManager: AuthenticationManager;
  private options: OAuthSystemOptions;
  private initialized = false;

  constructor(authManager: AuthenticationManager, options: OAuthSystemOptions = {}) {
    this.authManager = authManager;
    this.options = {
      enabled: true,
      autoRegisterRoutes: true,
      ...options,
    };
  }

  /**
   * Initialize OAuth system
   */
  async initialize(fastify: FastifyInstance): Promise<void> {
    if (this.initialized) {
      console.warn('[OAuthSystemManager] OAuth system already initialized');
      return;
    }

    if (!this.options.enabled) {
      console.log('[OAuthSystemManager] OAuth system disabled');
      return;
    }

    try {
      // Load and validate configuration
      const config = loadOAuthConfig();
      validateOAuthConfig(config);

      // Initialize Fastify integration
      this.fastifyIntegration = new OAuthFastifyIntegration(this.authManager);
      await this.fastifyIntegration.initialize(fastify, {
        enableOAuth: true,
        configPath: this.options.configPath,
        cookieDomain: this.options.cookieDomain,
        secureCookies: this.options.secureCookies,
        sameSitePolicy: this.options.sameSitePolicy,
      });

      this.initialized = true;
      console.log('[OAuthSystemManager] OAuth system initialized successfully');

    } catch (error) {
      console.error('[OAuthSystemManager] Failed to initialize OAuth system:', error);
      throw error;
    }
  }

  /**
   * Check if OAuth system is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get OAuth system statistics
   */
  async getStats(): Promise<Record<string, unknown>> {
    if (!this.fastifyIntegration) {
      return { error: 'OAuth system not initialized' };
    }

    return await this.fastifyIntegration.getStats();
  }

  /**
   * Get OAuth system components
   */
  getComponents() {
    if (!this.fastifyIntegration) {
      return null;
    }

    return {
      oauthSystem: this.fastifyIntegration.getOAuthSystem(),
      jwtManager: this.fastifyIntegration.getJwtManager(),
      userRegistry: this.fastifyIntegration.getUserRegistry(),
      oauthIntegration: this.fastifyIntegration.getOAuthIntegration(),
    };
  }

  /**
   * Create authentication middleware
   */
  createAuthMiddleware(options: {
    required?: boolean;
    roles?: string[];
    providers?: string[];
  } = {}) {
    if (!this.fastifyIntegration) {
      throw new Error('OAuth system not initialized');
    }

    return this.fastifyIntegration.createAuthMiddleware(options);
  }

  /**
   * Cleanup OAuth system
   */
  async cleanup(): Promise<void> {
    if (this.fastifyIntegration) {
      await this.fastifyIntegration.cleanup();
      this.fastifyIntegration = undefined;
    }

    this.initialized = false;
    console.log('[OAuthSystemManager] OAuth system cleaned up');
  }
}

/**
 * Global OAuth system manager instance
 */
let globalOAuthManager: OAuthSystemManager | null = null;

/**
 * Initialize global OAuth system
 */
export async function initializeOAuthSystem(
  authManager: AuthenticationManager,
  fastify: FastifyInstance,
  options: OAuthSystemOptions = {},
): Promise<OAuthSystemManager> {
  if (globalOAuthManager) {
    console.warn('[OAuth] Global OAuth system already exists, returning existing instance');
    return globalOAuthManager;
  }

  globalOAuthManager = new OAuthSystemManager(authManager, options);
  await globalOAuthManager.initialize(fastify);

  return globalOAuthManager;
}

/**
 * Get global OAuth system manager
 */
export function getOAuthSystemManager(): OAuthSystemManager | null {
  return globalOAuthManager;
}

/**
 * Setup OAuth system with Fastify transport
 */
export async function setupOAuthWithFastify(
  fastify: FastifyInstance,
  authManager: AuthenticationManager,
  options: OAuthSystemOptions = {},
): Promise<OAuthFastifyIntegration> {
  return await registerOAuthWithFastify(fastify, authManager, options);
}

/**
 * OAuth system factory for easy integration
 */
export class OAuthSystemFactory {
  /**
   * Create OAuth system for MCP
   */
  static async createForMCP(
    fastify: FastifyInstance,
    authManager: AuthenticationManager,
    options: OAuthSystemOptions = {},
  ): Promise<OAuthSystemManager> {
    return await initializeOAuthSystem(authManager, fastify, options);
  }

  /**
   * Create OAuth system with custom configuration
   */
  static async createWithConfig(
    fastify: FastifyInstance,
    authManager: AuthenticationManager,
    configPath: string,
    options: OAuthSystemOptions = {},
  ): Promise<OAuthSystemManager> {
    return await initializeOAuthSystem(authManager, fastify, {
      ...options,
      configPath,
    });
  }

  /**
   * Check OAuth system health
   */
  static async checkHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    details: Record<string, unknown>;
  }> {
    const manager = getOAuthSystemManager();
    
    if (!manager) {
      return {
        status: 'down',
        details: { error: 'OAuth system not initialized' },
      };
    }

    try {
      const stats = await manager.getStats();
      
      if (stats.error) {
        return {
          status: 'degraded',
          details: stats,
        };
      }

      const oauthStats = stats.oauth as any;
      const integrationStats = stats.integration as any;

      // Determine health based on active sessions and providers
      const hasActiveProviders = oauthStats?.providers?.length > 0;
      const hasActiveSessions = integrationStats?.activeOAuthSessions > 0;

      if (!hasActiveProviders) {
        return {
          status: 'degraded',
          details: { ...stats, reason: 'No active OAuth providers' },
        };
      }

      return {
        status: 'healthy',
        details: stats,
      };

    } catch (error) {
      return {
        status: 'down',
        details: { error: (error as Error).message },
      };
    }
  }

  /**
   * Get OAuth configuration template
   */
  static getConfigTemplate(): string {
    return `# OAuth Configuration Template
# Copy this to your .env file and update the values

# Enable OAuth authentication
OAUTH_ENABLED=true

# OAuth base configuration
OAUTH_REDIRECT_URI=http://localhost:3210/auth/oauth/callback
OAUTH_STATE_TIMEOUT=600
OAUTH_SESSION_TIMEOUT=86400
OAUTH_TOKEN_REFRESH_THRESHOLD=300
OAUTH_ENABLE_REFRESH_TOKENS=true

# OAuth integration
OAUTH_AUTO_CREATE_USERS=true
OAUTH_DEFAULT_ROLE=user
OAUTH_TRUSTED_PROVIDERS=github,google
OAUTH_ENABLE_USER_SYNC=true
OAUTH_SYNC_INTERVAL=3600

# JWT configuration
JWT_SECRET=your_very_long_and_secure_jwt_secret_at_least_32_characters
JWT_ISSUER=promethean-mcp
JWT_AUDIENCE=promethean-mcp-clients
JWT_ACCESS_TOKEN_EXPIRY=900
JWT_REFRESH_TOKEN_EXPIRY=604800
JWT_ALGORITHM=HS256

# User registry configuration
USER_REGISTRY_STORAGE_PATH=./data/users
USER_REGISTRY_ENABLE_CUSTOM_ROLES=true
USER_REGISTRY_ENABLE_ACTIVITY_LOGGING=true
USER_REGISTRY_SESSION_TIMEOUT=86400
USER_REGISTRY_MAX_SESSIONS_PER_USER=5
USER_REGISTRY_ENABLE_USER_SEARCH=true
USER_REGISTRY_DEFAULT_ROLE=user
USER_REGISTRY_AUTO_ACTIVATE_USERS=true

# HTTP configuration
OAUTH_BASE_PATH=/auth/oauth
OAUTH_COOKIE_DOMAIN=
OAUTH_SECURE_COOKIES=false
OAUTH_SAME_SITE_POLICY=lax

# GitHub OAuth (optional)
GITHUB_OAUTH_CLIENT_ID=your_github_client_id
GITHUB_OAUTH_CLIENT_SECRET=your_github_client_secret
GITHUB_OAUTH_SCOPES=user:email
GITHUB_OAUTH_ALLOW_SIGNUP=true

# Google OAuth (optional)
GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret
GOOGLE_OAUTH_SCOPES=openid,email,profile
GOOGLE_OAUTH_HOSTED_DOMAIN=
GOOGLE_OAUTH_PROMPT=consent
`;
  }
}

/**
 * Export OAuth system for use in other modules
 */
export * from './config.js';
export * from './fastify-integration.js';
export * from './oauth/index.js';
export * from './oauth/routes.js';
export * from './oauth/jwt.js';
export * from './users/registry.js';
export * from './integration.js';
export * from './ui/oauth-login.js';