#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tasksDir = path.join(__dirname, 'docs/agile/tasks');

// Function to clean up repeated patterns in titles
function cleanRepeatedPatterns(title) {
  // Clean up repeated tag patterns like " -column -column -column"
  let cleaned = title.replace(/(\s+-[a-zA-Z0-9-]+){3,}/g, (match) => {
    const tags = match.match(/-\s*[a-zA-Z0-9-]+/g) || [];
    const uniqueTags = [...new Set(tags.map((tag) => tag.trim()))];
    return uniqueTags.length > 0 ? ' ' + uniqueTags.join(' ') : '';
  });

  // Clean up repeated patterns like " -1144 -1144 -1144"
  cleaned = cleaned.replace(/(\s+-\d+){3,}/g, (match) => {
    const numbers = match.match(/-\s*\d+/g) || [];
    const uniqueNumbers = [...new Set(numbers.map((num) => num.trim()))];
    return uniqueNumbers.length > 0 ? ' ' + uniqueNumbers.join(' ') : '';
  });

  // Clean up repeated " -system" patterns
  cleaned = cleaned.replace(/(\s+-system){3,}/g, ' -system');

  // Clean up repeated " -review -analysis -design" patterns
  cleaned = cleaned.replace(
    /(\s+-review\s+-analysis\s+-design){2,}/g,
    ' -review -analysis -design',
  );

  // Clean up repeated " -os -specifications -integration" patterns
  cleaned = cleaned.replace(
    /(\s+-os\s+-specifications\s+-integration){2,}/g,
    ' -os -specifications -integration',
  );

  // Clean up repeated " -management" patterns
  cleaned = cleaned.replace(/(\s+-management){3,}/g, ' -management');

  // Clean up repeated " -gates" patterns
  cleaned = cleaned.replace(/(\s+-gates){3,}/g, ' -gates');

  // Clean up repeated " -web" patterns
  cleaned = cleaned.replace(/(\s+-web){3,}/g, ' -web');

  // Clean up repeated " -fix" patterns
  cleaned = cleaned.replace(/(\s+-fix){3,}/g, ' -fix');

  return cleaned.trim();
}

async function fixRepeatedTags() {
  try {
    const files = await fs.readdir(tasksDir);
    const markdownFiles = files.filter((file) => file.endsWith('.md'));

    console.log(`Found ${markdownFiles.length} task files to check for repeated tags...`);

    let fixedCount = 0;

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
        const cleanedTitle = cleanRepeatedPatterns(originalTitle);

        if (cleanedTitle !== originalTitle) {
          frontmatter = frontmatter.replace(/title:\s*"[^"]+"/, `title: "${cleanedTitle}"`);
          hasChanges = true;

          // Also update slug if it exists
          const cleanedSlug = cleanedTitle
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

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
        fixedCount++;

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

    console.log(`Fixed repeated tags in ${fixedCount} task files`);
  } catch (error) {
    console.error('Error fixing repeated tags:', error);
    process.exit(1);
  }
}

fixRepeatedTags();
