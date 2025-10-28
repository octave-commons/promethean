/**
 * Simple OAuth Routes
 *
 * Simplified OAuth implementation that works with current Fastify setup
 */
import type { FastifyInstance } from 'fastify';
import { OAuthSystem } from './index.js';
import { OAuthIntegration } from '../integration.js';
import { JwtTokenManager } from './jwt.js';
import { UserRegistry } from '../users/registry.js';
import { AuthenticationManager } from '../../core/authentication.js';
/**
 * Simple OAuth route configuration
 */
export type SimpleOAuthRouteConfig = Readonly<{
    readonly oauthSystem: OAuthSystem;
    readonly oauthIntegration: OAuthIntegration;
    readonly jwtManager: JwtTokenManager;
    readonly userRegistry: UserRegistry;
    readonly authManager: AuthenticationManager;
}>;
/**
 * Register simple OAuth routes
 */
export declare function registerSimpleOAuthRoutes(fastify: FastifyInstance, config: SimpleOAuthRouteConfig): void;
//# sourceMappingURL=simple-routes.d.ts.map