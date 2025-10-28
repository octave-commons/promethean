import test from 'ava';

import {
  TaskAIManager,
} from '../lib/task-content/ai.js';

const manager = new TaskAIManager({
  model: 'qwen3:test',
  timeout: 1000,
});

test('TaskAIManager.analyzeTask returns structured analysis', async (t) => {
  const result = await manager.analyzeTask({
    uuid: 'demo-task',
    analysisType: 'quality',
  });

  t.true(result.success);
  t.is(result.taskUuid, 'demo-task');
  t.truthy(result.analysis.suggestions.length);
  t.true(typeof result.metadata.processingTime === 'number');
});

test('TaskAIManager.rewriteTask honours dry-run option', async (t) => {
  const result = await manager.rewriteTask({
    uuid: 'demo-task',
    rewriteType: 'improve',
    options: { dryRun: true },
  });

  t.true(result.success);
  t.true(result.rewrittenContent.length > 0);
  t.true(result.changes.additions.length > 0);
  t.true(result.metadata.processingTime >= 0);
});

test('TaskAIManager.breakdownTask produces subtasks', async (t) => {
  const result = await manager.breakdownTask({
    uuid: 'demo-task',
    breakdownType: 'subtasks',
    complexity: 'medium',
  });

  t.true(result.success);
  t.true(result.subtasks.length > 0);
  t.truthy(result.subtasks[0]?.title);
});
