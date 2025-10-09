import test from "ava";
import { createApp, createAuthManager } from "../src/app.js";
import { config } from "../src/config.js";

test("integration: complete authentication flow", async (t) => {
  const app = createApp();
  const authManager = createAuthManager();
  
  // Create test user
  const user = {
    id: "integration-user-789",
    username: "integrationtest",
    email: "integration@test.com",
    roles: ["user"],
    metadata: { integrationTest: true },
  };
  
  // Test login endpoint
  const loginResponse = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: {
      username: user.username,
      password: 'testpassword',
    },
  });
  
  t.is(loginResponse.statusCode, 200, "Login should succeed");
  
  const loginData = JSON.parse(loginResponse.payload);
  t.truthy(loginData.tokens.accessToken, "Access token should be returned");
  t.truthy(loginData.tokens.refreshToken, "Refresh token should be returned");
  t.is(loginData.user.id, user.id, "User data should be returned");
  
  // Test current user endpoint
  const meResponse = await app.inject({
    method: 'GET',
    url: '/auth/me',
    headers: {
      'Authorization': `Bearer ${loginData.tokens.accessToken}`,
    },
  });
  
  t.is(meResponse.statusCode, 200, "Me endpoint should succeed");
  
  const meData = JSON.parse(meResponse.payload);
  t.is(meData.user.id, user.id, "User ID should match");
  t.is(meData.user.username, user.username, "Username should match");
  t.deepEqual(meData.user.roles, user.roles, "Roles should match");
  t.true(meData.permissions.length > 0, "Permissions should be present");
  
  // Test protected resource access
  const protectedResponse = await app.inject({
    method: 'GET',
    url: '/protected',
    headers: {
      'Authorization': `Bearer ${loginData.tokens.accessToken}`,
    },
  });
  
  t.is(protectedResponse.statusCode, 200, "Protected resource should be accessible");
  
  const protectedData = JSON.parse(protectedResponse.payload);
  t.is(protectedData.user.id, user.id, "User should be identified in protected route");
  
  // Test token refresh
  const refreshResponse = await app.inject({
    method: 'POST',
    url: '/auth/refresh',
    payload: {
      refreshToken: loginData.tokens.refreshToken,
    },
  });
  
  t.is(refreshResponse.statusCode, 200, "Token refresh should succeed");
  
  const refreshData = JSON.parse(refreshResponse.payload);
  t.is(refreshData.user.id, user.id, "Refreshed token should identify same user");
  
  // Test logout
  const logoutResponse = await app.inject({
    method: 'POST',
    url: '/auth/logout',
    headers: {
      'Authorization': `Bearer ${loginData.tokens.accessToken}`,
    },
  });
  
  t.is(logoutResponse.statusCode, 200, "Logout should succeed");
  
  await app.close();
});

test("integration: API key authentication", async (t) => {
  const app = createApp();
  const authManager = createAuthManager();
  
  // Generate API key for test service
  const serviceId = "integration-service";
  const permissions = ["api:*:read", "health:*:read", "api:protected:read"];
  
  const apiKey = authManager.generateAPIKey(serviceId, permissions);
  
  // Test API key authentication
  const protectedResponse = await app.inject({
    method: 'GET',
    url: '/protected',
    headers: {
      'x-api-key': apiKey,
    },
  });
  
  t.is(protectedResponse.statusCode, 200, "API key should grant access to protected route");
  
  const protectedData = JSON.parse(protectedResponse.payload);
  t.is(protectedData.user.id, serviceId, "Service ID should be identified");
  t.is(protectedData.user.tokenType, "apikey", "Token type should be apikey");
  t.deepEqual(Array.from(protectedData.user.roles), ["service"], "Service role should be assigned");
  
  // Test API key generation endpoint (admin only)
  const adminUser = {
    id: "admin-user-999",
    username: "admin",
    roles: ["admin"],
  };
  
  const adminTokens = authManager.generateTokens(adminUser);
  
  const apiKeyResponse = await app.inject({
    method: 'POST',
    url: '/auth/apikey',
    headers: {
      'Authorization': `Bearer ${adminTokens.accessToken}`,
    },
    payload: {
      serviceId: "test-service",
      permissions: ["api:*:read", "api:*:write"],
    },
  });
  
  t.is(apiKeyResponse.statusCode, 200, "API key generation should succeed for admin");
  
  const apiKeyData = JSON.parse(apiKeyResponse.payload);
  t.truthy(apiKeyData.apiKey, "API key should be returned");
  t.is(apiKeyData.serviceId, "test-service", "Service ID should match");
  t.deepEqual(apiKeyData.permissions, ["api:*:read", "api:*:write"], "Permissions should match");
  
  await app.close();
});

test("integration: role-based access control", async (t) => {
  const app = createApp();
  const authManager = createAuthManager();
  
  // Create users with different roles
  const adminUser = {
    id: "admin-user-integration",
    roles: ["admin"],
  };
  
  const regularUser = {
    id: "regular-user-integration", 
    roles: ["user"],
  };
  
  const readonlyUser = {
    id: "readonly-user-integration",
    roles: ["readonly"],
  };
  
  const adminTokens = authManager.generateTokens(adminUser);
  const regularTokens = authManager.generateTokens(regularUser);
  const readonlyTokens = authManager.generateTokens(readonlyUser);
  
  // Test admin access to admin route
  const adminAdminResponse = await app.inject({
    method: 'GET',
    url: '/admin',
    headers: {
      'Authorization': `Bearer ${adminTokens.accessToken}`,
    },
  });
  
  t.is(adminAdminResponse.statusCode, 200, "Admin should access admin route");
  
  // Test regular user denied access to admin route
  const regularAdminResponse = await app.inject({
    method: 'GET',
    url: '/admin',
    headers: {
      'Authorization': `Bearer ${regularTokens.accessToken}`,
    },
  });
  
  t.is(regularAdminResponse.statusCode, 403, "Regular user should be denied admin access");
  
  // Test readonly user denied access to admin route
  const readonlyAdminResponse = await app.inject({
    method: 'GET',
    url: '/admin',
    headers: {
      'Authorization': `Bearer ${readonlyTokens.accessToken}`,
    },
  });
  
  t.is(readonlyAdminResponse.statusCode, 403, "Readonly user should be denied admin access");
  
  // Test all users can access protected route (assuming read permissions)
  for (const [userType, tokens] of [
    ["admin", adminTokens],
    ["regular", regularTokens], 
    ["readonly", readonlyTokens]
  ]) {
    const protectedResponse = await app.inject({
      method: 'GET',
      url: '/protected',
      headers: {
        'Authorization': `Bearer ${tokens.accessToken}`,
      },
    });
    
    t.is(protectedResponse.statusCode, 200, `${userType} user should access protected route`);
    
    const protectedData = JSON.parse(protectedResponse.payload);
    t.is(protectedData.user.id, `${userType}-user-integration`, `${userType} user should be identified`);
  }
  
  await app.close();
});

test("integration: JWT token validation and expiration", async (t) => {
  const app = createApp();
  const authManager = createAuthManager();
  
  // Create user
  const user = {
    id: "jwt-test-user",
    roles: ["user"],
  };
  
  const tokens = authManager.generateTokens(user);
  
  // Test valid token
  const validResponse = await app.inject({
    method: 'GET',
    url: '/auth/me',
    headers: {
      'Authorization': `Bearer ${tokens.accessToken}`,
    },
  });
  
  t.is(validResponse.statusCode, 200, "Valid token should work");
  
  // Test invalid token
  const invalidResponse = await app.inject({
    method: 'GET',
    url: '/auth/me',
    headers: {
      'Authorization': 'Bearer invalid.token.here',
    },
  });
  
  t.is(invalidResponse.statusCode, 401, "Invalid token should be rejected");
  
  // Test malformed token
  const malformedResponse = await app.inject({
    method: 'GET',
    url: '/auth/me',
    headers: {
      'Authorization': 'Bearer malformed.jwt',
    },
  });
  
  t.is(malformedResponse.statusCode, 401, "Malformed token should be rejected");
  
  // Test missing token
  const missingResponse = await app.inject({
    method: 'GET',
    url: '/auth/me',
  });
  
  t.is(missingResponse.statusCode, 401, "Missing token should be rejected");
  
  await app.close();
});

test("integration: adapter configuration validation", async (t) => {
  const { ConfigValidator } = await import("../src/config.js");
  
  // Test valid configuration
  const validAdapters = {
    rest: { enabled: true, prefix: "/api", version: "v1" },
    graphql: { enabled: true, endpoint: "/graphql" },
    websocket: { enabled: true, path: "/ws" },
    mcp: { enabled: true, prefix: "/mcp" },
  };
  
  const adapterValidation = ConfigValidator.validateAdapters(validAdapters);
  t.true(adapterValidation.valid, "Valid adapter configuration should pass");
  
  // Test conflicting endpoints
  const conflictingAdapters = {
    graphql: { enabled: true, endpoint: "/api" },
    rest: { enabled: true, prefix: "/api", version: "v1" },
  };
  
  const conflictingValidation = ConfigValidator.validateAdapters(conflictingAdapters);
  t.false(conflictingValidation.valid, "Conflicting endpoints should fail validation");
  t.true(conflictingValidation.errors.length > 0, "Error messages should be provided");
  
  // Test MCP/REST prefix conflicts
  const conflictingPrefixAdapters = {
    rest: { enabled: true, prefix: "/api", version: "v1" },
    mcp: { enabled: true, prefix: "/api" },
  };
  
  const prefixConflictValidation = ConfigValidator.validateAdapters(conflictingPrefixAdapters);
  t.false(prefixConflictValidation.valid, "Prefix conflicts should fail validation");
  t.true(prefixConflictValidation.errors.length > 0, "Error messages should be provided");
});

test("integration: service startup with all features", async (t) => {
  const { createDevServer } = await import("../src/index.js");
  
  // This test verifies that all authentication and RBAC features can be loaded together
  // without conflicts or startup errors
  const app = createDevServer({
    ...config,
    port: 0, // Use random port for testing
  });
  
  t.truthy(app, "Dev server should start successfully");
  
  // Verify critical endpoints are accessible
  const healthResponse = await app.inject({
    method: 'GET',
    url: '/health',
  });
  
  t.is(healthResponse.statusCode, 200, "Health check should work");
  
  const healthData = JSON.parse(healthResponse.payload);
  t.is(healthData.status, 'ok', "Health should be ok");
  
  // Verify auth endpoints are available
  const loginResponse = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: {
      username: 'test',
      password: 'test',
    },
  });
  
  t.is(loginResponse.statusCode, 200, "Login endpoint should be available");
  
  await app.close();
});