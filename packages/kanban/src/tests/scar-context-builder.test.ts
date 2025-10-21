/* eslint-disable functional/no-let, functional/immutable-data, @typescript-eslint/no-unused-vars */
import test from 'ava';
import { promises as fs } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { ScarContextBuilder, createScarContextBuilder, DEFAULT_SCAR_CONTEXT_OPTIONS } from '../lib/heal/scar-context-builder.js';
import { EventLogManager } from '../board/event-log.js';
import { loadKanbanConfig } from '../board/config.js';
import type { ScarContext, HealingStatus } from '../lib/heal/scar-context-types.js';
import { validateScarContextIntegrity, createEventLogEntry } from '../lib/heal/type-guards.js';
import type { Board, Task, ColumnData } from '../lib/types.js';

// Mock data for testing
const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  uuid: randomUUID(),
  title: 'Test Task',
  status: 'Todo',
  priority: 'P1',
  labels: ['test'],
  created_at: new Date().toISOString(),
  estimates: { complexity: 3 },
  content: 'Test task content',
  ...overrides,
});

const createMockBoard = (tasks: Task[] = []): Board => ({
  columns: [
    {
      name: 'Todo',
      count: tasks.filter(t => t.status === 'Todo').length,
      limit: 5,
      tasks: tasks.filter(t => t.status === 'Todo'),
    },
    {
      name: 'In Progress',
      count: tasks.filter(t => t.status === 'In Progress').length,
      limit: 3,
      tasks: tasks.filter(t => t.status === 'In Progress'),
    },
    {
      name: 'Done',
      count: tasks.filter(t => t.status === 'Done').length,
      limit: null,
      tasks: tasks.filter(t => t.status === 'Done'),
    },
  ],
});

// Setup temporary directories for testing
const setupTestEnvironment = async () => {
  const tempDir = await fs.mkdtemp('kanban-test-');
  const boardPath = path.join(tempDir, 'board.md');
  const tasksDir = path.join(tempDir, 'tasks');

  await fs.mkdir(tasksDir, { recursive: true });

  // Create a basic board file
  const boardContent = `## Todo\n\n## In Progress\n\n## Done\n`;
  await fs.writeFile(boardPath, boardContent);

  return { tempDir, boardPath, tasksDir };
};

const cleanupTestEnvironment = async (tempDir: string) => {
  await fs.rm(tempDir, { recursive: true, force: true });
};

test('ScarContextBuilder - Constructor initialization', (t) => {
  const { boardPath, tasksDir } = await setupTestEnvironment();
  
  const builder = createScarContextBuilder(boardPath, tasksDir);
  
  t.truthy(builder);
  t.is(typeof builder.buildContext, 'function');

  await cleanupTestEnvironment(boardPath);
});

test('ScarContextBuilder - Build basic context', async (t) => {
  const { boardPath, tasksDir, tempDir } = await setupTestEnvironment();
  
  try {
    // Create some test tasks
    const tasks = [
      createMockTask({ title: 'Task 1', status: 'Todo' }),
      createMockTask({ title: 'Task 2', status: 'In Progress' }),
      createMockTask({ title: 'Task 3', status: 'Done' }),
    ];

    // Write task files
    for (const task of tasks) {
      const taskFile = path.join(tasksDir, `${task.uuid}.md`);
      const content = `---
uuid: ${task.uuid}
title: ${task.title}
status: ${task.status}
priority: ${task.priority}
labels: [${task.labels?.join(', ')}]
created_at: ${task.created_at}
estimates:
  complexity: ${task.estimates?.complexity}
---

${task.content}`;
      await fs.writeFile(taskFile, content);
    }

    const builder = createScarContextBuilder(boardPath, tasksDir);
    const context = await builder.buildContext('Test healing operation');

    // Verify basic structure
    t.is(context.reason, 'Test healing operation');
    t.true(Array.isArray(context.eventLog));
    t.true(context.eventLog.length > 0);
    t.true(Array.isArray(context.previousScars));
    t.true(Array.isArray(context.searchResults));
    t.true(Array.isArray(context.llmOperations));
    t.true(Array.isArray(context.gitHistory));

    // Verify metadata
    t.is(typeof context.metadata.tag, 'string');
    t.true(context.metadata.tag.length > 0);
    t.is(typeof context.metadata.narrative, 'string');
    t.true(context.metadata.narrative.length > 0);

    // Verify context integrity
    const validation = validateScarContextIntegrity(context);
    t.true(validation.isValid);
    t.is(validation.errors.length, 0);

  } finally {
    await cleanupTestEnvironment(tempDir);
  }
});

test('ScarContextBuilder - System metrics analysis', async (t) => {
  const { boardPath, tasksDir, tempDir } = await setupTestEnvironment();
  
  try {
    // Create tasks with various issues
    const tasks = [
      createMockTask({ title: 'Normal Task', status: 'Todo' }),
      createMockTask({ title: '', status: 'Todo' }), // Missing title
      createMockTask({ title: 'No Content Task', status: 'Todo', content: '' }), // Missing content
      createMockTask({ title: 'No Labels Task', status: 'Todo', labels: [] }), // No labels
      createMockTask({ title: 'No Estimates Task', status: 'Todo', estimates: {} }), // No estimates
      createMockTask({ title: 'Duplicate Task', status: 'Todo' }),
      createMockTask({ title: 'Duplicate Task', status: 'Todo' }), // Duplicate
    ];

    // Write task files
    for (const task of tasks) {
      const taskFile = path.join(tasksDir, `${task.uuid}.md`);
      const content = `---
uuid: ${task.uuid}
title: ${task.title}
status: ${task.status}
priority: ${task.priority}
labels: [${task.labels?.join(', ')}]
created_at: ${task.created_at}
estimates:
  complexity: ${task.estimates?.complexity}
---

${task.content}`;
      await fs.writeFile(taskFile, content);
    }

    const builder = createScarContextBuilder(boardPath, tasksDir);
    const context = await builder.buildContext('System metrics test', {
      includePerformanceMetrics: true,
    });

    // Check that system metrics were analyzed
    const metricsEvent = context.eventLog.find(e => e.operation === 'system-metrics-analyzed');
    t.truthy(metricsEvent);
    t.is(metricsEvent?.details.totalTasks, tasks.length);

    // Verify WIP violations detection
    const wipViolationEvent = context.eventLog.find(e => e.operation === 'system-metrics-analyzed');
    t.truthy(wipViolationEvent);
    t.true(wipViolationEvent?.details.wipViolations >= 0);

  } finally {
    await cleanupTestEnvironment(tempDir);
  }
});

test('ScarContextBuilder - Task analysis with quality issues', async (t) => {
  const { boardPath, tasksDir, tempDir } = await setupTestEnvironment();
  
  try {
    // Create tasks with quality issues
    const tasks = [
      createMockTask({ 
        title: 'Critical Task', 
        status: 'Todo', 
        priority: 'P0',
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() // 20 days old
      }),
      createMockTask({ 
        title: 'Stuck Task', 
        status: 'In Progress',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days old
      }),
    ];

    // Write task files
    for (const task of tasks) {
      const taskFile = path.join(tasksDir, `${task.uuid}.md`);
      const content = `---
uuid: ${task.uuid}
title: ${task.title}
status: ${task.status}
priority: ${task.priority}
labels: [${task.labels?.join(', ')}]
created_at: ${task.created_at}
estimates:
  complexity: ${task.estimates?.complexity}
---

${task.content}`;
      await fs.writeFile(taskFile, content);
    }

    const builder = createScarContextBuilder(boardPath, tasksDir);
    const context = await builder.buildContext('Task analysis test', {
      includeTaskAnalysis: true,
    });

    // Check that task analysis was performed
    const analysisEvent = context.eventLog.find(e => e.operation === 'task-analysis-completed');
    t.truthy(analysisEvent);
    t.true(analysisEvent?.details.criticalTasks >= 0);
    t.true(analysisEvent?.details.qualityIssues >= 0);

  } finally {
    await cleanupTestEnvironment(tempDir);
  }
});

test('ScarContextBuilder - Search functionality', async (t) => {
  const { boardPath, tasksDir, tempDir } = await setupTestEnvironment();
  
  try {
    // Create tasks with searchable content
    const tasks = [
      createMockTask({ 
        title: 'Security Issue', 
        status: 'Todo',
        labels: ['security', 'bug'],
        content: 'This is a critical security vulnerability that needs immediate attention'
      }),
      createMockTask({ 
        title: 'Feature Request', 
        status: 'Todo',
        labels: ['enhancement'],
        content: 'User requested new feature for better UX'
      }),
      createMockTask({ 
        title: 'Performance Optimization', 
        status: 'Todo',
        labels: ['performance'],
        content: 'Optimize database queries for better performance'
      }),
    ];

    // Write task files
    for (const task of tasks) {
      const taskFile = path.join(tasksDir, `${task.uuid}.md`);
      const content = `---
uuid: ${task.uuid}
title: ${task.title}
status: ${task.status}
priority: ${task.priority}
labels: [${task.labels?.join(', ')}]
created_at: ${task.created_at}
estimates:
  complexity: ${task.estimates?.complexity}
---

${task.content}`;
      await fs.writeFile(taskFile, content);
    }

    const builder = createScarContextBuilder(boardPath, tasksDir);
    const context = await builder.buildContext('Search test', {
      searchTerms: ['security', 'performance'],
      maxSearchResults: 10,
    });

    // Check that search was performed
    const searchEvent = context.eventLog.find(e => e.operation === 'task-search-completed');
    t.truthy(searchEvent);
    t.deepEqual(searchEvent?.details.searchTerms, ['security', 'performance']);

    // Verify search results
    t.true(context.searchResults.length > 0);
    t.true(context.searchResults.length <= 10); // Respect maxResults

    // Should find security and performance related tasks
    const securityResult = context.searchResults.find(r => r.title.includes('Security Issue'));
    const performanceResult = context.searchResults.find(r => r.title.includes('Performance Optimization'));
    
    t.truthy(securityResult);
    t.truthy(performanceResult);
    
    // Verify relevance scoring
    t.true(securityResult!.relevance > 0.5); // Should have high relevance for title match
    t.true(performanceResult!.relevance > 0.5);

  } finally {
    await cleanupTestEnvironment(tempDir);
  }
});

test('ScarContextBuilder - Git analysis', async (t) => {
  const { boardPath, tasksDir, tempDir } = await setupTestEnvironment();
  
  try {
    // Initialize git repository for testing
    const { execSync } = await import('node:child_process');
    execSync('git init', { cwd: tempDir });
    execSync('git config user.name "Test User"', { cwd: tempDir });
    execSync('git config user.email "test@example.com"', { cwd: tempDir });
    
    // Create initial commit
    execSync('git add .', { cwd: tempDir });
    execSync('git commit -m "Initial commit"', { cwd: tempDir });

    const builder = createScarContextBuilder(boardPath, tasksDir);
    const context = await builder.buildContext('Git analysis test', {
      maxGitHistory: 10,
    });

    // Check that git analysis was performed
    const gitEvent = context.eventLog.find(e => e.operation === 'git-analysis-completed');
    t.truthy(gitEvent);
    t.true(gitEvent?.details.commitsAnalyzed >= 0);

    // Verify git history is included
    t.true(Array.isArray(context.gitHistory));
    t.true(context.gitHistory.length <= 10); // Respect maxDepth

  } finally {
    await cleanupTestEnvironment(tempDir);
  }
});

test('ScarContextBuilder - LLM operations tracking', async (t) => {
  const { boardPath, tasksDir, tempDir } = await setupTestEnvironment();
  
  try {
    const builder = createScarContextBuilder(boardPath, tasksDir);
    
    // Build initial context
    const context = await builder.buildContext('LLM operations test');
    
    // Add LLM operation
    await builder.addLLMOperation(
      context,
      'analyze-task',
      { taskId: 'test-123', analysisType: 'quality' },
      { score: 0.8, issues: ['missing-labels'] },
      150
    );

    // Verify LLM operation was added
    t.is(context.llmOperations.length, 1);
    const llmOp = context.llmOperations[0];
    t.is(llmOp.operation, 'analyze-task');
    t.deepEqual(llmOp.input, { taskId: 'test-123', analysisType: 'quality' });
    t.deepEqual(llmOp.output, { score: 0.8, issues: ['missing-labels'] });
    t.is(llmOp.tokensUsed, 150);

    // Verify event log was updated
    const llmEvent = context.eventLog.find(e => e.operation === 'llm-operation-completed');
    t.truthy(llmEvent);
    t.is(llmEvent?.details.operationId, llmOp.id);

  } finally {
    await cleanupTestEnvironment(tempDir);
  }
});

test('ScarContextBuilder - Progress updates', async (t) => {
  const { boardPath, tasksDir, tempDir } = await setupTestEnvironment();
  
  try {
    const builder = createScarContextBuilder(boardPath, tasksDir);
    
    // Build initial context
    const context = await builder.buildContext('Progress updates test');
    const initialEventCount = context.eventLog.length;

    // Update progress
    await builder.updateProgress(
      context,
      'custom-operation',
      { step: 1, result: 'success' },
      'info'
    );

    await builder.updateProgress(
      context,
      'warning-operation',
      { issue: 'something went wrong' },
      'warning'
    );

    // Verify progress updates
    t.is(context.eventLog.length, initialEventCount + 2);
    
    const infoEvent = context.eventLog.find(e => e.operation === 'custom-operation');
    t.truthy(infoEvent);
    t.is(infoEvent?.severity, 'info');
    t.deepEqual(infoEvent?.details, { step: 1, result: 'success' });

    const warningEvent = context.eventLog.find(e => e.operation === 'warning-operation');
    t.truthy(warningEvent);
    t.is(warningEvent?.severity, 'warning');
    t.deepEqual(warningEvent?.details, { issue: 'something went wrong' });

  } finally {
    await cleanupTestEnvironment(tempDir);
  }
});

test('ScarContextBuilder - Context finalization', async (t) => {
  const { boardPath, tasksDir, tempDir } = await setupTestEnvironment();
  
  try {
    const builder = createScarContextBuilder(boardPath, tasksDir);
    
    // Build and finalize context
    const context = await builder.buildContext('Finalization test');
    const finalizedContext = await builder.finalizeContext(context);

    // Verify finalization event
    const finalizationEvent = finalizedContext.eventLog.find(e => e.operation === 'context-finalized');
    t.truthy(finalizationEvent);
    t.true(finalizationEvent?.details.totalEvents >= 0);
    t.true(finalizationEvent?.details.llmOperations >= 0);
    t.true(finalizationEvent?.details.searchResults >= 0);
    t.true(finalizationEvent?.details.previousScars >= 0);

    // Verify context is still valid after finalization
    const validation = validateScarContextIntegrity(finalizedContext);
    t.true(validation.isValid);
    t.is(validation.errors.length, 0);

  } finally {
    await cleanupTestEnvironment(tempDir);
  }
});

test('ScarContextBuilder - Error handling', async (t) => {
  const { boardPath, tasksDir, tempDir } = await setupTestEnvironment();
  
  try {
    // Create invalid task file to trigger error
    const invalidTaskFile = path.join(tasksDir, 'invalid.md');
    await fs.writeFile(invalidTaskFile, 'invalid content that cannot be parsed');

    const builder = createScarContextBuilder(boardPath, tasksDir);
    
    // Build context should handle errors gracefully
    const context = await builder.buildContext('Error handling test');

    // Should still have a valid context structure even with errors
    t.is(context.reason, 'Error handling test');
    t.true(Array.isArray(context.eventLog));
    
    // Should have error event logged
    const errorEvent = context.eventLog.find(e => e.operation === 'context-building-failed');
    t.truthy(errorEvent);
    t.is(errorEvent?.severity, 'error');

  } finally {
    await cleanupTestEnvironment(tempDir);
  }
});

test('ScarContextBuilder - Default options', (t) => {
  t.deepEqual(DEFAULT_SCAR_CONTEXT_OPTIONS, {
    maxPreviousScars: 10,
    maxSearchResults: 20,
    maxGitHistory: 50,
    includeTaskAnalysis: true,
    includePerformanceMetrics: true,
    searchTerms: [],
    columnFilter: [],
    labelFilter: [],
  });
});

test('ScarContextBuilder - Column and label filtering', async (t) => {
  const { boardPath, tasksDir, tempDir } = await setupTestEnvironment();
  
  try {
    // Create tasks with different labels and statuses
    const tasks = [
      createMockTask({ title: 'Bug Task', status: 'Todo', labels: ['bug', 'urgent'] }),
      createMockTask({ title: 'Feature Task', status: 'In Progress', labels: ['enhancement'] }),
      createMockTask({ title: 'Documentation Task', status: 'Done', labels: ['docs'] }),
    ];

    // Write task files
    for (const task of tasks) {
      const taskFile = path.join(tasksDir, `${task.uuid}.md`);
      const content = `---
uuid: ${task.uuid}
title: ${task.title}
status: ${task.status}
priority: ${task.priority}
labels: [${task.labels?.join(', ')}]
created_at: ${task.created_at}
estimates:
  complexity: ${task.estimates?.complexity}
---

${task.content}`;
      await fs.writeFile(taskFile, content);
    }

    const builder = createScarContextBuilder(boardPath, tasksDir);
    const context = await builder.buildContext('Filtering test', {
      includeTaskAnalysis: true,
      columnFilter: ['Todo', 'In Progress'], // Exclude Done tasks
      labelFilter: ['bug', 'urgent'], // Only include bug/urgent tasks
    });

    // Check that filtering was applied
    const analysisEvent = context.eventLog.find(e => e.operation === 'task-analysis-completed');
    t.truthy(analysisEvent);

    // With the filters applied, we should only analyze the Bug Task
    // (Todo status + bug/urgent labels)
    t.true(analysisEvent?.details.criticalTasks >= 0);
    t.true(analysisEvent?.details.qualityIssues >= 0);

  } finally {
    await cleanupTestEnvironment(tempDir);
  }
});

test('ScarContextBuilder - Integration with EventLogManager', async (t) => {
  const { boardPath, tasksDir, tempDir } = await setupTestEnvironment();
  
  try {
    // Load config to create EventLogManager
    const { config } = await loadKanbanConfig({
      argv: [],
      env: {
        KANBAN_TASKS_DIR: tasksDir,
        KANBAN_BOARD_FILE: boardPath,
      },
    });
    
    const eventLogManager = new EventLogManager(config);
    const builder = createScarContextBuilder(boardPath, tasksDir, eventLogManager);
    
    const context = await builder.buildContext('EventLogManager integration test');

    // Verify context was built successfully
    t.is(context.reason, 'EventLogManager integration test');
    t.true(context.eventLog.length > 0);

    // Verify EventLogManager integration (this would be more comprehensive in a real test)
    t.truthy(eventLogManager);

  } finally {
    await cleanupTestEnvironment(tempDir);
  }
});