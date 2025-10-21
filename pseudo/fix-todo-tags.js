#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Status-related patterns to look for in task content
const statusPatterns = {
  'done': [/#done\b/gi, /✅/gi, /completed/gi],
  'rejected': [/#rejected\b/gi, /❌/gi, /blocked/gi],
  'icebox': [/#icebox\b/gi, /#ice-box\b/gi],
  'incoming': [/#incoming\b/gi],
  'in-progress': [/#in-progress\b/gi, /#in_progress\b/gi, /InProgress/gi, /🔄/gi],
  'testing': [/#testing\b/gi, /tests?\b/gi],
  'document': [/#document\b/gi, /documentation/gi],
  'review': [/#review\b/gi, /under review/gi]
};

// Function to get all todo tasks with their UUIDs
async function getTodoTasks() {
  try {
    const { execSync } = await import('child_process');
    const output = execSync('pnpm kanban getByColumn todo', { encoding: 'utf8' });

    // Parse NDJSON (one JSON object per line)
    const lines = output.trim().split('\n');
    const tasks = [];

    for (const line of lines) {
      if (line.trim()) {
        try {
          tasks.push(JSON.parse(line));
        } catch (e) {
          console.error('Error parsing line:', line);
        }
      }
    }

    return tasks;
  } catch (error) {
    console.error('Error getting todo tasks:', error.message);
    return [];
  }
}

// Function to find task file by UUID
function findTaskFileByUUID(uuid) {
  const tasksDir = path.join(__dirname, 'docs', 'agile', 'tasks');

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        const result = scanDirectory(filePath);
        if (result) return result;
      } else if (file.endsWith('.md')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.includes(`uuid: ${uuid}`)) {
            return filePath;
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }
    return null;
  }

  return scanDirectory(tasksDir);
}

// Function to check task content for status indicators
function detectStatusFromContent(content) {
  for (const [status, patterns] of Object.entries(statusPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        return status;
      }
    }
  }
  return null;
}

// Function to update task status
function updateTaskStatus(filePath, newStatus) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Replace status in front matter
    const updatedContent = content.replace(
      /^(status:\s*)(.+)$/m,
      `$1${newStatus}`
    );

    fs.writeFileSync(filePath, updatedContent, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Function to get task title from file
function getTaskTitle(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (!frontMatterMatch) return null;

    const frontMatter = frontMatterMatch[1];
    const titleMatch = frontMatter.match(/^title:\s*(.+)$/m);

    return titleMatch ? titleMatch[1].trim() : null;
  } catch (error) {
    return null;
  }
}

// Main execution
async function main() {
  console.log('Analyzing todo tasks for status indicators in content...\n');

  const todoTasks = await getTodoTasks();
  const tasksToMove = [];

  for (const task of todoTasks) {
    const taskFile = findTaskFileByUUID(task.uuid);

    if (taskFile) {
      try {
        const content = fs.readFileSync(taskFile, 'utf8');
        const detectedStatus = detectStatusFromContent(content);

        if (detectedStatus && detectedStatus !== 'todo') {
          const title = getTaskTitle(taskFile) || task.title || task.slug;
          tasksToMove.push({
            uuid: task.uuid,
            title: title,
            currentStatus: 'todo',
            detectedStatus: detectedStatus,
            file: taskFile
          });
        }
      } catch (error) {
        console.error(`Error reading task file for ${task.uuid}:`, error.message);
      }
    } else {
      console.log(`Warning: Could not find file for task ${task.uuid}`);
    }
  }

if (tasksToMove.length === 0) {
    console.log('No tasks found with conflicting status indicators in todo column.');
  } else {
    console.log(`Found ${tasksToMove.length} tasks that should be moved from todo:\n`);

    // Group by detected status
    const groupedTasks = {};
    for (const task of tasksToMove) {
      if (!groupedTasks[task.detectedStatus]) {
        groupedTasks[task.detectedStatus] = [];
      }
      groupedTasks[task.detectedStatus].push(task);
    }

    let totalMoved = 0;

    for (const [status, tasks] of Object.entries(groupedTasks)) {
      console.log(`\n=== Moving ${tasks.length} tasks to '${status}' ===`);

      for (const task of tasks) {
        console.log(`- ${task.title}`);

        if (updateTaskStatus(task.file, status)) {
          console.log(`  ✅ Moved from todo to ${status}`);
          totalMoved++;
        } else {
          console.log(`  ❌ Failed to move`);
        }
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Total tasks moved: ${totalMoved}`);
    console.log(`Todo column reduced from ${todoTasks.length} to ${todoTasks.length - totalMoved}`);
  }
}

// Run the main function
main().catch(console.error);