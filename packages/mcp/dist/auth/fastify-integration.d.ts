/**
 * OAuth Fastify Integration
 *
 * Integrates OAuth authentication system with Fastify HTTP transport
 * following security best practices and the project's functional programming style.
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { OAuthSystem } from './oauth/index.js';
import { JwtTokenManager } from './oauth/jwt.js';
import { UserRegistry } from './users/registry.js';
import { AuthenticationManager } from '../core/authentication.js';
import { OAuthIntegration } from './integration.js';
/**
 * OAuth Fastify integration options
 */
export type OAuthFastifyOptions = Readonly<{
    readonly enableOAuth?: boolean;
    readonly configPath?: string;
    readonly cookieDomain?: string;
    readonly secureCookies?: boolean;
    readonly sameSitePolicy?: 'strict' | 'lax' | 'none';
}>;
/**
 * OAuth Fastify integration
 */
export declare class OAuthFastifyIntegration {
    private oauthSystem?;
    private jwtManager?;
    private userRegistry?;
    private oauthIntegration?;
    private authManager;
    private config?;
    constructor(authManager: AuthenticationManager);
    /**
     * Initialize OAuth system and register routes
     */
    initialize(fastify: FastifyInstance, options?: OAuthFastifyOptions): Promise<void>;
    /**
     * Register authentication middleware for protected routes
     */
    private registerAuthMiddleware;
    /**
     * Check if route is public (doesn't require authentication)
     */
    private isPublicRoute;
    /**
     * Get current OAuth system
     */
    getOAuthSystem(): OAuthSystem | undefined;
    /**
     * Get current JWT manager
     */
    getJwtManager(): JwtTokenManager | undefined;
    /**
     * Get current user registry
     */
    getUserRegistry(): UserRegistry | undefined;
    /**
     * Get current OAuth integration
     */
    getOAuthIntegration(): OAuthIntegration | undefined;
    /**
     * Get authentication middleware factory
     */
    createAuthMiddleware(options?: {
        required?: boolean;
        roles?: string[];
        providers?: string[];
    }): (request: FastifyRequest, reply: FastifyReply) => Promise<undefined>;
    /**
     * Get system statistics
     */
    getStats(): Promise<Record<string, unknown>>;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
/**
 * Helper function to create OAuth Fastify integration
 */
export declare function createOAuthFastifyIntegration(authManager: AuthenticationManager): OAuthFastifyIntegration;
/**
 * Helper function to register OAuth with Fastify
 */
export declare function registerOAuthWithFastify(fastify: FastifyInstance, authManager: AuthenticationManager, options?: OAuthFastifyOptions): Promise<OAuthFastifyIntegration>;
//# sourceMappingURL=fastify-integration.d.ts.map