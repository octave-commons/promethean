import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { Board, ColumnData, Task } from '../types.js';
import { normalizeColumnDisplayName, columnKey } from '../utils/string-utils.js';
import { ensureTaskFileBase } from '../core/slugs.js';
import { serializeMarkdownBoard } from './markdown-serializer.js';
import { loadKanbanConfig } from '../board/config.js';
import { refreshTaskIndex } from '../board/indexer.js';

const KANBAN_SETTINGS_PATTERN = /^\s*%%\s*kanban:settings\b/m;

const DEFAULT_KANBAN_FOOTER = [
  '%% kanban:settings',
  '```',
  '{"kanban-plugin":"board"}',
  '```',
  '%%',
].join('\n');

const resolveKanbanFooter = async (boardPath: string): Promise<string> => {
  try {
    const existing = await fs.readFile(boardPath, 'utf8');
    const idx = existing.search(KANBAN_SETTINGS_PATTERN);
    if (idx >= 0) {
      const footer = existing.slice(idx).trim();
      if (footer.length > 0) {
        return footer;
      }
    }
  } catch {
    // ignore missing file
  }
  return DEFAULT_KANBAN_FOOTER;
};

export const writeBoard = async (boardPath: string, board: Board): Promise<void> => {
  const markdown = serializeMarkdownBoard(board).trimEnd();
  const footer = await resolveKanbanFooter(boardPath);
  const segments: string[] = [];
  if (markdown.length > 0) {
    segments.push(markdown);
  }
  segments.push(footer.trimEnd());
  const output = `${segments.join('\n\n')}\n`;
  await fs.mkdir(path.dirname(boardPath), { recursive: true }).catch(() => {});
  await fs.writeFile(boardPath, output, 'utf8');
};

export const maybeRefreshIndex = async (tasksDir: string): Promise<void> => {
  try {
    const { config } = await loadKanbanConfig();
    const resolvedInput = path.resolve(tasksDir);
    const resolvedConfig = path.resolve(config.tasksDir);
    if (resolvedInput !== resolvedConfig) {
      return;
    }
    await refreshTaskIndex(config);
  } catch {
    // ignore if config/index not available
  }
};

export const ensureColumn = (board: Board, column: string): ColumnData => {
  const key = columnKey(column);
  let existing = board.columns.find((col) => columnKey(col.name) === key);
  if (!existing) {
    existing = {
      name: normalizeColumnDisplayName(column),
      count: 0,
      limit: null,
      tasks: [],
    };
    board.columns = [...board.columns, existing];
  } else if (existing.name !== normalizeColumnDisplayName(existing.name)) {
    existing.name = normalizeColumnDisplayName(existing.name);
  }
  return existing;
};

export const assignSlugsToBoard = (board: Board): Board => ({
  ...board,
  columns: board.columns.map((column) => ({
    ...column,
    tasks: column.tasks.map((task) => ({
      ...task,
      slug: ensureTaskFileBase({ ...task }),
    })),
  })),
});

export const serializeBoardToMarkdown = (board: Board, footer: string): string => {
  const markdown = serializeMarkdownBoard(board).trimEnd();
  const segments: string[] = [];
  if (markdown.length > 0) {
    segments.push(markdown);
  }
  segments.push(footer.trimEnd());
  return `${segments.join('\n\n')}\n`;
};
