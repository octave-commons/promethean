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
import { randomBytes } from 'node:crypto';

/**
 * Try to parse JSON from request body
 */
const tryParseJson = (body: unknown): unknown => {
  if (Buffer.isBuffer(body)) {
    try {
      return JSON.parse(body.toString('utf8'));
    } catch {
      return undefined;
    }
  }
  if (typeof body === 'string' && body.length > 0) {
    try {
      return JSON.parse(body);
    } catch {
      return undefined;
    }
  }
  return body;
};

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

  // OAuth 2.0 Authorization Server Metadata (RFC 8414)
  fastify.get(`/.well-known/oauth-authorization-server/mcp`, async (_request, reply) => {
    const baseUrl = getBaseUrl(_request as any);
    return reply
      .header('Cache-Control', 'no-cache, no-store, must-revalidate')
      .header('Pragma', 'no-cache')
      .header('Expires', '0')
      .send({
        issuer: `${baseUrl}/mcp`,
        authorization_endpoint: `${baseUrl}${basePath}/login`,
        token_endpoint: `${baseUrl}${basePath}/callback`,
        registration_endpoint: `${baseUrl}/.well-known/oauth-registration/mcp`,
        response_types_supported: ['code'],
        grant_types_supported: ['authorization_code'],
        scopes_supported: ['user:email', 'openid', 'email', 'profile'],
        token_endpoint_auth_methods_supported: ['client_secret_post'],
        code_challenge_methods_supported: ['S256'],
        authorization_response_iss_parameter_supported: false,
        service_documentation: `${baseUrl}/auth/oauth/docs`,
      });
  });

  // OpenID Connect Discovery (for compatibility)
  fastify.get(`/.well-known/openid-configuration/mcp`, async (_request, reply) => {
    const baseUrl = getBaseUrl(_request as any);
    return reply
      .header('Cache-Control', 'no-cache, no-store, must-revalidate')
      .header('Pragma', 'no-cache')
      .header('Expires', '0')
      .send({
        issuer: `${baseUrl}/mcp`,
        authorization_endpoint: `${baseUrl}${basePath}/login`,
        token_endpoint: `${baseUrl}${basePath}/callback`,
        userinfo_endpoint: `${baseUrl}${basePath}/userinfo`,
        jwks_uri: `${baseUrl}${basePath}/jwks`,
        registration_endpoint: `${baseUrl}/.well-known/oauth-registration/mcp`,
        response_types_supported: ['code'],
        grant_types_supported: ['authorization_code'],
        subject_types_supported: ['public'],
        id_token_signing_alg_values_supported: ['HS256'],
        scopes_supported: ['openid', 'email', 'profile', 'user:email'],
        token_endpoint_auth_methods_supported: ['client_secret_post'],
        code_challenge_methods_supported: ['S256'],
      });
  });

  // OAuth Protected Resource metadata
  fastify.get(`/.well-known/oauth-protected-resource/mcp`, async (_request, reply) => {
    return reply.send({
      resource: `${getBaseUrl(_request as any)}/mcp`,
      authorization_servers: [`${getBaseUrl(_request as any)}/mcp`],
      scopes_supported: ['read', 'write', 'admin'],
      bearer_methods_supported: ['header'],
      resource_documentation: `${getBaseUrl(_request as any)}/auth/oauth/docs`,
    });
  });

  // Alternative paths for compatibility
  fastify.get(`/mcp/.well-known/openid-configuration`, async (_request, reply) => {
    // Redirect to the standard location
    return reply.redirect(`/.well-known/openid-configuration/mcp`);
  });

  fastify.get(`/.well-known/oauth-authorization-server`, async (_request, reply) => {
    // Redirect to the MCP-specific one
    return reply.redirect(`/.well-known/oauth-authorization-server/mcp`);
  });

  fastify.get(`/.well-known/openid-configuration`, async (_request, reply) => {
    // Redirect to the MCP-specific one
    return reply.redirect(`/.well-known/openid-configuration/mcp`);
  });

  fastify.get(`/.well-known/oauth-protected-resource`, async (_request, reply) => {
    // Redirect to the MCP-specific one
    return reply.redirect(`/.well-known/oauth-protected-resource/mcp`);
  });

  // RFC 7591 Dynamic Client Registration
  fastify.post(`/.well-known/oauth-registration/mcp`, async (request, reply) => {
    try {
      const parsedBody = tryParseJson(request.body);
      const clientData = parsedBody as any;

      // Generate a client ID and secret for the dynamic client
      const clientId = `mcp_client_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const clientSecret = randomBytes(32).toString('hex');

      // Store client registration (in a real implementation, this would be in a database)
      const clientStore = (global as any).__oauth_client_store || {};
      clientStore[clientId] = {
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uris: clientData.redirect_uris || [],
        grant_types: clientData.grant_types || ['authorization_code'],
        response_types: clientData.response_types || ['code'],
        scope: clientData.scope || 'user:email',
        client_name: clientData.client_name || 'MCP Dynamic Client',
        client_uri: clientData.client_uri,
        logo_uri: clientData.logo_uri,
        created_at: new Date().toISOString(),
        software_id: clientData.software_id,
        software_version: clientData.software_version,
      };
      (global as any).__oauth_client_store = clientStore;

      // Return client registration response
      return reply.status(201).send({
        client_id: clientId,
        client_secret: clientSecret,
        client_id_issued_at: Math.floor(Date.now() / 1000),
        client_secret_expires_at: 0, // 0 means never expires
        redirect_uris: clientData.redirect_uris || [],
        grant_types: clientData.grant_types || ['authorization_code'],
        response_types: clientData.response_types || ['code'],
        scope: clientData.scope || 'user:email',
        client_name: clientData.client_name || 'MCP Dynamic Client',
        client_uri: clientData.client_uri,
        logo_uri: clientData.logo_uri,
        software_id: clientData.software_id,
        software_version: clientData.software_version,
      });
    } catch (error) {
      return reply.status(400).send({
        error: 'invalid_client_metadata',
        error_description: String(error),
      });
    }
  });

  // RFC 7591 Dynamic Client Registration Management
  fastify.get(`/.well-known/oauth-registration/mcp/:client_id`, async (request, reply) => {
    try {
      const params = request.params as any;
      const clientId = params.client_id;

      const clientStore = (global as any).__oauth_client_store || {};
      const client = clientStore[clientId];

      if (!client) {
        return reply.status(404).send({
          error: 'invalid_client',
          error_description: 'Client not found',
        });
      }

      return reply.send({
        client_id: client.client_id,
        client_secret: client.client_secret,
        client_id_issued_at: Math.floor(new Date(client.created_at).getTime() / 1000),
        client_secret_expires_at: 0,
        redirect_uris: client.redirect_uris,
        grant_types: client.grant_types,
        response_types: client.response_types,
        scope: client.scope,
        client_name: client.client_name,
        client_uri: client.client_uri,
        logo_uri: client.logo_uri,
        software_id: client.software_id,
        software_version: client.software_version,
      });
    } catch (error) {
      return reply.status(500).send({
        error: 'server_error',
        error_description: String(error),
      });
    }
  });

  // RFC 7591 Dynamic Client Registration Delete
  fastify.delete(`/.well-known/oauth-registration/mcp/:client_id`, async (request, reply) => {
    try {
      const params = request.params as any;
      const clientId = params.client_id;

      const clientStore = (global as any).__oauth_client_store || {};
      if (clientStore[clientId]) {
        delete clientStore[clientId];
        (global as any).__oauth_client_store = clientStore;
      }

      return reply.status(204).send();
    } catch (error) {
      return reply.status(500).send({
        error: 'server_error',
        error_description: String(error),
      });
    }
  });

  // Alternative paths for dynamic client registration
  fastify.post(`/.well-known/oauth-registration`, async (_request, reply) => {
    return reply.redirect(`/.well-known/oauth-registration/mcp`);
  });

  fastify.get(`/.well-known/oauth-registration`, async (_request, reply) => {
    return reply.redirect(`/.well-known/oauth-registration/mcp`);
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

  // Initiate OAuth login (POST - for API usage)
  fastify.post(`${basePath}/login`, async (request, reply) => {
    try {
      // Parse JSON body manually since Fastify is configured to not auto-parse
      const parsedBody = tryParseJson(request.body);
      const { provider, redirectTo } = parsedBody as any;

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

      // Use dynamic redirect URI based on current request to handle tunnels/proxies
      const dynamicRedirectUri = `${getBaseUrl(request)}/auth/oauth/callback`;

      // Start OAuth flow with the OAuthSystem using the dynamic redirect URI
      const { authUrl, state } = config.oauthSystem.startOAuthFlow(provider, dynamicRedirectUri);

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

  // Initiate OAuth login (GET - for standard OAuth authorization flow)
  fastify.get(`${basePath}/login`, async (request, reply) => {
    try {
      const query = request.query as any;
      const {
        response_type,
        client_id,
        redirect_uri,
        state,
        scope,
        code_challenge,
        code_challenge_method,
      } = query;

      // Validate required OAuth parameters
      if (!response_type || response_type !== 'code') {
        return reply.status(400).send({
          error: 'invalid_request',
          error_description: 'response_type must be "code"',
        });
      }

      if (!client_id) {
        return reply.status(400).send({
          error: 'invalid_request',
          error_description: 'client_id is required',
        });
      }

      if (!redirect_uri) {
        return reply.status(400).send({
          error: 'invalid_request',
          error_description: 'redirect_uri is required',
        });
      }

      if (!state) {
        return reply.status(400).send({
          error: 'invalid_request',
          error_description: 'state is required',
        });
      }

      // PKCE is optional for compatibility with clients that don't support it
      const hasPkce = code_challenge && code_challenge_method === 'S256';

      // Default to GitHub provider for standard OAuth flow
      // In a real implementation, you might determine this from client_id or other parameters
      const provider = 'github';

      if (!config.oauthSystem.isProviderAvailable(provider)) {
        return reply.status(400).send({
          error: 'invalid_request',
          error_description: `Provider '${provider}' is not supported`,
        });
      }

      // Use dynamic redirect URI based on current request to handle tunnels/proxies
      const dynamicRedirectUri = `${getBaseUrl(request)}/auth/oauth/callback`;

      // Start OAuth flow with the OAuthSystem using the dynamic redirect URI
      const { authUrl: providerAuthUrl, state: oauthState } = config.oauthSystem.startOAuthFlow(
        provider,
        dynamicRedirectUri,
        hasPkce
          ? { codeChallenge: code_challenge, codeChallengeMethod: code_challenge_method }
          : undefined,
      );

      // Store the original state and redirect_uri for validation in callback
      const tempStore = (global as any).__oauth_temp_store || {};
      tempStore[oauthState] = {
        originalState: state,
        clientRedirectUri: redirect_uri,
        clientId: client_id,
        scope: scope || 'user:email',
      };
      (global as any).__oauth_temp_store = tempStore;

      // Redirect to provider's authorization endpoint
      return reply.status(302).header('Location', providerAuthUrl).send();
    } catch (error) {
      return reply.status(500).send({
        error: 'OAuth login failed',
        error_description: String(error),
      });
    }
  });

  // OAuth callback (GET - for standard OAuth flow)
  fastify.get(`${basePath}/callback`, async (request, reply) => {
    try {
      const query = request.query as any;
      const { code, state, error } = query;

      if (error) {
        // For standard OAuth flow, redirect back to client with error
        const tempStore = (global as any).__oauth_temp_store || {};
        const storedData = tempStore[state];

        if (storedData && storedData.clientRedirectUri) {
          const errorParams = new URLSearchParams({
            error: error,
            state: storedData.originalState || state,
          });
          const clientRedirectUrl = `${storedData.clientRedirectUri}?${errorParams.toString()}`;
          return reply.status(302).header('Location', clientRedirectUrl).send();
        }

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

      const { redirectTo, originalState, clientRedirectUri } = storedData;

      // Clean up stored data
      delete tempStore[state];

      // Handle OAuth callback with OAuthSystem
      const result = await config.oauthSystem.handleOAuthCallback(code, state, error);

      if (!result.success) {
        // For standard OAuth flow, redirect back to client with error
        if (clientRedirectUri && originalState) {
          const errorParams = new URLSearchParams({
            error: result.error?.type || 'OAuth callback failed',
            error_description: result.error?.message || 'Unknown OAuth error',
            state: originalState,
          });
          const clientRedirectUrl = `${clientRedirectUri}?${errorParams.toString()}`;
          return reply.status(302).header('Location', clientRedirectUrl).send();
        }

        return reply.status(400).send({
          error: result.error?.type || 'OAuth callback failed',
          message: result.error?.message || 'Unknown OAuth error',
        });
      }

      // Handle different redirect scenarios
      if (clientRedirectUri && originalState) {
        // Standard OAuth flow - redirect back to client with authorization code
        const callbackParams = new URLSearchParams({
          code: code,
          state: originalState,
        });
        const clientRedirectUrl = `${clientRedirectUri}?${callbackParams.toString()}`;
        return reply.status(302).header('Location', clientRedirectUrl).send();
      } else {
        // API flow - redirect to local UI or specified destination
        const redirectUrl = redirectTo || '/ui';
        return reply.status(302).header('Location', redirectUrl).send();
      }
    } catch (error) {
      return reply.status(500).send({
        error: 'OAuth callback failed',
        message: String(error),
      });
    }
  });

  // OAuth callback (POST - for API usage)
  fastify.post(`${basePath}/callback`, async (request, reply) => {
    try {
      // ChatGPT sends OAuth data in POST body as JSON, need to parse it
      const rawBody = request.body as any;
      let body: any;

      if (Buffer.isBuffer(rawBody)) {
        try {
          body = JSON.parse(rawBody.toString('utf8'));
        } catch (e) {
          // If JSON parsing fails, try URL-encoded parsing
          const bodyStr = rawBody.toString('utf8');
          const params = new URLSearchParams(bodyStr);
          body = {};
          for (const [key, value] of params) {
            body[key] = value;
          }
        }
      } else {
        body = rawBody;
      }

      // Debug logging
      console.log('[OAuth Callback] Received POST body:', body);

      // Handle different OAuth formats from different clients
      let code: string | undefined,
        state: string | null | undefined,
        error: string | undefined,
        codeVerifier: string | undefined;

      if (body.grant_type === 'authorization_code') {
        // ChatGPT MCP connector format (OAuth 2.1 PKCE)
        code = body.code;
        state = null; // ChatGPT doesn't send state in POST body
        codeVerifier = body.code_verifier; // PKCE code verifier
        console.log(
          '[OAuth Callback] Detected ChatGPT PKCE format with code_verifier:',
          codeVerifier ? 'present' : 'missing',
        );
      } else {
        // Standard OAuth format
        code = body.code;
        state = body.state;
        error = body.error;
        codeVerifier = body.code_verifier;
        console.log('[OAuth Callback] Detected standard OAuth format');
      }

      if (error) {
        return reply.status(400).send({
          error: 'OAuth error',
          message: error,
        });
      }

      // For ChatGPT PKCE flow, only code is required (state is optional)
      if (!code) {
        return reply.status(400).send({
          error: 'Missing parameters',
          message: 'Authorization code is required',
        });
      }

      // Retrieve stored data
      const tempStore = (global as any).__oauth_temp_store || {};
      const storedData = state ? tempStore[state] : undefined;

      let redirectTo: any, originalState: any, clientRedirectUri: any;

      if (!storedData) {
        console.log(
          '[OAuth Callback] No stored state, processing direct OAuth callback for MCP client',
        );
        // For direct calls from MCP clients like ChatGPT, continue without stored state
        redirectTo = null;
        originalState = state;
        clientRedirectUri = null;
      } else {
        const {
          redirectTo: storedRedirectTo,
          originalState: storedOriginalState,
          clientRedirectUri: storedClientRedirectUri,
        } = storedData;
        redirectTo = storedRedirectTo;
        originalState = storedOriginalState;
        clientRedirectUri = storedClientRedirectUri;

        // Clean up stored data
        if (state) {
          delete tempStore[state];
        }
      }

      // Handle OAuth callback with OAuthSystem
      let result;

      if (!storedData) {
        // Direct OAuth callback from MCP client (like ChatGPT)
        // Exchange the authorization code directly with GitHub
        console.log('[OAuth Callback] Exchanging authorization code directly with GitHub');

        try {
          // Validate required environment variables
          const clientId = process.env.MCP_OAUTH_GITHUB_CLIENT_ID || process.env.OAUTH_GITHUB_CLIENT_ID;
          const clientSecret = process.env.MCP_OAUTH_GITHUB_CLIENT_SECRET || process.env.OAUTH_GITHUB_CLIENT_SECRET;
          
          if (!clientId || !clientSecret) {
            return reply.status(500).send({
              error: 'configuration_error',
              message: 'GitHub OAuth credentials not configured. Please set MCP_OAUTH_GITHUB_CLIENT_ID and MCP_OAUTH_GITHUB_CLIENT_SECRET environment variables.',
            });
          }

          // Build token request parameters
          const tokenParams: any = {
            client_id: process.env.MCP_OAUTH_GITHUB_CLIENT_ID || process.env.OAUTH_GITHUB_CLIENT_ID,
            client_secret: process.env.MCP_OAUTH_GITHUB_CLIENT_SECRET || process.env.OAUTH_GITHUB_CLIENT_SECRET,
            code: code,
            redirect_uri: getBaseUrl(request) + '/auth/oauth/callback',
          };

          // Add PKCE code verifier if present
          if (codeVerifier) {
            tokenParams.code_verifier = codeVerifier;
            console.log('[OAuth Callback] Including PKCE code_verifier in token request');
          }

          // Use GitHub's token endpoint directly
          const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(tokenParams),
          });

          const tokenData = await tokenResponse.json();

          if (tokenData.error) {
            return reply.status(400).send({
              error: 'token_exchange_failed',
              message: `GitHub token exchange failed: ${tokenData.error_description || tokenData.error}`,
            });
          }

          // Get user info from GitHub
          const userResponse = await fetch('https://api.github.com/user', {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
              'User-Agent': 'Promethean-MCP',
            },
          });

          const userData = await userResponse.json();

          // Create a successful result similar to what OAuthSystem would return
          result = {
            success: true,
            sessionId: `direct_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
            userId: userData.id.toString(),
            provider: 'github',
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            userInfo: {
              id: userData.id.toString(),
              provider: 'github',
              username: userData.login,
              email: userData.email,
              name: userData.name,
            },
          } as any;

          console.log(
            '[OAuth Callback] Direct OAuth exchange successful for user:',
            userData.login,
          );
        } catch (error) {
          console.error('[OAuth Callback] Direct OAuth exchange failed:', error);
          return reply.status(400).send({
            error: 'token_exchange_failed',
            message: `Failed to exchange authorization code: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      } else {
        // Standard OAuth flow with stored state
        result = await config.oauthSystem.handleOAuthCallback(code!, state!, error);
      }

      if (!result.success) {
        return reply.status(400).send({
          error: result.error?.type || 'OAuth callback failed',
          message: result.error?.message || 'Unknown OAuth error',
        });
      }

      // Get OAuth session
      const oauthSession = config.oauthSystem.getSession(result.sessionId!);
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

      // Handle different redirect scenarios
      if (!storedData) {
        // Direct OAuth callback from MCP client (like ChatGPT)
        // Return token information as JSON response per MCP spec
        console.log('[OAuth Callback] Returning token response for MCP client');
        return reply.status(200).send({
          access_token: result.accessToken,
          token_type: 'Bearer',
          expires_in: 3600,
          refresh_token: result.refreshToken,
          scope: 'user:email',
          user_info: result.userInfo,
        });
      } else if (clientRedirectUri && originalState) {
        // Standard OAuth flow - redirect back to client with authorization code
        const callbackParams = new URLSearchParams({
          code: code,
          state: originalState,
        });
        const clientRedirectUrl = `${clientRedirectUri}?${callbackParams.toString()}`;
        return reply.status(302).header('Location', clientRedirectUrl).send();
      } else {
        // API flow - redirect to local UI or specified destination
        const redirectUrl = redirectTo || '/ui';
        return reply.status(302).header('Location', redirectUrl).send();
      }
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
  // Check for forwarded protocol headers (common with reverse proxies/tunnels)
  const forwardedProto = request.headers['x-forwarded-proto'] as string;
  const forwardedHost = request.headers['x-forwarded-host'] as string;

  const protocol = forwardedProto || request.protocol;
  const host = forwardedHost || request.headers.host || 'localhost';

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
