/**
 * MCP Authorization Configuration
 *
 * This file demonstrates how to configure user roles and permissions
 * for the MCP authorization system, including OAuth integration.
 */

export interface AuthConfig {
  /**
   * Default role for unauthenticated users
   */
  defaultRole: 'guest' | 'user';

  /**
   * Enable strict authorization (deny by default)
   */
  strictMode: boolean;

  /**
   * Require authentication for dangerous operations
   */
  requireAuthForDangerous: boolean;

  /**
   * Session timeout in minutes
   */
  sessionTimeout: number;

  /**
   * Enable audit logging
   */
  enableAuditLog: boolean;

  /**
   * Rate limiting per user
   */
  rateLimiting: {
    requestsPerMinute: number;
    dangerousRequestsPerHour: number;
  };

  /**
   * IP whitelist for admin operations
   */
  adminIpWhitelist: string[];

  /**
   * Custom role mappings (optional)
   */
  roleMappings?: Record<
    string,
    {
      role: 'guest' | 'user' | 'developer' | 'admin';
      permissions: string[];
      restrictions?: string[];
    }
  >;

  /**
   * OAuth configuration
   */
  oauth?: {
    /**
     * Enable OAuth authentication
     */
    enabled: boolean;

    /**
     * OAuth redirect URI
     */
    redirectUri: string;

    /**
     * Trusted OAuth providers
     */
    trustedProviders: readonly string[];

    /**
     * Auto-create users on first OAuth login
     */
    autoCreateUsers: boolean;

    /**
     * Default role for OAuth users
     */
    defaultRole: 'guest' | 'user' | 'developer' | 'admin';

    /**
     * Enable user data synchronization
     */
    enableUserSync: boolean;

    /**
     * Sync interval in seconds
     */
    syncInterval: number;

    /**
     * Provider-specific configurations
     */
    providers: {
      github?: {
        enabled: boolean;
        clientId: string;
        clientSecret: string;
        scopes?: readonly string[];
        allowSignup?: boolean;
      };
      google?: {
        enabled: boolean;
        clientId: string;
        clientSecret: string;
        scopes?: readonly string[];
        hostedDomain?: string;
        prompt?: 'consent' | 'none' | 'select_account';
      };
    };

    /**
     * JWT configuration for OAuth tokens
     */
    jwt: {
      secret: string;
      issuer: string;
      audience: string;
      accessTokenExpiry: number; // seconds
      refreshTokenExpiry: number; // seconds
      algorithm: 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512';
    };
  };

  /**
   * User registry configuration
   */
  userRegistry?: {
    /**
     * Storage path for user data
     */
    storagePath: string;

    /**
     * Enable custom roles
     */
    enableCustomRoles: boolean;

    /**
     * Enable activity logging
     */
    enableActivityLogging: boolean;

    /**
     * Session timeout in seconds
     */
    sessionTimeout: number;

    /**
     * Maximum sessions per user
     */
    maxSessionsPerUser: number;

    /**
     * Enable user search
     */
    enableUserSearch: boolean;

    /**
     * Default role for new users
     */
    defaultRole: 'guest' | 'user' | 'developer' | 'admin';

    /**
     * Auto-activate new users
     */
    autoActivateUsers: boolean;
  };
}

export const defaultAuthConfig: AuthConfig = {
  defaultRole: 'user',
  strictMode: true,
  requireAuthForDangerous: true,
  sessionTimeout: 60, // 1 hour
  enableAuditLog: true,
  rateLimiting: {
    requestsPerMinute: 100,
    dangerousRequestsPerHour: 10,
  },
  adminIpWhitelist: ['127.0.0.1', '::1'], // localhost only
  oauth: {
    enabled: false, // Disabled by default for security
    redirectUri: 'http://localhost:3000/auth/oauth/callback',
    trustedProviders: ['github', 'google'],
    autoCreateUsers: true,
    defaultRole: 'user',
    enableUserSync: true,
    syncInterval: 3600, // 1 hour
    providers: {
      github: {
        enabled: false,
        clientId: '',
        clientSecret: '',
        scopes: ['user:email'],
        allowSignup: true,
      },
      google: {
        enabled: false,
        clientId: '',
        clientSecret: '',
        scopes: [
          'openid',
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile',
        ],
        prompt: 'consent',
      },
    },
    jwt: {
      secret: '', // Must be provided
      issuer: 'promethean-mcp',
      audience: 'promethean-mcp-clients',
      accessTokenExpiry: 3600, // 1 hour
      refreshTokenExpiry: 86400 * 30, // 30 days
      algorithm: 'HS256',
    },
  },
  userRegistry: {
    storagePath: './data/users',
    enableCustomRoles: true,
    enableActivityLogging: true,
    sessionTimeout: 3600, // 1 hour
    maxSessionsPerUser: 5,
    enableUserSearch: true,
    defaultRole: 'user',
    autoActivateUsers: true,
  },
};

/**
 * Environment variable based configuration
 */
export function getAuthConfig(): AuthConfig {
  const config = { ...defaultAuthConfig };

  // Basic auth config
  config.defaultRole = (process.env.MCP_DEFAULT_ROLE as any) || defaultAuthConfig.defaultRole;
  config.strictMode = process.env.MCP_STRICT_MODE === 'true' || defaultAuthConfig.strictMode;
  config.requireAuthForDangerous =
    process.env.MCP_REQUIRE_AUTH_DANGEROUS !== 'false' || defaultAuthConfig.requireAuthForDangerous;
  config.sessionTimeout = parseInt(process.env.MCP_SESSION_TIMEOUT || '60', 10);
  config.enableAuditLog =
    process.env.MCP_ENABLE_AUDIT !== 'false' || defaultAuthConfig.enableAuditLog;
  config.rateLimiting = {
    requestsPerMinute: parseInt(process.env.MCP_RATE_LIMIT_RPM || '100', 10),
    dangerousRequestsPerHour: parseInt(process.env.MCP_RATE_LIMIT_DANGEROUS_PH || '10', 10),
  };
  config.adminIpWhitelist =
    process.env.MCP_ADMIN_IP_WHITELIST?.split(',') || defaultAuthConfig.adminIpWhitelist;

  // OAuth config
  if (config.oauth) {
    config.oauth.enabled = process.env.MCP_OAUTH_ENABLED === 'true';
    config.oauth.redirectUri = process.env.MCP_OAUTH_REDIRECT_URI || config.oauth.redirectUri;
    config.oauth.autoCreateUsers = process.env.MCP_OAUTH_AUTO_CREATE_USERS !== 'false';
    config.oauth.defaultRole =
      (process.env.MCP_OAUTH_DEFAULT_ROLE as any) || config.oauth.defaultRole;
    config.oauth.enableUserSync = process.env.MCP_OAUTH_ENABLE_USER_SYNC !== 'false';
    config.oauth.syncInterval = parseInt(process.env.MCP_OAUTH_SYNC_INTERVAL || '3600', 10);

    // GitHub OAuth
    if (config.oauth.providers.github) {
      config.oauth.providers.github.enabled = process.env.MCP_OAUTH_GITHUB_ENABLED === 'true';
      config.oauth.providers.github.clientId = process.env.MCP_OAUTH_GITHUB_CLIENT_ID || '';
      config.oauth.providers.github.clientSecret = process.env.MCP_OAUTH_GITHUB_CLIENT_SECRET || '';
      config.oauth.providers.github.allowSignup =
        process.env.MCP_OAUTH_GITHUB_ALLOW_SIGNUP !== 'false';
    }

    // Google OAuth
    if (config.oauth.providers.google) {
      config.oauth.providers.google.enabled = process.env.MCP_OAUTH_GOOGLE_ENABLED === 'true';
      config.oauth.providers.google.clientId = process.env.MCP_OAUTH_GOOGLE_CLIENT_ID || '';
      config.oauth.providers.google.clientSecret = process.env.MCP_OAUTH_GOOGLE_CLIENT_SECRET || '';
      config.oauth.providers.google.hostedDomain = process.env.MCP_OAUTH_GOOGLE_HOSTED_DOMAIN;
      config.oauth.providers.google.prompt =
        (process.env.MCP_OAUTH_GOOGLE_PROMPT as any) || 'consent';
    }

    // JWT config
    config.oauth.jwt.secret = process.env.MCP_OAUTH_JWT_SECRET || config.oauth.jwt.secret;
    config.oauth.jwt.issuer = process.env.MCP_OAUTH_JWT_ISSUER || config.oauth.jwt.issuer;
    config.oauth.jwt.audience = process.env.MCP_OAUTH_JWT_AUDIENCE || config.oauth.jwt.audience;
    config.oauth.jwt.accessTokenExpiry = parseInt(
      process.env.MCP_OAUTH_JWT_ACCESS_EXPIRY || '3600',
      10,
    );
    config.oauth.jwt.refreshTokenExpiry = parseInt(
      process.env.MCP_OAUTH_JWT_REFRESH_EXPIRY || '2592000',
      10,
    );
    config.oauth.jwt.algorithm = (process.env.MCP_OAUTH_JWT_ALGORITHM as any) || 'HS256';
  }

  // User registry config
  if (config.userRegistry) {
    config.userRegistry.storagePath =
      process.env.MCP_USER_REGISTRY_PATH || config.userRegistry.storagePath;
    config.userRegistry.enableCustomRoles =
      process.env.MCP_USER_REGISTRY_ENABLE_CUSTOM_ROLES !== 'false';
    config.userRegistry.enableActivityLogging =
      process.env.MCP_USER_REGISTRY_ENABLE_ACTIVITY_LOGGING !== 'false';
    config.userRegistry.sessionTimeout = parseInt(
      process.env.MCP_USER_REGISTRY_SESSION_TIMEOUT || '3600',
      10,
    );
    config.userRegistry.maxSessionsPerUser = parseInt(
      process.env.MCP_USER_REGISTRY_MAX_SESSIONS || '5',
      10,
    );
    config.userRegistry.enableUserSearch = process.env.MCP_USER_REGISTRY_ENABLE_SEARCH !== 'false';
    config.userRegistry.defaultRole =
      (process.env.MCP_USER_REGISTRY_DEFAULT_ROLE as any) || config.userRegistry.defaultRole;
    config.userRegistry.autoActivateUsers = process.env.MCP_USER_REGISTRY_AUTO_ACTIVATE !== 'false';
  }

  return config;
}
