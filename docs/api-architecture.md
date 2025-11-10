# API Architecture Design

## Overview

This document outlines the unified API architecture for consolidating routes from multiple packages into a coherent, scalable, and maintainable system.

## Architecture Principles

### 1. **Consistency**

- Standardized response formats across all endpoints
- Uniform error handling and status codes
- Consistent naming conventions and patterns

### 2. **Versioning**

- URL-based versioning as primary strategy
- Header-based versioning support for advanced clients
- Clear deprecation policies and migration paths

### 3. **Scalability**

- Modular route organization
- Pluggable middleware system
- Efficient request/response handling

### 4. **Security**

- Input validation and sanitization
- Rate limiting and authentication
- Comprehensive error handling without information leakage

### 5. **Developer Experience**

- Comprehensive OpenAPI documentation
- Type-safe client generation
- Clear error messages and debugging support

## Core Components

### API Gateway Pattern

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │───▶│  API Gateway   │───▶│  Backend       │
│                 │    │                 │    │  Services       │
│ - Web Frontend  │    │ - Routing      │    │                 │
│ - CLI Tools     │    │ - AuthN/AuthZ  │    │ - DualStore    │
│ - Mobile Apps   │    │ - Validation   │    │ - Opencode     │
│ - 3rd Parties   │    │ - Rate Limit   │    │ - Editor       │
└─────────────────┘    │ - Monitoring   │    │                 │
                       └─────────────────┘    └─────────────────┘
```

### Request Flow

1. **Incoming Request** → API Gateway
2. **Pre-processing** → Authentication, Rate Limiting, Validation
3. **Routing** → Version-specific route handlers
4. **Business Logic** → Service layer execution
5. **Response Formatting** → Standardized API response
6. **Post-processing** → Logging, Metrics, Headers

## Versioning Strategy

### URL-Based Versioning (Primary)

```
https://api.promethean.dev/v1/agents
https://api.promethean.dev/v2/agents
```

**Advantages:**

- Clear and explicit versioning
- Easy to understand and implement
- Works with all HTTP clients
- Simple caching strategies

**Implementation:**

- Major versions indicate breaking changes
- Minor versions for backward-compatible additions
- Patch versions for bug fixes

### Header-Based Versioning (Secondary)

```
Accept: application/vnd.api+json;version=1
API-Version: v1
```

**Use Cases:**

- Advanced client applications
- A/B testing new versions
- Gradual migration strategies

### Version Support Policy

- **Current Version**: Full support, active development
- **Previous Version**: Security updates, critical bug fixes only
- **Older Versions**: Deprecated, sunset after 6 months
- **Beta Versions**: Experimental, no stability guarantees

## Response Format Standardization

### Success Response

```typescript
type ApiResponse<T> = {
  success: true;
  data: T;
  meta: {
    timestamp: string;
    requestId: string;
    version: string;
    pagination?: PaginationMeta;
    rateLimit?: RateLimitMeta;
  };
};
```

### Error Response

```typescript
type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    stack?: string; // Development only
  };
  meta: {
    timestamp: string;
    requestId: string;
    version: string;
  };
};
```

### Metadata Standards

#### Pagination Meta

```typescript
type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};
```

#### Rate Limit Meta

```typescript
type RateLimitMeta = {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  retryAfter?: number; // Seconds to wait
};
```

## Route Organization

### Hierarchical Structure

```
/api/v1/
├── agents/           # Agent management
├── sessions/         # Session management
├── collections/      # Collection operations
├── workflows/        # Workflow management
├── tools/           # CLI and tool interfaces
├── editor/          # Editor-specific endpoints
├── events/          # Event streaming
├── health/          # Health checks
└── admin/           # Administrative functions
```

### RESTful Conventions

| Method | Pattern          | Example              | Description            |
| ------ | ---------------- | -------------------- | ---------------------- |
| GET    | `/resources`     | `GET /agents`        | List all resources     |
| GET    | `/resources/:id` | `GET /agents/123`    | Get specific resource  |
| POST   | `/resources`     | `POST /agents`       | Create new resource    |
| PUT    | `/resources/:id` | `PUT /agents/123`    | Update entire resource |
| PATCH  | `/resources/:id` | `PATCH /agents/123`  | Partial update         |
| DELETE | `/resources/:id` | `DELETE /agents/123` | Delete resource        |

### Custom Actions

For non-CRUD operations, use the `POST` method with action-specific endpoints:

```
POST /agents/:id/start
POST /agents/:id/stop
POST /sessions/:id/clone
POST /collections/:id/search
```

## Middleware Architecture

### Core Middleware Stack

1. **CORS** - Cross-origin request handling
2. **Security Headers** - Security-related HTTP headers
3. **Rate Limiting** - Request rate limiting per client
4. **Authentication** - JWT token validation
5. **Authorization** - Permission checking
6. **Request Logging** - Request/response logging
7. **Validation** - Input validation and sanitization
8. **Error Handling** - Centralized error processing

### Custom Middleware

Route-specific middleware can be added for:

- Business logic validation
- Resource-specific authentication
- Custom caching strategies
- Request transformation

## Error Handling Strategy

### Error Categories

1. **Client Errors (4xx)**

   - `400 Bad Request` - Invalid input
   - `401 Unauthorized` - Authentication required
   - `403 Forbidden` - Insufficient permissions
   - `404 Not Found` - Resource doesn't exist
   - `409 Conflict` - Resource conflict
   - `422 Unprocessable Entity` - Validation errors
   - `429 Too Many Requests` - Rate limit exceeded

2. **Server Errors (5xx)**
   - `500 Internal Server Error` - Unexpected server error
   - `502 Bad Gateway` - Upstream service error
   - `503 Service Unavailable` - Service temporarily down
   - `504 Gateway Timeout` - Upstream timeout

### Error Code Standards

```typescript
// Format: DOMAIN_SPECIFIC_ERROR_CODE
const ERROR_CODES = {
  // Authentication errors
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  AUTH_EXPIRED_TOKEN: 'AUTH_EXPIRED_TOKEN',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',

  // Validation errors
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_OUT_OF_RANGE: 'VALIDATION_OUT_OF_RANGE',

  // Business logic errors
  AGENT_NOT_FOUND: 'AGENT_NOT_FOUND',
  AGENT_ALREADY_RUNNING: 'AGENT_ALREADY_RUNNING',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // System errors
  DATABASE_CONNECTION_FAILED: 'DATABASE_CONNECTION_FAILED',
  EXTERNAL_SERVICE_UNAVAILABLE: 'EXTERNAL_SERVICE_UNAVAILABLE',
} as const;
```

## Security Standards

### Input Validation

- **JSON Schema** validation for all request bodies
- **TypeScript** type safety at compile time
- **Input sanitization** to prevent injection attacks
- **Size limits** on request payloads

### Authentication & Authorization

- **JWT tokens** for stateless authentication
- **Role-based access control** (RBAC)
- **API keys** for service-to-service communication
- **OAuth 2.0** for third-party integrations

### Rate Limiting

- **Per-client rate limits** based on API tier
- **Endpoint-specific limits** for resource-intensive operations
- **Burst capacity** for temporary traffic spikes
- **Gradual response** for approaching limits

### Security Headers

```http
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Performance Considerations

### Caching Strategy

1. **Response Caching**

   - Cache GET requests with appropriate TTL
   - Cache keys include version and user context
   - Cache invalidation on resource changes

2. **Database Query Caching**

   - Cache frequently accessed data
   - Query result caching with invalidation
   - Connection pooling and query optimization

3. **CDN Integration**
   - Static asset delivery via CDN
   - API response caching at edge locations
   - Geographic distribution for reduced latency

### Monitoring & Observability

1. **Request Metrics**

   - Response times by endpoint
   - Error rates and types
   - Request volume patterns

2. **System Health**

   - Database connection health
   - External service availability
   - Resource utilization metrics

3. **Business Metrics**
   - API usage by client
   - Feature adoption rates
   - Performance SLA compliance

## Migration Strategy

### Phase 1: Foundation

- Set up API gateway infrastructure
- Implement core middleware stack
- Define response format standards
- Create base route organization

### Phase 2: Service Migration

- Migrate DualStore collection APIs
- Migrate Opencode client APIs
- Migrate Electron editor APIs
- Implement version-specific routing

### Phase 3: Enhancement

- Add advanced features (webhooks, streaming)
- Implement comprehensive monitoring
- Optimize performance and caching
- Complete documentation and tooling

### Backward Compatibility

- Maintain existing endpoints during transition
- Provide migration guides and tools
- Offer deprecation warnings and timelines
- Support parallel version operation

## Documentation Strategy

### OpenAPI Specification

- Comprehensive OpenAPI 3.1 documentation
- Interactive API documentation (Swagger UI)
- Code examples in multiple languages
- SDK generation from OpenAPI specs

### Developer Resources

- Getting started guides
- Best practices documentation
- Troubleshooting guides
- Community support channels

### API Lifecycle Management

- Version release notes
- Deprecation announcements
- Sunset notifications
- Migration documentation

## Technology Stack

### Core Framework

- **Fastify** - High-performance HTTP server
- **TypeScript** - Type safety and developer experience
- **Zod** - Runtime type validation

### Documentation & Tooling

- **OpenAPI 3.1** - API specification
- **Swagger UI** - Interactive documentation
- **Postman Collections** - API testing

### Infrastructure

- **Node.js** - Runtime environment
- **Docker** - Containerization
- **Kubernetes** - Orchestration (production)

## Next Steps

1. **Create base API gateway structure**
2. **Implement core middleware stack**
3. **Define TypeScript types and schemas**
4. **Set up OpenAPI documentation generation**
5. **Begin service migration from existing packages**
6. **Implement comprehensive testing**
7. **Deploy to staging environment**
8. **Gradual production rollout**

---

_This architecture document serves as the foundation for implementing the unified API system. It will be updated as we learn from implementation and user feedback._
