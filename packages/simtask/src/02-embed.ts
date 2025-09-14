import { promises as fs } from "fs";
import * as path from "path";
import { pathToFileURL } from "url";

import { ollamaEmbed, parseArgs } from "@promethean/utils";

import type { ScanResult, EmbeddingMap } from "./types.js";

export type EmbedArgs = {
  "--in"?: string;
  "--out"?: string;
  "--embed-model"?: string;
  "--include-jsdoc"?: string;
  "--include-snippet"?: string;
};

export async function embed(args: EmbedArgs) {
  const IN = path.resolve(args["--in"] ?? ".cache/simtasks/functions.json");
  const OUT = path.resolve(args["--out"] ?? ".cache/simtasks/embeddings.json");
  const model = args["--embed-model"] ?? "nomic-embed-text:latest";
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
      withSnippet ? `CODE:\n${f.snippet}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    embeds[f.id] = await ollamaEmbed(model, text);
  }

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(embeds), "utf-8");
  console.log(
    `simtasks: embedded ${
      Object.keys(embeds).length
    } functions -> ${path.relative(process.cwd(), OUT)}`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const args = parseArgs({
    "--in": ".cache/simtasks/functions.json",
    "--out": ".cache/simtasks/embeddings.json",
    "--embed-model": "nomic-embed-text:latest",
    "--include-jsdoc": "true",
    "--include-snippet": "true",
  });
  embed(args).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
