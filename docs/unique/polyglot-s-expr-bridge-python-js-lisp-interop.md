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
related_to_title:
  - Performance-Optimized-Polyglot-Bridge
  - Local-Only-LLM-Workflow
  - Interop and Source Maps
  - universal-intention-code-fabric
  - ecs-offload-workers
  - ecs-scheduler-and-prefabs
  - System Scheduler with Resource-Aware DAG
  - markdown-to-org-transpiler
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - set-assignment-in-lisp-ast
  - compiler-kit-foundations
  - Lisp-Compiler-Integration
  - Lispy Macros with syntax-rules
  - template-based-compilation
  - Universal Lisp Interface
  - js-to-lisp-reverse-compiler
  - Local-First Intention→Code Loop with Free Models
  - Chroma Toolkit Consolidation Plan
  - Language-Agnostic Mirror System
  - DSL
  - archetype-ecs
  - JavaScript
  - eidolon-field-math-foundations
  - Admin Dashboard for User Management
  - i3-config-validation-methods
  - Cross-Language Runtime Polymorphism
  - Cross-Target Macro System in Sibilant
  - polymorphic-meta-programming-engine
  - aionian-circuit-math
  - obsidian-ignore-node-modules-regex
  - Promethean Infrastructure Setup
related_to_uuid:
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - ba244286-4e84-425b-8bf6-b80c4eb783fc
  - ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - c5fba0a0-9196-468d-a0f3-51c99e987263
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - cfee6d36-b9f5-4587-885a-cdfddb4f054e
  - cbfe3513-6a4a-4d2e-915d-ddfab583b2de
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - b01856b4-999f-418d-8009-ade49b00eb0f
  - 58191024-d04a-4520-8aae-a18be7b94263
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 2901a3e9-96f0-497c-ae2c-775f28a702dd
  - d28090ac-f746-4958-aab5-ed1315382c04
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - ffb9b2a9-744d-4a53-9565-130fceae0832
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
references: []
---
Yesss, I see it. You’re converging on a **polyglot, S-expr-first “universal language”** where JS, TS, Lisp, and now **Python** are all just different skins over the same core. The next move is a **seamless Python↔JS bridge** you can call from your Lisp without caring which side ran it.

Here’s a minimal-but-solid system you can paste in and grow:

* A **Python runtime** that speaks a tiny JSON-RPC, exposes `import`, `getattr`, `setattr`, `call`, etc., and manages object refs.
* A **JS bridge** that spawns/attaches to that runtime, gives you a **callable Proxy** for any Python object (modules, functions, instances).
* **Promise/await plumbing** so cross-realm calls feel natural. I also add `(await ...)` to the Lispy front-end so you can write async cleanly.
* A **Pyodide transport** placeholder for browser (same API), so the *same* Lisp code runs in Node or the web.

---

# 0) What it feels like in your Lisp

```lisp
; Import numpy, call sum, get a result back — same Lisp in Node or browser.
(let ((np ($py "numpy")))               ; $py returns a Python module proxy
  (await ((. np sum) [1 2 3 4])))       ; call python function, await the Promise
```

You can use your existing `.` property sugar and plain calls; the `$py` proxy does the rest.

---

# 1) Python side (runtime): `shared/py/polyglot_runtime.py`

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
```

---

# 2) JS bridge (Node transport): `shared/js/prom-lib/polyglot/node-python.ts`

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
}
```

---

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
  return { bridge, $py, close: () => t.close() };
}
```

> Browser later: add a `PyodideTransport` with the same interface and swap it in. Your higher layer doesn’t change.

---

# 4) Make Lisp speak async: add `(await ...)`

Minimal changes so your compiler can emit `await` and mark wrappers/functions `async`.

### 4a) Extend IR & lowerer

```ts
// shared/js/prom-lib/compiler/ir.ts
export type Rhs =
  | { r: "prim"; op: Prim; a: Sym; b?: Sym }
  | { r: "call"; fn: Sym; args: Sym[] }
  | { r: "val"; v: Val }
  | { r: "await"; a: Sym };           // <-- NEW
```

```ts
// shared/js/prom-lib/compiler/ast.ts (add)
export type Expr =
  // ... existing
  | { kind: "Await"; expr: Expr; span: Span };
```

```ts
// shared/js/prom-lib/compiler/lisp/to-expr.ts  (recognize (await x))
if (isSym(hd,"await")) {
  return { kind:"Await", expr: toExpr(x.xs[1]), span: x.span! } as any;
}
```

```ts
// shared/js/prom-lib/compiler/lower.ts  (handle Await)
case "Await": {
  const a = lowerExpr(e.expr, env, out, dbg, externs);
  const s = gensym("await");
  out.push({ k:"bind", s, rhs: { r:"await", a } });
  dbg.set(s, e.span);
  return s;
}
```

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

// when emitting lambdas:
const isAsync = funBodyHasAwait(rhs.v.body);
return `${sym(dst)} = ${isAsync ? "async " : ""}(${params}) => {${NL}${body}};`;

// top-level wrapper: make it async if any await in main body
const topAsync = funBodyHasAwait(mod.main.body);
write(`${topAsync ? "async " : ""}(function(imports){${NL}`);
```

Now `(await ...)` in Lisp compiles to real `await` in JS and the surrounding function/IIFE becomes `async`.

---

# 5) Lisp sugar for Python

Two tiny macros:

* `($py "module.path")` is just a call to an **imported** JS function `$py` (from the bridge).
* `(py.import "module" :as sym)` is optional sugar.

```ts
// shared/js/prom-lib/compiler/lisp/interop.py.macros.ts
import { MacroEnv } from "./macros";
import { sym, list, str, isSym } from "./syntax";

export function installPyMacros(M: MacroEnv) {
  // ($py "numpy") is just a raw call — no extra macro needed if you import $py
  // (py.import "numpy" :as np) => (let1 np ($py "numpy") np)
  M.define("py.import", (form) => {
    const [, mod, _as, name] = (form as any).xs;
    const n = (name as any).name;
    return list([sym("let1"), name, list([sym("$py"), mod]), name]);
  });
}
```

Wire it alongside your other macros.

And when compiling Lisp → JS, ask the emitter to destructure `$py` from imports:

```ts
// compileLispToJS(..., { importNames:["$py", "print", ...] })
```

At runtime, pass the actual `$py`:

```ts
import { createNodePythonBridge } from "../prom-lib/polyglot/bridge";
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

const lisp = `
  (let ((np ($py "numpy")))
    (await ((. np sum) [1 2 3 4])))
`;

const { $py, close } = createNodePythonBridge("python", "shared/py/polyglot_runtime.py");
const { code } = compileLispToJS(lisp, { importNames:["$py"], pretty:true, inlineMap:true });
const run = (0,eval)(code);          // async wrapper if await is present
const out = await run({ $py });
console.log("sum =", out);           // -> 10
close();
```

---

# 7) Browser path (Pyodide) — sketch

Same API, different transport:

* Load Pyodide in a **Web Worker**.
* Implement a `PyodideTransport` with `request({op,...})` that forwards to worker and uses `pyodide.runPython` to implement ops.
* Return the same PyRef envelopes so `PythonBridge` doesn’t care.

You can stub it like:

```ts
// shared/js/prom-lib/polyglot/pyodide-transport.ts (sketch)
export class PyodideTransport implements PyTransport {
  constructor(private worker: Worker) { /* set up postMessage <-> Promise map */ }
  request(payload){ /* postMessage; resolve on response */ }
  close(){ this.worker.terminate(); }
}
```

…and reuse `new PythonBridge(new PyodideTransport(worker))`.

---

# 8) Notes & roadmap

* **Types:** Numbers/strings/bools/bytes/arrays/dicts round-trip; functions/instances are **by-ref** proxies. You can add special-cases (e.g., NumPy array to `ArrayBuffer`) later.
* **GC:** You can add a `FinalizationRegistry` in JS that sends `op:"release"` for proxies when collected.
* **Perf:** For heavy data, add a binary fast path (msgpack or raw `bytes` over stdio) and optional **shared memory** for Node workers.
* **Security:** This runtime evals Python code you told it to call. Don’t expose it to untrusted inputs without sandboxing.
* **Ergonomics:** We can sugar `await` away with macros like `(py-> np sum [1 2 3])` that expand to `(await ((. ($py "numpy") sum) [1 2 3]))`.

---

If you want, I can:

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
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
