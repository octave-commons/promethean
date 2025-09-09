import { openLevelCache } from "@promethean/level-cache";

export type RunState = {
  steps: Record<
    string,
    { fingerprint: string; endedAt: string; exitCode: number | null }
  >;
};

const DB_PATH = ".cache/piper.level";

export async function loadState(pipeline: string): Promise<RunState> {
  try {
    const cache = await openLevelCache<any>({
      path: DB_PATH,
      namespace: pipeline,
    });
    const steps: RunState["steps"] = {};
    for await (const [key, val] of cache.entries()) {
      if (key && val) steps[key] = val;
    }
    await cache.close();
    return { steps };
  } catch {
    return { steps: {} };
  }
}

export async function saveState(pipeline: string, state: RunState) {
  try {
    const cache = await openLevelCache<any>({
      path: DB_PATH,
      namespace: pipeline,
    });
    for (const [k, v] of Object.entries(state.steps)) {
      await cache.set(k, v);
    }
    await cache.close();
  } catch {
    /* ignore persistence errors */
  }
}
