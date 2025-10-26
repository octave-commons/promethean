import { AuthenticationFactory } from './dist/auth/factory.js';
import { getAuthConfig } from './dist/config/auth-config.js';

const testConfig = getAuthConfig();
testConfig.oauth = {
  ...testConfig.oauth,
  enabled: true,
  redirectUri: 'http://localhost:3000/auth/oauth/callback',
  trustedProviders: ['github'],
  autoCreateUsers: true,
  defaultRole: 'user',
  enableUserSync: false,
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
  ...testConfig.userRegistry,
  storagePath: './test-data/users',
  enableCustomRoles: true,
  enableActivityLogging: true,
  sessionTimeout: 3600,
  maxSessionsPerUser: 5,
  enableUserSearch: true,
  defaultRole: 'user',
  autoActivateUsers: true,
};

console.log('Testing AuthenticationFactory...');
try {
  const validation = AuthenticationFactory.validateOAuthConfig(testConfig);
  console.log('Validation:', validation);

  const system = await AuthenticationFactory.createSystem(testConfig);
  console.log('System created successfully');
  console.log('Components:', Object.keys(system));

  // Test JWT token generation
  if (system.jwtManager) {
    console.log('Testing JWT token generation...');
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

    const tokens = system.jwtManager.generateTokenPair(userInfo, 'test-session', oauthSession);
    console.log('Tokens generated:', {
      accessToken: !!tokens.accessToken,
      refreshToken: !!tokens.refreshToken,
    });

    const accessPayload = system.jwtManager.validateAccessToken(tokens.accessToken);
    console.log('Access token validation:', !!accessPayload);

    const refreshPayload = system.jwtManager.validateRefreshToken(tokens.refreshToken);
    console.log('Refresh token validation:', !!refreshPayload);
  }

  // Test User Registry
  if (system.userRegistry) {
    console.log('Testing User Registry...');
    const user = await system.userRegistry.createUser({
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      authMethod: 'oauth',
      provider: 'github',
      providerUserId: '12345',
    });
    console.log('User created:', user.username);

    const retrievedUser = await system.userRegistry.getUser(user.id);
    console.log('User retrieved:', !!retrievedUser);
  }
} catch (error) {
  console.error('Error:', error);
  console.error('Stack:', error.stack);
}
