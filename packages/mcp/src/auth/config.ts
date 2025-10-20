/**
 * OAuth Configuration Loader
 *
 * Loads and validates OAuth configuration from environment variables
 * following security best practices and the project's functional programming style.
 */

import crypto from 'node:crypto';
import type {
  OAuthSystemConfig,
  JwtTokenConfig,
  UserRegistryConfig,
  OAuthIntegrationConfig,
} from './types.js';
import type { UserRole } from '../core/authorization.js';

/**
 * Complete OAuth configuration
 */
export type OAuthConfig = Readonly<{
  readonly oauth: OAuthSystemConfig;
  readonly jwt: JwtTokenConfig;
  readonly userRegistry: UserRegistryConfig;
  readonly integration: OAuthIntegrationConfig;
  readonly http: {
    readonly basePath: string;
    readonly cookieDomain?: string;
    readonly secureCookies: boolean;
    readonly sameSitePolicy: 'strict' | 'lax' | 'none';
  };
}>;

/**
 * Load OAuth configuration from environment variables
 */
export function loadOAuthConfig(): OAuthConfig {
  // OAuth System Configuration
  const oauthConfig: OAuthSystemConfig = {
    providers: {
      github: loadGitHubProviderConfig(),
      google: loadGoogleProviderConfig(),
    },
    redirectUri: getRequiredEnv('OAUTH_REDIRECT_URI', 'http://localhost:3210/auth/oauth/callback'),
    stateTimeout: parseInt(getEnv('OAUTH_STATE_TIMEOUT', '600'), 10), // 10 minutes
    sessionTimeout: parseInt(getEnv('OAUTH_SESSION_TIMEOUT', '86400'), 10), // 24 hours
    tokenRefreshThreshold: parseInt(getEnv('OAUTH_TOKEN_REFRESH_THRESHOLD', '300'), 10), // 5 minutes
    enableRefreshTokens: getEnv('OAUTH_ENABLE_REFRESH_TOKENS', 'true') === 'true',
  };

  // JWT Configuration
  const jwtConfig: JwtTokenConfig = {
    secret: getRequiredEnv('OAUTH_JWT_SECRET', crypto.randomBytes(64).toString('hex')),
    issuer: getEnv('OAUTH_JWT_ISSUER', 'promethean-mcp'),
    audience: getEnv('OAUTH_JWT_AUDIENCE', 'promethean-mcp-clients'),
    accessTokenExpiry: parseInt(getEnv('OAUTH_JWT_ACCESS_EXPIRY', '900'), 10), // 15 minutes
    refreshTokenExpiry: parseInt(getEnv('OAUTH_JWT_REFRESH_EXPIRY', '604800'), 10), // 7 days
    algorithm: getEnv('OAUTH_JWT_ALGORITHM', 'HS256') as any,
  };

  // User Registry Configuration
  const userRegistryConfig: UserRegistryConfig = {
    storagePath: getEnv('USER_REGISTRY_STORAGE_PATH', './data/users'),
    enableCustomRoles: getEnv('USER_REGISTRY_ENABLE_CUSTOM_ROLES', 'true') === 'true',
    enableActivityLogging: getEnv('USER_REGISTRY_ENABLE_ACTIVITY_LOGGING', 'true') === 'true',
    sessionTimeout: parseInt(getEnv('USER_REGISTRY_SESSION_TIMEOUT', '86400'), 10), // 24 hours
    maxSessionsPerUser: parseInt(getEnv('USER_REGISTRY_MAX_SESSIONS_PER_USER', '5'), 10),
    enableUserSearch: getEnv('USER_REGISTRY_ENABLE_USER_SEARCH', 'true') === 'true',
    defaultRole: getEnv('USER_REGISTRY_DEFAULT_ROLE', 'user') as UserRole,
    autoActivateUsers: getEnv('USER_REGISTRY_AUTO_ACTIVATE_USERS', 'true') === 'true',
  };

  // OAuth Integration Configuration
  const integrationConfig: OAuthIntegrationConfig = {
    autoCreateUsers: getEnv('OAUTH_AUTO_CREATE_USERS', 'true') === 'true',
    defaultRole: getEnv('OAUTH_DEFAULT_ROLE', 'user') as UserRole,
    trustedProviders: getEnv('OAUTH_TRUSTED_PROVIDERS', 'github,google')
      .split(',')
      .map((p) => p.trim()),
    enableUserSync: getEnv('OAUTH_ENABLE_USER_SYNC', 'true') === 'true',
    syncInterval: parseInt(getEnv('OAUTH_SYNC_INTERVAL', '3600'), 10), // 1 hour
    sessionTimeout: parseInt(getEnv('OAUTH_INTEGRATION_SESSION_TIMEOUT', '86400'), 10), // 24 hours
  };

  // HTTP Configuration
  const httpConfig = {
    basePath: getEnv('OAUTH_BASE_PATH', '/auth/oauth'),
    cookieDomain: getEnv('OAUTH_COOKIE_DOMAIN'),
    secureCookies: getEnv('OAUTH_SECURE_COOKIES', 'false') === 'true',
    sameSitePolicy: getEnv('OAUTH_SAME_SITE_POLICY', 'lax') as 'strict' | 'lax' | 'none',
  };

  return {
    oauth: oauthConfig,
    jwt: jwtConfig,
    userRegistry: userRegistryConfig,
    integration: integrationConfig,
    http: httpConfig,
  };
}

/**
 * Load GitHub OAuth provider configuration
 */
function loadGitHubProviderConfig() {
  const clientId = getEnv('OAUTH_GITHUB_CLIENT_ID');
  const clientSecret = getEnv('OAUTH_GITHUB_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    console.warn('[OAuthConfig] GitHub OAuth credentials not provided, GitHub provider disabled');
    return undefined;
  }

  return {
    clientId,
    clientSecret,
    scopes: getEnv('OAUTH_GITHUB_SCOPES', 'user:email')
      .split(',')
      .map((s) => s.trim()),
    allowSignup: getEnv('OAUTH_GITHUB_ALLOW_SIGNUP', 'true') === 'true',
  };
}

/**
 * Load Google OAuth provider configuration
 */
function loadGoogleProviderConfig() {
  const clientId = getEnv('OAUTH_GOOGLE_CLIENT_ID');
  const clientSecret = getEnv('OAUTH_GOOGLE_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    console.warn('[OAuthConfig] Google OAuth credentials not provided, Google provider disabled');
    return undefined;
  }

  return {
    clientId,
    clientSecret,
    scopes: getEnv('OAUTH_GOOGLE_SCOPES', 'openid,email,profile')
      .split(',')
      .map((s) => s.trim()),
    hostedDomain: getEnv('OAUTH_GOOGLE_HOSTED_DOMAIN'),
    prompt: getEnv('OAUTH_GOOGLE_PROMPT', 'consent') as 'consent' | 'none' | 'select_account',
  };
}

/**
 * Get environment variable with default value
 */
function getEnv(key: string, defaultValue: string = ''): string {
  const value = process.env[key];
  return value || defaultValue;
}

/**
 * Get required environment variable or throw error
 */
function getRequiredEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value) {
    return value;
  }

  if (defaultValue !== undefined) {
    console.warn(`[OAuthConfig] Using default value for ${key}: ${defaultValue}`);
    return defaultValue;
  }

  throw new Error(`Required environment variable ${key} is not set`);
}

/**
 * Validate OAuth configuration
 */
export function validateOAuthConfig(config: OAuthConfig): void {
  // Validate OAuth system config
  if (!config.oauth.redirectUri) {
    throw new Error('OAuth redirect URI is required');
  }

  if (
    !config.oauth.redirectUri.startsWith('http://') &&
    !config.oauth.redirectUri.startsWith('https://')
  ) {
    throw new Error('OAuth redirect URI must be a valid URL');
  }

  if (config.oauth.stateTimeout <= 0) {
    throw new Error('OAuth state timeout must be positive');
  }

  if (config.oauth.sessionTimeout <= 0) {
    throw new Error('OAuth session timeout must be positive');
  }

  // Validate JWT config
  if (!config.jwt.secret || config.jwt.secret.length < 32) {
    throw new Error('JWT secret must be at least 32 characters long');
  }

  if (!config.jwt.issuer) {
    throw new Error('JWT issuer is required');
  }

  if (!config.jwt.audience) {
    throw new Error('JWT audience is required');
  }

  if (config.jwt.accessTokenExpiry <= 0) {
    throw new Error('JWT access token expiry must be positive');
  }

  if (config.jwt.refreshTokenExpiry <= 0) {
    throw new Error('JWT refresh token expiry must be positive');
  }

  // Validate user registry config
  if (!config.userRegistry.storagePath) {
    throw new Error('User registry storage path is required');
  }

  if (config.userRegistry.maxSessionsPerUser <= 0) {
    throw new Error('Max sessions per user must be positive');
  }

  // Validate integration config
  if (!config.integration.trustedProviders || config.integration.trustedProviders.length === 0) {
    throw new Error('At least one trusted OAuth provider is required');
  }

  if (config.integration.syncInterval <= 0) {
    throw new Error('OAuth sync interval must be positive');
  }

  // Validate HTTP config
  if (!config.http.basePath) {
    throw new Error('OAuth base path is required');
  }

  if (!config.http.basePath.startsWith('/')) {
    throw new Error('OAuth base path must start with /');
  }

  // Validate provider configurations
  const availableProviders = Object.keys(config.oauth.providers).filter(
    (key) => config.oauth.providers[key as keyof typeof config.oauth.providers] !== undefined,
  );

  if (availableProviders.length === 0) {
    throw new Error('At least one OAuth provider must be configured');
  }

  // Check if trusted providers match available providers
  // Filter trusted providers to only include available ones
  const validTrustedProviders = config.integration.trustedProviders.filter((provider) =>
    availableProviders.includes(provider),
  );

  if (validTrustedProviders.length === 0 && availableProviders.length > 0) {
    throw new Error(
      `No valid trusted providers configured. Available: ${availableProviders.join(', ')}, Trusted: ${config.integration.trustedProviders.join(', ')}`,
    );
  }

  // Update the trusted providers to only include valid ones
  (config.integration as any).trustedProviders = validTrustedProviders;

  console.log(`[OAuthConfig] Configuration validated successfully`);
  console.log(`[OAuthConfig] Available providers: ${availableProviders.join(', ')}`);
  console.log(`[OAuthConfig] Trusted providers: ${config.integration.trustedProviders.join(', ')}`);
  console.log(`[OAuthConfig] Base path: ${config.http.basePath}`);
  console.log(`[OAuthConfig] Redirect URI: ${config.oauth.redirectUri}`);
}

/**
 * Get OAuth configuration summary (for logging/debugging)
 */
export function getOAuthConfigSummary(config: OAuthConfig): Record<string, unknown> {
  const availableProviders = Object.keys(config.oauth.providers).filter(
    (key) => config.oauth.providers[key as keyof typeof config.oauth.providers] !== undefined,
  );

  return {
    providers: {
      available: availableProviders,
      trusted: config.integration.trustedProviders,
      redirectUri: config.oauth.redirectUri,
    },
    tokens: {
      accessTokenExpiry: config.jwt.accessTokenExpiry,
      refreshTokenExpiry: config.jwt.refreshTokenExpiry,
      algorithm: config.jwt.algorithm,
    },
    sessions: {
      timeout: config.oauth.sessionTimeout,
      maxPerUser: config.userRegistry.maxSessionsPerUser,
      autoCreateUsers: config.integration.autoCreateUsers,
    },
    http: {
      basePath: config.http.basePath,
      secureCookies: config.http.secureCookies,
      sameSitePolicy: config.http.sameSitePolicy,
    },
  };
}
