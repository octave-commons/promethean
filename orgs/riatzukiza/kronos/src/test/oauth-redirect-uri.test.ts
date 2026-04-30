/**
 * OAuth Redirect URI Test
 *
 * Tests that OAuth redirect URI properly respects OAUTH_REDIRECT_URI environment variable
 * and falls back to dynamic construction for development.
 */

import test from 'ava';
import fastify from 'fastify';
import { AuthenticationManager } from '../core/authentication.js';
import { createOAuthFastifyIntegration } from '../auth/fastify-integration.js';

test('OAuth redirect URI respects configured production URI', async (t) => {
  // Set production environment
  process.env.NODE_ENV = 'test';
  process.env.ENABLE_OAUTH = 'true';
  process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
  process.env.OAUTH_GITHUB_CLIENT_ID = 'test-github-client-id';
  process.env.OAUTH_GITHUB_CLIENT_SECRET = 'test-github-client-secret';
  process.env.OAUTH_REDIRECT_URI = 'https://production.example.com/auth/oauth/callback';

  const app = fastify({ logger: false });
  const authManager = new AuthenticationManager({
    secret: 'test-secret-key-for-testing-only',
    expiresIn: '1h',
    issuer: 'test-mcp',
    audience: 'test-clients',
  });

  const oauthIntegration = createOAuthFastifyIntegration(authManager);
  await oauthIntegration.initialize(app, {
    enableOAuth: true,
    secureCookies: false,
    sameSitePolicy: 'lax',
  });

  try {
    const response = await app.inject({
      method: 'GET',
      url: '/auth/oauth/login?response_type=code&client_id=test&redirect_uri=https://chatgpt.com/connector_platform_oauth_redirect&state=test123&scope=user:email',
    });

    t.is(response.statusCode, 302, 'Should redirect to OAuth provider');
    t.truthy(response.headers.location, 'Should have redirect location');
    
    // The redirect should go to GitHub with our production redirect URI
    const location = response.headers.location as string;
    t.true(location.includes('github.com'), 'Should redirect to GitHub');
    
    // Extract redirect_uri parameter from GitHub URL
    const githubUrl = new URL(location);
    const redirectUri = githubUrl.searchParams.get('redirect_uri');
    
    t.is(
      redirectUri,
      'https://production.example.com/auth/oauth/callback',
      'Should use configured production redirect URI'
    );
  } finally {
    await oauthIntegration.cleanup();
    await app.close();
    
    // Clean up environment
    delete process.env.ENABLE_OAUTH;
    delete process.env.JWT_SECRET;
    delete process.env.OAUTH_GITHUB_CLIENT_ID;
    delete process.env.OAUTH_GITHUB_CLIENT_SECRET;
    delete process.env.OAUTH_REDIRECT_URI;
  }
});

test('OAuth redirect URI uses dynamic construction for localhost config', async (t) => {
  // Set localhost environment (should trigger dynamic fallback)
  process.env.NODE_ENV = 'test';
  process.env.ENABLE_OAUTH = 'true';
  process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
  process.env.OAUTH_GITHUB_CLIENT_ID = 'test-github-client-id';
  process.env.OAUTH_GITHUB_CLIENT_SECRET = 'test-github-client-secret';
  process.env.OAUTH_REDIRECT_URI = 'http://localhost:3210/auth/oauth/callback';

  const app = fastify({ logger: false });
  const authManager = new AuthenticationManager({
    secret: 'test-secret-key-for-testing-only',
    expiresIn: '1h',
    issuer: 'test-mcp',
    audience: 'test-clients',
  });

  const oauthIntegration = createOAuthFastifyIntegration(authManager);
  await oauthIntegration.initialize(app, {
    enableOAuth: true,
    secureCookies: false,
    sameSitePolicy: 'lax',
  });

  try {
    const response = await app.inject({
      method: 'GET',
      url: '/auth/oauth/login?response_type=code&client_id=test&redirect_uri=https://chatgpt.com/connector_platform_oauth_redirect&state=test123&scope=user:email',
      headers: {
        'x-forwarded-proto': 'https',
        'x-forwarded-host': 'dev-tunnel.ngrok.io',
      },
    });

    t.is(response.statusCode, 302, 'Should redirect to OAuth provider');
    
    const location = response.headers.location;
    t.true(location?.includes('github.com'), 'Should redirect to GitHub');
    
    // Extract redirect_uri parameter from GitHub URL
    if (!location) {
      t.fail('Location header should be defined');
      return;
    }
    const githubUrl = new URL(location);
    const redirectUri = githubUrl.searchParams.get('redirect_uri');
    
    t.is(
      redirectUri,
      'https://dev-tunnel.ngrok.io/auth/oauth/callback',
      'Should use dynamic redirect URI for development with tunnel'
    );
  } finally {
    await oauthIntegration.cleanup();
    await app.close();
    
    // Clean up environment
    delete process.env.ENABLE_OAUTH;
    delete process.env.JWT_SECRET;
    delete process.env.OAUTH_GITHUB_CLIENT_ID;
    delete process.env.OAUTH_GITHUB_CLIENT_SECRET;
    delete process.env.OAUTH_REDIRECT_URI;
  }
});