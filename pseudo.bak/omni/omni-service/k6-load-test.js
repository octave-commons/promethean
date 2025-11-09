import http from 'k6/http';
import ws from 'k6/ws';
import { check, fail, Rate } from 'k6';

const wsMessages = new Rate('ws_messages_per_second');
const httpRequestDuration = new Rate('http_req_duration');

export let wsConnection;

export function setup() {
  // Generate auth token
  const loginResponse = http.post('http://localhost:3000/auth/login', {
    username: 'k6test',
    password: 'k6testpassword',
  });
  
  const authToken = loginResponse.json('tokens.accessToken');
  
  // Establish WebSocket connection
  wsConnection = ws.connect('ws://localhost:3000/ws', {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });
  
  // Test authentication
  check(loginResponse.status === 200, 'Login should succeed');
  check(authToken, 'Auth token should be present');
  
  return { authToken, wsConnection };
}

export default function() {
  // Test HTTP endpoints
  testHTTPEndpoints();
  
  // Test WebSocket
  testWebSocket();
}

export function testHTTPEndpoints() {
  // Test health endpoint
  const healthResponse = http.get('http://localhost:3000/health', {
    headers: {
      'Authorization': `Bearer authToken`,
    },
  });
  
  check(healthResponse.status === 200, 'Health endpoint should return 200');
  check(healthResponse.json('status') === 'ok', 'Health status should be ok');
  
  // Test adapter status
  const adapterResponse = http.get('http://localhost:3000/adapters/status', {
    headers: {
      'Authorization': `Bearer authToken`,
    },
  });
  
  check(adapterResponse.status === 200, 'Adapter status should return 200');
  check(adapterResponse.json('status') === 'ok', 'Adapter status should be ok');
  
  // Test REST API
  testRESTAPI();
  
  // Test GraphQL
  testGraphQL();
  
  // Test MCP
  testMCP();
}

export function testRESTAPI() {
  // Test GET /api/v1/users
  const usersResponse = http.get('http://localhost:3000/api/v1/users', {
    headers: {
      'Authorization': `Bearer authToken`,
    },
  });
  
  check(usersResponse.status === 200, 'Users endpoint should return 200');
  check(Array.isArray(usersResponse.json('data')), 'Should return user array');
  check(usersResponse.json('meta'), 'Should include metadata');
  
  // Test POST /api/v1/users
  const createResponse = http.post('http://localhost:3000/api/v1/users', {
    headers: {
      'Authorization': `Bearer authToken`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'K6 Test User',
      email: 'k6test@example.com',
      role: 'USER',
    }),
  });
  
  check(createResponse.status === 201, 'Create user should return 201');
  check(createResponse.json('data.id'), 'Created user should have ID');
  check(createResponse.json('data.name') === 'K6 Test User', 'Created user should have correct name');
  
  // Clean up created user
  if (createResponse.json('data.id')) {
    http.del(`http://localhost:3000/api/v1/users/${createResponse.json('data.id')}`, {
      headers: {
        'Authorization': `Bearer authToken`,
      },
    });
  }
}

export function testGraphQL() {
  // Test GraphQL query
  const gqlResponse = http.post('http://localhost:3000/graphql', {
    headers: {
      'Authorization': `Bearer authToken`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query GetUsers($first: Int) {
          users(pagination: { first: $first }) {
            edges {
              node {
                id
                name
                email
              }
            }
          }
        }
      `,
      variables: {
        first: 5,
      },
    }),
  });
  
  check(gqlResponse.status === 200, 'GraphQL query should return 200');
  check(gqlResponse.json('data.users'), 'GraphQL should return users data');
  check(Array.isArray(gqlResponse.json('data.users.edges')), 'Should return edges array');
  
  // Test GraphQL mutation
  const mutationResponse = http.post('http://localhost:3000/graphql', {
    headers: {
      'Authorization': `Bearer authToken`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mutation: `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            name
            email
            role
          }
        }
      `,
      variables: {
        input: {
          name: 'K6 GraphQL User',
          email: 'k6graphql@example.com',
          role: 'USER',
        },
      },
    }),
  });
  
  check(mutationResponse.status === 200, 'GraphQL mutation should return 200');
  check(mutationResponse.json('data.createUser.id'), 'Created GraphQL user should have ID');
  check(mutationResponse.json('data.createUser.name') === 'K6 GraphQL User', 'Created GraphQL user should have correct name');
}

export function testMCP() {
  // Test MCP ping
  const pingResponse = http.post('http://localhost:3000/mcp', {
    headers: {
      'Authorization': `Bearer authToken`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Math.random().toString(36).substr(2, 9),
      method: 'ping',
      params: {},
    }),
  });
  
  check(pingResponse.status === 200, 'MCP ping should return 200');
  check(pingResponse.json('result.message') === 'pong', 'MCP ping should return pong');
  
  // Test MCP echo tool
  const echoResponse = http.post('http://localhost:3000/mcp', {
    headers: {
      'Authorization': `Bearer authToken`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Math.random().toString(36).substr(2, 9),
      method: 'tools/call',
      params: {
        name: 'echo',
        arguments: {
          text: 'K6 MCP test',
        },
      },
    }),
  });
  
  check(echoResponse.status === 200, 'MCP echo should return 200');
  check(echoResponse.json('result.result') === 'K6 MCP test', 'MCP echo should return correct text');
  
  // Test MCP get_time tool
  const timeResponse = http.post('http://localhost:3000/mcp', {
    headers: {
      'Authorization': `Bearer authToken`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Math.random().toString(36).substr(2, 9),
      method: 'tools/call',
      params: {
        name: 'get_time',
        arguments: {},
      },
    }),
  });
  
  check(timeResponse.status === 200, 'MCP get_time should return 200');
  check(timeResponse.json('result.timestamp'), 'MCP get_time should return timestamp');
}

export function testWebSocket() {
  // Test WebSocket connection
  check(wsConnection.readyState === 1, 'WebSocket should be connected');
  
  // Test message sending
  const messages = [
    { type: 'ping', payload: {} },
    { type: 'subscribe', payload: { channel: 'k6-test' } },
    { type: 'broadcast', payload: { channel: 'k6-test', data: { message: 'K6 test message' } } },
  ];
  
  for (const message of messages) {
    const response = wsConnection.send(JSON.stringify(message));
    wsMessages.add(response.length);
    
    // Wait for response
    sleep(0.1);
    const received = wsConnection.recv();
    wsMessages.add(received ? received.length : 0);
    
    check(response.length > 0, 'WebSocket should receive response');
  }
  
  // Test cleanup
  wsConnection.send(JSON.stringify({
    type: 'unsubscribe',
    payload: { channel: 'k6-test' }
  }));
}

export function teardown() {
  wsConnection.close();
}