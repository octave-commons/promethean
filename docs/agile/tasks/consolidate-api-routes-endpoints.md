---
uuid: '585294ed-b77b-4d36-bb77-8b0f6f1e6ac0'
title: 'Consolidate API Routes and Endpoints'
slug: 'consolidate-api-routes-endpoints'
status: 'ready'
priority: 'P0'
labels: ['api', 'routes', 'consolidation', 'endpoints', 'epic2']
created_at: '2025-10-18T00:00:00.000Z'
estimates:
  complexity: '3'
  scale: 'medium'
  time_to_completion: '1 session'
storyPoints: 3
---

## 🛣️ Consolidate API Routes and Endpoints

### 📋 Description

Consolidate and unify all API routes and endpoints from the three packages into a coherent, well-structured API within the unified package. This involves standardizing response formats, implementing unified API versioning, creating comprehensive OpenAPI documentation, and ensuring consistent validation across all endpoints.

### 🎯 Goals

- Unified API versioning and structure
- Consistent response formats across all endpoints
- Comprehensive OpenAPI documentation
- Standardized input validation
- Backward compatibility maintenance
- Improved API discoverability and usability

### ✅ Acceptance Criteria

- [ ] Unified API versioning system implemented
- [ ] Consistent response formats for all endpoints
- [ ] Complete OpenAPI 3.0 documentation
- [ ] Route validation and sanitization
- [ ] API deprecation and migration strategy
- [ ] All existing endpoints functional
- [ ] API testing and validation complete

### 🔧 Technical Specifications

#### API Structure to Consolidate:

1. **From `@promethean-os/dualstore-http`**

   - Dual-store management endpoints
   - Collection CRUD operations
   - Data provider endpoints
   - Health and status endpoints

2. **From `@promethean-os/opencode-client`**

   - Agent management endpoints
   - Session management APIs
   - Task and workflow endpoints
   - CLI and tool interfaces

3. **From `opencode-cljs-electron`**
   - Editor configuration endpoints
   - File system operations
   - UI component APIs
   - Keybinding management

#### Unified API Architecture:

```typescript
// Proposed API structure
src/typescript/server/api/
├── v1/                      # API version 1
│   ├── routes/
│   │   ├── dualstore.ts     # Dual-store endpoints
│   │   ├── agents.ts        # Agent management
│   │   ├── sessions.ts      # Session management
│   │   ├── editor.ts        # Editor endpoints
│   │   ├── collections.ts   # Collection operations
│   │   └── health.ts        # Health checks
│   ├── schemas/
│   │   ├── requests.ts      # Request schemas
│   │   ├── responses.ts     # Response schemas
│   │   └── common.ts        # Shared schemas
│   └── middleware/
│       ├── validation.ts    # Input validation
│       ├── auth.ts          # Authentication
│       └── rate-limit.ts    # Rate limiting
├── docs/
│   ├── openapi.yaml         # OpenAPI specification
│   ├── postman.json         # Postman collection
│   └── README.md            # API documentation
└── utils/
    ├── responses.ts         # Response utilities
    ├── errors.ts            # Error handling
    └── validation.ts        # Validation helpers
```

#### API Standards:

1. **Response Format Standardization**

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}
```

2. **API Versioning Strategy**

   - URL-based versioning: `/api/v1/`
   - Header-based versioning support
   - Deprecation headers and timelines
   - Migration guides for breaking changes

3. **Validation Standards**
   - JSON Schema validation for all inputs
   - Consistent error response format
   - Input sanitization and security
   - Type safety with TypeScript

### 📁 Files/Components to Create

#### API Route Files:

1. **Consolidated Route Handlers**

   - `src/typescript/server/api/v1/routes/` - All route implementations
   - Unified route registration and organization
   - Consistent middleware application

2. **Schema Definitions**

   - `src/typescript/server/api/v1/schemas/` - Request/response schemas
   - JSON Schema definitions
   - TypeScript type definitions

3. **Documentation**
   - `src/typescript/server/api/docs/openapi.yaml` - OpenAPI spec
   - `src/typescript/server/api/docs/README.md` - API documentation
   - Postman collection for testing

#### Middleware and Utilities:

1. **Validation Middleware**

   - Input validation using JSON Schema
   - Type conversion and sanitization
   - Error handling and reporting

2. **Response Utilities**
   - Standardized response formatting
   - Error response generation
   - Success response helpers

### 🧪 Testing Requirements

- [ ] All API endpoints functional
- [ ] Input validation tests
- [ ] Response format validation
- [ ] Authentication and authorization tests
- [ ] Rate limiting tests
- [ ] API documentation validation
- [ ] Backward compatibility tests

### 📋 Subtasks

1. **Design Unified API Structure** (2 points)

   - Define API versioning strategy
   - Standardize response formats
   - Create route organization scheme

2. **Implement Route Consolidation** (2 points)

   - Migrate all route handlers
   - Apply consistent middleware
   - Implement validation

3. **Create API Documentation** (1 point)
   - Generate OpenAPI specification
   - Create comprehensive documentation
   - Set up API testing tools

### ⛓️ Dependencies

- **Blocked By**:
  - Integrate dual-store management
- **Blocks**:
  - Implement unified SSE streaming
  - Client library unification tasks

### 🔗 Related Links

- [[docs/hacks/inbox/PACKAGE_CONSOLIDATION_PLAN_STORY_POINTS]]
- Current API implementations: `packages/*/src/routes/`
- OpenAPI specification: https://swagger.io/specification/
- Fastify validation: https://www.fastify.io/docs/latest/Reference/Validation/

### 📊 Definition of Done

- All API routes consolidated and functional
- Consistent response formats implemented
- Complete API documentation available
- Validation and security in place
- Backward compatibility maintained
- Comprehensive test coverage

---

## 🔍 Relevant Links

- Dualstore API: `packages/dualstore-http/src/routes/`
- Client APIs: `packages/opencode-client/src/api/`
- Electron APIs: `packages/opencode-cljs-electron/src/api/`
- API documentation: `docs/api-reference.md`
