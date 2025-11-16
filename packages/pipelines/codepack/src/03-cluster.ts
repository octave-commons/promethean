import * as path from 'path';
import { pathToFileURL } from 'url';

import { openLevelCache } from '@promethean-os/level-cache';
import { clusterEmbeddings, createPipelineProgram } from '@promethean-os/pipeline-core';

import type { CodeBlock, Cluster } from './types.js';

export type ClusterOptions = {
  blocks?: string;
  embeds?: string;
  out?: string;
  simThreshold?: number;
  topK?: number;
};

async function loadBlocks(blocksPath: string): Promise<CodeBlock[]> {
  const blockCache = await openLevelCache<CodeBlock>({ path: blocksPath, namespace: 'blocks' });
  const blocks: CodeBlock[] = [];
  for await (const [, block] of blockCache.entries()) blocks.push(block);
  await blockCache.close();
  return blocks;
}

async function loadEmbeddings(
  ids: readonly string[],
  cachePath: string,
): Promise<Map<string, number[]>> {
  const cache = await openLevelCache<number[]>({ path: cachePath, namespace: 'embeds' });
  const entries = new Map<string, number[]>();
  for (const id of ids) {
    const vector = await cache.get(id);
    if (vector) entries.set(id, vector);
  }
  await cache.close();
  return entries;
}

export async function clusterBlocks(options: ClusterOptions = {}): Promise<void> {
  const blocksPath = path.resolve(options.blocks ?? '.cache/codepack/blocks');
  const cachePath = path.resolve(options.embeds ?? '.cache/codepack/embeds');
  const outPath = path.resolve(options.out ?? '.cache/codepack/clusters');
  const threshold = options.simThreshold ?? 0.82;
  const topK = options.topK ?? 8;

  const blocks = await loadBlocks(blocksPath);
  const embeddings = await loadEmbeddings(
    blocks.map((block) => block.id),
    cachePath,
  );

  const clustered = clusterEmbeddings({
    ids: blocks.map((block) => block.id),
    embeddings,
    threshold,
    topK,
    minSize: 1,
    includeStats: false,
  }).map((cluster) => ({ id: cluster.id, memberIds: cluster.memberIds }));

  const clusterCache = await openLevelCache<Cluster>({ path: outPath, namespace: 'clusters' });
  await clusterCache.batch(
    clustered.map((cluster) => ({ type: 'put' as const, key: cluster.id, value: cluster })),
  );
  await clusterCache.close();
  console.log(`clusters: ${clustered.length} groups -> ${path.relative(process.cwd(), outPath)}`);
}

async function runCli() {
  const program = createPipelineProgram('codepack-cluster', 'Cluster embedded code blocks');
  program
    .option('--blocks <path>', 'Block cache path', '.cache/codepack/blocks')
    .option('--embeds <path>', 'Embedding cache path', '.cache/codepack/embeds')
    .option('--out <path>', 'Cluster cache path', '.cache/codepack/clusters')
    .option(
      '--sim-threshold <value>',
      'Cosine similarity threshold',
      (value) => Number(value),
      0.82,
    )
    .option('--k <value>', 'Top-k neighbors', (value) => Number(value), 8)
    .action(
      async (options: {
        blocks: string;
        embeds: string;
        out: string;
        simThreshold: number;
        k: number;
      }) => {
        await clusterBlocks({
          blocks: options.blocks,
          embeds: options.embeds,
          out: options.out,
          simThreshold: options.simThreshold,
          topK: options.k,
        });
      },
    );
  await program.parseAsync(process.argv);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  runCli().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
