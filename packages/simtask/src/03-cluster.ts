// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable no-console */
import { promises as fs } from "fs";
import * as path from "path";
import { parseArgs, cosine } from "./utils.js";
import type { ScanResult, EmbeddingMap, Cluster } from "./types.js";

const args = parseArgs({
  "--scan": ".cache/simtasks/functions.json",
  "--embeds": ".cache/simtasks/embeddings.json",
  "--out": ".cache/simtasks/clusters.json",
  "--sim-threshold": "0.84",
  "--k": "10",
  "--min-size": "2"
});

function unionFindClusters(ids: string[], edges: Array<[string,string]>) {
  const parent = new Map<string,string>(ids.map(i => [i,i]));
  const find = (x:string):string => parent.get(x)===x ? x : parent.set(x, find(parent.get(x)!)).get(x)!;
  const unite = (a:string,b:string) => { a=find(a); b=find(b); if(a!==b) parent.set(a,b); };
  edges.forEach(([a,b])=>unite(a,b));
  const groups = new Map<string,string[]>();
  ids.forEach(i => { const r=find(i); (groups.get(r) ?? groups.set(r,[]).get(r)!).push(i); });
  return Array.from(groups.values());
}

async function main() {
  const SCAN = path.resolve(args["--scan"]);
  const EMB = path.resolve(args["--embeds"]);
  const OUT = path.resolve(args["--out"]);
  const TH = Number(args["--sim-threshold"]);
  const K = Number(args["--k"]);
  const MIN = Number(args["--min-size"]);

  const { functions } = JSON.parse(await fs.readFile(SCAN, "utf-8")) as ScanResult;
  const embeds: EmbeddingMap = JSON.parse(await fs.readFile(EMB, "utf-8"));

  const ids = functions.map(f => f.id);
  const byId = new Map(functions.map(f => [f.id, f]));
  const edges: Array<[string,string]> = [];
  const clusterStats: Record<string, number[]> = {}; // for avg/max later

  for (const a of functions) {
    const av = embeds[a.id];
    const scores = functions
      .filter(b => b.id !== a.id)
      .map(b => ({ id: b.id, s: cosine(av, embeds[b.id]) }))
      .sort((x,y)=>y.s-x.s)
      .slice(0, K);
    for (const {id, s} of scores) {
      if (s >= TH) edges.push([a.id, id]);
    }
  }

  const groups = unionFindClusters(ids, edges).filter(g => g.length >= MIN);
  const clusters: Cluster[] = groups.map((members, i) => {
    // compute stats
    let maxSim = 0, sum = 0, cnt = 0;
    for (let x=0;x<members.length;x++) {
      for (let y=x+1;y<members.length;y++) {
        const s = cosine(embeds[members[x]], embeds[members[y]]);
        if (s > maxSim) maxSim = s;
        sum += s; cnt++;
      }
    }
    const avg = cnt ? sum / cnt : 0;
    return { id: `cluster-${i+1}`, memberIds: members, maxSim: round2(maxSim), avgSim: round2(avg) };
  });

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(clusters, null, 2), "utf-8");
  console.log(`simtasks: ${clusters.length} clusters -> ${path.relative(process.cwd(), OUT)}`);
}

function round2(n: number) { return Math.round(n*100)/100; }

main().catch((e) => { console.error(e); process.exit(1); });
