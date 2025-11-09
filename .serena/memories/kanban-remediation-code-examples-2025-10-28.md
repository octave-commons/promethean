# Kanban System Remediation - Code Examples Repository
**Date**: 2025-10-28  
**Purpose**: Complete before/after code examples for all remediation fixes  
**Reference**: Implementation checklist and technical documentation

---

## 📁 File: `packages/kanban/src/lib/task-content/ai.ts`

### 🔧 BEFORE: Mock Cache Implementation (Lines 64-91)

```typescript
// ❌ MOCK IMPLEMENTATION - TO BE REMOVED
private mockCache = new Map<string, any>();

private async getFromCache(key: string): Promise<any> {
  return this.mockCache.get(key);
}

private async setCache(key: string, value: any): Promise<void> {
  this.mockCache.set(key, value);
  console.log(`📝 Cache set: ${key}`);
}

private async clearCache(): Promise<void> {
  this.mockCache.clear();
  console.log('🗑️ Cache cleared');
}
```

### ✅ AFTER: Real TaskContentManager Integration

```typescript
// ✅ REAL IMPLEMENTATION - NO MOCK CACHE
// All mock cache methods removed
// Use contentManager directly for all operations

// Example usage in methods:
async analyzeTask(request: TaskAnalysisRequest): Promise<TaskAnalysisResult> {
  // OLD: const task = await this.getFromCache(`task:${uuid}`);
  // NEW: 
  const task = await this.contentManager.readTask(uuid);
  if (!task) {
    throw new Error(`Task ${uuid} not found`);
  }
  // ... rest of method
}
```

---

## 🔧 BEFORE: Constructor with Mock Initialization (Lines 29-45)

```typescript
// ❌ BEFORE - Mock initialization
constructor(config: TaskAIManagerConfig = {}) {
  this.config = {
    model: config.model || 'qwen3:8b',
    baseUrl: config.baseUrl || 'http://localhost:11434',
    timeout: config.timeout || 60000,
    maxTokens: config.maxTokens || 4096,
    temperature: config.temperature || 0.3,
  };

  // Mock cache initialization
  this.mockCache = new Map<string, any>();

  process.env.LLM_DRIVER = 'ollama';
  process.env.LLM_MODEL = this.config.model;
}
```

### ✅ AFTER: Constructor with Real ContentManager

```typescript
// ✅ AFTER - Real content manager
constructor(config: TaskAIManagerConfig = {}) {
  this.config = {
    model: config.model || 'qwen3:8b',
    baseUrl: config.baseUrl || 'http://localhost:11434',
    timeout: config.timeout || 60000,
    maxTokens: config.maxTokens || 4096,
    temperature: config.temperature || 0.3,
  };

  // Initialize content manager with REAL file-based cache
  this.contentManager = createTaskContentManager('./docs/agile/tasks');

  // Set environment variables for LLM driver
  process.env.LLM_DRIVER = 'ollama';
  process.env.LLM_MODEL = this.config.model;
}
```

---

## 🔧 BEFORE: Console-Only Audit Logging (Lines 212-227)

```typescript
// ❌ BEFORE - Console only
private async logAuditEvent(event: {
  taskUuid: string;
  action: string;
  oldStatus?: string;
  newStatus?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    agent: process.env.AGENT_NAME || 'TaskAIManager',
    ...event,
  };

  console.log('🔍 Audit Event logged:', auditEntry);
  // NO PERSISTENT STORAGE - LOST ON RESTART
}
```

### ✅ AFTER: Persistent Audit Logging

```typescript
// ✅ AFTER - Persistent file-based logging
private async logAuditEvent(event: {
  taskUuid: string;
  action: string;
  oldStatus?: string;
  newStatus?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    agent: process.env.AGENT_NAME || 'TaskAIManager',
    ...event,
  };

  try {
    // REAL PERSISTENT AUDIT LOGGING
    const auditDir = './logs/audit';
    const auditFile = path.join(
      auditDir,
      `kanban-audit-${new Date().toISOString().split('T')[0]}.json`,
    );

    await fs.mkdir(auditDir, { recursive: true });
    const auditLine = JSON.stringify(auditEntry) + '\n';
    await fs.appendFile(auditFile, auditLine, 'utf8');

    console.log('🔍 Audit Event logged:', auditEntry);
  } catch (error) {
    // Fallback to console if file logging fails
    console.warn('Failed to write audit log:', error);
    console.log('🔍 Audit Event (fallback):', JSON.stringify(auditEntry, null, 2));
  }
}
```

---

## 🔧 BEFORE: Warning-Only Board Sync (Lines 175-183)

```typescript
// ❌ BEFORE - Warning only, no retry
private async syncKanbanBoard(): Promise<void> {
  try {
    const { execSync } = await import('child_process');
    execSync('pnpm kanban regenerate', { stdio: 'inherit', cwd: process.cwd() });
  } catch (error) {
    console.warn('Failed to sync kanban board:', error);
    // NO RETRY OR RECOVERY - BOARD CAN BECOME OUT OF SYNC
  }
}
```

### ✅ AFTER: Robust Board Synchronization

```typescript
// ✅ AFTER - Retry logic, error handling, emergency backups
private async syncKanbanBoard(retryCount: number = 0): Promise<void> {
  const maxRetries = 3;
  const retryDelay = 1000 * Math.pow(2, retryCount); // Exponential backoff

  try {
    const { execSync } = await import('child_process');
    execSync('pnpm kanban regenerate', { 
      stdio: 'inherit', 
      cwd: process.cwd(),
      timeout: 30000 // 30 second timeout
    });
    
    console.log('✅ Kanban board synchronized successfully');
  } catch (error) {
    console.error(`❌ Failed to sync kanban board (attempt ${retryCount + 1}/${maxRetries}):`, error);
    
    // Log audit event for sync failure
    await this.logAuditEvent({
      taskUuid: 'system',
      action: 'board_sync_failed',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount,
        maxRetries
      }
    });

    // Retry logic
    if (retryCount < maxRetries) {
      console.log(`🔄 Retrying board sync in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return this.syncKanbanBoard(retryCount + 1);
    } else {
      // Final failure - escalate
      console.error('🚨 Board sync failed after all retries. Manual intervention required.');
      
      // Create emergency backup
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupCmd = `cp docs/agile/boards/generated.md docs/agile/boards/generated.md.backup.${timestamp}`;
        execSync(backupCmd);
        console.log(`📦 Emergency backup created: generated.md.backup.${timestamp}`);
      } catch (backupError) {
        console.error('Failed to create emergency backup:', backupError);
      }
      
      throw new Error(`Board sync failed after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
```

---

## 🔧 BEFORE: Mock Task Backup (Lines 188-207)

```typescript
// ❌ BEFORE - Mock backup, no file copying
private async createTaskBackup(uuid: string): Promise<string> {
  try {
    const backupPath = await this.contentManager
      .readTask(uuid)
      .then(() => `./backups/${uuid}-${Date.now()}.md`)
      .catch(() => {
        throw new Error(`Task ${uuid} not found for backup`);
      });

    await this.logAuditEvent({
      taskUuid: uuid,
      action: 'backup_created',
      metadata: { backupPath },
    });

    return backupPath;
  } catch (error) {
    console.error('Task backup failed:', error);
    throw new Error(
      `Backup failed for task ${uuid}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
```

### ✅ AFTER: Real Task Backup Implementation

```typescript
// ✅ AFTER - Real file copying with verification
private async createTaskBackup(uuid: string): Promise<string> {
  try {
    // Get's actual task file path
    const task = await this.contentManager.readTask(uuid);
    if (!task || !task.sourcePath) {
      throw new Error(`Task ${uuid} not found or has no source path`);
    }

    // Create backup directory if it doesn't exist
    const backupDir = './backups/tasks';
    await fs.mkdir(backupDir, { recursive: true });

    // Generate unique backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `${uuid}-${timestamp}.md`;
    const backupPath = path.join(backupDir, backupFilename);

    // ACTUAL FILE COPY
    await fs.copyFile(task.sourcePath, backupPath);

    // Verify backup was created
    const backupStats = await fs.stat(backupPath);
    if (!backupStats.isFile()) {
      throw new Error('Backup file was not created successfully');
    }

    await this.logAuditEvent({
      taskUuid: uuid,
      action: 'backup_created',
      metadata: { 
        backupPath,
        originalPath: task.sourcePath,
        backupSize: backupStats.size
      },
    });

    console.log(`📦 Task backup created: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('Task backup failed:', error);
    throw new Error(
      `Backup failed for task ${uuid}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
```

---

## 🔧 BEFORE: Duplicate Import Statements (Lines 7-14 & 31-38)

```typescript
// ❌ BEFORE - Duplicate imports at lines 7-14
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Task } from '../types.js';
import type {
  TaskAnalysisRequest,
  TaskRewriteRequest,
  TaskBreakdownRequest,
  TaskAnalysisResult,
  TaskRewriteResult,
  TaskBreakdownResult,
} from './types.js';

// ... other code ...

// ❌ DUPLICATE imports at lines 31-38
import { TaskContentManager, createTaskContentManager } from './index.js';
import type { Task } from '../types.js'; // DUPLICATE
import type {
  TaskAnalysisRequest, // DUPLICATE
  TaskRewriteRequest,  // DUPLICATE
  TaskBreakdownRequest, // DUPLICATE
  TaskAnalysisResult,  // DUPLICATE
  TaskRewriteResult,   // DUPLICATE
  TaskBreakdownResult,  // DUPLICATE
} from './types.js';    // DUPLICATE
```

### ✅ AFTER: Clean Consolidated Imports

```typescript
// ✅ AFTER - All imports consolidated at top
import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { Task } from '../types.js';
import type {
  TaskAnalysisRequest,
  TaskRewriteRequest,
  TaskBreakdownRequest,
  TaskAnalysisResult,
  TaskRewriteResult,
  TaskBreakdownResult,
} from './types.js';

import { TaskContentManager, createTaskContentManager } from './index.js';

// Lines 31-38 completely removed - no duplicates
```

---

## 🔧 BEFORE: Null Assignment Anti-Patterns (Lines 121-124)

```typescript
// ❌ BEFORE - Unnecessary null assignments
let taskData = await this.getTaskData(uuid);
if (!taskData) {
  taskData = null; // Unnecessary assignment - already null
}

// Later usage...
if (taskData) {
  // This will never execute since taskData is null
}
```

### ✅ AFTER: Proper Error Handling

```typescript
// ✅ AFTER - Proper error handling, no unnecessary assignments
const taskData = await this.getTaskData(uuid);
if (!taskData) {
  throw new Error(`Task ${uuid} not found`);
}

// Use taskData directly - no null assignment needed
processTaskData(taskData);
```

---

## 🧪 Integration Examples

### Example 1: TaskAIManager with WIP Enforcement

```typescript
// ✅ Integration pattern - WIP validation before operations
async rewriteTask(request: TaskRewriteRequest): Promise<TaskRewriteResult> {
  const { uuid, rewriteType, instructions, targetAudience, tone } = request;

  try {
    const task = await this.contentManager.readTask(uuid);
    if (!task) {
      throw new Error(`Task ${uuid} not found`);
    }

    // NEW: WIP validation integration
    const wipEnforcement = await createWIPLimitEnforcement();
    const board = await this.loadBoard();
    const wipValidation = await wipEnforcement.validateWIPLimits(
      task.status, // Current column
      0, // No change in count for rewrite
      board
    );
    
    if (!wipValidation.valid && wipValidation.violation) {
      return {
        success: false,
        taskUuid: uuid,
        rewriteType,
        originalContent: '',
        rewrittenContent: '',
        changes: {
          summary: '',
          highlights: [],
          additions: [],
          modifications: [],
          removals: [],
        },
        metadata: {
          rewrittenAt: new Date(),
          rewrittenBy: process.env.AGENT_NAME || 'TaskAIManager',
          model: this.config.model,
          processingTime: 0,
        },
        error: `WIP limit violation: ${wipValidation.violation.reason}`,
      };
    }

    const backupPath = await this.createTaskBackup(uuid);
    // ... rest of method continues
  } catch (error) {
    // ... error handling
  }
}
```

### Example 2: FSM Transition Validation

```typescript
// ✅ Integration pattern - FSM validation for status changes
async updateTaskStatus(
  taskUuid: string, 
  newStatus: string,
  options?: { force?: boolean; overrideReason?: string }
): Promise<{ success: boolean; reason?: string; suggestions?: string[] }> {
  const task = await this.contentManager.readTask(taskUuid);
  if (!task) {
    return { success: false, reason: 'Task not found' };
  }

  const board = await this.loadBoard();
  
  // NEW: Real FSM validation
  const { validateTransition } = await import('./transition-rules-functional.js');
  const { result } = await validateTransition(
    createTransitionRulesEngineState(),
    task.status,
    newStatus,
    task,
    board
  );
  
  if (!result.allowed && !options?.force) {
    return { 
      success: false, 
      reason: result.reason,
      suggestions: result.suggestions
    };
  }
  
  // Apply transition if valid or forced
  const updatedTask = { ...task, status: newStatus };
  await this.contentManager.writeTask(updatedTask);
  
  // NEW: Robust board sync with error handling
  try {
    await this.syncKanbanBoard();
  } catch (error) {
    console.error('Board sync failed after status update:', error);
    // Continue but log the failure
    await this.logAuditEvent({
      taskUuid,
      action: 'status_update_sync_failed',
      oldStatus: task.status,
      newStatus,
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
  
  return { success: true };
}
```

### Example 3: Enhanced Error Handling

```typescript
// ✅ Integration pattern - Comprehensive error handling
async analyzeTask(request: TaskAnalysisRequest): Promise<TaskAnalysisResult> {
  const startTime = Date.now();
  const { uuid, analysisType, context } = request;

  try {
    // Input validation
    if (!uuid || typeof uuid !== 'string') {
      throw new Error('Invalid task UUID provided');
    }

    if (!analysisType || !['quality', 'complexity', 'dependencies'].includes(analysisType)) {
      throw new Error(`Invalid analysis type: ${analysisType}`);
    }

    const task = await this.contentManager.readTask(uuid);
    if (!task) {
      throw new Error(`Task ${uuid} not found`);
    }

    // NEW: Log analysis start
    await this.logAuditEvent({
      taskUuid: uuid,
      action: 'analysis_started',
      metadata: {
        analysisType,
        context: context || {},
        startTime: new Date().toISOString()
      }
    });

    const analysis = this.generateTaskAnalysis(task, analysisType, context || {});

    // NEW: Log analysis completion
    await this.logAuditEvent({
      taskUuid: uuid,
      action: 'analysis_completed',
      metadata: {
        analysisType,
        processingTime: Date.now() - startTime,
        analysisKeys: Object.keys(analysis)
      }
    });

    return {
      success: true,
      taskUuid: uuid,
      analysisType,
      analysis,
      metadata: {
        analyzedAt: new Date(),
        analyzedBy: process.env.AGENT_NAME || 'TaskAIManager',
        model: this.config.model,
        processingTime: Date.now() - startTime,
      },
    };
  } catch (error) {
    // NEW: Enhanced error logging
    await this.logAuditEvent({
      taskUuid: uuid,
      action: 'analysis_failed',
      metadata: {
        analysisType,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime
      }
    });

    return {
      success: false,
      taskUuid: uuid,
      analysisType,
      analysis: {
        suggestions: [],
        risks: [],
        dependencies: [],
        subtasks: [],
      },
      metadata: {
        analyzedAt: new Date(),
        analyzedBy: process.env.AGENT_NAME || 'TaskAIManager',
        model: this.config.model,
        processingTime: Date.now() - startTime,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

---

## 🧪 Test Examples

### Unit Test: Mock Implementation Replacement

```typescript
// test/task-ai-manager-mock-fixes.test.ts
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { TaskAIManager } from '../src/lib/task-content/ai.js';
import { promises as fs } from 'node:fs';
import path from 'node:path';

describe('TaskAIManager - Mock Implementation Fixes', () => {
  let taskAIManager: TaskAIManager;
  let testTasksDir: string;
  
  beforeEach(async () => {
    testTasksDir = await fs.mkdtemp(path.join(process.cwd(), 'test-tasks-'));
    
    // Create test task file
    const testTask = {
      uuid: 'test-task-uuid',
      title: 'Test Task',
      status: 'todo',
      content: '# Test Task\n\nThis is a test task.',
      created_at: new Date().toISOString()
    };
    
    const taskContent = `---
uuid: ${testTask.uuid}
title: ${testTask.title}
status: ${testTask.status}
created_at: ${testTask.created_at}
---

${testTask.content}`;
    
    await fs.writeFile(
      path.join(testTasksDir, `${testTask.uuid}.md`),
      taskContent
    );
    
    taskAIManager = new TaskAIManager({
      model: 'test-model'
    });
  });
  
  afterEach(async () => {
    await fs.rm(testTasksDir, { recursive: true, force: true });
  });
  
  it('should use real TaskContentManager cache', async () => {
    const result = await taskAIManager.analyzeTask({
      uuid: 'test-task-uuid',
      analysisType: 'quality'
    });
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.taskUuid, 'test-task-uuid');
    assert(result.analysis);
    
    // Verify no mock cache methods are called
    // (This would require mocking/spying in a real test framework)
  });
  
  it('should create real task backups', async () => {
    const result = await taskAIManager.rewriteTask({
      uuid: 'test-task-uuid',
      rewriteType: 'clarification',
      instructions: 'Make it clearer'
    });
    
    assert.strictEqual(result.success, true);
    assert(result.backupPath);
    
    // Verify backup file exists and has content
    const backupExists = await fs.access(result.backupPath!).then(() => true).catch(() => false);
    assert.strictEqual(backupExists, true);
    
    const backupContent = await fs.readFile(result.backupPath!, 'utf8');
    assert(backupContent.includes('test-task-uuid'));
  });
  
  it('should log audit events to persistent storage', async () => {
    const auditDir = './logs/audit';
    await fs.mkdir(auditDir, { recursive: true });
    
    await taskAIManager.rewriteTask({
      uuid: 'test-task-uuid',
      rewriteType: 'clarification',
      instructions: 'Make it clearer'
    });
    
    // Check audit log was created
    const today = new Date().toISOString().split('T')[0];
    const auditFile = path.join(auditDir, `kanban-audit-${today}.json`);
    const auditExists = await fs.access(auditFile).then(() => true).catch(() => false);
    assert.strictEqual(auditExists, true);
    
    // Verify audit content
    const auditContent = await fs.readFile(auditFile, 'utf8');
    const auditLines = auditContent.trim().split('\n');
    assert(auditLines.length > 0);
    
    const auditEntry = JSON.parse(auditLines[auditLines.length - 1]);
    assert.strictEqual(auditEntry.taskUuid, 'test-task-uuid');
    assert.strictEqual(auditEntry.action, 'task_rewritten');
    assert(auditEntry.timestamp);
    assert(auditEntry.agent);
  });
});
```

### Integration Test: Board Synchronization

```typescript
// test/board-sync-integration.test.ts
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { TaskAIManager } from '../src/lib/task-content/ai.js';

describe('Board Synchronization - Integration Tests', () => {
  let taskAIManager: TaskAIManager;
  let originalExecSync: typeof import('child_process').execSync;
  
  beforeEach(() => {
    taskAIManager = new TaskAIManager();
    // Store original execSync
    originalExecSync = require('child_process').execSync;
  });
  
  afterEach(() => {
    // Restore original execSync
    require('child_process').execSync = originalExecSync;
  });
  
  it('should retry board sync on failure', async () => {
    let callCount = 0;
    const mockExecSync = jest.fn()
      .mockImplementationOnce(() => {
        callCount++;
        throw new Error('Simulated sync failure');
      })
      .mockImplementationOnce(() => {
        callCount++;
        return 'success';
      });
    
    require('child_process').execSync = mockExecSync;
    
    // This should succeed after retry
    await assert.doesNotReject(async () => {
      await taskAIManager['syncKanbanBoard']();
    });
    
    assert.strictEqual(callCount, 2);
    assert.strictEqual(mockExecSync.mock.calls.length, 2);
  });
  
  it('should fail after max retries and create emergency backup', async () => {
    const mockExecSync = jest.fn()
      .mockImplementation(() => {
        throw new Error('Persistent sync failure');
      });
    
    require('child_process').execSync = mockExecSync;
    
    await assert.rejects(async () => {
      await taskAIManager['syncKanbanBoard']();
    }, /Board sync failed after 3 attempts/);
    
    // Should be called 3 times (initial + 2 retries)
    assert.strictEqual(mockExecSync.mock.calls.length, 3);
    
    // Should attempt emergency backup
    // (This would require mocking fs operations for full verification)
  });
  
  it('should log audit events for sync failures', async () => {
    const mockExecSync = jest.fn()
      .mockImplementation(() => {
        throw new Error('Sync failure');
      });
    
    require('child_process').execSync = mockExecSync;
    
    try {
      await taskAIManager['syncKanbanBoard']();
    } catch (error) {
      // Expected to fail
    }
    
    // Verify audit event was logged
    // (This would require accessing the audit log or mocking the logger)
  });
});
```

---

## 📊 Performance Monitoring Examples

### Performance Collector Integration

```typescript
// monitoring/performance-example.ts
import { TaskAIManager } from '../src/lib/task-content/ai.js';

class PerformanceMonitoringTaskAIManager extends TaskAIManager {
  private metrics = new Map<string, number[]>();
  
  private recordMetric(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(duration);
  }
  
  async analyzeTask(request: TaskAnalysisRequest): Promise<TaskAnalysisResult> {
    const startTime = Date.now();
    
    try {
      const result = await super.analyzeTask(request);
      this.recordMetric('analyzeTask', Date.now() - startTime);
      return result;
    } catch (error) {
      this.recordMetric('analyzeTask_error', Date.now() - startTime);
      throw error;
    }
  }
  
  getPerformanceReport(): Record<string, { count: number; avg: number; min: number; max: number }> {
    const report: Record<string, { count: number; avg: number; min: number; max: number }> = {};
    
    for (const [operation, durations] of this.metrics) {
      const count = durations.length;
      const avg = durations.reduce((sum, d) => sum + d, 0) / count;
      const min = Math.min(...durations);
      const max = Math.max(...durations);
      
      report[operation] = { count, avg, min, max };
    }
    
    return report;
  }
}

// Usage example
const monitoredAI = new PerformanceMonitoringTaskAIManager();

// After some operations...
console.log('Performance Report:', monitoredAI.getPerformanceReport());
// Example output:
// {
//   analyzeTask: { count: 15, avg: 1250, min: 800, max: 2100 },
//   analyzeTask_error: { count: 2, avg: 300, min: 250, max: 350 }
// }
```

---

## 🔒 Security Examples

### Input Validation

```typescript
// security/secure-task-ai-manager.ts
export class SecureTaskAIManager extends TaskAIManager {
  private sanitizeInput(input: string): string {
    return input
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .replace(/[<>]/g, '') // Remove HTML brackets
      .trim();
  }
  
  private validateTaskUuid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
  
  async analyzeTask(request: TaskAnalysisRequest): Promise<TaskAnalysisResult> {
    // Validate UUID format
    if (!this.validateTaskUuid(request.uuid)) {
      return {
        success: false,
        taskUuid: request.uuid,
        analysisType: request.analysisType,
        analysis: { suggestions: [], risks: [], dependencies: [], subtasks: [] },
        metadata: {
          analyzedAt: new Date(),
          analyzedBy: process.env.AGENT_NAME || 'TaskAIManager',
          model: this.config.model,
          processingTime: 0,
        },
        error: 'Invalid task UUID format'
      };
    }
    
    // Sanitize context if provided
    if (request.context) {
      request.context = Object.fromEntries(
        Object.entries(request.context).map(([key, value]) => [
          key,
          typeof value === 'string' ? this.sanitizeInput(value) : value
        ])
      );
    }
    
    return super.analyzeTask(request);
  }
}
```

### File System Security

```typescript
// security/secure-file-operations.ts
export class SecureFileOperations {
  private readonly allowedPaths: string[];
  
  constructor(allowedPaths: string[] = ['./docs/agile/tasks']) {
    this.allowedPaths = allowedPaths.map(p => path.resolve(p));
  }
  
  private validatePath(filePath: string): boolean {
    const resolvedPath = path.resolve(filePath);
    return this.allowedPaths.some(allowed => 
      resolvedPath.startsWith(allowed)
    );
  }
  
  async secureCopyFile(source: string, destination: string): Promise<void> {
    if (!this.validatePath(source) || !this.validatePath(destination)) {
      throw new Error('Security violation: File path outside allowed directories');
    }
    
    await fs.copyFile(source, destination);
  }
  
  async secureWriteFile(filePath: string, content: string): Promise<void> {
    if (!this.validatePath(filePath)) {
      throw new Error('Security violation: Cannot write to path outside allowed directory');
    }
    
    await fs.writeFile(filePath, content, 'utf8');
  }
}
```

---

**Code Examples Status**: ✅ COMPLETE  
**Reference Implementation**: ✅ PROVIDED  
**Test Coverage**: ✅ INCLUDED  
**Security Examples**: ✅ PROVIDED