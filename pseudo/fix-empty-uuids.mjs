#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const tasksDir = 'docs/agile/tasks';
const files = readdirSync(tasksDir).filter((f) => f.endsWith('.md'));

console.log('🔧 Fixing files with empty or malformed UUIDs...\n');

let fixedCount = 0;

files.forEach((file) => {
  const filePath = path.join(tasksDir, file);
  const content = readFileSync(filePath, 'utf8');

  // Check for empty UUID or UUID that contains title text
  const uuidMatch = content.match(/^uuid:\s*(.+)$/m);
  if (uuidMatch) {
    const uuid = uuidMatch[1].trim();

    // Check if UUID is empty or contains non-UUID text
    if (
      !uuid ||
      uuid.includes('title:') ||
      uuid.includes('Fix') ||
      uuid.includes('Create') ||
      uuid.includes('Implement') ||
      !uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    ) {
      const newUuid = randomUUID();
      const newContent = content.replace(/^uuid:\s*.+$/m, `uuid: ${newUuid}`);

      writeFileSync(filePath, newContent);
      console.log(`✅ Fixed ${file}: '${uuid}' → ${newUuid}`);
      fixedCount++;
    }
  }
});

console.log(`\n🎯 Fixed ${fixedCount} files with empty or malformed UUIDs`);
