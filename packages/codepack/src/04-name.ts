// src/04-name.ts
import * as path from "path";
import { z } from "zod";
import { openLevelCache } from "@promethean/level-cache";
import { parseArgs } from "./utils.js";
import type { CodeBlock, Cluster, NamedGroup } from "./types.js";
import { ollamaJSON } from "@promethean/utils";

const args = parseArgs({
  "--blocks": ".cache/codepack/blocks",
  "--clusters": ".cache/codepack/clusters",
  "--out": ".cache/codepack/names",
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

async function main() {
  const blocksPath = path.resolve(args["--blocks"] ?? ".cache/codepack/blocks");
  const clustersPath = path.resolve(
    args["--clusters"] ?? ".cache/codepack/clusters",
  );
  const outPath = path.resolve(args["--out"] ?? ".cache/codepack/names");
  const model = args["--gen-model"] ?? "qwen3:4b";
  const baseDir = args["--base-dir"] ?? "packages";

  const blockCache = await openLevelCache<CodeBlock>({
    path: blocksPath,
    namespace: "blocks",
  });
  const blocks: CodeBlock[] = [];
  for await (const [, b] of blockCache.entries()) blocks.push(b);
  await blockCache.close();
  const clusterCache = await openLevelCache<Cluster>({
    path: clustersPath,
    namespace: "clusters",
  });
  const clusters: Cluster[] = [];
  for await (const [, c] of clusterCache.entries()) clusters.push(c);
  await clusterCache.close();

  const byId = new Map(blocks.map((b) => [b.id, b]));

  const groups: NamedGroup[] = [];
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

  const nameCache = await openLevelCache<NamedGroup>({
    path: outPath,
    namespace: "names",
  });
  await nameCache.batch(
    groups.map((g) => ({
      type: "put" as const,
      key: g.clusterId,
      value: g,
    })),
  );
  await nameCache.close();
  console.log(
    `named ${groups.length} groups -> ${path.relative(process.cwd(), outPath)}`,
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
