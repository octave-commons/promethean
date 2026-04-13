/**
 * Path tracking utilities for recording and managing file paths.
 */

import { putPath, hasPath, listPaths, getDb } from './level.js';
import { debug, info } from './log.js';

export interface PathMetadata {
  discoveredAt: number;
  discoveredInSession?: string;
  description?: string;
  tags?: string[];
  context?: string;
}

/**
 * Record a path with optional metadata.
 */
export async function recordPath(
  path: string,
  metadata?: Partial<PathMetadata>
): Promise<void> {
  const fullMetadata: PathMetadata = {
    discoveredAt: Date.now(),
    discoveredInSession: metadata?.discoveredInSession,
    description: metadata?.description,
    tags: metadata?.tags ?? [],
    context: metadata?.context,
  };

  await putPath(path, fullMetadata as unknown as Record<string, unknown>);
  info('Path recorded', { path, ...fullMetadata });
}

/**
 * Check if a path has been recorded.
 */
export async function isPathRecorded(path: string): Promise<boolean> {
  return hasPath(path);
}

/**
 * List all recorded paths with their metadata.
 */
export async function getRecordedPaths(): Promise<Array<{
  path: string;
  metadata: PathMetadata;
}>> {
  const paths = await listPaths();
  return paths.map((p) => ({
    path: p.path,
    metadata: p.metadata as unknown as PathMetadata,
  }));
}

/**
 * Search recorded paths by prefix.
 */
export async function searchPathsByPrefix(prefix: string): Promise<Array<{
  path: string;
  metadata: PathMetadata;
}>> {
  const allPaths = await getRecordedPaths();
  return allPaths.filter((p) => p.path.startsWith(prefix));
}

/**
 * Search recorded paths by tag.
 */
export async function searchPathsByTag(tag: string): Promise<Array<{
  path: string;
  metadata: PathMetadata;
}>> {
  const allPaths = await getRecordedPaths();
  return allPaths.filter((p) => p.metadata.tags?.includes(tag));
}

/**
 * Get paths discovered in a specific session.
 */
export async function getPathsBySession(sessionId: string): Promise<Array<{
  path: string;
  metadata: PathMetadata;
}>> {
  const allPaths = await getRecordedPaths();
  return allPaths.filter((p) => p.metadata.discoveredInSession === sessionId);
}

/**
 * Get recently discovered paths.
 */
export async function getRecentPaths(limit: number = 10): Promise<Array<{
  path: string;
  metadata: PathMetadata;
}>> {
  const allPaths = await getRecordedPaths();
  return allPaths
    .sort((a, b) => b.metadata.discoveredAt - a.metadata.discoveredAt)
    .slice(0, limit);
}

/**
 * Add a tag to a recorded path.
 */
export async function addPathTag(path: string, tag: string): Promise<boolean> {
  const paths = await getRecordedPaths();
  const pathEntry = paths.find((p) => p.path === path);

  if (!pathEntry) {
    debug('Path not found for tagging', { path });
    return false;
  }

  const tags = new Set([...(pathEntry.metadata.tags ?? []), tag]);
  await recordPath(path, {
    ...pathEntry.metadata,
    tags: Array.from(tags),
  });

  debug('Tag added to path', { path, tag });
  return true;
}

/**
 * Remove a tag from a recorded path.
 */
export async function removePathTag(path: string, tag: string): Promise<boolean> {
  const paths = await getRecordedPaths();
  const pathEntry = paths.find((p) => p.path === path);

  if (!pathEntry) {
    return false;
  }

  const tags = (pathEntry.metadata.tags ?? []).filter((t) => t !== tag);
  await recordPath(path, {
    ...pathEntry.metadata,
    tags,
  });

  debug('Tag removed from path', { path, tag });
  return true;
}

/**
 * Update path description.
 */
export async function updatePathDescription(
  path: string,
  description: string
): Promise<boolean> {
  const paths = await getRecordedPaths();
  const pathEntry = paths.find((p) => p.path === path);

  if (!pathEntry) {
    return false;
  }

  await recordPath(path, {
    ...pathEntry.metadata,
    description,
  });

  debug('Path description updated', { path });
  return true;
}

/**
 * Get path statistics.
 */
export interface PathStats {
  totalPaths: number;
  bySession: Record<string, number>;
  byTag: Record<string, number>;
  recentCount: number;
}

export async function getPathStats(): Promise<PathStats> {
  const allPaths = await getRecordedPaths();

  const bySession: Record<string, number> = {};
  const byTag: Record<string, number> = {};
  let recentCount = 0;
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  for (const path of allPaths) {
    const sessionId = path.metadata.discoveredInSession ?? 'unknown';
    bySession[sessionId] = (bySession[sessionId] ?? 0) + 1;

    for (const tag of (path.metadata.tags ?? [])) {
      byTag[tag] = (byTag[tag] ?? 0) + 1;
    }

    if (path.metadata.discoveredAt > oneWeekAgo) {
      recentCount++;
    }
  }

  return {
    totalPaths: allPaths.length,
    bySession,
    byTag,
    recentCount,
  };
}

/**
 * Export paths to a Markdown tree structure.
 */
export async function exportPathsToMarkdown(): Promise<string> {
  const paths = await getRecordedPaths();
  const lines: string[] = [
    '# Recorded Paths',
    '',
    `Total: ${paths.length} paths`,
    `Generated: ${new Date().toISOString()}`,
    '',
    '## By Session',
    '',
  ];

  // Group by session
  const bySession = new Map<string, typeof paths>();
  for (const path of paths) {
    const sessionId = path.metadata.discoveredInSession ?? 'unknown';
    if (!bySession.has(sessionId)) {
      bySession.set(sessionId, []);
    }
    bySession.get(sessionId)!.push(path);
  }

  for (const [sessionId, sessionPaths] of bySession) {
    lines.push(`### ${sessionId}`);
    lines.push('');
    for (const path of sessionPaths.sort((a, b) => a.path.localeCompare(b.path))) {
      const tags = path.metadata.tags?.length
        ? ` \`${path.metadata.tags.join('` `')}\``
        : '';
      const desc = path.metadata.description
        ? ` - ${path.metadata.description}`
        : '';
      lines.push(`- \`${path.path}\`${tags}${desc}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
