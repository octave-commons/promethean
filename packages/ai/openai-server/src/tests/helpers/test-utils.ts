import { FastifyInstance } from 'fastify';
import { jwtSign } from '../auth/jwtService.js';
import { UserRole } from '../types/security.js';

export interface TestUser {
  id: string;
  username: string;
  role: UserRole;
}

export interface TestServerOptions {
  security?: {
    enabled?: boolean;
    jwtSecret?: string;
    rateLimiting?: {
      enabled?: boolean;
      global?: { max: number; window: string };
      user?: { max: number; window: string };
      endpoint?: { max: number; window: string };
    };
    cors?: {
      enabled?: boolean;
      origins?: string[];
    };
    headers?: {
      enabled?: boolean;
    };
  };
}

export async function createTestServer(options: TestServerOptions = {}): Promise<FastifyInstance> {
  const { createServer } = await import('../server/createServer.js');
  
  return createServer({
    logger: false, // Disable logging for tests
    security: options.security || {
      enabled: true,
      jwtSecret: 'test-jwt-secret-key',
      rateLimiting: { enabled: false }, // Disable for most tests unless specified
      cors: { enabled: false }, // Disable for most tests unless specified
      headers: { enabled: false } // Disable for most tests unless specified
    }
  });
}

export function createAuthenticatedUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    id: 'test-user-123',
    username: 'testuser',
    role: 'user',
    ...overrides
  };
}

export function createTestToken(overrides: Partial<TestUser> = {}): string {
  const user = createAuthenticatedUser(overrides);
  return jwtSign(
    { 
      sub: user.id, 
      username: user.username, 
      role: user.role 
    },
    'test-jwt-secret-key',
    { expiresIn: '1h' }
  );
}

export function mockOpenAIResponse(message: string = 'Hello from AI!') {
  return {
    id: 'chatcmpl-test123',
    object: 'chat.completion',
    created: Date.now() / 1000,
    model: 'gpt-3.5-turbo',
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: message
      },
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: 10,
      completion_tokens: 5,
      total_tokens: 15
    }
  };
}

export async function createTestServerWithAuth(): Promise<{ server: FastifyInstance; token: string; user: TestUser }> {
  const server = await createTestServer({
    security: {
      enabled: true,
      jwtSecret: 'test-secret',
      rateLimiting: { enabled: false },
      cors: { enabled: false },
      headers: { enabled: false }
    }
  });
  
  const user = createAuthenticatedUser();
  const token = createTestToken(user);
  
  return { server, token, user };
}

export function expectSecurityHeaders(response: any) {
  return {
    toHaveFrameOptions: (expected: string) => {
      if (response.headers['x-frame-options'] !== expected) {
        throw new Error(`Expected x-frame-options header to be ${expected}, got ${response.headers['x-frame-options']}`);
      }
    },
    toHaveContentTypeOptions: (expected: string) => {
      if (response.headers['x-content-type-options'] !== expected) {
        throw new Error(`Expected x-content-type-options header to be ${expected}, got ${response.headers['x-content-type-options']}`);
      }
    },
    toHaveXSSProtection: (expected: string) => {
      if (response.headers['x-xss-protection'] !== expected) {
        throw new Error(`Expected x-xss-protection header to be ${expected}, got ${response.headers['x-xss-protection']}`);
      }
    },
    toHaveCSP: () => {
      if (!response.headers['content-security-policy']) {
        throw new Error('Expected content-security-policy header to be present');
      }
    }
  };
}

export function expectRateLimitHeaders(response: any) {
  return {
    toHaveRateLimitHeaders: () => {
      if (!response.headers['x-ratelimit-limit']) {
        throw new Error('Expected x-ratelimit-limit header to be present');
      }
      if (!response.headers['x-ratelimit-remaining']) {
        throw new Error('Expected x-ratelimit-remaining header to be present');
      }
      if (!response.headers['x-ratelimit-reset']) {
        throw new Error('Expected x-ratelimit-reset header to be present');
      }
    }
  };
}

export function expectCORSHeaders(response: any, expectedOrigin: string) {
  return {
    toHaveCORSHeaders: () => {
      if (response.headers['access-control-allow-origin'] !== expectedOrigin) {
        throw new Error(`Expected access-control-allow-origin header to be ${expectedOrigin}, got ${response.headers['access-control-allow-origin']}`);
      }
      if (!response.headers['access-control-allow-methods']) {
        throw new Error('Expected access-control-allow-methods header to be present');
      }
      if (!response.headers['access-control-allow-headers']) {
        throw new Error('Expected access-control-allow-headers header to be present');
      }
    }
  };
}