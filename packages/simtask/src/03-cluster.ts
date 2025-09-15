import { promises as fs } from "fs";
import * as path from "path";
import { pathToFileURL } from "url";

import { openLevelCache } from "@promethean/level-cache";
import { cosine, parseArgs } from "@promethean/utils";

import type { FunctionInfo, Cluster } from "./types.js";

export type ClusterArgs = {
  "--scan"?: string;
  "--embeds"?: string; // level cache directory
  "--out"?: string;
  "--sim-threshold"?: string;
  "--k"?: string;
  "--min-size"?: string;
};

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

export async function cluster(args: Readonly<ClusterArgs>): Promise<void> {
  const SCAN = path.resolve(args["--scan"] ?? ".cache/simtasks/functions");
  const CACHE_PATH = path.resolve(
    args["--embeds"] ?? ".cache/simtasks/embeddings",
  );
  const OUT = path.resolve(args["--out"] ?? ".cache/simtasks/clusters.json");
  const TH = Number(args["--sim-threshold"] ?? "0.84");
  const K = Number(args["--k"] ?? "10");
  const MIN = Number(args["--min-size"] ?? "2");

  const fnCache = await openLevelCache<FunctionInfo[]>({ path: SCAN });
  const functions = (await fnCache.get("functions")) ?? [];
  await fnCache.close();
  const cache = await openLevelCache<number[]>({ path: CACHE_PATH });
  const embeds = new Map<string, number[]>();
  for (const f of functions) {
    const v = await cache.get(f.id);
    if (v) embeds.set(f.id, v);
  }
  await cache.close();

  const ids = functions.map((f) => f.id);
  const edges = buildEdges(functions, embeds, TH, K);
  const groups = unionFindClusters(ids, edges).filter((g) => g.length >= MIN);
  const clusters: Cluster[] = groups.map(clusterFromMembers(embeds));

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(clusters, null, 2), "utf-8");
  console.log(
    `simtasks: ${clusters.length} clusters -> ${path.relative(
      process.cwd(),
      OUT,
    )}`,
  );
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function buildEdges(
  functions: ReadonlyArray<FunctionInfo>,
  embeds: ReadonlyMap<string, number[]>,
  TH: number,
  K: number,
): Array<[string, string]> {
  return functions.flatMap((a) => {
    const av = embeds.get(a.id)!;
    return functions
      .filter((b) => b.id !== a.id)
      .map((b) => ({ id: b.id, s: cosine(av, embeds.get(b.id)!) }))
      .sort((x, y) => y.s - x.s)
      .slice(0, K)
      .filter(({ s }) => s >= TH)
      .map(({ id }) => [a.id, id] as [string, string]);
  });
}

const clusterFromMembers =
  (embeds: ReadonlyMap<string, number[]>) =>
  (members: string[], i: number): Cluster => {
    const sims = members.flatMap((idA, idx) =>
      members
        .slice(idx + 1)
        .map((idB) => cosine(embeds.get(idA)!, embeds.get(idB)!)),
    );
    const maxSim = round2(sims.reduce((m, s) => (s > m ? s : m), 0));
    const avgSim = round2(
      sims.length ? sims.reduce((sum, s) => sum + s, 0) / sims.length : 0,
    );
    return {
      id: `cluster-${i + 1}`,
      memberIds: members,
      maxSim,
      avgSim,
    };
  };

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = parseArgs({
    "--scan": ".cache/simtasks/functions",
    "--embeds": ".cache/simtasks/embeddings",
    "--out": ".cache/simtasks/clusters.json",
    "--sim-threshold": "0.84",
    "--k": "10",
    "--min-size": "2",
  });
  cluster(args).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
