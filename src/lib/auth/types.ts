export type PlanType = "free" | "plus" | "pro" | "team" | "business" | "enterprise" | "unknown";

export interface AccountInfo {
  readonly providerId: string;
  readonly accountId: string;
  readonly planType: PlanType;
  readonly authType: "api_key" | "oauth_bearer" | "local";
  readonly isExpired?: boolean;
  readonly isRateLimited?: boolean;
  readonly rateLimitExpiresAt?: number;
}

export interface GitHubUser {
  readonly id: number;
  readonly login: string;
  readonly name?: string;
  readonly email?: string;
  readonly avatarUrl?: string;
}

export interface AuthSession {
  readonly id: string;
  readonly subject: string;
  readonly clientId: string;
  readonly scopes: readonly string[];
  readonly resource?: string;
  readonly extra?: Record<string, unknown>;
  readonly createdAt: number;
  readonly expiresAt: number;
}

export interface AccessToken {
  readonly token: string;
  readonly clientId: string;
  readonly subject: string;
  readonly scopes: readonly string[];
  readonly resource?: string;
  readonly extra?: Record<string, unknown>;
  readonly expiresAt: number;
}

export interface RefreshToken {
  readonly token: string;
  readonly clientId: string;
  readonly subject: string;
  readonly scopes: readonly string[];
  readonly resource?: string;
  readonly extra?: Record<string, unknown>;
  readonly expiresAt: number;
}

export interface OAuthClient {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly clientName: string;
  readonly redirectUris: readonly string[];
  readonly tokenEndpointAuthMethod: string;
  readonly grantTypes: readonly string[];
  readonly responseTypes: readonly string[];
}

export interface GitHubOAuthConfig {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly updatedAt: string;
}