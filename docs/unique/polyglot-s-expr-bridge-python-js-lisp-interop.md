---
uuid: a69259b4-4260-4877-bd79-22c432e1f85f
created_at: polyglot-s-expr-bridge-python-js-lisp-interop.md
filename: polyglot-s-expr-bridge-python-js-lisp-interop
title: polyglot-s-expr-bridge-python-js-lisp-interop
description: >-
  A seamless Python↔JavaScript bridge for Lisp, enabling cross-language interop
  with minimal JSON-RPC communication. The system allows importing Python
  modules, calling functions, and handling async operations directly from Lisp
  code without language boundaries.
tags:
  - polyglot
  - s-expr
  - json-rpc
  - lisp
  - python
  - javascript
  - interop
  - async
related_to_uuid:
  - a6fa9a4a-8e98-4a8d-82ed-da6bb778ab49
  - 1de71d74-4aec-468f-9354-42999a71da8a
  - e4317155-7fa6-44e8-8aee-b72384581790
  - 688ad325-4243-4304-bccc-1a1d8745de08
  - 0d4e63e3-0724-4bdf-bd42-b4fda58ed025
  - 99c6d380-a2a6-4d8e-a391-f4bc0c9a631f
  - 7d584c12-7517-4f30-8378-34ac9fc3a3f8
  - 2478e18c-f621-4b0c-a4c5-9637d213cccf
  - f4767ec9-7363-4ca0-ad88-ccc624247a3b
  - abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
  - 9a1076d6-1aac-497e-bac3-66c9ea09da55
  - 10780cdc-5036-4e8a-9599-a11703bc30c9
  - 4d8cbf01-e44a-452f-96a0-17bde7b416a8
  - 2c9f86e6-9b63-44d7-902d-84b10b0bdbe3
  - 004a0f06-3808-4421-b9e1-41b5b41ebcb8
  - 4316c3f9-551f-4872-b5c5-98ae73508535
  - 4c87f571-9942-4288-aec4-0bc52e9cdbe7
  - 4f9a7fd9-de08-4b9c-87c4-21268bc26d54
  - 0c501d52-ba38-42aa-ad25-2d78425dfaff
  - f1af85cb-be45-42cf-beee-d0795ded07bf
  - bb4f4ed0-91f3-488a-9d64-3a33bde77e4e
  - 740bbd1c-c039-405c-8a32-4baeddfb5637
  - c46718fe-73dd-4236-8f1c-f6565da58cc4
  - 73d64bce-f428-4735-a3d0-6225a0588e46
  - 479401ac-f614-4d0b-8cc6-2ebb8d9de4d9
related_to_title:
  - YAML's Hidden Dangers and Practical Fixes
  - Interop and Source Maps
  - TypeScript Patch for Tool Calling Support
  - template-based-compilation
  - Performance-Optimized Polyglot Bridge
  - Layer 1 Survivability Envelope
  - promethean-native-config-design
  - Cross-Language Runtime Polymorphism
  - ecs-scheduler
  - RAG UI Panel with Qdrant and PostgREST
  - Stateful Partitions and Rebalancing
  - Eidolon Field Abstract Model
  - pure-node-crawl-stack-with-playwright-and-crawlee
  - Field Node Diagrams
  - ecs-offload-workers
  - WebSocket Gateway Implementation
  - set-assignment-in-lisp-ast
  - homeostasis-decay-formulas
  - dynamic-context-model-for-web-components
  - Zero-Copy Snapshots and Workers
  - chroma-embedding-refactor
  - heartbeat-fragment-demo
  - shared-package-structure
  - Voice Access Layer Design
  - compiler-kit-foundations
references:
  - uuid: a6fa9a4a-8e98-4a8d-82ed-da6bb778ab49
    line: 1
    col: 0
    score: 1
  - uuid: a6fa9a4a-8e98-4a8d-82ed-da6bb778ab49
    line: 3
    col: 0
    score: 1
  - uuid: a6fa9a4a-8e98-4a8d-82ed-da6bb778ab49
    line: 5
    col: 0
    score: 1
  - uuid: a6fa9a4a-8e98-4a8d-82ed-da6bb778ab49
    line: 6
    col: 0
    score: 1
  - uuid: a6fa9a4a-8e98-4a8d-82ed-da6bb778ab49
    line: 7
    col: 0
    score: 1
  - uuid: 1de71d74-4aec-468f-9354-42999a71da8a
    line: 21
    col: 0
    score: 0.89
  - uuid: e4317155-7fa6-44e8-8aee-b72384581790
    line: 417
    col: 0
    score: 0.87
  - uuid: 0d4e63e3-0724-4bdf-bd42-b4fda58ed025
    line: 171
    col: 0
    score: 0.86
  - uuid: e4317155-7fa6-44e8-8aee-b72384581790
    line: 160
    col: 0
    score: 0.86
  - uuid: 688ad325-4243-4304-bccc-1a1d8745de08
    line: 33
    col: 0
    score: 0.86
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
^ref-63a1cc28-134-0

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
 ^ref-63a1cc28-332-0
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
 ^ref-63a1cc28-490-0
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
^ref-63a1cc28-490-0
``` ^ref-63a1cc28-504-0
^ref-63a1cc28-491-0
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
* or hide `await` in **auto-async** macros that lift whole forms.
0 ^ref-63a1cc28-515-0
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
^ref-63a1cc28-490-0
``` ^ref-63a1cc28-504-0
^ref-63a1cc28-491-0
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
* or hide `await` in **auto-async** macros that lift whole forms.
