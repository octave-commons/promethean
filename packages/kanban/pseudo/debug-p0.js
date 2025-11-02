import { createP0SecurityValidator } from './dist/lib/validation/p0-security-validator.js';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

async function debugP0() {
  const tasksDir = '/tmp/debug-p0';
  const tempDir = '/tmp/debug-p0';

  const task = {
    uuid: randomUUID(),
    title: 'Critical security fix without plan',
    status: 'incoming',
    priority: 'P0',
    labels: ['security'],
    created_at: new Date().toISOString(),
  };

  const taskFilePath = join(tasksDir, `${task.uuid}.md`);
  const basicContent = `---
uuid: ${task.uuid}
title: ${task.title}
status: ${task.status}
priority: ${task.priority}
labels: [${task.labels?.join(', ')}]
---

# ${task.title}

Basic description without implementation plan.
  `;

  await writeFile(taskFilePath, basicContent);

  const validator = createP0SecurityValidator({
    repoRoot: tempDir,
    tasksDir,
    skipGitChecks: true,
    skipFileChecks: false,
  });

  const result = await validator.validateStatusTransition(task, 'incoming', 'in_progress');

  console.log('Task:', task);
  console.log('Result:', result);
  console.log('Is P0 security task?', validator.isP0SecurityTask(task));
}

debugP0().catch(console.error);
