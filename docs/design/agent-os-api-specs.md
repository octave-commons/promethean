# Agent OS API Specifications

This document defines the REST APIs and message schemas for the core Agent OS services.

## Table of Contents

- [Agent Registry API](#agent-registry-api)
- [Task Assignment API](#task-assignment-api)
- [Agent Lifecycle API](#agent-lifecycle-api)
- [Monitoring API](#monitoring-api)
- [Message Schemas](#message-schemas)
- [Authentication & Authorization](#authentication--authorization)

## Agent Registry API

### Base URL
```
http://localhost:3000/api/v1/agent-registry
```

### Endpoints

#### Register Agent Instance
```http
POST /agents
Content-Type: application/json

{
  "agentType": "code-reviewer",
  "configuration": {
    "model": "claude-3.5-sonnet",
    "maxConcurrentTasks": 3,
    "capabilities": ["code-review", "typescript", "javascript"],
    "preferences": {
      "taskTypes": ["review", "refactor"],
      "workloadPreferences": "balanced"
    }
  },
  "metadata": {
    "createdBy": "system",
    "tags": ["typescript", "review"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "instanceId": "agent_abc123def456",
    "agentType": "code-reviewer",
    "status": "initializing",
    "registeredAt": "2025-01-15T10:30:00Z",
    "configuration": { ... },
    "capabilities": [
      {
        "name": "code-review",
        "level": 0.9,
        "endorsedBy": [],
        "lastUsed": "2025-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### Get Agent Instance
```http
GET /agents/{instanceId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "instanceId": "agent_abc123def456",
    "agentType": "code-reviewer",
    "status": "idle",
    "registeredAt": "2025-01-15T10:30:00Z",
    "lastSeen": "2025-01-15T11:45:00Z",
    "configuration": { ... },
    "capabilities": [ ... ],
    "currentAssignments": [],
    "performanceMetrics": {
      "totalCompleted": 15,
      "averageDuration": 1800000,
      "successRate": 0.93,
      "reputation": 4.2
    }
  }
}
```

#### List Agents
```http
GET /agents?status=available&capability=code-review&limit=10&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "agents": [ ... ],
    "pagination": {
      "total": 25,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

#### Update Agent Configuration
```http
PATCH /agents/{instanceId}
Content-Type: application/json

{
  "configuration": {
    "maxConcurrentTasks": 5,
    "preferences": {
      "taskTypes": ["review", "refactor", "audit"]
    }
  }
}
```

#### Update Agent Status
```http
PUT /agents/{instanceId}/status
Content-Type: application/json

{
  "status": "busy",
  "metadata": {
    "reason": "Working on complex review task"
  }
}
```

#### Delete Agent Instance
```http
DELETE /agents/{instanceId}
```

## Task Assignment API

### Base URL
```
http://localhost:3000/api/v1/task-assignment
```

### Endpoints

#### Submit Task for Assignment
```http
POST /tasks/submit
Content-Type: application/json

{
  "taskId": "kanban_task_xyz789",
  "taskData": {
    "title": "Review authentication module",
    "description": "Comprehensive review of the auth system",
    "requirements": [
      {
        "capability": "code-review",
        "level": 0.8
      },
      {
        "capability": "security",
        "level": 0.7
      }
    ],
    "priority": "high",
    "estimatedDuration": 3600000,
    "deadline": "2025-01-16T18:00:00Z",
    "metadata": {
      "tags": ["security", "authentication"],
      "complexity": "high"
    }
  },
  "assignmentPreferences": {
    "strategy": "capability_match",
    "excludeAgents": ["agent_def456ghi789"],
    "preferredAgents": []
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assignmentId": "assign_abc123def456",
    "taskId": "kanban_task_xyz789",
    "status": "pending_assignment",
    "submittedAt": "2025-01-15T12:00:00Z"
  }
}
```

#### Get Task Assignment Status
```http
GET /tasks/{assignmentId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assignmentId": "assign_abc123def456",
    "taskId": "kanban_task_xyz789",
    "status": "assigned",
    "agentInstanceId": "agent_abc123def456",
    "assignedAt": "2025-01-15T12:05:00Z",
    "acceptedAt": "2025-01-15T12:06:00Z",
    "startedAt": "2025-01-15T12:10:00Z",
    "estimatedCompletion": "2025-01-15T13:10:00Z",
    "assignment": {
      "confidence": 0.92,
      "strategy": "capability_workload_mix",
      "reasoning": "High capability match and current availability"
    }
  }
}
```

#### Cancel Task Assignment
```http
DELETE /tasks/{assignmentId}
```

#### Reassign Task
```http
POST /tasks/{assignmentId}/reassign
Content-Type: application/json

{
  "reason": "Agent became unavailable",
  "excludeAgents": ["agent_abc123def456"],
  "assignmentPreferences": {
    "strategy": "workload_balance"
  }
}
```

## Agent Lifecycle API

### Base URL
```
http://localhost:3000/api/v1/agent-lifecycle
```

### Endpoints

#### Spawn Agent Instance
```http
POST /agents/spawn
Content-Type: application/json

{
  "agentType": "code-reviewer",
  "configuration": {
    "model": "claude-3.5-sonnet",
    "maxConcurrentTasks": 3
  },
  "autoAssign": true,
  "initialTask": {
    "taskId": "kanban_task_xyz789"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "instanceId": "agent_abc123def456",
    "status": "initializing",
    "spawnTime": "2025-01-15T12:00:00Z",
    "estimatedReady": "2025-01-15T12:02:00Z"
  }
}
```

#### Terminate Agent Instance
```http
POST /agents/{instanceId}/terminate
Content-Type: application/json

{
  "reason": "task_completed",
  "gracePeriod": 30000,
  "force": false
}
```

#### Get Agent Health
```http
GET /agents/{instanceId}/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "instanceId": "agent_abc123def456",
    "status": "healthy",
    "lastHeartbeat": "2025-01-15T12:45:00Z",
    "uptime": 2700000,
    "resourceUsage": {
      "cpu": 0.15,
      "memory": 512000000,
      "activeConnections": 2
    },
    "currentTasks": 1,
    "errors": []
  }
}
```

#### Get Agent Logs
```http
GET /agents/{instanceId}/logs?level=info&limit=50&since=2025-01-15T12:00:00Z
```

## Monitoring API

### Base URL
```
http://localhost:3000/api/v1/monitoring
```

### Endpoints

#### Get System Overview
```http
GET /system/overview
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAgents": 15,
    "activeAgents": 12,
    "idleAgents": 3,
    "busyAgents": 9,
    "totalTasks": 45,
    "pendingTasks": 3,
    "activeTasks": 12,
    "completedToday": 28,
    "systemHealth": "healthy",
    "uptime": 86400000
  }
}
```

#### Get Agent Performance Metrics
```http
GET /agents/{instanceId}/metrics?period=24h
```

#### Get Task Analytics
```http
GET /analytics/tasks?period=7d&groupBy=agentType
```

#### Get Capability Utilization
```http
GET /analytics/capabilities?period=24h
```

## Message Schemas

### Task Assignment Message

```typescript
interface TaskAssignmentMessage {
  type: 'task_assignment';
  payload: {
    assignmentId: string;
    taskId: string;
    agentInstanceId: string;
    taskData: any;
    assignment: TaskAssignment;
    assignedAt: string;
  };
}
```

### Agent Status Update Message

```typescript
interface AgentStatusUpdateMessage {
  type: 'agent_status_update';
  payload: {
    instanceId: string;
    status: AgentStatus;
    timestamp: string;
    metadata?: Record<string, any>;
    resourceUsage?: {
      cpu: number;
      memory: number;
      activeConnections: number;
    };
  };
}
```

### Task Progress Message

```typescript
interface TaskProgressMessage {
  type: 'task_progress';
  payload: {
    assignmentId: string;
    progress: number;
    status: 'in_progress' | 'completed' | 'failed' | 'blocked';
    timestamp: string;
    metadata?: {
      currentStep?: string;
      estimatedCompletion?: string;
      errors?: string[];
    };
  };
}
```

### Agent Heartbeat Message

```typescript
interface AgentHeartbeatMessage {
  type: 'agent_heartbeat';
  payload: {
    instanceId: string;
    timestamp: string;
    status: AgentStatus;
    currentTasks: number;
    resourceUsage: {
      cpu: number;
      memory: number;
    };
  };
}
```

## Authentication & Authorization

### API Key Authentication
All API requests must include an API key in the header:
```http
Authorization: Bearer <api_key>
X-API-Key: <api_key>
```

### Permission Scopes

- `agent:read` - Read agent information
- `agent:write` - Create and update agents
- `agent:delete` - Delete agent instances
- `task:assign` - Assign tasks to agents
- `task:manage` - Manage task assignments
- `system:monitor` - Access system monitoring data
- `system:admin` - Full system administration

### Rate Limiting

- **Standard endpoints**: 100 requests per minute
- **Admin endpoints**: 50 requests per minute
- **Monitoring endpoints**: 200 requests per minute

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "AGENT_NOT_FOUND",
    "message": "Agent instance not found",
    "details": {
      "instanceId": "agent_abc123def456",
      "timestamp": "2025-01-15T12:00:00Z"
    }
  }
}
```

### Common Error Codes

- `AGENT_NOT_FOUND` - Agent instance does not exist
- `AGENT_UNAVAILABLE` - Agent is not available for assignment
- `TASK_NOT_FOUND` - Task does not exist
- `ASSIGNMENT_FAILED` - Task assignment failed
- `INVALID_CONFIGURATION` - Invalid agent configuration
- `INSUFFICIENT_PERMISSIONS` - API key lacks required permissions
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `SYSTEM_ERROR` - Internal system error

## WebSocket Events

### Connection Endpoint
```
ws://localhost:3000/ws/agent-os
```

### Event Types

#### Agent Status Changed
```json
{
  "type": "agent_status_changed",
  "data": {
    "instanceId": "agent_abc123def456",
    "oldStatus": "idle",
    "newStatus": "busy",
    "timestamp": "2025-01-15T12:30:00Z"
  }
}
```

#### Task Assigned
```json
{
  "type": "task_assigned",
  "data": {
    "assignmentId": "assign_abc123def456",
    "agentInstanceId": "agent_abc123def456",
    "taskId": "kanban_task_xyz789",
    "timestamp": "2025-01-15T12:30:00Z"
  }
}
```

#### Task Completed
```json
{
  "type": "task_completed",
  "data": {
    "assignmentId": "assign_abc123def456",
    "taskId": "kanban_task_xyz789",
    "agentInstanceId": "agent_abc123def456",
    "duration": 1800000,
    "success": true,
    "timestamp": "2025-01-15T14:00:00Z"
  }
}
```

## SDK Examples

### Node.js SDK

```typescript
import { AgentOSClient } from '@promethean/agent-os-sdk';

const client = new AgentOSClient({
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.AGENT_OS_API_KEY
});

// Register an agent
const agent = await client.agents.register({
  agentType: 'code-reviewer',
  configuration: {
    model: 'claude-3.5-sonnet',
    maxConcurrentTasks: 3
  }
});

// Submit a task
const assignment = await client.tasks.submit({
  taskId: 'kanban_task_xyz789',
  taskData: {
    title: 'Review auth module',
    requirements: [
      { capability: 'code-review', level: 0.8 }
    ]
  }
});

// Monitor task progress
client.on('task_progress', (event) => {
  console.log(`Task ${event.data.assignmentId} progress: ${event.data.progress}%`);
});
```

### Python SDK

```python
from agent_os_sdk import AgentOSClient

client = AgentOSClient(
    base_url='http://localhost:3000',
    api_key='your-api-key'
)

# List available agents
agents = client.agents.list(status='available')

# Assign task to best agent
assignment = client.tasks.submit(
    task_id='kanban_task_xyz789',
    task_data={
        'title': 'Review auth module',
        'requirements': [
            {'capability': 'code-review', 'level': 0.8}
        ]
    }
)

# Wait for completion
result = client.tasks.wait_for_completion(assignment.id)
print(f"Task completed by {result.agent_instance_id}")
```

This API specification provides the foundation for building Agent OS clients and integrations across different platforms and programming languages.