/**
 * OAuth HTTP Routes
 *
 * Complete OAuth 2.1 + PKCE flow implementation with HTTP endpoints
 * following security best practices and the project's functional programming style.
 */
import type { FastifyInstance } from 'fastify';
import { OAuthSystem } from './index.js';
import { OAuthIntegration } from '../integration.js';
import { JwtTokenManager } from './jwt.js';
import { UserRegistry } from '../users/registry.js';
import { AuthenticationManager } from '../../core/authentication.js';
/**
 * OAuth route configuration
 */
export type OAuthRouteConfig = Readonly<{
    readonly basePath: string;
    readonly oauthSystem: OAuthSystem;
    readonly oauthIntegration: OAuthIntegration;
    readonly jwtManager: JwtTokenManager;
    readonly userRegistry: UserRegistry;
    readonly authManager: AuthenticationManager;
    readonly cookieDomain?: string;
    readonly secureCookies: boolean;
    readonly sameSitePolicy: 'strict' | 'lax' | 'none';
}>;
/**
 * Register OAuth routes
 */
export declare function registerOAuthRoutes(fastify: FastifyInstance, config: OAuthRouteConfig): void;
//# sourceMappingURL=routes.d.ts.map