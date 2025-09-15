// src/03-cluster.ts
import { promises as fs } from "fs";
import * as path from "path";

import { cosine } from "@promethean/utils";
import { openLevelCache } from "@promethean/level-cache";

import { parseArgs } from "./utils.js";
import type { BlockManifest, EmbeddingMap, Cluster } from "./types.js";

const args = parseArgs({
  "--blocks": ".cache/codepack/blocks.json",
  "--cache": ".cache/codepack/embeds",
  "--out": ".cache/codepack/clusters.json",
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
  blocks: readonly BlockManifest["blocks"],
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
  const blocksPath = path.resolve(args["--blocks"]);
  const cachePath = path.resolve(args["--cache"]);
  const outPath = path.resolve(args["--out"]);
  const TH = Number(args["--sim-threshold"]);
  const K = Number(args["--k"]);

  const manifest = JSON.parse(
    await fs.readFile(blocksPath, "utf-8"),
  ) as BlockManifest;
  const { blocks } = manifest;
  const embeds = await loadEmbeddings(blocks, cachePath);

  // build neighbor edges
  const available = blocks.filter((b) => embeds[b.id] !== undefined);
  const ids = available.map((b) => b.id);
  const edges: Array<[string, string]> = available.flatMap((a) => {
    const av = embeds[a.id];
    return available
      .filter((b) => b.id !== a.id)
      .map((b) => ({ id: b.id, s: cosine(av, embeds[b.id]) }))
      .sort((x, y) => y.s - x.s)
      .slice(0, K)
      .filter(({ s }) => s >= TH)
      .map(({ id }) => [a.id, id] as [string, string]);
  });

  const groups = unionFindClusters(ids, edges).filter((g) => g.length >= 1);
  const clusters: Cluster[] = groups.map((memberIds, i) => ({
    id: `cluster-${i + 1}`,
    memberIds,
  }));

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(clusters, null, 2), "utf-8");
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
