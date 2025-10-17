import * as path from "node:path";
import * as fs from "node:fs/promises";

import test from "ava";

import { runRename } from "../06-rename.js";
import { runFooters } from "../05-footers.js";
import { openDB } from "../db.js";

const exists = async (p: string) => {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
};

const withTmp = async (fn: (dir: string) => Promise<void>) => {
  const dir = path.join(
    process.cwd(),
    "test-tmp",
    `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  await fs.mkdir(dir, { recursive: true });
  try {
    await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
};

test.serial("runRename updates doc path mapping for renamed files", async (t) => {
  await withTmp(async (dir) => {
    const docsDir = path.join(dir, "docs/labeled");
    await fs.mkdir(docsDir, { recursive: true });
    const original = path.join(docsDir, "2025.09.18.16.46.24.md");
    const uuid = "rename-test-uuid";
    const frontmatter = [
      "---",
      `uuid: ${uuid}`,
      "filename: Example Doc",
      "title: Example Doc",
      "references: []",
      "related_to_uuid: []",
      "---",
      "",
      "Body",
      "",
    ].join("\n");
    await fs.writeFile(original, frontmatter, "utf8");

    const dbPath = path.join(dir, ".cache/docops.level");
    const db = await openDB(dbPath);
    try {
      await db.docs.put(uuid, { path: original, title: "Example Doc" });

      await runRename({ dir: docsDir }, db);

      const renamedPath = path.join(docsDir, "example-doc.md");
      t.false(await exists(original));
      t.true(await exists(renamedPath));

      const record = await db.docs.get(uuid).catch(() => undefined);
      if (!record) {
        t.fail("expected renamed document to be persisted in docs DB");
        return;
      }
      t.is(path.normalize(record.path), path.normalize(renamedPath));

      await runFooters(
        {
          dir: docsDir,
          anchorStyle: "none",
          includeRelated: false,
          includeSources: false,
        },
        db,
      );

      const updated = await fs.readFile(renamedPath, "utf8");
      t.regex(updated, /GENERATED-SECTIONS:DO-NOT-EDIT-BELOW/);
    } finally {
      await db.root.close();
    }
  });
});
