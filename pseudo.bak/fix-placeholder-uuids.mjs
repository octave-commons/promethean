#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

const tasksDir = 'docs/agile/tasks';

console.log('🔧 Fixing placeholder UUIDs in task files...\n');

const files = readdirSync(tasksDir).filter((f) => f.endsWith('.md'));
let fixedCount = 0;

files.forEach((file) => {
  const filePath = join(tasksDir, file);
  const content = readFileSync(filePath, 'utf8');

  // Check for placeholder UUIDs
  const uuidMatch = content.match(/uuid:\s*(.+)/);
  if (uuidMatch) {
    const uuid = uuidMatch[1].trim();

    // Check if it's a placeholder
    if (
      uuid.includes('((uuidgen))') ||
      uuid.includes('$(uuidgen)') ||
      uuid === '(uuidgen)' ||
      uuid.includes('uuidgen')
    ) {
      const newUuid = randomUUID();
      const newContent = content.replace(/uuid:\s*.+/, `uuid: ${newUuid}`);

      writeFileSync(filePath, newContent);
      console.log(`✅ Fixed ${file}: ${uuid} → ${newUuid}`);
      fixedCount++;
    }
  }
});

console.log(`\n🎯 Fixed ${fixedCount} files with placeholder UUIDs`);
