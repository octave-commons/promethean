---
uuid: '448a4bac-0002-0000-0000-000000000002'
title: 'Migrate Opencode Client APIs'
slug: 'migrate-opencode-client-apis'
status: 'ready'
priority: 'P1'
labels: ['api', 'migration', 'opencode', 'client', 'agents', 'sessions', 'workflows']
created_at: '2025-10-28T00:00:00.000Z'
estimates:
  complexity: '5'
  scale: 'medium'
  time_to_completion: '3 sessions'
storyPoints: 5
---

## 🔄 Migrate Opencode Client APIs

### 📋 Description

Migrate agent management, session management, task/workflow endpoints, and CLI/tool interfaces from `packages/opencode-client` to the unified API structure. This involves consolidating client-side APIs with standardized endpoints, proper authentication, and consistent response handling.

### 🎯 Goals

- Migrate all agent management endpoints to unified structure
- Migrate session management APIs with proper lifecycle handling
- Migrate task and workflow management endpoints
- Migrate CLI and tool interface APIs
- Implement consistent authentication and authorization
- Apply unified response format standards
- Ensure proper input validation and error handling

### ✅ Acceptance Criteria

- [ ] Agent management endpoints migrated and functional
- [ ] Session management APIs migrated with lifecycle support
- [ ] Task and workflow endpoints migrated
- [ ] CLI and tool interface endpoints migrated
- [ ] All endpoints use unified response format
- [ ] Authentication and authorization implemented
- [ ] Input validation applied to all endpoints
- [ ] Error handling standardized across APIs
- [ ] Backward compatibility maintained during transition
- [ ] API documentation updated

### 🔧 Technical Specifications

#### Source Endpoints to Migrate:

1. **Agent Management**

   - `GET /agents` - List available agents
   - `POST /agents` - Create new agent
   - `GET /agents/:id` - Get agent details
   - `PUT /agents/:id` - Update agent configuration
   - `DELETE /agents/:id` - Remove agent
   - `POST /agents/:id/start` - Start agent execution
   - `POST /agents/:id/stop` - Stop agent execution
   - `GET /agents/:id/status` - Get agent status

2. **Session Management**

   - `GET /sessions` - List active sessions
   - `POST /sessions` - Create new session
   - `GET /sessions/:id` - Get session details
   - `PUT /sessions/:id` - Update session configuration
   - `DELETE /sessions/:id` - Terminate session
   - `POST /sessions/:id/heartbeat` - Session heartbeat
   - `GET /sessions/:id/metadata` - Get session metadata

3. **Task and Workflow Management**

   - `GET /tasks` - List available tasks
   - `POST /tasks` - Create new task
   - `GET /tasks/:id` - Get task details
   - `PUT /tasks/:id` - Update task configuration
   - `DELETE /tasks/:id` - Cancel task
   - `POST /tasks/:id/execute` - Execute task
   - `GET /tasks/:id/status` - Get task execution status
   - `GET /workflows` - List available workflows
   - `POST /workflows` - Create new workflow
   - `GET /workflows/:id` - Get workflow details
   - `PUT /workflows/:id` - Update workflow configuration
   - `DELETE /workflows/:id` - Remove workflow
   - `POST /workflows/:id/execute` - Execute workflow

4. **CLI and Tool Interfaces**
   - `GET /tools` - List available tools
   - `POST /tools/:name/execute` - Execute tool command
   - `GET /tools/:name/help` - Get tool help
   - `POST /cli/execute` - Execute CLI command
   - `GET /cli/history` - Get CLI command history
   - `POST /cli/stream` - Start streaming CLI session

#### Target API Structure:

```typescript
// src/typescript/server/api/v1/routes/agents.ts
export const agentRoutes = async (fastify: FastifyInstance) => {
  // Agent Management
  fastify.get('/agents', {
    schema: listAgentsSchema,
    handler: listAgentsHandler,
  });

  fastify.post('/agents', {
    schema: createAgentSchema,
    handler: createAgentHandler,
  });

  fastify.get('/agents/:id', {
    schema: getAgentSchema,
    handler: getAgentHandler,
  });

  fastify.put('/agents/:id', {
    schema: updateAgentSchema,
    handler: updateAgentHandler,
  });

  fastify.delete('/agents/:id', {
    schema: deleteAgentSchema,
    handler: deleteAgentHandler,
  });

  // Agent Control
  fastify.post('/agents/:id/start', {
    schema: startAgentSchema,
    handler: startAgentHandler,
  });

  fastify.post('/agents/:id/stop', {
    schema: stopAgentSchema,
    handler: stopAgentHandler,
  });

  fastify.get('/agents/:id/status', {
    schema: getAgentStatusSchema,
    handler: getAgentStatusHandler,
  });
};

// Similar structure for sessions, tasks, workflows, tools, and CLI endpoints
```

#### Request/Response Schemas:

```typescript
// Agent Management Schemas
interface Agent {
  id: string;
  name: string;
  type: 'llm' | 'tool' | 'composite';
  status: 'active' | 'inactive' | 'running' | 'stopped' | 'error';
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface CreateAgentRequest {
  name: string;
  type: Agent['type'];
  config?: Record<string, any>;
}

interface UpdateAgentRequest {
  name?: string;
  config?: Record<string, any>;
  status?: Agent['status'];
}

// Session Management Schemas
interface Session {
  id: string;
  agentId?: string;
  userId?: string;
  status: 'active' | 'inactive' | 'expired';
  metadata: Record<string, any>;
  createdAt: string;
  lastHeartbeat?: string;
  expiresAt?: string;
}

interface CreateSessionRequest {
  agentId?: string;
  userId?: string;
  config?: Record<string, any>;
  ttl?: number; // Time to live in seconds
}

// Task Management Schemas
interface Task {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  config: Record<string, any>;
  result?: any;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface CreateTaskRequest {
  name: string;
  type: string;
  config?: Record<string, any>;
  agentId?: string;
  workflowId?: string;
}

// Workflow Management Schemas
interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  status: 'draft' | 'active' | 'inactive';
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'task' | 'condition' | 'action';
  config: Record<string, any>;
  dependencies?: string[];
}
```

### 📁 Files/Components to Create

1. **Route Handlers**

   - `src/typescript/server/api/v1/routes/agents.ts` - Agent management routes
   - `src/typescript/server/api/v1/routes/sessions.ts` - Session management routes
   - `src/typescript/server/api/v1/routes/tasks.ts` - Task management routes
   - `src/typescript/server/api/v1/routes/workflows.ts` - Workflow management routes
   - `src/typescript/server/api/v1/routes/tools.ts` - CLI and tool interface routes

2. **Handler Functions**

   - `src/typescript/server/api/v1/handlers/agents.ts` - Agent route handlers
   - `src/typescript/server/api/v1/handlers/sessions.ts` - Session route handlers
   - `src/typescript/server/api/v1/handlers/tasks.ts` - Task route handlers
   - `src/typescript/server/api/v1/handlers/workflows.ts` - Workflow route handlers
   - `src/typescript/server/api/v1/handlers/tools.ts` - CLI and tool handlers

3. **Schema Definitions**

   - `src/typescript/server/api/v1/schemas/agents.ts` - Agent schemas
   - `src/typescript/server/api/v1/schemas/sessions.ts` - Session schemas
   - `src/typescript/server/api/v1/schemas/tasks.ts` - Task schemas
   - `src/typescript/server/api/v1/schemas/workflows.ts` - Workflow schemas
   - `src/typescript/server/api/v1/schemas/tools.ts` - CLI and tool schemas

4. **Type Definitions**

   - `src/typescript/server/api/v1/types/agents.ts` - Agent types
   - `src/typescript/server/api/v1/types/sessions.ts` - Session types
   - `src/typescript/server/api/v1/types/tasks.ts` - Task types
   - `src/typescript/server/api/v1/types/workflows.ts` - Workflow types
   - `src/typescript/server/api/v1/types/tools.ts` - CLI and tool types

5. **Middleware and Services**
   - `src/typescript/server/api/v1/middleware/auth.ts` - Authentication middleware
   - `src/typescript/server/api/v1/services/agent-manager.ts` - Agent management service
   - `src/typescript/server/api/v1/services/session-manager.ts` - Session management service
   - `src/typescript/server/api/v1/services/task-manager.ts` - Task management service

### 🧪 Testing Requirements

- [ ] All agent management endpoints functional
- [ ] Session lifecycle management working correctly
- [ ] Task and workflow execution working
- [ ] CLI and tool interfaces functional
- [ ] Authentication and authorization working
- [ ] Input validation tests for all endpoints
- [ ] Error handling tests
- [ ] Response format validation tests
- [ ] Backward compatibility tests
- [ ] Performance tests for high-concurrency scenarios
- [ ] Security validation tests

### ⛓️ Dependencies

- **Blocked By**:
  - Design Unified API Architecture and Standards
- **Blocks**:
  - Migrate Electron Editor APIs

### 🔗 Related Links

- Source implementation: `packages/opencode-client/src/api/`
- Parent task: [[consolidate-api-routes-endpoints.md]]
- API standards: [[design-unified-api-architecture.md]]
- Agent management: `docs/agents/`
- Session management: `docs/sessions/`

### 📊 Definition of Done

- All agent management endpoints migrated and functional
- Session management APIs migrated with lifecycle support
- Task and workflow endpoints migrated
- CLI and tool interface endpoints migrated
- Unified response format applied to all endpoints
- Authentication and authorization implemented
- Input validation applied to all endpoints
- Error handling standardized across APIs
- Backward compatibility maintained
- Comprehensive test coverage
- API documentation updated

---

## 🔍 Relevant Links

- Opencode client source: `packages/opencode-client/src/api/`
- Agent management: `packages/opencode-client/src/agents/`
- Session management: `packages/opencode-client/src/sessions/`
- Task management: `packages/opencode-client/src/tasks/`
- Workflow management: `packages/opencode-client/src/workflows/`
- CLI tools: `packages/opencode-client/src/cli/`
- API architecture: `src/typescript/server/api/v1/`
