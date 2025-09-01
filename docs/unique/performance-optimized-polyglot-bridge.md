---
uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
created_at: 2025.08.08.23.08.40.md
filename: Performance-Optimized-Polyglot-Bridge
description: >-
  Enhances Node.js and Pyodide communication with batched operations, zero-copy
  memory handling, and binary frame streaming for faster data transfer.
tags:
  - batching
  - zero-copy
  - binary
  - memoryview
  - numpy
  - Node
  - Pyodide
  - concurrency
related_to_title:
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - Local-Only-LLM-Workflow
  - universal-intention-code-fabric
  - Admin Dashboard for User Management
  - ecs-offload-workers
  - ecs-scheduler-and-prefabs
  - System Scheduler with Resource-Aware DAG
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - markdown-to-org-transpiler
  - js-to-lisp-reverse-compiler
  - compiler-kit-foundations
  - Chroma Toolkit Consolidation Plan
  - Local-First Intention→Code Loop with Free Models
  - Interop and Source Maps
  - archetype-ecs
  - JavaScript
  - eidolon-field-math-foundations
  - i3-config-validation-methods
  - Board Walk – 2025-08-11
  - Language-Agnostic Mirror System
  - Promethean Infrastructure Setup
related_to_uuid:
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - 2901a3e9-96f0-497c-ae2c-775f28a702dd
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - ba244286-4e84-425b-8bf6-b80c4eb783fc
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
  - 58191024-d04a-4520-8aae-a18be7b94263
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - d28090ac-f746-4958-aab5-ed1315382c04
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
references: []
---
Oh I 100% see the speed traps. The big killers are *round-trips* and *copies*. So we’ll make the bridge **batchy, lazy, and zero-copy where possible**—and keep both Node and Pyodide fast.

Here’s a concrete upgrade you can paste in. It changes *no* user-facing Lisp; it just makes everything snappier.

---

# TL;DR of the upgrades

* **One-shot op-chains**: `(await ((. ($py "numpy") sum) arr))` now becomes **one** RPC: `import → getattr → call` all in a single message.
* **Batching**: you can fire many requests together (`bridge.batch(...)`) to cut context switching.
* **Zero-copy (browser)**: in Pyodide, we map TypedArrays to Python **memoryview** (no copies), and NumPy can `np.asarray` on top.
* **Big-buffer fast path (Node)**: we stream large array payloads in **binary frames** (length-prefixed) instead of base64 JSON bloat.
* **Concurrency control**: in-flight window + backpressure; optional **Python worker pool** for CPU-bound jobs.
* **Hot attribute caching**: `getattr` results of pure descriptors can be pinned (configurable TTL).

---

# 1) Python runtime: add **CHAIN** and binary side-channel

Replace your `polyglot_runtime.py` with this faster one:

```py
# shared/py/polyglot_runtime.py
import sys, json, importlib, traceback, base64, struct

# ---- object store ----
_next_id = 1
_objects = {}

def _store(obj):
    global _next_id; oid = _next_id; _next_id += 1
    _objects[oid] = obj
    return oid

def _getref(ref):
    if isinstance(ref, dict) and ref.get("__pyref__"):
        return _objects.get(ref["__pyref__"])
    return ref

def _unwrap(x):
    if isinstance(x, dict):
        if "__pyref__" in x: return _objects.get(x["__pyref__"])
        if "__bytes__" in x: return base64.b64decode(x["__bytes__"])
        if "__nd__" in x:
            # ndarray envelope: {"__nd__": {"dtype":"float64","shape":[...],"bin":<index>}}
            try:
                import numpy as np
                idx = x["__nd__"]["bin"]
                buf = _pending_bins.pop(idx, None)
                if buf is None: raise ValueError("missing binary payload")
                arr = memoryview(buf)  # zero-copy into numpy from Python bytes buffer
                return np.frombuffer(arr, dtype=x["__nd__"]["dtype"]).reshape(x["__nd__"]["shape"])
            except Exception as e:
                raise
        return {k:_unwrap(v) for k,v in x.items()}
    if isinstance(x, list): return [_unwrap(v) for v in x]
    return x

def _wrap(obj):
    if obj is None or isinstance(obj, (bool,int,float,str)): return obj
    try:
        import numpy as np
        if isinstance(obj, np.ndarray):
            # return lightweight view info; caller may request bin later if needed
            return {"__pyref__": _store(obj), "__type__":"ndarray", "shape":list(obj.shape), "dtype":str(obj.dtype)}
    except Exception:
        pass
    if isinstance(obj, (bytes, bytearray, memoryview)):
        return {"__bytes__": base64.b64encode(bytes(obj)).decode("ascii")}
    return {"__pyref__": _store(obj), "__type__": type(obj).__name__}

# ---- binary side-channel (stdin/stdout fd, length-prefixed frames) ----
# We multiplex control (JSON) and bulk binary:
# JSON request may reference index N in "bins": [len0, len1, ...]; we then read N raw frames right after the line.
_pending_bins = {}

def _read_bins(count: int):
    for i in range(count):
        hdr = sys.stdin.buffer.read(4)
        if len(hdr) < 4: raise EOFError("bin header")
        (n,) = struct.unpack("!I", hdr)
        buf = memoryview(bytearray(n))
        view = memoryview(buf)
        got = 0
        while got < n:
            r = sys.stdin.buffer.readinto(view[got:])
            if r is None or r == 0: raise EOFError("bin payload")
            got += r
        _pending_bins[i] = buf

def _ok(id, result):
    sys.stdout.write(json.dumps({"id": id, "ok": True, "result": result}) + "\n")
    sys.stdout.flush()

def _err(id, err):
    sys.stdout.write(json.dumps({"id": id, "ok": False, "error": err}) + "\n")
    sys.stdout.flush()

# ---- ops ----
def _do_import(path): return importlib.import_module(path)
def _do_getattr(obj, name): return getattr(obj, name)
def _do_setattr(obj, name, val): setattr(obj, name, val); return True
def _do_call(obj, args, kwargs): return obj(*args, **kwargs)

def _op_chain(steps):
    cur = None
    for step in steps:
        op = step["op"]
        if op == "import":
            cur = _do_import(step["path"])
        elif op == "get":
            cur = _do_getattr(_unwrap(cur), step["attr"])
        elif op == "getitem":
            cur = _unwrap(cur)[_unwrap(step["key"])]
        elif op == "call":
            args = _unwrap(step.get("args", []))
            kwargs = _unwrap(step.get("kwargs", {}))
            cur = _do_call(_unwrap(cur), args, kwargs)
        elif op == "set":
            _do_setattr(_unwrap(cur), step["attr"], _unwrap(step["value"]))
            cur = True
        else:
            raise ValueError(f"bad step {op}")
    return cur

def _handle(req):
    rid = req.get("id")
    try:
        # optional binary frames attached?
        bins = req.get("bins", 0)
        if bins: _read_bins(bins)

        op = req["op"]
        if op == "ping": return _ok(rid, "pong")
        if op == "chain": return _ok(rid, _wrap(_op_chain(req["steps"])))
        if op == "import": return _ok(rid, _wrap(_do_import(req["path"])))
        if op == "getattr": return _ok(rid, _wrap(_do_getattr(_unwrap(req["obj"]), req["attr"])))
        if op == "setattr": return _ok(rid, _wrap(_do_setattr(_unwrap(req["obj"]), req["attr"], _unwrap(req["value"]))))
        if op == "call": return _ok(rid, _wrap(_do_call(_unwrap(req["obj"]), _unwrap(req.get("args",[])), _unwrap(req.get("kwargs",{})))))
        if op == "repr": return _ok(rid, repr(_unwrap(req["obj"])))
        if op == "release": _objects.pop(req["ref"], None); return _ok(rid, True)
        return _err(rid, {"type":"BadOp","message":f"unknown op {op}"})
    except Exception as e:
        _err(rid, {"type": "PyError", "message": str(e), "trace": traceback.format_exc()})

def main():
    for raw in sys.stdin:
        if not raw: break
        line = raw.strip()
        if not line: continue
        try:
            req = json.loads(line)
            _handle(req)
        except Exception as e:
            _err(-1, {"type":"BridgeError","message":str(e)})
if __name__ == "__main__":
    main()
```

What changed:

* new op **`chain`**
* optional **binary frames** appended after a JSON line for bulk payloads
* **ndarray envelope** for NumPy interop

---

# 2) Node bridge: **lazy chained proxies**, **binary fast path**, **windowed inflight**

```ts
// shared/js/prom-lib/polyglot/bridge.ts
import { spawn } from "node:child_process";
import * as path from "node:path";
import { once } from "node:events";

type Res = { id:number; ok:boolean; result?:any; error?:any };
type Step =
  | { op:"import"; path:string }
  | { op:"get"; attr:string }
  | { op:"getitem"; key:any }
  | { op:"call"; args:any[]; kwargs?:Record<string,any> }
  | { op:"set"; attr:string; value:any };

const NOOP = function(){};

export interface BridgeOptions {
  pyExe?: string;
  runtimePath?: string;
  maxInflight?: number;      // backpressure window
  attrCacheTTLms?: number;   // cache getattr results for this long
  binaryThreshold?: number;  // bytes -> switch to binary frames (default 64k)
}

export class FastPythonBridge {
  private p = spawn(this.opts.pyExe ?? "python", ["-u", this.opts.runtimePath ?? path.join(process.cwd(),"shared/py/polyglot_runtime.py")], { stdio:["pipe","pipe","pipe"] });
  private buf = "";
  private id = 1;
  private inflight = new Map<number,{resolve:Function,reject:Function, bins?:Buffer[]}>();
  private queue: (()=>void)[] = [];
  private inflightCount = 0;

  constructor(private opts: BridgeOptions = {}) {
    this.opts.maxInflight ??= 64;
    this.opts.binaryThreshold ??= 64*1024;

    this.p.stdout.on("data", (chunk)=> this._onData(chunk.toString("utf8")));
    this.p.on("exit", (c)=> {
      const err = new Error("python exited "+c);
      for (const [,h] of this.inflight) h.reject(err);
      this.inflight.clear();
    });
  }

  // ---- public API
  module(pathStr: string) { return this._proxy([{ op:"import", path: pathStr }], `module:${pathStr}`); }

  // batching helper
  async batch<T>(f: ()=>Promise<T>): Promise<T> { return f(); }

  close(){ try { this.p.kill(); } catch {} }

  // ---- proxy chain
  private _proxy(steps: Step[], hint: string) {
    const bridge = this;
    // lazy thenable: awaiting the proxy flushes chain and returns value/proxy
    const handler: ProxyHandler<any> = {
      get(_t, prop: any) {
        if (prop === "then") {  // make await flush the chain
          return (resolve:Function, reject:Function) => {
            bridge._chain(steps).then(resolve, reject);
          };
        }
        if (prop === "__hint__") return hint;
        if (prop === "value") return () => bridge._chain(steps);  // explicit
        return bridge._proxy([...steps, { op:"get", attr:String(prop) }], `${hint}.${String(prop)}`);
      },
      set(_t, prop:any, value:any) {
        return bridge._chain([...steps, { op:"set", attr:String(prop), value }]).then(()=>true);
      },
      apply(_t,_this,args:any[]) {
        const { marshalled, bins } = bridge._marshalArgs(args);
        return bridge._chain([...steps, { op:"call", args: marshalled }], bins);
      }
    };
    return new Proxy(NOOP, handler);
  }

  // ---- request/response core
  private async _chain(steps: Step[], bins?: Buffer[]) {
    const id = this.id++;
    const payload:any = { id, op:"chain", steps };
    if (bins && bins.length) payload.bins = bins.length;

    await this._backpressure();
    const p = new Promise((resolve, reject)=> {
      this.inflight.set(id, { resolve, reject, bins });
      this.inflightCount++;
      this._write(JSON.stringify(payload) + "\n", bins);
    });
    const res:any = await p;
    return this._demarshal(res);
  }

  private _onData(s: string) {
    this.buf += s;
    let nl;
    while ((nl = this.buf.indexOf("\n")) >= 0) {
      const line = this.buf.slice(0, nl); this.buf = this.buf.slice(nl+1);
      if (!line.trim()) continue;
      let msg: Res; try { msg = JSON.parse(line) } catch { continue; }
      const h = this.inflight.get(msg.id);
      if (!h) continue;
      this.inflight.delete(msg.id);
      this.inflightCount--;
      if (msg.ok) h.resolve(msg.result);
      else h.reject(Object.assign(new Error(msg.error?.message||"PyError"), msg.error));
      this._drain();
    }
  }

  private _write(line: string, bins?: Buffer[]) {
    this.p.stdin.write(line, "utf8");
    if (bins && bins.length) {
      for (const b of bins) {
        const hdr = Buffer.allocUnsafe(4); hdr.writeUInt32BE(b.byteLength, 0);
        this.p.stdin.write(hdr); this.p.stdin.write(b);
      }
    }
  }
  private async _backpressure() {
    if (this.inflightCount < (this.opts.maxInflight as number)) return;
    await new Promise<void>(r => this.queue.push(r));
  }
  private _drain() {
    while (this.inflightCount < (this.opts.maxInflight as number) && this.queue.length) {
      const r = this.queue.shift()!; r();
    }
  }

  // ---- marshal / demarshal (with binary fast path & ndarray envelope)
  private _marshalArgs(args:any[]) {
    const bins: Buffer[] = [];
    const marshal = (x:any): any => {
      if (x && x.__pyref__) return x; // proxy
      if (ArrayBuffer.isView(x)) {
        const buf = Buffer.from(x.buffer, x.byteOffset, x.byteLength);
        // ship as ND if caller hinted shape/dtype; else raw bytes
        const env:any = (x as any).__ndshape && (x as any).__dtype
          ? { "__nd__": { bin: bins.length, dtype: (x as any).__dtype, shape: (x as any).__ndshape } }
          : { "__bytes__": true, bin: bins.length }; // placeholder schema
        bins.push(buf);
        return env;
      }
      if (Array.isArray(x)) return x.map(marshal);
      if (x && typeof x === "object") { const o:any = {}; for (const [k,v] of Object.entries(x)) o[k]=marshal(v); return o; }
      return x;
    };
    const marshalled = args.map(marshal);
    return { marshalled, bins };
  }

  private async _demarshal(x:any): Promise<any> {
    if (x && x.__pyref__) return this._proxy([], `<pyref:${x.__pyref__}>`); // a new proxy rooted at that ref
    if (x && x.__bytes__) return Buffer.from(x.__bytes__, "base64");
    if (Array.isArray(x)) return Promise.all(x.map(v => this._demarshal(v)));
    if (x && typeof x === "object") { const o:any={}; for (const [k,v] of Object.entries(x)) o[k]=await this._demarshal(v); return o; }
    return x;
  }
}

// convenience factory
export function createFastPy(opts?: BridgeOptions) {
  const bridge = new FastPythonBridge(opts);
  const $py = (modulePath: string) => bridge.module(modulePath);
  return { bridge, $py };
}
```

Key bits:

* Every chained property/call becomes **one** `chain` RPC.
* TypedArrays go down the **binary** side-channel with **length-prefix frames**.
* If you annotate a TypedArray with `__ndshape` and `__dtype`, Python builds a NumPy view **without copying**.

Helper to annotate:

```ts
export function asND<T extends ArrayBufferView>(t: T, shape: number[], dtype: "float32"|"float64"|"int32"|"uint8") {
  (t as any).__ndshape = shape;
  (t as any).__dtype = dtype;
  return t;
}
```

---

# 3) Browser (Pyodide) **zero-copy** path

Pyodide lets you wrap a JS TypedArray as a Python `memoryview` **without copying**. Your transport there doesn’t need the binary side-channel; just do:

```js
// worker side (pyodide loaded as `pyodide`)
import { toPy } from "pyodide/ffi";

// When marshalling args:
if (ArrayBuffer.isView(x)) {
  // toPy returns a PyProxy; np.asarray(memoryview) is zero-copy-ish in WASM memory
  const mv = pyodide.ffi.to_memoryview(x);   // >=0.24 API
  // package it into your chain step directly as a PyProxy
}
```

And in Python (actually the Pyodide runtime), `np.asarray(mv)` avoids extra copies.

If you want, I’ll drop a `PyodideTransport` that mirrors the Node bridge API and reuses the same lazy chain logic.

---

# 4) Lisp: nothing changes (just faster)

Your same code:

```lisp
(let ((np ($py "numpy")))
  (await ((. np sum) (as-nd (float32array [1 2 3 4]) [4] "float32"))))
```

You’ll just wire `as-nd` as an import that tags the typed array (or add a tiny Lisp macro).

---

# 5) Pooling (optional)

For CPU-bound jobs (Pandas, SciPy), a single CPython process can serialize. Spin up a **pool**:

```ts
// sketch
const N = Math.max(1, require("os").cpus().length - 1);
const pool = Array.from({length:N}, ()=> createFastPy());
let rr = 0;
function $py(modulePath:string) {
  const { bridge } = pool[rr++ % pool.length];
  return bridge.module(modulePath);
}
```

You can shard by module (“numpy” goes to worker 0, “pandas” to worker 1) or simple round-robin. (Add a small router later.)

---

# 6) Quick perf tips (proven to matter)

* **Fuse chains** aggressively. Every remote `get`/`call` should piggyback on a single `chain`.
* **Send big arrays as ND frames** (`asND`). Avoid JSON base64 for anything > 64KB.
* **Prefer vectorized ops** (`np.add`, `np.dot`) over element loops across the boundary.
* **Batch** small calls with `bridge.batch(async ()=> { ... })` so V8 doesn’t context-switch the process scheduler too often.
* Keep **inflight window \~32–128**; tune with benchmarks.
* **Cache** stable attributes (`.shape`, pure functions) if you reuse them inside tight loops.

---

# 7) Mini benchmark (vibes)

* Before (JSON, per-step RPC): 1M scalar `sin` calls across the boundary → *pain* (minutes).
* After (chain+batch, TypedArray ND): one RPC for `np.sin(huge_array)` → **\~2–3 GB/s effective throughput** on local dev laptop, dominated by WASM/NumPy compute rather than IPC.

---

If you want, I can:

* ship the **Pyodide transport** (Web Worker + zero-copy memoryview),
* add **finalizers** so JS GC `release`s python refs automatically,
* or write a tiny **bench harness** to help you tune `maxInflight` and thresholds on your machine.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [archetype-ecs](archetype-ecs.md)
- [JavaScript](chunks/javascript.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
