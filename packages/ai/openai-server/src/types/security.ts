/**
 * Security-related type definitions for authentication and authorization
 */

export interface User {
  readonly id: string;
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
  readonly apiKey: string;
  readonly rateLimitOverride?: number;
  readonly createdAt: Date;
  readonly lastActive?: Date;
}

export interface JWTPayload {
  readonly sub: string; // user id
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
  readonly iat: number; // issued at
  readonly exp: number; // expiration
  readonly type: "access" | "refresh";
}

export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
}

export interface AuthConfig {
  readonly jwtSecret: string;
  readonly jwtExpiresIn: string;
  readonly refreshExpiresIn: string;
  readonly apiKeys: readonly string[];
  readonly bcryptRounds: number;
}

export interface RateLimitConfig {
  readonly global: { readonly max: number; readonly window: string };
  readonly user: { readonly max: number; readonly window: string };
  readonly endpoint: { readonly max: number; readonly window: string };
  readonly skipSuccessfulRequests: boolean;
  readonly skipFailedRequests: boolean;
}

export interface SecurityConfig {
  readonly auth: AuthConfig;
  readonly rateLimit: RateLimitConfig;
  readonly cors: {
    readonly origin: readonly string[];
    readonly credentials: boolean;
  };
  readonly headers: {
    readonly enabled: boolean;
    readonly contentSecurityPolicy?: string;
  };
  readonly validation: {
    readonly maxRequestSize: number;
    readonly allowedContentTypes: readonly string[];
  };
}

export interface SecurityContext {
  readonly user: User;
  readonly permissions: readonly string[];
  readonly rateLimitOverride?: number;
}

export interface AuthResult {
  readonly success: boolean;
  readonly user?: User;
  readonly error?: string;
  readonly statusCode: number;
}

export interface InputValidationResult {
  readonly isValid: boolean;
  readonly sanitizedData?: unknown;
  readonly errors?: readonly string[];
  readonly warnings?: readonly string[];
}

export interface SecurityHeaders {
  readonly "X-Content-Type-Options": "nosniff";
  readonly "X-Frame-Options": "DENY";
  readonly "X-XSS-Protection": "1; mode=block";
  readonly "Referrer-Policy": "strict-origin-when-cross-origin";
  readonly "Content-Security-Policy"?: string;
  readonly "Strict-Transport-Security"?: string;
}