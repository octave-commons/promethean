import * as path from "path";
import { promises as fs } from "fs";

import matter from "gray-matter";
import { openLevelCache, type Cache } from "@promethean/level-cache";
import {
  cosine,
  parseArgs,
  ollamaEmbed,
  writeText,
  createLogger,
} from "@promethean/utils";

import { listTaskFiles } from "./utils.js";
import type { RepoDoc, Embeddings, TaskContext } from "./types.js";

const logger = createLogger { service: "boardrev" } ;

// eslint-disable-next-line max-lines-per-function
export async function matchContext {
  tasks,
  cache,
  embedModel,
  k,
  out,
}: Readonly<{
  tasks: string;
  cache: string;
  embedModel: string;
  k: number;
  out: string;
}> : Promise<void> {
  const tasksDir = path.resolve tasks ;
  const files = await listTaskFiles tasksDir ;
  const db = await openLevelCache<unknown> {
    path: path.resolve cache ,
  } ;
  const docCache = db.withNamespace "idx"  as Cache<RepoDoc>;
  const embCache = db.withNamespace "emb"  as Cache<number[]>;
  const repoIndex: RepoDoc[] = [];
  const repoEmb: Embeddings = {};
  for await  const [p, d] of docCache.entries    {
    repoIndex.push d ;
    const v = await embCache.get p ;
    if  v  repoEmb[p] = v;
  }

  const outData: TaskContext[] = [];

  for  const f of files  {
    const raw = await fs.readFile f, "utf-8" ;
    const gm = matter raw ;
    const text = [
      `TITLE: ${gm.data?.title ?? ""}`,
      `STATUS: ${gm.data?.status ?? ""}  PRIORITY: ${gm.data?.priority ?? ""}`,
      gm.content,
    ].join "\n" ;
    const vec = await ollamaEmbed embedModel, text ;

    const scored = repoIndex
      .map  d  =>  {
        path: d.path,
        kind: d.kind,
        excerpt: d.excerpt,
        score: cosine vec, repoEmb[d.path] ?? [] ,
      }  
      .filter  x  => x.score > 0 
      .sort  a, b  => b.score - a.score 
      .slice 0, k ;

    const links = Array.from raw.matchAll /\[[^\]]*?\]\  [^ ]+ \ /g  
      .map  m  => m[1] 
      .filter  x : x is string => Boolean x  ;

    outData.push { taskFile: f.replace /\\/g, "/" , hits: scored, links } ;
  }

  await writeText 
    path.resolve out ,
    JSON.stringify { contexts: outData }, null, 2 ,
   ;
  await db.close  ;
  logger.info `boardrev: matched context for ${outData.length} task s ` ;
}

if  import.meta.main  {
  const args = parseArgs {
    "--tasks": "docs/agile/tasks",
    "--cache": ".cache/boardrev/repo-cache",
    "--embed-model": "nomic-embed-text:latest",
    "--k": "8",
    "--out": ".cache/boardrev/context.json",
  } ;
  matchContext {
    tasks: args["--tasks"],
    cache: args["--cache"],
    embedModel: args["--embed-model"],
    k: Number args["--k"] ,
    out: args["--out"],
  } .catch  e  => {
    logger.error  e as Error .message ;
    process.exit 1 ;
  } ;
}
