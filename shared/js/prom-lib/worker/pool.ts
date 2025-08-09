export type JobInput = any;
export type JobOutput = any;
export type JobModule = string; // ESM path for Node worker to import

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
    // Node: pass absolute or importable ESM module paths when calling run()
    // Browser: name→factory map (because bundlers need Worker(URL))
    browserWorkers?: Record<string, () => Worker>;
  } = {},
): Promise<WorkerPool> {
  if (isNode) {
    const m = await import("./pool.node.js"); // compiled JS
    return new m.NodeWorkerPool(
      opts.size ?? Math.max(1, require("os").cpus().length - 1),
    );
  }
  if (isBrowser && typeof Worker !== "undefined" && opts.browserWorkers) {
    const m = await import("./pool.browser.js");
    return new m.BrowserWorkerPool(opts.browserWorkers);
  }
  // Fallback (static page without workers)
  const m = await import("./pool.local.js");
  return new m.LocalPool();
}
