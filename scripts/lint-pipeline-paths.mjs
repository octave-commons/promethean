#!/usr/bin/env node

/**
 * Pipeline Path Linter
 *
 * Prevents absolute paths from being introduced into pipeline configurations.
 * This ensures pipelines remain portable across different workspaces.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const PIPELINE_FILE = resolve(process.cwd(), process.env.PIPELINE_FILE || 'pipelines.json');

// Patterns that indicate absolute paths
const ABSOLUTE_PATH_PATTERNS = [
  /"\/[^\/]/, // Unix absolute paths starting with "/ inside JSON strings
  /[a-zA-Z]:\\/, // Windows absolute paths containing C:\
];

// Allowed absolute patterns (environment variables, templates)
const ALLOWED_PATTERNS = [
  /\$\{[^}]+\}/, // Environment variables like ${OLLAMA_URL}
  /^https?:\/\//, // URLs
  /^git@/, // Git SSH URLs
  /^#/, // Comments or anchors
];

function checkForAbsolutePaths(content, filePath) {
  const lines = content.split('\n');
  const violations = [];

  lines.forEach((line, index) => {
    // Skip lines that are just JSON structure (brackets, braces, commas)
    const trimmed = line.trim();
    if (!trimmed || /^[{}\[\],]*$/.test(trimmed)) {
      return;
    }

    // Check for absolute path patterns
    for (const pattern of ABSOLUTE_PATH_PATTERNS) {
      if (pattern.test(line)) {
        // Check if this line contains an allowed pattern
        const isAllowed = ALLOWED_PATTERNS.some((allowed) => allowed.test(line));

        if (!isAllowed) {
          violations.push({
            line: index + 1,
            content: line.trim(),
            issue: 'Absolute path detected',
          });
        }
      }
    }
  });

  return violations;
}

function main() {
  try {
    const content = readFileSync(PIPELINE_FILE, 'utf8');
    const violations = checkForAbsolutePaths(content, PIPELINE_FILE);

    if (violations.length > 0) {
      console.error('❌ Pipeline path validation failed!');
      console.error(`Found ${violations.length} absolute path(s) in ${PIPELINE_FILE}:`);
      console.error('');

      violations.forEach((v) => {
        console.error(`Line ${v.line}: ${v.issue}`);
        console.error(`  ${v.content}`);
        console.error('');
      });

      console.error('💡 Fix: Replace absolute paths with relative paths from repo root');
      console.error('   Example: /home/user/project/packages → packages');
      console.error('   Example: /home/user/project/.cache → .cache');

      process.exit(1);
    }

    console.log('✅ Pipeline path validation passed - no absolute paths found');
  } catch (error) {
    console.error('❌ Error reading pipeline file:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { checkForAbsolutePaths };
