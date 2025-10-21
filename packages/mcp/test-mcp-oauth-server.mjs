#!/usr/bin/env node

/**
 * Simple MCP Server with OAuth Integration Test
 *
 * Creates a Fastify instance that:
 * 1. Serves a static web page for testing
 * 2. Includes OAuth routes we implemented
 * 3. Provides basic MCP tools
 */

import Fastify from 'fastify';
import { registerSimpleOAuthRoutes } from './src/auth/oauth/simple-routes.js';
import { OAuthSystem } from './src/auth/oauth/index.js';
import { JwtTokenManager } from './src/auth/oauth/jwt.js';
import { UserRegistry } from './src/auth/users/registry.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock AuthenticationManager
class MockAuthenticationManager {
  authenticateRequest(_request) {
    return { success: false };
  }
}

async function createMCPServerWithOAuth() {
  console.log('🚀 Starting MCP Server with OAuth integration...');

  const fastify = Fastify({
    logger: true,
  });

  // Initialize OAuth components
  const oauthSystem = new OAuthSystem({
    providers: {
      github: {
        clientId: 'Ov23li1fhUvAsLo8LabH',
        clientSecret: '06428e45e125aede2bbd945958b7bc9d4d1afbe4',
        scopes: ['user:email'],
      },
    },
    redirectUri: 'http://localhost:3001/auth/oauth/callback',
    stateTimeout: 600, // 10 minutes
    sessionTimeout: 3600, // 1 hour
    tokenRefreshThreshold: 300, // 5 minutes
    enableRefreshTokens: true,
  });

  const jwtManager = new JwtTokenManager({
    secret: '12345678901234567890123456789012', // Exactly 32 characters
    issuer: 'promethean-mcp',
    audience: 'promethean-mcp-users',
    accessTokenExpiry: 3600, // 1 hour
    refreshTokenExpiry: 86400, // 24 hours
    algorithm: 'HS256',
  });

  const userRegistry = new UserRegistry({
    storagePath: './test-data',
    enableCustomRoles: true,
    enableActivityLogging: true,
    sessionTimeout: 3600, // 1 hour
    maxSessionsPerUser: 5,
    enableUserSearch: true,
    defaultRole: 'user',
    autoActivateUsers: true,
  });

  const authManager = new MockAuthenticationManager();

  // Register OAuth routes
  registerSimpleOAuthRoutes(fastify, {
    oauthSystem,
    oauthIntegration: oauthSystem,
    jwtManager,
    userRegistry,
    authManager,
  });

  // Add CORS support
  await fastify.register(import('@fastify/cors'), {
    origin: true,
    credentials: true,
  });

  // Serve static files
  await fastify.register(import('@fastify/static'), {
    root: path.join(__dirname, 'static'),
    prefix: '/static/',
  });

  // Main web page
  fastify.get('/', async (request, _reply) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCP Server with OAuth Test</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .section {
            margin-bottom: 25px;
            padding: 20px;
            border: 1px solid #e1e5e9;
            border-radius: 6px;
        }
        .button {
            background: #0969da;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            text-decoration: none;
            display: inline-block;
            margin: 5px;
        }
        .button:hover {
            background: #0860ca;
        }
        .status {
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        .success { background: #dafbe1; color: #1a7f37; }
        .info { background: #ddf4ff; color: #0969da; }
        .endpoint {
            font-family: monospace;
            background: #f6f8fa;
            padding: 8px 12px;
            border-radius: 4px;
            margin: 5px 0;
        }
        .test-section {
            background: #fff8c5;
            border: 1px solid #d4a017;
            padding: 15px;
            border-radius: 6px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 MCP Server with OAuth</h1>
            <p>Testing OAuth integration for ChatGPT MCP connector</p>
        </div>

        <div class="section">
            <h2>📋 Server Information</h2>
            <div class="status info">
                <strong>Server Status:</strong> Running on ${request.headers.host}
            </div>
            <div class="endpoint">
                <strong>Base URL:</strong> http://${request.headers.host}
            </div>
        </div>

        <div class="section">
            <h2>🔗 OAuth Endpoints</h2>
            <div class="endpoint">
                <strong>Health:</strong> /auth/oauth/health
            </div>
            <div class="endpoint">
                <strong>Providers:</strong> /auth/oauth/providers
            </div>
            <div class="endpoint">
                <strong>OAuth Discovery:</strong> /.well-known/oauth-authorization-server/mcp
            </div>
            <div class="endpoint">
                <strong>OpenID Discovery:</strong> /.well-known/openid-configuration/mcp
            </div>
        </div>

        <div class="section">
            <h2>🧪 Test OAuth Flow</h2>
            <p>Test the OAuth implementation that simulates ChatGPT's MCP connector:</p>
            
            <div class="test-section">
                <h3>1. Standard OAuth Flow</h3>
                <p>Simulates a regular OAuth authorization flow:</p>
                <a href="/auth/oauth/login?response_type=code&client_id=test&redirect_uri=http://localhost:3001/auth/oauth/callback&state=test123" class="button">
                    🚀 Start Standard OAuth
                </a>
            </div>

            <div class="test-section">
                <h3>2. ChatGPT MCP Flow</h3>
                <p>Simulates ChatGPT's PKCE token exchange:</p>
                <button onclick="testChatGPTFlow()" class="button">
                    🤖 Test ChatGPT MCP Flow
                </button>
            </div>

            <div id="result" style="margin-top: 20px;"></div>
        </div>

        <div class="section">
            <h2>📖 API Testing</h2>
            <p>You can test the endpoints directly:</p>
            <button onclick="testHealth()" class="button">
                🏥 Test Health
            </button>
            <button onclick="testProviders()" class="button">
                📋 Test Providers
            </button>
            <button onclick="testDiscovery()" class="button">
                🔍 Test OAuth Discovery
            </button>
        </div>
    </div>

    <script>
        async function testHealth() {
            try {
                const response = await fetch('/auth/oauth/health');
                const data = await response.json();
                showResult('Health Check', 'success', \`✅ \${JSON.stringify(data, null, 2)}\`);
            } catch (error) {
                showResult('Health Check', 'error', \`❌ \${error.message}\`);
            }
        }

        async function testProviders() {
            try {
                const response = await fetch('/auth/oauth/providers');
                const data = await response.json();
                showResult('Providers', 'success', \`✅ \${JSON.stringify(data, null, 2)}\`);
            } catch (error) {
                showResult('Providers', 'error', \`❌ \${error.message}\`);
            }
        }

        async function testDiscovery() {
            try {
                const response = await fetch('/.well-known/oauth-authorization-server/mcp');
                const data = await response.json();
                showResult('OAuth Discovery', 'success', \`✅ \${JSON.stringify(data, null, 2)}\`);
            } catch (error) {
                showResult('OAuth Discovery', 'error', \`❌ \${error.message}\`);
            }
        }

        async function testChatGPTFlow() {
            showResult('ChatGPT MCP Flow', 'info', '🔄 Testing ChatGPT PKCE flow...');
            
            try {
                // Simulate ChatGPT's PKCE token request
                const response = await fetch('/auth/oauth/callback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        grant_type: 'authorization_code',
                        code: 'simulated_auth_code_12345',
                        redirect_uri: 'https://chatgpt.com/connector_platform_oauth_redirect',
                        code_verifier: 'simulated_code_verifier_67890',
                    }),
                });

                const data = await response.json();
                
                if (response.ok) {
                    showResult('ChatGPT MCP Flow', 'success', 
                        \`✅ ChatGPT PKCE flow successful!\\n\\nAccess Token: \${data.access_token?.substring(0, 20)}...\\nRefresh Token: \${data.refresh_token?.substring(0, 20)}...\\nUser Info: \${JSON.stringify(data.user_info, null, 2)}\`);
                } else {
                    showResult('ChatGPT MCP Flow', 'error', 
                        \`❌ ChatGPT PKCE flow failed: \${JSON.stringify(data, null, 2)}\`);
                }
            } catch (error) {
                showResult('ChatGPT MCP Flow', 'error', \`❌ Error: \${error.message}\`);
            }
        }

        function showResult(title, type, message) {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = \`
                <div class="status \${type}">
                    <strong>\${title}:</strong>
                    <pre style="white-space: pre-wrap; margin: 10px 0;">\${message}</pre>
                </div>
            \`;
        }

        // Auto-test health on load
        window.addEventListener('load', testHealth);
    </script>
</body>
</html>`;

    reply.type('text/html').send(html);
  });

  // Health endpoint
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      server: 'mcp-with-oauth',
      host: request.headers.host,
    };
  });

  try {
    const port = 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`✅ MCP Server with OAuth running on http://localhost:${port}`);
    console.log('');
    console.log('🌐 Web Interface: http://localhost:3001');
    console.log('🔐 OAuth Endpoints available at:');
    console.log(`   • Health: http://localhost:${port}/auth/oauth/health`);
    console.log(`   • Providers: http://localhost:${port}/auth/oauth/providers`);
    console.log(
      `   • OAuth Discovery: http://localhost:${port}/.well-known/oauth-authorization-server/mcp`,
    );
    console.log('');
    console.log('🧪 Test the ChatGPT MCP flow by visiting the web interface!');
    console.log('');
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

// Run the server
createMCPServerWithOAuth().catch(console.error);
