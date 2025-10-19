/**
 * Authentication System Factory
 *
 * Creates and configures the complete authentication system including
 * OAuth, user registry, and integration with existing authorization.
 */

import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { AuthConfig } from '../config/auth-config.js';
import type { AuthenticationManager } from '../core/authentication.js';
import { authenticationManager } from '../core/authentication.js';
import { OAuthSystem } from './oauth/index.js';
import { JwtTokenManager } from './oauth/jwt.js';
import { UserRegistry } from './users/registry.js';
import { OAuthIntegration } from './integration.js';
import type {
  OAuthSystemConfig,
  JwtTokenConfig,
  UserRegistryConfig,
  OAuthIntegrationConfig,
} from './types.js';

/**
 * Complete authentication system
 */
export interface AuthenticationSystem {
  authManager: AuthenticationManager;
  oauthSystem?: OAuthSystem;
  jwtManager?: JwtTokenManager;
  userRegistry?: UserRegistry;
  oauthIntegration?: OAuthIntegration;
}

/**
 * Authentication system factory
 */
export class AuthenticationFactory {
  /**
   * Create complete authentication system
   */
  static async createSystem(config: AuthConfig): Promise<AuthenticationSystem> {
    const system: AuthenticationSystem = {
      authManager: authenticationManager,
    };

    // Create user registry if configured
    if (config.userRegistry) {
      const userRegistryConfig = this.createUserRegistryConfig(config.userRegistry);

      // Ensure storage directory exists
      await fs.mkdir(userRegistryConfig.storagePath, { recursive: true });

      system.userRegistry = new UserRegistry(userRegistryConfig);
    }

    // Create OAuth system if configured
    if (config.oauth?.enabled) {
      const oauthSystemConfig = this.createOAuthSystemConfig(config.oauth);
      const jwtConfig = this.createJwtConfig(config.oauth.jwt!);

      // Validate JWT secret
      if (!jwtConfig.secret || jwtConfig.secret.length < 32) {
        throw new Error('OAuth JWT secret must be at least 32 characters long');
      }

      system.jwtManager = new JwtTokenManager(jwtConfig);
      system.oauthSystem = new OAuthSystem(oauthSystemConfig, system.jwtManager);

      // Create OAuth integration if user registry is available
      if (system.userRegistry) {
        const oauthIntegrationConfig = this.createOAuthIntegrationConfig(config.oauth);
        system.oauthIntegration = new OAuthIntegration(
          oauthIntegrationConfig,
          system.oauthSystem,
          system.jwtManager,
          system.userRegistry,
          system.authManager,
        );
      }
    }

    return system;
  }

  /**
   * Create user registry configuration
   */
  private static createUserRegistryConfig(config: AuthConfig['userRegistry']): UserRegistryConfig {
    if (!config) {
      throw new Error('User registry configuration is required');
    }

    return {
      storagePath: config.storagePath,
      enableCustomRoles: config.enableCustomRoles,
      enableActivityLogging: config.enableActivityLogging,
      sessionTimeout: config.sessionTimeout,
      maxSessionsPerUser: config.maxSessionsPerUser,
      enableUserSearch: config.enableUserSearch,
      defaultRole: config.defaultRole,
      autoActivateUsers: config.autoActivateUsers,
    };
  }

  /**
   * Create OAuth system configuration
   */
  private static createOAuthSystemConfig(config: AuthConfig['oauth']): OAuthSystemConfig {
    if (!config) {
      throw new Error('OAuth configuration is required');
    }

    const providers: OAuthSystemConfig['providers'] = {};

    // GitHub provider
    if (config.providers.github?.enabled) {
      providers.github = {
        clientId: config.providers.github.clientId,
        clientSecret: config.providers.github.clientSecret,
        scopes: config.providers.github.scopes || ['user:email'],
        allowSignup: config.providers.github.allowSignup ?? true,
      };
    }

    // Google provider
    if (config.providers.google?.enabled) {
      providers.google = {
        clientId: config.providers.google.clientId,
        clientSecret: config.providers.google.clientSecret,
        scopes: config.providers.google.scopes || [
          'openid',
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile',
        ],
        hostedDomain: config.providers.google.hostedDomain,
        prompt: config.providers.google.prompt,
      };
    }

    return {
      providers,
      redirectUri: config.redirectUri,
      stateTimeout: 600, // 10 minutes
      sessionTimeout: 3600, // 1 hour
      tokenRefreshThreshold: 300, // 5 minutes
      enableRefreshTokens: true,
    };
  }

  /**
   * Create JWT configuration
   */
  private static createJwtConfig(config: any): JwtTokenConfig {
    if (!config) {
      throw new Error('JWT configuration is required');
    }

    return {
      secret: config.secret,
      issuer: config.issuer,
      audience: config.audience,
      accessTokenExpiry: config.accessTokenExpiry,
      refreshTokenExpiry: config.refreshTokenExpiry,
      algorithm: config.algorithm,
    };
  }

  /**
   * Create OAuth integration configuration
   */
  private static createOAuthIntegrationConfig(config: AuthConfig['oauth']): OAuthIntegrationConfig {
    if (!config) {
      throw new Error('OAuth configuration is required');
    }

    const enabledProviders: string[] = [];
    if (config.providers.github?.enabled) {
      enabledProviders.push('github');
    }
    if (config.providers.google?.enabled) {
      enabledProviders.push('google');
    }

    return {
      autoCreateUsers: config.autoCreateUsers,
      defaultRole: config.defaultRole,
      trustedProviders: config.trustedProviders,
      enableUserSync: config.enableUserSync,
      syncInterval: config.syncInterval,
      sessionTimeout: 3600, // 1 hour
    };
  }

  /**
   * Generate secure JWT secret
   */
  static generateJwtSecret(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Validate OAuth configuration
   */
  static validateOAuthConfig(config: AuthConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.oauth?.enabled) {
      return { valid: true, errors: [] };
    }

    const oauth = config.oauth;

    // Check redirect URI
    if (!oauth.redirectUri) {
      errors.push('OAuth redirect URI is required');
    } else if (
      !oauth.redirectUri.startsWith('http://') &&
      !oauth.redirectUri.startsWith('https://')
    ) {
      errors.push('OAuth redirect URI must be a valid HTTP/HTTPS URL');
    }

    // Check JWT configuration
    if (!oauth.jwt.secret) {
      errors.push('OAuth JWT secret is required');
    } else if (oauth.jwt.secret.length < 32) {
      errors.push('OAuth JWT secret must be at least 32 characters long');
    }

    if (!oauth.jwt.issuer) {
      errors.push('OAuth JWT issuer is required');
    }

    if (!oauth.jwt.audience) {
      errors.push('OAuth JWT audience is required');
    }

    // Check provider configurations
    let enabledProviders = 0;

    if (oauth.providers.github?.enabled) {
      enabledProviders++;
      if (!oauth.providers.github.clientId) {
        errors.push('GitHub OAuth client ID is required when GitHub is enabled');
      }
      if (!oauth.providers.github.clientSecret) {
        errors.push('GitHub OAuth client secret is required when GitHub is enabled');
      }
    }

    if (oauth.providers.google?.enabled) {
      enabledProviders++;
      if (!oauth.providers.google.clientId) {
        errors.push('Google OAuth client ID is required when Google is enabled');
      }
      if (!oauth.providers.google.clientSecret) {
        errors.push('Google OAuth client secret is required when Google is enabled');
      }
    }

    if (enabledProviders === 0) {
      errors.push('At least one OAuth provider must be enabled');
    }

    // Check user registry configuration
    if (!config.userRegistry) {
      errors.push('User registry configuration is required when OAuth is enabled');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create example environment file
   */
  static createExampleEnvFile(): string {
    return `# MCP Authentication Configuration

# Basic Authentication
MCP_DEFAULT_ROLE=user
MCP_STRICT_MODE=true
MCP_REQUIRE_AUTH_DANGEROUS=true
MCP_SESSION_TIMEOUT=60
MCP_ENABLE_AUDIT=true
MCP_RATE_LIMIT_RPM=100
MCP_RATE_LIMIT_DANGEROUS_PH=10
MCP_ADMIN_IP_WHITELIST=127.0.0.1,::1

# OAuth Configuration
MCP_OAUTH_ENABLED=false
MCP_OAUTH_REDIRECT_URI=http://localhost:3000/auth/oauth/callback
MCP_OAUTH_AUTO_CREATE_USERS=true
MCP_OAUTH_DEFAULT_ROLE=user
MCP_OAUTH_ENABLE_USER_SYNC=true
MCP_OAUTH_SYNC_INTERVAL=3600

# GitHub OAuth
MCP_OAUTH_GITHUB_ENABLED=false
MCP_OAUTH_GITHUB_CLIENT_ID=your_github_client_id
MCP_OAUTH_GITHUB_CLIENT_SECRET=your_github_client_secret
MCP_OAUTH_GITHUB_ALLOW_SIGNUP=true

# Google OAuth
MCP_OAUTH_GOOGLE_ENABLED=false
MCP_OAUTH_GOOGLE_CLIENT_ID=your_google_client_id
MCP_OAUTH_GOOGLE_CLIENT_SECRET=your_google_client_secret
MCP_OAUTH_GOOGLE_HOSTED_DOMAIN=
MCP_OAUTH_GOOGLE_PROMPT=consent

# OAuth JWT Configuration
MCP_OAUTH_JWT_SECRET=your_very_long_and_secure_jwt_secret_at_least_32_chars
MCP_OAUTH_JWT_ISSUER=promethean-mcp
MCP_OAUTH_JWT_AUDIENCE=promethean-mcp-clients
MCP_OAUTH_JWT_ACCESS_EXPIRY=3600
MCP_OAUTH_JWT_REFRESH_EXPIRY=2592000
MCP_OAUTH_JWT_ALGORITHM=HS256

# User Registry Configuration
MCP_USER_REGISTRY_PATH=./data/users
MCP_USER_REGISTRY_ENABLE_CUSTOM_ROLES=true
MCP_USER_REGISTRY_ENABLE_ACTIVITY_LOGGING=true
MCP_USER_REGISTRY_SESSION_TIMEOUT=3600
MCP_USER_REGISTRY_MAX_SESSIONS=5
MCP_USER_REGISTRY_ENABLE_SEARCH=true
MCP_USER_REGISTRY_DEFAULT_ROLE=user
MCP_USER_REGISTRY_AUTO_ACTIVATE=true
`;
  }

  /**
   * Setup OAuth directories and files
   */
  static async setupOAuthDirectories(config: AuthConfig): Promise<void> {
    if (!config.oauth?.enabled || !config.userRegistry) {
      return;
    }

    // Create user registry storage directory
    await fs.mkdir(config.userRegistry.storagePath, { recursive: true });

    // Create .gitkeep for the storage directory
    const gitkeepPath = path.join(config.userRegistry.storagePath, '.gitkeep');
    try {
      await fs.writeFile(gitkeepPath, '# This file ensures the directory is tracked by git\n');
    } catch {
      // File might already exist
    }

    console.log(`[AuthFactory] OAuth directories created at ${config.userRegistry.storagePath}`);
  }
}
