#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const tasksDir = 'docs/agile/tasks';

function cleanTaskFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    let inFrontmatter = false;
    let cleanedLines = [];
    let skipNextLine = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim() === '---') {
        if (!inFrontmatter) {
          inFrontmatter = true;
          cleanedLines.push(line);
        } else {
          inFrontmatter = false;
          cleanedLines.push(line);
        }
        continue;
      }

      if (inFrontmatter) {
        // Remove problematic fields
        if (line.startsWith('lastCommitSha:')) {
          continue;
        }
        if (line.startsWith('commitHistory:')) {
          continue;
        }
        // Skip indented commit history entries
        if (
          line.trim().startsWith('- sha:') ||
          line.trim().startsWith('timestamp:') ||
          line.trim().startsWith('message:') ||
          line.trim().startsWith('author:') ||
          line.trim().startsWith('type:') ||
          line.trim().startsWith('sha:')
        ) {
          continue;
        }
        // Skip lines that look like escaped diff content
        if (
          line.includes('\\\\\\\\\\\\\\\\\\') ||
          line.includes('diff --git') ||
          line.includes('index ') ||
          line.includes('+++ b/') ||
          line.includes('--- a/')
        ) {
          continue;
        }
      }

      cleanedLines.push(line);
    }

    const cleanedContent = cleanedLines.join('\n');
    fs.writeFileSync(filePath, cleanedContent, 'utf8');
    console.log(`Cleaned: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error cleaning ${filePath}:`, error.message);
    return false;
  }
}

// Find and clean all task files
try {
  const files = fs.readdirSync(tasksDir);
  let cleanedCount = 0;

  files.forEach((file) => {
    if (file.endsWith('.md')) {
      const filePath = path.join(tasksDir, file);
      if (cleanTaskFile(filePath)) {
        cleanedCount++;
      }
    }
  });

  console.log(`\nCleaned ${cleanedCount} task files`);
} catch (error) {
  console.error('Error reading tasks directory:', error.message);
  process.exit(1);
}
