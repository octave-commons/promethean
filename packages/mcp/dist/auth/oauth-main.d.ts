/**
 * OAuth Main Integration Module
 *
 * Complete OAuth authentication system integration with MCP
 * following security best practices and the project's functional programming style.
 */
import type { FastifyInstance } from 'fastify';
import { AuthenticationManager } from '../core/authentication.js';
import { OAuthFastifyIntegration } from './fastify-integration.js';
/**
 * OAuth system options
 */
export type OAuthSystemOptions = Readonly<{
    readonly enabled?: boolean;
    readonly configPath?: string;
    readonly cookieDomain?: string;
    readonly secureCookies?: boolean;
    readonly sameSitePolicy?: 'strict' | 'lax' | 'none';
    readonly autoRegisterRoutes?: boolean;
}>;
/**
 * OAuth system manager
 */
export declare class OAuthSystemManager {
    private fastifyIntegration?;
    private authManager;
    private options;
    private initialized;
    constructor(authManager: AuthenticationManager, options?: OAuthSystemOptions);
    /**
     * Initialize OAuth system
     */
    initialize(fastify: FastifyInstance): Promise<void>;
    /**
     * Check if OAuth system is initialized
     */
    isInitialized(): boolean;
    /**
     * Get OAuth system statistics
     */
    getStats(): Promise<Record<string, unknown>>;
    /**
     * Get OAuth system components
     */
    getComponents(): {
        oauthSystem: import("./oauth/index.js").OAuthSystem | undefined;
        jwtManager: import("./oauth/jwt.js").JwtTokenManager | undefined;
        userRegistry: import("./users/registry.js").UserRegistry | undefined;
        oauthIntegration: import("./integration.js").OAuthIntegration | undefined;
    } | null;
    /**
     * Create authentication middleware
     */
    createAuthMiddleware(options?: {
        required?: boolean;
        roles?: string[];
        providers?: string[];
    }): (request: import("fastify").FastifyRequest, reply: import("fastify").FastifyReply) => Promise<undefined>;
    /**
     * Cleanup OAuth system
     */
    cleanup(): Promise<void>;
}
/**
 * Initialize global OAuth system
 */
export declare function initializeOAuthSystem(authManager: AuthenticationManager, fastify: FastifyInstance, options?: OAuthSystemOptions): Promise<OAuthSystemManager>;
/**
 * Get global OAuth system manager
 */
export declare function getOAuthSystemManager(): OAuthSystemManager | null;
/**
 * Setup OAuth system with Fastify transport
 */
export declare function setupOAuthWithFastify(fastify: FastifyInstance, authManager: AuthenticationManager, options?: OAuthSystemOptions): Promise<OAuthFastifyIntegration>;
/**
 * OAuth system factory for easy integration
 */
export declare class OAuthSystemFactory {
    /**
     * Create OAuth system for MCP
     */
    static createForMCP(fastify: FastifyInstance, authManager: AuthenticationManager, options?: OAuthSystemOptions): Promise<OAuthSystemManager>;
    /**
     * Create OAuth system with custom configuration
     */
    static createWithConfig(fastify: FastifyInstance, authManager: AuthenticationManager, configPath: string, options?: OAuthSystemOptions): Promise<OAuthSystemManager>;
    /**
     * Check OAuth system health
     */
    static checkHealth(): Promise<{
        status: 'healthy' | 'degraded' | 'down';
        details: Record<string, unknown>;
    }>;
    /**
     * Get OAuth configuration template
     */
    static getConfigTemplate(): string;
}
/**
 * Export OAuth system for use in other modules
 */
export * from './config.js';
export * from './fastify-integration.js';
export * from './oauth/index.js';
export * from './oauth/routes.js';
export * from './oauth/jwt.js';
export * from './users/registry.js';
export * from './integration.js';
export * from './ui/oauth-login.js';
//# sourceMappingURL=oauth-main.d.ts.map