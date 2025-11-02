import type { Task } from '../types.js';
import { isFallbackSlug, ensureTaskFileBase } from '../core/slugs.js';

const quote = (value: unknown): string => {
  if (value === undefined || value === null) {
    return '""';
  }
  return JSON.stringify(String(value));
};

const formatScalar = (value: unknown): string => {
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return JSON.stringify(value);
  return '""';
};

const formatLabels = (labels: ReadonlyArray<string> | undefined): string =>
  labels && labels.length > 0 ? `[${labels.map((label) => JSON.stringify(label)).join(', ')}]` : '[]';

export const toFrontmatter = (task: Task): string => {
  const estimates = task.estimates ?? {};
  const lines: string[] = ['---', `uuid: ${quote(task.uuid)}`, `title: ${quote(task.title)}`];

  const slug = task.slug ?? ensureTaskFileBase({ ...task });
  if (slug.length > 0 && !isFallbackSlug(slug, task.uuid)) {
    lines.push(`slug: ${quote(slug)}`);
  }

  lines.push(
    `status: ${quote(task.status)}`,
    `priority: ${quote(task.priority)}`,
    `labels: ${formatLabels(task.labels)}`,
    `created_at: ${quote(task.created_at)}`,
    'estimates:',
    `  complexity: ${formatScalar(estimates.complexity)}`,
    `  scale: ${formatScalar(estimates.scale)}`,
    `  time_to_completion: ${formatScalar(estimates.time_to_completion)}`,
  );

  if (task.corrections && task.corrections.count > 0) {
    lines.push('corrections:', `  count: ${task.corrections.count}`, '  history:');
    for (const entry of task.corrections.history) {
      lines.push('    -');
      lines.push(`      timestamp: ${quote(entry.timestamp)}`);
      lines.push(`      from: ${quote(entry.from)}`);
      lines.push(`      to: ${quote(entry.to)}`);
      lines.push(`      reason: ${quote(entry.reason)}`);
    }
  }

  if (task.lastCommitSha) {
    lines.push(`lastCommitSha: ${quote(task.lastCommitSha)}`);
  }

  if (task.commitHistory && task.commitHistory.length > 0) {
    lines.push('commitHistory:');
    for (const entry of task.commitHistory) {
      lines.push('  -');
      lines.push(`    sha: ${quote(entry.sha)}`);
      lines.push(`    timestamp: ${quote(entry.timestamp)}`);
      lines.push(`    message: ${quote(entry.message)}`);
      lines.push(`    author: ${quote(entry.author)}`);
      lines.push(`    type: ${quote(entry.type)}`);
    }
  }

  lines.push('---');

  const content = task.content?.trim();
  if (content && content.length > 0) {
    lines.push('', content);
  }

  return `${lines.join('\n')}\n`;
};
