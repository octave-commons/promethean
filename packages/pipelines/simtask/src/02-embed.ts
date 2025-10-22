import * as path from "path";
import { pathToFileURL } from "url";

import { openLevelCache } from "@promethean/level-cache";
import { ollamaEmbed, parseArgs } from "@promethean/utils";

import type { FunctionInfo } from "./types.js";

export type EmbedArgs = {
  "--in"?: string;
  "--out"?: string; // level cache directory
  "--embed-model"?: string;
  "--include-jsdoc"?: string;
  "--include-snippet"?: string;
};

export async function embed(args: Readonly<EmbedArgs>): Promise<void> {
  const IN = path.resolve(args["--in"] ?? ".cache/simtasks/functions");
  const CACHE_PATH = path.resolve(
    args["--out"] ?? ".cache/simtasks/embeddings",
  );
  const model = args["--embed-model"] ?? "nomic-embed-text:latest";
  const withDoc = args["--include-jsdoc"] === "true";
  const withSnippet = args["--include-snippet"] === "true";

  const scanCache = await openLevelCache<FunctionInfo[]>({ path: IN });
  const functions = (await scanCache.get("functions")) ?? [];
  await scanCache.close();
  const cache = await openLevelCache<number[]>({ path: CACHE_PATH });
  const toEmbed: typeof functions = [];
  for (const f of functions) {
    if (!(await cache.has(f.id))) toEmbed.push(f);
  }
  await Promise.all(
    toEmbed.map(async (f) => {
      const text = [
        `NAME: ${f.className ? f.className + "." : ""}${f.name}`,
        `KIND: ${f.kind}  EXPORTED: ${f.exported}`,
        f.signature ? `SIGNATURE: ${f.signature}` : "",
        `PACKAGE: ${f.pkgName}  FILE: ${f.fileRel}:${f.startLine}-${f.endLine}`,
        withDoc && f.jsdoc ? `JSDOC:\n${f.jsdoc}` : "",
        withSnippet ? `CODE:\n${f.snippet}` : "",
      ]
        .filter(Boolean)
        .join("\n");
      await cache.set(f.id, await ollamaEmbed(model, text));
    }),
  );
  await cache.close();
  console.log(
    `simtasks: embedded ${toEmbed.length} functions -> ${path.relative(
      process.cwd(),
      CACHE_PATH,
    )}`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = parseArgs({
    "--in": ".cache/simtasks/functions",
    "--out": ".cache/simtasks/embeddings",
    "--embed-model": "nomic-embed-text:latest",
    "--include-jsdoc": "true",
    "--include-snippet": "true",
  });
  embed(args).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
