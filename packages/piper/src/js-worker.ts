import { parentPort, workerData } from "node:worker_threads";

const { modUrl, exportName, args, env } = workerData as {
  modUrl: string;
  exportName: string;
  args: any;
  env: Record<string, string>;
};

(async () => {
  const origEnv = { ...process.env };
  Object.assign(process.env, env);

  const origStdout = process.stdout.write;
  const origStderr = process.stderr.write;

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
    const mod = await import(modUrl);
    const fn = (mod as any)[exportName];
    if (typeof fn !== "function") {
      throw new Error(`export '${exportName}' is not a function`);
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
    process.stdout.write = origStdout;
    process.stderr.write = origStderr;
    process.env = origEnv;
  }
})();
