import { openLevelCache } from "@promethean/level-cache";
import type { Cache } from "@promethean/level-cache";

export type Step = Readonly<{
  fingerprint: string;
  endedAt: string;
  exitCode: number | null;
  outputHash?: string;
}>;

export const isValidStep = (val: unknown): val is Step =>
  typeof val === "object" &&
  val !== null &&
  typeof (val as any).fingerprint === "string" &&
  typeof (val as any).endedAt === "string" &&
  (typeof (val as any).exitCode === "number" ||
    (val as any).exitCode === null) &&
  ((val as any).outputHash === undefined ||
    typeof (val as any).outputHash === "string");

export type RunState = {
  steps: Record<string, Step>;
};

const DB_PATH = ".cache/piper.level";
const saveQueues = new Map<string, Promise<void>>();

export async function loadState(pipeline: string): Promise<RunState> {
  let cache: Cache<Step> | undefined;
  try {
    cache = await openLevelCache<Step>({
      path: DB_PATH,
      namespace: pipeline,
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

async function persistState(pipeline: string, state: RunState): Promise<void> {
  let cache: Cache<Step> | undefined;
  try {
    cache = await openLevelCache<Step>({
      path: DB_PATH,
      namespace: pipeline,
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

export async function saveState(pipeline: string, state: RunState) {
  const run = () => persistState(pipeline, state);
  const prev = saveQueues.get(pipeline) ?? Promise.resolve();
  const chained = prev.then(run, run);
  const finalPromise = chained.finally(() => {
    if (saveQueues.get(pipeline) === finalPromise) {
      saveQueues.delete(pipeline);
    }
  });
  saveQueues.set(pipeline, finalPromise);
  return finalPromise;
}
