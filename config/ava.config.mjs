import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Centralized AVA config for the monorepo
// Applies consistent file globs and a default timeout to prevent hanging tests.

const repoRoot = path.dirname(fileURLToPath(import.meta.url));
const searchRoots = [
  path.resolve(repoRoot, "../packages"),
  path.resolve(repoRoot, "../services"),
  path.resolve(repoRoot, "../shared"),
  path.resolve(repoRoot, "../tests"),
];
const testFileMatchers = [
  (name) => name.endsWith(".test.js"),
  (name) => name.endsWith(".spec.js"),
];

const shouldSkipDir = (entryName) =>
  entryName === "node_modules" || entryName.startsWith(".");

function distContainsTests(distDir) {
  const stack = [distDir];
  while (stack.length > 0) {
    const current = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (
        entry.isFile() &&
        testFileMatchers.some((matcher) => matcher(entry.name))
      ) {
        return true;
      }
    }
  }

  return false;
}

function findCompiledTests(rootDir) {
  let entries;
  try {
    entries = fs.readdirSync(rootDir, { withFileTypes: true });
  } catch {
    return false;
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || shouldSkipDir(entry.name)) {
      continue;
    }

    if (
      entry.name === "dist" &&
      distContainsTests(path.join(rootDir, entry.name))
    ) {
      return true;
    }

    if (findCompiledTests(path.join(rootDir, entry.name))) {
      return true;
    }
  }

  return false;
}

const hasCompiledTests = searchRoots.some((rootDir) =>
  findCompiledTests(rootDir),
);

if (!hasCompiledTests) {
  const instructions = [
    "No compiled test files were found. AVA expects JavaScript tests under dist/.",
    "Run the package build step before executing tests (e.g. `pnpm --filter <pkg> build`).",
    "If you intended to run TypeScript tests directly, build first to generate dist outputs.",
  ];
  throw new Error(instructions.join("\n"));
}

export default {
  files: [
    // Compiled TS tests
    "dist/tests/**/*.js",
    "dist/test/**/*.js",
    "dist/**/*.test.js",
    "dist/**/*.spec.js",
  ],
  timeout: "30s",
  failFast: false,
  nodeArguments: ["--enable-source-maps"],
};
