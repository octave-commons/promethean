import { readFile } from "node:fs/promises";

import { loadKanbanConfig } from "./config.js";

type IndexedTask = {
  id: string;
  title: string;
  status: string;
  owner: string;
  labels: ReadonlyArray<string>;
  path: string;
};

const readIndex = async (
  indexFile: string,
): Promise<ReadonlyArray<IndexedTask>> => {
  const data = await readFile(indexFile, "utf8").catch(() => "");
  return data
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as IndexedTask);
};

const main = async (): Promise<void> => {
  const { config, restArgs } = await loadKanbanConfig();
  const args = new Set(restArgs);
  const apply = args.has("--apply");
  const tasks = await readIndex(config.indexFile);
  if (tasks.length === 0) {
    console.error(
      "No index found. Run: pnpm tsx packages/kanban/src/board/indexer.ts --write",
    );
    process.exit(1);
  }
  const plan = tasks.map((task) => ({
    action: "ensure-issue",
    id: task.id,
    title: task.title,
    labels: task.labels,
    status: task.status,
  }));
  if (apply) {
    console.log(
      JSON.stringify({ wouldApply: true, count: plan.length }, null, 2),
    );
    return;
  }
  console.log(
    JSON.stringify(
      { dryRun: true, count: plan.length, sample: plan.slice(0, 3) },
      null,
      2,
    ),
  );
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
