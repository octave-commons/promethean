# TaskAIManager API Documentation

## 📋 Overview

The TaskAIManager provides AI-assisted task management capabilities with full kanban compliance integration. This document outlines the compliant API methods and integration patterns.

**Current Compliance Status**: 85% compliant  
**API Version**: 2.0.0  
**Last Updated**: 2025-10-28

---

## 🏗️ Architecture Overview

```
TaskAIManager
├── Compliance Systems
│   ├── WIP Limit Enforcement ✅
│   ├── FSM Transition Validation ✅
│   ├── Task Backup Procedures ⚠️ (Mock → Real)
│   └── Audit Trail Logging ⚠️ (Mock → Real)
├── AI Operations
│   ├── Task Analysis
│   ├── Task Rewriting
│   └── Task Breakdown
└── Integration Points
    ├── Kanban CLI Commands ✅
    ├── TaskContentManager ✅
    └── Event Log Manager ✅
```

---

## 🔧 Core API Methods

### Constructor

```typescript
constructor(config?: TaskAIManagerConfig)
```

**Parameters**:

- `config` (optional): Configuration object
  - `model`: LLM model name (default: 'qwen3:8b')
  - `baseUrl`: Ollama base URL (default: 'http://localhost:11434')
  - `timeout`: Request timeout in ms (default: 60000)
  - `maxTokens`: Maximum tokens (default: 4096)
  - `temperature`: Sampling temperature (default: 0.3)

**Example**:

```typescript
const manager = new TaskAIManager({
  model: 'qwen3:8b',
  baseUrl: 'http://localhost:11434',
  timeout: 120000,
  maxTokens: 8192,
  temperature: 0.1,
});
```

---

## 🤖 AI Operations API

### Task Analysis

```typescript
async analyzeTask(request: TaskAnalysisRequest): Promise<TaskAnalysisResult>
```

**Purpose**: Analyze task quality, complexity, or completeness

**Request Parameters**:

```typescript
interface TaskAnalysisRequest {
  uuid: string; // Task UUID
  analysisType: 'quality' | 'complexity' | 'completeness';
  context?: Record<string, unknown>; // Additional context
}
```

**Response**:

```typescript
interface TaskAnalysisResult {
  success: boolean;
  taskUuid: string;
  analysisType: string;
  analysis: {
    qualityScore?: number;
    completenessScore?: number;
    complexityScore?: number;
    suggestions: string[];
    risks: string[];
    dependencies: string[];
    subtasks: Array<Record<string, unknown>>;
  };
  metadata: {
    analyzedAt: Date;
    analyzedBy: string;
    model: string;
    processingTime: number;
  };
  error?: string; // Only present if success = false
}
```

**Usage Example**:

```typescript
const result = await manager.analyzeTask({
  uuid: 'task-123',
  analysisType: 'quality',
  context: { focusArea: 'security' },
});

if (result.success) {
  console.log(`Quality Score: ${result.analysis.qualityScore}`);
  console.log(`Suggestions: ${result.analysis.suggestions.join(', ')}`);
} else {
  console.error(`Analysis failed: ${result.error}`);
}
```

### Task Rewriting

```typescript
async rewriteTask(request: TaskRewriteRequest): Promise<TaskRewriteResult>
```

**Purpose**: Rewrite task content with AI assistance

**Request Parameters**:

```typescript
interface TaskRewriteRequest {
  uuid: string;
  rewriteType: string;
  instructions?: string;
  targetAudience?: 'developer' | 'stakeholder' | 'qa';
  tone?: 'technical' | 'business' | 'user-friendly';
}
```

**Response**:

```typescript
interface TaskRewriteResult {
  success: boolean;
  taskUuid: string;
  rewriteType: string;
  originalContent: string;
  rewrittenContent: string;
  changes: {
    summary: string;
    highlights: string[];
    additions: string[];
    modifications: string[];
    removals: string[];
  };
  metadata: {
    rewrittenAt: Date;
    rewrittenBy: string;
    model: string;
    processingTime: number;
  };
  error?: string;
}
```

**Usage Example**:

```typescript
const result = await manager.rewriteTask({
  uuid: 'task-123',
  rewriteType: 'clarify_objectives',
  instructions: 'Focus on security requirements',
  targetAudience: 'developer',
  tone: 'technical',
});

if (result.success) {
  console.log(`Rewrite completed: ${result.changes.summary}`);
  // Task automatically backed up and board synchronized
} else {
  console.error(`Rewrite failed: ${result.error}`);
}
```

### Task Breakdown

```typescript
async breakdownTask(request: TaskBreakdownRequest): Promise<TaskBreakdownResult>
```

**Purpose**: Break down complex tasks into subtasks

**Request Parameters**:

```typescript
interface TaskBreakdownRequest {
  uuid: string;
  breakdownType: string;
  maxSubtasks?: number; // Default: 5
  complexity?: 'simple' | 'medium' | 'complex';
  includeEstimates?: boolean; // Default: false
}
```

**Response**:

```typescript
interface TaskBreakdownResult {
  success: boolean;
  taskUuid: string;
  breakdownType: string;
  subtasks: Array<{
    title: string;
    description: string;
    estimatedHours?: number;
    priority: string;
    dependencies: string[];
    acceptanceCriteria: string[];
  }>;
  totalEstimatedHours: number;
  metadata: {
    breakdownAt: Date;
    breakdownBy: string;
    model: string;
    processingTime: number;
  };
  error?: string;
}
```

**Usage Example**:

```typescript
const result = await manager.breakdownTask({
  uuid: 'task-123',
  breakdownType: 'technical_implementation',
  maxSubtasks: 8,
  complexity: 'complex',
  includeEstimates: true,
});

if (result.success) {
  console.log(`Generated ${result.subtasks.length} subtasks`);
  console.log(`Total estimated hours: ${result.totalEstimatedHours}`);
} else {
  console.error(`Breakdown failed: ${result.error}`);
}
```

---

## 🔒 Compliance Integration API

### WIP Limit Enforcement

The TaskAIManager automatically integrates with WIP limit enforcement:

```typescript
// Automatic WIP validation before task operations
private async validateTaskTransition(task: Task, newStatus: string): Promise<boolean> {
  // 1. Check WIP limits
  const wipValidation = await this.wipEnforcement.validateWIPLimits(newStatus, 1, board);
  if (!wipValidation.valid) {
    throw new Error(`WIP limit violation: ${wipValidation.violation?.reason}`);
  }

  // 2. Validate transition rules
  const transitionResult = await validateTransition(
    this.transitionRulesState,
    task.status,
    newStatus,
    task,
    board,
  );

  if (!transitionResult.allowed) {
    throw new Error(`Transition blocked: ${transitionResult.reason}`);
  }

  return true;
}
```

### FSM Transition Validation

All task status changes go through FSM validation:

```typescript
// Built-in transition validation
const validTransitions = {
  todo: ['in_progress'],
  in_progress: ['testing', 'review'],
  testing: ['review', 'in_progress'],
  review: ['done', 'testing'],
  done: ['todo'], // Allow reopening
};
```

### Audit Trail Logging

Comprehensive audit logging for all operations:

```typescript
interface AuditEvent {
  timestamp: string;
  agent: string;
  sessionId: string;
  taskUuid: string;
  action: string;
  oldStatus?: string;
  newStatus?: string;
  metadata?: Record<string, unknown>;
}
```

**Audit Actions Logged**:

- `task_analyzed`
- `task_rewritten`
- `task_broken_down`
- `backup_created`
- `backup_failed`
- `board_synced`
- `board_sync_failed`
- `transition_validated`
- `transition_blocked`

---

## 🔗 Kanban CLI Integration Patterns

### Board Synchronization

All task operations automatically trigger board synchronization:

```typescript
private async syncKanbanBoard(options?: {
  retryCount?: number;
  timeout?: number;
}): Promise<void> {
  // Execute: pnpm kanban regenerate
  // Retry logic with exponential backoff
  // Comprehensive error handling
  // Audit logging of sync attempts
}
```

### Status Updates

Task status changes use kanban CLI commands:

```typescript
// Instead of direct file manipulation:
await this.contentManager.updateTaskBody({...});

// Use kanban CLI for compliance:
execSync('pnpm kanban update-status <uuid> <status>', {
  stdio: 'inherit',
  cwd: process.cwd()
});
```

### WIP Limit Enforcement

Integration with kanban WIP enforcement:

```typescript
// Before task operations:
execSync('pnpm kanban enforce-wip-limits --dry-run', {
  stdio: 'inherit',
  cwd: process.cwd(),
});
```

---

## 🛡️ Security Requirements

### Access Control

```typescript
interface SecurityContext {
  agentName: string;
  sessionId: string;
  permissions: string[];
  rateLimit: {
    requestsPerMinute: number;
    burstLimit: number;
  };
}
```

### Input Validation

All inputs are validated before processing:

```typescript
private validateTaskUUID(uuid: string): void {
  if (!uuid || typeof uuid !== 'string' || uuid.length !== 36) {
    throw new Error('Invalid task UUID format');
  }
}

private validateAnalysisType(type: string): void {
  const validTypes = ['quality', 'complexity', 'completeness'];
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid analysis type: ${type}`);
  }
}
```

### Rate Limiting

```typescript
class RateLimiter {
  private requests = new Map<string, number[]>();

  async checkLimit(agentId: string): Promise<boolean> {
    const now = Date.now();
    const window = 60000; // 1 minute
    const limit = 30; // 30 requests per minute

    const agentRequests = this.requests.get(agentId) || [];
    const recentRequests = agentRequests.filter((time) => now - time < window);

    if (recentRequests.length >= limit) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(agentId, recentRequests);
    return true;
  }
}
```

---

## 📊 Monitoring and Observability

### Performance Metrics

```typescript
interface PerformanceMetrics {
  operation: string;
  duration: number;
  success: boolean;
  errorType?: string;
  agentId: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}
```

### Health Checks

```typescript
async healthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: {
    ai: boolean;
    compliance: boolean;
    storage: boolean;
    cli: boolean;
  };
  metrics: {
    uptime: number;
    requestCount: number;
    errorRate: number;
    averageResponseTime: number;
  };
}> {
  // Check AI model availability
  // Validate compliance systems
  // Test storage access
  // Verify CLI integration
  // Return comprehensive health status
}
```

### Error Tracking

```typescript
interface ErrorReport {
  id: string;
  timestamp: string;
  operation: string;
  error: {
    message: string;
    stack: string;
    type: string;
    code?: string;
  };
  context: {
    agentId: string;
    taskId?: string;
    request?: Record<string, unknown>;
    environment: Record<string, string>;
  };
  resolution?: {
    action: string;
    resolved: boolean;
    timestamp: string;
  };
}
```

---

## 🔧 Configuration Management

### Environment Variables

```bash
# LLM Configuration
LLM_DRIVER=ollama
LLM_MODEL=qwen3:8b
LLM_BASE_URL=http://localhost:11434

# Agent Configuration
AGENT_NAME=TaskAIManager
SESSION_ID=session-123

# Security
AUDIT_LOG_LEVEL=info
BACKUP_ENCRYPTION=true
RATE_LIMIT_ENABLED=true

# Integration
KANBIN_CLI_PATH=/usr/local/bin/pnpm
TASKS_DIR=./docs/agile/tasks
BACKUP_DIR=./backups/tasks
AUDIT_DIR=./logs/audit
```

### Configuration File

```typescript
// taskai-manager.config.json
{
  "ai": {
    "model": "qwen3:8b",
    "baseUrl": "http://localhost:11434",
    "timeout": 60000,
    "maxTokens": 4096,
    "temperature": 0.3
  },
  "compliance": {
    "wipEnforcement": true,
    "transitionValidation": true,
    "auditLogging": true,
    "backupCreation": true
  },
  "security": {
    "rateLimiting": {
      "enabled": true,
      "requestsPerMinute": 30,
      "burstLimit": 50
    },
    "inputValidation": true,
    "auditEncryption": false
  },
  "monitoring": {
    "metricsEnabled": true,
    "healthCheckInterval": 30000,
    "errorTracking": true
  }
}
```

---

## 🧪 Testing API

### Mock Mode

For testing, TaskAIManager supports mock mode:

```typescript
const manager = new TaskAIManager({
  model: 'mock',
  baseUrl: 'mock://test',
  mockMode: true,
  mockResponses: {
    analyzeTask: { success: true, analysis: { qualityScore: 85 } },
    rewriteTask: { success: true, rewrittenContent: 'Mock rewritten content' },
    breakdownTask: { success: true, subtasks: [] },
  },
});
```

### Test Utilities

```typescript
// Test compliance validation
await manager.testComplianceValidation({
  scenario: 'wip_limit_violation',
  expectedBehavior: 'block_transition',
  testData: {
    /* test data */
  },
});

// Test audit logging
await manager.testAuditLogging({
  action: 'task_rewritten',
  verifyLogFile: true,
  verifyEntryStructure: true,
});

// Test CLI integration
await manager.testCLIIntegration({
  command: 'regenerate',
  expectedExitCode: 0,
  verifyOutput: true,
});
```

---

## 📈 Performance Optimization

### Caching Strategy

```typescript
interface CacheConfig {
  analysisCache: {
    enabled: true;
    ttl: 3600000; // 1 hour
    maxSize: 1000;
  };
  taskCache: {
    enabled: true;
    ttl: 300000; // 5 minutes
    maxSize: 500;
  };
  complianceCache: {
    enabled: true;
    ttl: 60000; // 1 minute
    maxSize: 100;
  };
}
```

### Batch Operations

```typescript
interface BatchRequest {
  operations: Array<{
    type: 'analyze' | 'rewrite' | 'breakdown';
    uuid: string;
    params: Record<string, unknown>;
  }>;
  options?: {
    parallel?: boolean;
    continueOnError?: boolean;
    timeout?: number;
  };
}

async processBatch(request: BatchRequest): Promise<BatchResult> {
  // Process multiple operations efficiently
  // Maintain compliance for each operation
  // Provide batch-level error handling
}
```

---

## 🔄 Version Compatibility

### API Versioning

- **v1.0.0**: Initial implementation (deprecated)
- **v2.0.0**: Current version with compliance integration
- **v2.1.0**: Planned - Enhanced security features
- **v3.0.0**: Planned - Multi-model support

### Migration Guide

```typescript
// v1.x to v2.x migration
const v1Manager = new TaskAIManagerV1(config);
const v2Manager = await migrateToV2(v1Manager);

// Automatic migration handles:
// - Configuration format changes
// - API method signatures
// - Compliance system integration
// - Audit log format updates
```

---

## 📞 Support and Troubleshooting

### Common Issues

1. **WIP Limit Violations**

   ```
   Error: WIP limit violation: Target column 'in_progress' would exceed WIP limit (6/5)
   ```

   **Solution**: Move tasks to 'done' or increase WIP limits

2. **Transition Blocked**

   ```
   Error: Transition blocked: Invalid transition: todo → review
   ```

   **Solution**: Use valid transition sequence

3. **AI Model Unavailable**
   ```
   Error: Failed to connect to AI model at http://localhost:11434
   ```
   **Solution**: Start Ollama service or check configuration

### Debug Mode

```typescript
const manager = new TaskAIManager({
  ...config,
  debug: true,
  logLevel: 'debug',
});

// Debug output includes:
// - Request/response details
// - Compliance validation steps
// - CLI command execution
// - Performance metrics
```

### Health Monitoring

```bash
# Check system health
curl http://localhost:3000/health

# View metrics
curl http://localhost:3000/metrics

# Check compliance status
curl http://localhost:3000/compliance
```

---

**API Documentation Version**: 2.0.0  
**Last Updated**: 2025-10-28  
**Next Review**: 2025-11-28
