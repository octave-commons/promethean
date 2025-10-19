import test from 'ava';
import { createOpenAICompliantServer } from '../server/createServer.js';
import { AuthMiddleware } from '../auth/authMiddleware.js';
import { RateLimitingService } from '../security/rateLimiting.js';
import { InputValidationService } from '../security/inputValidation.js';
import { SecurityHeadersService } from '../security/securityHeaders.js';
import { ContentSanitizer } from '../security/contentSanitizer.js';
import { createSecurityConfig } from '../security/config.js';

test('authentication middleware - valid API key', async (t) => {
  const config = createSecurityConfig();
  const auth = new AuthMiddleware(config.auth);

  const mockRequest = {
    headers: { 'x-api-key': config.auth.apiKeys[0] },
  } as any;

  const result = await auth.authenticate(mockRequest);

  t.true(result.success);
  t.truthy(result.user);
  t.is(result.user?.apiKey, config.auth.apiKeys[0]);
});

test('authentication middleware - invalid API key', async (t) => {
  const config = createSecurityConfig();
  const auth = new AuthMiddleware(config.auth);

  const mockRequest = {
    headers: { 'x-api-key': 'invalid-key' },
  } as any;

  const result = await auth.authenticate(mockRequest);

  t.false(result.success);
  t.is(result.error, 'Invalid API key');
  t.is(result.statusCode, 401);
});

test('authentication middleware - missing credentials', async (t) => {
  const config = createSecurityConfig();
  const auth = new AuthMiddleware(config.auth);

  const mockRequest = {
    headers: {},
  } as any;

  const result = await auth.authenticate(mockRequest);

  t.false(result.success);
  t.is(result.error, 'No authentication credentials provided');
  t.is(result.statusCode, 401);
});

test('rate limiting service - basic functionality', async (t) => {
  const rateLimiter = new RateLimitingService({
    global: { max: 2, window: '1m' },
    user: { max: 1, window: '1m' },
    endpoint: { max: 1, window: '1m' },
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  });

  const mockRequest = {
    method: 'POST',
    routeOptions: { url: '/v1/chat/completions' },
    ip: '127.0.0.1',
  } as any;

  // First request should be allowed
  const result1 = await rateLimiter.checkRateLimit(mockRequest, 'global');
  t.true(result1.allowed);
  t.is(result1.remaining, 1);

  // Second request should be allowed
  const result2 = await rateLimiter.checkRateLimit(mockRequest, 'global');
  t.true(result2.allowed);
  t.is(result2.remaining, 0);

  // Third request should be rate limited
  const result3 = await rateLimiter.checkRateLimit(mockRequest, 'global');
  t.false(result3.allowed);
  t.is(result3.remaining, 0);

  rateLimiter.destroy();
});

test('input validation service - valid chat completion', async (t) => {
  const config = createSecurityConfig();
  const validator = new InputValidationService(config.validation);

  const validBody = {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello, world!' },
    ],
    temperature: 0.7,
    max_tokens: 100,
  };

  const result = validator.validateChatCompletionInput(validBody);

  t.true(result.isValid);
  t.is(result.errors, undefined);
});

test('input validation service - invalid chat completion', async (t) => {
  const config = createSecurityConfig();
  const validator = new InputValidationService(config.validation);

  const invalidBody = {
    model: '', // Invalid: empty model
    messages: [], // Invalid: empty messages
    temperature: 3, // Invalid: temperature > 2
    max_tokens: -1, // Invalid: negative tokens
  };

  const result = validator.validateChatCompletionInput(invalidBody);

  t.false(result.isValid);
  t.truthy(result.errors);
  t.true(result.errors!.length > 0);
});

test('input validation service - malicious content detection', async (t) => {
  const config = createSecurityConfig();
  const validator = new InputValidationService(config.validation);

  const maliciousBody = {
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: "<script>alert('xss')</script> DROP TABLE users;",
      },
    ],
  };

  const result = validator.validateChatCompletionInput(maliciousBody);

  // Should detect malicious content
  t.false(result.isValid);
  t.truthy(result.errors);
});

test('security headers service - default headers', async (t) => {
  const config = createSecurityConfig();
  const headersService = new SecurityHeadersService(config.headers);

  const headers = headersService.getHeaders();

  t.is(headers['X-Content-Type-Options'], 'nosniff');
  t.is(headers['X-Frame-Options'], 'DENY');
  t.is(headers['X-XSS-Protection'], '1; mode=block');
  t.is(headers['Referrer-Policy'], 'strict-origin-when-cross-origin');
  t.truthy(headers['Content-Security-Policy']);
});

test('content sanitizer - HTML sanitization', async (t) => {
  const maliciousHtml = '<script>alert("xss")</script><p>Hello <b>world</b></p>';
  const sanitized = ContentSanitizer.sanitizeHtml(maliciousHtml);

  t.false(sanitized.includes('<script>'));
  t.true(sanitized.includes('<p>'));
  t.true(sanitized.includes('<b>'));
});

test('content sanitizer - chat message sanitization', async (t) => {
  const maliciousMessages = [
    { role: 'user', content: "<script>alert('xss')</script>Hello" },
    { role: 'assistant', content: 'Response with <b>bold</b> text' },
  ];

  const sanitized = ContentSanitizer.sanitizeChatMessages(maliciousMessages);

  t.is(sanitized.length, 2);
  t.false(sanitized[0].content.includes('<script>'));
  t.true(sanitized[0].content.includes('Hello'));
  t.true(sanitized[1].content.includes('bold'));
});

test('server with security - basic functionality', async (t) => {
  const { app } = createOpenAICompliantServer({
    security: {
      enabled: true,
      requireAuth: true,
    },
  });

  try {
    await app.ready();

    // Test health endpoint (should be accessible)
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    t.is(response.statusCode, 200);
    t.truthy(response.json());
  } finally {
    await app.close();
  }
});

test('server with security - protected endpoint requires auth', async (t) => {
  const { app } = createOpenAICompliantServer({
    security: {
      enabled: true,
      requireAuth: true,
    },
  });

  try {
    await app.ready();

    // Test chat completion endpoint without auth (should fail)
    const response = await app.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      payload: {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
      },
    });

    t.is(response.statusCode, 401);
    t.truthy(response.json().error);
  } finally {
    await app.close();
  }
});

test('server without security - open access', async (t) => {
  const { app } = createOpenAICompliantServer({
    security: {
      enabled: false,
    },
  });

  try {
    await app.ready();

    // Test chat completion endpoint without auth (should work but may fail due to missing handler)
    const response = await app.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      payload: {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
      },
    });

    // Should not be 401 (auth error), may be 500 due to missing handler or other issues
    t.not(response.statusCode, 401);
  } finally {
    await app.close();
  }
});
