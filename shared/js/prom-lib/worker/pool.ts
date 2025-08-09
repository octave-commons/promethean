export type JobInput = any;
export type JobOutput = any;
export type JobModule = string;

export interface WorkerPool {
  run(moduleOrName: string, input: JobInput): Promise<JobOutput>;
  close(): Promise<void>;
}

const isNode =
  typeof process !== "undefined" && !!(process.versions as any)?.node;
const isBrowser = typeof window !== "undefined";

export async function createPortablePool(
  opts: {
    size?: number;
    browserWorkers?: Record<string, () => Worker>;
  } = {},
): Promise<WorkerPool> {
  if (isNode) {
    const m = await import("./pool.node");
    return new m.NodeWorkerPool(
      opts.size ?? Math.max(1, require("os").cpus().length - 1),
    );
  }
  if (isBrowser && typeof Worker !== "undefined" && opts.browserWorkers) {
    const m = await import("./pool.browser");
    return new m.BrowserWorkerPool(opts.browserWorkers);
  }
  const m = await import("./pool.local");
  return new m.LocalPool();
}
