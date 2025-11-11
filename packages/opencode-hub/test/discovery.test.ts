import test from "ava";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { discoverRepos } from "../src/git.js";

test("discoverRepos finds .git directories and .git files", async (t) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hub-"));
  const a = path.join(tmp, "a");
  const b = path.join(tmp, "b");
  fs.mkdirSync(a, { recursive: true });
  fs.mkdirSync(b, { recursive: true });
  fs.mkdirSync(path.join(a, ".git"));
  fs.writeFileSync(path.join(b, ".git"), "gitdir: /somewhere/else/.git");
  const repos = await discoverRepos(tmp);
  const names = repos.map(r => r.name).sort();
  t.deepEqual(names, ["a","b"]);
});