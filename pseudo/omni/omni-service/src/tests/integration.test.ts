import test from 'ava';
import { createApp } from '../app.js';
import { config } from '../config.js';
import { createAuthManager } from '../auth/index.js';

// Create a proper auth config for testing
const authConfig = {
  jwt: config.jwt,
  apikey: {
    enabled: true,
    headerName: 'x-api-key',
  },
  rbac: {
    defaultRoles: ['readonly'],
    permissionsCacheTTL: 300,
  },
  session: {
    enabled: true,
    cookieName: 'omni-token',
    cookieOptions: {
      httpOnly: true,
      secure: false,
      sameSite: 'strict' as const,
      maxAge: 86400,
    },
  },
};

test('integration: multi-adapter smoke tests', async (t) => {
  const app = createApp({
    ...config,
    adapters: {
      rest: { enabled: true, prefix: '/api', version: 'v1' },
      graphql: { enabled: true, endpoint: '/graphql', playground: false },
      websocket: { enabled: true, path: '/ws' },
      mcp: { enabled: true, prefix: '/mcp' },
    },
  });

  // Test overall health
  const healthResponse = await app.inject({
    method: 'GET',
    url: '/health',
  });

  t.is(healthResponse.statusCode, 200, 'Health endpoint should return 200');
  const healthData = JSON.parse(healthResponse.payload);
  t.is(healthData.status, 'ok', 'Health status should be ok');
  t.is(healthData.service, 'omni-service', 'Service should be identified');
  t.truthy(healthData.adapters, 'Adapter stats should be present');

  // Verify all adapters are mounted
  const { adapters } = healthData;
  t.true(adapters.rest.mounted, 'REST adapter should be mounted');
  t.true(adapters.graphql.mounted, 'GraphQL adapter should be mounted');
  t.true(adapters.websocket.mounted, 'WebSocket adapter should be mounted');
  t.true(adapters.mcp.mounted, 'MCP adapter should be mounted');

  // Test adapter-specific health endpoints
  const adapterStatusResponse = await app.inject({
    method: 'GET',
    url: '/adapters/status',
  });

  t.is(adapterStatusResponse.statusCode, 200, 'Adapter status should work');
  const adapterStatusData = JSON.parse(adapterStatusResponse.payload);
  t.truthy(adapterStatusData.adapters, 'Adapter configuration should be present');
  t.truthy(adapterStatusData.stats, 'Adapter stats should be present');

  await app.close();
});

test('integration: authentication flows across adapters', async (t) => {
  const app = createApp({
    ...config,
    adapters: {
      rest: { enabled: true, prefix: '/api', version: 'v1' },
      graphql: { enabled: true, endpoint: '/graphql', playground: false },
      websocket: { enabled: true, path: '/ws' },
      mcp: { enabled: true, prefix: '/mcp' },
    },
  });

  const authManager = createAuthManager(authConfig);
  const user = {
    id: 'smoke-test-user',
    username: 'smoketest',
    email: 'smoketest@example.com',
    roles: ['user'],
  };

  // Test login flow
  const loginResponse = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: {
      username: 'smoketest',
      password: 'testpassword',
    },
  });

  t.is(loginResponse.statusCode, 200, 'Login should succeed');
  const loginData = JSON.parse(loginResponse.payload);
  t.truthy(loginData.tokens.accessToken, 'Access token should be returned');
  t.is(loginData.user.id, user.id, 'User data should match');

  const accessToken = loginData.tokens.accessToken;

  // Test REST adapter authentication
  const restMeResponse = await app.inject({
    method: 'GET',
    url: '/api/v1/users/me',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  t.is(restMeResponse.statusCode, 200, 'REST me endpoint should work');
  const restMeData = JSON.parse(restMeResponse.payload);
  t.is(restMeData.user.id, user.id, 'REST user ID should match');
  t.deepEqual(restMeData.user.roles, user.roles, 'REST user roles should match');

  // Test GraphQL adapter authentication
  const graphqlMeResponse = await app.inject({
    method: 'POST',
    url: '/graphql',
    headers: {
      Authorization: `Bearer ${accessToken}`,
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

  t.is(graphqlMeResponse.statusCode, 200, 'GraphQL me query should work');
  const graphqlMeData = JSON.parse(graphqlMeResponse.payload);
  t.is(graphqlMeData.data.me.id, user.id, 'GraphQL user ID should match');
  t.deepEqual(graphqlMeData.data.me.roles, user.roles, 'GraphQL user roles should match');

  // Test MCP adapter authentication
  const mcpAuthResponse = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: {
      jsonrpc: '2.0',
      id: 1,
      method: 'get_user_info',
      params: {},
    },
  });

  t.is(mcpAuthResponse.statusCode, 200, 'MCP auth should work');
  const mcpAuthData = JSON.parse(mcpAuthResponse.payload);
  t.is(mcpAuthData.result.id, user.id, 'MCP user ID should match');
  t.deepEqual(mcpAuthData.result.roles, user.roles, 'MCP user roles should match');

  // Test token refresh
  const refreshResponse = await app.inject({
    method: 'POST',
    url: '/auth/refresh',
    payload: {
      refreshToken: loginData.tokens.refreshToken,
    },
  });

  t.is(refreshResponse.statusCode, 200, 'Token refresh should work');
  const refreshData = JSON.parse(refreshResponse.payload);
  t.is(refreshData.user.id, user.id, 'Refreshed user ID should match');

  // Test logout
  const logoutResponse = await app.inject({
    method: 'POST',
    url: '/auth/logout',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  t.is(logoutResponse.statusCode, 200, 'Logout should work');

  // Test authentication with API key
  const serviceApiKey = authManager.generateAPIKey('test-service', ['api:*:read', 'mcp:*:read']);

  const apiKeyResponse = await app.inject({
    method: 'GET',
    url: '/api/v1/users',
    headers: {
      'x-api-key': serviceApiKey,
    },
  });

  t.is(apiKeyResponse.statusCode, 200, 'API key should work');
  const apiKeyData = JSON.parse(apiKeyResponse.payload);
  t.true(Array.isArray(apiKeyData.data), 'API key should return user data');

  await app.close();
});

test('integration: REST API end-to-end workflow', async (t) => {
  const app = createApp({
    ...config,
    adapters: {
      rest: { enabled: true, prefix: '/api', version: 'v1' },
      graphql: { enabled: true, endpoint: '/graphql', playground: false },
      websocket: { enabled: true, path: '/ws' },
      mcp: { enabled: true, prefix: '/mcp' },
    },
  });

  const authManager = createAuthManager(authConfig);
  const user = {
    id: 'rest-test-user',
    username: 'resttest',
    email: 'resttest@example.com',
    roles: ['user'],
  };

  const tokens = authManager.generateTokens(user);

  // Test complete CRUD workflow
  // 1. Create a user
  const createResponse = await app.inject({
    method: 'POST',
    url: '/api/v1/users',
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: {
      name: 'REST Test User',
      email: 'resttest@example.com',
      role: 'USER',
    },
  });

  t.is(createResponse.statusCode, 201, 'User creation should succeed');
  const createdUser = JSON.parse(createResponse.payload);
  t.truthy(createdUser.data.id, 'Created user should have ID');
  t.is(createdUser.data.name, 'REST Test User', 'Created user should have correct name');

  // 2. Get all users
  const getAllResponse = await app.inject({
    method: 'GET',
    url: '/api/v1/users',
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
    query: {
      page: '1',
      limit: '10',
    },
  });

  t.is(getAllResponse.statusCode, 200, 'Get all users should work');
  const getAllData = JSON.parse(getAllResponse.payload);
  t.true(Array.isArray(getAllData.data), 'Should return array of users');
  t.true(getAllData.data.length > 0, 'Should return at least one user');
  t.truthy(getAllData.meta, 'Should include metadata');
  t.is(getAllData.meta.total, getAllData.data.length, 'Total should match array length');

  // 3. Get user by ID
  const getByIdResponse = await app.inject({
    method: 'GET',
    url: `/api/v1/users/${createdUser.data.id}`,
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });

  t.is(getByIdResponse.statusCode, 200, 'Get user by ID should work');
  const getByIdData = JSON.parse(getByIdResponse.payload);
  t.is(getByIdData.data.id, createdUser.data.id, 'User ID should match');
  t.is(getByIdData.data.name, createdUser.data.name, 'User name should match');

  // 4. Update user
  const updateResponse = await app.inject({
    method: 'PUT',
    url: `/api/v1/users/${createdUser.data.id}`,
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: {
      name: 'Updated REST Test User',
      email: 'updated@example.com',
    },
  });

  t.is(updateResponse.statusCode, 200, 'User update should work');
  const updateData = JSON.parse(updateResponse.payload);
  t.is(updateData.data.id, createdUser.data.id, 'Updated user ID should match');
  t.is(updateData.data.name, 'Updated REST Test User', 'Updated name should match');

  // 5. Delete user
  const deleteResponse = await app.inject({
    method: 'DELETE',
    url: `/api/v1/users/${createdUser.data.id}`,
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });

  t.is(deleteResponse.statusCode, 204, 'User deletion should work');

  // Verify user is deleted
  const verifyDeleteResponse = await app.inject({
    method: 'GET',
    url: `/api/v1/users/${createdUser.data.id}`,
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });

  t.is(verifyDeleteResponse.statusCode, 404, 'Deleted user should not be found');

  await app.close();
});

test('integration: GraphQL end-to-end workflow', async (t) => {
  const app = createApp({
    ...config,
    adapters: {
      rest: { enabled: true, prefix: '/api', version: 'v1' },
      graphql: { enabled: true, endpoint: '/graphql', playground: false },
      websocket: { enabled: true, path: '/ws' },
      mcp: { enabled: true, prefix: '/mcp' },
    },
  });

  const authManager = createAuthManager(authConfig);
  const user = {
    id: 'graphql-test-user',
    username: 'graphtest',
    email: 'graphtest@example.com',
    roles: ['user'],
  };

  const tokens = authManager.generateTokens(user);

  // Test queries
  // 1. Query users
  const usersQueryResponse = await app.inject({
    method: 'POST',
    url: '/graphql',
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: {
      query: `
        query GetUsers($first: Int, $after: String) {
          users(pagination: { first: $first, after: $after }) {
            edges {
              node {
                id
                name
                email
                role
              }
              cursor
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
            totalCount
          }
        }
      `,
      variables: {
        first: 5,
      },
    },
  });

  t.is(usersQueryResponse.statusCode, 200, 'GraphQL users query should work');
  const usersData = JSON.parse(usersQueryResponse.payload);
  t.truthy(usersData.data.users, 'GraphQL users query should return data');
  t.truthy(usersData.data.users.edges, 'Should return edges');
  t.truthy(usersData.data.users.pageInfo, 'Should return pageInfo');
  t.is(typeof usersData.data.users.totalCount, 'number', 'Should return totalCount');

  // 2. Query current user
  const meQueryResponse = await app.inject({
    method: 'POST',
    url: '/graphql',
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
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

  t.is(meQueryResponse.statusCode, 200, 'GraphQL me query should work');
  const meData = JSON.parse(meQueryResponse.payload);
  t.is(meData.data.me.id, user.id, 'GraphQL me query should return correct user ID');
  t.is(meData.data.me.username, user.username, 'GraphQL me query should return correct username');

  // Test mutations
  // 3. Create user
  const createUserResponse = await app.inject({
    method: 'POST',
    url: '/graphql',
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: {
      mutation: `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            name
            email
            role
            createdAt
          }
        }
      `,
      variables: {
        input: {
          name: 'GraphQL Test User',
          email: 'graphtest@example.com',
          role: 'USER',
        },
      },
    },
  });

  t.is(createUserResponse.statusCode, 200, 'GraphQL createUser mutation should work');
  const createData = JSON.parse(createUserResponse.payload);
  t.truthy(createData.data.createUser.id, 'Created user should have ID');
  t.is(
    createData.data.createUser.name,
    'GraphQL Test User',
    'Created user should have correct name',
  );

  // 4. Update user
  const updateUserResponse = await app.inject({
    method: 'POST',
    url: '/graphql',
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: {
      mutation: `
        mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
          updateUser(id: $id, input: $input) {
            id
            name
            email
            role
            updatedAt
          }
        }
      `,
      variables: {
        id: createData.data.createUser.id,
        input: {
          name: 'Updated GraphQL User',
          email: 'updated@example.com',
        },
      },
    },
  });

  t.is(updateUserResponse.statusCode, 200, 'GraphQL updateUser mutation should work');
  const updateData = JSON.parse(updateUserResponse.payload);
  t.is(
    updateData.data.updateUser.id,
    createData.data.createUser.id,
    'Updated user ID should match',
  );
  t.is(updateData.data.updateUser.name, 'Updated GraphQL User', 'Updated name should match');

  await app.close();
});

test('integration: MCP end-to-end workflow', async (t) => {
  const app = createApp({
    ...config,
    adapters: {
      rest: { enabled: true, prefix: '/api', version: 'v1' },
      graphql: { enabled: true, endpoint: '/graphql', playground: false },
      websocket: { enabled: true, path: '/ws' },
      mcp: { enabled: true, prefix: '/mcp' },
    },
  });

  const authManager = createAuthManager(authConfig);
  const user = {
    id: 'mcp-test-user',
    username: 'mcpuser',
    email: 'mcpuser@example.com',
    roles: ['user'],
  };

  const tokens = authManager.generateTokens(user);

  // Test MCP protocol flow
  // 1. Initialize MCP session
  const initResponse = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0',
        },
      },
    },
  });

  t.is(initResponse.statusCode, 200, 'MCP initialize should work');
  const initData = JSON.parse(initResponse.payload);
  t.is(initData.jsonrpc, '2.0', 'Response should be JSON-RPC 2.0');
  t.is(initData.id, 1, 'Response ID should match request ID');
  t.truthy(initData.result.protocolVersion, 'Should return protocol version');
  t.truthy(initData.result.capabilities, 'Should return capabilities');

  // 2. List available tools
  const toolsResponse = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {},
    },
  });

  t.is(toolsResponse.statusCode, 200, 'MCP tools list should work');
  const toolsData = JSON.parse(toolsResponse.payload);
  t.is(toolsData.jsonrpc, '2.0', 'Response should be JSON-RPC 2.0');
  t.is(toolsData.id, 2, 'Response ID should match request ID');
  t.truthy(Array.isArray(toolsData.result.tools), 'Should return tools array');
  t.true(toolsData.result.tools.length > 0, 'Should return at least one tool');

  // 3. Call echo tool
  const echoResponse = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'echo',
        arguments: {
          text: 'Hello from MCP integration test!',
        },
      },
    },
  });

  t.is(echoResponse.statusCode, 200, 'MCP echo tool call should work');
  const echoData = JSON.parse(echoResponse.payload);
  t.is(echoData.jsonrpc, '2.0', 'Response should be JSON-RPC 2.0');
  t.is(
    echoData.result.result,
    'Hello from MCP integration test!',
    'Echo tool should return correct text',
  );

  // 4. Call get_time tool
  const timeResponse = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'get_time',
        arguments: {},
      },
    },
  });

  t.is(timeResponse.statusCode, 200, 'MCP get_time tool call should work');
  const timeData = JSON.parse(timeResponse.payload);
  t.is(timeData.result.timestamp, 'string', 'Should return timestamp');
  t.is(timeData.result.iso, 'string', 'Should return ISO timestamp');

  // 5. Call get_user_info tool
  const userInfoResponse = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: {
      jsonrpc: '2.0',
      id: 5,
      method: 'get_user_info',
      params: {},
    },
  });

  t.is(userInfoResponse.statusCode, 200, 'MCP get_user_info tool call should work');
  const userData = JSON.parse(userInfoResponse.payload);
  t.is(userData.result.id, user.id, 'Should return correct user ID');
  t.is(userData.result.username, user.username, 'Should return correct username');

  // 6. Test ping
  const pingResponse = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: {
      jsonrpc: '2.0',
      id: 6,
      method: 'ping',
      params: {},
    },
  });

  t.is(pingResponse.statusCode, 200, 'MCP ping should work');
  const pingData = JSON.parse(pingResponse.payload);
  t.is(pingData.result.message, 'pong', 'Ping should return pong');

  // 7. Test error handling - unknown method
  const errorResponse = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: {
      jsonrpc: '2.0',
      id: 7,
      method: 'unknown_method',
      params: {},
    },
  });

  t.is(errorResponse.statusCode, 200, 'MCP should handle unknown method gracefully');
  const errorData = JSON.parse(errorResponse.payload);
  t.is(errorData.jsonrpc, '2.0', 'Error response should be JSON-RPC 2.0');
  t.is(errorData.id, 7, 'Error response ID should match request ID');
  t.truthy(errorData.error, 'Should return error object');
  t.is(errorData.error.code, -32601, 'Should return method not found error code');

  // 8. Test error handling - malformed JSON-RPC
  const malformedResponse = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: {
      jsonrpc: '1.0', // Invalid version
      id: 8,
      method: 'ping',
    },
  });

  t.is(malformedResponse.statusCode, 200, 'MCP should handle malformed JSON-RPC gracefully');
  const malformedData = JSON.parse(malformedResponse.payload);
  t.is(malformedData.jsonrpc, '2.0', 'Error response should be JSON-RPC 2.0');
  t.truthy(malformedData.error, 'Should return error object');
  t.is(malformedData.error.code, -32600, 'Should return invalid request error code');

  await app.close();
});

test('integration: concurrent request handling', async (t) => {
  const app = createApp({
    ...config,
    adapters: {
      rest: { enabled: true, prefix: '/api', version: 'v1' },
      graphql: { enabled: true, endpoint: '/graphql', playground: false },
      websocket: { enabled: true, path: '/ws' },
      mcp: { enabled: true, prefix: '/mcp' },
    },
  });

  const authManager = createAuthManager(authConfig);
  const user = {
    id: 'concurrent-test-user',
    username: 'concurrent',
    email: 'concurrent@example.com',
    roles: ['user'],
  };

  const tokens = authManager.generateTokens(user);

  // Create multiple concurrent requests
  const concurrentRequests = Array.from({ length: 10 }, (_, index) =>
    app.inject({
      method: 'GET',
      url: '/api/v1/users',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
      query: {
        page: String(index + 1),
        limit: '5',
      },
    }),
  );

  const results = await Promise.all(concurrentRequests);

  // All requests should succeed
  results.forEach((result, index) => {
    t.is(result.statusCode, 200, `Request ${index} should return 200`);

    const data = JSON.parse(result.payload);
    t.true(Array.isArray(data.data), `Request ${index} should return array`);
    t.truthy(data.meta, `Request ${index} should have metadata`);
  });

  // Test concurrent MCP requests
  const concurrentMcpRequests = Array.from({ length: 5 }, (_, index) =>
    app.inject({
      method: 'POST',
      url: '/mcp',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: {
        jsonrpc: '2.0',
        id: index + 1,
        method: 'tools/call',
        params: {
          name: 'echo',
          arguments: {
            text: `Concurrent test ${index}`,
          },
        },
      },
    }),
  );

  const mcpResults = await Promise.all(concurrentMcpRequests);

  // All MCP requests should succeed
  mcpResults.forEach((result, index) => {
    t.is(result.statusCode, 200, `MCP Request ${index} should return 200`);

    const data = JSON.parse(result.payload);
    t.is(
      data.result.result,
      `Concurrent test ${index}`,
      `MCP Request ${index} should return correct text`,
    );
  });

  await app.close();
});

test('integration: error handling and resilience', async (t) => {
  const app = createApp({
    ...config,
    adapters: {
      rest: { enabled: true, prefix: '/api', version: 'v1' },
      graphql: { enabled: true, endpoint: '/graphql', playground: false },
      websocket: { enabled: true, path: '/ws' },
      mcp: { enabled: true, prefix: '/mcp' },
    },
  });

  // Test unauthorized access
  const unauthorizedResponse = await app.inject({
    method: 'GET',
    url: '/api/v1/users',
  });

  t.is(unauthorizedResponse.statusCode, 401, 'Unauthorized request should return 401');

  // Test invalid JWT
  const invalidTokenResponse = await app.inject({
    method: 'GET',
    url: '/api/v1/users',
    headers: {
      Authorization: 'Bearer invalid.jwt.token',
    },
  });

  t.is(invalidTokenResponse.statusCode, 401, 'Invalid token should return 401');

  // Test invalid JSON in MCP
  const malformedJsonResponse = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      'Content-Type': 'application/json',
    },
    body: 'invalid json',
  });

  t.is(malformedJsonResponse.statusCode, 422, 'Malformed JSON should return 422');

  // Test missing required parameters in REST
  const missingParamsResponse = await app.inject({
    method: 'POST',
    url: '/api/v1/users',
    headers: {
      Authorization: `Bearer ${
        createAuthManager(authConfig).generateTokens({
          id: 'test-user',
          roles: ['user'],
        }).accessToken
      }`,
      'Content-Type': 'application/json',
    },
    body: {},
  });

  t.is(missingParamsResponse.statusCode, 422, 'Missing required params should return 422');

  // Test large request handling
  const largeResponse = await app.inject({
    method: 'GET',
    url: '/api/v1/users',
    query: {
      limit: '1000',
    },
  });

  t.true(largeResponse.statusCode >= 200, 'Large request should be handled');

  // Test malformed JSON-RPC in MCP
  const malformedRpcResponse = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      Authorization: `Bearer ${
        createAuthManager(authConfig).generateTokens({
          id: 'test-user',
          roles: ['user'],
        }).accessToken
      }`,
      'Content-Type': 'application/json',
    },
    body: {
      jsonrpc: '2.0',
      id: 'test',
      method: 'tools/call',
      // Missing params field
    },
  });

  t.is(malformedRpcResponse.statusCode, 200, 'Malformed JSON-RPC should be handled gracefully');

  await app.close();
});
