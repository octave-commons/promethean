import test from "ava";
import request from "supertest";
import { promises as fs } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { installInMemoryPersistence } from "@promethean/test-utils/persistence.js";
import { createApp, handleTask } from "../src/index.js";

test("cold start and update (unit, no network)", async (t) => {
  t.timeout(10000);
  // Wire fakes into shared persistence
  const pers = installInMemoryPersistence();

  const repo = await fs.mkdtemp(join(tmpdir(), "mg-"));
  await fs.mkdir(join(repo, "docs"), { recursive: true });
  await fs.writeFile(join(repo, "readme.md"), `[One](docs/one.md) #root`);
  await fs.writeFile(join(repo, "docs", "one.md"), `[Two](two.md) #tag1`);
  await fs.writeFile(join(repo, "docs", "two.md"), `#tag2`);

  const app = await createApp(repo, true);
  const server = app.listen();
  const agent = request.agent(server);

  const links = await agent.get("/links/readme.md");
  t.deepEqual(links.body.links, ["docs/one.md"]);

  const tag = await agent.get("/hashtags/tag1");
  t.deepEqual(tag.body.files, ["docs/one.md"]);

  await handleTask(app, {
    payload: { path: "docs/two.md", content: "[One](../docs/one.md) #tag2" },
  });

  const links2 = await agent.get("/links/docs/two.md");
  t.deepEqual(links2.body.links, ["docs/one.md"]);

  await new Promise<void>((resolve) => server.close(() => resolve())).catch(
    () => {},
  );
  pers.dispose();
});
