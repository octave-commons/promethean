import * as fs from 'fs/promises';
import * as path from 'path';
import { pathToFileURL } from 'url';

import { openLevelCache } from '@promethean-os/level-cache';
import { clusterEmbeddings, createPipelineProgram } from '@promethean-os/pipeline-core';

import type { FunctionInfo, Cluster } from './types.js';

export type ClusterArgs = {
  scan?: string;
  embeds?: string;
  out?: string;
  simThreshold?: number;
  k?: number;
  minSize?: number;
};

export async function cluster(args: Readonly<ClusterArgs>): Promise<void> {
  const SCAN = path.resolve(args.scan ?? '.cache/simtasks/functions');
  const CACHE_PATH = path.resolve(args.embeds ?? '.cache/simtasks/embeddings');
  const OUT = path.resolve(args.out ?? '.cache/simtasks/clusters.json');
  const TH = args.simThreshold ?? 0.84;
  const K = args.k ?? 10;
  const MIN = args.minSize ?? 2;

  const fnCache = await openLevelCache<FunctionInfo[]>({ path: SCAN });
  const functions = (await fnCache.get('functions')) ?? [];
  await fnCache.close();

  const embedCache = await openLevelCache<number[]>({ path: CACHE_PATH });
  const embeds = new Map<string, number[]>();
  for (const fn of functions) {
    const vector = await embedCache.get(fn.id);
    if (vector) embeds.set(fn.id, vector);
  }
  await embedCache.close();

  const clusters: Cluster[] = clusterEmbeddings({
    ids: functions.map((fn) => fn.id),
    embeddings: embeds,
    threshold: TH,
    topK: K,
    minSize: MIN,
    includeStats: true,
  });

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(clusters, null, 2), 'utf-8');
  console.log(`simtasks: ${clusters.length} clusters -> ${path.relative(process.cwd(), OUT)}`);
}

async function runCli() {
  const program = createPipelineProgram('simtasks-cluster', 'Cluster embedded functions');
  program
    .option('--scan <path>', 'Scan cache path', '.cache/simtasks/functions')
    .option('--embeds <path>', 'Embedding cache path', '.cache/simtasks/embeddings')
    .option('--out <path>', 'Output json file', '.cache/simtasks/clusters.json')
    .option('--sim-threshold <value>', 'Similarity threshold', (value) => Number(value), 0.84)
    .option('--k <value>', 'Top-k neighbors', (value) => Number(value), 10)
    .option('--min-size <value>', 'Minimum cluster size', (value) => Number(value), 2)
    .action(async (options: ClusterArgs & { simThreshold: number; k: number; minSize: number }) => {
      await cluster({
        scan: options.scan,
        embeds: options.embeds,
        out: options.out,
        simThreshold: options.simThreshold,
        k: options.k,
        minSize: options.minSize,
      });
    });
  await program.parseAsync(process.argv);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  runCli().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
