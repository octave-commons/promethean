/**
 * OAuth System Type Definitions
 *
 * Core types for OAuth 2.1 + PKCE implementation
 * following the project's functional programming style.
 */

/**
 * Base OAuth configuration
 */
export type OAuthConfig = Readonly<{
  readonly redirectUri: string;
  readonly stateTimeout?: number; // State validity in seconds
}>;

/**
 * OAuth token response
 */
export type OAuthTokenResponse = Readonly<{
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly tokenType: string;
  readonly expiresIn?: number;
  readonly scope?: string;
  readonly idToken?: string; // For OpenID Connect
  readonly raw: Record<string, unknown>;
}>;

/**
 * OAuth user information
 */
export type OAuthUserInfo = Readonly<{
  readonly id: string;
  readonly username?: string;
  readonly email?: string;
  readonly name?: string;
  readonly avatar?: string;
  readonly provider: string;
  readonly raw: Record<string, unknown>;
  readonly metadata?: Record<string, unknown>;
}>;

/**
 * OAuth provider interface
 */
export type OAuthProvider = Readonly<{
  /**
   * Get the provider name
   */
  getProviderName(): string;

  /**
   * Generate authorization URL with PKCE
   */
  generateAuthUrl(state: string, codeVerifier: string): string;

  /**
   * Exchange authorization code for tokens
   */
  exchangeCodeForTokens(code: string, codeVerifier: string): Promise<OAuthTokenResponse>;

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
}>;

/**
 * OAuth state information for PKCE flow
 */
export type OAuthState = Readonly<{
  readonly state: string;
  readonly codeVerifier: string;
  readonly provider: string;
  readonly redirectUri: string;
  readonly createdAt: Date;
  readonly expiresAt: Date;
  readonly metadata?: Record<string, unknown>;
}>;

/**
 * OAuth session information
 */
export type OAuthSession = Readonly<{
  readonly sessionId: string;
  readonly userId: string;
  readonly provider: string;
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly tokenExpiresAt?: Date;
  readonly createdAt: Date;
  readonly lastAccessAt: Date;
  readonly metadata?: Record<string, unknown>;
}>;

/**
 * OAuth error types
 */
export type OAuthErrorType = 
  | 'invalid_request'
  | 'unauthorized_client'
  | 'access_denied'
  | 'unsupported_response_type'
  | 'invalid_scope'
  | 'server_error'
  | 'temporarily_unavailable'
  | 'invalid_state'
  | 'invalid_code_verifier'
  | 'token_exchange_failed'
  | 'user_info_failed';

/**
 * OAuth error
 */
export type OAuthError = Readonly<{
  readonly type: OAuthErrorType;
  readonly message: string;
  readonly provider?: string;
  readonly details?: Record<string, unknown>;
}>;

/**
 * OAuth provider configuration
 */
export type OAuthProviderConfig = Readonly<{
  readonly github?: {
    readonly clientId: string;
    readonly clientSecret: string;
    readonly scopes?: readonly string[];
    readonly allowSignup?: boolean;
  };
  readonly google?: {
    readonly clientId: string;
    readonly clientSecret: string;
    readonly scopes?: readonly string[];
    readonly hostedDomain?: string;
    readonly prompt?: 'consent' | 'none' | 'select_account';
  };
}>;

/**
 * OAuth configuration for the entire system
 */
export type OAuthSystemConfig = Readonly<{
  readonly providers: OAuthProviderConfig;
  readonly redirectUri: string;
  readonly stateTimeout: number; // seconds
  readonly sessionTimeout: number; // seconds
  readonly tokenRefreshThreshold: number; // seconds before expiry to refresh
  readonly enableRefreshTokens: boolean;
}>;