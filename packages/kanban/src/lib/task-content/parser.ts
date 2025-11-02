/**
 * Task content parser and analyzer
 * Handles markdown parsing, section extraction, and content validation
 */

import { promises as fs } from 'fs';
import { stat } from 'fs/promises';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { randomUUID } from 'crypto';
export { parseYaml };

// Read a task file from disk and return parsed pieces
export async function readTaskFile(filePath: string): Promise<{
  rawContent: string;
  frontmatter: Record<string, any> | null;
  body: string;
  sections: TaskSection[];
  task?: any;
}> {
  let raw = await fs.readFile(filePath, 'utf8');
  let parsed = parseTaskContent(raw);

  // Generate frontmatter if missing
  if (!parsed.frontmatter || Object.keys(parsed.frontmatter).length === 0) {
    const generatedFrontmatter = await generateTaskFrontmatter(filePath, raw);
    if (generatedFrontmatter) {
      // Update the raw content with generated frontmatter
      const frontmatterYaml = `---\n${stringifyYaml(generatedFrontmatter)}---\n`;
      raw = frontmatterYaml + parsed.body;
      parsed = parseTaskContent(raw);

      // Write the updated content back to the file
      await fs.writeFile(filePath, raw, 'utf8');
    }
  }

  const task =
    parsed.frontmatter && Object.keys(parsed.frontmatter).length > 0
      ? { ...parsed.frontmatter, content: parsed.body }
      : undefined;
  return {
    rawContent: raw,
    frontmatter: parsed.frontmatter,
    body: parsed.body,
    sections: parsed.sections,
    task,
  };
}

import { TaskSection, TaskValidationResult } from './types.js';

/**
 * Parse markdown content into sections and frontmatter
 */
export function parseTaskContent(content: string): {
  frontmatter: Record<string, any>;
  body: string;
  sections: TaskSection[];
} {
  // Extract frontmatter
  let frontmatter: Record<string, any> = {};
  let body = content;

  if (content.startsWith('---\n')) {
    const endIndex = content.indexOf('\n---\n', 4);
    if (endIndex !== -1) {
      const frontmatterText = content.slice(4, endIndex);
      try {
        frontmatter = parseYaml(frontmatterText);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`Failed to parse frontmatter YAML: ${errorMessage}`);
        console.warn('Frontmatter text (first 200 chars):', frontmatterText.slice(0, 200));
        // Try to provide more specific error information
        if (errorMessage.includes('indentation')) {
          console.warn('Hint: Check YAML indentation - YAML is sensitive to spaces');
        } else if (errorMessage.includes('mapping values')) {
          console.warn('Hint: Check for missing colons or malformed key-value pairs');
        } else if (errorMessage.includes('block sequence')) {
          console.warn('Hint: Check array/list formatting with dashes');
        }
        // Continue with empty frontmatter rather than failing completely
        frontmatter = {};
      }
      body = content.slice(endIndex + 5);
    }
  }

  // Parse sections
  const sections: TaskSection[] = [];
  const lines = body.split('\n');
  let currentSection: Partial<TaskSection> | null = null;
  let currentPosition = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line?.match(/^(#{1,6})\s+(.+)$/);

    if (headerMatch) {
      // Save previous section if exists
      if (currentSection) {
        currentSection.endPosition = currentPosition;
        sections.push(currentSection as TaskSection);
      }

      // Start new section
      currentSection = {
        header: headerMatch[2]!,
        level: headerMatch[1]!.length,
        content: '',
        startPosition: currentPosition,
        endPosition: 0,
      };
    } else if (currentSection && line !== undefined) {
      currentSection.content += (currentSection.content ? '\n' : '') + line;
    }

    if (line !== undefined) {
      currentPosition += line.length + 1; // +1 for newline
    }
  }

  // Save last section
  if (currentSection) {
    currentSection.endPosition = currentPosition;
    sections.push(currentSection as TaskSection);
  }

  return { frontmatter, body, sections };
}

/**
 * Find a specific section by header
 */
export function findSection(sections: TaskSection[], header: string): TaskSection | null {
  return sections.find((section) => section.header.toLowerCase() === header.toLowerCase()) || null;
}

/**
 * Generate frontmatter for a task file that doesn't have any
 */
async function generateTaskFrontmatter(
  filePath: string,
  content: string,
): Promise<Record<string, any> | null> {
  try {
    // Get file stats for created_at
    const stats = await stat(filePath);
    const createdAt = stats.birthtime.toISOString();

    // Generate UUID
    const uuid = randomUUID();

    // Extract title from first heading or filename
    const lines = content.split('\n');
    let title = '';
    for (const line of lines) {
      const headingMatch = line.match(/^#\s+(.+)$/);
      if (headingMatch) {
        title = headingMatch[1]!.trim();
        break;
      }
    }

    // If no heading found, use filename
    if (!title) {
      const pathParts = filePath.split('/');
      const filename = pathParts[pathParts.length - 1]!;
      title = filename.replace(/\.md$/, '').replace(/[-_]/g, ' ');
    }

    // Generate basic frontmatter with all required TaskFM fields
    const frontmatter: Record<string, any> = {
      uuid,
      id: uuid, // Use UUID as ID
      created_at: createdAt,
      created: createdAt,
      title,
      status: 'open', // Valid status
      priority: 'medium', // Default priority
      owner: '', // Empty owner
      labels: ['task', 'auto-generated'],
      description: `Task: ${title}`,
      tags: ['task', 'auto-generated'],
    };

    return frontmatter;
  } catch (error) {
    console.warn(`Failed to generate frontmatter for ${filePath}:`, error);
    return null;
  }
}

/**
 * Validate task structure and content
 */
export function validateTaskContent(content: string): TaskValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  try {
    const { frontmatter, sections } = parseTaskContent(content);

    // Validate frontmatter
    if (!frontmatter.uuid) {
      errors.push('Missing required UUID in frontmatter');
    }
    if (!frontmatter.title) {
      errors.push('Missing required title in frontmatter');
    }
    if (!frontmatter.status) {
      warnings.push('Missing status in frontmatter');
    }

    // Validate sections
    if (sections.length === 0) {
      warnings.push('No content sections found');
    }

    // Check for required sections
    const hasDescription = sections.some(
      (s) =>
        s.header.toLowerCase().includes('description') ||
        s.header.toLowerCase().includes('overview'),
    );
    if (!hasDescription) {
      suggestions.push('Add a description section for better task clarity');
    }

    // Check content quality
    const totalWords = sections.reduce(
      (sum, section) => sum + section.content.split(/\s+/).length,
      0,
    );

    if (totalWords < 20) {
      warnings.push('Task content seems too brief');
    }

    if (totalWords > 1000) {
      warnings.push('Task content is quite long - consider breaking it down');
    }
  } catch (error) {
    errors.push(`Failed to parse task content: ${error}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Analyze task content for quality metrics
 */
export function analyzeTaskContent(content: string): {
  sections: TaskSection[];
  frontmatter: Record<string, any>;
  wordCount: number;
  readingTime: number;
  completeness: number;
  qualityScore: number;
} {
  const { frontmatter, sections } = parseTaskContent(content);

  // Basic metrics
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // 200 words per minute

  // Completeness scoring
  const requiredFields = ['uuid', 'title', 'status'];
  const completenessScore =
    requiredFields.filter((field) => frontmatter[field]).length / requiredFields.length;

  // Quality scoring based on content structure
  const hasDescription = sections.some(
    (s) =>
      s.header.toLowerCase().includes('description') || s.header.toLowerCase().includes('overview'),
  );
  const hasGoals = sections.some(
    (s) => s.header.toLowerCase().includes('goal') || s.header.toLowerCase().includes('objective'),
  );
  const hasAcceptanceCriteria = sections.some(
    (s) =>
      s.header.toLowerCase().includes('acceptance') || s.header.toLowerCase().includes('criteria'),
  );

  const qualityScore =
    (hasDescription ? 0.3 : 0) +
    (hasGoals ? 0.3 : 0) +
    (hasAcceptanceCriteria ? 0.2 : 0) +
    completenessScore * 0.2;

  return {
    sections,
    frontmatter,
    wordCount,
    readingTime,
    completeness: completenessScore,
    qualityScore,
  };
}

/**
 * Create a backup of the original file
 */
export async function createBackup(filePath: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${filePath}.backup.${timestamp}`;

  try {
    await fs.copyFile(filePath, backupPath);
    return backupPath;
  } catch (error) {
    console.warn('Failed to create backup:', error);
    return '';
  }
}

/**
 * Update timestamp in frontmatter
 */
export function updateTimestamp(frontmatter: Record<string, any>): Record<string, any> {
  return {
    ...frontmatter,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Generate a simple diff between two texts
 */
export function generateDiff(before: string, after: string): string {
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  const diff: string[] = [];

  const maxLines = Math.max(beforeLines.length, afterLines.length);

  for (let i = 0; i < maxLines; i++) {
    const beforeLine = beforeLines[i] || '';
    const afterLine = afterLines[i] || '';

    if (beforeLine !== afterLine) {
      if (beforeLine && !afterLine) {
        diff.push(`- ${beforeLine}`);
      } else if (!beforeLine && afterLine) {
        diff.push(`+ ${afterLine}`);
      } else {
        diff.push(`- ${beforeLine}`);
        diff.push(`+ ${afterLine}`);
      }
    } else if (beforeLine) {
      diff.push(`  ${beforeLine}`);
    }
  }

  return diff.join('\n');
}
