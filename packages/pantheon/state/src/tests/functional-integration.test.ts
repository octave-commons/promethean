import test from 'ava';

// Integration test to verify functional migration works
import {
  SecurityValidator,
  RateLimiter,
  validateAgentId,
  validateContextKey,
} from '../security.js';
import { createRateLimiter, getRateLimiter } from '../security-functional.js';

test('Functional SecurityValidator works correctly', (t) => {
  // Test functional action
  const result = validateAgentId(
    { agentId: 'test-agent-123' },
    { schemas: { AgentIdSchema: require('../security.js').AgentIdSchema } },
  );
  t.is(result, 'test-agent-123');

  // Test legacy compatibility
  t.is(SecurityValidator.validateAgentId('test-agent-456'), 'test-agent-456');
});

test('Functional RateLimiter works correctly', (t) => {
  // Test functional factory
  const rateLimiter = createRateLimiter({ windowMs: 1000, maxAttempts: 3 });
  t.true(rateLimiter.isAllowed('test-key'));
  t.true(rateLimiter.isAllowed('test-key'));
  t.true(rateLimiter.isAllowed('test-key'));
  t.false(rateLimiter.isAllowed('test-key'));

  // Test singleton factory
  const singletonLimiter = getRateLimiter({ identifier: 'test', windowMs: 1000, maxAttempts: 2 });
  t.true(singletonLimiter.isAllowed('singleton-key'));
  t.true(singletonLimiter.isAllowed('singleton-key'));
  t.false(singletonLimiter.isAllowed('singleton-key'));
});

test('Legacy compatibility exports work', (t) => {
  // Test that legacy exports still work for backward compatibility
  t.true(typeof SecurityValidator.validateAgentId === 'function');
  t.true(typeof SecurityValidator.validateContextKey === 'function');
  t.true(typeof SecurityValidator.validateContextValue === 'function');
  t.true(typeof SecurityValidator.sanitizeString === 'function');
  t.true(typeof SecurityValidator.sanitizeObject === 'function');

  // Test RateLimiter legacy class
  const legacyLimiter = RateLimiter.getInstance('legacy-test', 1000, 3);
  t.true(typeof legacyLimiter.isAllowed === 'function');
  t.true(typeof legacyLimiter.getRemainingAttempts === 'function');
  t.true(typeof legacyLimiter.reset === 'function');
});

test('Functional patterns are pure and composable', (t) => {
  // Test that functional patterns don't have side effects
  const input1 = { agentId: 'test-agent-1' };
  const input2 = { agentId: 'test-agent-2' };

  const scope = { schemas: { AgentIdSchema: require('../security.js').AgentIdSchema } };

  const result1 = validateAgentId(input1, scope);
  const result2 = validateAgentId(input2, scope);

  t.is(result1, 'test-agent-1');
  t.is(result2, 'test-agent-2');

  // Original inputs should be unchanged
  t.is(input1.agentId, 'test-agent-1');
  t.is(input2.agentId, 'test-agent-2');
});
