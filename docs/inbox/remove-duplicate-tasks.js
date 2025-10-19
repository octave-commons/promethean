#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tasksDir = path.join(__dirname, 'docs/agile/tasks');

// Function to extract base title from filename
function getBaseTitle(filename) {
  return filename
    .replace(/ \d+\.md$/, '') // Remove trailing numbers
    .replace(/\.md$/, '') // Remove extension
    .toLowerCase();
}

async function removeDuplicateTasks() {
  try {
    const files = await fs.readdir(tasksDir);
    const markdownFiles = files.filter((file) => file.endsWith('.md'));

    console.log(`Found ${markdownFiles.length} task files to check for duplicates...`);

    // Group files by base title
    const titleGroups = {};

    for (const file of markdownFiles) {
      const baseTitle = getBaseTitle(file);
      if (!titleGroups[baseTitle]) {
        titleGroups[baseTitle] = [];
      }
      titleGroups[baseTitle].push(file);
    }

    // Find groups with duplicates
    const duplicateGroups = Object.entries(titleGroups).filter(([_, files]) => files.length > 1);

    console.log(`Found ${duplicateGroups.length} groups with duplicates...`);

    let deletedCount = 0;

    for (const [baseTitle, files] of duplicateGroups) {
      console.log(`\nProcessing duplicates for: ${baseTitle}`);
      console.log(`Files: ${files.join(', ')}`);

      // Sort files to keep the one without number suffix (original) and delete numbered ones
      const originalFile = files.find((f) => !f.match(/ \d+\.md$/));
      const duplicateFiles = files.filter((f) => f.match(/ \d+\.md$/));

      if (originalFile && duplicateFiles.length > 0) {
        console.log(`Keeping: ${originalFile}`);
        console.log(`Deleting duplicates: ${duplicateFiles.join(', ')}`);

        for (const duplicate of duplicateFiles) {
          const duplicatePath = path.join(tasksDir, duplicate);
          await fs.unlink(duplicatePath);
          deletedCount++;
        }
      } else if (!originalFile && duplicateFiles.length > 1) {
        // If no original, keep the first one and delete the rest
        const [keepFile, ...deleteFiles] = duplicateFiles.sort();
        console.log(`Keeping: ${keepFile}`);
        console.log(`Deleting duplicates: ${deleteFiles.join(', ')}`);

        for (const deleteFile of deleteFiles) {
          const deletePath = path.join(tasksDir, deleteFile);
          await fs.unlink(deletePath);
          deletedCount++;
        }
      }
    }

    console.log(`\nDeleted ${deletedCount} duplicate task files`);

    // Count remaining files
    const remainingFiles = (await fs.readdir(tasksDir)).filter((file) => file.endsWith('.md'));
    console.log(`Remaining task files: ${remainingFiles.length}`);
  } catch (error) {
    console.error('Error removing duplicate tasks:', error);
    process.exit(1);
  }
}

removeDuplicateTasks();
