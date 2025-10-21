#!/usr/bin/env node

/**
 * Simple test for OAuth routes without complex dependencies
 */

import Fastify from 'fastify';
import { registerSimpleOAuthRoutes } from './src/auth/oauth/simple-routes.js';
import { OAuthSystem } from './src/auth/oauth/index.js';
import { JwtTokenManager } from './src/auth/oauth/jwt.js';
import { UserRegistry } from './src/auth/users/registry.js';

// Mock AuthenticationManager since the real one has missing dependencies
class MockAuthenticationManager {
  authenticateRequest(_request) {
    return { success: false };
  }
}

async function testOAuth() {
  console.log('🚀 Starting OAuth test server...');

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
    oauthIntegration: oauthSystem, // Using same object for simplicity
    jwtManager,
    userRegistry,
    authManager,
  });

  // Add CORS support
  await fastify.register(import('@fastify/cors'), {
    origin: true,
    credentials: true,
  });

  // Add cookie support
  await fastify.register(import('@fastify/cookie'));

  try {
    const port = 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`✅ OAuth test server running on http://localhost:${port}`);
    console.log('');
    console.log('📋 Available endpoints:');
    console.log(`   • Health: http://localhost:${port}/auth/oauth/health`);
    console.log(`   • Providers: http://localhost:${port}/auth/oauth/providers`);
    console.log(
      `   • OAuth Discovery: http://localhost:${port}/.well-known/oauth-authorization-server/mcp`,
    );
    console.log(
      `   • OpenID Discovery: http://localhost:${port}/.well-known/openid-configuration/mcp`,
    );
    console.log('');
    console.log('🔗 Test with ChatGPT MCP connector:');
    console.log(
      `   • Authorization URL: http://localhost:${port}/auth/oauth/login?response_type=code&client_id=test&redirect_uri=https://chatgpt.com/connector_platform_oauth_redirect&state=test123`,
    );
    console.log('');
    console.log('📝 To test the OAuth flow:');
    console.log('   1. Visit the authorization URL above');
    console.log('   2. Complete GitHub OAuth');
    console.log('   3. Check the callback response');
    console.log('');
    console.log('🔍 Debug logs will show incoming OAuth requests');
    console.log('   • ChatGPT sends POST requests to /auth/oauth/callback');
    console.log('   • Standard OAuth sends GET requests to /auth/oauth/callback');
    console.log('');
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

testOAuth().catch(console.error);
