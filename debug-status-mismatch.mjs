#!/usr/bin/env node

import { readFileSync, readdirSync } from 'fs';
import path from 'path';

const tasksDir = 'docs/agile/tasks';
const files = readdirSync(tasksDir).filter((f) => f.endsWith('.md'));

console.log('🔍 Analyzing status mismatches between board and task files...\n');

// Read board and extract task status by UUID
const boardPath = 'docs/agile/boards/generated.md';
const boardContent = readFileSync(boardPath, 'utf8');

// Extract all tasks with their UUIDs and column (status)
const boardTasks = new Map();
const lines = boardContent.split('\n');
let currentColumn = '';

for (const line of lines) {
  // Check if this is a column header
  const columnMatch = line.match(/^## (.+)$/);
  if (columnMatch) {
    currentColumn = columnMatch[1].trim();
    continue;
  }

  // Check if this is a task line
  const taskMatch = line.match(/\[ \] \[\[.*?\|.*?\]\].*?\(uuid:([^)]+)\)/);
  if (taskMatch && currentColumn) {
    const uuid = taskMatch[1].trim();
    boardTasks.set(uuid, currentColumn);
  }
}

console.log(`Found ${boardTasks.size} tasks on board`);

// Compare with file statuses
let mismatches = 0;
let matches = 0;

files.forEach((file) => {
  const content = readFileSync(path.join(tasksDir, file), 'utf8');
  const uuidMatch = content.match(/uuid:\s*(.+)/);
  const statusMatch = content.match(/status:\s*(.+)/);

  if (uuidMatch && statusMatch) {
    const uuid = uuidMatch[1].trim().replace(/\"/g, '');
    const fileStatus = statusMatch[1].trim().replace(/\"/g, '');
    const boardStatus = boardTasks.get(uuid);

    if (boardStatus) {
      if (fileStatus !== boardStatus) {
        mismatches++;
        console.log(`❌ Mismatch: ${file}`);
        console.log(`   File status: '${fileStatus}'`);
        console.log(`   Board status: '${boardStatus}'`);
        console.log(`   UUID: ${uuid}`);
        console.log('');
      } else {
        matches++;
      }
    } else {
      console.log(`⚠️  Task ${uuid} not found on board`);
    }
  }
});

console.log(`\n📊 Summary:`);
console.log(`  Matches: ${matches}`);
console.log(`  Mismatches: ${mismatches}`);
console.log(`  Total files analyzed: ${files.length}`);
