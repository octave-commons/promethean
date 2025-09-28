import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");

async function collectProjectFiles(startDir) {
  const files = [];
  async function walk(currentDir) {
    let entries;
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name === "project.json") {
        files.push(fullPath);
      }
    }
  }
  await walk(startDir);
  return files;
}

function shallowEqual(a, b) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  return aKeys.every((key) => a[key] === b[key]);
}

async function updateProjectFile(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  let data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    console.error(`Skipping ${filePath}: failed to parse JSON`, error);
    return false;
  }
  const testTarget = data?.targets?.test;
  if (!testTarget || !testTarget.options) {
    return false;
  }

  const desiredEnv = { AVA_PROJECT_ROOT: "." };
  const existingEnv = testTarget.options.env ?? {};
  let changed = false;

  if (!shallowEqual(existingEnv, desiredEnv)) {
    testTarget.options.env = desiredEnv;
    changed = true;
  }

  if (testTarget.options.cwd !== "{projectRoot}") {
    testTarget.options.cwd = "{projectRoot}";
    changed = true;
  }

  if (!changed) {
    return false;
  }

  const updated = JSON.stringify(data, null, 2) + "\n";
  await fs.writeFile(filePath, updated, "utf8");
  return true;
}

async function main() {
  const candidateDirs = [
    "packages",
    "services",
    "apps",
    "sites",
    "libs",
    "shared",
    "tests",
  ];

  const projectFiles = [];
  for (const dir of candidateDirs) {
    const absDir = path.join(repoRoot, dir);
    try {
      const stat = await fs.stat(absDir);
      if (!stat.isDirectory()) continue;
      const files = await collectProjectFiles(absDir);
      projectFiles.push(...files);
    } catch {
      // ignore missing directories
    }
  }

  let modified = 0;
  for (const filePath of projectFiles) {
    const didUpdate = await updateProjectFile(filePath);
    if (didUpdate) {
      modified += 1;
      console.log(`Updated ${path.relative(repoRoot, filePath)}`);
    }
  }

  console.log(`Updated ${modified} project.json file(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
