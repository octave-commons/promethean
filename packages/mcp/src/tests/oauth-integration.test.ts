/**
 * OAuth Integration Tests
 *
 * Tests the complete OAuth authentication flow including
 * user registry, JWT tokens, and integration with existing auth.
 */

import test from 'ava';
import { AuthenticationFactory } from '../auth/factory.js';
import { getAuthConfig } from '../config/auth-config.js';
import { promises as fs } from 'node:fs';
import path from 'node:path';

// Test configuration
const testConfig = getAuthConfig();

// Override for testing
testConfig.oauth = {
  ...testConfig.oauth!,
  enabled: true,
  redirectUri: 'http://localhost:3000/auth/oauth/callback',
  trustedProviders: ['github'],
  autoCreateUsers: true,
  defaultRole: 'user',
  enableUserSync: false, // Disable for tests
  syncInterval: 3600,
  providers: {
    github: {
      enabled: true,
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret',
      scopes: ['user:email'],
      allowSignup: true,
    },
  },
  jwt: {
    secret: 'test_jwt_secret_at_least_32_characters_long',
    issuer: 'test-issuer',
    audience: 'test-audience',
    accessTokenExpiry: 3600,
    refreshTokenExpiry: 86400,
    algorithm: 'HS256',
  },
};

testConfig.userRegistry = {
  ...testConfig.userRegistry!,
  storagePath: './test-data/users',
  enableCustomRoles: true,
  enableActivityLogging: true,
  sessionTimeout: 3600,
  maxSessionsPerUser: 5,
  enableUserSearch: true,
  defaultRole: 'user',
  autoActivateUsers: true,
};

test.before(async () => {
  // Clean up test data
  const testPath = testConfig.userRegistry!.storagePath;
  try {
    await fs.rm(testPath, { recursive: true, force: true });
  } catch {
    // Ignore if directory doesn't exist
  }
});

test.after(async () => {
  // Clean up test data
  const testPath = testConfig.userRegistry!.storagePath;
  try {
    await fs.rm(testPath, { recursive: true, force: true });
  } catch {
    // Ignore if directory doesn't exist
  }
});

test('AuthenticationFactory creates complete system', async (t) => {
  const validation = AuthenticationFactory.validateOAuthConfig(testConfig);
  t.true(validation.valid, `OAuth config should be valid: ${validation.errors.join(', ')}`);

  const system = await AuthenticationFactory.createSystem(testConfig);

  t.truthy(system.authManager, 'Authentication manager should be created');
  t.truthy(system.oauthSystem, 'OAuth system should be created');
  t.truthy(system.jwtManager, 'JWT manager should be created');
  t.truthy(system.userRegistry, 'User registry should be created');
  t.truthy(system.oauthIntegration, 'OAuth integration should be created');
});

test('OAuth system starts and stops flows', async (t) => {
  const system = await AuthenticationFactory.createSystem(testConfig);

  t.truthy(system.oauthSystem, 'OAuth system should be available');

  const availableProviders = system.oauthSystem!.getAvailableProviders();
  t.true(availableProviders.includes('github'), 'GitHub should be available');
  t.true(system.oauthSystem!.isProviderAvailable('github'), 'GitHub should be available');

  // Start OAuth flow
  const flow = system.oauthSystem!.startOAuthFlow('github');
  t.truthy(flow.authUrl, 'Auth URL should be generated');
  t.truthy(flow.state, 'State should be generated');
  t.true(flow.authUrl.includes('github.com'), 'Auth URL should be for GitHub');
  t.true(flow.authUrl.includes(flow.state), 'State should be in URL');
});

test('User registry CRUD operations', async (t) => {
  const system = await AuthenticationFactory.createSystem(testConfig);

  t.truthy(system.userRegistry, 'User registry should be available');

  // Create user
  const user = await system.userRegistry!.createUser({
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    authMethod: 'oauth',
    provider: 'github',
    providerUserId: '12345',
  });

  t.is(user.username, 'testuser');
  t.is(user.email, 'test@example.com');
  t.is(user.role, 'user');
  t.is(user.authMethod, 'oauth');
  t.is(user.provider, 'github');
  t.is(user.providerUserId, '12345');

  // Get user by ID
  const retrievedUser = await system.userRegistry!.getUser(user.id);
  t.truthy(retrievedUser);
  t.is(retrievedUser!.id, user.id);

  // Get user by email
  const userByEmail = await system.userRegistry!.getUserByEmail('test@example.com');
  t.truthy(userByEmail);
  t.is(userByEmail!.id, user.id);

  // Get user by provider
  const userByProvider = await system.userRegistry!.getUserByProvider('github', '12345');
  t.truthy(userByProvider);
  t.is(userByProvider!.id, user.id);

  // Update user
  const updatedUser = await system.userRegistry!.updateUser(user.id, {
    name: 'Updated Test User',
  });
  t.is(updatedUser.name, 'Updated Test User');

  // Search users
  const searchResult = await system.userRegistry!.searchUsers({
    search: 'test',
  });
  t.is(searchResult.users.length, 1);
  t.is(searchResult.users[0].id, user.id);

  // Create session
  const session = await system.userRegistry!.createSession(
    user.id,
    'oauth',
    'github',
    '127.0.0.1',
    'test-agent',
  );
  t.truthy(session.sessionId);
  t.is(session.userId, user.id);
  t.is(session.authMethod, 'oauth');
  t.is(session.provider, 'github');

  // Get session
  const retrievedSession = await system.userRegistry!.getSession(session.sessionId);
  t.truthy(retrievedSession);
  t.is(retrievedSession!.sessionId, session.sessionId);

  // Get user sessions
  const userSessions = system.userRegistry!.getUserSessions(user.id);
  t.is(userSessions.length, 1);
  t.is(userSessions[0].sessionId, session.sessionId);

  // Revoke session
  const revoked = await system.userRegistry!.revokeSession(session.sessionId);
  t.true(revoked);

  const revokedSession = await system.userRegistry!.getSession(session.sessionId);
  t.falsy(revokedSession);

  // Delete user
  const deleted = await system.userRegistry!.deleteUser(user.id);
  t.true(deleted);

  const deletedUser = await system.userRegistry!.getUser(user.id);
  t.falsy(deletedUser);
});

test('JWT token generation and validation', async (t) => {
  const system = await AuthenticationFactory.createSystem(testConfig);

  t.truthy(system.jwtManager, 'JWT manager should be available');

  // Mock OAuth user info and session
  const userInfo = {
    id: '12345',
    username: 'testuser',
    email: 'test@example.com',
    provider: 'github',
    raw: {},
    metadata: {},
  };

  const oauthSession = {
    sessionId: 'test-session-id',
    userId: '12345',
    provider: 'github',
    accessToken: 'test-access-token',
    createdAt: new Date(),
    lastAccessAt: new Date(),
    metadata: {},
  };

  // Generate tokens
  const tokens = system.jwtManager!.generateTokenPair(userInfo, 'test-session', oauthSession);

  t.truthy(tokens.accessToken);
  t.truthy(tokens.refreshToken);
  t.is(tokens.tokenType, 'Bearer');
  t.is(tokens.expiresIn, 3600);

  // Validate access token
  const accessPayload = system.jwtManager!.validateAccessToken(tokens.accessToken);
  t.truthy(accessPayload);
  t.is(accessPayload!.sub, '12345');
  t.is(accessPayload!.provider, 'github');
  t.is(accessPayload!.type, 'access');

  // Validate refresh token
  const refreshPayload = system.jwtManager!.validateRefreshToken(tokens.refreshToken);
  t.truthy(refreshPayload);
  t.is(refreshPayload!.sub, '12345');
  t.is(refreshPayload!.provider, 'github');
  t.is(refreshPayload!.type, 'refresh');

  // Refresh access token
  const newTokens = system.jwtManager!.refreshAccessToken(tokens.refreshToken, userInfo);
  t.truthy(newTokens);
  t.truthy(newTokens!.accessToken);
  t.truthy(newTokens!.refreshToken);
  t.not(newTokens!.accessToken, tokens.accessToken); // Should be different
});

test('OAuth integration flow', async (t) => {
  const system = await AuthenticationFactory.createSystem(testConfig);

  t.truthy(system.oauthIntegration, 'OAuth integration should be available');

  // Start OAuth flow
  const flow = system.oauthIntegration!.startOAuthFlow('github');
  t.truthy(flow.authUrl);
  t.truthy(flow.state);

  // Note: In a real test, we would mock the OAuth provider responses
  // For now, we'll test the integration structure

  const stats = await system.oauthIntegration!.getIntegrationStats();
  t.is(stats.totalOAuthUsers, 0);
  t.is(stats.activeOAuthSessions, 0);
  t.deepEqual(stats.usersByProvider, {});
  t.is(stats.recentLogins, 0);
});

test('Configuration validation', (t) => {
  // Test valid configuration
  const validConfig = AuthenticationFactory.validateOAuthConfig(testConfig);
  t.true(validConfig.valid);

  // Test invalid configuration (missing JWT secret)
  const invalidConfig = {
    ...testConfig,
    oauth: {
      ...testConfig.oauth!,
      jwt: {
        ...testConfig.oauth!.jwt!,
        secret: '',
      },
    },
  };

  const invalidResult = AuthenticationFactory.validateOAuthConfig(invalidConfig);
  t.false(invalidResult.valid);
  t.true(invalidResult.errors.some((error) => error.includes('JWT secret')));

  // Test configuration without OAuth
  const noOAuthConfig = {
    ...testConfig,
    oauth: undefined,
  };

  const noOAuthResult = AuthenticationFactory.validateOAuthConfig(noOAuthConfig);
  t.true(noOAuthResult.valid);
});

test('Environment file generation', (t) => {
  const envFile = AuthenticationFactory.createExampleEnvFile();
  t.truthy(envFile);
  t.true(envFile.includes('MCP_OAUTH_ENABLED'));
  t.true(envFile.includes('MCP_OAUTH_GITHUB_CLIENT_ID'));
  t.true(envFile.includes('MCP_OAUTH_JWT_SECRET'));
  t.true(envFile.includes('MCP_USER_REGISTRY_PATH'));
});

test('JWT secret generation', (t) => {
  const secret1 = AuthenticationFactory.generateJwtSecret();
  const secret2 = AuthenticationFactory.generateJwtSecret();

  t.true(secret1.length >= 64); // Should be at least 32 bytes = 64 hex chars
  t.true(secret2.length >= 64);
  t.not(secret1, secret2); // Should be different each time
  t.true(/^[a-f0-9]+$/i.test(secret1)); // Should be hex
  t.true(/^[a-f0-9]+$/i.test(secret2));
});

test('Directory setup', async (t) => {
  await AuthenticationFactory.setupOAuthDirectories(testConfig);

  const storagePath = testConfig.userRegistry!.storagePath;
  const stat = await fs.stat(storagePath);
  t.true(stat.isDirectory());

  const gitkeepPath = path.join(storagePath, '.gitkeep');
  try {
    const gitkeepStat = await fs.stat(gitkeepPath);
    t.true(gitkeepStat.isFile());
  } catch {
    t.fail('.gitkeep file should be created');
  }
});
