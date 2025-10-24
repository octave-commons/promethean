import { promises as fs } from "fs";
import * as path from "path";

import { cosine } from "@promethean-os/utils";

import { parseArgs, writeJSON } from "./utils.js";
import type { ClassesFile, GroupsFile, Group } from "./types.js";

const args = parseArgs({
  "--in": ".cache/cookbook/classes.json",
  "--out": ".cache/cookbook/groups.json",
  "--min-sim": "0.82",
  "--max-size": "12",
} as const);

async function main() {
  const cf = JSON.parse(
    await fs.readFile(path.resolve(args["--in"]), "utf-8"),
  ) as ClassesFile;
  const ids = Object.keys(cf.classes);
  const seen = new Set<string>();
  const groups: Group[] = [];
  const minSim = Number(args["--min-sim"]);
  const maxSize = Number(args["--max-size"]);

  for (const id of ids) {
    if (seen.has(id)) continue;
    const seed = cf.classes[id]!;
    const key = `${seed.task}|${seed.runtime}|${seed.language}`;
    const centroid = cf.embeddings[id];
    const members = [id];

    // greedy nearest neighbors within same key
    for (const other of ids) {
      if (id === other || seen.has(other)) continue;
      const c = cf.classes[other]!;
      if (`${c.task}|${c.runtime}|${c.language}` !== key) continue;
      const sim = cosine(centroid ?? [], cf.embeddings[other] ?? []);
      if (sim >= minSim) members.push(other);
      if (members.length >= maxSize) break;
    }

    members.forEach((m) => seen.add(m));
    const g: Group = centroid
      ? { key, blockIds: members, centroid }
      : { key, blockIds: members };
    groups.push(g);
  }

  const out: GroupsFile = { groupedAt: new Date().toISOString(), groups };
  await writeJSON(path.resolve(args["--out"]), out);
  console.log(`cookbook: formed ${groups.length} group(s) → ${args["--out"]}`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
