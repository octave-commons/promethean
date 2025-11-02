---
uuid: '448a4bac-0001-0000-0000-000000000001'
title: 'Migrate DualStore Collection APIs'
slug: 'migrate-dualstore-collection-apis'
status: 'ready'
priority: 'P1'
labels: ['api', 'migration', 'dualstore', 'collections', 'crud']
created_at: '2025-10-28T00:00:00.000Z'
estimates:
  complexity: '5'
  scale: 'medium'
  time_to_completion: '3 sessions'
storyPoints: 5
---

## 🔄 Migrate DualStore Collection APIs

### 📋 Description

Migrate collection CRUD operations from `pseudo/dualstore-http` to the unified API structure. This includes session messages, agent tasks, and opencode events collections with standardized endpoints, validation, and error handling.

### 🎯 Goals

- Migrate all collection CRUD endpoints to unified structure
- Implement consistent validation and error handling
- Maintain backward compatibility during transition
- Apply unified response format standards
- Ensure proper input sanitization and security

### ✅ Acceptance Criteria

- [ ] Session messages collection endpoints migrated
- [ ] Agent tasks collection endpoints migrated
- [ ] Opencode events collection endpoints migrated
- [ ] All endpoints use unified response format
- [ ] Input validation implemented for all endpoints
- [ ] Error handling standardized across collections
- [ ] Backward compatibility maintained
- [ ] API documentation updated

### 🔧 Technical Specifications

#### Source Endpoints to Migrate:

1. **Session Messages Collection**

   - `GET /collections/session-messages` - List messages
   - `POST /collections/session-messages` - Create message
   - `GET /collections/session-messages/:id` - Get message
   - `PUT /collections/session-messages/:id` - Update message
   - `DELETE /collections/session-messages/:id` - Delete message

2. **Agent Tasks Collection**

   - `GET /collections/agent-tasks` - List tasks
   - `POST /collections/agent-tasks` - Create task
   - `GET /collections/agent-tasks/:id` - Get task
   - `PUT /collections/agent-tasks/:id` - Update task
   - `DELETE /collections/agent-tasks/:id` - Delete task

3. **Opencode Events Collection**
   - `GET /collections/opencode-events` - List events
   - `POST /collections/opencode-events` - Create event
   - `GET /collections/opencode-events/:id` - Get event
   - `PUT /collections/opencode-events/:id` - Update event
   - `DELETE /collections/opencode-events/:id` - Delete event

#### Target API Structure:

```typescript
// src/typescript/server/api/v1/routes/collections.ts
export const collectionsRoutes = async (fastify: FastifyInstance) => {
  // Session Messages
  fastify.get('/session-messages', {
    schema: listSessionMessagesSchema,
    handler: listSessionMessagesHandler,
  });

  fastify.post('/session-messages', {
    schema: createSessionMessageSchema,
    handler: createSessionMessageHandler,
  });

  fastify.get('/session-messages/:id', {
    schema: getSessionMessageSchema,
    handler: getSessionMessageHandler,
  });

  fastify.put('/session-messages/:id', {
    schema: updateSessionMessageSchema,
    handler: updateSessionMessageHandler,
  });

  fastify.delete('/session-messages/:id', {
    schema: deleteSessionMessageSchema,
    handler: deleteSessionMessageHandler,
  });

  // Agent Tasks
  fastify.get('/agent-tasks', {
    schema: listAgentTasksSchema,
    handler: listAgentTasksHandler,
  });

  // ... similar pattern for agent tasks

  // Opencode Events
  fastify.get('/opencode-events', {
    schema: listOpencodeEventsSchema,
    handler: listOpencodeEventsHandler,
  });

  // ... similar pattern for opencode events
};
```

#### Request/Response Schemas:

```typescript
// List Response Schema
interface CollectionListResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    count: number;
    total: number;
    page?: number;
    limit?: number;
  };
}

// Item Response Schema
interface CollectionItemResponse<T> {
  success: boolean;
  data: T;
}

// Create Request Schema
interface CreateCollectionItemRequest {
  [key: string]: any;
  createdAt?: string;
  updatedAt?: string;
}

// Update Request Schema
interface UpdateCollectionItemRequest {
  [key: string]: any;
  updatedAt?: string;
}
```

### 📁 Files/Components to Create

1. **Route Handlers**

   - `src/typescript/server/api/v1/routes/collections.ts` - Main collection routes
   - `src/typescript/server/api/v1/handlers/session-messages.ts` - Session message handlers
   - `src/typescript/server/api/v1/handlers/agent-tasks.ts` - Agent task handlers
   - `src/typescript/server/api/v1/handlers/opencode-events.ts` - Event handlers

2. **Schema Definitions**

   - `src/typescript/server/api/v1/schemas/collections.ts` - Collection schemas
   - `src/typescript/server/api/v1/schemas/session-messages.ts` - Session message schemas
   - `src/typescript/server/api/v1/schemas/agent-tasks.ts` - Agent task schemas
   - `src/typescript/server/api/v1/schemas/opencode-events.ts` - Event schemas

3. **Type Definitions**

   - `src/typescript/server/api/v1/types/collections.ts` - Collection types
   - `src/typescript/server/api/v1/types/session-messages.ts` - Session message types
   - `src/typescript/server/api/v1/types/agent-tasks.ts` - Agent task types
   - `src/typescript/server/api/v1/types/opencode-events.ts` - Event types

4. **Validation and Utilities**
   - `src/typescript/server/api/v1/utils/collection-validation.ts` - Validation helpers
   - `src/typescript/server/api/v1/utils/collection-responses.ts` - Response helpers

### 🧪 Testing Requirements

- [ ] All CRUD operations functional
- [ ] Input validation tests for all endpoints
- [ ] Error handling tests
- [ ] Response format validation tests
- [ ] Backward compatibility tests
- [ ] Security validation tests
- [ ] Performance tests for large collections

### ⛓️ Dependencies

- **Blocked By**:
  - Design Unified API Architecture and Standards
- **Blocks**:
  - Migrate Opencode Client APIs
  - Migrate Electron Editor APIs

### 🔗 Related Links

- Source implementation: `pseudo/dualstore-http/src/routes/collections.ts`
- Parent task: [[consolidate-api-routes-endpoints.md]]
- API standards: [[design-unified-api-architecture.md]]
- Collection patterns: `docs/api-reference.md`

### 📊 Definition of Done

- All collection CRUD endpoints migrated
- Unified response format applied
- Input validation implemented
- Error handling standardized
- Backward compatibility maintained
- Comprehensive test coverage
- API documentation updated

---

## 🔍 Relevant Links

- DualStore source: `pseudo/dualstore-http/src/routes/`
- Collection schemas: `pseudo/dualstore-http/src/schemas/`
- API architecture: `src/typescript/server/api/v1/`
- Validation standards: `src/typescript/server/api/v1/schemas/validation.ts`
