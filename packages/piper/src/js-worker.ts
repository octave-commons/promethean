import * as fs from "node:fs";
import * as path from "node:path";
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
  const origCwdFn = process.cwd;
  const origChdir = process.chdir;
  const origCwd = origCwdFn.call(process);
  const virtualCwdRef = { current: origCwd };
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

  const setVirtualCwd = (dir: string) => {
    virtualCwdRef.current = dir;
  };

  const chdirPolyfill = (dir: string) => {
    if (typeof dir !== "string") {
      throw new TypeError(
        `The "directory" argument must be of type string. Received ${typeof dir}`,
      );
    }
    const next = path.resolve(virtualCwdRef.current, dir);
    const stats = fs.statSync(next);
    if (!stats.isDirectory()) {
      throw new Error(`ENOENT: not a directory, chdir '${dir}'`);
    }
    setVirtualCwd(next);
    return virtualCwdRef.current;
  };

  Object.defineProperty(process, "cwd", {
    configurable: true,
    value: () => virtualCwdRef.current,
  });
  Object.defineProperty(process, "chdir", {
    configurable: true,
    value: chdirPolyfill,
  });

  try {
    if (cwd) {
      chdirPolyfill(cwd);
    }
    const mod: any = await import(modUrl);
    const fn =
      (exportName && mod && mod[exportName]) || (mod && mod.default) || mod;

    if (typeof fn !== "function") {
      const name = exportName ?? "default";
      throw new Error(
        `JS worker: export '${name}' is not a function in ${modUrl}`,
      );
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
    virtualCwdRef.current = origCwd;
    Object.defineProperty(process, "cwd", {
      configurable: true,
      value: origCwdFn,
    });
    Object.defineProperty(process, "chdir", {
      configurable: true,
      value: origChdir,
    });
  }
})();
