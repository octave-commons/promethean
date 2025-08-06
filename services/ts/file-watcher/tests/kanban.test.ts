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
  await fs.writeFile(join(boardDir, "kanban.md"), "\n");
  return { root, boardFile: join(boardDir, "kanban.md"), tasksDir };
}

test("creates task and emits event for new card", async (t) => {
  process.env.NODE_ENV = "test";
  const { root, boardFile, tasksDir } = await setupTempRepo();
  const events: any[] = [];

  const watchers = startFileWatcher({
    repoRoot: root,
    runPython: async () => {},
    mongoCollection: { updateOne: async () => {} } as any,
    socket: {
      emit: (evt: string, payload: any) => events.push({ evt, payload }),
    } as any,
    initialParse: false,
  });

  await delay(50);
  await fs.writeFile(boardFile, "## Todo\n- [ ] Test task\n");
  await delay(300);

  const files = await fs.readdir(tasksDir);
  t.true(files.length === 1);
  t.true(events.some((e) => e.evt === "kanban:cardCreated"));

  await watchers.boardWatcher.close();
  await watchers.tasksWatcher.close();
});
