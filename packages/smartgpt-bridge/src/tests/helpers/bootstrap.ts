import fs from "node:fs/promises";
import { statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  createMemoryStateStore,
  setIndexerStateStore,
} from "../../indexerState.js";

function pathExists(dir: string): boolean {
  try {
    return statSync(dir).isDirectory();
  } catch {
    return false;
  }
}

function hasCoreFixture(dir: string): boolean {
  try {
    return statSync(path.join(dir, "readme.md")).isFile();
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

function resolvePackageRoot(): string {
  return path.resolve(fileURLToPath(new URL("../../..", import.meta.url)));
}

function findSourceDir(pkgRoot: string): string | null {
  const candidates = [
    path.join(pkgRoot, "tests", "fixtures"),
    path.join(pkgRoot, "src", "tests", "fixtures"),
  ];
  for (const candidate of candidates) {
    if (pathExists(candidate)) return candidate;
  }
  return null;
}

const pkgRoot = resolvePackageRoot();

const shouldForceLevelDb =
  String(
    process.env.SMARTGPT_BRIDGE_INDEXER_STATE_STORE || "",
  ).toLowerCase() === "leveldb";

const patchFlag = Symbol.for("smartgpt-bridge.indexer-state-reset");

const resetStore = () => {
  setIndexerStateStore(createMemoryStateStore());
};

type RunTest = (...args: readonly unknown[]) => Promise<unknown>;

type RunnerPrototype = {
  runTest: RunTest;
  [key: symbol]: boolean | undefined;
};

const ensureStateIsolation = async () => {
  if (shouldForceLevelDb || Reflect.get(globalThis, patchFlag)) return;

  resetStore();

  const runnerPath = path.resolve(
    pkgRoot,
    "..",
    "..",
    "node_modules",
    "ava",
    "lib",
    "runner.js",
  );
  const runnerUrl = pathToFileURL(runnerPath);

  const { default: Runner } = (await import(runnerUrl.href)) as {
    default: { prototype: RunnerPrototype };
  };

  const runnerProto = Runner.prototype;

  if (!runnerProto[patchFlag]) {
    const originalRunTest: RunTest = runnerProto.runTest;

    const runTestWithIsolatedState: RunnerPrototype["runTest"] =
      async function runTestWithIsolatedState(
        this: RunnerPrototype,
        ...args: Parameters<RunTest>
      ) {
        resetStore();
        return originalRunTest.apply(this, args);
      };

    Reflect.defineProperty(runnerProto, "runTest", {
      configurable: true,
      value: runTestWithIsolatedState,
      writable: true,
    });

    Reflect.defineProperty(runnerProto, patchFlag, {
      configurable: false,
      enumerable: false,
      value: true,
      writable: false,
    });
  }
};

await ensureStateIsolation();

async function ensureFixturesDir() {
  const source = findSourceDir(pkgRoot);
  if (!source) return;

  const destinations = new Set([
    path.join(process.cwd(), "tests", "fixtures"),
    path.join(pkgRoot, "tests", "fixtures"),
  ]);

  for (const dest of destinations) {
    const resolvedDest = path.resolve(dest);
    if (resolvedDest === path.resolve(source)) continue;
    if (!pathExists(resolvedDest) || !hasCoreFixture(resolvedDest)) {
      await copyDir(source, resolvedDest);
    }
  }
}

await ensureFixturesDir().catch((err) => {
  if (process.env.DEBUG_FIXTURES_COPY === "true") {
    console.error("Failed to prepare test fixtures", err);
  }
});
