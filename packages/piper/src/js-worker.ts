import { parentPort, workerData } from "node:worker_threads";
import { pathToFileURL } from "node:url";

interface WorkerPayload {
  modulePath: string;
  exportName: string;
  args: any;
  env: Record<string, string>;
  fp?: string;
}

const { modulePath, exportName, args, env, fp } = workerData as WorkerPayload;

let stdout = "";
let stderr = "";

const origStdout = process.stdout.write;
const origStderr = process.stderr.write;

(process.stdout.write as any) = function (chunk: any, enc?: any, cb?: any) {
  stdout += typeof chunk === "string" ? chunk : String(chunk);
  const maybeCb = typeof enc === "function" ? enc : cb;
  if (typeof maybeCb === "function") setImmediate(maybeCb);
  return true;
};
(process.stderr.write as any) = function (chunk: any, enc?: any, cb?: any) {
  stderr += typeof chunk === "string" ? chunk : String(chunk);
  const maybeCb = typeof enc === "function" ? enc : cb;
  if (typeof maybeCb === "function") setImmediate(maybeCb);
  return true;
};

const origEnv = { ...process.env } as Record<string, string | undefined>;
for (const [k, v] of Object.entries(env)) {
  process.env[k] = v;
}

const cleanup = () => {
  (process.stdout.write as any) = origStdout;
  (process.stderr.write as any) = origStderr;
  for (const [k, v] of Object.entries(origEnv)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
};

(async () => {
  try {
    const url =
      pathToFileURL(modulePath).href + (fp ? `?v=${encodeURIComponent(fp)}` : "");
    const mod = await import(url);
    const fn = (mod as any)[exportName];
    if (typeof fn !== "function") {
      throw new Error(`JS step export '${exportName}' is not a function.`);
    }
    const res = await Promise.resolve(fn(args));
    if (typeof res === "string") stdout += res;
    cleanup();
    parentPort?.postMessage({ code: 0, stdout, stderr });
  } catch (e: any) {
    stderr += e?.stack ?? String(e);
    cleanup();
    parentPort?.postMessage({ code: 1, stdout, stderr });
  }
})();
