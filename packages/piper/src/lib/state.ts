import { openLevelCache } from "@promethean/level-cache";

export type RunState = {
  steps: Record<string, { fingerprint: string; endedAt: string; exitCode: number | null }>;
};

const DB_PATH = ".cache/piper.level";

export async function loadState(pipeline: string): Promise<RunState> {
  const cache = await openLevelCache<any>({ path: DB_PATH, namespace: pipeline });
  const steps: RunState["steps"] = {};
  for await (const [key, val] of cache.entries()) {
    if (key && val) steps[key] = val as any;
  }
  await cache.close();
  return { steps };
}

export async function saveState(pipeline: string, state: RunState) {
  const cache = await openLevelCache<any>({ path: DB_PATH, namespace: pipeline });
  const ops = Object.entries(state.steps).map(([k, v]) => ({ type: "put" as const, key: k, value: v }));
  if (ops.length) await cache.batch(ops);
  await cache.close();
}
