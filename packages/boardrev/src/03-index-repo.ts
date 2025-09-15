import * as path from "path";
import { pathToFileURL } from "url";
import { promises as fs } from "fs";

import { globby } from "globby";
import { openLevelCache, type Cache } from "@promethean/level-cache";
import { ollamaEmbed, parseArgs, createLogger } from "@promethean/utils";

import type { RepoDoc } from "./types.js";

const logger = createLogger({ service: "boardrev" });

export async function indexRepo({
  globs,
  maxBytes,
  maxLines,
  embedModel,
  cache,
}: Readonly<{
  globs: string;
  maxBytes: number;
  maxLines: number;
  embedModel: string;
  cache: string;
}>): Promise<void> {
  const files = await globby(globs.split(",").map((s) => s.trim()));
  const db = await openLevelCache<unknown>({
    path: path.resolve(cache),
  });
  const docCache = db.withNamespace("idx") as Cache<RepoDoc>;
  const embCache = db.withNamespace("emb") as Cache<number[]>;

  const indexed = await Promise.all<number>(
    files.map(async (f): Promise<number> => {
      const st = await fs.stat(f);
      if (st.size > maxBytes) return 0;
      const raw = await fs.readFile(f, "utf-8");
      const excerpt = raw.split(/\r?\n/).slice(0, maxLines).join("\n");
      const kind = /\.(md|mdx)$/i.test(f) ? "doc" : "code";
      const doc: RepoDoc = {
        path: f.replace(/\\/g, "/"),
        size: st.size,
        kind,
        excerpt,
      };
      await docCache.set(doc.path, doc);
      if (!(await embCache.has(doc.path))) {
        const text = `PATH: ${doc.path}\nKIND: ${doc.kind}\n---\n${doc.excerpt}`;
        await embCache.set(doc.path, await ollamaEmbed(embedModel, text));
      }
      return 1;
    }),
  ).then((arr) => arr.reduce((a, b) => a + b, 0));

  await db.close();
  logger.info(`boardrev: indexed ${indexed} repo docs`);
}

if (import.meta.url === pathToFileURL(process.argv[1]!).href) {
  const args = parseArgs({
    "--globs":
      "{README.md,docs/**/*.md,packages/**/{src,lib}/**/*.{ts,tsx,js,jsx}}",
    "--max-bytes": "200000",
    "--max-lines": "400",
    "--embed-model": "nomic-embed-text:latest",
    "--cache": ".cache/boardrev/repo-cache",
  });
  indexRepo({
    globs: args["--globs"],
    maxBytes: Number(args["--max-bytes"]),
    maxLines: Number(args["--max-lines"]),
    embedModel: args["--embed-model"],
    cache: args["--cache"],
  }).catch((e) => {
    logger.error((e as Error).message);
    process.exit(1);
  });
}
