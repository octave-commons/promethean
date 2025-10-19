/**
 * Shared Authentication Types
 *
 * Type definitions used across the authentication system
 */

import type { UserRole } from '../core/authorization.js';

/**
 * OAuth system configuration
 */
export type OAuthSystemConfig = Readonly<{
  readonly providers: {
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
  };
  readonly redirectUri: string;
  readonly stateTimeout: number;
  readonly sessionTimeout: number;
  readonly tokenRefreshThreshold: number;
  readonly enableRefreshTokens: boolean;
}>;

/**
 * JWT token configuration
 */
export type JwtTokenConfig = Readonly<{
  readonly secret: string;
  readonly issuer: string;
  readonly audience: string;
  readonly accessTokenExpiry: number;
  readonly refreshTokenExpiry: number;
  readonly algorithm: 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512';
}>;

/**
 * User registry configuration
 */
export type UserRegistryConfig = Readonly<{
  readonly storagePath: string;
  readonly enableCustomRoles: boolean;
  readonly enableActivityLogging: boolean;
  readonly sessionTimeout: number;
  readonly maxSessionsPerUser: number;
  readonly enableUserSearch: boolean;
  readonly defaultRole: UserRole;
  readonly autoActivateUsers: boolean;
}>;

/**
 * OAuth integration configuration
 */
export type OAuthIntegrationConfig = Readonly<{
  readonly autoCreateUsers: boolean;
  readonly defaultRole: UserRole;
  readonly trustedProviders: readonly string[];
  readonly enableUserSync: boolean;
  readonly syncInterval: number;
  readonly sessionTimeout: number;
}>;
