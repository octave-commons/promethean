import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Ensure test runs default to silent logging. Individual tests can opt out
// by setting LOG_SILENT to "false" before creating loggers.
if (process.env.LOG_SILENT === undefined) {
  process.env.LOG_SILENT = "true";
}

// Centralized AVA config for the monorepo
// Applies consistent file globs and a default timeout to prevent hanging tests.

const repoRoot = path.dirname(fileURLToPath(import.meta.url));
const searchRoots = [
  path.resolve(repoRoot, "../packages"),
  path.resolve(repoRoot, "../services"),
  path.resolve(repoRoot, "../shared"),
  path.resolve(repoRoot, "../tests"),
];
const mockPolyfillPath = path.join(repoRoot, "ava-mock-polyfill.cjs");
const testFileMatchers = [
  (name) => name.endsWith(".test.js"),
  (name) => name.endsWith(".spec.js"),
];
const distTestDirNames = new Set(["tests", "test"]);

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

      if (!entry.isFile()) {
        continue;
      }

      if (testFileMatchers.some((matcher) => matcher(entry.name))) {
        return true;
      }

      const relativePath = path.relative(distDir, fullPath);
      const [topLevelDir] = relativePath.split(path.sep);
      if (distTestDirNames.has(topLevelDir) && entry.name.endsWith(".js")) {
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

const nodeArguments = ["--enable-source-maps"];

// Enable Node's module mocking API so AVA exposes t.mock in ExecutionContext.
if (!nodeArguments.includes("--experimental-test-module-mocks")) {
  nodeArguments.push("--experimental-test-module-mocks");
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
  require: [mockPolyfillPath],
  nodeArguments,
};
