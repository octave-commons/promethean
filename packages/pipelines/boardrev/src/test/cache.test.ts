import { promises as fs } from "fs";
import * as os from "os";
import * as path from "path";

import test from "ava";
import esmock from "esmock";
import { openLevelCache } from "@promethean/level-cache";

async function tmpdir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "boardrev-cache-"));
}

async function stubUtils() {
  const utils = await import("@promethean/utils");
  const stub: Readonly<typeof utils> = {
    ...utils,
    ollamaEmbed: async () => [1, 1],
  };
  return stub;
}

test("indexRepo writes docs and embeddings to level cache", async (t) => {
  const dir = await tmpdir();
  const cacheDir = path.join(dir, "cache");
  const file = path.join(dir, "README.md");
  await fs.writeFile(file, "hello\nworld");

  const stub = await stubUtils();
  const mod = await esmock<typeof import("../03-index-repo.js")>(
    new URL("../03-index-repo.js", import.meta.url).pathname,
    { "@promethean/utils": stub },
  );
  const { indexRepo } = mod;
  await indexRepo({
    globs: file,
    maxBytes: 1000,
    maxLines: 10,
    embedModel: "x",
    cache: cacheDir,
  });

  const cache = await openLevelCache<unknown>({ path: cacheDir });
  const docs = cache.withNamespace("idx");
  const emb = cache.withNamespace("emb");
  const key = file.replace(/\\/g, "/");
  t.truthy(await docs.get(key));
  t.deepEqual(await emb.get(key), [1, 1]);
  await cache.close();
});

test("matchContext reads from level cache", async (t) => {
  const dir = await tmpdir();
  const cacheDir = path.join(dir, "cache");
  const file = path.join(dir, "README.md");
  await fs.writeFile(file, "hello\nworld");
  const stub = await stubUtils();
  const mod1 = await esmock<typeof import("../03-index-repo.js")>(
    new URL("../03-index-repo.js", import.meta.url).pathname,
    { "@promethean/utils": stub },
  );
  const { indexRepo } = mod1;
  await indexRepo({
    globs: file,
    maxBytes: 1000,
    maxLines: 10,
    embedModel: "x",
    cache: cacheDir,
  });
  const mod2 = await esmock<typeof import("../04-match-context.js")>(
    new URL("../04-match-context.js", import.meta.url).pathname,
    { "@promethean/utils": stub },
  );
  const { matchContext } = mod2;
  const tasksDir = path.join(dir, "tasks");
  await fs.mkdir(tasksDir);
  const taskFile = path.join(tasksDir, "task.md");
  await fs.writeFile(
    taskFile,
    "---\ntitle: t\nstatus: todo\npriority: P1\n---\nbody\n",
  );
  const outFile = path.join(dir, "out.json");
  await matchContext({
    tasks: tasksDir,
    cache: cacheDir,
    embedModel: "x",
    k: 1,
    out: outFile,
  });
  const out = JSON.parse(await fs.readFile(outFile, "utf-8")) as {
    contexts?: { hits?: { path: string }[] }[];
  };
  const hitPath = out.contexts?.[0]?.hits?.[0]?.path;
  t.is(hitPath, file.replace(/\\/g, "/"));
});
