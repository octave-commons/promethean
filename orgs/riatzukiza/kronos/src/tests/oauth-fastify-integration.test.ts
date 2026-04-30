/**
 * OAuth Fastify Integration Tests
 *
 * Tests the OAuth integration with Fastify transport
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fastify from 'fastify';
import { AuthenticationManager } from '../core/authentication.js';
import { createOAuthFastifyIntegration } from '../auth/fastify-integration.js';

describe('OAuth Fastify Integration', () => {
  let app: ReturnType<typeof fastify>;
  let authManager: AuthenticationManager;
  let oauthIntegration: any;

  before(async () => {
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.ENABLE_OAUTH = 'true';
    process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
    process.env.OAUTH_GITHUB_CLIENT_ID = 'test-github-client-id';
    process.env.OAUTH_GITHUB_CLIENT_SECRET = 'test-github-client-secret';
    process.env.OAUTH_GOOGLE_CLIENT_ID = 'test-google-client-id';
    process.env.OAUTH_GOOGLE_CLIENT_SECRET = 'test-google-client-secret';

    // Create Fastify instance
    app = fastify({ logger: false });

    // Create authentication manager
    authManager = new AuthenticationManager({
      secret: 'test-secret-key-for-testing-only',
      expiresIn: '1h',
      issuer: 'test-mcp',
      audience: 'test-clients',
    });

    // Initialize OAuth integration
    oauthIntegration = createOAuthFastifyIntegration(authManager);
    await oauthIntegration.initialize(app, {
      enableOAuth: true,
      secureCookies: false, // Disable for testing
      sameSitePolicy: 'lax',
    });
  });

  after(async () => {
    if (oauthIntegration) {
      await oauthIntegration.cleanup();
    }
    if (app) {
      await app.close();
    }
  });

  it('should initialize OAuth integration successfully', async () => {
    assert.ok(oauthIntegration, 'OAuth integration should be created');
    assert.ok(oauthIntegration.getOAuthSystem(), 'OAuth system should be available');
    assert.ok(oauthIntegration.getJwtManager(), 'JWT manager should be available');
    assert.ok(oauthIntegration.getUserRegistry(), 'User registry should be available');
  });

  it('should register OAuth routes', async () => {
    // Test that OAuth routes are registered
    const response = await app.inject({
      method: 'GET',
      url: '/auth/oauth/health',
    });

    assert.strictEqual(response.statusCode, 200, 'OAuth health endpoint should respond');

    const body = JSON.parse(response.body);
    assert.ok(body.status, 'Health response should have status');
  });

  it('should list OAuth providers', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/auth/oauth/providers',
    });

    assert.strictEqual(response.statusCode, 200, 'Providers endpoint should respond');

    const body = JSON.parse(response.body);
    assert.ok(Array.isArray(body.providers), 'Should return providers array');
    assert.ok(body.providers.length > 0, 'Should have at least one provider');
  });

  it('should handle OAuth login initiation', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/oauth/login',
      payload: {
        provider: 'github',
        redirectTo: '/test-callback',
      },
    });

    // Should redirect to OAuth provider
    assert.strictEqual(response.statusCode, 302, 'Should redirect to OAuth provider');
    assert.ok(response.headers.location, 'Should have redirect location');
    assert.ok(response.headers.location.includes('github.com'), 'Should redirect to GitHub');
  });

  it('should handle invalid provider login', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/oauth/login',
      payload: {
        provider: 'invalid-provider',
        redirectTo: '/test-callback',
      },
    });

    assert.strictEqual(response.statusCode, 400, 'Should return 400 for invalid provider');

    const body = JSON.parse(response.body);
    assert.ok(body.error, 'Should return error message');
  });

  it('should get OAuth statistics', async () => {
    const stats = await oauthIntegration.getStats();

    assert.ok(stats, 'Should return statistics');
    assert.ok(stats.oauth, 'Should have OAuth statistics');
    assert.ok(stats.integration, 'Should have integration statistics');
    assert.ok(stats.timestamp, 'Should have timestamp');
  });

  it('should handle missing OAuth gracefully', async () => {
    // Create app without OAuth
    const testApp = fastify({ logger: false });
    const testAuthManager = new AuthenticationManager();
    const testOAuthIntegration = createOAuthFastifyIntegration(testAuthManager);

    // Initialize with OAuth disabled
    await testOAuthIntegration.initialize(testApp, { enableOAuth: false });

    const response = await testApp.inject({
      method: 'GET',
      url: '/auth/oauth/health',
    });

    // Should still respond but indicate OAuth is disabled
    assert.strictEqual(response.statusCode, 200, 'Should still respond');

    await testApp.close();
  });
});
