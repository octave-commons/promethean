import test from 'ava';
import { FastifyInstance } from 'fastify';
import { 
  createTestServer, 
  createAuthenticatedUser,
  createTestToken,
  mockOpenAIResponse 
} from '../tests/helpers/test-utils.js';

// Security Tests
test.before(async (t) => {
  // Setup test server with security features enabled
  const server = await createTestServer({
    security: {
      enabled: true,
      jwtSecret: 'test-secret',
      rateLimiting: {
        enabled: true,
        global: { max: 100, window: '15m' },
        user: { max: 50, window: '15m' },
        endpoint: { max: 20, window: '1m' }
      },
      cors: {
        enabled: true,
        origins: ['http://localhost:3000', 'http://localhost:3001']
      },
      headers: {
        enabled: true
      }
    }
  });
  
  t.context.server = server;
});

test.after.always(async (t) => {
  if (t.context.server) {
    await t.context.server.close();
  }
});

test('security: JWT authentication works', async (t) => {
  const { server } = t.context;
  
  // Test login with valid credentials
  const loginResponse = await server.inject({
    method: 'POST',
    url: '/auth/login',
    payload: {
      username: 'testuser',
      password: 'testpass'
    }
  });
  
  t.is(loginResponse.statusCode, 200);
  const { token } = JSON.parse(loginResponse.payload);
  t.truthy(token);
  
  // Test protected endpoint with valid token
  const protectedResponse = await server.inject({
    method: 'POST',
    url: '/v1/chat/completions',
    headers: {
      authorization: `Bearer ${token}`
    },
    payload: {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }]
    }
  });
  
  t.is(protectedResponse.statusCode, 200);
});

test('security: Invalid JWT is rejected', async (t) => {
  const { server } = t.context;
  
  const response = await server.inject({
    method: 'POST',
    url: '/v1/chat/completions',
    headers: {
      authorization: 'Bearer invalid-token'
    },
    payload: {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }]
    }
  });
  
  t.is(response.statusCode, 401);
});

test('security: Rate limiting works', async (t) => {
  const { server } = t.context;
  
  // Make multiple rapid requests to trigger rate limiting
  const requests = Array.from({ length: 25 }, () => 
    server.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      headers: {
        authorization: `Bearer ${createTestToken()}`
      },
      payload: {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }]
      }
    })
  );
  
  const responses = await Promise.all(requests);
  
  // Some requests should be rate limited
  const rateLimitedResponses = responses.filter(r => r.statusCode === 429);
  t.true(rateLimitedResponses.length > 0);
  
  // Check rate limit headers
  const rateLimitedResponse = rateLimitedResponses[0];
  t.truthy(rateLimitedResponse.headers['x-ratelimit-limit']);
  t.truthy(rateLimitedResponse.headers['x-ratelimit-remaining']);
  t.truthy(rateLimitedResponse.headers['x-ratelimit-reset']);
});

test('security: CORS headers are set', async (t) => {
  const { server } = t.context;
  
  const response = await server.inject({
    method: 'OPTIONS',
    url: '/v1/chat/completions',
    headers: {
      origin: 'http://localhost:3000'
    }
  });
  
  t.is(response.statusCode, 204);
  t.is(response.headers['access-control-allow-origin'], 'http://localhost:3000');
  t.is(response.headers['access-control-allow-methods'], 'GET, POST, PUT, DELETE, OPTIONS');
  t.is(response.headers['access-control-allow-headers'], 'Content-Type, Authorization');
});

test('security: Security headers are present', async (t) => {
  const { server } = t.context;
  
  const response = await server.inject({
    method: 'GET',
    url: '/health'
  });
  
  // Check for important security headers
  t.is(response.headers['x-frame-options'], 'DENY');
  t.is(response.headers['x-content-type-options'], 'nosniff');
  t.is(response.headers['x-xss-protection'], '1; mode=block');
  t.truthy(response.headers['content-security-policy']);
});

test('security: Input validation blocks malicious content', async (t) => {
  const { server } = t.context;
  
  // Test XSS attempt
  const xssResponse = await server.inject({
    method: 'POST',
    url: '/v1/chat/completions',
    headers: {
      authorization: `Bearer ${createTestToken()}`
    },
    payload: {
      model: 'gpt-3.5-turbo',
      messages: [{ 
        role: 'user', 
        content: '<script>alert("xss")</script>Hello' 
      }]
    }
  });
  
  t.is(xssResponse.statusCode, 400);
  
  // Test SQL injection attempt
  const sqlResponse = await server.inject({
    method: 'POST',
    url: '/v1/chat/completions',
    headers: {
      authorization: `Bearer ${createTestToken()}`
    },
    payload: {
      model: 'gpt-3.5-turbo',
      messages: [{ 
        role: 'user', 
        content: "'; DROP TABLE users; --" 
      }]
    }
  });
  
  t.is(sqlResponse.statusCode, 400);
});

test('security: Role-based access control works', async (t) => {
  const { server } = t.context;
  
  // Create admin user
  const adminToken = createTestToken({ role: 'admin' });
  
  // Create readonly user
  const readonlyToken = createTestToken({ role: 'readonly' });
  
  // Test admin access to admin-only endpoint
  const adminResponse = await server.inject({
    method: 'GET',
    url: '/admin/stats',
    headers: {
      authorization: `Bearer ${adminToken}`
    }
  });
  
  t.is(adminResponse.statusCode, 200);
  
  // Test readonly user denied access to admin endpoint
  const readonlyResponse = await server.inject({
    method: 'GET',
    url: '/admin/stats',
    headers: {
      authorization: `Bearer ${readonlyToken}`
    }
  });
  
  t.is(readonlyResponse.statusCode, 403);
});

test('security: Content sanitization works', async (t) => {
  const { server } = t.context;
  
  const response = await server.inject({
    method: 'POST',
    url: '/v1/chat/completions',
    headers: {
      authorization: `Bearer ${createTestToken()}`
    },
    payload: {
      model: 'gpt-3.5-turbo',
      messages: [{ 
        role: 'user', 
        content: 'Hello with <b>bold</b> and <script>alert("xss")</script>' 
      }]
    }
  });
  
  t.is(response.statusCode, 200);
  
  const result = JSON.parse(response.payload);
  // Content should be sanitized
  t.notRegex(result.choices[0].message.content, /<script>/);
  t.notRegex(result.choices[0].message.content, /javascript:/);
  // But valid HTML like bold should remain if allowed
  t.true(result.choices[0].message.content.includes('bold'));
});

test('security: API key authentication works', async (t) => {
  const { server } = t.context;
  
  // Test with API key instead of JWT
  const response = await server.inject({
    method: 'POST',
    url: '/v1/chat/completions',
    headers: {
      'x-api-key': 'test-api-key-12345'
    },
    payload: {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }]
    }
  });
  
  t.is(response.statusCode, 200);
});

test('security: Request size limits are enforced', async (t) => {
  const { server } = t.context;
  
  // Create a very large payload
  const largePayload = {
    model: 'gpt-3.5-turbo',
    messages: [{ 
      role: 'user', 
      content: 'x'.repeat(1000000) // 1MB of text
    }]
  };
  
  const response = await server.inject({
    method: 'POST',
    url: '/v1/chat/completions',
    headers: {
      authorization: `Bearer ${createTestToken()}`
    },
    payload: largePayload
  });
  
  t.is(response.statusCode, 413); // Payload Too Large
});