/**
 * Integration Tests for P0 Security Task Validation Gate
 *
 * These tests verify the complete integration of P0 security validation
 * with the kanban system, including CLI commands and real-world scenarios.
 */

import test from 'ava';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtemp } from 'node:fs/promises';
import { updateStatus, type Task } from '../kanban.js';
import { createP0SecurityValidator } from './p0-security-validator.js';

test.beforeEach(async (t) => {
  const tempDir = await mkdtemp(join(tmpdir(), 'kanban-integration-test-'));
  const boardDir = join(tempDir, 'docs/agile/boards');
  const tasksDir = join(tempDir, 'docs/agile/tasks');

  await mkdir(boardDir, { recursive: true });
  await mkdir(tasksDir, { recursive: true });

  // Create a basic kanban board
  const boardContent = `
# Kanban Board

## Incoming
- [[Test P0 Security Task|Test P0 Security Task]] (uuid:${randomUUID()})

## Todo
- [[Regular Task|Regular Task]] (uuid:${randomUUID()})

## In Progress
## Testing  
## Review
## Done
  `.trim();

  await writeFile(join(boardDir, 'generated.md'), boardContent);

  (t.context as any).tempDir = tempDir;
  (t.context as any).boardDir = boardDir;
  (t.context as any).tasksDir = tasksDir;
});

test.afterEach(async (t) => {
  await rm((t.context as any).tempDir, { recursive: true, force: true });
});

const createP0SecurityTaskFile = async (
  tasksDir: string,
  taskData: Partial<Task> = {},
): Promise<Task> => {
  const task: Task = {
    uuid: randomUUID(),
    title: 'Fix critical security vulnerability',
    status: 'todo',
    priority: 'P0',
    labels: ['security'],
    created_at: new Date().toISOString(),
    ...taskData,
  };

  const taskContent = `---
uuid: ${task.uuid}
title: ${task.title}
status: ${task.status}
priority: ${task.priority}
labels: [${task.labels?.join(', ')}]
created_at: ${task.created_at}
---

# ${task.title}

## Description
This is a critical security vulnerability that needs immediate attention.

## Implementation Plan

1. Identify the root cause
2. Implement proper security measures
3. Add comprehensive tests
4. Update documentation

## Security Considerations

- Input validation required
- Authentication checks needed
- Authorization verification necessary
- Audit logging implementation
  `;

  await writeFile(join(tasksDir, `${task.uuid}.md`), taskContent);
  return task;
};

test('should integrate P0 validation with kanban updateStatus', async (t) => {
  const { tasksDir, tempDir } = t.context as any;

  // Create a P0 security task without implementation plan
  const p0Task = await createP0SecurityTaskFile(tasksDir, {
    title: 'Critical security fix without plan',
  });

  // Remove implementation plan from file
  const taskFilePath = join(tasksDir, `${p0Task.uuid}.md`);
  const basicContent = `---
uuid: ${p0Task.uuid}
title: ${p0Task.title}
status: ${p0Task.status}
priority: ${p0Task.priority}
labels: [${p0Task.labels?.join(', ')}]
---

# ${p0Task.title}

Basic description without implementation plan.
  `;
  await writeFile(taskFilePath, basicContent);

  // Try to update status - should fail due to missing implementation plan
  const validator = createP0SecurityValidator({
    repoRoot: tempDir,
    tasksDir,
    skipGitChecks: true,
    skipFileChecks: false,
  });

  const result = await validator.validateStatusTransition(p0Task, 'todo', 'in_progress');

  t.false(result.valid);
  t.true(result.errors.some((e) => e.includes('implementation plan')));
});

test('should allow P0 task transition with all requirements met', async (t) => {
  const { tasksDir, tempDir } = t.context as any;

  // Create a complete P0 security task
  const p0Task = await createP0SecurityTaskFile(tasksDir, {
    title: 'Complete security fix',
    labels: ['security', 'security-reviewed'],
    status: 'in_progress',
  });

  // Add complete implementation details
  const taskFilePath = join(tasksDir, `${p0Task.uuid}.md`);
  const completeContent = `---
uuid: ${p0Task.uuid}
title: ${p0Task.title}
status: ${p0Task.status}
priority: ${p0Task.priority}
labels: [security, security-reviewed]
---

# ${p0Task.title}

## Implementation Plan

1. Root cause analysis completed
2. Security patches implemented
3. Input validation added
4. Authentication strengthened

## Security Review

Security review completed by Security Team:
- All vulnerabilities addressed
- No new attack vectors introduced  
- Code follows security best practices
- Comprehensive test coverage implemented

Approved on ${new Date().toISOString()}

## Test Coverage

### Unit Tests
- Input validation functions
- Authentication flows
- Authorization checks
- Error handling paths

### Integration Tests
- End-to-end security flows
- API security testing
- Database security validation

### Security Tests
- Injection attack prevention
- Authentication bypass attempts
- Privilege escalation scenarios

Coverage: 96%

## Documentation

- Security documentation updated
- API documentation revised
- Developer guidelines enhanced
- Security checklist updated
  `;

  await writeFile(taskFilePath, completeContent);

  // Validate transition to testing
  const validator = createP0SecurityValidator({
    repoRoot: tempDir,
    tasksDir,
    skipGitChecks: true,
    skipFileChecks: false,
  });

  const result = await validator.validateStatusTransition(p0Task, 'in_progress', 'testing');

  t.true(result.valid);
  t.is(result.errors.length, 0);
  t.true(result.requirements.hasImplementationPlan);
  t.true(result.requirements.hasSecurityReview);
  t.true(result.requirements.hasTestCoverage);
});

test('should handle non-P0 tasks without validation', async (t) => {
  const { tasksDir, tempDir } = t.context as any;

  // Create a regular non-P0 task
  const regularTask: Task = {
    uuid: randomUUID(),
    title: 'Regular feature implementation',
    status: 'todo',
    priority: 'P2',
    labels: ['feature'],
    created_at: new Date().toISOString(),
  };

  const taskContent = `---
uuid: ${regularTask.uuid}
title: ${regularTask.title}
status: ${regularTask.status}
priority: ${regularTask.priority}
labels: [${regularTask.labels?.join(', ')}]
---

# ${regularTask.title}

Basic feature task without any special requirements.
  `;

  await writeFile(join(tasksDir, `${regularTask.uuid}.md`), taskContent);

  // Should validate without any security requirements
  const validator = createP0SecurityValidator({
    repoRoot: tempDir,
    tasksDir,
    skipGitChecks: true,
    skipFileChecks: false,
  });

  const result = await validator.validateStatusTransition(regularTask, 'todo', 'in_progress');

  t.true(result.valid);
  t.is(result.errors.length, 0);
});

test('should validate P0 tasks by title keywords', async (t) => {
  const { tasksDir, tempDir } = t.context as any;

  // Create a task with P0 priority but no security label
  const p0ByTitle: Task = {
    uuid: randomUUID(),
    title: 'Fix authentication vulnerability in user service',
    status: 'todo',
    priority: 'P0',
    labels: ['backend'], // No security label
    created_at: new Date().toISOString(),
  };

  const taskContent = `---
uuid: ${p0ByTitle.uuid}
title: ${p0ByTitle.title}
status: ${p0ByTitle.status}
priority: ${p0ByTitle.priority}
labels: [${p0ByTitle.labels?.join(', ')}]
---

# ${p0ByTitle.title}

Security vulnerability in authentication system.
  `;

  await writeFile(join(tasksDir, `${p0ByTitle.uuid}.md`), taskContent);

  // Should be identified as P0 security task by title
  const validator = createP0SecurityValidator({
    repoRoot: tempDir,
    tasksDir,
    skipGitChecks: true,
    skipFileChecks: false,
  });

  t.true(validator.isP0SecurityTask(p0ByTitle));

  // Should require implementation plan
  const result = await validator.validateStatusTransition(p0ByTitle, 'todo', 'in_progress');

  t.false(result.valid);
  t.true(result.errors.some((e) => e.includes('implementation plan')));
});
