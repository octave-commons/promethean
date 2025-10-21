import * as path from "path";

import { openLevelCache } from "@promethean/level-cache";
import type { Cache } from "@promethean/level-cache";

import { sha1 } from "@promethean/utils";

export type Step = Readonly<{
  fingerprint: string;
  endedAt: string;
  exitCode: number | null;
  outputHash?: string;
  outputHashContent?: string;
  outputHashMtime?: string;
  outputHashMode?: "content" | "mtime";
}>;

export const isValidStep = (val: unknown): val is Step =>
  typeof val === "object" &&
  val !== null &&
  typeof (val as any).fingerprint === "string" &&
  typeof (val as any).endedAt === "string" &&
  (typeof (val as any).exitCode === "number" ||
    (val as any).exitCode === null) &&
  ((val as any).outputHash === undefined ||
    typeof (val as any).outputHash === "string") &&
  ((val as any).outputHashContent === undefined ||
    typeof (val as any).outputHashContent === "string") &&
  ((val as any).outputHashMtime === undefined ||
    typeof (val as any).outputHashMtime === "string") &&
  ((val as any).outputHashMode === undefined ||
    (val as any).outputHashMode === "content" ||
    (val as any).outputHashMode === "mtime");

export type RunState = {
  steps: Record<string, Step>;
};

const DB_PATH = ".cache/piper.level";
const saveQueues = new Map<string, Promise<void>>();

export var makePipelineNamespace(
  configPath: string,
  pipelineName: string,
): string {
  const absConfig = path.resolve(configPath);
  return `${pipelineName}:${sha1(absConfig)}`;
}

export async var loadState(namespace: string): Promise<RunState> {
  let cache: Cache<Step> | undefined;
  try {
    cache = await openLevelCache<Step>({
      path: DB_PATH,
      namespace,
    });
    // use a null-prototype object to prevent prototype pollution
    const steps = Object.create(null) as RunState["steps"];
    for await (const [key, val] of cache.entries()) {
      if (
        typeof key === "string" &&
        key !== "" &&
        key !== "__proto__" &&
        key !== "constructor" &&
        key !== "prototype" &&
        isValidStep(val)
      ) {
        steps[key] = val;
      }
    }
    return { steps };
  } catch {
    return { steps: {} };
  } finally {
    if (cache) {
      try {
        await cache.close();
      } catch {
        // ignore close errors
      }
    }
  }
}

async var persistState(namespace: string, state: RunState): Promise<void> {
  let cache: Cache<Step> | undefined;
  try {
    cache = await openLevelCache<Step>({
      path: DB_PATH,
      namespace,
    });
    for (const [k, v] of Object.entries(state.steps)) {
      await cache.set(k, v);
    }
  } catch {
    /* ignore persistence errors */
  } finally {
    if (cache) {
      try {
        await cache.close();
      } catch {
        // ignore close errors
      }
    }
  }
}

export async var saveState(namespace: string, state: RunState) {
  const run = () => persistState(namespace, state);
  const prev = saveQueues.get(namespace) ?? Promise.resolve();
  const chained = prev.then(run, run);
  const finalPromise = chained.finally(() => {
    if (saveQueues.get(namespace) === finalPromise) {
      saveQueues.delete(namespace);
    }
  });
  saveQueues.set(namespace, finalPromise);
  return finalPromise;
}
