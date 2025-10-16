#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tasksDir = path.join(__dirname, 'docs/agile/tasks');

// Function to clean up repeated tags in titles
function cleanTitle(title) {
  return title
    .replace(/(\s+-[a-zA-Z0-9-]+){2,}/g, (match) => {
      // Extract unique tags from the repeated pattern
      const tags = match.match(/-\s*[a-zA-Z0-9-]+/g) || [];
      const uniqueTags = [...new Set(tags.map((tag) => tag.trim()))];
      return uniqueTags.length > 0 ? ' ' + uniqueTags.join(' ') : '';
    })
    .trim();
}

// Function to clean up slug
function cleanSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function cleanTaskFiles() {
  try {
    const files = await fs.readdir(tasksDir);
    const markdownFiles = files.filter((file) => file.endsWith('.md'));

    console.log(`Found ${markdownFiles.length} task files to check...`);

    let cleanedCount = 0;

    for (const file of markdownFiles) {
      const filePath = path.join(tasksDir, file);
      const content = await fs.readFile(filePath, 'utf8');

      // Extract frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) continue;

      let frontmatter = frontmatterMatch[1];
      let hasChanges = false;

      // Clean up title
      const titleMatch = frontmatter.match(/title:\s*"([^"]+)"/);
      if (titleMatch) {
        const originalTitle = titleMatch[1];
        const cleanedTitle = cleanTitle(originalTitle);

        if (cleanedTitle !== originalTitle) {
          frontmatter = frontmatter.replace(/title:\s*"[^"]+"/, `title: "${cleanedTitle}"`);
          hasChanges = true;

          // Also update slug if it exists
          const cleanedSlug = cleanSlug(cleanedTitle);
          const slugMatch = frontmatter.match(/slug:\s*"([^"]+)"/);
          if (slugMatch) {
            frontmatter = frontmatter.replace(/slug:\s*"[^"]+"/, `slug: "${cleanedSlug}"`);
          } else {
            // Add slug if it doesn't exist
            frontmatter += `\nslug: "${cleanedSlug}"`;
          }
        }
      }

      if (hasChanges) {
        const newContent = content.replace(/^---\n[\s\S]*?\n---/, `---\n${frontmatter}\n---`);

        await fs.writeFile(filePath, newContent, 'utf8');
        cleanedCount++;

        // Rename file if slug changed
        const newSlugMatch = frontmatter.match(/slug:\s*"([^"]+)"/);
        if (newSlugMatch) {
          const newSlug = newSlugMatch[1];
          const newFileName = `${newSlug}.md`;
          if (newFileName !== file) {
            const newFilePath = path.join(tasksDir, newFileName);
            await fs.rename(filePath, newFilePath);
            console.log(`Renamed: ${file} -> ${newFileName}`);
          }
        }
      }
    }

    console.log(`Cleaned up ${cleanedCount} task files`);
  } catch (error) {
    console.error('Error cleaning task files:', error);
    process.exit(1);
  }
}

cleanTaskFiles();
