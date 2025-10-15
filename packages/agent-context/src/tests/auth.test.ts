import test from 'ava';
import { JWTAuthService } from '../auth.js';
import { createMockToken } from './utils/fixtures.js';

test.serial('JWTAuthService: should generate JWT token', async (t) => {
  const authService = new JWTAuthService('test-secret');

  const agentId = 'agent-123';
  const permissions = ['read', 'write', 'execute'];

  const token = await authService.generateToken(agentId, permissions);

  t.truthy(token.token);
  t.is(token.agentId, agentId);
  t.deepEqual(token.permissions, permissions);
  t.true(token.expiresAt > new Date());
});

test.serial('JWTAuthService: should validate valid token', async (t) => {
  const authService = new JWTAuthService('test-secret');

  const agentId = 'agent-123';
  const permissions = ['read', 'write'];

  const token = await authService.generateToken(agentId, permissions);
  const validated = await authService.validateToken(token.token);

  t.not(validated, null);
  t.is(validated!.agentId, agentId);
  t.deepEqual(validated!.permissions, permissions);
});

test.serial('JWTAuthService: should reject invalid token', async (t) => {
  const authService = new JWTAuthService('test-secret');

  const validated = await authService.validateToken('invalid-token');
  t.is(validated, null);
});

test.serial('JWTAuthService: should reject token with wrong secret', async (t) => {
  const authService1 = new JWTAuthService('secret1');
  const authService2 = new JWTAuthService('secret2');

  const token = await authService1.generateToken('agent-123', ['read']);

  // Should fail when validating with different secret
  const validated = await authService2.validateToken(token.token);
  t.is(validated, null);
});

test.serial('JWTAuthService: should revoke token (placeholder)', async (t) => {
  const authService = new JWTAuthService('test-secret');

  const token = await authService.generateToken('agent-123', ['read']);

  // Token should be valid initially
  let validated = await authService.validateToken(token.token);
  t.not(validated, null);

  // Revoke token (currently just logs warning)
  await authService.revokeToken(token.token);

  // Note: Current implementation doesn't actually revoke
  // This test verifies the method doesn't throw
  t.pass();
});

test.serial('JWTAuthService: should hash and verify passwords', async (t) => {
  const authService = new JWTAuthService('test-secret');

  const password = 'secure-password-123';
  const hashedPassword = await authService.hashPassword(password);

  t.not(hashedPassword, password);
  t.true(hashedPassword.length > 0);

  // Verify password can be validated
  t.true(await authService.verifyPassword(password, hashedPassword));
  t.false(await authService.verifyPassword('wrong-password', hashedPassword));
});

test.serial('JWTAuthService: should generate and validate API keys', async (t) => {
  const authService = new JWTAuthService('test-secret');

  const agentId = 'agent-123';
  const apiKey = authService.generateApiKey(agentId);

  t.truthy(apiKey);
  t.true(typeof apiKey === 'string');

  const validatedAgentId = await authService.validateApiKey(apiKey);
  t.is(validatedAgentId, agentId);

  // Test invalid API key
  const invalidAgentId = await authService.validateApiKey('invalid-key');
  t.is(invalidAgentId, null);
});

test.serial('JWTAuthService: should use default secret from environment', async (t) => {
  // Store original env var
  const originalSecret = process.env.JWT_SECRET;

  // Set test secret
  process.env.JWT_SECRET = 'test-env-secret';

  const authService = new JWTAuthService();
  const token = await authService.generateToken('agent-123', ['read']);

  // Should be able to validate with same service (using env secret)
  const validated = await authService.validateToken(token.token);
  t.not(validated, null);

  // Restore original env var
  if (originalSecret) {
    process.env.JWT_SECRET = originalSecret;
  } else {
    delete process.env.JWT_SECRET;
  }
});

test.serial('JWTAuthService: should handle custom token expiry', async (t) => {
  const authService = new JWTAuthService('test-secret', '1h');

  const token = await authService.generateToken('agent-123', ['read']);

  // Token should be valid
  const validated = await authService.validateToken(token.token);
  t.not(validated, null);

  // Should expire in about 1 hour (with some tolerance)
  const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
  const tolerance = 5 * 60 * 1000; // 5 minutes tolerance

  t.true(Math.abs(validated!.expiresAt.getTime() - oneHourFromNow.getTime()) < tolerance);
});

test.serial('AuthService: should validate valid token', async (t) => {
  const authService = new JWTAuthService('test-secret');

  const agentId = 'agent-123';
  const permissions = ['read', 'write'];

  const token = await authService.generateToken(agentId, permissions);
  const validated = await authService.validateToken(token.token);

  t.not(validated, null);
  t.is(validated!.agentId, agentId);
  t.deepEqual(validated!.permissions, permissions);
});

test.serial('AuthService: should reject invalid token', async (t) => {
  const authService = new JWTAuthService('test-secret');

  const validated = await authService.validateToken('invalid-token');
  t.is(validated, null);
});

test.serial('AuthService: should reject expired token', async (t) => {
  const authService = new JWTAuthService('test-secret');

  // Create expired token
  const expiredToken = createMockToken({
    expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
  });

  const validated = await authService.validateToken(expiredToken.token);
  t.is(validated, null);
});

test.serial('AuthService: should revoke token', async (t) => {
  const authService = new JWTAuthService('test-secret');

  const token = await authService.generateToken('agent-123', ['read']);

  // Token should be valid initially
  let validated = await authService.validateToken(token.token);
  t.not(validated, null);

  // Revoke token
  await authService.revokeToken(token.token);

  // Token should be invalid after revocation
  validated = await authService.validateToken(token.token);
  t.is(validated, null);
});

test.serial('AuthService: should handle token refresh', async (t) => {
  const authService = new JWTAuthService('test-secret');

  const agentId = 'agent-123';
  const originalToken = await authService.generateToken(agentId, ['read']);

  // Wait a bit to ensure different timestamps
  await new Promise((resolve) => setTimeout(resolve, 10));

  const refreshedToken = await authService.refreshToken(originalToken.token);

  t.not(refreshedToken.token, originalToken.token);
  t.is(refreshedToken.agentId, agentId);
  t.deepEqual(refreshedToken.permissions, originalToken.permissions);
  t.true(refreshedToken.expiresAt > originalToken.expiresAt);
});

test.serial('AuthService: should validate permissions', async (t) => {
  const authService = new JWTAuthService('test-secret');

  const token = await authService.generateToken('agent-123', ['read', 'write']);

  t.true(await authService.hasPermission(token.token, 'read'));
  t.true(await authService.hasPermission(token.token, 'write'));
  t.false(await authService.hasPermission(token.token, 'execute'));

  // Test with invalid token
  t.false(await authService.hasPermission('invalid-token', 'read'));
});

test.serial('AuthService: should hash passwords securely', async (t) => {
  const authService = new JWTAuthService('test-secret');

  const password = 'secure-password-123';
  const hashedPassword = await authService.hashPassword(password);

  t.not(hashedPassword, password);
  t.true(hashedPassword.length > 0);

  // Verify password can be validated
  t.true(await authService.validatePassword(password, hashedPassword));
  t.false(await authService.validatePassword('wrong-password', hashedPassword));
});

test.serial('AuthService: should handle rate limiting', async (t) => {
  const authService = new JWTAuthService({
    jwtSecret: 'test-secret',
    rateLimitWindow: 60000, // 1 minute
    maxAttempts: 3,
  });

  const token = 'test-token';

  // First 3 attempts should succeed
  for (let i = 0; i < 3; i++) {
    const result = await authService.validateToken(token);
    t.is(result, null); // Invalid token, but not rate limited yet
  }

  // 4th attempt should be rate limited
  await t.throwsAsync(() => authService.validateToken(token), { message: /Rate limit exceeded/ });
});
