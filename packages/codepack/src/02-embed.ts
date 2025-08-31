// src/02-embed.ts
import { promises as fs } from "fs";
import * as path from "path";
import { parseArgs } from "./utils.js";
import type { BlockManifest, EmbeddingMap } from "./types.js";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

const args = parseArgs({
  "--blocks": ".cache/codepack/blocks.json",
  "--out": ".cache/codepack/embeddings.json",
  "--embed-model": "nomic-embed-text:latest",
  "--mix-context": "true", // include before/after in embedding
});

async function ollamaEmbed(model: string, text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt: text }),
  });
  if (!res.ok) throw new Error(`ollama embeddings ${res.status}`);
  const data = await res.json();
  return data.embedding as number[];
}

async function main() {
  const blocksPath = path.resolve(args["--blocks"]);
  const outPath = path.resolve(args["--out"]);
  const model = args["--embed-model"];
  const mix = args["--mix-context"] === "true";

  const { blocks }: BlockManifest = JSON.parse(
    await fs.readFile(blocksPath, "utf-8"),
  );
  const embeds: EmbeddingMap = {};

  for (const b of blocks) {
    if (embeds[b.id]) continue;
    const text = mix
      ? `FILE:${b.hintedName ?? ""}\nPATH:${b.relPath}\nLANG:${
          b.lang ?? ""
        }\nCONTEXT_BEFORE:\n${b.contextBefore}\nCODE:\n${
          b.code
        }\nCONTEXT_AFTER:\n${b.contextAfter}`
      : b.code;
    embeds[b.id] = await ollamaEmbed(model, text);
  }

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(embeds), "utf-8");
  console.log(
    `embedded ${Object.keys(embeds).length} blocks -> ${path.relative(
      process.cwd(),
      outPath,
    )}`,
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
