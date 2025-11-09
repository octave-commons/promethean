import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import test from "ava";
import { sleep } from "@promethean/utils";

import {
  createIndexerManager,
  setIndexerStateStore,
  createMemoryStateStore,
  gatherRepoFiles,
} from "../../index.js";

const makeTempDir = async () => {
  const dir = path.join(process.cwd(), "tmp-indexer-core", randomUUID());
  await fs.mkdir(dir, { recursive: true });
  return dir;
};

test.beforeEach(() => {
  setIndexerStateStore(createMemoryStateStore());
});

test("gatherRepoFiles respects include and exclude globs", async (t) => {
  const dir = await makeTempDir();
  try {
    await fs.mkdir(path.join(dir, "nested"), { recursive: true });
    await fs.writeFile(path.join(dir, "keep.md"), "# keep\n");
    await fs.writeFile(path.join(dir, "nested", "ignore.md"), "# ignore\n");

    const { files } = await gatherRepoFiles(dir, {
      include: ["**/*.md"],
      exclude: ["nested/**"],
    });

    t.deepEqual(files.sort(), ["keep.md"], "only included files survive");
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
});

test("indexer manager processes files and exposes status", async (t) => {
  const dir = await makeTempDir();
  try {
    await fs.writeFile(path.join(dir, "doc.md"), "# hello\n");

    const manager = createIndexerManager();
    await manager.resetAndBootstrap(dir);

    while (manager.isBusy()) {
      await sleep(25);
    }

    const status = manager.status();
    t.is(status.mode, "indexed");
    t.is(status.bootstrap?.remaining, 0);
    t.false(manager.isBusy());
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
});
