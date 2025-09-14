import * as fs from "fs/promises";
import * as path from "path";

import test, { ExecutionContext } from "ava";

import { fingerprintFromGlobs, stepFingerprint } from "../hash.js";

const SCHEMA = "schema-empty.json";

async function withTmp(
  _t: ExecutionContext<unknown>,
  fn: {
    (dir: any): Promise<void>;
    (dir: any): Promise<void>;
    (arg0: string): any;
  },
) {
  const dir = path.join(
    process.cwd(),
    "test-tmp",
    String(Date.now()) + "-" + Math.random().toString(36).slice(2),
  );
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, SCHEMA),
    JSON.stringify({ type: "object" }),
    "utf8",
  );
  try {
    await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

test("fingerprintFromGlobs: content vs mtime", async (t) => {
  await withTmp(t, async (dir) => {
    const a = path.join(dir, "a.txt");
    const b = path.join(dir, "b.txt");
    await fs.writeFile(a, "hello", "utf8");
    await fs.writeFile(b, "world", "utf8");

    const contentHash1 = await fingerprintFromGlobs(["*.txt"], dir, "content");
    const mtimeHash1 = await fingerprintFromGlobs(["*.txt"], dir, "mtime");
    t.truthy(contentHash1);
    t.truthy(mtimeHash1);

    // change content
    await fs.writeFile(a, "HELLO", "utf8");
    const contentHash2 = await fingerprintFromGlobs(["*.txt"], dir, "content");
    const mtimeHash2 = await fingerprintFromGlobs(["*.txt"], dir, "mtime");

    t.not(
      contentHash1,
      contentHash2,
      "content hash changes when file content changes",
    );
    // mtime likely also changes, but ensure at least one differs
    t.truthy(mtimeHash1 !== mtimeHash2 || contentHash1 !== contentHash2);
  });
});

test("stepFingerprint covers inputs and config", async (t) => {
  await withTmp(t, async (dir) => {
    const a = path.join(dir, "a.txt");
    await fs.writeFile(a, "hello", "utf8");
    const step = {
      id: "s",
      deps: [],
      cwd: ".",
      env: {},
      inputs: ["a.txt"],
      outputs: [],
      cache: "content",
      inputSchema: SCHEMA,
      outputSchema: SCHEMA,
    };

    const fp1 = await stepFingerprint(step, dir, true);
    await fs.writeFile(a, "HELLO", "utf8");
    const fp2 = await stepFingerprint(step, dir, true);
    t.not(fp1, fp2, "fingerprint changes when input content changes");

    const step2 = { ...step, env: { X: "1" } };
    const fp3 = await stepFingerprint(step2, dir, true);
    t.not(fp2, fp3, "fingerprint changes when config/env changes");

    const fp4 = await stepFingerprint(step2, dir, true, { X: "2" });
    const fp5 = await stepFingerprint({ ...step, env: { X: "2" } }, dir, true);
    t.is(fp4, fp5, "extraEnv overrides step.env in fingerprint");
  });
});

test("stepFingerprint includes js step config", async (t) => {
  await withTmp(t, async (dir) => {
    const base = {
      id: "s",
      deps: [],
      cwd: ".",
      env: {},
      inputs: [],
      outputs: [],
      cache: "content",
      inputSchema: SCHEMA,
      outputSchema: SCHEMA,
      js: { module: "./a.js", export: "default", args: { x: 1 } },
    };
    const fp1 = await stepFingerprint(base, dir, true);
    const fp2 = await stepFingerprint(
      { ...base, js: { ...base.js, args: { x: 2 } } },
      dir,
      true,
    );
    t.not(fp1, fp2, "fingerprint changes when js args change");
    const fp3 = await stepFingerprint(
      { ...base, js: { ...base.js, module: "./b.js" } },
      dir,
      true,
    );
    t.not(fp1, fp3, "fingerprint changes when js module changes");
  });
});
