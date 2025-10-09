import test from "ava";
import { createApp } from "../src/app.js";
import { config } from "../src/config.js";

test("app: Fastify app creation with all adapters", async (t) => {
  const app = createApp({
    ...config,
    adapters: {
      rest: { enabled: true, prefix: "/api", version: "v1" },
      graphql: { enabled: true, endpoint: "/graphql", playground: false },
      websocket: { enabled: true, path: "/ws", enableSubscriptions: false },
      mcp: { enabled: true, prefix: "/mcp" },
    },
  });
  
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
  t.truthy(healthData.adapters, "Adapter stats should be present");
  
  // Test root endpoint
  const rootResponse = await app.inject({
    method: 'GET',
    url: '/',
  });
  
  t.is(rootResponse.statusCode, 200, "Root endpoint should return 200");
  
  const rootData = JSON.parse(rootResponse.payload);
  t.is(rootData.service, "Promethean Omni Service", "Service name should be correct");
  t.truthy(rootData.endpoints, "Endpoints should be listed");
  
  // Test adapter status endpoint
  const adapterStatusResponse = await app.inject({
    method: 'GET',
    url: '/adapters/status',
  });
  
  t.is(adapterStatusResponse.statusCode, 200, "Adapter status should work");
  
  const adapterStatusData = JSON.parse(adapterStatusResponse.payload);
  t.truthy(adapterStatusData.adapters, "Adapter configuration should be present");
  t.truthy(adapterStatusData.stats, "Adapter stats should be present");
  
  await app.close();
});

test("app: adapter configuration validation", async (t) => {
  // Test conflicting endpoints
  try {
    createApp({
      ...config,
      adapters: {
        graphql: { enabled: true, endpoint: "/conflict" },
        websocket: { enabled: true, path: "/conflict" },
        rest: { enabled: true, prefix: "/api", version: "v1" },
        mcp: { enabled: true, prefix: "/mcp" },
      },
    });
    
    t.fail("Should have thrown error for conflicting endpoints");
  } catch (error) {
    t.true(error instanceof Error, "Should throw Error for conflicting endpoints");
    t.true(error.message.includes("Adapter configuration invalid"), "Error message should mention adapter configuration");
  }
  
  // Test prefix conflicts
  try {
    createApp({
      ...config,
      adapters: {
        rest: { enabled: true, prefix: "/mcp", version: "v1" },
        mcp: { enabled: true, prefix: "/mcp" },
        graphql: { enabled: true, endpoint: "/graphql", playground: false },
        websocket: { enabled: true, path: "/ws", enableSubscriptions: false },
      },
    });
    
    t.fail("Should have thrown error for prefix conflicts");
  } catch (error) {
    t.true(error instanceof Error, "Should throw Error for prefix conflicts");
    t.true(error.message.includes("Adapter configuration invalid"), "Error message should mention adapter configuration");
  }
  
  // Test valid configuration (no error should be thrown)
  try {
    const validApp = createApp({
      ...config,
      adapters: {
        rest: { enabled: true, prefix: "/api", version: "v1" },
        graphql: { enabled: true, endpoint: "/graphql", playground: false },
        websocket: { enabled: true, path: "/ws", enableSubscriptions: false },
        mcp: { enabled: true, prefix: "/mcp" },
      },
    });
    
    t.truthy(validApp, "Valid configuration should not throw error");
    await validApp.close();
  } catch (error) {
    t.fail("Valid configuration should not throw error");
  }
});

test("app: authentication integration across adapters", async (t) => {
  const app = createApp({
    ...config,
    adapters: {
      rest: { enabled: true, prefix: "/api", version: "v1" },
      graphql: { enabled: true, endpoint: "/graphql", playground: false },
      mcp: { enabled: true, prefix: "/mcp" },
    },
  });
  
  // Test login
  const loginResponse = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: {
      username: 'testuser',
      password: 'testpass',
    },
  });
  
  t.is(loginResponse.statusCode, 200, "Login should succeed");
  const loginData = JSON.parse(loginResponse.payload);
  t.truthy(loginData.tokens.accessToken, "Access token should be returned");
  
  const accessToken = loginData.tokens.accessToken;
  
  // Test authentication in REST adapter
  const restResponse = await app.inject({
    method: 'GET',
    url: '/api/v1/users/me',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  t.is(restResponse.statusCode, 200, "REST me endpoint should work");
  const restData = JSON.parse(restResponse.payload);
  t.truthy(restData.user, "User data should be present");
  
  // Test authentication in GraphQL adapter
  const graphqlResponse = await app.inject({
    method: 'POST',
    url: '/graphql',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: {
      query: `
        query {
          me {
            id
            username
            email
            roles
          }
        }
      `,
    },
  });
  
  t.is(graphqlResponse.statusCode, 200, "GraphQL me query should work");
  const graphqlData = JSON.parse(graphqlResponse.payload);
  t.truthy(graphqlData.data.me, "GraphQL me data should be present");
  
  // Test authentication in MCP adapter
  const mcpResponse = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: {
      jsonrpc: "2.0",
      id: 1,
      method: "get_user_info",
      params: {},
    },
  });
  
  t.is(mcpResponse.statusCode, 200, "MCP get_user_info should work");
  const mcpData = JSON.parse(mcpResponse.payload);
  t.truthy(mcpData.result, "MCP result should be present");
  
  await app.close();
});

test("app: adapter configuration and mounting", async (t) => {
  // Test selective adapter mounting
  const restOnlyApp = createApp({
    ...config,
    adapters: {
      rest: { enabled: true, prefix: "/api", version: "v1" },
      graphql: { enabled: false, endpoint: "/graphql", playground: false },
      websocket: { enabled: false, path: "/ws", enableSubscriptions: false },
      mcp: { enabled: false, prefix: "/mcp" },
    },
  });
  
  // REST should work
  const restResponse = await restOnlyApp.inject({
    method: 'GET',
    url: '/api/v1/schema',
  });
  
  t.is(restResponse.statusCode, 401, "REST should require auth (401)");
  
  // GraphQL should not be available
  const graphqlResponse = await restOnlyApp.inject({
    method: 'POST',
    url: '/graphql',
    body: {
      query: "{ __typename }",
    },
  });
  
  t.is(graphqlResponse.statusCode, 404, "GraphQL should not be available");
  
  // MCP should not be available
  const mcpResponse = await restOnlyApp.inject({
    method: 'POST',
    url: '/mcp',
    body: {
      jsonrpc: "2.0",
      id: 1,
      method: "ping",
    },
  });
  
  t.is(mcpResponse.statusCode, 404, "MCP should not be available");
  
  await restOnlyApp.close();
  
  // Test all adapters disabled
  const noAdaptersApp = createApp({
    ...config,
    adapters: {
      rest: { enabled: false, prefix: "/api", version: "v1" },
      graphql: { enabled: false, endpoint: "/graphql", playground: false },
      websocket: { enabled: false, path: "/ws", enableSubscriptions: false },
      mcp: { enabled: false, prefix: "/mcp" },
    },
  });
  
  // Health check should still work
  const healthResponse = await noAdaptersApp.inject({
    method: 'GET',
    url: '/health',
  });
  
  t.is(healthResponse.statusCode, 200, "Health should work with no adapters");
  
  const healthData = JSON.parse(healthResponse.payload);
  t.is(healthData.status, 'ok', "Health status should be ok");
  t.truthy(healthData.adapters, "Adapter stats should be present");
  
  // Adapter endpoints should not be available
  const restNoAdapterResponse = await noAdaptersApp.inject({
    method: 'GET',
    url: '/api/v1/schema',
  });
  
  t.is(restNoAdapterResponse.statusCode, 404, "REST should not be available");
  
  await noAdaptersApp.close();
});

test("app: request correlation and context sharing", async (t) => {
  const app = createApp({
    ...config,
    adapters: {
      rest: { enabled: true, prefix: "/api", version: "v1" },
      mcp: { enabled: true, prefix: "/mcp" },
    },
  });
  
  const authManager = createAuthManager();
  const testUser = {
    id: "context-test-user",
    username: "contexttest",
    email: "context@test.com",
    roles: ["user"],
  };
  
  const tokens = authManager.generateTokens(testUser);
  
  // Test request ID generation in REST
  const restResponse = await app.inject({
    method: 'GET',
    url: '/api/v1/users',
    headers: {
      'Authorization': `Bearer ${tokens.accessToken}`,
    },
  });
  
  t.is(restResponse.statusCode, 200, "REST request should work");
  const restData = JSON.parse(restResponse.payload);
  t.truthy(restData.meta.requestId, "REST response should have request ID");
  t.truthy(restData.meta.timestamp, "REST response should have timestamp");
  
  // Test user context sharing
  const userMeResponse = await app.inject({
    method: 'GET',
    url: '/api/v1/users/me',
    headers: {
      'Authorization': `Bearer ${tokens.accessToken}`,
    },
  });
  
  t.is(userMeResponse.statusCode, 200, "REST me endpoint should work");
  const userData = JSON.parse(userMeResponse.payload);
  t.is(userData.user.id, testUser.id, "User context should be shared correctly");
  t.is(userData.user.username, testUser.username, "Username should be shared correctly");
  
  // Test MCP context sharing
  const mcpContextResponse = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      'Authorization': `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: {
      jsonrpc: "2.0",
      id: 2,
      method: "get_user_info",
      params: {},
    },
  });
  
  t.is(mcpContextResponse.statusCode, 200, "MCP context should work");
  const mcpContextData = JSON.parse(mcpContextResponse.payload);
  t.is(mcpContextData.result.id, testUser.id, "MCP context should share user ID");
  t.is(mcpContextData.result.username, testUser.username, "MCP context should share username");
  
  await app.close();
});

test("app: error handling and graceful degradation", async (t) => {
  const app = createApp({
    ...config,
    adapters: {
      rest: { enabled: true, prefix: "/api", version: "v1" },
      mcp: { enabled: true, prefix: "/mcp" },
    },
  });
  
  // Test malformed JSON in MCP
  const malformedMcpResponse = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      'Content-Type': 'application/json',
    },
    body: "invalid json",
  });
  
  t.is(malformedMcpResponse.statusCode, 422, "Malformed JSON should return 422");
  
  // Test missing required fields in REST
  const missingFieldsResponse = await app.inject({
    method: 'POST',
    url: '/api/v1/users',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {},
  });
  
  t.is(missingFieldsResponse.statusCode, 422, "Missing fields should return 422");
  
  // Test invalid JSON-RPC in MCP
  const invalidRpcResponse = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      jsonrpc: "1.0", // Invalid version
      id: "test",
      method: "ping",
    },
  });
  
  t.is(invalidRpcResponse.statusCode, 500, "Invalid JSON-RPC should return 500");
  const rpcErrorData = JSON.parse(invalidRpcResponse.payload);
  t.truthy(rpcErrorData.error, "Should return error object");
  t.is(rpcErrorData.error.code, -32600, "Should return invalid request error code");
  
  await app.close();
});