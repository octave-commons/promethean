import test from 'ava';
import { SecurityValidator, RateLimiter, SecurityLogger } from '../security';
import { JWTAuthService } from '../auth';

test('SecurityValidator validates agent IDs correctly', (t) => {
  // Valid agent IDs
  t.is(SecurityValidator.validateAgentId('agent-123'), 'agent-123');
  t.is(SecurityValidator.validateAgentId('test_agent_456'), 'test_agent_456');
  t.is(SecurityValidator.validateAgentId('AgentName'), 'AgentName');

  // Invalid agent IDs
  t.throws(() => SecurityValidator.validateAgentId(''));
  t.throws(() => SecurityValidator.validateAgentId('a'.repeat(256)));
  t.throws(() => SecurityValidator.validateAgentId('agent/123'));
  t.throws(() => SecurityValidator.validateAgentId('agent..123'));
  t.throws(() => SecurityValidator.validateAgentId('agent\\123'));
  t.throws(() => SecurityValidator.validateAgentId('agent@123'));
});

test('SecurityValidator validates context keys correctly', (t) => {
  // Valid context keys
  t.is(SecurityValidator.validateContextKey('user.profile'), 'user.profile');
  t.is(SecurityValidator.validateContextKey('system:config'), 'system:config');
  t.is(SecurityValidator.validateContextKey('cache_key-123'), 'cache_key-123');

  // Invalid context keys
  t.throws(() => SecurityValidator.validateContextKey(''));
  t.throws(() => SecurityValidator.validateContextKey('a'.repeat(501)));
  t.throws(() => SecurityValidator.validateContextKey('key/invalid'));
  t.throws(() => SecurityValidator.validateContextKey('key@invalid'));
});

test('SecurityValidator prevents prototype pollution', (t) => {
  // Objects with dangerous properties should be rejected
  t.throws(() => SecurityValidator.validateContextValue({ __proto__: { dangerous: true } }));
  t.throws(() => SecurityValidator.validateContextValue({ constructor: { dangerous: true } }));
  t.throws(() => SecurityValidator.validateContextValue({ prototype: { dangerous: true } }));

  // Safe objects should pass
  t.notThrows(() => SecurityValidator.validateContextValue({ safe: 'value' }));
  t.notThrows(() => SecurityValidator.validateContextValue({ nested: { safe: true } }));
});

test('RateLimiter enforces rate limits', (t) => {
  const rateLimiter = new RateLimiter(1000, 3); // 1 second window, 3 attempts

  // First 3 attempts should succeed
  t.true(rateLimiter.isAllowed('test-key'));
  t.true(rateLimiter.isAllowed('test-key'));
  t.true(rateLimiter.isAllowed('test-key'));

  // 4th attempt should fail
  t.false(rateLimiter.isAllowed('test-key'));

  // Different keys should work independently
  t.true(rateLimiter.isAllowed('different-key'));

  // Check remaining attempts
  t.is(rateLimiter.getRemainingAttempts('test-key'), 0);
  t.is(rateLimiter.getRemainingAttempts('different-key'), 2);
});

test('RateLimiter resets after window expires', async (t) => {
  const rateLimiter = new RateLimiter(100, 2); // 100ms window, 2 attempts

  // Use up attempts
  t.true(rateLimiter.isAllowed('test-key'));
  t.true(rateLimiter.isAllowed('test-key'));
  t.false(rateLimiter.isAllowed('test-key'));

  // Wait for window to expire
  await new Promise((resolve) => setTimeout(resolve, 150));

  // Should work again
  t.true(rateLimiter.isAllowed('test-key'));
});

test('SecurityLogger logs and retrieves events', (t) => {
  // Clear any existing events
  SecurityLogger.clear();

  // Log some events
  SecurityLogger.log({
    type: 'authentication',
    severity: 'low',
    agentId: 'agent-123',
    action: 'login',
    details: { success: true },
  });

  SecurityLogger.log({
    type: 'authorization',
    severity: 'medium',
    agentId: 'agent-456',
    action: 'access_denied',
    details: { resource: 'sensitive-data' },
  });

  // Get all events
  const allEvents = SecurityLogger.getEvents();
  t.is(allEvents.length, 2);

  // Filter by type
  const authEvents = SecurityLogger.getEvents({ type: 'authentication' });
  t.is(authEvents.length, 1);
  t.is(authEvents[0].action, 'login');

  // Filter by agent
  const agentEvents = SecurityLogger.getEvents({ agentId: 'agent-123' });
  t.is(agentEvents.length, 1);
  t.is(agentEvents[0].agentId, 'agent-123');

  // Get statistics
  const stats = SecurityLogger.getStatistics();
  t.is(stats.total, 2);
  t.is(stats.byType.authentication, 1);
  t.is(stats.byType.authorization, 1);
  t.is(stats.bySeverity.low, 1);
  t.is(stats.bySeverity.medium, 1);
});

test('JWTAuthService generates and validates tokens securely', async (t) => {
  const authService = new JWTAuthService('test-secret-key');

  // Generate token
  const token = await authService.generateToken('agent-123', ['read', 'write']);

  t.is(token.agentId, 'agent-123');
  t.deepEqual(token.permissions, ['read', 'write']);
  t.true(token.expiresAt > new Date());

  // Validate token
  const validated = await authService.validateToken(token.token);
  t.not(validated, null);
  if (validated) {
    t.is(validated.agentId, 'agent-123');
    t.deepEqual(validated.permissions, ['read', 'write']);
  }

  // Revoke token
  await t.notThrowsAsync(() => authService.revokeToken(token.token));

  // Token should be invalid after revocation
  const revokedToken = await authService.validateToken(token.token);
  t.is(revokedToken, null);
});

test('JWTAuthService enforces rate limiting', async (t) => {
  const authService = new JWTAuthService('test-secret-key', '24h', 1000, 2);

  // First 2 attempts should succeed
  await t.notThrowsAsync(() => authService.generateToken('agent-1', ['read']));
  await t.notThrowsAsync(() => authService.generateToken('agent-1', ['read']));

  // 3rd attempt should fail
  await t.throwsAsync(() => authService.generateToken('agent-1', ['read']), {
    message: 'Rate limit exceeded',
  });

  // Different agent should still work
  await t.notThrowsAsync(() => authService.generateToken('agent-2', ['read']));
});

test('JWTAuthService validates inputs securely', async (t) => {
  const authService = new JWTAuthService('test-secret-key');

  // Invalid agent ID
  await t.throwsAsync(() => authService.generateToken('', ['read']));
  await t.throwsAsync(() => authService.generateToken('agent/invalid', ['read']));

  // Invalid permissions
  await t.throwsAsync(() => authService.generateToken('agent-123', ['']));
  await t.throwsAsync(() => authService.generateToken('agent-123', ['perm@invalid']));

  // Invalid token
  const invalidToken = await authService.validateToken('');
  t.is(invalidToken, null);

  const malformedToken = await authService.validateToken('not-a-valid-jwt');
  t.is(malformedToken, null);
});

test('SecurityValidator sanitizes strings correctly', (t) => {
  // Remove control characters
  const sanitized = SecurityValidator.sanitizeString('hello\x00world\x1f');
  t.is(sanitized, 'helloworld');

  // Remove invalid Unicode
  const sanitizedUnicode = SecurityValidator.sanitizeString('hello\ufffeworld');
  t.is(sanitizedUnicode, 'helloworld');

  // Trim whitespace
  const trimmed = SecurityValidator.sanitizeString('  hello world  ');
  t.is(trimmed, 'hello world');

  // Truncate long strings
  const longString = 'a'.repeat(100);
  const truncated = SecurityValidator.sanitizeString(longString, 50);
  t.is(truncated.length, 50);
});

test('SecurityValidator sanitizes objects correctly', (t) => {
  // Remove dangerous properties
  const dangerous = {
    __proto__: { dangerous: true },
    safe: 'value',
    nested: {
      __proto__: { dangerous: true },
      safe: 'nested-value',
    },
  };

  const sanitized = SecurityValidator.sanitizeObject(dangerous);
  t.not('__proto__' in sanitized, true);
  t.is((sanitized as any).safe, 'value');
  t.not('__proto__' in (sanitized as any).nested, true);
  t.is((sanitized as any).nested.safe, 'nested-value');
});
