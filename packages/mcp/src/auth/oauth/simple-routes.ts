/**
 * Simple OAuth Routes
 *
 * Simplified OAuth implementation that works with current Fastify setup
 */

import type { FastifyInstance, FastifyRequest } from 'fastify';
import { OAuthSystem } from './index.js';
import { OAuthIntegration } from '../integration.js';
import { JwtTokenManager } from './jwt.js';
import { UserRegistry } from '../users/registry.js';
import { AuthenticationManager } from '../../core/authentication.js';
import type { OAuthUserInfo } from './types.js';

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
export function registerSimpleOAuthRoutes(
  fastify: FastifyInstance,
  config: SimpleOAuthRouteConfig,
): void {
  const basePath = '/auth/oauth';

  // Health check endpoint
  fastify.get(`${basePath}/health`, async (_request, reply) => {
    return reply.send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      oauth: config.oauthSystem ? 'enabled' : 'disabled',
    });
  });

  // List available providers
  fastify.get(`${basePath}/providers`, async (_request, reply) => {
    try {
      const providers = config.oauthSystem.getAvailableProviders();
      return reply.send({
        providers: providers.map((p) => ({
          id: p,
          name: p.charAt(0).toUpperCase() + p.slice(1),
          enabled: config.oauthSystem.isProviderAvailable(p),
        })),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to get providers',
        message: String(error),
      });
    }
  });

  // Initiate OAuth login
  fastify.post(`${basePath}/login`, async (request, reply) => {
    try {
      const body = request.body as any;
      const { provider, redirectTo } = body;

      if (!provider) {
        return reply.status(400).send({
          error: 'Missing provider',
          message: 'Provider is required',
        });
      }

      if (!config.oauthSystem.isProviderAvailable(provider)) {
        return reply.status(400).send({
          error: 'Invalid provider',
          message: `Provider '${provider}' is not supported`,
        });
      }

      // Start OAuth flow with the OAuthSystem
      const { authUrl, state } = config.oauthSystem.startOAuthFlow(
        provider,
        `${getBaseUrl(request)}/auth/oauth/callback`,
      );

      // Store redirect URL (in a real implementation, use secure session storage)
      const tempStore = (global as any).__oauth_temp_store || {};
      tempStore[state] = { redirectTo };
      (global as any).__oauth_temp_store = tempStore;

      return reply.status(302).header('Location', authUrl).send();
    } catch (error) {
      return reply.status(500).send({
        error: 'OAuth login failed',
        message: String(error),
      });
    }
  });

  // OAuth callback
  fastify.get(`${basePath}/callback`, async (request, reply) => {
    try {
      const query = request.query as any;
      const { code, state, error } = query;

      if (error) {
        return reply.status(400).send({
          error: 'OAuth error',
          message: error,
        });
      }

      if (!code || !state) {
        return reply.status(400).send({
          error: 'Missing parameters',
          message: 'Authorization code and state are required',
        });
      }

      // Retrieve stored data
      const tempStore = (global as any).__oauth_temp_store || {};
      const storedData = tempStore[state];

      if (!storedData) {
        return reply.status(400).send({
          error: 'Invalid state',
          message: 'OAuth state is invalid or expired',
        });
      }

      const { redirectTo } = storedData;

      // Clean up stored data
      delete tempStore[state];

      // Handle OAuth callback with OAuthSystem
      const result = await config.oauthSystem.handleOAuthCallback(code, state, error);

      if (!result.success) {
        return reply.status(400).send({
          error: result.error?.type || 'OAuth callback failed',
          message: result.error?.message || 'Unknown OAuth error',
        });
      }

      // Get OAuth session
      const oauthSession = config.oauthSystem.getSession(result.userId!);
      if (!oauthSession) {
        return reply.status(500).send({
          error: 'Session creation failed',
          message: 'Failed to create OAuth session',
        });
      }

      // Create user info for JWT
      const userInfo: OAuthUserInfo = {
        id: result.userId!,
        provider: oauthSession.provider,
        username: `${oauthSession.provider}_${result.userId}`,
        email: `${result.userId}@${oauthSession.provider}.local`,
        name: `${oauthSession.provider} User`,
        avatar: '',
        raw: {}, // Raw provider data
        metadata: {},
      };

      // Check if user exists, create if not
      let user = await config.userRegistry.getUserByProvider(oauthSession.provider, result.userId!);
      if (!user) {
        // Create new user
        user = await config.userRegistry.createUser({
          username: `${oauthSession.provider}_${result.userId}`,
          email: `${result.userId}@${oauthSession.provider}.local`,
          name: `${oauthSession.provider} User`,
          role: 'user',
          authMethod: 'oauth',
          provider: oauthSession.provider,
          providerUserId: result.userId!,
        });
      }

      // Generate JWT tokens
      const tokenPair = config.jwtManager.generateTokenPair(
        userInfo,
        oauthSession.sessionId,
        oauthSession,
      );

      // Set cookies manually
      const cookieOptions = getCookieOptions();

      reply.header('set-cookie', [
        `access_token=${tokenPair.accessToken}; ${cookieOptions}`,
        `refresh_token=${tokenPair.refreshToken}; ${cookieOptions}`,
        `user_id=${user.id}; ${cookieOptions}`,
      ]);

      // Redirect to original destination or default
      const redirectUrl = redirectTo || '/ui';
      return reply.status(302).header('Location', redirectUrl).send();
    } catch (error) {
      return reply.status(500).send({
        error: 'OAuth callback failed',
        message: String(error),
      });
    }
  });

  // Get current user
  fastify.get(`${basePath}/me`, async (request, reply) => {
    try {
      const authHeader = request.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({
          error: 'No token provided',
          message: 'Authorization header is required',
        });
      }

      const token = authHeader.substring(7);
      const payload = config.jwtManager.validateAccessToken(token);

      if (!payload) {
        return reply.status(401).send({
          error: 'Invalid token',
          message: 'JWT token is invalid or expired',
        });
      }

      const user = await config.userRegistry.getUser(payload.sub);
      if (!user) {
        return reply.status(404).send({
          error: 'User not found',
          message: 'User associated with token not found',
        });
      }

      return reply.send({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          provider: user.provider,
          createdAt: user.createdAt,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to get user',
        message: String(error),
      });
    }
  });

  // Logout
  fastify.post(`${basePath}/logout`, async (_request, reply) => {
    // Clear cookies
    const cookieOptions = getCookieOptions();

    reply.header('set-cookie', [
      `access_token=; ${cookieOptions}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
      `refresh_token=; ${cookieOptions}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
      `user_id=; ${cookieOptions}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
    ]);

    return reply.send({
      message: 'Logged out successfully',
      timestamp: new Date().toISOString(),
    });
  });
}

/**
 * Get base URL from request
 */
function getBaseUrl(request: FastifyRequest): string {
  const protocol = request.protocol;
  const host = request.headers.host || 'localhost';
  return `${protocol}://${host}`;
}

/**
 * Get cookie options
 */
function getCookieOptions(): string {
  const isSecure = process.env.NODE_ENV === 'production';
  const domain = process.env.OAUTH_COOKIE_DOMAIN;

  const options = ['Path=/', 'HttpOnly', isSecure ? 'Secure' : '', 'SameSite=Lax'];

  if (domain) {
    options.push(`Domain=${domain}`);
  }

  return options.filter(Boolean).join('; ');
}
