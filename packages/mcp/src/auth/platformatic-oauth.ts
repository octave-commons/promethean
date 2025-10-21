/**
 * Platformatic MCP OAuth Integration
 *
 * Replaces our custom OAuth implementation with Platformatic's battle-tested
 * Fastify-based MCP server that includes full OAuth 2.1 support.
 */

import Fastify from 'fastify';
import mcpPlugin from '@platformatic/mcp';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { AuthenticationManager } from '../core/authentication.js';
import { loadOAuthConfig } from './config.js';

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
export class PlatformaticOAuthIntegration {
  private fastify?: FastifyInstance;
  private authManager: AuthenticationManager;
  private config?: PlatformaticOAuthConfig;
  private mcpApp?: FastifyInstance;

  constructor(authManager: AuthenticationManager) {
    this.authManager = authManager;
  }

  /**
   * Initialize Platformatic MCP server with OAuth
   */
  async initialize(fastify: FastifyInstance, options: PlatformaticOAuthConfig = {}): Promise<void> {
    try {
      this.fastify = fastify;
      this.config = options;

      // Check if OAuth is enabled
      if (!options.enableOAuth) {
        console.log('[PlatformaticOAuth] OAuth is disabled, skipping initialization');
        return;
      }

      // Load OAuth configuration
      const oauthConfig = loadOAuthConfig();

      // Use provided config or fall back to environment variables
      const config = {
        enableOAuth: true,
        resourceUri:
          options.resourceUri || process.env.MCP_RESOURCE_URI || oauthConfig?.resource?.uri,
        authorizationServers:
          options.authorizationServers ||
          [
            process.env.OAUTH_AUTH_SERVER ||
              oauthConfig?.oauth?.providers?.github?.authorizationUrl,
          ].filter(Boolean),
        clientId:
          options.clientId ||
          process.env.OAUTH_CLIENT_ID ||
          oauthConfig?.oauth?.providers?.github?.clientId,
        clientSecret:
          options.clientSecret ||
          process.env.OAUTH_CLIENT_SECRET ||
          oauthConfig?.oauth?.providers?.github?.clientSecret,
        scopes: options.scopes || ['read', 'write'],
        jwksUri: options.jwksUri || process.env.OAUTH_JWKS_URI,
        introspectionEndpoint:
          options.introspectionEndpoint || process.env.OAUTH_INTROSPECTION_ENDPOINT,
      };

      // Validate required configuration
      if (!config.resourceUri) {
        throw new Error('Resource URI is required for OAuth configuration');
      }
      if (!config.authorizationServers || config.authorizationServers.length === 0) {
        throw new Error('At least one authorization server is required');
      }
      if (!config.clientId || !config.clientSecret) {
        throw new Error('OAuth client ID and secret are required');
      }

      this.config = config;

      // Create a separate Fastify instance for the MCP server
      this.mcpApp = Fastify({
        logger: {
          level: process.env.MCP_LOG_LEVEL || 'info',
        },
      });

      // Register Platformatic MCP plugin with OAuth configuration
      await this.mcpApp.register(mcpPlugin, {
        serverInfo: {
          name: 'promethean-mcp-server',
          version: '1.0.0',
        },
        capabilities: {
          tools: { listChanged: true },
          resources: { subscribe: true },
          prompts: {},
        },
        enableSSE: true, // Enable Server-Sent Events for real-time communication
        authorization: {
          enabled: true,
          authorizationServers: config.authorizationServers,
          resourceUri: config.resourceUri,
          tokenValidation: {
            jwksUri: config.jwksUri,
            validateAudience: true,
          },
          oauth2Client: {
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            authorizationServer: config.authorizationServers[0],
            scopes: config.scopes,
            dynamicRegistration: true,
          },
        },
      });

      // Register OAuth routes on the main Fastify instance
      await this.registerOAuthRoutes(fastify);

      // Proxy MCP requests to the Platformatic MCP server
      await this.proxyMcpRequests(fastify);

      console.log('[PlatformaticOAuth] OAuth system initialized successfully');
      console.log('[PlatformaticOAuth] Resource URI:', config.resourceUri);
      console.log('[PlatformaticOAuth] Authorization Servers:', config.authorizationServers);
      console.log('[PlatformaticOAuth] Scopes:', config.scopes);
    } catch (error) {
      console.error('[PlatformaticOAuth] Failed to initialize OAuth system:', error);
      throw error;
    }
  }

  /**
   * Register OAuth routes on the main Fastify instance
   */
  private async registerOAuthRoutes(fastify: FastifyInstance): Promise<void> {
    if (!this.config) {
      throw new Error('OAuth configuration not loaded');
    }

    // OAuth authorization endpoint
    fastify.get('/auth/oauth/authorize', async (request, reply) => {
      try {
        const { redirect_uri, state, scope, response_type, code_challenge, code_challenge_method } =
          request.query as any;

        // Build authorization URL
        const authUrl = new URL(this.config.authorizationServers[0]);
        authUrl.searchParams.set('client_id', this.config!.clientId);
        authUrl.searchParams.set('redirect_uri', redirect_uri);
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('scope', scope || this.config!.scopes.join(' '));
        authUrl.searchParams.set('response_type', response_type || 'code');

        if (code_challenge) {
          authUrl.searchParams.set('code_challenge', code_challenge);
          authUrl.searchParams.set('code_challenge_method', code_challenge_method || 'S256');
        }

        // Redirect to authorization server
        return reply.redirect(302, authUrl.toString());
      } catch (error) {
        console.error('[PlatformaticOAuth] Authorization error:', error);
        return reply.status(500).send({
          error: 'authorization_failed',
          message: 'Failed to initiate OAuth flow',
        });
      }
    });

    // OAuth callback endpoint
    fastify.post('/auth/oauth/callback', async (request, reply) => {
      try {
        const { code, state, error } = request.query as any;

        if (error) {
          return reply.status(400).send({
            error: 'oauth_error',
            message: 'OAuth authorization failed',
            details: error,
          });
        }

        if (!code) {
          return reply.status(400).send({
            error: 'invalid_callback',
            message: 'Authorization code is required',
          });
        }

        // Exchange authorization code for tokens
        const tokenResponse = await this.exchangeCodeForTokens(code.toString());

        return reply.send({
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token,
          token_type: tokenResponse.token_type,
          expires_in: tokenResponse.expires_in,
          scope: tokenResponse.scope,
          state,
        });
      } catch (error) {
        console.error('[PlatformaticOAuth] Callback error:', error);
        return reply.status(500).send({
          error: 'callback_failed',
          message: 'Failed to process OAuth callback',
        });
      }
    });

    // Token refresh endpoint
    fastify.post('/auth/oauth/refresh', async (request, reply) => {
      try {
        const { refresh_token } = request.body as any;

        if (!refresh_token) {
          return reply.status(400).send({
            error: 'invalid_request',
            message: 'Refresh token is required',
          });
        }

        // Exchange refresh token for new access token
        const tokenResponse = await this.refreshAccessToken(refresh_token);

        return reply.send({
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token,
          token_type: tokenResponse.token_type,
          expires_in: tokenResponse.expires_in,
          scope: tokenResponse.scope,
        });
      } catch (error) {
        console.error('[PlatformaticOAuth] Refresh error:', error);
        return reply.status(500).send({
          error: 'refresh_failed',
          message: 'Failed to refresh access token',
        });
      }
    });

    // OAuth providers endpoint
    fastify.get('/auth/oauth/providers', async (_request, reply) => {
      return reply.send({
        providers: [
          {
            name: 'GitHub',
            authorizationUrl: this.config?.authorizationServers[0],
            scopes: this.config?.scopes || ['read', 'write'],
          },
        ],
        resourceUri: this.config?.resourceUri,
      });
    });

    // OAuth health endpoint
    fastify.get('/auth/oauth/health', async (_request, reply) => {
      return reply.send({
        status: 'healthy',
        oauth: {
          enabled: true,
          resourceUri: this.config?.resourceUri,
          authorizationServers: this.config?.authorizationServers,
          scopes: this.config?.scopes,
        },
        timestamp: new Date().toISOString(),
      });
    });

    console.log('[PlatformaticOAuth] OAuth routes registered successfully');
  }

  /**
   * Proxy MCP requests to the Platformatic MCP server
   */
  private async proxyMcpRequests(fastify: FastifyInstance): Promise<void> {
    if (!this.mcpApp) {
      throw new Error('MCP app not initialized');
    }

    // Proxy POST /mcp requests to Platformatic MCP server
    fastify.all('/mcp', async (request, reply) => {
      try {
        // Forward the request to the Platformatic MCP server
        const response = await this.mcpApp.inject({
          method: request.method,
          url: request.url,
          headers: request.headers,
          payload: request.body,
        });

        // Copy response headers and status
        reply.status(response.statusCode);
        for (const [key, value] of Object.entries(response.headers)) {
          reply.header(key, value as any);
        }

        // Send response body
        return reply.send(response.body);
      } catch (error) {
        console.error('[PlatformaticOAuth] MCP proxy error:', error);
        return reply.status(500).send({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'MCP request failed',
            data: String((error as Error)?.message ?? error),
          },
          id: null,
        });
      }
    });

    console.log('[PlatformaticOAuth] MCP proxy configured');
  }

  /**
   * Exchange authorization code for access tokens
   */
  private async exchangeCodeForTokens(code: string): Promise<any> {
    if (!this.config) {
      throw new Error('OAuth configuration not loaded');
    }

    const tokenUrl = `${this.config.authorizationServers[0]}/oauth/token`;

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: `${process.env.BASE_URL || 'http://localhost:3210'}/auth/oauth/callback`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(refreshToken: string): Promise<any> {
    if (!this.config) {
      throw new Error('OAuth configuration not loaded');
    }

    const tokenUrl = `${this.config.authorizationServers[0]}/oauth/token`;

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get authentication info from request
   */
  getAuthInfo(request: FastifyRequest): any {
    // Platformatic handles authentication internally
    // We can access auth info through the request context if needed
    return (request as any).authContext;
  }

  /**
   * Check if request is authenticated
   */
  isAuthenticated(request: FastifyRequest): boolean {
    // Check for valid Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    // Platformatic will validate the token, we just check presence
    return !!(request as any).authContext;
  }

  /**
   * Get user ID from authenticated request
   */
  getUserId(request: FastifyRequest): string | null {
    const authContext = (request as any).authContext;
    return authContext?.userId || null;
  }

  /**
   * Get user scopes from authenticated request
   */
  getUserScopes(request: FastifyRequest): readonly string[] {
    const authContext = (request as any).authContext;
    return authContext?.scopes || [];
  }

  /**
   * Check if user has required scopes
   */
  hasScopes(request: FastifyRequest, requiredScopes: readonly string[]): boolean {
    const userScopes = this.getUserScopes(request);
    return requiredScopes.every((scope) => userScopes.includes(scope));
  }

  /**
   * Get system statistics
   */
  getStats(): Record<string, unknown> {
    return {
      adapter: 'platformatic-mcp',
      oauth: {
        enabled: this.config?.enableOAuth ?? false,
        resourceUri: this.config?.resourceUri,
        authorizationServers: this.config?.authorizationServers,
        scopes: this.config?.scopes,
      },
      mcpServer: !!this.mcpApp,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.mcpApp) {
      await this.mcpApp.close();
      console.log('[PlatformaticOAuth] MCP server closed successfully');
    }
    console.log('[PlatformaticOAuth] OAuth system cleanup completed');
  }
}

/**
 * Helper function to create Platformatic OAuth integration
 */
export function createPlatformaticOAuthIntegration(
  authManager: AuthenticationManager,
): PlatformaticOAuthIntegration {
  return new PlatformaticOAuthIntegration(authManager);
}

/**
 * Helper function to register Platformatic OAuth with Fastify
 */
export async function registerPlatformaticOAuthWithFastify(
  fastify: FastifyInstance,
  authManager: AuthenticationManager,
  options: PlatformaticOAuthConfig = {},
): Promise<PlatformaticOAuthIntegration> {
  const integration = createPlatformaticOAuthIntegration(authManager);
  await integration.initialize(fastify, options);
  return integration;
}
