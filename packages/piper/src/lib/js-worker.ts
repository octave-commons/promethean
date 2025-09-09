import { parentPort, workerData } from "worker_threads";

if (
  !workerData ||
  typeof workerData !== "object" ||
  !("modulePath" in workerData)
) {
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
    const fn = (exportName && mod[exportName]) ?? mod.default ?? mod;
    if (typeof fn !== "function") {
      throw new Error("export is not a function");
    }
    parentPort!.on("message", async (msg) => {
      if (!msg || typeof msg !== "object" || !("args" in msg)) {
        parentPort!.postMessage({
          ok: false,
          err: "Invalid message: missing args",
        });
        return;
      }
      const { args } = msg;
      try {
        const res = await fn(args);
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
