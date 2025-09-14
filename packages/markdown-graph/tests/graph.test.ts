import { promises as fs } from "fs";
import { join } from "path";
import { tmpdir } from "os";

import test from "ava";
import { installInMemoryPersistence } from "@promethean/test-utils/persistence.js";

test("cold start and update (unit, no network)", async (t) => {
  t.timeout(10000);
  // Wire fakes into shared persistence
  const pers = installInMemoryPersistence();
  process.env.NODE_ENV = "test";
  const { ContextStore } = await import("@promethean/persistence");
  const { GraphDB } = await import("../src/graph.js");
  const store = new ContextStore();

  const repo = await fs.mkdtemp(join(tmpdir(), "mg-"));
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

  pers.dispose();
});
