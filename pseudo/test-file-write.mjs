import fs from 'fs';

async function testFileWrite() {
  try {
    const testContent = `---
uuid: test-123
title: Test Task
status: incoming
---

Test content`;

    await fs.promises.writeFile('/tmp/test-kanban-task.md', testContent, 'utf8');
    console.log('✅ File write completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ File write failed:', error.message);
    process.exit(1);
  }
}

testFileWrite();
