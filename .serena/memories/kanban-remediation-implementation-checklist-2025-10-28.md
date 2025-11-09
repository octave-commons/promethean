# Kanban System Remediation Implementation Checklist
**Date**: 2025-10-28  
**Purpose**: Step-by-step implementation guide for developers  
**Estimated Total Time**: 4-6 hours

## 🎯 Phase 1: Mock Implementation Replacement (2-3 hours)

### ✅ Pre-Implementation Setup
- [ ] Create backup branch: `git checkout -b backup/task-ai-manager-mock-fixes`
- [ ] Commit current state: `git add . && git commit -m "Backup: Current TaskAIManager with mock implementations"`
- [ ] Create working branch: `git checkout main && git checkout -b fix/task-ai-manager-real-implementations`
- [ ] Run baseline tests: `pnpm --filter @promethean-os/kanban test`

### 📝 Task 1.1: Remove Mock Cache Implementation (30 minutes)
**File**: `packages/kanban/src/lib/task-content/ai.ts`

**Remove Lines 64-91**:
```typescript
// DELETE these lines:
private mockCache = new Map<string, any>();

private async getFromCache(key: string): Promise<any> {
  return this.mockCache.get(key);
}

private async setCache(key: string, value: any): Promise<void> {
  this.mockCache.set(key, value);
  console.log(`📝 Cache set: ${key}`);
}
```

**Update Constructor (Lines 29-45)**:
```typescript
// REPLACE constructor with:
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

**Update Method Calls** (Search and replace):
```bash
# Find all mock cache calls:
grep -n "getFromCache\|setCache" packages/kanban/src/lib/task-content/ai.ts

# Replace patterns:
# OLD: await this.getFromCache(`task:${uuid}`)
# NEW: await this.contentManager.readTask(uuid)

# OLD: await this.setCache(`task:${uuid}`, task)
# NEW: await this.contentManager.writeTask(task)
```

**Verification**:
- [ ] No more `mockCache` references
- [ ] All cache calls use `contentManager`
- [ ] Tests pass: `pnpm --filter @promethean-os/kanban test`

### 📝 Task 1.2: Implement Persistent Audit Logging (45 minutes)
**File**: `packages/kanban/src/lib/task-content/ai.ts`

**Verify Imports** (Top of file):
```typescript
// Ensure these imports are present:
import { promises as fs } from 'node:fs';
import path from 'node:path';
```

**Update logAuditEvent Method (Lines 212-227)**:
```typescript
// REPLACE entire method with:
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

**Create Audit Directory**:
```bash
mkdir -p logs/audit
chmod 755 logs/audit
```

**Verification**:
- [ ] Directory created: `ls -la logs/audit/`
- [ ] Method updated without console-only logging
- [ ] Test audit logging: `pnpm kanban analyze-task <test-uuid> --type quality`
- [ ] Verify audit file: `ls -la logs/audit/kanban-audit-$(date +%Y-%m-%d).json`

### 📝 Task 1.3: Test Mock Implementation Fixes (45 minutes)
**Run Comprehensive Tests**:
```bash
# Unit tests
pnpm --filter @promethean-os/kanban test

# Type checking
pnpm --filter @promethean-os/kanban typecheck

# Linting
pnpm --filter @promethean-os/kanban lint

# Manual functionality test
pnpm kanban analyze-task <existing-task-uuid> --type quality
pnpm kanban rewrite-task <existing-task-uuid> --type clarification --instructions "test rewrite"

# Verify audit logs
cat logs/audit/kanban-audit-$(date +%Y-%m-%d).json | tail -5
```

**Expected Results**:
- [ ] All tests pass
- [ ] Audit log file created with entries
- [ ] No mock-related errors in logs
- [ ] Task operations complete successfully

---

## 🎯 Phase 2: Board Synchronization Enhancement (1-2 hours)

### 📝 Task 2.1: Update syncKanbanBoard Method (45 minutes)
**File**: `packages/kanban/src/lib/task-content/ai.ts`

**Replace syncKanbanBoard Method (Lines 175-183)**:
```typescript
// REPLACE entire method with:
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

### 📝 Task 2.2: Update Method Call Sites (30 minutes)
**Update rewriteTask Method (Line ~147)**:
```typescript
// FIND this line:
await this.syncKanbanBoard();

// REPLACE with error handling:
try {
  await this.syncKanbanBoard();
} catch (error) {
  console.error('Critical: Board sync failed in task rewrite:', error);
  // Continue with operation but log failure
  await this.logAuditEvent({
    taskUuid: uuid,
    action: 'board_sync_failed_in_rewrite',
    metadata: {
      error: error instanceof Error ? error.message : 'Unknown error',
      rewriteType
    }
  });
}
```

**Search for Other syncKanbanBoard Calls**:
```bash
grep -n "syncKanbanBoard" packages/kanban/src/lib/task-content/ai.ts
```

**Update All Found Locations** with similar error handling pattern.

### 📝 Task 2.3: Test Board Synchronization (30 minutes)
**Test Normal Sync**:
```bash
pnpm kanban regenerate
```

**Test Retry Behavior** (Manual verification):
```bash
# Temporarily break kanban command to test retry
# (This would require temporary modification for testing)
# Verify retry attempts in logs
# Restore normal functionality
```

**Verify Emergency Backups**:
```bash
ls -la docs/agile/boards/*.backup.*
```

**Expected Results**:
- [ ] Board sync completes successfully
- [ ] Retry logic works (manual verification)
- [ ] Emergency backups created on failure
- [ ] Audit events logged for sync failures

---

## 🎯 Phase 3: Task Backup Implementation (1 hour)

### 📝 Task 3.1: Update createTaskBackup Method (30 minutes)
**File**: `packages/kanban/src/lib/task-content/ai.ts`

**Replace createTaskBackup Method (Lines 188-207)**:
```typescript
// REPLACE entire method with:
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

### 📝 Task 3.2: Create Backup Directory (15 minutes)
```bash
mkdir -p backups/tasks
chmod 755 backups/tasks
```

### 📝 Task 3.3: Test Task Backups (15 minutes)
**Test Backup Creation**:
```bash
# Find an existing task
find docs/agile/tasks -name "*.md" | head -1 | xargs grep -l "uuid:"

# Extract UUID from a task file
TASK_UUID=$(grep -m1 "uuid:" docs/agile/tasks/*.md | head -1 | cut -d'"' -f2)

# Test backup creation
pnpm kanban rewrite-task $TASK_UUID --type test --instructions "backup test"

# Verify backup was created
ls -la backups/tasks/ | grep $TASK_UUID
```

**Verify Backup Content**:
```bash
# Compare original and backup
BACKUP_FILE=$(ls -t backups/tasks/${TASK_UUID}-*.md | head -1)
ORIGINAL_FILE=$(find docs/agile/tasks -name "*${TASK_UUID}*")

diff $ORIGINAL_FILE $BACKUP_FILE
# Should show differences (the rewrite changes)
```

**Expected Results**:
- [ ] Backup directory created
- [ ] Backup files created with timestamps
- [ ] Backup content matches original before rewrite
- [ ] Audit events logged for backup creation

---

## 🎯 Phase 4: Code Quality Cleanup (30 minutes)

### 📝 Task 4.1: Remove Duplicate Imports (15 minutes)
**File**: `packages/kanban/src/lib/task-content/ai.ts`

**Remove Lines 31-38** (Duplicate imports):
```typescript
// DELETE these duplicate lines:
import { TaskContentManager, createTaskContentManager } from './index.js';
import type { Task } from '../types.js';
import type {
  TaskAnalysisRequest,
  TaskRewriteRequest,
  TaskBreakdownRequest,
  TaskAnalysisResult,
  TaskRewriteResult,
  TaskBreakdownResult,
} from './types.js';
```

**Consolidate Imports at Top** (Lines 7-14 should contain all imports):
```typescript
// Ensure imports look like this:
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
```

### 📝 Task 4.2: Fix Null Assignment Anti-Patterns (15 minutes)
**Search for Null Assignments**:
```bash
grep -n "= null" packages/kanban/src/lib/task-content/ai.ts
```

**Fix Found Patterns** (Example around lines 121-124):
```typescript
// IF you find patterns like this:
let taskData = await this.getTaskData(uuid);
if (!taskData) {
  taskData = null; // Unnecessary assignment
}

// REPLACE with:
const taskData = await this.getTaskData(uuid);
if (!taskData) {
  throw new Error(`Task ${uuid} not found`);
}
// Use taskData directly - no null assignment needed
```

---

## 🧪 Final Testing and Validation (30 minutes)

### 📝 Task 5.1: Run Complete Test Suite
```bash
# All tests
pnpm --filter @promethean-os/kanban test

# Type checking
pnpm --filter @promethean-os/kanban typecheck

# Linting
pnpm --filter @promethean-os/kanban lint

# Build
pnpm --filter @promethean-os/kanban build
```

### 📝 Task 5.2: Manual Functionality Testing
```bash
# Test task analysis
pnpm kanban analyze-task <test-uuid> --type quality

# Test task rewrite
pnpm kanban rewrite-task <test-uuid> --type clarification --instructions "test implementation"

# Test board operations
pnpm kanban count
pnpm kanban audit --verbose
pnpm kanban regenerate

# Verify audit logs
ls -la logs/audit/
cat logs/audit/kanban-audit-$(date +%Y-%m-%d).json | tail -10

# Verify backups
ls -la backups/tasks/
```

### 📝 Task 5.3: Compliance Verification
```bash
# Check WIP compliance
pnpm kanban enforce-wip-limits

# Verify task synchronization
find docs/agile/tasks -name "*.md" | wc -l
pnpm kanban count | grep "Total tasks"

# Should show matching numbers (or explain any differences)
```

---

## ✅ Pre-Deployment Checklist

### Code Quality
- [ ] All tests pass
- [ ] Type checking passes
- [ ] Linting passes
- [ ] No duplicate imports
- [ ] No null assignment anti-patterns
- [ ] Code follows project conventions

### Functionality
- [ ] Mock implementations replaced with real functionality
- [ ] Audit logging creates persistent files
- [ ] Task backups create actual file copies
- [ ] Board sync includes retry logic
- [ ] Error handling implemented throughout

### Security
- [ ] Input validation implemented
- [ ] File path validation in place
- [ ] Audit log integrity measures
- [ ] No console-only logging for critical operations

### Performance
- [ ] No performance regressions
- [ ] Backup operations complete quickly
- [ ] Board sync completes within timeout
- [ ] Audit logging doesn't block operations

### Monitoring
- [ ] Health checks functional
- [ ] Performance metrics collected
- [ ] Error rates monitored
- [ ] Compliance checks automated

---

## 🚀 Deployment Steps

### 1. Final Preparation
```bash
# Commit changes
git add .
git commit -m "Implement kanban system remediation - mock implementation fixes

- Replace mock cache with real TaskContentManager
- Implement persistent audit logging
- Add robust board synchronization with retry logic
- Implement real task backup functionality
- Clean up code quality issues

Fixes: #kanban-remediation-2025-10-28"

# Create deployment tag
git tag -a v1.0.0-kanban-remediation -m "Kanban system remediation - mock implementation fixes"
```

### 2. Deploy
```bash
# Push changes
git push origin fix/task-ai-manager-real-implementations
git push origin v1.0.0-kanban-remediation

# Deploy through your deployment system
# (This would depend on your specific deployment process)
```

### 3. Post-Deployment Verification
```bash
# Verify deployment
git checkout main
git pull origin main

# Test functionality
pnpm kanban count
pnpm kanban audit --verbose

# Check system health
curl http://localhost:3000/health  # If health endpoint available

# Monitor logs for 30 minutes
tail -f logs/audit/kanban-audit-$(date +%Y-%m-%d).json
```

---

## 🆘 Emergency Rollback

If critical issues are detected:

```bash
# Quick rollback
git checkout main
git reset --hard v1.0.0-kanban-remediation~1  # Previous good commit
pnpm build
pnpm test

# Restart services
pm2 restart all

# Verify rollback
pnpm kanban count
pnpm kanban audit --verbose
```

---

## 📞 Support Contacts

**Technical Lead**: [Contact information]  
**DevOps**: [Contact information]  
**Product Owner**: [Contact information]

**Escalation Path**:
1. Technical issues → Technical Lead
2. Deployment issues → DevOps
3. Product questions → Product Owner

---

**Implementation Status**: 📋 READY  
**Estimated Time**: 4-6 hours  
**Risk Level**: LOW-MEDIUM  
**Rollback Plan**: ✅ DOCUMENTED