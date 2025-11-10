---
uuid: '448a4bac-0002-0000-0000-000000000002'
title: 'Migrate Opencode Client APIs'
slug: 'migrate-opencode-client-apis'
status: 'incoming'
priority: 'P0'
labels: ['api', 'migration', 'opencode-client', 'sessions', 'consolidation']
created_at: '2025-10-28T00:00:00.000Z'
estimates:
  complexity: '5'
  scale: 'medium'
  time_to_completion: '1 session'
---

## 🔧 Migrate Opencode Client APIs

### 📋 Description

Migrate and consolidate all agent management, session management, and workflow APIs from opencode-client package into the unified API structure.

### 🎯 Goals

- Migrate agent management endpoints
- Migrate session management APIs
- Migrate task and workflow endpoints
- Migrate CLI and tool interfaces
- Apply unified response formats and validation
- Maintain existing functionality

### ✅ Acceptance Criteria

- [ ] Agent management endpoints migrated to /api/v1/agents
- [ ] Session management endpoints migrated to /api/v1/sessions
- [ ] Task and workflow endpoints migrated to /api/v1/tasks
- [ ] CLI and tool interfaces migrated to /api/v1/tools
- [ ] All endpoints use unified response format
- [ ] Input validation implemented using JSON Schema
- [ ] Error handling follows unified standards
- [ ] All existing functionality preserved

### 🔧 Technical Specifications

#### Endpoints to Migrate:

1. **Agent Management**

   - GET /api/v1/agents (list agents)
   - GET /api/v1/agents/:id (get agent by ID)
   - POST /api/v1/agents (create agent)
   - PUT /api/v1/agents/:id (update agent)
   - DELETE /api/v1/agents/:id (delete agent)
   - POST /api/v1/agents/:id/spawn (spawn agent process)

2. **Session Management**

   - GET /api/v1/sessions (list sessions)
   - GET /api/v1/sessions/:id (get session by ID)
   - POST /api/v1/sessions (create session)
   - PUT /api/v1/sessions/:id (update session)
   - DELETE /api/v1/sessions/:id (delete session)
   - POST /api/v1/sessions/:id/messages (add message to session)

3. **Tasks and Workflows**

   - GET /api/v1/tasks (list tasks)
   - GET /api/v1/tasks/:id (get task by ID)
   - POST /api/v1/tasks (create task)
   - PUT /api/v1/tasks/:id (update task)
   - DELETE /api/v1/tasks/:id (delete task)
   - POST /api/v1/tasks/:id/execute (execute task)

4. **CLI and Tools**
   - GET /api/v1/tools (list available tools)
   - GET /api/v1/tools/:id (get tool details)
   - POST /api/v1/tools/:id/execute (execute tool)
   - GET /api/v1/cli/commands (list CLI commands)
   - POST /api/v1/cli/execute (execute CLI command)

#### Implementation Requirements:

- Use Fastify route definitions with JSON Schema validation
- Apply unified response wrapper format
- Implement consistent error responses
- Preserve existing query parameters and functionality
- Add proper TypeScript types
- Maintain backward compatibility

### 📁 Files/Components to Create

- `src/typescript/server/api/v1/routes/agents.ts`
- `src/typescript/server/api/v1/routes/sessions.ts`
- `src/typescript/server/api/v1/routes/tasks.ts`
- `src/typescript/server/api/v1/routes/tools.ts`
- `src/typescript/server/api/v1/schemas/agents.ts`
- `src/typescript/server/api/v1/schemas/sessions.ts`
- `src/typescript/server/api/v1/schemas/tasks.ts`
- `src/typescript/server/api/v1/schemas/tools.ts`

### ⛓️ Dependencies

- **Blocked By**: Migrate DualStore Collection APIs
- **Blocks**: Migrate Electron Editor APIs

### 📊 Definition of Done

- All opencode-client endpoints migrated
- Unified response format applied
- Validation schemas implemented
- Tests passing for all migrated endpoints
- Documentation updated
- Backward compatibility maintained

---
