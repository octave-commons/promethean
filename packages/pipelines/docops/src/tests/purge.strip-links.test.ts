import * as path from "path";
import * as fs from "fs/promises";

import test from "ava";

import { runPurge } from "../00-purge.js";

async function withTmp(fn: (dir: string) => Promise<void>) {
  const dir = path.join(
    process.cwd(),
    "test-tmp",
    String(Date.now()) + "-" + Math.random().toString(36).slice(2),
  );
  await fs.mkdir(dir, { recursive: true });
  await fn(dir).finally(() =>
    fs.rm(dir, { recursive: true, force: true }).catch(() => {}),
  );
}

test("stripLinks removes link refs and URLs", async (t) => {
  await withTmp(async (dir) => {
    const file = path.join(dir, "note.md");
    const content =
      "Hello [link](http://ex.com)\n" +
      '[id]: http://ex.com "title"\n' +
      "<http://auto.com>\n" +
      "https://bare.com\n";
    await fs.writeFile(file, content, "utf8");
    await runPurge({ dir, files: [file] });
    const out = await fs.readFile(file, "utf8");
    t.true(out.includes("Hello link"));
    t.false(out.includes("http"));
    t.false(out.includes("[id]:"));
  });
});
