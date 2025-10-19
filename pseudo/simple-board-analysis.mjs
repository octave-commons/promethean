#!/usr/bin/env node

import { readFileSync, readdirSync } from 'fs';
import path from 'path';

const tasksDir = 'docs/agile/tasks';
const files = readdirSync(tasksDir).filter((f) => f.endsWith('.md'));

console.log('🔍 Simple board vs files analysis...\n');

// Read board and extract all UUIDs
const boardPath = 'docs/agile/boards/generated.md';
const boardContent = readFileSync(boardPath, 'utf8');

const boardUuids = new Set();
const boardLines = boardContent.split('\n');

for (const line of boardLines) {
  const match = line.match(/\(uuid:([^)]+)\)/);
  if (match) {
    boardUuids.add(match[1].trim());
  }
}

console.log(`Board has ${boardUuids.size} tasks`);

// Get all file UUIDs
const fileUuids = new Set();
const missingUuids = [];

files.forEach((file) => {
  const content = readFileSync(path.join(tasksDir, file), 'utf8');
  const uuidMatch = content.match(/^uuid:\s*(.+)$/m);

  if (uuidMatch) {
    const uuid = uuidMatch[1].trim().replace(/\"/g, '');
    if (uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      fileUuids.add(uuid);
      if (!boardUuids.has(uuid)) {
        missingUuids.push({ file, uuid });
      }
    }
  }
});

console.log(`Files have ${fileUuids.size} valid UUIDs`);
console.log(`Missing from board: ${missingUuids.length}`);

// Show some missing tasks
if (missingUuids.length > 0) {
  console.log('\nFirst 10 missing tasks:');
  missingUuids.slice(0, 10).forEach(({ file, uuid }) => {
    console.log(`  ${file}: ${uuid}`);
  });
}

// Check overlap
const overlap = new Set([...boardUuids].filter((uuid) => fileUuids.has(uuid)));
console.log(`\nOverlap: ${overlap.size} tasks`);
console.log(`Board only: ${boardUuids.size - overlap.size}`);
console.log(`Files only: ${fileUuids.size - overlap.size}`);
