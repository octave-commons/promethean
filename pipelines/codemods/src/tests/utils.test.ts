import * as path from "node:path";
import * as fs from "node:fs/promises";

import test from "ava";
import { Project } from "ts-morph";

import {
  ensureImport,
  importPathRelative,
  listCodeFiles,
  readJSON,
  removeImportIfUnused,
  replaceIdentifier,
  writeJSON,
} from "../utils.js";

const createTmpDir = async () => {
  const dir = path.join(
    process.cwd(),
    "test-tmp",
    `codemods-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  await fs.mkdir(dir, { recursive: true });
  return dir;
};

const cleanupTmpDir = async (dir: string) => {
  await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
};

test("readJSON returns fallback when file is missing", async (t) => {
  const dir = await createTmpDir();
  t.teardown(() => cleanupTmpDir(dir));
  const result = await readJSON(path.join(dir, "missing.json"), { flag: true });
  t.deepEqual(result, { flag: true });
});

test("writeJSON persists data that can be read back", async (t) => {
  const dir = await createTmpDir();
  t.teardown(() => cleanupTmpDir(dir));
  const file = path.join(dir, "data.json");
  const payload = { value: 42 };
  await writeJSON(file, payload);

  const raw = await fs.readFile(file, "utf-8");
  t.deepEqual(JSON.parse(raw), payload);

  const readBack = await readJSON(file, {} as { value: number });
  t.deepEqual(readBack, payload);
});

test("listCodeFiles ignores build directories and node_modules", async (t) => {
  const dir = await createTmpDir();
  t.teardown(() => cleanupTmpDir(dir));
  const files = [
    path.join(dir, "one.ts"),
    path.join(dir, "two.jsx"),
    path.join(dir, "nested", "three.js"),
    path.join(dir, "ignored", "four.ts"),
    path.join(dir, "node_modules", "pkg", "ignore.ts"),
    path.join(dir, "dist", "ignore.js"),
  ];
  await Promise.all(
    files.map(async (file) => {
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, "export const marker = true;", "utf-8");
    }),
  );

  const discovered = await listCodeFiles(dir);
  const rel = discovered
    .map((file) => path.relative(dir, file).replace(/\\/g, "/"))
    .sort();

  t.deepEqual(rel, ["ignored/four.ts", "nested/three.js", "one.ts", "two.jsx"]);
  t.false(rel.some((file) => file.startsWith("node_modules")));
  t.false(rel.some((file) => file.startsWith("dist")));
});

test("importPathRelative formats relative ESM paths", (t) => {
  const root = path.join(process.cwd(), "packages", "codemods");
  const fromFile = path.join(root, "src", "index.ts");
  const canonical = path.join(root, "src", "utils", "helpers.ts");
  const rel = importPathRelative(fromFile, canonical);
  t.is(rel, "./utils/helpers");
});

test("ensureImport merges with existing declarations without duplication", (t) => {
  const project = new Project({ useInMemoryFileSystem: true });
  const source = project.createSourceFile(
    "sample.ts",
    'import { existing } from "pkg";\nconst value = existing;\n',
  );

  ensureImport(source, { name: "existing", from: "pkg" });
  ensureImport(source, { name: "renamed", alias: "localName", from: "pkg" });
  ensureImport(source, { name: "readFile", from: "node:fs/promises" });

  const text = source.getFullText();
  t.regex(text, /import \{ existing, renamed as localName \} from "pkg";/);
  t.regex(text, /import \{ readFile \} from "node:fs\/promises";/);
  t.is(text.match(/readFile/g)?.length, 1);
});

test("removeImportIfUnused drops empty import declarations", (t) => {
  const project = new Project({ useInMemoryFileSystem: true });
  const source = project.createSourceFile(
    "sample.ts",
    'import { foo, bar } from "pkg";\nimport baz from "other";\nconst x = bar;\n',
  );

  removeImportIfUnused(source, "foo");
  t.regex(source.getFullText(), /import \{ bar \} from "pkg";/);

  removeImportIfUnused(source, "bar");
  t.false(/import \{[^}]*\} from "pkg";/.test(source.getFullText()));
  t.true(/import baz from "other";/.test(source.getFullText()));
});

test("replaceIdentifier updates usages but not declarations", (t) => {
  const project = new Project({ useInMemoryFileSystem: true });
  const source = project.createSourceFile(
    "sample.ts",
    "const foo = 1;\nfunction use(fooParam: number) {\n  return foo + fooParam;\n}\n",
  );

  replaceIdentifier(source, "foo", "renamed");
  const text = source.getFullText();

  t.true(text.includes("const foo = 1;"));
  t.true(text.includes("return renamed + fooParam;"));
});
