import fs from "node:fs/promises";
import { statSync } from "node:fs";
import path from "node:path";

function pathExists(dir: string): boolean {
  try {
    return statSync(dir).isDirectory();
  } catch {
    return false;
  }
}

async function copyDir(from: string, to: string): Promise<void> {
  await fs.mkdir(to, { recursive: true });
  const entries = await fs.readdir(from, { withFileTypes: true });
  for (const entry of entries) {
    const fromPath = path.join(from, entry.name);
    const toPath = path.join(to, entry.name);
    if (entry.isDirectory()) {
      await copyDir(fromPath, toPath);
    } else if (entry.isFile()) {
      await fs.copyFile(fromPath, toPath);
    }
  }
}

async function ensureFixturesDir() {
  const cwd = process.cwd();
  const source = path.join(cwd, "src", "tests", "fixtures");
  if (!pathExists(source)) return;
  const dest = path.join(cwd, "tests", "fixtures");
  if (pathExists(dest)) return;
  await copyDir(source, dest);
}

await ensureFixturesDir().catch((err) => {
  if (process.env.DEBUG_FIXTURES_COPY === "true") {
    console.error("Failed to prepare test fixtures", err);
  }
});
