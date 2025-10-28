/**
 * MCP Auth Library Fastify Adapter
 *
 * Adapts the Express-based mcp-auth library to work with Fastify
 * This provides a drop-in replacement for our custom OAuth implementation
 * using the battle-tested mcp-auth library.
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { AuthServerType } from 'mcp-auth';
/**
 * Fastify adapter configuration for MCP Auth
 */
export type McpAuthFastifyConfig = Readonly<{
    readonly resourceIdentifier: string;
    readonly authServerUrl: string;
    readonly authServerType?: AuthServerType;
    readonly scopesSupported?: readonly string[];
    readonly audience?: string;
}>;
/**
 * Fastify adapter for MCP Auth library
 *
 * This class wraps the Express-based mcp-auth library and provides
 * Fastify-compatible middleware and route handlers.
 */
export declare class McpAuthFastifyAdapter {
    private mcpAuth;
    private config;
    constructor(config: McpAuthFastifyConfig);
    /**
     * Initialize the MCP Auth system
     */
    initialize(): Promise<void>;
    /**
     * Register OAuth 2.0 Protected Resource Metadata endpoint
     *
     * This serves the RFC 9728 Protected Resource Metadata endpoint
     * that MCP clients use to discover authorization servers and supported scopes.
     */
    registerProtectedResourceMetadata(fastify: FastifyInstance): void;
    /**
     * Create Fastify middleware for Bearer token authentication
     *
     * This middleware validates JWT Bearer tokens against the configured
     * authorization server and populates request.auth with user information.
     */
    createBearerAuthMiddleware(options?: {
        requiredScopes?: readonly string[];
        audience?: string;
        showErrorDetails?: boolean;
    }): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    /**
     * Run Express-style middleware in Fastify context
     */
    private runExpressMiddleware;
    /**
     * Send standardized authentication error response
     */
    private sendAuthError;
    /**
     * Check if route is public (doesn't require authentication)
     */
    private isPublicRoute;
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
}
/**
 * Helper function to create MCP Auth Fastify adapter
 */
export declare function createMcpAuthFastifyAdapter(config: McpAuthFastifyConfig): McpAuthFastifyAdapter;
/**
 * Helper function to initialize MCP Auth with Fastify
 */
export declare function initializeMcpAuthWithFastify(fastify: FastifyInstance, config: McpAuthFastifyConfig): Promise<McpAuthFastifyAdapter>;
//# sourceMappingURL=mcp-auth-adapter.d.ts.map