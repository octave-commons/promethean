#!/usr/bin/env node

/**
 * Script to update package READMEs from pnpm commands to nx commands
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { globSync } from 'glob';

const PACKAGES_DIR = 'packages';

// Command mappings
const COMMAND_MAPPINGS = {
  'pnpm --filter @promethean-os/([^\\s]+) build': 'nx build $1',
  'pnpm --filter @promethean-os/([^\\s]+) test': 'nx test $1',
  'pnpm --filter @promethean-os/([^\\s]+) lint': 'nx lint $1',
  'pnpm --filter @promethean-os/([^\\s]+) dev': 'nx $1 dev',
  'pnpm --filter @promethean-os/([^\\s]+) start': 'nx $1 start',
  'pnpm --filter @promethean-os/([^\\s]+) watch': 'nx watch $1',
  'pnpm --filter @promethean-os/([^\\s]+) exec': 'nx exec $1 --',
};

function updateReadme(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    let updatedContent = content;

    // Apply command mappings
    for (const [pattern, replacement] of Object.entries(COMMAND_MAPPINGS)) {
      const regex = new RegExp(pattern, 'g');
      updatedContent = updatedContent.replace(regex, replacement);
    }

    // Write back if changed
    if (updatedContent !== content) {
      writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  const readmeFiles = globSync(join(PACKAGES_DIR, '**/README.md'));
  
  console.log(`🔍 Found ${readmeFiles.length} README files to check...`);
  
  let updatedCount = 0;
  
  for (const readmeFile of readmeFiles) {
    if (updateReadme(readmeFile)) {
      updatedCount++;
    }
  }
  
  console.log(`\\n📊 Summary: Updated ${updatedCount} out of ${readmeFiles.length} README files`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} else {
  console.log('Run this script with: node scripts/update-package-readmes.mjs');
}