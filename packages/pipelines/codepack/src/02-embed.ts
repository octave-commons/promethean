// src/02-embed.ts
import * as path from "path";

import { ollamaEmbed } from "@promethean/utils";
import { openLevelCache } from "@promethean/level-cache";

import { parseArgs } from "./utils.js";
import type { CodeBlock } from "./types.js";

const args = parseArgs({
  "--blocks": ".cache/codepack/blocks",
  "--cache": ".cache/codepack/embeds",
  "--embed-model": "nomic-embed-text:latest",
  "--mix-context": "true", // include before/after in embedding
});

async function main() {
  const blocksPath = path.resolve(args["--blocks"] ?? ".cache/codepack/blocks");
  const cachePath = path.resolve(args["--cache"] ?? ".cache/codepack/embeds");
  const model = args["--embed-model"] ?? "nomic-embed-text:latest";
  const mix = (args["--mix-context"] ?? "true") === "true";

  const blockCache = await openLevelCache<CodeBlock>({
    path: blocksPath,
    namespace: "blocks",
  });
  const blocks: CodeBlock[] = [];
  for await (const [, b] of blockCache.entries()) blocks.push(b);
  await blockCache.close();

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
