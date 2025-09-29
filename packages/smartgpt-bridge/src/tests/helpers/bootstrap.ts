import fs from "node:fs/promises";
import { statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

async function ensureFixturesDir() {
  const pkgRoot = resolvePackageRoot();
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

const shouldForceLevelDb =
  String(
    process.env.SMARTGPT_BRIDGE_INDEXER_STATE_STORE || "",
  ).toLowerCase() === "leveldb";

if (!shouldForceLevelDb) {
  const resetStore = () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    setIndexerStateStore(createMemoryStateStore());
  };

  resetStore();

  type RunnerPrototype = {
    runTest: (...args: any[]) => Promise<unknown>;
    [key: symbol]: boolean | undefined;
  };

  const { default: Runner } = (await import("ava/lib/runner.js")) as {
    default: { prototype: RunnerPrototype };
  };

  const patchFlag = Symbol.for("smartgpt-bridge.indexer-state-reset");
  const runnerProto = Runner.prototype as RunnerPrototype;

  if (!runnerProto[patchFlag]) {
    const originalRunTest = runnerProto.runTest;

    runnerProto.runTest = async function runTestWithIsolatedState(
      this: RunnerPrototype,
      ...args: Parameters<typeof originalRunTest>
    ) {
      resetStore();
      return originalRunTest.apply(this, args);
    };

    runnerProto[patchFlag] = true;
  }
}
