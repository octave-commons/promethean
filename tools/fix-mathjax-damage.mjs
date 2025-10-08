#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { execSync } from 'node:child_process';

/**
 * Script to fix collateral damage from KaTeX to MathJAX conversion
 *
 * This script fixes common patterns:
 * 1. Lone dollar signs around regular text: $text$ -> text
 * 2. Double dollar signs around code blocks: $$code$$ -> proper code blocks
 * 3. Stray dollar signs at start/end of lines
 */

function findAffectedFiles() {
  console.log('🔍 Finding affected markdown files...');

  // Use a simple approach with pnpm to find all markdown files
  try {
    const result = execSync('find docs -name "*.md" -type f', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const allMdFiles = result.trim().split('\n').filter(Boolean);
    const affectedFiles = [];

    for (const file of allMdFiles) {
      try {
        const content = readFileSync(file, 'utf8');
        if (content.includes('$')) {
          affectedFiles.push(file);
        }
      } catch (error) {
        // Skip files we can't read
      }
    }

    return affectedFiles;
  } catch (error) {
    console.log('⚠️ Could not find files with find, using fallback...');
    // Fallback to a simple list of common directories
    return [
      'docs/ci.md',
      'docs/duck/README.md',
      // Add more files as needed
    ];
  }
}

function fixMathJaxDamage(content) {
  let fixed = content;
  let changes = 0;

  // Pattern 1: Double dollar signs around code (standalone lines)
  // $$\ncode\n$$ -> ```\ncode\n```
  fixed = fixed.replace(/\$\$\s*\n([\s\S]*?)\n\s*\$\$/g, (match, code) => {
    changes++;
    return '```\n' + code.trim() + '\n```';
  });

  // Pattern 2: Double dollar signs around inline code
  // $$code$$ -> `code`
  fixed = fixed.replace(/\$\$([^$\n]+)\$\$/g, (match, code) => {
    changes++;
    return '`' + code.trim() + '`';
  });

  // Pattern 3: Single dollar signs around regular text (not math)
  // $text$ -> text (only if it looks like regular text, not math expressions)
  fixed = fixed.replace(/\$([a-zA-Z][a-zA-Z0-9\s\/\*\-\+,\.\(\)]*[a-zA-Z0-9])\$/g, (match, text) => {
    // Only replace if it doesn't look like a math expression
    // Math expressions usually contain operators, numbers, greek letters, etc.
    const isLikelyMath = /[+\-*/=<>^_\\{}]|\\[a-zA-Z]|\\frac|\\sqrt|\\sum|\\int|\\alpha|\\beta|\\gamma|\\delta|\\theta|\\lambda|\\mu|\\pi|\\sigma|\\phi|\\omega/.test(text);

    if (!isLikelyMath) {
      changes++;
      return text.trim();
    }
    return match;
  });

  // Pattern 4: Stray dollar signs at start of lines (common in lists/code examples)
  // $text -> text
  fixed = fixed.replace(/^\$([^\$\n]+)$/gm, (match, text) => {
    changes++;
    return text.trim();
  });

  // Pattern 5: Lone dollar signs at end of lines
  // text$ -> text
  fixed = fixed.replace(/([^\$\n])\$/gm, (match, text) => {
    changes++;
    return text;
  });

  return { content: fixed, changes };
}

function processFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const { content: fixedContent, changes } = fixMathJaxDamage(content);

    if (changes > 0) {
      writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`✅ Fixed ${changes} issues in ${filePath}`);
      return changes;
    }

    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

function main() {
  console.log('🔧 Starting MathJAX conversion damage fix...\n');

  const affectedFiles = findAffectedFiles();
  console.log(`📁 Found ${affectedFiles.length} files to check\n`);

  let totalChanges = 0;
  let processedFiles = 0;

  for (const file of affectedFiles) {
    const changes = processFile(file);
    totalChanges += changes;
    if (changes > 0) processedFiles++;
  }

  console.log(`\n✨ Complete! Fixed ${totalChanges} issues across ${processedFiles} files`);

  if (processedFiles === 0) {
    console.log('🎉 No issues found - all files look clean!');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}