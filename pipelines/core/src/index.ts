import * as path from 'path';

import { Command } from 'commander';
import { openLevelCache, type Cache } from '@promethean-os/level-cache';
import { cosine, ollamaEmbed } from '@promethean-os/utils';

export type FileScanner<TFile extends { path: string } = { path: string }> = (options: {
  root: string;
  exts: Set<string>;
  collect?: boolean;
  readContent?: boolean;
  onFile?: (file: TFile) => Promise<void> | void;
}) => Promise<{ files?: readonly TFile[] } | void>;

export function normalizeExtensions(exts: Iterable<string>): Set<string> {
  const values = Array.from(exts)
    .map((raw) => raw.trim())
    .filter(Boolean);
  return new Set(
    values.map((value) =>
      value.startsWith('.') ? value.toLowerCase() : `.${value.toLowerCase()}`,
    ),
  );
}

export async function collectAbsolutePaths<TFile extends { path: string }>(options: {
  root: string;
  extensions: Iterable<string>;
  scanner: FileScanner<TFile>;
}): Promise<string[]> {
  const root = path.resolve(options.root);
  const exts = normalizeExtensions(options.extensions);
  const result = (await options.scanner({ root, exts, collect: true })) ?? ({ files: [] } as const);
  const files = Array.from(result.files ?? []);
  return files.map((file) =>
    path.isAbsolute(file.path) ? path.resolve(file.path) : path.resolve(root, file.path),
  );
}

export async function withCache<T>(options: {
  path: string;
  namespace?: string;
}): Promise<Cache<T>> {
  return openLevelCache<T>({ path: path.resolve(options.path), namespace: options.namespace });
}

export async function loadCacheValues<T>(options: {
  path: string;
  namespace?: string;
}): Promise<T[]> {
  const cache = await withCache<T>(options);
  const values: T[] = [];
  for await (const [, value] of cache.entries()) {
    values.push(value);
  }
  await cache.close();
  return values;
}

export async function batchPut<T>(options: {
  path: string;
  namespace?: string;
  entries: ReadonlyArray<{ key: string; value: T }>;
}): Promise<void> {
  const cache = await withCache<T>(options);
  await cache.batch(
    options.entries.map((entry) => ({ type: 'put' as const, key: entry.key, value: entry.value })),
  );
  await cache.close();
}

export type EmbeddingFormatter<T> = (entity: T) => Promise<string> | string;

export async function embedEntities<T>(options: {
  entities: readonly T[];
  getId: (entity: T) => string;
  formatter: EmbeddingFormatter<T>;
  cachePath: string;
  namespace?: string;
  model: string;
  skipIfExists?: boolean;
}): Promise<number> {
  const cache = await withCache<number[]>({
    path: options.cachePath,
    namespace: options.namespace,
  });
  let wrote = 0;
  for (const entity of options.entities) {
    const id = options.getId(entity);
    if (options.skipIfExists && (await cache.has(id))) continue;
    const text = await options.formatter(entity);
    await cache.set(id, await ollamaEmbed(options.model, text));
    wrote += 1;
  }
  await cache.close();
  return wrote;
}

export type Cluster = {
  id: string;
  memberIds: string[];
  maxSim: number;
  avgSim: number;
};

export function clusterEmbeddings(options: {
  ids: readonly string[];
  embeddings: ReadonlyMap<string, readonly number[]> | Record<string, readonly number[]>;
  threshold?: number;
  topK?: number;
  minSize?: number;
  includeStats?: boolean;
}): Cluster[] {
  const { ids } = options;
  const lookup =
    options.embeddings instanceof Map
      ? options.embeddings
      : new Map(Object.entries(options.embeddings));
  const TH = options.threshold ?? 0.82;
  const K = options.topK ?? 8;
  const MIN = options.minSize ?? 1;
  const edges: Array<[string, string]> = [];
  for (const id of ids) {
    const source = lookup.get(id);
    if (!source) continue;
    const neighbors = ids
      .filter((target) => target !== id)
      .map((target) => ({ target, score: cosine(source, lookup.get(target) ?? []) }))
      .filter(({ score }) => !Number.isNaN(score))
      .sort((a, b) => b.score - a.score)
      .slice(0, K)
      .filter(({ score }) => score >= TH)
      .map(({ target }) => target);
    neighbors.forEach((neighbor) => edges.push([id, neighbor]));
  }
  const parent = new Map<string, string>(ids.map((id) => [id, id]));
  const find = (id: string): string => {
    const current = parent.get(id) ?? id;
    if (current === id) return id;
    const root = find(current);
    parent.set(id, root);
    return root;
  };
  const union = (a: string, b: string) => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent.set(rootA, rootB);
  };
  edges.forEach(([a, b]) => union(a, b));
  const groups = new Map<string, string[]>();
  ids.forEach((id) => {
    const root = find(id);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root)!.push(id);
  });
  const clusters: Cluster[] = [];
  let index = 0;
  for (const members of groups.values()) {
    if (members.length < MIN) continue;
    const cluster: Cluster = {
      id: `cluster-${++index}`,
      memberIds: members.slice(),
      maxSim: 0,
      avgSim: 0,
    };
    if (options.includeStats) {
      const sims: number[] = [];
      for (let i = 0; i < members.length; i++) {
        const current = lookup.get(members[i]!);
        if (!current) continue;
        for (let j = i + 1; j < members.length; j++) {
          const peer = lookup.get(members[j]!);
          if (!peer) continue;
          sims.push(cosine(current, peer));
        }
      }
      if (sims.length) {
        cluster.maxSim = Math.round(Math.max(...sims) * 100) / 100;
        const avg = sims.reduce((sum, value) => sum + value, 0) / sims.length;
        cluster.avgSim = Math.round(avg * 100) / 100;
      } else {
        cluster.maxSim = 0;
        cluster.avgSim = 0;
      }
    }
    clusters.push(cluster);
  }
  return clusters;
}

export function createPipelineProgram(name: string, description?: string): Command {
  const program = new Command(name);
  if (description) program.description(description);
  program.showHelpAfterError('\nUse --help for command details.');
  return program;
}

export function addPathOption(
  command: Command,
  option: string,
  description: string,
  defaultValue: string,
): Command {
  return command.option(option, description, defaultValue);
}
