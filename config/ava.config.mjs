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

const configDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(configDir, "..");
const DEFAULT_SEARCH_ROOTS = [
  path.join(workspaceRoot, "packages"),
  path.join(workspaceRoot, "services"),
  path.join(workspaceRoot, "shared"),
  path.join(workspaceRoot, "tests"),
];
const PACKAGE_SCOPE_DIRS = new Set([
  "packages",
  "services",
  "tests",
  "sites",
  "shared",
]);
const PROJECT_GRAPH_PATH = path.join(
  workspaceRoot,
  ".nx",
  "workspace-data",
  "project-graph.json",
);
let projectGraphCache = undefined;

function loadProjectGraph() {
  if (projectGraphCache !== undefined) {
    return projectGraphCache;
  }
  try {
    const raw = fs.readFileSync(PROJECT_GRAPH_PATH, "utf8");
    projectGraphCache = JSON.parse(raw);
  } catch {
    projectGraphCache = null;
  }
  return projectGraphCache;
}

function findProjectRootByName(projectName) {
  if (!projectName) {
    return null;
  }
  const graph = loadProjectGraph();
  const root = graph?.nodes?.[projectName]?.data?.root;
  return root ? path.join(workspaceRoot, root) : null;
}

function determineProjectRoot() {
  const envRoot = process.env.AVA_PROJECT_ROOT;
  if (envRoot) {
    return path.resolve(envRoot);
  }
  const nxProjectName =
    process.env.NX_TASK_TARGET_PROJECT ||
    process.env.NX_PROJECT_NAME ||
    process.env.NX_TARGET_PROJECT;
  const nxRoot = findProjectRootByName(nxProjectName);
  if (nxRoot) {
    return nxRoot;
  }
  const cwd = process.cwd();
  const relativeCwd = path.relative(workspaceRoot, cwd);
  const insideWorkspace =
    relativeCwd !== "" &&
    !relativeCwd.startsWith("..") &&
    !path.isAbsolute(relativeCwd);
  if (insideWorkspace) {
    const [scope] = relativeCwd.split(path.sep);
    if (!scope || PACKAGE_SCOPE_DIRS.has(scope)) {
      return cwd;
    }
  }
  return workspaceRoot;
}

function resolveSearchRoots(projectRoot) {
  const seen = new Set();
  const roots = [projectRoot];
  if (projectRoot === workspaceRoot) {
    roots.push(...DEFAULT_SEARCH_ROOTS);
  }
  return roots
    .map((dir) => path.resolve(dir))
    .filter((dir) => {
      if (seen.has(dir)) {
        return false;
      }
      seen.add(dir);
      try {
        return fs.statSync(dir).isDirectory();
      } catch {
        return false;
      }
    });
}

const projectRoot = determineProjectRoot();
const searchRoots = resolveSearchRoots(projectRoot);
const mockPolyfillPath = path.join(configDir, "ava-mock-polyfill.cjs");
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

function findDirectJsTests(rootDir) {
  let entries;
  try {
    entries = fs.readdirSync(rootDir, { withFileTypes: true });
  } catch {
    return false;
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (shouldSkipDir(entry.name) || entry.name === "dist") {
        continue;
      }
      if (findDirectJsTests(path.join(rootDir, entry.name))) {
        return true;
      }
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (
      entry.name.endsWith(".js") &&
      testFileMatchers.some((matcher) => matcher(entry.name))
    ) {
      return true;
    }
  }

  return false;
}

const hasDirectJsTests = searchRoots.some((rootDir) =>
  findDirectJsTests(rootDir),
);

if (!hasCompiledTests && !hasDirectJsTests) {
  const instructions = [
    "No compiled test files were found. AVA expects JavaScript tests under dist/.",
    "Run the package build step before executing tests (e.g. `pnpm --filter <pkg> build`).",
    "If you intended to run TypeScript tests directly, build first to generate dist outputs.",
    "For packages with JavaScript tests, ensure the tests use .js extensions so they can run without compilation.",
  ];
  throw new Error(instructions.join("\n"));
}

const nodeArguments = ["--enable-source-maps"];
const moduleMockFlag = "--experimental-test-module-mocks";
const nodeMajorVersion = Number.parseInt(
  process.versions.node.split(".")[0],
  10,
);

function determineNodeMajorVersion() {
  const version = process.versions?.node;
  if (!version) {
    return null;
  }
  const [majorSegment] = version.split(".");
  const major = Number.parseInt(majorSegment, 10);
  return Number.isNaN(major) ? null : major;
}

const nodeMajorVersion = determineNodeMajorVersion();
const supportsTestModuleMocks =
  typeof nodeMajorVersion === "number" && nodeMajorVersion >= 20;

// Enable Node's module mocking API so AVA exposes t.mock in ExecutionContext.
if (
  supportsTestModuleMocks &&
  !nodeArguments.includes("--experimental-test-module-mocks")
) {
  nodeArguments.push("--experimental-test-module-mocks");
}
// Enable Node's module mocking API so AVA exposes t.mock in ExecutionContext
// when the current Node version supports the experimental flag. Node exposes
// the flag via allowedNodeEnvironmentFlags before worker threads accept it, so
// also gate on the runtime major version to avoid passing invalid execArgv
// values to older environments.
if (
  nodeMajorVersion >= 22 &&
  process.allowedNodeEnvironmentFlags?.has(moduleMockFlag) &&
  !nodeArguments.includes(moduleMockFlag)
) {
  nodeArguments.push(moduleMockFlag);
}

const relativeProjectRoot = path.relative(process.cwd(), projectRoot);
const relativeInsideWorkspace =
  relativeProjectRoot !== "" && !relativeProjectRoot.startsWith("..");
const globPrefix = relativeInsideWorkspace
  ? `${relativeProjectRoot.split(path.sep).join("/")}/`
  : "";

function projectGlob(pattern) {
  const normalizedPattern = pattern.replace(/\\/g, "/");
  if (globPrefix) {
    return `${globPrefix}${normalizedPattern}`;
  }
  if (projectRoot === process.cwd()) {
    return normalizedPattern;
  }
  return path.join(projectRoot, normalizedPattern).split(path.sep).join("/");
}

const projectFileGlobs = [
  projectGlob("dist/tests/**/*.js"),
  projectGlob("dist/test/**/*.js"),
  projectGlob("dist/**/*.test.js"),
  projectGlob("dist/**/*.spec.js"),
];

export default {
  files: projectFileGlobs,
  timeout: "30s",
  failFast: false,
  require: [mockPolyfillPath],
  nodeArguments,
};
