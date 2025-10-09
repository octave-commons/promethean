import test from "ava";
import { createApp, createAuthManager } from "../src/app.js";
import { config } from "../src/config.js";

test("auth-manager: configuration validation", async (t) => {
  const authManager = createAuthManager();
  
  t.truthy(authManager, "Auth manager should be created");
  t.truthy(authManager.getTokenManager(), "Token manager should be available");
  t.truthy(authManager.getRBACManager(), "RBAC manager should be available");
});

test("auth-manager: JWT token generation and validation", async (t) => {
  const authManager = createAuthManager();
  
  const user = {
    id: "test-user-123",
    username: "testuser",
    email: "test@example.com",
    roles: ["user"],
    metadata: { test: true },
  };
  
  // Generate tokens
  const tokens = authManager.generateTokens(user);
  
  t.truthy(tokens.accessToken, "Access token should be generated");
  t.truthy(tokens.refreshToken, "Refresh token should be generated");
  
  // Validate access token
  const accessResult = authManager.getTokenManager().validateToken(tokens.accessToken);
  
  t.true(accessResult.success, "Access token should be valid");
  t.truthy(accessResult.user, "User context should be extracted");
  t.is(accessResult.user?.id, user.id, "User ID should match");
  t.is(accessResult.user?.username, user.username, "Username should match");
  t.deepEqual(accessResult.user?.roles, user.roles, "Roles should match");
  t.true(accessResult.user?.permissions.size > 0, "Permissions should be present");
  
  // Validate refresh token
  const refreshResult = authManager.getTokenManager().validateToken(tokens.refreshToken, "refresh");
  
  t.true(refreshResult.success, "Refresh token should be valid");
  t.is(refreshResult.user?.id, user.id, "User ID should match");
});

test("auth-manager: API key generation and validation", async (t) => {
  const authManager = createAuthManager();
  
  const serviceId = "test-service";
  const permissions = ["api:*:read", "api:*:write", "health:*:read"];
  
  // Generate API key
  const apiKey = authManager.generateAPIKey(serviceId, permissions);
  
  t.true(apiKey.startsWith("omni_"), "API key should have prefix");
  t.true(apiKey.includes("."), "API key should contain dot separator");
  
  // Validate API key
  const result = authManager.validateAPIKey(apiKey);
  
  t.true(result.success, "API key should be valid");
  t.truthy(result.user, "User context should be extracted");
  t.is(result.user?.id, serviceId, "Service ID should match");
  t.deepEqual(result.user?.roles, ["service"], "Service role should be assigned");
  t.true(result.user?.tokenType === "apikey", "Token type should be apikey");
  
  // Test invalid API key format
  const invalidResult = authManager.validateAPIKey("invalid-key");
  
  t.false(invalidResult.success, "Invalid API key should be rejected");
  t.is(invalidResult.statusCode, 401, "Status code should be 401");
});

test("rbac-manager: role and permission management", async (t) => {
  const authManager = createAuthManager();
  const rbac = authManager.getRBACManager();
  
  // Test default roles
  const roles = rbac.getAllRoles();
  t.true(roles.length >= 4, "Default roles should be loaded");
  
  const adminRole = rbac.getRole("admin");
  t.truthy(adminRole, "Admin role should exist");
  t.deepEqual(adminRole?.permissions, [{ resource: "*", actions: ["read", "write", "delete", "admin"] }]);
  
  // Test permission checking
  const userId = "test-user";
  const userRoles = ["readonly"];
  
  const canRead = rbac.canRead(userId, userRoles, "api:users");
  t.true(canRead.granted, "Readonly user should be able to read");
  
  const canWrite = rbac.canWrite(userId, userRoles, "api:users");
  t.false(canWrite.granted, "Readonly user should not be able to write");
  
  const adminAccess = rbac.hasAdminAccess(userId, userRoles, "api:anything");
  t.false(adminAccess.granted, "Readonly user should not have admin access");
  
  // Test with admin role
  const adminCanWrite = rbac.canWrite(userId, ["admin"], "api:anything");
  t.true(adminCanWrite.granted, "Admin should be able to write anywhere");
  
  const adminAdminAccess = rbac.hasAdminAccess(userId, ["admin"], "api:anything");
  t.true(adminAdminAccess.granted, "Admin should have admin access");
});

test("rbac-manager: role inheritance", async (t) => {
  const authManager = createAuthManager();
  const rbac = authManager.getRBACManager();
  
  // Add custom role with inheritance
  const managerRole = {
    name: "manager",
    description: "Manager role with inherited user permissions",
    permissions: [
      { resource: "team:*", actions: ["read", "write", "admin"] },
    ],
    inherits: ["user"],
  };
  
  rbac.addRole(managerRole);
  
  const userId = "test-user";
  const managerRoles = ["manager"];
  
  // Should have both manager permissions and inherited user permissions
  const canReadUsers = rbac.canRead(userId, managerRoles, "user:profile");
  t.true(canReadUsers.granted, "Manager should inherit user read permission");
  
  const canAdminTeam = rbac.hasAdminAccess(userId, managerRoles, "team:any");
  t.true(canAdminTeam.granted, "Manager should have team admin permission");
  
  // Test role hierarchy
  const hierarchy = rbac.getRoleHierarchy(managerRoles);
  t.true(hierarchy.includes("manager"), "Hierarchy should include manager role");
  t.true(hierarchy.includes("user"), "Hierarchy should include inherited user role");
});

test("rbac-manager: permission utilities", async (t) => {
  const authManager = createAuthManager();
  const rbac = authManager.getRBACManager();
  
  // Test wildcard permissions
  const userId = "test-user";
  const adminRoles = ["admin"];
  
  const canReadAnything = rbac.canRead(userId, adminRoles, "any:resource");
  t.true(canReadAnything.granted, "Admin should be able to read any resource");
  
  const canDeleteEverything = rbac.canDelete(userId, adminRoles, "any:thing");
  t.true(canDeleteEverything.granted, "Admin should be able to delete anything");
  
  // Test multiple permissions
  const canReadOrWrite = rbac.hasAnyPermission(userId, adminRoles, "test:resource", ["read", "write"]);
  t.true(canReadOrWrite.granted, "Admin should have at least one of read/write permissions");
  
  const canReadAndWrite = rbac.hasAllPermissions(userId, adminRoles, "test:resource", ["read", "write"]);
  t.true(canReadAndWrite.granted, "Admin should have both read and write permissions");
  
  const canReadWriteAndDelete = rbac.hasAllPermissions(userId, ["user"], "test:resource", ["read", "write", "delete"]);
  t.false(canReadWriteAndDelete.granted, "User should not have delete permission");
});

test("app: Fastify app creation with authentication", async (t) => {
  const app = createApp();
  
  t.truthy(app, "App should be created");
  
  // Test health endpoint
  const healthResponse = await app.inject({
    method: 'GET',
    url: '/health',
  });
  
  t.is(healthResponse.statusCode, 200, "Health endpoint should return 200");
  
  const healthData = JSON.parse(healthResponse.payload);
  t.is(healthData.status, 'ok', "Health status should be ok");
  t.is(healthData.service, 'omni-service', "Service should be identified");
  
  // Test root endpoint
  const rootResponse = await app.inject({
    method: 'GET',
    url: '/',
  });
  
  t.is(rootResponse.statusCode, 200, "Root endpoint should return 200");
  
  const rootData = JSON.parse(rootResponse.payload);
  t.is(rootData.service, "Promethean Omni Service", "Service name should be correct");
  
  await app.close();
});

test("app: protected routes with authentication", async (t) => {
  const app = createApp();
  const authManager = createAuthManager();
  
  // Test protected route without authentication
  const protectedResponse = await app.inject({
    method: 'GET',
    url: '/protected',
  });
  
  t.is(protectedResponse.statusCode, 401, "Protected route should return 401 without auth");
  
  // Test with valid JWT token
  const user = {
    id: "test-user-456",
    username: "protecteduser",
    roles: ["user"],
  };
  
  const tokens = authManager.generateTokens(user);
  
  const protectedWithAuth = await app.inject({
    method: 'GET',
    url: '/protected',
    headers: {
      'Authorization': `Bearer ${tokens.accessToken}`,
    },
  });
  
  t.is(protectedWithAuth.statusCode, 200, "Protected route should return 200 with valid JWT");
  
  const protectedData = JSON.parse(protectedWithAuth.payload);
  t.is(protectedData.user.id, user.id, "User ID should match");
  
  // Test admin route without admin role
  const adminResponse = await app.inject({
    method: 'GET',
    url: '/admin',
    headers: {
      'Authorization': `Bearer ${tokens.accessToken}`,
    },
  });
  
  t.is(adminResponse.statusCode, 403, "Admin route should return 403 without admin role");
  
  await app.close();
});

test("config: environment configuration loading", async (t) => {
  const { config, getAuthConfig, getAdapterConfig } = await import("../src/config.js");
  
  t.truthy(config, "Config should be loaded");
  t.is(typeof config.port, "number", "Port should be a number");
  t.is(typeof config.host, "string", "Host should be a string");
  
  // Test auth config extraction
  const authConfig = getAuthConfig();
  t.truthy(authConfig.jwt, "JWT config should be available");
  t.truthy(authConfig.rbac, "RBAC config should be available");
  
  // Test adapter config extraction
  const restConfig = getAdapterConfig("rest");
  t.truthy(restConfig, "REST adapter config should be available");
  t.is(restConfig.enabled, true, "REST adapter should be enabled by default");
  
  const graphqlConfig = getAdapterConfig("graphql");
  t.truthy(graphqlConfig, "GraphQL adapter config should be available");
  t.is(graphqlConfig.enabled, true, "GraphQL adapter should be enabled by default");
});