import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import test from 'ava';
import esmock from 'esmock';

import { withTempDir } from '../test-utils/helpers.js';

test('malformed markdown tasks still participate in complexity estimates', async (t) => {
  const tempDir = await withTempDir(t);
  const tasksDir = path.join(tempDir, 'tasks');
  await mkdir(tasksDir, { recursive: true });

  const malformedTask = ['---', 'uuid: broken-task', 'title: "Broken Task', 'status: todo', '---', '', 'Body content'].join('\n');
  await writeFile(path.join(tasksDir, 'broken-task.md'), malformedTask, 'utf8');

  const stubResponse = {
    locImpact: 10,
    fileCount: 1,
    technicalComplexity: 2,
    researchComplexity: 2,
    testingComplexity: 2,
    integrationComplexity: 2,
    estimatedHours: 1,
    requiresHumanJudgment: false,
    hasClearAcceptanceCriteria: true,
    hasExternalDependencies: false,
    overallScore: 3,
    complexityLevel: 'simple' as const,
    suitableForLocalModel: true,
    recommendedModel: 'stub-model',
    reasoning: 'stub',
    breakdownSteps: ['do work'],
    estimatedTokens: 1000,
  };

  const modulePath = fileURLToPath(new URL('../lib/task-complexity.js', import.meta.url));
  const { estimateBatchComplexity } = await esmock<
    typeof import('../lib/task-complexity.js')
  >(modulePath, {
    '@promethean/utils': {
      createLogger: () => ({
        info() {},
        warn() {},
        error() {},
      }),
      ollamaJSON: async () => stubResponse,
    },
  });

  const estimates = await estimateBatchComplexity(tasksDir, {
    statusFilter: 'todo',
    model: 'stub-model',
    maxTasks: 5,
  });

  t.is(estimates.length, 1);
  const [estimate] = estimates;
  t.truthy(estimate);
  if (!estimate) {
    t.fail('Expected a complexity estimate to be returned for malformed task');
    return;
  }
  t.is(estimate.taskId, 'broken-task');
  t.is(estimate.taskTitle, 'Broken Task');
});
