import { promises as fs } from "fs";
import { join } from "path";
import { tmpdir } from "os";

import test from "ava";
import { installInMemoryPersistence } from "@promethean/test-utils/persistence.js";
import { ContextStore } from "@promethean/persistence";
import { GraphDB } from "../dist/graph.js";

test.serial("cold start and update (unit, no network)", async (t) => {
  t.timeout(10000);
  const pers = installInMemoryPersistence();
  t.teardown(() => {
    pers.dispose();
  });
  const store = new ContextStore();

  const repo = await fs.mkdtemp(join(tmpdir(), "mg-"));
  t.teardown(async () => {
    await fs.rm(repo, { recursive: true, force: true });
  });
  await fs.mkdir(join(repo, "docs"), { recursive: true });
  await fs.writeFile(join(repo, "readme.md"), `[One](docs/one.md) #root`);
  await fs.writeFile(join(repo, "docs", "one.md"), `[Two](two.md) #tag1`);
  await fs.writeFile(join(repo, "docs", "two.md"), `#tag2`);

  const db = await GraphDB.create(repo, store);
  await db.coldStart();

  const links = await db.getLinks("readme.md");
  t.deepEqual(links, ["docs/one.md"]);

  const files = await db.getFilesWithTag("tag1");
  t.deepEqual(files, ["docs/one.md"]);

  await db.updateFile("docs/two.md", "[One](../docs/one.md) #tag2");

  const links2 = await db.getLinks("docs/two.md");
  t.deepEqual(links2, ["docs/one.md"]);
});

test.serial(
  "updateFile handles degenerate markdown input (unit, no network)",
  async (t) => {
    t.timeout(10000);
    const pers = installInMemoryPersistence();
    t.teardown(() => {
      pers.dispose();
    });
    const store = new ContextStore();

    const repo = await fs.mkdtemp(join(tmpdir(), "mg-"));
    t.teardown(async () => {
      await fs.rm(repo, { recursive: true, force: true });
    });
    await fs.writeFile(join(repo, "readme.md"), "#root");

    const db = await GraphDB.create(repo, store);

    const hostile = "[".repeat(5000) + "](" + "[".repeat(5000);
    await t.notThrowsAsync(async () => db.updateFile("storm.md", hostile));

    const links = await db.getLinks("storm.md");
    t.deepEqual(links, []);
  },
);
