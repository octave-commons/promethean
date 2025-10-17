// src/03-cluster.ts
import * as path from "path";

import { cosine } from "@promethean/utils";
import { openLevelCache } from "@promethean/level-cache";

import { parseArgs } from "./utils.js";
import type { CodeBlock, EmbeddingMap, Cluster } from "./types.js";

const args = parseArgs({
  "--blocks": ".cache/codepack/blocks",
  "--cache": ".cache/codepack/embeds",
  "--out": ".cache/codepack/clusters",
  "--sim-threshold": "0.82", // connect if cosine >= threshold
  "--k": "8", // top-k neighbors to consider per node
});

function unionFindClusters(ids: string[], edges: Array<[string, string]>) {
  const parent = new Map<string, string>(ids.map((i) => [i, i]));
  const find = (x: string): string =>
    parent.get(x) === x ? x : parent.set(x, find(parent.get(x)!)).get(x)!;
  const unite = (a: string, b: string) => {
    a = find(a);
    b = find(b);
    if (a !== b) parent.set(a, b);
  };
  edges.forEach(([a, b]) => unite(a, b));
  const groups = new Map<string, string[]>();
  ids.forEach((i) => {
    const r = find(i);
    (groups.get(r) ?? groups.set(r, []).get(r)!).push(i);
  });
  return Array.from(groups.values());
}

async function loadEmbeddings(
  blocks: readonly CodeBlock[],
  cachePath: string,
): Promise<EmbeddingMap> {
  const cache = await openLevelCache<number[]>({
    path: cachePath,
    namespace: "embeds",
  });
  const entries: EmbeddingMap = {};
  await Promise.all(
    blocks.map(async (b) => {
      const v = await cache.get(b.id);
      if (v) entries[b.id] = v;
    }),
  );
  await cache.close();
  return entries;
}

async function main() {
  const blocksPath = path.resolve(args["--blocks"] ?? ".cache/codepack/blocks");
  const cachePath = path.resolve(args["--cache"] ?? ".cache/codepack/embeds");
  const outPath = path.resolve(args["--out"] ?? ".cache/codepack/clusters");
  const TH = Number(args["--sim-threshold"] ?? "0.82");
  const K = Number(args["--k"] ?? "8");

  const blockCache = await openLevelCache<CodeBlock>({
    path: blocksPath,
    namespace: "blocks",
  });
  const blocks: CodeBlock[] = [];
  for await (const [, b] of blockCache.entries()) blocks.push(b);
  await blockCache.close();
  const embeds = await loadEmbeddings(blocks, cachePath);

  // build neighbor edges
  const available = blocks.filter((b) => embeds[b.id] !== undefined);
  const ids = available.map((b) => b.id);
  const edges: Array<[string, string]> = available.flatMap((a) => {
    const sourceVector = embeds[a.id];
    if (!sourceVector) {
      return [];
    }
    const scored = available
      .filter((b) => b.id !== a.id)
      .map((b) => {
        const targetVector = embeds[b.id];
        return targetVector
          ? { id: b.id, similarity: cosine(sourceVector, targetVector) }
          : null;
      })
      .filter(
        (entry): entry is { id: string; similarity: number } => entry !== null,
      )
      .sort((left, right) => right.similarity - left.similarity)
      .slice(0, K)
      .filter(({ similarity }) => similarity >= TH)
      .map(({ id }) => [a.id, id] as [string, string]);
    return scored;
  });

  const groups = unionFindClusters(ids, edges).filter((g) => g.length >= 1);
  const clusters: Cluster[] = groups.map((memberIds, i) => ({
    id: `cluster-${i + 1}`,
    memberIds,
  }));

  const clusterCache = await openLevelCache<Cluster>({
    path: outPath,
    namespace: "clusters",
  });
  await clusterCache.batch(
    clusters.map((c) => ({ type: "put" as const, key: c.id, value: c })),
  );
  await clusterCache.close();
  console.log(
    `clusters: ${clusters.length} groups -> ${path.relative(
      process.cwd(),
      outPath,
    )}`,
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
