import test from "ava";
import { tmpdir } from "os";
import { join } from "path";
import { promises as fs } from "fs";
import { startFileWatcher } from "../src/index.js";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function setupTempRepo() {
  const root = await fs.mkdtemp(join(tmpdir(), "fw-"));
  const boardDir = join(root, "docs", "agile", "boards");
  const tasksDir = join(root, "docs", "agile", "tasks");
  await fs.mkdir(boardDir, { recursive: true });
  await fs.mkdir(tasksDir, { recursive: true });
  await fs.writeFile(join(boardDir, "kanban.md"), "");
  return { root, tasksDir };
}

test("limits concurrent LLM tasks", async (t) => {
  process.env.NODE_ENV = "test";
  const { root, tasksDir } = await setupTempRepo();
  let active = 0;
  let max = 0;

  const watchers = startFileWatcher({
    repoRoot: root,
    runPython: async () => undefined,
    callLLM: async () => {
      active++;
      if (active > max) max = active;
      await delay(50);
      active--;
      return "#Todo\n";
    },
    writeFile: async () => {},
    mongoCollection: { updateOne: async () => {} } as any,
    socket: { emit: () => {} } as any,
    maxConcurrentLLMTasks: 1,
  });

  await delay(150);
  await fs.writeFile(join(tasksDir, "a.md"), "");
  await fs.writeFile(join(tasksDir, "b.md"), "");
  await fs.writeFile(join(tasksDir, "c.md"), "");
  await delay(400);

  t.is(max, 1);
  await watchers.close();
});
