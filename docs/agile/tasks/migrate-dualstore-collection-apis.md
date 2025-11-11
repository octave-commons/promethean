---
uuid: '448a4bac-0001-0000-0000-000000000001'
title: 'Migrate DualStore Collection APIs'
slug: 'migrate-dualstore-collection-apis'
status: 'incoming'
priority: 'P0'
labels: ['api', 'migration', 'dualstore', 'collections', 'consolidation']
created_at: '2025-10-28T00:00:00.000Z'
estimates:
  complexity: '5'
  scale: 'medium'
  time_to_completion: '1 session'
---

## 🔄 Migrate DualStore Collection APIs

### 📋 Description

Migrate and consolidate all collection CRUD APIs from dualstore-http package into the unified API structure. This includes session messages, agent tasks, and opencode events endpoints.

### 🎯 Goals

- Migrate session messages CRUD operations
- Migrate agent tasks CRUD operations
- Migrate opencode events CRUD operations
- Apply unified response formats and validation
- Implement proper error handling
- Maintain backward compatibility

### ✅ Acceptance Criteria

- [ ] Session messages endpoints migrated to /api/v1/session_messages
- [ ] Agent tasks endpoints migrated to /api/v1/agent_tasks
- [ ] Opencode events endpoints migrated to /api/v1/opencode_events
- [ ] All endpoints use unified response format
- [ ] Input validation implemented using JSON Schema
- [ ] Error handling follows unified standards
- [ ] Pagination and filtering preserved
- [ ] All existing functionality maintained

### 🔧 Technical Specifications

#### Endpoints to Migrate:

1. **Session Messages**

   - GET /api/v1/session_messages (list with pagination)
   - GET /api/v1/session_messages/:id (get by ID)
   - POST /api/v1/session_messages (create)
   - PUT /api/v1/session_messages/:id (update)
   - DELETE /api/v1/session_messages/:id (delete)

2. **Agent Tasks**

   - GET /api/v1/agent_tasks (list with pagination)
   - GET /api/v1/agent_tasks/:id (get by ID)
   - POST /api/v1/agent_tasks (create)
   - PUT /api/v1/agent_tasks/:id (update)
   - DELETE /api/v1/agent_tasks/:id (delete)

3. **Opencode Events**
   - GET /api/v1/opencode_events (list with pagination)
   - GET /api/v1/opencode_events/:id (get by ID)
   - POST /api/v1/opencode_events (create)
   - PUT /api/v1/opencode_events/:id (update)
   - DELETE /api/v1/opencode_events/:id (delete)

#### Implementation Requirements:

- Use Fastify route definitions with JSON Schema validation
- Apply unified response wrapper format
- Implement consistent error responses
- Preserve existing query parameters (pagination, filtering, sorting)
- Add proper TypeScript types

### 📁 Files/Components to Create

- `src/typescript/server/api/v1/routes/session_messages.ts`
- `src/typescript/server/api/v1/routes/agent_tasks.ts`
- `src/typescript/server/api/v1/routes/opencode_events.ts`
- `src/typescript/server/api/v1/schemas/session_messages.ts`
- `src/typescript/server/api/v1/schemas/agent_tasks.ts`
- `src/typescript/server/api/v1/schemas/opencode_events.ts`

### ⛓️ Dependencies

- **Blocked By**: Design Unified API Architecture and Standards
- **Blocks**: Migrate Opencode Client APIs

### 📊 Definition of Done

- All dualstore collection endpoints migrated
- Unified response format applied
- Validation schemas implemented
- Tests passing for all migrated endpoints
- Documentation updated

---
