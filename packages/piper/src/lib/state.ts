import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type RunState = {
  steps: Record<
    string,
    { fingerprint: string; endedAt: string; exitCode: number | null }
  >;
};

const DB_DIR = ".cache";

export async function loadState(pipeline: string): Promise<RunState> {
  const file = join(DB_DIR, `${pipeline}.json`);
  try {
    const data = await readFile(file, "utf8");
    const steps = JSON.parse(data) as RunState["steps"];
    return { steps };
  } catch (err: any) {
    if (err.code !== "ENOENT") throw err;
    return { steps: {} };
  }
}

export async function saveState(pipeline: string, state: RunState) {
  await mkdir(DB_DIR, { recursive: true });
  const file = join(DB_DIR, `${pipeline}.json`);
  await writeFile(file, JSON.stringify(state.steps, null, 2), "utf8");
}
