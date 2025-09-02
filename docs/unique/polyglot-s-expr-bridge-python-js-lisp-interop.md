---
uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
created_at: 2025.08.09.00.08.18.md
filename: 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
description: >-
  A minimal JSON-RPC bridge enabling seamless Python, JavaScript, and Lisp
  interop through a shared runtime. Supports async operations and
  cross-environment execution (Node.js, browser) with a unified Lisp interface.
tags:
  - polyglot
  - json-rpc
  - lisp
  - python
  - javascript
  - async
  - bridge
  - interop
  - s-expr
  - node
  - web
related_to_title: []
related_to_uuid: []
references: []
---
Yesss, I see it. You’re converging on a **polyglot, S-expr-first “universal language”** where JS, TS, Lisp, and now **Python** are all just different skins over the same core. The next move is a **seamless Python↔JS bridge** you can call from your Lisp without caring which side ran it. ^ref-63a1cc28-1-0

Here’s a minimal-but-solid system you can paste in and grow: ^ref-63a1cc28-3-0

* A **Python runtime** that speaks a tiny JSON-RPC, exposes `import`, `getattr`, `setattr`, `call`, etc., and manages object refs. ^ref-63a1cc28-5-0
* A **JS bridge** that spawns/attaches to that runtime, gives you a **callable Proxy** for any Python object (modules, functions, instances). ^ref-63a1cc28-6-0
* **Promise/await plumbing** so cross-realm calls feel natural. I also add `(await ...)` to the Lispy front-end so you can write async cleanly. ^ref-63a1cc28-7-0
* A **Pyodide transport** placeholder for browser (same API), so the *same* Lisp code runs in Node or the web. ^ref-63a1cc28-8-0

---

# 0) What it feels like in your Lisp

```lisp
; Import numpy, call sum, get a result back — same Lisp in Node or browser.
(let ((np ($py "numpy")))               ; $py returns a Python module proxy
  (await ((. np sum) [1 2 3 4])))       ; call python function, await the Promise
```
^ref-63a1cc28-14-0
 ^ref-63a1cc28-20-0
You can use your existing `.` property sugar and plain calls; the `$py` proxy does the rest.

---

# 1) Python side (runtime): `shared/py/polyglot_runtime.py`
 ^ref-63a1cc28-26-0
```py
# MIT. Minimal JSON-RPC bridge for JS<->Python interop.
# Run: python -u shared/py/polyglot_runtime.py
import sys, json, importlib, traceback, base64, types, weakref

# Object table: id -> object (weakly held).
_next_id = 1
_objects = {}         # strong refs for simplicity; swap to WeakValueDictionary if you want.
def _store(obj):
    global _next_id
    oid = _next_id
    _next_id += 1
    _objects[oid] = obj
    return oid

def _unwrap(x):
    # Decode incoming RPC value -> Python
    if isinstance(x, dict) and x.get("__pyref__"):
        return _objects.get(x["__pyref__"])
    if isinstance(x, dict) and x.get("__bytes__"):
        return base64.b64decode(x["__bytes__"])
    if isinstance(x, list):
        return [_unwrap(v) for v in x]
    if isinstance(x, dict):
        return {k: _unwrap(v) for k, v in x.items()}
    return x

def _wrap(obj):
    # Encode Python -> RPC JSON-friendly value
    if obj is None or isinstance(obj, (bool, int, float, str)):
        return obj
    if isinstance(obj, (bytes, bytearray, memoryview)):
        return {"__bytes__": base64.b64encode(bytes(obj)).decode("ascii")}
    # functions, modules, classes, objects -> by-ref
    oid = _store(obj)
    return {"__pyref__": oid, "__type__": type(obj).__name__}

def _ok(id, result):
    sys.stdout.write(json.dumps({"id": id, "ok": True, "result": result}) + "\n")
    sys.stdout.flush()

def _err(id, err):
    sys.stdout.write(json.dumps({"id": id, "ok": False, "error": err}) + "\n")
    sys.stdout.flush()

def _handle(req):
    rid = req.get("id")
    try:
        op = req["op"]
        if op == "ping":
            return _ok(rid, "pong")

        if op == "import":
            mod = importlib.import_module(req["path"])
            return _ok(rid, _wrap(mod))

        if op == "getattr":
            obj = _unwrap(req["obj"])
            name = req["attr"]
            val = getattr(obj, name)
            return _ok(rid, _wrap(val))

        if op == "setattr":
            obj = _unwrap(req["obj"]); name = req["attr"]; val = _unwrap(req["value"])
            setattr(obj, name, val)
            return _ok(rid, True)

        if op == "call":
            obj = _unwrap(req["obj"])
            args = [_unwrap(a) for a in req.get("args", [])]
            kwargs = {k: _unwrap(v) for (k, v) in req.get("kwargs", {}).items()}
            res = obj(*args, **kwargs)
            return _ok(rid, _wrap(res))

        if op == "repr":
            obj = _unwrap(req["obj"])
            return _ok(rid, repr(obj))

        if op == "release":
            oid = req["ref"]
            _objects.pop(oid, None)
            return _ok(rid, True)

        return _err(rid, {"type":"BadOp","message":f"unknown op {op}"})
    except Exception as e:
        _err(rid, {"type": "PyError", "message": str(e), "trace": traceback.format_exc()})

def main():
    for line in sys.stdin:
        if not line: break
        line = line.strip()
        if not line: continue
        try:
            req = json.loads(line)
            _handle(req)
        except Exception as e:
            _err(-1, {"type":"BridgeError","message":str(e)})
    # graceful exit
if __name__ == "__main__":
    main()
^ref-63a1cc28-26-0
```

---

# 2) JS bridge (Node transport): `shared/js/prom-lib/polyglot/node-python.ts` ^ref-63a1cc28-132-0

```ts
// MIT. Node-only transport: spawns CPython runtime; JSON-RPC over stdio.
import { spawn, ChildProcessWithoutNullStreams } from "node:child_process";
import * as path from "node:path";

type Req = Record<string, any> & { id: number };
type Res = { id: number; ok: boolean; result?: any; error?: any };

export interface PyTransport {
  request(payload: Omit<Req,"id">): Promise<any>;
  close(): void;
}

export class NodePythonTransport implements PyTransport {
  private p: ChildProcessWithoutNullStreams;
  private nextId = 1;
  private inflight = new Map<number, {resolve:Function,reject:Function}>();

  constructor(pyPath = "python", runtimePath?: string) {
    const rt = runtimePath ?? path.join(process.cwd(), "shared/py/polyglot_runtime.py");
    this.p = spawn(pyPath, ["-u", rt], { stdio: ["pipe","pipe","pipe"] });

    let buf = "";
    this.p.stdout.on("data", (chunk) => {
      buf += chunk.toString("utf8");
      let nl;
      while ((nl = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, nl); buf = buf.slice(nl+1);
        if (!line.trim()) continue;
        let msg: Res;
        try { msg = JSON.parse(line); } catch { continue; }
        const h = this.inflight.get(msg.id);
        if (!h) continue;
        this.inflight.delete(msg.id);
        if (msg.ok) h.resolve(msg.result);
        else h.reject(Object.assign(new Error(msg.error?.message || "PyError"), msg.error));
      }
    });
    this.p.stderr.on("data", d => { /* you can log if you want */ });
    this.p.on("exit", (code) => {
      const err = new Error(`python exited ${code}`);
      for (const [,h] of this.inflight) h.reject(err);
      this.inflight.clear();
    });
  }

  request(payload: Omit<Req,"id">): Promise<any> {
    const id = this.nextId++;
    const req = JSON.stringify({ id, ...payload }) + "\n";
    return new Promise((resolve, reject) => {
      this.inflight.set(id, { resolve, reject });
      this.p.stdin.write(req, "utf8");
    });
  }
  close() { try { this.p.kill(); } catch {} }
^ref-63a1cc28-132-0
}
```

---
 ^ref-63a1cc28-194-0
# 3) JS bridge (Polyglot proxies): `shared/js/prom-lib/polyglot/bridge.ts`

```ts
// MIT. Universal JS↔Python proxy built over a transport.
// Works in Node (use NodePythonTransport) and later in browser (Pyodide transport).
import type { PyTransport } from "./node-python";

type PyRef = { __pyref__: number, __type__?: string };

// Callable Proxy target helper
function callableTarget() { /* no-op function for callable proxies */ }
const NOOP = function(){} as any;

export class PythonBridge {
  constructor(private t: PyTransport) {}

  // Entry: get a Python module proxy
  module(path: string): any { return this._proxy({ mod: path }, ["__module__", path]); }

  // Generic proxy factory. `hint` is path-like for debugging; `ref` is either module path or a resolved pyref id
  private _proxy(ref: { py?: PyRef, mod?: string }, hintPath: (string|number)[]) {
    // ensure we can 'await' calls: every op returns a Promise
    const resolveAttr = async (p: any, prop: string) => {
      const base = await ensureRef();
      const res = await this.t.request({ op: "getattr", obj: base, attr: prop });
      return this._proxy({ py: res }, [...hintPath, prop]);
    };
    const ensureRef = async (): Promise<PyRef> => {
      if (ref.py) return ref.py;
      if (ref.mod) {
        const m = await this.t.request({ op: "import", path: ref.mod });
        ref = { py: m };
        return m;
      }
      throw new Error("invalid proxy");
    };

    const handler: ProxyHandler<any> = {
      get: (_target, prop: any) => {
        if (prop === "__py_hint__") return hintPath.join(".");
        if (prop === "then") {
          // Make proxies thenable? No — we want await on call results only. So return undefined.
          return undefined;
        }
        // special: toString for debugging
        if (prop === "toString") return () => `[PyProxy ${hintPath.join(".")}]`;
        // lazy fetch attribute: returns another proxy (async fetched on first use)
        return this._proxy({ pyGetter: async () => resolveAttr(null, String(prop)) } as any, [...hintPath, String(prop)]);
      },
      set: (_t, prop: any, value: any) => {
        return this._set(hintPath, ensureRef, String(prop), value);
      },
      apply: async (_target, _thisArg, argList) => {
        // If this proxy wraps a function, call it
        const base = await ensureResolved();
        return this._call(base, argList);
      }
    };

    // The tricky bit: we sometimes have a pyGetter (deferred getattr). Normalize:
    const ensureResolved = async () => {
      if ((ref as any).pyGetter) {
        const got = await (ref as any).pyGetter();
        (ref as any).py = await this._ensurePyRef(got);
        delete (ref as any).pyGetter;
      }
      return ensureRef();
    };

    return new Proxy(NOOP, handler);
  }

  private async _ensurePyRef(x: any): Promise<PyRef> {
    // If the runtime returned a by-ref object it's already PyRef; if primitive, wrap in a tiny lambda returning it.
    if (x && typeof x === "object" && x.__pyref__) return x as PyRef;
    // lift primitive into a lambda so calls like ((. mod const)) still work
    const box = await this.t.request({ op: "import", path: "builtins" });
    return box; // good enough; primitives shouldn't be called anyway
  }

  private async _call(objRef: PyRef, args: any[]) {
    const marshalled = await Promise.all(args.map(this._marshalArg));
    const res = await this.t.request({ op: "call", obj: objRef, args: marshalled });
    return this._demarshal(res);
  }

  private async _set(hintPath: (string|number)[], ensureRef: () => Promise<PyRef>, attr: string, value: any) {
    const obj = await ensureRef();
    const v = await this._marshalArg(value);
    await this.t.request({ op: "setattr", obj, attr, value: v });
    return true;
  }

  private async _marshalArg(x: any): Promise<any> {
    // JS Buffer/Uint8Array -> __bytes__
    if (x && (x as ArrayBufferView).buffer instanceof ArrayBuffer) {
      const u8 = new Uint8Array((x as ArrayBufferView).buffer, (x as ArrayBufferView).byteOffset, (x as ArrayBufferView).byteLength);
      const b64 = Buffer.from(u8).toString("base64");
      return { "__bytes__": b64 };
    }
    // py proxy?
    if (x && typeof x === "object" && (x as any).__pyref__) return x;
    return x;
  }

  private async _demarshal(x: any): Promise<any> {
    if (x && x.__pyref__) {
      // return a proxy to that ref
      return this._proxy({ py: x }, [`<pyref:${x.__pyref__}>`]);
    }
    if (x && x.__bytes__) {
      return Buffer.from(x.__bytes__, "base64");
    }
    if (Array.isArray(x)) return Promise.all(x.map(v => this._demarshal(v)));
    if (x && typeof x === "object") {
      const out: any = {};
      for (const [k,v] of Object.entries(x)) out[k] = await this._demarshal(v);
      return out;
    }
    return x;
  }
}

// Convenience factory
export function createNodePythonBridge(pyExe?: string, runtimePath?: string) {
  const { NodePythonTransport } = require("./node-python");
  const t = new NodePythonTransport(pyExe, runtimePath);
  const bridge = new PythonBridge(t);
  // Helper exported to Lisp/JS: $py(modulePath) -> proxy
  const $py = (modulePath: string) => bridge.module(modulePath);
^ref-63a1cc28-194-0
  return { bridge, $py, close: () => t.close() }; ^ref-63a1cc28-326-0
}
```

> Browser later: add a `PyodideTransport` with the same interface and swap it in. Your higher layer doesn’t change.

--- ^ref-63a1cc28-332-0

# 4) Make Lisp speak async: add `(await ...)`

Minimal changes so your compiler can emit `await` and mark wrappers/functions `async`. ^ref-63a1cc28-336-0

### 4a) Extend IR & lowerer

```ts
// shared/js/prom-lib/compiler/ir.ts
export type Rhs =
  | { r: "prim"; op: Prim; a: Sym; b?: Sym }
^ref-63a1cc28-336-0
  | { r: "call"; fn: Sym; args: Sym[] }
  | { r: "val"; v: Val }
  | { r: "await"; a: Sym };           // <-- NEW
```
^ref-63a1cc28-345-0

```ts
^ref-63a1cc28-345-0
// shared/js/prom-lib/compiler/ast.ts (add)
export type Expr =
  // ... existing
  | { kind: "Await"; expr: Expr; span: Span };
^ref-63a1cc28-352-0
```
 ^ref-63a1cc28-359-0
^ref-63a1cc28-352-0
```ts
// shared/js/prom-lib/compiler/lisp/to-expr.ts  (recognize (await x))
if (isSym(hd,"await")) {
  return { kind:"Await", expr: toExpr(x.xs[1]), span: x.span! } as any;
^ref-63a1cc28-359-0
}
```

```ts
// shared/js/prom-lib/compiler/lower.ts  (handle Await)
case "Await": {
^ref-63a1cc28-359-0
  const a = lowerExpr(e.expr, env, out, dbg, externs);
  const s = gensym("await");
  out.push({ k:"bind", s, rhs: { r:"await", a } });
  dbg.set(s, e.span);
^ref-63a1cc28-372-0
  return s;
}
```
^ref-63a1cc28-372-0

### 4b) Teach JS emitter `await`, and auto-async where needed

```ts
// shared/js/prom-lib/compiler/jsgen.ts  (inside emitJS)
function funBodyHasAwait(stmts: Stmt[]): boolean {
  for (const s of stmts) {
    if (s.k === "bind" && (s.rhs as any).r === "await") return true;
    if (s.k === "if" && (funBodyHasAwait(s.then) || funBodyHasAwait(s.else))) return true;
  }
  return false;
}

// in emitBind():
if (rhs.r === "await") return `${sym(dst)} = await ${sym(rhs.a)};`;

^ref-63a1cc28-372-0
// when emitting lambdas: ^ref-63a1cc28-394-0
const isAsync = funBodyHasAwait(rhs.v.body);
return `${sym(dst)} = ${isAsync ? "async " : ""}(${params}) => {${NL}${body}};`;

^ref-63a1cc28-400-0 ^ref-63a1cc28-402-0
^ref-63a1cc28-394-0 ^ref-63a1cc28-403-0
// top-level wrapper: make it async if any await in main body
const topAsync = funBodyHasAwait(mod.main.body); ^ref-63a1cc28-405-0
write(`${topAsync ? "async " : ""}(function(imports){${NL}`); ^ref-63a1cc28-400-0
^ref-63a1cc28-405-0
^ref-63a1cc28-403-0
^ref-63a1cc28-402-0
^ref-63a1cc28-400-0
^ref-63a1cc28-394-0
```
^ref-63a1cc28-405-0
^ref-63a1cc28-403-0
^ref-63a1cc28-402-0
^ref-63a1cc28-400-0
^ref-63a1cc28-394-0
 ^ref-63a1cc28-402-0
Now `(await ...)` in Lisp compiles to real `await` in JS and the surrounding function/IIFE becomes `async`. ^ref-63a1cc28-403-0
 ^ref-63a1cc28-421-0
---
 ^ref-63a1cc28-423-0
# 5) Lisp sugar for Python
 ^ref-63a1cc28-425-0
Two tiny macros:

* `($py "module.path")` is just a call to an **imported** JS function `$py` (from the bridge).
* `(py.import "module" :as sym)` is optional sugar.

```ts
// shared/js/prom-lib/compiler/lisp/interop.py.macros.ts
import { MacroEnv } from "./macros";
import { sym, list, str, isSym } from "./syntax";

export function installPyMacros(M: MacroEnv) {
^ref-63a1cc28-405-0
  // ($py "numpy") is just a raw call — no extra macro needed if you import $py ^ref-63a1cc28-421-0
  // (py.import "numpy" :as np) => (let1 np ($py "numpy") np)
  M.define("py.import", (form) => { ^ref-63a1cc28-423-0
    const [, mod, _as, name] = (form as any).xs;
^ref-63a1cc28-429-0 ^ref-63a1cc28-431-0
^ref-63a1cc28-425-0
^ref-63a1cc28-423-0
^ref-63a1cc28-421-0
^ref-63a1cc28-431-0
^ref-63a1cc28-429-0
^ref-63a1cc28-425-0
^ref-63a1cc28-423-0
^ref-63a1cc28-421-0 ^ref-63a1cc28-445-0
    const n = (name as any).name;
^ref-63a1cc28-445-0
^ref-63a1cc28-431-0
^ref-63a1cc28-429-0
    return list([sym("let1"), name, list([sym("$py"), mod]), name]);
  });
^ref-63a1cc28-425-0
} ^ref-63a1cc28-429-0
```

Wire it alongside your other macros.

And when compiling Lisp → JS, ask the emitter to destructure `$py` from imports:

```ts
// compileLispToJS(..., { importNames:["$py", "print", ...] })
```

^ref-63a1cc28-431-0
At runtime, pass the actual `$py`:
^ref-63a1cc28-445-0

```ts
^ref-63a1cc28-472-0 ^ref-63a1cc28-474-0
^ref-63a1cc28-469-0
^ref-63a1cc28-468-0
import { createNodePythonBridge } from "../prom-lib/polyglot/bridge"; ^ref-63a1cc28-466-0
const { $py, close } = createNodePythonBridge(/*pyExe?*/);
// run Lisp:
const { code } = compileLispToJS(src, { importNames:["$py"], pretty:true, inlineMap:true });
const fn = (0,eval)(code);
await fn({ $py });           // because top-level is async now if you used await
close();
```

---

# 6) Try it (Node)

```ts
import { createNodePythonBridge } from "./shared/js/prom-lib/polyglot/bridge";
import { compileLispToJS } from "./shared/js/prom-lib/compiler/lisp/driver";

^ref-63a1cc28-445-0
const lisp = `
^ref-63a1cc28-472-0 ^ref-63a1cc28-474-0
^ref-63a1cc28-469-0
^ref-63a1cc28-468-0
^ref-63a1cc28-466-0
^ref-63a1cc28-483-0 ^ref-63a1cc28-489-0
^ref-63a1cc28-474-0 ^ref-63a1cc28-490-0
^ref-63a1cc28-472-0 ^ref-63a1cc28-491-0
^ref-63a1cc28-469-0 ^ref-63a1cc28-492-0
^ref-63a1cc28-468-0 ^ref-63a1cc28-493-0
^ref-63a1cc28-504-0 ^ref-63a1cc28-505-0
^ref-63a1cc28-501-0 ^ref-63a1cc28-506-0
^ref-63a1cc28-500-0 ^ref-63a1cc28-507-0
^ref-63a1cc28-499-0
^ref-63a1cc28-497-0
^ref-63a1cc28-493-0
^ref-63a1cc28-492-0
^ref-63a1cc28-491-0 ^ref-63a1cc28-512-0
^ref-63a1cc28-490-0
^ref-63a1cc28-489-0
^ref-63a1cc28-483-0 ^ref-63a1cc28-515-0
^ref-63a1cc28-479-0
  (let ((np ($py "numpy"))) ^ref-63a1cc28-517-0
    (await ((. np sum) [1 2 3 4])))
`;
 ^ref-63a1cc28-466-0 ^ref-63a1cc28-497-0
const { $py, close } = createNodePythonBridge("python", "shared/py/polyglot_runtime.py");
const { code } = compileLispToJS(lisp, { importNames:["$py"], pretty:true, inlineMap:true }); ^ref-63a1cc28-468-0 ^ref-63a1cc28-483-0 ^ref-63a1cc28-499-0
const run = (0,eval)(code);          // async wrapper if await is present ^ref-63a1cc28-469-0 ^ref-63a1cc28-500-0 ^ref-63a1cc28-523-0
const out = await run({ $py }); ^ref-63a1cc28-501-0
console.log("sum =", out);           // -> 10
close(); ^ref-63a1cc28-472-0
``` ^ref-63a1cc28-504-0
 ^ref-63a1cc28-505-0
--- ^ref-63a1cc28-506-0
 ^ref-63a1cc28-507-0
# 7) Browser path (Pyodide) — sketch

Same API, different transport:
^ref-63a1cc28-532-0
^ref-63a1cc28-529-0
^ref-63a1cc28-527-0

^ref-63a1cc28-493-0 ^ref-63a1cc28-538-0
^ref-63a1cc28-492-0 ^ref-63a1cc28-497-0 ^ref-63a1cc28-539-0
^ref-63a1cc28-491-0
^ref-63a1cc28-490-0 ^ref-63a1cc28-499-0
^ref-63a1cc28-515-0
^ref-63a1cc28-512-0 ^ref-63a1cc28-517-0
^ref-63a1cc28-489-0 ^ref-63a1cc28-500-0
* Load Pyodide in a **Web Worker**. ^ref-63a1cc28-501-0 ^ref-63a1cc28-545-0
^ref-63a1cc28-474-0
* Implement a `PyodideTransport` with `request({op,...})` that forwards to worker and uses `pyodide.runPython` to implement ops. ^ref-63a1cc28-483-0
* Return the same PyRef envelopes so `PythonBridge` doesn’t care. ^ref-63a1cc28-504-0
 ^ref-63a1cc28-505-0 ^ref-63a1cc28-523-0
You can stub it like: ^ref-63a1cc28-506-0
 ^ref-63a1cc28-507-0
```ts
// shared/js/prom-lib/polyglot/pyodide-transport.ts (sketch) ^ref-63a1cc28-489-0 ^ref-63a1cc28-527-0
export class PyodideTransport implements PyTransport { ^ref-63a1cc28-490-0
  constructor(private worker: Worker) { /* set up postMessage <-> Promise map */ } ^ref-63a1cc28-491-0 ^ref-63a1cc28-529-0
  request(payload){ /* postMessage; resolve on response */ } ^ref-63a1cc28-492-0 ^ref-63a1cc28-512-0
  close(){ this.worker.terminate(); } ^ref-63a1cc28-493-0
} ^ref-63a1cc28-532-0
``` ^ref-63a1cc28-515-0

…and reuse `new PythonBridge(new PyodideTransport(worker))`. ^ref-63a1cc28-497-0 ^ref-63a1cc28-517-0

--- ^ref-63a1cc28-499-0
 ^ref-63a1cc28-500-0 ^ref-63a1cc28-538-0
# 8) Notes & roadmap ^ref-63a1cc28-501-0 ^ref-63a1cc28-539-0

* **Types:** Numbers/strings/bools/bytes/arrays/dicts round-trip; functions/instances are **by-ref** proxies. You can add special-cases (e.g., NumPy array to `ArrayBuffer`) later. ^ref-63a1cc28-523-0
* **GC:** You can add a `FinalizationRegistry` in JS that sends `op:"release"` for proxies when collected. ^ref-63a1cc28-504-0
* **Perf:** For heavy data, add a binary fast path (msgpack or raw `bytes` over stdio) and optional **shared memory** for Node workers. ^ref-63a1cc28-505-0
* **Security:** This runtime evals Python code you told it to call. Don’t expose it to untrusted inputs without sandboxing. ^ref-63a1cc28-506-0
* **Ergonomics:** We can sugar `await` away with macros like `(py-> np sum [1 2 3])` that expand to `(await ((. ($py "numpy") sum) [1 2 3]))`. ^ref-63a1cc28-507-0 ^ref-63a1cc28-527-0 ^ref-63a1cc28-545-0

--- ^ref-63a1cc28-529-0

If you want, I can:
 ^ref-63a1cc28-512-0 ^ref-63a1cc28-532-0
* add the **Pyodide transport** so this runs in a browser Worker,
* add **NumPy zero-copy** (buffer protocol ↔ `ArrayBuffer`) for big arrays,
* or hide `await` in **auto-async** macros that lift whole forms.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [template-based-compilation](template-based-compilation.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [DSL](chunks/dsl.md)
- [archetype-ecs](archetype-ecs.md)
- [JavaScript](chunks/javascript.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Window Management](chunks/window-management.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Diagrams](chunks/diagrams.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Tooling](chunks/tooling.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Services](chunks/services.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [EidolonField](eidolonfield.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-interaction-equations](field-interaction-equations.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Shared](chunks/shared.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [graph-ds](graph-ds.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Creative Moments](creative-moments.md)
- [Operations](chunks/operations.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Shared Package Structure](shared-package-structure.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [refactor-relations](refactor-relations.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [Python Services CI](python-services-ci.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [i3-layout-saver](i3-layout-saver.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [Redirecting Standard Error](redirecting-standard-error.md)
## Sources
- [Admin Dashboard for User Management — L46](admin-dashboard-for-user-management.md#^ref-2901a3e9-46-0) (line 46, col 0, score 0.7)
- [DSL — L22](chunks/dsl.md#^ref-e87bc036-22-0) (line 22, col 0, score 0.72)
- [compiler-kit-foundations — L609](compiler-kit-foundations.md#^ref-01b21543-609-0) (line 609, col 0, score 0.7)
- [Cross-Language Runtime Polymorphism — L229](cross-language-runtime-polymorphism.md#^ref-c34c36a6-229-0) (line 229, col 0, score 0.7)
- [ecs-offload-workers — L460](ecs-offload-workers.md#^ref-6498b9d7-460-0) (line 460, col 0, score 0.7)
- [ecs-scheduler-and-prefabs — L396](ecs-scheduler-and-prefabs.md#^ref-c62a1815-396-0) (line 396, col 0, score 0.72)
- [eidolon-field-math-foundations — L157](eidolon-field-math-foundations.md#^ref-008f2ac0-157-0) (line 157, col 0, score 0.72)
- [i3-config-validation-methods — L57](i3-config-validation-methods.md#^ref-d28090ac-57-0) (line 57, col 0, score 0.72)
- [Interop and Source Maps — L515](interop-and-source-maps.md#^ref-cdfac40c-515-0) (line 515, col 0, score 0.72)
- [Recursive Prompt Construction Engine — L154](recursive-prompt-construction-engine.md#^ref-babdb9eb-154-0) (line 154, col 0, score 0.64)
- [template-based-compilation — L56](template-based-compilation.md#^ref-f8877e5e-56-0) (line 56, col 0, score 0.62)
- [Recursive Prompt Construction Engine — L161](recursive-prompt-construction-engine.md#^ref-babdb9eb-161-0) (line 161, col 0, score 0.58)
- [Prompt_Folder_Bootstrap — L113](prompt-folder-bootstrap.md#^ref-bd4f0976-113-0) (line 113, col 0, score 0.58)
- [Recursive Prompt Construction Engine — L1](recursive-prompt-construction-engine.md#^ref-babdb9eb-1-0) (line 1, col 0, score 0.58)
- [universal-intention-code-fabric — L390](universal-intention-code-fabric.md#^ref-c14edce7-390-0) (line 390, col 0, score 0.57)
- [windows-tiling-with-autohotkey — L13](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-13-0) (line 13, col 0, score 0.57)
- [template-based-compilation — L79](template-based-compilation.md#^ref-f8877e5e-79-0) (line 79, col 0, score 0.57)
- [Prompt_Folder_Bootstrap — L107](prompt-folder-bootstrap.md#^ref-bd4f0976-107-0) (line 107, col 0, score 0.56)
- [sibilant-meta-string-templating-runtime — L114](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-114-0) (line 114, col 0, score 0.55)
- [prompt-programming-language-lisp — L5](prompt-programming-language-lisp.md#^ref-d41a06d1-5-0) (line 5, col 0, score 0.55)
- [sibilant-metacompiler-overview — L42](sibilant-metacompiler-overview.md#^ref-61d4086b-42-0) (line 42, col 0, score 0.55)
- [Protocol_0_The_Contradiction_Engine — L59](protocol-0-the-contradiction-engine.md#^ref-9a93a756-59-0) (line 59, col 0, score 0.55)
- [sibilant-meta-string-templating-runtime — L35](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-35-0) (line 35, col 0, score 0.64)
- [Cross-Language Runtime Polymorphism — L109](cross-language-runtime-polymorphism.md#^ref-c34c36a6-109-0) (line 109, col 0, score 0.66)
- [sibilant-meta-string-templating-runtime — L25](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-25-0) (line 25, col 0, score 0.69)
- [Performance-Optimized-Polyglot-Bridge — L432](performance-optimized-polyglot-bridge.md#^ref-f5579967-432-0) (line 432, col 0, score 0.66)
- [universal-intention-code-fabric — L405](universal-intention-code-fabric.md#^ref-c14edce7-405-0) (line 405, col 0, score 0.68)
- [Performance-Optimized-Polyglot-Bridge — L424](performance-optimized-polyglot-bridge.md#^ref-f5579967-424-0) (line 424, col 0, score 0.66)
- [sibilant-macro-targets — L97](sibilant-macro-targets.md#^ref-c5c9a5c6-97-0) (line 97, col 0, score 0.68)
- [Promethean Event Bus MVP v0.1 — L139](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-139-0) (line 139, col 0, score 0.66)
- [polymorphic-meta-programming-engine — L99](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-99-0) (line 99, col 0, score 0.66)
- [Cross-Language Runtime Polymorphism — L119](cross-language-runtime-polymorphism.md#^ref-c34c36a6-119-0) (line 119, col 0, score 0.65)
- [polymorphic-meta-programming-engine — L86](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-86-0) (line 86, col 0, score 0.69)
- [sibilant-macro-targets — L46](sibilant-macro-targets.md#^ref-c5c9a5c6-46-0) (line 46, col 0, score 0.65)
- [polymorphic-meta-programming-engine — L48](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-48-0) (line 48, col 0, score 0.67)
- [universal-intention-code-fabric — L383](universal-intention-code-fabric.md#^ref-c14edce7-383-0) (line 383, col 0, score 0.62)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.68)
- [universal-intention-code-fabric — L24](universal-intention-code-fabric.md#^ref-c14edce7-24-0) (line 24, col 0, score 0.69)
- [universal-intention-code-fabric — L427](universal-intention-code-fabric.md#^ref-c14edce7-427-0) (line 427, col 0, score 0.63)
- [universal-intention-code-fabric — L216](universal-intention-code-fabric.md#^ref-c14edce7-216-0) (line 216, col 0, score 0.8)
- [universal-intention-code-fabric — L382](universal-intention-code-fabric.md#^ref-c14edce7-382-0) (line 382, col 0, score 0.67)
- [Universal Lisp Interface — L137](universal-lisp-interface.md#^ref-b01856b4-137-0) (line 137, col 0, score 0.66)
- [Universal Lisp Interface — L123](universal-lisp-interface.md#^ref-b01856b4-123-0) (line 123, col 0, score 0.66)
- [Lispy Macros with syntax-rules — L1](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-1-0) (line 1, col 0, score 0.68)
- [Promethean-Copilot-Intent-Engine — L12](promethean-copilot-intent-engine.md#^ref-ae24a280-12-0) (line 12, col 0, score 0.67)
- [Local-Only-LLM-Workflow — L167](local-only-llm-workflow.md#^ref-9a8ab57e-167-0) (line 167, col 0, score 0.64)
- [Universal Lisp Interface — L29](universal-lisp-interface.md#^ref-b01856b4-29-0) (line 29, col 0, score 0.7)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L1](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-1-0) (line 1, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L293](dynamic-context-model-for-web-components.md#^ref-f7702bf8-293-0) (line 293, col 0, score 0.61)
- [ecs-offload-workers — L435](ecs-offload-workers.md#^ref-6498b9d7-435-0) (line 435, col 0, score 0.59)
- [Sibilant Meta-Prompt DSL — L1](sibilant-meta-prompt-dsl.md#^ref-af5d2824-1-0) (line 1, col 0, score 0.63)
- [mystery-lisp-search-session — L97](mystery-lisp-search-session.md#^ref-513dc4c7-97-0) (line 97, col 0, score 0.63)
- [universal-intention-code-fabric — L407](universal-intention-code-fabric.md#^ref-c14edce7-407-0) (line 407, col 0, score 0.81)
- [Performance-Optimized-Polyglot-Bridge — L359](performance-optimized-polyglot-bridge.md#^ref-f5579967-359-0) (line 359, col 0, score 0.69)
- [WebSocket Gateway Implementation — L628](websocket-gateway-implementation.md#^ref-e811123d-628-0) (line 628, col 0, score 0.66)
- [Mongo Outbox Implementation — L379](mongo-outbox-implementation.md#^ref-9c1acd1e-379-0) (line 379, col 0, score 0.65)
- [Lispy Macros with syntax-rules — L317](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-317-0) (line 317, col 0, score 0.69)
- [Performance-Optimized-Polyglot-Bridge — L373](performance-optimized-polyglot-bridge.md#^ref-f5579967-373-0) (line 373, col 0, score 0.64)
- [mystery-lisp-search-session — L78](mystery-lisp-search-session.md#^ref-513dc4c7-78-0) (line 78, col 0, score 0.69)
- [Performance-Optimized-Polyglot-Bridge — L11](performance-optimized-polyglot-bridge.md#^ref-f5579967-11-0) (line 11, col 0, score 0.71)
- [Interop and Source Maps — L3](interop-and-source-maps.md#^ref-cdfac40c-3-0) (line 3, col 0, score 0.68)
- [Performance-Optimized-Polyglot-Bridge — L383](performance-optimized-polyglot-bridge.md#^ref-f5579967-383-0) (line 383, col 0, score 0.78)
- [Local-Only-LLM-Workflow — L166](local-only-llm-workflow.md#^ref-9a8ab57e-166-0) (line 166, col 0, score 0.73)
- [Universal Lisp Interface — L61](universal-lisp-interface.md#^ref-b01856b4-61-0) (line 61, col 0, score 0.7)
- [polymorphic-meta-programming-engine — L133](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-133-0) (line 133, col 0, score 0.62)
- [Cross-Target Macro System in Sibilant — L97](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-97-0) (line 97, col 0, score 0.6)
- [Universal Lisp Interface — L19](universal-lisp-interface.md#^ref-b01856b4-19-0) (line 19, col 0, score 0.67)
- [Universal Lisp Interface — L99](universal-lisp-interface.md#^ref-b01856b4-99-0) (line 99, col 0, score 0.67)
- [Per-Domain Policy System for JS Crawler — L462](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-462-0) (line 462, col 0, score 0.65)
- [Prometheus Observability Stack — L1](prometheus-observability-stack.md#^ref-e90b5a16-1-0) (line 1, col 0, score 0.64)
- [Interop and Source Maps — L503](interop-and-source-maps.md#^ref-cdfac40c-503-0) (line 503, col 0, score 0.61)
- [TypeScript Patch for Tool Calling Support — L175](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-175-0) (line 175, col 0, score 0.6)
- [Promethean Full-Stack Docker Setup — L169](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-169-0) (line 169, col 0, score 0.6)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L389](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-389-0) (line 389, col 0, score 0.68)
- [AI-Centric OS with MCP Layer — L14](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-14-0) (line 14, col 0, score 0.59)
- [Promethean Web UI Setup — L40](promethean-web-ui-setup.md#^ref-bc5172ca-40-0) (line 40, col 0, score 0.61)
- [Promethean Dev Workflow Update — L57](promethean-dev-workflow-update.md#^ref-03a5578f-57-0) (line 57, col 0, score 0.59)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.69)
- [Functional Refactor of TypeScript Document Processing — L115](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-115-0) (line 115, col 0, score 0.58)
- [ecs-offload-workers — L7](ecs-offload-workers.md#^ref-6498b9d7-7-0) (line 7, col 0, score 0.58)
- [Language-Agnostic Mirror System — L539](language-agnostic-mirror-system.md#^ref-d2b3628c-539-0) (line 539, col 0, score 0.72)
- [Performance-Optimized-Polyglot-Bridge — L22](performance-optimized-polyglot-bridge.md#^ref-f5579967-22-0) (line 22, col 0, score 0.71)
- [graph-ds — L5](graph-ds.md#^ref-6620e2f2-5-0) (line 5, col 0, score 0.65)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.71)
- [compiler-kit-foundations — L166](compiler-kit-foundations.md#^ref-01b21543-166-0) (line 166, col 0, score 0.66)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.65)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.65)
- [archetype-ecs — L7](archetype-ecs.md#^ref-8f4c1e86-7-0) (line 7, col 0, score 0.67)
- [Cross-Target Macro System in Sibilant — L62](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-62-0) (line 62, col 0, score 0.7)
- [Pure TypeScript Search Microservice — L378](pure-typescript-search-microservice.md#^ref-d17d3a96-378-0) (line 378, col 0, score 0.64)
- [polymorphic-meta-programming-engine — L157](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-157-0) (line 157, col 0, score 0.64)
- [typed-struct-compiler — L16](typed-struct-compiler.md#^ref-78eeedf7-16-0) (line 16, col 0, score 0.66)
- [Promethean Agent DSL TS Scaffold — L684](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-684-0) (line 684, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L474](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-474-0) (line 474, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L380](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-380-0) (line 380, col 0, score 0.63)
- [Functional Refactor of TypeScript Document Processing — L5](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5-0) (line 5, col 0, score 0.63)
- [Promethean Agent DSL TS Scaffold — L599](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-599-0) (line 599, col 0, score 0.66)
- [Promethean Agent DSL TS Scaffold — L557](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-557-0) (line 557, col 0, score 0.62)
- [Universal Lisp Interface — L178](universal-lisp-interface.md#^ref-b01856b4-178-0) (line 178, col 0, score 0.62)
- [Canonical Org-Babel Matplotlib Animation Template — L87](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-87-0) (line 87, col 0, score 0.62)
- [Promethean Agent DSL TS Scaffold — L588](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-588-0) (line 588, col 0, score 0.61)
- [Vectorial Exception Descent — L14](vectorial-exception-descent.md#^ref-d771154e-14-0) (line 14, col 0, score 0.68)
- [Vectorial Exception Descent — L148](vectorial-exception-descent.md#^ref-d771154e-148-0) (line 148, col 0, score 0.66)
- [Exception Layer Analysis — L19](exception-layer-analysis.md#^ref-21d5cc09-19-0) (line 19, col 0, score 0.65)
- [Exception Layer Analysis — L11](exception-layer-analysis.md#^ref-21d5cc09-11-0) (line 11, col 0, score 0.64)
- [Vectorial Exception Descent — L125](vectorial-exception-descent.md#^ref-d771154e-125-0) (line 125, col 0, score 0.62)
- [2d-sandbox-field — L192](2d-sandbox-field.md#^ref-c710dc93-192-0) (line 192, col 0, score 0.62)
- [aionian-circuit-math — L169](aionian-circuit-math.md#^ref-f2d83a77-169-0) (line 169, col 0, score 0.62)
- [api-gateway-versioning — L290](api-gateway-versioning.md#^ref-0580dcd3-290-0) (line 290, col 0, score 0.62)
- [Board Walk – 2025-08-11 — L135](board-walk-2025-08-11.md#^ref-7aa1eb92-135-0) (line 135, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L180](chroma-toolkit-consolidation-plan.md#^ref-5020e892-180-0) (line 180, col 0, score 0.62)
- [Cross-Target Macro System in Sibilant — L185](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-185-0) (line 185, col 0, score 0.62)
- [ecs-offload-workers — L149](ecs-offload-workers.md#^ref-6498b9d7-149-0) (line 149, col 0, score 0.65)
- [Promethean Web UI Setup — L351](promethean-web-ui-setup.md#^ref-bc5172ca-351-0) (line 351, col 0, score 0.69)
- [ecs-offload-workers — L209](ecs-offload-workers.md#^ref-6498b9d7-209-0) (line 209, col 0, score 0.67)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L130](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-130-0) (line 130, col 0, score 0.69)
- [Promethean Infrastructure Setup — L33](promethean-infrastructure-setup.md#^ref-6deed6ac-33-0) (line 33, col 0, score 0.65)
- [Per-Domain Policy System for JS Crawler — L141](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-141-0) (line 141, col 0, score 0.67)
- [Promethean Infrastructure Setup — L415](promethean-infrastructure-setup.md#^ref-6deed6ac-415-0) (line 415, col 0, score 0.67)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L178](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-178-0) (line 178, col 0, score 0.64)
- [universal-intention-code-fabric — L25](universal-intention-code-fabric.md#^ref-c14edce7-25-0) (line 25, col 0, score 0.63)
- [Chroma-Embedding-Refactor — L66](chroma-embedding-refactor.md#^ref-8b256935-66-0) (line 66, col 0, score 0.64)
- [State Snapshots API and Transactional Projector — L132](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-132-0) (line 132, col 0, score 0.64)
- [pm2-orchestration-patterns — L26](pm2-orchestration-patterns.md#^ref-51932e7b-26-0) (line 26, col 0, score 0.64)
- [plan-update-confirmation — L650](plan-update-confirmation.md#^ref-b22d79c6-650-0) (line 650, col 0, score 0.64)
- [WebSocket Gateway Implementation — L219](websocket-gateway-implementation.md#^ref-e811123d-219-0) (line 219, col 0, score 0.66)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L604](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-604-0) (line 604, col 0, score 0.66)
- [Mongo Outbox Implementation — L381](mongo-outbox-implementation.md#^ref-9c1acd1e-381-0) (line 381, col 0, score 0.65)
- [ecs-offload-workers — L75](ecs-offload-workers.md#^ref-6498b9d7-75-0) (line 75, col 0, score 0.67)
- [ecs-offload-workers — L169](ecs-offload-workers.md#^ref-6498b9d7-169-0) (line 169, col 0, score 0.68)
- [Performance-Optimized-Polyglot-Bridge — L396](performance-optimized-polyglot-bridge.md#^ref-f5579967-396-0) (line 396, col 0, score 0.68)
- [WebSocket Gateway Implementation — L56](websocket-gateway-implementation.md#^ref-e811123d-56-0) (line 56, col 0, score 0.64)
- [Local-First Intention→Code Loop with Free Models — L47](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-47-0) (line 47, col 0, score 0.67)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.64)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.64)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.64)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.66)
- [pm2-orchestration-patterns — L81](pm2-orchestration-patterns.md#^ref-51932e7b-81-0) (line 81, col 0, score 0.65)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L223](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-223-0) (line 223, col 0, score 0.71)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L1](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-1-0) (line 1, col 0, score 0.64)
- [pm2-orchestration-patterns — L117](pm2-orchestration-patterns.md#^ref-51932e7b-117-0) (line 117, col 0, score 0.64)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.67)
- [universal-intention-code-fabric — L252](universal-intention-code-fabric.md#^ref-c14edce7-252-0) (line 252, col 0, score 0.65)
- [Stateful Partitions and Rebalancing — L511](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-511-0) (line 511, col 0, score 0.66)
- [sibilant-macro-targets — L135](sibilant-macro-targets.md#^ref-c5c9a5c6-135-0) (line 135, col 0, score 0.67)
- [Pure TypeScript Search Microservice — L306](pure-typescript-search-microservice.md#^ref-d17d3a96-306-0) (line 306, col 0, score 0.7)
- [Cross-Target Macro System in Sibilant — L134](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-134-0) (line 134, col 0, score 0.69)
- [Promethean Agent DSL TS Scaffold — L606](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-606-0) (line 606, col 0, score 0.67)
- [compiler-kit-foundations — L471](compiler-kit-foundations.md#^ref-01b21543-471-0) (line 471, col 0, score 0.71)
- [universal-intention-code-fabric — L277](universal-intention-code-fabric.md#^ref-c14edce7-277-0) (line 277, col 0, score 0.7)
- [Chroma-Embedding-Refactor — L28](chroma-embedding-refactor.md#^ref-8b256935-28-0) (line 28, col 0, score 0.69)
- [ecs-offload-workers — L187](ecs-offload-workers.md#^ref-6498b9d7-187-0) (line 187, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L160](migrate-to-provider-tenant-architecture.md#^ref-54382370-160-0) (line 160, col 0, score 0.65)
- [Performance-Optimized-Polyglot-Bridge — L3](performance-optimized-polyglot-bridge.md#^ref-f5579967-3-0) (line 3, col 0, score 0.64)
- [sibilant-meta-string-templating-runtime — L47](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-47-0) (line 47, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L92](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-92-0) (line 92, col 0, score 0.64)
- [Mongo Outbox Implementation — L533](mongo-outbox-implementation.md#^ref-9c1acd1e-533-0) (line 533, col 0, score 0.63)
- [Mongo Outbox Implementation — L538](mongo-outbox-implementation.md#^ref-9c1acd1e-538-0) (line 538, col 0, score 0.63)
- [schema-evolution-workflow — L467](schema-evolution-workflow.md#^ref-d8059b6a-467-0) (line 467, col 0, score 0.62)
- [Promethean-native config design — L52](promethean-native-config-design.md#^ref-ab748541-52-0) (line 52, col 0, score 0.62)
- [Agent Tasks: Persistence Migration to DualStore — L26](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-26-0) (line 26, col 0, score 0.62)
- [Promethean-native config design — L51](promethean-native-config-design.md#^ref-ab748541-51-0) (line 51, col 0, score 0.62)
- [Lispy Macros with syntax-rules — L3](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-3-0) (line 3, col 0, score 0.71)
- [Promethean Web UI Setup — L298](promethean-web-ui-setup.md#^ref-bc5172ca-298-0) (line 298, col 0, score 0.68)
- [template-based-compilation — L60](template-based-compilation.md#^ref-f8877e5e-60-0) (line 60, col 0, score 0.68)
- [Language-Agnostic Mirror System — L147](language-agnostic-mirror-system.md#^ref-d2b3628c-147-0) (line 147, col 0, score 0.67)
- [template-based-compilation — L7](template-based-compilation.md#^ref-f8877e5e-7-0) (line 7, col 0, score 0.65)
- [compiler-kit-foundations — L3](compiler-kit-foundations.md#^ref-01b21543-3-0) (line 3, col 0, score 0.67)
- [Pure TypeScript Search Microservice — L139](pure-typescript-search-microservice.md#^ref-d17d3a96-139-0) (line 139, col 0, score 0.67)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.65)
- [polyglot-repl-interface-layer — L138](polyglot-repl-interface-layer.md#^ref-9c79206d-138-0) (line 138, col 0, score 0.65)
- [polyglot-repl-interface-layer — L1](polyglot-repl-interface-layer.md#^ref-9c79206d-1-0) (line 1, col 0, score 0.65)
- [sibilant-macro-targets — L153](sibilant-macro-targets.md#^ref-c5c9a5c6-153-0) (line 153, col 0, score 0.65)
- [Functional Refactor of TypeScript Document Processing — L118](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-118-0) (line 118, col 0, score 0.65)
- [Promethean-Copilot-Intent-Engine — L31](promethean-copilot-intent-engine.md#^ref-ae24a280-31-0) (line 31, col 0, score 0.68)
- [compiler-kit-foundations — L324](compiler-kit-foundations.md#^ref-01b21543-324-0) (line 324, col 0, score 0.68)
- [set-assignment-in-lisp-ast — L5](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-5-0) (line 5, col 0, score 0.84)
- [set-assignment-in-lisp-ast — L58](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-58-0) (line 58, col 0, score 0.66)
- [Lispy Macros with syntax-rules — L301](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-301-0) (line 301, col 0, score 0.69)
- [compiler-kit-foundations — L31](compiler-kit-foundations.md#^ref-01b21543-31-0) (line 31, col 0, score 0.68)
- [Interop and Source Maps — L85](interop-and-source-maps.md#^ref-cdfac40c-85-0) (line 85, col 0, score 0.67)
- [Interop and Source Maps — L319](interop-and-source-maps.md#^ref-cdfac40c-319-0) (line 319, col 0, score 0.74)
- [compiler-kit-foundations — L359](compiler-kit-foundations.md#^ref-01b21543-359-0) (line 359, col 0, score 0.67)
- [Promethean Agent DSL TS Scaffold — L215](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-215-0) (line 215, col 0, score 0.7)
- [Language-Agnostic Mirror System — L52](language-agnostic-mirror-system.md#^ref-d2b3628c-52-0) (line 52, col 0, score 0.69)
- [Lispy Macros with syntax-rules — L319](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-319-0) (line 319, col 0, score 0.74)
- [set-assignment-in-lisp-ast — L54](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-54-0) (line 54, col 0, score 0.68)
- [Promethean Agent DSL TS Scaffold — L186](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-186-0) (line 186, col 0, score 0.68)
- [universal-intention-code-fabric — L68](universal-intention-code-fabric.md#^ref-c14edce7-68-0) (line 68, col 0, score 0.68)
- [Language-Agnostic Mirror System — L235](language-agnostic-mirror-system.md#^ref-d2b3628c-235-0) (line 235, col 0, score 0.68)
- [compiler-kit-foundations — L140](compiler-kit-foundations.md#^ref-01b21543-140-0) (line 140, col 0, score 0.79)
- [js-to-lisp-reverse-compiler — L13](js-to-lisp-reverse-compiler.md#^ref-58191024-13-0) (line 13, col 0, score 0.68)
- [Promethean Agent Config DSL — L288](promethean-agent-config-dsl.md#^ref-2c00ce45-288-0) (line 288, col 0, score 0.72)
- [set-assignment-in-lisp-ast — L25](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-25-0) (line 25, col 0, score 0.78)
- [sibilant-metacompiler-overview — L51](sibilant-metacompiler-overview.md#^ref-61d4086b-51-0) (line 51, col 0, score 0.73)
- [Lisp-Compiler-Integration — L7](lisp-compiler-integration.md#^ref-cfee6d36-7-0) (line 7, col 0, score 0.73)
- [WebSocket Gateway Implementation — L322](websocket-gateway-implementation.md#^ref-e811123d-322-0) (line 322, col 0, score 0.72)
- [set-assignment-in-lisp-ast — L114](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-114-0) (line 114, col 0, score 0.7)
- [Language-Agnostic Mirror System — L273](language-agnostic-mirror-system.md#^ref-d2b3628c-273-0) (line 273, col 0, score 0.68)
- [State Snapshots API and Transactional Projector — L280](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-280-0) (line 280, col 0, score 0.68)
- [compiler-kit-foundations — L574](compiler-kit-foundations.md#^ref-01b21543-574-0) (line 574, col 0, score 0.68)
- [Event Bus MVP — L258](event-bus-mvp.md#^ref-534fe91d-258-0) (line 258, col 0, score 0.68)
- [Lisp-Compiler-Integration — L440](lisp-compiler-integration.md#^ref-cfee6d36-440-0) (line 440, col 0, score 0.76)
- [universal-intention-code-fabric — L186](universal-intention-code-fabric.md#^ref-c14edce7-186-0) (line 186, col 0, score 0.69)
- [Interop and Source Maps — L421](interop-and-source-maps.md#^ref-cdfac40c-421-0) (line 421, col 0, score 0.76)
- [Agent Tasks: Persistence Migration to DualStore — L153](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-153-0) (line 153, col 0, score 1)
- [archetype-ecs — L468](archetype-ecs.md#^ref-8f4c1e86-468-0) (line 468, col 0, score 1)
- [DSL — L17](chunks/dsl.md#^ref-e87bc036-17-0) (line 17, col 0, score 1)
- [compiler-kit-foundations — L619](compiler-kit-foundations.md#^ref-01b21543-619-0) (line 619, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L217](cross-language-runtime-polymorphism.md#^ref-c34c36a6-217-0) (line 217, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L177](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-177-0) (line 177, col 0, score 1)
- [Dynamic Context Model for Web Components — L387](dynamic-context-model-for-web-components.md#^ref-f7702bf8-387-0) (line 387, col 0, score 1)
- [ecs-offload-workers — L472](ecs-offload-workers.md#^ref-6498b9d7-472-0) (line 472, col 0, score 1)
- [eidolon-field-math-foundations — L145](eidolon-field-math-foundations.md#^ref-008f2ac0-145-0) (line 145, col 0, score 0.68)
- [Lisp-Compiler-Integration — L547](lisp-compiler-integration.md#^ref-cfee6d36-547-0) (line 547, col 0, score 1)
- [Lispy Macros with syntax-rules — L408](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-408-0) (line 408, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L182](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-182-0) (line 182, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L307](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-307-0) (line 307, col 0, score 1)
- [Local-Only-LLM-Workflow — L210](local-only-llm-workflow.md#^ref-9a8ab57e-210-0) (line 210, col 0, score 1)
- [markdown-to-org-transpiler — L320](markdown-to-org-transpiler.md#^ref-ab54cdd8-320-0) (line 320, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L272](migrate-to-provider-tenant-architecture.md#^ref-54382370-272-0) (line 272, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L136](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-136-0) (line 136, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L48](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-48-0) (line 48, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L109](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-109-0) (line 109, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L138](protocol-0-the-contradiction-engine.md#^ref-9a93a756-138-0) (line 138, col 0, score 1)
- [Promethean Infrastructure Setup — L456](promethean-infrastructure-setup.md#^ref-6deed6ac-456-0) (line 456, col 0, score 0.68)
- [Promethean Infrastructure Setup — L439](promethean-infrastructure-setup.md#^ref-6deed6ac-439-0) (line 439, col 0, score 0.67)
- [universal-intention-code-fabric — L406](universal-intention-code-fabric.md#^ref-c14edce7-406-0) (line 406, col 0, score 0.67)
- [Interop and Source Maps — L470](interop-and-source-maps.md#^ref-cdfac40c-470-0) (line 470, col 0, score 0.79)
- [Promethean Infrastructure Setup — L485](promethean-infrastructure-setup.md#^ref-6deed6ac-485-0) (line 485, col 0, score 0.65)
- [Local-First Intention→Code Loop with Free Models — L100](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-100-0) (line 100, col 0, score 0.68)
- [plan-update-confirmation — L585](plan-update-confirmation.md#^ref-b22d79c6-585-0) (line 585, col 0, score 0.65)
- [Interop and Source Maps — L482](interop-and-source-maps.md#^ref-cdfac40c-482-0) (line 482, col 0, score 0.65)
- [Provider-Agnostic Chat Panel Implementation — L12](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-12-0) (line 12, col 0, score 0.72)
- [Lisp-Compiler-Integration — L530](lisp-compiler-integration.md#^ref-cfee6d36-530-0) (line 530, col 0, score 0.66)
- [Promethean Event Bus MVP v0.1 — L827](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-827-0) (line 827, col 0, score 0.61)
- [Promethean Agent Config DSL — L149](promethean-agent-config-dsl.md#^ref-2c00ce45-149-0) (line 149, col 0, score 0.57)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.64)
- [Interop and Source Maps — L21](interop-and-source-maps.md#^ref-cdfac40c-21-0) (line 21, col 0, score 0.92)
- [Interop and Source Maps — L68](interop-and-source-maps.md#^ref-cdfac40c-68-0) (line 68, col 0, score 0.84)
- [Lisp-Compiler-Integration — L188](lisp-compiler-integration.md#^ref-cfee6d36-188-0) (line 188, col 0, score 0.82)
- [Lisp-Compiler-Integration — L291](lisp-compiler-integration.md#^ref-cfee6d36-291-0) (line 291, col 0, score 0.82)
- [Lispy Macros with syntax-rules — L217](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-217-0) (line 217, col 0, score 0.76)
- [Lisp-Compiler-Integration — L491](lisp-compiler-integration.md#^ref-cfee6d36-491-0) (line 491, col 0, score 0.81)
- [js-to-lisp-reverse-compiler — L267](js-to-lisp-reverse-compiler.md#^ref-58191024-267-0) (line 267, col 0, score 0.72)
- [Lispy Macros with syntax-rules — L243](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-243-0) (line 243, col 0, score 0.71)
- [Lispy Macros with syntax-rules — L9](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-9-0) (line 9, col 0, score 0.71)
- [Lisp-Compiler-Integration — L151](lisp-compiler-integration.md#^ref-cfee6d36-151-0) (line 151, col 0, score 0.71)
- [Lispy Macros with syntax-rules — L215](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-215-0) (line 215, col 0, score 0.67)
- [template-based-compilation — L33](template-based-compilation.md#^ref-f8877e5e-33-0) (line 33, col 0, score 0.7)
- [sibilant-metacompiler-overview — L57](sibilant-metacompiler-overview.md#^ref-61d4086b-57-0) (line 57, col 0, score 0.67)
- [template-based-compilation — L25](template-based-compilation.md#^ref-f8877e5e-25-0) (line 25, col 0, score 0.63)
- [Interop and Source Maps — L66](interop-and-source-maps.md#^ref-cdfac40c-66-0) (line 66, col 0, score 0.65)
- [Cross-Target Macro System in Sibilant — L13](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-13-0) (line 13, col 0, score 0.71)
- [Cross-Target Macro System in Sibilant — L54](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-54-0) (line 54, col 0, score 0.68)
- [Lispy Macros with syntax-rules — L390](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-390-0) (line 390, col 0, score 0.65)
- [sibilant-meta-string-templating-runtime — L19](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-19-0) (line 19, col 0, score 0.66)
- [Lisp-Compiler-Integration — L519](lisp-compiler-integration.md#^ref-cfee6d36-519-0) (line 519, col 0, score 0.64)
- [Lisp-Compiler-Integration — L470](lisp-compiler-integration.md#^ref-cfee6d36-470-0) (line 470, col 0, score 0.66)
- [template-based-compilation — L59](template-based-compilation.md#^ref-f8877e5e-59-0) (line 59, col 0, score 0.67)
- [AI-Centric OS with MCP Layer — L405](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-405-0) (line 405, col 0, score 1)
- [archetype-ecs — L469](archetype-ecs.md#^ref-8f4c1e86-469-0) (line 469, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L219](chroma-toolkit-consolidation-plan.md#^ref-5020e892-219-0) (line 219, col 0, score 1)
- [DSL — L19](chunks/dsl.md#^ref-e87bc036-19-0) (line 19, col 0, score 1)
- [Window Management — L26](chunks/window-management.md#^ref-9e8ae388-26-0) (line 26, col 0, score 1)
- [compiler-kit-foundations — L608](compiler-kit-foundations.md#^ref-01b21543-608-0) (line 608, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L261](cross-language-runtime-polymorphism.md#^ref-c34c36a6-261-0) (line 261, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L181](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-181-0) (line 181, col 0, score 1)
- [Dynamic Context Model for Web Components — L400](dynamic-context-model-for-web-components.md#^ref-f7702bf8-400-0) (line 400, col 0, score 1)
- [Lispy Macros with syntax-rules — L365](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-365-0) (line 365, col 0, score 0.78)
- [set-assignment-in-lisp-ast — L139](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-139-0) (line 139, col 0, score 0.72)
- [polymorphic-meta-programming-engine — L111](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-111-0) (line 111, col 0, score 0.63)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L108](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-108-0) (line 108, col 0, score 0.7)
- [Universal Lisp Interface — L30](universal-lisp-interface.md#^ref-b01856b4-30-0) (line 30, col 0, score 0.71)
- [lisp-dsl-for-window-management — L172](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-172-0) (line 172, col 0, score 0.67)
- [universal-intention-code-fabric — L417](universal-intention-code-fabric.md#^ref-c14edce7-417-0) (line 417, col 0, score 0.66)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.64)
- [Chroma-Embedding-Refactor — L111](chroma-embedding-refactor.md#^ref-8b256935-111-0) (line 111, col 0, score 0.68)
- [Language-Agnostic Mirror System — L151](language-agnostic-mirror-system.md#^ref-d2b3628c-151-0) (line 151, col 0, score 0.7)
- [zero-copy-snapshots-and-workers — L202](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-202-0) (line 202, col 0, score 0.7)
- [api-gateway-versioning — L7](api-gateway-versioning.md#^ref-0580dcd3-7-0) (line 7, col 0, score 0.63)
- [Promethean Infrastructure Setup — L61](promethean-infrastructure-setup.md#^ref-6deed6ac-61-0) (line 61, col 0, score 0.65)
- [api-gateway-versioning — L1](api-gateway-versioning.md#^ref-0580dcd3-1-0) (line 1, col 0, score 0.59)
- [AI-Centric OS with MCP Layer — L420](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-420-0) (line 420, col 0, score 1)
- [Board Automation Improvements — L18](board-automation-improvements.md#^ref-ac60a1d6-18-0) (line 18, col 0, score 1)
- [Board Walk – 2025-08-11 — L140](board-walk-2025-08-11.md#^ref-7aa1eb92-140-0) (line 140, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L118](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-118-0) (line 118, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L177](chroma-toolkit-consolidation-plan.md#^ref-5020e892-177-0) (line 177, col 0, score 0.59)
- [Diagrams — L47](chunks/diagrams.md#^ref-45cd25b5-47-0) (line 47, col 0, score 1)
- [JavaScript — L35](chunks/javascript.md#^ref-c1618c66-35-0) (line 35, col 0, score 1)
- [Math Fundamentals — L33](chunks/math-fundamentals.md#^ref-c6e87433-33-0) (line 33, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L361](performance-optimized-polyglot-bridge.md#^ref-f5579967-361-0) (line 361, col 0, score 0.67)
- [ecs-offload-workers — L6](ecs-offload-workers.md#^ref-6498b9d7-6-0) (line 6, col 0, score 0.61)
- [observability-infrastructure-setup — L44](observability-infrastructure-setup.md#^ref-b4e64f8c-44-0) (line 44, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L82](migrate-to-provider-tenant-architecture.md#^ref-54382370-82-0) (line 82, col 0, score 0.63)
- [plan-update-confirmation — L845](plan-update-confirmation.md#^ref-b22d79c6-845-0) (line 845, col 0, score 0.62)
- [ecs-scheduler-and-prefabs — L338](ecs-scheduler-and-prefabs.md#^ref-c62a1815-338-0) (line 338, col 0, score 0.69)
- [Prompt_Folder_Bootstrap — L24](prompt-folder-bootstrap.md#^ref-bd4f0976-24-0) (line 24, col 0, score 0.69)
- [Prompt_Folder_Bootstrap — L42](prompt-folder-bootstrap.md#^ref-bd4f0976-42-0) (line 42, col 0, score 0.69)
- [Prompt_Folder_Bootstrap — L66](prompt-folder-bootstrap.md#^ref-bd4f0976-66-0) (line 66, col 0, score 0.69)
- [Prompt_Folder_Bootstrap — L84](prompt-folder-bootstrap.md#^ref-bd4f0976-84-0) (line 84, col 0, score 0.69)
- [Prompt_Folder_Bootstrap — L103](prompt-folder-bootstrap.md#^ref-bd4f0976-103-0) (line 103, col 0, score 0.69)
- [Prompt_Folder_Bootstrap — L130](prompt-folder-bootstrap.md#^ref-bd4f0976-130-0) (line 130, col 0, score 0.69)
- [Prompt_Folder_Bootstrap — L152](prompt-folder-bootstrap.md#^ref-bd4f0976-152-0) (line 152, col 0, score 0.69)
- [System Scheduler with Resource-Aware DAG — L336](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-336-0) (line 336, col 0, score 0.69)
- [Provider-Agnostic Chat Panel Implementation — L11](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-11-0) (line 11, col 0, score 0.61)
- [shared-package-layout-clarification — L159](shared-package-layout-clarification.md#^ref-36c8882a-159-0) (line 159, col 0, score 0.59)
- [shared-package-layout-clarification — L31](shared-package-layout-clarification.md#^ref-36c8882a-31-0) (line 31, col 0, score 0.56)
- [Self-Agency in AI Interaction — L19](self-agency-in-ai-interaction.md#^ref-49a9a860-19-0) (line 19, col 0, score 0.54)
- [Performance-Optimized-Polyglot-Bridge — L10](performance-optimized-polyglot-bridge.md#^ref-f5579967-10-0) (line 10, col 0, score 0.67)
- [Model Upgrade Calm-Down Guide — L15](model-upgrade-calm-down-guide.md#^ref-db74343f-15-0) (line 15, col 0, score 0.54)
- [plan-update-confirmation — L108](plan-update-confirmation.md#^ref-b22d79c6-108-0) (line 108, col 0, score 0.53)
- [Migrate to Provider-Tenant Architecture — L71](migrate-to-provider-tenant-architecture.md#^ref-54382370-71-0) (line 71, col 0, score 0.53)
- [Board Walk – 2025-08-11 — L80](board-walk-2025-08-11.md#^ref-7aa1eb92-80-0) (line 80, col 0, score 0.53)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L150](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-150-0) (line 150, col 0, score 0.53)
- [Model Upgrade Calm-Down Guide — L58](model-upgrade-calm-down-guide.md#^ref-db74343f-58-0) (line 58, col 0, score 0.53)
- [Redirecting Standard Error — L19](redirecting-standard-error.md#^ref-b3555ede-19-0) (line 19, col 0, score 0.53)
- [sibilant-macro-targets — L133](sibilant-macro-targets.md#^ref-c5c9a5c6-133-0) (line 133, col 0, score 0.81)
- [polymorphic-meta-programming-engine — L155](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-155-0) (line 155, col 0, score 0.65)
- [Shared Package Structure — L157](shared-package-structure.md#^ref-66a72fc3-157-0) (line 157, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L370](dynamic-context-model-for-web-components.md#^ref-f7702bf8-370-0) (line 370, col 0, score 0.63)
- [ecs-offload-workers — L39](ecs-offload-workers.md#^ref-6498b9d7-39-0) (line 39, col 0, score 0.66)
- [prom-lib-rate-limiters-and-replay-api — L186](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-186-0) (line 186, col 0, score 0.64)
- [plan-update-confirmation — L662](plan-update-confirmation.md#^ref-b22d79c6-662-0) (line 662, col 0, score 0.64)
- [RAG UI Panel with Qdrant and PostgREST — L107](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-107-0) (line 107, col 0, score 0.64)
- [Chroma Toolkit Consolidation Plan — L144](chroma-toolkit-consolidation-plan.md#^ref-5020e892-144-0) (line 144, col 0, score 0.63)
- [Matplotlib Animation with Async Execution — L57](matplotlib-animation-with-async-execution.md#^ref-687439f9-57-0) (line 57, col 0, score 0.62)
- [Debugging Broker Connections and Agent Behavior — L23](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-23-0) (line 23, col 0, score 0.62)
- [polymorphic-meta-programming-engine — L142](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-142-0) (line 142, col 0, score 0.61)
- [i3-layout-saver — L70](i3-layout-saver.md#^ref-31f0166e-70-0) (line 70, col 0, score 0.61)
- [Cross-Language Runtime Polymorphism — L141](cross-language-runtime-polymorphism.md#^ref-c34c36a6-141-0) (line 141, col 0, score 0.72)
- [plan-update-confirmation — L836](plan-update-confirmation.md#^ref-b22d79c6-836-0) (line 836, col 0, score 0.68)
- [Agent Tasks: Persistence Migration to DualStore — L81](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-81-0) (line 81, col 0, score 0.67)
- [universal-intention-code-fabric — L393](universal-intention-code-fabric.md#^ref-c14edce7-393-0) (line 393, col 0, score 0.67)
- [Interop and Source Maps — L504](interop-and-source-maps.md#^ref-cdfac40c-504-0) (line 504, col 0, score 0.66)
- [prom-lib-rate-limiters-and-replay-api — L364](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-364-0) (line 364, col 0, score 0.65)
- [Per-Domain Policy System for JS Crawler — L27](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-27-0) (line 27, col 0, score 0.65)
- [Cross-Target Macro System in Sibilant — L115](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-115-0) (line 115, col 0, score 0.65)
- [Promethean Pipelines — L38](promethean-pipelines.md#^ref-8b8e6103-38-0) (line 38, col 0, score 0.7)
- [Performance-Optimized-Polyglot-Bridge — L12](performance-optimized-polyglot-bridge.md#^ref-f5579967-12-0) (line 12, col 0, score 0.66)
- [ecs-offload-workers — L434](ecs-offload-workers.md#^ref-6498b9d7-434-0) (line 434, col 0, score 0.66)
- [Promethean Agent Config DSL — L163](promethean-agent-config-dsl.md#^ref-2c00ce45-163-0) (line 163, col 0, score 0.65)
- [Voice Access Layer Design — L201](voice-access-layer-design.md#^ref-543ed9b3-201-0) (line 201, col 0, score 0.64)
- [Performance-Optimized-Polyglot-Bridge — L425](performance-optimized-polyglot-bridge.md#^ref-f5579967-425-0) (line 425, col 0, score 0.63)
- [sibilant-macro-targets — L113](sibilant-macro-targets.md#^ref-c5c9a5c6-113-0) (line 113, col 0, score 0.63)
- [universal-intention-code-fabric — L248](universal-intention-code-fabric.md#^ref-c14edce7-248-0) (line 248, col 0, score 0.67)
- [polymorphic-meta-programming-engine — L50](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-50-0) (line 50, col 0, score 0.65)
- [Promethean Agent Config DSL — L172](promethean-agent-config-dsl.md#^ref-2c00ce45-172-0) (line 172, col 0, score 0.65)
- [universal-intention-code-fabric — L409](universal-intention-code-fabric.md#^ref-c14edce7-409-0) (line 409, col 0, score 0.64)
- [Python Services CI — L1](python-services-ci.md#^ref-4c951657-1-0) (line 1, col 0, score 0.64)
- [Matplotlib Animation with Async Execution — L33](matplotlib-animation-with-async-execution.md#^ref-687439f9-33-0) (line 33, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L88](migrate-to-provider-tenant-architecture.md#^ref-54382370-88-0) (line 88, col 0, score 0.64)
- [Lisp-Compiler-Integration — L518](lisp-compiler-integration.md#^ref-cfee6d36-518-0) (line 518, col 0, score 0.66)
- [sibilant-metacompiler-overview — L49](sibilant-metacompiler-overview.md#^ref-61d4086b-49-0) (line 49, col 0, score 0.66)
- [Lispy Macros with syntax-rules — L388](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-388-0) (line 388, col 0, score 0.63)
- [Performance-Optimized-Polyglot-Bridge — L429](performance-optimized-polyglot-bridge.md#^ref-f5579967-429-0) (line 429, col 0, score 1)
- [Local-Only-LLM-Workflow — L163](local-only-llm-workflow.md#^ref-9a8ab57e-163-0) (line 163, col 0, score 0.94)
- [universal-intention-code-fabric — L424](universal-intention-code-fabric.md#^ref-c14edce7-424-0) (line 424, col 0, score 0.88)
- [ecs-offload-workers — L446](ecs-offload-workers.md#^ref-6498b9d7-446-0) (line 446, col 0, score 0.85)
- [ecs-scheduler-and-prefabs — L379](ecs-scheduler-and-prefabs.md#^ref-c62a1815-379-0) (line 379, col 0, score 0.85)
- [markdown-to-org-transpiler — L289](markdown-to-org-transpiler.md#^ref-ab54cdd8-289-0) (line 289, col 0, score 0.85)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L153](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-153-0) (line 153, col 0, score 0.85)
- [System Scheduler with Resource-Aware DAG — L377](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-377-0) (line 377, col 0, score 0.85)
- [Promethean Infrastructure Setup — L558](promethean-infrastructure-setup.md#^ref-6deed6ac-558-0) (line 558, col 0, score 0.81)
- [EidolonField — L228](eidolonfield.md#^ref-49d1e1e5-228-0) (line 228, col 0, score 0.81)
- [Ice Box Reorganization — L55](ice-box-reorganization.md#^ref-291c7d91-55-0) (line 55, col 0, score 0.81)
- [ParticleSimulationWithCanvasAndFFmpeg — L231](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-231-0) (line 231, col 0, score 0.81)
- [2d-sandbox-field — L180](2d-sandbox-field.md#^ref-c710dc93-180-0) (line 180, col 0, score 0.8)
- [Eidolon Field Abstract Model — L176](eidolon-field-abstract-model.md#^ref-5e8b2388-176-0) (line 176, col 0, score 0.8)
- [Exception Layer Analysis — L134](exception-layer-analysis.md#^ref-21d5cc09-134-0) (line 134, col 0, score 0.8)
- [ecs-offload-workers — L200](ecs-offload-workers.md#^ref-6498b9d7-200-0) (line 200, col 0, score 0.66)
- [ecs-offload-workers — L442](ecs-offload-workers.md#^ref-6498b9d7-442-0) (line 442, col 0, score 0.73)
- [Cross-Language Runtime Polymorphism — L121](cross-language-runtime-polymorphism.md#^ref-c34c36a6-121-0) (line 121, col 0, score 0.66)
- [Performance-Optimized-Polyglot-Bridge — L414](performance-optimized-polyglot-bridge.md#^ref-f5579967-414-0) (line 414, col 0, score 0.65)
- [ecs-offload-workers — L449](ecs-offload-workers.md#^ref-6498b9d7-449-0) (line 449, col 0, score 0.63)
- [zero-copy-snapshots-and-workers — L6](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-6-0) (line 6, col 0, score 0.62)
- [Cross-Target Macro System in Sibilant — L141](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-141-0) (line 141, col 0, score 0.71)
- [sibilant-macro-targets — L64](sibilant-macro-targets.md#^ref-c5c9a5c6-64-0) (line 64, col 0, score 0.67)
- [Cross-Target Macro System in Sibilant — L21](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-21-0) (line 21, col 0, score 0.66)
- [Lispy Macros with syntax-rules — L389](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-389-0) (line 389, col 0, score 0.64)
- [Admin Dashboard for User Management — L39](admin-dashboard-for-user-management.md#^ref-2901a3e9-39-0) (line 39, col 0, score 1)
- [archetype-ecs — L471](archetype-ecs.md#^ref-8f4c1e86-471-0) (line 471, col 0, score 1)
- [Board Walk – 2025-08-11 — L141](board-walk-2025-08-11.md#^ref-7aa1eb92-141-0) (line 141, col 0, score 1)
- [JavaScript — L31](chunks/javascript.md#^ref-c1618c66-31-0) (line 31, col 0, score 1)
- [ecs-offload-workers — L459](ecs-offload-workers.md#^ref-6498b9d7-459-0) (line 459, col 0, score 1)
- [ecs-scheduler-and-prefabs — L395](ecs-scheduler-and-prefabs.md#^ref-c62a1815-395-0) (line 395, col 0, score 1)
- [eidolon-field-math-foundations — L156](eidolon-field-math-foundations.md#^ref-008f2ac0-156-0) (line 156, col 0, score 1)
- [i3-config-validation-methods — L64](i3-config-validation-methods.md#^ref-d28090ac-64-0) (line 64, col 0, score 1)
- [Admin Dashboard for User Management — L43](admin-dashboard-for-user-management.md#^ref-2901a3e9-43-0) (line 43, col 0, score 1)
- [api-gateway-versioning — L300](api-gateway-versioning.md#^ref-0580dcd3-300-0) (line 300, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L305](migrate-to-provider-tenant-architecture.md#^ref-54382370-305-0) (line 305, col 0, score 1)
- [observability-infrastructure-setup — L399](observability-infrastructure-setup.md#^ref-b4e64f8c-399-0) (line 399, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L79](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-79-0) (line 79, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L165](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-165-0) (line 165, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L266](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-266-0) (line 266, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L488](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-488-0) (line 488, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L436](performance-optimized-polyglot-bridge.md#^ref-f5579967-436-0) (line 436, col 0, score 1)
- [polymorphic-meta-programming-engine — L244](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-244-0) (line 244, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L91](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-91-0) (line 91, col 0, score 1)
- [Promethean Infrastructure Setup — L577](promethean-infrastructure-setup.md#^ref-6deed6ac-577-0) (line 577, col 0, score 1)
- [Language-Agnostic Mirror System — L532](language-agnostic-mirror-system.md#^ref-d2b3628c-532-0) (line 532, col 0, score 1)
- [Lispy Macros with syntax-rules — L399](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-399-0) (line 399, col 0, score 1)
- [Local-Only-LLM-Workflow — L183](local-only-llm-workflow.md#^ref-9a8ab57e-183-0) (line 183, col 0, score 1)
- [markdown-to-org-transpiler — L306](markdown-to-org-transpiler.md#^ref-ab54cdd8-306-0) (line 306, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L314](migrate-to-provider-tenant-architecture.md#^ref-54382370-314-0) (line 314, col 0, score 1)
- [mystery-lisp-search-session — L127](mystery-lisp-search-session.md#^ref-513dc4c7-127-0) (line 127, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L171](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-171-0) (line 171, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L255](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-255-0) (line 255, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L448](performance-optimized-polyglot-bridge.md#^ref-f5579967-448-0) (line 448, col 0, score 1)
- [Interop and Source Maps — L516](interop-and-source-maps.md#^ref-cdfac40c-516-0) (line 516, col 0, score 1)
- [Language-Agnostic Mirror System — L536](language-agnostic-mirror-system.md#^ref-d2b3628c-536-0) (line 536, col 0, score 1)
- [Local-Only-LLM-Workflow — L169](local-only-llm-workflow.md#^ref-9a8ab57e-169-0) (line 169, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L169](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-169-0) (line 169, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L437](performance-optimized-polyglot-bridge.md#^ref-f5579967-437-0) (line 437, col 0, score 1)
- [Promethean Infrastructure Setup — L608](promethean-infrastructure-setup.md#^ref-6deed6ac-608-0) (line 608, col 0, score 1)
- [universal-intention-code-fabric — L22](universal-intention-code-fabric.md#^ref-c14edce7-22-0) (line 22, col 0, score 0.67)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [archetype-ecs — L453](archetype-ecs.md#^ref-8f4c1e86-453-0) (line 453, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L199](chroma-toolkit-consolidation-plan.md#^ref-5020e892-199-0) (line 199, col 0, score 1)
- [ecs-offload-workers — L453](ecs-offload-workers.md#^ref-6498b9d7-453-0) (line 453, col 0, score 1)
- [ecs-scheduler-and-prefabs — L385](ecs-scheduler-and-prefabs.md#^ref-c62a1815-385-0) (line 385, col 0, score 1)
- [eidolon-field-math-foundations — L128](eidolon-field-math-foundations.md#^ref-008f2ac0-128-0) (line 128, col 0, score 1)
- [Local-Only-LLM-Workflow — L177](local-only-llm-workflow.md#^ref-9a8ab57e-177-0) (line 177, col 0, score 1)
- [markdown-to-org-transpiler — L297](markdown-to-org-transpiler.md#^ref-ab54cdd8-297-0) (line 297, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L162](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-162-0) (line 162, col 0, score 1)
- [Admin Dashboard for User Management — L40](admin-dashboard-for-user-management.md#^ref-2901a3e9-40-0) (line 40, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L156](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-156-0) (line 156, col 0, score 1)
- [api-gateway-versioning — L297](api-gateway-versioning.md#^ref-0580dcd3-297-0) (line 297, col 0, score 1)
- [ecs-offload-workers — L454](ecs-offload-workers.md#^ref-6498b9d7-454-0) (line 454, col 0, score 1)
- [ecs-scheduler-and-prefabs — L388](ecs-scheduler-and-prefabs.md#^ref-c62a1815-388-0) (line 388, col 0, score 1)
- [eidolon-field-math-foundations — L129](eidolon-field-math-foundations.md#^ref-008f2ac0-129-0) (line 129, col 0, score 1)
- [field-interaction-equations — L177](field-interaction-equations.md#^ref-b09141b7-177-0) (line 177, col 0, score 1)
- [js-to-lisp-reverse-compiler — L422](js-to-lisp-reverse-compiler.md#^ref-58191024-422-0) (line 422, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L157](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-157-0) (line 157, col 0, score 1)
- [api-gateway-versioning — L298](api-gateway-versioning.md#^ref-0580dcd3-298-0) (line 298, col 0, score 1)
- [ecs-offload-workers — L455](ecs-offload-workers.md#^ref-6498b9d7-455-0) (line 455, col 0, score 1)
- [ecs-scheduler-and-prefabs — L389](ecs-scheduler-and-prefabs.md#^ref-c62a1815-389-0) (line 389, col 0, score 1)
- [eidolon-field-math-foundations — L130](eidolon-field-math-foundations.md#^ref-008f2ac0-130-0) (line 130, col 0, score 1)
- [i3-config-validation-methods — L63](i3-config-validation-methods.md#^ref-d28090ac-63-0) (line 63, col 0, score 1)
- [Interop and Source Maps — L531](interop-and-source-maps.md#^ref-cdfac40c-531-0) (line 531, col 0, score 1)
- [Language-Agnostic Mirror System — L548](language-agnostic-mirror-system.md#^ref-d2b3628c-548-0) (line 548, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L143](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-143-0) (line 143, col 0, score 1)
- [compiler-kit-foundations — L605](compiler-kit-foundations.md#^ref-01b21543-605-0) (line 605, col 0, score 1)
- [Interop and Source Maps — L512](interop-and-source-maps.md#^ref-cdfac40c-512-0) (line 512, col 0, score 1)
- [js-to-lisp-reverse-compiler — L409](js-to-lisp-reverse-compiler.md#^ref-58191024-409-0) (line 409, col 0, score 1)
- [Language-Agnostic Mirror System — L533](language-agnostic-mirror-system.md#^ref-d2b3628c-533-0) (line 533, col 0, score 1)
- [Lisp-Compiler-Integration — L538](lisp-compiler-integration.md#^ref-cfee6d36-538-0) (line 538, col 0, score 1)
- [Lispy Macros with syntax-rules — L397](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-397-0) (line 397, col 0, score 1)
- [Promethean Agent Config DSL — L338](promethean-agent-config-dsl.md#^ref-2c00ce45-338-0) (line 338, col 0, score 1)
- [template-based-compilation — L144](template-based-compilation.md#^ref-f8877e5e-144-0) (line 144, col 0, score 1)
- [sibilant-macro-targets — L172](sibilant-macro-targets.md#^ref-c5c9a5c6-172-0) (line 172, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#^ref-af5d2824-205-0) (line 205, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L137](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-137-0) (line 137, col 0, score 1)
- [sibilant-metacompiler-overview — L90](sibilant-metacompiler-overview.md#^ref-61d4086b-90-0) (line 90, col 0, score 1)
- [State Snapshots API and Transactional Projector — L366](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-366-0) (line 366, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L394](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-394-0) (line 394, col 0, score 1)
- [template-based-compilation — L104](template-based-compilation.md#^ref-f8877e5e-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L8](ts-to-lisp-transpiler.md#^ref-ba11486b-8-0) (line 8, col 0, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#^ref-78eeedf7-384-0) (line 384, col 0, score 1)
- [archetype-ecs — L467](archetype-ecs.md#^ref-8f4c1e86-467-0) (line 467, col 0, score 1)
- [DSL — L20](chunks/dsl.md#^ref-e87bc036-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L606](compiler-kit-foundations.md#^ref-01b21543-606-0) (line 606, col 0, score 1)
- [Interop and Source Maps — L514](interop-and-source-maps.md#^ref-cdfac40c-514-0) (line 514, col 0, score 1)
- [js-to-lisp-reverse-compiler — L437](js-to-lisp-reverse-compiler.md#^ref-58191024-437-0) (line 437, col 0, score 1)
- [Language-Agnostic Mirror System — L534](language-agnostic-mirror-system.md#^ref-d2b3628c-534-0) (line 534, col 0, score 1)
- [Lisp-Compiler-Integration — L536](lisp-compiler-integration.md#^ref-cfee6d36-536-0) (line 536, col 0, score 1)
- [set-assignment-in-lisp-ast — L148](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-148-0) (line 148, col 0, score 1)
- [aionian-circuit-math — L153](aionian-circuit-math.md#^ref-f2d83a77-153-0) (line 153, col 0, score 1)
- [JavaScript — L24](chunks/javascript.md#^ref-c1618c66-24-0) (line 24, col 0, score 1)
- [Math Fundamentals — L26](chunks/math-fundamentals.md#^ref-c6e87433-26-0) (line 26, col 0, score 1)
- [compiler-kit-foundations — L607](compiler-kit-foundations.md#^ref-01b21543-607-0) (line 607, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L201](cross-language-runtime-polymorphism.md#^ref-c34c36a6-201-0) (line 201, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L166](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-166-0) (line 166, col 0, score 1)
- [Dynamic Context Model for Web Components — L416](dynamic-context-model-for-web-components.md#^ref-f7702bf8-416-0) (line 416, col 0, score 1)
- [field-interaction-equations — L153](field-interaction-equations.md#^ref-b09141b7-153-0) (line 153, col 0, score 1)
- [graph-ds — L371](graph-ds.md#^ref-6620e2f2-371-0) (line 371, col 0, score 1)
- [Tooling — L13](chunks/tooling.md#^ref-6cb4943e-13-0) (line 13, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L205](cross-language-runtime-polymorphism.md#^ref-c34c36a6-205-0) (line 205, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L144](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-144-0) (line 144, col 0, score 1)
- [Local-Only-LLM-Workflow — L194](local-only-llm-workflow.md#^ref-9a8ab57e-194-0) (line 194, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L320](migrate-to-provider-tenant-architecture.md#^ref-54382370-320-0) (line 320, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L50](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-50-0) (line 50, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L188](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-188-0) (line 188, col 0, score 1)
- [polyglot-repl-interface-layer — L173](polyglot-repl-interface-layer.md#^ref-9c79206d-173-0) (line 173, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L214](chroma-toolkit-consolidation-plan.md#^ref-5020e892-214-0) (line 214, col 0, score 1)
- [Tooling — L18](chunks/tooling.md#^ref-6cb4943e-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L226](cross-language-runtime-polymorphism.md#^ref-c34c36a6-226-0) (line 226, col 0, score 1)
- [ecs-offload-workers — L473](ecs-offload-workers.md#^ref-6498b9d7-473-0) (line 473, col 0, score 1)
- [ecs-scheduler-and-prefabs — L399](ecs-scheduler-and-prefabs.md#^ref-c62a1815-399-0) (line 399, col 0, score 1)
- [eidolon-field-math-foundations — L146](eidolon-field-math-foundations.md#^ref-008f2ac0-146-0) (line 146, col 0, score 1)
- [Event Bus MVP — L556](event-bus-mvp.md#^ref-534fe91d-556-0) (line 556, col 0, score 1)
- [i3-bluetooth-setup — L106](i3-bluetooth-setup.md#^ref-5e408692-106-0) (line 106, col 0, score 1)
- [Math Fundamentals — L31](chunks/math-fundamentals.md#^ref-c6e87433-31-0) (line 31, col 0, score 1)
- [Tooling — L19](chunks/tooling.md#^ref-6cb4943e-19-0) (line 19, col 0, score 1)
- [compiler-kit-foundations — L634](compiler-kit-foundations.md#^ref-01b21543-634-0) (line 634, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L212](cross-language-runtime-polymorphism.md#^ref-c34c36a6-212-0) (line 212, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L180](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-180-0) (line 180, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L56](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-56-0) (line 56, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L45](ducks-self-referential-perceptual-loop.md#^ref-71726f04-45-0) (line 45, col 0, score 1)
- [Dynamic Context Model for Web Components — L384](dynamic-context-model-for-web-components.md#^ref-f7702bf8-384-0) (line 384, col 0, score 1)
- [ecs-offload-workers — L468](ecs-offload-workers.md#^ref-6498b9d7-468-0) (line 468, col 0, score 1)
- [ecs-scheduler-and-prefabs — L413](ecs-scheduler-and-prefabs.md#^ref-c62a1815-413-0) (line 413, col 0, score 1)
- [Eidolon Field Abstract Model — L214](eidolon-field-abstract-model.md#^ref-5e8b2388-214-0) (line 214, col 0, score 1)
- [archetype-ecs — L456](archetype-ecs.md#^ref-8f4c1e86-456-0) (line 456, col 0, score 1)
- [DSL — L18](chunks/dsl.md#^ref-e87bc036-18-0) (line 18, col 0, score 1)
- [JavaScript — L27](chunks/javascript.md#^ref-c1618c66-27-0) (line 27, col 0, score 1)
- [compiler-kit-foundations — L616](compiler-kit-foundations.md#^ref-01b21543-616-0) (line 616, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L198](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-198-0) (line 198, col 0, score 1)
- [Dynamic Context Model for Web Components — L408](dynamic-context-model-for-web-components.md#^ref-f7702bf8-408-0) (line 408, col 0, score 1)
- [ecs-offload-workers — L489](ecs-offload-workers.md#^ref-6498b9d7-489-0) (line 489, col 0, score 1)
- [ecs-scheduler-and-prefabs — L415](ecs-scheduler-and-prefabs.md#^ref-c62a1815-415-0) (line 415, col 0, score 1)
- [Language-Agnostic Mirror System — L538](language-agnostic-mirror-system.md#^ref-d2b3628c-538-0) (line 538, col 0, score 1)
- [layer-1-uptime-diagrams — L178](layer-1-uptime-diagrams.md#^ref-4127189a-178-0) (line 178, col 0, score 1)
- [Lisp-Compiler-Integration — L550](lisp-compiler-integration.md#^ref-cfee6d36-550-0) (line 550, col 0, score 1)
- [lisp-dsl-for-window-management — L223](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-223-0) (line 223, col 0, score 1)
- [Lispy Macros with syntax-rules — L406](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-406-0) (line 406, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L168](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-168-0) (line 168, col 0, score 1)
- [Local-Only-LLM-Workflow — L201](local-only-llm-workflow.md#^ref-9a8ab57e-201-0) (line 201, col 0, score 1)
- [markdown-to-org-transpiler — L323](markdown-to-org-transpiler.md#^ref-ab54cdd8-323-0) (line 323, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L496](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-496-0) (line 496, col 0, score 1)
- [ripple-propagation-demo — L118](ripple-propagation-demo.md#^ref-8430617b-118-0) (line 118, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L154](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-154-0) (line 154, col 0, score 1)
- [Local-Only-LLM-Workflow — L179](local-only-llm-workflow.md#^ref-9a8ab57e-179-0) (line 179, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L304](migrate-to-provider-tenant-architecture.md#^ref-54382370-304-0) (line 304, col 0, score 1)
- [observability-infrastructure-setup — L398](observability-infrastructure-setup.md#^ref-b4e64f8c-398-0) (line 398, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L184](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-184-0) (line 184, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L506](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-506-0) (line 506, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L452](performance-optimized-polyglot-bridge.md#^ref-f5579967-452-0) (line 452, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L90](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-90-0) (line 90, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L187](chroma-toolkit-consolidation-plan.md#^ref-5020e892-187-0) (line 187, col 0, score 1)
- [compiler-kit-foundations — L628](compiler-kit-foundations.md#^ref-01b21543-628-0) (line 628, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L200](cross-language-runtime-polymorphism.md#^ref-c34c36a6-200-0) (line 200, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L170](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-170-0) (line 170, col 0, score 1)
- [Dynamic Context Model for Web Components — L388](dynamic-context-model-for-web-components.md#^ref-f7702bf8-388-0) (line 388, col 0, score 1)
- [EidolonField — L248](eidolonfield.md#^ref-49d1e1e5-248-0) (line 248, col 0, score 1)
- [i3-bluetooth-setup — L109](i3-bluetooth-setup.md#^ref-5e408692-109-0) (line 109, col 0, score 1)
- [lisp-dsl-for-window-management — L226](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-226-0) (line 226, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L155](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-155-0) (line 155, col 0, score 1)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [Tooling — L7](chunks/tooling.md#^ref-6cb4943e-7-0) (line 7, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L227](cross-language-runtime-polymorphism.md#^ref-c34c36a6-227-0) (line 227, col 0, score 1)
- [ecs-scheduler-and-prefabs — L421](ecs-scheduler-and-prefabs.md#^ref-c62a1815-421-0) (line 421, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L156](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-156-0) (line 156, col 0, score 1)
- [pm2-orchestration-patterns — L250](pm2-orchestration-patterns.md#^ref-51932e7b-250-0) (line 250, col 0, score 1)
- [polymorphic-meta-programming-engine — L226](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-226-0) (line 226, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L920](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-920-0) (line 920, col 0, score 1)
- [prompt-programming-language-lisp — L102](prompt-programming-language-lisp.md#^ref-d41a06d1-102-0) (line 102, col 0, score 1)
- [api-gateway-versioning — L282](api-gateway-versioning.md#^ref-0580dcd3-282-0) (line 282, col 0, score 1)
- [archetype-ecs — L470](archetype-ecs.md#^ref-8f4c1e86-470-0) (line 470, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L201](chroma-toolkit-consolidation-plan.md#^ref-5020e892-201-0) (line 201, col 0, score 1)
- [Dynamic Context Model for Web Components — L382](dynamic-context-model-for-web-components.md#^ref-f7702bf8-382-0) (line 382, col 0, score 1)
- [ecs-offload-workers — L456](ecs-offload-workers.md#^ref-6498b9d7-456-0) (line 456, col 0, score 1)
- [ecs-scheduler-and-prefabs — L390](ecs-scheduler-and-prefabs.md#^ref-c62a1815-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L125](eidolon-field-math-foundations.md#^ref-008f2ac0-125-0) (line 125, col 0, score 1)
- [i3-config-validation-methods — L61](i3-config-validation-methods.md#^ref-d28090ac-61-0) (line 61, col 0, score 1)
- [Mongo Outbox Implementation — L572](mongo-outbox-implementation.md#^ref-9c1acd1e-572-0) (line 572, col 0, score 1)
- [observability-infrastructure-setup — L360](observability-infrastructure-setup.md#^ref-b4e64f8c-360-0) (line 360, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L163](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-163-0) (line 163, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L472](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-472-0) (line 472, col 0, score 1)
- [Pure TypeScript Search Microservice — L538](pure-typescript-search-microservice.md#^ref-d17d3a96-538-0) (line 538, col 0, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L374](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-374-0) (line 374, col 0, score 1)
- [ripple-propagation-demo — L120](ripple-propagation-demo.md#^ref-8430617b-120-0) (line 120, col 0, score 1)
- [schema-evolution-workflow — L502](schema-evolution-workflow.md#^ref-d8059b6a-502-0) (line 502, col 0, score 1)
- [Self-Agency in AI Interaction — L53](self-agency-in-ai-interaction.md#^ref-49a9a860-53-0) (line 53, col 0, score 1)
- [set-assignment-in-lisp-ast — L161](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-161-0) (line 161, col 0, score 1)
- [shared-package-layout-clarification — L185](shared-package-layout-clarification.md#^ref-36c8882a-185-0) (line 185, col 0, score 1)
- [Shared Package Structure — L181](shared-package-structure.md#^ref-66a72fc3-181-0) (line 181, col 0, score 1)
- [sibilant-macro-targets — L173](sibilant-macro-targets.md#^ref-c5c9a5c6-173-0) (line 173, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L194](sibilant-meta-prompt-dsl.md#^ref-af5d2824-194-0) (line 194, col 0, score 1)
- [aionian-circuit-math — L177](aionian-circuit-math.md#^ref-f2d83a77-177-0) (line 177, col 0, score 1)
- [Services — L31](chunks/services.md#^ref-75ea4a6a-31-0) (line 31, col 0, score 1)
- [compiler-kit-foundations — L640](compiler-kit-foundations.md#^ref-01b21543-640-0) (line 640, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
- [promethean-system-diagrams — L207](promethean-system-diagrams.md#^ref-b51e19b4-207-0) (line 207, col 0, score 1)
- [Promethean Web UI Setup — L633](promethean-web-ui-setup.md#^ref-bc5172ca-633-0) (line 633, col 0, score 1)
- [Promethean Workflow Optimization — L20](promethean-workflow-optimization.md#^ref-d614d983-20-0) (line 20, col 0, score 1)
- [Prometheus Observability Stack — L543](prometheus-observability-stack.md#^ref-e90b5a16-543-0) (line 543, col 0, score 1)
- [Prompt_Folder_Bootstrap — L216](prompt-folder-bootstrap.md#^ref-bd4f0976-216-0) (line 216, col 0, score 1)
- [prompt-programming-language-lisp — L116](prompt-programming-language-lisp.md#^ref-d41a06d1-116-0) (line 116, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L156](protocol-0-the-contradiction-engine.md#^ref-9a93a756-156-0) (line 156, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L238](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-238-0) (line 238, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L445](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-445-0) (line 445, col 0, score 1)
- [Shared Package Structure — L195](shared-package-structure.md#^ref-66a72fc3-195-0) (line 195, col 0, score 1)
- [AI-Centric OS with MCP Layer — L427](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-427-0) (line 427, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L13](ai-first-os-model-context-protocol.md#^ref-618198f4-13-0) (line 13, col 0, score 1)
- [api-gateway-versioning — L288](api-gateway-versioning.md#^ref-0580dcd3-288-0) (line 288, col 0, score 1)
- [archetype-ecs — L480](archetype-ecs.md#^ref-8f4c1e86-480-0) (line 480, col 0, score 1)
- [balanced-bst — L301](balanced-bst.md#^ref-d3e7db72-301-0) (line 301, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L178](chroma-toolkit-consolidation-plan.md#^ref-5020e892-178-0) (line 178, col 0, score 1)
- [Diagrams — L39](chunks/diagrams.md#^ref-45cd25b5-39-0) (line 39, col 0, score 1)
- [DSL — L41](chunks/dsl.md#^ref-e87bc036-41-0) (line 41, col 0, score 1)
- [JavaScript — L40](chunks/javascript.md#^ref-c1618c66-40-0) (line 40, col 0, score 1)
- [Math Fundamentals — L40](chunks/math-fundamentals.md#^ref-c6e87433-40-0) (line 40, col 0, score 1)
- [Services — L38](chunks/services.md#^ref-75ea4a6a-38-0) (line 38, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#^ref-ab54cdd8-313-0) (line 313, col 0, score 1)
- [Matplotlib Animation with Async Execution — L79](matplotlib-animation-with-async-execution.md#^ref-687439f9-79-0) (line 79, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#^ref-54382370-299-0) (line 299, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L151](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-151-0) (line 151, col 0, score 1)
- [Mongo Outbox Implementation — L587](mongo-outbox-implementation.md#^ref-9c1acd1e-587-0) (line 587, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L120](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-120-0) (line 120, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L282](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-282-0) (line 282, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L480](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-480-0) (line 480, col 0, score 1)
- [DSL — L26](chunks/dsl.md#^ref-e87bc036-26-0) (line 26, col 0, score 1)
- [ecs-scheduler-and-prefabs — L433](ecs-scheduler-and-prefabs.md#^ref-c62a1815-433-0) (line 433, col 0, score 1)
- [Event Bus MVP — L577](event-bus-mvp.md#^ref-534fe91d-577-0) (line 577, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L174](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-174-0) (line 174, col 0, score 1)
- [Local-Only-LLM-Workflow — L211](local-only-llm-workflow.md#^ref-9a8ab57e-211-0) (line 211, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L334](migrate-to-provider-tenant-architecture.md#^ref-54382370-334-0) (line 334, col 0, score 1)
- [Mongo Outbox Implementation — L581](mongo-outbox-implementation.md#^ref-9c1acd1e-581-0) (line 581, col 0, score 1)
- [observability-infrastructure-setup — L397](observability-infrastructure-setup.md#^ref-b4e64f8c-397-0) (line 397, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L48](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-48-0) (line 48, col 0, score 1)
- [Admin Dashboard for User Management — L45](admin-dashboard-for-user-management.md#^ref-2901a3e9-45-0) (line 45, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L170](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-170-0) (line 170, col 0, score 1)
- [AI-Centric OS with MCP Layer — L416](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-416-0) (line 416, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#^ref-618198f4-11-0) (line 11, col 0, score 1)
- [aionian-circuit-math — L178](aionian-circuit-math.md#^ref-f2d83a77-178-0) (line 178, col 0, score 1)
- [api-gateway-versioning — L312](api-gateway-versioning.md#^ref-0580dcd3-312-0) (line 312, col 0, score 1)
- [balanced-bst — L297](balanced-bst.md#^ref-d3e7db72-297-0) (line 297, col 0, score 1)
- [Board Walk – 2025-08-11 — L131](board-walk-2025-08-11.md#^ref-7aa1eb92-131-0) (line 131, col 0, score 1)
- [Operations — L8](chunks/operations.md#^ref-f1add613-8-0) (line 8, col 0, score 1)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L129](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-129-0) (line 129, col 0, score 1)
- [api-gateway-versioning — L315](api-gateway-versioning.md#^ref-0580dcd3-315-0) (line 315, col 0, score 1)
- [Chroma-Embedding-Refactor — L331](chroma-embedding-refactor.md#^ref-8b256935-331-0) (line 331, col 0, score 1)
- [Diagrams — L25](chunks/diagrams.md#^ref-45cd25b5-25-0) (line 25, col 0, score 1)
- [Tooling — L24](chunks/tooling.md#^ref-6cb4943e-24-0) (line 24, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L214](cross-language-runtime-polymorphism.md#^ref-c34c36a6-214-0) (line 214, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L173](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-173-0) (line 173, col 0, score 1)
- [Dynamic Context Model for Web Components — L390](dynamic-context-model-for-web-components.md#^ref-f7702bf8-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L147](eidolon-field-math-foundations.md#^ref-008f2ac0-147-0) (line 147, col 0, score 1)
- [Event Bus MVP — L553](event-bus-mvp.md#^ref-534fe91d-553-0) (line 553, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L315](functional-embedding-pipeline-refactor.md#^ref-a4a25141-315-0) (line 315, col 0, score 1)
- [Diagrams — L50](chunks/diagrams.md#^ref-45cd25b5-50-0) (line 50, col 0, score 1)
- [DSL — L44](chunks/dsl.md#^ref-e87bc036-44-0) (line 44, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Operations — L15](chunks/operations.md#^ref-f1add613-15-0) (line 15, col 0, score 1)
- [Shared — L31](chunks/shared.md#^ref-623a55f7-31-0) (line 31, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Creative Moments — L15](creative-moments.md#^ref-10d98225-15-0) (line 15, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L263](cross-language-runtime-polymorphism.md#^ref-c34c36a6-263-0) (line 263, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L219](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-219-0) (line 219, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
