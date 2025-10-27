import { promises as fs } from "fs";
import * as path from "path";

import { ollamaEmbed, ollamaJSON } from "@promethean-os/utils";

import { parseArgs, writeJSON } from "./utils.js";
import type { ScanOutput, ClassesFile, ClassEntry } from "./types.js";

const args = parseArgs({
  "--in": ".cache/cookbook/blocks.json",
  "--out": ".cache/cookbook/classes.json",
  "--embed-model": "nomic-embed-text:latest",
  "--llm": "qwen3:4b",
} as const);

async function main() {
  const scan = JSON.parse(
    await fs.readFile(path.resolve(args["--in"]), "utf-8"),
  ) as ScanOutput;

  const embeddings: Record<string, number[]> = {};
  const classes: Record<string, ClassEntry> = {};

  for (const b of scan.blocks) {
    const text = `FILE:${b.file}\nLANG:${b.lang}\n---\n${b.code}`;
    embeddings[b.id] = await ollamaEmbed(args["--embed-model"], text);

    const sys =
      "Classify code by task(use-case), runtime, and a short title. Return JSON: {task, runtime, title}";
    const user = [
      `LANG: ${b.lang}`,
      `FILE: ${b.file}`,
      `CONTEXT: ${b.context.slice(0, 400)}`,
      "CODE:",
      b.code.slice(0, 1500),
    ].join("\n");

    let obj: any;
    try {
      obj = await ollamaJSON(
        args["--llm"],
        `SYSTEM:\n${sys}\n\nUSER:\n${user}`,
      );
    } catch {
      obj = {
        task: "automate",
        runtime: b.lang === "bash" || b.lang === "sh" ? "shell" : "node@20",
        title: `${b.lang} snippet`,
      };
    }

    classes[b.id] = {
      id: b.id,
      task: (obj.task ?? "automate").toLowerCase(),
      runtime:
        obj.runtime ??
        (b.lang === "bash" || b.lang === "sh" ? "shell" : "node@20"),
      language: b.lang || "text",
      title: obj.title ?? "Recipe",
    };
  }

  const out: ClassesFile = {
    plannedAt: new Date().toISOString(),
    classes,
    embeddings,
  };
  await writeJSON(path.resolve(args["--out"]), out);
  console.log(
    `cookbook: classified ${Object.keys(classes).length} block(s) → ${
      args["--out"]
    }`,
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
