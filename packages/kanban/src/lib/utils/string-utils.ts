/**
 * String utility functions for the Kanban system
 * Extracted from kanban.ts for better organization
 */

import { STOPWORDS } from '../core/constants.js';

export const stripDiacritics = (value: string): string =>
  value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

export const sanitizeFileNameBase = (value: string): string => {
  const normalized = stripDiacritics(value)
    .replace(/[\u0000-\u001f]/g, ' ')
    .replace(/[<>:"/\\|?*]/g, ' ')
    .replace(/\r?\n/g, ' ')
    .trim();
  const singleSpaced = normalized.replace(/\s{2,}/g, ' ');
  return singleSpaced.replace(/\.$/, '');
};
export const generateSlugFromFilename = (filename: string): string => {
  // Remove .md extension if present
  const nameWithoutExt = filename.replace(/\.md$/, '');

  // Convert to lowercase and replace whitespace and underscores with hyphens
  const slug = nameWithoutExt
    .toLowerCase()
    .replace(/[\s_]+/g, '-') // Replace any whitespace and underscores with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric characters except hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  return slug || 'untitled';
};

export const stripTrailingCount = (value: string): string =>
  value.replace(/\s*\(\s*\d+\s*\)\s*$/g, '').trim();

export const normalizeColumnDisplayName = (value: string): string => {
  const trimmed = stripTrailingCount(value.trim());
  return trimmed.length > 0 ? trimmed : 'Todo';
};

export const columnKey = (name: string): string =>
  normalizeColumnDisplayName(name)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\s-]+/g, '_') // Convert spaces and hyphens to underscores
    .replace(/[^a-z0-9_]+/g, ''); // Remove other special chars

export const tokenizeForLabels = (text: string): ReadonlyArray<string> =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));

export const generateAutoLabels = (
  title: string,
  body: string | undefined,
  limit = 4,
): ReadonlyArray<string> => {
  const tokens = new Map<string, number>();
  const addTokens = (source: string, weight: number) => {
    for (const token of tokenizeForLabels(source)) {
      tokens.set(token, (tokens.get(token) ?? 0) + weight);
    }
  };
  addTokens(title, 3);
  if (body) {
    addTokens(body.slice(0, 500), 1);
  }
  const sorted = Array.from(tokens.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([token]) => token.replace(/\s+/g, '-'));
  return sorted.slice(0, limit);
};

export const escapeRegExp = (string: string): string =>
  string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
