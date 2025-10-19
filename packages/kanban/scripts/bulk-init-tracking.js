#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tasksDir = path.join(__dirname, '../../../docs/agile/tasks');

console.log('🚀 Fast bulk commit tracking initialization...');

// Get current git hash
const currentSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();

// Process all task files in bulk
const files = fs.readdirSync(tasksDir).filter((f) => f.endsWith('.md'));
let updatedCount = 0;

files.forEach((file) => {
  const filePath = path.join(tasksDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Check if needs commit tracking
  if (!content.includes('lastCommitSha:') && !content.includes('commitHistory:')) {
    // Add commit tracking fields to frontmatter
    const updated = content.replace(/^(---\n.*?\n---)/ms, (frontmatter) => {
      if (frontmatter.includes('lastCommitSha:')) return frontmatter;

      // Insert before the closing ---
      return frontmatter.replace(
        /---$/,
        `lastCommitSha: "${currentSha}"\ncommitHistory: \n  - sha: "${currentSha}"\n    timestamp: "${new Date().toISOString()}"\n    action: "Bulk commit tracking initialization"\n---`,
      );
    });

    fs.writeFileSync(filePath, updated);
    updatedCount++;
  }
});

console.log(`✅ Updated ${updatedCount} task files with commit tracking`);

// Single bulk commit
if (updatedCount > 0) {
  execSync('git add docs/agile/tasks/*.md', { stdio: 'inherit' });
  execSync(
    `git commit -m "Bulk initialize commit tracking for ${updatedCount} kanban tasks

- Add lastCommitSha and commitHistory fields
- Eliminate orphaned task false positives  
- Improve kanban auditability"`,
    { stdio: 'inherit' },
  );
  console.log('✅ Committed all changes in single bulk operation');
} else {
  console.log('ℹ️  No tasks needed updating');
}
