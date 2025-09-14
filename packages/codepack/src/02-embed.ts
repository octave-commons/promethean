// src/02-embed.ts
import { promises as fs } from "fs";
import * as path from "path";

import { ollamaEmbed } from "@promethean/utils";
import { openLevelCache } from "@promethean/level-cache";

import { parseArgs } from "./utils.js";
import type { BlockManifest } from "./types.js";

const args = parseArgs({
  "--blocks": ".cache/codepack/blocks.json",
  "--cache": ".cache/codepack/embeds",
  "--embed-model": "nomic-embed-text:latest",
  "--mix-context": "true", // include before/after in embedding
});

async function main() {
  const blocksPath = path.resolve(args["--blocks"]);
  const cachePath = path.resolve(args["--cache"]);
  const model = args["--embed-model"];
  const mix = args["--mix-context"] === "true";

  const manifest = JSON.parse(
    await fs.readFile(blocksPath, "utf-8"),
  ) as BlockManifest;
  const { blocks } = manifest;

  const cache = await openLevelCache<number[]>({
    path: cachePath,
    namespace: "embeds",
  });

  const wrote = await Promise.all(
    blocks.map(async (b) => {
      if (await cache.has(b.id)) return false;
      const text = mix
        ? `FILE:${b.hintedName ?? ""}\nPATH:${b.relPath}\nLANG:${
            b.lang ?? ""
          }\nCONTEXT_BEFORE:\n${b.contextBefore}\nCODE:\n${
            b.code
          }\nCONTEXT_AFTER:\n${b.contextAfter}`
        : b.code;
      await cache.set(b.id, await ollamaEmbed(model, text));
      return true;
    }),
  );

  await cache.close();
  const count = wrote.filter(Boolean).length;
  console.log(
    `embedded ${count} blocks -> ${path.relative(process.cwd(), cachePath)}`,
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
