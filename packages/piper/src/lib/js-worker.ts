import { parentPort, workerData } from "worker_threads";

if (!workerData || typeof workerData !== 'object' || !('modulePath' in workerData)) {
  parentPort!.postMessage({
    ok: false,
    err: "Invalid workerData: missing modulePath",
  });
  process.exit(1);
}

const { modulePath, exportName } = workerData as {
  modulePath: string;
  exportName?: string;
};

async function load() {
  try {
    const mod = await import(modulePath);
    const fn =
      (exportName && (mod as any)[exportName]) ??
      (mod as any).default ??
      mod;
    if (typeof fn !== "function") {
      throw new Error("export is not a function");
    }
    parentPort!.on("message", async ({ args }) => {
      try {
        const res = await fn(args as any);
        parentPort!.postMessage({
          ok: true,
          res: typeof res === "string" ? res : String(res ?? ""),
        });
      } catch (err) {
        parentPort!.postMessage({
          ok: false,
          err: err instanceof Error ? err.message : String(err),
        });
      }
    });
  } catch (err) {
    parentPort!.postMessage({
      ok: false,
      err: err instanceof Error ? err.message : String(err),
    });
  }
}

load();
