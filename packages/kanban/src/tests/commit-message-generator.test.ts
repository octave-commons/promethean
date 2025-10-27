/**
 * Unit tests for CommitMessageGenerator
 */

import test from 'ava';
import { CommitMessageGenerator } from '../lib/heal/utils/commit-message-generator.js';
import type { ScarContext, Task } from '../lib/heal/scar-context-types.js';

// Mock data for testing
const mockScarContext: ScarContext = {
  reason: 'Fix duplicate task issue',
  eventLog: [
    {
      timestamp: new Date('2025-01-01T10:00:00Z'),
      operation: 'search',
      details: { query: 'duplicate tasks' },
      severity: 'info',
    },
  ],
  previousScars: [
    {
      start: 'abc123',
      end: 'def456',
      tag: 'heal-2025-01-01-10-00-00',
      story: 'Previous healing operation',
      timestamp: new Date('2025-01-01T09:00:00Z'),
    },
  ],
  searchResults: [
    {
      taskId: 'task-1',
      title: 'Duplicate task found',
      relevance: 0.9,
      snippet: 'This task appears to be a duplicate',
    },
    {
      taskId: 'task-2',
      title: 'Related task',
      relevance: 0.7,
      snippet: 'Related to the duplicate issue',
    },
  ],
  metadata: {
    tag: 'heal-2025-01-01-10-00-00',
    narrative: 'Fixed duplicate task creation bug',
  },
  llmOperations: [
    {
      id: 'llm-1',
      operation: 'analyze',
      input: { tasks: ['task-1', 'task-2'] },
      output: { analysis: 'duplicate detected' },
      timestamp: new Date('2025-01-01T10:01:00Z'),
      tokensUsed: 100,
    },
  ],
  gitHistory: [],
};

const mockTasks: Task[] = [
  {
    uuid: 'task-1-uuid',
    title: 'Fix duplicate task issue',
    status: 'in_progress',
    priority: 'P1',
    labels: ['bug', 'duplicate'],
    created_at: new Date('2025-01-01T09:00:00Z'),
    updated_at: new Date('2025-01-01T10:00:00Z'),
    estimates: {
      complexity: 'medium',
      scale: 'medium',
      time_to_completion: '2h',
    },
  },
  {
    uuid: 'task-2-uuid',
    title: 'Update task validation',
    status: 'done',
    priority: 'P2',
    labels: ['enhancement'],
    created_at: new Date('2025-01-01T08:00:00Z'),
    updated_at: new Date('2025-01-01T10:30:00Z'),
    estimates: {
      complexity: 'low',
      scale: 'small',
      time_to_completion: '1h',
    },
  },
];

test('CommitMessageGenerator constructor with default options', (t) => {
  const generator = new CommitMessageGenerator();
  
  t.is(generator['options'].maxSubjectLength, 72);
  t.true(generator['options'].includeTaskIds);
  t.false(generator['options'].includeFilePaths);
  t.is(generator['options'].prefix, '');
});

test('CommitMessageGenerator constructor with custom options', (t) => {
  const generator = new CommitMessageGenerator({
    maxSubjectLength: 50,
    includeTaskIds: false,
    includeFilePaths: true,
    prefix: 'test',
  });
  
  t.is(generator['options'].maxSubjectLength, 50);
  t.false(generator['options'].includeTaskIds);
  t.true(generator['options'].includeFilePaths);
  t.is(generator['options'].prefix, 'test');
});

test('generatePreOperationMessage creates proper message', (t) => {
  const generator = new CommitMessageGenerator();
  const message = generator.generatePreOperationMessage(mockScarContext);
  
  t.true(message.includes('Start healing: Fix duplicate task issue'));
  t.true(message.includes('Healing operation initiated: Fix duplicate task issue'));
  t.true(message.includes('Found 2 relevant tasks:'));
  t.true(message.includes('Previous healing operations: 1'));
  t.true(message.includes('Tag: heal-2025-01-01-10-00-00'));
  t.true(message.includes('Narrative: Fixed duplicate task creation bug'));
});

test('generatePostOperationMessage creates proper message', (t) => {
  const generator = new CommitMessageGenerator();
  const message = generator.generatePostOperationMessage(mockScarContext, mockTasks);
  
  t.true(message.includes('Complete healing: Fix duplicate task issue'));
  t.true(message.includes('Healing operation completed: Fix duplicate task issue'));
  t.true(message.includes('Modified tasks (2):'));
  t.true(message.includes('LLM operations performed: 1'));
  t.true(message.includes('Total tokens used: 100'));
  t.true(message.includes('Event log entries: 1'));
});

test('generateTasksDirectoryMessage with created tasks', (t) => {
  const generator = new CommitMessageGenerator();
  const taskDiffs = [
    {
      task: mockTasks[0],
      changeType: 'created' as const,
      changedFields: ['title', 'status'],
    },
  ];
  
  const message = generator.generateTasksDirectoryMessage(taskDiffs);
  
  t.true(message.includes('Add 1 task'));
  t.true(message.includes('created (1):'));
  t.true(message.includes('- Fix duplicate task issue'));
  t.true(message.includes('Changed: title, status'));
});

test('generateTasksDirectoryMessage with mixed changes', (t) => {
  const generator = new CommitMessageGenerator();
  const taskDiffs = [
    {
      task: mockTasks[0],
      changeType: 'created' as const,
    },
    {
      task: mockTasks[1],
      changeType: 'modified' as const,
      changedFields: ['status'],
    },
    {
      task: { ...mockTasks[0], uuid: 'task-3-uuid', title: 'Deleted task' },
      changeType: 'deleted' as const,
    },
  ];
  
  const message = generator.generateTasksDirectoryMessage(taskDiffs);
  
  t.true(message.includes('Update tasks: 1 added, 1 modified, 1 removed'));
  t.true(message.includes('created (1):'));
  t.true(message.includes('modified (1):'));
  t.true(message.includes('deleted (1):'));
});

test('generateKanbanBoardMessage creates proper message', (t) => {
  const generator = new CommitMessageGenerator();
  const message = generator.generateKanbanBoardMessage('Fix duplicate task issue', mockTasks);
  
  t.true(message.includes('Update kanban board: Fix duplicate task issue'));
  t.true(message.includes('Board updates affecting 2 tasks:'));
  t.true(message.includes('in_progress (1):'));
  t.true(message.includes('done (1):'));
  t.true(message.includes('- Fix duplicate task issue'));
  t.true(message.includes('- Update task validation'));
});

test('generateKanbanBoardMessage with no modified tasks', (t) => {
  const generator = new CommitMessageGenerator();
  const message = generator.generateKanbanBoardMessage('No changes made', []);
  
  t.true(message.includes('Update kanban board: No changes made'));
  t.true(message.includes('No tasks were modified in this operation.'));
});

test('generateDependenciesMessage creates proper message', (t) => {
  const generator = new CommitMessageGenerator();
  const dependencies = ['lodash', 'express', 'typescript'];
  
  const installMessage = generator.generateDependenciesMessage(dependencies, 'install');
  t.true(installMessage.includes('Add 3 dependencies'));
  t.true(installMessage.includes('Installed dependencies:'));
  t.true(installMessage.includes('- lodash'));
  t.true(installMessage.includes('- express'));
  t.true(installMessage.includes('- typescript'));
  
  const removeMessage = generator.generateDependenciesMessage(dependencies, 'remove');
  t.true(removeMessage.includes('Remove 3 dependencies'));
  t.true(removeMessage.includes('Removed dependencies:'));
  
  const updateMessage = generator.generateDependenciesMessage(dependencies, 'update');
  t.true(updateMessage.includes('Update 3 dependencies'));
  t.true(updateMessage.includes('Updated dependencies:'));
});

test('generateFromTaskDiff creates proper message', (t) => {
  const generator = new CommitMessageGenerator({ includeTaskIds: true });
  const taskDiff = {
    task: mockTasks[0],
    changeType: 'modified' as const,
    changedFields: ['status', 'updated_at'],
    diff: '--- a/task.md\n+++ b/task.md\n@@ -1,3 +1,3 @@\n status: todo\n-status: todo\n+status: in_progress',
  };
  
  const message = generator.generateFromTaskDiff(taskDiff);
  
  t.true(message.includes('Update task: Fix duplicate task issue (task-1-uu)'));
  t.true(message.includes('Task: Fix duplicate task issue'));
  t.true(message.includes('Status: in_progress'));
  t.true(message.includes('Change type: modified'));
  t.true(message.includes('Changed fields: status, updated_at'));
});

test('generateFromTaskDiff without task IDs', (t) => {
  const generator = new CommitMessageGenerator({ includeTaskIds: false });
  const taskDiff = {
    task: mockTasks[0],
    changeType: 'created' as const,
  };
  
  const message = generator.generateFromTaskDiff(taskDiff);
  
  t.true(message.includes('Add task: Fix duplicate task issue'));
  t.false(message.includes('task-1-uu'));
});

test('generateScarNarrative creates proper message', (t) => {
  const generator = new CommitMessageGenerator();
  const scar = {
    tag: 'heal-2025-01-01-10-00-00',
    story: 'Fixed duplicate task creation bug',
    timestamp: new Date('2025-01-01T10:00:00Z'),
  };
  
  const message = generator.generateScarNarrative(scar);
  
  t.true(message.includes('Record scar: heal-2025-01-01-10-00-00'));
  t.true(message.includes('Scar tag: heal-2025-01-01-10-00-00'));
  t.true(message.includes('Created: 2025-01-01T10:00:00.000Z'));
  t.true(message.includes('Story:'));
  t.true(message.includes('Fixed duplicate task creation bug'));
});

test('validateMessage with valid message', (t) => {
  const generator = new CommitMessageGenerator();
  const validMessage = 'Fix the bug\n\nThis is a detailed description\nof what was fixed.';
  
  const result = generator.validateMessage(validMessage);
  
  t.true(result.valid);
  t.is(result.errors.length, 0);
});

test('validateMessage with invalid message', (t) => {
  const generator = new CommitMessageGenerator({ maxSubjectLength: 20 });
  const invalidMessage = 'this is a very long subject line that exceeds the limit.\nNo empty line before body';
  
  const result = generator.validateMessage(invalidMessage);
  
  t.false(result.valid);
  t.true(result.errors.length > 0);
  t.true(result.errors.some(error => error.includes('Subject line exceeds')));
  t.true(result.errors.some(error => error.includes('Empty line required')));
});

test('validateMessage detects subject ending with period', (t) => {
  const generator = new CommitMessageGenerator();
  const messageWithPeriod = 'Fix the bug.\n\nDescription.';
  
  const result = generator.validateMessage(messageWithPeriod);
  
  t.false(result.valid);
  t.true(result.errors.some(error => error.includes('should not end with a period')));
});

test('validateMessage detects uncapitalized subject', (t) => {
  const generator = new CommitMessageGenerator();
  const uncapitalizedMessage = 'fix the bug\n\nDescription.';
  
  const result = generator.validateMessage(uncapitalizedMessage);
  
  t.false(result.valid);
  t.true(result.errors.some(error => error.includes('should start with a capital letter')));
});

test('subject line truncation works correctly', (t) => {
  const generator = new CommitMessageGenerator({ maxSubjectLength: 30 });
  const longSubject = 'This is a very long subject line that should be truncated';
  
  const message = generator.generatePreOperationMessage({
    ...mockScarContext,
    reason: longSubject,
  });
  
  const lines = message.split('\n');
  const subject = lines[0];
  
  t.true(subject.length <= 33); // 30 + '...'
  t.true(subject.endsWith('...'));
});

test('prefix is added to subject lines', (t) => {
  const generator = new CommitMessageGenerator({ prefix: 'heal' });
  const message = generator.generatePreOperationMessage(mockScarContext);
  
  const lines = message.split('\n');
  const subject = lines[0];
  
  t.true(subject.startsWith('heal '));
});

test('createCommitMessageGenerator factory function', (t) => {
  const generator = CommitMessageGenerator.createCommitMessageGenerator({
    maxSubjectLength: 50,
    prefix: 'test',
  });
  
  t.true(generator instanceof CommitMessageGenerator);
  t.is(generator['options'].maxSubjectLength, 50);
  t.is(generator['options'].prefix, 'test');
});