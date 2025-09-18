import { parentPort, workerData } from "node:worker_threads";

const { modUrl, exportName, args, env, cwd } = workerData as {
  modUrl: string;
  exportName?: string;
  args: any;
  env: Record<string, string>;
  cwd: string;
};

(async () => {
  // Capture originals
  const origEnv = { ...process.env };
  const origStdout = process.stdout.write;
  const origStderr = process.stderr.write;
  const origCwd = process.cwd();
  const keepAlive = setInterval(() => {}, 1 << 30);

  // Apply step env
  Object.assign(process.env, env);

  // Stream-capture to parent
  (process.stdout.write as any) = function (chunk: any, enc?: any, cb?: any) {
    const data = typeof chunk === "string" ? chunk : String(chunk);
    parentPort?.postMessage({ type: "stdout", data });
    const maybeCb = typeof enc === "function" ? enc : cb;
    if (typeof maybeCb === "function") setImmediate(maybeCb);
    return true;
  };
  (process.stderr.write as any) = function (chunk: any, enc?: any, cb?: any) {
    const data = typeof chunk === "string" ? chunk : String(chunk);
    parentPort?.postMessage({ type: "stderr", data });
    const maybeCb = typeof enc === "function" ? enc : cb;
    if (typeof maybeCb === "function") setImmediate(maybeCb);
    return true;
  };

  try {
    if (cwd) {
      process.chdir(cwd);
    }
    const mod: any = await import(modUrl);
    const fn =
      (exportName && mod && mod[exportName]) || (mod && mod.default) || mod;

    if (typeof fn !== "function") {
      throw new Error(`export '${exportName ?? "default"}' is not a function`);
      // const name = exportName ?? "default";
      // const fn = (mod as any)[name];
      // if (typeof fn !== "function") {
      //   throw new Error(
      //     `JS worker: export '${name}' is not a function in ${modUrl}`,
      //   );
      // }
    }

    const res = await fn(args);
    if (typeof res === "string") {
      parentPort?.postMessage({ type: "stdout", data: res });
    }

    parentPort?.postMessage({ type: "done", code: 0 });
  } catch (e: any) {
    parentPort?.postMessage({
      type: "done",
      code: 1,
      error: e?.stack ?? String(e),
    });
  } finally {
    clearInterval(keepAlive);
    // Restore globals
    (process.stdout.write as any) = origStdout;
    (process.stderr.write as any) = origStderr;
    (process.env as any) = origEnv;
    if (cwd) {
      try {
        process.chdir(origCwd);
      } catch (err) {
        parentPort?.postMessage({
          type: "stderr",
          data: err instanceof Error ? err.stack ?? err.message : String(err),
        });
      }
    }
  }
})();
