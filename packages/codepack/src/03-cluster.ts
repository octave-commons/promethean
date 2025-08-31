// src/03-cluster.ts
import { promises as fs } from "fs";
import * as path from "path";
import { parseArgs, cosine } from "./utils.js";
import type { BlockManifest, EmbeddingMap, Cluster } from "./types.js";

const args = parseArgs({
  "--blocks": ".cache/codepack/blocks.json",
  "--embeds": ".cache/codepack/embeddings.json",
  "--out": ".cache/codepack/clusters.json",
  "--sim-threshold": "0.82", // connect if cosine >= threshold
  "--k": "8"                  // top-k neighbors to consider per node
});

function unionFindClusters(ids: string[], edges: Array<[string,string]>) {
  const parent = new Map<string,string>(ids.map(i => [i,i]));
  const find = (x:string):string => parent.get(x)===x ? x : parent.set(x, find(parent.get(x)!)).get(x)!;
  const unite = (a:string,b:string) => { a=find(a); b=find(b); if(a!==b) parent.set(a,b); };
  edges.forEach(([a,b])=>unite(a,b));
  const groups = new Map<string,string[]>();
  ids.forEach(i => {
    const r = find(i);
    (groups.get(r) ?? groups.set(r, []).get(r)!).push(i);
  });
  return Array.from(groups.values());
}

async function main() {
  const blocksPath = path.resolve(args["--blocks"]);
  const embedsPath = path.resolve(args["--embeds"]);
  const outPath = path.resolve(args["--out"]);
  const TH = Number(args["--sim-threshold"]);
  const K = Number(args["--k"]);

  const { blocks }: BlockManifest = JSON.parse(await fs.readFile(blocksPath,"utf-8"));
  const embeds: EmbeddingMap = JSON.parse(await fs.readFile(embedsPath,"utf-8"));

  // build neighbor edges
  const ids = blocks.map(b => b.id);
  const edges: Array<[string,string]> = [];

  for (const a of blocks) {
    const av = embeds[a.id];
    const scores = blocks
      .filter(b => b.id !== a.id)
      .map(b => ({ id: b.id, s: cosine(av, embeds[b.id]) }))
      .sort((x,y)=>y.s-x.s)
      .slice(0, K);
    for (const {id, s} of scores) {
      if (s >= TH) edges.push([a.id, id]);
    }
  }

  const groups = unionFindClusters(ids, edges).filter(g => g.length >= 1);
  const clusters: Cluster[] = groups.map((memberIds, i) => ({
    id: `cluster-${i+1}`,
    memberIds
  }));

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(clusters, null, 2), "utf-8");
  console.log(`clusters: ${clusters.length} groups -> ${path.relative(process.cwd(), outPath)}`);
}
main().catch(e => { console.error(e); process.exit(1); });
