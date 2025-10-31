/**
 * Markdown formatting functions for kanban boards
 * Extracted from @packages/markdown/src/kanban.ts
 */

import type { Card, ColumnState, KanbanSettings } from '../actions/types/index.js';

const formatAttrValue = (value: string): string => {
  const escaped = value.replace(/\\/gu, '\\\\');
  if (!/\s|"|'/.test(value)) return escaped;
  if (!value.includes('"')) {
    return `"${escaped}"`;
  }
  if (!value.includes("'")) {
    return `'${escaped}'`;
  }
  return `"${escaped.replace(/"/gu, '\\"')}"`;
};

const stringifyAttrs = (attrs: Record<string, string>): string | undefined => {
  const entries = Object.entries(attrs);
  if (entries.length === 0) return undefined;
  const rendered = entries.map(([key, value]) => `${key}:${formatAttrValue(value)}`);
  return `{${rendered.join(' ')}}`;
};

const createCardText = (card: Card): string => {
  const tagTokens = card.tags.map((tag) => `#${tag}`);
  const linkTokens = card.links.map((link) => `[[${link}]]`);
  const attrsToken = stringifyAttrs(card.attrs);
  return [card.text, ...tagTokens, ...linkTokens, attrsToken]
    .filter((token): token is string => typeof token === 'string' && token.trim().length > 0)
    .join(' ')
    .trim();
};

export const formatCardLine = (card: Card): string => {
  const prefix = card.done ? '- [x]' : '- [ ]';
  const text = createCardText(card);
  const comment = `<!-- id: ${card.id} -->`;
  return text.length > 0 ? `${prefix} ${text} ${comment}` : `${prefix} ${comment}`;
};

export const formatSettingsBlock = (settings: KanbanSettings | null): string => {
  if (!settings) return '';
  const json = JSON.stringify(settings, null, 2);
  return ['%% kanban:settings', '', '```json', json, '```', '%%', ''].join('\n');
};

export const formatColumn = (column: ColumnState): string => {
  const header = `## ${column.name}`;
  const cardLines = column.cards.map(formatCardLine);
  return [header, ...cardLines, ''].join('\n');
};

export type FormatMarkdownInput = {
  readonly columns: readonly ColumnState[];
  readonly frontmatter: Record<string, unknown>;
  readonly settings: KanbanSettings | null;
};

export const formatMarkdown = (input: FormatMarkdownInput): string => {
  const { columns, frontmatter, settings } = input;

  // Format frontmatter
  const frontmatterStr = '';
  if (Object.keys(frontmatter).length > 0) {
    frontmatterStr = '---\n';
    for (const [key, value] of Object.entries(frontmatter)) {
      frontmatterStr += `${key}: ${JSON.stringify(value)}\n`;
    }
    frontmatterStr += '---\n\n';
  }

  // Format columns
  const columnStr = columns.map(formatColumn).join('\n');

  // Format settings
  const settingsStr = formatSettingsBlock(settings);

  return frontmatterStr + columnStr + settingsStr;
};
