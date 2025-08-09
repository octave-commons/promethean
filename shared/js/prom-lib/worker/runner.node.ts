// A tiny generic Node worker: dynamic-import module and call handle(input)
import { parentPort } from "node:worker_threads";

parentPort!.on("message", async (msg) => {
  const { id, mod, input } = msg;
  try {
    const m = await import(mod); // ESM module path
    const fn = (m.handle ?? m.default) as (x: any) => any | Promise<any>;
    const out = await fn(input);
    parentPort!.postMessage({ id, ok: true, out });
  } catch (e: any) {
    parentPort!.postMessage({ id, ok: false, err: e?.message ?? String(e) });
  }
});
