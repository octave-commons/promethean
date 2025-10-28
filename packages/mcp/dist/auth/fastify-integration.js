/**
 * OAuth Fastify Integration
 *
 * Integrates OAuth authentication system with Fastify HTTP transport
 * following security best practices and the project's functional programming style.
 */
import { OAuthSystem } from './oauth/index.js';
import { JwtTokenManager } from './oauth/jwt.js';
import { UserRegistry } from './users/registry.js';
import { OAuthIntegration } from './integration.js';
import { registerSimpleOAuthRoutes } from './oauth/simple-routes.js';
import { loadOAuthConfig, validateOAuthConfig, getOAuthConfigSummary } from './config.js';
/**
 * OAuth Fastify integration
 */
export class OAuthFastifyIntegration {
    oauthSystem;
    jwtManager;
    userRegistry;
    oauthIntegration;
    authManager;
    config;
    constructor(authManager) {
        this.authManager = authManager;
    }
    /**
     * Initialize OAuth system and register routes
     */
    async initialize(fastify, options = {}) {
        try {
            // Check if OAuth is enabled
            if (!options.enableOAuth) {
                console.log('[OAuthFastify] OAuth is disabled, skipping initialization');
                return; // Exit early without setting up OAuth
            }
            // Load configuration
            this.config = loadOAuthConfig();
            // Check if OAuth has providers configured
            const hasProviders = Object.values(this.config.oauth.providers).some((provider) => provider !== undefined);
            if (hasProviders) {
                // Only validate if we have providers configured
                validateOAuthConfig(this.config);
            }
            else {
                console.log('[OAuthFastify] No OAuth providers configured, skipping OAuth initialization');
                return; // Exit early without setting up OAuth
            }
            // Override HTTP config with options
            const httpConfig = {
                ...this.config.http,
                cookieDomain: options.cookieDomain || this.config.http.cookieDomain,
                secureCookies: options.secureCookies ?? this.config.http.secureCookies,
                sameSitePolicy: options.sameSitePolicy || this.config.http.sameSitePolicy,
            };
            // Initialize OAuth components
            this.jwtManager = new JwtTokenManager(this.config.jwt);
            this.oauthSystem = new OAuthSystem(this.config.oauth);
            this.userRegistry = new UserRegistry(this.config.userRegistry);
            this.oauthIntegration = new OAuthIntegration(this.config.integration, this.oauthSystem, this.jwtManager, this.userRegistry, this.authManager);
            // Create route configuration
            const routeConfig = {
                basePath: httpConfig.basePath,
                oauthSystem: this.oauthSystem,
                oauthIntegration: this.oauthIntegration,
                jwtManager: this.jwtManager,
                userRegistry: this.userRegistry,
                authManager: this.authManager,
                cookieDomain: httpConfig.cookieDomain,
                secureCookies: httpConfig.secureCookies,
                sameSitePolicy: httpConfig.sameSitePolicy,
            };
            // Register OAuth routes
            registerSimpleOAuthRoutes(fastify, routeConfig);
            // Register authentication middleware
            this.registerAuthMiddleware(fastify);
            // Log configuration summary
            const summary = getOAuthConfigSummary(this.config);
            console.log('[OAuthFastify] OAuth system initialized successfully');
            console.log('[OAuthFastify] Configuration:', JSON.stringify(summary, null, 2));
        }
        catch (error) {
            console.error('[OAuthFastify] Failed to initialize OAuth system:', error);
            throw error;
        }
    }
    /**
     * Register authentication middleware for protected routes
     */
    registerAuthMiddleware(fastify) {
        // JWT authentication middleware
        fastify.addHook('preHandler', async (request) => {
            // Skip OAuth routes and public routes
            if (this.isPublicRoute(request.url)) {
                return;
            }
            // Try to authenticate user
            const user = await this.oauthIntegration?.getCurrentUser(request);
            if (user) {
                // Store user in request context
                request.oauthUser = user;
                request.isAuthenticated = true;
            }
            else {
                // Check for guest access
                const authResult = this.authManager.authenticateRequest(request);
                if (authResult.success && authResult.userId === 'anonymous') {
                    request.oauthUser = null;
                    request.isAuthenticated = false;
                }
                else {
                    // No valid authentication
                    request.oauthUser = null;
                    request.isAuthenticated = false;
                }
            }
        });
        // Role-based access control middleware
        fastify.addHook('preHandler', async (request, reply) => {
            // Skip for public routes
            if (this.isPublicRoute(request.url)) {
                return;
            }
            const routeConfig = request.routeOptions.config;
            if (!routeConfig?.auth) {
                return; // No auth requirements
            }
            const authConfig = routeConfig.auth;
            const user = request.oauthUser;
            // Check if authentication is required
            if (authConfig.required && !user) {
                return reply.status(401).send({
                    error: 'Authentication required',
                    message: 'Please authenticate to access this resource',
                });
            }
            // Check role requirements
            if (authConfig.roles && user) {
                const hasRequiredRole = authConfig.roles.some((role) => user.role === role);
                if (!hasRequiredRole) {
                    return reply.status(403).send({
                        error: 'Insufficient privileges',
                        message: `Required roles: ${authConfig.roles.join(', ')}`,
                    });
                }
            }
            // Check provider requirements
            if (authConfig.providers && user) {
                const hasRequiredProvider = authConfig.providers.some((provider) => user.provider === provider);
                if (!hasRequiredProvider) {
                    return reply.status(403).send({
                        error: 'Provider not allowed',
                        message: `Required providers: ${authConfig.providers.join(', ')}`,
                    });
                }
            }
        });
    }
    /**
     * Check if route is public (doesn't require authentication)
     */
    isPublicRoute(url) {
        const publicRoutes = [
            '/healthz',
            '/auth/oauth/providers',
            '/auth/oauth/login',
            '/auth/oauth/callback',
            '/auth/oauth/health',
            '/ui',
            '/ui/assets',
        ];
        // Check exact matches
        if (publicRoutes.some((route) => url.startsWith(route))) {
            return true;
        }
        // Check for static assets
        if (url.includes('.') && url.includes('/')) {
            return true; // Likely a static file
        }
        return false;
    }
    /**
     * Get current OAuth system
     */
    getOAuthSystem() {
        return this.oauthSystem;
    }
    /**
     * Get current JWT manager
     */
    getJwtManager() {
        return this.jwtManager;
    }
    /**
     * Get current user registry
     */
    getUserRegistry() {
        return this.userRegistry;
    }
    /**
     * Get current OAuth integration
     */
    getOAuthIntegration() {
        return this.oauthIntegration;
    }
    /**
     * Get authentication middleware factory
     */
    createAuthMiddleware(options = {}) {
        return async (request, reply) => {
            const user = request.oauthUser;
            // Check if authentication is required
            if (options.required !== false && !user) {
                return reply.status(401).send({
                    error: 'Authentication required',
                    message: 'Please authenticate to access this resource',
                });
            }
            // Check role requirements
            if (options.roles && user) {
                const hasRequiredRole = options.roles.some((role) => user.role === role);
                if (!hasRequiredRole) {
                    return reply.status(403).send({
                        error: 'Insufficient privileges',
                        message: `Required roles: ${options.roles.join(', ')}`,
                    });
                }
            }
            // Check provider requirements
            if (options.providers && user) {
                const hasRequiredProvider = options.providers.some((provider) => user.provider === provider);
                if (!hasRequiredProvider) {
                    return reply.status(403).send({
                        error: 'Provider not allowed',
                        message: `Required providers: ${options.providers.join(', ')}`,
                    });
                }
            }
        };
    }
    /**
     * Get system statistics
     */
    async getStats() {
        if (!this.oauthSystem || !this.oauthIntegration) {
            return { error: 'OAuth system not initialized' };
        }
        const oauthStats = this.oauthSystem.getStats();
        const integrationStats = await this.oauthIntegration.getIntegrationStats();
        return {
            oauth: oauthStats,
            integration: integrationStats,
            timestamp: new Date().toISOString(),
        };
    }
    /**
     * Cleanup resources
     */
    async cleanup() {
        // Cleanup would be handled by individual components
        console.log('[OAuthFastify] OAuth system cleanup completed');
    }
}
/**
 * Helper function to create OAuth Fastify integration
 */
export function createOAuthFastifyIntegration(authManager) {
    return new OAuthFastifyIntegration(authManager);
}
/**
 * Helper function to register OAuth with Fastify
 */
export async function registerOAuthWithFastify(fastify, authManager, options = {}) {
    const integration = createOAuthFastifyIntegration(authManager);
    await integration.initialize(fastify, options);
    return integration;
}
//# sourceMappingURL=fastify-integration.js.map