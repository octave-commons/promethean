import { promises as fs } from "fs";
import * as os from "os";
import * as path from "path";

import test from "ava";
import matter from "gray-matter";

import { ensureFM } from "../01-ensure-fm.js";
import { Priority, type TaskFM } from "../types.js";

async function tmpdir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "boardrev-test-"));
}

test("fills missing priority and status with defaults", async (t) => {
  const dir = await tmpdir();
  const file = path.join(dir, "task.md");
  await fs.writeFile(file, "---\ntitle: t\n---\nbody\n");

  const updated = await ensureFM({
    dir,
    defaultPriority: Priority.P2,
    defaultStatus: "backlog",
  });
  t.is(updated, 1);

  const gm = matter(await fs.readFile(file, "utf8"));
  const fm = gm.data as TaskFM;
  t.is(fm.priority, Priority.P2);
  t.is(fm.status, "backlog");
});

test("normalizes default status", async (t) => {
  const dir = await tmpdir();
  const file = path.join(dir, "task.md");
  await fs.writeFile(file, "---\ntitle: t\n---\nbody\n");

  await ensureFM({
    dir,
    defaultPriority: Priority.P3,
    defaultStatus: "ToDo",
  });

  const gm = matter(await fs.readFile(file, "utf8"));
  const fm = gm.data as TaskFM;
  t.is(fm.status, "todo");
});
