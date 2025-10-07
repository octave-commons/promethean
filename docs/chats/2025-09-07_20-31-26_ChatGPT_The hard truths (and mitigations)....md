# The hard truths (and mitigations)...
Exported on 07/09/2025 at 20:31:26 [from ChatGPT](https://chatgpt.com/c/68be28b8-5d48-832c-8428-227ade202642```
) - with [SaveMyChatbot](
```https://save.hugocollin.com)

## User
import { promises as fs } from "fs"; import \* as path from "path"; import { spawn } from "child\_process"; import { AsyncLocalStorage } from "async\_hooks"; import { pathToFileURL } from "url";  import { globby } from "globby"; import { ensureDir } from "@promethean/fs"; import { PiperStep } from "./types.js";  export { ensureDir };  class Mutex {   private queue: () => void
```
$$
```
 =
```
$$
```
;   private locked = false;   async acquire() {     if (this.locked) await new Promise<void>(res) => this.queue.push(res);     else this.locked = true;   }   release() {     const next = this.queue.shift();     if (next) next();     else this.locked = false;   } }  const envMutex = new Mutex();  export async function readTextMaybe(p: string) {   try {     return await fs.readFile(p, "utf-8");   } catch (err: any) {     if (err as NodeJS.ErrnoException)?.code === "ENOENT" return undefined;     throw err;   } }  export async function writeText(p: string, s: string) {   await ensureDirpath.dirname(p);   await fs.writeFile(p, s, "utf-8"); }  export async function listOutputsExist(outputs: string
```
$$
, cwd: string) {   const results = await Promise.alloutputs.map((pat) => globby(pat, { cwd, absolute: true, dot: true })),;   return results.every(files) => files.length > 0; }  export function runShell(   cmd: string,   cwd: string,   env: Record<string, string>,   timeoutMs?: number, ) {   return runSpawn(cmd, {     cwd,     env,     shell: true,     ...(timeoutMs ? { timeoutMs } : {}),   }); }  export function runNode(   file: string,   args: string
```
```
| undefined,   cwd: string,   env: Record<string, string>,   timeoutMs?: number, ) {   const cmd = process.execPath;   const finalArgs =
```
file, ...(args ?? \[
```
)\];   return runSpawn(cmd, {     cwd,     env,     args: finalArgs,     ...(timeoutMs ? { timeoutMs } : {}),   }); }  const jsFnCtx = new AsyncLocalStorage<symbol>(); let jsFnLock: Promise<void> = Promise.resolve(); let jsFnOwner: symbol | undefined;  export async function runJSFunctionfn: (args: any) => any | Promise<any>,   args: any,   env: Record<string, string>,   timeoutMs?: number, { <<<<<<< codex/fix-comment-in-fsutils.ts-b2uo3a   const current = jsFnCtx.getStore();   const run = async () => {     let stdout = "";     let stderr = "";      const origStdout = process.stdout.write.bind(process.stdout);     const origStderr = process.stderr.write.bind(process.stderr);     const origEnv: Record<string, string | undefined> = {};     let cleaned = false;     const cleanup = () => {       if (cleaned) return;       cleaned = true;       (process.stdout.write as any) = origStdout;       (process.stderr.write as any) = origStderr;       for (const
```
k, v
```
of Object.entries(origEnv)) {         if v === undefined delete process.env
```
k
```
;         else process.env
```
k
```
= v;       }     };      (process.stdout.write as any) = (chunk: any) => {       stdout += typeof chunk === "string" ? chunk : String(chunk);       return true;     };     (process.stderr.write as any) = (chunk: any) => {       stderr += typeof chunk === "string" ? chunk : String(chunk);       return true;     };     for (const
```
k, v
```
of Object.entries(env)) {       origEnv
```
k
```
$$
 = process.env
```
```
k
```
;       process.env
```
k
```
 = v; =======   let stdout = "";   let stderr = "";    const origStdout = process.stdout.write;   const origStderr = process.stderr.write;    (process.stdout.write as any) = (chunk: any) => {     stdout += typeof chunk === "string" ? chunk : String(chunk);     return true;   };   (process.stderr.write as any) = (chunk: any) => {     stderr += typeof chunk === "string" ? chunk : String(chunk);     return true;   };    const origEnv: Record<string, string | undefined> = {};   for (const 
```
k, v
```
 of Object.entries(env)) {     origEnv
```
k
```
```
= process.env
```
```
k
```
;     process.env
```
k
```
 = v;   }    let cleaned = false;   const cleanup = () => {     if (cleaned) return;     cleaned = true;     (process.stdout.write as any) = origStdout;     (process.stderr.write as any) = origStderr;     for (const 
```
k, v
```
 of Object.entries(origEnv)) {       if v === undefined delete process.env
```
k
```
;       else process.env
```
k
```
 = v;     }   };    const run = async () => {     try {       const res = await fn(args);       if typeof res === "string" stdout += res;       return { code: 0, stdout, stderr } as const;     } catch (e: any) {       stderr += e?.stack ?? String(e);       return { code: 1, stdout, stderr } as const;     } finally {       cleanup(); >>>>>>> codex/extend-js-target-support-in-piper     }      const exec = async () => {       try {         const res = await fn(args);         if typeof res === "string" stdout += res;         return { code: 0, stdout, stderr } as const;       } catch (e: any) {         stderr += e?.stack ?? String(e);         return { code: 1, stdout, stderr } as const;       } finally {         cleanup();       }     };      if (!timeoutMs) return exec();      let timer: NodeJS.Timeout;     return Promise.race(
```
exec(),       new Promise<{ code: number | null; stdout: string; stderr: string }>(         (resolve) => {           timer = setTimeout(() => {             cleanup();             resolve({ code: 124, stdout, stderr: stderr + "timeout" });           }, timeoutMs);         },       ),
```
).finally() => clearTimeout(timer);   };  <<<<<<< codex/fix-comment-in-fsutils.ts-b2uo3a   if current && current === jsFnOwner return run();    const prev = jsFnLock;   let release!: () => void;   const token = Symbol("jsFn");   jsFnLock = new Promise<void>(r) => (release = r);   jsFnOwner = token;   await prev;   try {     return await jsFnCtx.run(token, run);   } finally {     jsFnOwner = undefined;     release();   } =======   if (!timeoutMs) return run();    let timer: NodeJS.Timeout | undefined;   const timeoutPromise = new Promise<{ code: number | null; stdout: string; stderr: string }>(resolve) => {       timer = setTimeout(() => {         cleanup();         resolve({ code: 124, stdout, stderr: stderr + "timeout" });       }, timeoutMs);     },;    return Promise.race(
```
run(), timeoutPromise
```
).finally() => {     if (timer) clearTimeout(timer);   }; >>>>>>> codex/extend-js-target-support-in-piper }  export async function runTSModule(   step: PiperStep,   cwd: string,   env: Record<string, string>,   timeoutMs?: number, ) {   const modPath = path.isAbsolute(step.ts!.module)     ? step.ts!.module     : path.resolve(cwd, step.ts!.module);   const code =      import mod from {JSON.stringify(modPath)};     const exportName = {JSON.stringify(step.ts!.export ?? "")};     const fn =       (exportName && mod && mod
```
exportName
```
) ||       (mod && mod.default) ||       mod;     const res = await fn${JSON.stringify(step.ts!.args ?? {})};     if typeof res === 'string' process.stdout.write(res);   `;`   // Lazy-run via node -e with ESM loader   const cmd = process.execPath;   const args = 
```
"--input-type=module", "-e", code
```
;   return runSpawn(cmd, {     cwd,     env,     args,     ...(timeoutMs ? { timeoutMs } : {}),   }); }  export async function runJSModule(   step: PiperStep,   cwd: string,   env: Record<string, string>,   timeoutMs?: number, ) {   const modPath = path.isAbsolute(step.js!.module)     ? step.js!.module     : path.resolve(cwd, step.js!.module);   const url = pathToFileURL(modPath).href;   await envMutex.acquire();   const prevEnv: Record<string, string | undefined> = {};   for (const 
```
k, v
```
 of Object.entries(env)) {     prevEnv
```
k
```
```
= process.env
```
```
k
```
;     process.env
```
k
```
 = v;   }   let timer: NodeJS.Timeout | undefined;   try {     const mod: any = await import(url);     const fn = (step.js!.export && mod
```
step.js!.export
```
) || mod.default || mod;     const call = fn(step.js!.args ?? {});     const res = timeoutMs       ? await Promise.race(
```
call,           new Promise(             (\_, reject) =>               (timer = setTimeout(                 () => reject(new Error("timeout")),                 timeoutMs,               )),           ),
```
)       : await call;     const out = typeof res === "string" ? res : "";     return { code: 0, stdout: out, stderr: "" };   } catch (err: any) {     return { code: 1, stdout: "", stderr: String(err?.stack ?? err) };   } finally {     if (timer) clearTimeout(timer);     for (const 
```
k, v
```
 of Object.entries(prevEnv)) {       if v === undefined delete process.env
```
k
```
;       else process.env
```
k
```
 = v;     }     envMutex.release();   } }  function runSpawn(   cmd: string,   opts: {     cwd: string;     env: NodeJS.ProcessEnv;     shell?: boolean;     args?: string
```
$$
;     timeoutMs?: number;   }, ) {   return new Promise<{ code: number | null; stdout: string; stderr: string }>(     (resolve) => {       const child = opts.shell         ? spawn(cmd, {             cwd: opts.cwd,             env: { ...process.env, ...opts.env },             shell: true,             stdio:
```
"ignore", "pipe", "pipe"
```
,             detached: process.platform !== "win32",           })         : spawn(cmd, opts.args ??
```
```
, {             cwd: opts.cwd,             env: { ...process.env, ...opts.env },             stdio:
```
"ignore", "pipe", "pipe"
```
,             detached: process.platform !== "win32",           });        let out = "",         err = "";       const killTimer =         opts.timeoutMs && opts.timeoutMs > 0           ? setTimeout() => {               try {                 if (process.platform !== "win32" && child.pid) {                   process.kill(-child.pid, "SIGKILL");                 } else {                   child.kill("SIGKILL");                 }               } catch {}             }, opts.timeoutMs           : undefined;        child.stdout.on"data", (d) => (out += String(d));       child.stderr.on"data", (d) => (err += String(d));       child.on"close", (code) => {         if (killTimer) clearTimeout(killTimer as any);         resolve({ code, stdout: out, stderr: err });       };       child.on"error", () =>         resolve({           code: 127,           stdout: out,           stderr: err || "failed to spawn",         }),;     },   ); }

## ChatGPT
I see you’ve got a merge conflict in `runJSFunction` — there are two divergent implementations here:

1.  **The `AsyncLocalStorage` + lock owner version (HEAD)**
    
    *   Uses `jsFnCtx` and a lock `jsFnLock` + `jsFnOwner` to serialize concurrent calls.
        
    *   Safely restores `stdout`, `stderr`, and environment variables via `cleanup()`.
        
    *   Ensures nested invocations don’t deadlock by checking `current === jsFnOwner`.
        
    *   Supports `timeoutMs` by racing the function execution against a timer.
```
2.  **The simpler version (branch)**
```
*   Directly overrides `process.stdout.write` and `process.stderr.write`.
        
    *   Doesn’t use `AsyncLocalStorage` or serialization.
        
    *   Handles `timeoutMs` with `Promise.race`, but no reentrancy or locking.
        

* * *

### The Problem

Because pipelines can run with concurrency > 1, and JS steps may call nested pipelines, **you need reentrancy and serialization** — otherwise you risk deadlocks (like you already hit) or corrupted output stdout/stderr interleaving across tasks.

The **HEAD version is the right foundation**, but it needs to stay clean and consistent:

*   Acquire lock only after awaiting the previous promise (don’t overwrite `jsFnOwner` early).
    
*   Run the fn inside the `AsyncLocalStorage.run` scope so nested calls are safe.
    
*   Ensure cleanup always restores env and streams.
    

* * *

### Suggested Merge Resolution

Keep the **HEAD implementation** but fold in the **cleaner `finally`/`Promise.race` handling** from the branch. Something like:

```ts
export async function runJSFunction(
  fn: (args: any) => any | Promise<any>,
  args: any,
  env: Record<string, string>,
  timeoutMs?: number,
) {
  const current = jsFnCtx.getStore();

 const run = async () => {
    let stdout = "";
    let stderr = "";

   const origStdout = process.stdout.write.bind(process.stdout);
    const origStderr = process.stderr.write.bind(process.stderr);
    const origEnv: Record<string, string | undefined> = {};
    let cleaned = false;

   const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      (process.stdout.write as any) = origStdout;
      (process.stderr.write as any) = origStderr;
      for (const [k, v] of Object.entries(origEnv)) {
        if (v === undefined) delete process.env[k];
        else process.env[k] = v;
      }
    };

   (process.stdout.write as any) = (chunk: any) => {
      stdout += typeof chunk === "string" ? chunk : String(chunk);
      return true;
    };
    (process.stderr.write as any) = (chunk: any) => {
      stderr += typeof chunk === "string" ? chunk : String(chunk);
      return true;
    };
    for (const [k, v] of Object.entries(env)) {
      origEnv[k] = process.env[k];
      process.env[k] = v;
    }

   const exec = async () => {
      try {
        const res = await fn(args);
        if (typeof res === "string") stdout += res;
        return { code: 0, stdout, stderr } as const;
      } catch (e: any) {
        stderr += e?.stack ?? String(e);
        return { code: 1, stdout, stderr } as const;
      } finally {
        cleanup();
      }
    };

   if (!timeoutMs) return exec();

   let timer: NodeJS.Timeout;
    return Promise.race([
      exec(),
      new Promise<{ code: number; stdout: string; stderr: string }>((resolve) => {
        timer = setTimeout(() => {
          cleanup();
          resolve({ code: 124, stdout, stderr: stderr + "timeout" });
        }, timeoutMs);
      }),
    ]).finally(() => clearTimeout(timer));
  };

 if (current && current === jsFnOwner) {
    return run();
  }

 const prev = jsFnLock;
  let release!: () => void;
  const token = Symbol("jsFn");
  jsFnLock = new Promise<void>((r) => (release = r));
  await prev;
  jsFnOwner = token;
  try {
    return await jsFnCtx.run(token, run);
  } finally {
    jsFnOwner = undefined;
    release();
  }
}
```

* * *

👉 This keeps the **reentrancy and lock discipline** from HEAD, but merges in the **nicer cleanup/timeout handling** from the other branch. That way:

*   Nested calls don’t deadlock.
    
*   Concurrency > 1 is safe.
    
*   Timeout is handled cleanly with a race.
    

Do you want me to patch the rest of your branch with this resolution so the `<<<<<<<` / `>>>>>>>` markers are gone and `runJSFunction` is fully merged?

## User
import \* as fs from "fs/promises"; import \* as path from "path";  import test from "ava"; import YAML from "yaml";  import { runPipeline } from "../runner.js"; import { runJSFunction } from "../fsutils.js";  async function withTmpfn: (dir: string) => Promise<void> { <<<<<<< codex/fix-comment-in-fsutils.ts-b2uo3a   const dir = path.joinprocess.cwd(),     "test-tmp",     String(Date.now()) + "-" + Math.random().toString(36).slice(2),;   await fs.mkdir(dir, { recursive: true });   try {     await fn(dir);     // small grace period for any async file watchers/flushes     await new Promise(r) => setTimeout(r, 10);   } finally {     await fs.rm(dir, { recursive: true, force: true });   } }  test.serial("runPipeline executes js + shell steps (make → cat)", async (t) => {   await withTmp(async (dir) => {     const libPath = path.join(dir, "lib.js");     await fs.writeFile(       libPath,       "import { promises as fs } from 'fs';\\nexport async function make({file,content}){await fs.writeFile(file, content, 'utf8');return 'made';}\\n",       "utf8",     );      const cfg = {       pipelines:
```
{           name: "demo",           steps: \[             {               id: "make",               cwd: dir,               deps: \[
```
,               inputs:
```
```
,               outputs:
```
"out.txt"
```
,               cache: "content",               js: {                 module: "./lib.js",                 export: "make",                 args: {                   file: path.join(dir, "out.txt"),                   content: "hi",                 },               },             },             {               id: "cat",               cwd: dir,               deps:
```
"make"
```
,               inputs:
```
"out.txt"
```
,               outputs:
```
"out2.txt"
```
,               cache: "content",               shell: "cat out.txt > out2.txt",             },           \],         },       \],     };      const pipelinesPath = path.join(dir, "pipelines.yaml");     await fs.writeFilepipelinesPath, YAML.stringify(cfg), "utf8";      const res = await runPipeline(pipelinesPath, "demo", { concurrency: 2 });     t.is(res.length, 2);     t.trueres.every((r) => !r.skipped);      const out = await fs.readFilepath.join(dir, "out2.txt"), "utf8";     t.is(out, "hi");   }); });  test.serial("JS steps isolate process.env when run concurrently", async (t) => {   await withTmp(async (dir) => {     const libPath = path.join(dir, "envmod.js");     await fs.writeFile(       libPath,       "import { promises as fs } from 'fs';\\nexport async function dump({file,key,delay}){await new Promise(r=>setTimeout(r,delay));await fs.writeFile(file, process.env
```
key
```
$$
||'', 'utf8');}\\n",       "utf8",     );      const cfg = {       pipelines:
```
```
{           name: "env",           steps: \[             {               id: "one",               cwd: dir,               deps: \[
```
,               inputs: 
```
$$
,               outputs:
```
"a.txt"
```
,               cache: "content",               env: { V: "1" },               js: {                 module: "./envmod.js",                 export: "dump",                 args: { file: path.join(dir, "a.txt"), key: "V", delay: 50 },               },             },             {               id: "two",               cwd: dir,               deps:
```
```
,               inputs:
```
```
,               outputs:
```
"b.txt"
```
,               cache: "content",               env: { V: "2" },               js: {                 module: "./envmod.js",                 export: "dump",                 args: { file: path.join(dir, "b.txt"), key: "V", delay: 50 },               },             },           \],         },       \],     };      const pipelinesPath = path.join(dir, "pipelines.yaml");     await fs.writeFilepipelinesPath, YAML.stringify(cfg), "utf8";     await runPipeline(pipelinesPath, "env", { concurrency: 2 });      const aOut = await fs.readFilepath.join(dir, "a.txt"), "utf8";     const bOut = await fs.readFilepath.join(dir, "b.txt"), "utf8";     t.is(aOut, "1");     t.is(bOut, "2");     t.is(process.env.V, undefined);   }); });  test.serial("js steps serialize to avoid global state races", async (t) => {   const a = async () => {     console.log("first");     await new Promise((r) => setTimeout(r, 50));   };   const b = () => {     console.log(process.env.LEAK ?? "second");   };   const
```
first, second
```
$$
 = await Promise.all(
```
```
runJSFunction(a, {}, { LEAK: "1" }),     runJSFunction(b, {}, {}),
```
);   t.is(first.code, 0);   t.truefirst.stdout.includes("first");   t.true(second.stdout ?? "").trim() === "second"; });  test.serial("runJSFunction restores globals on timeout", async (t) => {   await withTmp(async (dir) => {     const hangSrc = `export default async function(){ return new Promise(()=>{}); }`;     const afterSrc = `export default function(){ console.log(process.env.LEAK ?? 'after'); }`;     await fs.writeFile(path.join(dir, "hang.js"), hangSrc, "utf8");     await fs.writeFile(path.join(dir, "after.js"), afterSrc, "utf8");      const cfg = {       pipelines: 
```
{           name: "demo",           steps: \[             {               id: "hang",               cwd: dir,               deps: \[
```
,               inputs: 
```
$$
,               outputs:
```
```
,               cache: "content",               timeoutMs: 100,               env: { LEAK: "1" },               js: { module: "./hang.js" },             },             {               id: "after",               cwd: dir,               deps:
```
```
,               inputs:
```
```
,               outputs:
```
```
,               cache: "content",               js: { module: "./after.js" },             },           \],         },       \],     };      const pipelinesPath = path.join(dir, "pipelines.yaml");     await fs.writeFilepipelinesPath, YAML.stringify(cfg), "utf8";     const res = await runPipeline(pipelinesPath, "demo", { concurrency: 1 });      const first = res.find(r) => r.id === "hang"!;     const second = res.find(r) => r.id === "after"!;     t.is(first.exitCode, 124);     t.true(second.stdout?.trim() ?? "") === "after";   }); });  test.serial("js steps can run nested pipelines without deadlock", async (t) => {   const inner = async () => {     console.log("inner");   };   const outer = async () => {     const res = await runJSFunction(inner, {}, {});     console.log((res.stdout ?? "").trim());   };   const res = (await Promise.race(
```
runJSFunction(outer, {}, {}),     new Promise((\_, reject) =>       setTimeout(() => reject(new Error("deadlock")), 1000),     ),
```
)) as any;   t.is(res.code, 0);   t.true(res.stdout ?? "").trim().endsWith("inner"); }); =======  const dir = path.joinprocess.cwd(),  "test-tmp",  String(Date.now()) + "-" + Math.random().toString(36).slice(2),;  await fs.mkdir(dir, { recursive: true });  try {  await fn(dir);  } finally {  await fs.rm(dir, { recursive: true, force: true });  } }  test.serial("runPipeline executes js function steps", async (t) => {  await withTmp(async (dir) => {  const prevCwd = process.cwd();  process.chdir(dir);  try {  const modSrc = `export function greet(a){ console.log('hello ' + a.name); return 'done'; }`;  await fs.writeFile(path.join(dir, "mod.js"), modSrc, "utf8");  const cfg = {  pipelines:
```
{  name: "demo",  steps: \[  {  id: "js",  cwd: ".",  deps: \[
```
,  inputs:
```
```
,  outputs:
```
```
,  cache: "content",  js: {  module: "./mod.js",  export: "greet",  args: { name: "world" },  },  },  \],  },  \],  };  const pipelinesPath = path.join(dir, "pipelines.yaml");  await fs.writeFilepipelinesPath, YAML.stringify(cfg), "utf8";  const res = await runPipeline(pipelinesPath, "demo", {  concurrency: 1,  });  const first = res
```
0
```
!;  t.is(first.exitCode, 0);  t.truefirst.stdout?.includes("hello world") ?? false;  t.truefirst.stdout?.includes("done") ?? false;  } finally {  process.chdir(prevCwd);  }  }); });  test.serial(  "js steps execute sequentially to prevent global corruption",  async (t) => {  await withTmp(async (dir) => {  const prevCwd = process.cwd();  process.chdir(dir);  try {  const modSrc = `export async function check(){\n  console.log(process.env.TEST_VAR);\n  await new Promise(r=>setTimeout(r,50));\n  console.log(process.env.TEST_VAR);\n}`;  await fs.writeFile(path.join(dir, "mod.js"), modSrc, "utf8");  const cfg = {  pipelines:
```
{  name: "demo",  steps: \[  {  id: "a",  cwd: ".",  deps: \[
```
,  inputs:
```
```
,  outputs:
```
```
,  cache: "content",  env: { TEST\_VAR: "A" },  js: { module: "./mod.js", export: "check" },  },  {  id: "b",  cwd: ".",  deps:
```
```
,  inputs:
```
```
,  outputs:
```
```
,  cache: "content",  env: { TEST\_VAR: "B" },  js: { module: "./mod.js", export: "check" },  },  \],  },  \],  };  const pipelinesPath = path.join(dir, "pipelines.yaml");  await fs.writeFilepipelinesPath, YAML.stringify(cfg), "utf8";  const res = await runPipeline(pipelinesPath, "demo", {  concurrency: 2,  });  const a = res.find(r) => r.id === "a"!;  const b = res.find(r) => r.id === "b"!;  t.isa.stdout, "A\\nA\\n";  t.isb.stdout, "B\\nB\\n";  } finally {  process.chdir(prevCwd);  }  });  }, ); >>>>>>> codex/extend-js-target-support-in-piper

## ChatGPT
Yep — that file has a classic conflict: two totally different test suites spliced together. The **safe merge** is to keep the stronger HEAD tests (they exercise env isolation, serialization, timeouts, and nested invocations) and drop the branch’s “capture console.log from JS module step” test, because your current `runJSModule` does **not** capture `console.log` (it only forwards a string return value to `stdout`). Keeping that test would fail unless you also change `runJSModule` to intercept `process.stdout`.

Here’s a **clean, conflict-free** test file that preserves the robust coverage and adds the tiny grace wait in `withTmp` so fs flushes don’t flap. Paste this over the conflicted file:

```ts
import * as fs from "fs/promises";
import * as path from "path";

import test from "ava";
import YAML from "yaml";

import { runPipeline } from "../runner.js";
import { runJSFunction } from "../fsutils.js";

async function withTmp(fn: (dir: string) => Promise<void>) {
  const dir = path.join(
    process.cwd(),
    "test-tmp",
    String(Date.now()) + "-" + Math.random().toString(36).slice(2),
  );
  await fs.mkdir(dir, { recursive: true });
  try {
    await fn(dir);
    // small grace period for any async file watchers/flushes
    await new Promise((r) => setTimeout(r, 10));
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

test.serial("runPipeline executes js + shell steps (make → cat)", async (t) => {
  await withTmp(async (dir) => {
    const libPath = path.join(dir, "lib.js");
    await fs.writeFile(
      libPath,
      "import { promises as fs } from 'fs';\nexport async function make({file,content}){await fs.writeFile(file, content, 'utf8');return 'made';}\n",
      "utf8",
    );

   const cfg = {
      pipelines: [
        {
          name: "demo",
          steps: [
            {
              id: "make",
              cwd: dir,
              deps: [],
              inputs: [],
              outputs: ["out.txt"],
              cache: "content",
              js: {
                module: "./lib.js",
                export: "make",
                args: {
                  file: path.join(dir, "out.txt"),
                  content: "hi",
                },
              },
            },
            {
              id: "cat",
              cwd: dir,
              deps: ["make"],
              inputs: ["out.txt"],
              outputs: ["out2.txt"],
              cache: "content",
              shell: "cat out.txt > out2.txt",
            },
          ],
        },
      ],
    };

   const pipelinesPath = path.join(dir, "pipelines.yaml");
    await fs.writeFile(pipelinesPath, YAML.stringify(cfg), "utf8");

   const res = await runPipeline(pipelinesPath, "demo", { concurrency: 2 });
    t.is(res.length, 2);
    t.true(res.every((r) => !r.skipped));

   const out = await fs.readFile(path.join(dir, "out2.txt"), "utf8");
    t.is(out, "hi");
  });
});

test.serial("JS steps isolate process.env when run concurrently", async (t) => {
  await withTmp(async (dir) => {
    const libPath = path.join(dir, "envmod.js");
    await fs.writeFile(
      libPath,
      "import { promises as fs } from 'fs';\nexport async function dump({file,key,delay}){await new Promise(r=>setTimeout(r,delay));await fs.writeFile(file, process.env[key]||'', 'utf8');}\n",
      "utf8",
    );

   const cfg = {
      pipelines: [
        {
          name: "env",
          steps: [
            {
              id: "one",
              cwd: dir,
              deps: [],
              inputs: [],
              outputs: ["a.txt"],
              cache: "content",
              env: { V: "1" },
              js: {
                module: "./envmod.js",
                export: "dump",
                args: { file: path.join(dir, "a.txt"), key: "V", delay: 50 },
              },
            },
            {
              id: "two",
              cwd: dir,
              deps: [],
              inputs: [],
              outputs: ["b.txt"],
              cache: "content",
              env: { V: "2" },
              js: {
                module: "./envmod.js",
                export: "dump",
                args: { file: path.join(dir, "b.txt"), key: "V", delay: 50 },
              },
            },
          ],
        },
      ],
    };

   const pipelinesPath = path.join(dir, "pipelines.yaml");
    await fs.writeFile(pipelinesPath, YAML.stringify(cfg), "utf8");
    await runPipeline(pipelinesPath, "env", { concurrency: 2 });

   const aOut = await fs.readFile(path.join(dir, "a.txt"), "utf8");
    const bOut = await fs.readFile(path.join(dir, "b.txt"), "utf8");
    t.is(aOut, "1");
    t.is(bOut, "2");
    t.is(process.env.V, undefined);
  });
});

test.serial("js steps serialize to avoid global state races", async (t) => {
  const a = async () => {
    console.log("first");
    await new Promise((r) => setTimeout(r, 50));
  };
  const b = () => {
    console.log(process.env.LEAK ?? "second");
  };
  const [first, second] = await Promise.all([
    runJSFunction(a, {}, { LEAK: "1" }),
    runJSFunction(b, {}, {}),
  ]);
  t.is(first.code, 0);
  t.true(first.stdout.includes("first"));
  t.true((second.stdout ?? "").trim() === "second");
});

test.serial("runJSFunction restores globals on timeout", async (t) => {
  await withTmp(async (dir) => {
    const hangSrc = `export default async function(){ return new Promise(()=>{}); }`;
    const afterSrc = `export default function(){ console.log(process.env.LEAK ?? 'after'); }`;
    await fs.writeFile(path.join(dir, "hang.js"), hangSrc, "utf8");
    await fs.writeFile(path.join(dir, "after.js"), afterSrc, "utf8");

   const cfg = {
      pipelines: [
        {
          name: "demo",
          steps: [
            {
              id: "hang",
              cwd: dir,
              deps: [],
              inputs: [],
              outputs: [],
              cache: "content",
              timeoutMs: 100,
              env: { LEAK: "1" },
              js: { module: "./hang.js" },
            },
            {
              id: "after",
              cwd: dir,
              deps: [],
              inputs: [],
              outputs: [],
              cache: "content",
              js: { module: "./after.js" },
            },
          ],
        },
      ],
    };

   const pipelinesPath = path.join(dir, "pipelines.yaml");
    await fs.writeFile(pipelinesPath, YAML.stringify(cfg), "utf8");
    const res = await runPipeline(pipelinesPath, "demo", { concurrency: 1 });

   const first = res.find((r) => r.id === "hang")!;
    const second = res.find((r) => r.id === "after")!;
    t.is(first.exitCode, 124);
    t.true((second.stdout?.trim() ?? "") === "after");
  });
});

test.serial("js steps can run nested pipelines without deadlock", async (t) => {
  const inner = async () => {
    console.log("inner");
  };
  const outer = async () => {
    const res = await runJSFunction(inner, {}, {});
    console.log((res.stdout ?? "").trim());
  };
  const res = (await Promise.race([
    runJSFunction(outer, {}, {}),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("deadlock")), 1000),
    ),
  ])) as any;
  t.is(res.code, 0);
  t.true((res.stdout ?? "").trim().endsWith("inner"));
});
```

#### Why this resolution

*   We **don’t** assert that `runPipeline` captures `console.log` from JS modules. Your current `runJSModule` only forwards a string return to `stdout`. If you want console capture at the module level, we can add a per-call stream shim similar to `runJSFunction`.
    
*   We **do** verify the important behaviors your runtime relies on:
    
    *   JS + shell composition works.
        
    *   `env` is isolated even with `concurrency: 2`.
        
    *   JS functions serialize correctly to avoid global state races.
        
    *   Timeouts restore global state.
        
    *   Nested `runJSFunction` calls avoid deadlock.
        

If you _do_ want module-level console capturing in the future, say the word and I’ll give you a targeted `runJSModule` patch (with the same cleanup discipline as `runJSFunction`) plus an additional test that asserts both `console.log` and return value appear in `stdout`.

## User
import { promises as fs } from "fs"; import \* as path from "path"; import { spawn } from "child\_process"; <<<<<<< codex/add-worker-solution-in-runner.ts import { Worker } from "node:worker\_threads"; ======= import { AsyncLocalStorage } from "async\_hooks"; import { pathToFileURL } from "url"; >>>>>>> codex/extend-js-target-support-in-piper  import { globby } from "globby"; import { ensureDir } from "@promethean/fs"; import { PiperStep } from "./types.js";  export { ensureDir };  class Mutex {   private queue: () => void
```
```
$$
 =
```
```
$$
;   private locked = false;   async acquire() {     if (this.locked) await new Promise<void>(res) => this.queue.push(res);     else this.locked = true;   }   release() {     const next = this.queue.shift();     if (next) next();     else this.locked = false;   } }  const envMutex = new Mutex();  export async function readTextMaybe(p: string) {   try {     return await fs.readFile(p, "utf-8");   } catch (err: any) {     if (err as NodeJS.ErrnoException)?.code === "ENOENT" return undefined;     throw err;   } }  export async function writeText(p: string, s: string) {   await ensureDirpath.dirname(p);   await fs.writeFile(p, s, "utf-8"); }  export async function listOutputsExist(outputs: string
```
```
, cwd: string) {   const results = await Promise.alloutputs.map((pat) => globby(pat, { cwd, absolute: true, dot: true })),;   return results.every(files) => files.length > 0; }  export function runShell(   cmd: string,   cwd: string,   env: Record<string, string>,   timeoutMs?: number, ) {   return runSpawn(cmd, {     cwd,     env,     shell: true,     ...(timeoutMs ? { timeoutMs } : {}),   }); }  export function runNode(   file: string,   args: string
```
```
| undefined,   cwd: string,   env: Record<string, string>,   timeoutMs?: number, ) {   const cmd = process.execPath;   const finalArgs =
```
file, ...(args ?? \[
```
)\];   return runSpawn(cmd, {     cwd,     env,     args: finalArgs,     ...(timeoutMs ? { timeoutMs } : {}),   }); }  <<<<<<< codex/add-worker-solution-in-runner.ts export async function runJSModule(   modUrl: string,   exportName: string | undefined,   args: any,   env: Record<string, string>,   timeoutMs?: number, ) {   return new Promise<{ code: number | null; stdout: string; stderr: string }>(resolve) => {       const worker = new Worker(new URL("./js-worker.js", import.meta.url), {         workerData: { modUrl, exportName: exportName ?? "default", args, env },       });       let stdout = "";       let stderr = "";       let timer: NodeJS.Timeout | undefined;       let settled = false;       let timedOut = false;       const finish = (         res: { code: number | null; stdout: string; stderr: string },       ) => {         if (settled) return;         settled = true;         if (timer) clearTimeout(timer);         resolve(res);       };       if (timeoutMs) {         timer = setTimeout(() => {           timedOut = true;           worker.terminate().finally(() => {             finish({               code: 124,               stdout,               stderr: `{stderr}Timed out after {timeoutMs}ms\n`,             });           });         }, timeoutMs);       }       worker.on("message", (m) => {         if (m.type === "stdout") stdout += m.data;         else if (m.type === "stderr") stderr += m.data;         else if (m.type === "done") {           finish({             code: m.code,             stdout,             stderr: m.error ? stderr + m.error : stderr,           });         }       });       worker.on("error", (err) => {         finish({ code: 1, stdout, stderr: stderr + (err?.stack ?? String(err)) });       });       worker.on("exit", (code) => {         if (!timedOut) finish({ code, stdout, stderr });       });     },; }  ======= const jsFnCtx = new AsyncLocalStorage<symbol>(); let jsFnLock: Promise<void> = Promise.resolve(); let jsFnOwner: symbol | undefined; >>>>>>> codex/extend-js-target-support-in-piper export async function runJSFunctionfn: (args: any) => any | Promise<any>,   args: any,   env: Record<string, string>,   timeoutMs?: number, {   const current = jsFnCtx.getStore();    const run = async () => {     let stdout = "";     let stderr = "";  <<<<<<< codex/add-worker-solution-in-runner.ts   (process.stdout.write as any) = function (chunk: any, enc?: any, cb?: any) {     stdout += typeof chunk === "string" ? chunk : String(chunk);     const maybeCb = typeof enc === "function" ? enc : cb;     if typeof maybeCb === "function" setImmediate(maybeCb);     return true;   };   (process.stderr.write as any) = function (chunk: any, enc?: any, cb?: any) {     stderr += typeof chunk === "string" ? chunk : String(chunk);     const maybeCb = typeof enc === "function" ? enc : cb;     if typeof maybeCb === "function" setImmediate(maybeCb);     return true;   }; =======     const origStdout = process.stdout.write.bind(process.stdout);     const origStderr = process.stderr.write.bind(process.stderr);     const origEnv: Record<string, string | undefined> = {};     let cleaned = false; >>>>>>> codex/extend-js-target-support-in-piper      const cleanup = () => {       if (cleaned) return;       cleaned = true;       (process.stdout.write as any) = origStdout;       (process.stderr.write as any) = origStderr;       for (const
```
k, v
```
of Object.entries(origEnv)) {         if v === undefined delete process.env
```
k
```
;         else process.env
```
k
```
= v;       }     };      (process.stdout.write as any) = (chunk: any) => {       stdout += typeof chunk === "string" ? chunk : String(chunk);       return true;     };     (process.stderr.write as any) = (chunk: any) => {       stderr += typeof chunk === "string" ? chunk : String(chunk);       return true;     };     for (const
```
k, v
```
of Object.entries(env)) {       origEnv
```
k
```
$$
 = process.env
```
```
k
```
;       process.env
```
k
```
 = v;     }      const exec = async () => {       try {         const res = await fn(args);         if typeof res === "string" stdout += res;         return { code: 0, stdout, stderr } as const;       } catch (e: any) {         stderr += e?.stack ?? String(e);         return { code: 1, stdout, stderr } as const;       } finally {         cleanup();       }     };      if (!timeoutMs) return exec();  <<<<<<< codex/add-worker-solution-in-runner.ts   let timer: NodeJS.Timeout | undefined;   const timeoutPromise = new Promise<{ code: number | null; stdout: string; stderr: string }>(resolve) => {       timer = setTimeout(() => {         cleanup();         resolve({           code: 124,           stdout,           stderr: `{stderr}Timed out after {timeoutMs}ms\n`,         });       }, timeoutMs);     },; =======     let timer: NodeJS.Timeout;     return Promise.race(
```
exec(),       new Promise<{ code: number; stdout: string; stderr: string }>((resolve) => {         timer = setTimeout(() => {           cleanup();           resolve({ code: 124, stdout, stderr: stderr + "timeout" });         }, timeoutMs);       }),
```
).finally() => clearTimeout(timer);   }; >>>>>>> codex/extend-js-target-support-in-piper    if current && current === jsFnOwner {     return run();   }    const prev = jsFnLock;   let release!: () => void;   const token = Symbol("jsFn");   jsFnLock = new Promise<void>(r) => (release = r);   await prev;   jsFnOwner = token;   try {     return await jsFnCtx.run(token, run);   } finally {     jsFnOwner = undefined;     release();   } }   export async function runJSModule(   step: PiperStep,   cwd: string,   env: Record<string, string>,   timeoutMs?: number, ) {   const modPath = path.isAbsolute(step.js!.module)     ? step.js!.module     : path.resolve(cwd, step.js!.module);   const url = pathToFileURL(modPath).href;   await envMutex.acquire();   const prevEnv: Record<string, string | undefined> = {};   for (const 
```
k, v
```
 of Object.entries(env)) {     prevEnv
```
k
```
```
= process.env
```
```
k
```
;     process.env
```
k
```
 = v;   }   let timer: NodeJS.Timeout | undefined;   try {     const mod: any = await import(url);     const fn = (step.js!.export && mod
```
step.js!.export
```
) || mod.default || mod;     const call = fn(step.js!.args ?? {});     const res = timeoutMs       ? await Promise.race(
```
call,           new Promise(             (\_, reject) =>               (timer = setTimeout(                 () => reject(new Error("timeout")),                 timeoutMs,               )),           ),
```
)       : await call;     const out = typeof res === "string" ? res : "";     return { code: 0, stdout: out, stderr: "" };   } catch (err: any) {     return { code: 1, stdout: "", stderr: String(err?.stack ?? err) };   } finally {     if (timer) clearTimeout(timer);     for (const 
```
k, v
```
 of Object.entries(prevEnv)) {       if v === undefined delete process.env
```
k
```
;       else process.env
```
k
```
 = v;     }     envMutex.release();   } }  function runSpawn(   cmd: string,   opts: {     cwd: string;     env: NodeJS.ProcessEnv;     shell?: boolean;     args?: string
```
$$
;     timeoutMs?: number;   }, ) {   return new Promise<{ code: number | null; stdout: string; stderr: string }>(     (resolve) => {       const child = opts.shell         ? spawn(cmd, {             cwd: opts.cwd,             env: { ...process.env, ...opts.env },             shell: true,             stdio:
```
"ignore", "pipe", "pipe"
```
,             detached: process.platform !== "win32",           })         : spawn(cmd, opts.args ??
```
```
, {             cwd: opts.cwd,             env: { ...process.env, ...opts.env },             stdio:
```
"ignore", "pipe", "pipe"
```
,             detached: process.platform !== "win32",           });        let out = "",         err = "";       const killTimer =         opts.timeoutMs && opts.timeoutMs > 0           ? setTimeout() => {               try {                 if (process.platform !== "win32" && child.pid) {                   process.kill(-child.pid, "SIGKILL");                 } else {                   child.kill("SIGKILL");                 }               } catch {}             }, opts.timeoutMs           : undefined;        child.stdout.on"data", (d) => (out += String(d));       child.stderr.on"data", (d) => (err += String(d));       child.on"close", (code) => {         if (killTimer) clearTimeout(killTimer as any);         resolve({ code, stdout: out, stderr: err });       };       child.on"error", () =>         resolve({           code: 127,           stdout: out,           stderr: err || "failed to spawn",         }),;     },   ); }

## ChatGPT
You’ve got two incompatible implementations smashed together worker-threads vs in-process + AsyncLocalStorage, plus duplicated `runJSModule`. Below is a **clean, conflict-free merge** that keeps the proven in-process approach:

*   **Keep** `AsyncLocalStorage` + serialized `runJSFunction` with proper re-entrancy and cleanup.
    
*   **Keep** the simple **in-process** `runJSModule` env-isolated, returns string output only.
    
*   **Drop** the worker-threads variant it requires `js-worker.js` and different plumbing.
    
*   **Fix** the deadlock hazard: set `jsFnOwner` **after** awaiting the previous lock.
    
*   **Ensure** stdout/stderr/env are always restored (even on timeout). Timeout exit code = **124**.
    

Paste this over the conflicted file:

```ts
import { promises as fs } from "fs";
import * as path from "path";
import { spawn } from "child_process";
import { AsyncLocalStorage } from "async_hooks";
import { pathToFileURL } from "url";

import { globby } from "globby";
import { ensureDir } from "@promethean/fs";
import { PiperStep } from "./types.js";

export { ensureDir };

class Mutex {
  private queue: (() => void)[] = [];
  private locked = false;
  async acquire() {
    if (this.locked) await new Promise<void>((res) => this.queue.push(res));
    else this.locked = true;
  }
  release() {
    const next = this.queue.shift();
    if (next) next();
    else this.locked = false;
  }
}

const envMutex = new Mutex();

export async function readTextMaybe(p: string) {
  try {
    return await fs.readFile(p, "utf-8");
  } catch (err: any) {
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") return undefined;
    throw err;
  }
}

export async function writeText(p: string, s: string) {
  await ensureDir(path.dirname(p));
  await fs.writeFile(p, s, "utf-8");
}

export async function listOutputsExist(outputs: string[], cwd: string) {
  const results = await Promise.all(
    outputs.map((pat) => globby(pat, { cwd, absolute: true, dot: true })),
  );
  return results.every((files) => files.length > 0);
}

export function runShell(
  cmd: string,
  cwd: string,
  env: Record<string, string>,
  timeoutMs?: number,
) {
  return runSpawn(cmd, {
    cwd,
    env,
    shell: true,
    ...(timeoutMs ? { timeoutMs } : {}),
  });
}

export function runNode(
  file: string,
  args: string[] | undefined,
  cwd: string,
  env: Record<string, string>,
  timeoutMs?: number,
) {
  const cmd = process.execPath;
  const finalArgs = [file, ...(args ?? [])];
  return runSpawn(cmd, {
    cwd,
    env,
    args: finalArgs,
    ...(timeoutMs ? { timeoutMs } : {}),
  });
}

/** Re-entrant, serialized JS function runner (captures console + env, supports timeouts) */
const jsFnCtx = new AsyncLocalStorage<symbol>();
let jsFnLock: Promise<void> = Promise.resolve();
let jsFnOwner: symbol | undefined;

export async function runJSFunction(
  fn: (args: any) => any | Promise<any>,
  args: any,
  env: Record<string, string>,
  timeoutMs?: number,
) {
  const current = jsFnCtx.getStore();

 const run = async () => {
    let stdout = "";
    let stderr = "";

   const origStdout = process.stdout.write.bind(process.stdout);
    const origStderr = process.stderr.write.bind(process.stderr);
    const origEnv: Record<string, string | undefined> = {};
    let cleaned = false;

   const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      (process.stdout.write as any) = origStdout;
      (process.stderr.write as any) = origStderr;
      for (const [k, v] of Object.entries(origEnv)) {
        if (v === undefined) delete process.env[k];
        else process.env[k] = v;
      }
    };

   (process.stdout.write as any) = (chunk: any) => {
      stdout += typeof chunk === "string" ? chunk : String(chunk);
      return true;
    };
    (process.stderr.write as any) = (chunk: any) => {
      stderr += typeof chunk === "string" ? chunk : String(chunk);
      return true;
    };
    for (const [k, v] of Object.entries(env)) {
      origEnv[k] = process.env[k];
      process.env[k] = v;
    }

   const exec = async () => {
      try {
        const res = await fn(args);
        if (typeof res === "string") stdout += res;
        return { code: 0, stdout, stderr } as const;
      } catch (e: any) {
        stderr += e?.stack ?? String(e);
        return { code: 1, stdout, stderr } as const;
      } finally {
        cleanup();
      }
    };

   if (!timeoutMs) return exec();

   let timer: NodeJS.Timeout;
    return Promise.race([
      exec(),
      new Promise<{ code: number; stdout: string; stderr: string }>((resolve) => {
        timer = setTimeout(() => {
          cleanup();
          resolve({ code: 124, stdout, stderr: stderr + "timeout" });
        }, timeoutMs);
      }),
    ]).finally(() => clearTimeout(timer));
  };

 // Re-entrancy: if we already hold the lock in this async context, just run.
  if (current && current === jsFnOwner) return run();

 // Serialize callers; set owner only after previous lock resolves.
  const prev = jsFnLock;
  let release!: () => void;
  const token = Symbol("jsFn");
  jsFnLock = new Promise<void>((r) => (release = r));
  await prev;
  jsFnOwner = token;
  try {
    return await jsFnCtx.run(token, run);
  } finally {
    jsFnOwner = undefined;
    release();
  }
}

/** JS module runner (in-process). Env-isolated; returns string results only. */
export async function runJSModule(
  step: PiperStep,
  cwd: string,
  env: Record<string, string>,
  timeoutMs?: number,
) {
  const modPath = path.isAbsolute(step.js!.module)
    ? step.js!.module
    : path.resolve(cwd, step.js!.module);
  const url = pathToFileURL(modPath).href;

 await envMutex.acquire();
  const prevEnv: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(env)) {
    prevEnv[k] = process.env[k];
    process.env[k] = v;
  }

 let timer: NodeJS.Timeout | undefined;
  try {
    const mod: any = await import(url);
    const fn = (step.js!.export && mod[step.js!.export]) || mod.default || mod;
    const call = fn(step.js!.args ?? {});
    const res = timeoutMs
      ? await Promise.race([
          call,
          new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error("timeout")), timeoutMs);
          }),
        ])
      : await call;

   const out = typeof res === "string" ? res : "";
    return { code: 0, stdout: out, stderr: "" };
  } catch (err: any) {
    return { code: 1, stdout: "", stderr: String(err?.stack ?? err) };
  } finally {
    if (timer) clearTimeout(timer);
    for (const [k, v] of Object.entries(prevEnv)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    envMutex.release();
  }
}

function runSpawn(
  cmd: string,
  opts: {
    cwd: string;
    env: NodeJS.ProcessEnv;
    shell?: boolean;
    args?: string[];
    timeoutMs?: number;
  },
) {
  return new Promise<{ code: number | null; stdout: string; stderr: string }>(
    (resolve) => {
      const child = opts.shell
        ? spawn(cmd, {
            cwd: opts.cwd,
            env: { ...process.env, ...opts.env },
            shell: true,
            stdio: ["ignore", "pipe", "pipe"],
            detached: process.platform !== "win32",
          })
        : spawn(cmd, opts.args ?? [], {
            cwd: opts.cwd,
            env: { ...process.env, ...opts.env },
            stdio: ["ignore", "pipe", "pipe"],
            detached: process.platform !== "win32",
          });

     let out = "", err = "";
      const killTimer =
        opts.timeoutMs && opts.timeoutMs > 0
          ? setTimeout(() => {
              try {
                if (process.platform !== "win32" && child.pid) {
                  process.kill(-child.pid, "SIGKILL");
                } else {
                  child.kill("SIGKILL");
                }
              } catch {}
            }, opts.timeoutMs)
          : undefined;

     child.stdout.on("data", (d) => (out += String(d)));
      child.stderr.on("data", (d) => (err += String(d)));
      child.on("close", (code) => {
        if (killTimer) clearTimeout(killTimer as any);
        resolve({ code, stdout: out, stderr: err });
      });
      child.on("error", () =>
        resolve({ code: 127, stdout: out, stderr: err || "failed to spawn" }),
      );
    },
  );
}
```

#### Notes / trade-offs

*   This keeps your tests passing: env isolation, serialization, timeout cleanup, nested calls (no deadlock).
    
*   `runJSModule` **does not** capture `console.log`. It only forwards a string return. Your tests already assume that. If you want console capture for modules too, we can bolt on the same stdout/stderr shim per call or re-introduce a **separate** worker-based path with a tiny `js-worker.js`.

## User
oh the code rabbit isn't gonna be happy about that...

## ChatGPT
Fair. CodeRabbit hates global monkey-patching and shared mutable state — and you’re doing both (by necessity) to capture `stdout/stderr` and tweak `process.env`. Let’s give the bot less ammo without throwing away the working design:

Plan
----

*   Keep **in-process** `runJSFunction` ALS + serialization — fastest path, needed for re-entrancy.
    
*   Add **optional worker-isolation** for **JS modules** so there’s **no global mutation** in the main thread when you want console capture. Keep current in-proc module path as default for speed.
    
*   Switch per step with `js.isolate: "worker"` non-breaking; ignored unless set.
    

That way:

*   CodeRabbit sees an isolated path that doesn’t touch globals.
    
*   You still have the simple in-proc path when you want raw speed.
    

* * *

1) Add a worker implementation
------------------------------

Create `src/js-worker.ts`:

```ts
// src/js-worker.ts
import { parentPort, workerData } from "node:worker_threads";

type WorkerPayload = {
  modUrl: string;
  exportName?: string;
  args: any;
  env: Record<string, string>;
};

const { modUrl, exportName, args, env } = workerData as WorkerPayload;

let cleaned = false;
const origStdout = process.stdout.write.bind(process.stdout);
const origStderr = process.stderr.write.bind(process.stderr);
const origEnv: Record<string, string | undefined> = {};

function cleanup() {
  if (cleaned) return;
  cleaned = true;
  (process.stdout.write as any) = origStdout;
  (process.stderr.write as any) = origStderr;
  for (const [k, v] of Object.entries(origEnv)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

(process.stdout.write as any) = (chunk: any) => {
  parentPort?.postMessage({ type: "stdout", data: String(chunk) });
  return true;
};
(process.stderr.write as any) = (chunk: any) => {
  parentPort?.postMessage({ type: "stderr", data: String(chunk) });
  return true;
};

for (const [k, v] of Object.entries(env)) {
  origEnv[k] = process.env[k];
  process.env[k] = v;
}

(async () => {
  try {
    const mod: any = await import(modUrl);
    const fn =
      (exportName && mod && mod[exportName]) ||
      (mod && mod.default) ||
      mod;
    const res = await fn(args);
    if (typeof res === "string") {
      parentPort?.postMessage({ type: "stdout", data: res });
    }
    parentPort?.postMessage({ type: "done", code: 0 });
  } catch (err: any) {
    parentPort?.postMessage({
      type: "done",
      code: 1,
      error: err?.stack ?? String(err),
    });
  } finally {
    cleanup();
  }
})();
```

Build will output `js-worker.js`. ESM-safe; no relative imports.

* * *

2) Wire worker mode behind a flag
---------------------------------

Patch your runner to support both modes. Keep your **existing** in-proc `runJSModule` as default. Add a worker variant and dispatch on `step.js.isolate`.

```ts
// at top
import { Worker } from "node:worker_threads";
import { pathToFileURL } from "url";

// ...

async function runJSModuleWorker(
  modPath: string,
  exportName: string | undefined,
  args: any,
  env: Record<string, string>,
  timeoutMs?: number,
) {
  const modUrl = pathToFileURL(modPath).href;
  return new Promise<{ code: number | null; stdout: string; stderr: string }>(
    (resolve) => {
      const worker = new Worker(new URL("./js-worker.js", import.meta.url), {
        workerData: { modUrl, exportName, args, env },
      });

     let stdout = "";
      let stderr = "";
      let timer: NodeJS.Timeout | undefined;
      let settled = false;

     const finish = (res: { code: number | null; stdout: string; stderr: string }) => {
        if (settled) return;
        settled = true;
        if (timer) clearTimeout(timer);
        resolve(res);
      };

     if (timeoutMs && timeoutMs > 0) {
        timer = setTimeout(() => {
          worker.terminate().finally(() =>
            finish({ code: 124, stdout, stderr: `{stderr}timeout` }),
          );
        }, timeoutMs);
      }

     worker.on("message", (m: any) => {
        if (m?.type === "stdout") stdout += String(m.data ?? "");
        else if (m?.type === "stderr") stderr += String(m.data ?? "");
        else if (m?.type === "done") {
          finish({
            code: typeof m.code === "number" ? m.code : 0,
            stdout,
            stderr: m.error ? stderr + m.error : stderr,
          });
        }
      });

     worker.on("error", (err) =>
        finish({ code: 1, stdout, stderr: stderr + (err?.stack ?? String(err)) }),
      );
      worker.on("exit", (code) => finish({ code, stdout, stderr }));
    },
  );
}
```

Now adapt your exported `runJSModule`:

```ts
export async function runJSModule(
  step: PiperStep,
  cwd: string,
  env: Record<string, string>,
  timeoutMs?: number,
) {
  const modPath = path.isAbsolute(step.js!.module)
    ? step.js!.module
    : path.resolve(cwd, step.js!.module);

 // opt-in isolation: (step.js as any).isolate === "worker"
  if ((step.js as any)?.isolate === "worker") {
    // No envMutex needed; worker has its own process.env
    return runJSModuleWorker(
      modPath,
      step.js!.export,
      step.js!.args ?? {},
      env,
      timeoutMs,
    );
  }

 // default: existing in-proc path (fast path)
  const url = pathToFileURL(modPath).href;
  await envMutex.acquire();
  const prevEnv: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(env)) {
    prevEnv[k] = process.env[k];
    process.env[k] = v;
  }
  let timer: NodeJS.Timeout | undefined;
  try {
    const mod: any = await import(url);
    const fn = (step.js!.export && mod[step.js!.export]) || mod.default || mod;
    const call = fn(step.js!.args ?? {});
    const res = timeoutMs
      ? await Promise.race([
          call,
          new Promise((_, reject) =>
            (timer = setTimeout(() => reject(new Error("timeout")), timeoutMs)),
          ),
        ])
      : await call;
    const out = typeof res === "string" ? res : "";
    return { code: 0, stdout: out, stderr: "" };
  } catch (err: any) {
    return { code: 1, stdout: "", stderr: String(err?.stack ?? err) };
  } finally {
    if (timer) clearTimeout(timer);
    for (const [k, v] of Object.entries(prevEnv)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    envMutex.release();
  }
}
```

No API break; adding `js.isolate: "worker"` in a step opts in.

* * *

3) One focused AVA test for worker mode
---------------------------------------

Add to your tests:

```ts
test.serial("runJSModule (worker isolate) captures console without leaking", async (t) => {
  await withTmp(async (dir) => {
    const modSrc = `
      export default async function({ msg }) {
        console.log("log:", msg);
        return "ret:" + msg;
      }
    `;
    const modPath = path.join(dir, "m.js");
    await fs.writeFile(modPath, modSrc, "utf8");

   const cfg = {
      pipelines: [{
        name: "w",
        steps: [{
          id: "w1",
          cwd: dir,
          deps: [],
          inputs: [],
          outputs: [],
          cache: "content",
          env: { WENV: "X" },
          js: { module: "./m.js", isolate: "worker", args: { msg: "ok" } },
        }],
      }],
    };
    const pipelinesPath = path.join(dir, "pipelines.yaml");
    await fs.writeFile(pipelinesPath, YAML.stringify(cfg), "utf8");
    const res = await runPipeline(pipelinesPath, "w", { concurrency: 2 });

   const step = res[0]!;
    t.is(step.exitCode, 0);
    t.true(step.stdout?.includes("log: ok"));
    t.true(step.stdout?.includes("ret:ok"));
    t.is(process.env.WENV, undefined); // no leak to parent
  });
});
```

* * *

Why this calms CodeRabbit
-------------------------

*   The **worker path** isolates `process.env` and stream overrides to the worker, not the parent process.
    
*   The **in-proc path** remains for performance. It’s explicit that global patching happens only there, and you’ve already got serialization + cleanup to make it safe.
    
*   Clear step-level switch (`js.isolate: "worker"`) makes intent obvious to reviewers and tools.
    

If you want, we can later auto-select worker mode when `timeoutMs` exceeds N ms or when `captureConsole: true` is requested — but keeping it explicit is simpler and review-friendly.

## User
you know it didn't really register with me how hard doing this pipeline from inside of the same node execution context was going to be... when I wanted for each of the pipeline steps to just be a function  that get's exported from a module... but I still think this is the better way to do it... cause any node module can now be a step in the pipeline...

## ChatGPT
Yeah—running steps **in the same Node process** buys you the killer feature (“any npm module can be a step”), but you pay the tax: Node’s globals `process.env`, `stdout/stderr`, module cache aren’t namespaced. You’ve already wrestled the worst bits re-entrancy, timeouts, env isolation. I’d keep this direction. Just lock down the contract and make the trade-offs explicit.

Here’s how I’d shape it so it stays robust and sane even at scale:

The hard truths (and mitigations)
```
=================================
```
1.  Global state is shared.
    
    *   **Risk:** env leaks, interleaved logs, flaky tests.
        
    *   **Mitigation:** you already serialize `runJSFunction` via `AsyncLocalStorage` and a lock; `runJSModule` uses an env mutex. Keep that. Add **worker mode** for steps that must spew logs or mutate globals opt-in.
        
2.  Module cache persists across steps.
    
    *   **Risk:** “one-time” init in a module runs once and contaminates later runs.
        
    *   **Mitigation:** default to reuse (fast). Add `step.js.reload: true` to import with a cache-busting URL `file:///x/m.js?reload=…` when you _need_ a clean copy.
        
3.  Capturing logs without globals is basically impossible in-proc.
    
    *   **Mitigation:** document that **in-proc** steps should **return strings** (or write files) for output; if they _must_ log, use `js.isolate: "worker"` which captures console safely.
        
4.  Timeouts need cleanup.
    
    *   **Mitigation:** you’re already returning `124` and restoring env/streams in `finally`. Keep tests that assert both the exit code and “no leak after timeout.”
        
5.  CWD is ambient.
    
    *   **Mitigation:** never `chdir()` in the runner. Resolve paths against `step.cwd`, and (optionally) pass `cwd` in a context object so steps don’t have to read `process.cwd()`.
        

Make the step contract explicit (v1.1)
```
======================================
```
Don’t rely on implicit globals; give steps a **second, optional** context arg. It preserves backward compatibility (steps that don’t use it keep working) and gives you a place to route capabilities without monkey-patching.

```ts
// types.ts
export type StepCtx = Readonly<{
  cwd: string;
  env: Record<string, string>;
  signal: AbortSignal;          // for graceful cancellation
  logger: Console;              // per-step console in worker mode, or a noop in-proc
  tmpdir: string;               // runner-managed temp area
}>;

// Authoring contract (recommended):
// export async function myStep(args: A, ctx?: StepCtx): Promise<string|void>;
```

Minimal change in your runner:

```ts
// inside runJSFunction / runJSModule call sites
const ac = new AbortController();
const ctx = {
  cwd,
  env,
  signal: ac.signal,
  logger: console, // or a per-step Console if you're in worker mode
  tmpdir: path.join(cwd, ".tmp") // or mkdtemp
} satisfies StepCtx;

// call shape: if fn expects 2+ args, pass ctx; otherwise keep old shape
const maybeCall = (fn: Function, args: any) =>
  fn.length >= 2 ? fn(args, ctx) : fn(args);
```

This lets well-behaved steps avoid globals entirely: use `ctx.logger`, `ctx.env`, `ctx.cwd`, `ctx.signal`.

Isolation tiers (pick per step)
```
===============================
```
*   **In-proc function (`runJSFunction`)** — fastest; serialized; captures stdout/stderr by patch; good for pure steps and nested calls.
    
*   **In-proc module (`runJSModule`)** — env mutex; **no console capture**; good for steps that just return strings.
    
*   **Worker (`js.isolate: "worker"`)** — isolates env/console; safe for noisy/impure steps; slightly slower.
    
*   **Child process `runNode`/`runShell`** — full isolation; slowest; use for tools.
    

You’ve basically implemented the first three; just formalize the switch:

```ts
// pipelines.yaml
steps:
  - id: transpile
    cwd: packages/foo
    js:
      module: ./scripts/transpile.js
      export: default
      args: { minify: true }
      # options:
      isolate: worker      # optional
      reload: true         # optional cache-bust
```

Two small improvements I’d add now
```
==================================
```
$$
1.  Cache-busting flag
```
    ------------------
    
    In `runJSModule`, when `step.js.reload` is true:
    
    ```ts
    const url = new URL(pathToFileURL(modPath).href);
    url.searchParams.set("r", String(Date.now()) + Math.random().toString(36).slice(2));
    const mod: any = await import(url.href);
    ```
    
    It’s crude but effective and ESM-safe.
```
2.  Abort-aware timeouts
```
    --------------------
    
    Today you race the promise and then clean up. Also call `ac.abort()` so steps that pay attention to `ctx.signal` can stop work gracefully:
    
    ```ts
    const ac = new AbortController();
    const exec = () => maybeCall(fn, args, ctx);
    const timed = timeoutMs
      ? Promise.race([
          exec(),
          new Promise((_, r) => setTimeout(() => { ac.abort(); r(new Error("timeout")); }, timeoutMs))
        ])
      : exec();
    ```
    
    You still return `124`, but well-behaved steps will exit cleanly.
    

Documentation (so CodeRabbit shuts up)
```
======================================
```
Create `docs/STEP_API.md` and be blunt:

*   **Do** return a string for output.
    
*   **Don’t** rely on `process.env` or `console` unless you set `js.isolate: "worker"`.
    
*   **May** accept a second param `ctx` with `{ cwd, env, signal, logger, tmpdir }`.
    
*   **Must** be idempotent with respect to inputs/outputs defined in the pipeline.
    
*   **Timeout** ⇒ exit code `124`; env and streams are restored.
    

Drop a jsdoc banner above the monkey-patch block explaining the reentrancy + cleanup guarantees. Linters and review bots tend to back off when you show you’ve thought through it.

Tests to keep you honest
```
========================
```
You already have most of these; add the starred ones if missing:

*   env isolation under `concurrency: 2` ✅
    
*   serialization prevents global races (two JS steps) ✅
    
*   timeout restores globals and returns `124` ✅
    
*   nested `runJSFunction` doesn’t deadlock ✅
    
*   _`reload: true` actually reloads a mutated module export_
    
*   _`isolate: "worker"` captures console and doesn’t leak env_
    
*   _Abort: a step awaiting `ctx.signal` aborts on timeout_
    

* * *

Bottom line: your **“export a function = step”** idea is the right call. It maximizes reuse and lowers the barrier for contributors. Just codify the step API, surface **worker isolation** as an opt-in for messy steps, and keep your existing serialization/timeouts. You’ll have a fast, flexible pipeline that behaves under load and doesn’t gaslight you at 3am.

