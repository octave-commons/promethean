/**
 * MCP Auth Library Fastify Adapter
 *
 * Adapts the Express-based mcp-auth library to work with Fastify
 * This provides a drop-in replacement for our custom OAuth implementation
 * using the battle-tested mcp-auth library.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { MCPAuth, fetchServerConfig } from 'mcp-auth';
import type { AuthServerConfig } from 'mcp-auth';

/**
 * Fastify adapter configuration for MCP Auth
 */
export type McpAuthFastifyConfig = Readonly<{
  readonly resourceIdentifier: string;
  readonly authServerUrl: string;
  readonly authServerType?: 'oidc' | 'oauth2';
  readonly scopesSupported?: readonly string[];
  readonly audience?: string;
}>;

/**
 * Fastify adapter for MCP Auth library
 *
 * This class wraps the Express-based mcp-auth library and provides
 * Fastify-compatible middleware and route handlers.
 */
export class McpAuthFastifyAdapter {
  private mcpAuth: MCPAuth;
  private config: McpAuthFastifyConfig;

  constructor(config: McpAuthFastifyConfig) {
    this.config = config;
  }

  /**
   * Initialize the MCP Auth system
   */
  async initialize(): Promise<void> {
    try {
      // Fetch authorization server configuration
      const authServerConfig = await fetchServerConfig(this.config.authServerUrl, {
        type: this.config.authServerType ?? 'oidc',
      });

      // Initialize MCP Auth with resource server configuration
      this.mcpAuth = new MCPAuth({
        protectedResources: [
          {
            metadata: {
              resource: this.config.resourceIdentifier,
              authorizationServers: [authServerConfig],
              scopesSupported: this.config.scopesSupported ?? ['read', 'write'],
            },
          },
        ],
      });

      console.log('[McpAuthFastify] MCP Auth library initialized successfully');
      console.log('[McpAuthFastify] Resource:', this.config.resourceIdentifier);
      console.log('[McpAuthFastify] Auth Server:', this.config.authServerUrl);
    } catch (error) {
      console.error('[McpAuthFastify] Failed to initialize MCP Auth:', error);
      throw error;
    }
  }

  /**
   * Register OAuth 2.0 Protected Resource Metadata endpoint
   *
   * This serves the RFC 9728 Protected Resource Metadata endpoint
   * that MCP clients use to discover authorization servers and supported scopes.
   */
  registerProtectedResourceMetadata(fastify: FastifyInstance): void {
    const resourcePath = new URL(this.config.resourceIdentifier).pathname;
    const metadataPath = resourcePath
      ? `/.well-known/oauth-protected-resource${resourcePath}`
      : '/.well-known/oauth-protected-resource';

    fastify.get(metadataPath, async (_request, reply) => {
      try {
        // The mcp-auth library doesn't expose the metadata directly,
        // so we construct it based on our configuration
        const metadata = {
          resource: this.config.resourceIdentifier,
          authorization_servers: [this.config.authServerUrl],
          scopes_supported: this.config.scopesSupported ?? ['read', 'write'],
        };

        await reply
          .header('content-type', 'application/json')
          .header('cache-control', 'public, max-age=3600')
          .send(metadata);
      } catch (error) {
        console.error('[McpAuthFastify] Metadata endpoint error:', error);
        reply.status(500).send({
          error: 'server_error',
          error_description: 'Failed to retrieve protected resource metadata',
        });
      }
    });

    console.log(
      `[McpAuthFastify] Registered protected resource metadata endpoint: ${metadataPath}`,
    );
  }

  /**
   * Create Fastify middleware for Bearer token authentication
   *
   * This middleware validates JWT Bearer tokens against the configured
   * authorization server and populates request.auth with user information.
   */
  createBearerAuthMiddleware(
    options: {
      requiredScopes?: readonly string[];
      audience?: string;
      showErrorDetails?: boolean;
    } = {},
  ) {
    const {
      requiredScopes = [],
      audience = this.config.audience ?? this.config.resourceIdentifier,
      showErrorDetails = false,
    } = options;

    return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      try {
        // Skip authentication for public routes
        if (this.isPublicRoute(request.url)) {
          return;
        }

        // Extract Bearer token from Authorization header
        const authHeader = request.headers.authorization;
        if (!authHeader) {
          return this.sendAuthError(reply, 'missing_auth_header', showErrorDetails);
        }

        const [scheme, token, ...rest] = authHeader.split(' ');
        if (scheme?.toLowerCase() !== 'bearer' || rest.length > 0) {
          return this.sendAuthError(reply, 'invalid_auth_header_format', showErrorDetails);
        }

        if (!token) {
          return this.sendAuthError(reply, 'missing_bearer_token', showErrorDetails);
        }

        // Use mcp-auth library to validate the token
        const bearerAuth = this.mcpAuth.bearerAuth('jwt', {
          audience,
          requiredScopes,
          showErrorDetails,
        });

        // Convert Express middleware to Fastify-compatible
        await this.runExpressMiddleware(bearerAuth, request, reply);

        // If we get here, authentication was successful
        // The mcp-auth middleware populates request.auth
        console.log('[McpAuthFastify] Authentication successful for:', request.url);
      } catch (error) {
        console.error('[McpAuthFastify] Authentication error:', error);

        // Handle specific error types
        if (error instanceof Error) {
          if (error.message.includes('missing_auth_header')) {
            return this.sendAuthError(reply, 'missing_auth_header', showErrorDetails);
          }
          if (error.message.includes('invalid_auth_header_format')) {
            return this.sendAuthError(reply, 'invalid_auth_header_format', showErrorDetails);
          }
          if (error.message.includes('missing_bearer_token')) {
            return this.sendAuthError(reply, 'missing_bearer_token', showErrorDetails);
          }
          if (error.message.includes('missing_required_scopes')) {
            return this.sendAuthError(reply, 'missing_required_scopes', showErrorDetails);
          }
          if (
            error.message.includes('invalid_issuer') ||
            error.message.includes('invalid_audience')
          ) {
            return this.sendAuthError(reply, 'invalid_token', showErrorDetails);
          }
        }

        // Generic token error
        return this.sendAuthError(reply, 'invalid_token', showErrorDetails);
      }
    };
  }

  /**
   * Run Express-style middleware in Fastify context
   */
  private async runExpressMiddleware(
    middleware: any,
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create Express-style request and response objects
      const expressReq = {
        headers: request.headers,
        auth: undefined, // Will be populated by middleware
      };

      const expressRes = {
        status: (code: number) => ({
          json: (data: any) => {
            reply.status(code).send(data);
            reject(new Error(`Authentication failed: ${code}`));
          },
          send: (data: any) => {
            reply.status(code).send(data);
            reject(new Error(`Authentication failed: ${code}`));
          },
        }),
        set: (name: string, value: string) => {
          reply.header(name, value);
        },
        header: (name: string, value: string) => {
          reply.header(name, value);
        },
      };

      // Call the Express middleware
      middleware(expressReq, expressRes, (error?: Error) => {
        if (error) {
          reject(error);
          return;
        }

        // Copy auth info from Express request to Fastify request
        if (expressReq.auth) {
          (request as any).auth = expressReq.auth;
        }

        resolve();
      });
    });
  }

  /**
   * Send standardized authentication error response
   */
  private sendAuthError(reply: FastifyReply, errorCode: string, showErrorDetails: boolean): void {
    const errors: Record<string, { message: string; description: string }> = {
      missing_auth_header: {
        message: 'Missing Authorization header',
        description: 'The request must include a valid Authorization header',
      },
      invalid_auth_header_format: {
        message: 'Invalid Authorization header format',
        description: 'Authorization header must be in format: Bearer <token>',
      },
      missing_bearer_token: {
        message: 'Missing Bearer token',
        description: 'Authorization header must include a Bearer token',
      },
      invalid_token: {
        message: 'Invalid or expired token',
        description: 'The provided token is invalid, expired, or malformed',
      },
      missing_required_scopes: {
        message: 'Insufficient permissions',
        description: 'The token does not have the required scopes',
      },
    };

    const error = errors[errorCode] || {
      message: 'Authentication failed',
      description: 'An error occurred during authentication',
    };

    reply
      .status(401)
      .header(
        'WWW-Authenticate',
        `Bearer error="${errorCode}", error_description="${error.description}"`,
      )
      .send({
        error: showErrorDetails ? errorCode : 'invalid_token',
        error_description: showErrorDetails ? error.description : 'Authentication failed',
        ...(showErrorDetails ? { details: error } : {}),
      });
  }

  /**
   * Check if route is public (doesn't require authentication)
   */
  private isPublicRoute(url: string): boolean {
    const publicRoutes = [
      '/healthz',
      '/.well-known/oauth-protected-resource',
      '/ui',
      '/ui/assets',
      '/auth/oauth/providers',
      '/auth/oauth/login',
      '/auth/oauth/callback',
      '/auth/oauth/health',
    ];

    // Check exact matches and prefixes
    return publicRoutes.some((route) => url.startsWith(route));
  }

  /**
   * Get authentication info from request
   */
  getAuthInfo(request: FastifyRequest): any {
    return (request as any).auth;
  }

  /**
   * Check if request is authenticated
   */
  isAuthenticated(request: FastifyRequest): boolean {
    return !!(request as any).auth;
  }

  /**
   * Get user ID from authenticated request
   */
  getUserId(request: FastifyRequest): string | null {
    const auth = (request as any).auth;
    return auth?.sub || auth?.userId || null;
  }

  /**
   * Get user scopes from authenticated request
   */
  getUserScopes(request: FastifyRequest): readonly string[] {
    const auth = (request as any).auth;
    return auth?.scopes || auth?.scope
      ? Array.isArray(auth.scopes)
        ? auth.scopes
        : auth.scope?.split(' ') || []
      : [];
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
      adapter: 'mcp-auth-fastify',
      resourceIdentifier: this.config.resourceIdentifier,
      authServerUrl: this.config.authServerUrl,
      scopesSupported: this.config.scopesSupported,
      initialized: !!this.mcpAuth,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Helper function to create MCP Auth Fastify adapter
 */
export function createMcpAuthFastifyAdapter(config: McpAuthFastifyConfig): McpAuthFastifyAdapter {
  return new McpAuthFastifyAdapter(config);
}

/**
 * Helper function to initialize MCP Auth with Fastify
 */
export async function initializeMcpAuthWithFastify(
  fastify: FastifyInstance,
  config: McpAuthFastifyConfig,
): Promise<McpAuthFastifyAdapter> {
  const adapter = createMcpAuthFastifyAdapter(config);
  await adapter.initialize();

  // Register protected resource metadata endpoint
  adapter.registerProtectedResourceMetadata(fastify);

  return adapter;
}
