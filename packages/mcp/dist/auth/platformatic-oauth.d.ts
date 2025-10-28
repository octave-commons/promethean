/**
 * Platformatic MCP OAuth Integration
 *
 * Replaces our custom OAuth implementation with Platformatic's battle-tested
 * Fastify-based MCP server that includes full OAuth 2.1 support.
 */
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { AuthenticationManager } from '../core/authentication.js';
/**
 * Platformatic OAuth configuration
 */
export type PlatformaticOAuthConfig = Readonly<{
    readonly enableOAuth?: boolean;
    readonly resourceUri?: string;
    readonly authorizationServers?: readonly string[];
    readonly clientId?: string;
    readonly clientSecret?: string;
    readonly scopes?: readonly string[];
    readonly jwksUri?: string;
    readonly introspectionEndpoint?: string;
}>;
/**
 * Platformatic MCP OAuth integration
 *
 * Uses Platformatic's production-ready MCP server with OAuth 2.1 support
 * instead of our custom implementation.
 */
export declare class PlatformaticOAuthIntegration {
    private authManager;
    private config?;
    constructor(authManager: AuthenticationManager);
    /**
     * Initialize Platformatic MCP server with OAuth
     */
    initialize(fastify: FastifyInstance, options?: PlatformaticOAuthConfig): Promise<void>;
    /**
     * Register OAuth routes on the Fastify instance
     */
    private registerOAuthRoutes;
    /**
     * Exchange authorization code for access tokens
     */
    private exchangeCodeForTokens;
    /**
     * Refresh access token using refresh token
     */
    private refreshAccessToken;
    /**
     * Get authentication info from request
     */
    getAuthInfo(request: FastifyRequest): any;
    /**
     * Check if request is authenticated
     */
    isAuthenticated(request: FastifyRequest): boolean;
    /**
     * Get user ID from authenticated request
     */
    getUserId(request: FastifyRequest): string | null;
    /**
     * Get user scopes from authenticated request
     */
    getUserScopes(request: FastifyRequest): readonly string[];
    /**
     * Check if user has required scopes
     */
    hasScopes(request: FastifyRequest, requiredScopes: readonly string[]): boolean;
    /**
     * Get system statistics
     */
    getStats(): Record<string, unknown>;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
/**
 * Helper function to create Platformatic OAuth integration
 */
export declare function createPlatformaticOAuthIntegration(authManager: AuthenticationManager): PlatformaticOAuthIntegration;
/**
 * Helper function to register Platformatic OAuth with Fastify
 */
export declare function registerPlatformaticOAuthWithFastify(fastify: FastifyInstance, authManager: AuthenticationManager, options?: PlatformaticOAuthConfig): Promise<PlatformaticOAuthIntegration>;
//# sourceMappingURL=platformatic-oauth.d.ts.map