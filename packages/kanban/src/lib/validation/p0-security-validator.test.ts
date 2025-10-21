/**
 * Tests for P0 Security Task Validation Gate
 */

import test from 'ava';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { mkdtemp } from 'node:fs/promises';
import { createP0SecurityValidator, validateP0SecurityTask } from './p0-security-validator.js';
import type { Task } from '../types.js';

test.beforeEach(async (t) => {
  const tempDir = await mkdtemp(join(tmpdir(), 'kanban-test-'));
  const tasksDir = join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });

  (t.context as any).tempDir = tempDir;
  (t.context as any).tasksDir = tasksDir;
  (t.context as any).validator = createP0SecurityValidator({
    repoRoot: tempDir,
    tasksDir,
    skipGitChecks: true, // Skip git checks for unit tests
    skipFileChecks: false,
  });
});

test.afterEach(async (t) => {
  await rm((t.context as any).tempDir, { recursive: true, force: true });
});

const createMockP0Task = (overrides: Partial<Task> = {}): Task => ({
  uuid: 'test-uuid-12345',
  title: 'Fix critical security vulnerability',
  status: 'todo',
  priority: 'P0',
  labels: ['security'],
  created_at: '2025-10-18T12:00:00.000Z',
  ...overrides,
});

const createMockNonP0Task = (overrides: Partial<Task> = {}): Task => ({
  uuid: 'test-uuid-67890',
  title: 'Regular feature task',
  status: 'todo',
  priority: 'P2',
  labels: ['feature'],
  created_at: '2025-10-18T12:00:00.000Z',
  ...overrides,
});

test('should identify P0 security tasks correctly', (t) => {
  const { validator } = t.context as any;
  const p0Task = createMockP0Task();
  t.true(validator.isP0SecurityTask(p0Task));
});

test('should identify non-P0 tasks correctly', (t) => {
  const { validator } = t.context as any;
  const nonP0Task = createMockNonP0Task();
  t.false(validator.isP0SecurityTask(nonP0Task));
});

test('should identify P0 tasks by title containing security keywords', (t) => {
  const { validator } = t.context as any;
  const securityTask = createMockP0Task({
    title: 'Fix authentication bypass vulnerability',
    labels: [],
  });
  t.true(validator.isP0SecurityTask(securityTask));
});

test('should identify P0 tasks by title containing fix keywords', (t) => {
  const { validator } = t.context as any;
  const fixTask = createMockP0Task({
    title: 'Critical memory leak fix',
    labels: [],
  });
  t.true(validator.isP0SecurityTask(fixTask));
});

test('should allow any transition for non-P0 tasks', async (t) => {
  const { validator } = t.context as any;
  const nonP0Task = createMockNonP0Task();

  const result = await validator.validateStatusTransition(nonP0Task, 'todo', 'in_progress');

  t.true(result.valid);
  t.is(result.errors.length, 0);
  t.is(result.warnings.length, 0);
});

test('should require implementation plan for todo to in_progress transition', async (t) => {
  const { validator } = t.context as any;
  const p0Task = createMockP0Task();

  const result = await validator.validateStatusTransition(p0Task, 'todo', 'in_progress');

  t.false(result.valid);
  t.true(
    result.errors.includes('P0 security tasks require an implementation plan before starting work'),
  );
  t.false(result.requirements.hasImplementationPlan);
});

test('should pass validation with implementation plan', async (t) => {
  const { validator, tasksDir } = t.context as any;
  const p0Task = createMockP0Task();
  const taskFilePath = join(tasksDir, `${p0Task.uuid}.md`);

  await writeFile(
    taskFilePath,
    `
---
uuid: ${p0Task.uuid}
title: ${p0Task.title}
priority: P0
labels: [security]
---

# Fix Critical Security Vulnerability

## Implementation Plan

1. Identify root cause of vulnerability
2. Implement proper input validation
3. Add security tests
4. Update documentation

## Technical Approach

The vulnerability stems from insufficient input validation in authentication module.
      `.trim(),
  );

  const result = await validator.validateStatusTransition(p0Task, 'todo', 'in_progress');

  t.true(result.valid);
  t.is(result.errors.length, 0);
  t.true(result.requirements.hasImplementationPlan);
});

test('should require code changes for todo to in_progress transition', async (t) => {
  const { tasksDir, tempDir } = t.context as any;
  const p0Task = createMockP0Task();
  const taskFilePath = join(tasksDir, `${p0Task.uuid}.md`);

  await writeFile(
    taskFilePath,
    `
---
uuid: ${p0Task.uuid}
title: ${p0Task.title}
priority: P0
labels: [security]
---

# Fix Critical Security Vulnerability

## Implementation Plan

Detailed implementation approach here.
      `.trim(),
  );

  // Create validator that doesn't skip git checks (will fail since no git repo)
  const validator = createP0SecurityValidator({
    repoRoot: tempDir,
    tasksDir,
    skipGitChecks: false, // Don't skip git checks for this test
    skipFileChecks: false,
  });

  const result = await validator.validateStatusTransition(p0Task, 'todo', 'in_progress');

  t.false(result.valid);
  t.true(
    result.errors.includes(
      'P0 security tasks require committed code changes to move to in-progress',
    ),
  );
  t.false(result.requirements.hasCodeChanges);
});

test('should require security review for in_progress to testing transition', async (t) => {
  const { validator, tasksDir } = t.context as any;
  const p0Task = createMockP0Task({ status: 'in_progress' });
  const taskFilePath = join(tasksDir, `${p0Task.uuid}.md`);

  await writeFile(
    taskFilePath,
    `
---
uuid: ${p0Task.uuid}
title: ${p0Task.title}
priority: P0
labels: [security]
---

# Fix Critical Security Vulnerability

## Implementation Plan

Detailed implementation approach here.

## Code Changes

Implementation completed with proper security measures.
      `.trim(),
  );

  const result = await validator.validateStatusTransition(p0Task, 'in_progress', 'testing');

  t.false(result.valid);
  t.true(
    result.errors.includes('P0 security tasks require completed security review before testing'),
  );
  t.false(result.requirements.hasSecurityReview);
});

test('should pass validation with security review completion', async (t) => {
  const { validator, tasksDir } = t.context as any;
  const p0Task = createMockP0Task({
    status: 'in_progress',
    labels: ['security', 'security-reviewed'],
  });
  const taskFilePath = join(tasksDir, `${p0Task.uuid}.md`);

  await writeFile(
    taskFilePath,
    `
---
uuid: ${p0Task.uuid}
title: ${p0Task.title}
priority: P0
labels: [security, security-reviewed]
---

# Fix Critical Security Vulnerability

## Implementation Plan

Detailed implementation approach here.

## Security Review

Security review completed by John Doe (Security Lead):
- Input validation properly implemented
- No new attack vectors introduced
- Code follows security best practices
- All tests passing

Security review approved on 2025-10-18.

## Test Coverage

### Unit Tests
- Test input validation functions
- Test error handling
- Test edge cases

### Integration Tests
- Test authentication flow
- Test security middleware

Test coverage target: 95%+
      `.trim(),
  );

  const result = await validator.validateStatusTransition(p0Task, 'in_progress', 'testing');

  t.true(result.valid);
  t.is(result.errors.length, 0);
  t.true(result.requirements.hasSecurityReview);
});

test('should require test coverage for in_progress to testing transition', async (t) => {
  const { validator, tasksDir } = t.context as any;
  const p0Task = createMockP0Task({ status: 'in_progress' });
  const taskFilePath = join(tasksDir, `${p0Task.uuid}.md`);

  await writeFile(
    taskFilePath,
    `
---
uuid: ${p0Task.uuid}
title: ${p0Task.title}
priority: P0
labels: [security]
---

# Fix Critical Security Vulnerability

## Implementation Plan

Detailed implementation approach here.

## Security Review

Security review completed and approved.
      `.trim(),
  );

  const result = await validator.validateStatusTransition(p0Task, 'in_progress', 'testing');

  t.false(result.valid);
  t.true(
    result.errors.includes('P0 security tasks require defined test coverage plan before testing'),
  );
  t.false(result.requirements.hasTestCoverage);
});

test('should pass validation with test coverage plan', async (t) => {
  const { validator, tasksDir } = t.context as any;
  const p0Task = createMockP0Task({
    status: 'in_progress',
    labels: ['security', 'security-reviewed'],
  });
  const taskFilePath = join(tasksDir, `${p0Task.uuid}.md`);

  await writeFile(
    taskFilePath,
    `
---
uuid: ${p0Task.uuid}
title: ${p0Task.title}
priority: P0
labels: [security, security-reviewed]
---

# Fix Critical Security Vulnerability

## Implementation Plan

Detailed implementation approach here.

## Security Review

Security review completed and approved.

## Test Coverage

### Unit Tests
- Test input validation functions
- Test error handling
- Test edge cases

### Integration Tests
- Test authentication flow
- Test security middleware
- Test API endpoints

### Security Tests
- Test for injection attacks
- Test for authentication bypass
- Test for privilege escalation

Test coverage target: 95%+
      `.trim(),
  );

  const result = await validator.validateStatusTransition(p0Task, 'in_progress', 'testing');

  t.true(result.valid);
  t.is(result.errors.length, 0);
  t.true(result.requirements.hasTestCoverage);
});

test('should require documentation for review to done transition', async (t) => {
  const { validator, tasksDir } = t.context as any;
  const p0Task = createMockP0Task({
    status: 'review',
    labels: ['security', 'security-reviewed'],
  });
  const taskFilePath = join(tasksDir, `${p0Task.uuid}.md`);

  await writeFile(
    taskFilePath,
    `
---
uuid: ${p0Task.uuid}
title: ${p0Task.title}
priority: P0
labels: [security, security-reviewed]
---

# Fix Critical Security Vulnerability

## Implementation Plan

Detailed implementation approach here.

## Security Review

Security review completed and approved.

## Test Coverage

Comprehensive test coverage defined and implemented.
      `.trim(),
  );

  const result = await validator.validateStatusTransition(p0Task, 'review', 'done');

  t.false(result.valid);
  t.true(
    result.errors.includes('P0 security tasks require updated documentation before completion'),
  );
  t.false(result.requirements.hasDocumentation);
});

test('should pass validation with updated documentation', async (t) => {
  const { validator, tasksDir } = t.context as any;
  const p0Task = createMockP0Task({
    status: 'review',
    labels: ['security', 'security-reviewed'],
  });
  const taskFilePath = join(tasksDir, `${p0Task.uuid}.md`);

  await writeFile(
    taskFilePath,
    `
---
uuid: ${p0Task.uuid}
title: ${p0Task.title}
priority: P0
labels: [security, security-reviewed]
---

# Fix Critical Security Vulnerability

## Implementation Plan

Detailed implementation approach here.

## Security Review

Security review completed and approved.

## Test Coverage

Comprehensive test coverage defined and implemented.

## Documentation

Documentation has been updated:
- API documentation updated with new security measures
- README.md updated with security guidelines
- Developer guide updated with security best practices
- Security checklist updated

All documentation changes reviewed and approved.
      `.trim(),
  );

  const result = await validator.validateStatusTransition(p0Task, 'review', 'done');

  t.true(result.valid);
  t.is(result.errors.length, 0);
  t.true(result.requirements.hasDocumentation);
});

test('should generate warnings for partial compliance', async (t) => {
  const { validator, tasksDir } = t.context as any;
  const p0Task = createMockP0Task();
  const taskFilePath = join(tasksDir, `${p0Task.uuid}.md`);

  await writeFile(
    taskFilePath,
    `
---
uuid: ${p0Task.uuid}
title: ${p0Task.title}
priority: P0
labels: [security]
---

# Fix Critical Security Vulnerability

Basic task description without detailed plans.
      `.trim(),
  );

  const result = await validator.validateStatusTransition(p0Task, 'todo', 'in_progress');

  t.false(result.valid);
  t.true(result.warnings.length > 0);
  t.true(result.warnings.some((w: string) => w.includes('implementation plan')));
});

test('should handle various status formats', async (t) => {
  const { tasksDir, tempDir } = t.context as any;
  const p0Task = createMockP0Task();
  const taskFilePath = join(tasksDir, `${p0Task.uuid}.md`);

  await writeFile(
    taskFilePath,
    `
---
uuid: ${p0Task.uuid}
title: ${p0Task.title}
priority: P0
labels: [security]
---

## Implementation Plan

Detailed implementation approach here.
      `.trim(),
  );

  // Create validator that doesn't skip git checks
  const validator = createP0SecurityValidator({
    repoRoot: tempDir,
    tasksDir,
    skipGitChecks: false,
    skipFileChecks: false,
  });

  // Test various status formats
  const testCases = [
    { from: 'todo', to: 'in-progress' },
    { from: 'todo', to: 'in_progress' },
    { from: 'ready', to: 'IN_PROGRESS' },
    { from: 'TODO', to: 'In-Progress' },
  ];

  for (const testCase of testCases) {
    const result = await validator.validateStatusTransition(p0Task, testCase.from, testCase.to);

    // Should fail due to missing code changes, but not due to status format
    t.true(result.errors.some((e: string) => e.includes('code changes')));
  }
});

test('should work with convenience function', async (t) => {
  const { tasksDir, tempDir } = t.context as any;
  const p0Task = createMockP0Task();
  const taskFilePath = join(tasksDir, `${p0Task.uuid}.md`);

  await writeFile(
    taskFilePath,
    `
---
uuid: ${p0Task.uuid}
title: ${p0Task.title}
priority: P0
labels: [security]
---

## Implementation Plan

Detailed implementation approach here.
      `.trim(),
  );

  const result = await validateP0SecurityTask(p0Task, 'todo', 'in_progress', {
    repoRoot: tempDir,
    tasksDir,
    skipGitChecks: false, // Don't skip git checks for this test
    skipFileChecks: false,
  });

  t.false(result.valid);
  t.true(
    result.errors.includes(
      'P0 security tasks require committed code changes to move to in-progress',
    ),
  );
});

test('should handle missing task files gracefully', async (t) => {
  const { validator } = t.context as any;
  const p0Task = createMockP0Task();

  const result = await validator.validateStatusTransition(p0Task, 'todo', 'in_progress');

  t.false(result.valid);
  t.true(
    result.errors.includes('P0 security tasks require an implementation plan before starting work'),
  );
});

test('should handle file read errors gracefully', async (t) => {
  const p0Task = createMockP0Task();

  // Create invalid file path
  const invalidValidator = createP0SecurityValidator({
    repoRoot: '/nonexistent/path',
    tasksDir: '/nonexistent/tasks',
    skipGitChecks: true,
    skipFileChecks: false,
  });

  const result = await invalidValidator.validateStatusTransition(p0Task, 'todo', 'in_progress');

  // Should still validate but with warnings about file access
  t.true(
    result.errors.includes('P0 security tasks require an implementation plan before starting work'),
  );
});
