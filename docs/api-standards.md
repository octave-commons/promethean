# API Standards and Conventions

## Overview

This document defines the standards and conventions that must be followed when implementing APIs in the Promethean unified API system.

## Core Principles

### 1. **Consistency First**

- All endpoints follow the same patterns
- Uniform response formats across all services
- Consistent error handling and status codes
- Standardized naming conventions

### 2. **Type Safety**

- TypeScript strict mode enabled
- No `any` types allowed in production code
- Comprehensive input validation with Zod schemas
- Type-safe client generation from OpenAPI specs

### 3. **Security by Default**

- Input validation and sanitization
- Rate limiting on all endpoints
- Authentication and authorization checks
- Secure error handling without information leakage

### 4. **Developer Experience**

- Comprehensive OpenAPI documentation
- Clear error messages with actionable information
- Consistent patterns that are easy to learn
- Rich tooling and SDK support

## Response Format Standards

### Success Response Structure

```typescript
type ApiResponse<T> = {
  success: true;
  data: T;
  meta: {
    timestamp: string; // ISO 8601 format
    requestId: string; // Unique request identifier
    version: string; // API version
    pagination?: PaginationMeta;
    rateLimit?: RateLimitMeta;
  };
};
```

### Error Response Structure

```typescript
type ApiError = {
  success: false;
  error: {
    code: string; // Machine-readable error code
    message: string; // Human-readable error message
    details?: unknown; // Additional error context
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

#### Pagination Metadata

```typescript
type PaginationMeta = {
  page: number; // Current page (1-based)
  limit: number; // Items per page
  total: number; // Total items
  totalPages: number; // Total pages
  hasNext: boolean; // Has next page
  hasPrev: boolean; // Has previous page
};
```

#### Rate Limit Metadata

```typescript
type RateLimitMeta = {
  limit: number; // Request limit
  remaining: number; // Remaining requests
  reset: number; // Unix timestamp when limit resets
  retryAfter?: number; // Seconds to wait (429 responses)
};
```

## HTTP Status Code Guidelines

### Success Codes (2xx)

| Status | Usage                           | Example                               |
| ------ | ------------------------------- | ------------------------------------- |
| 200    | Successful request with data    | `GET /agents` returns list            |
| 201    | Resource created successfully   | `POST /agents` creates new agent      |
| 202    | Request accepted for processing | `POST /agents/:id/start` starts agent |
| 204    | Request successful, no content  | `DELETE /agents/:id` deletes agent    |

### Client Error Codes (4xx)

| Status | Usage                    | Error Code Pattern |
| ------ | ------------------------ | ------------------ |
| 400    | Invalid request data     | `VALIDATION_*`     |
| 401    | Authentication required  | `AUTH_*`           |
| 403    | Insufficient permissions | `PERMISSION_*`     |
| 404    | Resource not found       | `*_NOT_FOUND`      |
| 409    | Resource conflict        | `*_CONFLICT`       |
| 422    | Validation failed        | `VALIDATION_*`     |
| 429    | Rate limit exceeded      | `RATE_LIMIT_*`     |

### Server Error Codes (5xx)

| Status | Usage                   | Error Code Pattern |
| ------ | ----------------------- | ------------------ |
| 500    | Unexpected server error | `INTERNAL_*`       |
| 502    | Upstream service error  | `UPSTREAM_*`       |
| 503    | Service unavailable     | `SERVICE_*`        |
| 504    | Upstream timeout        | `TIMEOUT_*`        |

## Error Code Standards

### Format Convention

```
{DOMAIN}_{SPECIFIC_ERROR}
```

### Domain Categories

#### Authentication Errors

```typescript
const AUTH_ERRORS = {
  INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  EXPIRED_TOKEN: 'AUTH_EXPIRED_TOKEN',
  MISSING_TOKEN: 'AUTH_MISSING_TOKEN',
  INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',
  INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
} as const;
```

#### Validation Errors

```typescript
const VALIDATION_ERRORS = {
  REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  OUT_OF_RANGE: 'VALIDATION_OUT_OF_RANGE',
  INVALID_TYPE: 'VALIDATION_INVALID_TYPE',
  TOO_LONG: 'VALIDATION_TOO_LONG',
  TOO_SHORT: 'VALIDATION_TOO_SHORT',
  INVALID_EMAIL: 'VALIDATION_INVALID_EMAIL',
  INVALID_URL: 'VALIDATION_INVALID_URL',
} as const;
```

#### Business Logic Errors

```typescript
const BUSINESS_ERRORS = {
  AGENT_NOT_FOUND: 'AGENT_NOT_FOUND',
  AGENT_ALREADY_RUNNING: 'AGENT_ALREADY_RUNNING',
  AGENT_FAILED_TO_START: 'AGENT_FAILED_TO_START',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  COLLECTION_NOT_FOUND: 'COLLECTION_NOT_FOUND',
  WORKFLOW_INVALID_STATE: 'WORKFLOW_INVALID_STATE',
} as const;
```

#### System Errors

```typescript
const SYSTEM_ERRORS = {
  DATABASE_CONNECTION_FAILED: 'SYSTEM_DATABASE_CONNECTION_FAILED',
  EXTERNAL_SERVICE_UNAVAILABLE: 'SYSTEM_EXTERNAL_SERVICE_UNAVAILABLE',
  FILE_SYSTEM_ERROR: 'SYSTEM_FILE_SYSTEM_ERROR',
  MEMORY_LIMIT_EXCEEDED: 'SYSTEM_MEMORY_LIMIT_EXCEEDED',
  CONFIGURATION_ERROR: 'SYSTEM_CONFIGURATION_ERROR',
} as const;
```

## Request Validation Standards

### Input Validation with Zod

All request inputs must be validated using Zod schemas:

```typescript
import { z } from 'zod';

// Example: Create Agent Request
const createAgentSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Name can only contain letters, numbers, underscores, and hyphens'),

  type: z.enum(['llm', 'tool', 'composite'], {
    errorMap: () => ({ message: 'Type must be one of: llm, tool, composite' }),
  }),

  config: z.record(z.unknown()).optional(),

  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
});

type CreateAgentRequest = z.infer<typeof createAgentSchema>;
```

### Validation Error Responses

Validation errors must include field-specific details:

```typescript
type ValidationError = {
  field: string;
  message: string;
  code: string;
  value?: unknown;
};

type ValidationErrorResponse = {
  success: false;
  error: {
    code: 'VALIDATION_FAILED';
    message: 'Request validation failed';
    details: ValidationError[];
  };
  // ... meta
};
```

## Route Naming Conventions

### URL Structure

```
/api/v{version}/{resource}/{id?}/{action?}
```

### Resource Naming

| Resource Type        | Naming Pattern   | Examples                                        |
| -------------------- | ---------------- | ----------------------------------------------- |
| Collections          | Plural nouns     | `/agents`, `/sessions`, `/collections`          |
| Individual Resources | Singular with ID | `/agents/{id}`, `/sessions/{id}`                |
| Actions              | Verbs            | `/agents/{id}/start`, `/sessions/{id}/clone`    |
| Nested Resources     | Hierarchical     | `/agents/{id}/tasks`, `/collections/{id}/items` |

### HTTP Method Usage

| Operation      | Method | Pattern                         | Example                  |
| -------------- | ------ | ------------------------------- | ------------------------ |
| List           | GET    | `GET /resources`                | `GET /agents`            |
| Get            | GET    | `GET /resources/{id}`           | `GET /agents/123`        |
| Create         | POST   | `POST /resources`               | `POST /agents`           |
| Update         | PUT    | `PUT /resources/{id}`           | `PUT /agents/123`        |
| Partial Update | PATCH  | `PATCH /resources/{id}`         | `PATCH /agents/123`      |
| Delete         | DELETE | `DELETE /resources/{id}`        | `DELETE /agents/123`     |
| Action         | POST   | `POST /resources/{id}/{action}` | `POST /agents/123/start` |

## Versioning Standards

### URL Versioning (Primary)

```
/api/v1/agents
/api/v2/agents
```

### Header Versioning (Secondary)

```
Accept: application/vnd.api+json;version=1
API-Version: v1
```

### Version Support Policy

- **Current Version**: Full support, active development
- **Previous Version**: Security updates, critical bug fixes only
- **Deprecated Versions**: Security patches only, sunset after 6 months
- **Beta Versions**: Experimental, no stability guarantees

## Security Standards

### Authentication

#### JWT Token Format

```typescript
type JwtPayload = {
  sub: string; // User ID
  iat: number; // Issued at
  exp: number; // Expires at
  scope: string[]; // Permissions
  role: string; // User role
};
```

#### Authentication Headers

```http
Authorization: Bearer <jwt_token>
X-API-Key: <api_key>
```

### Rate Limiting

#### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 60
```

#### Rate Limit Tiers

| Tier       | Requests/Hour | Burst | Use Case              |
| ---------- | ------------- | ----- | --------------------- |
| Free       | 100           | 10    | Public API access     |
| Basic      | 1000          | 50    | Individual developers |
| Pro        | 10000         | 200   | Business applications |
| Enterprise | Unlimited     | 1000  | Large organizations   |

### Input Sanitization

#### HTML Content

```typescript
const sanitizeHtml = (html: string): string => {
  // Remove dangerous HTML tags and attributes
  // Preserve safe formatting tags
  // Escape user content
};
```

#### SQL Injection Prevention

```typescript
// Use parameterized queries
const query = 'SELECT * FROM agents WHERE id = $1';
const result = await db.query(query, [agentId]);
```

#### XSS Prevention

```typescript
const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};
```

## Documentation Standards

### OpenAPI 3.1 Specification

All endpoints must be documented with OpenAPI 3.1:

```yaml
openapi: 3.1.0
info:
  title: Promethean API
  version: 1.0.0
  description: Unified API for Promethean services
paths:
  /agents:
    get:
      summary: List all agents
      description: Retrieve a paginated list of all agents
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AgentListResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
```

### Component Schemas

```yaml
components:
  schemas:
    Agent:
      type: object
      required:
        - id
        - name
        - type
        - createdAt
        - updatedAt
      properties:
        id:
          type: string
          format: uuid
          description: Unique agent identifier
        name:
          type: string
          minLength: 1
          maxLength: 100
          description: Human-readable agent name
        type:
          type: string
          enum: [llm, tool, composite]
          description: Type of agent
        config:
          type: object
          description: Agent configuration
        description:
          type: string
          maxLength: 500
          description: Optional agent description
        createdAt:
          type: string
          format: date-time
          description: Creation timestamp
        updatedAt:
          type: string
          format: date-time
          description: Last update timestamp
```

### Response Examples

```yaml
responses:
  '200':
    description: Successful response
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/AgentListResponse'
        example:
          success: true
          data:
            agents:
              - id: '123e4567-e89b-12d3-a456-426614174000'
                name: 'Chat Assistant'
                type: 'llm'
                config:
                  model: 'gpt-4'
                  temperature: 0.7
                description: 'General purpose chat assistant'
                createdAt: '2023-10-01T10:00:00Z'
                updatedAt: '2023-10-01T10:00:00Z'
          meta:
            timestamp: '2023-10-01T10:00:00Z'
            requestId: 'req_123456789'
            version: '1.0.0'
            pagination:
              page: 1
              limit: 20
              total: 1
              totalPages: 1
              hasNext: false
              hasPrev: false
```

## Testing Standards

### Unit Tests

```typescript
import test from 'ava';
import { createAgent } from '../handlers/agents.js';
import { createAgentSchema } from '../schemas/agents.js';

test('createAgent validates input correctly', async (t) => {
  const invalidRequest = {
    name: '', // Invalid: empty name
    type: 'invalid-type', // Invalid: not in enum
  };

  const result = await createAgent(invalidRequest);

  t.false(result.success);
  t.is(result.error.code, 'VALIDATION_FAILED');
  t.true(Array.isArray(result.error.details));
  t.true(result.error.details.length > 0);
});

test('createAgent creates agent successfully', async (t) => {
  const validRequest = {
    name: 'Test Agent',
    type: 'llm',
    config: { model: 'gpt-4' },
  };

  const result = await createAgent(validRequest);

  t.true(result.success);
  t.truthy(result.data.id);
  t.is(result.data.name, validRequest.name);
  t.is(result.data.type, validRequest.type);
});
```

### Integration Tests

```typescript
import test from 'ava';
import { app } from '../app.js';
import { createTestAgent } from '../helpers/test-data.js';

test('POST /agents creates new agent', async (t) => {
  const agentData = createTestAgent();

  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/agents',
    payload: agentData,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.TEST_JWT_TOKEN}`,
    },
  });

  t.is(response.statusCode, 201);
  t.true(response.json().success);
  t.truthy(response.json().data.id);
});
```

## Performance Standards

### Response Time Targets

| Endpoint Type   | Target   | Maximum  |
| --------------- | -------- | -------- |
| Simple GET      | < 100ms  | < 500ms  |
| Complex GET     | < 200ms  | < 1000ms |
| POST/PUT        | < 200ms  | < 2000ms |
| DELETE          | < 100ms  | < 500ms  |
| Bulk Operations | < 1000ms | < 5000ms |

### Caching Strategy

#### Response Caching

```typescript
const cacheConfig = {
  // Static data: 5 minutes
  '/api/v1/agents/types': { ttl: 300 },

  // User data: 1 minute
  '/api/v1/agents': { ttl: 60, varyBy: ['user'] },

  // Configuration: 10 minutes
  '/api/v1/config': { ttl: 600 },
};
```

#### Database Query Optimization

```typescript
// Use indexes for common queries
const AGENT_INDEXES = [
  'CREATE INDEX idx_agents_type ON agents(type)',
  'CREATE INDEX idx_agents_status ON agents(status)',
  'CREATE INDEX idx_agents_created_at ON agents(created_at)',
];

// Use pagination for large datasets
const paginatedQuery = `
  SELECT * FROM agents 
  WHERE type = $1 
  ORDER BY created_at DESC 
  LIMIT $2 OFFSET $3
`;
```

## Monitoring and Observability

### Request Metrics

```typescript
type RequestMetrics = {
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  userId?: string;
  requestId: string;
  timestamp: number;
};
```

### Health Check Standards

```typescript
type HealthCheck = {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: HealthCheckResult;
    externalServices: HealthCheckResult;
    memory: HealthCheckResult;
    disk: HealthCheckResult;
  };
};
```

### Error Tracking

```typescript
type ErrorReport = {
  error: {
    code: string;
    message: string;
    stack?: string;
  };
  request: {
    method: string;
    path: string;
    headers: Record<string, string>;
    body?: unknown;
  };
  user?: {
    id: string;
    role: string;
  };
  context: {
    timestamp: string;
    requestId: string;
    version: string;
  };
};
```

## Code Quality Standards

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Linting Rules

```typescript
// Use functional patterns
const processData = (data: readonly unknown[]): ProcessedData[] => {
  return data.map(processItem).filter(Boolean);
};

// Avoid mutations
const updateUser = (user: User, updates: Partial<User>): User => {
  return { ...user, ...updates };
};

// Use readonly types
type Config = Readonly<{
  apiUrl: string;
  timeout: number;
}>;
```

### Error Handling Patterns

```typescript
// Functional error handling with Result type
type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

const safeOperation = (): Result<string> => {
  try {
    const result = riskyOperation();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error as Error };
  }
};
```

## Migration Guidelines

### Backward Compatibility

1. **Never remove fields** from response objects
2. **Add new fields as optional** with default values
3. **Maintain old endpoints** during transition period
4. **Provide deprecation warnings** in headers and documentation
5. **Document breaking changes** with migration guides

### Version Transition Process

1. **Announce deprecation** 3 months before removal
2. **Add new version** alongside existing version
3. **Update documentation** with migration guides
4. **Monitor usage** of deprecated endpoints
5. **Remove deprecated version** after sunset date

---

_These standards ensure consistency, security, and maintainability across all Promethean APIs. All developers must follow these guidelines when implementing new endpoints or modifying existing ones._
