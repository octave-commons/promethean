#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

// Test if we can reproduce the duplication issue
async function testDuplication() {
  const testFile = 'docs/agile/tasks/test-duplication.md';

  // Create a test task
  const content = `---
uuid: "test-123"
title: "Test task for duplication"
slug: "test-duplication"
status: "incoming"
priority: "P2"
labels: ["test"]
created_at: "2025-10-11T19:00:00.000Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---

# Test task

This is a test to see if duplication occurs.
`;

  await fs.writeFile(testFile, content, 'utf8');
  console.log('Created test task');

  // Now run kanban operations that might cause duplication
  const { spawn } = await import('child_process');

  for (let i = 0; i < 5; i++) {
    console.log(`Running regeneration ${i + 1}...`);

    await new Promise((resolve, reject) => {
      const proc = spawn('node', ['packages/kanban/dist/cli.js', 'regenerate'], {
        stdio: 'inherit'
      });
      
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Process exited with code ${code}`));
      });
    });

      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Process exited with code ${code}`));
      });
    });

    // Check the test file for duplication
    const updatedContent = await fs.readFile(testFile, 'utf8');
    const titleMatch = updatedContent.match(/^title:\s*"(.*)"$/m);
    if (titleMatch) {
      const title = titleMatch[1];
      console.log(`Title after iteration ${i + 1}: "${title}"`);

      if (title.includes('  -') || title.length > 100) {
        console.log('DUPLICATION DETECTED!');
        break;
      }
    }
  }

  // Clean up
  await fs.unlink(testFile).catch(() => {});
  console.log('Test completed');
}

testDuplication().catch(console.error);
