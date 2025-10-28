/**
 * Integration tests for GitWorkflow
 * Tests the complete git workflow with real git operations
 */

import test from 'ava';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { GitWorkflow } from '../lib/heal/git-workflow.js';
import type { ScarContext } from '../lib/heal/scar-context-types.js';
import type { Task } from '../lib/testing-transition/types.js';

// Mock data for integration tests
const createMockScarContext = (reason: string, tag: string): ScarContext => ({
  reason,
  eventLog: [
    {
      timestamp: new Date(),
      operation: 'test-operation',
      details: { test: true },
      severity: 'info',
    },
  ],
  previousScars: [],
  searchResults: [
    {
      taskId: 'test-task-1',
      title: 'Test Task 1',
      relevance: 0.9,
      snippet: 'Test task for integration',
    },
  ],
  metadata: {
    tag,
    narrative: `Integration test for ${reason}`,
  },
  llmOperations: [
    {
      id: 'test-llm-1',
      operation: 'test',
      input: { test: true },
      output: { result: 'success' },
      timestamp: new Date(),
      tokensUsed: 50,
    },
  ],
  gitHistory: [],
});

const createMockTasks = (): Task[] => [
  {
    uuid: 'test-task-1-uuid',
    title: 'Test Task 1',
    status: 'in_progress',
    priority: 'P1',
    labels: ['test'],
    created_at: new Date(),
    updated_at: new Date(),
    estimates: {
      complexity: 'low',
      scale: 'small',
      time_to_completion: '1h',
    },
  },
  {
    uuid: 'test-task-2-uuid',
    title: 'Test Task 2',
    status: 'done',
    priority: 'P2',
    labels: ['test'],
    created_at: new Date(),
    updated_at: new Date(),
    estimates: {
      complexity: 'medium',
      scale: 'medium',
      time_to_completion: '2h',
    },
  },
];

test.beforeEach(async (t) => {
  // Create a temporary git repository for each test
  const testDir = path.join(process.cwd(), 'test-git-workflow-temp');
  await fs.mkdir(testDir, { recursive: true });
  
  // Initialize git repository
  const { execSync } = await import('node:child_process');
  execSync('git init', { cwd: testDir });
  execSync('git config user.name "Test User"', { cwd: testDir });
  execSync('git config user.email "test@example.com"', { cwd: testDir });
  
  // Create initial structure
  await fs.mkdir(path.join(testDir, 'docs', 'agile', 'tasks'), { recursive: true });
  await fs.mkdir(path.join(testDir, '.kanban', 'scars'), { recursive: true });
  
  // Create initial commit
  await fs.writeFile(path.join(testDir, 'README.md'), '# Test Repository');
  execSync('git add README.md', { cwd: testDir });
  execSync('git commit -m "Initial commit"', { cwd: testDir });
  
  // Create kanban files
  const kanbanContent = {
    columns: ['todo', 'in_progress', 'done'],
    tasks: [],
  };
  await fs.writeFile(
    path.join(testDir, 'promethean.kanban.json'),
    JSON.stringify(kanbanContent, null, 2)
  );
  await fs.writeFile(
    path.join(testDir, 'docs', 'agile', 'boards', 'generated.md'),
    '# Kanban Board\n\nNo tasks yet.'
  );
  
  execSync('git add .', { cwd: testDir });
  execSync('git commit -m "Add kanban structure"', { cwd: testDir });
  
  t.context.testDir = testDir;
});

test.afterEach.always(async (t) => {
  // Clean up test directory
  const testDir = t.context.testDir as string;
  try {
    await fs.rm(testDir, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
  }
});

test('GitWorkflow constructor initializes correctly', (t) => {
  const testDir = t.context.testDir as string;
  const workflow = new GitWorkflow({ repoPath: testDir });
  
  t.is(workflow['repoPath'], testDir);
  t.true(workflow['gitUtils'] !== undefined);
  t.true(workflow['commitMessageGenerator'] !== undefined);
  t.true(workflow['scarFileManager'] !== undefined);
  t.true(workflow['gitTagManager'] !== undefined);
});

test('preOperation creates commit and tag', async (t) => {
  const testDir = t.context.testDir as string;
  const workflow = new GitWorkflow({ repoPath: testDir });
  
  const context = createMockScarContext('Test healing', 'heal-test-001');
  
  const result = await workflow.preOperation(context);
  
  t.true(result.success);
  t.true(typeof result.commitSha === 'string');
  t.true(result.commitSha!.length > 0);
  t.true(typeof result.tag === 'string');
  t.true(result.tag!.includes('heal-test-001-pre-op'));
  t.true(result.repoState !== undefined);
});

test('preOperation handles dirty working directory', async (t) => {
  const testDir = t.context.testDir as string;
  const workflow = new GitWorkflow({ repoPath: testDir, createBackups: true });
  
  // Create some uncommitted changes
  await fs.writeFile(path.join(testDir, 'test-change.txt'), 'test content');
  
  const context = createMockScarContext('Test with dirty dir', 'heal-test-002');
  
  const result = await workflow.preOperation(context);
  
  t.true(result.success);
  t.true(typeof result.commitSha === 'string');
});

test('postOperation creates commits and tags', async (t) => {
  const testDir = t.context.testDir as string;
  const workflow = new GitWorkflow({ repoPath: testDir });
  
  const context = createMockScarContext('Test post-operation', 'heal-test-003');
  const tasks = createMockTasks();
  
  // First run pre-operation
  await workflow.preOperation(context);
  
  // Create some changes
  await fs.writeFile(
    path.join(testDir, 'docs', 'agile', 'tasks', 'test-task.md'),
    '# Test Task\n\nTest content'
  );
  
  const result = await workflow.postOperation(context, tasks);
  
  t.true(result.success);
  t.true(typeof result.commitSha === 'string');
  t.true(typeof result.tag === 'string');
  t.true(typeof result.finalTag === 'string');
  t.true(Array.isArray(result.commits));
  t.true(result.commits!.length > 0);
  t.true(typeof result.filesChanged === 'number');
});

test('complete workflow integration', async (t) => {
  const testDir = t.context.testDir as string;
  const workflow = new GitWorkflow({ repoPath: testDir });
  
  const context = createMockScarContext('Complete workflow test', 'heal-test-004');
  const tasks = createMockTasks();
  
  // Run pre-operation
  const preResult = await workflow.preOperation(context);
  t.true(preResult.success);
  
  // Simulate healing operations by creating task files
  for (const task of tasks) {
    const taskContent = `---
uuid: "${task.uuid}"
title: "${task.title}"
status: "${task.status}"
priority: "${task.priority}"
labels: ${JSON.stringify(task.labels)}
created_at: "${task.created_at.toISOString()}"
updated_at: "${task.updated_at.toISOString()}"
estimates:
  complexity: "${task.estimates.complexity}"
  scale: "${task.estimates.scale}"
  time_to_completion: "${task.estimates.time_to_completion}"
---

# ${task.title}

Test task content for integration testing.
`;
    await fs.writeFile(
      path.join(testDir, 'docs', 'agile', 'tasks', `${task.uuid}.md`),
      taskContent
    );
  }
  
  // Update kanban board
  const kanbanPath = path.join(testDir, 'promethean.kanban.json');
  const kanbanContent = JSON.parse(await fs.readFile(kanbanPath, 'utf8'));
  kanbanContent.tasks = tasks.map(task => ({
    uuid: task.uuid,
    title: task.title,
    status: task.status,
    priority: task.priority,
  }));
  await fs.writeFile(kanbanPath, JSON.stringify(kanbanContent, null, 2));
  
  // Run post-operation
  const postResult = await workflow.postOperation(context, tasks);
  
  t.true(postResult.success);
  t.true(typeof postResult.commitSha === 'string');
  t.true(typeof postResult.finalTag === 'string');
  t.true(postResult.commits!.length > 0);
  
  // Verify scar file was created
  const scarStats = await workflow['scarFileManager'].getStats();
  t.true(scarStats.exists);
  t.is(scarStats.totalRecords, 1);
  
  // Verify tags were created
  const tags = await workflow['gitTagManager'].getHealTags();
  t.true(tags.some(tag => tag.includes('heal-test-004-pre-op')));
  t.true(tags.some(tag => tag.includes('heal-test-004-post-op')));
  t.true(tags.some(tag => tag.includes('heal-test-004')));
});

test('rollback functionality', async (t) => {
  const testDir = t.context.testDir as string;
  const workflow = new GitWorkflow({ repoPath: testDir });
  
  // Get current HEAD
  const currentState = await workflow.getCurrentState();
  const originalSha = currentState.headSha;
  
  // Create some changes and commit
  await fs.writeFile(path.join(testDir, 'rollback-test.txt'), 'test content');
  const { execSync } = await import('node:child_process');
  execSync('git add rollback-test.txt', { cwd: testDir });
  execSync('git commit -m "Test commit for rollback"', { cwd: testDir });
  
  // Verify we're at a different commit
  const newState = await workflow.getCurrentState();
  t.not(newState.headSha, originalSha);
  
  // Rollback
  const rollbackResult = await workflow.rollback(originalSha);
  
  t.true(rollbackResult.success);
  t.true(rollbackResult.data?.message?.includes('Successfully rolled back'));
  
  // Verify we're back to the original commit
  const rolledBackState = await workflow.getCurrentState();
  t.is(rolledBackState.headSha, originalSha);
});

test('getCurrentState returns repository state', async (t) => {
  const testDir = t.context.testDir as string;
  const workflow = new GitWorkflow({ repoPath: testDir });
  
  const state = await workflow.getCurrentState();
  
  t.true(typeof state.headSha === 'string');
  t.true(state.headSha.length > 0);
  t.true(typeof state.branch === 'string');
  t.true(typeof state.isClean === 'boolean');
  t.true(Array.isArray(state.modifiedFiles));
  t.true(Array.isArray(state.untrackedFiles));
});

test('commitTasksDirectory handles no changes', async (t) => {
  const testDir = t.context.testDir as string;
  const workflow = new GitWorkflow({ repoPath: testDir });
  
  const context = createMockScarContext('Test no changes', 'heal-test-005');
  
  const result = await workflow.commitTasksDirectory(context);
  
  t.true(result.success);
  t.true(result.data?.includes('No changes to commit'));
});

test('commitKanbanBoard handles no changes', async (t) => {
  const testDir = t.context.testDir as string;
  const workflow = new GitWorkflow({ repoPath: testDir });
  
  const context = createMockScarContext('Test no board changes', 'heal-test-006');
  const tasks = [];
  
  const result = await workflow.commitKanbanBoard(context, tasks);
  
  t.true(result.success);
  t.true(result.data?.includes('No changes to commit'));
});

test('commitDependencies handles no changes', async (t) => {
  const testDir = t.context.testDir as string;
  const workflow = new GitWorkflow({ repoPath: testDir });
  
  const context = createMockScarContext('Test no dep changes', 'heal-test-007');
  
  const result = await workflow.commitDependencies(context);
  
  t.true(result.success);
  t.true(result.data?.includes('No changes to commit'));
});

test('createPreOpTag creates tag correctly', async (t) => {
  const testDir = t.context.testDir as string;
  const workflow = new GitWorkflow({ repoPath: testDir });
  
  const currentState = await workflow.getCurrentState();
  
  const result = await workflow.createPreOpTag('heal-test-008', currentState.headSha);
  
  t.true(result.success);
  t.true(typeof result.data?.tag === 'string');
  t.true(result.data.tag.includes('heal-test-008-pre-op'));
});

test('createPostOpTag creates tag correctly', async (t) => {
  const testDir = t.context.testDir as string;
  const workflow = new GitWorkflow({ repoPath: testDir });
  
  const currentState = await workflow.getCurrentState();
  
  const result = await workflow.createPostOpTag('heal-test-009', currentState.headSha);
  
  t.true(result.success);
  t.true(typeof result.data?.tag === 'string');
  t.true(result.data.tag.includes('heal-test-009-post-op'));
});

test('createFinalTag creates tag correctly', async (t) => {
  const testDir = t.context.testDir as string;
  const workflow = new GitWorkflow({ repoPath: testDir });
  
  const currentState = await workflow.getCurrentState();
  
  const result = await workflow.createFinalTag('heal-test-010', currentState.headSha);
  
  t.true(result.success);
  t.true(typeof result.data?.tag === 'string');
  t.true(result.data.tag.includes('heal-test-010'));
});

test('rollback with invalid SHA fails gracefully', async (t) => {
  const testDir = t.context.testDir as string;
  const workflow = new GitWorkflow({ repoPath: testDir });
  
  const result = await workflow.rollback('invalid-sha-123');
  
  t.false(result.success);
  t.true(result.error?.includes('does not exist'));
});

test('workflow with custom configuration', async (t) => {
  const testDir = t.context.testDir as string;
  const workflow = new GitWorkflow({
    repoPath: testDir,
    createAnnotatedTags: false,
    signTags: false,
    tagPrefix: 'custom-heal',
    pushToRemote: false,
    createBackups: false,
    commitMessageOptions: {
      maxSubjectLength: 50,
      includeTaskIds: false,
      prefix: 'custom',
    },
    scarFileConfig: {
      maxFileSize: 1024,
    },
  });
  
  const context = createMockScarContext('Custom config test', 'custom-heal-001');
  
  const result = await workflow.preOperation(context);
  
  t.true(result.success);
  t.true(result.tag?.includes('custom-heal-001-pre-op'));
});

test('createGitWorkflow factory function', (t) => {
  const workflow = GitWorkflow.createGitWorkflow({
    repoPath: '/test/path',
    tagPrefix: 'factory-test',
  });
  
  t.true(workflow instanceof GitWorkflow);
  t.is(workflow['repoPath'], '/test/path');
  t.is(workflow['config'].tagPrefix, 'factory-test');
});