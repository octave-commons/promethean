/**
 * Markdown Output Utilities for Kanban CLI
 *
 * Provides formatted markdown output for different kanban data types
 * to replace JSONL as the default output format.
 */

import type { Task, Board } from './types.js';
import type { IndexedTask } from '../board/types.js';

/**
 * Format a single task as markdown
 */
export function formatTask(task: Task | IndexedTask): string {
  const status = 'status' in task ? task.status : task.status || 'unknown';
  const title = task.title || 'Untitled';
  const uuid = task.uuid || 'unknown';
  const description = task.description
    ? task.description.slice(0, 200) + (task.description.length > 200 ? '...' : '')
    : '';
  const tags = task.tags && task.tags.length > 0 ? task.tags.map((tag) => `#${tag}`).join(' ') : '';

  return `## ${title}

**UUID:** \`${uuid}\`  
**Status:** ${status}  
${tags ? `**Tags:** ${tags}  \n` : ''}${description ? `**Description:** ${description}  \n` : ''}`;
}

/**
 * Format multiple tasks as markdown list
 */
export function formatTaskList(tasks: (Task | IndexedTask)[]): string {
  if (tasks.length === 0) {
    return 'No tasks found.';
  }

  return tasks
    .map((task) => {
      const status = 'status' in task ? task.status : task.status || 'unknown';
      const title = task.title || 'Untitled';
      const uuid = task.uuid || 'unknown';
      const tags =
        task.tags && task.tags.length > 0 ? ' ' + task.tags.map((tag) => `#${tag}`).join(' ') : '';

      return `- [ ] **${title}** (\`${uuid}\`) - ${status}${tags}`;
    })
    .join('\n');
}

/**
 * Format tasks grouped by status as markdown board
 */
export function formatTaskBoard(tasks: (Task | IndexedTask)[]): string {
  if (tasks.length === 0) {
    return 'No tasks found.';
  }

  // Group tasks by status
  const grouped = tasks.reduce(
    (acc, task) => {
      const status = 'status' in task ? task.status : task.status || 'unknown';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(task);
      return acc;
    },
    {} as Record<string, (Task | IndexedTask)[]>,
  );

  // Sort statuses alphabetically
  const sortedStatuses = Object.keys(grouped).sort();

  let output = '';
  for (const status of sortedStatuses) {
    output += `\n### ${status}\n\n`;
    output += formatTaskList(grouped[status]);
    output += '\n';
  }

  return output.trim();
}

/**
 * Format a board as markdown
 */
export function formatBoard(board: Board): string {
  const output = [`# ${board.title || 'Kanban Board'}`];

  if (board.description) {
    output.push(`\n${board.description}\n`);
  }

  // Add columns
  if (board.columns && board.columns.length > 0) {
    for (const column of board.columns) {
      output.push(`\n## ${column.title || column.id}\n`);

      if (column.tasks && column.tasks.length > 0) {
        for (const task of column.tasks) {
          const tags =
            task.tags && task.tags.length > 0
              ? ' ' + task.tags.map((tag) => `#${tag}`).join(' ')
              : '';
          output.push(`- [ ] **${task.title}** (\`${task.uuid}\`)${tags}`);
        }
      } else {
        output.push('*No tasks*');
      }
      output.push('');
    }
  }

  return output.join('\n');
}

/**
 * Format search results as markdown
 */
export function formatSearchResults(results: (Task | IndexedTask)[], query: string): string {
  if (results.length === 0) {
    return `No tasks found matching "${query}".`;
  }

  let output = `# Search Results for "${query}"\n\n`;
  output += `Found ${results.length} task${results.length === 1 ? '' : 's'}:\n\n`;
  output += formatTaskList(results);

  return output;
}

/**
 * Format task count as markdown
 */
export function formatTaskCount(counts: Record<string, number>): string {
  let output = '# Task Counts\n\n';

  const sortedStatuses = Object.keys(counts).sort();
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  output += `**Total:** ${total} tasks\n\n`;

  for (const status of sortedStatuses) {
    output += `- **${status}:** ${counts[counts]}\n`;
  }

  return output;
}

/**
 * Format audit results as markdown
 */
export function formatAuditResults(results: {
  issues: Array<{ type: string; message: string; file?: string }>;
  summary: { total: number; errors: number; warnings: number };
}): string {
  let output = `# Board Audit Results\n\n`;

  output += `## Summary\n\n`;
  output += `- **Total Issues:** ${results.summary.total}\n`;
  output += `- **Errors:** ${results.summary.errors}\n`;
  output += `- **Warnings:** ${results.summary.warnings}\n\n`;

  if (results.issues.length === 0) {
    output += `✅ **No issues found!**\n`;
    return output;
  }

  output += `## Issues\n\n`;

  for (const issue of results.issues) {
    const emoji = issue.type === 'error' ? '❌' : '⚠️';
    output += `${emoji} **${issue.type.toUpperCase()}:** ${issue.message}`;
    if (issue.file) {
      output += ` (${issue.file})`;
    }
    output += '\n\n';
  }

  return output;
}

/**
 * Format generic data as markdown table
 */
export function formatTable(data: Record<string, any>[], headers?: string[]): string {
  if (data.length === 0) {
    return 'No data to display.';
  }

  const keys = headers || Object.keys(data[0]);

  // Create header row
  let output = '| ' + keys.join(' | ') + ' |\n';

  // Create separator row
  output += '|' + keys.map(() => ' --- ').join('|') + '|\n';

  // Create data rows
  for (const row of data) {
    output += '| ' + keys.map((key) => String(row[key] || '')).join(' | ') + ' |\n';
  }

  return output;
}

/**
 * Main print function that outputs markdown to stdout
 */
export function printMarkdown(
  data: any,
  type: 'task' | 'tasks' | 'board' | 'search' | 'count' | 'audit' | 'table' = 'table',
  context?: any,
): void {
  let output: string;

  switch (type) {
    case 'task':
      output = formatTask(data);
      break;
    case 'tasks':
      output = formatTaskList(data);
      break;
    case 'board':
      output = formatBoard(data);
      break;
    case 'search':
      output = formatSearchResults(data, context?.query || '');
      break;
    case 'count':
      output = formatTaskCount(data);
      break;
    case 'audit':
      output = formatAuditResults(data);
      break;
    case 'table':
    default:
      if (Array.isArray(data)) {
        output = formatTable(data);
      } else if (typeof data === 'object' && data !== null) {
        output = formatTable([data]);
      } else {
        output = String(data);
      }
      break;
  }

  process.stdout.write(output + '\n');
}
