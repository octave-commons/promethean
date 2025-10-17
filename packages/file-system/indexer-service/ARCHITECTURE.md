# Architecture Documentation

This document describes the architecture, design patterns, and technical implementation details of the `@promethean/indexer-service` package.

## System Overview

The `@promethean/indexer-service` is a Fastify-based HTTP service that provides a REST API wrapper around the `@promethean/indexer-core` functionality. It follows a layered architecture pattern with clear separation of concerns.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    HTTP API Layer                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Health API    │  │  Indexer API    │  │ Search API   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                  Service Layer                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Server        │  │   Config        │  │   Client     │ │
│  │   Management    │  │   Management    │  │   Library    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                  Core Layer                                 │
│           @promethean/indexer-core                          │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                Infrastructure Layer                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Fastify       │  │   Rate Limit    │  │   Logger     │ │
│  │   Framework     │  │   Plugin        │  │   System     │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Server (`server.ts`)

The main server component is responsible for:

- **Fastify Instance Creation**: Sets up the HTTP server with appropriate configuration
- **Plugin Registration**: Registers rate limiting, logging, and other plugins
- **Route Registration**: Registers all API routes
- **Lifecycle Management**: Handles server startup and shutdown

```typescript
export async function buildServer(options: BuildServerOptions = {}) {
  const config = loadConfig();
  const logger = createLogger({ service: 'indexer-service', level });

  // Configure indexer core
  setIndexerLogger(logger);
  setIndexerStateStore(createLevelCacheStateStore(config.cachePath));

  const app = Fastify({ logger: { level }, trustProxy: true });

  // Register plugins and routes
  if (config.enableRateLimit) {
    await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
  }

  registerIndexerRoutes(app, manager, config.rootPath);
  registerSearchRoutes(app, config.rootPath);

  return { app, manager, config };
}
```

### 2. Configuration (`config.ts`)

Configuration management follows the environment variable pattern with validation:

```typescript
export type ServiceConfig = Readonly<{
  rootPath: string;
  cachePath: string;
  port: number;
  host: string;
  logLevel: string;
  enableDocs: boolean;
  enableRateLimit: boolean;
}>;

export function loadConfig(): ServiceConfig {
  const rootPath = path.resolve(requireEnv('INDEX_ROOT', requireEnv('ROOT_PATH', process.cwd())));
  const cachePath = path.resolve(
    process.env.INDEX_CACHE_PATH ||
      process.env.INDEXER_CACHE_PATH ||
      path.join(rootPath, '.cache/indexer-service'),
  );
  // ... other configuration loading
}
```

**Configuration Sources:**

1. Environment variables (primary)
2. Default values (fallback)
3. Runtime validation

### 3. Client Library (`client.ts`)

The TypeScript client provides a type-safe interface for service interaction:

```typescript
export class IndexerServiceClient {
  #base: URL;
  #fetch: typeof fetch;
  #headers: Record<string, string>;

  constructor(config: IndexerServiceClientConfig) {
    this.#base = new URL(config.baseUrl);
    this.#fetch = config.fetchImpl ?? fetch;
    this.#headers = config.headers ?? {};
  }

  async #request(
    method: 'GET' | 'POST',
    pathname: string,
    payload?: unknown,
    signal?: AbortSignal,
  ): Promise<Response> {
    // Centralized request handling with error management
  }
}
```

**Client Features:**

- Type-safe API methods
- Centralized error handling
- Custom fetch implementation support
- AbortSignal support for cancellation
- Configurable headers

### 4. Route Handlers

#### Indexer Routes (`routes/indexer.ts`)

Handles all indexer management operations:

```typescript
export function registerIndexerRoutes(
  app: FastifyInstance,
  manager: IndexerManager,
  rootPath: string,
): void {
  // Status endpoint
  app.get('/indexer/status', async (_req, reply) => {
    reply.send({ ok: true, status: manager.status() });
  });

  // Reset endpoint with conflict checking
  app.post('/indexer/reset', async (_req, reply) => {
    if (manager.isBusy()) {
      reply.code(409).send({ ok: false, error: 'Indexer busy' });
      return;
    }
    await manager.resetAndBootstrap(rootPath);
    reply.send({ ok: true });
  });
}
```

**Security Features:**

- Path traversal protection
- Input validation
- Conflict detection
- Error sanitization

#### Search Routes (`routes/search.ts`)

Handles semantic search operations:

```typescript
export function registerSearchRoutes(app: FastifyInstance, rootPath: string): void {
  app.post('/search', async (request, reply) => {
    const { q, n } = request.body;
    if (!q) {
      reply.code(400).send({ ok: false, error: "Missing 'q'" });
      return;
    }

    const results = await semanticSearch(rootPath, q, n ?? 8);
    reply.send({ ok: true, results });
  });
}
```

## Design Patterns

### 1. Layered Architecture

The service follows a strict layered architecture:

- **Presentation Layer**: HTTP routes and API endpoints
- **Service Layer**: Business logic and coordination
- **Core Layer**: Indexer functionality (from indexer-core)
- **Infrastructure Layer**: Frameworks and utilities

### 2. Dependency Injection

Dependencies are injected through the server build process:

```typescript
export async function buildServer(options: BuildServerOptions = {}) {
  const config = loadConfig();
  const logger = createLogger(config);
  const manager = createIndexerManager();

  // Dependencies are passed to route handlers
  registerIndexerRoutes(app, manager, config.rootPath);
}
```

### 3. Factory Pattern

The client library uses a factory pattern for instantiation:

```typescript
export function createIndexerServiceClient(
  config: IndexerServiceClientConfig,
): IndexerServiceClient {
  return new IndexerServiceClient(config);
}
```

### 4. Error Handling Pattern

Centralized error handling with custom error types:

```typescript
export class IndexerServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'IndexerServiceError';
  }
}
```

## Security Architecture

### 1. Path Traversal Protection

```typescript
function isSafeRelPath(rel: string): boolean {
  return (
    typeof rel === 'string' &&
    rel.length > 0 &&
    rel.length < 256 &&
    !rel.split(/[\\/]/).includes('..') &&
    !path.isAbsolute(rel)
  );
}
```

### 2. Rate Limiting

Configurable rate limiting using Fastify plugin:

```typescript
if (config.enableRateLimit) {
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });
}
```

### 3. Input Validation

All inputs are validated at the route level:

```typescript
const globs = request.body?.path;
if (!globs) {
  reply.code(400).send({ ok: false, error: "Missing 'path'" });
  return;
}
```

## Performance Considerations

### 1. Asynchronous Operations

All I/O operations are asynchronous to prevent blocking:

```typescript
app.post('/indexer/reindex', async (_req, reply) => {
  const result = await manager.scheduleReindexAll();
  reply.send(result);
});
```

### 2. Connection Management

Fastify handles connection pooling and management automatically.

### 3. Memory Management

- Streaming responses for large datasets
- Efficient JSON serialization
- Garbage collection friendly patterns

## Scalability Architecture

### 1. Horizontal Scaling

The service is designed to be stateless for horizontal scaling:

- Configuration via environment variables
- External state management (LevelDB)
- No in-memory session state

### 2. Load Balancing

Ready for load balancer deployment:

- Health check endpoint (`/health`)
- Graceful shutdown handling
- Proper HTTP status codes

### 3. Caching Strategy

Leverages indexer-core's caching:

- LevelDB for persistent caching
- Configurable cache paths
- Cache invalidation on file changes

## Monitoring & Observability

### 1. Structured Logging

```typescript
const logger = createLogger({ service: 'indexer-service', level });
app.log.info({ port: config.port, host: config.host }, 'Indexer service started');
```

### 2. Health Monitoring

```typescript
app.get('/health', async (_req, reply) => {
  reply.send({ ok: true });
});
```

### 3. Status Reporting

```typescript
app.get('/indexer/status', async (_req, reply) => {
  reply.send({ ok: true, status: manager.status() });
});
```

## Deployment Architecture

### 1. Container Support

Designed for containerized deployment:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
RUN pnpm build
EXPOSE 4260
CMD ["pnpm", "start"]
```

### 2. Environment Configuration

All configuration via environment variables for deployment flexibility.

### 3. Process Management

Supports both direct execution and PM2 process management:

```typescript
// main.ts
async function start() {
  try {
    const { app, config } = await buildServer();
    await app.listen({ port: config.port, host: config.host });
  } catch (error) {
    console.error('Failed to start indexer service', error);
    process.exitCode = 1;
  }
}
```

## Integration Patterns

### 1. Service Discovery

The service can be discovered via:

- Health endpoint
- OpenAPI specification
- Standard HTTP port

### 2. Client Integration

Multiple client integration patterns:

- TypeScript client library
- Direct HTTP API
- Custom fetch implementations

### 3. Microservices Architecture

Designed to work in microservices environments:

- Independent deployment
- Clear API boundaries
- Minimal dependencies

## Testing Architecture

### 1. Unit Testing

Focused testing of individual components:

```typescript
test('client surfaces HTTP errors', async (t) => {
  const client = createIndexerServiceClient({
    baseUrl: 'http://localhost:4260',
    fetchImpl: mockFetch,
  });

  await t.throwsAsync(client.status(), {
    instanceOf: IndexerServiceError,
  });
});
```

### 2. Integration Testing

End-to-end testing with real server instances:

```typescript
test.serial('indexer service resets and reports status', async (t) => {
  const { app, manager } = await buildServer(testConfig);
  // Test actual HTTP endpoints
});
```

### 3. Mock Testing

Mock implementations for external dependencies:

```typescript
test.before(() => {
  setChromaClient(mockChromaClient);
  setEmbeddingFactory(mockEmbeddingFactory);
});
```

## Future Architecture Considerations

### 1. API Versioning

Prepared for API versioning through URL structure:

- Current: `/indexer/status`
- Future: `/v1/indexer/status`

### 2. Authentication

Ready for authentication integration:

- JWT token support
- API key authentication
- OAuth integration

### 3. Advanced Features

Architecture supports future enhancements:

- WebSocket support for real-time updates
- GraphQL endpoint
- Advanced search filters
- Bulk operations optimization

## Technology Stack

### Core Technologies

- **Fastify**: High-performance HTTP framework
- **TypeScript**: Type-safe development
- **Node.js**: Runtime environment

### Dependencies

- **@fastify/rate-limit**: Rate limiting plugin
- **@fastify/swagger**: OpenAPI documentation
- **@promethean/indexer-core**: Core indexing functionality
- **@promethean/utils**: Shared utilities

### Development Tools

- **AVA**: Testing framework
- **ESLint**: Code linting
- **TypeScript Compiler**: Type checking

This architecture provides a solid foundation for a scalable, maintainable, and secure indexing service that can grow with the needs of the Promethean Framework.
