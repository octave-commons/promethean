import { createP0SecurityValidator } from './dist/lib/validation/p0-security-validator.js';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

async function debugP0() {
  const tasksDir = join(process.cwd(), 'debug-tasks');
  const tempDir = process.cwd();

  await mkdir(tasksDir, { recursive: true });

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

  // Let's check what file would be read
  const content = await readFile(taskFilePath, 'utf8');

  console.log('Task file path:', taskFilePath);
  console.log('Task content:', content);
  const indicators = [
    { name: 'implementation plan', regex: /implementation plan/i },
    { name: 'implementation details', regex: /implementation details/i },
    { name: 'technical approach', regex: /technical approach/i },
    { name: 'solution design', regex: /solution design/i },
    { name: '## implementation', regex: /## implementation/i },
    { name: '### implementation', regex: /### implementation/i },
    { name: '## technical', regex: /## technical/i },
    { name: '### technical', regex: /### technical/i },
    { name: '## approach', regex: /## approach/i },
    { name: '### approach', regex: /### approach/i },
  ];

  console.log('Implementation plan indicator matches:');
  indicators.forEach(({ name, regex }) => {
    const matches = regex.test(content);
    if (matches) {
      console.log(`  ✓ ${name}`);
    }
  });

  const hasAny = indicators.some(({ regex }) => regex.test(content));
  console.log('Has implementation plan indicators?', hasAny);

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
