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

      const oauthProvider = config.oauthSystem.getProvider(provider);
      if (!oauthProvider) {
        return reply.status(400).send({
          error: 'Invalid provider',
          message: `Provider '${provider}' is not supported`,
        });
      }

      // Generate PKCE verifier and challenge
      const { verifier, challenge } = await config.oauthSystem.generatePkcePair();

      // Store verifier in session or temporary storage
      const state = Math.random().toString(36).substring(2, 15);

      // Get authorization URL
      const authUrl = await oauthProvider.getAuthorizationUrl({
        state,
        codeChallenge: challenge,
        codeChallengeMethod: 'S256',
        redirectUri: `${getBaseUrl(request)}/auth/oauth/callback`,
      });

      // Store state and verifier (in a real implementation, use secure session storage)
      // For now, we'll use a simple in-memory store
      const tempStore = (global as any).__oauth_temp_store || {};
      tempStore[state] = { verifier, redirectTo };
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

      const { verifier, redirectTo } = storedData;

      // Clean up stored data
      delete tempStore[state];

      // Exchange code for tokens
      const provider = config.oauthSystem.getProvider('github'); // Default to GitHub for now
      if (!provider) {
        return reply.status(500).send({
          error: 'Provider not found',
          message: 'OAuth provider is not configured',
        });
      }

      const tokens = await provider.exchangeCodeForTokens(code, {
        verifier,
        redirectUri: `${getBaseUrl(request)}/auth/oauth/callback`,
      });

      // Get user profile
      const userProfile = await provider.getUserProfile(tokens.accessToken);

      // Create or update user
      const user = await config.userRegistry.findOrCreateUser({
        providerId: 'github',
        providerUserId: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        avatar: userProfile.avatar,
      });

      // Generate JWT tokens
      const accessToken = config.jwtManager.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = config.jwtManager.generateRefreshToken({
        userId: user.id,
        sessionId: user.sessionId,
      });

      // Set cookies manually
      const cookieOptions = getCookieOptions();

      reply.header('set-cookie', [
        `access_token=${accessToken}; ${cookieOptions}`,
        `refresh_token=${refreshToken}; ${cookieOptions}`,
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
      const payload = config.jwtManager.verifyToken(token);

      if (!payload) {
        return reply.status(401).send({
          error: 'Invalid token',
          message: 'JWT token is invalid or expired',
        });
      }

      const user = await config.userRegistry.findById(payload.userId);
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
          provider: user.providerId,
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
