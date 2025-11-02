/**
 * Markdown processing serializers for Kanban system
 * Extracted from kanban.ts to fix hanging bug and improve organization
 */

// Imports will be added when functionality is implemented
import { escapeRegExp } from '../utils/string-utils.js';

/**
 * Format a section block with heading and items
 */
export const formatSectionBlock = (heading: string, items: ReadonlyArray<string>): string => {
  const itemList = items.length > 0 ? items.map((item) => `- ${item}`).join('\n') : 'nothing';
  return `${heading}\n${itemList}`;
};

/**
 * Set section items in content, creating section if needed
 */
export const setSectionItems = (
  content: string,
  heading: string,
  items: ReadonlyArray<string>,
): string => {
  const block = formatSectionBlock(heading, items);
  const pattern = new RegExp(`^${escapeRegExp(heading)}\\s*\\n([\\s\\S]*?)(?=^##\\s+|$)`, 'm');
  if (pattern.test(content)) {
    return content.replace(pattern, () => block);
  }
  const trimmed = content.trimEnd();
  const prefix = trimmed.length > 0 ? `${trimmed}\n\n` : '';
  return `${prefix}${block}`;
};

/**
 * Ensure section exists in content
 */
export const ensureSectionExists = (content: string, heading: string): string => {
  // Add timeout to prevent infinite loops
  const startTime = Date.now();
  const TIMEOUT = 5000; // 5 second timeout

  const pattern = new RegExp(`^${escapeRegExp(heading)}\\s*$`, 'm');
  if (pattern.test(content)) {
    return content;
  }

  // Check if we've been running too long
  if (Date.now() - startTime > TIMEOUT) {
    throw new Error(`Timeout in ensureSectionExists for heading: ${heading}`);
  }

  return setSectionItems(content, heading, []);
};

/**
 * Parse section items from content
 */
export const parseSectionItems = (content: string, heading: string): ReadonlyArray<string> => {
  const pattern = new RegExp(`^${escapeRegExp(heading)}\\s*\\n([\\s\\S]*?)(?=^##\\s+|$)`, 'm');
  const match = pattern.exec(content);
  if (!match) return [];
  const sectionBody = match[1]?.trim() ?? '';
  if (sectionBody.length === 0 || /^nothing$/i.test(sectionBody)) {
    return [];
  }
  return sectionBody
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*]\s*/, '').trim())
    .filter((line) => line.length > 0);
};

/**
 * Merge section items with existing content
 */
export const mergeSectionItems = (
  content: string,
  heading: string,
  additions: ReadonlyArray<string>,
): string => {
  const existing = parseSectionItems(content, heading);
  const merged = new Set(existing);
  for (const item of additions) {
    if (item.trim().length > 0) {
      merged.add(item.trim());
    }
  }
  return setSectionItems(content, heading, Array.from(merged));
};
