#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

const TASKS_DIR = 'docs/agile/tasks';

// Find all files with repeated text patterns in titles
async function findCorruptedFiles() {
  const files = await fs.readdir(TASKS_DIR);
  const corrupted = [];

  for (const file of files) {
    if (!file.endsWith('.md')) continue;

    const filePath = path.join(TASKS_DIR, file);
    const content = await fs.readFile(filePath, 'utf8');

    // Check for repeated patterns in title (4+ repetitions)
    const titleMatch = content.match(/^title:\s*"(.*)"$/m);
    if (titleMatch) {
      const title = titleMatch[1];
      // Look for obvious duplication patterns
      const hasDuplication =
        title.includes('    -') ||
        title.includes('    control') ||
        title.includes('    session') ||
        title.length > 200; // Unusually long title
      if (hasDuplication) {
        corrupted.push({ file, title, filePath });
      }
    }
  }

  return corrupted;
}

// Clean up corrupted titles by removing repetitions
async function cleanCorruptedFile(filePath, originalTitle) {
  const content = await fs.readFile(filePath, 'utf8');

  // Extract the base title by removing repeated parts
  // Find the first occurrence of a pattern and keep only that
  const words = originalTitle.split(/\s+/);
  const cleanedWords = [];
  const seen = new Set();

  for (const word of words) {
    const key = word.toLowerCase();
    if (!seen.has(key)) {
      cleanedWords.push(word);
      seen.add(key);
      // Stop adding if we see patterns that suggest duplication
      if (cleanedWords.length > 10) break; // Reasonable title length limit
    }
  }

  const cleanedTitle = cleanedWords.join(' ').replace(/\s+$/, '');

  // Replace the corrupted title with cleaned one
  const cleanedContent = content.replace(/^title:\s*".*"$/m, `title: "${cleanedTitle}"`);

  // Also clean up excessive empty lines at the end
  const finalContent = cleanedContent.replace(/\n{10,}$/, '\n');

  await fs.writeFile(filePath, finalContent, 'utf8');
  return cleanedTitle;
}

async function main() {
  console.log('Finding corrupted task files...');
  const corrupted = await findCorruptedFiles();

  console.log(`Found ${corrupted.length} corrupted files:`);
  for (const { file, title } of corrupted) {
    console.log(`  ${file}: ${title.substring(0, 100)}...`);
  }

  if (corrupted.length === 0) {
    console.log('No corrupted files found.');
    return;
  }

  console.log('\nCleaning corrupted files...');
  for (const { file, title, filePath } of corrupted) {
    const cleanedTitle = await cleanCorruptedFile(filePath, title);
    console.log(`  ${file}: "${title.substring(0, 50)}..." -> "${cleanedTitle}"`);
  }

  console.log(`\nCleaned ${corrupted.length} files.`);
}

main().catch(console.error);
