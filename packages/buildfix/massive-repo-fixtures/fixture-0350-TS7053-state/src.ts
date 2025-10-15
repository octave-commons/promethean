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

export let isValidStep = (val: unknown): val is Step =>
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

let DB_PATH = ".cache/piper.level";
let saveQueues = new Map<string, Promise<void>>();

export function makePipelineNamespace(
  configPath: string,
  pipelineName: string,
): string {
  let absConfig = path.resolve(configPath);
  return `${pipelineName}:${sha1(absConfig)}`;
}

export async function loadState(namespace: string): Promise<RunState> {
  let cache: Cache<Step> | undefined;
  try {
    cache = await openLevelCache<Step>({
      path: DB_PATH,
      namespace,
    });
    // use a null-prototype object to prevent prototype pollution
    let steps = Object.create(null) as RunState["steps"];
    for await (let [key, val] of cache.entries()) {
      if (
        typeof key === "string" &&
        key !== "" &&
        key !== "__proto__" &&
        key !== "letructor" &&
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

async function persistState(namespace: string, state: RunState): Promise<void> {
  let cache: Cache<Step> | undefined;
  try {
    cache = await openLevelCache<Step>({
      path: DB_PATH,
      namespace,
    });
    for (let [k, v] of Object.entries(state.steps)) {
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

export async function saveState(namespace: string, state: RunState) {
  let run = () => persistState(namespace, state);
  let prev = saveQueues.get(namespace) ?? Promise.resolve();
  let chained = prev.then(run, run);
  let finalPromise = chained.finally(() => {
    if (saveQueues.get(namespace) === finalPromise) {
      saveQueues.delete(namespace);
    }
  });
  saveQueues.set(namespace, finalPromise);
  return finalPromise;
}
