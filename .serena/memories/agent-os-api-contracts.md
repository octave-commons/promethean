# Agent OS API Contracts

## 1. Agent Registry API

### Base URL
```
http://localhost:3000/api/v1/agent-registry
```

### Core Data Types

```typescript
interface AgentInstance {
  instanceId: string;
  agentType: string;
  name: string;
  description?: string;
  status: AgentStatus;
  health: AgentHealth;
  capabilities: AgentCapability[];
  resourceAllocation: ResourceAllocation;
  performanceMetrics: PerformanceMetrics;
  createdAt: string;
  lastActive: string;
  tags: string[];
}

interface AgentCapability {
  name: string;
  category: CapabilityCategory;
  level: ProficiencyLevel;
  experience: number;
  successRate: number;
  lastUsed: string;
}

interface ResourceAllocation {
  cpu: CpuAllocation;
  memory: MemoryAllocation;
  storage: StorageAllocation;
  network: NetworkAllocation;
  toolAccess: ToolAccessAllocation[];
  apiQuotas: ApiQuotaAllocation[];
}

interface PerformanceMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageTaskDuration: number;
  successRate: number;
  reputation: number;
}
```

### Endpoints

#### Create Agent Instance
```http
POST /agents
Content-Type: application/json
Authorization: Bearer <api_key>

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
  "resourceRequirements": {
    "cpu": { "cores": 2, "maxFrequency": 3000 },
    "memory": { "ram": 2048, "cacheSize": 512 },
    "storage": { "quota": 10240 },
    "tools": ["eslint", "prettier", "typescript-compiler"]
  },
  "metadata": {
    "createdBy": "system",
    "tags": ["typescript", "review"],
    "teamId": "frontend-team"
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
    "name": "Code Reviewer Agent #001",
    "status": "initializing",
    "registeredAt": "2025-01-15T10:30:00Z",
    "estimatedReadyTime": "2025-01-15T10:32:00Z",
    "configuration": { ... },
    "capabilities": [
      {
        "name": "code-review",
        "category": "coding",
        "level": 4,
        "experience": 1250,
        "successRate": 0.94,
        "lastUsed": "2025-01-15T10:30:00Z"
      }
    ],
    "resourceAllocation": { ... },
    "endpoints": {
      "api": "http://localhost:3000/api/v1/agents/agent_abc123def456",
      "websocket": "ws://localhost:3000/ws/agents/agent_abc123def456",
      "metrics": "http://localhost:3000/api/v1/agents/agent_abc123def456/metrics"
    }
  }
}
```

#### Get Agent Instance
```http
GET /agents/{instanceId}
Authorization: Bearer <api_key>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "instanceId": "agent_abc123def456",
    "agentType": "code-reviewer",
    "name": "Code Reviewer Agent #001",
    "status": "idle",
    "health": "healthy",
    "registeredAt": "2025-01-15T10:30:00Z",
    "lastSeen": "2025-01-15T11:45:00Z",
    "lastHeartbeat": "2025-01-15T11:44:30Z",
    "capabilities": [ ... ],
    "currentAssignments": [],
    "performanceMetrics": {
      "totalCompleted": 15,
      "averageDuration": 1800000,
      "successRate": 0.93,
      "reputation": 4.2,
      "lastUpdated": "2025-01-15T11:44:30Z"
    },
    "resourceUsage": {
      "cpu": { "current": 0.15, "limit": 2.0 },
      "memory": { "current": 512, "limit": 2048 },
      "storage": { "current": 256, "limit": 10240 }
    }
  }
}
```

#### List Agents
```http
GET /agents?status=available&capability=code-review&limit=10&offset=0&teamId=frontend-team
Authorization: Bearer <api_key>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "instanceId": "agent_abc123def456",
        "agentType": "code-reviewer",
        "name": "Code Reviewer Agent #001",
        "status": "idle",
        "health": "healthy",
        "capabilities": [ ... ],
        "currentTasks": 1,
        "lastActive": "2025-01-15T11:45:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    },
    "filters": {
      "status": "available",
      "capability": "code-review",
      "teamId": "frontend-team"
    }
  }
}
```

#### Update Agent Configuration
```http
PATCH /agents/{instanceId}
Content-Type: application/json
Authorization: Bearer <api_key>

{
  "configuration": {
    "maxConcurrentTasks": 5,
    "preferences": {
      "taskTypes": ["review", "refactor", "audit"]
    }
  },
  "resourceRequirements": {
    "cpu": { "cores": 4 },
    "memory": { "ram": 4096 }
  }
}
```

#### Update Agent Status
```http
PUT /agents/{instanceId}/status
Content-Type: application/json
Authorization: Bearer <api_key>

{
  "status": "busy",
  "metadata": {
    "reason": "Working on complex review task",
    "currentTaskId": "kanban_task_xyz789",
    "estimatedCompletion": "2025-01-15T14:00:00Z"
  }
}
```

#### Delete Agent Instance
```http
DELETE /agents/{instanceId}
Authorization: Bearer <api_key>

{
  "reason": "task_completed",
  "gracePeriod": 30000,
  "force": false,
  "backupData": true
}
```

## 2. Task Assignment API

### Base URL
```
http://localhost:3000/api/v1/task-assignment
```

### Core Data Types

```typescript
interface TaskSubmission {
  taskId: string;
  taskData: TaskData;
  requirements: TaskRequirement[];
  constraints: AssignmentConstraints;
  preferences: AssignmentPreferences;
  deadline?: string;
  priority: TaskPriority;
}

interface TaskData {
  title: string;
  description: string;
  complexity: number;
  estimatedDuration: number;
  tags: string[];
  dependencies: string[];
  collaborationNeeds: CollaborationRequirement[];
}

interface TaskRequirement {
  capability: string;
  level: ProficiencyLevel;
  category: CapabilityCategory;
  tools: string[];
  experience: number;
}

interface AssignmentResponse {
  assignmentId: string;
  taskId: string;
  agentInstanceId: string;
  status: AssignmentStatus;
  assignedAt: string;
  assignment: AssignmentDetails;
}
```

### Endpoints

#### Submit Task for Assignment
```http
POST /tasks/submit
Content-Type: application/json
Authorization: Bearer <api_key>

{
  "taskId": "kanban_task_xyz789",
  "taskData": {
    "title": "Review authentication module",
    "description": "Comprehensive review of the auth system for security vulnerabilities and code quality",
    "complexity": 7,
    "estimatedDuration": 3600000,
    "tags": ["security", "authentication", "review"],
    "dependencies": ["kanban_task_abc123"],
    "collaborationNeeds": [
      {
        "type": "security_expert",
        "required": true,
        "minParticipants": 1
      }
    ]
  },
  "requirements": [
    {
      "capability": "code-review",
      "level": 4,
      "category": "coding",
      "tools": ["eslint", "sonarqube"],
      "experience": 1000
    },
    {
      "capability": "security",
      "level": 3,
      "category": "analysis",
      "tools": ["security-scanner", "owasp-checks"],
      "experience": 500
    }
  ],
  "constraints": {
    "maxAssignees": 2,
    "excludedAgents": ["agent_def456ghi789"],
    "requiredSkills": ["oauth2", "jwt"],
    "securityClearance": "confidential"
  },
  "preferences": {
    "strategy": "capability_workload_mix",
    "preferredAgents": ["agent_abc123def456"],
    "teamPreference": "frontend-team",
    "learningValue": 0.8
  },
  "priority": "high",
  "deadline": "2025-01-16T18:00:00Z"
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
    "submittedAt": "2025-01-15T12:00:00Z",
    "estimatedAssignmentTime": "2025-01-15T12:02:00Z",
    "submissionId": "sub_xyz789abc123"
  }
}
```

#### Get Task Assignment Status
```http
GET /tasks/{assignmentId}
Authorization: Bearer <api_key>
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
      "reasoning": "High capability match (0.89) and current availability. Agent has strong performance history with similar tasks.",
      "selectedFrom": 5,
      "selectionCriteria": {
        "capabilityScore": 0.89,
        "workloadScore": 0.95,
        "performanceScore": 0.93,
        "overallScore": 0.92
      }
    },
    "collaborators": [
      {
        "agentInstanceId": "agent_def789ghi012",
        "role": "security_reviewer",
        "joinedAt": "2025-01-15T12:08:00Z"
      }
    ]
  }
}
```

#### Cancel Task Assignment
```http
DELETE /tasks/{assignmentId}
Authorization: Bearer <api_key>

{
  "reason": "Requirements changed",
  "notifyAgent": true,
  "reschedule": false,
  "cancellationFee": false
}
```

#### Reassign Task
```http
POST /tasks/{assignmentId}/reassign
Content-Type: application/json
Authorization: Bearer <api_key>

{
  "reason": "Agent became unavailable",
  "excludeAgents": ["agent_abc123def456"],
  "assignmentPreferences": {
    "strategy": "workload_balance",
    "urgent": true
  },
  "preserveProgress": true,
  "notifyStakeholders": true
}
```

## 3. Agent Communication API

### Base URL
```
http://localhost:3000/api/v1/agent-communication
```

### Core Data Types

```typescript
interface Message {
  messageId: string;
  fromAgentId: string;
  toAgentId?: string;
  toTopic?: string;
  messageType: MessageType;
  content: MessageContent;
  timestamp: string;
  priority: MessagePriority;
  metadata: MessageMetadata;
}

interface CollaborationSession {
  sessionId: string;
  participants: CollaborationParticipant[];
  topic: string;
  purpose: string;
  createdAt: string;
  status: CollaborationStatus;
  communicationProtocol: CommunicationProtocol;
}

interface MessageContent {
  type: 'text' | 'data' | 'file' | 'command';
  payload: any;
  format?: string;
  encoding?: string;
  attachments?: MessageAttachment[];
}
```

### Endpoints

#### Send Direct Message
```http
POST /messages/direct
Content-Type: application/json
Authorization: Bearer <api_key>

{
  "fromAgentId": "agent_abc123def456",
  "toAgentId": "agent_def789ghi012",
  "messageType": "request",
  "content": {
    "type": "text",
    "payload": {
      "text": "Can you review the security implications of this authentication flow?",
      "context": {
        "taskId": "kanban_task_xyz789",
        "urgency": "high"
      }
    }
  },
  "priority": "high",
  "metadata": {
    "correlationId": "req_xyz789",
    "expectedResponseTime": 300000,
    "replyTo": "agent_abc123def456"
  }
}
```

#### Broadcast Message
```http
POST /messages/broadcast
Content-Type: application/json
Authorization: Bearer <api_key>

{
  "fromAgentId": "agent_abc123def456",
  "topic": "system-updates",
  "messageType": "notification",
  "content": {
    "type": "text",
    "payload": {
      "text": "System maintenance scheduled for 2025-01-16T02:00:00Z",
      "details": {
        "duration": 3600000,
        "affectedServices": ["task-assignment", "agent-registry"],
        "impact": "read-only mode"
      }
    }
  },
  "targetCriteria": {
    "agentTypes": ["code-reviewer", "system-architect"],
    "status": ["active", "idle"],
    "capabilities": ["system-admin"]
  }
}
```

#### Create Collaboration Session
```http
POST /collaboration/sessions
Content-Type: application/json
Authorization: Bearer <api_key>

{
  "initiatorAgentId": "agent_abc123def456",
  "participants": [
    {
      "agentInstanceId": "agent_def789ghi012",
      "role": "security_expert",
      "responsibilities": ["security_review", "vulnerability_assessment"]
    },
    {
      "agentInstanceId": "agent_ghi345jkl678",
      "role": "frontend_specialist",
      "responsibilities": ["ui_review", "accessibility_check"]
    }
  ],
  "topic": "Authentication System Security Review",
  "purpose": "Comprehensive security review of the new OAuth2 implementation",
  "communicationProtocol": {
    "type": "structured_workflow",
    "rules": [
      "All security concerns must be documented",
      "UI changes require frontend approval",
      "Final decision requires consensus"
    ],
    "votingMechanism": "weighted_consensus"
  },
  "sharedResources": [
    {
      "type": "workspace",
      "path": "/shared/auth-review-2025-01",
      "permissions": ["read", "write"]
    },
    {
      "type": "document",
      "url": "https://docs.company.com/auth-spec-v2",
      "permissions": ["read"]
    }
  ],
  "estimatedDuration": 7200000,
  "deadline": "2025-01-15T18:00:00Z"
}
```

## 4. Monitoring & Analytics API

### Base URL
```
http://localhost:3000/api/v1/monitoring
```

### Endpoints

#### Get System Overview
```http
GET /system/overview
Authorization: Bearer <api_key>
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
    "uptime": 86400000,
    "resourceUtilization": {
      "cpu": 0.65,
      "memory": 0.72,
      "storage": 0.45,
      "network": 0.38
    },
    "performanceMetrics": {
      "averageTaskDuration": 2700000,
      "taskSuccessRate": 0.94,
      "agentUtilization": 0.78,
      "collaborationEfficiency": 0.86
    },
    "alerts": [
      {
        "type": "warning",
        "message": "Agent agent_xyz789 approaching memory limit",
        "timestamp": "2025-01-15T12:30:00Z"
      }
    ]
  }
}
```

#### Get Agent Performance Metrics
```http
GET /agents/{instanceId}/metrics?period=24h&granularity=hourly
Authorization: Bearer <api_key>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "instanceId": "agent_abc123def456",
    "period": "24h",
    "granularity": "hourly",
    "taskMetrics": {
      "totalTasks": 8,
      "completedTasks": 7,
      "failedTasks": 1,
      "averageDuration": 1650000,
      "successRate": 0.875,
      "qualityScores": [0.9, 0.85, 0.92, 0.88, 0.91, 0.87, 0.89]
    },
    "resourceMetrics": {
      "cpu": [
        {"timestamp": "2025-01-15T00:00:00Z", "usage": 0.12},
        {"timestamp": "2025-01-15T01:00:00Z", "usage": 0.15}
      ],
      "memory": [
        {"timestamp": "2025-01-15T00:00:00Z", "usage": 512},
        {"timestamp": "2025-01-15T01:00:00Z", "usage": 640}
      ]
    },
    "collaborationMetrics": {
      "collaborationsParticipated": 3,
      "messagesExchanged": 24,
      "averageResponseTime": 45000,
      "collaborationSuccessRate": 1.0
    },
    "learningMetrics": {
      "newSkillsAcquired": 1,
      "capabilityImprovements": 2,
      "experienceGained": 125,
      "adaptationRate": 0.73
    }
  }
}
```

#### Get Task Analytics
```http
GET /analytics/tasks?period=7d&groupBy=agentType&includeTrends=true
Authorization: Bearer <api_key>
```

## 5. WebSocket Events

### Connection Endpoint
```
ws://localhost:3000/ws/agent-os
```

### Authentication
```javascript
// WebSocket connection with authentication
const ws = new WebSocket('ws://localhost:3000/ws/agent-os', [
  'agent-os-protocol',
  `Bearer ${api_key}`
]);
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
    "timestamp": "2025-01-15T12:30:00Z",
    "metadata": {
      "reason": "Task assigned",
      "taskId": "kanban_task_xyz789"
    }
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
    "timestamp": "2025-01-15T12:30:00Z",
    "assignment": {
      "confidence": 0.92,
      "strategy": "capability_workload_mix"
    }
  }
}
```

#### Task Progress Update
```json
{
  "type": "task_progress",
  "data": {
    "assignmentId": "assign_abc123def456",
    "taskId": "kanban_task_xyz789",
    "agentInstanceId": "agent_abc123def456",
    "progress": 65,
    "status": "in_progress",
    "timestamp": "2025-01-15T13:15:00Z",
    "metadata": {
      "currentStep": "Security vulnerability assessment",
      "estimatedCompletion": "2025-01-15T14:30:00Z"
    }
  }
}
```

#### Agent Health Alert
```json
{
  "type": "agent_health_alert",
  "data": {
    "instanceId": "agent_abc123def456",
    "severity": "warning",
    "alertType": "resource_usage",
    "timestamp": "2025-01-15T13:45:00Z",
    "details": {
      "metric": "memory",
      "currentValue": 0.89,
      "threshold": 0.85,
      "trend": "increasing"
    },
    "recommendedActions": [
      "Monitor for continued increase",
      "Consider memory optimization",
      "Prepare to scale resources if needed"
    ]
  }
}
```

These API contracts provide a comprehensive foundation for implementing the Agent OS system with clear interfaces for all major components.