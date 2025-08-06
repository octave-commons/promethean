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
  await fs.writeFile(join(tasksDir, "task.md"), "");
  return {
    root,
    boardFile: join(boardDir, "kanban.md"),
    taskFile: join(tasksDir, "task.md"),
  };
}

test("ignores board changes caused by watcher", async (t) => {
  process.env.NODE_ENV = "test";
  const { root, taskFile } = await setupTempRepo();
  const calls: string[] = [];

  const watchers = startFileWatcher({
    repoRoot: root,
    runPython: async (script, _capture, _args) => {
      calls.push(script);
      if (script.includes("hashtags_to_kanban.py")) {
        return "board";
      }
      return undefined;
    },
    mongoCollection: { updateOne: async () => {} } as any,
    socket: { emit: () => {} } as any,
  });

  await delay(150);
  await fs.writeFile(taskFile, "update");
  await delay(300);

  t.is(calls.length, 1);
  t.true(calls[0]!.includes("hashtags_to_kanban.py"));

  await watchers.boardWatcher.close();
  await watchers.tasksWatcher.close();
});

test("ignores task changes caused by watcher", async (t) => {
  process.env.NODE_ENV = "test";
  const { root, boardFile, taskFile } = await setupTempRepo();
  const calls: string[] = [];

  const watchers = startFileWatcher({
    repoRoot: root,
    runPython: async (script, _capture, _args) => {
      calls.push(script);
      if (script.includes("kanban_to_hashtags.py")) {
        await fs.writeFile(taskFile, "updated");
      }
      return undefined;
    },
    mongoCollection: { updateOne: async () => {} } as any,
    socket: { emit: () => {} } as any,
  });

  await delay(150);
  await fs.writeFile(boardFile, "change");
  await delay(300);

  t.is(calls.length, 1);
  t.true(calls[0]!.includes("kanban_to_hashtags.py"));

  await watchers.boardWatcher.close();
  await watchers.tasksWatcher.close();
});
