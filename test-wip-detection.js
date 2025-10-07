#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync } from 'fs';

const execAsync = promisify(exec);

async function testWIPDetection() {
  console.log('Testing WIP detection...');

  const violations = [];
  const columnsToCheck = ['todo', 'in_progress', 'review', 'blocked', 'done', 'backlog', 'icebox'];

  for (const columnName of columnsToCheck) {
    try {
      const { stdout } = await execAsync(`pnpm kanban getColumn ${columnName}`);
      const columnData = JSON.parse(stdout);

      console.log(`${columnData.name}: ${columnData.count} tasks (limit: ${columnData.limit || 'none'})`);

      if (columnData.limit && columnData.count > columnData.limit) {
        violations.push({
          columnName: columnData.name,
          currentCount: columnData.count,
          limit: columnData.limit,
          overLimit: columnData.count - columnData.limit
        });
        console.log(`  🚨 VIOLATION: ${columnData.count}/${columnData.limit} (${columnData.count - columnData.limit} over limit)`);
      }
    } catch (error) {
      console.log(`❌ Could not check ${columnName}: ${error.message}`);
    }
  }

  console.log(`\n📊 Summary: Found ${violations.length} WIP violations`);

  if (violations.length > 0) {
    const report = [
      '# WIP Violation Report',
      '',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      '## Summary',
      '',
      `**Total Violations:** ${violations.length}`,
      '',
      '## Violations Detected',
      '',
      ...violations.map(v => [
        `### ${v.columnName}`,
        '',
        `- **Current Count:** ${v.currentCount}`,
        `- **WIP Limit:** ${v.limit}`,
        `- **Over Limit:** ${v.overLimit}`,
        '',
        `**Status:** 🚨 Critical WIP Limit Violation`,
        ''
      ].join('\n')),
      '',
      '## Manual Resolution Steps',
      '',
      '1. Review tasks in violating columns',
      '2. Move completed tasks to "done"',
      '3. Move blocked tasks to "blocked"',
      '4. Move unclear tasks to "backlog" or "icebox"',
      '5. Prioritize remaining tasks within WIP limits',
      ''
    ].join('\n');

    writeFileSync('docs/agile/reports/wip-violations-manual.md', report);
    console.log('📄 Report written to docs/agile/reports/wip-violations-manual.md');
  }

  return violations;
}

testWIPDetection().catch(console.error);