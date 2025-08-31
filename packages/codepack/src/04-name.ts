// src/04-name.ts
import { promises as fs } from "fs";
import * as path from "path";
import { z } from "zod";
import { parseArgs } from "./utils.js";
import type { BlockManifest, Cluster, NamePlan } from "./types.js";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";

const args = parseArgs({
  "--blocks": ".cache/codepack/blocks.json",
  "--clusters": ".cache/codepack/clusters.json",
  "--out": ".cache/codepack/names.json",
  "--gen-model": "qwen3:4b",
  "--base-dir": "packages", // suggested project-relative base
});

const GroupSchema = z.object({
  dir: z.string().min(1), // e.g., "packages/my-lib/src"
  files: z
    .array(
      z.object({
        id: z.string().min(1), // CodeBlock.id (we’ll map back)
        filename: z.string().min(1), // e.g., "index.ts"
      }),
    )
    .min(1),
  readme: z.string().min(1),
});

const ResponseSchema = z.object({
  groups: z.array(
    z.object({
      clusterId: z.string(),
      dir: z.string(),
      files: z.array(z.object({ id: z.string(), filename: z.string() })),
      readme: z.string(),
    }),
  ),
});

async function ollamaJSON(model: string, prompt: string) {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: { temperature: 0 },
      format: "json",
    }),
  });
  if (!res.ok) throw new Error(`ollama generate ${res.status}`);
  const data = await res.json();
  const text =
    typeof data.response === "string"
      ? data.response
      : JSON.stringify(data.response);
  const cleaned = text
    .replace(/```json\s*/g, "")
    .replace(/```\s*$/g, "")
    .trim();
  return JSON.parse(cleaned);
}

async function main() {
  const blocksPath = path.resolve(args["--blocks"]);
  const clustersPath = path.resolve(args["--clusters"]);
  const outPath = path.resolve(args["--out"]);
  const model = args["--gen-model"];
  const baseDir = args["--base-dir"];

  const { blocks }: BlockManifest = JSON.parse(
    await fs.readFile(blocksPath, "utf-8"),
  );
  const clusters: Cluster[] = JSON.parse(
    await fs.readFile(clustersPath, "utf-8"),
  );

  const byId = new Map(blocks.map((b) => [b.id, b]));

  const groups = [];
  for (const c of clusters) {
    // build concise prompt with hints
    const items = c.memberIds
      .map((id, i) => {
        const b = byId.get(id)!;
        const hint = b.hintedName ? `HINT:${b.hintedName}` : "";
        return [
          `### ITEM ${i + 1}`,
          `ID: ${id}`,
          `LANG: ${b.lang ?? ""}`,
          hint ? `${hint}` : "",
          `SRC: ${b.relPath}:${b.startLine}-${b.endLine}`,
          `CONTEXT_BEFORE:\n${b.contextBefore.trim()}`,
          `CODE:\n${b.code.trim().slice(0, 4000)}`, // keep prompt sane
          `CONTEXT_AFTER:\n${b.contextAfter.trim()}`,
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n\n");

    const sys = [
      "You group code blocks into a coherent folder and filenames.",
      `Return ONLY JSON: { dir, files:[{id, filename}], readme }`,
      `dir MUST be a POSIX path relative to '${baseDir}', no leading slash.`,
      "Use lowercase kebab or package conventions. Filenames should be valid for the language.",
      "If two blocks belong to same file, pick one filename and include both ids under that filename with -partN suffixes (we will stitch later).",
    ].join("\n");

    const prompt = `SYSTEM:\n${sys}\n\nUSER:\nCLUSTER: ${c.id}\n${items}\n\nReturn JSON for this cluster.`;

    let obj: any = await ollamaJSON(model, prompt);
    // validate core pieces quickly
    const dir = obj.dir as string;
    const files = obj.files as Array<{ id: string; filename: string }>;
    const readme = obj.readme as string;
    const parsed = GroupSchema.safeParse({ dir, files, readme });
    if (!parsed.success) {
      // fallback: trivial names
      obj = {
        dir: `${baseDir}/group-${c.id}`,
        files: c.memberIds.map((id, i) => ({
          id,
          filename: `file-${i + 1}.txt`,
        })),
        readme: `# ${c.id}\n\nAuto grouped.\n`,
      };
    }
    groups.push({ clusterId: c.id, ...obj });
  }

  const plan: NamePlan = { groups };
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(plan, null, 2), "utf-8");
  console.log(
    `named ${groups.length} groups -> ${path.relative(process.cwd(), outPath)}`,
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
