/**
 * OAuth HTTP Routes
 *
 * Complete OAuth 2.1 + PKCE flow implementation with HTTP endpoints
 * following security best practices and the project's functional programming style.
 */
/**
 * Register OAuth routes
 */
export function registerOAuthRoutes(fastify, config) {
    const { basePath, oauthSystem, oauthIntegration, jwtManager, userRegistry, authManager } = config;
    // Helper to set secure cookies
    const setAuthCookie = (reply, accessToken, refreshToken, sessionId) => {
        const cookieOptions = {
            path: '/',
            httpOnly: true,
            secure: config.secureCookies,
            sameSite: config.sameSitePolicy,
            domain: config.cookieDomain,
        };
        // Access token cookie (shorter lived)
        reply.setCookie('access_token', accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60, // 15 minutes
        });
        // Refresh token cookie (longer lived)
        reply.setCookie('refresh_token', refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });
        // Session ID cookie
        reply.setCookie('session_id', sessionId, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60, // 24 hours
        });
    };
    // Helper to clear auth cookies
    const clearAuthCookie = (reply) => {
        const cookieOptions = {
            path: '/',
            httpOnly: true,
            secure: config.secureCookies,
            sameSite: config.sameSitePolicy,
            domain: config.cookieDomain,
        };
        reply.clearCookie('access_token', cookieOptions);
        reply.clearCookie('refresh_token', cookieOptions);
        reply.clearCookie('session_id', cookieOptions);
    };
    // Helper to get client info from request
    const getClientInfo = (request) => ({
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        referer: request.headers.referer,
    });
    // Helper to create error response
    const createErrorResponse = (reply, statusCode, error, message, details) => {
        reply.status(statusCode).send({
            error,
            message,
            timestamp: new Date().toISOString(),
            ...(details && { details }),
        });
    };
    // Helper to create success response
    const createSuccessResponse = (reply, data) => {
        reply.send({
            success: true,
            timestamp: new Date().toISOString(),
            ...data,
        });
    };
    // Get available OAuth providers
    fastify.get(`${basePath}/providers`, async (request, reply) => {
        try {
            const providers = oauthSystem.getAvailableProviders();
            createSuccessResponse(reply, { providers });
        }
        catch (error) {
            createErrorResponse(reply, 500, 'internal_error', 'Failed to get providers', {
                error: error.message,
            });
        }
    });
    // Start OAuth flow
    fastify.post(`${basePath}/login`, async (request, reply) => {
        try {
            const { provider, redirectUri } = request.body;
            if (!provider) {
                return createErrorResponse(reply, 400, 'invalid_request', 'Provider is required');
            }
            if (!oauthSystem.isProviderAvailable(provider)) {
                return createErrorResponse(reply, 404, 'provider_not_found', `OAuth provider '${provider}' is not available`);
            }
            // Start OAuth flow
            const { authUrl, state } = oauthIntegration.startOAuthFlow(provider, redirectUri);
            // Store state in secure cookie for additional validation
            reply.setCookie('oauth_state', state, {
                path: `${basePath}`,
                httpOnly: true,
                secure: config.secureCookies,
                sameSite: config.sameSitePolicy,
                maxAge: 10 * 60, // 10 minutes
                domain: config.cookieDomain,
            });
            createSuccessResponse(reply, {
                provider,
                authUrl,
                state,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
            });
        }
        catch (error) {
            createErrorResponse(reply, 500, 'oauth_start_failed', 'Failed to start OAuth flow', {
                error: error.message,
            });
        }
    });
    // OAuth callback handler
    fastify.get(`${basePath}/callback`, async (request, reply) => {
        try {
            const { code, state, error, error_description } = request.query;
            const clientInfo = getClientInfo(request);
            // Validate state from cookie
            const cookieState = request.cookies.oauth_state;
            if (!state || !cookieState || state !== cookieState) {
                clearAuthCookie(reply);
                return createErrorResponse(reply, 400, 'invalid_state', 'Invalid or missing OAuth state');
            }
            // Clear state cookie
            reply.clearCookie('oauth_state', {
                path: `${basePath}`,
                domain: config.cookieDomain,
            });
            // Handle OAuth errors
            if (error) {
                return createErrorResponse(reply, 400, 'oauth_error', `OAuth authentication failed: ${error}`, { description: error_description });
            }
            if (!code) {
                return createErrorResponse(reply, 400, 'invalid_request', 'Authorization code is required');
            }
            // Handle OAuth callback
            const result = await oauthIntegration.handleOAuthCallback(code, state, undefined, request);
            if (!result.success) {
                return createErrorResponse(reply, 401, 'oauth_callback_failed', result.error || 'OAuth callback failed');
            }
            if (!result.tokens || !result.user) {
                return createErrorResponse(reply, 500, 'incomplete_response', 'OAuth authentication succeeded but tokens/user info missing');
            }
            // Set authentication cookies
            setAuthCookie(reply, result.tokens.accessToken, result.tokens.refreshToken, result.tokens.sessionId || '');
            // Log successful authentication
            console.log(`[OAuth] User ${result.user.username} (${result.user.id}) authenticated via ${result.user.provider}`);
            // Redirect to success page or return JSON
            const acceptHeader = request.headers.accept;
            if (acceptHeader?.includes('text/html')) {
                // Redirect for browser requests
                const redirectUrl = request.query.redirect_uri || '/';
                reply.redirect(302, redirectUrl);
            }
            else {
                // JSON response for API requests
                createSuccessResponse(reply, {
                    user: {
                        id: result.user.id,
                        username: result.user.username,
                        email: result.user.email,
                        name: result.user.name,
                        role: result.user.role,
                        provider: result.user.provider,
                        createdAt: result.user.createdAt,
                    },
                    tokens: {
                        accessToken: result.tokens.accessToken,
                        refreshToken: result.tokens.refreshToken,
                        expiresIn: result.tokens.expiresIn,
                        tokenType: result.tokens.tokenType,
                    },
                });
            }
        }
        catch (error) {
            clearAuthCookie(reply);
            createErrorResponse(reply, 500, 'oauth_callback_error', 'OAuth callback failed', {
                error: error.message,
            });
        }
    });
    // Refresh OAuth tokens
    fastify.post(`${basePath}/refresh`, async (request, reply) => {
        try {
            const { refreshToken } = request.body;
            if (!refreshToken) {
                return createErrorResponse(reply, 400, 'invalid_request', 'Refresh token is required');
            }
            const result = await oauthIntegration.refreshOAuthTokens(refreshToken);
            if (!result.success) {
                return createErrorResponse(reply, 401, 'token_refresh_failed', result.error || 'Failed to refresh tokens');
            }
            if (!result.tokens) {
                return createErrorResponse(reply, 500, 'incomplete_response', 'Token refresh succeeded but tokens missing');
            }
            // Update access token cookie
            reply.setCookie('access_token', result.tokens.accessToken, {
                path: '/',
                httpOnly: true,
                secure: config.secureCookies,
                sameSite: config.sameSitePolicy,
                domain: config.cookieDomain,
                maxAge: 15 * 60, // 15 minutes
            });
            createSuccessResponse(reply, {
                tokens: {
                    accessToken: result.tokens.accessToken,
                    refreshToken: result.tokens.refreshToken,
                    expiresIn: result.tokens.expiresIn,
                    tokenType: result.tokens.tokenType,
                },
            });
        }
        catch (error) {
            createErrorResponse(reply, 500, 'token_refresh_error', 'Token refresh failed', {
                error: error.message,
            });
        }
    });
    // Logout user
    fastify.post(`${basePath}/logout`, async (request, reply) => {
        try {
            const { sessionId, allSessions } = request.body;
            const clientInfo = getClientInfo(request);
            // Get current user from request
            const user = await oauthIntegration.getCurrentUser(request);
            if (!user) {
                clearAuthCookie(reply);
                return createSuccessResponse(reply, { message: 'Already logged out' });
            }
            // Logout user
            const success = await oauthIntegration.logout(user.id, allSessions ? undefined : sessionId);
            if (success) {
                console.log(`[OAuth] User ${user.username} (${user.id}) logged out`);
            }
            // Clear authentication cookies
            clearAuthCookie(reply);
            createSuccessResponse(reply, {
                message: 'Successfully logged out',
                allSessions: allSessions || false,
            });
        }
        catch (error) {
            createErrorResponse(reply, 500, 'logout_error', 'Logout failed', {
                error: error.message,
            });
        }
    });
    // Get current user info
    fastify.get(`${basePath}/me`, async (request, reply) => {
        try {
            const user = await oauthIntegration.getCurrentUser(request);
            if (!user) {
                return createErrorResponse(reply, 401, 'not_authenticated', 'User not authenticated');
            }
            // Get user sessions
            const sessions = await userRegistry.getUserSessions(user.id);
            createSuccessResponse(reply, {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    status: user.status,
                    authMethod: user.authMethod,
                    provider: user.provider,
                    createdAt: user.createdAt,
                    lastLoginAt: user.lastLoginAt,
                    metadata: user.metadata,
                },
                sessions: sessions.map((session) => ({
                    sessionId: session.sessionId,
                    authMethod: session.authMethod,
                    provider: session.provider,
                    ipAddress: session.ipAddress,
                    userAgent: session.userAgent,
                    createdAt: session.createdAt,
                    lastAccessAt: session.lastAccessAt,
                    expiresAt: session.expiresAt,
                })),
            });
        }
        catch (error) {
            createErrorResponse(reply, 500, 'user_info_error', 'Failed to get user info', {
                error: error.message,
            });
        }
    });
    // Get OAuth system statistics
    fastify.get(`${basePath}/stats`, async (request, reply) => {
        try {
            const oauthStats = oauthSystem.getStats();
            const integrationStats = await oauthIntegration.getIntegrationStats();
            createSuccessResponse(reply, {
                oauth: oauthStats,
                integration: integrationStats,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            createErrorResponse(reply, 500, 'stats_error', 'Failed to get statistics', {
                error: error.message,
            });
        }
    });
    // Revoke specific session
    fastify.delete(`${basePath}/sessions/:sessionId`, async (request, reply) => {
        try {
            const { sessionId } = request.params;
            const user = await oauthIntegration.getCurrentUser(request);
            if (!user) {
                return createErrorResponse(reply, 401, 'not_authenticated', 'User not authenticated');
            }
            // Get session to verify ownership
            const session = await userRegistry.getSession(sessionId);
            if (!session || session.userId !== user.id) {
                return createErrorResponse(reply, 404, 'session_not_found', 'Session not found or access denied');
            }
            // Revoke session
            const revoked = await userRegistry.revokeSession(sessionId);
            await oauthSystem.revokeSession(sessionId);
            if (revoked) {
                createSuccessResponse(reply, {
                    message: 'Session revoked successfully',
                    sessionId,
                });
            }
            else {
                createErrorResponse(reply, 500, 'revoke_failed', 'Failed to revoke session');
            }
        }
        catch (error) {
            createErrorResponse(reply, 500, 'session_revoke_error', 'Failed to revoke session', {
                error: error.message,
            });
        }
    });
    // Health check for OAuth system
    fastify.get(`${basePath}/health`, async (request, reply) => {
        try {
            const stats = oauthSystem.getStats();
            const isHealthy = stats.providers.length > 0;
            createSuccessResponse(reply, {
                status: isHealthy ? 'healthy' : 'degraded',
                providers: stats.providers,
                activeStates: stats.activeStates,
                activeSessions: stats.activeSessions,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            createErrorResponse(reply, 500, 'health_check_failed', 'Health check failed', {
                error: error.message,
            });
        }
    });
    console.log(`[OAuth] Routes registered at ${basePath}`);
}
//# sourceMappingURL=routes.js.map