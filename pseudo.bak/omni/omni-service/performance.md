name: Performance and Load Testing Suite

This suite provides comprehensive performance testing capabilities for the Omni Service, including load testing, stress testing, and benchmarking.

## 📊 Available Tests

### Load Testing
- Concurrent request handling
- Adapter-specific load testing
- Authentication performance
- Database query performance

### Stress Testing
- High-concurrency scenarios
- Memory leak detection
- Resource exhaustion testing
- Error recovery testing

### Benchmarking
- Request/response time measurements
- Throughput measurements
- Adapter performance comparison
- Database query performance

## 🚀 Quick Start

### Using Artillery
```bash
# Install artillery
npm install -g artillery@latest

# Run basic load test
artillery run artillery-load-test.yml

# Run adapter-specific tests
artillery run artillery-rest-load.yml
artillery run artillery-graphql-load.yml
artillery run artillery-websocket-load.yml
artillery run artillery-mcp-load.yml
```

### Using k6
```bash
# Install k6
npm install -g k6

# Run basic load test
k6 run k6-load-test.js

# Run WebSocket test
k6 run k6-websocket-test.js
```

## 🔧 Test Configuration

### Artillery Load Test Configuration

```yaml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 30
      arrivalRate: 10
      name: "Warm up"
    - duration: 60
      arrivalRate: 20
      name: "Load test"
    - duration: 30
      arrivalRate: 50
      name: "Stress test"
  processor: "artillery-plugin-metrics-by-url"
  metrics:
    - name: 'response.time.p95'
      percentile: 95
      description: "95th percentile response time"
    - name: 'requests.per.second'
      friendlyName: "RPS"
      description: "Requests per second"

payloads:
  - auth:
      beforeRequest: "generateAuthTokens"
      afterResponse: "cleanupAuthTokens"
  rest:
    request:
      url: "/api/v1/users"
      method: "GET"
      headers:
        Authorization: "Bearer {{ auth.accessToken }}"
  graphql:
    request:
      url: "/graphql"
      method: "POST"
      headers:
        Authorization: "Bearer {{ auth.accessToken }}"
        Content-Type: "application/json"
      json:
        query: "query GetUsers($first: Int) { users(pagination: { first: $first }) { edges { node { id name email } } } }"
        variables:
          first: 10
  websocket:
    engine: ws
    request:
      url: "ws://localhost:3000/ws"
      method: "connect"
      headers:
        Authorization: "Bearer {{ auth.accessToken }}"
  mcp:
    request:
      url: "/mcp"
      method: "POST"
      headers:
        Authorization: "Bearer {{ auth.accessToken }}"
        Content-Type: "application/json"
      json:
        jsonrpc: "2.0"
        id: "{{ $randomUUID() }}"
        method: "tools/call"
        params:
          name: "echo"
          arguments:
            text: "Load test message {{ $randomUUID() }}"
```

### WebSocket Load Test

```javascript
import http from 'k6/http';
import ws from 'k6/ws';
import { check, fail } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metric for WebSocket messages
const wsMessages = new Rate('ws_messages_per_second');

export let wsConnection;

export function setup() {
  // Generate auth token
  const loginResponse = http.post('http://localhost:3000/auth/login', {
    username: 'loadtest',
    password: 'loadtestpassword',
  });
  
  const authToken = loginResponse.json('tokens.accessToken');
  
  // Establish WebSocket connection
  wsConnection = ws.connect('ws://localhost:3000/ws', {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });
  
  return { wsConnection };
}

export default function() {
  // Test WebSocket connection
  const messages = [
    { type: "ping", data: {} },
    { type: "subscribe", data: { channel: "loadtest" } },
    { type: "broadcast", data: { channel: "loadtest", data: "message" } },
  ];
  
  const responses = wsConnection.send(JSON.stringify(messages[Math.floor(Math.random() * messages.length)]));
  wsMessages.add(responses.length);
  
  // Test WebSocket message handling
  const responses = wsConnection.receive();
  wsMessages.add(responses.length);
  
  check(responses.length > 0, 'WebSocket should receive responses');
  
  return { wsMessages: wsMessages.rate };
}

export function teardown() {
  wsConnection.close();
}
```

## 📈 Test Scenarios

### 1. Basic Load Test
- Target: 100 req/s for 2 minutes
- Authentication: JWT tokens
- Success rate: >99%

### 2. REST API Load Test
- Endpoints: `/api/v1/users`, `/api/v1/posts`
- Operations: CRUD operations
- Dataset: 1000 users, 1000 posts

### 3. GraphQL Load Test
- Endpoints: `/graphql`
- Operations: Queries and mutations
- Variables: Random parameters

### 4. WebSocket Load Test
- Endpoints: `/ws`
- Operations: Connect, subscribe, publish
- Messages: 100 concurrent connections

### 5. MCP Load Test
- Endpoints: `/mcp`
- Operations: Tool calls
- Methods: echo, get_time, get_user_info

## 📊 Performance Metrics

### Key Performance Indicators (KPIs)

#### Response Time Targets
- P95: < 200ms
- P99: < 500ms
- Mean: < 100ms

#### Throughput Targets
- REST API: > 1000 req/s
- GraphQL: > 500 req/s
- WebSocket: > 100 msg/s
- MCP: > 100 req/s

#### Resource Utilization
- CPU: < 70%
- Memory: < 80%
- Database connections: < 80% of pool size

#### Error Rate
- 4xx: < 1%
- 5xx: < 0.1%
- Timeout: < 0.5%

## 🧪 Test Scripts

### Basic Load Test
```bash
#!/bin/bash
echo "Running basic load test..."

# Generate authentication token
AUTH_TOKEN=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"username": "loadtest", "password": "loadtestpassword"}' \
  http://localhost:3000/auth/login | jq -r '.tokens.accessToken')

# Run artillery
artillery run \
  -e AUTH_TOKEN=$AUTH_TOKEN \
  artillery-load-test.yml

echo "Load test completed."
```

### Adapter-Specific Tests
```bash
#!/bin/bash
echo "Running adapter-specific load tests..."

# REST API test
echo "Testing REST API..."
artillery run artillery-rest-load.yml

# GraphQL test  
echo "Testing GraphQL..."
artillery run artillery-graphql-load.yml

# MCP test
echo "Testing MCP..."
artillery run artillery-mcp-load.yml

# WebSocket test
echo "Testing WebSocket..."
artillery run artillery-websocket-load.yml

echo "All adapter tests completed."
```

### Stress Test
```bash
#!/bin/bash
echo "Running stress test..."

# High concurrency test
artillery run \
  -e CONCURRENT_USERS=1000 \
  -e REQUEST_RATE=100 \
  artillery-stress-test.yml

echo "Stress test completed."
```

## 📈 Performance Monitoring

### Real-time Monitoring
```bash
# Monitor during tests
while true; do
  curl -s http://localhost:3000/adapters/status | jq .
  sleep 5
done
```

### Metrics Collection
```bash
# Collect performance metrics
artillery run \
  --output artillery-report.json \
  --target 'http://localhost:3000' \
  artillery-load-test.yml

# Generate HTML report
artillery report artillery-report.json --output artillery-report.html
```

### Resource Monitoring
```bash
# Monitor system resources
top -p $(pgrep "omni-service")

# Monitor database connections
curl -s http://localhost:3000/health | jq .

# Monitor WebSocket connections
curl -s http://localhost:3000/ws/health | jq .
```

## 🔍 Performance Analysis

### Bottleneck Identification

1. **Authentication Layer**
   - JWT token generation time
   - Token validation time
   - Session lookup time

2. **Adapters Layer**
   - REST API processing time
   - GraphQL query execution time
   - WebSocket message processing time
   - MCP JSON-RPC processing time

3. **Database Layer**
   - Query execution time
   - Connection pool utilization
   - Index effectiveness

4. **Network Layer**
   - Request/response time
   - Connection overhead
   - SSL/TLS processing time

### Optimization Strategies

#### Database Optimization
```javascript
// Connection pooling
const pool = mysql.createPool({
  connectionLimit: 20,
  queueLimit: 100,
  acquireTimeout: 60000,
});

// Query optimization
const optimizedQuery = `
  SELECT id, name, email 
  FROM users 
  WHERE id = ? 
  LIMIT 1
`;

// Indexing
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### Caching Strategy
```javascript
// Redis caching
const cache = new Map();

const getCachedUser = async (id) => {
  if (cache.has(id)) {
    return cache.get(id);
  }
  
  const user = await db.users.findById(id);
  cache.set(id, user, 60000); // 1 minute
  
  return user;
};
```

#### Rate Limiting
```javascript
// Token bucket rate limiting
const rateLimiter = new Map();

const rateLimit = (key, maxTokens, refillRate) => {
  const state = rateLimiter.get(key) || { tokens: maxTokens, lastRefill: Date.now() };
  
  const now = Date.now();
  const timePassed = now - state.lastRefill;
  const tokensToAdd = Math.floor(timePassed * refillRate / 1000);
  
  state.tokens = Math.min(maxTokens, state.tokens + tokensToAdd);
  state.lastRefill = now;
  
  rateLimiter.set(key, state);
  return state;
};
```

## 📊 Test Reports

### Artillery Report Structure
```json
{
  "aggregate": {
    "vusers": 1000,
    "vusers.max": 1000,
    "vusers.min": 1000,
    "vusers.mean": 1000,
    "vusers.p95": 1000,
    "vusers.p99": 1000
  },
  "latency": {
    "p99.999999999": 500,
    "p99": 200,
    "p95": 100,
    "p90": 80,
    "p50": 50,
    "p10": 30
  },
  "requests": {
    "vusers.max": 200,
    "vusers.mean": 150,
    "vusers.total": 9000,
    "vusers.success": 8910,
    "vusers.failure": 90
  }
}
```

### Performance Dashboard

Create a dashboard showing:
- Real-time request metrics
- Response time distributions
- Error rate tracking
- Resource utilization
- Adapter performance comparison

## 🎯 Performance Targets

### Production Targets
- **Availability**: 99.9% uptime
- **Response Time**: P95 < 200ms
- **Throughput**: > 1000 req/s
- **Error Rate**: < 1%

### Acceptable Limits
- **4xx Errors**: < 1%
- **5xx Errors**: < 0.1%
- **Timeouts**: < 0.5%
- **Memory Usage**: < 512MB

### Performance Benchmarks
- **Cold Start**: < 5 seconds
- **Warm Start**: < 2 seconds
- **Auto-scaling**: Scale up within 30 seconds
- **Recovery**: < 1 minute from failure

## 🔧 Test Environment Setup

### Docker Compose for Testing
```yaml
version: '3.8'

services:
  omni-service:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=test
      - JWT_SECRET=test-jwt-secret-32-chars-long
      - MONGODB_HOST=mongodb
      - REDIS_HOST=redis
      - LOG_LEVEL=debug
    depends_on:
      - mongodb
      - redis
    volumes:
      - ./test-results:/app/test-results

  mongodb:
    image: mongo:7
    environment:
      MONGO_INITDB_ROOT_USERNAME: testuser
      MONGO_INITDB_ROOT_PASSWORD: testpass
    volumes:
      - mongodb-data:/data/db

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass testpass
    volumes:
      - redis-data:/data

  artillery:
    image: artillery/artillery:latest
    volumes:
      - ./performance:/performance
    depends_on:
      - omni-service
    command: tail -f /dev/null

volumes:
  mongodb-data:
  redis-data:
  test-results:
  performance:
```

### Test Database Setup
```javascript
// test/setup.js
const { MongoMemoryServer } = require('mongodb-mock-server');
const { RedisMemoryServer } = require('redis-memory-server');

async function setupTestEnvironment() {
  // Start in-memory MongoDB
  const mongod = await MongoMemoryServer.create();
  const mongoUri = mongod.getUri();
  
  // Start in-memory Redis
  const redis = RedisMemoryServer.create();
  const redisUri = redis.getUri();
  
  // Seed test data
  await seedTestData(mongoUri);
  
  return { mongoUri, redisUri, mongod, redis };
}

module.exports = { setupTestEnvironment };
```

---

**Performance and load testing is crucial for ensuring the Omni Service can handle production workloads effectively.**