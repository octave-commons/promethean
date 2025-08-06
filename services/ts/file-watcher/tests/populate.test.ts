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

test("populates new task files", async (t) => {
  process.env.NODE_ENV = "test";
  const { root, tasksDir } = await setupTempRepo();
  const calls: { script: string; args?: string[] }[] = [];

  const watchers = startFileWatcher({
    repoRoot: root,
    runPython: async (script, _capture, args) => {
      calls.push({ script, ...(args ? { args } : {}) });
      return undefined;
    },
    writeFile: async () => {},
    mongoCollection: { updateOne: async () => {} } as any,
    socket: { emit: () => {} } as any,
  });

  await delay(150);
  const newTask = join(tasksDir, "new_task.md");
  await fs.writeFile(newTask, "");
  await delay(300);

  t.true(
    calls.some(
      (c) =>
        c.script.includes("populate_task_ollama.py") && c.args?.[0] === newTask,
    ),
  );

  await watchers.boardWatcher.close();
  await watchers.tasksWatcher.close();
});
