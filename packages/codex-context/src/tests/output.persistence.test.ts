import test from "ava";
import { persistArtifact } from "../save.js";
import fs from "fs/promises";
import path from "path";

test("persistArtifact writes markdown to docs/codex-context/requests", async (t) => {
  const baseDir = path.join(process.cwd(), "docs", "codex-context");
  const fp = await persistArtifact({
    baseDir,
    request: { model: "fake", messages: [{ role: "user", content: "hi" }] },
    augmentedSystem: "ctx",
    citations: [{ path: "AGENTS.md", startLine: 1, endLine: 2 }],
    responseText: "ok",
  });
  const content = await fs.readFile(fp, "utf8");
  t.true(content.includes("Codex Context Request"));
  t.true(content.includes("AGENTS.md"));
});
