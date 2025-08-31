/* eslint-disable no-console */
import { promises as fs } from "fs";
import * as path from "path";
import { parseArgs, OLLAMA_URL } from "./utils.js";
import type { ScanResult, EmbeddingMap } from "./types.js";

const args = parseArgs({
  "--in": ".cache/simtasks/functions.json",
  "--out": ".cache/simtasks/embeddings.json",
  "--embed-model": "nomic-embed-text:latest",
  "--include-jsdoc": "true",
  "--include-snippet": "true"
});

async function ollamaEmbed(model: string, text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt: text })
  });
  if (!res.ok) throw new Error(`ollama embeddings ${res.status}`);
  const data: any = await res.json();
  return data.embedding as number[];
}

async function main() {
  const IN = path.resolve(args["--in"]);
  const OUT = path.resolve(args["--out"]);
  const model = args["--embed-model"];
  const withDoc = args["--include-jsdoc"] === "true";
  const withSnippet = args["--include-snippet"] === "true";

  const { functions }: ScanResult = JSON.parse(await fs.readFile(IN, "utf-8"));
  const embeds: EmbeddingMap = {};

  for (const f of functions) {
    if (embeds[f.id]) continue;
    const text = [
      `NAME: ${f.className ? f.className + "." : ""}${f.name}`,
      `KIND: ${f.kind}  EXPORTED: ${f.exported}`,
      f.signature ? `SIGNATURE: ${f.signature}` : "",
      `PACKAGE: ${f.pkgName}  FILE: ${f.fileRel}:${f.startLine}-${f.endLine}`,
      withDoc && f.jsdoc ? `JSDOC:\n${f.jsdoc}` : "",
      withSnippet ? `CODE:\n${f.snippet}` : ""
    ].filter(Boolean).join("\n");
    embeds[f.id] = await ollamaEmbed(model, text);
  }

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(embeds), "utf-8");
  console.log(`simtasks: embedded ${Object.keys(embeds).length} functions -> ${path.relative(process.cwd(), OUT)}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
